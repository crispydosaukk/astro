export type VoiceGender = 'male' | 'female';

export interface VoicePreset {
  id: string;
  label: string;
  description: string;
  gender: VoiceGender;
  openaiVoice: string;
  openaiHdFallback: string;
  englishNeuralVoice: string;
  rate?: string;
  pitch?: string;
}

export const CHATGPT_MALE_VOICES: VoicePreset[] = [
  {
    id: 'ash',
    label: 'Ash · Smooth Warm Male',
    description: 'ChatGPT-style smooth, calm & professional male voice',
    gender: 'male',
    openaiVoice: 'ash',
    openaiHdFallback: 'onyx',
    englishNeuralVoice: 'en-US-AndrewMultilingualNeural',
    rate: '-2%',
    pitch: '+0Hz',
  },
  {
    id: 'onyx',
    label: 'Onyx · Deep Calm Male',
    description: 'Rich, resonant & composed baritone male voice',
    gender: 'male',
    openaiVoice: 'onyx',
    openaiHdFallback: 'onyx',
    englishNeuralVoice: 'en-US-BrianMultilingualNeural',
    rate: '-3%',
    pitch: '-2Hz',
  },
  {
    id: 'echo',
    label: 'Echo · Clear Professional Male',
    description: 'Crisp Indian-accented polished male voice',
    gender: 'male',
    openaiVoice: 'echo',
    openaiHdFallback: 'echo',
    englishNeuralVoice: 'en-IN-PrabhatNeural',
    rate: '-2%',
    pitch: '+0Hz',
  },
  {
    id: 'fable',
    label: 'Fable · Expressive Warm Male',
    description: 'Gentle, articulate storytelling male voice',
    gender: 'male',
    openaiVoice: 'fable',
    openaiHdFallback: 'fable',
    englishNeuralVoice: 'en-GB-RyanNeural',
    rate: '-2%',
    pitch: '+0Hz',
  },
];

export const CHATGPT_FEMALE_VOICES: VoicePreset[] = [
  {
    id: 'coral',
    label: 'Coral · Smooth Natural Female',
    description: 'ChatGPT-style smooth, clear & warm female voice',
    gender: 'female',
    openaiVoice: 'coral',
    openaiHdFallback: 'nova',
    englishNeuralVoice: 'en-US-AvaMultilingualNeural',
    rate: '-2%',
    pitch: '+0Hz',
  },
  {
    id: 'nova',
    label: 'Nova · Warm Clear Female',
    description: 'Polished, conversational & reassuring female voice',
    gender: 'female',
    openaiVoice: 'nova',
    openaiHdFallback: 'nova',
    englishNeuralVoice: 'en-US-EmmaMultilingualNeural',
    rate: '-2%',
    pitch: '+0Hz',
  },
  {
    id: 'shimmer',
    label: 'Shimmer · Soft Serene Female',
    description: 'Graceful Indian-accented calm female voice',
    gender: 'female',
    openaiVoice: 'shimmer',
    openaiHdFallback: 'shimmer',
    englishNeuralVoice: 'en-IN-NeerjaNeural',
    rate: '-2%',
    pitch: '+0Hz',
  },
  {
    id: 'sage',
    label: 'Sage · Calm Wise Female',
    description: 'Composed, thoughtful & refined female voice',
    gender: 'female',
    openaiVoice: 'sage',
    openaiHdFallback: 'shimmer',
    englishNeuralVoice: 'en-GB-SoniaNeural',
    rate: '-2%',
    pitch: '+0Hz',
  },
];

export const ALL_VOICE_PRESETS: VoicePreset[] = [
  ...CHATGPT_MALE_VOICES,
  ...CHATGPT_FEMALE_VOICES,
];

const FEMALE_NAME_HINTS = [
  'devi',
  'mata',
  'maa',
  'priya',
  'ananya',
  'meera',
  'smita',
  'lakshmi',
  'saraswati',
  'radha',
  'gayatri',
  'kavya',
  'divya',
  'shakti',
  'yogini',
  'sadhvi',
  'vidya',
  'vedika',
  'sharma',
  'nandini',
  'aarti',
  'arundhati',
  'vaishnavi',
  'bhavani',
  'parvati',
  'kalyani',
  'tara',
  'maya',
  'reema',
  'sunita',
  'shreya',
  'pooja',
  'neha',
  'anjali',
  'rashmi',
  'usha',
  'kiran',
  'madhavi',
  'padma',
  'revathi',
  'savitri',
  'vasundhara',
  'maithili',
  'sumitra',
  'chitra',
  'roshni',
  'seema',
];

const MALE_TITLE_HINTS = [
  'acharya ',
  'swami ',
  'pandit ',
  'pt.',
  'pt ',
  'guru ',
  'shastri',
  'rishi ',
  'maharaj',
  'baba ',
  'sri ',
  'shri ',
  'dr. ',
  'mr. ',
];

const MALE_VOICE_IDS = new Set(CHATGPT_MALE_VOICES.map((v) => v.id));
const FEMALE_VOICE_IDS = new Set(CHATGPT_FEMALE_VOICES.map((v) => v.id));

export function inferVoiceGender(
  rawGender?: string | null,
  astrologerName?: string | null
): VoiceGender {
  const g = String(rawGender || '').toLowerCase().trim();
  if (g === 'female' || g === 'f' || g === 'woman') return 'female';
  if (g === 'male' || g === 'm' || g === 'man') return 'male';

  const nameLower = String(astrologerName || '').toLowerCase().trim();
  if (nameLower) {
    if (
      nameLower.includes('devi') ||
      nameLower.includes('mata') ||
      nameLower.includes('yogini') ||
      nameLower.includes('sadhvi') ||
      nameLower.includes('maa ') ||
      nameLower.startsWith('ma ')
    ) {
      return 'female';
    }
    if (MALE_TITLE_HINTS.some((h) => nameLower.includes(h))) {
      return 'male';
    }
    if (FEMALE_NAME_HINTS.some((h) => nameLower.includes(h))) {
      return 'female';
    }
  }
  return 'male';
}

export function normalizeVoiceGenderAndId(
  rawGender?: string | null,
  rawVoiceId?: string | null,
  astrologerName?: string | null
): { voiceGender: VoiceGender; voiceId: string; preset: VoicePreset } {
  const voiceGender = inferVoiceGender(rawGender, astrologerName);
  const v = String(rawVoiceId || '').toLowerCase().trim();

  if (voiceGender === 'female') {
    const resolvedId = FEMALE_VOICE_IDS.has(v) ? v : 'coral';
    const preset =
      CHATGPT_FEMALE_VOICES.find((p) => p.id === resolvedId) || CHATGPT_FEMALE_VOICES[0];
    return { voiceGender: 'female', voiceId: preset.id, preset };
  }

  const resolvedId = MALE_VOICE_IDS.has(v) ? v : 'ash';
  const preset =
    CHATGPT_MALE_VOICES.find((p) => p.id === resolvedId) || CHATGPT_MALE_VOICES[0];
  return { voiceGender: 'male', voiceId: preset.id, preset };
}

export type SupportedSpeechLang = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';

export function detectSpeechLanguage(
  rawLang?: string | null,
  text?: string
): SupportedSpeechLang {
  const sample = text || '';
  if (/[\u0C00-\u0C7F]/.test(sample)) return 'te';
  if (/[\u0900-\u097F]/.test(sample)) return 'hi';
  if (/[\u0B80-\u0BFF]/.test(sample)) return 'ta';
  if (/[\u0C80-\u0CFF]/.test(sample)) return 'kn';
  if (/[\u0D00-\u0D7F]/.test(sample)) return 'ml';

  const l = String(rawLang || 'en').toLowerCase().trim();
  if (l.includes('telugu') || l.startsWith('te')) return 'te';
  if (l.includes('hindi') || l.startsWith('hi')) return 'hi';
  if (l.includes('tamil') || l.startsWith('ta')) return 'ta';
  if (l.includes('kannada') || l.startsWith('kn')) return 'kn';
  if (l.includes('malayalam') || l.startsWith('ml')) return 'ml';
  return 'en';
}

export const REGIONAL_NEURAL_VOICES: Record<
  SupportedSpeechLang,
  Record<VoiceGender, string>
> = {
  en: {
    male: 'en-US-AndrewMultilingualNeural',
    female: 'en-US-AvaMultilingualNeural',
  },
  hi: {
    male: 'hi-IN-MadhurNeural',
    female: 'hi-IN-SwaraNeural',
  },
  te: {
    male: 'te-IN-MohanNeural',
    female: 'te-IN-ShrutiNeural',
  },
  ta: {
    male: 'ta-IN-ValluvarNeural',
    female: 'ta-IN-PallaviNeural',
  },
  kn: {
    male: 'kn-IN-GaganNeural',
    female: 'kn-IN-SapnaNeural',
  },
  ml: {
    male: 'ml-IN-MidhunNeural',
    female: 'ml-IN-SobhanaNeural',
  },
};
