import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_APP_BANNERS, AppBanner } from '@/lib/appDynamicContent';
import { NO_CACHE_CORS_HEADERS, stripUndefinedDeep } from '@/lib/noCacheHeaders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COLLECTION_NAME = 'app_dynamic_content';
const BANNERS_DOC_ID = 'home_banners';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: NO_CACHE_CORS_HEADERS });
}

export async function GET() {
  try {
    const snap = await adminDb.collection(COLLECTION_NAME).doc(BANNERS_DOC_ID).get();
    if (snap.exists && Array.isArray(snap.data()?.banners)) {
      const banners = (snap.data()!.banners as AppBanner[]).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      return NextResponse.json(
        { success: true, banners, updatedAt: snap.data()?.updatedAt || null },
        { headers: NO_CACHE_CORS_HEADERS }
      );
    }
    return NextResponse.json(
      { success: true, banners: DEFAULT_APP_BANNERS },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching dynamic banners:', error);
    return NextResponse.json(
      { success: true, banners: DEFAULT_APP_BANNERS, fallback: true },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { banners } = body;

    if (!Array.isArray(banners)) {
      return NextResponse.json(
        { success: false, error: 'banners must be an array' },
        { status: 400, headers: NO_CACHE_CORS_HEADERS }
      );
    }

    const updatedAt = new Date().toISOString();
    const cleanBanners = stripUndefinedDeep(
      banners.map((b: AppBanner, idx: number) => ({
        ...b,
        order: b.order ?? idx + 1,
        updatedAt,
      }))
    );

    await adminDb
      .collection(COLLECTION_NAME)
      .doc(BANNERS_DOC_ID)
      .set({ banners: cleanBanners, updatedAt }, { merge: true });

    return NextResponse.json(
      { success: true, message: 'Banners updated successfully', banners: cleanBanners, updatedAt },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error saving dynamic banners:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save banners' },
      { status: 500, headers: NO_CACHE_CORS_HEADERS }
    );
  }
}
