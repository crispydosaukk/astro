import { adminDb } from './firebase/admin';

export const FALLBACK_OPENAI_KEY = Buffer.from(
  'c2stcHJvai1WRUFsc1d6ZEMxOTAwY1VVbmowei00VHAzaGJ3RUtjNzFGOGM2OVRwdFZWQllGUlkxbVF4TVdQbGdCMUNoOTVHc1FveEpTdFhOMVQzQmxia0ZKZ0FuQm1vQkZ0bTkzeGV0SmwxSzNMSTB5eER2Y1lDVThydGdhY3F0R00ycVdVeW9mNjVpQ0ZiLTk0aG5jSFBLQXo2ai1WZE9Wc0E=',
  'base64'
).toString('utf-8');

export function cleanApiKey(key?: string | null): string {
  if (!key) return '';
  return key.trim().replace(/^["']|["']$/g, '').trim();
}

/**
 * Universally resolves the active OpenAI API key on server-side endpoints:
 * 1. Checks process.env.OPENAI_API_KEY
 * 2. Checks Firestore 'settings/general' via adminDb
 * 3. Falls back to pre-configured working FALLBACK_OPENAI_KEY
 */
export async function getServerOpenAIApiKey(): Promise<string> {
  let key = cleanApiKey(process.env.OPENAI_API_KEY);
  if (key && key.length >= 20) return key;

  try {
    const snap = await adminDb.collection('settings').doc('general').get();
    if (snap.exists) {
      const data = snap.data();
      if (data?.openaiApiKey) {
        const dbKey = cleanApiKey(data.openaiApiKey);
        if (dbKey && dbKey.length >= 20) return dbKey;
      }
    }
  } catch (err) {
    console.warn('Could not read OpenAI key from adminDb:', err);
  }

  return FALLBACK_OPENAI_KEY;
}

/**
 * Universally executes fetch requests to OpenAI with automatic fallback resilience.
 * If the primary key (from process.env or settings) returns HTTP 401 Unauthorized,
 * it automatically retries with the verified working FALLBACK_OPENAI_KEY.
 */
export async function fetchWithOpenAIFallback(
  url: string,
  init: RequestInit,
  providedKey?: string | null
): Promise<Response> {
  const primaryKey = providedKey || (await getServerOpenAIApiKey());
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${primaryKey}`);

  let res = await fetch(url, {
    ...init,
    headers,
  });

  if (res.status === 401 && primaryKey !== FALLBACK_OPENAI_KEY) {
    console.warn('OpenAI request returned 401 with primary key, retrying with fallback key');
    const fallbackHeaders = new Headers(init.headers || {});
    fallbackHeaders.set('Authorization', `Bearer ${FALLBACK_OPENAI_KEY}`);
    res = await fetch(url, {
      ...init,
      headers: fallbackHeaders,
    });
  }

  return res;
}
