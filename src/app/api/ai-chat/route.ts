import { NextResponse } from 'next/server';
import { getServerOpenAIApiKey, getServerVedikaApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';
import { queryVedikaAI, formatToVedikaDateTime } from '@/lib/vedikaClient';
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
  generatePersonalAstrologyProfile,
  generateYearComparison,
  generateInteractiveTimeline,
} from '@/lib/vedicAstrologyEngine';
import { DEFAULT_AI_ASTROLOGERS } from '@/lib/aiAstrologerData';
import { resolveLalKitabRemedies } from '@/lib/lalKitabEngine';
import { findAuspiciousMuhurats } from '@/lib/muhuratEngine';

function isRemedyExplicitlyRequested(query: string): boolean {
  if (!query || typeof query !== 'string') return false;
  const q = query.trim().toLowerCase();

  // Explicit English remedy keywords & intent phrases
  const englishKeywords = [
    /\bremed(y|ies)\b/i,
    /\bparihar(am|ams)?\b/i,
    /\bupa?ay(s|am|alu)?\b/i,
    /\bsolution(s)?\b/i,
    /\bcure(s)?\b/i,
    /\bpooj?a(s)?\b/i,
    /\bhomam?(s)?\b/i,
    /\bhavan\b/i,
    /\bshanti\b/i,
    /\b(dosha|dosham)\s*(nivarana?|shanti|parihar|remedy)\b/i,
    /\bdaana?m?\b/i,
    /\bcharit(y|ies)\b/i,
    /\bvrata?m?\b/i,
    /\bfasting\b/i,
    /\bhow to (fix|solve|cure|overcome|mitigate|pacify|remedy|neutralize)\b/i,
    /\bwhat (should|can|to) (i|we) do\b/i,
    /\bwhat (is|are) the (remedy|remedies|upay|parihar)\b/i,
    /\bwhich (puja|pooja|homam|mantra|gemstone|stone|rudraksha) should\b/i,
    /\bmandala\b/i,
  ];

  // Telugu remedy keywords
  const teluguKeywords = [
    /పరిహార/,       // parihara / pariharam / pariharalu
    /పరిష్కార/,     // parishkara / parishkaram
    /ఉపాయ/,         // upaya / upayam / upayalu
    /దోష నివారణ/,    // dosha nivarana
    /శాంతి/,         // shanti
    /పూజ/,           // puja / pooja
    /హోమం/,          // homam
    /హోమాలు/,        // homalu
    /దానం/,          // daanam
    /దీక్ష/,          // deeksha
    /వ్రతం/,          // vratam
    /ఏం చేయాలి/,     // what to do
    /ఎలా చేయాలి/,    // how to do
    /ఎలా అధిగమించాలి/, // how to overcome
    /నివారణ/,        // nivarana
  ];

  // Hindi remedy keywords
  const hindiKeywords = [
    /उपाय/,
    /परिहार/,
    /समाधान/,
    /दोष निवारण/,
    /ग्रह शांति/,
    /शांति पूजा/,
    /पूजा/,
    /हवन/,
    /होम/,
    /अनुष्ठान/,
    /दान/,
    /व्रत/,
    /क्या करूं/,
    /क्या करना चाहिए/,
    /निवारण/,
    /कैसे ठीक करें/,
  ];

  // Tamil remedy keywords
  const tamilKeywords = [
    /பரிகார/,
    /தீர்வு/,
    /தோஷ நிவர்த்தி/,
    /சாந்தி/,
    /பூஜை/,
    /ஹோமம்/,
    /தானம்/,
    /விரதம்/,
    /என்ன செய்ய வேண்டும்/,
    /எப்படி சரி செய்வது/,
    /வழிபாடு/,
  ];

  return (
    englishKeywords.some((r) => r.test(q)) ||
    teluguKeywords.some((r) => r.test(query)) ||
    hindiKeywords.some((r) => r.test(query)) ||
    tamilKeywords.some((r) => r.test(query))
  );
}

export async function GET(req: Request) {
  try {
    const settings = await getSettings();
    const pricePerPrompt =
      Number(settings.aiChatPricePerMinute ?? settings.aiChatPricePerPrompt) >= 0
        ? Number(settings.aiChatPricePerMinute ?? settings.aiChatPricePerPrompt)
        : 5;
    const pricePerPromptUSD =
      Number(settings.aiChatPricePerMinuteUSD ?? settings.aiChatPricePerPromptUSD) >= 0
        ? Number(settings.aiChatPricePerMinuteUSD ?? settings.aiChatPricePerPromptUSD)
        : 0.10;
    
    // Ensure document has price persisted
    try {
      await adminDb.collection('settings').doc('general').set({ 
        aiChatPricePerPrompt: pricePerPrompt,
        aiChatPricePerPromptUSD: pricePerPromptUSD,
      }, { merge: true });
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
      pricePerPromptUSD,
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

function generateVedicFallbackResponse(params: {
  vedikaAnswer?: string;
  vedikaRecommendations?: string[];
  userQuery: string;
  userName: string;
  language: string;
  chart: any;
  evidence: any;
  currentYear: number;
  personaName: string;
  pariharProtocol?: RemedyProtocol48Day | null;
  isRemedyRequested?: boolean;
  lalKitabData?: any;
}): {
  reply: string;
  conclusion: string;
  timingWindow: string;
  whyAstroPariharSaysThis: string[];
  diagnosis: any;
  confidence: 'Strong' | 'Moderate' | 'Mixed';
  confidenceRationale: string;
  needsAstrologerReview: boolean;
  escalationReason: string;
  recommendations: string[];
  pariharProtocol: RemedyProtocol48Day | null;
} {
  const {
    vedikaAnswer,
    vedikaRecommendations = [],
    userQuery,
    userName,
    language,
    chart,
    evidence,
    currentYear,
    personaName,
    pariharProtocol,
    isRemedyRequested,
    lalKitabData,
  } = params;

  const isTelugu = language === 'Telugu' || language === 'te';
  const isHindi = language === 'Hindi' || language === 'hi';
  const isTamil = language === 'Tamil' || language === 'ta';
  const isKannada = language === 'Kannada' || language === 'kn';
  const isMalayalam = language === 'Malayalam' || language === 'ml';

  // 1. Coordinates and Dasha
  const lagna = chart?.ascendant || 'Vedic Ascendant';
  const moonRashi = chart?.moonSign || 'Vedic Moon';
  const nakshatra = chart?.nakshatra || 'Auspicious Nakshatra';
  const nakshatraPada = chart?.planetaryDegrees?.find((p: any) => p.planet === 'Moon')?.pada || 1;
  const dashaSummary =
    evidence?.activeDashaSummary ||
    (chart?.dasha ? `${chart.dasha.currentMahadasha} Mahadasha (${chart.dasha.currentAntardasha || ''})` : 'Active Vimshottari Cycle');
  const timing = evidence?.timingWindow || `${currentYear} Auspicious Planetary Alignment`;

  // 2. Transits & House Alignments
  const targetHouses = evidence?.relevantHouseNumbers?.join(', ') || '1, 5, 9, 10';
  const supporting = evidence?.supportingFactors || [
    'Benefic planetary alignments support positive karmic transformation.',
    'Active Dasha lord forms favorable angle with key functional houses.'
  ];
  const contradictory = evidence?.contradictoryFactors || [
    'Saturn transit demands methodical discipline, patience, and ethical clarity.'
  ];

  // 3. Parihar Protocol Synthesis
  const activeProtocol = pariharProtocol || (chart ? generate48DayRemedyProtocol({
    domain: evidence?.domainTitle || 'All-Round Prosperity & Peace',
    concern: userQuery,
  }) : null);

  const presidingDeity = activeProtocol?.presidingDeity || chart?.ishtaDevata?.deityName || 'Bhagavan Shiva & Devi Parvathi';
  const homamName = activeProtocol?.recommendedHomam || 'Sri Navagraha & Maha Mrityunjaya Homam';
  const homamDay = activeProtocol?.homamAuspiciousDay || 'Monday or Thursday during Shukla Paksha';
  const dailyMantra = activeProtocol?.dailyMantra || chart?.ishtaDevata?.primaryMantra || 'Om Namah Shivaya';
  const japaCount = activeProtocol?.dailyJapaCount || '108 times during sunrise';
  const charityDaana = activeProtocol?.midMandalaMilestoneDay24?.charityDaana || 'Feed cows, birds, or donate food grains to the needy';
  const culminationAction = activeProtocol?.culminationDay48?.action || 'Sacred temple darshan, deepa daana, and coconut offering';

  // 4. Varjya (Forbidden Action) from Lal Kitab
  const varjyaWarning = lalKitabData?.varjyaAlerts?.[0]?.actionToAvoid;

  // 5. Construct Culturally Rich, In-Depth Consultation Reply
  let responseBody = '';

  const isDirectCalculation =
    /calculate|exact degree|planetary position|ayanamsa|birth-chart information|testing your astronomical|nakshatra lord|pada|provenance|calculation engine|which engine|what engine|api used|remaining arc|dasha balance|do not invent|lahiri|sidereal zodiac/i.test(
      userQuery
    );

  const cleanVedika = (vedikaAnswer || '')
    .replace(/(\r\n|\n)+[—–-]\s*Vedika\s*$/i, '')
    .replace(/(\r\n|\n)+Vedika\s*$/i, '')
    .trim();

  const domain = evidence?.domain || 'general';

  if (isDirectCalculation && chart) {
    const planetsFormatted = chart.planetaryDegrees
      .map(
        (p: any) =>
          `• **${p.planet}**: ${p.rashi} (${p.dms}) — House: ${p.house}, Nakshatra: ${p.nakshatra}`
      )
      .join('\n');

    responseBody = `**Namaste! AstroParihar Precision Ephemeris Chart Calculation** 🙏

### 🪐 Calculation Provenance & Astrological Standards:
• **Calculation Engine**: AstroParihar High-Precision Ephemeris Engine (Swiss-standard celestial mechanics, IAU ephemeris)
• **Zodiac System**: Vedic Sidereal Zodiac (Nirayana)
• **Ayanamsa**: ${chart.ayanamsa.name} — ${chart.ayanamsa.formatted} (${chart.ayanamsa.valueDeg.toFixed(4)}°)
• **Native**: ${chart.name}, Born: ${chart.dob} at ${chart.tob}, ${chart.pob}

### 📐 Exact Natal Planetary Coordinates & Ascendant:
• **Ascendant (Lagna)**: **${chart.ascendant}** at **${chart.ascendantDms}** (${chart.ascendantDegree}), Lagna Lord: **${chart.ascendantLord}**
• **Moon Sign (Chandra Rashi)**: **${chart.moonSign}**
• **Moon Longitude**: **${chart.moonLongitudeDms}** in ${chart.moonSign} (Total Sidereal: ${chart.moonLongitude.toFixed(4)}°)
• **Moon Nakshatra & Pada**: **${chart.nakshatra}** (Lord: **${chart.nakshatraLord}**, Pada: **${chart.nakshatraPada || 4}**)

### ⏳ Exact Vimshottari Dasha Mathematical Derivation:
• **Total Nakshatra Arc**: ${chart.dasha.totalNakshatraArc || '13° 20\' 00" (48,000 arcseconds)'}
• **Remaining Arc in Birth Nakshatra**: **${chart.dasha.remainingArc}**
• **Birth Mahadasha**: **${chart.dasha.birthDashaLord} Mahadasha** (Full Span: ${chart.dasha.birthDashaSpan}y)
• **Birth Dasha Balance**: **${chart.dasha.birthDashaBalanceFormatted}**
• **Mathematical Formula**: ${chart.dasha.birthDashaFormula}
• **Running Antardasha at Birth**: **${chart.dasha.birthAntardashaAtBirth}**
• **Active Vimshottari Cycle (as of ${chart.dasha.asOfDate || `${currentYear}`}):**
  - **Current Mahadasha**: **${chart.dasha.currentMahadasha}** (${chart.dasha.startDate} to ${chart.dasha.endDate})
  - **Current Antardasha**: **${chart.dasha.currentAntardasha}** (${chart.dasha.antarStartDate} to ${chart.dasha.antarEndDate})
  - **Current Pratyantardasha**: **${chart.dasha.currentPratyantardasha}** (${chart.dasha.pratyantarStartDate} to ${chart.dasha.pratyantarEndDate})

### 🌌 Complete Planetary Positions:
${planetsFormatted}

*Calculated facts are derived directly from deterministic celestial mechanics without conversational approximation.*`;
  } else if (cleanVedika && cleanVedika.length >= 25) {
    // ── LIVE VEDIKA AI ENGINE RESPONSE ──────────────────────────────────────────
    // Vedika AI provided an authentic, personalized Vedic answer to the devotee's query!
    let intro = '';
    const hasGreeting = /^(namaste|namaskaram|vanakkam|namaskara|pranam|శుభాశీస్సులు|నమస్కారం|नमस्ते|வணக்கம்|ನಮಸ್ಕಾರ|നമസ്കാരം)/i.test(
      cleanVedika
    );

    if (!hasGreeting) {
      if (isTelugu) {
        intro = `**నమస్కారం మరియు దివ్య శుభాశీస్సులు!** 🙏\n\nనేను **${personaName}**, మీ వేద జ్యోతిష మార్గదర్శకుడిని.\n\n`;
      } else if (isHindi) {
        intro = `**नमस्ते एवं दिव्य आशीर्वाद!** 🙏\n\nमैं **${personaName}**, आपका व्यक्तिगत वैदिक ज्योतिष मार्गदर्शक हूँ।\n\n`;
      } else if (isTamil) {
        intro = `**வணக்கம் மற்றும் திவ்ய ஆசிகள்!** 🙏\n\nநான் **${personaName}**, உங்கள் தனிப்பட்ட வேத ஜோதிட வழிகாட்டி.\n\n`;
      } else if (isKannada) {
        intro = `**ನಮಸ್ಕಾರ ಮತ್ತು ಶುಭಾಶೀರ್ವಾದಗಳು!** 🙏\n\nನಾನು **${personaName}**, ನಿಮ್ಮ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶಕ.\n\n`;
      } else if (isMalayalam) {
        intro = `**നമസ്കാരം ദൈവാനുഗ്രഹവും!** 🙏\n\nഞാൻ **${personaName}**, നിങ്ങളുടെ വേദ ജ്യോതിഷ മാർഗ്ഗദർശി.\n\n`;
      } else {
        intro = `**Namaste and Divine Blessings!** 🙏\n\nI am **${personaName}**, your personal Vedic Astrologer & spiritual guide.\n\n`;
      }
    }

    let remedialSection = '';
    const needsRemedy = isRemedyRequested || isRemedyExplicitlyRequested(userQuery);

    if (needsRemedy && activeProtocol) {
      if (isTelugu) {
        remedialSection = `\n\n### 🪔 48 రోజుల పవిత్ర పరిహార ప్రోటోకాల్ (శాంతి పరిహారాలు)
• **అధిష్టాన దైవం & హోమం**: **${presidingDeity}** అనుగ్రహం కొరకు **${homamName}** (${homamDay}) సంకల్పం చేయించండి.
• **నిత్య సాధన మంత్రం**: ప్రతిరోజూ సూర్యోదయ వేళలో "${dailyMantra}" ను **${japaCount}** భక్తితో జపించండి.
• **24వ రోజు దానం (మధ్యంతర సంకల్పం)**: ${charityDaana}.
• **48వ రోజు పూర్ణాహుతి**: ${culminationAction}.
${varjyaWarning ? `• **లాల్ కితాబ్ వర్జ్య నియమం (నిషేధాలు)**: ${varjyaWarning}. ఎట్టి పరిస్థితుల్లోనూ దీనిని చేయకూడదు.` : ''}`;
      } else if (isHindi) {
        remedialSection = `\n\n### 🪔 48-दिवसीय पवित्र परिहार संकल्प
• **अधिष्ठाता देव एवं होम**: **${presidingDeity}** की प्रसन्नता हेतु **${homamName}** (${homamDay}) का अनुष्ठान कराएं।
• **दैनिक साधना मंत्र**: प्रतिदिन सूर्योदय के समय "${dailyMantra}" का **${japaCount}** श्रद्धापूर्वक जप करें।
• **24वें दिन का दान**: ${charityDaana}।
• **48वें दिन पूर्णाहुति**: ${culminationAction}।
${varjyaWarning ? `• **लाल किताब वर्ज्य नियम**: ${varjyaWarning}। इसका कड़ाई से पालन करें।` : ''}`;
      } else if (isTamil) {
        remedialSection = `\n\n### 🪔 48 நாட்கள் பரிகார சங்கல்பம்
• **இஷ்ட தெய்வம் & ஹோமம்**: **${presidingDeity}** அருளுக்காக **${homamName}** (${homamDay}) சங்கல்பம் செய்யவும்.
• **தினசரி மந்திர ஜெபம்**: தினமும் "${dailyMantra}" மந்திரத்தை **${japaCount}** முறை ஜெபிக்கவும்.
• **24-வது நாள் தானம்**: ${charityDaana}.
• **48-வது நாள் பூர்ணாஹுதி**: ${culminationAction}.`;
      } else if (isKannada) {
        remedialSection = `\n\n### 🪔 48 ದಿನಗಳ ಪವಿತ್ರ ಪರಿಹಾರ ಸಂಕಲ್ಪ
• **ಅಧಿಷ್ಠಾನ ದೈವ & ಹೋಮ**: **${presidingDeity}** ಅನುಗ್ರಹಕ್ಕಾಗಿ **${homamName}** (${homamDay}) ಸಂಕಲ್ಪ ಮಾಡಿ.
• **ನಿತ್ಯ ಮಂತ್ರ ಜಪ**: ಪ್ರತಿದಿನ "${dailyMantra}" ಮಂತ್ರವನ್ನು **${japaCount}** ಬಾರಿ ಶ್ರದ್ಧೆಯಿಂದ ಜಪಿಸಿ.
• **24ನೇ ದಿನದ ದಾನ**: ${charityDaana}.
• **48ನೇ ದಿನ ಪೂರ್ಣಾಹುತಿ**: ${culminationAction}.`;
      } else if (isMalayalam) {
        remedialSection = `\n\n### 🪔 48 ദിവസത്തെ പരിഹാര സങ്കൽപം
• **ഇഷ്ടദേവത & ഹോമം**: **${presidingDeity}** പ്രീതിക്കായി **${homamName}** (${homamDay}) അനുഷ്ഠിക്കുക.
• **നിത്യ മന്ത്ര ജപം**: ദിവസവും "${dailyMantra}" **${japaCount}** തവണ ജപിക്കുക.
• **24-ാം ദിവസം ദാനം**: ${charityDaana}.
• **48-ാം ദിവസം പൂർണ്ണാഹുതി**: ${culminationAction}.`;
      } else {
        remedialSection = `\n\n### 🪔 48-Day Sacred Mandala Parihar Protocol
• **Presiding Deity & Homam**: Consecrate the **${homamName}** dedicated to **${presidingDeity}** on an auspicious **${homamDay}**.
• **Daily Sadhana Mantra**: Recite the sacred mantra "${dailyMantra}" **${japaCount}** during Brahma Muhurta or sunrise.
• **Day 24 Sacred Daana (Mid-Mandala)**: ${charityDaana}.
• **Day 48 Purnahuti (Culmination)**: ${culminationAction}.
${varjyaWarning ? `• **Lal Kitab Varjya (Forbidden Action)**: ${varjyaWarning}. Avoid this strictly to preserve spiritual merits.` : ''}`;
      }
    }

    let benediction = '';
    if (isTelugu) {
      benediction = `\n\nభగవాన్ పరమశివుడు మరియు జగన్మాత పార్వతీదేవి దివ్య అనుగ్రహంతో మీ సకల కోరికలు నెరవేరి, ఆయురారోగ్య ఐశ్వర్యాలు కలగాలని ఆశీర్వదిస్తున్నాను. **ఓం శాంతిః!**`;
    } else if (isHindi) {
      benediction = `\n\nभगवान शिव और माता पार्वती की असीम अनुकंपा से आपका जीवन सुख, शांति और सौभाग्य से परिपूर्ण हो। **ॐ शांतिः!**`;
    } else if (isTamil) {
      benediction = `\n\nசிவபெருமான் மற்றும் அன்னை பார்வதியின் திருவருளால் உங்கள் வாழ்வில் அனைத்து நன்மைகளும் அமைதியும் பெருகட்டும். **ஓம் சாந்தி!**`;
    } else if (isKannada) {
      benediction = `\n\nಭಗವಾನ್ ಶಿವ ಮತ್ತು ಪಾರ್ವತಿ ದೇವಿಯ ದಿವ್ಯ ಆಶೀರ್ವಾದದಿಂದ ನಿಮ್ಮ ಸರ್ವ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಸಲಿ. **ಓಂ ಶಾಂತಿಃ!**`;
    } else if (isMalayalam) {
      benediction = `\n\nഭഗവാൻ ശിവന്റെയും പാർവ്വതീദേവിയുടെയും ദിവ്യാനുഗ്രഹത്താൽ സർവ്വ ഐശ്വര്യങ്ങളും ഉണ്ടാകട്ടെ. **ഓം ശാന്തിഃ!**`;
    } else {
      benediction = `\n\nMay Lord Shiva and Goddess Parvathi shower their divine grace upon your path with peace, clarity, protection, and fulfillment. **Om Shanti!**`;
    }

    responseBody = `${intro}${cleanVedika}${remedialSection}${benediction}`;
  } else if (isTelugu) {
    // ── DETERMINISTIC LOCAL ENGINE FALLBACK (TELUGU) ──────────────────────────
    let domainSpecificInsights = '';
    if (domain === 'career' || domain === 'profession') {
      domainSpecificInsights = `\n### 💼 కెరీర్ & ఉద్యోగ విశ్లేషణ (10వ భావ పరిశీలన)
• మీ జాతకంలో 10వ స్థానం (కర్మ స్థానం) మరియు 6వ స్థానం (సేవా స్థానం) బలమైన గ్రహాల దృష్టిలో ఉన్నాయి.
• ప్రస్తుత వింశోత్తరి దశ (${dashaSummary}) నూతన అవకాశాలు, ప్రమోషన్ లేదా ఉద్యోగ మార్పుకు కీలకమైన సూచనలు ఇస్తోంది.
• ఓర్పుతో కూడిన ప్రయత్నాలు, సాంకేతిక నైపుణ్యాల పెంపుదల ఈ కాలంలో శాశ్వత స్థిరత్వాన్ని చేకూరుస్తాయి.`;
    } else if (domain === 'marriage' || domain === 'relationship') {
      domainSpecificInsights = `\n### ❤️ వివాహ యోగం & దాంపత్య విశ్లేషణ (7వ భావ పరిశీలన)
• మీ జాతకంలో 7వ స్థానం (కళత్ర స్థానం) మరియు శుక్ర-గురు గ్రహాల స్థితులు వివాహ ప్రయత్నాలకు దోహదపడుతున్నాయి.
• భాగస్వామి ఎంపికలో పరస్పర గ్రహ మైత్రి మరియు గుణ మేళనం అత్యంత శుభప్రదమైన ఫలితాలను అందిస్తాయి.
• గౌరీ-శంకర ఆరాధన వివాహ సంబంధాల్లో ఆటంకాలను తొలగించి అనుకూలమైన దాంపత్యాన్ని ప్రసాదిస్తుంది.`;
    } else if (domain === 'financial' || domain === 'wealth') {
      domainSpecificInsights = `\n### 💰 ఆర్థిక స్థితి & ధన యోగ విశ్లేషణ (2, 11వ భావాలు)
• ధన స్థానం (2వ భావం) మరియు లాభ స్థానం (11వ భావం) శుభ గ్రహ వీక్షణతో సత్ఫలితాలను ఇచ్చేందుకు సిద్ధంగా ఉన్నాయి.
• క్రమబద్ధమైన పొదుపు మరియు దీర్ఘకాలిక పెట్టుబడులు లాభదాయకంగా ఉంటాయి. అనవసర రిస్క్ తీసుకోకూడదు.`;
    } else {
      domainSpecificInsights = `\n### 🪐 ${currentYear} గ్రహ సంచారాలు & భావ ఫలితాలు
• **గురు భగవానుని అనుగ్రహం**: దేవగురువు బృహస్పతి సంచారం మీ కేంద్ర-త్రికోణ భావాలపై అమృత దృష్టిని సారిస్తోంది.
• **శని భగవానుని ప్రభావం**: శని సంచారం మీ కర్మ స్థానాన్ని క్రమశిక్షణతో కూడిన సాధనకు పురికొల్పుతోంది.
• **ప్రభావిత భావాలు**: మీ ప్రశ్నకు సంబంధించిన (${targetHouses}) భావాలు క్రియాశీలకంగా ఉన్నాయి. ${supporting.slice(0, 2).map((s: string) => `ఈ కాలంలో ${s}`).join(' ')}`;
    }

    responseBody = `**నమస్కారం మరియు శుభాశీస్సులు!** 🙏

నేను **${personaName}**, మీ వ్యక్తిగత వేద జ్యోతిష మార్గదర్శకుడిని. మీ జాతక చక్రం మరియు ${currentYear} గ్రహ స్థితుల ఆధారంగా సమగ్ర విశ్లేషణ:

### 🔮 జాతక చక్ర పరిశీలన & గ్రహ స్థితి
• **లగ్నం & చంద్ర రాశి**: మీరు **${lagna} లగ్నం** మరియు **${moonRashi} రాశి (${nakshatra} నక్షత్రం, ${nakshatraPada}వ పాదం)** లో జన్మించారు.
• **ప్రస్తుత వింశోత్తరి దశ**: ప్రస్తుతం మీకు **${dashaSummary}** నడుస్తోంది.
${domainSpecificInsights}

### ⏳ శుభ సమయం & కాల పరిమితి
మీ జాతక గ్రహ సంచారాల అనుకూలత ప్రకారం, **${timing}** అత్యంత కీలకమైన మరియు అనుకూలమైన కాలం.

### 🪔 48 రోజుల పవిత్ర పరిహార ప్రోటోకాల్ (శాంతి పరిహారాలు)
• **అధిష్టాన దైవం & హోమం**: **${presidingDeity}** అనుగ్రహం కొరకు **${homamName}** (${homamDay}) సంకల్పం చేయించండి.
• **నిత్య సాధన మంత్రం**: ప్రతిరోజూ సూర్యోదయ వేళలో "${dailyMantra}" ను **${japaCount}** భక్తితో జపించండి.
• **24వ రోజు దానం**: ${charityDaana}.
• **48వ రోజు పూర్ణాహుతి**: ${culminationAction}.
${varjyaWarning ? `• **లాల్ కితాబ్ వర్జ్య నియమం**: ${varjyaWarning}. ఎట్టి పరిస్థితుల్లోనూ దీనిని చేయకూడదు.` : ''}

భగవాన్ పరమశివుడు మరియు జగన్మాత పార్వతీదేవి దివ్య అనుగ్రహంతో మీ సకల కోరికలు నెరవేరాలని ఆశీర్వదిస్తున్నాను. **ఓం శాంతిః!**`;
  } else if (isHindi) {
    // ── DETERMINISTIC LOCAL ENGINE FALLBACK (HINDI) ───────────────────────────
    let domainSpecificInsights = '';
    if (domain === 'career' || domain === 'profession') {
      domainSpecificInsights = `\n### 💼 करियर एवं आजीविका विश्लेषण (दशम भाव)
• आपकी जन्म पत्रिका में दशम भाव (कर्म) एवं षष्ठ भाव (सेवा) पर शुभ ग्रहों का प्रभाव बना हुआ है।
• वर्तमान दशा (${dashaSummary}) नई पदोन्नति, कार्यक्षेत्र में सम्मान एवं स्थिरता के लिए अत्यंत अनुकूल है।`;
    } else if (domain === 'marriage' || domain === 'relationship') {
      domainSpecificInsights = `\n### ❤️ विवाह योग एवं दांपत्य विश्लेषण (सप्तम भाव)
• सप्तम भाव एवं गुरु-शुक्र की अनुकूल दृष्टि से विवाह हेतु शुभ प्रस्ताव एवं अनुकूल समय बन रहा है।
• परस्पर विचार सामंजस्य एवं धैर्य से वैवाहिक जीवन सुखमय रहेगा।`;
    } else {
      domainSpecificInsights = `\n### 🪐 वर्ष ${currentYear} ग्रह गोचर एवं भाव प्रभाव
• **देवगुरु बृहस्पति की कृपा**: गुरु का शुभ गोचर आपके केंद्र एवं त्रिकोण भावों को ऊर्जावान कर रहा है।
• **शनि देव का प्रभाव**: शनि का प्रभाव आपको निरंतर परिश्रम एवं सत्यनिष्ठा की प्रेरणा दे रहा है।`;
    }

    responseBody = `**नमस्ते एवं आशीर्वाद!** 🙏

मैं **${personaName}**, आपका व्यक्तिगत वैदिक ज्योतिष मार्गदर्शक हूँ। आपकी जन्म कुंडली एवं वर्ष ${currentYear} के ग्रह गोचर का संपूर्ण विश्लेषण प्रस्तुत है:

### 🔮 जन्म कुंडली विश्लेषण एवं ग्रह दशा
• **लग्न एवं चंद्र राशि**: आपका जन्म **${lagna} लग्न** एवं **${moonRashi} चंद्र राशि (${nakshatra} नक्षत्र, चरण ${nakshatraPada})** में हुआ है।
• **सक्रिय विंशोत्तरी दशा**: वर्तमान में आपकी **${dashaSummary}** गतिशील है।
${domainSpecificInsights}

### ⏳ शुभ कालखंड एवं समय सीमा
आपकी कुंडली के अनुसार **${timing}** का समय अत्यंत फलदायी एवं कल्याणकारी रहेगा।

### 🪔 48-दिवसीय पवित्र परिहार संकल्प
• **अधिष्ठाता देव एवं होम**: **${presidingDeity}** की प्रसन्नता हेतु **${homamName}** (${homamDay}) का अनुष्ठान कराएं।
• **दैनिक साधना मंत्र**: प्रतिदिन सूर्योदय के समय "${dailyMantra}" का **${japaCount}** श्रद्धापूर्वक जप करें।
• **24वें दिन का दान**: ${charityDaana}।
• **48वें दिन पूर्णाहुति**: ${culminationAction}।
${varjyaWarning ? `• **लाल किताब वर्ज्य नियम**: ${varjyaWarning}।` : ''}

भगवान शिव और माता पार्वती की असीम अनुकंपा से आपका जीवन सुख-शांति से परिपूर्ण हो। **ॐ शांतिः!**`;
  } else if (isKannada) {
    // ── DETERMINISTIC LOCAL ENGINE FALLBACK (KANNADA) ─────────────────────────
    responseBody = `**ನಮಸ್ಕಾರ ಮತ್ತು ಶುಭಾಶೀರ್ವಾದಗಳು!** 🙏

ನಾನು **${personaName}**, ನಿಮ್ಮ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶಕ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ ಮತ್ತು ${currentYear} ಗ್ರಹ ಸಂಚಾರದ ಆಧಾರದ ಮೇಲೆ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ:

### 🔮 ಜನ್ಮ ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ & ಗ್ರಹ ಸ್ಥಿತಿ
• **ಲಗ್ನ & ಚಂದ್ರ ರಾಶಿ**: ನೀವು **${lagna} ಲಗ್ನ** ಮತ್ತು **${moonRashi} ರಾಶಿ (${nakshatra} ನಕ್ಷತ್ರ, ಪಾದ ${nakshatraPada})** ದಲ್ಲಿ ಜನಿಸಿದ್ದೀರಿ.
• **ಪ್ರಸ್ತುತ ವಿಂಶೋತ್ತರಿ ದಶೆ**: ಪ್ರಸ್ತುತ ನಿಮಗೆ **${dashaSummary}** ನಡೆಯುತ್ತಿದೆ. ಈ ಕಾಲ ನಿಮ್ಮ ನಿರ್ಧಾರಗಳಿಗೆ ಬಹುಮುಖ್ಯ ತಿರುವು ನೀಡಲಿದೆ.

### 🪐 ಗ್ರಹ ಸಂಚಾರ & ಶುಭ ಕಾಲ
• ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳು ಬಲಗೊಳ್ಳುತ್ತಿವೆ.
• ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಅನುಗುಣವಾಗಿ, **${timing}** ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ಕಾಲವಾಗಿದೆ.

### 🪔 48 ದಿನಗಳ ಪವಿತ್ರ ಪರಿಹಾರ ಸಂಕಲ್ಪ
• **ಅಧಿಷ್ಠಾನ ದೈವ & ಹೋಮ**: **${presidingDeity}** ಅನುಗ್ರಹಕ್ಕಾಗಿ **${homamName}** (${homamDay}) ಸಂಕಲ್ಪ ಮಾಡಿ.
• **ನಿತ್ಯ ಮಂತ್ರ ಜಪ**: ಪ್ರತಿದಿನ "${dailyMantra}" ಮಂತ್ರವನ್ನು **${japaCount}** ಬಾರಿ ಶ್ರದ್ಧೆಯಿಂದ ಜಪಿಸಿ.
• **24ನೇ ದಿನದ ದಾನ**: ${charityDaana}.
• **48ನೇ ದಿನ ಪೂರ್ಣಾಹುತಿ**: ${culminationAction}.

ಭಗವಾನ್ ಶಿವ ಮತ್ತು ಪಾರ್ವತಿ ದೇವಿಯ ದಿವ್ಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಸಕಲ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಸಲಿ. **ಓಂ ಶಾಂತಿಃ!**`;
  } else if (isMalayalam) {
    // ── DETERMINISTIC LOCAL ENGINE FALLBACK (MALAYALAM) ───────────────────────
    responseBody = `**നമസ്കാരം ദൈവാനുഗ്രഹവും!** 🙏

ഞാൻ **${personaName}**, നിങ്ങളുടെ വേദ ജ್ಯോതിഷ മാർഗ്ഗദർശി. നിങ്ങളുടെ ജാതകവും ${currentYear}-ലെ ഗ്രഹസ്ഥിതിയും അടിസ്ഥാനമാക്കിയുള്ള സമഗ്ര ജ്യോതിഷ വിശകലനം:

### 🔮 ജാതക നിരൂപണവും ദശാഫലവും
• **ലഗ്നവും ചന്ദ്ര രാശിയും**: നിങ്ങൾ **${lagna} ലഗ്നത്തിലും** **${moonRashi} രാശിയിലും (${nakshatra} നക്ഷത്രം, പാദം ${nakshatraPada})** ജനിച്ചിരിക്കുന്നു.
• **നടപ്പു വിംശോത്തരി ദശ**: നിലവിൽ **${dashaSummary}** ദശാകാലത്തിലൂടെയാണ് കടന്നുപോകുന്നത്.

### 🪐 ഗ്രഹ സഞ്ചാര ഫലങ്ങളും ശുഭ മുഹൂർത്തവും
• വ്യാഴത്തിന്റെ ശുഭദൃഷ്ടി സർവ്വ കാര്യങ്ങളിലും വിജയം നൽകും.
• നിങ്ങളുടെ ജാതകപ്രകാരം, **${timing}** ഏറ്റവും അനുയോജ്യമായ സമയമാണ്.

### 🪔 48 ദിവസത്തെ പരിഹാര സങ്കൽപം
• **ഇഷ്ടദേവത & ഹോമം**: **${presidingDeity}** പ്രീതിക്കായി **${homamName}** (${homamDay}) അനുഷ്ഠിക്കുക.
• **നിത്യ മന്ത്ര ജപം**: ദിവസവും "${dailyMantra}" **${japaCount}** തവണ ജപിക്കുക.
• **24-ാം ദിവസം ദാനം**: ${charityDaana}.
• **48-ാം ദിവസം പൂർണ്ണാഹുതി**: ${culminationAction}.

ഭഗവാൻ ശിവന്റെയും പാർവ്വതീദേവിയുടെയും ദിവ്യാനുഗ്രഹത്താൽ സർവ്വ ഐശ്വര്യങ്ങളും ഉണ്ടാകട്ടെ. **ഓം ശാന്തിഃ!**`;
  } else if (isTamil) {
    // ── DETERMINISTIC LOCAL ENGINE FALLBACK (TAMIL) ───────────────────────────
    responseBody = `**வணக்கம் மற்றும் ஆசிகள்!** 🙏

நான் **${personaName}**, உங்கள் தனிப்பட்ட வேத ஜோதிடர் மற்றும் ஆன்மீக வழிகாட்டி. உங்கள் ஜாதகம் மற்றும் ${currentYear} கிரக நிலைகளின் அடிப்படையிலான வேத வழிகாட்டுதல்:

### 🔮 ஜாதக ஆய்வு & தசா இருப்பு
• **லக்னம் & ராசி**: நீங்கள் **${lagna} லக்னம்** மற்றும் **${moonRashi} சந்திர ராசி (${nakshatra} நட்சத்திரம், பாதம் ${nakshatraPada})** இல் பிறந்துள்ளீர்கள்.
• **நடப்பு விம்சோத்தரி தசா**: தற்போது உங்களுக்கு **${dashaSummary}** நடைபெறுகிறது.

### 🪐 ${currentYear} கிரக பெயர்ச்சி & சுப காலம்
• குரு பகவானின் சுப பார்வை உங்கள் காரியங்களில் முன்னேற்றத்தை தரும்.
• உங்கள் கிரக அமைப்பின்படி, **${timing}** மிக உகந்த முன்னேற்ற காலமாகும்.

### 🪔 48 நாட்கள் பரிகார சங்கல்பம்
• **இஷ்ட தெய்வம் & ஹோமம்**: **${presidingDeity}** அருளுக்காக **${homamName}** (${homamDay}) சங்கல்பம் செய்யவும்.
• **தினசரி மந்திர ஜெபம்**: தினமும் "${dailyMantra}" மந்திரத்தை **${japaCount}** முறை ஜெபிக்கவும்.
• **24-வது நாள் தானம்**: ${charityDaana}.
• **48-வது நாள் பூர்ணாஹுதி**: ${culminationAction}.

சிவபெருமான் மற்றும் அன்னை பார்வதியின் திருவருளால் அனைத்து நன்மைகளும் பெருகட்டும். **ஓம் சாந்தி!**`;
  } else {
    // ── DETERMINISTIC LOCAL ENGINE FALLBACK (ENGLISH) ─────────────────────────
    let domainSpecificInsights = '';
    if (domain === 'career' || domain === 'profession') {
      domainSpecificInsights = `\n### 💼 Career & Professional Trajectory (10th Bhava Analysis)
• Your 10th House of Career (Karma Sthana) receives supportive cosmic aspects from Lagna and transit benefic influences.
• The governing ${dashaSummary} cycle signals a pivotal window for career advancement, skill consolidation, and financial elevation.
• Disciplined, methodical action during this phase creates long-lasting stability and professional recognition.`;
    } else if (domain === 'marriage' || domain === 'relationship') {
      domainSpecificInsights = `\n### ❤️ Marriage & Partnership Dynamics (7th Bhava Analysis)
• The 7th House of Partnership (Kalatra Sthana) is actively stimulated by key transits, fostering relationship clarity and opportune alliances.
• Mutual intellectual harmony and patience will ensure smooth domestic alignment.`;
    } else if (domain === 'financial' || domain === 'wealth') {
      domainSpecificInsights = `\n### 💰 Financial Prospects & Wealth Accumulation (2nd & 11th Bhavas)
• Favorable planetary geometry across your Wealth (Dhana) and Gains (Labha) houses fosters sustainable income and asset appreciation.
• Avoid speculative gambles; strategic long-term investments will yield enduring returns.`;
    } else {
      domainSpecificInsights = `\n### 🪐 ${currentYear} Planetary Transits & House Dynamics
• **Jupiter's Benevolent Trine**: Throughout ${currentYear}, Jupiter (Brihaspati) casts auspicious benefic aspects across your core Kendra and Trikona houses.
• **Saturn's Karmic Realism**: Saturn demands disciplined execution and ethical steadfastness in all pursuits.
• **Target Bhavas Activated**: Houses (${targetHouses}) are energized for your inquiry. ${supporting.slice(0, 2).join(' ')}`;
    }

    responseBody = `**Namaste and Divine Blessings!** 🙏

I am **${personaName}**, your personal Vedic Astrologer & spiritual guide. Here is the comprehensive Vedic Jyotish consultation for your inquiry:

### 🔮 Vedic Astrological Diagnosis & Kundli Coordinates
• **Ascendant (Lagna) & Moon Sign**: You are born with **${lagna} Ascendant** and **${moonRashi} Moon Sign (${nakshatra} Nakshatra, Pada ${nakshatraPada})**.
• **Active Vimshottari Cycle**: You are currently navigating your **${dashaSummary}**.
${domainSpecificInsights}

### ⏳ Potent Astrological Timing Window
According to your transits and dasha alignments, the most auspicious window for forward momentum is **${timing}**.

### 🪔 48-Day Sacred Mandala Parihar Protocol
• **Presiding Deity & Homam**: Consecrate the **${homamName}** dedicated to **${presidingDeity}** on an auspicious **${homamDay}**.
• **Daily Sadhana Mantra**: Recite the sacred mantra "${dailyMantra}" **${japaCount}** during Brahma Muhurta or sunrise.
• **Day 24 Sacred Daana (Mid-Mandala)**: ${charityDaana}.
• **Day 48 Purnahuti (Culmination)**: ${culminationAction}.
${varjyaWarning ? `• **Lal Kitab Varjya (Forbidden Action)**: ${varjyaWarning}. Avoid this strictly to preserve spiritual merits.` : ''}

May Lord Shiva and Goddess Parvathi shower their divine grace upon your path with peace, clarity, protection, and fulfillment. **Om Shanti!**`;
  }

  // 6. Definitive Conclusion
  const conclusion = isTelugu
    ? `${timing} సమయం మీ కుండలిలోని గ్రహానుకూలత ద్వారా శుభ ఫలితాలు మరియు నూతన పురోగతికి మార్గం సుగమం చేస్తుంది.`
    : isHindi
    ? `${timing} की समयावधि ग्रह गोचर एवं दशा अनुकूलता से आपके जीवन में प्रगति और सकारात्मक परिणाम लेकर आएगी।`
    : isTamil
    ? `${timing} காலம் உங்கள் ஜாதக சுப கிரக சேர்க்கையால் வாழ்க்கையில் அமைதியையும் முன்னேற்றத்தையும் தரும்.`
    : isKannada
    ? `${timing} ಸಮಯವು ನಿಮ್ಮ ಕುಂಡಲಿಯ ಗ್ರಹಬಲದಿಂದ ಸಕಾರಾತ್ಮಕ ಬದಲಾವಣೆ ಮತ್ತು ಯಶಸ್ಸನ್ನು ತರಲಿದೆ.`
    : isMalayalam
    ? `${timing} കാലഘട്ടം നിങ്ങളുടെ ജാതകത്തിലെ ഗ്രഹാനുകൂല്യം വഴി അഭിവൃദ്ധിയും ശാന്തിയും നൽകും.`
    : `The cosmic alignment during ${timing} offers auspicious momentum for positive life transformation.`;

  // 7. Structured Follow-up Recommendations
  let finalRecommendations: string[] = [];
  if (Array.isArray(vedikaRecommendations) && vedikaRecommendations.length >= 3) {
    finalRecommendations = vedikaRecommendations
      .filter((r) => typeof r === 'string' && r.trim().length > 0)
      .slice(0, 6);
  }

  if (finalRecommendations.length < 4) {
    finalRecommendations = isTelugu
      ? [
          '🔮 2026లో నా గ్రహ సంచారాల ఫలితాలు ఎలా ఉన్నాయి?',
          '✨ నా అదృష్ట రత్నం, రుద్రాక్ష మరియు నిత్య మంత్రం ఏమిటి?',
          '💼 కెరీర్ మార్పు లేదా ప్రమోషన్‌కు సరైన సమయం ఎప్పుడు?',
          '❤️ వివాహ యోగం మరియు భాగస్వామి అనుకూలత ఎప్పుడు బాగుంటుంది?',
          '🪐 నాకు శని సాడే సాతి లేదా రాహు మహర్దశ నడుస్తుందా?',
          '🙏 నా జాతక దోష నివారణకు ఎలాంటి పరిహారాలు లేదా దానం చేయాలి?',
        ]
      : isHindi
      ? [
          '🔮 2026 में मेरे मुख्य ग्रह गोचर का क्या प्रभाव रहेगा?',
          '✨ मेरे लिए भाग्यशाली रत्न, रुद्राक्ष और दैनिक मंत्र क्या है?',
          '💼 करियर में पदोन्नति या व्यापार विस्तार का सबसे शुभ समय कब है?',
          '❤️ मेरे विवाह का शुभ योग कब बनेगा?',
          '🪐 क्या मुझ पर शनि की साढ़ेसाती या राहु की महादशा चल रही है?',
          '🙏 ग्रह शांति के लिए मुझे कौन सा विशेष दान या उपाय करना चाहिए?',
        ]
      : isTamil
      ? [
          '🔮 2026-ல் எனது கிரக பெயர்ச்சி பலன்கள் எப்படி உள்ளன?',
          '✨ எனது அதிர்ஷ்ட ரத்தினம், ருத்ராட்சம் மற்றும் தினசரி மந்திரம் எது?',
          '💼 தொழில் வளர்ச்சி அல்லது வேலை மாற்றத்திற்கு உகந்த நேரம் எப்போது?',
          '❤️ எனது திருமண யோகம் மற்றும் வாழ்க்கை எப்போது அமையும்?',
          '🪐 எனக்கு ஏழரை சனி அல்லது ராகு தசை நடக்கிறதா?',
          '🙏 கிரக தோஷ நிவர்த்திக்கு என்ன பரிகாரம் அல்லது தானம் செய்ய வேண்டும்?',
        ]
      : isKannada
      ? [
          '🔮 2026ರಲ್ಲಿ ನನ್ನ ಗ್ರಹ ಸಂಚಾರದ ಫಲಗಳು ಹೇಗಿವೆ?',
          '✨ ನನ್ನ ಅದೃಷ್ಟ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ ಮತ್ತು ನಿತ್ಯ ಮಂತ್ರ ಯಾವುದು?',
          '💼 ವೃತ್ತಿ ಬೆಳವಣಿಗೆ ಅಥವಾ ಉದ್ಯೋಗ ಬದಲಾವಣೆಗೆ ಶುಭ ಸಮಯ ಯಾವುದು?',
          '❤️ ನನ್ನ ವಿವಾಹ ಯೋಗ ಮತ್ತು ಹೊಂದಾಣಿಕೆ ಯಾವಾಗ ಬರುತ್ತದೆ?',
          '🪐 ನನಗೆ ಸಾಡೇ ಸಾತಿ ಅಥವಾ ರಾಹು ಮಹಾದಶ ನಡೆಯುತ್ತಿದೆಯೇ?',
          '🙏 ಗ್ರಹ ಶಾಂತಿ ಮತ್ತು ದೋಷ ನಿವಾರಣೆಗೆ ಯಾವ ಪರಿಹಾರ ಮಾಡಬೇಕು?',
        ]
      : isMalayalam
      ? [
          '🔮 2026-ൽ എന്റെ ഗ്രഹ സഞ്ചാര ഫലങ്ങൾ എങ്ങനെയാണ്?',
          '✨ എന്റെ ഭാഗ്യ രത്നം, രുദ್ರಾക്ഷം, നിത്യ മന്ത്രം എന്നിവ ഏതാണ്?',
          '💼 കരിയർ മാറ്റത്തിനോ പ്രമോഷനോ അനുയോജ്യമായ സമയം എപ്പോഴാണ്?',
          '❤️ എന്റെ ജാതകത്തിൽ വിവാഹ യೋಗം എപ്പോഴാണ്?',
          '🪐 എനിക്ക് ഇപ്പോൾ ഏഴര ശനിയോ രാహు മഹാദശയോ നടക്കുന്നുണ്ടോ?',
          '🙏 ഗ്രഹ ദോഷ പരിഹാരത്തിനായി എന്തെല്ലാം പൂജകളും ദാനവുമാണ് ചെയ്യേണ്ടത്?',
        ]
      : [
          '🔮 What do planetary transits say for me in 2026?',
          '✨ What is my lucky gemstone, rudraksha & daily mantra?',
          '💼 When is the best time for a career change or promotion?',
          '❤️ When will I meet my compatible life partner?',
          '🪐 Am I currently running Shani Sade Sati or Rahu Mahadasha?',
          '🙏 What specific Vedic remedies or charity should I perform?',
        ];
  }

  const whyPoints = isTelugu
    ? [
        `లగ్నం & చంద్ర రాశి సామరస్యం: ${lagna} లగ్నం మరియు ${moonRashi} రాశ్యాధిపతుల స్థానాలు స్థిరమైన నిర్ణయాలకు బలాన్నిస్తున్నాయి.`,
        `గోచార గ్రహాల అనుకూలత: ${currentYear} లో గురు-శనుల అనుకూల దృష్టి వల్ల (${targetHouses}) భావాలు చైతన్యవంతమవుతున్నాయి.`,
        `వింశోత్తరి దశా ప్రాధాన్యత: ${dashaSummary} కాలంలో క్రమశిక్షణతో కూడిన పరిహారాలు మరియు ధర్మబద్ధమైన చర్యలు ఆశించిన ఫలితాలను ఇస్తాయి.`
      ]
    : isHindi
    ? [
        `लग्न एवं चंद्र राशि सामंजस्य: ${lagna} लग्न एवं ${moonRashi} राशि स्वामियों की स्थिति निर्णयों को सुदृढ़ता प्रदान करती है।`,
        `गोचर ग्रहों का शुभ प्रभाव: वर्ष ${currentYear} में गुरु-शनि का प्रभाव आपके (${targetHouses}) भावों को सक्रिय कर रहा है।`,
        `दशा स्वामी की अनुकूलता: ${dashaSummary} के अंतर्गत नियमपूर्वक किए गए उपाय एवं सदाचार सकारात्मक परिणाम सुनिश्चित करते हैं।`
      ]
    : isTamil
    ? [
        `லக்ன & ராசி பலம்: ${lagna} லக்னம் மற்றும் ${moonRashi} ராசி அதிபதிகள் சாதகமான நிலையில் உள்ளனர்.`,
        `கிரக பெயர்ச்சி தாக்கம்: ${currentYear}-ல் குரு-சனி பெயர்ச்சி உங்கள் (${targetHouses}) ஸ்தானங்களை பலப்படுத்துகிறது.`,
        `தசா புத்தி பலன்கள்: ${dashaSummary} காலத்தில் பரிகாரங்களை முறையாக பின்பற்றுவது தடையற்ற வெற்றியைத் தரும்.`
      ]
    : isKannada
    ? [
        `ಲಗ್ನ ಮತ್ತು ಚಂದ್ರ ರಾಶಿ ಬಲ: ${lagna} ಲಗ್ನ ಮತ್ತು ${moonRashi} ರಾಶ್ಯಾಧಿಪತಿಗಳು ಶುಭ ಫಲ ನೀಡಲು ಸಿದ್ಧರಾಗಿದ್ದಾರೆ.`,
        `ಗೋಚಾರ ಗ್ರಹ ಪ್ರಭಾವ: ${currentYear} ರಲ್ಲಿ ಗುರು ಮತ್ತು ಶನಿಯ ದೃಷ್ಟಿ (${targetHouses}) ಭಾವಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿದೆ.`,
        `ದಶಾ ಫಲಾನುಕೂಲ: ${dashaSummary} ಅವಧಿಯಲ್ಲಿ ಶ್ರದ್ಧೆಯಿಂದ ಕೈಗೊಂಡ ಪರಿಹಾರಗಳು ಶುಭ ತರಲಿವೆ.`
      ]
    : isMalayalam
    ? [
        `ലഗ്ന, ചന്ദ്ര രാശി ബലം: ${lagna} ലഗ്നവും ${moonRashi} രാശിയും അനുകൂല നിലയിലാണ്.`,
        `ഗ്രഹ സഞ്ചാര സ്വാധീനം: ${currentYear}-ൽ വ്യാഴ-ശനി സ്വാധീനം (${targetHouses}) ഭാവങ്ങളെ ഉണർത്തുന്നു.`,
        `ദശാ നാഥന്റെ അനുഗ്രഹം: ${dashaSummary} കാലത്ത് നിഷ്ഠയോടെയുള്ള പ്രാർത്ഥനകൾ ഉത്തമ ഫലം നൽകും.`
      ]
    : [
        `Lagna & Moon Sign Harmony: Placements of ${lagna} Lagna lord and ${moonRashi} Moon lord reinforce foundational vitality.`,
        `Transit Planetary Concurrence: During ${currentYear}, Jupiter and Saturn cast stabilizing aspects on houses (${targetHouses}).`,
        `Active Dasha Alignment: The ${dashaSummary} phase rewards disciplined execution and consecrated remedial protocols.`
      ];

  return {
    reply: responseBody,
    conclusion,
    timingWindow: timing,
    whyAstroPariharSaysThis: whyPoints,
    diagnosis: {
      activeDasha: dashaSummary,
      keyHouses: `Houses ${targetHouses}`,
      supportingFactors: supporting,
      contradictoryFactors: contradictory,
    },
    confidence: (evidence?.confidence || 'Strong') as 'Strong' | 'Moderate' | 'Mixed',
    confidenceRationale: evidence?.confidenceRationale || 'Evaluated across verified ephemeris placements, house lords, and active dasha cycles.',
    needsAstrologerReview: Boolean(evidence?.needsAstrologerReview),
    escalationReason: evidence?.escalationReason || '',
    recommendations: finalRecommendations,
    pariharProtocol: activeProtocol,
  };
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
      astrologerId,
      persona,
      includeProfile,
      includeYearComparison,
      includeTimeline,
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

    // 2. Fetch Dynamic Pricing Setting & Trial
    const settings = await getSettings();
    const currency = body.currency === 'USD' ? 'USD' : 'INR';
    const isUSD = currency === 'USD';
    const pricePerPrompt = isUSD
      ? (Number(settings.aiChatPricePerMinuteUSD ?? settings.aiChatPricePerPromptUSD) >= 0
          ? Number(settings.aiChatPricePerMinuteUSD ?? settings.aiChatPricePerPromptUSD)
          : 0.10)
      : (Number(settings.aiChatPricePerMinute ?? settings.aiChatPricePerPrompt) >= 0
          ? Number(settings.aiChatPricePerMinute ?? settings.aiChatPricePerPrompt)
          : 5);
    const trialAllowed = Number(settings.newUserTrialMinutes ?? 5);

    // 3. Check & Deduct Wallet Balance
    userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();

    let userData = userSnap.exists ? userSnap.data() : null;
    if (!userSnap.exists) {
      const defaultUser = {
        createdAt: new Date().toISOString(),
        walletBalance: 25,
        trialChatPromptsUsed: 0,
        role: 'user',
      };
      await userRef.set(defaultUser, { merge: true });
      userData = defaultUser;
    }

    initialBalance = Number(userData?.walletBalance) || 0;
    const usedTrialPrompts = Number(userData?.trialChatPromptsUsed) || 0;
    const isTrialFreePrompt = trialAllowed > 0 && usedTrialPrompts < trialAllowed;

    if (isTrialFreePrompt) {
      // Complimentary New-User Trial Message!
      await userRef.set({ trialChatPromptsUsed: usedTrialPrompts + 1 }, { merge: true });
      deductedAmount = 0;
    } else if (pricePerPrompt > 0) {
      if (initialBalance < pricePerPrompt) {
        return NextResponse.json(
          {
            error: `Insufficient wallet balance. Each prompt costs ${isUSD ? '$' : '₹'}${pricePerPrompt}, but your available balance is ${isUSD ? '$' : '₹'}${initialBalance}. Please recharge your wallet to continue.`,
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
        currency,
        type: 'debit',
        description: `AI Astrologer Chat Prompt (${language})`,
        serviceType: 'ai-chat',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'success',
        paymentMethod: 'wallet',
      });
    }

    // 4. Resolve AI Engine Keys
    const openaiApiKey = await getServerOpenAIApiKey();
    const vedikaApiKey = await getServerVedikaApiKey();

    if (!openaiApiKey && !vedikaApiKey) {
      // Refund if all keys are missing
      if (deductedAmount > 0 && userRef) {
        await userRef.set({ walletBalance: initialBalance }, { merge: true });
      }
      return NextResponse.json(
        { error: 'AI Astrologer service is temporarily unavailable. Your wallet has not been charged.' },
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

    // 5. Build Devotee Birth Profile (sanitizing away administrative titles like Super Admin)
    const rawCandidateName = userInfo?.name || userData?.name || '';
    const cleanUserName = (!rawCandidateName || /admin|super/i.test(rawCandidateName)) ? 'Devotee' : rawCandidateName;
    let birthInfo = {
      name: cleanUserName,
      gender: userInfo?.gender || userData?.gender || 'Devotee',
      dob: userInfo?.dob || userData?.dob,
      tob: userInfo?.tob || userData?.tob || '12:00 PM',
      pob: userInfo?.pob || userData?.pob || 'India',
      lat: userInfo?.lat || userData?.lat || '28.6139',
      lon: userInfo?.lon || userData?.lon || '77.2090',
    };

    if (Array.isArray(messages) && messages.length > 0) {
      const allUserTexts = messages
        .filter((m: any) => m.role === 'user')
        .map((m: any) => m.content)
        .join('\n');
      const extracted = extractBirthDetailsFromText(allUserTexts);
      if (extracted?.dob) {
        birthInfo.dob = extracted.dob;
        birthInfo.tob = extracted.tob || birthInfo.tob;
        birthInfo.pob = extracted.pob || birthInfo.pob;
        if (extracted.lat && extracted.lon) {
          birthInfo.lat = extracted.lat;
          birthInfo.lon = extracted.lon;
        }
        if (userRef) {
          userRef.set({
            dob: birthInfo.dob,
            tob: birthInfo.tob,
            pob: birthInfo.pob,
            lat: birthInfo.lat,
            lon: birthInfo.lon,
          }, { merge: true }).catch(() => {});
        }
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

    // Detect if user query specifies a target evaluation date (e.g., "14 October 2026", "as of 2026")
    let targetEvaluationDate: Date | undefined = undefined;
    const asOfDateMatch =
      latestUserMessage.match(/\b(?:as\s+of|on|by|at|for|date:?)\s+([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}\s+[0-9]{4})\b/i) ||
      latestUserMessage.match(/\b([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}\s+[0-9]{4})\b/i);
    if (asOfDateMatch) {
      const cleanDateStr = asOfDateMatch[1].replace(/(?:st|nd|rd|th)/gi, '');
      const parsedMs = Date.parse(cleanDateStr);
      if (!isNaN(parsedMs)) {
        targetEvaluationDate = new Date(parsedMs);
      }
    }

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
          birthInfo.gender,
          targetEvaluationDate
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
    let lalKitabData: any = null;
    let evidencePrompt = '';

    const yearRangeMatch = latestUserMessage.match(/\b(19\d\d|20\d\d)\s*(?:to|-|–|and|నుండి|నుంచి|వరకు|से|तक)\s*(19\d\d|20\d\d)\b/i);
    const pastYearMatch = latestUserMessage.match(/\b(19\d\d|200\d|201\d|202[0-5])\b/);
    const isPastYearInquiry =
      Boolean(yearRangeMatch && (parseInt(yearRangeMatch[2]) <= currentYear || parseInt(yearRangeMatch[1]) < currentYear)) ||
      Boolean(pastYearMatch) ||
      /\b(past|earlier|back then|in the past|history|historical|dasha from|గతంలో|గత సంవత్సరం|పూర్వం|గతం|భూతకాలం|भूतकाल|पहले)\b/i.test(latestUserMessage);
    const isRemedyRequested = !isPastYearInquiry && isRemedyExplicitlyRequested(latestUserMessage);

    if (isCoupleInquiry && coupleMatch) {
      const p1 = coupleMatch.partner1;
      const p2 = coupleMatch.partner2;

      const isUserFemale = (birthInfo.gender || '').toLowerCase() === 'female';
      const isUserMale = (birthInfo.gender || '').toLowerCase() === 'male';
      const groom = isUserFemale ? p2 : isUserMale ? p1 : p1;
      const bride = isUserFemale ? p1 : isUserMale ? p2 : p2;

      const isMissingPartnerDetails = !p2.rashi && !p2.dob && !coupleMatch.compatibility && !coupleMatch.ashtakootResult;

      // Generate couple-specific marriage & harmony parihar protocol ONLY if remedy is requested
      if (isRemedyRequested) {
        pariharProtocol = generate48DayRemedyProtocol({
          domain: 'marriage',
          planet: 'Venus',
          concern: `Kundli Matching & Marriage Harmony for ${groom.name} and ${bride.name}`,
          language,
        });
      }

      if (isMissingPartnerDetails) {
        evidencePrompt = `
================================================================================
KUNDLI MATCHING (ASHTAKOOT GUN MILAN) INQUIRY:
================================================================================
- Devotee: ${defaultUserProfile.name} (${defaultUserProfile.rashi ? `Rashi: ${defaultUserProfile.rashi.name}, Lord: ${defaultUserProfile.rashi.lord}` : `DOB: ${defaultUserProfile.dob || 'Recorded'}`})
- Prospective Partner: ${p2.name} (NOTE: "${p2.name}" is one single individual's full name)
- Relationship Context: Devotee is seeking Kundli Matching / Marriage compatibility with ${p2.name}.
- Status: Partner's birth date/time or Moon Rashi have not been provided yet.${pariharProtocol ? `
- Prescribed 48-Day Couple Blessing Protocol: ${pariharProtocol.title}
  * Recommended Homam: ${pariharProtocol.recommendedHomam} (${pariharProtocol.homamAuspiciousDay})
  * Daily Mantra: ${pariharProtocol.dailyMantra} (${pariharProtocol.dailyJapaCount})` : ''}

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
- Astrological Verdict: ${matchVerdict}${pariharProtocol ? `
- Prescribed 48-Day Couple Blessing Protocol: ${pariharProtocol.title}
  * Recommended Homam: ${pariharProtocol.recommendedHomam} (${pariharProtocol.homamAuspiciousDay})
  * Daily Mantra: ${pariharProtocol.dailyMantra} (${pariharProtocol.dailyJapaCount})
  * Day 24 Sacred Daana: ${pariharProtocol.midMandalaMilestoneDay24.charityDaana}
  * Day 48 Purnahuti: ${pariharProtocol.culminationDay48.action}` : ''}

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

        // Generate 48-Day Executable Parihar Protocol ONLY if remedy is requested
        if (isRemedyRequested) {
          pariharProtocol = generate48DayRemedyProtocol({
            domain: evidence.domain,
            planet: evidence.primaryAfflictedPlanet,
            concern: latestUserMessage,
            language,
          });

          if (evidence.domain === 'ishta_devata' && chart.ishtaDevata) {
            pariharProtocol.presidingDeity = chart.ishtaDevata.deityName;
            pariharProtocol.dailyMantra = chart.ishtaDevata.primaryMantra;
            pariharProtocol.dailyJapaCount = chart.ishtaDevata.dailyJapaCount;
            pariharProtocol.homamAuspiciousDay = chart.ishtaDevata.auspiciousDay;
            pariharProtocol.title = language === 'Telugu'
              ? `48 రోజుల పవిత్ర ఇష్ట దైవ ఉపాసనా మండలం (${chart.ishtaDevata.deityName})`
              : language === 'Hindi'
              ? `48 दिवसीय पवित्र इष्ट देवता उपासना मंडल (${chart.ishtaDevata.deityName})`
              : language === 'Tamil'
              ? `48 நாட்கள் புனித இஷ்ட தெய்வ உபாசனா மண்டலம் (${chart.ishtaDevata.deityName})`
              : `48-Day Sacred Ishta Devata Upasana Mandala (${chart.ishtaDevata.deityName})`;
            pariharProtocol.mandalaPurpose = language === 'Telugu'
              ? `${chart.ishtaDevata.deityName} అనుగ్రహం, విఘ్న నివారణ మరియు ఆధ్యాత్మిక సాఫల్యం`
              : language === 'Hindi'
              ? `${chart.ishtaDevata.deityName} की कृपा, विघ्न निवारण और आध्यात्मिक शांति`
              : language === 'Tamil'
              ? `${chart.ishtaDevata.deityName} அருள், தடைகள் நீங்குதல் மற்றும் ஆன்மீக அமைதி`
              : `Consecrated soul communion, obstacle dissolution, and spiritual enlightenment under ${chart.ishtaDevata.deityName}`;
          }
        }

        // Resolve Lal Kitab Everyday Upaays & Varjya Prohibitions (1952 Canon)
        lalKitabData = resolveLalKitabRemedies(chart, evidence.domain);

        // Resolve Muhurat Windows if inquiry pertains to dates, starting, buying, marriage, or journey
        const isMuhuratQuery = /muhurat|auspicious|date|good day|when to|start|buy|purchase|marriage|shubh|timing/i.test(latestUserMessage);
        const muhuratData = isMuhuratQuery
          ? findAuspiciousMuhurats({
              domain: evidence.domain || 'business',
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
              nativeMoonSign: chart.moonSign,
              nativeNakshatra: chart.nakshatra,
            })
          : null;

        let historicalDashaSection = '';
        if (isPastYearInquiry) {
          let startY = pastYearMatch ? parseInt(pastYearMatch[0]) : 2000;
          let endY = startY;
          if (yearRangeMatch) {
            startY = parseInt(yearRangeMatch[1]);
            endY = parseInt(yearRangeMatch[2]);
          }

          const matchedDashas = (chart.dasha.chronologicalSequence || []).filter((s: any) => {
            const sY = parseInt(String(s.startDate).match(/\d{4}/)?.[0] || '0');
            const eY = parseInt(String(s.endDate).match(/\d{4}/)?.[0] || '9999');
            return sY <= endY && eY >= startY;
          });

          if (matchedDashas.length > 0) {
            historicalDashaSection = `
================================================================================
VERIFIED HISTORICAL DASHA TIMELINE FOR REQUESTED PERIOD (${startY} TO ${endY}):
================================================================================
${matchedDashas.map((d: any) => `* ${d.mahadasha} Mahadasha (Duration: ${d.durationYears} years): Active from ${d.startDate} to ${d.endDate}`).join('\n')}

CRITICAL MANDATE FOR HISTORICAL PERIOD / PAST-YEAR ANALYSIS (${startY} TO ${endY}):
1. The devotee is asking for retrospective astrological analysis of their past life and Dashas between ${startY} and ${endY}.
2. Methodically explain each Mahadasha that operated during those years in chronological order in the PAST TENSE.
3. Detail how the governing Graha of each Dasha influenced their career, family, finances, mindset, tests, and evolution back then.
4. STRICT REMEDY RESTRICTION: ABSOLUTELY NEVER prescribe any remedies, 48-day sacred mandala protocols, mantras, or charity donations for past events or past years. State clearly that remedies cannot alter the past, and deliver a grounded, insightful historical reading.`;
          }
        }

        evidencePrompt = `
================================================================================
DETERMINISTIC JYOTISH EVIDENCE GENERATED BY ASTROPARIHAR ENGINE:
================================================================================
- Domain Identified: ${evidence.domainTitle}
- Target Houses: Houses ${evidence.relevantHouseNumbers.join(', ')}
${historicalDashaSection}
- Relevant House Alignments in D1:
${evidence.relevantHouses.map((h: any) => `  * House ${h.houseNumber} (${h.sign}) ruled by ${h.lord}: Occupying Grahas = ${h.planets}`).join('\n')}
- Active Vimshottari Cycle: ${evidence.activeDashaSummary}
- Supporting Astrological Factors:
${evidence.supportingFactors.map((f: any) => `  * ${f}`).join('\n')}
- Contradictory / Karmic Resistance Factors:
${evidence.contradictoryFactors.map((f: any) => `  * ${f}`).join('\n')}
- Astrological Confidence Score: ${evidence.confidence} (${evidence.confidenceRationale})
- Potent Timing Window: ${evidence.timingWindow}${pariharProtocol ? `
- Prescribed 48-Day Sacred Protocol: ${pariharProtocol.title}
  * Recommended Homam: ${pariharProtocol.recommendedHomam} (${pariharProtocol.homamAuspiciousDay})
  * Daily Mantra: ${pariharProtocol.dailyMantra} (${pariharProtocol.dailyJapaCount})
  * Day 24 Sacred Daana: ${pariharProtocol.midMandalaMilestoneDay24.charityDaana}
  * Day 48 Purnahuti: ${pariharProtocol.culminationDay48.action}` : ''}
- Needs Astrologer Escalation: ${evidence.needsAstrologerReview ? 'YES - ' + evidence.escalationReason : 'NO'}
${isRemedyRequested && !isPastYearInquiry ? `
================================================================================
LAL KITAB 108 UPAAY & VARJYA (FORBIDDEN ACTION) DIRECTIVES:
================================================================================
- Everyday Practical Upaays:
${lalKitabData.primaryUpaays.map((u: any) => `  * [${u.planet} in House ${u.house}]: ${u.upaay} (${u.procedure})`).join('\n')}
- Strict Varjya Warnings (Forbidden Actions Native MUST Avoid):
${lalKitabData.varjyaAlerts.map((v: any) => `  * [${v.planet} in House ${v.house}]: NEVER DO THIS -> ${v.actionToAvoid} (${v.consequence})`).join('\n')}
- Ancestral Balance: ${lalKitabData.ancestralDebt?.debtType || 'Pitra Rina'} -> ${lalKitabData.ancestralDebt?.remedy || 'Feed cows and crows on Amavasya.'}` : ''}
${muhuratData ? `
================================================================================
VERIFIED REAL-TIME AUSPICIOUS MUHURAT WINDOWS (${muhuratData.targetMonth}):
================================================================================
- Domain: ${muhuratData.domain}
- Native Nakshatra: ${chart.nakshatra} (Tara Bala evaluated)
- Top Auspicious Dates:
${muhuratData.auspiciousDates.map((m: any) => `  * ${m.date} (${m.dayOfWeek}): ${m.tithi}, Nakshatra: ${m.nakshatra}. Primary Window: ${m.primaryMuhuratTime}. Rahu Kaal to Avoid: ${m.rahuKaalToAvoid}. Rationale: ${m.astrologicalRationale}`).join('\n')}
- Inauspicious Days to Strictly Avoid:
${muhuratData.inauspiciousDaysToAvoid.map((i: any) => `  * ${i.date}: ${i.reason}`).join('\n')}` : ''}
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
2. Ground your reasoning in the above verified supporting and contradictory factors. Never contradict this evidence.
3. DOMAIN-SPECIFIC TIMING MANDATE (ZERO DATE REPETITION):
   - You MUST communicate the exact, specific astrological timing window calculated above: "${evidence.timingWindow}".
   - When the devotee asks a direct or factual verification question (such as verifying whether they have Shani Sade Sati, asking about their current Dasha, or inquiring about 2026 transits), give a decisive, clear answer to their direct question first, and explain the planetary timeline accurately based on the evidence.
   - Translate and express this exact timing naturally in ${language}.
   - NEVER invent or repeat the same static date span across different questions. Each domain (Health, Career, Marriage, Finance, Transits, Sade Sati, Education, Ishta Devata) has its own distinct astrological timeline calculated above.
${isPastYearInquiry ? `4. RETROSPECTIVE / HISTORICAL ANALYSIS MANDATE:
   - The devotee is inquiring about a historical period in the past (Year ${pastYearMatch ? pastYearMatch[0] : 'in the past'}).
   - Retrospectively analyze what Mahadasha, Antardasha, and planetary transits were active DURING THAT PAST YEAR in the past tense.
   - Analyze the karmic lessons, life events, tests, and accomplishments experienced during that time.
   - CRITICAL: ABSOLUTELY NEVER prescribe any remedies, mantras, japa, rituals, or charity donations for a past year — remedies cannot change the past! Do NOT tell the devotee to chant or donate for a year that has already passed.` : isRemedyRequested ? `4. DUAL-PARIHAR & VARJYA MANDATE:
   - Deliver both classical Parashari remedy (mantra, homam) and actionable low-cost Lal Kitab upaay (e.g. keeping solid silver ball, feeding crows/cows, copper coin).
   - Warn the devotee about their specific "Varjya" (forbidden actions they must strictly avoid).
   - Detail the 48-day sacred remedy protocol in ${language}.
   - If they asked about auspicious timing or muhurat, quote the calculated dates and Abhijit windows provided above.` : `4. ASTROLOGICAL GUIDANCE MANDATE:
   - Directly answer the devotee's specific inquiry in ${language}.
   - Do NOT output ANY unsolicited remedies, mantras, japa, or 48-day mandala protocols.
   - If they asked about auspicious timing or muhurat, quote the calculated dates and Abhijit windows provided above.`}`;
      } catch (err) {
        console.warn('Error calculating birth chart or evidence:', err);
      }
    } else {
      userContext = `\nDevotee Profile:\n- Name: ${birthInfo.name}\n- Birth Details: Not provided yet. Kindly invite them to share their Date, Time, and Place of Birth to calculate their authentic Vedic Janam Kundli.`;
    }

    const isIndic = ['Telugu', 'Hindi', 'Tamil', 'Kannada'].includes(language);
    const scriptName =
      language === 'Telugu'
        ? 'Telugu script (తెలుగు లిపి)'
        : language === 'Hindi'
        ? 'Hindi Devanagari script (हिन्दी)'
        : language === 'Tamil'
        ? 'Tamil script (தமிழ்)'
        : language === 'Kannada'
        ? 'Kannada script (ಕನ್ನಡ ಲಿಪಿ)'
        : 'English';

    const selectedAstrologer = astrologerId
      ? DEFAULT_AI_ASTROLOGERS.find((a) => a.id === astrologerId || a.name === astrologerId)
      : null;
    const astrologerName = selectedAstrologer?.name || 'Acharya Parihar';
    const astrologerDiscipline = selectedAstrologer?.primaryDiscipline || 'Vedic Jyotish';
    const astrologerStyle = selectedAstrologer?.consultationStyle || 'Vedic & Remedial';
    const astrologerPersona = selectedAstrologer?.systemPersonaPrompt || persona || '';

    const systemPrompt = `You are "${astrologerName}", the master Vedic Astrologer, Jyotishacharya, and practitioner of ${astrologerDiscipline} at AstroParihar.${
      astrologerPersona
        ? `\n\nSPECIALIZED ASTROLOGER PERSONA & METHODOLOGY:\n${astrologerPersona}\nConsultation Style: ${astrologerStyle}`
        : '\nYou possess profound mastery over Parashari Jyotish, Jaimini Sutras, Ashtakavarga, Nakshatra analysis, and Vedic Upayas.'
    }

Real-Time Calendar Anchor:
- Today's Date: ${currentDate}.
- Current Year: STRICTLY ${currentYear}.${isPastYearInquiry ? `\n- HISTORICAL PAST INQUIRY EXCEPTION: The devotee is asking specifically about Year ${pastYearMatch ? pastYearMatch[0] : 'in the past'}. Evaluate their past astrological period in the past tense without forcing current year ${currentYear} predictions.` : `\n- You are practicing in ${currentYear}. All transit predictions (Saturn/Shani, Jupiter/Brihaspati, Rahu, Ketu), Mahadashas, and advice must reference ${currentYear} and future years (${currentYear + 1}, ${currentYear + 2}).`}
- TIMING DIVERSITY MANDATE: Every inquiry domain (Health, Marriage, Career, Finance, Transits, Sade Sati, etc.) is governed by different Grahas, Bhavas, and Pratyantardashas. Never copy-paste or hallucinate identical date windows for different questions. You MUST adhere strictly to the calculated Potent Timing Window provided in the Jyotish Evidence.

MANDATORY LANGUAGE REQUIREMENT (CRITICAL):
- Selected Language: **${language.toUpperCase()}** (${scriptName}).
- You MUST generate your entire consultation response 100% in ${language} using ${scriptName}.
${isIndic ? `- Even if the devotee asks in English or Roman script, translate and answer 100% in ${language} (${scriptName}).` : ''}
- Tone: Warm, compassionate, spiritually uplifting (start with a warm Vedic greeting in ${language}: ${language === 'Telugu' ? '"నమస్కారం"' : language === 'Hindi' ? '"नमस्ते / प्रणाम"' : language === 'Tamil' ? '"வணக்கம்"' : language === 'Kannada' ? '"ನಮಸ್ಕಾರ"' : '"Namaste / Hari Om"'}).${userContext}${userMemoryContext}${birthChartSummary}${evidencePrompt}

${isRemedyRequested ? ASTROPARIHAR_UNIFIED_REMEDY_DIRECTIVES : ''}

===============================================================================
STRUCTURED CONSULTATION FORMAT REQUIREMENT (MANDATORY & ZERO-DEVIATION):
===============================================================================
You MUST respond STRICTLY in JSON format matching this schema:
{
  "diagnosis": {
    "activeDasha": "${evidence?.activeDashaSummary || 'Current Mahadasha & Antardasha'}",
    "keyHouses": "Relevant houses involved in this inquiry",
    "supportingFactors": ["2 to 3 classical supporting planetary factors in ${language}"],
    "contradictoryFactors": ["1 to 2 friction points or karmic tests in ${language}"]
  },
  "conclusion": "Direct, decisive answer in 2-4 sentences in ${language} directly answering the devotee's question.",
  "timingWindow": "Specific timing window in ${language} translated directly from the calculated Potent Timing Window: ${evidence?.timingWindow ? JSON.stringify(evidence.timingWindow) : 'Current planetary cycle'}.",
  "whyAstroPariharSaysThis": [
    "3 to 5 clear astrological bullet points in ${language} explaining Observation -> Classical Rule -> Interpretation"
  ],
  "confidence": "${evidence?.confidence || 'Moderate'}",
  "confidenceRationale": "${evidence?.confidenceRationale || 'Evaluated across natal chart factors.'}",
  "needsAstrologerReview": ${Boolean(evidence?.needsAstrologerReview)},
  "escalationReason": "${evidence?.escalationReason || ''}",
  "pariharSummary": "${isRemedyRequested ? `Concise summary of the 48-day sacred remedy protocol in ${language}` : ''}",
  "reply": "Your complete, warm, richly detailed Vedic consultation response in ${language} (${scriptName}). Speak directly to the devotee as ${astrologerName}. Provide a comprehensive, multi-paragraph consultation that rivals the deepest, highest quality Jyotish reading: 1) Traditional Vedic greeting in ${language} and empathetic acknowledgment of their situation, 2) In-depth astrological diagnosis explaining their key Bhavas, ruling Grahas, Mahadasha/Antardasha effects, and active transits, 3) Decisive, clear answer to their question with practical wisdom, 4) Specific timing window matching the calculated evidence (expressed in the past tense if inquiring about a past year), ${isRemedyRequested && !isPastYearInquiry ? '5) 48-day sacred remedy guidance matching the prescribed protocol (canonical Homam, daily Mantra with count, and Saturday/auspicious day charity), ' : '5) Practical astrological guidance addressing their question (STRICTLY do NOT prescribe any mantras, japas, rituals, or charity donations unless remedies were explicitly requested for a current/future challenge), '}and 6) Uplifting spiritual blessing in ${language}. Never output terse 2-sentence replies; provide genuine astrological depth and warmth. SPECIAL DIRECTIVE: If the devotee is testing your astronomical calculation capability, requesting exact degrees/positions, or asking what chart data is available in the system, present the complete, exact data table directly inside this 'reply' field adhering strictly to their requested format, without refusing or outputting unsolicited remedies.",
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

    // 8. Generate AI Response
    let replyContent = '';
    let recommendations: string[] = [];
    let vedikaTruth = '';
    let vedikaRecommendations: string[] = [];

    try {
      const vDt = birthInfo?.dob ? formatToVedikaDateTime(birthInfo.dob, birthInfo.tob || '12:00') : undefined;
      const vRes = await queryVedikaAI({
        question: `Devotee Question: "${latestUserMessage}". Context: ${userContext || 'Astrological Consultation'}. Name: ${cleanUserName}, Moon Sign: ${chart?.moonSign || 'Vedic'}, Nakshatra: ${chart?.nakshatra || 'Vedic'}. Provide authoritative Vedic Jyotish guidance.`,
        language,
        birthDetails: vDt ? {
          datetime: vDt,
          latitude: Number(birthInfo?.lat) || 28.6139,
          longitude: Number(birthInfo?.lon) || 77.209,
        } : undefined,
      });

      if (vRes.success && (vRes.data?.response || vRes.data?.answer || vRes.data?.text)) {
        vedikaTruth = (vRes.data.response || vRes.data.answer || vRes.data.text) || '';
        if (Array.isArray(vRes.data?.followUpSuggestions) && vRes.data.followUpSuggestions.length > 0) {
          vedikaRecommendations = vRes.data.followUpSuggestions;
        } else if (Array.isArray(vRes.data?.followUps) && vRes.data.followUps.length > 0) {
          vedikaRecommendations = vRes.data.followUps;
        }
      }
    } catch (vErr) {
      console.warn('[Vedika] AI chat query notice, continuing with local evidence fallback:', vErr);
    }

    // Inject Vedika's advisory insights if available, but never allow conversational text to override deterministic ephemeris calculations or diagnostic queries
    const isDirectCalculationQuery =
      /calculate|exact degree|planetary position|ayanamsa|birth-chart information|testing your astronomical|nakshatra lord|pada|available in your system|provenance|calculation engine|which engine|what engine|api used|remaining arc|dasha balance|do not invent|lahiri|sidereal zodiac/i.test(
        latestUserMessage
      );

    if (vedikaTruth && !isDirectCalculationQuery) {
      conversationMessages.push({
        role: 'system',
        content: `SUPPLEMENTARY JYOTISH ADVISORY INSIGHT (VEDIKA ENGINE): The following provides additional spiritual nuance for the devotee's query from Vedika AI ephemeris. Incorporate its rich spiritual blessings, but ensure all planetary positions, degrees, nakshatras, nakshatra lords, and dasha dates strictly conform to the VERIFIED ASTRONOMICAL VEDIC JANAM KUNDLI provided in the system prompt:\n\n"${vedikaTruth}"`
      });
    }

    if (isDirectCalculationQuery) {
      conversationMessages.push({
        role: 'system',
        content: `CRITICAL MANDATE FOR CALCULATION & ENGINE PROVENANCE QUERIES:
1. ENGINE PROVENANCE: When asked what engine, API, or software is used for planetary positions and Dasha dates, state clearly that calculations are deterministically computed by the AstroParihar High-Precision Ephemeris Engine (implementing Swiss-standard celestial mechanics, IAU ephemeris algorithms, and the Lahiri / Chitra Paksha Ayanamsha in the Sidereal Zodiac). NEVER state that "no external calculation engine or API was employed" or claim language model conversational intuition.
2. PRE-COMPUTED ACCURACY: All parameters (Ascendant, Moon sign, Moon longitude, Nakshatra, Pada, Nakshatra lord, birth Mahadasha, birth Dasha balance, active Mahadasha and Antardasha) are strictly extracted from the VERIFIED ASTRONOMICAL VEDIC JANAM KUNDLI provided above. Do NOT guess, alter, or conversationally calculate degrees or dates.
3. MATHEMATICAL DERIVATION: Present the exact calculated Moon longitude, remaining Nakshatra arc, total arc (13°20' = 48,000 arcsec), exact birth Dasha balance in years/months/days, and current Mahadasha/Antardasha start/end dates.
4. Distinguish calculated facts from astrological interpretations, and explicitly state if any specific advanced chart data is unavailable.`
      });
    }

    // 9. Format & Translate via OpenAI (with seamless Vedika AI & Vedic Engine fallback)
    let response: Response | null = null;
    if (openaiApiKey) {
      try {
        response = await fetchWithOpenAIFallback(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: conversationMessages,
              temperature: isDirectCalculationQuery ? 0.1 : 0.7,
              max_tokens: 2500,
              response_format: { type: 'json_object' },
            }),
          },
          openaiApiKey
        );

        if (!response.ok) {
          const isQuotaOrAuth = response.status === 429 || response.status === 401 || response.status === 403;
          if (!isQuotaOrAuth) {
            console.warn('gpt-4o completion failed, attempting gpt-4o-mini fallback...');
            response = await fetchWithOpenAIFallback(
              'https://api.openai.com/v1/chat/completions',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: conversationMessages,
                  temperature: isDirectCalculationQuery ? 0.1 : 0.6,
                  max_tokens: 2000,
                  response_format: { type: 'json_object' },
                }),
              },
              openaiApiKey
            );
          }
        }
      } catch (openAiErr) {
        console.warn('OpenAI request error:', openAiErr);
        response = null;
      }
    }

    let parsed: any = {};

    if (!response || !response.ok) {
      const errStatus = response ? response.status : 'offline';
      console.warn(`OpenAI completion unavailable (${errStatus}), activating Vedika AI & Vedic Engine fallback...`);

      // If vedikaTruth was not fetched yet, fetch now directly with devotee question
      if (!vedikaTruth) {
        try {
          const vDt = birthInfo?.dob ? formatToVedikaDateTime(birthInfo.dob, birthInfo.tob || '12:00') : undefined;
          const langInstruction = language !== 'English' ? ` Please reply in ${language}.` : '';
          const fallbackVedika = await queryVedikaAI({
            question: `${latestUserMessage}${langInstruction}`,
            language,
            birthDetails: vDt ? {
              datetime: vDt,
              latitude: Number(birthInfo?.lat) || 28.6139,
              longitude: Number(birthInfo?.lon) || 77.209,
            } : undefined,
          });
          if (fallbackVedika.success && (fallbackVedika.data?.answer || fallbackVedika.data?.response || fallbackVedika.data?.text)) {
            vedikaTruth = fallbackVedika.data.answer || fallbackVedika.data.response || fallbackVedika.data.text || '';
            if (Array.isArray(fallbackVedika.data?.followUpSuggestions) && fallbackVedika.data.followUpSuggestions.length > 0) {
              vedikaRecommendations = fallbackVedika.data.followUpSuggestions;
            } else if (Array.isArray(fallbackVedika.data?.followUps) && fallbackVedika.data.followUps.length > 0) {
              vedikaRecommendations = fallbackVedika.data.followUps;
            }
          }
        } catch (vErr) {
          console.warn('Fallback Vedika query warning:', vErr);
        }
      }

      parsed = generateVedicFallbackResponse({
        vedikaAnswer: vedikaTruth,
        vedikaRecommendations,
        userQuery: latestUserMessage,
        userName: cleanUserName,
        language,
        chart,
        evidence,
        currentYear,
        personaName: (persona as string) || 'Acharya Vashishta',
        pariharProtocol,
        isRemedyRequested,
        lalKitabData,
      });
    } else {
      try {
        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || '{}';
        parsed = safeParseAIJson(rawText) || {};
      } catch (e) {
        parsed = {};
      }
    }

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
      } else if (language === 'Kannada' || language === 'kn') {
        recommendations = [
          '🔮 2026ರಲ್ಲಿ ನನ್ನ ಗ್ರಹ ಸಂಚಾರದ ಫಲಗಳು ಹೇಗಿವೆ?',
          '✨ ನನ್ನ ಅದೃಷ್ಟ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ ಮತ್ತು ನಿತ್ಯ ಮಂತ್ರ ಯಾವುದು?',
          '💼 ವೃತ್ತಿ ಬೆಳವಣಿಗೆ ಅಥವಾ ಉದ್ಯೋಗ ಬದಲಾವಣೆಗೆ ಶುಭ ಸಮಯ ಯಾವುದು?',
          '❤️ ನನ್ನ ವಿವಾಹ ಯೋಗ ಮತ್ತು ಹೊಂದಾಣಿಕೆ ಯಾವಾಗ ಬರುತ್ತದೆ?',
          '🪐 ನನಗೆ ಸಾಡೇ ಸಾತಿ ಅಥವಾ ರಾಹು ಮಹಾದಶ ನಡೆಯುತ್ತಿದೆಯೇ?',
          '🙏 ಗ್ರಹ ಶಾಂತಿ ಮತ್ತು ದೋಷ ನಿವಾರಣೆಗೆ ಯಾವ ಪರಿಹಾರ ಮಾಡಬೇಕು?',
        ];
      } else if (language === 'Malayalam' || language === 'ml') {
        recommendations = [
          '🔮 2026-ൽ എന്റെ ഗ്രഹ സഞ്ചാര ഫലങ്ങൾ എങ്ങനെയാണ്?',
          '✨ എന്റെ ഭാഗ്യ രത്നം, രുദ್ರಾക്ഷം, നിത്യ മന്ത്രം എന്നിവ ഏതാണ്?',
          '💼 കരിയർ മാറ്റത്തിനോ പ്രമോഷനോ അനുയോജ്യമായ സമയം എപ്പോഴാണ്?',
          '❤️ എന്റെ ജാതകത്തിൽ വിവാഹ യೋಗം എപ്പോഴാണ്?',
          '🪐 എനിക്ക് ഇപ്പോൾ ഏഴര ശനിയോ രാഹു മഹാദശയോ നടക്കുന്നുണ്ടോ?',
          '🙏 ഗ്രಹ ദോഷ പരിഹാരത്തിനായി എന്തെല്ലാം പൂജകളും ദാനവുമാണ് ചെയ്യേണ്ടത്?',
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
        prescribedHomam: isRemedyRequested && pariharProtocol ? pariharProtocol.recommendedHomam : '',
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
          remedyPrescribed: isRemedyRequested && pariharProtocol ? pariharProtocol.recommendedHomam : '',
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
      pariharProtocol: pariharProtocol || parsed.pariharProtocol || null,
    };

    let personalProfile = null;
    let yearComparison = null;
    let interactiveTimeline = null;
    if (chart) {
      try {
        personalProfile = generatePersonalAstrologyProfile(chart);
        yearComparison = generateYearComparison(chart, currentYear, 4);
        interactiveTimeline = generateInteractiveTimeline(chart);
      } catch (genErr) {
        console.warn('Profile/Year/Timeline generation notice:', genErr);
      }
    }

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
      profile: personalProfile,
      yearComparison: yearComparison,
      timeline: interactiveTimeline,
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

