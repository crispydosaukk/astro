import { getServerOpenAIApiKey } from '@/lib/aiConfig';
import {
  VoiceGender,
  VoicePreset,
  CHATGPT_MALE_VOICES,
  CHATGPT_FEMALE_VOICES,
  ALL_VOICE_PRESETS,
  inferVoiceGender,
  normalizeVoiceGenderAndId,
  SupportedSpeechLang,
  detectSpeechLanguage,
  REGIONAL_NEURAL_VOICES,
} from '@/lib/voicePresets';

export {
  type VoiceGender,
  type VoicePreset,
  CHATGPT_MALE_VOICES,
  CHATGPT_FEMALE_VOICES,
  ALL_VOICE_PRESETS,
  inferVoiceGender,
  normalizeVoiceGenderAndId,
  type SupportedSpeechLang,
  detectSpeechLanguage,
  REGIONAL_NEURAL_VOICES,
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

async function synthesizeWithFallbackTts(
  text: string,
  preset: VoicePreset,
  lang: SupportedSpeechLang
): Promise<{ buffer: Buffer; voiceUsed: string } | null> {
  const chunks = splitTextForSmoothSpeech(text, 180);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        chunk
      )}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      });

      if (!res.ok) {
        return null;
      }

      const arr = await res.arrayBuffer();
      if (arr.byteLength > 0) {
        buffers.push(Buffer.from(arr));
      }
    } catch (err) {
      console.warn(`Fallback TTS chunk failed (${lang}):`, err);
      return null;
    }
  }

  if (buffers.length === 0) return null;
  return { buffer: Buffer.concat(buffers), voiceUsed: `fallback:${lang}:${preset.gender}` };
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
 * Tier 2: Universal Neural/Regional Fallback TTS with dedicated Male & Female voice profiles
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

  // Tier 2: Universal Fallback TTS (Separate smooth Male & Female presets)
  const fallbackResult = await synthesizeWithFallbackTts(clean, preset, lang);
  if (fallbackResult) {
    return {
      audioBuffer: fallbackResult.buffer,
      contentType: 'audio/mpeg',
      provider: 'neural',
      voiceUsed: fallbackResult.voiceUsed,
      voiceId,
      gender: voiceGender,
      languageCode: lang,
    };
  }

  return null;
}
