import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { AIConsultationSummary } from '@/lib/aiAstrologerData';

export async function POST(req: Request) {
  try {
    const { sessionId, durationSeconds = 60, conversationTranscript = [] } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const sessionRef = adminDb.collection('ai_consultations').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    const astrologerName = sessionData?.astrologerName || 'Astrologer';
    const birthDetails = sessionData?.birthDetails || {};
    const primaryConcern = birthDetails?.primaryConcern || 'Life Guidance';
    const discipline = sessionData?.primaryDiscipline || 'Vedic Jyotish';
    const language = sessionData?.language || 'English';

    // 1. Fetch dynamic OpenAI API Key
    let openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      try {
        const settingsSnap = await adminDb.collection('settings').doc('general').get();
        if (settingsSnap.exists) {
          const sData = settingsSnap.data();
          if (sData?.openaiApiKey) openaiApiKey = sData.openaiApiKey;
        }
      } catch (sErr) {
        console.warn('Error reading settings for OpenAI key:', sErr);
      }
    }

    // Default High-Quality Astrology Summary fallback
    let summary: AIConsultationSummary = {
      overview: `Divine consultation completed with ${astrologerName} (${discipline}) for ${birthDetails.name || 'Devotee'}. Explored key planetary influences around ${primaryConcern}, analyzing active Dasha and transits in ${language}.`,
      astrologicalHighlights: [
        `Strong planetary alignment observed in your chart indicating high intellectual resilience and leadership capacity.`,
        `Current Mahadasha-Antardasha period is initiating a significant transition phase favoring long-term stability.`,
        `Benefic Jupiter aspect protects the house of prosperity, neutralizing minor transit delays.`,
      ],
      timelinePredictions: [
        `Next 3-6 Months: Key decision crossroads with favorable resolution in career and financial planning.`,
        `Upcoming 12 Months: Auspicious window for personal milestones, domestic harmony, and fruitful investments.`,
      ],
      recommendedRemedies: [
        {
          type: 'mantra',
          title: 'Daily Surya Gayatri or Navagraha Japa',
          instructions:
            'Chant 11 or 108 times at sunrise facing East for mental clarity and protection.',
        },
        {
          type: 'daan',
          title: 'Auspicious Friday / Thursday Daan',
          instructions:
            'Donate yellow grains, milk sweets, or green fodder to cows to strengthen benefic planetary rays.',
        },
        {
          type: 'gemstone',
          title: 'Consecrated Energized Gemstone / Rudraksha',
          instructions:
            'Wear a 5-Mukhi Rudraksha or suitable astrological gemstone set in silver/copper on an auspicious Shukla Paksha day.',
        },
      ],
      auspiciousDates: [
        'Thursdays during Shukla Paksha',
        'Full Moon (Purnima) evening for prayer',
        'Pushya Nakshatra',
      ],
      panditJiFinalBlessing: `May the supreme cosmic energies and Navagrahas shower peace, good health, and abundant prosperity upon you and your family. Om Shanti Shanti Shanti.`,
    };

    // 2. Synthesize Dynamic OpenAI Summary if API key is active
    if (openaiApiKey) {
      try {
        const transcriptText = Array.isArray(conversationTranscript)
          ? conversationTranscript
              .map(
                (t: any) =>
                  `${t.role === 'user' ? 'Customer' : astrologerName}: ${t.content || t.text}`
              )
              .join('\n')
          : '';

        const systemPrompt = `You are an elite Vedic astrology report generator for AstroParihar.
Synthesize a professional, inspiring, and authentic post-consultation astrology summary based on the consultation conducted by ${astrologerName} (${discipline}).
Devotee Details: Name: ${birthDetails.name || 'Devotee'}, DOB: ${birthDetails.dob || 'N/A'}, Time: ${birthDetails.time || 'N/A'}, Place: ${birthDetails.place || 'N/A'}, Concern: ${primaryConcern}, Language: ${language}.

Respond ONLY with a valid JSON object matching this schema:
{
  "overview": "2-3 sentence overview of the astrological consultation reading and findings",
  "astrologicalHighlights": ["Point 1 about planetary alignment/Dasha", "Point 2 about yogas/houses", "Point 3 about transit energy"],
  "timelinePredictions": ["Prediction 1 with specific timeline", "Prediction 2 with specific timeline"],
  "recommendedRemedies": [
    {"type": "mantra", "title": "Specific Vedic Mantra", "instructions": "Chanting count, time of day, and purpose"},
    {"type": "daan", "title": "Specific Charity/Daan", "instructions": "What to donate and on which weekday"},
    {"type": "gemstone", "title": "Gemstone or Rudraksha recommendation", "instructions": "Metal, finger, or consecration rule"}
  ],
  "auspiciousDates": ["Favorable day 1", "Favorable day 2"],
  "panditJiFinalBlessing": "A compassionate and uplifting closing spiritual blessing"
}`;

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Consultation Transcript Context:\n${transcriptText || 'General consultation on ' + primaryConcern}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
          }),
        });

        if (openAiRes.ok) {
          const aiJson = await openAiRes.json();
          const parsed = JSON.parse(aiJson.choices[0].message.content);
          summary = {
            overview: parsed.overview || summary.overview,
            astrologicalHighlights: parsed.astrologicalHighlights || summary.astrologicalHighlights,
            timelinePredictions: parsed.timelinePredictions || summary.timelinePredictions,
            recommendedRemedies: parsed.recommendedRemedies || summary.recommendedRemedies,
            auspiciousDates: parsed.auspiciousDates || summary.auspiciousDates,
            panditJiFinalBlessing: parsed.panditJiFinalBlessing || summary.panditJiFinalBlessing,
          };
        }
      } catch (aiErr) {
        console.warn('OpenAI Summary Generation Warning:', aiErr);
      }
    }

    // 3. Save Summary, Full Transcript, and Complete the Session in Firestore
    const finalDuration = Math.max(durationSeconds, 60);
    const finalBilledMinutes = Math.ceil(finalDuration / 60);
    const finalTotalAmount = finalBilledMinutes * (sessionData?.pricePerMin || 20);

    await sessionRef.update({
      status:
        sessionData.status === 'terminated_low_balance' ? 'terminated_low_balance' : 'completed',
      endTime: new Date().toISOString(),
      durationSeconds: finalDuration,
      billedMinutes: finalBilledMinutes,
      totalBilledAmount: finalTotalAmount,
      conversationTranscript: Array.isArray(conversationTranscript) ? conversationTranscript : [],
      summary,
    });

    return NextResponse.json({
      success: true,
      summary,
      durationSeconds: finalDuration,
      billedMinutes: finalBilledMinutes,
      totalBilledAmount: finalTotalAmount,
      conversationTranscript,
    });
  } catch (error: any) {
    console.error('Error ending AI consultation:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
