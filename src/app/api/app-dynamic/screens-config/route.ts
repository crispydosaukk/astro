import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  ALL_SCREENS_CMS_DOC_ID,
  AppScreensCmsConfig,
  AppScreensCmsSectionKey,
  DEFAULT_APP_SCREENS_CMS,
  mergeAppScreensCms,
} from '@/lib/appScreensCmsConfig';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const COLLECTION_NAME = 'app_dynamic_content';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') as AppScreensCmsSectionKey | null;

    const snap = await adminDb.collection(COLLECTION_NAME).doc(ALL_SCREENS_CMS_DOC_ID).get();
    const raw = snap.exists ? (snap.data()?.config as Partial<AppScreensCmsConfig>) : null;
    const config = mergeAppScreensCms(raw);

    if (section && section in config) {
      return NextResponse.json(
        { success: true, section, data: (config as any)[section], updatedAt: config.updatedAt },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, config, updatedAt: config.updatedAt || null },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[screens-config GET] error:', error);
    return NextResponse.json(
      { success: true, config: DEFAULT_APP_SCREENS_CMS, fallback: true },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data, config: fullConfig, resetSection } = body || {};

    const docRef = adminDb.collection(COLLECTION_NAME).doc(ALL_SCREENS_CMS_DOC_ID);
    const existingSnap = await docRef.get();
    const existingRaw = existingSnap.exists
      ? (existingSnap.data()?.config as Partial<AppScreensCmsConfig>)
      : {};
    const current = mergeAppScreensCms(existingRaw);

    let nextConfig: AppScreensCmsConfig;

    if (resetSection && typeof resetSection === 'string' && resetSection in DEFAULT_APP_SCREENS_CMS) {
      const key = resetSection as AppScreensCmsSectionKey;
      nextConfig = {
        ...current,
        [key]: (DEFAULT_APP_SCREENS_CMS as any)[key],
        updatedAt: new Date().toISOString(),
      };
    } else if (section && typeof section === 'string' && section in DEFAULT_APP_SCREENS_CMS) {
      if (data === undefined || typeof data !== 'object' || data === null) {
        return NextResponse.json(
          { success: false, error: 'data must be an object when saving a section' },
          { status: 400, headers: corsHeaders }
        );
      }
      const key = section as AppScreensCmsSectionKey;
      nextConfig = mergeAppScreensCms({
        ...current,
        [key]: data,
        updatedAt: new Date().toISOString(),
      });
    } else if (fullConfig && typeof fullConfig === 'object') {
      nextConfig = mergeAppScreensCms({
        ...fullConfig,
        updatedAt: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide either { section, data }, { config }, or { resetSection }' },
        { status: 400, headers: corsHeaders }
      );
    }

    await docRef.set(
      {
        config: nextConfig,
        updatedAt: nextConfig.updatedAt,
      },
      { merge: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: resetSection
          ? `Reset "${resetSection}" to defaults`
          : section
          ? `Saved "${section}" successfully`
          : 'Saved all screens CMS configuration successfully',
        config: nextConfig,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[screens-config POST] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save screens CMS config' },
      { status: 500, headers: corsHeaders }
    );
  }
}
