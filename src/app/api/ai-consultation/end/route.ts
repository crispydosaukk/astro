import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { AIConsultationSummary } from '@/lib/aiAstrologerData';
import { safeParseAIJson } from '@/lib/aiResponseParser';
import { fetchWithOpenAIFallback, getServerOpenAIApiKey } from '@/lib/aiConfig';
import { calculateBirthChartData, formatChartSummaryForAI } from '@/lib/vedicAstrologyEngine';
import { resolveVedicRemedies, ASTROPARIHAR_UNIFIED_REMEDY_DIRECTIVES } from '@/lib/vedicRemediesEngine';

export async function POST(req: Request) {
  try {
    const { sessionId, durationSeconds = 60, conversationTranscript = [] } = await req.json();

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

    // 1. Fetch dynamic OpenAI API Key
    const openaiApiKey = await getServerOpenAIApiKey();

    // Default High-Quality Astrology Summary fallback
    let summary: AIConsultationSummary = {
      overview: `Divine consultation completed with ${astrologerName} (${discipline}) for ${birthDetails.name || 'Devotee'}. Explored key planetary influences around ${primaryConcern}, analyzing active Dasha and transits in ${language}.`,
      astrologicalHighlights: [
        `Ascendant (Lagna) is ${astroContext?.lagna || 'favorably aligned'}, conferring intellectual resilience and personal capacity.`,
        `Current Mahadasha period (${astroContext?.currentDasha || 'active cycle'}) is initiating a pivotal transition phase favoring long-term stability.`,
        `Benefic planetary rays protect the house of prosperity, neutralizing minor transit delays.`,
      ],
      timelinePredictions: [
        `Next 3-6 Months: Key decision crossroads with favorable resolution in career and financial planning.`,
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
        const transcriptText = Array.isArray(conversationTranscript)
          ? conversationTranscript
              .map(
                (t: any) =>
                  `${t.role === 'user' ? 'Customer' : astrologerName}: ${t.content || t.text}`
              )
              .join('\n')
          : '';

        const currentYear = new Date().getFullYear();
        const systemPrompt = `You are an elite Vedic astrology report generator for AstroParihar.
Real-Time Calendar Anchor: The current year is strictly ${currentYear}. All timeline predictions and astrological highlights must be calculated for ${currentYear} and future years. Never refer to 2024 or 2025 as the current year.
Synthesize a professional, inspiring, and authentic post-consultation astrology summary based on the consultation conducted by ${astrologerName} (${discipline}).
Devotee Details: Name: ${birthDetails.name || 'Devotee'}, DOB: ${birthDetails.dob || 'N/A'}, Time: ${birthDetails.time || 'N/A'}, Place: ${birthDetails.place || 'N/A'}, Concern: ${primaryConcern}, Language: ${language}.
Calculated Authentic Chart Context:
- Verified Ascendant (Lagna): ${astroContext?.lagna || 'Vedic Ascendant'}
- Moon Sign: ${astroContext?.moonRashi || 'Chandra Rashi'} (${astroContext?.nakshatra || ''})
- Active Vimshottari Dasha: ${astroContext?.currentDasha || 'Active Dasha'}
${astroContext?.chartSummary ? `- House & Planetary Placements:\n${astroContext.chartSummary}` : ''}

CRITICAL CANONICAL REMEDIAL & ISHTA DEVATA GROUND TRUTH:
- Verified Ishta Devata: ${ishtaDevata ? ishtaDevata.deityName : 'Lord Shiva / Maha Vishnu'} (12th from Karakamsa: ${ishtaDevata?.twelfthSignFromKarakamsa || 'Pisces'})
- Prescribed Canonical Homam: ${canonicalRemedies.primaryHomam.name} (${canonicalRemedies.primaryHomam.day})
- Prescribed Canonical Daily Mantra: ${canonicalRemedies.primaryMantra.title}
- Prescribed Gemstone: ${canonicalRemedies.gemstone.name}

Mandatory Rules for "recommendedRemedies":
1. First remedy MUST be the prescribed canonical Homam: "${canonicalRemedies.primaryHomam.name}".
2. Second remedy MUST be the prescribed canonical Mantra: "${canonicalRemedies.primaryMantra.title}".
3. Third remedy MUST be the devotee's verified Ishta Devata: "${ishtaDevata ? ishtaDevata.deityName : 'Personal Divine Guardian'}".

Respond ONLY with a valid JSON object matching this schema:
{
  "overview": "2-3 sentence overview of the astrological consultation reading and findings, referencing their verified ${astroContext?.lagna || 'Lagna'} and active ${astroContext?.currentDasha || 'Dasha'}",
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

        const openAiRes = await fetchWithOpenAIFallback(
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
          
          // Guarantee canonical remedy alignment
          let finalRemedies = Array.isArray(parsed.recommendedRemedies) && parsed.recommendedRemedies.length > 0
            ? parsed.recommendedRemedies
            : summary.recommendedRemedies;

          const hasHomam = finalRemedies.some((r: any) => r.type === 'homam' || r.title?.toLowerCase().includes('homam') || r.title?.toLowerCase().includes('homa'));
          if (!hasHomam) {
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
    const finalTotalAmount = finalBilledMinutes * (sessionData?.pricePerMin || 20);

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
