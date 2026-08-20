import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { calculateAshtakootGunMilan } from '@/lib/vedicAstrologyEngine';

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
        reportJsonObj = typeof clientReportContent === 'string' ? JSON.parse(clientReportContent) : clientReportContent;
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

    const isVastu = type.toLowerCase().includes('vastu') || type.toLowerCase().includes('vāstu') || type.toLowerCase().includes('spatial');

    // 3. Call OpenAI for deep, genuine, Astrotalk-grade dynamic synthesis if API key exists
    if (openaiApiKey) {
      try {
        const isMatching = type.includes('Matching') || reportJsonObj?.ashtakoot;
        const isLove = type.includes('Love') || type.includes('Relationship');
        const isFinance = type.includes('Finance') || type.includes('Wealth');
        const isHealth = type.includes('Health') || type.includes('Vitality');
        const isKundli = type.includes('Kundli') || type.includes('Horoscope') || type.includes('Janam');

        let systemPrompt = '';
        let userPrompt = '';

        if (isVastu) {
          systemPrompt = `You are a grandmaster Vedic Vastu Shastra architect and classical Astrologer at AstroParihar. Given property details (Property Type, Main Entrance Facing Direction, Primary Concern, Kitchen location, Master Bedroom location, Puja room location, Washroom/Toilet location, Owner Name, DOB, and Property City), generate a deeply authentic, rigorous, and room-by-room Vastu Shastra consultation report. Include directional energy analysis for all 8 cardinal & ordinal directions (North, Northeast, East, Southeast, South, Southwest, West, Northwest), identify critical elemental clashes/doshas (e.g. Fire in Water, Missing corners), and prescribe 100% NON-DEMOLITION Vedic remedies (Copper Pyramids, Vastu Dosh Nivaran Yantras, Brass/Copper element strips, lighting, color therapy, and sacred plant/gem placements).`;

          userPrompt = `Service: Vedic Vastu Shastra Consultation Report
Owner/Resident Name: ${details.name || details.fullName || 'Devotee'}
Property Type: ${details.propertyType || 'Residential Apartment'}
Main Entrance Facing: ${details.entranceFacing || 'North-East'}
Primary Concern: ${details.primaryConcern || 'Financial Growth & Family Harmony'}
Kitchen Location: ${details.kitchenLocation || 'South-East (Agni Zone)'}
Master Bedroom Location: ${details.masterBedroomLocation || 'South-West (Nairruti Zone)'}
Puja Room / Mandir Location: ${details.pujaLocation || 'North-East (Ishanya Zone)'}
Toilet / Washroom Location: ${details.toiletLocation || 'North-West (Vayu Zone)'}
Owner DOB: ${details.dob || 'N/A'}, Time: ${details.time || details.tob || '12:00 PM'}, City/Place: ${details.place || details.pob || 'India'}
Current Date: ${currentDate}

Respond ONLY with a JSON object:
{
  "recommendationTitle": "Vedic Vastu Shastra Consultation Report",
  "recommendationName": "${details.name || 'Owner'}'s Property Directional Analysis",
  "timing": "${currentDate}",
  "duration": "Lifetime Space Alignment",
  "propertySummary": {
    "propertyType": "${details.propertyType || 'Residential'}",
    "entranceFacing": "${details.entranceFacing || 'North-East'}",
    "overallEnergyScore": "84/100 (Auspicious with Non-Demolition Rectifications)"
  },
  "astrologicalAnalysis": "Detailed 3-paragraph spatial synthesis analyzing the solar & magnetic energy lines (Jaivik and Pranic flow) across the property, the synergy between the owner's birth chart and the directional zones, and root energetic causes of the primary concern.",
  "directionalAnalysis": [
    { "direction": "North (Kuber Zone)", "status": "Positive", "observation": "Governs wealth inflow and financial opportunities.", "remedy": "Keep clear, place Kubera Yantra or green plant." },
    { "direction": "North-East (Ishan Zone)", "status": "Divine Energy", "observation": "Head of Vastu Purusha, governs mental clarity and wisdom.", "remedy": "Establish water fountain or pure copper Gangajal vessel." },
    { "direction": "East (Surya Zone)", "status": "Good Flow", "observation": "Governs physical vitality and social status.", "remedy": "Hang energized Surya Yantra or allow morning light." },
    { "direction": "South-East (Agni Zone)", "status": "Fire Balance", "observation": "Governs metabolic health, liquidity, and passion.", "remedy": "Keep warm lighting and avoid water placement." },
    { "direction": "South (Yama Zone)", "status": "Stable", "observation": "Governs discipline, law, and structural safety.", "remedy": "Keep heavy furniture and earth elements." },
    { "direction": "South-West (Nairruti Zone)", "status": "Master Foundation", "observation": "Governs marital bonds, leadership stability, and grounding.", "remedy": "Heaviest zone with warm earthy yellow tones. Zero cuts or borewells." },
    { "direction": "West (Varuna Zone)", "status": "Gains & Rewards", "observation": "Governs consistent returns on effort and profitability.", "remedy": "Place metal accents or white decor." },
    { "direction": "North-West (Vayavya Zone)", "status": "Movement & Support", "observation": "Governs banking support, communication, and helpful people.", "remedy": "Keep well-ventilated with light white/silver tones." }
  ],
  "doshaCorrections": [
    "1. Non-Demolition Kitchen Rectification: Balance fire-water clashes using a Green Baroda marble slab or copper pyramid.",
    "2. Entrance Protection: Install a consecrated brass Trishakti / Swastika yantra above the main door frame.",
    "3. Spatial Grounding: Place natural rock salt bowls in washroom corners to absorb stagnant energy."
  ],
  "procedure": "1. Conduct directional purification with Guggul and Camphor smoke.\\n2. Install energized Vastu Dosh Nivaran Yantra facing East on an auspicious Thursday/Friday.\\n3. Place copper/brass pyramids at identified zonal stress points.",
  "materials": "Energized Vastu Dosh Nivaran Yantra, 9 Consecrated Brass/Copper Vastu Pyramids, Pure Brass Diya, Rock Salt, Yellow Jasper Stones"
}`;
        } else if (isKundli && !isLove && !isFinance && !isHealth) {
          systemPrompt = `You are a world-class master Vedic Astrologer at AstroParihar (similar to Astrotalk). When given birth details (Name, DOB, Time, Place, Gender), compute a deep, authentic, personalized Vedic Janam Kundli horoscope reading covering Lagna traits, active Dasha, Raja/Dhana yogas, career, finances, marriage, and health with genuine Vedic remedies.`;
          userPrompt = `Service: Free Vedic Janam Kundli & Horoscope
Name: ${details.name || details.fullName || 'Devotee'}
Gender: ${details.gender || 'N/A'}
DOB: ${details.dob || 'N/A'}, Time: ${details.time || details.tob || '12:00 PM'}, Place: ${details.place || details.pob || 'India'}
Current Date: ${currentDate}

Respond ONLY with a JSON object:
{
  "astrologicalAnalysis": "Detailed 3-paragraph personalized birth chart reading detailing Lagna ascendant, Moon sign, planetary powerhouses, current Vimshottari Mahadasha timeline, and life path.",
  "predictions": {
    "career": "2-3 sentences specific career growth and favorable professional fields.",
    "finance": "2-3 sentences wealth potential, Dhana yogas, and investment windows.",
    "marriage": "2-3 sentences 7th house Kalatra spouse characteristics and relationship harmony.",
    "health": "2-3 sentences physical vitality, immunity, and ayurvedic balance."
  },
  "procedure": "1. Daily Surya Arghya in a copper vessel at sunrise\\n2. Chanting Gayatri Mantra or Maha Mrityunjaya Mantra 108 times\\n3. Tuesday or Thursday charity of yellow lentils / bananas.",
  "materials": "Recommended personalized gemstone (e.g. Red Coral/Yellow Sapphire), copper vessel, pure cow ghee lamp"
}`;
        } else if (isMatching) {
          systemPrompt = `You are a master Vedic Astrologer at AstroParihar (similar to Astrotalk). Analyze the provided couple's authentic birth details and calculated 36-point Ashtakoot Gun Milan score. Generate a deeply personalized, nuanced, 3-paragraph astrological synthesis analyzing their mental harmony, emotional bonding, physical chemistry, progeny potential, and career prosperity. Mention their specific Rashis and Nakshatras naturally.`;

          userPrompt = `Groom: ${reportJsonObj?.groomName || details.groomName} (DOB: ${reportJsonObj?.groomDob || details.dob}, Rashi: ${reportJsonObj?.groomAstro?.rashiName || 'N/A'}, Nakshatra: ${reportJsonObj?.groomAstro?.nakshatraName || 'N/A'})
Bride: ${reportJsonObj?.brideName || details.brideName} (DOB: ${reportJsonObj?.brideDob || details.dob}, Rashi: ${reportJsonObj?.brideAstro?.rashiName || 'N/A'}, Nakshatra: ${reportJsonObj?.brideAstro?.nakshatraName || 'N/A'})
Calculated Gun Milan Score: ${reportJsonObj?.totalScore} / 36 (${reportJsonObj?.status})
Manglik Status: ${reportJsonObj?.manglikStatus?.summary || 'Normal'}
Ashtakoot Breakdown:
- Varna: ${reportJsonObj?.ashtakoot?.[0]?.score}
- Vashya: ${reportJsonObj?.ashtakoot?.[1]?.score}
- Tara: ${reportJsonObj?.ashtakoot?.[2]?.score}
- Yoni: ${reportJsonObj?.ashtakoot?.[3]?.score}
- Graha Maitri: ${reportJsonObj?.ashtakoot?.[4]?.score}
- Gana: ${reportJsonObj?.ashtakoot?.[5]?.score}
- Bhakoot: ${reportJsonObj?.ashtakoot?.[6]?.score}
- Nadi: ${reportJsonObj?.ashtakoot?.[7]?.score}

Respond ONLY with a JSON object in this exact format:
{
  "astrologicalAnalysis": "Detailed 3-paragraph personalized astrological synthesis covering emotional/mental bond, career growth after marriage, and recommended pre-marital Vedic rituals or pujas.",
  "verdict": "A concise 2-sentence executive summary of the marital compatibility."
}`;
        } else if (isLove) {
          systemPrompt = `You are a master Vedic Astrologer at AstroParihar specializing in Love, Romance, 7th House Kalatra Bhava, and Venusian Relationship Yogas. Generate a deeply personalized, compassionate, and precise Love & Relationship Vedic forecast.`;
          userPrompt = `Service: Love & Relationship Horoscope
Name: ${details.name || details.fullName || 'Devotee'}
Gender: ${details.gender || 'N/A'}
DOB: ${details.dob || 'N/A'}, Time: ${details.time || details.tob || '12:00 PM'}, Place: ${details.place || details.pob || 'India'}
Status: ${details.relationshipStatus || 'Seeking Insights'}
Current Date: ${currentDate}

Respond ONLY with a JSON object:
{
  "astrologicalAnalysis": "Detailed 3-paragraph analysis of 7th house (Kalatra), 5th house (Romance), Venus (Shukra) placement, Manglik balance, marriage timing window, and emotional harmony.",
  "procedure": "1. Chanting Shukra Beej Mantra (Om Shum Shukraya Namah) on Friday mornings\\n2. Offering white fragrant flowers or kheer at Lakshmi Narayan temple\\n3. Friday fasting guidelines for marital blessing.",
  "materials": "White Zircon / Diamond / Rose Quartz, pure cow ghee, white lotus or jasmine flowers"
}`;
        } else if (isFinance) {
          systemPrompt = `You are a master Vedic Astrologer at AstroParihar specializing in Wealth (Dhana Bhava - 2nd House), Profit (Labha Bhava - 11th House), Fortune (Bhagya - 9th House), and Jupiterian/Mercurial Wealth Yogas. Generate a highly actionable, encouraging, and detailed Financial Astrology forecast.`;
          userPrompt = `Service: Finance & Wealth Horoscope
Name: ${details.name || details.fullName || 'Devotee'}
Gender: ${details.gender || 'N/A'}
DOB: ${details.dob || 'N/A'}, Time: ${details.time || details.tob || '12:00 PM'}, Place: ${details.place || details.pob || 'India'}
Category: ${details.careerCategory || 'General Wealth'}
Current Date: ${currentDate}

Respond ONLY with a JSON object:
{
  "astrologicalAnalysis": "Detailed 3-paragraph breakdown of 2nd House savings, 11th House income growth, Jupiter (Dhanakaraka) strength, Mercury business intelligence, favorable investment timing, and debt elimination strategies.",
  "procedure": "1. Daily morning recitation of Sri Kanakadhara Stotram\\n2. Establishing energized Kubera / Shree Yantra in North direction\\n3. Thursday charity of yellow pulses/bananas to Brahmins or students.",
  "materials": "Energized Kubera Yantra, Yellow Sapphire / Emerald, pure brass lamp, turmeric and akshat"
}`;
        } else if (isHealth) {
          systemPrompt = `You are a master Vedic Astrologer & Medical Astrologer (Ayur-Jyotish) at AstroParihar analyzing 1st House Lagna vitality, 6th House Roga Bhava, 8th House Longevity, and Ayurvedic Tridosha balance (Vata/Pitta/Kapha). Generate a caring, holistic, and reassuring Health & Vitality forecast.`;
          userPrompt = `Service: Health & Vitality Horoscope
Name: ${details.name || details.fullName || 'Devotee'}
Gender: ${details.gender || 'N/A'}
DOB: ${details.dob || 'N/A'}, Time: ${details.time || details.tob || '12:00 PM'}, Place: ${details.place || details.pob || 'India'}
Focus: ${details.healthFocus || 'Overall Vitality'}
Current Date: ${currentDate}

Respond ONLY with a JSON object:
{
  "astrologicalAnalysis": "Detailed 3-paragraph analysis of Lagna vitality, Sun/Moon mental-physical balance, 6th house immunity resilience, Ayurvedic element alignment, and stress prevention recommendations.",
  "procedure": "1. Chanting Maha Mrityunjaya Mantra 108 times at sunrise\\n2. Offering water (Arghya) to Surya Dev in a copper vessel\\n3. Daily Pranayama and herbal Sattvic diet alignment.",
  "materials": "Energized Panchmukhi Rudraksha, copper Kalash, sacred Bilva leaves, pure sesame oil lamp"
}`;
        } else {
          systemPrompt = `You are a master Vedic Astrologer at AstroParihar (similar to Astrotalk). Generate a highly personalized Vedic astrology analysis and remedial guidance for this individual.`;
          userPrompt = `Service: ${type}
Name: ${details.name || details.fullName || 'Devotee'}
DOB: ${details.dob || 'N/A'}, Time: ${details.time || details.tob || '12:00 PM'}, Place: ${details.place || details.pob || 'India'}
Current Date: ${currentDate}

Respond ONLY with a JSON object:
{
  "astrologicalAnalysis": "Detailed 3-paragraph breakdown of Lagna, Moon rashi, key planetary yogas, and career/finance/health forecast.",
  "procedure": "1. Morning Surya Arghya\\n2. Chanting personal Ishta mantra 108 times\\n3. Tuesday/Thursday fasting guidelines.",
  "materials": "Specific recommended gemstone, copper vessel, ghee lamp, yellow flowers"
}`;
        }

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
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
          }),
        });

        if (openAiRes.ok) {
          const aiJson = await openAiRes.json();
          const parsed = JSON.parse(aiJson.choices[0].message.content);
          if (!reportJsonObj) reportJsonObj = {};
          
          if (parsed.recommendationTitle) reportJsonObj.recommendationTitle = parsed.recommendationTitle;
          if (parsed.recommendationName) reportJsonObj.recommendationName = parsed.recommendationName;
          if (parsed.propertySummary) reportJsonObj.propertySummary = parsed.propertySummary;
          if (parsed.directionalAnalysis) reportJsonObj.directionalAnalysis = parsed.directionalAnalysis;
          if (parsed.doshaCorrections) reportJsonObj.doshaCorrections = parsed.doshaCorrections;
          if (parsed.astrologicalAnalysis) reportJsonObj.astrologicalAnalysis = parsed.astrologicalAnalysis;
          if (parsed.predictions) {
            reportJsonObj.predictions = {
              ...reportJsonObj.predictions,
              ...parsed.predictions,
            };
          }
          if (parsed.verdict) reportJsonObj.verdict = parsed.verdict;
          if (parsed.procedure) reportJsonObj.procedure = parsed.procedure;
          if (parsed.materials) reportJsonObj.materials = parsed.materials;
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
            { direction: 'North (Kuber Zone)', status: 'Positive', observation: 'Governs liquid cash and new growth opportunities.', remedy: 'Place Kubera Yantra or green indoor plants.' },
            { direction: 'North-East (Ishanya Zone)', status: 'Divine Energy', observation: 'Head of Vastu Purusha, governs mental peace and wisdom.', remedy: 'Keep pristine and clutter-free. Establish pure water/Gangajal bowl.' },
            { direction: 'East (Surya Zone)', status: 'Vital Energy', observation: 'Governs reputation, life force, and social connections.', remedy: 'Ensure morning sunlight enters unobstructed.' },
            { direction: 'South-East (Agni Zone)', status: 'Active Fire', observation: 'Governs metabolic fire, kitchen balance, and vitality.', remedy: 'Maintain warm golden lighting; avoid blue tones or water storage.' },
            { direction: 'South (Yama Zone)', status: 'Stable', observation: 'Governs career authority, discipline, and endurance.', remedy: 'Keep heavier than North/East zones.' },
            { direction: 'South-West (Nairruti Zone)', status: 'Master Foundation', observation: 'Governs relationship bonding and overall property grounding.', remedy: 'Use earthy yellow tones and heavy brass elements. Zero underground water.' },
            { direction: 'West (Varuna Zone)', status: 'Gains & Profits', observation: 'Governs consistent returns on effort and emotional balance.', remedy: 'Ideal for study or metallic accents.' },
            { direction: 'North-West (Vayavya Zone)', status: 'Air Movement', observation: 'Governs social support, bank relationships, and mobility.', remedy: 'Keep well-ventilated with white or silver accents.' },
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
          materials: 'Red Coral/Ruby, Pure Cow Ghee, Navagraha Incense, Copper Arghya Vessel, Yellow Flowers',
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
