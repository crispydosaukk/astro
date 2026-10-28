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
          birthDetails.lat || '28.6139',
          birthDetails.lon || '77.2090',
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

    // 1. Separate Devotee's actual inquiries from Astrologer opening greetings
    const userTurns = Array.isArray(conversationTranscript)
      ? conversationTranscript
          .filter((t: any) => t.role === 'user')
          .map((t: any) => (t.content || t.text || '').trim())
          .filter(Boolean)
      : [];

    const assistantTurns = Array.isArray(conversationTranscript)
      ? conversationTranscript
          .filter((t: any) => t.role !== 'user')
          .map((t: any) => (t.content || t.text || '').trim())
          .filter(Boolean)
      : [];

    const devoteeQueryText = userTurns.join(' ').toLowerCase();
    // Exclude stock Turn 0 greeting from assistant to avoid greeting keywords poisoning topic detection
    const astrologerAdviceText = (assistantTurns.length > 1 ? assistantTurns.slice(1) : assistantTurns).join(' ').toLowerCase();
    const actualDialogue = `${devoteeQueryText} ${astrologerAdviceText}`.trim();

    const transcriptText = Array.isArray(conversationTranscript)
      ? conversationTranscript
          .map((t: any) => `${t.role === 'user' ? 'Devotee' : astrologerName}: ${t.content || t.text}`)
          .join('\n')
      : '';

    // 2. Identify the authentic primary topic from the consultation exchanges
    const isMarriage =
      devoteeQueryText.includes('marriage') ||
      devoteeQueryText.includes('wedding') ||
      devoteeQueryText.includes('vivah') ||
      devoteeQueryText.includes('spouse') ||
      devoteeQueryText.includes('partner') ||
      devoteeQueryText.includes('love') ||
      devoteeQueryText.includes('relationship') ||
      devoteeQueryText.includes('వివాహ') ||
      devoteeQueryText.includes('పెళ్లి') ||
      devoteeQueryText.includes('సంబంధం') ||
      devoteeQueryText.includes('భార్య') ||
      devoteeQueryText.includes('భర్త') ||
      devoteeQueryText.includes('శాదీ') ||
      devoteeQueryText.includes('शादी') ||
      devoteeQueryText.includes('विवाह') ||
      devoteeQueryText.includes('திருமணம்') ||
      actualDialogue.includes('swayamvara') ||
      actualDialogue.includes('స్వయంవర');

    const isWealth =
      devoteeQueryText.includes('wealth') ||
      devoteeQueryText.includes('money') ||
      devoteeQueryText.includes('finance') ||
      devoteeQueryText.includes('debt') ||
      devoteeQueryText.includes('loan') ||
      devoteeQueryText.includes('rich') ||
      devoteeQueryText.includes('income') ||
      devoteeQueryText.includes('ధన') ||
      devoteeQueryText.includes('డబ్బు') ||
      devoteeQueryText.includes('అప్పు') ||
      devoteeQueryText.includes('ఆర్థిక') ||
      devoteeQueryText.includes('ఆస్తి') ||
      devoteeQueryText.includes('కర్జ') ||
      devoteeQueryText.includes('धन') ||
      devoteeQueryText.includes('पैसा') ||
      actualDialogue.includes('lakshmi') ||
      actualDialogue.includes('kubera') ||
      actualDialogue.includes('లక్ష్మీ');

    const isHealth =
      devoteeQueryText.includes('health') ||
      devoteeQueryText.includes('illness') ||
      devoteeQueryText.includes('disease') ||
      devoteeQueryText.includes('hospital') ||
      devoteeQueryText.includes('cure') ||
      devoteeQueryText.includes('medical') ||
      devoteeQueryText.includes('sick') ||
      devoteeQueryText.includes('vitality') ||
      devoteeQueryText.includes('ఆరోగ్య') ||
      devoteeQueryText.includes('రోగ') ||
      devoteeQueryText.includes('జబ్బు') ||
      devoteeQueryText.includes('బాధ') ||
      devoteeQueryText.includes('మృత్యుంజయ') ||
      devoteeQueryText.includes('स्वास्थ्य') ||
      devoteeQueryText.includes('रोग') ||
      devoteeQueryText.includes('बीमारी') ||
      actualDialogue.includes('mrityunjaya');

    const isProtection =
      devoteeQueryText.includes('protection') ||
      devoteeQueryText.includes('evil eye') ||
      devoteeQueryText.includes('drishti') ||
      devoteeQueryText.includes('negative') ||
      devoteeQueryText.includes('fear') ||
      devoteeQueryText.includes('రక్షణ') ||
      devoteeQueryText.includes('దిష్టి') ||
      devoteeQueryText.includes('భయం') ||
      devoteeQueryText.includes('సుదర్శన') ||
      devoteeQueryText.includes('सुरक्षा') ||
      devoteeQueryText.includes('बुरी नजर') ||
      actualDialogue.includes('sudarshana');

    const isCareer =
      devoteeQueryText.includes('career') ||
      devoteeQueryText.includes('job') ||
      devoteeQueryText.includes('promotion') ||
      devoteeQueryText.includes('interview') ||
      devoteeQueryText.includes('profession') ||
      devoteeQueryText.includes('business') ||
      devoteeQueryText.includes('office') ||
      devoteeQueryText.includes('ఉద్యోగ') ||
      devoteeQueryText.includes('జాబ్') ||
      devoteeQueryText.includes('ప్రమోషన్') ||
      devoteeQueryText.includes('వ్యాపార') ||
      devoteeQueryText.includes('नौकरी') ||
      devoteeQueryText.includes('व्यापार') ||
      actualDialogue.includes('ganapathi') ||
      actualDialogue.includes('గణపతి');

    const isEducation =
      devoteeQueryText.includes('education') ||
      devoteeQueryText.includes('study') ||
      devoteeQueryText.includes('studies') ||
      devoteeQueryText.includes('exam') ||
      devoteeQueryText.includes('college') ||
      devoteeQueryText.includes('marks') ||
      devoteeQueryText.includes('degree') ||
      devoteeQueryText.includes('చదువు') ||
      devoteeQueryText.includes('పరీక్ష') ||
      devoteeQueryText.includes('విద్యా') ||
      devoteeQueryText.includes('पढ़ाई') ||
      devoteeQueryText.includes('परीक्षा');

    // 3. Resolve Effective Topic & Meaningful Prescribed Remedy
    let effectiveTopic = primaryConcern;
    let sessionMatchedRemedy: any = null;

    if (isMarriage) {
      effectiveTopic = 'Marriage & Relationship Harmony';
      sessionMatchedRemedy = {
        type: 'homam',
        title: 'Swayamvara Parvathi Homam (స్వయంవర పార్వతి హోమం)',
        instructions: 'Perform on Friday or Shukla Panchami with yellow flowers and pure cow ghee to dissolve marriage delays.',
        mantraTitle: 'Swayamvara Parvathi Maha Mantra',
        mantraInstructions: 'Chant the sacred Swayamvara Parvathi Mantra 108 times daily for matrimonial bliss.',
        topic: effectiveTopic,
      };
    } else if (isWealth) {
      effectiveTopic = 'Wealth & Financial Growth';
      sessionMatchedRemedy = {
        type: 'homam',
        title: 'Lakshmi Kubera Homam (శ్రీ లక్ష్మీ కుబేర హోమం)',
        instructions: 'Perform on Friday morning during sunrise with lotus petals and cow ghee for financial abundance and debt clearance.',
        mantraTitle: 'Maha Lakshmi Mantra & Kanakadhara Stotram',
        mantraInstructions: 'Chant "Om Shreem Hreem Kleem Mahalakshmaye Namah" 108 times on Fridays.',
        topic: effectiveTopic,
      };
    } else if (isHealth) {
      effectiveTopic = 'Health & Vitality';
      sessionMatchedRemedy = {
        type: 'homam',
        title: 'Maha Mrityunjaya Homam (మహా మృత్యుంజయ హోమం)',
        instructions: 'Perform on Monday at sunrise with Bilva leaves, raw cow milk, and cow ghee for health rejuvenation.',
        mantraTitle: 'Maha Mrityunjaya Mantra',
        mantraInstructions: 'Chant "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam" 108 times daily.',
        topic: effectiveTopic,
      };
    } else if (isProtection) {
      effectiveTopic = 'Protection & Evil Eye Shielding';
      sessionMatchedRemedy = {
        type: 'homam',
        title: 'Sudarshana Homam (శ్రీ సుదర్శన హోమం)',
        instructions: 'Perform on Wednesday or Ekadashi with Tulasi leaves and cow ghee for supreme spiritual protection.',
        mantraTitle: 'Sudarshana Maha Mantra',
        mantraInstructions: 'Chant "Om Kleem Krishnaya Govindaya Gopijana Vallabhaya Paraya Paramatmane" daily.',
        topic: effectiveTopic,
      };
    } else if (isCareer) {
      effectiveTopic = 'Career & Business Growth';
      sessionMatchedRemedy = {
        type: 'homam',
        title: 'Maha Ganapathi Homam (మహా గణపతి హోమం)',
        instructions: 'Perform on Wednesday or Shukla Chaturthi at sunrise with Modakam and Durva grass to clear hurdles.',
        mantraTitle: 'Ganesh Maha Mantra',
        mantraInstructions: 'Chant "Om Gam Ganapataye Namaha" 108 times daily before leaving for work.',
        topic: effectiveTopic,
      };
    } else if (isEducation) {
      effectiveTopic = 'Education & Academic Growth';
      sessionMatchedRemedy = {
        type: 'homam',
        title: 'Navagraha Homam & Saraswati Puja (నవగ్రహ హోమం & సరస్వతీ పూజ)',
        instructions: 'Perform on Wednesday or Thursday morning with white flowers and honey for academic focus.',
        mantraTitle: 'Saraswati Moola Mantra & Medha Suktam',
        mantraInstructions: 'Chant "Om Aim Saraswatyai Namaha" 108 times at sunrise.',
        topic: effectiveTopic,
      };
    } else {
      const storedRemedies = sessionData?.prescribedRemedies || [];
      const validStored = lastPrescribedRemedy || (storedRemedies.length > 0 ? storedRemedies[storedRemedies.length - 1] : null);
      if (validStored && validStored.title) {
        sessionMatchedRemedy = validStored;
        effectiveTopic = validStored.topic || primaryConcern;
      }
    }

    // Always re-resolve canonical remedies based on the effective topic
    canonicalRemedies = resolveVedicRemedies({
      concern: effectiveTopic,
      lagna: astroContext?.lagna,
      moonRashi: astroContext?.moonRashi,
      dasha: astroContext?.currentDasha,
      name: birthDetails.name || 'Devotee',
    });

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

    // 4. Build Multi-lingual Summary Fallback (Telugu, Hindi, Tamil, Kannada, English)
    const langLower = (language || 'English').toLowerCase();
    const isTelugu = langLower.includes('telugu') || langLower.includes('te');
    const isHindi = langLower.includes('hindi') || langLower.includes('hi');
    const isTamil = langLower.includes('tamil') || langLower.includes('ta');
    const isKannada = langLower.includes('kannada') || langLower.includes('kn');

    let summary: AIConsultationSummary;

    if (isTelugu) {
      summary = {
        overview: `${astrologerName} (${discipline}) గారితో ${birthDetails.name || 'భక్తులు'} దివ్య సంప్రదింపు విజయవంతంగా పూర్తయింది. మీ జన్మ లగ్నం (${astroContext?.lagna || 'లగ్నం'}), రాశి (${astroContext?.moonRashi || 'చంద్ర రాశి'}) మరియు ప్రస్తుత దశ (${astroContext?.currentDasha || 'దశాపహారం'}) ఆధారంగా "${effectiveTopic}" అంశాలపై గ్రహ స్థితులను సమగ్రంగా విశ్లేషించడం జరిగింది. శుభ ఫలితాల కొరకు ${canonicalRemedies.primaryHomam.name} మరియు ${canonicalRemedies.primaryMantra.title} ప్రధాన పరిహారాలుగా సూచించబడ్డాయి.`,
        astrologicalHighlights: [
          `మీ జన్మ లగ్నం (${astroContext?.lagna || 'లగ్నం'}) కేంద్ర స్థానంలో శుభ బలాన్ని కలిగి ఉండి, వ్యక్తిత్వ స్థిరత్వాన్ని మరియు కార్యాచరణ సామర్థ్యాన్ని అందిస్తోంది.`,
          `ప్రస్తుతం నడుస్తున్న వింశోత్తరి దశ (${astroContext?.currentDasha || 'దశాపహారం'}) మీ జీవితంలో ఒక ముఖ్యమైన పరివర్తనా కాలానికి నాంది పలుకుతోంది.`,
          `గోచారంలో శుభ గ్రహాల అనుకూల వీక్షణ వలన ఆటంకాలు తొలగి, ప్రయత్నాలలో నూతన అవకాశాలు మరియు విజయం చేకూరుతాయి.`,
        ],
        timelinePredictions: [
          `రాబోయే 3-6 నెలలు: ముఖ్యమైన నిర్ణయాలు తీసుకోవడానికి మరియు నూతన ప్రయత్నాలు ప్రారంభించడానికి అత్యంత అనుకూలమైన కాలం.`,
          `రాబోయే 12 నెలలు: వ్యక్తిగత మైలురాళ్ళు, శుభకార్యాలు, మానసిక ప్రశాంతత మరియు స్థిరమైన పురోగతికి శ్రేయస్కరమైన సమయం.`,
        ],
        recommendedRemedies: [
          {
            type: 'homam',
            title: canonicalRemedies.primaryHomam.name,
            instructions: `${canonicalRemedies.primaryHomam.day} నాడు ప్రాతఃకాలంలో స్వచ్ఛమైన ఆవు నెయ్యి మరియు సమగ్ర సమగ్రీతో హోమం నిర్వహించండి. ఆహుతి మంత్రం: ${canonicalRemedies.primaryHomam.ahutiMantra}.`,
          },
          {
            type: 'mantra',
            title: canonicalRemedies.primaryMantra.title,
            instructions: `ప్రతిరోజూ ${canonicalRemedies.primaryMantra.bestTime || 'సూర్యోదయ వేళ'} "${canonicalRemedies.primaryMantra.transliteration}" ${canonicalRemedies.primaryMantra.japaCount || '108 సార్లు'} పఠించండి.`,
          },
          {
            type: 'ishta_devata',
            title: `ఇష్టదైవ ఆరాధన: ${ishtaDevata ? ishtaDevata.deityName : 'శ్రీ మహావిష్ణువు / పరమశివుడు'}`,
            instructions: ishtaDevata
              ? `ఆత్మకారక గ్రహం ${ishtaDevata.atmakarakaPlanet} మరియు కారకాంంశ నుండి 12వ స్థానం (${ishtaDevata.twelfthSignFromKarakamsa}) ప్రకారం మార్గదర్శక దైవం. ${ishtaDevata.auspiciousDay || 'నిత్యం'} ఆవు నేతి దీపారాధన మరియు మంత్రం: ${ishtaDevata.primaryMantra}.`
              : 'నిత్యం ప్రాతఃకాలంలో స్వచ్ఛమైన ఆవు నేతి దీపం వెలిగించి ఇష్టదైవాన్ని ప్రార్థించండి.',
          },
          {
            type: 'gemstone',
            title: canonicalRemedies.gemstone.name,
            instructions: `${canonicalRemedies.gemstone.auspiciousDay} నాడు శుద్ధి చేసి ${canonicalRemedies.gemstone.finger} ధరించండి.`,
          },
        ],
        auspiciousDates: [
          'శుక్ల పక్ష గురువారాలు & పౌర్ణమి తిథి',
          'పుష్యమి నక్షత్ర యుక్త దినాలు',
          'అభిజిత్ ముహూర్త వేళలు',
        ],
        panditJiFinalBlessing: `సకల నవగ్రహాల మరియు ఇష్టదైవ దివ్య కృపాకటాక్షాలతో మీకు, మీ కుటుంబానికి సంపూర్ణ ఆయురారోగ్యాలు, మనశ్శాంతి మరియు సకల కార్యసిద్ధి కలుగుగాక. ఓం శాంతిః శాంతిః శాంతిః.`,
      };
    } else if (isHindi) {
      summary = {
        overview: `${astrologerName} (${discipline}) जी के साथ ${birthDetails.name || 'भक्त'} का दिव्य ज्योतिषीय परामर्श सफलतापूर्वक संपन्न हुआ। आपके लग्न (${astroContext?.lagna || 'लग्न'}), राशि (${astroContext?.moonRashi || 'चंद्र राशि'}) एवं सक्रिय दशा (${astroContext?.currentDasha || 'महादशा'}) के अनुसार "${effectiveTopic}" विषय पर गहन विश्लेषण किया गया। शुभ परिणामों के लिए ${canonicalRemedies.primaryHomam.name} एवं ${canonicalRemedies.primaryMantra.title} का निर्देश दिया गया है।`,
        astrologicalHighlights: [
          `आपकी जन्म कुंडली में लग्न (${astroContext?.lagna || 'लग्न'}) की स्थिति सकारात्मक है, जो आपको मानसिक संबल एवं निर्णय क्षमता प्रदान कर रही है।`,
          `वर्तमान विंशोत्तरी दशा (${astroContext?.currentDasha || 'दशा'}) जीवन में एक सकारात्मक मोड़ और दीर्घकालिक स्थिरता का संकेत दे रही है।`,
          `गोचर में शुभ ग्रहों की दृष्टि कर्म व भाग्य भाव को बल प्रदान कर रही है, जिससे बाधाओं का निवारण होगा।`,
        ],
        timelinePredictions: [
          `आगामी 3-6 महीने: महत्वपूर्ण निर्णयों एवं नए प्रयासों की शुरुआत के लिए अत्यंत शुभ व फलदायी समय।`,
          `आगामी 12 महीने: पारिवारिक सुख, शुभ मांगलिक कार्य एवं आर्थिक स्थिरता का प्रशस्त काल।`,
        ],
        recommendedRemedies: [
          {
            type: 'homam',
            title: canonicalRemedies.primaryHomam.name,
            instructions: `${canonicalRemedies.primaryHomam.day} को प्रातःकाल शुद्ध गाय के घी एवं हवन सामग्री से अनुष्ठान करें। आहुति मंत्र: ${canonicalRemedies.primaryHomam.ahutiMantra}.`,
          },
          {
            type: 'mantra',
            title: canonicalRemedies.primaryMantra.title,
            instructions: `प्रतिदिन ${canonicalRemedies.primaryMantra.bestTime || 'सूर्योदय पर'} "${canonicalRemedies.primaryMantra.transliteration}" का ${canonicalRemedies.primaryMantra.japaCount || '108 बार'} नित्य जाप करें।`,
          },
          {
            type: 'ishta_devata',
            title: `इष्टदेव उपासना: ${ishtaDevata ? ishtaDevata.deityName : 'भगवान शिव / श्री महाविष्णु'}`,
            instructions: ishtaDevata
              ? `आत्मकारक ग्रह ${ishtaDevata.atmakarakaPlanet} एवं कारकांश से 12वें भाव के अनुसार मार्गदर्शन। नित्य शुद्ध घी का दीपक प्रज्वलित कर मंत्र: ${ishtaDevata.primaryMantra} का पाठ करें।`
              : 'प्रातःकाल शुद्ध घी का दीपक जलाकर इष्टदेव का स्मरण करें।',
          },
          {
            type: 'gemstone',
            title: canonicalRemedies.gemstone.name,
            instructions: `${canonicalRemedies.gemstone.auspiciousDay} को शुभ मुहूर्त में अभिमंत्रित कर ${canonicalRemedies.gemstone.finger} में धारण करें।`,
          },
        ],
        auspiciousDates: [
          'शुक्ल पक्ष के गुरुवार एवं पूर्णिमा तिथि',
          'पुष्य नक्षत्र युक्त शुभ दिवस',
          'दैनिक अभिजीत मुहूर्त काल',
        ],
        panditJiFinalBlessing: `समस्त नवग्रहों एवं आपके इष्टदेव की कृपा से आपके जीवन में सुख, शांति, उत्तम स्वास्थ्य एवं सर्वकार्य सिद्धि की प्राप्ति हो। ॐ शान्तिः शान्तिः शान्तिः।`,
      };
    } else {
      // Default: English
      summary = {
        overview: `Divine consultation completed with ${astrologerName} (${discipline}) for ${birthDetails.name || 'Devotee'}. Explored key planetary influences around "${effectiveTopic}", analyzing verified Lagna (${astroContext?.lagna || 'Ascendant'}), Moon sign (${astroContext?.moonRashi || 'Chandra Sign'}), and active Vimshottari Dasha (${astroContext?.currentDasha || 'current cycle'}). Prescribed ${canonicalRemedies.primaryHomam.name} and ${canonicalRemedies.primaryMantra.title}.`,
        astrologicalHighlights: [
          `Ascendant (Lagna) is ${astroContext?.lagna || 'favorably aligned'}, conferring intellectual resilience and personal capacity.`,
          `Current Mahadasha period (${astroContext?.currentDasha || 'active cycle'}) is initiating a pivotal transition phase favoring stability and clarity.`,
          `Benefic planetary rays protect key quadrant houses, dissipating longstanding transit delays.`,
        ],
        timelinePredictions: [
          `Next 3-6 Months: Auspicious window for pivotal decisions, personal momentum, and clear resolution.`,
          `Upcoming 12 Months: Harmonious phase for domestic stability, fruitful achievements, and spiritual grounding.`,
        ],
        recommendedRemedies: [
          {
            type: 'homam',
            title: canonicalRemedies.primaryHomam.name,
            instructions: `Perform on ${canonicalRemedies.primaryHomam.day} at sunrise with pure cow ghee. Offering samidha: ${canonicalRemedies.primaryHomam.samidha}. Ahuti Mantra: ${canonicalRemedies.primaryHomam.ahutiMantra}.`,
          },
          {
            type: 'mantra',
            title: canonicalRemedies.primaryMantra.title,
            instructions: `Chant "${canonicalRemedies.primaryMantra.transliteration}" ${canonicalRemedies.primaryMantra.japaCount} at ${canonicalRemedies.primaryMantra.bestTime} with consecrated ${canonicalRemedies.primaryMantra.mala}.`,
          },
          {
            type: 'ishta_devata',
            title: `Ishta Devata Upasana: ${ishtaDevata ? ishtaDevata.deityName : 'Personal Divine Guardian'}`,
            instructions: ishtaDevata
              ? `Guiding deity indicated by Atmakaraka ${ishtaDevata.atmakarakaPlanet} & 12th from Karakamsa (${ishtaDevata.twelfthSignFromKarakamsa}). Daily prayer with pure cow ghee deepam and mantra: ${ishtaDevata.primaryMantra} on ${ishtaDevata.auspiciousDay}.`
              : 'Perform daily morning prayer with a pure cow-ghee lamp at sunrise.',
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
          'Pushya Nakshatra & Abhijit Muhurat windows',
        ],
        panditJiFinalBlessing: `May the supreme cosmic energies and Navagrahas shower peace, robust health, and abundant prosperity upon you and your family. Om Shanti Shanti Shanti.`,
      };
    }

    // 5. Synthesize Dynamic OpenAI Summary with STRICT Language Mandates
    const openaiApiKey = await getServerOpenAIApiKey();

    if (openaiApiKey) {
      try {
        const currentYear = new Date().getFullYear();
        const systemPrompt = `You are an elite Vedic astrology report generator for AstroParihar.
Real-Time Calendar Anchor: The current year is strictly ${currentYear}. All timeline predictions and astrological highlights must be calculated for ${currentYear} and future years. Never refer to past years as current.

CRITICAL MULTILINGUAL MANDATE:
- Chosen Consultation Language: "${language}"
- You MUST synthesize the entire summary strictly in "${language}".
- If Telugu: Write overview, astrologicalHighlights, timelinePredictions, recommendedRemedies instructions, auspiciousDates, and panditJiFinalBlessing in pure, respectful, authentic Telugu script (తెలుగు).
- If Hindi: Write in pure Hindi Devanagari script (हिन्दी).
- If Tamil: Write in pure Tamil script (தமிழ்).
- If Kannada: Write in pure Kannada script (ಕನ್ನಡ).
- If English: Write in respectful, traditional Indian Vedic astrology tone.
- The JSON keys ("overview", "astrologicalHighlights", "timelinePredictions", "recommendedRemedies", "auspiciousDates", "panditJiFinalBlessing") MUST remain in English, but ALL string values MUST be in "${language}".

AUTHENTIC JYOTISH CONTEXT & TOPIC GROUND TRUTH:
- Devotee Name: ${birthDetails.name || 'Devotee'}
- Verified Ascendant (Lagna): ${astroContext?.lagna || 'Vedic Ascendant'}
- Moon Sign (Chandra Rashi): ${astroContext?.moonRashi || 'Chandra Sign'} (${astroContext?.nakshatra || ''})
- Active Vimshottari Dasha: ${astroContext?.currentDasha || 'Active Dasha'}
- Consultation Core Topic: "${effectiveTopic}"
- Prescribed In-Session Homam: "${canonicalRemedies.primaryHomam.name}"
- Prescribed In-Session Mantra: "${canonicalRemedies.primaryMantra.title}"
- Verified Ishta Devata: "${ishtaDevata ? ishtaDevata.deityName : 'Personal Divine Guardian'}"
- Prescribed Gemstone: "${canonicalRemedies.gemstone.name}"
${astroContext?.chartSummary ? `- Planetary Placements:\n${astroContext.chartSummary}` : ''}

TRANSCRIPT RELEVANCE MANDATE:
Base your summary faithfully on what the Devotee actually asked and what the Astrologer guided in the consultation transcript. Emphasize their genuine concern ("${effectiveTopic}"). Do NOT divert to unrelated topics.

Respond ONLY with a valid JSON object matching this schema:
{
  "overview": "2-3 sentence overview of the astrological consultation reading in ${language}, referencing their verified ${astroContext?.lagna || 'Lagna'}, active ${astroContext?.currentDasha || 'Dasha'}, and the prescribed ${canonicalRemedies.primaryHomam.name}",
  "astrologicalHighlights": ["Point 1 in ${language} about verified Lagna and planetary alignment", "Point 2 in ${language} about active Dasha/houses", "Point 3 in ${language} about transit energy"],
  "timelinePredictions": ["Prediction 1 in ${language} with specific timeline in ${currentYear}/${currentYear + 1}", "Prediction 2 in ${language} with specific timeline"],
  "recommendedRemedies": [
    {"type": "homam", "title": "${canonicalRemedies.primaryHomam.name}", "instructions": "Ritual timing, samidha, and day instructions in ${language}"},
    {"type": "mantra", "title": "${canonicalRemedies.primaryMantra.title}", "instructions": "Chanting count, time of day, and guidelines in ${language}"},
    {"type": "ishta_devata", "title": "Ishta Devata: ${ishtaDevata ? ishtaDevata.deityName : 'Personal Divine Guardian'}", "instructions": "Daily prayer, lamp, and worship guidelines in ${language}"},
    {"type": "gemstone", "title": "${canonicalRemedies.gemstone.name}", "instructions": "Metal, finger, or consecration rule in ${language}"}
  ],
  "auspiciousDates": ["Favorable day 1 in ${language}", "Favorable day 2 in ${language}"],
  "panditJiFinalBlessing": "A compassionate and uplifting closing spiritual blessing in ${language}"
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
                  content: `Consultation Transcript Context:\n${transcriptText || 'Consultation on ' + effectiveTopic}`,
                },
              ],
              temperature: 0.6,
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

          // Ensure Ishta Devata is present
          const hasIshta = finalRemedies.some((r: any) =>
            r.type === 'ishta_devata' ||
            r.title?.toLowerCase().includes('ishta') ||
            r.title?.includes('ఇష్ట') ||
            r.title?.includes('इष्ट')
          );
          if (!hasIshta && ishtaDevata) {
            const defaultIshta = summary.recommendedRemedies.find((r: any) => r.type === 'ishta_devata');
            if (defaultIshta) {
              finalRemedies.push(defaultIshta);
            }
          }

          summary = {
            overview: parsed.overview || summary.overview,
            astrologicalHighlights:
              Array.isArray(parsed.astrologicalHighlights) && parsed.astrologicalHighlights.length > 0
                ? parsed.astrologicalHighlights
                : summary.astrologicalHighlights,
            timelinePredictions:
              Array.isArray(parsed.timelinePredictions) && parsed.timelinePredictions.length > 0
                ? parsed.timelinePredictions
                : summary.timelinePredictions,
            recommendedRemedies: finalRemedies,
            auspiciousDates:
              Array.isArray(parsed.auspiciousDates) && parsed.auspiciousDates.length > 0
                ? parsed.auspiciousDates
                : summary.auspiciousDates,
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
