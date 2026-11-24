import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  DEFAULT_APP_PROFILE_CONFIG,
  PROFILE_CONFIG_DOC_ID,
  AppProfileConfig,
} from '@/lib/appDynamicContent';
import { NO_CACHE_CORS_HEADERS, stripUndefinedDeep } from '@/lib/noCacheHeaders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COLLECTION_NAME = 'app_dynamic_content';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: NO_CACHE_CORS_HEADERS });
}

export async function GET() {
  try {
    const snap = await adminDb.collection(COLLECTION_NAME).doc(PROFILE_CONFIG_DOC_ID).get();
    const raw = snap.exists ? (snap.data()?.config as Partial<AppProfileConfig>) : null;
    const config: AppProfileConfig = raw
      ? { ...DEFAULT_APP_PROFILE_CONFIG, ...raw }
      : DEFAULT_APP_PROFILE_CONFIG;
    return NextResponse.json(
      { success: true, config, updatedAt: snap.data()?.updatedAt || config.updatedAt || null },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching dynamic profile config:', error);
    return NextResponse.json(
      { success: true, config: DEFAULT_APP_PROFILE_CONFIG, fallback: true },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config || typeof config !== 'object' || !Array.isArray(config.sections)) {
      return NextResponse.json(
        { success: false, error: 'config must be an object with sections array' },
        { status: 400, headers: NO_CACHE_CORS_HEADERS }
      );
    }

    const updatedAt = new Date().toISOString();
    const merged: AppProfileConfig = stripUndefinedDeep({
      ...DEFAULT_APP_PROFILE_CONFIG,
      ...config,
      updatedAt,
    });

    await adminDb
      .collection(COLLECTION_NAME)
      .doc(PROFILE_CONFIG_DOC_ID)
      .set(
        {
          config: merged,
          updatedAt,
        },
        { merge: true }
      );

    return NextResponse.json(
      {
        success: true,
        message: 'Profile configuration updated successfully',
        config: merged,
        updatedAt,
      },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error saving dynamic profile config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save profile config' },
      { status: 500, headers: NO_CACHE_CORS_HEADERS }
    );
  }
}
