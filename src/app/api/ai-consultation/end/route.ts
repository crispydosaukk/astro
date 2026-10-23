import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { AIConsultationSummary } from '@/lib/aiAstrologerData';
import { safeParseAIJson } from '@/lib/aiResponseParser';
import { fetchWithOpenAIFallback, getServerOpenAIApiKey } from '@/lib/aiConfig';
import { calculateBirthChartData, formatChartSummaryForAI } from '@/lib/vedicAstrologyEngine';
import { resolveVedicRemedies, ASTROPARIHAR_UNIFIED_REMEDY_DIRECTIVES } from '@/lib/vedicRemediesEngine';

export async function POST(req: Request) {
  try {
    const { sessionId, durationSeconds = 60, conversationTranscript = [], lastPrescribedRemedy = null } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const sessionRef = adminDb.collection('ai_consultations').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    const birthDetails = sessionData?.birthDetails || {};
    let astroContext = sessionData?.astroContext || null;
    const primaryConcern = birthDetails.primaryConcern || 'General Life Guidance';
    const astrologerName = sessionData?.astrologerName || 'Acharya';
    const discipline = sessionData?.primaryDiscipline || 'Vedic Jyotish';
    const language = sessionData?.language || 'English';

    let ishtaDevata = astroContext?.ishtaDevata || null;
    let canonicalRemedies = astroContext?.canonicalRemedies || null;

    // Compute genuine birth chart if astroContext or ishtaDevata is missing
    if (birthDetails.dob && (!astroContext || !ishtaDevata || !canonicalRemedies)) {
      try {
        const chart = calculateBirthChartData(
          birthDetails.dob,
          birthDetails.time || '12:00 PM',
          birthDetails.place || 'India',
          birthDetails.lat,
          birthDetails.lon,
          birthDetails.name || 'Devotee',
          birthDetails.gender || 'Male'
        );
        ishtaDevata = chart.ishtaDevata;
        canonicalRemedies = resolveVedicRemedies({
          concern: primaryConcern,
          lagna: chart.ascendant,
          moonRashi: chart.moonSign,
          dasha: `${chart.dasha.currentMahadasha} - ${chart.dasha.currentAntardasha}`,
          name: birthDetails.name || 'Devotee',
        });
        astroContext = {
          ...astroContext,
          lagna: chart.ascendant,
          moonRashi: chart.moonSign,
          nakshatra: chart.nakshatra,
          sunSign: chart.sunSign,
          currentDasha: `${chart.dasha.currentMahadasha} - ${chart.dasha.currentAntardasha}`,
          chartSummary: formatChartSummaryForAI(chart),
          ishtaDevata,
          canonicalRemedies,
        };
      } catch (err) {
        console.warn('Dynamic chart calculation in end route warning:', err);
      }
    }

    if (!canonicalRemedies) {
      canonicalRemedies = resolveVedicRemedies({
        concern: primaryConcern,
        name: birthDetails.name || 'Devotee',
      });
    }

    // Check for remedies prescribed during the live voice/chat consultation session
    const storedRemedies = sessionData?.prescribedRemedies || [];
    const lastPrescribed = sessionData?.lastPrescribedRemedy || null;

    const transcriptText = Array.isArray(conversationTranscript)
      ? conversationTranscript
          .map((t: any) => `${t.role === 'user' ? 'Devotee' : astrologerName}: ${t.content || t.text}`)
          .join('\n')
      : '';

    // Detect if a specific remedy was advised during the live conversation
    let sessionMatchedRemedy = lastPrescribedRemedy || lastPrescribed || (storedRemedies.length > 0 ? storedRemedies[storedRemedies.length - 1] : null);

    if (!sessionMatchedRemedy && transcriptText) {
      const lower = transcriptText.toLowerCase();
      if (
        lower.includes('ganapathi') ||
        lower.includes('గణపతి') ||
        lower.includes('गणपति') ||
        lower.includes('career') ||
        lower.includes('job') ||
        lower.includes('ఉద్యోగ') ||
        lower.includes('promotion') ||
        lower.includes('business') ||
        lower.includes('వ్యాపార')
      ) {
        sessionMatchedRemedy = {
          type: 'homam',
          title: 'Maha Ganapathi Homam (మహా గణపతి హోమం)',
          instructions: 'Perform on Wednesday or Shukla Chaturthi at sunrise with Modakam and Durva grass to clear hurdles.',
          mantraTitle: 'Ganesh Maha Mantra',
          mantraInstructions: 'Chant "Om Gam Ganapataye Namaha" 108 times daily before work.',
          topic: 'Career & Business Growth',
        };
      } else if (
        lower.includes('lakshmi') ||
        lower.includes('kubera') ||
        lower.includes('లక్ష్మీ') ||
        lower.includes('finance') ||
        lower.includes('money') ||
        lower.includes('wealth') ||
        lower.includes('debt') ||
        lower.includes('loan') ||
        lower.includes('ధన') ||
        lower.includes('అప్పు') ||
        lower.includes('कर्ज')
      ) {
        sessionMatchedRemedy = {
          type: 'homam',
          title: 'Lakshmi Kubera Homam (శ్రీ లక్ష్మీ కుబేర హోమం)',
          instructions: 'Perform on Friday sunrise with lotus petals and cow ghee for financial abundance.',
          mantraTitle: 'Maha Lakshmi Mantra & Kanakadhara Stotram',
          mantraInstructions: 'Chant "Om Shreem Hreem Kleem Mahalakshmaye Namah" 108 times on Fridays.',
          topic: 'Wealth & Financial Growth',
        };
      } else if (
        lower.includes('swayamvara') ||
        lower.includes('parvathi') ||
        lower.includes('marriage') ||
        lower.includes('vivaha') ||
        lower.includes('wedding') ||
        lower.includes('వివాహ') ||
        lower.includes('పెళ్లి') ||
        lower.includes('శాదీ') ||
        lower.includes('शादी')
      ) {
        sessionMatchedRemedy = {
          type: 'homam',
          title: 'Swayamvara Parvathi Homam (స్వయంవర పార్వతి హోమం)',
          instructions: 'Perform on Friday or Shukla Panchami with yellow flowers and pure ghee to dissolve marriage delays.',
          mantraTitle: 'Swayamvara Parvathi Maha Mantra',
          mantraInstructions: 'Chant the sacred Swayamvara Parvathi Mantra 108 times daily for matrimonial bliss.',
          topic: 'Marriage & Relationship Harmony',
        };
      } else if (
        lower.includes('mrityunjaya') ||
        lower.includes('health') ||
        lower.includes('illness') ||
        lower.includes('disease') ||
        lower.includes('ఆరోగ్య') ||
        lower.includes('మృత్యుంజయ') ||
        lower.includes('स्वास्थ्य') ||
        lower.includes('रोग')
      ) {
        sessionMatchedRemedy = {
          type: 'homam',
          title: 'Maha Mrityunjaya Homam (మహా మృత్యుంజయ హోమం)',
          instructions: 'Perform on Monday at sunrise with Bilva leaves, milk, and cow ghee for health rejuvenation.',
          mantraTitle: 'Maha Mrityunjaya Mantra',
          mantraInstructions: 'Chant "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam" 108 times daily.',
          topic: 'Health & Vitality',
        };
      } else if (
        lower.includes('sudarshana') ||
        lower.includes('protection') ||
        lower.includes('evil eye') ||
        lower.includes('drishti') ||
        lower.includes('రక్షణ') ||
        lower.includes('దిష్టి') ||
        lower.includes('సుదర్శన') ||
        lower.includes('सुरक्षा')
      ) {
        sessionMatchedRemedy = {
          type: 'homam',
          title: 'Sudarshana Homam (శ్రీ సుదర్శన హోమం)',
          instructions: 'Perform on Wednesday or Ekadashi with Tulasi leaves and cow ghee for supreme spiritual protection.',
          mantraTitle: 'Sudarshana Maha Mantra',
          mantraInstructions: 'Chant "Om Kleem Krishnaya Govindaya Gopijana Vallabhaya Paraya Paramatmane" daily.',
          topic: 'Protection & Evil Eye Shielding',
        };
      }
    }

    // Guarantee that canonicalRemedies matches the exact in-session advice!
    if (sessionMatchedRemedy) {
      canonicalRemedies.primaryHomam = {
        ...canonicalRemedies.primaryHomam,
        name: sessionMatchedRemedy.title,
        day: sessionMatchedRemedy.instructions?.split('Perform on ')?.[1]?.split(' with ')?.[0] || canonicalRemedies.primaryHomam.day,
        ahutiMantra: sessionMatchedRemedy.mantraInstructions || canonicalRemedies.primaryHomam.ahutiMantra,
      };
      canonicalRemedies.primaryMantra = {
        ...canonicalRemedies.primaryMantra,
        title: sessionMatchedRemedy.mantraTitle,
        transliteration: sessionMatchedRemedy.mantraInstructions || canonicalRemedies.primaryMantra.transliteration,
      };
    }

    // 1. Fetch dynamic OpenAI API Key
    const openaiApiKey = await getServerOpenAIApiKey();

    // Default High-Quality Astrology Summary fallback (Used when OpenAI is unavailable or out of quota)
    let summary: AIConsultationSummary = {
      overview: `Divine consultation completed with ${astrologerName} (${discipline}) for ${birthDetails.name || 'Devotee'}. Explored key planetary influences around ${sessionMatchedRemedy?.topic || primaryConcern}, analyzing active Dasha and transits in ${language}. Prescribed ${canonicalRemedies.primaryHomam.name} and ${canonicalRemedies.primaryMantra.title}.`,
      astrologicalHighlights: [
        `Ascendant (Lagna) is ${astroContext?.lagna || 'favorably aligned'}, conferring intellectual resilience and personal capacity.`,
        `Current Mahadasha period (${astroContext?.currentDasha || 'active cycle'}) is initiating a pivotal transition phase favoring long-term stability.`,
        `Benefic planetary rays protect the house of prosperity, neutralizing minor transit delays.`,
      ],
      timelinePredictions: [
        `Next 3-6 Months: Key decision crossroads with favorable resolution in personal and career planning.`,
        `Upcoming 12 Months: Auspicious window for personal milestones, domestic harmony, and fruitful investments.`,
      ],
      recommendedRemedies: [
        {
          type: 'homam',
          title: canonicalRemedies.primaryHomam.name,
          instructions: `Perform on ${canonicalRemedies.primaryHomam.day}. Offering: ${canonicalRemedies.primaryHomam.samidha}. Ahuti Mantra: ${canonicalRemedies.primaryHomam.ahutiMantra}.`,
        },
        {
          type: 'mantra',
          title: canonicalRemedies.primaryMantra.title,
          instructions: `Chant "${canonicalRemedies.primaryMantra.transliteration}" ${canonicalRemedies.primaryMantra.japaCount} at ${canonicalRemedies.primaryMantra.bestTime} with ${canonicalRemedies.primaryMantra.mala}.`,
        },
        {
          type: 'ishta_devata',
          title: `Ishta Devata Upasana: ${ishtaDevata ? ishtaDevata.deityName : 'Personal Divine Guardian'}`,
          instructions: ishtaDevata
            ? `Guiding deity indicated by Atmakaraka ${ishtaDevata.atmakarakaPlanet} & 12th from Karakamsa (${ishtaDevata.twelfthSignFromKarakamsa}). Daily mantra: ${ishtaDevata.primaryMantra} on ${ishtaDevata.auspiciousDay}.`
            : 'Perform daily prayer with pure cow ghee lamp at sunrise.',
        },
        {
          type: 'gemstone',
          title: canonicalRemedies.gemstone.name,
          instructions: `Wear on ${canonicalRemedies.gemstone.auspiciousDay} on ${canonicalRemedies.gemstone.finger} after consecration with ${canonicalRemedies.gemstone.mantra}.`,
        },
      ],
      auspiciousDates: [
        'Thursdays during Shukla Paksha',
        'Full Moon (Purnima) evening for prayer',
        'Pushya Nakshatra',
      ],
      panditJiFinalBlessing: `May the supreme cosmic energies and Navagrahas shower peace, good health, and abundant prosperity upon you and your family. Om Shanti Shanti Shanti.`,
    };

    // 2. Synthesize Dynamic OpenAI Summary if API key is active
    if (openaiApiKey) {
      try {
        const currentYear = new Date().getFullYear();
        const systemPrompt = `You are an elite Vedic astrology report generator for AstroParihar.
Real-Time Calendar Anchor: The current year is strictly ${currentYear}. All timeline predictions and astrological highlights must be calculated for ${currentYear} and future years. Never refer to 2024 or 2025 as the current year.
Synthesize a professional, inspiring, and authentic post-consultation astrology summary based on the consultation conducted by ${astrologerName} (${discipline}).
Devotee Details: Name: ${birthDetails.name || 'Devotee'}, DOB: ${birthDetails.dob || 'N/A'}, Time: ${birthDetails.time || 'N/A'}, Place: ${birthDetails.place || 'N/A'}, Concern: ${sessionMatchedRemedy?.topic || primaryConcern}, Language: ${language}.
Calculated Authentic Chart Context:
- Verified Ascendant (Lagna): ${astroContext?.lagna || 'Vedic Ascendant'}
- Moon Sign: ${astroContext?.moonRashi || 'Chandra Rashi'} (${astroContext?.nakshatra || ''})
- Active Vimshottari Dasha: ${astroContext?.currentDasha || 'Active Dasha'}
${astroContext?.chartSummary ? `- House & Planetary Placements:\n${astroContext.chartSummary}` : ''}

CRITICAL CANONICAL REMEDIAL & ISHTA DEVATA GROUND TRUTH:
- In-Session Prescribed Homam: ${canonicalRemedies.primaryHomam.name} (${canonicalRemedies.primaryHomam.day})
- In-Session Prescribed Daily Mantra: ${canonicalRemedies.primaryMantra.title}
- Verified Ishta Devata: ${ishtaDevata ? ishtaDevata.deityName : 'Lord Shiva / Maha Vishnu'} (12th from Karakamsa: ${ishtaDevata?.twelfthSignFromKarakamsa || 'Pisces'})
- Prescribed Gemstone: ${canonicalRemedies.gemstone.name}

Mandatory Rules for "recommendedRemedies":
1. First remedy MUST match the in-session prescribed Homam: "${canonicalRemedies.primaryHomam.name}".
2. Second remedy MUST match the in-session prescribed Mantra: "${canonicalRemedies.primaryMantra.title}".
3. Third remedy MUST be the devotee's verified Ishta Devata: "${ishtaDevata ? ishtaDevata.deityName : 'Personal Divine Guardian'}".

Respond ONLY with a valid JSON object matching this schema:
{
  "overview": "2-3 sentence overview of the astrological consultation reading, referencing their verified ${astroContext?.lagna || 'Lagna'}, active ${astroContext?.currentDasha || 'Dasha'}, and the prescribed ${canonicalRemedies.primaryHomam.name}",
  "astrologicalHighlights": ["Point 1 about verified Lagna and planetary alignment", "Point 2 about active Dasha/houses", "Point 3 about transit energy"],
  "timelinePredictions": ["Prediction 1 with specific timeline in ${currentYear}/${currentYear + 1}", "Prediction 2 with specific timeline"],
  "recommendedRemedies": [
    {"type": "homam", "title": "${canonicalRemedies.primaryHomam.name}", "instructions": "Day, samidha, and ritual instructions"},
    {"type": "mantra", "title": "${canonicalRemedies.primaryMantra.title}", "instructions": "Chanting count, time of day, and purpose"},
    {"type": "ishta_devata", "title": "Ishta Devata: ${ishtaDevata ? ishtaDevata.deityName : 'Personal Divine Guardian'}", "instructions": "Daily prayer, lamp, and worship guidelines"},
    {"type": "gemstone", "title": "${canonicalRemedies.gemstone.name}", "instructions": "Metal, finger, or consecration rule"}
  ],
  "auspiciousDates": ["Favorable day 1", "Favorable day 2"],
  "panditJiFinalBlessing": "A compassionate and uplifting closing spiritual blessing"
}`;

        let openAiRes = await fetchWithOpenAIFallback(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                {
                  role: 'user',
                  content: `Consultation Transcript Context:\n${transcriptText || 'General consultation on ' + primaryConcern}`,
                },
              ],
              temperature: 0.7,
              max_tokens: 1500,
              response_format: { type: 'json_object' },
            }),
          },
          openaiApiKey
        );

        if (openAiRes.ok) {
          const aiJson = await openAiRes.json();
          const parsed = safeParseAIJson(aiJson.choices?.[0]?.message?.content) || {};

          let finalRemedies = Array.isArray(parsed.recommendedRemedies) && parsed.recommendedRemedies.length > 0
            ? parsed.recommendedRemedies
            : summary.recommendedRemedies;

          // Guarantee that the in-session prescribed Homam is always at the top
          const hasInSessionHomam = finalRemedies.some((r: any) =>
            r.title?.toLowerCase().includes(canonicalRemedies.primaryHomam.name.toLowerCase().split(' ')[0])
          );
          if (!hasInSessionHomam) {
            finalRemedies.unshift({
              type: 'homam',
              title: canonicalRemedies.primaryHomam.name,
              instructions: `Auspicious Day: ${canonicalRemedies.primaryHomam.day}. Offering: ${canonicalRemedies.primaryHomam.samidha}.`,
            });
          }

          const hasIshta = finalRemedies.some((r: any) => r.type === 'ishta_devata' || r.title?.toLowerCase().includes('ishta'));
          if (!hasIshta && ishtaDevata) {
            finalRemedies.push({
              type: 'ishta_devata',
              title: `Ishta Devata Upasana: ${ishtaDevata.deityName}`,
              instructions: `Guiding deity indicated by 12th from Karakamsa (${ishtaDevata.twelfthSignFromKarakamsa}). Daily mantra: ${ishtaDevata.primaryMantra} on ${ishtaDevata.auspiciousDay}.`,
            });
          }

          summary = {
            overview: parsed.overview || summary.overview,
            astrologicalHighlights: parsed.astrologicalHighlights || summary.astrologicalHighlights,
            timelinePredictions: parsed.timelinePredictions || summary.timelinePredictions,
            recommendedRemedies: finalRemedies,
            auspiciousDates: parsed.auspiciousDates || summary.auspiciousDates,
            panditJiFinalBlessing: parsed.panditJiFinalBlessing || summary.panditJiFinalBlessing,
          };
        }
      } catch (aiErr) {
        console.warn('OpenAI Summary Generation Warning:', aiErr);
      }
    }

    // 3. Save Summary, Full Transcript, and Complete the Session in Firestore
    const finalDuration = Math.max(durationSeconds, 60);
    const finalBilledMinutes = Math.ceil(finalDuration / 60);
    const ratePerMin = sessionData?.pricePerMin || (sessionData?.currency === 'USD' ? 0.15 : 7);
    const finalTotalAmount = Number((finalBilledMinutes * ratePerMin).toFixed(2));

    await sessionRef.update({
      status:
        sessionData.status === 'terminated_low_balance' ? 'terminated_low_balance' : 'completed',
      endTime: new Date().toISOString(),
      durationSeconds: finalDuration,
      billedMinutes: finalBilledMinutes,
      totalBilledAmount: finalTotalAmount,
      conversationTranscript: Array.isArray(conversationTranscript) ? conversationTranscript : [],
      summary,
    });

    return NextResponse.json({
      success: true,
      summary,
      durationSeconds: finalDuration,
      billedMinutes: finalBilledMinutes,
      totalBilledAmount: finalTotalAmount,
      conversationTranscript,
    });
  } catch (error: any) {
    console.error('Error ending AI consultation:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
