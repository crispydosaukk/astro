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
    return 'రాశి';
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

function getNativeLagna(sign: string, lang: 'telugu' | 'tamil' | 'hindi' | 'english'): string {
  const s = (sign || '').toLowerCase();
  if (lang === 'telugu') {
    if (s.includes('aries') || s.includes('mesha')) return 'మేష లగ్నం';
    if (s.includes('taurus') || s.includes('vrishabha')) return 'వృషభ లగ్నం';
    if (s.includes('gemini') || s.includes('mithuna')) return 'మిథున లగ్నం';
    if (s.includes('cancer') || s.includes('karka')) return 'కర్కాటక లగ్నం';
    if (s.includes('leo') || s.includes('simha')) return 'సింహ లగ్నం';
    if (s.includes('virgo') || s.includes('kanya')) return 'కన్యా లగ్నం';
    if (s.includes('libra') || s.includes('tula')) return 'తులా లగ్నం';
    if (s.includes('scorpio') || s.includes('vrishchika')) return 'వృశ్చిక లగ్నం';
    if (s.includes('sagittarius') || s.includes('dhanu')) return 'ధనుస్సు లగ్నం';
    if (s.includes('capricorn') || s.includes('makara')) return 'మకర లగ్నం';
    if (s.includes('aquarius') || s.includes('kumbha')) return 'కుంభ లగ్నం';
    if (s.includes('pisces') || s.includes('meena')) return 'మీన లగ్నం';
    return 'లగ్నం';
  }
  if (lang === 'tamil') {
    if (s.includes('aries') || s.includes('mesha')) return 'மேஷ லக்னம்';
    if (s.includes('taurus') || s.includes('vrishabha')) return 'ரிஷப லக்னம்';
    if (s.includes('gemini') || s.includes('mithuna')) return 'மிதுன லக்னம்';
    if (s.includes('cancer') || s.includes('karka')) return 'கடக லக்னம்';
    if (s.includes('leo') || s.includes('simha')) return 'சிம்ம லக்னம்';
    if (s.includes('virgo') || s.includes('kanya')) return 'கன்னி லக்னம்';
    if (s.includes('libra') || s.includes('tula')) return 'துலாம் லக்னம்';
    if (s.includes('scorpio') || s.includes('vrishchika')) return 'விருச்சிக லக்னம்';
    if (s.includes('sagittarius') || s.includes('dhanu')) return 'தனுசு லக்னம்';
    if (s.includes('capricorn') || s.includes('makara')) return 'மகர லக்னம்';
    if (s.includes('aquarius') || s.includes('kumbha')) return 'கும்ப லக்னம்';
    if (s.includes('pisces') || s.includes('meena')) return 'மீன லக்னம்';
    return 'லக்னம்';
  }
  if (lang === 'hindi') {
    if (s.includes('aries') || s.includes('mesha')) return 'मेष लग्न';
    if (s.includes('taurus') || s.includes('vrishabha')) return 'वृषभ लग्न';
    if (s.includes('gemini') || s.includes('mithuna')) return 'मिथुन लग्न';
    if (s.includes('cancer') || s.includes('karka')) return 'कर्क लग्न';
    if (s.includes('leo') || s.includes('simha')) return 'सिंह लग्न';
    if (s.includes('virgo') || s.includes('kanya')) return 'कन्या लग्न';
    if (s.includes('libra') || s.includes('tula')) return 'तुला लग्न';
    if (s.includes('scorpio') || s.includes('vrishchika')) return 'वृश्चिक लग्न';
    if (s.includes('sagittarius') || s.includes('dhanu')) return 'धनु लग्न';
    if (s.includes('capricorn') || s.includes('makara')) return 'मकर लग्न';
    if (s.includes('aquarius') || s.includes('kumbha')) return 'कुंभ लग्न';
    if (s.includes('pisces') || s.includes('meena')) return 'मीन लग्न';
    return 'लग्न';
  }
  return sign || 'Lagna';
}

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
    if (d.includes('mars') || d.includes('kuja')) return 'செவ்வாய் மகாதிசை';
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
  const name = birthDetails.name || (isTelugu ? 'భక్తుడు' : isTamil ? 'அன்பரே' : isHindi ? 'भक्त' : 'Devotee');
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
    text.includes('నమస్కారం') ||
    text.includes('స్వామీజీ') ||
    text.includes('గురువుగారు') ||
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
    text.includes('పెళ్లి') ||
    text.includes('వివాహం') ||
    text.includes('సంబంధం') ||
    text.includes('దాంపత్యం') ||
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
    text.includes('ఉద్యోగం') ||
    text.includes('కెరీర్') ||
    text.includes('నౌకరి') ||
    text.includes('ప్రమోషన్') ||
    text.includes('వ్యాపారం') ||
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

  // 5. Wealth & Finances
  if (
    text.includes('money') ||
    text.includes('wealth') ||
    text.includes('finance') ||
    text.includes('loan') ||
    text.includes('debt') ||
    text.includes('ధనం') ||
    text.includes('ఆర్థిక') ||
    text.includes('పైసలు') ||
    text.includes('రుణం') ||
    text.includes('பணம்') ||
    text.includes('செல்வம்') ||
    text.includes('धन') ||
    text.includes('पैसे')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ ధన స్థానం మరియు లాభ స్థానం అనుకూలమైన మార్గంలో ఉన్నాయి. ఆర్థిక వృద్ధి నిలకడగా ఉండటానికి ప్రతిరోజూ శ్రీ సూక్తం పఠించడం మరియు బుధవారం ఆవుకు ఆకుకూరలు తినిపించడం వల్ల లక్ష్మీ కటాక్షం సిద్ధిస్తుంది. అప్పుల నివారణ లేదా పెట్టుబడుల గురించి ఇంకా ఏమైనా సందేహం ఉందా?`;
    }
    if (isTamil) {
      return `${name}, உங்கள் தன ஸ்தானமும் லாப ஸ்தானமும் நல்ல நிலையில் உள்ளன. வெள்ளிக்கிழமைகளில் ஸ்ரீ சூக்தம் பாராயணம் செய்வதும், புதன்கிழமைகளில் பசுவிற்கு அகத்திக்கீரை அளிப்பதும் நிலையான தன லாபத்தைத் தரும்.`;
    }
    if (isHindi) {
      return `${name} जी, आपकी कुंडली में धन और लाभ भाव की स्थिति उत्तम है। आर्थिक समृद्धि के लिए श्री सूक्त का पाठ करें और बुधवार को गाय को हरा चारा खिलाएं।`;
    }
    return `${name}, your 2nd house of Wealth and 11th house of Financial Gains show favorable momentum. Reciting Sri Suktam on Fridays will attract steady prosperity.`;
  }

  // 6. Remedies & Pooja
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
    text.includes('பரிகாரம்') ||
    text.includes('மந்திரம்') ||
    text.includes('उपाय') ||
    text.includes('मंत्र')
  ) {
    if (isTelugu) {
      return `${name} గారూ, మీ గ్రహ శాంతి కొరకు మూడు శ్రేష్టమైన పరిహారాలు: 1) రోజూ గాయత్రీ మంత్రం 108 సార్లు జపించండి. 2) గురువారం ఆలయంలో పసుపు రంగు వస్తువులు లేదా శనగలు దానం చేయండి. 3) శివునికి జలాభిషేకం చేయడం వల్ల సకల దోషాలు తొలగిపోతాయి. దీనిపై మీకు ఇంకా ఏమైనా సందేహం ఉందా?`;
    }
    if (isTamil) {
      return `${name}, உங்கள் கிரக தோஷ நிவர்த்திக்கான பரிகாரங்கள்: 1) தினமும் காயத்ரி மந்திரம் 108 முறை ஜபிக்கவும். 2) வியாழக்கிழமைகளில் குரு பகவானை வழிபடவும். 3) சிவபெருமானுக்கு அபிஷேகம் செய்வது நலம் பயக்கும்.`;
    }
    if (isHindi) {
      return `${name} जी, ग्रहों के संतुलन के लिए प्रतिदिन गायत्री मंत्र का 108 बार जाप करें, गुरुवार को चने की दाल का दान करें और भगवान शिव की आराधना करें।`;
    }
    return `${name}, here are the core Vedic remedies: 1) Chant the Gayatri Mantra 108 times daily. 2) Donate yellow grains on Thursdays. 3) Perform Shiva Pooja for universal protection.`;
  }

  // 7. General Astrological Response
  if (isTelugu) {
    return `${name} గారూ, మీరు అడిగిన విషయమై మీ జన్మ కుండలిలోని గ్రహాలు అనుకూలంగానే స్పందిస్తున్నాయి. మీ ${lagna} మరియు ${moonRashi} ప్రకారం, మీరు దృఢ సంకల్పంతో చేసే ప్రతి పనిలో విజయం సాధిస్తారు. దీనిపై మీకు ఇంకా ఏవైనా ప్రత్యేక పరిహారాలు లేదా సమయపాలన వివరాలు కావాలా?`;
  }
  if (isTamil) {
    return `${name}, உங்கள் ${lagna} மற்றும் ${moonRashi}ப்படி தற்போதைய கிரக சஞ்சாரங்கள் நல்வழியை நோக்கி உள்ளன. தொடர்ந்து நற்செயல்களைச் செய்து வர வெற்றிகள் உண்டாகும். வேறு ஏதேனும் சந்தேகம் உள்ளதா?`;
  }
  if (isHindi) {
    return `${name} जी, आपके द्वारा पूछे गए प्रश्न के अनुसार ग्रह गोचर आपके पक्ष में है। ${lagna} और ${moonRashi} के आधार पर आपका आत्मबल उत्तम रहेगा। क्या आप किसी अन्य ग्रह दोष या समय के बारे में जानना चाहते हैं?`;
  }
  return `${name}, based on your ${lagna} and ${moonRashi}, the current cosmic transit aligns favorably with your aspirations. Consistency and righteous action will bring victory. Would you like further clarity on timing or specific planetary remedies?`;
}

// Universal Multilingual Speech Synthesizer (OpenAI TTS with extended 12s timeout + Google TTS fallback)
async function generateMultilingualAudioBase64(
  text: string,
  language: string,
  astrologer: AIAstrologer,
  openaiApiKey?: string | null
): Promise<string | null> {
  const cleanInput = text.replace(/[\n\r]+/g, ' ').slice(0, 350).trim();
  if (!cleanInput) return null;

  // 1. Universal OpenAI TTS Engine (Extended 12s timeout for high-quality audio)
  const activeKey = openaiApiKey || DEFAULT_OPENAI_KEY;
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
      }
    } catch (ttsErr) {
      console.warn('OpenAI TTS timeout/error, attempting secondary synthesis:', ttsErr);
    }
  }

  // 2. Google Translate TTS Audio Fallback
  try {
    let langCode = 'te';
    const langLower = (language || '').toLowerCase();
    if (langLower.includes('tamil') || langLower.includes('ta') || /[\u0B80-\u0BFF]/.test(cleanInput)) {
      langCode = 'ta';
    } else if (langLower.includes('hindi') || langLower.includes('hi') || /[\u0900-\u097F]/.test(cleanInput)) {
      langCode = 'hi';
    } else if (langLower.includes('english') || langLower.includes('en')) {
      langCode = 'en';
    } else if (langLower.includes('telugu') || langLower.includes('te') || /[\u0C00-\u0C7F]/.test(cleanInput)) {
      langCode = 'te';
    }

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanInput)}&tl=${langCode}&client=tw-ob`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    }
  } catch (ttsErr) {
    console.warn('Secondary audio synthesizer error:', ttsErr);
  }

  return null;
}

export async function POST(req: Request) {
  try {
    let sessionId = '';
    let userMessage = '';
    let conversationHistory: any[] = [];
    let reqLanguage = '';
    let isInitial = false;
    let audioFile: File | Blob | null = null;

    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form Data (Audio voice file from client mic)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      sessionId = (formData.get('sessionId') as string) || '';
      userMessage = (formData.get('userMessage') as string) || '';
      reqLanguage = (formData.get('language') as string) || '';
      isInitial = formData.get('isInitial') === 'true';
      audioFile = formData.get('audio') as File | Blob | null;

      const histStr = formData.get('conversationHistory') as string;
      if (histStr) {
        try {
          conversationHistory = JSON.parse(histStr);
        } catch (e) {}
      }
    } else {
      // Handle Standard JSON Body
      const body = await req.json();
      sessionId = body.sessionId || '';
      userMessage = body.userMessage || '';
      conversationHistory = body.conversationHistory || [];
      reqLanguage = body.language || '';
      isInitial = !!body.isInitial;
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // 1. Fetch OpenAI API Key
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
    if (!openaiApiKey) {
      openaiApiKey = DEFAULT_OPENAI_KEY;
    }

    // 2. If an audio file was uploaded, Transcribe via OpenAI Whisper STT
    if (audioFile && !userMessage) {
      try {
        const whisperFormData = new FormData();
        whisperFormData.append('file', audioFile, 'voice_input.webm');
        whisperFormData.append('model', 'whisper-1');
        if (reqLanguage) {
          const lLower = reqLanguage.toLowerCase();
          if (lLower.includes('telugu') || lLower.includes('te')) whisperFormData.append('language', 'te');
          else if (lLower.includes('tamil') || lLower.includes('ta')) whisperFormData.append('language', 'ta');
          else if (lLower.includes('hindi') || lLower.includes('hi')) whisperFormData.append('language', 'hi');
          else if (lLower.includes('english') || lLower.includes('en')) whisperFormData.append('language', 'en');
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
          if (whisperData?.text?.trim()) {
            userMessage = whisperData.text.trim();
          }
        } else {
          console.warn('Whisper API non-ok response:', await whisperRes.text());
        }
      } catch (whisperErr) {
        console.warn('Whisper transcription error:', whisperErr);
      }
    }

    // 3. Fetch Session & Astrologer Details
    let sessionData: any = null;
    let sessionDocRef: any = null;
    try {
      const sessionDoc = await adminDb.collection('ai_consultations').doc(sessionId).get();
      if (sessionDoc.exists) {
        sessionData = sessionDoc.data();
        sessionDocRef = sessionDoc.ref;
      }
    } catch (e) {
      console.warn('Session fetch error:', e);
    }

    if (!sessionData) {
      sessionData = {
        astrologerId: 'ai-astrologer-1',
        astrologerName: 'Swami Ji',
        language: reqLanguage || 'Telugu',
        birthDetails: {
          name: 'Devotee',
          gender: 'Male',
          primaryConcern: 'General Life Guidance',
        },
        astroContext: {
          lagna: 'Scorpio (Vrishchika)',
          moonRashi: 'Aries (Mesha)',
          nakshatra: 'Bharani',
          currentDasha: 'Jupiter - Mars',
        },
      };
    }

    const astrologerId = sessionData?.astrologerId;
    const birthDetails = sessionData?.birthDetails || {};
    const astroContext = sessionData?.astroContext || {};
    const language = reqLanguage || sessionData?.language || 'Telugu';

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

    const langLower = (language || '').toLowerCase();
    const isTelugu = langLower.includes('telugu') || langLower.includes('te');
    const isTamil = langLower.includes('tamil') || langLower.includes('ta');
    const isHindi = langLower.includes('hindi') || langLower.includes('hi');
    const langKey = isTelugu ? 'telugu' : isTamil ? 'tamil' : isHindi ? 'hindi' : 'english';

    const nativeLagna = getNativeLagna(astroContext.lagna, langKey);
    const nativeMoonRashi = getNativeRashi(astroContext.moonRashi, langKey);
    const nativeDasha = getNativeDasha(astroContext.currentDasha, langKey);

    const systemPersona = `${astrologer.systemPersonaPrompt || 'You are an authentic, revered Vedic Astrologer at AstroParihar.'}

CUSTOMER BIRTH CHART CONTEXT:
- Devotee Name: ${birthDetails.name || 'Devotee'}
- Gender: ${birthDetails.gender || 'N/A'}
- Date of Birth: ${birthDetails.dob || 'N/A'}, Time: ${birthDetails.time || 'N/A'}, Place: ${birthDetails.place || 'N/A'}
- Primary Category of Consultation: ${birthDetails.primaryConcern || 'General Life Guidance'}
- Lagna: ${nativeLagna} (${astroContext.lagna || 'Scorpio'})
- Moon Sign (Rashi): ${nativeMoonRashi} (${astroContext.moonRashi || 'Aries'})
- Nakshatra: ${astroContext.nakshatra || 'Bharani'}
- Active Mahadasha: ${nativeDasha}
- Preferred Consultation Language: ${language}

CRITICAL CONVERSATIONAL VOICE INSTRUCTIONS:
1. STRICT LANGUAGE SCRIPT:
   - If language is "Telugu" (or user speaks in Telugu), reply 100% in pure Telugu script (తెలుగు లిపి). NEVER include English words in brackets (e.g. write "సింహ లగ్నం" or "మకర రాశి").
   - If language is "Tamil", reply 100% in pure Tamil script (தமிழ்).
   - If language is "Hindi", reply 100% in pure Hindi script (हिन्दी).
   - If language is "English", reply in fluent, respectful English.
2. DYNAMIC REAL-TIME CONVERSATION:
   - You are in an active LIVE 2-way phone call as ${astrologer.name}.
   - Understand whatever the customer asks (marriage timing, job promotion, money, love, remedies) and answer DIRECTLY with clear astrological insight.
   - Keep each answer to 2 to 4 spoken sentences (concise and natural for listening).
   - DO NOT repeat initial greetings once the conversation has started.
   - Conclude each response with a warm, gentle follow-up question to keep the conversation flowing.`;

    // 4. Live AI Chat Execution via OpenAI GPT-4o-mini
    if (openaiApiKey) {
      try {
        const messages: any[] = [{ role: 'system', content: systemPersona }];

        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          for (const msg of conversationHistory) {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content || msg.text || '',
            });
          }
        }

        if (userMessage && userMessage.trim()) {
          messages.push({ role: 'user', content: userMessage.trim() });
        } else if (messages.length === 1) {
          messages.push({
            role: 'user',
            content: `I have joined the live voice call. Please greet me in ${language} and review my birth chart regarding my concern: ${birthDetails.primaryConcern || 'General Life Guidance'}.`,
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
            max_tokens: 300,
          }),
        });

        if (chatRes.ok) {
          const chatJson = await chatRes.json();
          let replyText = chatJson.choices[0]?.message?.content?.trim();
          if (replyText) {
            // Generate full speech audio in the selected language
            const audioBase64 = await generateMultilingualAudioBase64(
              replyText,
              language,
              astrologer,
              openaiApiKey
            );

            // Persist message to session transcript in Firestore
            try {
              if (sessionDocRef) {
                const updatedHistory = [
                  ...conversationHistory,
                  ...(userMessage ? [{ role: 'user', content: userMessage, time: new Date().toISOString() }] : []),
                  { role: 'assistant', content: replyText, time: new Date().toISOString() },
                ];
                await sessionDocRef.set(
                  { conversationTranscript: updatedHistory, updatedAt: new Date().toISOString() },
                  { merge: true }
                );
              }
            } catch (pErr) {
              console.warn('Transcript save warning:', pErr);
            }

            return NextResponse.json({
              success: true,
              transcribedText: userMessage || '',
              replyText,
              audioBase64,
              astrologer,
              language,
            });
          }
        }
      } catch (aiErr) {
        console.warn('OpenAI chat error, activating dynamic native Vedic engine:', aiErr);
      }
    }

    // 5. Dynamic Native Vedic Engine (Pure Script Fallback)
    const isExplicitGreeting = isInitial || !userMessage || userMessage.trim() === '';
    const dynamicReply = generateDynamicVedicReply(
      userMessage,
      isExplicitGreeting,
      birthDetails,
      astroContext,
      astrologer,
      language
    );

    const audioBase64 = await generateMultilingualAudioBase64(
      dynamicReply,
      language,
      astrologer,
      openaiApiKey
    );

    return NextResponse.json({
      success: true,
      transcribedText: userMessage || '',
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
