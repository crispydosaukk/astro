import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_AI_ASTROLOGERS } from '@/lib/aiAstrologerData';
import {
  normalizeVoiceGenderAndId,
  synthesizeSmoothAstrologerSpeech,
} from '@/lib/neuralVoiceEngine';

export const runtime = 'nodejs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface CachedVoiceMeta {
  voiceGender: 'male' | 'female';
  voiceId: string;
  name?: string;
  cachedAt: number;
}

const astrologerVoiceCache = new Map<string, CachedVoiceMeta>();
const CACHE_TTL_MS = 45_000;

async function resolveAstrologerVoiceFromDb(
  astrologerId?: string | null,
  astrologerName?: string | null
): Promise<{ voiceGender?: string; voiceId?: string; name?: string }> {
  const key = (astrologerId || astrologerName || '').trim();
  if (!key) return {};

  const cached = astrologerVoiceCache.get(key);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached;
  }

  // 1. Live Firestore lookup so Admin Dashboard gender/voice edits take effect immediately
  if (astrologerId && adminDb && typeof adminDb.collection === 'function') {
    try {
      const snap = await adminDb.collection('ai_astrologers').doc(astrologerId).get();
      if (snap.exists) {
        const d = snap.data() || {};
        const normalized = normalizeVoiceGenderAndId(
          d.voiceGender,
          d.voiceId,
          d.name || astrologerName
        );
        const entry: CachedVoiceMeta = {
          voiceGender: normalized.voiceGender,
          voiceId: normalized.voiceId,
          name: d.name || astrologerName || undefined,
          cachedAt: Date.now(),
        };
        astrologerVoiceCache.set(key, entry);
        return entry;
      }
    } catch {}
  }

  // 2. Fallback to static default registry
  const fallback = DEFAULT_AI_ASTROLOGERS.find(
    (a) =>
      (astrologerId && a.id === astrologerId) ||
      (astrologerName && a.name.toLowerCase() === astrologerName.toLowerCase())
  );
  if (fallback) {
    const normalized = normalizeVoiceGenderAndId(
      fallback.voiceGender,
      fallback.voiceId,
      fallback.name
    );
    const entry: CachedVoiceMeta = {
      voiceGender: normalized.voiceGender,
      voiceId: normalized.voiceId,
      name: fallback.name,
      cachedAt: Date.now(),
    };
    astrologerVoiceCache.set(key, entry);
    return entry;
  }

  return {};
}

async function handleTtsRequest(params: {
  text?: string | null;
  lang?: string | null;
  gender?: string | null;
  voiceId?: string | null;
  astrologerId?: string | null;
  astrologerName?: string | null;
  format?: string | null;
}) {
  const text = (params.text || '').trim();
  if (!text) {
    return NextResponse.json(
      { success: false, error: 'Text parameter is required' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Keep payload responsive & bounded
  const boundedText = text.slice(0, 3500);

  let effectiveGender = params.gender || undefined;
  let effectiveVoiceId = params.voiceId || undefined;
  let effectiveName = params.astrologerName || undefined;

  // Always check live Firestore profile when astrologerId is supplied (unless explicit preview override passed without astrologerId)
  if (params.astrologerId && !params.gender) {
    const dbVoice = await resolveAstrologerVoiceFromDb(params.astrologerId, params.astrologerName);
    if (dbVoice.voiceGender) effectiveGender = dbVoice.voiceGender;
    if (!effectiveVoiceId && dbVoice.voiceId) effectiveVoiceId = dbVoice.voiceId;
    if (!effectiveName && dbVoice.name) effectiveName = dbVoice.name;
  } else if (params.astrologerId && !effectiveVoiceId) {
    const dbVoice = await resolveAstrologerVoiceFromDb(params.astrologerId, params.astrologerName);
    if (dbVoice.voiceGender) effectiveGender = dbVoice.voiceGender;
    if (dbVoice.voiceId) effectiveVoiceId = dbVoice.voiceId;
  }

  const result = await synthesizeSmoothAstrologerSpeech({
    text: boundedText,
    language: params.lang || 'en',
    gender: effectiveGender,
    voiceId: effectiveVoiceId,
    astrologerName: effectiveName,
  });

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Smooth neural voice synthesis unavailable' },
      { status: 503, headers: corsHeaders }
    );
  }

  if (params.format === 'json') {
    return NextResponse.json(
      {
        success: true,
        audioBase64: result.audioBuffer.toString('base64'),
        contentType: result.contentType,
        provider: result.provider,
        voiceUsed: result.voiceUsed,
        voiceId: result.voiceId,
        gender: result.gender,
        languageCode: result.languageCode,
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  return new NextResponse(new Uint8Array(result.audioBuffer), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'audio/mpeg',
      'Content-Length': result.audioBuffer.byteLength.toString(),
      'Cache-Control': 'public, max-age=3600',
      'X-Voice-Provider': result.provider,
      'X-Voice-Gender': result.gender,
      'X-Voice-Id': result.voiceId,
      'X-Voice-Model': result.voiceUsed,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    return await handleTtsRequest({
      text: searchParams.get('text'),
      lang: searchParams.get('lang') || searchParams.get('language'),
      gender: searchParams.get('gender') || searchParams.get('voiceGender'),
      voiceId: searchParams.get('voiceId'),
      astrologerId: searchParams.get('astrologerId'),
      astrologerName: searchParams.get('astrologerName'),
      format: searchParams.get('format'),
    });
  } catch (error: any) {
    console.error('Error generating smooth audio in GET /api/tts:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'TTS generation failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return await handleTtsRequest({
      text: body?.text,
      lang: body?.lang || body?.language,
      gender: body?.gender || body?.voiceGender,
      voiceId: body?.voiceId,
      astrologerId: body?.astrologerId,
      astrologerName: body?.astrologerName,
      format: body?.format || 'json',
    });
  } catch (error: any) {
    console.error('Error generating smooth audio in POST /api/tts:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'TTS generation failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}
