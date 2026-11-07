import { NextRequest, NextResponse } from 'next/server';
import { getServerOpenAIApiKey, getServerVedikaApiKey, fetchWithOpenAIFallback } from '@/lib/aiConfig';
import { queryVedikaAI, formatToVedikaDateTime } from '@/lib/vedikaClient';
import {
  calculateBirthChartData,
  formatChartSummaryForAI,
  analyzeInquiryEvidence,
} from '@/lib/vedicAstrologyEngine';
import {
  generate48DayRemedyProtocol,
} from '@/lib/vedicRemediesEngine';
import { DEFAULT_AI_ASTROLOGERS } from '@/lib/aiAstrologerData';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const QUICK_PROMPTS_BY_LANG: Record<string, string[]> = {
  Telugu: [
    '🔮 2026లో నా గ్రహ సంచారాల ఫలితాలు ఎలా ఉన్నాయి?',
    '❤️ నా జాతకంలో వివాహ యోగం ఎప్పుడు ఉంది?',
    '💼 కెరీర్ మార్పు లేదా ప్రమోషన్‌కు సరైన సమయం ఎప్పుడు?',
    '✨ నా అదృష్ట రత్నం, రుద్రాక్ష మరియు నిత్య మంత్రం ఏమిటి?',
    '🪐 నాకు శని సాడే సాతి లేదా రాహు మహర్దశ నడుస్తుందా?',
    '🙏 నా జాతక దోష నివారణకు ఎలాంటి పరిహారాలు లేదా దానం చేయాలి?',
  ],
  Hindi: [
    '🔮 2026 में मेरे मुख्य ग्रह गोचर का क्या प्रभाव रहेगा?',
    '❤️ मेरे विवाह का शुभ योग कब बनेगा?',
    '💼 करियर में पदोन्नति या व्यापार विस्तार का सबसे शुभ समय कब है?',
    '✨ मेरे लिए भाग्यशाली रत्न, रुद्राक्ष और दैनिक मंत्र क्या है?',
    '🪐 क्या मुझ पर शनि की साढ़ेसाती या राहु की महादशा चल रही है?',
    '🙏 ग्रह शांति के लिए मुझे कौन सा विशेष दान या उपाय करना चाहिए?',
  ],
  Tamil: [
    '🔮 2026-ல் எனது கிரக பெயர்ச்சி பலன்கள் எப்படி உள்ளன?',
    '❤️ எனது திருமண யோகம் மற்றும் வாழ்க்கை எப்போது அமையும்?',
    '💼 தொழில் வளர்ச்சி அல்லது வேலை மாற்றத்திற்கு உகந்த நேரம் எப்போது?',
    '✨ எனது அதிர்ஷ்ட ரத்தினம், ருத்ராட்சம் மற்றும் தினசரி மந்திரம் எது?',
    '🪐 எனக்கு ஏழரை சனி அல்லது ராகு தசை நடக்கிறதா?',
    '🙏 கிரக தோஷ நிவர்த்திக்கு என்ன பரிகாரம் அல்லது தானம் செய்ய வேண்டும்?',
  ],
  Kannada: [
    '🔮 2026ರಲ್ಲಿ ನನ್ನ ಗ್ರಹ ಸಂಚಾರದ ಫಲಗಳು ಹೇಗಿವೆ?',
    '❤️ ನನ್ನ ವಿವಾಹ ಯೋಗ ಮತ್ತು ಹೊಂದಾಣಿಕೆ ಯಾವಾಗ ಬರುತ್ತದೆ?',
    '💼 ವೃತ್ತಿ ಬೆಳವಣಿಗೆ ಅಥವಾ ಉದ್ಯೋಗ ಬದಲಾವಣೆಗೆ ಶುಭ ಸಮಯ ಯಾವುದು?',
    '✨ ನನ್ನ ಅದೃಷ್ಟ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ ಮತ್ತು ನಿತ್ಯ ಮಂತ್ರ ಯಾವುದು?',
    '🪐 ನನಗೆ ಸಾಡೇ ಸಾತಿ ಅಥವಾ ರಾಹು ಮಹಾದಶ ನಡೆಯುತ್ತಿದೆಯೇ?',
    '🙏 ಗ್ರಹ ಶಾಂತಿ ಮತ್ತು ದೋಷ ನಿವಾರಣೆಗೆ ಯಾವ ಪರಿಹಾರ ಮಾಡಬೇಕು?',
  ],
  Malayalam: [
    '🔮 2026-ൽ എന്റെ ഗ്രഹ സഞ്ചാര ഫലങ്ങൾ എങ്ങനെയാണ്?',
    '❤️ എന്റെ ജാതകത്തിൽ വിവാഹ യോഗം എപ്പോഴാണ്?',
    '💼 കരിയർ മാറ്റത്തിനോ പ്രമോഷനോ അനുയോജ്യമായ സമയം എപ്പോഴാണ്?',
    '✨ എന്റെ ഭാഗ്യ രത്നം, രുദ്രാക്ഷം, നിത്യ മന്ത്രം എന്നിവ ഏതാണ്?',
    '🪐 എനിക്ക് ഇപ്പോൾ ഏഴര ശനിയോ രാഹു മഹാദശയോ നടക്കുന്നുണ്ടോ?',
    '🙏 ഗ്രഹ ദോഷ പരിഹാരത്തിനായി എന്തെല്ലാം പൂജകളും ദാനവുമാണ് ചെയ്യേണ്ടത്?',
  ],
  English: [
    '🔮 What do planetary transits say for me in 2026?',
    '❤️ When will I meet my compatible life partner?',
    '💼 When is the best time for a career change or promotion?',
    '✨ What is my lucky gemstone, rudraksha & daily mantra?',
    '🪐 Am I currently running Shani Sade Sati or Rahu Mahadasha?',
    '🙏 What specific Vedic remedies or charity should I perform?',
  ],
};

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    availableModels: [
      { id: 'vedika-ai', name: 'Vedika AI Engine', badge: 'Vedic Ephemeris & Kundli Specialist', recommended: true },
      { id: 'openai-gpt4o', name: 'OpenAI GPT-4o', badge: 'High-Precision Astrological Reasoning' },
    ],
    languages: [
      { code: 'Telugu', label: 'తెలుగు (Telugu)', short: 'తె' },
      { code: 'Hindi', label: 'हिन्दी (Hindi)', short: 'हि' },
      { code: 'Tamil', label: 'தமிழ் (Tamil)', short: 'த' },
      { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)', short: 'ಕ' },
      { code: 'Malayalam', label: 'മലയാളം (Malayalam)', short: 'മ' },
      { code: 'English', label: 'English', short: 'Eng' },
    ],
    quickPrompts: QUICK_PROMPTS_BY_LANG,
  }, { headers: corsHeaders });
}

function stripTrailingAstrologerQuestions(text: string, language?: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  const normLang =
    /telugu|^te$/i.test(language || '') ? 'Telugu' :
    /hindi|^hi$/i.test(language || '') ? 'Hindi' :
    /tamil|^ta$/i.test(language || '') ? 'Tamil' :
    /kannada|^kn$/i.test(language || '') ? 'Kannada' :
    /malayalam|^ml$/i.test(language || '') ? 'Malayalam' : 'English';

  const isQuestionSentence = (s: string) => {
    const t = s.trim();
    if (!t) return false;
    if (/[?？]/.test(t)) return true;
    return /తెలుసుకోవాలనుకుంటున్నారా|అనుభవిస్తున్నారా|కలిగి ఉన్నారా|వివరించగలరా|ఉన్నారా\?|जानना चाहते हैं|अनुभव कर रहे हैं|बता सकते हैं|Would you like to|Do you want to|Are you experiencing|Can you tell me/i.test(t);
  };

  // Repeatedly strip trailing question lines / sentences
  let changed = true;
  while (changed && cleaned.length > 0) {
    changed = false;
    const lines = cleaned.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    if (isQuestionSentence(lastLine)) {
      lines.pop();
      cleaned = lines.join('\n').trim();
      changed = true;
      continue;
    }

    const sentenceDelim = /([.!?।॥])/;
    const parts = lastLine.split(sentenceDelim);
    if (parts.length > 2) {
      const sentences: string[] = [];
      for (let i = 0; i < parts.length - 1; i += 2) {
        sentences.push((parts[i] + parts[i + 1]).trim());
      }
      if (parts[parts.length - 1].trim()) {
        sentences.push(parts[parts.length - 1].trim());
      }
      const lastSent = sentences[sentences.length - 1];
      if (isQuestionSentence(lastSent)) {
        sentences.pop();
        lines[lines.length - 1] = sentences.join(' ').trim();
        cleaned = lines.filter((l) => l.trim().length > 0).join('\n\n').trim();
        changed = true;
      }
    }
  }

  // Remove any lingering question marks and their clauses at the end
  cleaned = cleaned.replace(/[—–-]\s*[^\n.!?]*[?？]\s*$/g, '').trim();
  cleaned = cleaned.replace(/[?？]\s*$/g, '.').trim();

  // If text became empty or was only questions to begin with, provide auspicious response
  if (!cleaned || cleaned.length < 20) {
    if (normLang === 'Telugu') {
      cleaned = 'మీ జన్మ కుండలి ప్రకారం గ్రహాల స్థితులు పరిశీలించబడ్డాయి. ప్రస్తుత గోచారంలో బృహస్పతి అనుకూలంగా ఉండటంతో కార్యసిద్ధి, మనశ్శాంతి లభిస్తాయి. నిత్యం ఇష్టదేవతా ప్రార్థన మరియు వేద పరిహారాల ఆచరణ శ్రేయస్కరం.';
    } else if (normLang === 'Hindi') {
      cleaned = 'आपकी जन्म पत्रिका के अनुसार ग्रह स्थितियां अनुकूल हैं। देवगुरु बृहस्पति की शुभ दृष्टि से आपके कार्यों में प्रगति और मानसिक शांति प्राप्त होगी। नित्य इष्टदेव की उपासना एवं वैदिक उपाय कल्याणकारी सिद्ध होंगे।';
    } else {
      cleaned = 'Based on your Vedic birth chart, planetary transits are aligning favorably. Consecrated remedial rituals and regular spiritual practices will illuminate your highest pathway with peace and prosperity.';
    }
  }

  const BLESSINGS: Record<string, string> = {
    Telugu: 'సర్వే జనాః సుఖినో భవంతు. శుభం భూయాత్! 🙏',
    Hindi: 'सर्वे भवन्तु सुखिनः। शुभं भवतु! 🙏',
    Tamil: 'ஓம் சாந்தி. சுப மங்களம் உண்டாகட்டும்! 🙏',
    Kannada: 'ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು. ಶುಭವಾಗಲಿ! 🙏',
    Malayalam: 'സർവ്വേ ഭവന്തു സുഖിനഃ. ശുഭം ഭവിക്കട്ടെ! 🙏',
    English: 'May cosmic grace illuminate your path with peace and prosperity. Om Tat Sat! 🙏',
  };

  const blessing = BLESSINGS[normLang] || BLESSINGS.English;
  if (!cleaned.includes('🙏') && !cleaned.includes('శుభం') && !cleaned.includes('शुभं') && !cleaned.includes('Blessings')) {
    cleaned += `\n\n${blessing}`;
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      language = 'English',
      astrologerId = 'acharya-devavrat',
      modelPreference = 'auto',
      userInfo = null,
    } = body;

    const latestUserMessage = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';

    // 1. Resolve Astrologer Persona
    const matchedAstrologer = DEFAULT_AI_ASTROLOGERS.find((a: any) => a.id === astrologerId) || {
      name: 'Acharya Devavrat',
      specialty: 'Vedic Jyotish & Dasha Guru',
      discipline: 'Vedic Jyotish',
    };

    // 2. Resolve Birth Chart
    const birthInfo = {
      name: userInfo?.name || 'Devotee',
      gender: userInfo?.gender || 'Male',
      dob: userInfo?.dob || '1995-10-15',
      tob: userInfo?.tob || '12:00 PM',
      pob: userInfo?.pob || 'New Delhi, India',
      lat: userInfo?.lat || '28.6139',
      lon: userInfo?.lon || '77.2090',
    };

    let chart: any = null;
    let evidence: any = null;
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
      if (chart) {
        evidence = analyzeInquiryEvidence(chart, latestUserMessage);
      }
    } catch (err) {
      console.warn('Error computing birth chart in ai-chat route:', err);
    }

    // 3. 48-Day Remedy Protocol
    let pariharProtocol: any = null;
    try {
      pariharProtocol = generate48DayRemedyProtocol({
        domain: evidence?.domain || 'career',
        planet: evidence?.primaryAfflictedPlanet || 'Jupiter',
        concern: latestUserMessage,
        language,
      });
    } catch {}

    // 4. Try live Vedika AI or OpenAI if keys are present
    const vedikaKey = await getServerVedikaApiKey();
    const openaiKey = await getServerOpenAIApiKey();

    let modelUsed = 'AstroParihar Vedic Engine';
    let replyText = '';

    // Check if user explicitly chose or keys allow live AI
    const useVedika = (modelPreference === 'vedika-ai' || modelPreference === 'auto') && vedikaKey;
    const useOpenAI = (modelPreference === 'openai-gpt4o' || (!useVedika && openaiKey));

    if (useVedika) {
      try {
        const vDt = birthInfo?.dob ? formatToVedikaDateTime(birthInfo.dob, birthInfo.tob || '12:00') : undefined;
        const vedikaRes: any = await queryVedikaAI({
          question: `You are ${matchedAstrologer.name}, a revered Vedic Astrologer on AstroParihar. Devotee: ${birthInfo.name}, DOB: ${birthInfo.dob}. Lagna: ${chart?.ascendant || 'Aries'}. Moon Sign: ${chart?.moonSign || 'Vedic'}. Question: "${latestUserMessage}". Respond purely in ${language}.
CRITICAL INSTRUCTION: Provide authoritative astrological insights and remedies (Parihar). NEVER ask questions back to the devotee at the end of your response. DO NOT ask conversational return questions like 'Would you like to know...', 'Can you tell me...', or 'Are you experiencing...'. Always conclude gracefully with complete astrological guidance and auspicious Vedic blessings.`,
          language,
          birthDetails: vDt ? {
            datetime: vDt,
            latitude: Number(birthInfo?.lat) || 28.6139,
            longitude: Number(birthInfo?.lon) || 77.209,
          } : undefined,
        });
        if (vedikaRes?.data?.response || vedikaRes?.data?.answer || vedikaRes?.data?.text) {
          const rawReply = (vedikaRes.data.response || vedikaRes.data.answer || vedikaRes.data.text || '')
            .replace(/(\r\n|\n)+[—–-]\s*Vedika\s*$/i, '')
            .trim();
          replyText = rawReply;
          modelUsed = 'Vedika AI Engine (Live)';
        }
      } catch {}
    }

    if (!replyText && useOpenAI) {
      try {
        const sysPrompt = `You are ${matchedAstrologer.name}, an authentic Vedic Astrologer on AstroParihar. Devotee: ${birthInfo.name}. Answer purely in ${language}.
CRITICAL INSTRUCTION: Provide authoritative astrological insights and remedies (Parihar). NEVER ask questions back to the devotee at the end of your response. DO NOT ask conversational return questions like 'Would you like to know...', 'Are you experiencing...', or any follow-up questions. Always conclude gracefully with complete astrological remedies and Vedic blessings.`;
        const openAIRes = await fetchWithOpenAIFallback(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: sysPrompt },
                ...messages.slice(-4),
              ],
              temperature: 0.5,
              max_tokens: 650,
            }),
          }
        );
        if (openAIRes && openAIRes.ok) {
          const json = await openAIRes.json();
          replyText = json.choices?.[0]?.message?.content || '';
          modelUsed = 'OpenAI GPT-4o (Live)';
        }
      } catch {}
    }

    // 5. Authentic Deterministic Fallback if live APIs are silent
    if (!replyText) {
      const lagna = chart?.ascendant || 'Scorpio';
      const moonRashi = chart?.moonSign || 'Cancer';
      const dasha = chart?.dasha?.currentMahadasha || 'Jupiter';
      const antardasha = chart?.dasha?.currentAntardasha || 'Saturn';

      if (language === 'Telugu') {
        replyText = `**నమస్కారం మరియు దివ్య శుభాశీస్సులు!** 🙏\n\nమీ జన్మ కుండలి ప్రకారం, మీ లగ్నం **${lagna}** మరియు రాశి **${moonRashi}**. ప్రస్తుతం మీ జాతకంలో **${dasha} మహాదశ - ${antardasha} అంతర్దశ** నడుస్తోంది.\n\n✦ **గ్రహ సంచార ప్రభావం**: గోచారంలో బృహస్పతి మీ కేంద్ర స్థానాలపై దృష్టి సారించి, సమస్యల నుండి విముక్తి మరియు వృద్ధిని ప్రసాదిస్తున్నారు.\n✦ **కాల నిర్ణయం**: రాబోయే 3 నుండి 6 నెలల కాలం మీ ప్రయత్నాలకు అనుకూలంగా ఉంది.\n✦ **నిత్య పరిహారం**: గురువారం రోజున దక్షిణామూర్తి లేదా లక్ష్మీ నారాయణ ఆరాధన చేయండి. "ఓం నమో భగవతే వాసుదేవాయ" జపం శుభాన్ని కలిగిస్తుంది.`;
      } else if (language === 'Hindi') {
        replyText = `**नमस्ते एवं दिव्य आशीर्वाद!** 🙏\n\nआपकी जन्म कुंडली के अनुसार, आपका लग्न **${lagna}** तथा चंद्र राशि **${moonRashi}** है। वर्तमान में आपकी पत्रिका में **${dasha} महादशा - ${antardasha} अंतर्दशा** का शुभ प्रभाव सक्रिय है।\n\n✦ **ग्रह गोचर का प्रभाव**: देवगुरु बृहस्पति आपके कर्म व भाग्य भाव पर अपनी शुभ दृष्टि बनाए हुए हैं, जिससे रुके हुए कार्यों में गति आएगी।\n✦ **शुभ कालखंड**: आगामी 3 से 6 महीने आपके महत्वपूर्ण निर्णयों व सफलता के लिए अत्यंत अनुकूल हैं।\n✦ **शास्त्रोक्त उपाय**: नित्य सूर्य को तांबे के पात्र से अर्घ्य दें एवं गुरुवार को "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः" का 108 बार जाप करें।`;
      } else if (language === 'Tamil') {
        replyText = `**வணக்கம் மற்றும் ஆசிகள்!** 🙏\n\nஉங்கள் ஜாதக கணிப்பின்படி, உங்கள் லக்னம் **${lagna}** மற்றும் சந்திர ராசி **${moonRashi}**. தற்பொழுது உங்களுக்கு **${dasha} மகாதிசை - ${antardasha} புத்தி** நடைபெறுகிறது.\n\n✦ **கிரக சஞ்சார பலன்**: குரு பகவானின் பார்வை உங்கள் ராசிக்கு சுப பலன்களை தந்து காரிய தடைகளை நீக்குகிறது.\n✦ **சுப காலம்**: அடுத்த 3 முதல் 6 மாதங்களில் நல்ல முன்னேற்றம் ஏற்படும்.\n✦ **பரிகாரம்**: வியாழக்கிழமைகளில் தட்சிணாமூர்த்தி வழிபாடு செய்து நவதானிய தானம் செய்வது மிகுந்த நன்மையை தரும்.`;
      } else if (language === 'Kannada') {
        replyText = `**ನಮಸ್ಕಾರ ಮತ್ತು ಶುಭಾಶೀರ್ವಾದಗಳು!** 🙏\n\nನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಪ್ರಕಾರ, ನಿಮ್ಮ ಲಗ್ನ **${lagna}** ಮತ್ತು ಚಂದ್ರ ರಾಶಿ **${moonRashi}**. ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಪತ್ರಿಕೆಯಲ್ಲಿ **${dasha} ಮಹಾದಶೆ - ${antardasha} ಅಂತರ್ದಶೆ** ನಡೆಯುತ್ತಿದೆ.\n\n✦ **ಗ್ರಹ ಸಂಚಾರ ಪ್ರಭಾವ**: ಗುರು ಗ್ರಹದ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ತಕ್ಕ ಫಲ ಮತ್ತು ಮಾನಸಿಕ ಶಾಂತಿ ಲಭಿಸಲಿದೆ.\n✦ **ಶುಭ ಕಾಲ**: ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳು ಹೊಸ ಆರಂಭಗಳಿಗೆ ಸೂಕ್ತವಾಗಿದೆ.\n✦ **ನಿತ್ಯ ಪರಿಹಾರ**: ಗುರುವಾರ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ ಮತ್ತು ಹಳದಿ ಬಣ್ಣದ ಹೂವುಗಳಿಂದ ಪೂಜೆ ಮಾಡುವುದು ಶ್ರೇಯಸ್ಕರ.`;
      } else if (language === 'Malayalam') {
        replyText = `**നമസ്കാരം ദൈവാനുഗ്രഹവും!** 🙏\n\nനിങ്ങളുടെ ജാതക പ്രകാരം, ലഗ്നം **${lagna}** ചന്ദ്ര രാശി **${moonRashi}** എന്നിവയാണ്. ഇപ്പോൾ **${dasha} മഹാദശയും - ${antardasha} അപഹാരവുമാണ്** നടക്കുന്നത്.\n\n✦ **ഗ്രഹ സഞ്ചാര ഫലം**: വ്യാഴത്തിന്റെ ശുഭദൃഷ്ടി തടസ്സങ്ങൾ നീക്കി ജീവിതത്തിൽ പുരോഗതി കൊണ്ടുവരും.\n✦ **ശുഭ സമയം**: അടുത്ത 3 മുതൽ 6 മാസം വരെ പ്രധാന തീരുമാനങ്ങൾക്ക് അനുയോജ്യമാണ്.\n✦ **നിത്യ പരിഹാരം**: വ്യാഴാഴ്ചകളിൽ വിഷ്ണു ക്ഷേത്ര ദർശനവും "ഓം നമോ നാരായണായ" ജപവും ശ്രേയസ്സ് നൽകും.`;
      } else {
        replyText = `**Namaste and Divine Blessings!** 🙏\n\nBased on your authentic Vedic birth chart, your Lagna (Ascendant) is **${lagna}** and your Moon Rashi is **${moonRashi}**. You are currently traversing the transformative **${dasha} Mahadasha – ${antardasha} Antardasha** cycle.\n\n✦ **Cosmic Transit Alignment**: Jupiter is casting an auspicious aspect over your key quadrant houses, dissipating longstanding stagnation and clarifying your highest pathway.\n✦ **Timing Window**: The cosmic currents align strongly over the upcoming 3 to 6 months for pivotal milestones.\n✦ **Sacred Pariharam**: Light a pure cow-ghee deepam on Thursdays and chant the Gayatri or Guru Mantra 108 times at sunrise for mental fortitude and divine grace.`;
      }
    }

    const recs = QUICK_PROMPTS_BY_LANG[language] || QUICK_PROMPTS_BY_LANG.English;

    const dashaLord = chart?.dasha?.currentMahadasha || 'Jupiter';
    const antarLord = chart?.dasha?.currentAntardasha || 'Mercury';

    const TIMING_BY_LANG: Record<string, string> = {
      Telugu: 'రాబోయే 3 నుండి 6 నెలలు (శుభ గోచార సమయం)',
      Hindi: 'आगामी 3 से 6 महीने (शुभ गोचर कालखंड)',
      Tamil: 'அடுத்த 3 முதல் 6 மாதங்கள் (சுப பெயர்ச்சி காலம்)',
      Kannada: 'ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳು (ಶುಭ ಸಂಚಾರ ಕಾಲ)',
      Malayalam: 'അടുത്ത 3 മുതൽ 6 മാസം വരെ (ശുഭ ഗ്രഹ സഞ്ചാര സമയം)',
      English: 'Next 3 to 6 Months (Auspicious Transit Window)',
    };

    const WHY_EVIDENCE_BY_LANG: Record<string, string[]> = {
      Telugu: [
        'లగ్నం మరియు చంద్ర రాశి సమతుల్యత మానసిక స్థిరత్వాన్ని మరియు స్పష్టతను ఇస్తుంది.',
        'మహాదశాధిపతి మీ ప్రధాన లక్ష్యాలు మరియు కార్యసిద్ధికి అనుకూలంగా ఉన్నారు.',
        'వేద పరిహారాల ఆచరణ ఆటంకాలను వేగంగా తొలగిస్తుంది.',
      ],
      Hindi: [
        'लग्न और चंद्र राशि का संतुलन मानसिक शांति और स्पष्टता प्रदान करता है।',
        'महादशाधिपति मुख्य कार्यों और उन्नति के अनुकूल संरेखित हैं।',
        'शास्त्रोक्त वैदिक उपायों का अनुष्ठान बाधाओं का शीघ्र निवारण करता है।',
      ],
      Tamil: [
        'லக்னம் மற்றும் சந்திர ராசியின் சமநிலை மன அமைதியைத் தருகிறது.',
        'மகாதிசாதிபதி முக்கிய முயற்சிகளுக்கு சாதகமாக உள்ளார்.',
        'பரிகாரங்களின் சக்தி தடைகளை விரைவாக நீக்குகிறது.',
      ],
      Kannada: [
        'ಲಗ್ನ ಮತ್ತು ಚಂದ್ರ ರಾಶಿಯ ಸಮತೋಲನವು ಮಾನಸಿಕ ಸ್ಥಿರತೆಯನ್ನು ನೀಡುತ್ತದೆ.',
        'ಮಹಾದಶಾಧಿಪತಿಯು ಮುಖ್ಯ ಕಾರ್ಯಸಾಧನೆಗೆ ಪೂರಕವಾಗಿದ್ದಾರೆ.',
        'ಪರಿಹಾರಗಳ ಆಚರಣೆಯು ಅಡೆತಡೆಗಳನ್ನು ಶೀಘ್ರವಾಗಿ ನಿವಾರಿಸುತ್ತದೆ.',
      ],
      Malayalam: [
        'ലഗ്നത്തിന്റെയും ചന്ദ്ര രാശിയുടെയും സന്തുലിതാവസ്ഥ മാനസിക സ്ഥിരത നൽകുന്നു.',
        'മഹാദശാധിപൻ നിങ്ങളുടെ പ്രധാന ലക്ഷ്യങ്ങൾക്ക് അനുകൂലമായി നിലകൊള്ളുന്നു.',
        'പരിഹാര ക്രിയകൾ തടസ്സങ്ങളെ വേഗത്തിൽ ഇല്ലാതാക്കുന്നു.',
      ],
      English: [
        'Lagna and Moon sign equilibrium provides emotional stability.',
        'Mahadasha lord aligns with core enterprise.',
        'Remedial resonance accelerates obstacle dissolution.',
      ],
    };

    const DASHA_NAMES_BY_LANG: Record<string, { maha: string; antar: string; planets: Record<string, string> }> = {
      Telugu: {
        maha: 'మహాదశ',
        antar: 'అంతర్దశ',
        planets: { Jupiter: 'గురు', Mercury: 'బుధ', Saturn: 'శని', Venus: 'శుక్ర', Mars: 'కుజ', Sun: 'సూర్య', Moon: 'చంద్ర', Rahu: 'రాహు', Ketu: 'కేతు' },
      },
      Hindi: {
        maha: 'महादशा',
        antar: 'अंतर्दशा',
        planets: { Jupiter: 'गुरु', Mercury: 'बुध', Saturn: 'शनि', Venus: 'शुक्र', Mars: 'मंगल', Sun: 'सूर्य', Moon: 'चंद्र', Rahu: 'राहु', Ketu: 'केतु' },
      },
      Tamil: {
        maha: 'மகாதிசை',
        antar: 'புத்தி',
        planets: { Jupiter: 'குரு', Mercury: 'புதன்', Saturn: 'சனி', Venus: 'சுக்கிரன்', Mars: 'செவ்வாய்', Sun: 'சூரியன்', Moon: 'சந்திரன்', Rahu: 'ராகு', Ketu: 'கேது' },
      },
      Kannada: {
        maha: 'ಮಹಾದಶೆ',
        antar: 'ಅಂತರ್ದಶೆ',
        planets: { Jupiter: 'ಗುರು', Mercury: 'ಬುಧ', Saturn: 'ಶನಿ', Venus: 'ಶುಕ್ರ', Mars: 'ಮಂಗಳ', Sun: 'ಸೂರ್ಯ', Moon: 'ಚಂದ್ರ', Rahu: 'ರಾಹು', Ketu: 'ಕೇತು' },
      },
      Malayalam: {
        maha: 'മഹാദശ',
        antar: 'അപഹാരം',
        planets: { Jupiter: 'വ്യാഴ', Mercury: 'ബുധ', Saturn: 'ശനി', Venus: 'ശുക്ര', Mars: 'ചൊവ്വ', Sun: 'സൂര്യ', Moon: 'ചന്ദ്ര', Rahu: 'രാഹു', Ketu: 'കേതു' },
      },
      English: {
        maha: 'Mahadasha',
        antar: 'Antardasha',
        planets: { Jupiter: 'Jupiter', Mercury: 'Mercury', Saturn: 'Saturn', Venus: 'Venus', Mars: 'Mars', Sun: 'Sun', Moon: 'Moon', Rahu: 'Rahu', Ketu: 'Ketu' },
      },
    };

    const dLang = DASHA_NAMES_BY_LANG[language] || DASHA_NAMES_BY_LANG.English;
    const localizedMahaPlanet = dLang.planets[dashaLord] || dashaLord;
    const localizedAntarPlanet = dLang.planets[antarLord] || antarLord;
    const activeDashaStr = `${localizedMahaPlanet} ${dLang.maha} / ${localizedAntarPlanet} ${dLang.antar}`;

    const structured = {
      conclusion: language === 'Telugu'
        ? `మీ కుండలిలో ${chart?.ascendant || 'లగ్నం'} బలం అనుకూలంగా ఉంది. కాలపరిమితి లోపల సత్ఫలితాలు అందుతాయి.`
        : language === 'Hindi'
        ? `आपकी कुंडली में ${chart?.ascendant || 'लग्न'} एवं दशेश की स्थिति शुभ परिणाम देने के लिए तत्पर है।`
        : language === 'Tamil'
        ? `உங்கள் ஜாதகத்தில் ${chart?.ascendant || 'லக்னம்'} மற்றும் தசாநாதர் சுப பலன்களை அளிக்க சாதகமாக உள்ளனர்.`
        : language === 'Kannada'
        ? `ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ${chart?.ascendant || 'ಲಗ್ನ'} ಬಲ ಮತ್ತು ದಶಾನಾಥರು ಸತ್ಫಲಗಳನ್ನು ನೀಡಲು ಅನುಕೂಲಕರವಾಗಿದ್ದಾರೆ.`
        : language === 'Malayalam'
        ? `നിങ്ങളുടെ ജാതകത്തിൽ ${chart?.ascendant || 'ലഗ്നം'} ദശാധിപനും അനുകൂലമായ ഫലങ്ങൾ നൽകാൻ പ്രാപ്തമാണ്.`
        : `Planetary positions and active ${dashaLord} Mahadasha support timely fulfillment with consecrated remedial practices.`,
      timingWindow: TIMING_BY_LANG[language] || TIMING_BY_LANG.English,
      diagnosis: {
        activeDasha: activeDashaStr,
        keyHouses: language === 'Telugu' ? '1, 5, 9 మరియు 10వ స్థానాలు' : language === 'Hindi' ? '1, 5, 9 एवं 10वां भाव' : 'Houses 1, 5, 9 & 10',
        supportingFactors: [
          `Lagna Lord (${chart?.ascendantLord || 'Benefic'}) in favorable quadrant`,
          `Benefic transit of Jupiter amplifying auspicious results`,
        ],
      },
      whyAstroPariharSaysThis: WHY_EVIDENCE_BY_LANG[language] || WHY_EVIDENCE_BY_LANG.English,
      confidence: 'Strong',
      pariharProtocol,
    };

    replyText = stripTrailingAstrologerQuestions(replyText, language);

    return NextResponse.json({
      success: true,
      reply: replyText,
      conclusion: structured.conclusion,
      timingWindow: structured.timingWindow,
      structured,
      recommendations: recs.slice(0, 6),
      modelUsed,
      language,
      astrologer: matchedAstrologer,
    }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('Error in unified ai-chat route:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal AI service error',
    }, { status: 500, headers: corsHeaders });
  }
}
