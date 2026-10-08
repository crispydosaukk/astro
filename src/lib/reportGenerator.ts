import { calculateAshtakootGunMilan, calculateBirthChartData } from '@/lib/vedicAstrologyEngine';
import { getAIPromptSettings, AIPromptItem } from '@/lib/aiPromptSettings';
import { getServerOpenAIApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';
import { safeParseAIJson } from '@/lib/aiResponseParser';
import { resolveVedicRemedies, ASTROPARIHAR_HOMAMS } from '@/lib/vedicRemediesEngine';
import { resolveLalKitabRemedies } from '@/lib/lalKitabEngine';
import {
  fetchVedikaBirthChart,
  fetchVedikaKundliMatching,
  fetchVedikaDasha,
  fetchVedikaDoshas,
  queryVedikaAI,
  formatToVedikaDateTime,
} from '@/lib/vedikaClient';

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
  const userName = details.name || details.fullName || details.groomName || 'Devotee';

  let reportJsonObj: any = existingReportData ? { ...existingReportData } : null;

  const typeLower = (type || '').toLowerCase();
  const serviceIdLower = (details?.serviceId || '').toLowerCase();

  // 1. If Kundli Matching, compute via Vedika AI
  const isKundliMatching =
    type.includes('Matching') ||
    type.includes('Gun Milan') ||
    typeLower.includes('matching') ||
    typeLower.includes('gun milan') ||
    Boolean(details.groomName) ||
    Boolean(details.dob && details.dob.includes('&'));

  if (isKundliMatching && !reportJsonObj?.vedikaSource) {
    const groomName = details.groomName || 'Groom';
    const brideName = details.brideName || 'Bride';
    const [gDob, bDob] = (details.dob || '').split('&').map((s: string) => s.trim());
    const [gTob, bTob] = (details.time || details.tob || '').split('&').map((s: string) => s.trim());
    const [gPob, bPob] = (details.place || details.pob || '').split('&').map((s: string) => s.trim());

    // 1a. Primary live ephemeris matching from Vedika AI
    try {
      const gDt = formatToVedikaDateTime(gDob || '1995-01-01', gTob || '12:00');
      const bDt = formatToVedikaDateTime(bDob || '1996-01-01', bTob || '12:00');
      const vMatchRes = await fetchVedikaKundliMatching({
        male: { datetime: gDt, latitude: details.gLat || details.lat || 28.6139, longitude: details.gLon || details.lon || 77.209 },
        female: { datetime: bDt, latitude: details.bLat || details.lat || 19.076, longitude: details.bLon || details.lon || 72.8777 },
      });

      if (vMatchRes.success && vMatchRes.data) {
        const vData = vMatchRes.data;
        const totalPts = vData.total_points ?? 28;
        const maxPts = vData.maximum_points ?? 36;
        const pct = vData.percentage ?? Math.round((totalPts / maxPts) * 100);

        reportJsonObj = {
          ...(reportJsonObj || {}),
          groomName,
          brideName,
          groomDob: gDob,
          brideDob: bDob,
          totalScore: totalPts,
          maximumPoints: maxPts,
          percentage: pct,
          status: vData.match_result?.status || (totalPts >= 18 ? 'Auspicious' : 'Inauspicious'),
          verdict: vData.recommendation || vData.match_result?.description,
          ashtakoot: vData.guna_kootas || [
            { koot: 'Varna', score: vData.gunaDetails?.varna?.score ?? 1, max: 1 },
            { koot: 'Vashya', score: vData.gunaDetails?.vashya?.score ?? 2, max: 2 },
            { koot: 'Tara', score: vData.gunaDetails?.tara?.score ?? 3, max: 3 },
            { koot: 'Yoni', score: vData.gunaDetails?.yoni?.score ?? 4, max: 4 },
            { koot: 'Graha Maitri', score: vData.gunaDetails?.graha_maitri?.score ?? 5, max: 5 },
            { koot: 'Gana', score: vData.gunaDetails?.gana?.score ?? 6, max: 6 },
            { koot: 'Bhakoot', score: vData.gunaDetails?.bhakoot?.score ?? 7, max: 7 },
            { koot: 'Nadi', score: vData.gunaDetails?.nadi?.score ?? 8, max: 8 },
          ],
          gunaDetails: vData.gunaDetails || reportJsonObj?.gunaDetails,
          remedies: vData.remedies || reportJsonObj?.remedies,
          femaleInfo: vData.female_info || reportJsonObj?.femaleInfo,
          maleInfo: vData.male_info || reportJsonObj?.maleInfo,
          vedikaSource: true,
          engine: 'Vedika AI Intelligence (vedika.io)',
        };
      }
    } catch (vMatchErr) {
      console.warn('Vedika Kundli Matching notice:', vMatchErr);
    }

    if (!reportJsonObj) {
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
  }

  // 1b. Ensure precision astronomical birth chart is computed via Vedika AI
  if (
    !isKundliMatching &&
    !reportJsonObj?.vedikaSource &&
    (details.dob || details.date || details.birthDate || !reportJsonObj)
  ) {
    const rawDob = details.dob || details.date || details.birthDate || '1995-01-01';
    const rawTime = details.time || details.tob || details.birthTime || '12:00 PM';
    const rawPlace = details.place || details.pob || details.birthPlace || 'India';
    const lat = Number(details.lat) || 28.6139;
    const lon = Number(details.lon) || 77.209;

    let chart = calculateBirthChartData(
      rawDob,
      rawTime,
      rawPlace,
      `${lat}`,
      `${lon}`,
      userName,
      details.gender || 'Male'
    );

    // Fetch primary live ephemeris from Vedika AI
    try {
      const vDt = formatToVedikaDateTime(rawDob, rawTime);
      const [vChartRes, vDashaRes, vDoshasRes] = await Promise.all([
        fetchVedikaBirthChart({ datetime: vDt, latitude: lat, longitude: lon }),
        fetchVedikaDasha({ datetime: vDt, latitude: lat, longitude: lon }),
        fetchVedikaDoshas({ datetime: vDt, latitude: lat, longitude: lon }),
      ]);

      if (vChartRes.success && vChartRes.data) {
        const vChart = vChartRes.data;
        const vDasha = vDashaRes.success ? vDashaRes.data : null;
        const vDoshas = vDoshasRes.success ? vDoshasRes.data : null;

        const ascSign =
          vChart.ascendant?.sign ||
          (typeof vChart.ascendant === 'string' ? vChart.ascendant : chart.ascendant);
        const moonSign = vChart.moonSign || chart.moonSign;
        const sunSign = vChart.sunSign || chart.sunSign;
        const nakshatraName =
          vChart.nakshatra?.name ||
          (typeof vChart.nakshatra === 'string' ? vChart.nakshatra : chart.nakshatra);

        chart = ({
          ...chart,
          ascendant: ascSign,
          moonSign: moonSign,
          sunSign: sunSign,
          nakshatra: nakshatraName,
          tithi: vChart.tithi?.name || chart.tithi,
          chartSvg: vChart.svg || (chart as any).chartSvg,
          dasha: (vDasha
            ? {
                ...chart.dasha,
                currentMahadasha:
                  vDasha.current_dasha?.planet ||
                  vDasha.current_dasha?.maha_dasha ||
                  chart.dasha?.currentMahadasha,
                currentAntardasha:
                  vDasha.current_dasha?.antar_dasha || chart.dasha?.currentAntardasha,
                dashaBalance: vDasha.dasha_balance,
                guidance: vDasha.guidance,
                mahaDasha: vDasha.maha_dasha || (chart.dasha as any)?.mahaDasha,
              }
            : chart.dasha) as any,
          doshas: (vDoshas
            ? {
                mangalDosha: vDoshas.mangal_dosha,
                kaalSarpDosha: vDoshas.kaal_sarp_dosha,
                pitruDosha: vDoshas.pitru_dosha,
              }
            : chart.doshas) as any,
          vedikaSource: true,
        }) as any;
      }
    } catch (vErr) {
      console.warn('Vedika birth chart ephemeris notice:', vErr);
    }

    reportJsonObj = {
      recommendationTitle: reportJsonObj?.recommendationTitle || 'Vedic Janam Kundli & Horoscope Reading',
      recommendationName: reportJsonObj?.recommendationName || `${userName}'s Personalized Vedic Chart Analysis`,
      timing: reportJsonObj?.timing || `Generated on ${currentDate}`,
      duration: reportJsonObj?.duration || 'Lifetime Vedic Insights',
      ...chart,
      ...(reportJsonObj || {}),
      ascendant: chart.ascendant,
      sunSign: chart.sunSign,
      moonSign: chart.moonSign,
      nakshatra: chart.nakshatra,
      dasha: chart.dasha,
      planetaryDegrees: chart.planetaryDegrees,
      d1Houses: chart.d1Houses,
      d9Houses: chart.d9Houses,
      tithi: chart.tithi,
      yoga: chart.yoga,
      karana: chart.karana,
      ishtaDevata: chart.ishtaDevata,
      doshas: (chart as any).doshas || reportJsonObj?.doshas,
      vedikaSource: (chart as any).vedikaSource || reportJsonObj?.vedikaSource,
      lalKitabRemedies: resolveLalKitabRemedies(chart),
      engine: 'Vedika AI Intelligence (vedika.io)',
    };
  }

  const isIshtaDevata =
    typeLower.includes('ishta') ||
    typeLower.includes('ista') ||
    typeLower.includes('devata') ||
    serviceIdLower === 'svc-ishta' ||
    serviceIdLower.includes('ishta');
  const isVastu =
    typeLower.includes('vastu') || typeLower.includes('vāstu') || typeLower.includes('spatial') || serviceIdLower.includes('vastu');
  const isYantra =
    typeLower.includes('yantra') || typeLower.includes('yanthra') || serviceIdLower === 'svc-yantra' || serviceIdLower.includes('yantra');
  const isHomam =
    typeLower.includes('homa') ||
    typeLower.includes('homam') ||
    typeLower.includes('hawan') ||
    typeLower.includes('havan') ||
    typeLower.includes('puja') ||
    serviceIdLower === 'svc-homam' ||
    serviceIdLower.includes('homam') ||
    serviceIdLower.includes('homa');
  const isMantra =
    typeLower.includes('mantra') ||
    serviceIdLower === 'svc-mantra' ||
    serviceIdLower.includes('mantra');
  const isGemstone =
    typeLower.includes('gemstone') ||
    typeLower.includes('ratna') ||
    serviceIdLower === 'svc-gemstone' ||
    serviceIdLower.includes('gemstone');
  const isRudraksha =
    typeLower.includes('rudraksha') ||
    serviceIdLower === 'svc-rudraksha' ||
    serviceIdLower.includes('rudraksha');
  const isCharity =
    typeLower.includes('charity') ||
    typeLower.includes('daana') ||
    typeLower.includes('dana') ||
    serviceIdLower === 'svc-charity' ||
    serviceIdLower.includes('charity');
  const isFasting =
    typeLower.includes('fasting') ||
    typeLower.includes('vrata') ||
    typeLower.includes('vrat') ||
    serviceIdLower === 'svc-fasting' ||
    serviceIdLower.includes('fasting');

  // 2. Primary Natural Language Vedic Synthesis from Vedika AI
  const userQuery =
    details.primaryConcern ||
    details.userQuery ||
    details.focus ||
    details.category ||
    type;

  try {
    const rawDob = details.dob || details.date || details.birthDate || '1995-01-01';
    const rawTime = details.time || details.tob || details.birthTime || '12:00 PM';
    const vDt = formatToVedikaDateTime(rawDob, rawTime);

    const vQueryRes = await queryVedikaAI({
      question: `Generate an authoritative, detailed Vedic astrology report for ${type}. Devotee: ${userName}, Lagna: ${reportJsonObj?.ascendant || 'Vedic'}, Moon Sign: ${reportJsonObj?.moonSign || 'Moon'}, Nakshatra: ${reportJsonObj?.nakshatra || 'Vedic'}, Active Dasha: ${reportJsonObj?.dasha?.currentMahadasha || 'Active'}. Focus area: ${userQuery}. Provide comprehensive cosmic analysis of life path, career, financial growth, planetary remedies, and spiritual guidance.`,
      birthDetails: {
        datetime: vDt,
        latitude: Number(details.lat) || 28.6139,
        longitude: Number(details.lon) || 77.209,
      },
    });

    const vAnswer = vQueryRes.success ? (vQueryRes.data?.response || vQueryRes.data?.answer) : undefined;
    if (vAnswer && typeof vAnswer === 'string') {
      if (!reportJsonObj) reportJsonObj = {};
      reportJsonObj.astrologicalAnalysis = vAnswer;
      reportJsonObj.summary = vAnswer.slice(0, 320);
      reportJsonObj.vedikaAiExplanation = vAnswer;
      reportJsonObj.engine = 'Vedika AI Intelligence (vedika.io)';
    }
    if (!reportJsonObj?.astrologicalAnalysis) {
      const activeLagna = reportJsonObj?.ascendant || 'Vedic';
      const activeMoon = reportJsonObj?.moonSign || 'Moon';
      const activeNakshatra = reportJsonObj?.nakshatra || '';
      const activeDasha = reportJsonObj?.dasha?.currentMahadasha
        ? `${reportJsonObj.dasha.currentMahadasha} Mahadasha (${reportJsonObj.dasha.currentAntardasha || ''})`
        : 'Active Vimshottari Cycle';

      if (!reportJsonObj) reportJsonObj = {};
      reportJsonObj.astrologicalAnalysis = `Authoritative Vedic Analysis for ${userName} (${type}):\n\n• Ascendant (Lagna): Born under ${activeLagna} Ascendant, establishing foundational vitality and purposeful life direction.\n• Moon Sign & Nakshatra: Governed by ${activeMoon} Rashi in ${activeNakshatra} Nakshatra, shaping emotional depth, intuition, and mental acumen.\n• Active Planetary Period: You are currently navigating your ${activeDasha}. This planetary transit emphasizes strategic consolidation, spiritual alignment, and purposeful decisions in ${currentYear}.\n\nPlanetary alignments encourage regular adherence to your prescribed Vedic remedies and sattvic disciplines to harmonize karmic influences and magnetize divine grace.`;
      reportJsonObj.summary = `Vedic reading for ${userName}: ${activeLagna} Lagna with ${activeMoon} Moon. Navigating ${activeDasha} in ${currentYear}.`;
      reportJsonObj.engine = 'Vedika AI Intelligence (vedika.io)';
    }
  } catch (vAiErr) {
    console.warn('Vedika AI interpretation notice:', vAiErr);
  }

  // 3. Auxiliary JSON formatting via OpenAI (if configured)
  const openaiApiKey = await getServerOpenAIApiKey();

  if (openaiApiKey) {
    try {
      const aiPromptSettings = await getAIPromptSettings();
      const { config: globalConfig, prompts } = aiPromptSettings;

      // Select the matching prompt module
      let promptKey = 'kundli-general';
      if (isIshtaDevata) promptKey = 'remedy-ishta';
      else if (isVastu) promptKey = 'remedy-vastu';
      else if (type.includes('Matching') || reportJsonObj?.ashtakoot)
        promptKey = 'kundli-matching';
      else if (isYantra) promptKey = 'remedy-yantra';
      else if (isHomam) promptKey = 'remedy-homa';
      else if (isMantra) promptKey = 'remedy-mantra';
      else if (isGemstone) promptKey = 'remedy-gemstone';
      else if (isRudraksha) promptKey = 'remedy-rudraksha';
      else if (typeLower.includes('love') || typeLower.includes('relationship'))
        promptKey = 'horoscope-love';
      else if (typeLower.includes('finance') || typeLower.includes('wealth'))
        promptKey = 'horoscope-finance';
      else if (typeLower.includes('health') || typeLower.includes('vitality'))
        promptKey = 'horoscope-health';
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

      const verifiedLagna = reportJsonObj?.ascendant || '';
      const verifiedMoon = reportJsonObj?.moonSign || '';
      const verifiedNakshatra = reportJsonObj?.nakshatra || '';
      const verifiedSun = reportJsonObj?.sunSign || '';
      const verifiedDasha = reportJsonObj?.dasha?.currentMahadasha
        ? `${reportJsonObj.dasha.currentMahadasha} (${reportJsonObj.dasha.currentAntardasha || ''})`
        : '';

      if (verifiedLagna) {
        systemPrompt += `\n\n================================================================================
CRITICAL ASTRONOMICAL GROUND TRUTH (ZERO-HALLUCINATION DIRECTIVE):
================================================================================
The native's birth chart has ALREADY been calculated with precision ephemeris:
- Ascendant (Lagna): ${verifiedLagna}
- Moon Sign (Chandra Rashi): ${verifiedMoon} ${verifiedNakshatra ? `(${verifiedNakshatra})` : ''}
- Sun Sign (Surya Rashi): ${verifiedSun}
- Active Vimshottari Dasha: ${verifiedDasha}

MANDATORY RULES:
1. You MUST explicitly state that the native is born with ${verifiedLagna} Ascendant.
2. DO NOT use Western Tropical sun sign dates (e.g. October birth date does NOT mean Libra Lagna). This is Vedic Sidereal (Nirayana) Astrology. The Lagna is strictly ${verifiedLagna}.
3. NEVER state or imply a different Ascendant, Moon sign, or Dasha. Any response claiming a different Lagna is strictly forbidden.
4. Your astrologicalAnalysis MUST interpret the genuine house placements of ${verifiedLagna} Lagna.`;
      }

      // Build User Prompt using Template Interpolation
      let userPrompt = promptConfig.userPromptTemplate;
      const userGender = details.gender || 'N/A';
      const userDob = details.dob || 'N/A';
      const userTime = details.time || details.tob || '12:00 PM';
      const userPlace = details.place || details.pob || 'India';

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
        ascendant: reportJsonObj?.ascendant || 'Vedic Ascendant',
        moonSign: reportJsonObj?.moonSign || 'Moon Sign',
        nakshatra: reportJsonObj?.nakshatra || 'Nakshatra',
        sunSign: reportJsonObj?.sunSign || 'Sun Sign',
        tithi: reportJsonObj?.tithi || 'Vedic Tithi',
        yoga: reportJsonObj?.yoga || 'Vedic Yoga',
        currentDasha: reportJsonObj?.dasha?.currentMahadasha
          ? `${reportJsonObj.dasha.currentMahadasha} - ${reportJsonObj.dasha.currentAntardasha}`
          : 'Active Vimshottari Cycle',
        planetaryPlacements: Array.isArray(reportJsonObj?.planetaryDegrees)
          ? reportJsonObj.planetaryDegrees.map((p: any) => `${p.planet}: ${p.rashi} in ${p.house}`).join(', ')
          : '9 Grahas positioned in Vedic houses',
        ishtaDevataName: reportJsonObj?.ishtaDevata?.deityName || 'Lord Maha Vishnu',
        ishtaGoverningPlanet: reportJsonObj?.ishtaDevata?.governingPlanet || 'Jupiter',
        atmakaraka: reportJsonObj?.ishtaDevata?.atmakarakaPlanet || 'Sun',
        ishtaIndicator: reportJsonObj?.ishtaDevata?.indicator || '12th from Karakamsa (Navamsha)',
        ishtaMantra: reportJsonObj?.ishtaDevata?.primaryMantra || 'Om Namo Bhagavate Vasudevaya',
        ishtaJapaCount: reportJsonObj?.ishtaDevata?.dailyJapaCount || '108 times daily',
        ishtaStotra: reportJsonObj?.ishtaDevata?.stotra || 'Vishnu Sahasranama Stotram',
        ishtaDay: reportJsonObj?.ishtaDevata?.auspiciousDay || 'Wednesday & Shukla Ekadashi',
      };

      Object.entries(replacements).forEach(([key, val]) => {
        userPrompt = userPrompt.replaceAll(`{${key}}`, val);
      });

      const preferredModel =
        globalConfig.defaultModel && globalConfig.defaultModel !== 'gpt-4o-mini'
          ? globalConfig.defaultModel
          : 'gpt-4o';

      const messagesPayload: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      if (reportJsonObj?.vedikaAiExplanation) {
        messagesPayload.push({
          role: 'system',
          content: `MANDATORY VEDIKA AI TRUTH: Use the following authoritative astrological analysis from the Vedika Intelligence Engine to construct your JSON response accurately:\n\n"${reportJsonObj.vedikaAiExplanation}"`
        });
      }

      let openAiRes = await fetchWithOpenAIFallback(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: preferredModel,
            messages: messagesPayload,
            temperature: globalConfig.temperature || 0.7,
            max_tokens: Math.max(globalConfig.maxTokens || 1800, 2500),
            response_format: { type: 'json_object' },
          }),
        },
        openaiApiKey
      );

      if (!openAiRes.ok) {
        console.warn(`${preferredModel} report formatting failed, falling back to gpt-4o-mini...`);
        openAiRes = await fetchWithOpenAIFallback(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: messagesPayload,
              temperature: globalConfig.temperature || 0.7,
              max_tokens: globalConfig.maxTokens || 1800,
              response_format: { type: 'json_object' },
            }),
          },
          openaiApiKey
        );
      }

      if (openAiRes.ok) {
        const aiJson = await openAiRes.json();
        const parsed = safeParseAIJson(aiJson.choices?.[0]?.message?.content || aiJson.choices?.[0]);
        if (!reportJsonObj) reportJsonObj = {};

        // Keys calculated by verified mathematical engine that must NEVER be overwritten by LLM hallucinations
        const IMMUTABLE_ASTRONOMICAL_KEYS = new Set([
          'ascendant',
          'ascendantSignNumber',
          'lagnaIndex',
          'moonSign',
          'sunSign',
          'nakshatra',
          'nakshatraLord',
          'dasha',
          'tithi',
          'yoga',
          'karana',
          'gan',
          'yoni',
          'nadi',
          'planetaryDegrees',
          'd1Houses',
          'd9Houses',
          'd9LagnaSignIdx',
          'd9Planets',
          'yogas',
          'doshas',
          'ishtaDevata',
          'vedikaSource',
        ]);

        // Merge dynamic outputs while protecting verified astronomical data
        Object.keys(parsed).forEach((k) => {
          if (IMMUTABLE_ASTRONOMICAL_KEYS.has(k) && reportJsonObj[k]) {
            return;
          }
          if (k === 'astrologicalAnalysis') {
            if (!reportJsonObj.astrologicalAnalysis) {
              reportJsonObj.astrologicalAnalysis = parsed[k];
            } else if (parsed[k] && parsed[k].length > (reportJsonObj.astrologicalAnalysis?.length || 0)) {
              // gpt-4o synthesis incorporating Vedika truth is richer
              reportJsonObj.astrologicalAnalysis = parsed[k];
            }
            return;
          }
          if (k === 'predictions' && reportJsonObj.predictions) {
            reportJsonObj.predictions = { ...reportJsonObj.predictions, ...parsed.predictions };
          } else {
            reportJsonObj[k] = parsed[k];
          }
        });
      }
    } catch (aiErr) {
      console.warn('OpenAI report formatting notice:', aiErr);
    }
  }

  // 4. Guarantee 100% complete canonical remedy structures for AstroParihar catalogue
  if (isHomam) {
    const resolved = resolveVedicRemedies({
      concern: userQuery,
      domain: details.category || type,
      lagna: reportJsonObj?.ascendant,
      moonRashi: reportJsonObj?.moonSign,
      dasha: reportJsonObj?.dasha ? `${reportJsonObj.dasha.currentMahadasha} - ${reportJsonObj.dasha.currentAntardasha}` : '',
      name: userName,
    });
    const canonical = resolved.primaryHomam;
    reportJsonObj.recommendedHoma = {
      name: canonical.name,
      purpose: canonical.purpose,
      day: canonical.day,
      duration: canonical.duration,
      deity: canonical.deity,
      ahutiMantra: canonical.ahutiMantra,
      japaCount: canonical.japaCount,
      samidha: canonical.samidha,
      materials: reportJsonObj.materials || canonical.materials,
      procedure: reportJsonObj.procedure || canonical.procedure,
      benefits: canonical.benefits,
    };
    if (!reportJsonObj.procedure) reportJsonObj.procedure = canonical.procedure;
    if (!reportJsonObj.materials) reportJsonObj.materials = canonical.materials;
  }

  if (isMantra) {
    const resolved = resolveVedicRemedies({
      concern: userQuery,
      domain: details.category || type,
      lagna: reportJsonObj?.ascendant,
      moonRashi: reportJsonObj?.moonSign,
      dasha: reportJsonObj?.dasha ? `${reportJsonObj.dasha.currentMahadasha} - ${reportJsonObj.dasha.currentAntardasha}` : '',
      name: userName,
    });
    const canonicalMantra = resolved.primaryMantra;
    reportJsonObj.prescribedMantras = [
      {
        title: canonicalMantra.title,
        sanskrit: canonicalMantra.sanskrit,
        transliteration: canonicalMantra.transliteration,
        japaCount: canonicalMantra.japaCount,
        bestTime: canonicalMantra.bestTime,
        mala: canonicalMantra.mala,
        benefits: canonicalMantra.benefits,
      },
      {
        title: resolved.secondaryMantra.title,
        sanskrit: resolved.secondaryMantra.sanskrit,
        transliteration: resolved.secondaryMantra.transliteration,
        japaCount: resolved.secondaryMantra.japaCount,
        bestTime: resolved.secondaryMantra.bestTime,
        mala: resolved.secondaryMantra.mala,
        benefits: resolved.secondaryMantra.benefits,
      },
    ];
  }

  if (isGemstone) {
    const resolved = resolveVedicRemedies({
      concern: userQuery,
      domain: details.category || type,
      lagna: reportJsonObj?.ascendant,
      moonRashi: reportJsonObj?.moonSign,
      dasha: reportJsonObj?.dasha ? `${reportJsonObj.dasha.currentMahadasha} - ${reportJsonObj.dasha.currentAntardasha}` : '',
      name: userName,
    });
    const canonicalGem = resolved.gemstone;
    if (!reportJsonObj.primaryGemstone || typeof reportJsonObj.primaryGemstone === 'string') {
      reportJsonObj.primaryGemstone = {
        name: typeof reportJsonObj.primaryGemstone === 'string' ? reportJsonObj.primaryGemstone : canonicalGem.name,
        caratWeight: canonicalGem.caratWeight,
        metal: canonicalGem.metal,
        wearingFinger: canonicalGem.finger,
        auspiciousDay: canonicalGem.auspiciousDay,
        consecrationMantra: canonicalGem.mantra,
      };
    } else if (typeof reportJsonObj.primaryGemstone === 'object') {
      if (!reportJsonObj.primaryGemstone.consecrationMantra) {
        reportJsonObj.primaryGemstone.consecrationMantra = canonicalGem.mantra;
      }
      if (!reportJsonObj.primaryGemstone.wearingFinger) {
        reportJsonObj.primaryGemstone.wearingFinger = canonicalGem.finger;
      }
      if (!reportJsonObj.primaryGemstone.auspiciousDay) {
        reportJsonObj.primaryGemstone.auspiciousDay = canonicalGem.auspiciousDay;
      }
    }
  }

  if (isIshtaDevata) {
    const ishta = reportJsonObj?.ishtaDevata;
    if (ishta) {
      reportJsonObj.deity = ishta.deityName;
      reportJsonObj.astrologicalIndicator = ishta.indicator;
      reportJsonObj.prescribedMantra = ishta.primaryMantra;
      reportJsonObj.auspiciousDay = ishta.auspiciousDay;
      reportJsonObj.recommendedStotras = [ishta.stotra];
      reportJsonObj.sacredOfferings = ishta.offerings;
      if (!reportJsonObj.dailyWorshipGuide) {
        reportJsonObj.dailyWorshipGuide = ishta.worshipProcedure;
      }
      if (!reportJsonObj.spiritualSignificance) {
        reportJsonObj.spiritualSignificance = ishta.spiritualSignificance;
      }
      if (!reportJsonObj.procedure) {
        reportJsonObj.procedure = ishta.worshipProcedure;
      }
      if (!reportJsonObj.materials) {
        reportJsonObj.materials = ishta.offerings;
      }
    }
  }

  if (isYantra && !reportJsonObj?.primaryYantra) {
    reportJsonObj.primaryYantra = {
      name: 'श्री यन्त्र (Shree Yantra) & कुबेर यन्त्र (Kubera Yantra)',
      deity: 'Goddess Mahalakshmi & Lord Kubera',
      planet: 'Venus (Shukra) & Jupiter (Guru)',
      material: 'Heavy Consecrated Copper Plate (Tamra Patra) / Ashtadhatu',
      geometry: 'Sacred Nine Interlocking Triangles forming 43 Triads with Central Bindu',
      placementDirection: 'North-East (Ishanya Kona) or North Wall at eye level on sacred altar',
      activationMuhurat: 'Shukla Paksha Friday or Sunday morning during Brahma Muhurta (Sunrise)',
      consecrationMantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ॥ (Om Shreem Hreem Kleem Mahalakshmaye Namah)',
      japaCount: '108 Recitations during Prana Pratishtha',
      benefits: 'Radiates positive harmonic cosmic frequencies, dissolves monetary obstacles, magnetizes abundance, and neutralizes spatial geometric imbalances.'
    };
  }

  if (isVastu && !reportJsonObj?.propertySummary) {
    reportJsonObj.propertySummary = {
      propertyType: details.propertyType || 'Residential Apartment',
      entranceFacing: details.entranceFacing || 'North-East (Ishanya)',
      overallEnergyScore: '88/100 (Auspicious with Non-Demolition Rectifications)',
    };
  }

  if (isRudraksha && !reportJsonObj?.primaryRudraksha) {
    reportJsonObj.primaryRudraksha = {
      name: '7 Mukhi & 5 Mukhi Nepal Rudraksha (सात मुखी व पंच मुखी रुद्राक्ष)',
      deity: 'Goddess Mahalakshmi & Lord Kalagni Rudra',
      governingPlanet: 'Venus (Shukra) & Jupiter (Guru)',
      origin: 'Sacred Nepal Gandaki River Region',
      wearingDay: 'Monday or Shukla Paksha Friday during Brahma Muhurta',
      consecrationMantra: 'ॐ हुं नमः ॥ & ॐ ह्रीं नमः ॥',
      benefits: 'Dispels financial anxiety, neutralizes planetary afflictions, promotes mental tranquility, and protects against untimely adversity.',
    };
  }

  if (isCharity && !reportJsonObj?.recommendedCharity) {
    reportJsonObj.recommendedCharity = {
      name: 'Vedic Gau Seva & Anna Daana (गौ सेवा एवं अन्नदान)',
      beneficiary: 'Desi Cows at a verified Goshala, elderly sadhus, or underprivileged students',
      auspiciousDay: 'Saturday morning or Shukla Ekadashi / Purnima',
      itemsToDonate: 'Green grass, whole wheat grains, sesame seeds, warm clothing, or pure cow milk',
      sankalpaMantra: 'ॐ विष्णवे नमः । सर्वपाप प्रणाशाय पुण्यप्राप्त्यर्थे इदं दानं समर्पयामि ॥',
      benefits: 'Dissolves karmic hindrances, pacifies Shani and Rahu transits, and attracts divine Grace.',
    };
  }

  if (isFasting && !reportJsonObj?.recommendedVrata) {
    reportJsonObj.recommendedVrata = {
      name: 'Shukla Ekadashi & Somavara Vrata (एकादशी एवं सोमवार व्रत)',
      deity: 'Lord Maha Vishnu & Lord Shiva',
      procedure: 'Observe waterless or fruit/milk fast from sunrise to sunrise. Chant 108 rounds of Vishnu Sahasranama or Maha Mrityunjaya Mantra.',
      breakingTime: 'Dvadashi morning after sunrise during Parana muhurat',
      benefits: 'Cleanses cellular metabolism, aligns pranic currents with the lunar cycle, and eliminates negative mental patterns.',
    };
  }

  // 4. Safe dynamic fallback if OpenAI was unreachable
  if (!reportJsonObj) {
    const userName = details.name || details.fullName || details.groomName || 'Devotee';
    const birthPlace = details.pob || details.place || 'India';
    const birthDob = details.dob || 'N/A';

    if (isIshtaDevata) {
      const ishta = reportJsonObj?.ishtaDevata;
      reportJsonObj = {
        recommendationTitle: 'Ishta Devata Discovery & Upasana Report',
        recommendationName: `${userName}'s Guiding Ishta Devata Sadhana`,
        timing: `${currentDate}`,
        duration: 'Lifetime Divine Protection',
        deity: ishta?.deityName || 'Lord Maha Vishnu',
        astrologicalIndicator: ishta?.indicator || '12th from Karakamsa (Navamsha)',
        prescribedMantra: ishta?.primaryMantra || 'Om Namo Bhagavate Vasudevaya',
        prescribedMantras: [
          {
            title: `${ishta?.deityName || 'Ishta Devata'} Sacred Upasana Mantra`,
            sanskrit: ishta?.primaryMantra || 'Om Namo Bhagavate Vasudevaya',
            japaCount: ishta?.dailyJapaCount || '108 Times Daily (1 Mala)',
            bestTime: ishta?.auspiciousDay || 'Brahma Muhurta / Morning',
          },
        ],
        auspiciousDay: ishta?.auspiciousDay || 'Wednesday & Shukla Ekadashi',
        recommendedStotras: [ishta?.stotra || 'Vishnu Sahasranama Stotram'],
        sacredOfferings: ishta?.offerings || 'Tulsi leaves, Yellow marigold flowers, Panchamrita',
        dailyWorshipGuide: ishta?.worshipProcedure || 'Sit facing North-East. Light a pure cow ghee lamp and chant 108 times.',
        spiritualSignificance: ishta?.spiritualSignificance || 'Your Ishta Devata serves as your soul\'s ultimate protector and beacon of liberation.',
        procedure: ishta?.worshipProcedure || 'Sit facing North-East. Light a pure cow ghee lamp and chant 108 times.',
        materials: ishta?.offerings || 'Pure Cow Ghee Diya, Flowers, Consecrated Japa Mala',
        astrologicalAnalysis: `Vedic Ishta Devata analysis for ${userName} born on ${birthDob} at ${birthPlace}. In accordance with classical Jaimini and Parashara principles, your soul planet (Atmakaraka) points to ${ishta?.deityName || 'Lord Maha Vishnu'} as your personal divine guardian. Regular upasana harmonizes your entire birth chart and dissolves negative transits.`,
      };
    } else if (isVastu) {
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
    } else if (isYantra) {
      reportJsonObj = {
        recommendationTitle: 'Consecrated Vedic Yantra Prescription Report',
        recommendationName: `${userName}'s Sacred Geometric Yantra Remedy`,
        timing: `${currentDate}`,
        duration: 'Lifetime Cosmic Energy Conductor',
        primaryYantra: {
          name: 'श्री यन्त्र (Shree Yantra) & कुबेर यन्त्र (Kubera Yantra)',
          deity: 'Goddess Mahalakshmi & Lord Kubera',
          planet: 'Venus (Shukra) & Jupiter (Guru)',
          material: 'Heavy Consecrated Copper Plate (Tamra Patra) / Ashtadhatu',
          geometry: 'Sacred Nine Interlocking Triangles forming 43 Triads with Central Bindu',
          placementDirection: 'North-East (Ishanya Kona) or North Wall at eye level on sacred altar',
          activationMuhurat: 'Shukla Paksha Friday or Sunday morning during Brahma Muhurta (Sunrise)',
          consecrationMantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ॥ (Om Shreem Hreem Kleem Mahalakshmaye Namah)',
          japaCount: '108 Recitations during Prana Pratishtha',
          benefits: 'Radiates positive harmonic cosmic frequencies, dissolves monetary obstacles, magnetizes abundance, and neutralizes spatial geometric imbalances.'
        },
        secondaryYantras: [
          {
            name: 'Surya Yantra (सूर्य यन्त्र)',
            deity: 'Lord Surya Bhagavan',
            planet: 'Sun (Surya)',
            placement: 'East Wall of pooja room or living area',
            purpose: 'Amplifies willpower, leadership, vitality, and social renown.'
          },
          {
            name: 'Navagraha Yantra (नवग्रह यन्त्र)',
            deity: 'Nine Celestial Grahas',
            planet: 'All 9 Planetary Deities',
            placement: 'Pooja room altar facing East or North',
            purpose: 'Harmonizes transit clashes and neutralizes afflicted planetary Dasha cycles.'
          }
        ],
        procedure:
          '1. Purify the consecrated Yantra plate with Gangajal and raw cow milk at sunrise.\n2. Lay on a red or yellow consecrated silk cloth on sacred altar facing East or North.\n3. Anoint the central Bindu with pure Sandalwood (Chandan) and Kumkum.\n4. Light a pure cow ghee diya and fragrant Guggal/Chandan incense.\n5. Recite the activation Beej Mantra "ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः" 108 times using a Sphatik or Rudraksha mala.\n6. Offer fresh fragrant yellow or white flowers and sweet naivedyam.',
        materials: 'Consecrated Copper / Ashtadhatu Yantra Plate, Pure Gangajal, Raw Cow Milk, Sandalwood Paste, Kumkum, Cow Ghee Diya, Sphatik Mala, Red Silk Asana',
        astrologicalAnalysis: `Astrological Vedic chart analysis for ${userName} born on ${birthDob} at ${birthPlace}. In ${currentYear}, your planetary configurations indicate a need for grounding solar-magnetic energy currents to shield against transit fluctuations and unblock auspicious fortune (Bhagya). The consecrated Shree Yantra functions as a divine cosmic antenna, elevating spatial vibrational clarity and neutralizing planetary adversity.`,
        rules:
          'Maintain sanctity in the installation area. Avoid handling with unwashed hands. Offer daily dhoop and light. Re-energize with 108 mantra recitations during Shukla Paksha Fridays, Navratri, and Deepavali.',
        additionalGuidance: 'Place at eye level where soft morning sunlight reaches. Do not place directly opposite entrance shoes or inside leather materials.'
      };
    } else if (isHomam) {
      const resolved = resolveVedicRemedies({
        concern: details.primaryConcern || details.userQuery || details.focus || type,
        domain: details.category || type,
        lagna: reportJsonObj?.ascendant,
        moonRashi: reportJsonObj?.moonSign,
        dasha: reportJsonObj?.dasha ? `${reportJsonObj.dasha.currentMahadasha} - ${reportJsonObj.dasha.currentAntardasha}` : '',
        name: userName,
      });
      const homa = resolved.primaryHomam;
      reportJsonObj = {
        recommendationTitle: 'Vedic Homa & Hawan Ritual Guide',
        recommendationName: `${userName}'s Prescribed Agni Homa Protocol`,
        timing: `${currentDate}`,
        duration: homa.duration || '2–3 hours',
        recommendedHoma: {
          name: homa.name,
          purpose: homa.purpose,
          day: homa.day,
          duration: homa.duration,
          deity: homa.deity,
          ahutiMantra: homa.ahutiMantra,
          japaCount: homa.japaCount,
          samidha: homa.samidha,
          materials: homa.materials,
          procedure: homa.procedure,
          benefits: homa.benefits,
        },
        procedure: homa.procedure,
        materials: homa.materials,
        astrologicalAnalysis: `Vedic chart analysis for ${userName} born on ${birthDob} at ${birthPlace}. In ${currentYear}, planetary configurations indicate that purifying subtle karmic energies through the divine Agni Deva via ${homa.name} dissolves persistent impediments and restores energetic equilibrium.`,
        rules: 'Observe sattvic fasting on the morning of the ritual. Chant the prescribed Ahuti mantra with focused intention and surrender.',
        additionalGuidance: `Auspicious timing: ${homa.day} during Shukla Paksha or auspicious Nakshatra. Consult our verified purohits for Gotra sankalpa.`,
      };
    } else if (isMantra) {
      const resolved = resolveVedicRemedies({
        concern: details.primaryConcern || details.userQuery || details.focus || type,
        domain: details.category || type,
        lagna: reportJsonObj?.ascendant,
        moonRashi: reportJsonObj?.moonSign,
        dasha: reportJsonObj?.dasha ? `${reportJsonObj.dasha.currentMahadasha} - ${reportJsonObj.dasha.currentAntardasha}` : '',
        name: userName,
      });
      const m1 = resolved.primaryMantra;
      const m2 = resolved.secondaryMantra;
      reportJsonObj = {
        recommendationTitle: 'Consecrated Mantra Japa Prescription',
        recommendationName: `${userName}'s Personalized Vedic Mantra Protocol`,
        timing: `${currentDate}`,
        duration: 'Daily Sadhana Protocol',
        prescribedMantras: [
          {
            title: m1.title,
            sanskrit: m1.sanskrit,
            transliteration: m1.transliteration,
            japaCount: m1.japaCount,
            bestTime: m1.bestTime,
            mala: m1.mala,
            benefits: m1.benefits,
          },
          {
            title: m2.title,
            sanskrit: m2.sanskrit,
            transliteration: m2.transliteration,
            japaCount: m2.japaCount,
            bestTime: m2.bestTime,
            mala: m2.mala,
            benefits: m2.benefits,
          },
        ],
        procedure: `1. Cleanse hands and feet, sit facing East or North on a pure woolen or kusha asana.\n2. Light a pure cow ghee diya and offer fragrant flowers to the deity.\n3. Hold the consecrated japa mala in the right hand inside a Gomukhi bag.\n4. Recite the primary mantra with phonetic clarity and deep concentration for 108 recitations.\n5. Sit in silent contemplation for 5 minutes post japa to absorb cosmic sound resonance.`,
        materials: `Consecrated Japa Mala (${m1.mala || '108 beads'}), Gomukhi Bag, Brass Diya with Pure Cow Ghee, Sandalwood Paste, Fresh Flowers`,
        astrologicalAnalysis: `Vedic Astrological sound therapy analysis for ${userName} born on ${birthDob} at ${birthPlace}. Chanting your prescribed vibrational frequencies in ${currentYear} harmonizes afflicted planetary waves, brings mental poise, and clears subconscious karmic impressions.`,
        rules: 'Maintain daily continuity for at least one full Mandala (48 consecutive days). Avoid touching the Sumeru (head bead) while turning the mala.',
        additionalGuidance: 'Ideal chanting period is during Brahma Muhurta (sunrise). Maintain a sattvic diet for accelerated spiritual and material results.',
      };
    } else if (isGemstone) {
      const resolved = resolveVedicRemedies({
        concern: details.primaryConcern || details.userQuery || details.focus || type,
        domain: details.category || type,
        lagna: reportJsonObj?.ascendant,
        moonRashi: reportJsonObj?.moonSign,
        dasha: reportJsonObj?.dasha ? `${reportJsonObj.dasha.currentMahadasha} - ${reportJsonObj.dasha.currentAntardasha}` : '',
        name: userName,
      });
      const gem = resolved.gemstone;
      reportJsonObj = {
        recommendationTitle: 'Certified Vedic Gemstone Prescription',
        recommendationName: `${userName}'s Personalized Ratna Recommendation`,
        timing: `${currentDate}`,
        duration: 'Lifetime Pranic Support',
        primaryGemstone: {
          name: gem.name,
          caratWeight: gem.caratWeight,
          metal: gem.metal,
          wearingFinger: gem.finger,
          auspiciousDay: gem.auspiciousDay,
          consecrationMantra: gem.mantra,
        },
        procedure: `1. Purify the gemstone ring in raw cow milk and sacred Gangajal for 2 hours on the auspicious morning.\n2. Place the ring on a clean yellow/red consecrated cloth in front of your pooja altar.\n3. Light a pure cow ghee diya and chant the consecration mantra "${gem.mantra}" 108 times.\n4. Wear on the prescribed finger before 8:00 AM while offering prayer to the governing Graha.\n5. Offer sweet fruits or grain donations to seek blessings.`,
        materials: 'Certified Natural Gemstone Ring in prescribed metal, Pure Gangajal, Raw Cow Milk, Cow Ghee Diya, Flowers, Incense',
        astrologicalAnalysis: `Vedic Ratna Shastra analysis for ${userName} born on ${birthDob} at ${birthPlace}. In ${currentYear}, your planetary configurations indicate a need to strengthen the auspicious cosmic rays of your benefactor Graha. Wearing an energized, natural gemstone acts as a crystalline cosmic prism, infusing protective vitality and clearing stagnation.`,
        rules: 'Wear only natural, unheated, certified gemstones with open back setting so light touches the skin. Remove only when necessary and cleanse every Full Moon night.',
        additionalGuidance: 'Test the gemstone for 3 days before permanent setting. Never wear cracked or chemically treated stones.',
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
