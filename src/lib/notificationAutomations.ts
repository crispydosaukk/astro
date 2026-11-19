import { adminDb } from './firebase/admin';
import { db as clientDb } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  sendDynamicNotification,
  type AppNotificationItem,
  type NotificationCategory,
  type NotificationDeliveryMode,
  type NotificationPriority,
} from './notificationService';

export interface AutomatedScheduleItem {
  id: string;
  name: string;
  description: string;
  category: NotificationCategory;
  enabled: boolean;
  time: string; // 'HH:mm' format (24-hour IST)
  timezone: string; // 'Asia/Kolkata'
  title: string;
  subtitle?: string;
  body: string;
  ctaText?: string;
  actionRoute: string;
  deliveryMode: NotificationDeliveryMode;
  priority: NotificationPriority;
  lastTriggeredAt?: string;
  lastTriggeredDate?: string; // 'YYYY-MM-DD' in IST
  totalSentCount?: number;
}

export const DEFAULT_AUTOMATED_SCHEDULES: AutomatedScheduleItem[] = [
  {
    id: 'daily_morning_panchang',
    name: '🌅 Daily Morning Panchang & Shubh Muhurat',
    description: 'Astrotalk-style morning notification with today’s Tithi, Nakshatra, and Shubh Muhurat timings.',
    category: 'panchang',
    enabled: true,
    time: '07:00',
    timezone: 'Asia/Kolkata',
    title: '☀️ Aaj Ka Panchang & Shubh Muhurat',
    subtitle: 'Daily Vedic Calendar',
    body: 'Abhijit Muhurat & Rahu Kaal for today are updated. Tap to plan your auspicious tasks for maximum prosperity!',
    ctaText: 'View Panchang',
    actionRoute: '/panchang-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    totalSentCount: 0,
  },
  {
    id: 'live_astrologers_recommendation',
    name: '✨ Astrotalk-Style Astrologer Recommendation',
    description: 'Prompts users with personalized astrologer recommendations during peak midday hours.',
    category: 'consultation',
    enabled: true,
    time: '12:30',
    timezone: 'Asia/Kolkata',
    title: '✨ Top Vedic Astrologers are Online Now',
    subtitle: 'Live 1-on-1 Guidance',
    body: 'Facing doubts about career, love, or marriage? Verified Vedic Acharyas are available right now for instant consultation.',
    ctaText: 'Consult Now',
    actionRoute: '/live-astrologers-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    totalSentCount: 0,
  },
  {
    id: 'afternoon_kundli_transit',
    name: '🪐 Daily Kundli & Planetary Transit Alert',
    description: 'Alerts users to current planetary shifts, Moon transits, and houses in their birth chart.',
    category: 'horoscope',
    enabled: true,
    time: '16:30',
    timezone: 'Asia/Kolkata',
    title: '🪐 Planetary Movement & Kundli Insights',
    subtitle: 'Planetary Transits',
    body: 'A significant planetary transit is active today. Tap to check your personalized Kundli house predictions and remedies.',
    ctaText: 'View Kundli',
    actionRoute: '/my-kundli-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    totalSentCount: 0,
  },
  {
    id: 'evening_sandhya_remedy',
    name: '🪔 Evening Sandhya Aarti & Daily Remedy',
    description: 'Evening reminder to light a diya, perform remedies, and listen to auspicious Vedic mantras.',
    category: 'remedies',
    enabled: true,
    time: '19:30',
    timezone: 'Asia/Kolkata',
    title: '🪔 Sandhya Aarti & Daily Planetary Remedy',
    subtitle: 'Spiritual Remedies',
    body: 'Rahu Kaal has passed. Light a Diya for household peace and chant your recommended planetary mantra tonight.',
    ctaText: 'View Remedies',
    actionRoute: '/remedies-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    totalSentCount: 0,
  },
  {
    id: 'special_muhurat_forecast',
    name: '🔮 Auspicious Choghadiya & Weekly Muhurat',
    description: 'Alerts devotees about special Choghadiyas, Ekadashi, Purnima, and festival muhurats.',
    category: 'offers',
    enabled: false,
    time: '09:30',
    timezone: 'Asia/Kolkata',
    title: '🔮 Shubh Choghadiya & Timing Window Open',
    subtitle: 'Vedic Timings',
    body: 'Amrit and Shubh Choghadiya windows are beginning soon. Tap to find the ideal planetary timing for new endeavors.',
    ctaText: 'Check Muhurat',
    actionRoute: '/muhurat-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    totalSentCount: 0,
  },
];

const CONFIG_COLLECTION = 'app_notifications_config';
const AUTOMATIONS_DOC = 'automated_schedules';

function hasValidAdminCreds(): boolean {
  const key = process.env.FIREBASE_PRIVATE_KEY_BASE64 || process.env.FIREBASE_PRIVATE_KEY || '';
  const email = process.env.FIREBASE_CLIENT_EMAIL || '';
  return Boolean(key && !key.includes('\ndemo\n') && email && email !== 'demo@demo.com');
}

/**
 * Get current time details in IST (Indian Standard Time)
 */
export function getISTTimeDetails(date: Date = new Date()) {
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = istFormatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const year = partMap.year || '2026';
  const month = partMap.month || '01';
  const day = partMap.day || '01';
  const hour = partMap.hour || '00';
  const minute = partMap.minute || '00';

  const dateString = `${year}-${month}-${day}`;
  const timeString = `${hour}:${minute}`;
  const hourNumber = parseInt(hour, 10);
  const minuteNumber = parseInt(minute, 10);

  return {
    dateString,
    timeString,
    hourNumber,
    minuteNumber,
    fullISO: date.toISOString(),
  };
}

/**
 * Fetch all automated schedules from Firestore (or fallback to defaults)
 */
export async function getAutomatedSchedules(): Promise<AutomatedScheduleItem[]> {
  try {
    if (hasValidAdminCreds()) {
      const snap = await adminDb.collection(CONFIG_COLLECTION).doc(AUTOMATIONS_DOC).get();
      if (snap.exists) {
        const data = snap.data();
        if (Array.isArray(data?.schedules) && data.schedules.length > 0) {
          return mergeWithDefaults(data.schedules);
        }
      }
    } else if (clientDb) {
      const snap = await getDoc(doc(clientDb, CONFIG_COLLECTION, AUTOMATIONS_DOC));
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.schedules) && data.schedules.length > 0) {
          return mergeWithDefaults(data.schedules);
        }
      }
    }
  } catch (err) {
    console.warn('[automations] Failed reading schedules from Firestore, using defaults:', err);
  }

  return DEFAULT_AUTOMATED_SCHEDULES;
}

function mergeWithDefaults(saved: AutomatedScheduleItem[]): AutomatedScheduleItem[] {
  const savedMap = new Map<string, AutomatedScheduleItem>();
  saved.forEach((s) => savedMap.set(s.id, s));

  return DEFAULT_AUTOMATED_SCHEDULES.map((def) => {
    const existing = savedMap.get(def.id);
    if (!existing) return def;
    return {
      ...def,
      ...existing,
      name: def.name, // Keep canonical name & description
      description: def.description,
    };
  });
}

/**
 * Save updated schedules to Firestore
 */
export async function saveAutomatedSchedules(
  schedules: AutomatedScheduleItem[]
): Promise<AutomatedScheduleItem[]> {
  const merged = mergeWithDefaults(schedules);
  const payload = {
    schedules: merged,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (hasValidAdminCreds()) {
      await adminDb.collection(CONFIG_COLLECTION).doc(AUTOMATIONS_DOC).set(payload, { merge: true });
    } else if (clientDb) {
      await setDoc(doc(clientDb, CONFIG_COLLECTION, AUTOMATIONS_DOC), payload, { merge: true });
    }
  } catch (err) {
    console.error('[automations] Failed writing schedules to Firestore:', err);
    throw err;
  }

  return merged;
}

/**
 * Triggers a single automation immediately.
 * Used for manual "Test Send Now" from Admin Panel OR automated cron runs.
 */
export async function triggerSingleAutomation(
  scheduleId: string,
  options: { force?: boolean; sentBy?: string } = {}
): Promise<{ success: boolean; notification?: AppNotificationItem; schedule?: AutomatedScheduleItem; error?: string }> {
  const schedules = await getAutomatedSchedules();
  const index = schedules.findIndex((s) => s.id === scheduleId);
  if (index === -1) {
    return { success: false, error: `Schedule "${scheduleId}" not found.` };
  }

  const schedule = schedules[index];
  if (!schedule.enabled && !options.force) {
    return { success: false, error: `Schedule "${schedule.name}" is currently disabled.` };
  }

  const ist = getISTTimeDetails();

  // Send the dynamic notification via Expo Push + FCM multicast + in-app Firestore storage
  const notification = await sendDynamicNotification({
    title: schedule.title,
    subtitle: schedule.subtitle,
    body: schedule.body,
    ctaText: schedule.ctaText,
    deliveryMode: schedule.deliveryMode,
    category: schedule.category,
    audience: 'all',
    actionRoute: schedule.actionRoute,
    priority: schedule.priority,
    sentBy: options.sentBy || `Automation (${schedule.id})`,
  });

  // Update schedule metadata
  schedule.lastTriggeredAt = new Date().toISOString();
  schedule.lastTriggeredDate = ist.dateString;
  schedule.totalSentCount = (schedule.totalSentCount || 0) + 1;
  schedules[index] = schedule;

  await saveAutomatedSchedules(schedules);

  return { success: true, notification, schedule };
}

/**
 * Evaluates all schedules against the current IST time and runs any due automations.
 * Typically invoked by an hourly or half-hourly cron job.
 */
export async function evaluateAndRunDueAutomations(now: Date = new Date()): Promise<{
  checkedAt: string;
  istTime: string;
  istDate: string;
  ranCount: number;
  results: Array<{ id: string; success: boolean; pushDelivered: number; totalTargets: number; error?: string }>;
}> {
  const ist = getISTTimeDetails(now);
  const schedules = await getAutomatedSchedules();

  const results: Array<{ id: string; success: boolean; pushDelivered: number; totalTargets: number; error?: string }> = [];

  for (const schedule of schedules) {
    if (!schedule.enabled) continue;

    // Has it already run today (in IST)?
    if (schedule.lastTriggeredDate === ist.dateString) {
      continue;
    }

    // Parse schedule time "HH:mm"
    const [schedHourStr, schedMinStr] = (schedule.time || '07:00').split(':');
    const schedHour = parseInt(schedHourStr || '7', 10);
    const schedMin = parseInt(schedMinStr || '0', 10);

    const schedTotalMinutes = schedHour * 60 + schedMin;
    const currentTotalMinutes = ist.hourNumber * 60 + ist.minuteNumber;

    // If current time is within or past the scheduled time window today (e.g. within 60 minutes)
    const isDue = currentTotalMinutes >= schedTotalMinutes && currentTotalMinutes - schedTotalMinutes < 70;

    if (isDue) {
      try {
        const outcome = await triggerSingleAutomation(schedule.id, {
          force: false,
          sentBy: `Cron Daily Schedule (${schedule.time} IST)`,
        });

        results.push({
          id: schedule.id,
          success: outcome.success,
          pushDelivered: outcome.notification?.stats.pushDelivered || 0,
          totalTargets: outcome.notification?.stats.totalTargets || 0,
          error: outcome.error,
        });
      } catch (err: any) {
        results.push({
          id: schedule.id,
          success: false,
          pushDelivered: 0,
          totalTargets: 0,
          error: err?.message || String(err),
        });
      }
    }
  }

  return {
    checkedAt: now.toISOString(),
    istTime: ist.timeString,
    istDate: ist.dateString,
    ranCount: results.filter((r) => r.success).length,
    results,
  };
}
