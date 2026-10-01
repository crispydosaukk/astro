import { adminDb } from './firebase/admin';

/**
 * ─────────────────────────────────────────────────────────
 *  AstroParihar – Dynamic API Key Resolution
 *
 *  Priority order for ALL keys:
 *    1. process.env  (server env var)
 *    2. Firestore  /settings/general  (set via Admin Dashboard)
 *    3. Returns ''  (empty — no hardcoded fallbacks)
 *
 *  OpenAI is used as the FALLBACK when Vedika AI is
 *  unavailable (server down, usage limit, timeout, etc.)
 * ─────────────────────────────────────────────────────────
 */

export function cleanApiKey(key?: string | null): string {
  if (!key) return '';
  return key.trim().replace(/^["']|["']$/g, '').trim();
}

// ── Vedika AI ────────────────────────────────────────────

/**
 * Server-side: Resolves active Vedika API key.
 * env VEDIKA_API_KEY → Firestore settings.vedikaApiKey → ''
 */
export async function getServerVedikaApiKey(): Promise<string> {
  const envKey = cleanApiKey(process.env.VEDIKA_API_KEY);
  if (envKey && envKey.length >= 15) return envKey;

  try {
    const snap = await adminDb.collection('settings').doc('general').get();
    if (snap.exists) {
      const data = snap.data();
      const dbKey = cleanApiKey(data?.vedikaApiKey);
      if (dbKey && dbKey.length >= 15) return dbKey;
    }
  } catch {
    // non-blocking
  }

  return '';
}

// ── OpenAI (secondary / fallback) ───────────────────────

/**
 * Server-side: Resolves active OpenAI API key.
 * env OPENAI_API_KEY → Firestore settings.openaiApiKey → ''
 */
export async function getServerOpenAIApiKey(): Promise<string> {
  const envKey = cleanApiKey(process.env.OPENAI_API_KEY);
  if (envKey && envKey.length >= 20) return envKey;

  try {
    const snap = await adminDb.collection('settings').doc('general').get();
    if (snap.exists) {
      const data = snap.data();
      const dbKey = cleanApiKey(data?.openaiApiKey);
      if (dbKey && dbKey.length >= 20) return dbKey;
    }
  } catch (err) {
    console.warn('Could not read OpenAI key from adminDb:', err);
  }

  return '';
}

// ── Client-side helpers (no secrets) ─────────────────────

/**
 * Client-side: Returns Vedika key from public env only.
 * Never returns a hardcoded secret.
 */
export function getVedikaApiKey(): string {
  return cleanApiKey(
    process.env.VEDIKA_API_KEY || process.env.NEXT_PUBLIC_VEDIKA_API_KEY
  );
}

/**
 * Client-side: Returns OpenAI key from public env only.
 */
export function getOpenAIApiKey(): string {
  return cleanApiKey(
    process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
  );
}

// ── OpenAI fetch helper ───────────────────────────────────

/**
 * Executes a fetch to OpenAI using the dynamically resolved key.
 * No automatic retry with a hardcoded fallback — if the admin's
 * key is wrong, the error is surfaced cleanly.
 */
export async function fetchWithOpenAIFallback(
  url: string,
  init: RequestInit,
  providedKey?: string | null
): Promise<Response> {
  const key = providedKey || (await getServerOpenAIApiKey());

  if (!key) {
    // Return a synthetic 503 so callers can detect "no key configured"
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured in Admin Settings.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${key}`);

  return fetch(url, { ...init, headers });
}
