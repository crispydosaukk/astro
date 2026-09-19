export interface TheoryQuestion {
  id: number;
  question: string;
  questionHi?: string;
  questionTe?: string;
  questionTa?: string;
  options: string[];
  optionsHi?: string[];
  optionsTe?: string[];
  optionsTa?: string[];
  correctIndex: number;
  explanation: string;
  explanationHi?: string;
  explanationTe?: string;
  explanationTa?: string;
  topic?: string;
  topicHi?: string;
  topicTe?: string;
  topicTa?: string;
}

export const THEORY_QUESTIONS: TheoryQuestion[] = [
  {
    id: 1,
    question: 'In Vedic Jyotish, which house represents Dharma, higher wisdom, fortunes (Bhagya), and the Guru?',
    questionHi: 'वैदिक ज्योतिष में कौन सा भाव धर्म, उच्च ज्ञान, ईश्वरीय भाग्य और गुरु का प्रतिनिधित्व करता है?',
    questionTe: 'వేద జ్యోతిషంలో ధర్మం, ఉన్నత జ్ఞానం, దైవిక భాగ్యం మరియు గురువును సూచించే భావం ఏది?',
    questionTa: 'வேத ஜோதிடத்தில் தர்மம், உயர் ஞானம், தெய்வீக பாக்கியம் மற்றும் குருவை குறிக்கும் பாவம் எது?',
    options: ['5th House (Trikona)', '9th House (Bhagya Sthana)', '10th House (Karma Sthana)', '1st House (Lagna)'],
    optionsHi: ['पंचम भाव (त्रिकोण)', 'नवम भाव (भाग्य स्थान)', 'दशम भाव (कर्म स्थान)', 'प्रथम भाव (लग्न)'],
    optionsTe: ['5వ భావం (త్రికోణం)', '9వ భావం (భాగ్య స్థానం)', '10వ భావం (కర్మ స్థానం)', '1వ భావం (లగ్నం)'],
    optionsTa: ['5ஆம் பாவம் (திரிகோணம்)', '9ஆம் பாவம் (பாக்கிய ஸ்தானம்)', '10ஆம் பாவம் (கர்ம ஸ்தானம்)', '1ஆம் பாவம் (லக்னம்)'],
    correctIndex: 1,
    explanation: 'The 9th house is the prime Dharma and Bhagya Bhava representing divine fortunes, pilgrimage, and spiritual guidance.',
    explanationHi: 'नवम भाव मुख्य धर्म एवं भाग्य भाव है जो ईश्वरीय कृपा, तीर्थाटन तथा गुरु के मार्गदर्शन का कारक है।',
    explanationTe: '9వ భావం ప్రధాన ధర్మ మరియు భాగ్య భావము. ఇది దైవ కృప, తీర్థయాత్రలు మరియు గురు అనుగ్రహాన్ని సూచిస్తుంది.',
    explanationTa: '9ஆம் பாவம் முதன்மையான தர்ம மற்றும் பாக்கிய ஸ்தானமாகும். இது குருவின் வழிகாட்டல் மற்றும் பூர்வ புண்ணியத்தை குறிக்கிறது.',
    topic: 'Bhavas & Houses',
    topicHi: 'भाव एवं स्थान',
    topicTe: 'భావాలు & స్థానాలు',
    topicTa: 'பாவங்கள் & ஸ்தானங்கள்'
  },
  {
    id: 2,
    question: 'Which planetary combination forms a classic "Gajakesari Yoga"?',
    questionHi: 'शास्त्रीय ज्योतिष के अनुसार शुभ फलदायी "गजकेसरी योग" का निर्माण किन ग्रहों की स्थिति से होता है?',
    questionTe: 'శాస్త్రీయ జ్యోతిషం ప్రకారం అత్యంత శుభప్రదమైన "గజకేసరి యోగం" ఏ గ్రహాల కలయికతో ఏర్పడుతుంది?',
    questionTa: 'சாஸ்திர ஜோதிட விதிகளின்படி நற்பலன் தரும் "கஜகேசரி யோகம்" எந்த கிரக அமைப்பால் உருவாகிறது?',
    options: [
      'Sun and Mercury in the same house (Budhaditya)',
      'Jupiter and Moon in Kendra (1, 4, 7, 10) from each other',
      'Saturn and Rahu conjunction (Shrapit Yoga)',
      'Mars in the 7th house from Lagna'
    ],
    optionsHi: [
      'सूर्य और बुध एक ही भाव में (बुधादित्य योग)',
      'बृहस्पति (गुरु) और चन्द्रमा एक-दूसरे से केन्द्र (1, 4, 7, 10) में स्थित हों',
      'शनि और राहु की युति (श्रापित योग)',
      'लग्न से सप्तम भाव में मंगल'
    ],
    optionsTe: [
      'సూర్యుడు మరియు బుధుడు ఒకే భావంలో ఉండటం (బుధాదిత్య యోగం)',
      'బృహస్పతి (గురువు) మరియు చంద్రుడు పరస్పరం కేంద్రాలలో (1, 4, 7, 10) ఉండటం',
      'శని మరియు రాహువు కలయిక (శ్రాపిత యోగం)',
      'లగ్నం నుండి 7వ స్థానంలో కుజుడు'
    ],
    optionsTa: [
      'சூரியனும் புதனும் ஒரே பாவத்தில் இணைவது (புதாதித்ய யோகம்)',
      'குருவும் சந்திரனும் பரஸ்பரம் கேந்திரங்களில் (1, 4, 7, 10) அமைவது',
      'சனி மற்றும் ராகு சேர்க்கை (சாப யோகம்)',
      'லக்னத்திலிருந்து 7ஆம் வீட்டில் செவ்வாய் இருப்பது'
    ],
    correctIndex: 1,
    explanation: 'Gajakesari Yoga is formed when Jupiter occupies a Kendra from the Moon or Lagna, conferring wisdom, respect, and enduring fame.',
    explanationHi: 'गजकेसरी योग तब बनता है जब देवगुरु बृहस्पति चन्द्रमा अथवा लग्न से केन्द्र में स्थित हों, जिससे ज्ञान, यश और दीर्घकालिक प्रतिष्ठा मिलती है।',
    explanationTe: 'గురువు చంద్రుని నుండి లేదా లగ్నం నుండి కేంద్రంలో ఉన్నప్పుడు గజకేసరి యోగం ఏర్పడుతుంది. ఇది జ్ఞానం, యశస్సు మరియు కీర్తిని ప్రసాదిస్తుంది.',
    explanationTa: 'சந்திரனிலிருந்தோ அல்லது லக்னத்திலிருந்தோ குரு கேந்திரத்தில் அமையும்போது கஜகேசரி யோகம் உருவாகி ஞானம், நற்பெயர் மற்றும் நிலைத்த புகழை அளிக்கிறது.',
    topic: 'Auspicious Yogas',
    topicHi: 'शुभ राजयोग',
    topicTe: 'శుభ రాజయోగాలు',
    topicTa: 'சுப ராஜயோகங்கள்'
  },
  {
    id: 3,
    question: 'How is the strength of a planet in the Navamsha (D9) chart interpreted relative to the Rashi (D1) chart?',
    questionHi: 'नवांश चक्र (D9) का विश्लेषण लग्न कुंडली (D1) के सापेक्ष किस प्रकार किया जाता है?',
    questionTe: 'రాశి చక్రం (D1) ఆధారంగా నవాంశ చక్రం (D9) లోని గ్రహ బలాన్ని ఎలా విశ్లేషిస్తారు?',
    questionTa: 'ராசி கட்டம் (D1) மற்றும் நவாம்சம் (D9) ஆகியவற்றின் அடிப்படையில் ஒரு கிரகத்தின் பலம் எவ்வாறு கணிக்கப்படுகிறது?',
    options: [
      'D9 is only used for wealth calculations',
      'A debilitated planet in D1 gaining exaltation in D9 gains Neecha Bhanga and hidden inner strength (Vargottama/Pushkara)',
      'D9 completely overrides D1 in all circumstances',
      'D9 has no bearing on planetary strength'
    ],
    optionsHi: [
      'नवांश चक्र केवल धन गणना के लिए प्रयोग होता है',
      'लग्न कुंडली (D1) में नीचस्थ ग्रह यदि नवांश (D9) में उच्च का हो तो उसे नीचभंग और आंतरिक आत्मबल प्राप्त होता है',
      'नवांश कुंडली सभी परिस्थितियों में लग्न चक्र को निरस्त कर देती है',
      'नवांश का ग्रहों के वास्तविक बलाबल से कोई संबंध नहीं होता'
    ],
    optionsTe: [
      'D9 కేవలం ధన సంపాదన గణన కొరకు మాత్రమే ఉపయోగపడుతుంది',
      'D1 లో నీచంలో ఉన్న గ్రహం D9 లో ఉచ్ఛ స్థితి పొందితే నీచభంగం మరియు అంతర్గత ఆత్మబలం లభిస్తుంది',
      'D9 అన్ని సందర్భాలలో D1 ని పూర్తిగా తోసిపుచ్చుతుంది',
      'గ్రహాల నిజమైన బలానికి నవాంశకు ఎటువంటి సంబంధం లేదు'
    ],
    optionsTa: [
      'நவாம்சம் தன வரவு கணக்கீடுகளுக்கு மட்டுமே பயன்படுகிறது',
      'D1-ல் நீசமடைந்த கிரகம் D9-ல் உச்சம் பெற்றால் நீசபங்கமும் உள்ளீடான ஆத்மபலமும் பெறுகிறது',
      'அனைத்து சூழல்களிலும் D1-ஐ விட D9 முழுமையாக மேலோங்குகிறது',
      'கிரகங்களின் உண்மை பலத்திற்கு நவாம்சத்திற்கு தொடர்பில்லை'
    ],
    correctIndex: 1,
    explanation: 'Navamsha reveals the fruit (Phala) and underlying core potential of planetary placements in the natal chart.',
    explanationHi: 'नवांश चक्र ग्रहों के आंतरिक फल (फलित सामर्थ्य) और वास्तविक सूक्ष्म बल को प्रकट करता है।',
    explanationTe: 'నవాంశ చక్రం గ్రహాల అంతర్గత ఫలాన్ని మరియు లగ్న కుండలిలోని గ్రహ స్థానాల వాస్తవ శక్తిని వెల్లడిస్తుంది.',
    explanationTa: 'நவாம்சம் என்பது லக்ன கட்டத்தில் உள்ள கிரகங்களின் அந்தரங்க சூட்சும பலனையும் உண்மையான பலனையும் வெளிப்படுத்துகிறது.',
    topic: 'Divisional Charts (D9)',
    topicHi: 'वर्ग कुंडलियाँ (नवांश D9)',
    topicTe: 'వర్గ కుండలులు (నవాంశ D9)',
    topicTa: 'வர்க்க சக்கரங்கள் (நவாம்சம் D9)'
  },
  {
    id: 4,
    question: 'What is the standard order of the Vimshottari Dasha system starting from Ketu?',
    questionHi: 'केतु से प्रारम्भ होने वाली 120 वर्षीय विंशोत्तरी महादशा चक्र का प्रामाणिक शास्त्रीय क्रम क्या है?',
    questionTe: 'కేతువుతో ప్రారంభమయ్యే 120 సంవత్సరాల వింశోత్తరి మహాదశల ప్రామాణిక క్రమం ఏది?',
    questionTa: 'கேதுவில் துவங்கும் 120 வருட விம்சோத்தரி மகா தசா சுழற்சியின் சரியான பாரம்பரிய வரிசை எது?',
    options: [
      'Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury',
      'Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus',
      'Jupiter → Saturn → Mercury → Ketu → Venus → Sun → Moon → Mars → Rahu',
      'Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus → Sun → Moon'
    ],
    optionsHi: [
      'केतु → शुक्र → सूर्य → चन्द्र → मंगल → राहु → गुरु → शनि → बुध',
      'सूर्य → चन्द्र → मंगल → राहु → गुरु → शनि → बुध → केतु → शुक्र',
      'गुरु → शनि → बुध → केतु → शुक्र → सूर्य → चन्द्र → मंगल → राहु',
      'मंगल → राहु → गुरु → शनि → बुध → केतु → शुक्र → सूर्य → चन्द्र'
    ],
    optionsTe: [
      'కేతువు → శుక్రుడు → సూర్యుడు → చంద్రుడు → కుజుడు → రాహువు → గురువు → శని → బుధుడు',
      'సూర్యుడు → చంద్రుడు → కుజుడు → రాహువు → గురువు → శని → బుధుడు → కేతువు → శుక్రుడు',
      'గురువు → శని → బుధుడు → కేతువు → శుక్రుడు → సూర్యుడు → చంద్రుడు → కుజుడు → రాహువు',
      'కుజుడు → రాహువు → గురువు → శని → బుధుడు → కేతువు → శుక్రుడు → సూర్యుడు → చంద్రుడు'
    ],
    optionsTa: [
      'கேது → சுக்கிரன் → சூரியன் → சந்திரன் → செவ்வாய் → ராகு → குரு → சனி → புதன்',
      'சூரியன் → சந்திரன் → செவ்வாய் → ராகு → குரு → சனி → புதன் → கேது → சுக்கிரன்',
      'குரு → சனி → புதன் → கேது → சுக்கிரன் → சூரியன் → சந்திரன் → செவ்வாய் → ராகு',
      'செவ்வாய் → ராகு → குரு → சனி → புதன் → கேது → சுக்கிரன் → சூரியன் → சந்திரன்'
    ],
    correctIndex: 0,
    explanation: 'The standard 120-year Vimshottari dasha cycle begins with Ketu (7 yrs) followed by Venus (20 yrs), Sun (6 yrs), Moon (10 yrs), etc.',
    explanationHi: '120 वर्षीय विंशोत्तरी महादशा चक्र केतु (7 वर्ष) से आरम्भ होकर शुक्र (20 वर्ष), सूर्य (6 वर्ष), चन्द्र (10 वर्ष) आदि क्रम में चलता है।',
    explanationTe: '120 సంవత్సరాల వింశోత్తరి దశ చక్రం కేతువు (7 సం.), శుక్రుడు (20 సం.), సూర్యుడు (6 సం.), చంద్రుడు (10 సం.) క్రమంలో కొనసాగుతుంది.',
    explanationTa: 'விம்சோத்தரி தசா சுழற்சி கேது (7 ஆண்டுகள்), சுக்கிரன் (20 ஆண்டுகள்), சூரியன் (6 ஆண்டுகள்), சந்திரன் (10 ஆண்டுகள்) என்ற வரிசையில் அமைகிறது.',
    topic: 'Dasha Systems',
    topicHi: 'दशा विचार (विंशोत्तरी)',
    topicTe: 'దశా విధానాలు (వింశోత్తరి)',
    topicTa: 'தசா முறைகள் (விம்சோத்தரி)'
  },
  {
    id: 5,
    question: 'When recommending astrological remedies for severe afflictions (e.g. Kaal Sarp or Sade Sati), what is the most ethical approach?',
    questionHi: 'गंभीर दोषों (जैसे कालसर्प अथवा साढ़े साती) में जातक को परामर्श देते समय ज्योतिषी का सबसे सात्विक एवं नैतिक दृष्टिकोण क्या होना चाहिए?',
    questionTe: 'తీవ్ర దోషాలకు (ఉదా: కాలసర్ప లేదా ఏలినాటి శని) పరిహారాలు సూచించేటప్పుడు జ్యోతిష్కుని యొక్క అత్యంత నైతిక మరియు సాత్విక విధానం ఏది?',
    questionTa: 'கடுமையான தோஷங்களுக்கு (உதாரணமாக காலசர்ப்பம் அல்லது ஏழரை சனி) பரிகாரம் கூறும்போது ஜோதிடரின் மிக உன்னதமான நெறிமுறை அணுகுமுறை என்ன?',
    options: [
      'Guarantee 100% immediate results within 24 hours for expensive rituals',
      'Explain planetary energies calmly, recommend accessible japa/charity/mantras, and encourage constructive lifestyle action without fear-mongering',
      'Advise the client that their destiny is completely doomed without expensive gems',
      'Recommend avoiding all consultations in the future'
    ],
    optionsHi: [
      '24 घंटे में 100% चमत्कार का दावा करते हुए अत्यंत महंगी तांत्रिक पूजा का दबाव बनाना',
      'ग्रहों के प्रभाव को सौम्यता से समझाना, भयमुक्त वातावरण बनाना, और सुलभ जप, दान तथा सात्विक जीवनशैली के उपाय बताना',
      'जातक को भयभीत करना कि उसका भविष्य बिना महंगे रत्नों के पूर्णतः नष्ट हो जाएगा',
      'जातक को आगे किसी भी मार्गदर्शन से हतोत्साहित करना'
    ],
    optionsTe: [
      'ఖరీదైన తాంత్రిక పూజలతో 24 గంటల్లో 100% ఫలితం వస్తుందని హామీ ఇవ్వడం',
      'గ్రహాల శక్తులను ప్రశాంతంగా వివరించి, భయపెట్టకుండా సులభమైన జపం, దానం, మంత్రాలు మరియు సదాచార జీవనశైలిని ప్రోత్సహించడం',
      'ఖరీదైన రత్నాలు లేకుండా వారి జీవితం నాశనమవుతుందని క్లయింట్‌ను భయపెట్టడం',
      'భవిష్యత్తులో ఎటువంటి జ్యోతిష సంప్రదింపులు చేయవద్దని చెప్పడం'
    ],
    optionsTa: [
      '24 மணி நேரத்தில் 100% அற்புதம் நடக்கும் என கூறி விலையுயர்ந்த பூஜைகளுக்கு அழுத்தம் தருவது',
      'கிரக நிலைகளை அமைதியாக விளக்கி, அச்சமூட்டாமல் எளிய ஜபம், தானம் மற்றும் நல்லொழுக்க வாழ்க்கை முறையை பரிந்துரைப்பது',
      'விலையுயர்ந்த ரத்தினங்கள் அணியாவிட்டால் எதிர்காலம் பாழாகிவிடும் என பயமுறுத்துவது',
      'எதிர்காலத்தில் எந்த ஜோதிட ஆலோசனையும் பெற வேண்டாம் என கூறுவது'
    ],
    correctIndex: 1,
    explanation: 'Ethical Vedic guidance empowers clients with sattvic remedies, positive karma, and realistic guidance without creating anxiety.',
    explanationHi: 'प्रामाणिक वैदिक ज्योतिष का उद्देश्य जातक के मन को शांत करना तथा सात्विक उपाय, कर्म शुद्धि और सकारात्मक दिशा प्रदान करना है।',
    explanationTe: 'నైతిక వేద జ్యోతిష్యం క్లయింట్లలో భయాన్ని నివారించి, సాత్విక పరిహారాలు, కర్మ శుద్ధి మరియు ఆత్మవిశ్వాసాన్ని కలిగిస్తుంది.',
    explanationTa: 'பாரம்பரிய வேத ஜோதிடத்தின் முக்கிய நோக்கம் பயத்தை நீக்கி, சாத்விக பரிகாரங்கள் மற்றும் நல்வழியில் நேர்மறை தன்னம்பிக்கையை ஊட்டுவதே ஆகும்.',
    topic: 'Consulting Ethics',
    topicHi: 'ज्योतिषीय नैतिकता एवं उपाय',
    topicTe: 'సంప్రదింపు నైతికత & పరిహారాలు',
    topicTa: 'ஜோதிட நெறிமுறைகள் & பரிகாரங்கள்'
  },
  {
    id: 6,
    question: 'Under which classical condition is Kuja (Mangal) Dosha considered cancelled or significantly mitigated?',
    questionHi: 'शास्त्रीय नियमों के अनुसार कुज (मंगल) दोष का परिहार अथवा निरस्तीकरण किस स्थिति में माना जाता है?',
    questionTe: 'శాస్త్రీయ నియమాల ప్రకారం కుజ (మంగళ) దోష పరిహారం లేదా ఉపశమనం ఏ స్థితిలో పరిగణించబడుతుంది?',
    questionTa: 'சாஸ்திர விதிகளின்படி செவ்வாய் தோஷ நிவர்த்தி அல்லது தோஷ பங்கம் எந்த நிலையில் ஏற்படுகிறது?',
    options: [
      'When Mars is placed in the 8th house in an enemy sign',
      'When Mars is in its own sign (Aries/Scorpio), exalted (Capricorn), or aspected by powerful Jupiter',
      'Whenever Mars is retrograde without any aspects',
      'Kuja Dosha can never be cancelled under any circumstance'
    ],
    optionsHi: [
      'जब मंगल अष्टम भाव में शत्रु राशि में स्थित हो',
      'जब मंगल अपनी स्वराशि (मेष/वृश्चिक), उच्च राशि (मकर) में हो अथवा शुभ गुरु से दृष्ट या युत हो',
      'जब मंगल बिना किसी दृष्टि के केवल वक्री हो',
      'कुज दोष का किसी भी परिस्थिति में परिहार संभव नहीं है'
    ],
    optionsTe: [
      'కుజుడు 8వ భావంలో శత్రు రాశిలో ఉన్నప్పుడు',
      'కుజుడు స్వక్షేత్రం (మేషం/వృశ్చికం), ఉచ్ఛ క్షేత్రం (మకరం) లో ఉన్నప్పుడు లేదా శుభ గురు దృష్టి పొందినప్పుడు',
      'ఎలాంటి దృష్టి లేకుండా కుజుడు వక్రించినప్పుడు మాత్రమే',
      'ఎలాంటి పరిస్థితులలోనూ కుజ దోష పరిహారం సాధ్యం కాదు'
    ],
    optionsTa: [
      'செவ்வாய் 8ஆம் வீட்டில் பகை ராசியில் அமரும்போது',
      'செவ்வாய் ஆட்சி (மேஷம்/விருச்சிகம்), உச்சம் (மகரம்) அல்லது சுப குருவின் பார்வை/சேர்க்கை பெறும்போது',
      'எந்தப் பார்வையும் இன்றி செவ்வாய் வக்ரமடையும்போது மட்டும்',
      'எந்தக் காரணத்தைக் கொண்டும் செவ்வாய் தோஷம் விலகாது'
    ],
    correctIndex: 1,
    explanation: 'Kuja dosha is mitigated when Mars is in its own or exalted sign, or receives benefic aspects from Jupiter.',
    explanationHi: 'मंगल अपनी स्वराशि (मेष, वृश्चिक) अथवा उच्च राशि (मकर) में हो, या शुभ गुरु की पूर्ण दृष्टि प्राप्त हो, तो मंगल दोष का परिहार हो जाता है।',
    explanationTe: 'కుజుడు తన సొంత లేదా ఉచ్ఛ రాశిలో ఉన్నప్పుడు, లేదా దేవగురువైన బృహస్పతి యొక్క శుభ దృష్టి కలిగినప్పుడు కుజ దోషం రద్దవుతుంది లేదా నివృత్తి అవుతుంది.',
    explanationTa: 'செவ்வாய் ஆட்சி அல்லது உச்ச வீடுகளில் அமைந்தாலோ, சுப பலம் வாய்ந்த குருவின் பார்வை பெற்றாலோ செவ்வாய் தோஷம் பெருமளவு நிவர்த்தியாகிறது.',
    topic: 'Kuja Dosha',
    topicHi: 'कुज दोष परिहार',
    topicTe: 'కుజ దోష పరిహారం',
    topicTa: 'செவ்வாய் தோஷ நிவர்த்தி'
  },
  {
    id: 7,
    question: 'Which planet forms the prestigious "Hamsa Yoga" among the classical Pancha Mahapurusha Yogas?',
    questionHi: 'पंच महापुरुष योगों में प्रतिष्ठित "हंस योग" की रचना किस ग्रह द्वारा होती है?',
    questionTe: 'పంచ మహాపురుష యోగాలలో ప్రతిష్టాత్మకమైన "హంస యోగం" ఏ గ్రహం ద్వారా ఏర్పడుతుంది?',
    questionTa: 'பஞ்ச மகாபுருஷ யோகங்களில் மேன்மைமிக்க "ஹம்ச யோகம்" எந்த கிரக அமைப்பினால் உண்டாகிறது?',
    options: [
      'Venus exalted in Pisces in Kendra',
      'Jupiter in Kendra placed in own signs (Sagittarius/Pisces) or exalted in Cancer',
      'Mercury in Gemini or Virgo in Kendra',
      'Saturn in Libra in Kendra'
    ],
    optionsHi: [
      'केन्द्र में मीन राशि में उच्च का शुक्र (मालव्य योग)',
      'केन्द्र में गुरु अपनी स्वराशि (धनु/मीन) अथवा उच्च राशि (कर्क) में स्थित हो (हंस योग)',
      'केन्द्र में मिथुन अथवा कन्या में बुध (भद्र योग)',
      'केन्द्र में तुला राशि में शनि (शश योग)'
    ],
    optionsTe: [
      'కేంద్రంలో మీన రాశిలో ఉచ్ఛ స్థితిలో ఉన్న శుక్రుడు (మాళవ్య యోగం)',
      'కేంద్రాలలో గురువు స్వక్షేత్రాలలో (ధనుస్సు/మీనం) లేదా ఉచ్ఛ క్షేత్రమైన కర్కాటకంలో ఉన్నప్పుడు (హంస యోగం)',
      'కేంద్రంలో మిథునం లేదా కన్యలో బుధుడు (భద్ర యోగం)',
      'కేంద్రంలో తులా రాశిలో శని (శశ యోగం)'
    ],
    optionsTa: [
      'கேந்திரத்தில் மீனத்தில் உச்சம் பெற்ற சுக்கிரன் (மாளவ்ய யோகம்)',
      'கேந்திரங்களில் குரு ஆட்சி (தனுசு/மீனம்) அல்லது உச்சம் (கடகம்) பெற்று அமையும்போது (ஹம்ச யோகம்)',
      'கேந்திரத்தில் மிதுனம் அல்லது கன்னியில் புதன் (பத்ர யோகம்)',
      'கேந்திரத்தில் துலாம் ராசியில் சனி (சச யோகம்)'
    ],
    correctIndex: 1,
    explanation: 'Hamsa Yoga is formed when Jupiter occupies a Kendra in Cancer, Sagittarius, or Pisces, bestowing wisdom, righteousness, and spiritual preeminence.',
    explanationHi: 'जब देवगुरु बृहस्पति केन्द्र (1, 4, 7, 10) में कर्क, धनु अथवा मीन राशि में स्थित होते हैं, तब हंस महापुरुष योग का निर्माण होता है।',
    explanationTe: 'గురువు కేంద్రాలలో (1, 4, 7, 10) కర్కాటక, ధనుస్సు లేదా మీన రాశులలో ఉన్నప్పుడు హంస యోగం ఏర్పడి ధర్మనిష్ట, జ్ఞానం మరియు ఉన్నత గౌరవాన్ని ఇస్తుంది.',
    explanationTa: 'குரு கேந்திர ஸ்தானங்களில் கடகம், தனுசு அல்லது மீனத்தில் அமையும்போது ஹம்ச யோகம் உருவாகி ஆன்மீக ஞானம், நீதி நேர்மை மற்றும் பெரும் புகழை அளிக்கிறது.',
    topic: 'Mahapurusha Yoga',
    topicHi: 'पंच महापुरुष योग',
    topicTe: 'పంచ మహాపురుష యోగాలు',
    topicTa: 'பஞ்ச மகாபுருஷ யோகம்'
  },
  {
    id: 8,
    question: 'During which transit phase does a native experience the traditional 7.5-year cycle of Shani Sade Sati?',
    questionHi: 'जातक की जन्म कुंडली के अनुसार शनि की साढ़े साती की 7.5 वर्ष की अवधि का सही गोचर क्रम क्या है?',
    questionTe: 'జాతకుని జన్మ కుండలి ప్రకారం శని యొక్క 7.5 సంవత్సరాల ఏలినాటి శని (సాడే సాతి) గోచార కాలం ఏది?',
    questionTa: 'ஜாதகரின் சந்திர ராசிப்படி 7.5 ஆண்டுகள் நீடிக்கும் ஏழரை சனி கோச்சார காலம் எவ்வாறு கணக்கிடப்படுகிறது?',
    options: [
      'Saturn transiting the 6th, 8th, and 12th houses from natal Sun',
      'Saturn transiting the 12th, 1st (natal Moon sign), and 2nd houses from the natal Moon',
      'Saturn transiting the 4th and 8th houses from Lagna (Kantaka Shani)',
      'Saturn transiting opposite to natal Mars in the 7th house'
    ],
    optionsHi: [
      'जन्म कालीन सूर्य से 6ठे, 8वें और 12वें भाव में शनि का गोचर',
      'जन्म कालीन चन्द्र राशि से 12वें, जन्म राशि (प्रथम) और द्वितीय भाव में शनि का गोचर',
      'लग्न से चतुर्थ और अष्टम भाव में शनि का गोचर (कंटक/ढैय्या)',
      'सप्तम भाव में जन्म कालीन मंगल के सम्मुख शनि का गोचर'
    ],
    optionsTe: [
      'జన్మ సూర్యుని నుండి 6, 8, మరియు 12వ భావాలలో శని గోచారం',
      'జన్మ చంద్ర రాశి నుండి 12వ, జన్మ రాశి (1వ), మరియు 2వ భావాలలో శని గోచారం',
      'లగ్నం నుండి 4 మరియు 8వ భావాలలో శని గోచారం (కంటక శని/అష్టమ శని)',
      'సప్తమ భావంలో ఉన్న జన్మ కుజునికి ఎదురుగా శని గోచారం'
    ],
    optionsTa: [
      'பிறப்புச் சூரியனிலிருந்து 6, 8 மற்றும் 12ஆம் பாவங்களில் சனி சஞ்சரிக்கும்போது',
      'பிறப்புச் சந்திர ராசிக்கு 12ஆம் வீடு (விரயம்), ஜென்ம ராசி (1ஆம் வீடு) மற்றும் 2ஆம் வீட்டில் (தனம்) சனி சஞ்சரிக்கும்போது',
      'லக்னத்திலிருந்து 4 மற்றும் 8ஆம் வீடுகளில் சனி சஞ்சரிக்கும்போது (அர்த்தாஷ்டம/அஷ்டம சனி)',
      '7ஆம் வீட்டில் உள்ள செவ்வாய்க்கு நேர் எதிரே சனி சஞ்சரிக்கும்போது'
    ],
    correctIndex: 1,
    explanation: 'Sade Sati covers Saturn\'s transit over the sign preceding the natal Moon (12th), the Moon sign itself (1st), and the subsequent sign (2nd), each taking approx 2.5 years.',
    explanationHi: 'साढ़े साती जन्म चन्द्रमा से द्वादश भाव, जन्म राशि (प्रथम) और द्वितीय भाव में शनि के गोचर (प्रत्येक चरण लगभग 2.5 वर्ष) से बनती है।',
    explanationTe: 'ఏలినాటి శని జన్మ చంద్రునికి ముందరి రాశి (12వ), జన్మ రాశి (1వ), మరియు తర్వాతి రాశి (2వ) లలో శని సంచారం (ఒక్కో రాశిలో దాదాపు 2.5 సం.) వలన ఏర్పడుతుంది.',
    explanationTa: 'ஏழரை சனி என்பது பிறப்புச் சந்திரனுக்கு முந்தைய வீடு (12), ஜென்ம ராசி மற்றும் அடுத்த வீடு (2) ஆகிய மூன்றிலும் சனி தலா 2.5 ஆண்டுகள் சஞ்சரிக்கும் காலமாகும்.',
    topic: 'Gochar & Sade Sati',
    topicHi: 'गोचर व साढ़े साती',
    topicTe: 'గోచారం & ఏలినాటి శని',
    topicTa: 'கோச்சாரம் & ஏழரை சனி'
  },
  {
    id: 9,
    question: 'In Jaimini Chara Dasha astrology, how is the native\'s "Atmakaraka" (Soul Signifier) identified?',
    questionHi: 'जैमिनी ज्योतिष के अनुसार जातक का "आत्मकारक" ग्रह किस आधार पर निर्धारित किया जाता है?',
    questionTe: 'జైమిని జ్యోతిష విధానం ప్రకారం జాతకుని "ఆత్మకారక" గ్రహాన్ని ఏ ప్రాతిపదికన గుర్తిస్తారు?',
    questionTa: 'ஜைமினி ஜோதிட சூத்திரங்களின்படி ஒருவரின் "ஆத்மகாரகன்" (ஆன்ம காரக கிரகம்) எவ்வாறு கண்டறியப்படுகிறது?',
    options: [
      'Always the Sun in all horoscopes regardless of degrees',
      'The planet holding the highest degrees (excluding Rahu and Ketu in 7-Karaka scheme)',
      'The lord of the 9th house from Lagna',
      'The planet with the lowest degrees in the natal chart'
    ],
    optionsHi: [
      'सभी कुंडलियों में अंशों की परवाह किए बिना सदैव सूर्य',
      'राहु-केतु को छोड़कर कुंडली में सर्वाधिक अंश (डिग्री) प्राप्त करने वाला ग्रह',
      'लग्न से नवम भाव का स्वामी ग्रह',
      'कुंडली में सबसे कम अंश प्राप्त करने वाला ग्रह (दाराकारक)'
    ],
    optionsTe: [
      'డిగ్రీలతో సంబంధం లేకుండా అన్ని జాతకాలలోనూ సూర్యుడే ఆత్మకారకుడు',
      'రాహు-కేతువులను మినహాయించి కుండలిలో అత్యధిక డిగ్రీలు (భోగాంశలు) పొందిన గ్రహం',
      'లగ్నం నుండి 9వ భావాధిపతి గ్రహం',
      'కుండలిలో అత్యల్ప డిగ్రీలు పొందిన గ్రహం (దారకారక)'
    ],
    optionsTa: [
      'பாகைகளை (Degrees) பொருட்படுத்தாமல் அனைத்து ஜாதகங்களிலும் எப்போதும் சூரியனே',
      'ராகு-கேதுவை தவிர்த்து ஜாதகத்தில் அதிக பாகைகளை (Highest Degree) பெற்ற கிரகம்',
      'லக்னத்திற்கு 9ஆம் வீட்டு அதிபதி',
      'ஜாதகத்தில் மிகக் குறைந்த பாகை பெற்ற கிரகம் (தாராகாரகன்)'
    ],
    correctIndex: 1,
    explanation: 'The Atmakaraka is the planet possessing the highest degree among the 7 planets (Sun to Saturn), representing the soul\'s primary lessons and evolution.',
    explanationHi: 'जैमिनी पद्धति में सूर्य से शनि तक जिस ग्रह के सर्वाधिक भोगांश (अंश) होते हैं, वह जातक का "आत्मकारक" बनता है, जो आत्मा के उद्देश्य को दर्शाता है।',
    explanationTe: 'జైమిని చరకారక పద్ధతిలో సూర్యుని నుండి శని వరకు అత్యధిక డిగ్రీలు గల గ్రహం "ఆత్మకారకుడు" అవుతుంది. ఇది ఆత్మ యొక్క ఉద్దేశాన్ని వెల్లడిస్తుంది.',
    explanationTa: 'ஜைமினி முறையில் சூரியன் முதல் சனி வரை அதிக பாகை பெற்ற கிரகம் "ஆத்மகாரகன்" ஆகி ஆன்மாவின் கடமையையும் வாழ்வின் நோக்கத்தையும் உணர்த்துகிறது.',
    topic: 'Jaimini Sutras',
    topicHi: 'जैमिनी सूत्र',
    topicTe: 'జైమిని సూత్రాలు',
    topicTa: 'ஜைமினி சூத்திரங்கள்'
  },
  {
    id: 10,
    question: 'In the Ashtakavarga system, how many total benefic points (Bindus) in a specific Bhava generally signify strong auspicious outcomes for transiting planets?',
    questionHi: 'अष्टकवर्ग पद्धति में किसी विशिष्ट भाव में कुल कितने रेखा/बिंदु (Bindus) सामान्यतः अत्यधिक शुभ और अनुकूल फल का संकेत देते हैं?',
    questionTe: 'అష్టకవర్గ పద్ధతిలో ఒక నిర్దిష్ట భావంలో మొత్తం ఎన్ని బిందువులు (Bindus) ఉంటే గోచార గ్రహాలకు అత్యంత శుభప్రదమైన ఫలితాలు లభిస్తాయి?',
    questionTa: 'அஷ்டகவர்க்க முறையில் ஒரு குறிப்பிட்ட பாவத்தில் எத்தனை பரல்கள் (Bindus) அமைந்தால் கோச்சார கிரகங்கள் மிகுந்த நற்பலன்களைத் தரும்?',
    options: [
      'Less than 18 points',
      '28 or more points (out of 56 Sarvashtakavarga total for that house)',
      'Exactly 0 points',
      'Points do not affect transit or dasha results'
    ],
    optionsHi: [
      '18 से कम बिंदु',
      '28 या उससे अधिक बिंदु (सर्वअष्टकवर्ग के 56 बिंदुओं में से)',
      'शून्य बिंदु',
      'अष्टकवर्ग के बिंदुओं का गोचर अथवा दशा फल से कोई संबंध नहीं होता'
    ],
    optionsTe: [
      '18 కంటే తక్కువ బిందువులు',
      '28 లేదా అంతకంటే ఎక్కువ బిందువులు (సర్వాష్టకవర్గంలోని 56 బిందువులలో)',
      'ఖచ్చితంగా 0 బిందువులు',
      'బిందువుల సంఖ్య గోచార లేదా దశా ఫలితాలపై ఎలాంటి ప్రభావం చూపదు'
    ],
    optionsTa: [
      '18-க்கும் குறைவான பரல்கள்',
      '28 அல்லது அதற்கு மேற்பட்ட பரல்கள் (சர்வாஷ்டகவர்க்கத்தின் 56 பரல்களில்)',
      'பூஜ்ஜியம் (0) பரல்கள்',
      'பரல்களின் எண்ணிக்கை கோச்சார அல்லது தசா பலன்களைப் பாதிக்காது'
    ],
    correctIndex: 1,
    explanation: 'An Ashtakavarga score of 28 or more bindus indicates a strong house capable of delivering benefic results during planetary transits.',
    explanationHi: 'सर्वअष्टकवर्ग में 28 या उससे अधिक बिंदु भाव की प्रबलता को दर्शाते हैं, जिससे गोचररत ग्रहों का शुभ प्रभाव निर्बाध रूप से प्राप्त होता है।',
    explanationTe: 'సర్వాష్టకవర్గంలో 28 లేదా అంతకంటే ఎక్కువ బిందువులు ఉన్న భావం బలంగా పరిగణించబడుతుంది మరియు గోచార శుభ ఫలాలను అందిస్తుంది.',
    explanationTa: 'சர்வாஷ்டகவர்க்கத்தில் ஒரு பாவத்தில் 28 அல்லது அதற்கு மேற்பட்ட பரல்கள் அமைந்தால், அப்பாவம் வலுவடைந்து கோச்சாரத்தில் நற்பலன்களைத் தரும்.',
    topic: 'Ashtakavarga',
    topicHi: 'अष्टकवर्ग',
    topicTe: 'అష్టకవర్గం',
    topicTa: 'அஷ்டகவர்க்கம்'
  }
];

export const getQuestionText = (q: any, lang: 'en' | 'hi' | 'te' | 'ta' = 'en') => {
  if (lang === 'te' && q.questionTe) return q.questionTe;
  if (lang === 'ta' && q.questionTa) return q.questionTa;
  if (lang === 'hi' && q.questionHi) return q.questionHi;
  return q.question;
};

export const getOptionsList = (q: any, lang: 'en' | 'hi' | 'te' | 'ta' = 'en') => {
  if (lang === 'te' && q.optionsTe && q.optionsTe.length === q.options?.length) return q.optionsTe;
  if (lang === 'ta' && q.optionsTa && q.optionsTa.length === q.options?.length) return q.optionsTa;
  if (lang === 'hi' && q.optionsHi && q.optionsHi.length === q.options?.length) return q.optionsHi;
  return q.options || [];
};

export const getExplanationText = (q: any, lang: 'en' | 'hi' | 'te' | 'ta' = 'en') => {
  if (lang === 'te' && q.explanationTe) return q.explanationTe;
  if (lang === 'ta' && q.explanationTa) return q.explanationTa;
  if (lang === 'hi' && q.explanationHi) return q.explanationHi;
  return q.explanation || '';
};

export const getTopicText = (q: any, lang: 'en' | 'hi' | 'te' | 'ta' = 'en') => {
  if (lang === 'te' && q.topicTe) return q.topicTe;
  if (lang === 'ta' && q.topicTa) return q.topicTa;
  if (lang === 'hi' && q.topicHi) return q.topicHi;
  return q.topic || 'Vedic Jyotish';
};
