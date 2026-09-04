import { NextResponse } from 'next/server';
import { getServerOpenAIApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';
import { getSettings } from '@/lib/settings';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const settings = await getSettings();
    const pricePerPrompt = Number(settings.aiChatPricePerPrompt) >= 0 ? Number(settings.aiChatPricePerPrompt) : 5;
    
    // Ensure document has price persisted
    try {
      await adminDb.collection('settings').doc('general').set({ aiChatPricePerPrompt: pricePerPrompt }, { merge: true });
    } catch (dbErr) {
      console.warn('Could not persist price setting to db:', dbErr);
    }

    return NextResponse.json({
      success: true,
      pricePerPrompt,
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, pricePerPrompt: 5 });
  }
}

export async function POST(req: Request) {
  let userRef: any = null;
  let deductedAmount = 0;
  let initialBalance = 0;

  try {
    const body = await req.json();
    const {
      messages = [],
      userId,
      userInfo = null,
      language = 'English',
    } = body;

    // 1. Check Authentication
    if (!userId || userId === 'guest-user' || userId === 'guest') {
      return NextResponse.json(
        {
          error: 'Please sign in to your AstroParihar account to chat with Acharya Parihar.',
          isGuest: true,
        },
        { status: 401 }
      );
    }

    // 2. Fetch Pricing Setting
    const settings = await getSettings();
    const pricePerPrompt = Number(settings.aiChatPricePerPrompt) >= 0 ? Number(settings.aiChatPricePerPrompt) : 5;

    // 3. Check & Deduct Wallet Balance
    userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    initialBalance = Number(userData?.walletBalance) || 0;

    if (pricePerPrompt > 0) {
      if (initialBalance < pricePerPrompt) {
        return NextResponse.json(
          {
            error: `Insufficient wallet balance. Each prompt costs ₹${pricePerPrompt}, but your available balance is ₹${initialBalance}. Please recharge your wallet to continue.`,
            isInsufficient: true,
            requiredAmount: pricePerPrompt,
            availableBalance: initialBalance,
          },
          { status: 402 }
        );
      }

      // Deduct wallet balance
      const newBalance = Math.max(0, initialBalance - pricePerPrompt);
      await userRef.set({ walletBalance: newBalance }, { merge: true });
      deductedAmount = pricePerPrompt;

      // Record transaction
      await userRef.collection('wallet_transactions').add({
        userId,
        amount: pricePerPrompt,
        type: 'debit',
        description: `AI Astrologer Chat Prompt (${language})`,
        serviceType: 'ai-chat',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'success',
        paymentMethod: 'wallet',
      });
    }

    // 4. Resolve OpenAI Key
    const openaiApiKey = await getServerOpenAIApiKey();

    if (!openaiApiKey) {
      // Refund if key is missing
      if (deductedAmount > 0 && userRef) {
        await userRef.set({ walletBalance: initialBalance }, { merge: true });
      }
      return NextResponse.json(
        { error: 'OpenAI API service is temporarily unavailable. Your wallet has not been charged.' },
        { status: 503 }
      );
    }

    const currentYear = new Date().getFullYear();
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build Astrological Persona System Prompt
    let userContext = '';
    if (userInfo) {
      userContext = `\nDevotee Profile:\n- Name: ${userInfo.name || 'Devotee'}\n- Gender: ${userInfo.gender || 'Not specified'}\n- Date of Birth: ${userInfo.dob || 'Not provided'}\n- Time of Birth: ${userInfo.tob || 'Not provided'}\n- Place of Birth: ${userInfo.pob || 'Not provided'}`;
    }

    const isIndic = ['Telugu', 'Hindi', 'Tamil'].includes(language);
    const scriptName =
      language === 'Telugu'
        ? 'Telugu script (తెలుగు లిపి)'
        : language === 'Hindi'
        ? 'Hindi Devanagari script (हिन्दी)'
        : language === 'Tamil'
        ? 'Tamil script (தமிழ்)'
        : 'English';

    const systemPrompt = `You are "Acharya Parihar", the master Vedic Astrologer, Jyotishacharya, and spiritual guide at AstroParihar. You possess profound mastery over Parashari Jyotish, Jaimini Sutras, Ashtakavarga, Nakshatra Pada analysis, and Vedic remedies (Upayas).

Real-Time Calendar Anchor:
- Today's Date: ${currentDate}.
- Current Year: STRICTLY ${currentYear}.
- You are living and practicing in ${currentYear}. All transit predictions (Saturn/Shani, Jupiter/Brihaspati, Rahu, Ketu), Mahadashas, and advice must strictly reference ${currentYear} and future years (${currentYear + 1}, ${currentYear + 2}). Never refer to 2024 or 2025 as the present or upcoming year.

MANDATORY LANGUAGE REQUIREMENT (CRITICAL & NON-NEGOTIABLE):
- The devotee has explicitly selected the language: **${language.toUpperCase()}** (${scriptName}).
- You MUST generate your ENTIRE consultation "reply" 100% in ${language} using ${scriptName}.
${isIndic ? `- Even if the devotee asks their question in English or Roman script (e.g. "What is my lucky gemstone?"), you MUST translate their question and deliver your complete answer, astrological insights, headings, and remedies 100% in ${language} (${scriptName}). DO NOT reply in English.` : ''}
- Tone: Warm, compassionate, wise, and spiritually uplifting (start with a warm Vedic greeting in ${language}: ${language === 'Telugu' ? '"నమస్కారం"' : language === 'Hindi' ? '"नमस्ते / प्रणाम"' : language === 'Tamil' ? '"வணக்கம்"' : '"Namaste / Hari Om"'}).
- Provide clear, actionable, authentic Vedic astrology insights. If birth details are provided, analyze their Lagna, Moon sign, planetary houses, and active Dasha influences.
- When answering questions about career, love, finance, health, or remedies, offer specific Vedic recommendations:
  1. Auspicious planetary mantras (with chanting counts like 108 times).
  2. Gemstone (Ratna) and Rudraksha guidance.
  3. Auspicious days and charitable acts (Daan).
  4. Temples or deity worship (Ishta Devata).
- Keep replies concise, structured with clear bullet points, and easy to read on mobile devices.${userContext}

Important Rules:
- Never give fatalistic, frightening, or negative death predictions. Always provide remedial hope and constructive spiritual solutions.
- Format your consultation text using clean Markdown with bold headings and readable bullet points.

Output Format Requirements:
You MUST respond STRICTLY in JSON format matching this schema:
{
  "reply": "Your complete detailed Markdown astrological consultation written 100% in ${language} (${scriptName}). Do NOT write in English unless English was chosen.",
  "recommendations": [
    "5 to 6 engaging follow-up inquiry questions written 100% in ${language} (${scriptName}) that the devotee can ask next based on this reading"
  ]
}`;

    // Prepare conversation messages with language reinforcement
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-12).map((m: any, idx: number, arr: any[]) => {
        let content = m.content || '';
        if (idx === arr.length - 1 && m.role === 'user' && language && language !== 'English') {
          content += `\n\n[MANDATORY DIRECTIVE: The user's chosen language is ${language}. You MUST formulate your entire response in ${scriptName}. Do NOT reply in English.]`;
        }
        return {
          role: m.role === 'user' ? 'user' : 'assistant',
          content,
        };
      }),
    ];

    const response = await fetchWithOpenAIFallback(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: conversationMessages,
          temperature: 0.7,
          max_tokens: 1200,
          response_format: { type: 'json_object' },
        }),
      },
      openaiApiKey
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI chat completion failed:', response.status, errText);
      // Refund if OpenAI fails
      if (deductedAmount > 0 && userRef) {
        await userRef.set({ walletBalance: initialBalance }, { merge: true });
      }
      return NextResponse.json(
        { error: 'Failed to generate guidance from AI. Your wallet balance has been refunded.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    let replyContent = '';
    let recommendations: string[] = [];

    try {
      const rawText = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawText);
      replyContent = parsed.reply || rawText;
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        recommendations = parsed.recommendations
          .filter((r: any) => typeof r === 'string' && r.trim().length > 0)
          .slice(0, 6);
      }
    } catch (parseErr) {
      replyContent =
        data.choices?.[0]?.message?.content ||
        'May Lord Ganesha bless you with clarity and peace. How else may I guide your chart today?';
    }

    // Ensure 5-6 recommendations are always present
    if (recommendations.length < 5) {
      if (language === 'Telugu') {
        recommendations = [
          '🔮 నా జాతకంలో 2026 గ్రహ సంచారాల ప్రభావం ఎలా ఉంది?',
          '✨ నా కోసం అనుకూలమైన రత్నం మరియు నిత్య పఠన మంత్రం ఏమిటి?',
          '💼 కెరీర్ మార్పు లేదా ప్రమోషన్‌కు సరైన సమయం ఎప్పుడు?',
          '❤️ వివాహ యోగం మరియు భాగస్వామి అనుకూలత ఎప్పుడు బాగుంటుంది?',
          '🪐 శని సాడే సాతి లేదా రాహు మహర్దశ నడుస్తుందా?',
          '🙏 ఈ దోష నివారణకు ఎలాంటి దానం లేదా పూజ చేయాలి?',
        ];
      } else if (language === 'Hindi') {
        recommendations = [
          '🔮 2026 में मेरे मुख्य ग्रह गोचर और महादशा का क्या प्रभाव है?',
          '✨ मेरे लिए शुभ रत्न, रुद्राक्ष और दैनिक मंत्र क्या है?',
          '💼 करियर में पदोन्नति या व्यापार विस्तार का सबसे शुभ समय कब है?',
          '❤️ विवाह का शुभ योग और जीवनसाथी से सामंजस्य कब बनेगा?',
          '🪐 क्या मुझ पर शनि की साढ़ेसाती या राहु की महादशा चल रही है?',
          '🙏 ग्रहों की शांति के लिए कौन सा दान या व्रत श्रेष्ठ रहेगा?',
        ];
      } else if (language === 'Tamil') {
        recommendations = [
          '🔮 2026-ல் எனது ஜாதக கிரக பெயர்ச்சி பலன்கள் எப்படி உள்ளன?',
          '✨ எனக்கு உகந்த அதிர்ஷ்ட ரத்தினம் மற்றும் தினசரி மந்திரம் எது?',
          '💼 தொழில் வளர்ச்சி அல்லது வேலை மாற்றத்திற்கு உகந்த நேரம் எப்போது?',
          '❤️ திருமண யோகம் மற்றும் திருமண வாழ்க்கை எப்போது அமையும்?',
          '🪐 எனக்கு ஏழரை சனி அல்லது ராகு தசை நடக்கிறதா?',
          '🙏 கிரக தோஷ பரிகாரத்திற்கு என்ன தானம் அல்லது பூஜை செய்ய வேண்டும்?',
        ];
      } else {
        recommendations = [
          '🔮 What do my planetary transits and dashas indicate for 2026?',
          '✨ What is my most auspicious gemstone, rudraksha & daily mantra?',
          '💼 What is the ideal timeline for career growth and financial expansion?',
          '❤️ When is the most favorable period for marriage and relationship harmony?',
          '🪐 Am I currently undergoing Shani Sade Sati or Rahu Mahadasha?',
          '🙏 What specific Vedic remedies, fasting, or charity (Daan) will strengthen my chart?',
        ];
      }
    }

    const finalBalance = Math.max(0, initialBalance - deductedAmount);

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toISOString(),
        recommendations: recommendations.slice(0, 6),
      },
      recommendations: recommendations.slice(0, 6),
      deducted: deductedAmount,
      newBalance: finalBalance,
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    // Refund on crash
    if (deductedAmount > 0 && userRef) {
      try {
        await userRef.set({ walletBalance: initialBalance }, { merge: true });
      } catch (rErr) {
        console.warn('Refund rollback error:', rErr);
      }
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
