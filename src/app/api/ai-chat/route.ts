import { NextResponse } from 'next/server';
import { getServerOpenAIApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';
import { safeParseAIJson } from '@/lib/aiResponseParser';
import { getSettings } from '@/lib/settings';
import { adminDb } from '@/lib/firebase/admin';
import {
  ASTROPARIHAR_UNIFIED_REMEDY_DIRECTIVES,
  generate48DayRemedyProtocol,
  RemedyProtocol48Day,
} from '@/lib/vedicRemediesEngine';
import {
  calculateBirthChartData,
  formatChartSummaryForAI,
  extractBirthDetailsFromText,
  analyzeInquiryEvidence,
  extractCoupleDetails,
  cleanPartnerName,
  calculateRashiCompatibility,
  calculateAshtakootGunMilan,
  normalizeRashi,
  JyotishEvidencePack,
} from '@/lib/vedicAstrologyEngine';

export async function GET(req: Request) {
  try {
    const settings = await getSettings();
    const pricePerPrompt = Number(settings.aiChatPricePerPrompt) >= 0 ? Number(settings.aiChatPricePerPrompt) : 5;
    
    // Ensure document has price persisted
    try {
      await adminDb.collection('settings').doc('general').set({ aiChatPricePerPrompt: pricePerPrompt }, { merge: true });
    } catch (dbErr) {
      console.warn('Could not persist price setting to db:', dbErr);
    }

    // Optional: Check pending predictions for outcome verification
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    let pendingPrediction = null;

    if (userId && userId !== 'guest' && userId !== 'guest-user') {
      try {
        const predSnap = await adminDb
          .collection('users')
          .doc(userId)
          .collection('predictions')
          .where('status', '==', 'pending')
          .limit(1)
          .get();
        if (!predSnap.empty) {
          const doc = predSnap.docs[0];
          pendingPrediction = { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn('Could not fetch pending predictions:', err);
      }
    }

    return NextResponse.json({
      success: true,
      pricePerPrompt,
      pendingPrediction,
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, pricePerPrompt: 5 });
  }
}

// Prediction Outcome Verification Handler (Did it work?)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, predictionId, outcome, userNote } = body;

    if (!userId || !predictionId || !outcome) {
      return NextResponse.json({ error: 'Missing required verification fields' }, { status: 400 });
    }

    const predRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('predictions')
      .doc(predictionId);

    await predRef.set(
      {
        status: outcome, // 'verified_accurate' | 'partially_accurate' | 'inaccurate'
        verifiedAt: new Date().toISOString(),
        userFeedbackNote: userNote || '',
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you for verifying your astrological outcome. Your feedback helps strengthen AstroParihar Jyotish accuracy.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update prediction outcome' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let userRef: any = null;
  let deductedAmount = 0;
  let initialBalance = 0;

  try {
    const body = await req.json();
    const {
      messages = [],
      userId,
      userInfo = null,
      language = 'English',
    } = body;

    // 1. Check Authentication
    if (!userId || userId === 'guest-user' || userId === 'guest') {
      return NextResponse.json(
        {
          error: 'Please sign in to your AstroParihar account to chat with Acharya Parihar.',
          isGuest: true,
        },
        { status: 401 }
      );
    }

    // 2. Fetch Pricing Setting
    const settings = await getSettings();
    const pricePerPrompt = Number(settings.aiChatPricePerPrompt) >= 0 ? Number(settings.aiChatPricePerPrompt) : 5;

    // 3. Check & Deduct Wallet Balance
    userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    const userData = userSnap.data();
    initialBalance = Number(userData?.walletBalance) || 0;

    if (pricePerPrompt > 0) {
      if (initialBalance < pricePerPrompt) {
        return NextResponse.json(
          {
            error: `Insufficient wallet balance. Each prompt costs ₹${pricePerPrompt}, but your available balance is ₹${initialBalance}. Please recharge your wallet to continue.`,
            isInsufficient: true,
            requiredAmount: pricePerPrompt,
            availableBalance: initialBalance,
          },
          { status: 402 }
        );
      }

      // Deduct wallet balance
      const newBalance = Math.max(0, initialBalance - pricePerPrompt);
      await userRef.set({ walletBalance: newBalance }, { merge: true });
      deductedAmount = pricePerPrompt;

      // Record transaction
      await userRef.collection('wallet_transactions').add({
        userId,
        amount: pricePerPrompt,
        type: 'debit',
        description: `AI Astrologer Chat Prompt (${language})`,
        serviceType: 'ai-chat',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'success',
        paymentMethod: 'wallet',
      });
    }

    // 4. Resolve OpenAI Key
    const openaiApiKey = await getServerOpenAIApiKey();

    if (!openaiApiKey) {
      // Refund if key is missing
      if (deductedAmount > 0 && userRef) {
        await userRef.set({ walletBalance: initialBalance }, { merge: true });
      }
      return NextResponse.json(
        { error: 'OpenAI API service is temporarily unavailable. Your wallet has not been charged.' },
        { status: 503 }
      );
    }

    const currentYear = new Date().getFullYear();
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 5. Build Devotee Birth Profile
    let birthInfo = {
      name: userInfo?.name || userData?.name || 'Devotee',
      gender: userInfo?.gender || userData?.gender || 'Devotee',
      dob: userInfo?.dob || userData?.dob,
      tob: userInfo?.tob || userData?.tob || '12:00 PM',
      pob: userInfo?.pob || userData?.pob || 'India',
      lat: userInfo?.lat || userData?.lat || '28.6139',
      lon: userInfo?.lon || userData?.lon || '77.2090',
    };

    if (!birthInfo.dob && Array.isArray(messages) && messages.length > 0) {
      const allUserTexts = messages
        .filter((m: any) => m.role === 'user')
        .map((m: any) => m.content)
        .join(' ');
      const extracted = extractBirthDetailsFromText(allUserTexts);
      if (extracted?.dob) {
        birthInfo.dob = extracted.dob;
        birthInfo.tob = extracted.tob || birthInfo.tob;
        birthInfo.pob = extracted.pob || birthInfo.pob;
      }
    }

    // 6. Longitudinal Memory: Recall Past Consultations & Pending Predictions
    let userMemoryContext = '';
    let pastPendingPrediction: any = null;

    try {
      const memorySnap = await userRef
        .collection('ai_astrology_memory')
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get();

      if (!memorySnap.empty) {
        const pastSessions = memorySnap.docs.map((d: any) => d.data());
        const sessionLines = pastSessions
          .map(
            (s: any) =>
              `- [${s.date || 'Previous Session'}]: Devotee asked about "${s.topic || s.inquiry}". Prediction given: "${s.prediction || 'Guided'}". Active Remedy: ${s.prescribedHomam || 'Vedic Upaya'}.`
          )
          .join('\n');
        userMemoryContext = `\n\nLONGITUDINAL DEVOTEE MEMORY (PAST SESSIONS):\n${sessionLines}\n*DIRECTIVE: Acknowledge their continuing spiritual journey when relevant. Do not ask for birth details again if they are already recorded.*`;
      }

      // Check for any unverified predictions
      const predSnap = await userRef
        .collection('predictions')
        .where('status', '==', 'pending')
        .limit(1)
        .get();
      if (!predSnap.empty) {
        const pDoc = predSnap.docs[0];
        pastPendingPrediction = { id: pDoc.id, ...pDoc.data() };
      }
    } catch (memErr) {
      console.warn('Longitudinal memory lookup notice:', memErr);
    }

    // 7. Deterministic Jyotish Evidence & Rule Engine Evaluation
    const latestUserMessage =
      [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';

    // Calculate birth chart data for logged-in user if DOB is present
    let chart: ReturnType<typeof calculateBirthChartData> | null = null;
    if (birthInfo.dob) {
      try {
        chart = calculateBirthChartData(
          birthInfo.dob,
          birthInfo.tob,
          birthInfo.pob,
          birthInfo.lat,
          birthInfo.lon,
          birthInfo.name,
          birthInfo.gender
        );
      } catch (cErr) {
        console.warn('Chart calculation notice:', cErr);
      }
    }

    const defaultUserProfile = {
      name: birthInfo.name,
      rashi: chart ? normalizeRashi(chart.moonSign) : null,
      dob: birthInfo.dob,
      tob: birthInfo.tob,
      pob: birthInfo.pob,
    };

    // Check if inquiry is about couple compatibility / Kundli matching
    const coupleMatch = extractCoupleDetails(latestUserMessage, defaultUserProfile);
    const isCoupleInquiry = Boolean(coupleMatch?.isCoupleMatch);

    let userContext = '';
    let birthChartSummary = '';
    let evidence: JyotishEvidencePack | null = null;
    let pariharProtocol: RemedyProtocol48Day | null = null;
    let evidencePrompt = '';

    if (isCoupleInquiry && coupleMatch) {
      const p1 = coupleMatch.partner1;
      const p2 = coupleMatch.partner2;

      const isUserFemale = (birthInfo.gender || '').toLowerCase() === 'female';
      const isUserMale = (birthInfo.gender || '').toLowerCase() === 'male';
      const groom = isUserFemale ? p2 : isUserMale ? p1 : p1;
      const bride = isUserFemale ? p1 : isUserMale ? p2 : p2;

      const isMissingPartnerDetails = !p2.rashi && !p2.dob && !coupleMatch.compatibility && !coupleMatch.ashtakootResult;

      // Generate couple-specific marriage & harmony parihar protocol
      pariharProtocol = generate48DayRemedyProtocol({
        domain: 'marriage',
        planet: 'Venus',
        concern: `Kundli Matching & Marriage Harmony for ${groom.name} and ${bride.name}`,
      });

      if (isMissingPartnerDetails) {
        evidencePrompt = `
================================================================================
KUNDLI MATCHING (ASHTAKOOT GUN MILAN) INQUIRY:
================================================================================
- Devotee: ${defaultUserProfile.name} (${defaultUserProfile.rashi ? `Rashi: ${defaultUserProfile.rashi.name}, Lord: ${defaultUserProfile.rashi.lord}` : `DOB: ${defaultUserProfile.dob || 'Recorded'}`})
- Prospective Partner: ${p2.name} (NOTE: "${p2.name}" is one single individual's full name)
- Relationship Context: Devotee is seeking Kundli Matching / Marriage compatibility with ${p2.name}.
- Status: Partner's birth date/time or Moon Rashi have not been provided yet.
- Prescribed 48-Day Couple Blessing Protocol: ${pariharProtocol.title}
  * Recommended Homam: ${pariharProtocol.recommendedHomam} (${pariharProtocol.homamAuspiciousDay})
  * Daily Mantra: ${pariharProtocol.dailyMantra} (${pariharProtocol.dailyJapaCount})

CRITICAL DIRECTIVES FOR ACHARYA PARIHAR:
1. Warmly acknowledge the devotee's inquiry regarding compatibility with ${p2.name} (treat "${p2.name}" as one single individual's full name, never separate it into two people).
2. Note that while the devotee's planetary coordinates are established, to calculate the authentic 36-point Ashtakoot Gun Milan (evaluating Graha Maitri, Bhakoot, Gana, Nadi, and Manglik Dosha), ${p2.name}'s Date of Birth (and Time/Place if known) or Moon Sign (Rashi) is required.
3. Offer initial auspicious guidance based on 7th House Kalatra Bhava and Venusian influences, and warmly invite the devotee to share ${p2.name}'s birth details or Rashi.
4. Deliver your complete, beautiful consultation in the "reply" field. NEVER output raw JSON dictionaries or person key-value pairs at the root level.`;
      } else {
        let scoreText = '25 / 36';
        let matchStatus = 'Auspicious & Favorable';
        let breakdownLines: string[] = [];
        let matchVerdict = 'Auspicious union with solid foundational planetary support.';

        if (coupleMatch.ashtakootResult) {
          const ak = coupleMatch.ashtakootResult;
          scoreText = `${ak.totalScore} / 36`;
          matchStatus = ak.status;
          matchVerdict = ak.verdict;
          breakdownLines = ak.ashtakoot.map((k: any) => `  * ${k.koot}: ${k.score} (${k.desc})`);
        } else if (coupleMatch.compatibility) {
          const c = coupleMatch.compatibility;
          scoreText = `~${c.totalScore} / 36`;
          matchStatus = c.status;
          matchVerdict = c.verdict;
          breakdownLines = [
            `  * Varna Koot: ${c.varna.score}/1 - ${c.varna.desc}`,
            `  * Vashya Koot: ${c.vashya.score}/2 - ${c.vashya.desc}`,
            `  * Graha Maitri (Mental Harmony): ${c.grahaMaitri.score}/5 - ${c.grahaMaitri.desc}`,
            `  * Bhakoot (Emotional & Family Prosperity): ${c.bhakoot.score}/7 - ${c.bhakoot.desc}`,
          ];
        }

        evidencePrompt = `
================================================================================
DETERMINISTIC KUNDLI MATCHING (ASHTAKOOT GUN MILAN) EVALUATION:
================================================================================
- Groom: ${groom.name} (${groom.rashi ? `Rashi: ${groom.rashi.name}, Lord: ${groom.rashi.lord}` : `DOB: ${groom.dob}`})
- Bride: ${bride.name} (${bride.rashi ? `Rashi: ${bride.rashi.name}, Lord: ${bride.rashi.lord}` : `DOB: ${bride.dob}`})
- Calculated Ashtakoot Gun Milan Score: ${scoreText} (${matchStatus})
- Key Ashtakoot Dimensions:
${breakdownLines.join('\n')}
- Astrological Verdict: ${matchVerdict}
- Prescribed 48-Day Couple Blessing Protocol: ${pariharProtocol.title}
  * Recommended Homam: ${pariharProtocol.recommendedHomam} (${pariharProtocol.homamAuspiciousDay})
  * Daily Mantra: ${pariharProtocol.dailyMantra} (${pariharProtocol.dailyJapaCount})
  * Day 24 Sacred Daana: ${pariharProtocol.midMandalaMilestoneDay24.charityDaana}
  * Day 48 Purnahuti: ${pariharProtocol.culminationDay48.action}

CRITICAL DIRECTIVE FOR ACHARYA PARIHAR:
1. You are providing an authentic, warm, and authoritative Vedic Kundli Matching consultation for ${groom.name} and ${bride.name}.
2. Note that "${p2.name}" is one single person's full name.
3. Explicitly explain their calculated Gun Milan score (${scoreText}), mental affinity (Graha Maitri), emotional bonding (Bhakoot), mutual respect, and marital longevity.
4. Write your complete, spiritually uplifting consultation response directly in the "reply" field.
5. NEVER output raw JSON objects, dictionaries, or name keys at the root level of your response. The response MUST strictly follow the consultation JSON schema with "reply" and "conclusion".`;
      }
    } else if (chart) {
      try {
        birthChartSummary = `\n\n${formatChartSummaryForAI(chart)}`;

        // Run Deterministic Jyotish Evidence Analysis
        evidence = analyzeInquiryEvidence(chart, latestUserMessage);

        // Generate 48-Day Executable Parihar Protocol
        pariharProtocol = generate48DayRemedyProtocol({
          domain: evidence.domain,
          planet: evidence.primaryAfflictedPlanet,
          concern: latestUserMessage,
        });

        if (evidence.domain === 'ishta_devata' && chart.ishtaDevata) {
          pariharProtocol.presidingDeity = chart.ishtaDevata.deityName;
          pariharProtocol.dailyMantra = chart.ishtaDevata.primaryMantra;
          pariharProtocol.dailyJapaCount = chart.ishtaDevata.dailyJapaCount;
          pariharProtocol.homamAuspiciousDay = chart.ishtaDevata.auspiciousDay;
          pariharProtocol.title = `48-Day Sacred Ishta Devata Upasana Mandala (${chart.ishtaDevata.deityName})`;
          pariharProtocol.mandalaPurpose = `Consecrated soul communion, obstacle dissolution, and spiritual enlightenment under ${chart.ishtaDevata.deityName}`;
        }

        evidencePrompt = `
================================================================================
DETERMINISTIC JYOTISH EVIDENCE GENERATED BY ASTROPARIHAR ENGINE:
================================================================================
- Domain Identified: ${evidence.domainTitle}
- Target Houses: Houses ${evidence.relevantHouseNumbers.join(', ')}
- Relevant House Alignments in D1:
${evidence.relevantHouses.map((h: any) => `  * House ${h.houseNumber} (${h.sign}) ruled by ${h.lord}: Occupying Grahas = ${h.planets}`).join('\n')}
- Active Vimshottari Cycle: ${evidence.activeDashaSummary}
- Supporting Astrological Factors:
${evidence.supportingFactors.map((f: any) => `  * ${f}`).join('\n')}
- Contradictory / Karmic Resistance Factors:
${evidence.contradictoryFactors.map((f: any) => `  * ${f}`).join('\n')}
- Astrological Confidence Score: ${evidence.confidence} (${evidence.confidenceRationale})
- Potent Timing Window: ${evidence.timingWindow}
- Prescribed 48-Day Sacred Protocol: ${pariharProtocol.title}
  * Recommended Homam: ${pariharProtocol.recommendedHomam} (${pariharProtocol.homamAuspiciousDay})
  * Daily Mantra: ${pariharProtocol.dailyMantra} (${pariharProtocol.dailyJapaCount})
  * Day 24 Sacred Daana: ${pariharProtocol.midMandalaMilestoneDay24.charityDaana}
  * Day 48 Purnahuti: ${pariharProtocol.culminationDay48.action}
- Needs Astrologer Escalation: ${evidence.needsAstrologerReview ? 'YES - ' + evidence.escalationReason : 'NO'}
${chart.ishtaDevata ? `
================================================================================
VERIFIED CANONICAL ISHTA DEVATA (SOUL DEITY GROUND TRUTH):
================================================================================
- Verified Ishta Devata: ${chart.ishtaDevata.deityName}
  * Governing Graha: ${chart.ishtaDevata.governingPlanet}
  * Atmakaraka Planet: ${chart.ishtaDevata.atmakarakaPlanet}
  * Karakamsa (D9 Atmakaraka Sign): ${chart.ishtaDevata.karakamsaRashi}
  * 12th from Karakamsa (Jeevanmuktamsa Sthana): ${chart.ishtaDevata.twelfthSignFromKarakamsa}
  * Prescribed Ishta Mantra: "${chart.ishtaDevata.primaryMantra}" (${chart.ishtaDevata.dailyJapaCount})
  * Auspicious Worship Day: ${chart.ishtaDevata.auspiciousDay}
  * Recommended Stotra: ${chart.ishtaDevata.stotra}
  * Sacred Offerings: ${chart.ishtaDevata.offerings}

CRITICAL DIRECTIVE FOR ISHTA DEVATA INQUIRIES:
If the devotee asks who their Ishta Devata, Kuladevata, or personal God is, you MUST state that their verified Ishta Devata is strictly "${chart.ishtaDevata.deityName}". Mention the Atmakaraka (${chart.ishtaDevata.atmakarakaPlanet}) in Karakamsa ${chart.ishtaDevata.karakamsaRashi} and the 12th house Jeevanmuktamsa in ${chart.ishtaDevata.twelfthSignFromKarakamsa} ruled by ${chart.ishtaDevata.governingPlanet}. Recommend their canonical mantra "${chart.ishtaDevata.primaryMantra}". NEVER name any other deity.` : ''}

CRITICAL DIRECTIVE FOR ACHARYA PARIHAR:
1. You MUST explicitly reference the verified Ascendant (${chart.ascendant}), Moon Sign (${chart.moonSign}), Nakshatra (${chart.nakshatra}), and active Dasha (${chart.dasha.currentMahadasha} - ${chart.dasha.currentAntardasha}).
2. Ground your reasoning in the above verified supporting and contradictory factors. Never contradict this evidence.`;
      } catch (err) {
        console.warn('Error calculating birth chart or evidence:', err);
      }
    } else {
      userContext = `\nDevotee Profile:\n- Name: ${birthInfo.name}\n- Birth Details: Not provided yet. Kindly invite them to share their Date, Time, and Place of Birth to calculate their authentic Vedic Janam Kundli.`;
    }

    const isIndic = ['Telugu', 'Hindi', 'Tamil'].includes(language);
    const scriptName =
      language === 'Telugu'
        ? 'Telugu script (తెలుగు లిపి)'
        : language === 'Hindi'
        ? 'Hindi Devanagari script (हिन्दी)'
        : language === 'Tamil'
        ? 'Tamil script (தமிழ்)'
        : 'English';

    const systemPrompt = `You are "Acharya Parihar", the master Vedic Astrologer, Jyotishacharya, and spiritual guide at AstroParihar. You possess profound mastery over Parashari Jyotish, Jaimini Sutras, Ashtakavarga, Nakshatra analysis, and Vedic Upayas.

Real-Time Calendar Anchor:
- Today's Date: ${currentDate}.
- Current Year: STRICTLY ${currentYear}.
- You are practicing in ${currentYear}. All transit predictions (Saturn/Shani, Jupiter/Brihaspati, Rahu, Ketu), Mahadashas, and advice must reference ${currentYear} and future years (${currentYear + 1}, ${currentYear + 2}).

MANDATORY LANGUAGE REQUIREMENT (CRITICAL):
- Selected Language: **${language.toUpperCase()}** (${scriptName}).
- You MUST generate your entire consultation response 100% in ${language} using ${scriptName}.
${isIndic ? `- Even if the devotee asks in English or Roman script, translate and answer 100% in ${language} (${scriptName}).` : ''}
- Tone: Warm, compassionate, spiritually uplifting (start with a warm Vedic greeting in ${language}: ${language === 'Telugu' ? '"నమస్కారం"' : language === 'Hindi' ? '"नमस्ते / प्रणाम"' : language === 'Tamil' ? '"வணக்கம்"' : '"Namaste / Hari Om"'}).${userContext}${userMemoryContext}${birthChartSummary}${evidencePrompt}

${ASTROPARIHAR_UNIFIED_REMEDY_DIRECTIVES}

================================================================================
STRUCTURED CONSULTATION FORMAT REQUIREMENT (MANDATORY & ZERO-DEVIATION):
================================================================================
You MUST respond STRICTLY in JSON format matching this schema:
{
  "diagnosis": {
    "activeDasha": "${evidence?.activeDashaSummary || 'Current Mahadasha & Antardasha'}",
    "keyHouses": "Relevant houses involved in this inquiry",
    "supportingFactors": ["2 to 3 classical supporting planetary factors in ${language}"],
    "contradictoryFactors": ["1 to 2 friction points or karmic tests in ${language}"]
  },
  "conclusion": "Direct, decisive answer in 2-4 sentences in ${language} directly answering the devotee's question.",
  "timingWindow": "Clear, specific timing window for this event or transition in ${language}.",
  "whyAstroPariharSaysThis": [
    "3 to 5 clear astrological bullet points in ${language} explaining Observation -> Classical Rule -> Interpretation"
  ],
  "confidence": "${evidence?.confidence || 'Moderate'}",
  "confidenceRationale": "${evidence?.confidenceRationale || 'Evaluated across natal chart factors.'}",
  "needsAstrologerReview": ${Boolean(evidence?.needsAstrologerReview)},
  "escalationReason": "${evidence?.escalationReason || ''}",
  "pariharSummary": "Concise summary of the 48-day sacred remedy protocol in ${language}",
  "reply": "Your complete, warm, beautifully phrased Vedic consultation response in ${language} (${scriptName}). Speak directly to the devotee as Acharya Parihar. Begin with a traditional greeting. Deliver your astrological verdict and explain the active planetary influences with deep compassion and wisdom. Clearly specify the auspicious timing window. Do NOT output raw empty markdown headers, checklists, or English placeholder words.",
  "recommendations": [
    "5 to 6 engaging follow-up inquiry questions written 100% in ${language} (${scriptName})"
  ]
}`;

    // Prepare conversation messages
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map((m: any, idx: number, arr: any[]) => {
        let content = m.content || '';
        if (idx === arr.length - 1 && m.role === 'user' && language && language !== 'English') {
          content += `\n\n[MANDATORY DIRECTIVE: Deliver the complete consultation formatted in ${scriptName}. Do NOT reply in English.]`;
        }
        return {
          role: m.role === 'user' ? 'user' : 'assistant',
          content,
        };
      }),
    ];

    const response = await fetchWithOpenAIFallback(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: conversationMessages,
          temperature: 0.6,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        }),
      },
      openaiApiKey
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI chat completion failed:', response.status, errText);
      // Refund if OpenAI fails
      if (deductedAmount > 0 && userRef) {
        await userRef.set({ walletBalance: initialBalance }, { merge: true });
      }
      return NextResponse.json(
        { error: 'Failed to generate guidance from AI. Your wallet balance has been refunded.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    let replyContent = '';
    let recommendations: string[] = [];
    let parsed: any = {};

    try {
      const rawText = data.choices?.[0]?.message?.content || '{}';
      parsed = safeParseAIJson(rawText) || {};

      let mainReply = (parsed.reply || '').trim();

      // Check if reply is empty or has only empty/stacked headers with no real content
      const cleanBody = mainReply
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => !l.startsWith('#') && !/^[🔍🏺🎯⏳🪔⚖️📜✨]/.test(l) && l.length > 0)
        .join(' ');

      if (cleanBody.length < 30 && (parsed.conclusion || parsed.whyAstroPariharSaysThis)) {
        const sections: string[] = [];
        if (parsed.conclusion) {
          sections.push(parsed.conclusion);
        }
        if (Array.isArray(parsed.whyAstroPariharSaysThis) && parsed.whyAstroPariharSaysThis.length > 0) {
          sections.push(parsed.whyAstroPariharSaysThis.map((pt: string) => `• ${pt}`).join('\n'));
        }
        if (parsed.timingWindow) {
          sections.push(`⏳ **${parsed.timingWindow}**`);
        }
        mainReply = sections.join('\n\n');
      }

      // Strip redundant protocol/confidence headers from text since they are rendered as separate visual cards
      mainReply = mainReply
        .replace(/###?\s*[\u{1F300}-\u{1F9FF}\s]*(?:48[- ]?Day|Parihar Protocol|Sacred Mandala|Astrological Confidence|Confidence)[^\n]*/giu, '')
        .replace(/###?\s*[\u{1F300}-\u{1F9FF}\s]*(?:48[- ]?రోజుల|పరిహార ప్రోటోకాల్|జ్యోతిష్య నమ్మకం|ఆత్మవిశ్వాసం)[^\n]*/giu, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // Guard: If mainReply is empty (e.g. OpenAI returned raw couple JSON object {"Ajay Kumar": ...})
      if (!mainReply) {
        const rootKeys = Object.keys(parsed);
        const hasNestedObjects = rootKeys.length >= 2 && rootKeys.some((k) => typeof parsed[k] === 'object');

        if (hasNestedObjects) {
          const p1 = cleanPartnerName(rootKeys[0]);
          const p2 = cleanPartnerName(rootKeys[1]);
          const r1 = parsed[rootKeys[0]]?.Rashi || parsed[rootKeys[0]]?.rashi || (defaultUserProfile.rashi?.name ?? 'Leo (Simha)');
          const r2 = parsed[rootKeys[1]]?.Rashi || parsed[rootKeys[1]]?.rashi || 'Aries (Mesha)';

          const matchComp = calculateRashiCompatibility(r1, r2, p1, p2);
          const score = matchComp?.totalScore || 25;
          const status = matchComp?.status || 'Auspicious & Favorable';

          if (language === 'Telugu') {
            mainReply = `**నమస్కారం మరియు శుభాకాంక్షలు!** 🙏\n\n**${p1}** (${r1}) మరియు **${p2}** (${r2}) జాతకాల మధ్య వేద కుండలి మిలనం (అష్టకూట గుణ మేళన) విశ్లేషణ:\n\n• **అష్టకూట గుణ మేళనం స్కోరు**: **${score} / 36 పాయింట్లు** (${status})\n• **గ్రహ మైత్రి (మానసిక అనుకూలత)**: రాశ్యాధిపతుల మధ్య సహజ స్నేహం ఉంది. పరస్పర గౌరవం, ఆలోచనలలో సామరస్యం లభిస్తుంది.\n• **భకూట్ సమన్వయం**: కేంద్ర స్థాన సంబంధం ఏర్పడి కుటుంబ శ్రేయస్సు, ఆర్థిక వృద్ధి కలుగుతాయి.\n• **వర్ణ & వశ్య**: మానసిక ఆకర్షణ మరియు దాంపత్య అనుకూలత బాగుంది.\n\n**తీర్పు**: ఈ జంట వివాహ బంధానికి ఎంతో అనుకూలమైనది. పరస్పర సహనం, అవగాహన మరియు నిత్య శివ-పార్వతి ఆరాధనతో మీ దాంపత్యం కలకాలం సుఖసంతోషాలతో విలసిల్లుతుంది.`;
          } else if (language === 'Hindi') {
            mainReply = `**नमस्ते एवं सादर प्रणाम!** 🙏\n\n**${p1}** (${r1}) और **${p2}** (${r2}) के बीच प्रामाणिक वैदिक कुंडली मिलान (अष्टकूट गुण मिलान) विश्लेषण:\n\n• **अष्टकूट गुण मिलान स्कोर**: **${score} / 36 अंक** (${status})\n• **ग्रह मैत्री (मानसिक सामंजस्य)**: दोनों राशि स्वामियों के मध्य उत्तम मित्रता है, जिससे परस्पर विचार, मानसिक सामंजस्य और विश्वास सुदृढ़ रहेगा।\n• **भकूट समन्वय**: केंद्र संबंध होने से आर्थिक उन्नति, गृहस्थ सुख और पारिवारिक समृद्धि के शुभ योग बनते हैं।\n• **वर्ण एवं वश्य**: दोनों में आध्यात्मिक व मानसिक आकर्षण उत्तम है।\n\n**निर्णय**: यह वैवाहिक गठबंधन अत्यंत शुभ और अनुकूल है। परस्पर समझदारी और नित्य गौरी-शंकर की आराधना से वैवाहिक जीवन सुखमय और दीर्घायु रहेगा।`;
          } else {
            mainReply = `**Namaste and Divine Blessings!** 🙏\n\nHere is the authentic Vedic Kundli Matching (Ashtakoot Gun Milan) analysis for **${p1}** (${r1}) and **${p2}** (${r2}):\n\n• **Ashtakoot Gun Milan Score**: **${score} / 36 Points** (${status})\n• **Graha Maitri (Mental Harmony)**: Moon sign lords share natural friendship, fostering exceptional intellectual companionship, trust, and mutual respect.\n• **Bhakoot Alignment**: Auspicious Kendra relationship (4-10 alignment), directing mutual emotional warmth, shared growth, and domestic prosperity.\n• **Varna & Vashya**: Balanced temperaments with natural mutual attraction and emotional maturity.\n\n**Verdict**: This alliance carries auspicious planetary harmony. Mutual patience, transparent communication, and invoking the divine blessings of Lord Shiva & Goddess Parvathi will nurture a deeply fulfilling and prosperous marriage.`;
          }
        } else if (parsed.conclusion) {
          mainReply = parsed.conclusion;
        } else {
          // Extract text cleanly without raw JSON brackets
          const textChunks = Object.entries(parsed)
            .map(([k, v]) => {
              if (typeof v === 'object' && v !== null) {
                const sub = Object.entries(v)
                  .map(([sk, sv]) => `${sk}: ${sv}`)
                  .join(', ');
                return `**${k}**: ${sub}`;
              }
              return `**${k}**: ${v}`;
            })
            .join('\n\n');
          if (textChunks.length > 20) {
            mainReply = textChunks;
          }
        }
      }

      // Ensure verified Ishta Devata is firmly honored without AI drift
      if (evidence?.domain === 'ishta_devata' && chart?.ishtaDevata) {
        const canonicalDeity = chart.ishtaDevata.deityName;
        const canonicalMantra = chart.ishtaDevata.primaryMantra;
        const deityKeywords = canonicalDeity.toLowerCase().split(/[\s/&()]+/).filter((w) => w.length > 3);
        const mentionsDeity = deityKeywords.some((w) => mainReply.toLowerCase().includes(w));

        if (!mentionsDeity && mainReply) {
          const ishtaPrefix =
            language === 'Telugu'
              ? `**ఇష్ట దైవ నిర్ణయం**: మీ జాతక చక్రం ప్రకారం, ఆత్మకారక గ్రహం ${chart.ishtaDevata.atmakarakaPlanet} మరియు కారకాంశ నుండి 12వ స్థానం (${chart.ishtaDevata.twelfthSignFromKarakamsa}) ఆధారంగా మీ సర్వోన్నత ఇష్ట దైవం **${canonicalDeity}**.\n\n`
              : language === 'Hindi'
              ? `**इष्ट देवता निर्णय**: आपकी जन्म कुंडली के अनुसार, आत्मकारक ग्रह ${chart.ishtaDevata.atmakarakaPlanet} एवं कारकांश से 12वें भाव (${chart.ishtaDevata.twelfthSignFromKarakamsa}) के आधार पर आपके परम इष्ट देवता **${canonicalDeity}** हैं।\n\n`
              : `**Ishta Devata Guidance**: Based on your Jaimini birth chart coordinates, your soul planet (Atmakaraka) is ${chart.ishtaDevata.atmakarakaPlanet}, and the 12th house from Karakamsa (${chart.ishtaDevata.twelfthSignFromKarakamsa}) is governed by ${chart.ishtaDevata.governingPlanet}, establishing **${canonicalDeity}** as your verified Ishta Devata.\n\n`;
          mainReply = ishtaPrefix + mainReply;
        }

        if (parsed.conclusion && !deityKeywords.some((w) => parsed.conclusion.toLowerCase().includes(w))) {
          parsed.conclusion =
            language === 'Telugu'
              ? `మీ సర్వోన్నత ఇష్ట దైవం ${canonicalDeity}. నిత్యం "${canonicalMantra}" జపించడం వల్ల సర్వ శుభాలు కలుగుతాయి.`
              : language === 'Hindi'
              ? `आपके परम इष्ट देवता ${canonicalDeity} हैं। नित्य "${canonicalMantra}" का जाप कल्याणकारी रहेगा।`
              : `Your verified Ishta Devata is ${canonicalDeity}. Chanting "${canonicalMantra}" grants supreme spiritual protection and inner peace.`;
        }
      }

      // Safety check: if mainReply still looks like raw JSON ({ ... })
      if (mainReply.startsWith('{') && mainReply.endsWith('}')) {
        try {
          const innerObj = JSON.parse(mainReply);
          if (innerObj.reply && typeof innerObj.reply === 'string') {
            mainReply = innerObj.reply;
          } else if (innerObj.conclusion && typeof innerObj.conclusion === 'string') {
            mainReply = innerObj.conclusion;
          }
        } catch {}
      }

      replyContent =
        mainReply ||
        parsed.conclusion ||
        'May Lord Shiva and Goddess Parvathi shower their divine blessings upon this alliance with health, harmony, and prosperity.';

      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        recommendations = parsed.recommendations
          .filter((r: any) => typeof r === 'string' && r.trim().length > 0)
          .slice(0, 6);
      }
    } catch (parseErr) {
      replyContent =
        data.choices?.[0]?.message?.content ||
        'May Lord Ganesha bless you with clarity and peace. How else may I guide your chart today?';
    }

    // Ensure 5-6 recommendations are always present
    if (recommendations.length < 5) {
      if (language === 'Telugu') {
        recommendations = [
          '🔮 నా జాతకంలో 2026 గ్రహ సంచారాల ప్రభావం ఎలా ఉంది?',
          '✨ నా కోసం అనుకూలమైన రత్నం మరియు నిత్య పఠన మంత్రం ఏమిటి?',
          '💼 కెరీర్ మార్పు లేదా ప్రమోషన్‌కు సరైన సమయం ఎప్పుడు?',
          '❤️ వివాహ యోగం మరియు భాగస్వామి అనుకూలత ఎప్పుడు బాగుంటుంది?',
          '🪐 శని సాడే సాతి లేదా రాహు మహర్దశ నడుస్తుందా?',
          '🙏 ఈ దోష నివారణకు ఎలాంటి దానం లేదా పూజ చేయాలి?',
        ];
      } else if (language === 'Hindi') {
        recommendations = [
          '🔮 2026 में मेरे मुख्य ग्रह गोचर और महादशा का क्या प्रभाव है?',
          '✨ मेरे लिए शुभ रत्न, रुद्राक्ष और दैनिक मंत्र क्या है?',
          '💼 करियर में पदोन्नति या व्यापार विस्तार का सबसे शुभ समय कब है?',
          '❤️ विवाह का शुभ योग और जीवनसाथी से सामंजस्य कब बनेगा?',
          '🪐 क्या मुझ पर शनि की साढ़ेसाती या राहु की महादशा चल रही है?',
          '🙏 ग्रहों की शांति के लिए कौन सा दान या व्रत श्रेष्ठ रहेगा?',
        ];
      } else if (language === 'Tamil') {
        recommendations = [
          '🔮 2026-ல் எனது ஜாதக கிரக பெயர்ச்சி பலன்கள் எப்படி உள்ளன?',
          '✨ எனக்கு உகந்த அதிர்ஷ்ட ரத்தினம் மற்றும் தினசரி மந்திரம் எது?',
          '💼 தொழில் வளர்ச்சி அல்லது வேலை மாற்றத்திற்கு உகந்த நேரம் எப்போது?',
          '❤️ திருமண யோகம் மற்றும் திருமண வாழ்க்கை எப்போது அமையும்?',
          '🪐 எனக்கு ஏழரை சனி அல்லது ராகு தசை நடக்கிறதா?',
          '🙏 கிரக தோஷ பரிகாரத்திற்கு என்ன தானம் அல்லது பூஜை செய்ய வேண்டும்?',
        ];
      } else {
        recommendations = [
          '🔮 What do my planetary transits and dashas indicate for 2026?',
          '✨ What is my most auspicious gemstone, rudraksha & daily mantra?',
          '💼 What is the ideal timeline for career growth and financial expansion?',
          '❤️ When is the most favorable period for marriage and relationship harmony?',
          '🪐 Am I currently undergoing Shani Sade Sati or Rahu Mahadasha?',
          '🙏 What specific Vedic remedies, fasting, or charity (Daan) will strengthen my chart?',
        ];
      }
    }

    // 8. Longitudinal Memory & Prediction Persistence (Outcome Tracking)
    try {
      const sessionDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      await userRef.collection('ai_astrology_memory').add({
        date: sessionDate,
        topic: evidence?.domainTitle || latestUserMessage.slice(0, 60),
        inquiry: latestUserMessage.slice(0, 150),
        conclusion: parsed.conclusion || replyContent.slice(0, 200),
        prediction: parsed.timingWindow || evidence?.timingWindow || '',
        prescribedHomam: pariharProtocol?.recommendedHomam || '',
        confidence: evidence?.confidence || parsed.confidence || 'Moderate',
        createdAt: new Date().toISOString(),
      });

      // Save structured prediction for future outcome validation
      if (parsed.timingWindow || evidence?.timingWindow) {
        await userRef.collection('predictions').add({
          topic: evidence?.domainTitle || 'Cosmic Timing',
          predictedEvent: parsed.conclusion || 'Key Astrological Shift',
          targetPeriod: parsed.timingWindow || evidence?.timingWindow || '',
          confidence: evidence?.confidence || parsed.confidence || 'Moderate',
          remedyPrescribed: pariharProtocol?.recommendedHomam || '',
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (persistErr) {
      console.warn('Astrology memory persistence notice:', persistErr);
    }

    const finalBalance = Math.max(0, initialBalance - deductedAmount);

    const structuredPayload = {
      diagnosis: parsed.diagnosis || {
        activeDasha: evidence?.activeDashaSummary || '',
        keyHouses: `Houses ${evidence?.relevantHouseNumbers.join(', ') || '1, 9, 10'}`,
        supportingFactors: evidence?.supportingFactors || [],
        contradictoryFactors: evidence?.contradictoryFactors || [],
      },
      conclusion: parsed.conclusion || '',
      timingWindow: parsed.timingWindow || evidence?.timingWindow || '',
      whyAstroPariharSaysThis: parsed.whyAstroPariharSaysThis || evidence?.supportingFactors || [],
      confidence: (evidence?.confidence || parsed.confidence || 'Moderate') as 'Strong' | 'Moderate' | 'Mixed',
      confidenceRationale: evidence?.confidenceRationale || parsed.confidenceRationale || '',
      needsAstrologerReview: Boolean(evidence?.needsAstrologerReview || parsed.needsAstrologerReview),
      escalationReason: evidence?.escalationReason || parsed.escalationReason || '',
      pariharProtocol: pariharProtocol || null,
    };

    return NextResponse.json({
      success: true,
      message: {
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toISOString(),
        recommendations: recommendations.slice(0, 6),
        structured: structuredPayload,
      },
      structured: structuredPayload,
      pendingVerification: pastPendingPrediction,
      recommendations: recommendations.slice(0, 6),
      deducted: deductedAmount,
      newBalance: finalBalance,
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    // Refund on crash
    if (deductedAmount > 0 && userRef) {
      try {
        await userRef.set({ walletBalance: initialBalance }, { merge: true });
      } catch (rErr) {
        console.warn('Refund rollback error:', rErr);
      }
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

