/**
 * Vedika AI Engine Client (vedika.io)
 * Primary Vedic Astrology & Artificial Intelligence Provider for AstroParihar
 *
 * Provides live ephemeris astronomical calculations, birth charts, kundli matching,
 * panchang, dasha timelines, dosha analysis, and conversational Vedic intelligence.
 *
 * API key is resolved dynamically:
 *   1. env VEDIKA_API_KEY
 *   2. Firestore /settings/general → vedikaApiKey  (set via Admin Dashboard)
 *   3. Returns '' → Vedika calls gracefully fail, OpenAI fallback is used
 */

import { getServerVedikaApiKey, cleanApiKey } from './aiConfig';

export const VEDIKA_BASE_URL = 'https://api.vedika.io';

/**
 * Core HTTP dispatcher to Vedika API endpoints.
 * Returns { success: false } cleanly when no key is configured,
 * so callers can seamlessly fall through to OpenAI.
 */
export async function vedikaFetch<T = any>(
  endpoint: string,
  payload: any,
  providedKey?: string | null,
  method: 'POST' | 'GET' = 'POST',
  timeoutMs: number = 9000
): Promise<{ success: boolean; data?: T; error?: string; raw?: any; status: number }> {
  const apiKey = providedKey || (await getServerVedikaApiKey());
  const cleanKey = cleanApiKey(apiKey);

  // No key configured — skip network call entirely, signal fallback needed
  if (!cleanKey) {
    return {
      success: false,
      error: 'Vedika API key not configured. Please add it in Admin Settings → AI Engine.',
      status: 503,
    };
  }

  const url = `${VEDIKA_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': cleanKey,
      Authorization: `Bearer ${cleanKey}`,
    };

    const res = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(payload) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timer);

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        json?.error ||
        json?.message ||
        `Vedika API returned status ${res.status}: ${res.statusText}`;
      console.warn(`[Vedika] ${endpoint} failed (${res.status}): ${errMsg}`);
      return { success: false, error: errMsg, raw: json, status: res.status };
    }

    return {
      success: true,
      data: (json?.data !== undefined ? json.data : json) as T,
      raw: json,
      status: res.status,
    };
  } catch (err: any) {
    clearTimeout(timer);
    const isTimeout = err?.name === 'AbortError';
    console.warn(`[Vedika] ${endpoint} ${isTimeout ? 'timed out' : 'network error'}:`, err?.message || err);
    return {
      success: false,
      error: isTimeout ? 'Vedika API request timed out — using OpenAI fallback.' : (err?.message || 'Network error reaching Vedika API'),
      status: isTimeout ? 408 : 500,
    };
  }
}

/**
 * Normalizes input date/time to ISO string (YYYY-MM-DDTHH:mm:ss)
 */
export function formatToVedikaDateTime(dateStr: string, timeStr: string = '12:00'): string {
  try {
    const d = dateStr ? dateStr.trim().split('T')[0] : '1995-01-01';
    let [hh, mm] = (timeStr || '12:00').replace(/(am|pm)/i, '').trim().split(':');
    let h = parseInt(hh || '12', 10);
    let m = parseInt(mm || '0', 10);
    if (isNaN(h)) h = 12;
    if (isNaN(m)) m = 0;
    if (/pm/i.test(timeStr) && h < 12) h += 12;
    if (/am/i.test(timeStr) && h === 12) h = 0;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d}T${pad(h)}:${pad(m)}:00`;
  } catch {
    return '1995-01-01T12:00:00';
  }
}

/**
 * 1. Fetch precision Vedic Birth Chart from Vedika
 */
export async function fetchVedikaBirthChart(params: {
  datetime: string;
  latitude?: number | string;
  longitude?: number | string;
  timezone?: string;
  name?: string;
  gender?: string;
}) {
  const payload = {
    datetime: params.datetime,
    latitude: Number(params.latitude) || 28.6139,
    longitude: Number(params.longitude) || 77.209,
    timezone: params.timezone || 'Asia/Kolkata',
  };

  return vedikaFetch('/v2/astrology/birth-chart', payload);
}

/**
 * 2. Fetch authentic Ashtakoot Kundli Matching from Vedika
 */
export async function fetchVedikaKundliMatching(params: {
  male: {
    datetime: string;
    latitude?: number | string;
    longitude?: number | string;
    timezone?: string;
  };
  female: {
    datetime: string;
    latitude?: number | string;
    longitude?: number | string;
    timezone?: string;
  };
}) {
  const payload = {
    male: {
      datetime: params.male.datetime,
      latitude: Number(params.male.latitude) || 28.6139,
      longitude: Number(params.male.longitude) || 77.209,
      timezone: params.male.timezone || 'Asia/Kolkata',
    },
    female: {
      datetime: params.female.datetime,
      latitude: Number(params.female.latitude) || 19.076,
      longitude: Number(params.female.longitude) || 72.8777,
      timezone: params.female.timezone || 'Asia/Kolkata',
    },
  };

  return vedikaFetch('/v2/astrology/kundli-matching', payload);
}

/**
 * 3. Fetch comprehensive Daily Panchang from Vedika
 */
export async function fetchVedikaPanchang(params: {
  date: string;
  latitude?: number | string;
  longitude?: number | string;
  timezone?: string;
}) {
  const payload = {
    date: params.date || new Date().toISOString().split('T')[0],
    latitude: Number(params.latitude) || 28.6139,
    longitude: Number(params.longitude) || 77.209,
    timezone: params.timezone || 'Asia/Kolkata',
  };

  return vedikaFetch('/v2/astrology/panchang', payload);
}

/**
 * 4. Fetch Vimshottari Dasha timeline from Vedika
 */
export async function fetchVedikaDasha(params: {
  datetime: string;
  latitude?: number | string;
  longitude?: number | string;
  timezone?: string;
}) {
  const payload = {
    datetime: params.datetime,
    latitude: Number(params.latitude) || 28.6139,
    longitude: Number(params.longitude) || 77.209,
    timezone: params.timezone || 'Asia/Kolkata',
  };

  return vedikaFetch('/v2/astrology/dasha', payload);
}

/**
 * 5. Fetch all major Doshas (Mangal, Kaal Sarp, Pitru) from Vedika
 */
export async function fetchVedikaDoshas(params: {
  datetime: string;
  latitude?: number | string;
  longitude?: number | string;
  timezone?: string;
}) {
  const payload = {
    datetime: params.datetime,
    latitude: Number(params.latitude) || 28.6139,
    longitude: Number(params.longitude) || 77.209,
    timezone: params.timezone || 'Asia/Kolkata',
  };

  return vedikaFetch('/v2/astrology/all-doshas', payload);
}

/**
 * 6. Natural Language Astrological AI Query via Vedika Intelligence
 */
export async function queryVedikaAI(params: {
  question: string;
  birthDetails?: {
    datetime?: string;
    latitude?: number | string;
    longitude?: number | string;
    timezone?: string;
  };
  conversationContext?: any;
}) {
  const payload: any = {
    question: params.question,
  };

  const now = new Date();
  const defaultDt = `${now.toISOString().split('T')[0]}T12:00:00`;
  payload.birthDetails = {
    datetime: params.birthDetails?.datetime || defaultDt,
    latitude: Number(params.birthDetails?.latitude) || 28.6139,
    longitude: Number(params.birthDetails?.longitude) || 77.209,
    timezone: params.birthDetails?.timezone || 'Asia/Kolkata',
  };

  if (params.conversationContext) {
    payload.conversationContext = params.conversationContext;
  }

  return vedikaFetch<{ answer: string; birthChart?: any; conversationContext?: any }>(
    '/api/v1/astrology/query',
    payload
  );
}

/**
 * Verifies Vedika API Key status and connectivity
 */
export async function testVedikaConnection(): Promise<{
  connected: boolean;
  message: string;
  balance?: number;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetchVedikaPanchang({ date: today });
    if (res.success) {
      const billing = res.raw?.billing;
      return {
        connected: true,
        message: `Vedika API connection verified successfully.`,
        balance: billing?.balanceAfter,
      };
    }
    return {
      connected: false,
      message: res.error || 'Vedika API authentication failed.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Failed to connect to Vedika API.',
    };
  }
}
