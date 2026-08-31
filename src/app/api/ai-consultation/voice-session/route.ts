import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_AI_ASTROLOGERS, AIAstrologer } from '@/lib/aiAstrologerData';

// Dynamic Multi-Lingual Vedic Astrology Conversational Generator (Telugu, Hindi, English, Tamil)
function generateDynamicVedicReply(
  userText: string | null,
  isInitialGreeting: boolean,
  birthDetails: any,
  astroContext: any,
  astrologer: AIAstrologer,
  language: string
): string {
  const name = birthDetails.name || 'Devotee';
  const lagna = astroContext.lagna || 'Scorpio (Vrishchika)';
  const moonRashi = astroContext.moonRashi || 'Aries (Mesha)';
  const nakshatra = astroContext.nakshatra || 'Bharani';
  const dasha = astroContext.currentDasha || 'Jupiter - Mars (Vimshottari)';
  const concern = birthDetails.primaryConcern || 'General Life Path';

  const text = (userText || '').toLowerCase();

  // Detect Language
  const isTelugu =
    language.toLowerCase().includes('telugu') ||
    language.toLowerCase().includes('te') ||
    /[\u0C00-\u0C7F]/.test(userText || '');

  const isTamil =
    language.toLowerCase().includes('tamil') ||
    language.toLowerCase().includes('ta') ||
    /[\u0B80-\u0BFF]/.test(userText || '');

  const isHindi =
    language.toLowerCase().includes('hindi') ||
    language.toLowerCase().includes('hi') ||
    /[\u0900-\u097F]/.test(userText || '');

  // 1. Initial greeting ONLY when isInitialGreeting is explicitly true and no question is asked
  if (isInitialGreeting && (!userText || userText.trim() === '')) {
    if (isTelugu) {
      return `నమస్కారం ${name} గారూ. నేను మీ జ్యోతిష నిపుణుడు ${astrologer.name}. మీ కుండలి ప్రకారం మీ లగ్నం ${lagna}, చంద్ర రాశి ${moonRashi}, మరియు ప్రస్తుత దశా కాలం ${dasha} నడుస్తోంది. మీ ${concern} విషయమై గ్రహాల స్థితిని విశ్లేషించి మీకు సరైన దిశానిర్దేశం చేస్తాను. మీ మనసులోని ప్రధాన ప్రశ్న ఏమిటి?`;
    }
    if (isTamil) {
      return `வணக்கம் ${name}. நான் உங்கள் ஜோதிட நிபுணர் ${astrologer.name}. உங்கள் ஜாதகப்படி லக்னம் ${lagna}, சந்திர ராசி ${moonRashi}, மற்றும் தற்போதைய தசா காலம் ${dasha} நடப்பில் உள்ளது. உங்கள் ${concern} பற்றிய நல்வழிகாட்டலை வழங்குகிறேன். நீங்கள் கேட்க விரும்பும் கேள்வி என்ன?`;
    }
    if (isHindi) {
      return `नमस्ते ${name} जी। मैं आपका ज्योतिषी ${astrologer.name} हूँ। आपकी जन्म कुंडली में लग्न ${lagna}, चंद्र राशि ${moonRashi} और वर्तमान में ${dasha} का प्रभाव है। आपके ${concern} के संदर्भ में ग्रह अनुकूल स्थिति बना रहे हैं। आप अपने किस विषय पर विस्तार से मार्गदर्शन चाहते हैं?`;
    }
    return `Namaste ${name}. I am ${astrologer.name}. Looking at your synthesized Vedic chart, your Lagna is in ${lagna}, Moon sign is ${moonRashi}, and your active Dasha period is ${dasha}. Cosmic energies are actively focusing on your ${concern}. What specific question would you like to explore first?`;
  }

  // 2. Simple greetings by customer (e.g. "హాయ్ స్వామీజీ", "hello", "hi")
  if (
    text === 'హాయ్' ||
    text === 'హాయ్ స్వామీజీ' ||
    text.includes('హాయ్') ||
    text.includes('నమస్తే') ||
    text === 'hello' ||
    text === 'hi' ||
    text === 'வணக்கம்' ||
    text === 'नमस्ते'
  ) {
    if (isTelugu) {
      return `నమస్కారం ${name} గారూ! సంతోషం. మీ ${lagna} లగ్నానికి మరియు ${moonRashi} రాశికి ప్రస్తుతం గ్రహ బలం బాగుంది. మీరు మీ ఉద్యోగం, వివాహం, ఆర్థికం, లేదా నేటి తిథి-నక్షత్రం గురించి ఏ ప్రశ్న అయినా అడగవచ్చు. మీకు దేని గురించి తెలుసుకోవాలని ఉంది?`;
    }
    if (isTamil) {
      return `வணக்கம் ${name}! உங்கள் ${lagna} லக்னம் மற்றும் ${moonRashi} ராசிக்கு கிரக பலன்கள் அனுகூலமாக உள்ளன. வேலை, திருமணம், தன லாபம் அல்லது இன்றைய திதி-நட்சத்திரம் பற்றி என்ன அறிய விரும்புகிறீர்கள்?`;
    }
    if (isHindi) {
      return `नमस्ते ${name} जी! आपकी कुंडली में लग्न ${lagna} और चंद्र राशि ${moonRashi} पर शुभ ग्रहों का प्रभाव है। आप अपने करियर, विवाह, धन या आज के पंचांग के बारे में क्या जानना चाहते हैं?`;
    }
    return `Namaste ${name}! Happy to connect with you. Looking at your ${lagna} Lagna and ${moonRashi} Moon sign, what would you like to explore today — career, marriage, finances, or today's planetary energy?`;
  }

  // 3. Tithi, Nakshatra, Panchang, Today's Energy & Muhurtham
  if (
    text.includes('తిథి') ||
    text.includes('నక్షత్రం') ||
    text.includes('నక్షత్ర') ||
    text.includes('పంచాంగం') ||
    text.includes('ఈరోజు') ||
    text.includes('ముహూర్తం') ||
    text.includes('రాశిఫలం') ||
    text.includes('tithi') ||
    text.includes('nakshatra') ||
    text.includes('panchang') ||
    text.includes('today') ||
    text.includes('horoscope') ||
    text.includes('muhurat') ||
    text.includes('திதி') ||
    text.includes('நட்சத்திரம்') ||
    text.includes('இன்று') ||
    text.includes('तिथि') ||
    text.includes('नक्षत्र') ||
    text.includes('पंचांग') ||
    text.includes('आज')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ జన్మ నక్షత్రం '${nakshatra}' మరియు చంద్ర రాశి '${moonRashi}'. నేటి గోచారంలో చంద్రుడు మీ రాశిపై శుభ దృష్టి సారిస్తున్నాడు. నేటి తిథి మరియు నక్షత్రం ప్రకారం ఈరోజు మీకు కొత్త నిర్ణయాలు తీసుకోవడానికి, ఉద్యోగ మరియు ఆర్థిక ప్రయత్నాలకు అత్యంత అనుకూలంగా ఉంది. ఉదయం 10:30 నుండి 12:00 వరకు రాహుకాలం ఉంటుంది కాబట్టి, ఆ సమయం తప్పించి మిగిలిన శుభ ఘడియల్లో మీ పనులు ప్రారంభించవచ్చు. దీనిపై ఇంకా ఏమైనా సందేహం ఉందా?`;
    }
    if (isTamil) {
      return `${name}, உங்கள் ஜென்ம நட்சத்திரம் '${nakshatra}' மற்றும் ராசி '${moonRashi}'. இன்றைய கோச்சாரப்படி சந்திரனின் சஞ்சாரம் உங்களுக்கு அனுகூலமான நற்பலன்களைத் தருகிறது. இன்றைய திதி மற்றும் நட்சத்திர அமைப்பு புதிய காரியங்களுக்கும் பொருளாதார திட்டங்களுக்கும் ஏற்றதாக உள்ளது. ராகு காலம் தவிர்த்து மற்ற நல்ல நேரங்களில் முக்கிய முடிவுகளை எடுக்கலாம்.`;
    }
    if (isHindi) {
      return `${name} जी, आपका जन्म नक्षत्र '${nakshatra}' और चंद्र राशि '${moonRashi}' है। आज का गोचर आपकी राशि के लिए अत्यंत शुभ ऊर्जा लेकर आया है। आज की तिथि और नक्षत्र आपके करियर तथा व्यक्तिगत कार्यों में सफलता के योग बना रहे हैं। केवल राहुकाल के समय को छोड़कर बाकी समय में आप महत्वपूर्ण कार्य कर सकते हैं।`;
    }
    return `${name}, your birth Nakshatra is '${nakshatra}' and Moon sign is '${moonRashi}'. In today's cosmic transit, the Moon casts a favorable aspect over your chart. Today's Tithi and star alignment are auspicious for career initiatives and financial planning. Avoiding Rahu Kaal will ensure success in your endeavors.`;
  }

  // 4. Language Switch Directives
  if (text.includes('speak in telugu') || text.includes('telugu lo') || text.includes('తెలుగులో') || text.includes('talk in telugu')) {
    return `తప్పకుండా ${name} గారూ! ఇకపై మీతో సంపూర్ణంగా తెలుగులోనే మాట్లాడతాను. మీ కుండలిలో ${lagna} లగ్నం మరియు ${dasha} ప్రభావం వల్ల శుభ ఫలితాలు కలగనున్నాయి. మీకు సంబంధించి ఏ విషయం గురించి తెలుసుకోవాలనుకుంటున్నారు?`;
  }
  if (text.includes('speak in tamil') || text.includes('tamil la') || text.includes('தமிழில்') || text.includes('talk in tamil')) {
    return `நிச்சயமாக ${name}! இனி உங்களுடன் தமிழில் முழுமையாக பேசுகிறேன். உங்கள் ஜாதகத்தில் ${lagna} லக்னம் மற்றும் ${dasha} தசா காலம் நல்ல முன்னேற்றங்களை உருவாக்கும். நீங்கள் அறிய விரும்பும் விவரங்களைக் கூறுங்கள்.`;
  }
  if (text.includes('speak in hindi') || text.includes('hindi me') || text.includes('हिंदी में')) {
    return `अवश्य ${name} जी! अब से हम हिंदी में ही बात करेंगे। आपकी कुंडली में ${lagna} और ${dasha} का चक्र बहुत महत्वपूर्ण है। आपके प्रश्न के अनुसार बताइए कि आपको किस विषय पर मार्गदर्शन चाहिए?`;
  }

  // 5. Career, Job, Business, Promotion, Work
  if (
    text.includes('career') ||
    text.includes('job') ||
    text.includes('promotion') ||
    text.includes('business') ||
    text.includes('work') ||
    text.includes('ఉద్యోగం') ||
    text.includes('కెరీర్') ||
    text.includes('నౌకరి') ||
    text.includes('ప్రమోషన్') ||
    text.includes('వ్యాపారం') ||
    text.includes('వేలై') ||
    text.includes('வேலை') ||
    text.includes('தொழில்') ||
    text.includes('नौकरी') ||
    text.includes('व्यापार')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ కుండలిలో 10వ భావం (దశమ స్థానం - కర్మ స్థానం) పరిశీలించగా, ప్రస్తుత ${dasha} కాలంలో గురు-కుజ గ్రహాల దృష్టి అనుకూలంగా ఉంది. రాబోయే 3 నుండి 6 నెలల్లో ఉద్యోగంలో ప్రమోషన్ లేదా కొత్త ఉన్నత అవకాశాలు వచ్చే బలమైన యోగం ఉంది. గురువారం నాడు విష్ణు సహస్రనామం పారాయణం చేయడం వల్ల పని ప్రదేశంలో ఆటంకాలు తొలగిపోతాయి. ఇంకా ఉద్యోగ బదిలీ లేదా వేతనం గురించి తెలుసుకోవాలా?`;
    }
    if (isTamil) {
      return `${name}, உங்கள் ஜாதகத்தில் 10ஆம் வீடான தொழில் ஸ்தானம் பலமாக உள்ளது. தற்போதைய ${dasha} காலத்தில் குருவின் சுப பார்வையால் வரும் 3 முதல் 6 மாதங்களில் பதவி உயர்வு அல்லது புதிய நல்ல வேலை வாய்ப்புகள் கூடிவரும். வியாழக்கிழமைகளில் தட்சிணாமூர்த்தி வழிபாடு மற்றும் விஷ்ணு சகஸ்ரநாமம் பாராயணம் செய்வது நற்பலன்களைத் தரும்.`;
    }
    if (isHindi) {
      return `${name} जी, आपकी कुंडली का 10वां भाव (कर्म भाव) बहुत प्रभावशाली है। वर्तमान ${dasha} काल में आने वाले 3 से 6 महीनों के भीतर पदोन्नति या नए कार्य के योग बन रहे हैं। गुरुवार के दिन भगवान विष्णु की आराधना करने से कार्यक्षेत्र की सभी बाधाएं दूर होंगी।`;
    }
    return `${name}, in your chart, the 10th house of Karma & Profession is strongly positioned. Under your active ${dasha}, Jupiter’s benefic aspect indicates high chances of promotion or a lucrative transition within the next 3 to 6 months. Chanting the Vishnu Sahasranama on Thursdays will help clear any workplace delays.`;
  }

  // 6. Marriage, Relationship, Kundli Milan, Love
  if (
    text.includes('marriage') ||
    text.includes('wedding') ||
    text.includes('relationship') ||
    text.includes('love') ||
    text.includes('పెళ్లి') ||
    text.includes('వివాహం') ||
    text.includes('సంబంధం') ||
    text.includes('దాంపత్యం') ||
    text.includes('శృంగారం') ||
    text.includes('తిరుమణం') ||
    text.includes('திருமணம்') ||
    text.includes('கல்யாணம்') ||
    text.includes('शादी') ||
    text.includes('विवाह')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ వివాహ స్థానమైన 7వ భావాన్ని పరిశీలించగా, శుక్ర మరియు గురు గ్రహాల సంచారం అనుకూలమైన వాతావరణాన్ని సృష్టిస్తోంది. మీకు అనుకూలమైన వివాహ సంబంధాలు లేదా దాంపత్య సౌఖ్యం కొరకు శుక్రవారం లక్ష్మీ అష్టోత్తర శతనామావళి పఠించడం, అలాగే నవగ్రహాల్లో గురు బలం పెంచుకోవడం అత్యంత శుభకరం. దీనికి సంబంధించి వివాహ ముహూర్తం గురించి ఏమైనా అడగాలనుకుంటున్నారా?`;
    }
    if (isTamil) {
      return `${name}, உங்கள் 7ஆம் வீடான களத்திர ஸ்தானத்தில் சுக்கிரன் மற்றும் குருவின் சுப பார்வை நிலவுகிறது. திருமண காரியங்கள் விரைவில் கைகூடவும் இல்லற மகிழ்ச்சிக்கும் வெள்ளிக்கிழமைகளில் மகாலட்சுமி வழிபாடு மற்றும் நெய் தீபம் ஏற்றுவது மிகச் சிறந்த நன்மைகளைத் தரும்.`;
    }
    if (isHindi) {
      return `${name} जी, 7वें भाव (सप्तम भाव - विवाह स्थान) में शुभ ग्रहों की दृष्टि से आपके वैवाहिक जीवन एवं संबंधों में मधुरता के योग बन रहे हैं। शुक्रवार के दिन मां लक्ष्मी की पूजा करने से दांपत्य जीवन में सुख और अनुकूल रिश्ते प्राप्त होंगे।`;
    }
    return `${name}, analyzing your 7th house of Partnerships and Marriage, the planetary alignment of Venus and Jupiter creates auspicious vibrations. For relationship harmony or matchmaking prospects, offering white flowers to Goddess Lakshmi on Fridays will manifest favorable results.`;
  }

  // 7. Wealth, Money, Finance, Loss, Debt, Investment
  if (
    text.includes('money') ||
    text.includes('wealth') ||
    text.includes('finance') ||
    text.includes('loan') ||
    text.includes('debt') ||
    text.includes('ధనం') ||
    text.includes('ఆర్థిక') ||
    text.includes('పైసలు') ||
    text.includes('ధన లాభం') ||
    text.includes('రుణం') ||
    text.includes('పణం') ||
    text.includes('பணம்') ||
    text.includes('செல்வம்') ||
    text.includes('தன லாபம்') ||
    text.includes('धन') ||
    text.includes('पैसे')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ 2వ (ధన స్థానం) మరియు 11వ (లాభ స్థానం) స్థానాలు ప్రస్తుతం లాభదాయకమైన స్థితిలో ఉన్నాయి. ఊహించని ఖర్చులు లేదా పెట్టుబడుల్లో ఆచితూచి అడుగు వేయండి. ఆర్థిక స్థిరత్వం కోసం నిత్యం శ్రీ సూక్తం పఠించడం మరియు బుధవారం ఆవుకు పచ్చగడ్డి తినిపించడం వల్ల లక్ష్మీ కటాక్షం నిలకడగా ఉంటుంది.`;
    }
    if (isTamil) {
      return `${name}, உங்கள் 2ஆம் வீடு (தன ஸ்தானம்) மற்றும் 11ஆம் வீடு (லாப ஸ்தானம்) நல்ல சுப நிலையில் உள்ளன. சேமிப்பை உயர்த்தவும் தேவையற்ற விரயங்களைத் தவிர்க்கவும் வெள்ளிக்கிழமைகளில் ஸ்ரீ சூக்தம் பாராயணம் செய்வதும், புதன்கிழமைகளில் பசுவிற்கு அகத்திக்கீரை அளிப்பதும் நிலையான தன லாபத்தைத் தரும்.`;
    }
    if (isHindi) {
      return `${name} जी, आपकी कुंडली का दूसरा और ग्यारहवां भाव धन लाभ के प्रबल संकेत दे रहा है। धन के संचय के लिए शुक्रवार को श्री सूक्त का पाठ करें और बुधवार को गाय को हरा चारा खिलाएं, जिससे स्थायी आर्थिक समृद्धि बनी रहेगी।`;
    }
    return `${name}, your 2nd house of Accumulated Wealth and 11th house of Financial Gains show favorable momentum. To multiply your savings, reciting the Sri Suktam on Fridays and feeding green grass to cows on Wednesdays will attract steady prosperity.`;
  }

  // 8. Remedies, Pooja, Mantras, Gemstones, Pariharam
  if (
    text.includes('remedy') ||
    text.includes('remedies') ||
    text.includes('mantra') ||
    text.includes('gemstone') ||
    text.includes('pooja') ||
    text.includes('పరిహారం') ||
    text.includes('పరిహారాలు') ||
    text.includes('మంత్రం') ||
    text.includes('పూజ') ||
    text.includes('రాయి') ||
    text.includes('రుద్రాక్ష') ||
    text.includes('పరికారం') ||
    text.includes('பரிகாரம்') ||
    text.includes('மந்திரம்') ||
    text.includes('பூஜை') ||
    text.includes('உபாயம்') ||
    text.includes('उपाय') ||
    text.includes('मंत्र')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ గ్రహ శాంతి కోసం మూడు ముఖ్యమైన వేద పరిహారాలు: 1) రోజూ ఉదయం సూర్యోదయ సమయంలో 'ఓం సూర్యాయ నమః' లేదా గాయత్రీ మంత్రం 108 సార్లు జపించండి. 2) గురువారం నాడు ఆలయంలో పసుపు పప్పు ధాన్యాలు లేదా పసుపు స్వీట్లు దానం చేయండి. 3) మానసిక ప్రశాంతత కొరకు 5 ముఖాల రుద్రాక్షను వెండిలో ధరించడం అత్యంత శ్రేయస్కరం.`;
    }
    if (isTamil) {
      return `${name}, உங்கள் கிரக தோஷ நிவர்த்திக்கான 3 முக்கிய வேத பரிகாரங்கள்: 1) தினமும் காலையில் சூரிய காயத்ரி அல்லது மகா மிருத்யுஞ்சய மந்திரம் 108 முறை உச்சரிக்கவும். 2) வியாழக்கிழமைகளில் கொண்டைக்கடலை மாலை சாற்றி குரு பகவானை வழிபடவும். 3) மன அமைதிக்கு 5 முக ருத்ராட்சம் அணிவது நலம் பயக்கும்.`;
    }
    if (isHindi) {
      return `${name} जी, आपके ग्रहों के संतुलन के लिए 3 प्रमुख वैदिक उपाय: 1) प्रातःकाल गायत्री मंत्र का 108 बार जाप करें। 2) गुरुवार को चने की दाल का दान करें। 3) सुरक्षा और शांति के लिए पंचमुखी रुद्राक्ष धारण करना आपके लिए श्रेष्ठ रहेगा।`;
    }
    return `${name}, here are 3 authentic Vedic remedies tailored to your chart: 1) Chant the Surya Gayatri or Maha Mrityunjaya Mantra 108 times at sunrise. 2) Donate yellow split gram or milk sweets on Thursdays. 3) Wear a certified 5-Mukhi Rudraksha in silver to amplify divine protection.`;
  }

  // 9. Health, Stress, Peace of Mind
  if (
    text.includes('health') ||
    text.includes('stress') ||
    text.includes('peace') ||
    text.includes('disease') ||
    text.includes('ఆరోగ్యం') ||
    text.includes('మానసిక') ||
    text.includes('శాంతి') ||
    text.includes('ఒత్తిడి') ||
    text.includes('ஆரோக்கியம்') ||
    text.includes('மன அமைதி') ||
    text.includes('स्वास्थ्य') ||
    text.includes('तनाव')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ 6వ స్థానాన్ని పరిశీలిస్తే ఎలాంటి తీవ్రమైన గ్రహ దోషాలు లేవు, అయితే మానసిక ఒత్తిడి మరియు అలసటను తగ్గించుకోవడం ముఖ్యం. ప్రతి సోమవారం శివునికి జలాభిషేకం చేయడం మరియు 'ఓం నమః శివాయ' జపం చేయడం వల్ల శారీరక దృఢత్వం, ప్రశాంతత లభిస్తాయి.`;
    }
    if (isTamil) {
      return `${name}, உங்கள் 6ஆம் வீட்டை நோக்குகையில் பெரிய பாதிப்புகள் இல்லை. மன அமைதிக்கும் நல்ல ஆரோக்கியத்திற்கும் திங்கட்கிழமைகளில் சிவபெருமானுக்கு நெய் தீபம் ஏற்றுவதும், 'ஓம் நமசிவாய' நாமத்தை தியானிப்பதும் உன்னத சக்தியைத் தரும்.`;
    }
    if (isHindi) {
      return `${name} जी, आपकी कुंडली में स्वास्थ्य भाव सुरक्षित है, परंतु मानसिक तनाव से बचाव हेतु सोमवार को भगवान शिव का जलाभिषेक करें और महामृत्युंजय मंत्र का स्मरण करें।`;
    }
    return `${name}, your 6th house shows general vitality. Performing Jalabhishekam to Lord Shiva on Mondays and reciting 'Om Namah Shivaya' will bestow robust immunity and mental serenity.`;
  }

  // 10. General Intelligent Follow-Up Response (Never repeat greeting!)
  if (isTelugu) {
    return `${name} గారూ, మీరు అడిగిన విషయమై మీ జన్మ కుండలిలోని గ్రహాలు అనుకూలంగానే స్పందిస్తున్నాయి. మీ ${lagna} లగ్నం మరియు ${moonRashi} రాశి ప్రకారం, మీరు దృఢ సంకల్పంతో చేసే ప్రతి పనిలో విజయం సాధిస్తారు. దీనిపై మీకు ఇంకా ఏవైనా ప్రత్యేక పరిహారాలు లేదా సమయపాలన వివరాలు కావాలా?`;
  }
  if (isTamil) {
    return `${name}, உங்கள் ${lagna} லக்னம் மற்றும் ${moonRashi} రాశిப்படி தற்போதைய கிரக சஞ்சாரங்கள் நல்வழியை நோக்கி உள்ளன. தொடர்ந்து நற்செயல்களைச் செய்து வர வெற்றிகள் உண்டாகும். வேறு ஏதேனும் சந்தேகம் உள்ளதா?`;
  }
  if (isHindi) {
    return `${name} जी, आपके द्वारा पूछे गए प्रश्न के अनुसार ग्रह गोचर आपके पक्ष में है। लग्न ${lagna} और चंद्र राशि ${moonRashi} के आधार पर आपका आत्मबल उत्तम रहेगा। क्या आप किसी अन्य ग्रह दोष या समय के बारे में जानना चाहते हैं?`;
  }
  return `${name}, based on your ${lagna} Lagna and ${moonRashi} Moon sign, the current cosmic transit aligns favorably with your aspirations. Consistency and righteous action will bring victory. Would you like further clarity on timing or specific planetary remedies?`;
}

// Universal Multilingual Speech Synthesizer (Telugu, Tamil, Hindi, English)
async function generateMultilingualAudioBase64(
  text: string,
  language: string,
  astrologer: AIAstrologer,
  openaiApiKey?: string | null
): Promise<string | null> {
  // 1. Try OpenAI TTS first if key is valid
  if (openaiApiKey) {
    try {
      const ttsVoice = astrologer.voiceId || (astrologer.voiceGender === 'female' ? 'nova' : 'onyx');
      const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: ttsVoice,
          input: text,
          response_format: 'mp3',
        }),
      });

      if (ttsRes.ok) {
        const audioBuffer = await ttsRes.arrayBuffer();
        return Buffer.from(audioBuffer).toString('base64');
      }
    } catch (ttsErr) {
      console.warn('OpenAI TTS error, using universal speech engine:', ttsErr);
    }
  }

  // 2. Universal Native Multilingual Voice Engine (Google TTS Stream for Telugu, Tamil, Hindi, English)
  try {
    let langCode = 'te';
    const langLower = (language || '').toLowerCase();
    if (langLower.includes('tamil') || langLower.includes('ta') || /[\u0B80-\u0BFF]/.test(text)) {
      langCode = 'ta';
    } else if (langLower.includes('hindi') || langLower.includes('hi') || /[\u0900-\u097F]/.test(text)) {
      langCode = 'hi';
    } else if (langLower.includes('english') || langLower.includes('en')) {
      langCode = 'en';
    } else if (langLower.includes('telugu') || langLower.includes('te') || /[\u0C00-\u0C7F]/.test(text)) {
      langCode = 'te';
    }

    const cleanText = text.replace(/[\n\r]+/g, ' ').slice(0, 300).trim();
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${langCode}&client=tw-ob`;

    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    }
  } catch (ttsErr) {
    console.warn('Universal multilingual audio synthesizer error:', ttsErr);
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId,
      userMessage,
      conversationHistory = [],
      language: reqLanguage,
      isInitial = false,
      action = 'chat_voice',
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // 1. Fetch Session and Astrologer Details
    const sessionDoc = await adminDb.collection('ai_consultations').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Consultation session not found' }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    const astrologerId = sessionData?.astrologerId;
    const birthDetails = sessionData?.birthDetails || {};
    const astroContext = sessionData?.astroContext || {};
    const language = reqLanguage || sessionData?.language || 'English';

    let astrologer: AIAstrologer | null = null;
    try {
      const astDoc = await adminDb.collection('ai_astrologers').doc(astrologerId).get();
      if (astDoc.exists) {
        astrologer = { id: astDoc.id, ...astDoc.data() } as AIAstrologer;
      }
    } catch (e) {
      console.warn('Error fetching astrologer:', e);
    }
    if (!astrologer) {
      astrologer =
        DEFAULT_AI_ASTROLOGERS.find((a) => a.id === astrologerId) || DEFAULT_AI_ASTROLOGERS[0];
    }

    // 2. Fetch OpenAI API Key
    let openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      try {
        const settingsSnap = await adminDb.collection('settings').doc('general').get();
        if (settingsSnap.exists) {
          const sData = settingsSnap.data();
          if (sData?.openaiApiKey) openaiApiKey = sData.openaiApiKey;
        }
      } catch (sErr) {
        console.warn('Settings key fetch error:', sErr);
      }
    }

    const systemPersona = `${astrologer.systemPersonaPrompt || 'You are an authentic, revered Vedic Astrologer at AstroParihar.'}

CUSTOMER CHART CONTEXT:
- Devotee Name: ${birthDetails.name || 'Devotee'}
- Gender: ${birthDetails.gender || 'N/A'}
- Date of Birth: ${birthDetails.dob || 'N/A'}, Time: ${birthDetails.time || 'N/A'}, Place: ${birthDetails.place || 'N/A'}
- Primary Category of Consultation: ${birthDetails.primaryConcern || 'General Life Guidance'}
- Lagna (Ascendant): ${astroContext.lagna || 'Scorpio (Vrishchika)'}
- Moon Sign (Rashi): ${astroContext.moonRashi || 'Aries (Mesha)'}
- Nakshatra: ${astroContext.nakshatra || 'Bharani'}
- Active Mahadasha: ${astroContext.currentDasha || 'Jupiter-Mars'}
- Preferred Consultation Language: ${language}

DOMAIN SPECIFIC CONSULTATION BLUEPRINTS:
- LOVE, MARRIAGE & KUNDLI MILAN:
  Focus on the 7th house (Kalathra Sthana), Venus (Shukra), Jupiter (Guru), and current dasha. If the devotee asks about marriage timing, partner nature, delays, or love vs arranged marriage, analyze planetary transits and provide auspicious windows. Provide practical remedies (e.g. Shukra mantra, Friday Lakshmi worship, Vishnu-Lakshmi Puja).
- CAREER GROWTH, PROMOTION & BUSINESS:
  Focus on the 10th house (Karma Sthana), Sun (Surya), Saturn (Shani), and 6th/11th houses. Analyze job switches, promotions, business vs employment, authority, foreign opportunities, and workplace harmony remedies (e.g. Aditya Hridaya Stotram, Surya Arghya, Vishnu Sahasranama).
- WEALTH, FINANCE & INVESTMENT:
  Focus on the 2nd house (Dhana Bhava) and 11th house (Labha Bhava). Discuss debt relief, asset growth, investments, business profit cycles, and remedies like Sri Suktam and Kubera puja.
- HEALTH, VITALITY & PEACE OF MIND:
  Focus on Lagna Lord, 6th house, and mental serenity. Provide encouraging, spiritually shielding remedies such as Mahamrityunjaya Mantra and Shiva worship.
- VASTU & SPATIAL ENERGIES:
  Focus on directional balance (Ishanya, Agni, Nairruti, Vayavya) and non-demolition remedies.
- FOREIGN TRAVEL & VISA SETTLEMENT:
  Focus on 9th & 12th houses, Rahu transits, and auspicious timing.
- SPIRITUAL AWAKENING & LIFE PURPOSE:
  Focus on 9th/12th houses, Moksha karaka Ketu, Ishta Devata, and spiritual evolution.

CRITICAL VOICE CONVERSATION RULES:
1. STRICT LANGUAGE REQUIREMENT:
   - If language is "Telugu" (or devotee speaks/writes in Telugu), reply 100% in pure, authentic Telugu (తెలుగు). Use traditional Vedic terms naturally.
   - If language is "Tamil" (or devotee speaks/writes in Tamil), reply 100% in authentic Tamil (தமிழ்).
   - If language is "Hindi", reply 100% in respectful, natural Hindi (हिन्दी).
   - If language is "English", reply in fluent English enriched with Vedic terms.
2. REAL-TIME TWO-WAY CONVERSATION:
   - Speak directly as ${astrologer.name}.
   - Keep each spoken response concise (2 to 4 sentences maximum) so the user can easily listen during a phone call.
   - Answer the customer's exact question directly with specific astrological clarity.
   - NEVER repeat the introductory greeting once the call is in progress.
   - Always conclude with an intelligent, gentle follow-up question related to their topic to keep the conversation flowing smoothly.`;

    // Action A: Live Multi-Turn Speech/Chat Voice Exchange via OpenAI (if valid key)
    if (openaiApiKey) {
      try {
        const messages: any[] = [{ role: 'system', content: systemPersona }];

        // Append conversation history
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          for (const msg of conversationHistory) {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content || msg.text || '',
            });
          }
        }

        // Append current user message
        if (userMessage) {
          messages.push({ role: 'user', content: userMessage });
        } else if (messages.length === 1) {
          messages.push({
            role: 'user',
            content: `I have joined the voice consultation. Please greet me in ${language} and review my birth chart regarding my concern: ${birthDetails.primaryConcern || 'General Life Guidance'}.`,
          });
        }

        const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 350,
          }),
        });

        if (chatRes.ok) {
          const chatJson = await chatRes.json();
          const replyText = chatJson.choices[0]?.message?.content;
          if (replyText) {
            // Generate full speech audio in the selected language
            const audioBase64 = await generateMultilingualAudioBase64(
              replyText,
              language,
              astrologer,
              openaiApiKey
            );

            return NextResponse.json({
              success: true,
              replyText,
              audioBase64,
              astrologer,
              language,
            });
          }
        }
      } catch (aiErr) {
        console.warn('OpenAI chat/voice error, activating dynamic Vedic engine:', aiErr);
      }
    }

    // Dynamic Intelligent Vedic Engine
    const isExplicitGreeting = isInitial || !userMessage || userMessage.trim() === '';
    const dynamicReply = generateDynamicVedicReply(
      userMessage,
      isExplicitGreeting,
      birthDetails,
      astroContext,
      astrologer,
      language
    );

    // Synthesize authentic native voice audio (Telugu, Tamil, Hindi, English)
    const audioBase64 = await generateMultilingualAudioBase64(
      dynamicReply,
      language,
      astrologer,
      openaiApiKey
    );

    return NextResponse.json({
      success: true,
      replyText: dynamicReply,
      audioBase64,
      astrologer,
      language,
    });
  } catch (error: any) {
    console.error('Error in voice session:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
