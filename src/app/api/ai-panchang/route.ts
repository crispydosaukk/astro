import { NextResponse } from 'next/server';
import { getAIPromptSettings } from '@/lib/aiPromptSettings';
import { calculatePanchang } from '@/lib/panchangEngine';
import { getServerOpenAIApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';
import { safeParseAIJson } from '@/lib/aiResponseParser';
import { fetchVedikaPanchang, queryVedikaAI } from '@/lib/vedikaClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      date = new Date().toISOString().split('T')[0],
      location = 'New Delhi, Delhi, India',
      latitude,
      longitude,
    } = body;

    // 1. Calculate Astronomical Panchang data with local engine as baseline
    let panchang = calculatePanchang(date, location);
    let vedikaLive: any = null;

    // 2. Fetch Primary Live Ephemeris from Vedika AI
    try {
      const vPanchangRes = await fetchVedikaPanchang({
        date,
        latitude: latitude || 28.6139,
        longitude: longitude || 77.209,
      });

      if (vPanchangRes.success && vPanchangRes.data) {
        vedikaLive = vPanchangRes.data;
        if (vedikaLive.tithi?.name) panchang.tithi = vedikaLive.tithi.name;
        if (vedikaLive.nakshatra?.name) panchang.nakshatra = vedikaLive.nakshatra.name;
        if (vedikaLive.yoga?.name) panchang.yoga = vedikaLive.yoga.name;
        if (vedikaLive.karana?.name) panchang.karana = vedikaLive.karana.name;
        if (vedikaLive.sunrise) panchang.sunrise = vedikaLive.sunrise;
        if (vedikaLive.sunset) panchang.sunset = vedikaLive.sunset;
        if (vedikaLive.rahu_kaal?.start && vedikaLive.rahu_kaal?.end) {
          panchang.rahuKaal = {
            start: vedikaLive.rahu_kaal.start,
            end: vedikaLive.rahu_kaal.end,
          };
        }
      }
    } catch (vErr) {
      console.warn('Vedika Panchang live fetch notice:', vErr);
    }

    // 3. Query Vedika AI Intelligence for authentic Vedic synthesis
    let vedikaSummary = '';
    try {
      const vQuery = await queryVedikaAI({
        question: `Explain today's Panchang alignments for date ${date} in ${location}. Tithi is ${panchang.paksha} ${panchang.tithi}, Nakshatra is ${panchang.nakshatra}, Yoga is ${panchang.yoga}, Karana is ${panchang.karana}. Provide cosmic energy overview, auspicious activities, and inauspicious precautions during Rahu Kaal.`,
        birthDetails: {
          datetime: `${date}T12:00:00`,
          latitude: latitude || 28.6139,
          longitude: longitude || 77.209,
        },
      });

      if (vQuery.success && vQuery.data?.answer) {
        vedikaSummary = vQuery.data.answer;
      }
    } catch (vAiErr) {
      console.warn('Vedika AI summary notice:', vAiErr);
    }

    // 4. Fallback to OpenAI if configured
    const openaiApiKey = await getServerOpenAIApiKey();

    if (!openaiApiKey) {
      return NextResponse.json({
        panchang,
        vedikaLive,
        aiSummary: {
          dailyVedicSummary: `On ${panchang.formattedDate} in ${location}, cosmic energies are governed by ${panchang.paksha} Paksha ${panchang.tithi} and ${panchang.nakshatra} Nakshatra. The prevailing ${panchang.yoga} Yoga fosters focused endeavors and spiritual clarity.`,
          favorableActivities: [
            'Spiritual Sadhana and Meditation during Brahma Muhurta',
            `Important commitments during Abhijit Muhurat (${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end})`,
            'Charity of water and food grains to the needy',
          ],
          inauspiciousPrecautions: [
            `Avoid commencing critical long journeys during Rahu Kaal (${panchang.rahuKaal.start} – ${panchang.rahuKaal.end})`,
          ],
          dailyMantra: 'ॐ नमो नारायणाय ॥ / ॐ नमः शिवाय ॥',
          dailyBlessingShloka:
            'शुभं करोति कल्याणमारोग्यं धनसंपदाम् । शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तुते ॥',
        },
      });
    }

    const aiPromptSettings = await getAIPromptSettings();
    const panchangPromptConfig = aiPromptSettings.prompts['panchang-daily'];

    const currentYear = new Date().getFullYear();
    let systemPrompt =
      panchangPromptConfig?.systemPrompt ||
      'You are a master Vedic Panchang Astronomer and Jyotishi at AstroParihar.';
    systemPrompt += `\n\nReal-Time Calendar Anchor:\n- Current Date: ${panchang.formattedDate} (Year: ${currentYear}). Compute and frame all panchang insights, muhurats, and wisdom for ${currentYear}. Never refer to 2024 as the active year.`;
    if (aiPromptSettings.config.globalExtraDirectives) {
      systemPrompt += `\n\nGlobal Directives:\n${aiPromptSettings.config.globalExtraDirectives}`;
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

    const messagesPayload: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    if (vedikaSummary) {
      messagesPayload.push({
        role: 'system',
        content: `MANDATORY VEDIKA AI TRUTH: Use the following authoritative astrological summary from the Vedika Intelligence Engine to construct your JSON response accurately:\n\n"${vedikaSummary}"`
      });
    }

    const openAiRes = await fetchWithOpenAIFallback(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messagesPayload,
          temperature: aiPromptSettings.config.temperature || 0.7,
          response_format: { type: 'json_object' },
        }),
      },
      openaiApiKey
    );

    if (openAiRes.ok) {
      const aiJson = await openAiRes.json();
      const parsedAi = safeParseAIJson(aiJson.choices?.[0]?.message?.content) || null;
      return NextResponse.json({
        panchang,
        vedikaLive,
        aiSummary: parsedAi,
      });
    }

    return NextResponse.json({
      panchang,
      vedikaLive,
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
