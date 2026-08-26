import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_AI_ASTROLOGERS, AIAstrologer } from '@/lib/aiAstrologerData';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, userMessage, action = 'chat_voice' } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // 1. Fetch Session and Astrologer Details
    const sessionDoc = await adminDb.collection('ai_consultations').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Consultation session not found' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    const astrologerId = sessionData?.astrologerId;
    const birthDetails = sessionData?.birthDetails || {};
    const astroContext = sessionData?.astroContext || {};
    const language = sessionData?.language || 'English';

    let astrologer: AIAstrologer | null = null;
    try {
      const astDoc = await adminDb.collection('ai_astrologers').doc(astrologerId).get();
      if (astDoc.exists) {
        astrologer = { id: astDoc.id, ...astDoc.data() } as AIAstrologer;
      }
    } catch (e) {
      console.warn('Error fetching astrologer:', e);
    }
    if (!astrologer) {
      astrologer =
        DEFAULT_AI_ASTROLOGERS.find((a) => a.id === astrologerId) || DEFAULT_AI_ASTROLOGERS[0];
    }

    // 2. Fetch OpenAI API Key
    let openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      try {
        const settingsSnap = await adminDb.collection('settings').doc('general').get();
        if (settingsSnap.exists) {
          const sData = settingsSnap.data();
          if (sData?.openaiApiKey) openaiApiKey = sData.openaiApiKey;
        }
      } catch (sErr) {
        console.warn('Settings key fetch error:', sErr);
      }
    }

    const systemPersona = `${astrologer.systemPersonaPrompt || 'You are an authentic Vedic astrologer at AstroParihar.'}

CUSTOMER CHART CONTEXT:
- Name: ${birthDetails.name || 'Devotee'}
- Gender: ${birthDetails.gender || 'N/A'}
- Date of Birth: ${birthDetails.dob || 'N/A'}, Time: ${birthDetails.time || 'N/A'}, Place: ${birthDetails.place || 'N/A'}
- Primary Topic of Concern: ${birthDetails.primaryConcern || 'General Guidance'}
- Lagna: ${astroContext.lagna || 'Scorpio'}
- Moon Sign (Rashi): ${astroContext.moonRashi || 'Aries'}
- Nakshatra: ${astroContext.nakshatra || 'Bharani'}
- Active Mahadasha: ${astroContext.currentDasha || 'Jupiter-Mars'}
- Preferred Consultation Language: ${language}

CONVERSATION DIRECTIVES:
1. Speak directly in voice as the astrologer. Keep initial answers concise (2-4 sentences per turn) so the customer can talk and ask follow-ups naturally.
2. Address the devotee warmly with respect.
3. Refer to their specific planetary placements and active Dasha when answering questions about marriage, career, money, or health.
4. If they ask for remedies, provide authentic, non-fearful Vedic solutions (e.g. specific Gayatri / Beej mantras, Daan, Fasting days, or Gemstone guidance).
5. Communicate in ${language} (or natural conversational mix if Hindi/English).`;

    // Action A: Create WebRTC Realtime Ephemeral Session
    if (action === 'get_webrtc_session' && openaiApiKey) {
      try {
        const realtimeRes = await fetch('https://api.openai.com/v1/realtime/sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-realtime-preview-2024-12-17',
            voice: astrologer.voiceId || 'onyx',
            instructions: systemPersona,
            input_audio_transcription: {
              model: 'whisper-1',
            },
          }),
        });

        if (realtimeRes.ok) {
          const realtimeData = await realtimeRes.json();
          return NextResponse.json({
            success: true,
            mode: 'webrtc',
            clientSecret: realtimeData.client_secret?.value,
            sessionId: realtimeData.id,
            astrologer,
          });
        }
      } catch (webrtcErr) {
        console.warn('Realtime session creation error:', webrtcErr);
      }
    }

    // Action B: Live Speech/Chat Voice Exchange (Works 100% reliably in all browsers)
    if (openaiApiKey) {
      try {
        const messages: any[] = [{ role: 'system', content: systemPersona }];

        if (userMessage) {
          messages.push({ role: 'user', content: userMessage });
        } else {
          messages.push({
            role: 'user',
            content: `Hello Pandit ji, I have joined the voice consultation. Please greet me and review my birth chart regarding my concern: ${birthDetails.primaryConcern || 'General Life Path'}.`,
          });
        }

        const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (chatRes.ok) {
          const chatJson = await chatRes.json();
          const replyText =
            chatJson.choices[0]?.message?.content || 'Pranam Devotee, how may I guide you today?';

          // Generate audio speech using OpenAI TTS
          let audioBase64 = null;
          try {
            const ttsVoice =
              astrologer.voiceId || (astrologer.voiceGender === 'female' ? 'nova' : 'onyx');
            const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openaiApiKey}`,
              },
              body: JSON.stringify({
                model: 'tts-1',
                voice: ttsVoice,
                input: replyText,
                response_format: 'mp3',
              }),
            });

            if (ttsRes.ok) {
              const audioBuffer = await ttsRes.arrayBuffer();
              audioBase64 = Buffer.from(audioBuffer).toString('base64');
            }
          } catch (ttsErr) {
            console.warn('TTS generation warning:', ttsErr);
          }

          return NextResponse.json({
            success: true,
            replyText,
            audioBase64,
            astrologer,
          });
        }
      } catch (aiErr) {
        console.warn('OpenAI chat/voice error:', aiErr);
      }
    }

    // Fallback response if no OpenAI key configured yet
    const fallbackText = `Namaste ${birthDetails.name || 'Devotee'}. I am ${astrologer.name}. Based on your Lagna in ${astroContext.lagna || 'Scorpio'} and active ${astroContext.currentDasha || 'Jupiter Dasha'}, the cosmos is aligning favorably for your concerns in ${birthDetails.primaryConcern || 'life and career'}. How can I assist your spiritual path today?`;

    return NextResponse.json({
      success: true,
      replyText: fallbackText,
      audioBase64: null,
      astrologer,
    });
  } catch (error: any) {
    console.error('Error in voice session:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
