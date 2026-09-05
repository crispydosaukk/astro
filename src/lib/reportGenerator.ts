import { calculateAshtakootGunMilan, calculateBirthChartData } from '@/lib/vedicAstrologyEngine';
import { getAIPromptSettings, AIPromptItem } from '@/lib/aiPromptSettings';
import { getServerOpenAIApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';
import { resolveVedicRemedies, ASTROPARIHAR_HOMAMS } from '@/lib/vedicRemediesEngine';

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

  // 1b. If Janam Kundli / Horoscope report, ensure precision astronomical birth chart is computed
  if (
    (!reportJsonObj || !reportJsonObj.ascendant) &&
    (typeLower.includes('kundli') ||
      typeLower.includes('horoscope') ||
      typeLower.includes('birth chart') ||
      serviceIdLower.includes('kundli') ||
      serviceIdLower.includes('horoscope'))
  ) {
    const chart = calculateBirthChartData(
      details.dob || '1995-01-01',
      details.time || details.tob || '12:00 PM',
      details.place || details.pob || 'India',
      details.lat || '28.6139',
      details.lon || '77.2090',
      userName,
      details.gender || 'Male'
    );

    reportJsonObj = {
      recommendationTitle: 'Vedic Janam Kundli & Horoscope Reading',
      recommendationName: `${userName}'s Personalized Vedic Chart Analysis`,
      timing: `Generated on ${currentDate}`,
      duration: 'Lifetime Vedic Insights',
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
    };
  }

  // 2. Fetch Server OpenAI API Key
  const openaiApiKey = await getServerOpenAIApiKey();

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

        // Normalize remedies outputs to ensure 100% parity with AstroParihar canonical catalogue
        if (isHomam) {
          const resolved = resolveVedicRemedies({
            concern: details.primaryConcern || details.userQuery || details.focus || type,
            domain: details.category || type,
            name: userName,
          });
          const canonical = resolved.primaryHomam;
          if (!reportJsonObj.recommendedHoma || typeof reportJsonObj.recommendedHoma === 'string') {
            let homaName = canonical.name;
            if (typeof reportJsonObj.recommendedHoma === 'string' && reportJsonObj.recommendedHoma.length > 5) {
              const strLower = reportJsonObj.recommendedHoma.toLowerCase();
              const baseCanonical = canonical.id.toLowerCase();
              if (
                strLower.includes(baseCanonical) ||
                (baseCanonical === 'lakshmi_kubera' && (strLower.includes('lakshmi') || strLower.includes('kubera'))) ||
                (baseCanonical === 'ganapathi' && (strLower.includes('ganapathi') || strLower.includes('ganesh'))) ||
                (baseCanonical === 'mrityunjaya' && (strLower.includes('mrityunjaya') || strLower.includes('shiva'))) ||
                (baseCanonical === 'sudarshana' && (strLower.includes('sudarshana') || strLower.includes('narasimha'))) ||
                (baseCanonical === 'ayush' && strLower.includes('ayush'))
              ) {
                homaName = reportJsonObj.recommendedHoma;
              }
            }

            reportJsonObj.recommendedHoma = {
              name: homaName,
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
          } else if (typeof reportJsonObj.recommendedHoma === 'object') {
            reportJsonObj.recommendedHoma = {
              ...canonical,
              ...reportJsonObj.recommendedHoma,
            };
          }
        }

        if (isMantra) {
          const resolved = resolveVedicRemedies({
            concern: details.primaryConcern || details.userQuery || details.focus || type,
            domain: details.category || type,
            name: userName,
          });
          const canonicalMantra = resolved.primaryMantra;
          if (!reportJsonObj.prescribedMantras || !Array.isArray(reportJsonObj.prescribedMantras) || reportJsonObj.prescribedMantras.length === 0) {
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
          } else {
            reportJsonObj.prescribedMantras = reportJsonObj.prescribedMantras.map((m: any, idx: number) => {
              const fallbackM = idx === 0 ? canonicalMantra : resolved.secondaryMantra;
              return {
                title: m.title || fallbackM.title,
                sanskrit: m.sanskrit || fallbackM.sanskrit,
                transliteration: m.transliteration || fallbackM.transliteration,
                japaCount: m.japaCount || fallbackM.japaCount,
                bestTime: m.bestTime || fallbackM.bestTime,
                mala: m.mala || fallbackM.mala,
                benefits: m.benefits || fallbackM.benefits,
              };
            });
          }
        }

        if (isGemstone) {
          const resolved = resolveVedicRemedies({
            concern: details.primaryConcern || details.userQuery || details.focus || type,
            domain: details.category || type,
            name: userName,
          });
          const canonicalGem = resolved.gemstone;
          if (!reportJsonObj.primaryGemstone) {
            reportJsonObj.primaryGemstone = canonicalGem;
          } else if (typeof reportJsonObj.primaryGemstone === 'string') {
            reportJsonObj.primaryGemstone = {
              name: reportJsonObj.primaryGemstone,
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
