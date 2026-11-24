import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  DEFAULT_SUPPORT_LEGAL_CONTENT,
  SUPPORT_LEGAL_DOC_ID,
  AppSupportLegalContent,
} from '@/lib/appDynamicContent';
import { NO_CACHE_CORS_HEADERS, stripUndefinedDeep } from '@/lib/noCacheHeaders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const corsHeaders = NO_CACHE_CORS_HEADERS;

const COLLECTION_NAME = 'app_dynamic_content';

function mergeSupportLegal(partial?: Partial<AppSupportLegalContent> | null): AppSupportLegalContent {
  const c = partial || {};
  return {
    helpCentre: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.helpCentre, ...(c.helpCentre || {}) },
    contactSupport: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.contactSupport, ...(c.contactSupport || {}) },
    terms: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.terms, ...(c.terms || {}) },
    privacyPolicy: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.privacyPolicy, ...(c.privacyPolicy || {}) },
    privacyScreen: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.privacyScreen, ...(c.privacyScreen || {}) },
    securityScreen: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.securityScreen, ...(c.securityScreen || {}) },
    preferencesScreen: {
      ...(DEFAULT_SUPPORT_LEGAL_CONTENT.preferencesScreen!),
      ...(c.preferencesScreen || {}),
    },
    updatedAt: c.updatedAt,
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const snap = await adminDb.collection(COLLECTION_NAME).doc(SUPPORT_LEGAL_DOC_ID).get();
    const raw = snap.exists ? (snap.data()?.content as Partial<AppSupportLegalContent>) : null;
    const content = mergeSupportLegal(raw);

    if (section && section in content) {
      return NextResponse.json(
        { success: true, [section]: (content as any)[section] },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, content }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching dynamic support legal content:', error);
    return NextResponse.json(
      { success: true, content: DEFAULT_SUPPORT_LEGAL_CONTENT, fallback: true },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { success: false, error: 'content must be an object' },
        { status: 400, headers: corsHeaders }
      );
    }

    const merged = stripUndefinedDeep(mergeSupportLegal(content));
    merged.updatedAt = new Date().toISOString();

    await adminDb
      .collection(COLLECTION_NAME)
      .doc(SUPPORT_LEGAL_DOC_ID)
      .set(
        {
          content: merged,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    return NextResponse.json(
      {
        success: true,
        message: 'Support & Legal content updated successfully',
        content: merged,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving support & legal content:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save content' },
      { status: 500, headers: corsHeaders }
    );
  }
}
