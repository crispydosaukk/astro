import { NextResponse } from 'next/server';
import { getAIPromptSettings } from '@/lib/aiPromptSettings';
import { getServerOpenAIApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      systemPrompt,
      userPrompt,
      extraDirectives,
      model,
      temperature = 0.7,
      sampleDetails = {},
    } = body;

    // 1. Get OpenAI API Key
    const openaiApiKey = await getServerOpenAIApiKey();

    if (!openaiApiKey) {
      return NextResponse.json(
        {
          error:
            'OpenAI API Key is not configured. Please add your OpenAI API Key (sk-...) in Admin Settings > OpenAI Keys to run live tests.',
        },
        { status: 400 }
      );
    }

    const aiPromptSettings = await getAIPromptSettings();
    const chosenModel = model || aiPromptSettings.config.defaultModel || 'gpt-4o-mini';

    // 2. Interpolate user prompt with sample details
    let finalUserPrompt = userPrompt || '';
    const replacements: Record<string, string> = {
      name: sampleDetails.name || 'Rohan Sharma',
      gender: sampleDetails.gender || 'Male',
      dob: sampleDetails.dob || '1992-07-15',
      time: sampleDetails.time || '08:45 AM',
      place: sampleDetails.place || 'New Delhi, Delhi, India',
      currentDate: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      focus: sampleDetails.focus || 'Career Stability & Wealth Growth',
      userQuery: sampleDetails.userQuery || 'Will 2026 bring business expansion or job transition?',
      propertyType: sampleDetails.propertyType || 'Residential Apartment',
      entranceFacing: sampleDetails.entranceFacing || 'North-East',
      primaryConcern: sampleDetails.primaryConcern || 'Financial Prosperity',
      kitchenLocation: sampleDetails.kitchenLocation || 'South-East',
      masterBedroomLocation: sampleDetails.masterBedroomLocation || 'South-West',
      pujaLocation: sampleDetails.pujaLocation || 'North-East',
      toiletLocation: sampleDetails.toiletLocation || 'North-West',
      groomName: sampleDetails.groomName || 'Aarav Patel',
      groomDob: sampleDetails.groomDob || '1993-04-12',
      groomRashi: sampleDetails.groomRashi || 'Mesha (Aries)',
      groomNakshatra: sampleDetails.groomNakshatra || 'Ashwini',
      brideName: sampleDetails.brideName || 'Pooja Sharma',
      brideDob: sampleDetails.brideDob || '1995-09-24',
      brideRashi: sampleDetails.brideRashi || 'Kanya (Virgo)',
      brideNakshatra: sampleDetails.brideNakshatra || 'Hasta',
      totalScore: sampleDetails.totalScore || '29.5',
      status: sampleDetails.status || 'Highly Auspicious Match',
      manglikSummary:
        sampleDetails.manglikSummary || 'Both partners are Non-Manglik (Clean Alignment)',
      ashtakootBreakdown:
        'Varna: 1/1, Vashya: 2/2, Tara: 3/3, Yoni: 4/4, Graha Maitri: 5/5, Gana: 6/6, Bhakoot: 7/7, Nadi: 1.5/8',
      date: sampleDetails.date || new Date().toISOString().split('T')[0],
      location: sampleDetails.location || 'New Delhi, India',
      tithi: sampleDetails.tithi || 'Shukla Paksha Dashami',
      nakshatra: sampleDetails.nakshatra || 'Rohini',
      yoga: sampleDetails.yoga || 'Siddhi',
      karana: sampleDetails.karana || 'Gara',
      sunrise: sampleDetails.sunrise || '06:12 AM',
      sunset: sampleDetails.sunset || '06:45 PM',
      abhijitMuhurat: sampleDetails.abhijitMuhurat || '11:45 AM – 12:35 PM',
      rahuKaal: sampleDetails.rahuKaal || '03:15 PM – 04:45 PM',
    };

    Object.entries(replacements).forEach(([key, val]) => {
      finalUserPrompt = finalUserPrompt.replaceAll(`{${key}}`, val);
    });

    // 3. Append extra directives
    let finalSystemPrompt = systemPrompt || aiPromptSettings.config.systemPersona;
    if (aiPromptSettings.config.globalExtraDirectives) {
      finalSystemPrompt += `\n\nGlobal AstroParihar Directives:\n${aiPromptSettings.config.globalExtraDirectives}`;
    }
    if (extraDirectives) {
      finalSystemPrompt += `\n\nSpecific Output Directives for this module:\n${extraDirectives}`;
    }

    const openAiRes = await fetchWithOpenAIFallback(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: chosenModel,
          messages: [
            { role: 'system', content: finalSystemPrompt },
            { role: 'user', content: finalUserPrompt },
          ],
          temperature: Number(temperature) || 0.7,
          response_format: { type: 'json_object' },
        }),
      },
      openaiApiKey
    );

    if (!openAiRes.ok) {
      const errorData = await openAiRes.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'OpenAI API call failed' },
        { status: openAiRes.status }
      );
    }

    const aiJson = await openAiRes.json();
    const rawContent = aiJson.choices[0].message.content;
    let parsedContent = null;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch {
      parsedContent = { rawText: rawContent };
    }

    return NextResponse.json({
      success: true,
      modelUsed: chosenModel,
      usage: aiJson.usage,
      parsedContent,
      rawContent,
    });
  } catch (error: any) {
    console.error('Test AI Prompt error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
