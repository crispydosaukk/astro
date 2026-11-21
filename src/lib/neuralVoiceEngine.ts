import { getServerOpenAIApiKey } from '@/lib/aiConfig';

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
    // Explicit female spiritual/name markers override generic titles
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

  // Strictly Male — upgrade legacy neutral 'alloy' or any mismatched female voice to 'ash'
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
  // Native script auto-detection wins when the actual text is written in an Indian script
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

const REGIONAL_NEURAL_VOICES: Record<
  Exclude<SupportedSpeechLang, 'en'>,
  { male: string; female: string }
> = {
  hi: { male: 'hi-IN-MadhurNeural', female: 'hi-IN-SwaraNeural' },
  te: { male: 'te-IN-MohanNeural', female: 'te-IN-ShrutiNeural' },
  ta: { male: 'ta-IN-ValluvarNeural', female: 'ta-IN-PallaviNeural' },
  kn: { male: 'kn-IN-GaganNeural', female: 'kn-IN-SapnaNeural' },
  ml: { male: 'ml-IN-MidhunNeural', female: 'ml-IN-SobhanaNeural' },
};

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1FA70}-\u{1FAFF}\u{200D}\u{FE0F}]/gu;

export function cleanTextForSmoothSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(EMOJI_REGEX, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`+/g, '')
    .replace(/#+\s*/g, '')
    .replace(/^[-•✦✧★☆●◆▪︎►▸→]+\s*/gm, '')
    .replace(/[•✦✧★☆●◆▪︎►▸→|]/g, ', ')
    .replace(/([.!?।॥])\s*/g, '$1 ')
    .replace(/\n+/g, '. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitTextForSmoothSpeech(text: string, maxLen = 1200): string[] {
  const cleaned = text.trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  const sentences = cleaned.match(/[^.!?।॥]+[.!?।॥]*/g) || [cleaned];
  const chunks: string[] = [];
  let current = '';

  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = current ? `${current} ${s}` : s;
    } else {
      if (current) chunks.push(current);
      if (s.length > maxLen) {
        for (let i = 0; i < s.length; i += maxLen) {
          chunks.push(s.slice(i, i + maxLen).trim());
        }
        current = '';
      } else {
        current = s;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean);
}

function cleanApiKey(raw?: string | null): string {
  if (!raw) return '';
  return raw.replace(/['"\s\r\n]/g, '').trim();
}

async function synthesizeWithOpenAI(
  text: string,
  preset: VoicePreset,
  apiKey: string
): Promise<{ buffer: Buffer; voiceUsed: string } | null> {
  const instructions =
    preset.gender === 'female'
      ? 'Speak in a smooth, warm, calm, clear, and professional female conversational voice just like ChatGPT voice mode. Crisp natural articulation, composed soothing poise, gentle human pacing, zero robotic cadence.'
      : 'Speak in a smooth, warm, calm, clear, and professional male conversational voice just like ChatGPT voice mode. Crisp natural articulation, composed confident poise, gentle human pacing, zero robotic cadence.';

  const chunks = splitTextForSmoothSpeech(text, 3500);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 16000);
    try {
      let res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          voice: preset.openaiVoice,
          input: chunk,
          instructions,
          response_format: 'mp3',
        }),
        signal: controller.signal,
      });

      // If quota/auth fails (401/403/429), immediately fall back to Studio Neural tier without wasting latency
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        clearTimeout(timer);
        return null;
      }

      // If gpt-4o-mini-tts is unavailable for any reason, try tts-1-hd
      if (!res.ok) {
        res = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1-hd',
            voice: preset.openaiHdFallback,
            input: chunk,
            response_format: 'mp3',
          }),
          signal: controller.signal,
        });
      }

      clearTimeout(timer);
      if (!res.ok) return null;

      const arr = await res.arrayBuffer();
      if (arr.byteLength > 0) {
        buffers.push(Buffer.from(arr));
      }
    } catch {
      clearTimeout(timer);
      return null;
    }
  }

  if (buffers.length === 0) return null;
  return { buffer: Buffer.concat(buffers), voiceUsed: `openai:${preset.openaiVoice}` };
}

async function synthesizeWithEdgeNeural(
  text: string,
  preset: VoicePreset,
  lang: SupportedSpeechLang
): Promise<{ buffer: Buffer; voiceUsed: string } | null> {
  const neuralVoice =
    lang === 'en'
      ? preset.englishNeuralVoice
      : REGIONAL_NEURAL_VOICES[lang][preset.gender];

  const chunks = splitTextForSmoothSpeech(text, 900);
  const buffers: Buffer[] = [];

  // Dynamic import keeps Next.js Node server clean and works in standalone deployments
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');

  for (const chunk of chunks) {
    const tts = new MsEdgeTTS({
      connectionTimeoutMs: 10000,
      synthesisTimeoutMs: 20000,
    });
    try {
      await tts.setMetadata(neuralVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(chunk, {
        rate: preset.rate || '-2%',
        pitch: preset.pitch || '+0Hz',
      });
      const pieceBuffers: Buffer[] = [];
      for await (const part of audioStream) {
        pieceBuffers.push(Buffer.isBuffer(part) ? part : Buffer.from(part));
      }
      if (pieceBuffers.length > 0) {
        buffers.push(Buffer.concat(pieceBuffers));
      }
    } catch (err) {
      console.warn(`Neural TTS chunk failed (${neuralVoice}):`, err);
      return null;
    } finally {
      try {
        tts.close();
      } catch {}
    }
  }

  if (buffers.length === 0) return null;
  return { buffer: Buffer.concat(buffers), voiceUsed: `neural:${neuralVoice}` };
}

export interface SmoothSpeechRequest {
  text: string;
  language?: string | null;
  gender?: string | null;
  voiceId?: string | null;
  astrologerName?: string | null;
  openaiApiKey?: string | null;
}

export interface SmoothSpeechResult {
  audioBuffer: Buffer;
  contentType: 'audio/mpeg';
  provider: 'openai' | 'neural';
  voiceUsed: string;
  voiceId: string;
  gender: VoiceGender;
  languageCode: SupportedSpeechLang;
}

/**
 * Synthesizes smooth, ChatGPT-quality studio speech with strict separate Male & Female voices.
 * Tier 1: OpenAI `gpt-4o-mini-tts` (ChatGPT voice mode with tone instructions) -> `tts-1-hd`
 * Tier 2: Microsoft Studio Neural TTS (`msedge-tts`) with dedicated Male & Female neural voices
 *         across English, Hindi, Telugu, Tamil, Kannada, and Malayalam.
 */
export async function synthesizeSmoothAstrologerSpeech(
  req: SmoothSpeechRequest
): Promise<SmoothSpeechResult | null> {
  const clean = cleanTextForSmoothSpeech(req.text);
  if (!clean) return null;

  const { voiceGender, voiceId, preset } = normalizeVoiceGenderAndId(
    req.gender,
    req.voiceId,
    req.astrologerName
  );
  const lang = detectSpeechLanguage(req.language, clean);

  // Tier 1: OpenAI ChatGPT Smooth Voice (if active key available)
  const rawKey = req.openaiApiKey ?? (await getServerOpenAIApiKey().catch(() => null));
  const activeKey = cleanApiKey(rawKey);
  if (activeKey && activeKey.length >= 20) {
    const openaiResult = await synthesizeWithOpenAI(clean, preset, activeKey);
    if (openaiResult) {
      return {
        audioBuffer: openaiResult.buffer,
        contentType: 'audio/mpeg',
        provider: 'openai',
        voiceUsed: openaiResult.voiceUsed,
        voiceId,
        gender: voiceGender,
        languageCode: lang,
      };
    }
  }

  // Tier 2: Microsoft Studio Neural TTS (Separate smooth Male & Female Neural Voices)
  const neuralResult = await synthesizeWithEdgeNeural(clean, preset, lang);
  if (neuralResult) {
    return {
      audioBuffer: neuralResult.buffer,
      contentType: 'audio/mpeg',
      provider: 'neural',
      voiceUsed: neuralResult.voiceUsed,
      voiceId,
      gender: voiceGender,
      languageCode: lang,
    };
  }

  return null;
}
