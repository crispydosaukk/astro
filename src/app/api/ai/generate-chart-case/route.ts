import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export interface GeneratedChartCase {
  id: string;
  title: string;
  clientQuery: string;
  lagna: string;
  moonSign: string;
  dasha: string;
  keyPlacements: string;
  expectedObservations?: string;
  recommendedRemedies?: string;
  isAiGenerated?: boolean;
}

const FALLBACK_CASES_EN: GeneratedChartCase[] = [
  {
    id: 'case-fb-1',
    title: 'Case Profile #K-402 (Career & Business Crisis)',
    clientQuery: 'I have experienced sudden career delays and mental restlessness over the past 8 months despite hard work. Will my business venture launch successfully, and what spiritual remedies do you recommend?',
    lagna: 'Scorpio (Vrishchika) - Mars is Lagna lord with Digbala in 10th house',
    moonSign: 'Capricorn (Makara) - Shravana Nakshatra',
    dasha: 'Saturn Mahadasha with Rahu Antardasha',
    keyPlacements: 'Mars in 10th (Leo) with Digbala, Sun in 11th (Virgo), Saturn in 12th',
    expectedObservations: 'Recognize Scorpio Lagna, Mars Digbala in 10th house, Saturn-Rahu dasha sandhi causing friction and timing of revival.',
    recommendedRemedies: 'Sattvic Shani & Rahu pacification, Hanuman Chalisa, Shiva puja, sesame oil lighting, charity, ethical counseling.'
  },
  {
    id: 'case-fb-2',
    title: 'Case Profile #K-708 (Marriage Timing & Manglik Evaluation)',
    clientQuery: 'The client is 31 years old experiencing multiple broken marriage alliances and seeking clarification on whether Kuja Dosha (Manglik) is the primary factor, along with auspicious timing for matrimony.',
    lagna: 'Cancer (Karka) - Moon is Lagna lord in 9th house (Pisces)',
    moonSign: 'Pisces (Meena) - Uttarabhadrapada Nakshatra',
    dasha: 'Jupiter Mahadasha with Venus Antardasha',
    keyPlacements: 'Mars in 7th (Capricorn - exalted Neecha-bhanga), Saturn in 4th, Venus in 11th (Taurus)',
    expectedObservations: 'Exalted Mars in 7th cancels malefic severity due to Ruchaka Yoga/exaltation; Jupiter-Venus dasha activates 7th/9th/11th houses indicating marriage within 14 months.',
    recommendedRemedies: 'Gauri Shankar worship, Katyayani mantra, offering yellow sweets to cows on Thursdays, avoiding unnecessary panic regarding Manglik status.'
  }
];

const FALLBACK_CASES_HI: GeneratedChartCase[] = [
  {
    id: 'case-fb-hi-1',
    title: 'कुंडली केस प्रोफाइल #K-402 (आजीविका एवं व्यापार संकट)',
    clientQuery: 'कठिन परिश्रम के बावजूद पिछले 8 महीनों से मेरे व्यापार में अप्रत्याशित विलंब और मानसिक अशांति चल रही है। क्या मेरा नया उद्यम सफल होगा और आप क्या सात्विक वैदिक उपाय सुझाते हैं?',
    lagna: 'वृश्चिक लग्न - लग्नेश मंगल दशम भाव (सिंह) में दिगबली',
    moonSign: 'मकर राशि - श्रवण नक्षत्र',
    dasha: 'शनि की महादशा में राहु की अंतर्दशा',
    keyPlacements: 'मंगल दशम भाव में दिगबली, सूर्य एकादश (कन्या) में, शनि द्वादश (तुला) में',
    expectedObservations: 'वृश्चिक लग्न, दशमस्थ दिगबली मंगल की शक्ति तथा शनि-राहु दशा संधि के फलित का सटीक विश्लेषण।',
    recommendedRemedies: 'शनि-राहु शांति, हनुमान चालीसा नित्य पाठ, शिव आराधना, तिल के तेल का दीप, सात्विक दान।'
  },
  {
    id: 'case-fb-hi-2',
    title: 'कुंडली केस प्रोफाइल #K-708 (विवाह काल निर्धारण एवं मांगलिक विचार)',
    clientQuery: 'जातक की आयु 31 वर्ष है, अनेक रिश्ते टूट चुके हैं। क्या यह केवल मांगलिक दोष के कारण है और विवाह का शुभ समय कब बनेगा?',
    lagna: 'कर्क लग्न - लग्नेश चन्द्रमा नवम भाव (मीन) में',
    moonSign: 'मीन राशि - उत्तरभाद्रपदा नक्षत्र',
    dasha: 'बृहस्पति महादशा में शुक्र अंतर्दशा',
    keyPlacements: 'सप्तम भाव में उच्च का मंगल (रुचक योग), चतुर्थ में शनि, एकादश में स्वराशि शुक्र',
    expectedObservations: 'सप्तमस्थ उच्च मंगल से मांगलिक दोष का शमन, गुरु-शुक्र दशा में 14 माह के भीतर विवाह का योग।',
    recommendedRemedies: 'गौरी-शंकर पूजा, कात्यायनी मंत्र जप, गुरुवार को गाय को चने की दाल व गुड़ खिलाना।'
  }
];

const FALLBACK_CASES_TE: GeneratedChartCase[] = [
  {
    id: 'case-fb-te-1',
    title: 'కుండలి కేస్ ప్రొఫైల్ #K-402 (వృత్తి & వ్యాపార సంక్షోభం)',
    clientQuery: 'ఎంతో కష్టపడినప్పటికీ గత 8 నెలలుగా వ్యాపారంలో ఊహించని ఆలస్యాలు, మానసిక ఆందోళనలు ఎదురవుతున్నాయి. నా నూతన వ్యాపారం విజయవంతమవుతుందా? మీరు ఏ వేద పరిహారాలను సిఫార్సు చేస్తారు?',
    lagna: 'వృశ్చిక లగ్నం - లగ్నాధిపతి కుజుడు 10వ భావంలో (సింహం) దిగ్బలంతో ఉన్నాడు',
    moonSign: 'మకర రాశి - శ్రవణా నక్షత్రం',
    dasha: 'శని మహాదశలో రాహు అంతర్దశ',
    keyPlacements: '10వ స్థానంలో దిగ్బల కుజుడు, 11వ స్థానంలో సూర్యుడు, 12వ స్థానంలో శని',
    expectedObservations: 'వృశ్చిక లగ్నం, 10వ స్థానంలో కుజ దిగ్బలం, శని-రాహు దశ సంధి ప్రభావాలను గ్రహించి పరిష్కారం సూచించాలి.',
    recommendedRemedies: 'శని, రాహు గ్రహ శాంతి, హనుమాన్ చాలీసా పఠనం, శివార్చన, నువ్వుల నూనె దీపారాధన, పేదలకు దానం.'
  },
  {
    id: 'case-fb-te-2',
    title: 'కుండలి కేస్ ప్రొఫైల్ #K-708 (వివాహ సమయం & కుజ దోష విశ్లేషణ)',
    clientQuery: 'జాతకుడి వయస్సు 31 సంవత్సరాలు. సంబంధాలు కుదరక అనేకసార్లు నిలిచిపోయాయి. దీనికి కుజ దోషం కారణమా మరియు వివాహం ఎప్పుడు అవుతుంది?',
    lagna: 'కర్కాటక లగ్నం - లగ్నాధిపతి చంద్రుడు 9వ స్థానంలో (మీనం)',
    moonSign: 'మీన రాశి - ఉత్తరాభాద్రపద నక్షత్రం',
    dasha: 'గురు మహాదశలో శుక్ర అంతర్దశ',
    keyPlacements: '7వ స్థానంలో ఉచ్ఛ కుజుడు (రుచక యోగం), 4వ స్థానంలో శని, 11వ స్థానంలో శుక్రుడు',
    expectedObservations: '7వ స్థానంలో ఉచ్ఛ కుజుని వల్ల కుజ దోష పరిహారం లభించడం; గురు-శుక్ర దశలలో 14 నెలలలోపు వివాహం జరుగుతుంది.',
    recommendedRemedies: 'గౌరీ శంకర్ పూజ, కాత్యాయని మంత్ర జపం, గురువారాల్లో ఆవులకు బెల్లం, శనగలు సమర్పించడం.'
  }
];

const FALLBACK_CASES_TA: GeneratedChartCase[] = [
  {
    id: 'case-fb-ta-1',
    title: 'ஜாதக ஆய்வு சுயவிவரம் #K-402 (தொழில் & வணிக நெருக்கடி)',
    clientQuery: 'கடும் முயற்சி செய்தும் கடந்த 8 மாதங்களாக தொழிலில் எதிர்பாராத தாமதங்களும் மன உளைச்சலும் ஏற்படுகின்றன. எனது புதிய தொழில் வெற்றி பெறுமா? என்ன சாத்விக பரிகாரங்களை பரிந்துரைக்கிறீர்கள்?',
    lagna: 'விருச்சிக லக்னம் - லக்னாதிபதி செவ்வாய் 10ஆம் வீட்டில் (சிம்மம்) திக்பலம் பெற்றுள்ளார்',
    moonSign: 'மகர ராசி - திருவோண நட்சத்திரம்',
    dasha: 'சனி மகா தசையில் ராகு அந்தர்தசா',
    keyPlacements: '10ஆம் வீட்டில் திக்பல செவ்வாய், 11இல் சூரியன், 12இல் சனி',
    expectedObservations: 'விருச்சிக லக்னம், 10இல் திக்பல செவ்வாய் மற்றும் சனி-ராகு தசா சந்தி தாக்கங்களை சரியாக கணிப்பது.',
    recommendedRemedies: 'சனி-ராகு சாந்தி, அனுமன் சாலிசா பாராயணம், சிவ வழிபாடு, நல்லெண்ணெய் தீபம், அன்னதானம்.'
  },
  {
    id: 'case-fb-ta-2',
    title: 'ஜாதக ஆய்வு சுயவிவரம் #K-708 (திருமண காலம் & செவ்வாய் தோஷ கணிப்பு)',
    clientQuery: 'வாடிக்கையாளருக்கு 31 வயது, பல வரன்கள் தடைபட்டுள்ளன. இதற்கு செவ்வாய் தோஷமே காரணமா? திருமணம் எப்போது கைகூடும்?',
    lagna: 'கடக லக்னம் - லக்னாதிபதி சந்திரன் 9ஆம் வீட்டில் (மீனம்)',
    moonSign: 'மீன ராசி - உத்திரட்டாதி நட்சத்திரம்',
    dasha: 'குரு மகா தசையில் சுக்கிர அந்தர்தசா',
    keyPlacements: '7ஆம் வீட்டில் உச்ச செவ்வாய் (ருச்சக யோகம்), 4இல் சனி, 11இல் சுக்கிரன்',
    expectedObservations: '7இல் உச்ச செவ்வாய் அமைப்பால் செவ்வாய் தோஷ நிவர்த்தி ஏற்படுதல்; குரு-சுக்கிர தசையில் 14 மாதங்களுக்குள் திருமணம் நடக்கும்.',
    recommendedRemedies: 'கௌரி சங்கரர் வழிபாடு, கார்த்தியாயனி மந்திரம், வியாழக்கிழமைகளில் பசுவிற்கு தீவனம் வழங்குதல்.'
  }
];

const FALLBACK_CASES_KN: GeneratedChartCase[] = [
  {
    id: 'case-fb-kn-1',
    title: 'ಕುಂಡಲಿ ಕೇಸ್ ಪ್ರೊಫೈಲ್ #K-402 (ವೃತ್ತಿ & ವ್ಯಾಪಾರ ಬಿಕ್ಕಟ್ಟು)',
    clientQuery: 'ಕಠಿಣ ಪರಿಶ್ರಮದ ನಂತರವೂ ಕಳೆದ 8 ತಿಂಗಳುಗಳಿಂದ ವ್ಯಾಪಾರದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬ ಹಾಗೂ ಮಾನಸಿಕ ಅಶಾಂತಿ ಉಂಟಾಗುತ್ತಿದೆ. ನನ್ನ ಹೊಸ ಉದ್ಯಮ ಯಶಸ್ವಿಯಾಗುವುದೇ? ಯಾವ ಸಾತ್ವಿಕ ವೈದಿಕ ಪರಿಹಾರಗಳನ್ನು ಸೂಚಿಸುತ್ತೀರಿ?',
    lagna: 'ವೃಶ್ಚಿಕ ಲಗ್ನ - ಲಗ್ನಾಧಿಪತಿ ಮಂಗಳನು 10ನೇ ಭಾವದಲ್ಲಿ (ಸಿಂಹ) ದಿಗ್ಬಲ ಹೊಂದಿದ್ದಾನೆ',
    moonSign: 'ಮಕರ ರಾಶಿ - ಶ್ರವಣಾ ನಕ್ಷತ್ರ',
    dasha: 'ಶನಿ ಮಹಾದಶೆಯಲ್ಲಿ ರಾಹು ಅಂತರ್ದಶಾ',
    keyPlacements: '10ನೇ ಸ್ಥಾನದಲ್ಲಿ ದಿಗ್ಬಲ ಮಂಗಳ, 11ನೇ ಸ್ಥಾನದಲ್ಲಿ ಸೂರ್ಯ, 12ನೇ ಸ್ಥಾನದಲ್ಲಿ ಶನಿ',
    expectedObservations: 'ವೃಶ್ಚಿಕ ಲಗ್ನ, 10ರಲ್ಲಿ ದಿಗ್ಬಲ ಮಂಗಳ ಹಾಗೂ ಶನಿ-ರಾಹು ದಶಾ ಸಂಧಿಯ ಪ್ರಭಾವಗಳನ್ನು ನಿಖರವಾಗಿ ಗುರುತಿಸುವುದು.',
    recommendedRemedies: 'ಶನಿ-ರಾಹು ಶಾಂತಿ, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ, ಶಿವ ಪೂಜೆ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪ, ಬಡವರಿಗೆ ದಾನ.'
  },
  {
    id: 'case-fb-kn-2',
    title: 'ಕುಂಡಲಿ ಕೇಸ್ ಪ್ರೊಫೈಲ್ #K-708 (ವಿವಾಹ ಕಾಲ ನಿರ್ಣಯ & ಕುಜ ದೋಷ ವಿಶ್ಲೇಷಣೆ)',
    clientQuery: 'ಜಾತಕನಿಗೆ 31 ವರ್ಷ ವಯಸ್ಸಾಗಿದ್ದು ಅನೇಕ ಸಂಬಂಧಗಳು ಮುರಿದುಬಿದ್ದಿವೆ. ಇದಕ್ಕೆ ಕುಜ ದೋಷವೇ ಕಾರಣವೇ ಮತ್ತು ವಿವಾಹ ಕಾಲ ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ?',
    lagna: 'ಕರ್ಕಾಟಕ ಲಗ್ನ - ಲಗ್ನಾಧಿಪತಿ ಚಂದ್ರನು 9ನೇ ಭಾವದಲ್ಲಿ (ಮೀನ)',
    moonSign: 'ಮೀನ ರಾಶಿ - ಉತ್ತರಾಭಾದ್ರಪದ ನಕ್ಷತ್ರ',
    dasha: 'ಗುರು ಮಹಾದಶೆಯಲ್ಲಿ ಶುಕ್ರ ಅಂತರ್ದಶಾ',
    keyPlacements: '7ನೇ ಸ್ಥಾನದಲ್ಲಿ ಉಚ್ಛ ಮಂಗಳ (ರುಚಕ ಯೋಗ), 4ರಲ್ಲಿ ಶನಿ, 11ರಲ್ಲಿ ಶುಕ್ರ',
    expectedObservations: '7ರಲ್ಲಿ ಉಚ್ಛ ಮಂಗಳನಿಂದ ಕುಜ ದೋಷ ನಿವಾರಣೆ; ಗುರು-ಶುಕ್ರ ದಶೆಯಲ್ಲಿ 14 ತಿಂಗಳೊಳಗೆ ವಿವಾಹ ಯೋಗ.',
    recommendedRemedies: 'ಗೌರಿ-ಶಂಕರ ಪೂಜೆ, ಕಾತ್ಯಾಯನಿ ಮಂತ್ರ ಜಪ, ಗುರುವಾರ ಹಸುವಿಗೆ ಬೆಲ್ಲ ಮತ್ತು ಕಡಲೆಕಾಳು ನೀಡುವುದು.'
  }
];

const FALLBACK_CASES = FALLBACK_CASES_EN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      specialisation = 'Vedic Jyotish',
      language = 'en'
    } = body;

    const langStr = String(language || 'en').toLowerCase();
    const isHindi = langStr === 'hi' || langStr === 'hindi';
    const isTelugu = langStr === 'te' || langStr === 'telugu';
    const isTamil = langStr === 'ta' || langStr === 'tamil';
    const isKannada = langStr === 'kn' || langStr === 'kannada';

    try {
      const openai = getOpenAIClient();
      let langDirective = 'Language: English.';
      if (isHindi) {
        langDirective = 'CRITICAL REQUIREMENT: Output all fields (title, clientQuery, lagna, moonSign, dasha, keyPlacements, expectedObservations, recommendedRemedies) in formal Hindi (हिन्दी) using authentic Vedic terminology.';
      } else if (isTelugu) {
        langDirective = 'CRITICAL REQUIREMENT: Output all fields in authentic Telugu (తెలుగు) using standard Jyotish terminology (లగ్నం, రాశి, మహాదశ, పరిహారాలు).';
      } else if (isTamil) {
        langDirective = 'CRITICAL REQUIREMENT: Output all fields in authentic Tamil (தமிழ்) using standard Jyotish terminology (லக்னம், ராசி, மகா தசா, பரிகாரங்கள்).';
      } else if (isKannada) {
        langDirective = 'CRITICAL REQUIREMENT: Output all fields in authentic Kannada (ಕನ್ನಡ) using standard Jyotish terminology (ಲಗ್ನ, ರಾಶಿ, ಮಹಾದಶಾ, ಪರಿಹಾರಗಳು).';
      }

      const prompt = `Generate a realistic, complex Blind Kundali Case Study scenario for testing a senior astrologer (${specialisation}).
${langDirective}

Include:
1. A unique case title with a case number (e.g. Case Profile #AI-...).
2. Client query with specific life problem (career delay, marital dispute, health, property, foreign travel).
3. Ascendant (Lagna) with sign and lagna lord.
4. Moon Sign (Janma Rashi) with nakshatra.
5. Current Vimshottari Mahadasha and Antardasha.
6. 2-3 key planetary placements that explain the client's current situation.
7. Expected observations that a skilled astrologer should uncover.
8. Recommended sattvic Vedic remedies.

Return JSON in this EXACT schema:
{
  "title": "Case Profile #AI-...",
  "clientQuery": "...",
  "lagna": "...",
  "moonSign": "...",
  "dasha": "...",
  "keyPlacements": "...",
  "expectedObservations": "...",
  "recommendedRemedies": "..."
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an authoritative Vedic Astrological Board Examiner creating challenging blind horoscope case studies. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      if (parsed.title && parsed.clientQuery && parsed.lagna) {
        return NextResponse.json({
          success: true,
          mode: 'ai_dynamic',
          chartCase: {
            id: `ai-case-${Date.now()}`,
            title: parsed.title,
            clientQuery: parsed.clientQuery,
            lagna: parsed.lagna,
            moonSign: parsed.moonSign || 'Scorpio (Vrishchika)',
            dasha: parsed.dasha || 'Saturn - Mercury',
            keyPlacements: parsed.keyPlacements || 'Mars in 10th house, Sun in 11th house',
            expectedObservations: parsed.expectedObservations || '',
            recommendedRemedies: parsed.recommendedRemedies || '',
            isAiGenerated: true
          }
        });
      }
    } catch (aiErr) {
      console.warn('AI chart case generation fallback triggered:', aiErr);
    }

    // Fallback based on language
    const langPool = isKannada ? FALLBACK_CASES_KN
      : isTelugu ? FALLBACK_CASES_TE
      : isTamil ? FALLBACK_CASES_TA
      : isHindi ? FALLBACK_CASES_HI
      : FALLBACK_CASES_EN;
    const fallback = langPool[Math.floor(Math.random() * langPool.length)];
    return NextResponse.json({
      success: true,
      mode: 'fallback',
      chartCase: fallback
    });

  } catch (error: any) {
    console.error('Error generating chart case:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate chart case'
    }, { status: 500 });
  }
}
