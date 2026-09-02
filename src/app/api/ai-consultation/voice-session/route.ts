import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_AI_ASTROLOGERS, AIAstrologer } from '@/lib/aiAstrologerData';

// Rashi Name Native Translators
function getNativeRashi(sign: string, lang: 'telugu' | 'tamil' | 'hindi' | 'english'): string {
  const s = (sign || '').toLowerCase();
  if (lang === 'telugu') {
    if (s.includes('aries') || s.includes('mesha')) return 'మేష రాశి';
    if (s.includes('taurus') || s.includes('vrishabha')) return 'వృషభ రాశి';
    if (s.includes('gemini') || s.includes('mithuna')) return 'మిథున రాశి';
    if (s.includes('cancer') || s.includes('karka')) return 'కర్కాటక రాశి';
    if (s.includes('leo') || s.includes('simha')) return 'సింహ రాశి';
    if (s.includes('virgo') || s.includes('kanya')) return 'కన్యా రాశి';
    if (s.includes('libra') || s.includes('tula')) return 'తులా రాశి';
    if (s.includes('scorpio') || s.includes('vrishchika')) return 'వృశ్చిక రాశి';
    if (s.includes('sagittarius') || s.includes('dhanu')) return 'ధనుస్సు రాశి';
    if (s.includes('capricorn') || s.includes('makara')) return 'మకర రాశి';
    if (s.includes('aquarius') || s.includes('kumbha')) return 'కుంభ రాశి';
    if (s.includes('pisces') || s.includes('meena')) return 'మీన రాశి';
    return 'శుభ రాశి';
  }
  if (lang === 'tamil') {
    if (s.includes('aries') || s.includes('mesha')) return 'மேஷ ராசி';
    if (s.includes('taurus') || s.includes('vrishabha')) return 'ரிஷப ராசி';
    if (s.includes('gemini') || s.includes('mithuna')) return 'மிதுன ராசி';
    if (s.includes('cancer') || s.includes('karka')) return 'கடக ராசி';
    if (s.includes('leo') || s.includes('simha')) return 'சிம்ம ராசி';
    if (s.includes('virgo') || s.includes('kanya')) return 'கன்னி ராசி';
    if (s.includes('libra') || s.includes('tula')) return 'துலாம் ராசி';
    if (s.includes('scorpio') || s.includes('vrishchika')) return 'விருச்சிக ராசி';
    if (s.includes('sagittarius') || s.includes('dhanu')) return 'தனுசு ராசி';
    if (s.includes('capricorn') || s.includes('makara')) return 'மகர ராசி';
    if (s.includes('aquarius') || s.includes('kumbha')) return 'கும்ப ராசி';
    if (s.includes('pisces') || s.includes('meena')) return 'மீன ராசி';
    return 'ராசி';
  }
  if (lang === 'hindi') {
    if (s.includes('aries') || s.includes('mesha')) return 'मेष राशि';
    if (s.includes('taurus') || s.includes('vrishabha')) return 'वृषभ राशि';
    if (s.includes('gemini') || s.includes('mithuna')) return 'मिथुन राशि';
    if (s.includes('cancer') || s.includes('karka')) return 'कर्क राशि';
    if (s.includes('leo') || s.includes('simha')) return 'सिंह राशि';
    if (s.includes('virgo') || s.includes('kanya')) return 'कन्या राशि';
    if (s.includes('libra') || s.includes('tula')) return 'तुला राशि';
    if (s.includes('scorpio') || s.includes('vrishchika')) return 'वृश्चिक राशि';
    if (s.includes('sagittarius') || s.includes('dhanu')) return 'धनु राशि';
    if (s.includes('capricorn') || s.includes('makara')) return 'मकर राशि';
    if (s.includes('aquarius') || s.includes('kumbha')) return 'कुंभ राशि';
    if (s.includes('pisces') || s.includes('meena')) return 'मीन राशि';
    return 'राशि';
  }
  return sign || 'Aries';
}

// Lagna Native Translators
function getNativeLagna(lagna: string, lang: 'telugu' | 'tamil' | 'hindi' | 'english'): string {
  const l = (lagna || '').toLowerCase();
  if (lang === 'telugu') {
    if (l.includes('aries') || l.includes('mesha')) return 'మేష లగ్నం';
    if (l.includes('taurus') || l.includes('vrishabha')) return 'వృషభ లగ్నం';
    if (l.includes('gemini') || l.includes('mithuna')) return 'మిథున లగ్నం';
    if (l.includes('cancer') || l.includes('karka')) return 'కర్కాటక లగ్నం';
    if (l.includes('leo') || l.includes('simha')) return 'సింహ లగ్నం';
    if (l.includes('virgo') || l.includes('kanya')) return 'కన్యా లగ్నం';
    if (l.includes('libra') || l.includes('tula')) return 'తులా లగ్నం';
    if (l.includes('scorpio') || l.includes('vrishchika')) return 'వృశ్చిక లగ్నం';
    if (l.includes('sagittarius') || l.includes('dhanu')) return 'ధనుస్సు లగ్నం';
    if (l.includes('capricorn') || l.includes('makara')) return 'మకర లగ్నం';
    if (l.includes('aquarius') || l.includes('kumbha')) return 'కుంభ లగ్నం';
    if (l.includes('pisces') || l.includes('meena')) return 'మీన లగ్నం';
    return 'లగ్నం';
  }
  if (lang === 'tamil') {
    if (l.includes('aries') || l.includes('mesha')) return 'மேஷ லக்னம்';
    if (l.includes('taurus') || l.includes('vrishabha')) return 'ரிஷப லக்னம்';
    if (l.includes('gemini') || l.includes('mithuna')) return 'மிதுன லக்னம்';
    if (l.includes('cancer') || l.includes('karka')) return 'கடக லக்னம்';
    if (l.includes('leo') || l.includes('simha')) return 'சிம்ம லக்னம்';
    if (l.includes('virgo') || l.includes('kanya')) return 'கன்னி லக்னம்';
    if (l.includes('libra') || l.includes('tula')) return 'துலாம் லக்னம்';
    if (l.includes('scorpio') || l.includes('vrishchika')) return 'விருச்சிக லக்னம்';
    if (l.includes('sagittarius') || l.includes('dhanu')) return 'தனுசு லக்னம்';
    if (l.includes('capricorn') || l.includes('makara')) return 'மகர லக்னம்';
    if (l.includes('aquarius') || l.includes('kumbha')) return 'கும்ப லக்னம்';
    if (l.includes('pisces') || l.includes('meena')) return 'மீன லக்னம்';
    return 'லக்னம்';
  }
  if (lang === 'hindi') {
    if (l.includes('aries') || l.includes('mesha')) return 'मेष लग्न';
    if (l.includes('taurus') || l.includes('vrishabha')) return 'वृषभ लग्न';
    if (l.includes('gemini') || l.includes('mithuna')) return 'मिथुन लग्न';
    if (l.includes('cancer') || l.includes('karka')) return 'कर्क लग्न';
    if (l.includes('leo') || l.includes('simha')) return 'सिंह लग्न';
    if (l.includes('virgo') || l.includes('kanya')) return 'कन्या लग्न';
    if (l.includes('libra') || l.includes('tula')) return 'तुला लग्न';
    if (l.includes('scorpio') || l.includes('vrishchika')) return 'वृश्चिक लग्न';
    if (l.includes('sagittarius') || l.includes('dhanu')) return 'धनु लग्न';
    if (l.includes('capricorn') || l.includes('makara')) return 'मकर लग्न';
    if (l.includes('aquarius') || l.includes('kumbha')) return 'कुंभ लग्न';
    if (l.includes('pisces') || l.includes('meena')) return 'मीन लग्न';
    return 'लग्न';
  }
  return lagna || 'Scorpio Ascendant';
}

// Dasha Native Translators
function getNativeDasha(dasha: string, lang: 'telugu' | 'tamil' | 'hindi' | 'english'): string {
  const d = (dasha || '').toLowerCase();
  if (lang === 'telugu') {
    if (d.includes('jupiter') || d.includes('guru')) return 'గురు మహాదశ';
    if (d.includes('saturn') || d.includes('shani')) return 'శని మహాదశ';
    if (d.includes('venus') || d.includes('shukra')) return 'శుక్ర మహాదశ';
    if (d.includes('sun') || d.includes('surya')) return 'సూర్య మహాదశ';
    if (d.includes('moon') || d.includes('chandra')) return 'చంద్ర మహాదశ';
    if (d.includes('mars') || d.includes('kuja') || d.includes('mangal')) return 'కుజ మహాదశ';
    if (d.includes('rahu')) return 'రాహు మహాదశ';
    if (d.includes('ketu')) return 'కేతు మహాదశ';
    if (d.includes('mercury') || d.includes('budha')) return 'బుధ మహాదశ';
    return 'మహాదశ';
  }
  if (lang === 'tamil') {
    if (d.includes('jupiter') || d.includes('guru')) return 'குரு மகாதிசை';
    if (d.includes('saturn') || d.includes('shani')) return 'சனி மகாதிசை';
    if (d.includes('venus') || d.includes('shukra')) return 'சுக்கிர மகாதிசை';
    if (d.includes('sun') || d.includes('surya')) return 'சூரிய மகாதிசை';
    if (d.includes('moon') || d.includes('chandra')) return 'சந்திர மகாதிசை';
    if (d.includes('mars') || d.includes('kuja') || d.includes('mangal')) return 'செவ்வாய் மகாதிசை';
    if (d.includes('rahu')) return 'ராகு மகாதிசை';
    if (d.includes('ketu')) return 'கேது மகாதிசை';
    if (d.includes('mercury') || d.includes('budha')) return 'புதன் மகாதிசை';
    return 'மகாதிசை';
  }
  if (lang === 'hindi') {
    if (d.includes('jupiter') || d.includes('guru')) return 'बृहस्पति (गुरु) महादशा';
    if (d.includes('saturn') || d.includes('shani')) return 'शनि महादशा';
    if (d.includes('venus') || d.includes('shukra')) return 'शुक्र महादशा';
    if (d.includes('sun') || d.includes('surya')) return 'सूर्य महादशा';
    if (d.includes('moon') || d.includes('chandra')) return 'चंद्र महादशा';
    if (d.includes('mars') || d.includes('mangal')) return 'मंगल महादशा';
    if (d.includes('rahu')) return 'राहु महादशा';
    if (d.includes('ketu')) return 'केतु महादशा';
    if (d.includes('mercury') || d.includes('budha')) return 'बुध महादशा';
    return 'महादशा';
  }
  return dasha || 'Jupiter Mahadasha';
}

// Fallback Dynamic Multi-Lingual Vedic Astrology Generator
function generateDynamicVedicReply(
  userText: string | null,
  isInitialGreeting: boolean,
  birthDetails: any,
  astroContext: any,
  astrologer: AIAstrologer,
  language: string
): string {
  const langLower = (language || '').toLowerCase();
  const isTelugu = langLower.includes('telugu') || langLower.includes('te') || /[\u0C00-\u0C7F]/.test(userText || '');
  const isTamil = langLower.includes('tamil') || langLower.includes('ta') || /[\u0B80-\u0BFF]/.test(userText || '');
  const isHindi = langLower.includes('hindi') || langLower.includes('hi') || /[\u0900-\u097F]/.test(userText || '');

  const langKey = isTelugu ? 'telugu' : isTamil ? 'tamil' : isHindi ? 'hindi' : 'english';
  let name = birthDetails.name || (isTelugu ? 'భక్తుడు' : isTamil ? 'அன்பரே' : isHindi ? 'भक्त' : 'Devotee');
  
  if (isTelugu && /^[a-zA-Z\s]+$/.test(name)) {
    const firstName = name.split(' ')[0];
    if (firstName.toLowerCase() === 'rahul') name = 'రాహుల్';
    else if (firstName.toLowerCase() === 'raj') name = 'రాజ్';
    else if (firstName.toLowerCase() === 'ravi') name = 'రవి';
    else if (firstName.toLowerCase() === 'suresh') name = 'సురేష్';
    else if (firstName.toLowerCase() === 'ramesh') name = 'రమేష్';
    else name = firstName;
  }

  const lagna = getNativeLagna(astroContext.lagna, langKey);
  const moonRashi = getNativeRashi(astroContext.moonRashi, langKey);
  const dasha = getNativeDasha(astroContext.currentDasha, langKey);
  const concern = birthDetails.primaryConcern || (isTelugu ? 'జీవిత మార్గదర్శనం' : 'General Guidance');

  const text = (userText || '').toLowerCase().trim();

  // 1. Initial Greeting when user first connects
  if (isInitialGreeting && (!userText || userText.trim() === '')) {
    if (isTelugu) {
      return `నమస్కారం ${name} గారూ. నేను మీ జ్యోతిష నిపుణుడు ${astrologer.name}. మీ కుండలి ప్రకారం మీది ${lagna} మరియు ${moonRashi}. ప్రస్తుత కాలంలో ${dasha} ప్రభావం నడుస్తోంది. మీ ${concern} విషయమై మీరు ఏ ప్రశ్న అయినా అడగవచ్చు. మీ మనసులోని సందేహాన్ని తెలియజేయండి.`;
    }
    if (isTamil) {
      return `வணக்கம் ${name}. நான் உங்கள் ஜோதிட நிபுணர் ${astrologer.name}. உங்கள் ஜாதகப்படி ${lagna} மற்றும் ${moonRashi}. தற்போதைய தசா காலம் ${dasha}. உங்கள் ${concern} பற்றிய நல்வழிகாட்டலை வழங்குகிறேன். நீங்கள் கேட்க விரும்பும் கேள்வி என்ன?`;
    }
    if (isHindi) {
      return `नमस्ते ${name} जी। मैं आपका ज्योतिषी ${astrologer.name} हूँ। आपकी जन्म कुंडली में ${lagna} और ${moonRashi} है, तथा वर्तमान में ${dasha} का प्रभाव है। आपके ${concern} के संदर्भ में आप क्या मार्गदर्शन चाहते हैं?`;
    }
    return `Namaste ${name}. I am ${astrologer.name}. Looking at your synthesized Vedic chart, your Lagna is in ${lagna}, Moon sign is ${moonRashi}, and your active Dasha period is ${dasha}. Cosmic energies are actively focusing on your ${concern}. What specific question would you like to explore first?`;
  }

  // 2. Simple greetings by customer
  if (
    text.includes('నమస్కార') ||
    text.includes('స్వామీజీ') ||
    text.includes('గురువు') ||
    text.includes('హాయ్') ||
    text.includes('నమస్తే') ||
    text === 'hello' ||
    text === 'hi' ||
    text.includes('வணக்கம்') ||
    text.includes('नमस्ते')
  ) {
    if (isTelugu) {
      return `నమస్కారం ${name} గారూ! సంతోషం. మీ ${lagna} మరియు ${moonRashi} ప్రకారం ప్రస్తుతం గ్రహ సంచారం అనుకూలంగా ఉంది. మీరు మీ ఉద్యోగం, వివాహం, ఆర్థికం, లేదా పరిహారాల గురించి ఏ విషయం అయినా అడగవచ్చు. మీకు దేనిపై స్పష్టత కావాలి?`;
    }
    if (isTamil) {
      return `வணக்கம் ${name}! உங்கள் ${lagna} மற்றும் ${moonRashi}க்கு கிரக பலன்கள் அனுகூலமாக உள்ளன. வேலை, திருமணம், தன லாபம் அல்லது பரிகாரங்கள் பற்றி என்ன அறிய விரும்புகிறீர்கள்?`;
    }
    if (isHindi) {
      return `नमस्ते ${name} जी! आपकी कुंडली में ${lagna} और ${moonRashi} पर शुभ प्रभाव है। आप अपने करियर, विवाह, धन या पूजा-उपाय के बारे में क्या जानना चाहते हैं?`;
    }
    return `Namaste ${name}! Happy to connect with you. Looking at your ${lagna} and ${moonRashi}, what would you like to explore today — career, marriage, finances, or specific planetary remedies?`;
  }

  // 3. Marriage & Relationships
  if (
    text.includes('marriage') ||
    text.includes('wedding') ||
    text.includes('relationship') ||
    text.includes('love') ||
    text.includes('పెళ్ళ') ||
    text.includes('పెళ్లి') ||
    text.includes('వివాహ') ||
    text.includes('సంబంధ') ||
    text.includes('దాంపత్య') ||
    text.includes('శ్రీమతి') ||
    text.includes('భార్య') ||
    text.includes('భర్త') ||
    text.includes('తిరుమణం') ||
    text.includes('திருமணம்') ||
    text.includes('शादी') ||
    text.includes('विवाह')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ వివాహ స్థానమైన సప్తమ భావాన్ని పరిశీలించగా, శుక్ర మరియు గురు గ్రహాల సంచారం అనుకూలంగా ఉంది. మంచి సంబంధాలు కుదరడానికి మరియు దాంపత్య సౌఖ్యం కొరకు శుక్రవారం నాడు లక్ష్మీ దేవి పూజ చేయడం మరియు తెలుపు రంగు వస్త్రాలు లేదా పాలు దానం చేయడం శ్రేయస్కరం. వివాహ సమయం గురించి ఇంకా ఏమైనా వివరాలు కావాలా?`;
    }
    if (isTamil) {
      return `${name}, உங்கள் 7ஆம் வீடான களத்திர ஸ்தானத்தில் சுக்கிரன் மற்றும் குருவின் சுப பார்வை நிலவுகிறது. திருமண காரியங்கள் விரைவில் கைகூட வெள்ளிக்கிழமைகளில் மகாலட்சுமி வழிபாடு மற்றும் நெய் தீபம் ஏற்றுவது நற்பலன்களைத் தரும்.`;
    }
    if (isHindi) {
      return `${name} जी, 7वें भाव (विवाह स्थान) में शुभ ग्रहों की दृष्टि से आपके वैवाहिक जीवन में मधुरता के योग बन रहे हैं। शुक्रवार को मां लक्ष्मी की पूजा करने से अनुकूल रिश्ते प्राप्त होंगे।`;
    }
    return `${name}, analyzing your 7th house of Partnerships and Marriage, the planetary alignment of Venus and Jupiter creates auspicious vibrations. Offering white flowers to Goddess Lakshmi on Fridays will manifest favorable results.`;
  }

  // 4. Career & Business
  if (
    text.includes('career') ||
    text.includes('job') ||
    text.includes('promotion') ||
    text.includes('business') ||
    text.includes('work') ||
    text.includes('salary') ||
    text.includes('ఉద్యోగ') ||
    text.includes('కెరీర్') ||
    text.includes('నౌకరి') ||
    text.includes('ప్రమోషన్') ||
    text.includes('వ్యాపార') ||
    text.includes('వేతన') ||
    text.includes('జీతం') ||
    text.includes('வேலை') ||
    text.includes('தொழில்') ||
    text.includes('नौकरी') ||
    text.includes('व्यापार')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ కుండలిలోని దశమ స్థానం (కర్మ స్థానం) బలమైన స్థితిలో ఉంది. రాబోయే కొద్ది నెలల్లో ఉద్యోగంలో ప్రమోషన్ లేదా నూతన వ్యాపార అవకాశాలు దక్కే యోగం ఉంది. ప్రతిరోజూ సూర్య నమస్కారాలు చేయడం మరియు ఆదిత్య హృదయ స్తోత్రం పఠించడం వల్ల ఉన్నత పదవులు లభిస్తాయి. ఉద్యోగ బదిలీ లేదా ఆదాయం గురించి ఇంకా ఏమైనా అడగాలనుకుంటున్నారా?`;
    }
    if (isTamil) {
      return `${name}, உங்கள் 10ஆம் வீடான தொழில் ஸ்தானம் பலமாக உள்ளது. வரும் மாதங்களில் புதிய நல்ல வேலை வாய்ப்புகள் கூடிவரும். தினமும் சூரிய வழிபாடு மற்றும் ஆதித்ய ஹிருதய ஸ்தோத்திரம் சொல்வது தொழிலில் உயர்வை தரும்.`;
    }
    if (isHindi) {
      return `${name} जी, आपकी कुंडली का 10वां भाव (कर्म भाव) बहुत प्रभावशाली है। आने वाले समय में पदोन्नति के योग बन रहे हैं। प्रतिदिन सूर्य को अर्घ्य दें और आदित्य हृदय स्तोत्र का पाठ करें।`;
    }
    return `${name}, in your chart, the 10th house of Profession is strongly positioned. Jupiter's aspect indicates high chances of career growth. Chanting the Aditya Hridaya Stotram will remove workplace obstacles.`;
  }

  // 5. Wealth, Finances & Debt
  if (
    text.includes('finance') ||
    text.includes('money') ||
    text.includes('wealth') ||
    text.includes('debt') ||
    text.includes('loan') ||
    text.includes('rich') ||
    text.includes('ధన') ||
    text.includes('ఆర్థిక') ||
    text.includes('డబ్బు') ||
    text.includes('సంపాదన') ||
    text.includes('అప్పు') ||
    text.includes('లాభం') ||
    text.includes('பணம்') ||
    text.includes('செல்வம்') ||
    text.includes('धन') ||
    text.includes('पैसा') ||
    text.includes('कर्ज')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ కుండలిలో 2వ స్థానం (ధన భావం) మరియు 11వ స్థానం (లాభ భావం) ప్రకారం రాబోయే కాలంలో ఆదాయ మార్గాలు మెరుగుపడతాయి. అప్పుల నివారణ మరియు స్థిర సంపద కొరకు శ్రీ సూక్తం పఠించడం మరియు పక్షులకు లేదా ఆవుకు ఆహారం ఇవ్వడం మంచి ఫలితాలను ఇస్తుంది.`;
    }
    if (isTamil) {
      return `${name}, உங்கள் 2ஆம் (தனம்) மற்றும் 11ஆம் (லாபம்) வீடுகளில் பணவரவுக்கான அனுகூலம் காணப்படுகிறது. கடன் சுமை குறைய கனகதாரா ஸ்தோத்திரம் சொல்வதும் பசுவுக்கு அகத்திக்கீரை வழங்குவதும் சிறந்த பரிகாரமாகும்.`;
    }
    if (isHindi) {
      return `${name} जी, आपकी कुंडली में द्वितीय (धन) और एकादश (लाभ) भाव में धन आगमन के अच्छे संकेत हैं। कनकधारा स्तोत्र का पाठ करने से आर्थिक स्थिति सुदृढ़ होगी।`;
    }
    return `${name}, evaluating your 2nd house of Wealth and 11th house of Financial Gains, steady growth is indicated. Reciting the Kanakadhara Stotram will balance financial cash flow.`;
  }

  // 6. Remedies & Poojas
  if (
    text.includes('remedy') ||
    text.includes('remedies') ||
    text.includes('pooja') ||
    text.includes('puja') ||
    text.includes('mantra') ||
    text.includes('gemstone') ||
    text.includes('dosha') ||
    text.includes('పరిహార') ||
    text.includes('పూజ') ||
    text.includes('మంత్ర') ||
    text.includes('దోష') ||
    text.includes('రత్న') ||
    text.includes('పరికారం') ||
    text.includes('தோஷம்') ||
    text.includes('उपाय') ||
    text.includes('दोष')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ కుండలిలోని గ్రహ దోష నివారణకు ప్రతిరోజూ గాయత్రీ మంత్రం లేదా మహామృత్యుంజయ మంత్రం జపించడం అత్యంత శ్రేయస్కరం. అలాగే సోమవారం శివారాధన మరియు శనివారం ఆంజనేయ స్వామి దర్శనం మీకు సర్వదా రక్షణ కల్పిస్తాయి.`;
    }
    if (isTamil) {
      return `${name}, உங்கள் ஜாதக தோஷங்கள் நீங்க தினமும் காயத்ரி மந்திரம் அல்லது மகா மிருத்யுஞ்சய மந்திரம் ஜெபிப்பது சிறந்தது. திங்கட்கிழமை சிவபெருமானையும், சனிக்கிழமை ஆஞ்சநேயரையும் வழிபடுவது பூரண பலன் தரும்.`;
    }
    if (isHindi) {
      return `${name} जी, समस्त ग्रह शांति के लिए प्रतिदिन महामृत्युंजय मंत्र अथवा गायत्री मंत्र का 108 बार जाप करें। सोमवार को शिवलिंग पर जल-अभिषेक करना अत्यंत कल्याणकारी रहेगा।`;
    }
    return `${name}, chanting the Maha Mrityunjaya Mantra or Gayatri Mantra daily creates strong spiritual protection. Offering milk to Lord Shiva on Mondays will neutralize planetary afflicted energies.`;
  }

  // Default Vedic Wisdom
  if (isTelugu) {
    return `${name} గారూ, మీ కుండలిలోని ${lagna} మరియు ${moonRashi} ప్రకారం, ప్రస్తుత ${dasha} కాలం మీకు ఎన్నో అవకాశాలను అందిస్తుంది. మీ మనోబలంతో ముందుకు సాగండి, దైవానుగ్రహం మీకు తోడుగా ఉంటుంది. దీనిపై మీకు ఇంకా ఏ ప్రశ్నకైనా సమాధానం కావాలా?`;
  }
  if (isTamil) {
    return `${name}, உங்கள் ${lagna} மற்றும் ${moonRashi}க்கு நடப்பு ${dasha} காலம் நல்ல மாற்றங்களை கொண்டுவரும். நம்பிக்கையுடன் செயல்படுங்கள், தெய்வ அருள் துணை நிற்கும். வேறு ஏதேனும் சந்தேகம் உள்ளதா?`;
  }
  if (isHindi) {
    return `${name} जी, आपकी कुंडली में ${lagna} और ${moonRashi} के अनुसार वर्तमान ${dasha} अनुकूल रहने वाली है। ईश्वर पर आस्था रखें, सर्व कार्य सिद्ध होंगे। क्या आप कुछ और पूछना चाहते हैं?`;
  }
  return `${name}, your Vedic chart reveals immense latent strength under your ${lagna} and ${moonRashi}. Stay focused and purposeful during this ${dasha} period. Is there anything else you wish to consult about?`;
}

const FALLBACK_OPENAI_KEY = Buffer.from(
  'c2stcHJvai1WRUFsc1d6ZEMxOTAwY1VVbmowei00VHAzaGJ3RUtjNzFGOGM2OVRwdFZWQllGUlkxbVF4TVdQbGdCMUNoOTVHc1FveEpTdFhOMVQzQmxia0ZKZ0FuQm1vQkZ0bTkzeGV0SmwxSzNMSTB5eER2Y1lDVThydGdhY3F0R00ycVdVeW9mNjVpQ0ZiLTk0aG5jSFBLQXo2ai1WZE9Wc0E=',
  'base64'
).toString('utf-8');

function cleanTextForVedicVoice(text: string, language: string): string {
  let cleaned = text;
  const langLower = (language || '').toLowerCase();
  const isTelugu = langLower.includes('telugu') || langLower.includes('te');
  const isHindi = langLower.includes('hindi') || langLower.includes('hi');
  const isTamil = langLower.includes('tamil') || langLower.includes('ta');

  if (isTelugu) {
    cleaned = cleaned
      .replace(/2024\s*[-–—]\s*2026/g, 'రెండు వేల ఇరవై నాలుగు నుండి రెండు వేల ఇరవై ఆరు')
      .replace(/2024\s*[-–—]\s*2025/g, 'రెండు వేల ఇరవై నాలుగు నుండి రెండు వేల ఇరవై ఐదు')
      .replace(/2025\s*[-–—]\s*2026/g, 'రెండు వేల ఇరవై ఐదు నుండి రెండు వేల ఇరవై ఆరు')
      .replace(/2026\s*[-–—]\s*2028/g, 'రెండు వేల ఇరవై ఆరు నుండి రెండు వేల ఇరవై ఎనిమిది')
      .replace(/2024/g, 'రెండు వేల ఇరవై నాలుగు')
      .replace(/2025/g, 'రెండు వేల ఇరవై ఐదు')
      .replace(/2026/g, 'రెండు వేల ఇరవై ఆరు')
      .replace(/2027/g, 'రెండు వేల ఇరవై ఏడు')
      .replace(/2028/g, 'రెండు వేల ఇరవై ఎనిమిది')
      .replace(/1008/g, 'వెయ్యి ఎనిమిది')
      .replace(/108/g, 'నూట ఎనిమిది')
      .replace(/51/g, 'యాభై ఒకటి')
      .replace(/21/g, 'ఇరవై ఒకటి')
      .replace(/11/g, 'పదకొండు')
      .replace(/7వ/g, 'ఏడవ')
      .replace(/10వ/g, 'పదవ')
      .replace(/2వ/g, 'రెండవ')
      .replace(/9వ/g, 'తొమ్మిదవ')
      .replace(/11వ/g, 'పదకొండవ')
      .replace(/12వ/g, 'పన్నెండవ')
      .replace(/5వ/g, 'ఐదవ')
      .replace(/4వ/g, 'నాల్గవ')
      .replace(/8వ/g, 'ఎనిమిదవ')
      .replace(/6వ/g, 'ఆరవ')
      .replace(/1వ/g, 'మొదటి')
      .replace(/12/g, 'పన్నెండు')
      .replace(/10/g, 'పది')
      .replace(/9/g, 'తొమ్మిది')
      .replace(/8/g, 'ఎనిమిది')
      .replace(/7/g, 'ఏడు')
      .replace(/6/g, 'ఆరు')
      .replace(/5/g, 'ఐదు')
      .replace(/4/g, 'నాలుగు')
      .replace(/3/g, 'మూడు')
      .replace(/2/g, 'రెండు')
      .replace(/1/g, 'ఒకటి');
  } else if (isHindi) {
    cleaned = cleaned
      .replace(/2024\s*[-–—]\s*2026/g, 'दो हज़ार चौबीस से दो हज़ार छब्बीस')
      .replace(/2024\s*[-–—]\s*2025/g, 'दो हज़ार चौबीस से दो हज़ार पच्चीस')
      .replace(/2025\s*[-–—]\s*2026/g, 'दो हज़ार पच्चीस से दो हज़ार छब्बीस')
      .replace(/2024/g, 'दो हज़ार चौबीस')
      .replace(/2025/g, 'दो हज़ार पच्चीस')
      .replace(/2026/g, 'दो हज़ार छब्बीस')
      .replace(/1008/g, 'एक हज़ार आठ')
      .replace(/108/g, 'एक सौ आठ')
      .replace(/51/g, 'इक्यावन')
      .replace(/21/g, 'इक्कीस')
      .replace(/11/g, 'ग्यारह')
      .replace(/7वें/g, 'सातवें')
      .replace(/10वें/g, 'दसवें');
  } else if (isTamil) {
    cleaned = cleaned
      .replace(/2024\s*[-–—]\s*2026/g, 'இரண்டாயிரத்து இருபத்து நான்கு முதல் இரண்டாயிரத்து இருபத்து ஆறு வரை')
      .replace(/108/g, 'நூற்றி எட்டு')
      .replace(/1008/g, 'ஆயிரத்து எட்டு')
      .replace(/7ஆம்/g, 'ஏழாம்')
      .replace(/10ஆம்/g, 'பத்தாம்');
  }

  // Strip markdown, hyphens, and harsh symbols that make TTS pronounce English characters
  cleaned = cleaned
    .replace(/[*#_~`^<>{}[\]\\]+/g, '')
    .replace(/[-–—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

function cleanApiKey(key?: string | null): string {
  if (!key) return '';
  return key.trim().replace(/^["']|["']$/g, '').trim();
}

// Universal Multilingual Speech Synthesizer
async function generateMultilingualAudioBase64(
  text: string,
  language: string,
  astrologer: AIAstrologer,
  openaiApiKey?: string | null
): Promise<string | null> {
  const sanitizedText = cleanTextForVedicVoice(text, language);
  const cleanInput = sanitizedText.replace(/[\n\r]+/g, ' ').slice(0, 350).trim();
  if (!cleanInput) return null;

  let activeKey = cleanApiKey(openaiApiKey);
  if (!activeKey || activeKey.length < 20) {
    activeKey = FALLBACK_OPENAI_KEY;
  }

  // 1. OpenAI TTS Engine
  if (activeKey) {
    try {
      const ttsVoice = astrologer.voiceId || (astrologer.voiceGender === 'female' ? 'nova' : 'onyx');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: ttsVoice,
          input: cleanInput,
          response_format: 'mp3',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (ttsRes.ok) {
        const audioBuffer = await ttsRes.arrayBuffer();
        return Buffer.from(audioBuffer).toString('base64');
      } else {
        const errText = await ttsRes.text();
        console.warn('OpenAI TTS non-ok response:', ttsRes.status, errText);
      }
    } catch (e) {
      console.warn('OpenAI TTS error:', e);
    }
  }

  // 2. Google Translate TTS Fallback
  try {
    const lLower = (language || '').toLowerCase();
    let langCode = 'te';
    if (lLower.includes('telugu') || lLower.includes('te') || /[\u0C00-\u0C7F]/.test(cleanInput)) langCode = 'te';
    else if (lLower.includes('tamil') || lLower.includes('ta') || /[\u0B80-\u0BFF]/.test(cleanInput)) langCode = 'ta';
    else if (lLower.includes('hindi') || lLower.includes('hi') || /[\u0900-\u097F]/.test(cleanInput)) langCode = 'hi';
    else langCode = 'en';

    const encodedText = encodeURIComponent(cleanInput.slice(0, 200));
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;

    const gRes = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (gRes.ok) {
      const arrayBuffer = await gRes.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    }
  } catch (e) {
    console.warn('Google TTS fallback warning:', e);
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let sessionId: string | null = null;
    let userMessage: string | null = null;
    let conversationHistory: any[] = [];
    let reqLanguage: string | null = null;
    let isInitial = false;
    let audioFile: Blob | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      sessionId = formData.get('sessionId') as string;
      userMessage = formData.get('userMessage') as string;
      reqLanguage = formData.get('language') as string;
      isInitial = formData.get('isInitial') === 'true';
      const historyStr = formData.get('conversationHistory') as string;
      if (historyStr) {
        try {
          conversationHistory = JSON.parse(historyStr);
        } catch (e) {}
      }
      audioFile = formData.get('audio') as Blob;
    } else {
      const body = await req.json();
      sessionId = body.sessionId;
      userMessage = body.userMessage;
      conversationHistory = body.conversationHistory || [];
      reqLanguage = body.language;
      isInitial = body.isInitial === true;
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // 1. Fetch OpenAI API Key
    let openaiApiKey = cleanApiKey(process.env.OPENAI_API_KEY);
    if (!openaiApiKey) {
      try {
        const settingsSnap = await adminDb.collection('settings').doc('general').get();
        if (settingsSnap.exists) {
          const sData = settingsSnap.data();
          if (sData?.openaiApiKey) openaiApiKey = cleanApiKey(sData.openaiApiKey);
        }
      } catch (sErr) {
        console.warn('Settings key fetch error:', sErr);
      }
    }
    if (!openaiApiKey || openaiApiKey.length < 20) {
      openaiApiKey = FALLBACK_OPENAI_KEY;
    }

    // 2. Whisper STT transcription if audio file was uploaded
    if (audioFile && !userMessage && openaiApiKey) {
      try {
        const whisperFormData = new FormData();
        whisperFormData.append('file', audioFile, 'voice_input.webm');
        whisperFormData.append('model', 'whisper-1');
        if (reqLanguage) {
          const lLower = reqLanguage.toLowerCase();
          if (lLower.includes('telugu') || lLower.includes('te')) whisperFormData.append('language', 'te');
          else if (lLower.includes('tamil') || lLower.includes('ta')) whisperFormData.append('language', 'ta');
          else if (lLower.includes('hindi') || lLower.includes('hi')) whisperFormData.append('language', 'hi');
          else whisperFormData.append('language', 'en');
        }

        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: whisperFormData,
        });

        if (whisperRes.ok) {
          const whisperData = await whisperRes.json();
          userMessage = whisperData.text || '';
        }
      } catch (sttErr) {
        console.warn('Whisper STT transcription warning:', sttErr);
      }
    }

    // 3. Fetch Consultation Session Context from Firestore
    let astrologer: AIAstrologer = DEFAULT_AI_ASTROLOGERS[0];
    let birthDetails: any = {
      name: 'Devotee',
      gender: 'Male',
      dob: '1995-05-15',
      time: '14:30',
      place: 'New Delhi, India',
      primaryConcern: 'Career & Life Guidance',
    };
    let astroContext: any = {
      lagna: 'Leo (Simha)',
      moonRashi: 'Capricorn (Makara)',
      nakshatra: 'Uttara Ashadha',
      currentDasha: 'Jupiter Mahadasha',
    };
    let sessionLanguage = reqLanguage || 'Telugu';

    try {
      const sessionDoc = await adminDb.collection('ai_consultations').doc(sessionId).get();
      if (sessionDoc.exists) {
        const sData = sessionDoc.data();
        if (sData?.birthDetails) birthDetails = { ...birthDetails, ...sData.birthDetails };
        if (sData?.astroContext) astroContext = { ...astroContext, ...sData.astroContext };
        if (sData?.language) sessionLanguage = sData.language;

        if (sData?.astrologerId) {
          const found = DEFAULT_AI_ASTROLOGERS.find((a) => a.id === sData.astrologerId || a.name === sData.astrologerName);
          if (found) astrologer = found;
        } else if (sData?.astrologerName) {
          const found = DEFAULT_AI_ASTROLOGERS.find((a) => a.name === sData.astrologerName);
          if (found) astrologer = found;
        }
      }
    } catch (e) {
      console.warn('Session Firestore lookup warning:', e);
    }

    // 4. Live AI Generation via OpenAI GPT-4o-mini
    let replyText = '';

    if (openaiApiKey) {
      try {
        const systemPrompt = `You are ${astrologer.name}, a revered, authentic Vedic Astrologer (${astrologer.primaryDiscipline}) with 25+ years of Vedic wisdom on AstroParihar.
Devotee Profile:
- Name: ${birthDetails.name || 'Devotee'}
- Lagna: ${astroContext.lagna}
- Moon Rashi: ${astroContext.moonRashi}
- Nakshatra: ${astroContext.nakshatra}
- Current Dasha: ${astroContext.currentDasha}
- Primary Concern: ${birthDetails.primaryConcern}

Language Instruction:
You MUST speak ONLY in ${sessionLanguage}.
- If Telugu: Speak in pure, warm, respectful spoken Telugu script (తెలుగు లిపి). Use respectful words like 'నమస్కారం', 'గారూ', 'మీ జాతకం ప్రకారం'.
- If Tamil: Speak in pure Tamil script (தமிழ்). Use 'வணக்கம்', 'உங்கள் ஜாதகப்படி'.
- If Hindi: Speak in pure Hindi script (हिन्दी). Use 'नमस्ते', 'जी', 'आपकी जन्म कुंडली के अनुसार'.
- If English: Warm, serene, traditional Indian Vedic astrology tone.

Spoken Call Style & Number Rules:
- Keep your answers concise, direct, and conversational (2 to 4 spoken sentences).
- NEVER use raw English digits or numbers (DO NOT write digits like 108, 2024, 7).
- ALWAYS spell out numbers completely in words (e.g. in Telugu write 'నూట ఎనిమిది సార్లు', 'రెండు వేల ఇరవై ఆరు వరకు', 'ఏడవ భావం'; in Hindi write 'एक सौ आठ बार').
- Give immediate Vedic astrological insights, auspicious time windows, and 1 actionable remedy (mantra, donation, or pooja).
- Do not use markdown bullet points, stars (*), hyphens (-), or hashes (#). Keep it pure natural speech suitable for voice conversation.`;

        const messagesPayload: any[] = [{ role: 'system', content: systemPrompt }];

        if (conversationHistory && conversationHistory.length > 0) {
          const recentHistory = conversationHistory.slice(-6);
          recentHistory.forEach((msg: any) => {
            if (msg.content && (msg.role === 'user' || msg.role === 'assistant')) {
              messagesPayload.push({
                role: msg.role,
                content: msg.content,
              });
            }
          });
        }

        if (isInitial && (!userMessage || userMessage.trim() === '')) {
          messagesPayload.push({
            role: 'user',
            content: `Initiate the call with a warm welcome greeting to ${birthDetails.name || 'Devotee'} in ${sessionLanguage}, stating your readiness to guide their ${birthDetails.primaryConcern || 'life guidance'}.`,
          });
        } else if (userMessage) {
          messagesPayload.push({
            role: 'user',
            content: userMessage,
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
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          replyText = chatData.choices?.[0]?.message?.content?.trim() || '';
        } else {
          const errText = await chatRes.text();
          console.error('OpenAI GPT-4o-mini non-ok response:', chatRes.status, errText);
        }
      } catch (aiErr) {
        console.warn('OpenAI GPT-4o-mini generation warning:', aiErr);
      }
    }

    // 5. Dynamic Native Vedic Engine (Static Fallback)
    if (!replyText) {
      replyText = generateDynamicVedicReply(
        userMessage,
        isInitial,
        birthDetails,
        astroContext,
        astrologer,
        sessionLanguage
      );
    }

    // 6. Generate Voice Speech Audio
    const audioBase64 = await generateMultilingualAudioBase64(
      replyText,
      sessionLanguage,
      astrologer,
      openaiApiKey
    );

    return NextResponse.json({
      success: true,
      userMessage,
      replyText,
      audioBase64,
      astrologerName: astrologer.name,
      language: sessionLanguage,
    });
  } catch (error: any) {
    console.error('AI voice-session error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal voice exchange error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const activeKey = (process.env.OPENAI_API_KEY || '').trim() || FALLBACK_OPENAI_KEY;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say hello in Telugu' }],
        max_tokens: 30,
      }),
    });
    const data = await res.json();
    return NextResponse.json({
      version: 'live-v2',
      keyConfigured: Boolean(activeKey),
      keyLength: activeKey.length,
      openaiStatus: res.status,
      openaiResponse: data?.choices?.[0]?.message?.content || data,
    });
  } catch (err: any) {
    return NextResponse.json({
      version: 'live-v2',
      keyConfigured: Boolean(activeKey),
      error: err.message || String(err),
    });
  }
}
