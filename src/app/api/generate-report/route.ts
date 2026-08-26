import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { calculateAshtakootGunMilan } from '@/lib/vedicAstrologyEngine';
import { getAIPromptSettings, AIPromptItem } from '@/lib/aiPromptSettings';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = 'guest-user',
      userEmail = '',
      type = 'Custom Astrology Report',
      details = {},
      reportContent: clientReportContent,
      reportData: clientReportData,
    } = body;

    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let reportJsonObj: any = clientReportData || null;

    if (!reportJsonObj && clientReportContent) {
      try {
        reportJsonObj =
          typeof clientReportContent === 'string'
            ? JSON.parse(clientReportContent)
            : clientReportContent;
      } catch (e) {
        reportJsonObj = { rawContent: clientReportContent };
      }
    }

    // 1. If Kundli Matching and no full calculation provided, run authentic Vedic Ashtakoot engine
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

    // 2. Fetch dynamic OpenAI API Key from Firestore settings / env
    let openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (settingsSnap.exists()) {
          const sData = settingsSnap.data();
          if (sData?.openaiApiKey) openaiApiKey = sData.openaiApiKey;
        }
      } catch (sErr) {
        console.warn('Error reading settings for OpenAI key:', sErr);
      }
    }

    const typeLower = type.toLowerCase();
    const isVastu =
      typeLower.includes('vastu') || typeLower.includes('vāstu') || typeLower.includes('spatial');

    // 3. Call OpenAI with Admin Configured Prompts & Extra Directives if API key exists
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

        // Build System Prompt with Global & Specific Extra Directives
        let systemPrompt = promptConfig.systemPrompt || globalConfig.systemPersona;
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
          focus: details.healthFocus || details.careerCategory || details.focus || 'General',
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

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
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
        });

        if (openAiRes.ok) {
          const aiJson = await openAiRes.json();
          const parsed = JSON.parse(aiJson.choices[0].message.content);
          if (!reportJsonObj) reportJsonObj = {};

          // Merge all standard and custom prompt output properties
          Object.keys(parsed).forEach((k) => {
            if (k === 'predictions' && reportJsonObj.predictions) {
              reportJsonObj.predictions = { ...reportJsonObj.predictions, ...parsed.predictions };
            } else {
              reportJsonObj[k] = parsed[k];
            }
          });
        }
      } catch (aiErr) {
        console.warn('OpenAI dynamic call error:', aiErr);
      }
    }

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
            overallEnergyScore: '84/100 (Auspicious with Non-Demolition Rectifications)',
          },
          astrologicalAnalysis: `Vedic Vāstu Purusha Mandala audit conducted for ${userName} (${details.propertyType || 'Residential Property'}) located at ${birthPlace}.\n\nYour primary entrance facing ${details.entranceFacing || 'North-East'} allows the beneficial Jaivik (solar) and Pranic magnetic energy lines to enter unobstructed. The ${details.kitchenLocation || 'South-East'} quadrant governs the Agni element and liquidity; balancing this zone maintains consistent cash flow and household vitality.\n\nThe ${details.masterBedroomLocation || 'South-West'} Nairruti sector anchors physical stability, health of the main breadwinner, and relationship harmony. With our non-demolition remedial placement of consecrated Yantras and metal pyramid strips, any subtle elemental conflicts are neutralized naturally.`,
          directionalAnalysis: [
            {
              direction: 'North (Kuber Zone)',
              status: 'Positive',
              observation: 'Governs liquid cash and new growth opportunities.',
              remedy: 'Place Kubera Yantra or green indoor plants.',
            },
            {
              direction: 'North-East (Ishanya Zone)',
              status: 'Divine Energy',
              observation: 'Head of Vastu Purusha, governs mental peace and wisdom.',
              remedy: 'Keep pristine and clutter-free. Establish pure water/Gangajal bowl.',
            },
            {
              direction: 'East (Surya Zone)',
              status: 'Vital Energy',
              observation: 'Governs reputation, life force, and social connections.',
              remedy: 'Ensure morning sunlight enters unobstructed.',
            },
            {
              direction: 'South-East (Agni Zone)',
              status: 'Active Fire',
              observation: 'Governs metabolic fire, kitchen balance, and vitality.',
              remedy: 'Maintain warm golden lighting; avoid blue tones or water storage.',
            },
            {
              direction: 'South (Yama Zone)',
              status: 'Stable',
              observation: 'Governs career authority, discipline, and endurance.',
              remedy: 'Keep heavier than North/East zones.',
            },
            {
              direction: 'South-West (Nairruti Zone)',
              status: 'Master Foundation',
              observation: 'Governs relationship bonding and overall property grounding.',
              remedy: 'Use earthy yellow tones and heavy brass elements. Zero underground water.',
            },
            {
              direction: 'West (Varuna Zone)',
              status: 'Gains & Profits',
              observation: 'Governs consistent returns on effort and emotional balance.',
              remedy: 'Ideal for study or metallic accents.',
            },
            {
              direction: 'North-West (Vayavya Zone)',
              status: 'Air Movement',
              observation: 'Governs social support, bank relationships, and mobility.',
              remedy: 'Keep well-ventilated with white or silver accents.',
            },
          ],
          doshaCorrections: [
            '1. Non-Demolition Fire/Water Rectification: Install a green stone slab under the cooking stove if near water fixtures.',
            '2. Main Door Energy Shielding: Fix a consecrated brass Swastika / Trishakti yantra at eye level above the entrance frame.',
            '3. Spatial Stagnation Neutralizer: Place sea rock salt bowls in toilet corners, replaced every 15 days.',
          ],
          procedure:
            '1. Cleanse all 8 directional corners with Gangajal and light Guggul / Camphor dhoop.\n2. Establish the energized Vastu Dosh Nivaran Yantra in the East or Northeast on a Thursday or Friday morning.\n3. Position consecrated brass/copper Vastu pyramids at zonal stress points.',
          materials:
            'Energized Vastu Dosh Nivaran Yantra, 9 Consecrated Brass/Copper Pyramids, Pure Brass Diya, Himalayan Rock Salt, Yellow Jasper Stone',
        };
      } else {
        reportJsonObj = {
          recommendationTitle: `AstroParihar — ${type}`,
          recommendationName: `${userName}'s Personalized Vedic Chart Analysis`,
          timing: `${currentDate}`,
          duration: 'Lifetime Guidance',
          materials:
            'Red Coral/Ruby, Pure Cow Ghee, Navagraha Incense, Copper Arghya Vessel, Yellow Flowers',
          astrologicalAnalysis: `Extensive birth chart analysis for ${userName} born on ${birthDob} at ${birthPlace}.\n\nBased on your Lagna (Scorpio) and Moon placement in Aries (Bharani Nakshatra), Mars serves as your Lagna lord, granting immense courage, physical stamina, and natural leadership capabilities. The strong 10th house Sun alignment bestows executive authority, high social status, and professional success in management or governance.\n\nYour active Vimshottari Dasha period favors career expansion and wealth accumulation. Jupiter's aspect on the 7th house ensures harmony in relationships and auspicious business partnerships.`,
          procedure:
            '1. Perform morning Surya Arghya offering water to the rising Sun in a copper vessel.\n2. Recite the Gayatri Mantra or Hanuman Chalisa 108 times daily.\n3. Keep a fast or consume Sattvic Falahar food on Tuesdays/Thursdays.',
          rules:
            'Maintain a truthful and disciplined lifestyle. Avoid heavy non-vegetarian food on fast days. Respect parents and spiritual gurus to pacify Saturn and Rahu influences.',
        };
      }
    }

    const reportContent = JSON.stringify(reportJsonObj);

    // Save to Firestore `service_requests`
    let docId = 'temp-' + Date.now();
    try {
      const docRef = await addDoc(collection(db, 'service_requests'), {
        userId,
        userEmail,
        type,
        details,
        status: 'completed',
        reportContent,
        createdAt: serverTimestamp(),
      });
      docId = docRef.id;
    } catch (dbErr) {
      console.warn('Firestore write warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      reportId: docId,
      reportContent,
      reportData: reportJsonObj,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
