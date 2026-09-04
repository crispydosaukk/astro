import { calculateAshtakootGunMilan } from '@/lib/vedicAstrologyEngine';
import { getAIPromptSettings, AIPromptItem } from '@/lib/aiPromptSettings';
import { getServerOpenAIApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';

export async function generateReportDataInternal(
  type: string,
  details: any = {},
  existingReportData: any = null
): Promise<any> {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentYear = new Date().getFullYear();

  let reportJsonObj: any = existingReportData ? { ...existingReportData } : null;

  // 1. If Kundli Matching and no calculation provided, compute authentic Vedic Ashtakoot Gun Milan
  if (!reportJsonObj && (type.includes('Matching') || type.includes('Gun Milan'))) {
    const groomName = details.groomName || 'Groom';
    const brideName = details.brideName || 'Bride';
    const [gDob, bDob] = (details.dob || '').split('&').map((s: string) => s.trim());
    const [gTob, bTob] = (details.time || '').split('&').map((s: string) => s.trim());
    const [gPob, bPob] = (details.place || '').split('&').map((s: string) => s.trim());

    reportJsonObj = calculateAshtakootGunMilan(
      gDob || '1995-01-01',
      gTob || '12:00',
      gPob || 'India',
      bDob || '1996-01-01',
      bTob || '12:00',
      bPob || 'India',
      groomName,
      brideName
    );
  }

  // 2. Fetch Server OpenAI API Key
  const openaiApiKey = await getServerOpenAIApiKey();

  const typeLower = (type || '').toLowerCase();
  const isVastu =
    typeLower.includes('vastu') || typeLower.includes('vāstu') || typeLower.includes('spatial');

  // 3. Call OpenAI with Admin Configured Prompts
  if (openaiApiKey) {
    try {
      const aiPromptSettings = await getAIPromptSettings();
      const { config: globalConfig, prompts } = aiPromptSettings;

      // Select the matching prompt module
      let promptKey = 'kundli-general';
      if (isVastu) promptKey = 'remedy-vastu';
      else if (type.includes('Matching') || reportJsonObj?.ashtakoot)
        promptKey = 'kundli-matching';
      else if (typeLower.includes('love') || typeLower.includes('relationship'))
        promptKey = 'horoscope-love';
      else if (typeLower.includes('finance') || typeLower.includes('wealth'))
        promptKey = 'horoscope-finance';
      else if (typeLower.includes('health') || typeLower.includes('vitality'))
        promptKey = 'horoscope-health';
      else if (typeLower.includes('mantra')) promptKey = 'remedy-mantra';
      else if (typeLower.includes('gemstone') || typeLower.includes('ratna'))
        promptKey = 'remedy-gemstone';
      else if (typeLower.includes('rudraksha')) promptKey = 'remedy-rudraksha';
      else if (
        typeLower.includes('homa') ||
        typeLower.includes('hawan') ||
        typeLower.includes('puja')
      )
        promptKey = 'remedy-homa';
      else if (typeLower.includes('panchang')) promptKey = 'panchang-daily';

      const promptConfig: AIPromptItem = prompts[promptKey] || prompts['kundli-general'];

      // Build System Prompt with Calendar Anchor and Admin Directives
      let systemPrompt = promptConfig.systemPrompt || globalConfig.systemPersona;
      systemPrompt += `\n\nReal-Time Calendar Anchor:\n- Current Date: ${currentDate} (Year: ${currentYear}).\n- The active calendar year is STRICTLY ${currentYear}. All predictions, transits, timelines, and remedies must be calculated for ${currentYear} and future years (${currentYear}, ${currentYear + 1}, ${currentYear + 2}). Never refer to 2024 or 2025 as the present year.`;
      if (globalConfig.globalExtraDirectives) {
        systemPrompt += `\n\nGlobal System Directives:\n${globalConfig.globalExtraDirectives}`;
      }
      if (promptConfig.extraDirectives) {
        systemPrompt += `\n\nSpecific Module Extra Directives:\n${promptConfig.extraDirectives}`;
      }

      // Build User Prompt using Template Interpolation
      let userPrompt = promptConfig.userPromptTemplate;
      const userName = details.name || details.fullName || details.groomName || 'Devotee';
      const userGender = details.gender || 'N/A';
      const userDob = details.dob || 'N/A';
      const userTime = details.time || details.tob || '12:00 PM';
      const userPlace = details.place || details.pob || 'India';
      const userQuery =
        details.primaryConcern ||
        details.userQuery ||
        details.focus ||
        'General Life Path Guidance';

      const replacements: Record<string, string> = {
        name: userName,
        gender: userGender,
        dob: userDob,
        time: userTime,
        place: userPlace,
        currentDate: currentDate,
        userQuery: userQuery,
        focus: details.healthFocus || details.careerCategory || details.focus || 'General Guidance',
        status: details.relationshipStatus || 'Seeking Insights',
        propertyType: details.propertyType || 'Residential Apartment',
        entranceFacing: details.entranceFacing || 'North-East',
        primaryConcern: details.primaryConcern || 'Financial Growth & Harmony',
        kitchenLocation: details.kitchenLocation || 'South-East',
        masterBedroomLocation: details.masterBedroomLocation || 'South-West',
        pujaLocation: details.pujaLocation || 'North-East',
        toiletLocation: details.toiletLocation || 'North-West',
        groomName: reportJsonObj?.groomName || details.groomName || 'Groom',
        groomDob: reportJsonObj?.groomDob || details.dob || 'N/A',
        groomRashi: reportJsonObj?.groomAstro?.rashiName || 'N/A',
        groomNakshatra: reportJsonObj?.groomAstro?.nakshatraName || 'N/A',
        brideName: reportJsonObj?.brideName || details.brideName || 'Bride',
        brideDob: reportJsonObj?.brideDob || details.dob || 'N/A',
        brideRashi: reportJsonObj?.brideAstro?.rashiName || 'N/A',
        brideNakshatra: reportJsonObj?.brideAstro?.nakshatraName || 'N/A',
        totalScore: `${reportJsonObj?.totalScore ?? 29.5}`,
        manglikSummary: reportJsonObj?.manglikStatus?.summary || 'Normal Alignment',
        ashtakootBreakdown: reportJsonObj?.ashtakoot
          ? reportJsonObj.ashtakoot.map((k: any) => `${k.koot}: ${k.score}`).join(', ')
          : 'Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi',
      };

      Object.entries(replacements).forEach(([key, val]) => {
        userPrompt = userPrompt.replaceAll(`{${key}}`, val);
      });

      const modelToUse = globalConfig.defaultModel || 'gpt-4o-mini';

      const openAiRes = await fetchWithOpenAIFallback(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: globalConfig.temperature || 0.7,
            max_tokens: globalConfig.maxTokens || 1800,
            response_format: { type: 'json_object' },
          }),
        },
        openaiApiKey
      );

      if (openAiRes.ok) {
        const aiJson = await openAiRes.json();
        const parsed = JSON.parse(aiJson.choices[0].message.content);
        if (!reportJsonObj) reportJsonObj = {};

        // Merge all dynamic outputs
        Object.keys(parsed).forEach((k) => {
          if (k === 'predictions' && reportJsonObj.predictions) {
            reportJsonObj.predictions = { ...reportJsonObj.predictions, ...parsed.predictions };
          } else {
            reportJsonObj[k] = parsed[k];
          }
        });
      }
    } catch (aiErr) {
      console.warn('OpenAI report generation warning:', aiErr);
    }
  }

  // 4. Safe dynamic fallback if OpenAI was unreachable
  if (!reportJsonObj) {
    const userName = details.name || details.fullName || details.groomName || 'Devotee';
    const birthPlace = details.pob || details.place || 'India';
    const birthDob = details.dob || 'N/A';

    if (isVastu) {
      reportJsonObj = {
        recommendationTitle: 'Vedic Vastu Shastra Consultation Report',
        recommendationName: `${userName}'s 8-Direction Spatial Analysis`,
        timing: `${currentDate}`,
        duration: 'Lifetime Guidance',
        propertySummary: {
          propertyType: details.propertyType || 'Residential Apartment',
          entranceFacing: details.entranceFacing || 'North-East (Ishanya)',
          overallEnergyScore: '88/100 (Auspicious with Non-Demolition Rectifications)',
        },
        astrologicalAnalysis: `Vedic Vāstu Purusha Mandala audit for ${userName} located at ${birthPlace}. Primary entrance facing ${details.entranceFacing || 'North-East'} activates positive Pranic currents. Recommended directional adjustments ensure financial stability and spiritual peace throughout ${currentYear} and beyond.`,
        procedure:
          '1. Cleanse directional corners with Gangajal and camphor.\n2. Place consecrated Yantra in Northeast corner on Thursday morning.',
        materials: 'Energized Vastu Dosh Nivaran Yantra, Copper Pyramids, Pure Brass Diya',
      };
    } else {
      reportJsonObj = {
        recommendationTitle: `AstroParihar — ${type}`,
        recommendationName: `${userName}'s Personalized Vedic Chart Analysis`,
        timing: `${currentDate}`,
        duration: 'Lifetime Guidance',
        materials: 'Pure Cow Ghee, Navagraha Incense, Copper Arghya Vessel, Yellow Flowers',
        astrologicalAnalysis: `Extensive Vedic analysis for ${userName} born on ${birthDob} at ${birthPlace}. Planetary alignments in ${currentYear} create supportive momentum for your personal aspirations and career development. Chanting your personalized mantra ensures protection and success.`,
        procedure:
          '1. Perform morning Surya Arghya in a copper vessel.\n2. Recite the prescribed planetary mantra 108 times daily.\n3. Observe Thursday or Tuesday sattvic discipline.',
        rules:
          'Maintain truthful speech and disciplined daily habits. Respect elders to strengthen Guru and Shani blessings.',
      };
    }
  }

  return reportJsonObj;
}
