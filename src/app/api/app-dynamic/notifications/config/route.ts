import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { db as clientDb } from '@/lib/firebase/config';
import {
  DEFAULT_NOTIFICATION_TEMPLATES_CONFIG,
  sanitizeNotificationConfig,
  type NotificationTemplatesConfig,
} from '@/lib/notificationTemplatesConfig';

const CONFIG_COLLECTION = 'app_notifications_config';
const CONFIG_DOC_ID = 'templates_and_categories';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

async function readNotificationTemplatesConfig(): Promise<NotificationTemplatesConfig> {
  try {
    const snap = await adminDb.collection(CONFIG_COLLECTION).doc(CONFIG_DOC_ID).get();
    if (snap.exists) {
      return sanitizeNotificationConfig(snap.data() as Partial<NotificationTemplatesConfig>);
    }
  } catch (err) {
    console.warn('[notifications/config] adminDb read failed, trying clientDb:', err);
    if (clientDb) {
      try {
        const snap = await getDoc(doc(clientDb, CONFIG_COLLECTION, CONFIG_DOC_ID));
        if (snap.exists()) {
          return sanitizeNotificationConfig(snap.data() as Partial<NotificationTemplatesConfig>);
        }
      } catch (clientErr) {
        console.warn('[notifications/config] clientDb read failed:', clientErr);
      }
    }
  }

  return DEFAULT_NOTIFICATION_TEMPLATES_CONFIG;
}

async function writeNotificationTemplatesConfig(
  config: NotificationTemplatesConfig
): Promise<NotificationTemplatesConfig> {
  const sanitized = sanitizeNotificationConfig({
    ...config,
    updatedAt: new Date().toISOString(),
  });

  try {
    await adminDb.collection(CONFIG_COLLECTION).doc(CONFIG_DOC_ID).set(sanitized, { merge: false });
    return sanitized;
  } catch (err) {
    console.warn('[notifications/config] adminDb write failed, trying clientDb:', err);
    if (clientDb) {
      await setDoc(doc(clientDb, CONFIG_COLLECTION, CONFIG_DOC_ID), sanitized, { merge: false });
      return sanitized;
    }
    throw err;
  }
}

export async function GET() {
  try {
    const config = await readNotificationTemplatesConfig();
    return NextResponse.json(
      {
        success: true,
        config,
        categories: config.categories,
        templates: config.templates,
        autoLoadOnOpen: config.autoLoadOnOpen,
        autoLoadOnCategoryChange: config.autoLoadOnCategoryChange,
        settingsScreen: config.settingsScreen,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[API /notifications/config GET] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to load notification templates & categories',
        config: DEFAULT_NOTIFICATION_TEMPLATES_CONFIG,
        categories: DEFAULT_NOTIFICATION_TEMPLATES_CONFIG.categories,
        templates: DEFAULT_NOTIFICATION_TEMPLATES_CONFIG.templates,
        autoLoadOnOpen: DEFAULT_NOTIFICATION_TEMPLATES_CONFIG.autoLoadOnOpen,
        autoLoadOnCategoryChange: DEFAULT_NOTIFICATION_TEMPLATES_CONFIG.autoLoadOnCategoryChange,
        settingsScreen: DEFAULT_NOTIFICATION_TEMPLATES_CONFIG.settingsScreen,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload: Partial<NotificationTemplatesConfig> =
      body?.config && typeof body.config === 'object' ? body.config : body;

    const existing = await readNotificationTemplatesConfig();
    const mergedInput: Partial<NotificationTemplatesConfig> = {
      categories: Array.isArray(payload?.categories) ? payload.categories : existing.categories,
      templates: Array.isArray(payload?.templates) ? payload.templates : existing.templates,
      autoLoadOnOpen:
        typeof payload?.autoLoadOnOpen === 'boolean'
          ? payload.autoLoadOnOpen
          : existing.autoLoadOnOpen,
      autoLoadOnCategoryChange:
        typeof payload?.autoLoadOnCategoryChange === 'boolean'
          ? payload.autoLoadOnCategoryChange
          : existing.autoLoadOnCategoryChange,
      settingsScreen:
        payload?.settingsScreen && typeof payload.settingsScreen === 'object'
          ? { ...existing.settingsScreen, ...payload.settingsScreen }
          : existing.settingsScreen,
    };

    const saved = await writeNotificationTemplatesConfig(
      sanitizeNotificationConfig(mergedInput)
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Notification settings, categories & templates saved successfully',
        config: saved,
        categories: saved.categories,
        templates: saved.templates,
        autoLoadOnOpen: saved.autoLoadOnOpen,
        autoLoadOnCategoryChange: saved.autoLoadOnCategoryChange,
        settingsScreen: saved.settingsScreen,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[API /notifications/config POST] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to save notification templates & categories',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
