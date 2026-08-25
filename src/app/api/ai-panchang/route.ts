import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settings';
import { getAIPromptSettings } from '@/lib/aiPromptSettings';
import { calculatePanchang } from '@/lib/panchangEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date = new Date().toISOString().split('T')[0], location = 'New Delhi, Delhi, India' } = body;

    // 1. Calculate Astronomical Panchang data
    const panchang = calculatePanchang(date, location);

    // 2. Fetch OpenAI key
    const globalSettings = await getSettings();
    const openaiApiKey = globalSettings.openaiApiKey || process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      // Return structured fallback based on pure mathematical Vedic calculations
      return NextResponse.json({
        panchang,
        aiSummary: {
          dailyVedicSummary: `On ${panchang.formattedDate} in ${location}, the cosmic energies are ruled by ${panchang.paksha} Paksha ${panchang.tithi} and ${panchang.nakshatra} Nakshatra. The prevailing ${panchang.yoga} Yoga and ${panchang.karana} Karana foster focused endeavors and spiritual clarity.`,
          favorableActivities: [
            'Spiritual Sadhana and Meditation during Brahma Muhurta',
            `Important commitments and signing deals during Abhijit Muhurat (${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end})`,
            'Charity of water, food, and grains to the needy',
          ],
          inauspiciousPrecautions: [
            `Avoid commencing critical long journeys or taking heavy financial debt during Rahu Kaal (${panchang.rahuKaal.start} – ${panchang.rahuKaal.end})`,
          ],
          dailyMantra: 'ॐ नमो नारायणाय ॥ / ॐ नमः शिवाय ॥',
          dailyBlessingShloka: 'शुभं करोति कल्याणमारोग्यं धनसंपदाम् । शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तुते ॥',
        },
      });
    }

    // 3. Load Admin Configured Panchang Prompt
    const aiPromptSettings = await getAIPromptSettings();
    const panchangPromptConfig = aiPromptSettings.prompts['panchang-daily'];

    let systemPrompt =
      panchangPromptConfig?.systemPrompt ||
      'You are a master Vedic Panchang Astronomer and Jyotishi at AstroParihar.';
    if (aiPromptSettings.config.globalExtraDirectives) {
      systemPrompt += `\n\nGlobal Directives:\n${aiPromptSettings.config.globalExtraDirectives}`;
    }
    if (panchangPromptConfig?.extraDirectives) {
      systemPrompt += `\n\nSpecific Panchang Directives:\n${panchangPromptConfig.extraDirectives}`;
    }

    let userPrompt =
      panchangPromptConfig?.userPromptTemplate ||
      `Date: {date}\nLocation: {location}\nTithi: {tithi}\nNakshatra: {nakshatra}\nYoga: {yoga}, Karana: {karana}\nSunrise: {sunrise}, Sunset: {sunset}\nAbhijit Muhurat: {abhijitMuhurat}\nRahu Kaal: {rahuKaal}\n\nRespond ONLY with a JSON object.`;

    const replacements: Record<string, string> = {
      date: panchang.formattedDate,
      location: location,
      tithi: `${panchang.paksha} Paksha ${panchang.tithi}`,
      nakshatra: panchang.nakshatra,
      yoga: panchang.yoga,
      karana: panchang.karana,
      sunrise: panchang.sunrise,
      sunset: panchang.sunset,
      abhijitMuhurat: `${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}`,
      rahuKaal: `${panchang.rahuKaal.start} – ${panchang.rahuKaal.end}`,
    };

    Object.entries(replacements).forEach(([key, val]) => {
      userPrompt = userPrompt.replaceAll(`{${key}}`, val);
    });

    const model = aiPromptSettings.config.defaultModel || 'gpt-4o-mini';

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: aiPromptSettings.config.temperature || 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (openAiRes.ok) {
      const aiJson = await openAiRes.json();
      const parsedAi = JSON.parse(aiJson.choices[0].message.content);
      return NextResponse.json({
        panchang,
        aiSummary: parsedAi,
      });
    }

    return NextResponse.json({
      panchang,
      aiSummary: {
        dailyVedicSummary: `Daily Vedic Panchang calculations for ${location} on ${panchang.formattedDate}. Active ${panchang.paksha} Paksha ${panchang.tithi} with ${panchang.nakshatra} Nakshatra.`,
        favorableActivities: [
          `Important deeds during Abhijit Muhurat (${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end})`,
          'Daily prayer and meditation',
        ],
        inauspiciousPrecautions: [
          `Avoid auspicious beginnings during Rahu Kaal (${panchang.rahuKaal.start} – ${panchang.rahuKaal.end})`,
        ],
      },
    });
  } catch (error: any) {
    console.error('AI Panchang route error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
