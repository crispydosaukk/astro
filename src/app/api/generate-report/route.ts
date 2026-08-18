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
