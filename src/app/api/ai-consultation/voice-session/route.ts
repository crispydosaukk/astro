import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { DEFAULT_AI_ASTROLOGERS, AIAstrologer } from '@/lib/aiAstrologerData';
import { ASTROPARIHAR_UNIFIED_REMEDY_DIRECTIVES, resolveVedicRemedies } from '@/lib/vedicRemediesEngine';
import { calculateBirthChartData, formatChartSummaryForAI } from '@/lib/vedicAstrologyEngine';
import { fetchWithOpenAIFallback, getServerOpenAIApiKey } from '@/lib/aiConfig';
import { queryVedikaAI, formatToVedikaDateTime } from '@/lib/vedikaClient';

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
    if (l.includes('libra') || l.includes('tula')) return 'துலா லக்னம்';
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
  return lagna || 'Ascendant';
}

// Dasha Native Translators
function getNativeDasha(dasha: string, lang: 'telugu' | 'tamil' | 'hindi' | 'english'): string {
  const d = (dasha || '').toLowerCase();
  if (lang === 'telugu') {
    if (d.includes('jupiter') || d.includes('guru')) return 'గురు మహాదశ';
    if (d.includes('saturn') || d.includes('shani')) return 'శని మహాదశ';
    if (d.includes('mercury') || d.includes('budha')) return 'బుధ మహాదశ';
    if (d.includes('venus') || d.includes('shukra')) return 'శుక్ర మహాదశ';
    if (d.includes('sun') || d.includes('surya')) return 'సూర్య మహాదశ';
    if (d.includes('moon') || d.includes('chandra')) return 'చంద్ర మహాదశ';
    if (d.includes('mars') || d.includes('kuja') || d.includes('mangal')) return 'కుజ మహాదశ';
    if (d.includes('rahu')) return 'రాహు మహాదశ';
    if (d.includes('ketu')) return 'కేతు మహాదశ';
    return 'వింశోత్తరి దశ';
  }
  if (lang === 'tamil') {
    if (d.includes('jupiter') || d.includes('guru')) return 'குரு மகா தசை';
    if (d.includes('saturn') || d.includes('shani')) return 'சனி மகா தசை';
    if (d.includes('mercury') || d.includes('budha')) return 'புதன் மகா தசை';
    if (d.includes('venus') || d.includes('shukra')) return 'சுக்கிர மகா தசை';
    if (d.includes('sun') || d.includes('surya')) return 'சூரிய மகா தசை';
    if (d.includes('moon') || d.includes('chandra')) return 'சந்திர மகா தசை';
    if (d.includes('mars') || d.includes('kuja') || d.includes('mangal')) return 'செவ்வாய் மகா தசை';
    if (d.includes('rahu')) return 'ராகு மகா தசை';
    if (d.includes('ketu')) return 'கேது மகா தசை';
    return 'விம்சோத்தரி தசை';
  }
  if (lang === 'hindi') {
    if (d.includes('jupiter') || d.includes('guru')) return 'बृहस्पति महादशा';
    if (d.includes('saturn') || d.includes('shani')) return 'शनि महादशा';
    if (d.includes('mercury') || d.includes('budha')) return 'बुध महादशा';
    if (d.includes('venus') || d.includes('shukra')) return 'शुक्र महादशा';
    if (d.includes('sun') || d.includes('surya')) return 'सूर्य महादशा';
    if (d.includes('moon') || d.includes('chandra')) return 'चंद्र महादशा';
    if (d.includes('mars') || d.includes('kuja') || d.includes('mangal')) return 'मंगल महादशा';
    if (d.includes('rahu')) return 'राहु महादशा';
    if (d.includes('ketu')) return 'केतु महादशा';
    return 'विंशोत्तरी महादशा';
  }
  return dasha || 'Active Dasha';
}

export interface PrescribedRemedyInfo {
  type: 'homam' | 'mantra' | 'gemstone' | 'puja';
  title: string;
  homamId?: string;
  instructions: string;
  mantraTitle: string;
  mantraInstructions: string;
  topic: string;
}

export interface DynamicVedicReplyResult {
  text: string;
  remedy?: PrescribedRemedyInfo;
}

// Extract canonical remedy based on inquiry and astrologer advice
function extractPrescribedRemedy(userText: string, replyText: string, astroContext: any): PrescribedRemedyInfo {
  const combined = (userText + ' ' + replyText).toLowerCase();

  // 1. Career / Job / Promotion / Business
  if (
    combined.includes('ganapathi') ||
    combined.includes('గణపతి') ||
    combined.includes('गणपति') ||
    combined.includes('career') ||
    combined.includes('job') ||
    combined.includes('promotion') ||
    combined.includes('business') ||
    combined.includes('ఉద్యోగ') ||
    combined.includes('వ్యాపార') ||
    combined.includes('పని') ||
    combined.includes('नौकरी') ||
    combined.includes('व्यापार')
  ) {
    return {
      type: 'homam',
      title: 'Maha Ganapathi Homam (మహా గణపతి హోమం)',
      homamId: 'ganapathi',
      instructions: 'Perform on Wednesday or Shukla Chaturthi at sunrise with Modakam and Durva grass to clear hurdles.',
      mantraTitle: 'Ganesh Maha Mantra',
      mantraInstructions: 'Chant "Om Gam Ganapataye Namaha" 108 times daily before leaving for work.',
      topic: 'Career & Business Growth',
    };
  }

  // 2. Wealth / Finances / Debt / Money / Loans
  if (
    combined.includes('lakshmi') ||
    combined.includes('kubera') ||
    combined.includes('లక్ష్మీ') ||
    combined.includes('finance') ||
    combined.includes('money') ||
    combined.includes('wealth') ||
    combined.includes('debt') ||
    combined.includes('loan') ||
    combined.includes('ధన') ||
    combined.includes('అప్పు') ||
    combined.includes('ఆర్థిక') ||
    combined.includes('धन') ||
    combined.includes('कर्ज')
  ) {
    return {
      type: 'homam',
      title: 'Lakshmi Kubera Homam (శ్రీ లక్ష్మీ కుబేర హోమం)',
      homamId: 'lakshmi_kubera',
      instructions: 'Perform on Friday morning during sunrise with lotus petals and cow ghee for financial abundance.',
      mantraTitle: 'Maha Lakshmi Mantra & Kanakadhara Stotram',
      mantraInstructions: 'Chant "Om Shreem Hreem Kleem Mahalakshmaye Namah" 108 times on Fridays.',
      topic: 'Wealth & Financial Growth',
    };
  }

  // 3. Marriage / Love / Relationship
  if (
    combined.includes('swayamvara') ||
    combined.includes('parvathi') ||
    combined.includes('marriage') ||
    combined.includes('vivaha') ||
    combined.includes('wedding') ||
    combined.includes('relationship') ||
    combined.includes('love') ||
    combined.includes('వివాహ') ||
    combined.includes('పెళ్లి') ||
    combined.includes('సంబంధం') ||
    combined.includes('शादी') ||
    combined.includes('विवाह')
  ) {
    return {
      type: 'homam',
      title: 'Swayamvara Parvathi Homam (స్వయంవర పార్వతి హోమం)',
      homamId: 'swayamvara_parvathi',
      instructions: 'Perform on Friday or Shukla Panchami with yellow flowers and pure ghee to dissolve marriage delays.',
      mantraTitle: 'Swayamvara Parvathi Maha Mantra',
      mantraInstructions: 'Chant the sacred Swayamvara Parvathi Mantra 108 times daily for matrimonial bliss.',
      topic: 'Marriage & Relationship Harmony',
    };
  }

  // 4. Health / Illness / Recovery / Longevity
  if (
    combined.includes('mrityunjaya') ||
    combined.includes('health') ||
    combined.includes('illness') ||
    combined.includes('disease') ||
    combined.includes('hospital') ||
    combined.includes('ఆరోగ్య') ||
    combined.includes('మృత్యుంజయ') ||
    combined.includes('జబ్బు') ||
    combined.includes('బాధ') ||
    combined.includes('स्वास्थ्य') ||
    combined.includes('रोग')
  ) {
    return {
      type: 'homam',
      title: 'Maha Mrityunjaya Homam (మహా మృత్యుంజయ హోమం)',
      homamId: 'mrityunjaya',
      instructions: 'Perform on Monday at sunrise with sacred Bilva leaves, milk, and cow ghee for health rejuvenation.',
      mantraTitle: 'Maha Mrityunjaya Mantra',
      mantraInstructions: 'Chant "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam" 108 times daily.',
      topic: 'Health & Vitality',
    };
  }

  // 5. Protection / Negative Energy / Evil Eye / Drishti
  if (
    combined.includes('sudarshana') ||
    combined.includes('protection') ||
    combined.includes('evil eye') ||
    combined.includes('drishti') ||
    combined.includes('negative') ||
    combined.includes('రక్షణ') ||
    combined.includes('దిష్టి') ||
    combined.includes('సుదర్శన') ||
    combined.includes('భయం') ||
    combined.includes('सुरक्षा') ||
    combined.includes('बुरी नजर')
  ) {
    return {
      type: 'homam',
      title: 'Sudarshana Homam (శ్రీ సుదర్శన హోమం)',
      homamId: 'sudarshana',
      instructions: 'Perform on Wednesday or Ekadashi with Tulasi leaves and cow ghee for supreme spiritual protection.',
      mantraTitle: 'Sudarshana Maha Mantra',
      mantraInstructions: 'Chant "Om Kleem Krishnaya Govindaya Gopijana Vallabhaya Paraya Paramatmane" daily.',
      topic: 'Protection & Evil Eye Shielding',
    };
  }

  // Default: Navagraha Shanti
  return {
    type: 'homam',
    title: 'Navagraha Homam (నవగ్రహ శాంతి హోమం)',
    homamId: 'navagraha',
    instructions: 'Perform on Saturday or Sunday with Navadhanya and 9 sacred samidhas to pacify all planetary doshas.',
    mantraTitle: 'Navagraha Shanti Mantra',
    mantraInstructions: 'Chant the Navagraha Stotram or Gayatri Mantra 108 times at sunrise.',
    topic: 'Planetary Dosha Shanti',
  };
}

// Convert raw Vedika AI output into clean, natural spoken voice text
function formatVedikaForVoice(rawAnswer: string, language: string, astrologerName: string): string {
  if (!rawAnswer || typeof rawAnswer !== 'string') return '';

  let cleaned = rawAnswer
    // Remove markdown
    .replace(/[*#_~`^<>{}[\]\\]+/g, '')
    // Remove JSON artifacts
    .replace(/\{"answer":\s*"?/g, '')
    .replace(/"\}$/g, '')
    // Remove English transliteration artifacts in parentheses (e.g. "(Kumbham)(8H)", "(H8)")
    .replace(/\([A-Za-z0-9\s#]+\)/g, '')
    // Remove stray Korean or non-Indian Asian glyphs if any
    .replace(/[\uAC00-\uD7AF\u4E00-\u9FFF]+/g, '')
    // Remove Vedika signature so voice persona stays consistent with astrologer
    .replace(/[—–-]\s*Vedika(?:\s*AI)?\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Take the first 2-4 complete sentences so speech stays concise and responsive
  const sentenceRegex = /[^.!?।॥\n]+[.!?।॥\n]*/g;
  const matches = cleaned.match(sentenceRegex) || [cleaned];
  const selectedSentences = matches.slice(0, 3).map((s) => s.trim()).filter(Boolean);

  let finalVoiceText = selectedSentences.join(' ');
  if (!finalVoiceText) finalVoiceText = cleaned.slice(0, 300);

  return finalVoiceText;
}

// Multi-turn Conversational Fallback (Guarantees zero repeated boilerplate)
function generateDynamicVedicReply(
  userText: string | null,
  isInitialGreeting: boolean,
  birthDetails: any,
  astroContext: any,
  astrologer: AIAstrologer,
  sessionLanguage: string,
  conversationHistory: any[] = []
): DynamicVedicReplyResult {
  const langKey =
    sessionLanguage === 'Telugu' || sessionLanguage === 'te'
      ? 'telugu'
      : sessionLanguage === 'Tamil' || sessionLanguage === 'ta'
      ? 'tamil'
      : sessionLanguage === 'Hindi' || sessionLanguage === 'hi'
      ? 'hindi'
      : 'english';

  const isTelugu = langKey === 'telugu';
  const isTamil = langKey === 'tamil';
  const isHindi = langKey === 'hindi';

  let name = birthDetails.name || (isTelugu ? 'భక్తులారా' : isHindi ? 'भक्त' : 'Devotee');
  if (isTelugu && /^[a-zA-Z\s]+$/.test(name)) {
    const firstName = name.split(' ')[0];
    name = firstName;
  }

  const lagna = getNativeLagna(astroContext.lagna, langKey);
  const moonRashi = getNativeRashi(astroContext.moonRashi, langKey);
  const dasha = getNativeDasha(astroContext.currentDasha, langKey);
  const text = (userText || '').toLowerCase().trim();

  const pastUserQuestions = (conversationHistory || [])
    .filter((m: any) => m.role === 'user')
    .map((m: any) => (m.content || '').toLowerCase());
  const turnIndex = pastUserQuestions.length;

  // 1. Initial Greeting
  if (isInitialGreeting && (!userText || userText.trim() === '')) {
    if (isTelugu) {
      return {
        text: `నమస్కారం ${name} గారూ. నేను మీ జ్యోతిష సలహాదారు ${astrologer.name}. మీ జన్మ కుండలి ప్రకారం లగ్నం ${lagna}, రాశి ${moonRashi}, మరియు ప్రస్తుత దశ ${dasha}. ఈ రోజు మీకు ఏ విషయంలో మార్గదర్శనం కావాలి?`,
      };
    }
    if (isTamil) {
      return {
        text: `வணக்கம் ${name}. நான் உங்கள் ஜோதிடர் ${astrologer.name}. உங்கள் லக்னம் ${lagna}, ராசி ${moonRashi}, மற்றும் தசை ${dasha}. இன்று உங்களுக்கு என்ன வழிகாட்டல் வேண்டும்?`,
      };
    }
    if (isHindi) {
      return {
        text: `नमस्ते ${name} जी। मैं आपका ज्योतिषी ${astrologer.name} हूँ। आपकी जन्म कुंडली में लग्न ${lagna}, राशि ${moonRashi}, और दशा ${dasha} है। आज आप किस विषय में मार्गदर्शन चाहते हैं?`,
      };
    }
    return {
      text: `Namaste ${name}. I am ${astrologer.name}. Looking at your synthesized Vedic chart, your Lagna is ${lagna}, Moon sign is ${moonRashi}, and active Dasha is ${dasha}. What would you like to consult about today?`,
    };
  }

  // 2. Greetings
  if (
    text.includes('నమస్కారం') ||
    text.includes('బాగున్నారా') ||
    text.includes('హలో') ||
    text === 'hello' ||
    text === 'hi' ||
    text.includes('வணக்கம்') ||
    text.includes('नमस्ते')
  ) {
    if (isTelugu) {
      return {
        text: `నమస్కారం ${name} గారూ! మీ ${lagna} మరియు ${moonRashi} గ్రహ స్థితులు ప్రస్తుతం అనుకూలంగా ఉన్నాయి. ఉద్యోగం, వివాహం, ఆర్థికం లేదా పరిహారాల గురించి మీ ప్రశ్న అడగండి.`,
      };
    }
    if (isHindi) {
      return {
        text: `नमस्ते ${name} जी! आपकी कुंडली में ${lagna} और ${moonRashi} के अनुसार वर्तमान समय महत्वपूर्ण है। आप करियर, विवाह, धन या ग्रह शांति के बारे में अपना प्रश्न पूछ सकते हैं।`,
      };
    }
    return {
      text: `Namaste ${name}! Happy to connect. Looking at your ${lagna} and ${moonRashi}, what specific question would you like to explore today?`,
    };
  }

  // 3. Timing / "When will it happen?"
  const isTiming =
    text.includes('when') ||
    text.includes('time') ||
    text.includes('date') ||
    text.includes('month') ||
    text.includes('year') ||
    text.includes('soon') ||
    text.includes('ఎప్పుడు') ||
    text.includes('సమయం') ||
    text.includes('ఎప్పటికి') ||
    text.includes('కాలం') ||
    text.includes('ఎప్పుడు జరుగుతుంది') ||
    text.includes('కబ్') ||
    text.includes('कब') ||
    text.includes('समय') ||
    text.includes('எப்போது');

  if (isTiming) {
    const currentYear = new Date().getFullYear();
    if (isTelugu) {
      return {
        text: `${name} గారూ, మీ కుండలిలోని గ్రహ గతుల ప్రకారం మరియు ప్రస్తుత ${dasha} వలన, ${currentYear} ద్వితీయార్థం నుండి మీకు అనుకూలమైన ఫలితాలు ప్రారంభమవుతాయి. గ్రహాల అనుగ్రహం కోసం నిత్య ప్రార్థన కొనసాగించండి.`,
      };
    }
    if (isHindi) {
      return {
        text: `${name} जी, आपकी कुंडली में वर्तमान ${dasha} और गोचर के अनुसार, वर्ष ${currentYear} के उत्तरार्ध से शुभ परिणाम मिलने के प्रबल योग बन रहे हैं।`,
      };
    }
    return {
      text: `${name}, considering your ${dasha} sequence and upcoming transits, auspicious momentum begins in the second half of ${currentYear}.`,
    };
  }

  // 4. Career / Job / Promotion
  if (
    text.includes('career') ||
    text.includes('job') ||
    text.includes('promotion') ||
    text.includes('business') ||
    text.includes('work') ||
    text.includes('office') ||
    text.includes('ఉద్యోగ') ||
    text.includes('వ్యాపార') ||
    text.includes('పని') ||
    text.includes('नौकरी') ||
    text.includes('व्यापार') ||
    text.includes('தொழில்') ||
    text.includes('வேலை')
  ) {
    const remedy = extractPrescribedRemedy(userText || '', 'ganapathi career', astroContext);
    if (isTelugu) {
      return {
        text: `${name} గారూ, మీ దశమ స్థానం (కర్మ భావం) లో అనుకూలమైన గ్రహ దృష్టి ఉంది. ఉద్యోగంలో ఆటంకాలు తొలగి ప్రమోషన్ రావడానికి మహా గణపతి హోమం నిర్వహించడం మరియు ఓం గం గణపతయే నమః జపించడం అత్యంత శ్రేయస్కరం.`,
        remedy,
      };
    }
    if (isHindi) {
      return {
        text: `${name} जी, आपकी कुंडली में दशम कर्म भाव मजबूत स्थिति में है। कार्यक्षेत्र में आ रही बाधाओं को दूर करने हेतु महागणपति होम तथा "ॐ गं गणपतये नमः" मंत्र का नित्य 108 बार जाप करें।`,
        remedy,
      };
    }
    return {
      text: `${name}, your 10th house of Profession is favorably positioned. Performing the Maha Ganapathi Homam and chanting "Om Gam Ganapataye Namaha" will clear workplace hurdles and accelerate career growth.`,
      remedy,
    };
  }

  // 5. Wealth, Finance & Debt
  if (
    text.includes('finance') ||
    text.includes('money') ||
    text.includes('wealth') ||
    text.includes('debt') ||
    text.includes('loan') ||
    text.includes('rich') ||
    text.includes('ధన') ||
    text.includes('డబ్బు') ||
    text.includes('అప్పు') ||
    text.includes('ఆర్థిక') ||
    text.includes('पैसा') ||
    text.includes('धन') ||
    text.includes('कर्ज')
  ) {
    const remedy = extractPrescribedRemedy(userText || '', 'lakshmi kubera finance', astroContext);
    if (isTelugu) {
      return {
        text: `${name} గారూ, మీ కుండలిలోని 2వ స్థానం (ధన భావం) మరియు 11వ స్థానం (లాభ భావం) స్థిరత్వాన్ని సూచిస్తున్నాయి. ధన ప్రాప్తి మరియు రుణ విముక్తి కొరకు శుక్రవారం నాడు లక్ష్మీ కుబేర హోమం లేదా కనకధార స్తోత్రం పఠించడం మంచి ఫలితాన్నిస్తుంది.`,
        remedy,
      };
    }
    if (isHindi) {
      return {
        text: `${name} जी, आर्थिक उन्नति और कर्ज से मुक्ति के लिए शुक्रवार के दिन श्री लक्ष्मी कुबेर होम तथा कनकधारा स्तोत्र का पाठ करना सर्वोत्तम फलदायी रहेगा।`,
        remedy,
      };
    }
    return {
      text: `${name}, to accelerate wealth accumulation and relieve financial pressure, performing the sacred Lakshmi Kubera Homam on Fridays brings prosperity.`,
      remedy,
    };
  }

  // 6. Marriage, Love & Relationship
  if (
    text.includes('marriage') ||
    text.includes('love') ||
    text.includes('relationship') ||
    text.includes('wedding') ||
    text.includes('spouse') ||
    text.includes('partner') ||
    text.includes('వివాహ') ||
    text.includes('పెళ్లి') ||
    text.includes('సంబంధం') ||
    text.includes('భార్య') ||
    text.includes('భర్త') ||
    text.includes('शादी') ||
    text.includes('विवाह')
  ) {
    const remedy = extractPrescribedRemedy(userText || '', 'swayamvara parvathi marriage', astroContext);
    if (isTelugu) {
      return {
        text: `${name} గారూ, మీ సప్తమ వివాహ స్థానంలో అనుకూలమైన సంబంధం కుదరడానికి స్వయంవర పార్వతి హోమం నిర్వహించడం మరియు ప్రతిరోజూ స్వయంవర పార్వతి మంత్రం జపించడం వివాహ దోషాలను తొలగిస్తుంది.`,
        remedy,
      };
    }
    if (isHindi) {
      return {
        text: `${name} जी, विवाह में आ रही देरी या वैवाहिक सुख के लिए स्वयंवर पार्वती होम तथा माता पार्वती की नियमित उपासना अत्यंत लाभकारी है।`,
        remedy,
      };
    }
    return {
      text: `${name}, to harmonize marital energies and resolve delays, performing the sacred Swayamvara Parvathi Homam brings peaceful matrimonial alignment.`,
      remedy,
    };
  }

  // 7. Multi-Turn Conversational Fallback
  const remedy = extractPrescribedRemedy(userText || '', text, astroContext);
  if (turnIndex % 2 === 1) {
    if (isTelugu) {
      return {
        text: `${name} గారూ, మీ ${lagna} మరియు చంద్ర రాశి అయిన ${moonRashi} గ్రహాలు స్థిరంగా ఉన్నాయి. మీ మనసులోని సందేహాన్ని స్పష్టంగా అడగండి — పరిహారాలు లేదా కాల నిర్ణయం గురించి ఇంకా ఏమైనా తెలుసుకోవాలనుకుంటున్నారా?`,
        remedy,
      };
    }
    if (isHindi) {
      return {
        text: `${name} जी, आपकी कुंडली में ${lagna} और ${moonRashi} के अनुसार वर्तमान स्थिति अनुकूल है। क्या आप किसी विशेष निर्णय अथवा उपाय के बारे में विस्तार से जानना चाहते हैं?`,
        remedy,
      };
    }
    return {
      text: `${name}, your ${lagna} and Moon sign ${moonRashi} remain favorably supported. Is there a specific decision or timing window you would like further insight on?`,
      remedy,
    };
  }

  if (isTelugu) {
    return {
      text: `${name} గారూ, మీ జాతకంలో నడుస్తున్న ${dasha} మీకు ధైర్యాన్ని మరియు నూతన అవకాశాలను ప్రసాదిస్తుంది. మీ సంకల్పంతో దైవ ప్రార్థన కొనసాగించండి, మీ ప్రశ్నలన్నిటికీ గ్రహాలు సకారాత్మక ఫలితాలను అందిస్తాయి.`,
      remedy,
    };
  }
  if (isHindi) {
    return {
      text: `${name} जी, आपकी कुंडली में वर्तमान ${dasha} शुभ अवसर प्रदान कर रही है। सकारात्मक चिंतन और नियमित ईश्वर आराधना से आपके सभी कार्य सिद्ध होंगे।`,
      remedy,
    };
  }
  return {
    text: `${name}, your Vedic chart reveals strength under your ${lagna} and active ${dasha}. Stay purposeful, and let me know which area you'd like to explore further.`,
    remedy,
  };
}

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

// Split text into natural sentence chunks under maxChunkLength
function splitIntoNaturalChunks(text: string, maxChunkLength = 3500): string[] {
  if (text.length <= maxChunkLength) return [text];

  const sentenceRegex = /[^.!?।॥\n]+[.!?।॥\n]*/g;
  const matches = text.match(sentenceRegex) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of matches) {
    if ((current + ' ' + sentence).trim().length <= maxChunkLength) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current);
      if (sentence.length > maxChunkLength) {
        const words = sentence.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= maxChunkLength) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) chunks.push(sub);
        current = '';
      } else {
        current = sentence.trim();
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

// Universal Multilingual Speech Synthesizer: OpenAI TTS first, with guaranteed Google Translate TTS fallback for ALL astrologers
async function generateMultilingualAudioBase64(
  text: string,
  language: string,
  astrologer: AIAstrologer,
  openaiApiKey?: string | null
): Promise<string | null> {
  const sanitizedText = cleanTextForVedicVoice(text, language);
  const cleanInput = sanitizedText.replace(/[\n\r]+/g, ' ').trim();
  if (!cleanInput) return null;

  const activeKey = cleanApiKey(openaiApiKey);

  // 1. OpenAI TTS Engine (If key configured and active)
  if (activeKey && activeKey.length >= 20) {
    try {
      const ttsVoice = astrologer.voiceId || (astrologer.voiceGender === 'female' ? 'nova' : 'onyx');
      const textChunks = splitIntoNaturalChunks(cleanInput, 3500);
      const audioBuffers: Buffer[] = [];
      let allChunksSucceeded = true;

      for (const chunk of textChunks) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: ttsVoice,
            input: chunk,
            response_format: 'mp3',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (ttsRes.ok) {
          const audioBuffer = await ttsRes.arrayBuffer();
          audioBuffers.push(Buffer.from(audioBuffer));
        } else {
          allChunksSucceeded = false;
          break;
        }
      }

      if (allChunksSucceeded && audioBuffers.length > 0) {
        return Buffer.concat(audioBuffers).toString('base64');
      }
    } catch (e) {
      console.warn('OpenAI TTS error, attempting fallback:', e);
    }
  }

  // 2. Guaranteed Multi-chunk Google Translate TTS Fallback for ALL Astrologers (Male & Female)
  try {
    const lLower = (language || '').toLowerCase();
    let langCode = 'te';
    if (lLower.includes('telugu') || lLower.includes('te') || /[\u0C00-\u0C7F]/.test(cleanInput)) langCode = 'te';
    else if (lLower.includes('tamil') || lLower.includes('ta') || /[\u0B80-\u0BFF]/.test(cleanInput)) langCode = 'ta';
    else if (lLower.includes('hindi') || lLower.includes('hi') || /[\u0900-\u097F]/.test(cleanInput)) langCode = 'hi';
    else if (lLower.includes('kannada') || lLower.includes('kn') || /[\u0C80-\u0CFF]/.test(cleanInput)) langCode = 'kn';
    else if (lLower.includes('malayalam') || lLower.includes('ml') || /[\u0D00-\u0D7F]/.test(cleanInput)) langCode = 'ml';
    else langCode = 'en';

    const chunks = splitIntoNaturalChunks(cleanInput, 180);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;

      const gRes = await fetch(googleTtsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (gRes.ok) {
        const arrayBuffer = await gRes.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuffer));
      }
    }

    if (audioBuffers.length > 0) {
      return Buffer.concat(audioBuffers).toString('base64');
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
    let isInterrupted = false;
    let audioFile: Blob | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      sessionId = formData.get('sessionId') as string;
      userMessage = formData.get('userMessage') as string;
      reqLanguage = formData.get('language') as string;
      isInitial = formData.get('isInitial') === 'true';
      isInterrupted = formData.get('isInterrupted') === 'true';
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
      isInterrupted = body.isInterrupted === true;
    }

    // Conversational Interruption & Barge-in Detection
    const INTERRUPT_PATTERNS = [
      /\bwait\b/i,
      /\bhold on\b/i,
      /\bstop\b/i,
      /\blisten\b/i,
      /\bone second\b/i,
      /\baagandi\b/i,
      /\brukiye\b/i,
      /\broko\b/i,
      /\bnillungal\b/i,
      /ఆగండి/i,
      /వినండి/i,
      /ఒక్క నిమిషం/i,
      /రోకో/i,
      /सुनिए/i,
    ];
    const detectedInterruption =
      isInterrupted ||
      Boolean(userMessage && INTERRUPT_PATTERNS.some((pattern) => pattern.test(userMessage!)));

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // 1. Fetch OpenAI API Key
    const openaiApiKey = await getServerOpenAIApiKey();

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

    // 3. Fetch Consultation Session Context from Firestore & Dynamic Chart Calculation
    let astrologer: AIAstrologer = DEFAULT_AI_ASTROLOGERS[0];
    let birthDetails: any = {
      name: 'Devotee',
      gender: 'Male',
      dob: '',
      time: '12:00 PM',
      place: 'India',
      primaryConcern: 'Career & Life Guidance',
    };
    let astroContext: any = {
      lagna: 'Aries (Mesha)',
      moonRashi: 'Taurus (Vrishabha)',
      nakshatra: 'Rohini',
      sunSign: 'Sun in Mesha',
      currentDasha: 'Jupiter Mahadasha',
      chartSummary: '',
      planetaryPlacements: '',
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
          const found = DEFAULT_AI_ASTROLOGERS.find(
            (a) => a.id === sData.astrologerId || a.name === sData.astrologerName
          );
          if (found) {
            astrologer = found;
          } else if (sData.astrologerName) {
            astrologer = {
              ...DEFAULT_AI_ASTROLOGERS[0],
              name: sData.astrologerName,
              voiceGender: sData.voiceGender || 'male',
              voiceId: sData.voiceId || 'onyx',
            };
          }
        } else if (sData?.astrologerName) {
          const found = DEFAULT_AI_ASTROLOGERS.find((a) => a.name === sData.astrologerName);
          if (found) astrologer = found;
        }

        // Respect session document's voiceGender and voiceId if saved
        if (sData?.voiceGender) astrologer.voiceGender = sData.voiceGender;
        if (sData?.voiceId) astrologer.voiceId = sData.voiceId;
      }
    } catch (e) {
      console.warn('Session Firestore lookup warning:', e);
    }

    let ishtaDevata = astroContext.ishtaDevata || null;
    let canonicalRemedies = astroContext.canonicalRemedies || null;

    // Authentically compute Sidereal Vedic Birth Chart if DOB is present
    if (birthDetails.dob) {
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
          concern: birthDetails.primaryConcern || 'Life Guidance',
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
          planetaryPlacements: Array.isArray(chart.planetaryDegrees)
            ? chart.planetaryDegrees.map((p: any) => `${p.planet}: ${p.rashi} in ${p.house}`).join(', ')
            : '',
          ishtaDevata,
          canonicalRemedies,
        };
      } catch (calcErr) {
        console.warn('Dynamic chart calculation in voice session warning:', calcErr);
      }
    }

    // 4. Query Vedika AI Ephemeris Intelligence (Primary Vedic Ground Truth)
    let replyText = '';
    let vedikaTruth = '';

    try {
      const vDt = birthDetails?.dob
        ? formatToVedikaDateTime(birthDetails.dob, birthDetails.time || '12:00')
        : undefined;

      const vRes = await queryVedikaAI({
        language: sessionLanguage,
        question: isInitial
          ? `Greet the devotee warmly and open the consultation about: ${birthDetails.primaryConcern || 'life guidance'}. Their Lagna is ${astroContext.lagna}, Moon Rashi is ${astroContext.moonRashi}, Nakshatra is ${astroContext.nakshatra}. Provide authoritative Vedic Jyotish guidance in ${sessionLanguage}.`
          : `Devotee ${birthDetails.name || ''} asks: "${userMessage}". (Lagna: ${astroContext.lagna}, Moon: ${astroContext.moonRashi}, Dasha: ${astroContext.currentDasha}). Provide authoritative Vedic Jyotish guidance in ${sessionLanguage}.`,
        birthDetails: vDt
          ? {
              datetime: vDt,
              latitude: Number(birthDetails.lat) || 28.6139,
              longitude: Number(birthDetails.lon) || 77.209,
            }
          : undefined,
        conversationContext: conversationHistory && conversationHistory.length > 0 ? conversationHistory.slice(-4) : undefined,
      });

      if (vRes.success && (vRes.data?.response || vRes.data?.answer)) {
        vedikaTruth = vRes.data.response || vRes.data.answer || '';
      }
    } catch (vErr) {
      console.warn('[Vedika] AI astrologer voice query notice, continuing with local evidence:', vErr);
    }

    // 5. Try OpenAI for Natural Conversational Styling (if credits and key available)
    if (openaiApiKey) {
      try {
        const currentYear = new Date().getFullYear();
        const currentDateStr = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const systemPrompt = `You are ${astrologer.name}, a revered, authentic Vedic Astrologer (${astrologer.primaryDiscipline}) with 25+ years of Vedic wisdom on AstroParihar.
Devotee Profile:
- Name: ${birthDetails.name || 'Devotee'}
- Lagna (Ascendant): ${astroContext.lagna}
- Moon Rashi (Chandra Sign): ${astroContext.moonRashi}
- Nakshatra: ${astroContext.nakshatra}
- Active Vimshottari Dasha: ${astroContext.currentDasha}
- Primary Concern: ${birthDetails.primaryConcern || 'Life Guidance'}
${astroContext.chartSummary ? `\nAstronomical Ground Truth (Verified Sidereal Birth Chart Placements):\n${astroContext.chartSummary}` : ''}
${astroContext.planetaryPlacements ? `\nPlanetary Positions by House:\n${astroContext.planetaryPlacements}` : ''}

Real-Time Calendar Anchor:
- Current Date: ${currentDateStr} (Year: ${currentYear})
- The current year is strictly ${currentYear}. You are living and consulting in ${currentYear}.

Language Instruction:
You MUST speak ONLY in ${sessionLanguage}.
- If Telugu: Speak in pure, respectful spoken Telugu script.
- If Tamil: Speak in pure Tamil script.
- If Hindi: Speak in pure Hindi script.
- If English: Warm, serene, traditional Indian Vedic astrology tone.

Spoken Call Style & Number Rules:
- Keep your answers concise, direct, and conversational (2 to 4 spoken sentences).
- Base your insights strictly on their verified Ascendant (${astroContext.lagna}) and active Dasha (${astroContext.currentDasha}).
- Give immediate Vedic astrological insights, auspicious time windows, and 1 actionable remedy matching AstroParihar canonical guidelines.
- Finish every explanation completely to the end. Never stop mid-sentence.
- Do not use markdown bullet points, stars (*), hyphens (-), or hashes (#). Keep it pure natural speech suitable for voice conversation.
${detectedInterruption ? `\n- Devotee interrupted to ask: "${userMessage}". Answer their redirect immediately without restarting greetings.` : ''}

${ASTROPARIHAR_UNIFIED_REMEDY_DIRECTIVES}`;

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

        if (vedikaTruth) {
          messagesPayload.push({
            role: 'system',
            content: `SUPPLEMENTARY JYOTISH ADVISORY INSIGHT (VEDIKA ENGINE): Ensure alignment with this astronomical ground truth:\n\n"${vedikaTruth}"`,
          });
        }

        let chatRes = await fetchWithOpenAIFallback(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: messagesPayload,
              temperature: 0.7,
              max_tokens: 600,
            }),
          },
          openaiApiKey
        );

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          replyText = chatData.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (aiErr) {
        console.warn('OpenAI completion warning:', aiErr);
      }
    }

    // 6. Intelligent Fallback: Use live Vedika AI response if OpenAI was unavailable
    if (!replyText && vedikaTruth) {
      replyText = formatVedikaForVoice(vedikaTruth, sessionLanguage, astrologer.name);
    }

    // 7. Dynamic Native Vedic Engine (if both OpenAI and Vedika network calls were unavailable)
    let dynamicRemedy: PrescribedRemedyInfo | undefined;
    if (!replyText) {
      const dynamicResult = generateDynamicVedicReply(
        userMessage,
        isInitial,
        birthDetails,
        astroContext,
        astrologer,
        sessionLanguage,
        conversationHistory
      );
      replyText = dynamicResult.text;
      dynamicRemedy = dynamicResult.remedy;
    }

    // 8. Extract & Persist the Active Remedy for this Consultation Session
    const activePrescribedRemedy = dynamicRemedy || extractPrescribedRemedy(userMessage || '', replyText, astroContext);

    if (activePrescribedRemedy && sessionId) {
      try {
        await adminDb.collection('ai_consultations').doc(sessionId).set(
          {
            prescribedRemedies: FieldValue.arrayUnion(activePrescribedRemedy),
            lastPrescribedRemedy: activePrescribedRemedy,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (saveErr) {
        console.warn('Could not persist prescribed remedy to Firestore:', saveErr);
      }
    }

    // 9. Generate Guaranteed Voice Speech Audio (OpenAI TTS -> Google TTS Fallback for ALL Astrologers)
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
      voiceGender: astrologer.voiceGender || 'male',
      language: sessionLanguage,
      prescribedRemedy: activePrescribedRemedy,
      interrupted: Boolean(detectedInterruption),
      conversationTurnState: {
        lastTurn: 'assistant',
        timestamp: new Date().toISOString(),
        acknowledgedInterruption: Boolean(detectedInterruption),
      },
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
  const activeKey = await getServerOpenAIApiKey();
  return NextResponse.json({
    version: 'live-v5-robust',
    hasOpenAiKey: Boolean(activeKey && activeKey.length >= 20),
    status: 'online',
  });
}
