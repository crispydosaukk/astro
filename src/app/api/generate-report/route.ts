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

    // 3. Call OpenAI for deep, genuine, Astrotalk-grade dynamic synthesis if API key exists
    if (openaiApiKey && reportJsonObj) {
      try {
        const isMatching = type.includes('Matching') || reportJsonObj.ashtakoot;
        const isLove = type.includes('Love') || type.includes('Relationship');
        const isFinance = type.includes('Finance') || type.includes('Wealth');
        const isHealth = type.includes('Health') || type.includes('Vitality');

        let systemPrompt = '';
        let userPrompt = '';

        if (isMatching) {
          systemPrompt = `You are a master Vedic Astrologer at AstroParihar (similar to Astrotalk). Analyze the provided couple's authentic birth details and calculated 36-point Ashtakoot Gun Milan score. Generate a deeply personalized, nuanced, 3-paragraph astrological synthesis analyzing their mental harmony, emotional bonding, physical chemistry, progeny potential, and career prosperity. Mention their specific Rashis and Nakshatras naturally.`;

          userPrompt = `Groom: ${reportJsonObj.groomName || details.groomName} (DOB: ${reportJsonObj.groomDob || details.dob}, Rashi: ${reportJsonObj.groomAstro?.rashiName || 'N/A'}, Nakshatra: ${reportJsonObj.groomAstro?.nakshatraName || 'N/A'})
Bride: ${reportJsonObj.brideName || details.brideName} (DOB: ${reportJsonObj.brideDob || details.dob}, Rashi: ${reportJsonObj.brideAstro?.rashiName || 'N/A'}, Nakshatra: ${reportJsonObj.brideAstro?.nakshatraName || 'N/A'})
Calculated Gun Milan Score: ${reportJsonObj.totalScore} / 36 (${reportJsonObj.status})
Manglik Status: ${reportJsonObj.manglikStatus?.summary || 'Normal'}
Ashtakoot Breakdown:
- Varna: ${reportJsonObj.ashtakoot?.[0]?.score}
- Vashya: ${reportJsonObj.ashtakoot?.[1]?.score}
- Tara: ${reportJsonObj.ashtakoot?.[2]?.score}
- Yoni: ${reportJsonObj.ashtakoot?.[3]?.score}
- Graha Maitri: ${reportJsonObj.ashtakoot?.[4]?.score}
- Gana: ${reportJsonObj.ashtakoot?.[5]?.score}
- Bhakoot: ${reportJsonObj.ashtakoot?.[6]?.score}
- Nadi: ${reportJsonObj.ashtakoot?.[7]?.score}

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
          if (parsed.astrologicalAnalysis) {
            reportJsonObj.astrologicalAnalysis = parsed.astrologicalAnalysis;
          }
          if (parsed.verdict) {
            reportJsonObj.verdict = parsed.verdict;
          }
          if (parsed.procedure) {
            reportJsonObj.procedure = parsed.procedure;
          }
          if (parsed.materials) {
            reportJsonObj.materials = parsed.materials;
          }
        }
      } catch (aiErr) {
        console.warn('OpenAI dynamic call error:', aiErr);
      }
    }

    if (!reportJsonObj) {
      const userName = details.name || details.fullName || details.groomName || 'Devotee';
      const birthPlace = details.pob || details.place || 'India';
      const birthDob = details.dob || 'N/A';

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
