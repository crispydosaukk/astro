import { adminDb, adminMessaging } from './firebase/admin';
import { db as clientDb } from './firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

export type NotificationCategory =
  | 'horoscope'
  | 'panchang'
  | 'consultation'
  | 'offers'
  | 'remedies'
  | 'system';

export type NotificationAudience = 'all' | 'specific';
export type NotificationPriority = 'normal' | 'high';
export type NotificationDeliveryMode = 'push_and_inapp' | 'push_only' | 'inapp_only';

export interface UserNotificationPreferences {
  enabled: boolean;
  horoscope: boolean;
  panchang: boolean;
  consultation: boolean;
  offers: boolean;
  remedies: boolean;
  system: boolean;
  sound: boolean;
  vibration: boolean;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  enabled: true,
  horoscope: true,
  panchang: true,
  consultation: true,
  offers: true,
  remedies: true,
  system: true,
  sound: true,
  vibration: true,
  quietHoursEnabled: false,
  quietStart: '22:00',
  quietEnd: '07:00',
};

export interface NotificationDeliveryStats {
  totalTargets: number;
  pushAttempted: number;
  pushDelivered: number;
  pushFailed: number;
  expoDelivered: number;
  fcmDelivered: number;
  errorDetail?: string;
}

export interface AppNotificationItem {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  ctaText?: string;
  deliveryMode: NotificationDeliveryMode;
  category: NotificationCategory;
  audience: NotificationAudience;
  recipientUids: string[];
  recipientNames?: string[];
  imageUrl?: string;
  actionRoute?: string;
  priority: NotificationPriority;
  createdAt: string;
  createdAtMs: number;
  sentBy?: string;
  stats: NotificationDeliveryStats;
}

export interface PushTokenRecord {
  id: string;
  uid?: string;
  phone?: string;
  name?: string;
  expoPushToken?: string;
  nativeToken?: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
  active: boolean;
  updatedAt: string;
}

export interface SendNotificationPayload {
  title: string;
  subtitle?: string;
  body: string;
  ctaText?: string;
  deliveryMode?: NotificationDeliveryMode;
  category: NotificationCategory;
  audience: NotificationAudience;
  recipientUids?: string[];
  recipientNames?: string[];
  imageUrl?: string;
  actionRoute?: string;
  priority?: NotificationPriority;
  sentBy?: string;
}

const NOTIFICATIONS_COLLECTION = 'app_notifications';
const PUSH_TOKENS_COLLECTION = 'app_push_tokens';
const USERS_COLLECTION = 'users';

function hasValidAdminCreds(): boolean {
  return true;
}

function isExpoToken(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
}

function sanitizeDocId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

async function listDocs(colName: string, maxItems = 150): Promise<Record<string, any>[]> {
  if (hasValidAdminCreds()) {
    try {
      const snap = await adminDb.collection(colName).limit(maxItems).get();
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn(`[notifications] adminDb listDocs(${colName}) failed, trying client SDK:`, err);
    }
  }
  if (clientDb) {
    try {
      const snap = await getDocs(collection(clientDb, colName));
      return snap.docs.slice(0, maxItems).map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn(`[notifications] clientDb listDocs(${colName}) failed:`, err);
    }
  }
  return [];
}

async function readDoc(colName: string, docId: string): Promise<Record<string, any> | null> {
  if (hasValidAdminCreds()) {
    try {
      const snap = await adminDb.collection(colName).doc(docId).get();
      if (snap.exists) return { id: snap.id, ...snap.data() };
      return null;
    } catch (err) {
      console.warn(`[notifications] adminDb readDoc(${colName}/${docId}) failed:`, err);
    }
  }
  if (clientDb) {
    try {
      const snap = await getDoc(doc(clientDb, colName, docId));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
    } catch (err) {
      console.warn(`[notifications] clientDb readDoc(${colName}/${docId}) failed:`, err);
    }
  }
  return null;
}

async function writeDoc(colName: string, docId: string, data: Record<string, any>, merge = true): Promise<void> {
  if (hasValidAdminCreds()) {
    try {
      await adminDb.collection(colName).doc(docId).set(data, { merge });
      return;
    } catch (err) {
      console.warn(`[notifications] adminDb writeDoc(${colName}/${docId}) failed, trying client SDK:`, err);
    }
  }
  if (clientDb) {
    await setDoc(doc(clientDb, colName, docId), data, { merge });
    return;
  }
  throw new Error('Firestore database not initialized');
}

async function removeDoc(colName: string, docId: string): Promise<void> {
  if (hasValidAdminCreds()) {
    try {
      await adminDb.collection(colName).doc(docId).delete();
      return;
    } catch (err) {
      console.warn(`[notifications] adminDb removeDoc(${colName}/${docId}) failed, trying client SDK:`, err);
    }
  }
  if (clientDb) {
    await deleteDoc(doc(clientDb, colName, docId));
  }
}

export async function registerDevicePushToken(input: {
  uid?: string;
  phone?: string;
  name?: string;
  expoPushToken?: string;
  nativeToken?: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
}): Promise<PushTokenRecord> {
  const tokenSeed = input.expoPushToken || input.nativeToken || input.uid || `anon_${Date.now()}`;
  const docId = sanitizeDocId(input.uid ? `${input.uid}_${input.platform}` : tokenSeed);
  const nowIso = new Date().toISOString();

  const record: PushTokenRecord = {
    id: docId,
    uid: input.uid || '',
    phone: input.phone || '',
    name: input.name || '',
    expoPushToken: input.expoPushToken || '',
    nativeToken: input.nativeToken || '',
    platform: input.platform || 'ios',
    deviceName: input.deviceName || '',
    active: true,
    updatedAt: nowIso,
  };

  await writeDoc(PUSH_TOKENS_COLLECTION, docId, record, true);

  // Mirror latest push tokens onto users/{uid} when logged in
  if (input.uid) {
    try {
      const userPatch: Record<string, any> = {
        pushPlatform: record.platform,
        pushUpdatedAt: nowIso,
      };
      if (record.expoPushToken) userPatch.expoPushToken = record.expoPushToken;
      if (record.nativeToken) userPatch.fcmToken = record.nativeToken;
      await writeDoc(USERS_COLLECTION, input.uid, userPatch, true);
    } catch (err) {
      console.warn('[notifications] failed mirroring token to user doc:', err);
    }
  }

  return record;
}

export async function getUserNotificationPreferences(uid?: string): Promise<UserNotificationPreferences> {
  if (!uid) return DEFAULT_NOTIFICATION_PREFERENCES;
  const userDoc = await readDoc(USERS_COLLECTION, uid);
  if (userDoc?.notificationPreferences && typeof userDoc.notificationPreferences === 'object') {
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...userDoc.notificationPreferences,
    };
  }
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

export async function saveUserNotificationPreferences(
  uid: string,
  preferences: Partial<UserNotificationPreferences>
): Promise<UserNotificationPreferences> {
  const merged: UserNotificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...preferences,
  };
  await writeDoc(
    USERS_COLLECTION,
    uid,
    {
      notificationPreferences: merged,
      notificationPreferencesUpdatedAt: new Date().toISOString(),
    },
    true
  );
  return merged;
}

export async function updateUserNotificationState(input: {
  uid: string;
  action: 'markRead' | 'markAllRead' | 'delete' | 'clearAll';
  notificationId?: string;
  notificationIds?: string[];
}): Promise<{ readIds: string[]; deletedIds: string[] }> {
  const userDoc = (await readDoc(USERS_COLLECTION, input.uid)) || {};
  const readSet = new Set<string>(Array.isArray(userDoc.notificationReadIds) ? userDoc.notificationReadIds : []);
  const delSet = new Set<string>(Array.isArray(userDoc.notificationDeletedIds) ? userDoc.notificationDeletedIds : []);

  if (input.action === 'markRead' && input.notificationId) {
    readSet.add(input.notificationId);
  } else if (input.action === 'markAllRead' && Array.isArray(input.notificationIds)) {
    input.notificationIds.forEach((id) => readSet.add(id));
  } else if (input.action === 'delete' && input.notificationId) {
    delSet.add(input.notificationId);
    readSet.add(input.notificationId);
  } else if (input.action === 'clearAll' && Array.isArray(input.notificationIds)) {
    input.notificationIds.forEach((id) => {
      delSet.add(id);
      readSet.add(id);
    });
  }

  const readIds = Array.from(readSet).slice(-500);
  const deletedIds = Array.from(delSet).slice(-500);

  await writeDoc(
    USERS_COLLECTION,
    input.uid,
    {
      notificationReadIds: readIds,
      notificationDeletedIds: deletedIds,
    },
    true
  );

  return { readIds, deletedIds };
}

export async function getAllNotifications(maxItems = 100): Promise<AppNotificationItem[]> {
  let raw: Record<string, any>[] = [];
  if (hasValidAdminCreds()) {
    try {
      const snap = await adminDb
        .collection(NOTIFICATIONS_COLLECTION)
        .orderBy('createdAtMs', 'desc')
        .limit(maxItems)
        .get();
      raw = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    } catch {
      raw = await listDocs(NOTIFICATIONS_COLLECTION, maxItems);
    }
  } else if (clientDb) {
    try {
      const q = query(
        collection(clientDb, NOTIFICATIONS_COLLECTION),
        orderBy('createdAtMs', 'desc'),
        limit(maxItems)
      );
      const snap = await getDocs(q);
      raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      raw = await listDocs(NOTIFICATIONS_COLLECTION, maxItems);
    }
  }

  return raw
    .map((d) => ({
      id: String(d.id),
      title: String(d.title || ''),
      subtitle: d.subtitle ? String(d.subtitle) : undefined,
      body: String(d.body || ''),
      ctaText: d.ctaText ? String(d.ctaText) : undefined,
      deliveryMode: (d.deliveryMode || 'push_and_inapp') as NotificationDeliveryMode,
      category: (d.category || 'system') as NotificationCategory,
      audience: (d.audience || 'all') as NotificationAudience,
      recipientUids: Array.isArray(d.recipientUids) ? d.recipientUids : [],
      recipientNames: Array.isArray(d.recipientNames) ? d.recipientNames : [],
      imageUrl: d.imageUrl || undefined,
      actionRoute: d.actionRoute || undefined,
      priority: (d.priority || 'normal') as NotificationPriority,
      createdAt: String(d.createdAt || new Date().toISOString()),
      createdAtMs: Number(d.createdAtMs || Date.parse(d.createdAt || '') || Date.now()),
      sentBy: d.sentBy || 'Admin',
      stats: d.stats || {
        totalTargets: 0,
        pushAttempted: 0,
        pushDelivered: 0,
        pushFailed: 0,
        expoDelivered: 0,
        fcmDelivered: 0,
      },
    }))
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export async function getCustomerNotifications(uid?: string, phone?: string): Promise<{
  notifications: AppNotificationItem[];
  readIds: string[];
  deletedIds: string[];
  preferences: UserNotificationPreferences;
}> {
  const [all, userDoc] = await Promise.all([
    getAllNotifications(80),
    uid ? readDoc(USERS_COLLECTION, uid) : Promise.resolve(null),
  ]);

  const readIds: string[] = Array.isArray(userDoc?.notificationReadIds) ? userDoc.notificationReadIds : [];
  const deletedIds: string[] = Array.isArray(userDoc?.notificationDeletedIds) ? userDoc.notificationDeletedIds : [];
  const delSet = new Set(deletedIds);

  const preferences: UserNotificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(userDoc?.notificationPreferences || {}),
  };

  const cleanPhone = (phone || '').replace(/\D/g, '');
  const phoneUid = cleanPhone ? `phone_${cleanPhone}` : '';

  const filtered = all.filter((n) => {
    if (delSet.has(n.id)) return false;
    if (n.deliveryMode === 'push_only') return false;
    if (n.audience === 'all') return true;
    if (!uid && !cleanPhone) return false;
    return n.recipientUids.some((target) => {
      if (uid && target === uid) return true;
      if (phoneUid && target === phoneUid) return true;
      if (cleanPhone && target.replace(/\D/g, '') === cleanPhone) return true;
      return false;
    });
  });

  return { notifications: filtered, readIds, deletedIds, preferences };
}

export async function getAdminNotificationOverview() {
  const [notifications, tokenDocs, userDocs] = await Promise.all([
    getAllNotifications(100),
    listDocs(PUSH_TOKENS_COLLECTION, 500),
    listDocs(USERS_COLLECTION, 500),
  ]);

  const activeTokens = tokenDocs.filter((t) => t.active !== false && (t.expoPushToken || t.nativeToken));
  const iosDevices = activeTokens.filter((t) => t.platform === 'ios').length;
  const androidDevices = activeTokens.filter((t) => t.platform === 'android').length;

  const tokenByUid = new Map<string, boolean>();
  activeTokens.forEach((t) => {
    if (t.uid) tokenByUid.set(String(t.uid), true);
  });

  const users = userDocs
    .map((u) => {
      const uid = String(u.id || u.uid || '');
      const hasPush = Boolean(tokenByUid.get(uid) || u.expoPushToken || u.fcmToken);
      return {
        uid,
        name: String(u.name || u.fullName || u.displayName || 'Seeker'),
        phone: String(u.phone || u.phoneNumber || ''),
        email: String(u.email || ''),
        hasPushToken: hasPush,
        platform: String(u.pushPlatform || ''),
      };
    })
    .filter((u) => u.uid)
    .sort((a, b) => Number(b.hasPushToken) - Number(a.hasPushToken));

  return {
    notifications,
    users,
    stats: {
      totalSent: notifications.length,
      totalDevices: activeTokens.length,
      iosDevices,
      androidDevices,
      totalUsers: users.length,
    },
  };
}

export async function deleteNotificationById(id: string): Promise<void> {
  await removeDoc(NOTIFICATIONS_COLLECTION, id);
}

async function dispatchExpoPush(
  tokens: string[],
  payload: {
    id: string;
    title: string;
    subtitle?: string;
    body: string;
    ctaText?: string;
    category: NotificationCategory;
    actionRoute?: string;
    imageUrl?: string;
    priority: NotificationPriority;
  }
): Promise<{ delivered: number; failed: number; invalidTokens: string[] }> {
  let delivered = 0;
  let failed = 0;
  const invalidTokens: string[] = [];

  const resolvedImageUrl =
    payload.imageUrl && payload.imageUrl.trim().length > 0
      ? payload.imageUrl.trim()
      : 'https://astroparihar.com/assets/images/notification_logo.png';

  for (let i = 0; i < tokens.length; i += 100) {
    const chunk = tokens.slice(i, i + 100);
    const messages = chunk.map((to) => ({
      to,
      sound: 'default',
      title: payload.title,
      ...(payload.subtitle ? { subtitle: payload.subtitle } : {}),
      body: payload.body,
      priority: payload.priority === 'high' ? 'high' : 'default',
      interruptionLevel: payload.priority === 'high' ? 'time-sensitive' : 'active',
      mutableContent: true,
      richContent: { image: resolvedImageUrl },
      channelId: 'astroparihar_default',
      data: {
        notificationId: payload.id,
        category: payload.category,
        actionRoute: payload.actionRoute || '/notifications-screen',
        imageUrl: payload.imageUrl || '',
        subtitle: payload.subtitle || '',
        ctaText: payload.ctaText || '',
      },
    }));

    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
      const json = await res.json();
      const tickets: any[] = Array.isArray(json?.data) ? json.data : [];
      tickets.forEach((ticket, idx) => {
        if (ticket?.status === 'ok') {
          delivered += 1;
        } else {
          failed += 1;
          if (ticket?.details?.error === 'DeviceNotRegistered') {
            invalidTokens.push(chunk[idx]);
          }
        }
      });
      if (tickets.length === 0 && !res.ok) {
        failed += chunk.length;
      }
    } catch (err) {
      console.warn('[notifications] Expo push batch error:', err);
      failed += chunk.length;
    }
  }

  return { delivered, failed, invalidTokens };
}

async function dispatchFcmPush(
  tokens: string[],
  payload: {
    id: string;
    title: string;
    subtitle?: string;
    body: string;
    ctaText?: string;
    category: NotificationCategory;
    actionRoute?: string;
    imageUrl?: string;
    priority: NotificationPriority;
  }
): Promise<{ delivered: number; failed: number; errorDetail?: string }> {
  if (tokens.length === 0) {
    return { delivered: 0, failed: 0 };
  }
  if (!hasValidAdminCreds()) {
    return { delivered: 0, failed: tokens.length, errorDetail: 'Firebase Admin credentials missing or invalid in server environment' };
  }

  let delivered = 0;
  let failed = 0;
  let errorDetail: string | undefined;

  // Default full-color AstroParihar emblem shown on lockscreen notifications when no custom banner image is set
  const resolvedImageUrl =
    payload.imageUrl && payload.imageUrl.trim().length > 0
      ? payload.imageUrl.trim()
      : 'https://astroparihar.com/assets/images/notification_logo.png';

  // Dispatch directly via adminMessaging.send() in parallel to avoid HTTP/2 multicast proxy issues
  const results = await Promise.all(
    tokens.map(async (token) => {
      try {
        await adminMessaging.send({
          token,
          notification: {
            title: payload.title,
            body: payload.subtitle ? `${payload.subtitle} — ${payload.body}` : payload.body,
            imageUrl: resolvedImageUrl,
          },
          data: {
            notificationId: payload.id,
            category: payload.category,
            actionRoute: payload.actionRoute || '/notifications-screen',
            subtitle: payload.subtitle || '',
            ctaText: payload.ctaText || '',
            imageUrl: payload.imageUrl || '',
          },
          android: {
            priority: payload.priority === 'high' ? 'high' : 'normal',
            notification: {
              channelId: 'astroparihar_default',
              icon: 'notification_icon',
              color: '#C9A84C',
              sound: 'default',
              priority: 'max',
              visibility: 'public',
              defaultSound: true,
              defaultVibrateTimings: true,
              imageUrl: resolvedImageUrl,
            },
          },
          apns: {
            headers: {
              'apns-priority': payload.priority === 'high' ? '10' : '5',
            },
            payload: {
              aps: {
                sound: 'default',
                mutableContent: Boolean(payload.imageUrl),
                alert: {
                  title: payload.title,
                  ...(payload.subtitle ? { subtitle: payload.subtitle } : {}),
                  body: payload.body,
                },
              },
            },
          },
        });
        return { success: true };
      } catch (err: any) {
        console.warn('[notifications] FCM send error for token:', err);
        return { success: false, error: err?.message || String(err) };
      }
    })
  );

  results.forEach((r) => {
    if (r.success) {
      delivered += 1;
    } else {
      failed += 1;
      if (!errorDetail && r.error) {
        errorDetail = r.error;
      }
    }
  });

  return { delivered, failed, errorDetail };
}

export async function sendDynamicNotification(
  input: SendNotificationPayload
): Promise<AppNotificationItem> {
  const nowMs = Date.now();
  const id = `notif_${nowMs}_${Math.random().toString(36).slice(2, 7)}`;
  const recipientUids = input.audience === 'specific' ? (input.recipientUids || []).filter(Boolean) : [];
  const recipientNames = input.audience === 'specific' ? (input.recipientNames || []).filter(Boolean) : [];
  const priority: NotificationPriority = input.priority || 'high';
  const deliveryMode: NotificationDeliveryMode = input.deliveryMode || 'push_and_inapp';

  const notification: AppNotificationItem = {
    id,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || '',
    body: input.body.trim(),
    ctaText: input.ctaText?.trim() || '',
    deliveryMode,
    category: input.category || 'system',
    audience: input.audience || 'all',
    recipientUids,
    recipientNames,
    imageUrl: input.imageUrl?.trim() || '',
    actionRoute: input.actionRoute?.trim() || '/notifications-screen',
    priority,
    createdAt: new Date(nowMs).toISOString(),
    createdAtMs: nowMs,
    sentBy: input.sentBy || 'Admin',
    stats: {
      totalTargets: 0,
      pushAttempted: 0,
      pushDelivered: 0,
      pushFailed: 0,
      expoDelivered: 0,
      fcmDelivered: 0,
    },
  };

  // 1. Persist notification first so history & in-app inbox see it immediately
  await writeDoc(NOTIFICATIONS_COLLECTION, id, notification, false);

  // 2. Collect eligible push tokens (respecting audience & user category preferences)
  const [tokenDocs, userDocs] = await Promise.all([
    listDocs(PUSH_TOKENS_COLLECTION, 500),
    listDocs(USERS_COLLECTION, 500),
  ]);

  if (deliveryMode === 'inapp_only') {
    notification.stats = {
      totalTargets: input.audience === 'specific' ? recipientUids.length : userDocs.length,
      pushAttempted: 0,
      pushDelivered: 0,
      pushFailed: 0,
      expoDelivered: 0,
      fcmDelivered: 0,
    };
    await writeDoc(NOTIFICATIONS_COLLECTION, id, { stats: notification.stats }, true);
    return notification;
  }

  const userPrefsByUid = new Map<string, UserNotificationPreferences>();
  userDocs.forEach((u) => {
    const uid = String(u.id || u.uid || '');
    if (uid) {
      userPrefsByUid.set(uid, {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(u.notificationPreferences || {}),
      });
    }
  });

  const targetUidSet = new Set(recipientUids);
  const targetCleanPhones = new Set(recipientUids.map((r) => r.replace(/\D/g, '')).filter(Boolean));

  const expoTokens = new Set<string>();
  const fcmTokens = new Set<string>();

  const shouldDeliverToUid = (uid?: string, phone?: string): boolean => {
    if (input.audience === 'specific') {
      const clean = (phone || '').replace(/\D/g, '');
      const matched =
        (uid && targetUidSet.has(uid)) ||
        (clean && targetCleanPhones.has(clean));
      if (!matched) return false;
    }

    if (uid && userPrefsByUid.has(uid)) {
      const prefs = userPrefsByUid.get(uid)!;
      if (!prefs.enabled) return false;
      if (input.category !== 'system' && prefs[input.category] === false) return false;
    }
    return true;
  };

  // Tokens from app_push_tokens collection
  tokenDocs.forEach((t) => {
    if (t.active === false) return;
    if (!shouldDeliverToUid(t.uid, t.phone)) return;

    if (isExpoToken(t.expoPushToken)) {
      expoTokens.add(t.expoPushToken);
    } else if (t.nativeToken && typeof t.nativeToken === 'string' && t.platform === 'android') {
      fcmTokens.add(t.nativeToken);
    }
  });

  // Fallback: tokens stored directly on user docs
  userDocs.forEach((u) => {
    const uid = String(u.id || u.uid || '');
    if (!shouldDeliverToUid(uid, u.phone)) return;

    if (isExpoToken(u.expoPushToken)) {
      expoTokens.add(u.expoPushToken);
    } else if (u.fcmToken && typeof u.fcmToken === 'string' && u.pushPlatform === 'android') {
      fcmTokens.add(u.fcmToken);
    }
  });

  const expoList = Array.from(expoTokens);
  const fcmList = Array.from(fcmTokens);
  const pushAttempted = expoList.length + fcmList.length;

  // 3. Dispatch lock-screen pushes in parallel
  const [expoRes, fcmRes] = await Promise.all([
    expoList.length > 0
      ? dispatchExpoPush(expoList, {
          id,
          title: notification.title,
          subtitle: notification.subtitle,
          body: notification.body,
          ctaText: notification.ctaText,
          category: notification.category,
          actionRoute: notification.actionRoute,
          imageUrl: notification.imageUrl,
          priority,
        })
      : Promise.resolve({ delivered: 0, failed: 0, invalidTokens: [] as string[] }),
    fcmList.length > 0
      ? dispatchFcmPush(fcmList, {
          id,
          title: notification.title,
          subtitle: notification.subtitle,
          body: notification.body,
          ctaText: notification.ctaText,
          category: notification.category,
          actionRoute: notification.actionRoute,
          imageUrl: notification.imageUrl,
          priority,
        })
      : Promise.resolve({ delivered: 0, failed: 0, errorDetail: undefined as string | undefined }),
  ]);

  // Deactivate stale Expo tokens
  if (expoRes.invalidTokens.length > 0) {
    const invalidSet = new Set(expoRes.invalidTokens);
    for (const t of tokenDocs) {
      if (t.expoPushToken && invalidSet.has(t.expoPushToken)) {
        await writeDoc(PUSH_TOKENS_COLLECTION, t.id, { active: false }, true).catch(() => {});
      }
    }
  }

  notification.stats = {
    totalTargets: input.audience === 'specific' ? recipientUids.length : Math.max(userDocs.length, pushAttempted),
    pushAttempted,
    pushDelivered: expoRes.delivered + fcmRes.delivered,
    pushFailed: expoRes.failed + fcmRes.failed,
    expoDelivered: expoRes.delivered,
    fcmDelivered: fcmRes.delivered,
    ...(fcmRes.errorDetail ? { errorDetail: fcmRes.errorDetail } : {}),
  };

  await writeDoc(NOTIFICATIONS_COLLECTION, id, { stats: notification.stats }, true);

  return notification;
}
