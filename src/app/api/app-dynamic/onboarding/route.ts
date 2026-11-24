import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_ONBOARDING_SLIDES, AppOnboardingSlide } from '@/lib/appDynamicContent';
import { NO_CACHE_CORS_HEADERS, stripUndefinedDeep } from '@/lib/noCacheHeaders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COLLECTION_NAME = 'app_dynamic_content';
const DOC_ID = 'onboarding_slides';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: NO_CACHE_CORS_HEADERS });
}

export async function GET() {
  try {
    const snap = await adminDb.collection(COLLECTION_NAME).doc(DOC_ID).get();
    if (snap.exists && Array.isArray(snap.data()?.slides)) {
      const slides = (snap.data()!.slides as AppOnboardingSlide[]).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      return NextResponse.json(
        { success: true, slides, updatedAt: snap.data()?.updatedAt || null },
        { headers: NO_CACHE_CORS_HEADERS }
      );
    }
    return NextResponse.json(
      { success: true, slides: DEFAULT_ONBOARDING_SLIDES },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching dynamic onboarding slides:', error);
    return NextResponse.json(
      { success: true, slides: DEFAULT_ONBOARDING_SLIDES, fallback: true },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slides } = body;

    if (!Array.isArray(slides)) {
      return NextResponse.json(
        { success: false, error: 'slides must be an array' },
        { status: 400, headers: NO_CACHE_CORS_HEADERS }
      );
    }

    const updatedAt = new Date().toISOString();
    const cleanSlides = stripUndefinedDeep(
      slides.map((s: AppOnboardingSlide, idx: number) => ({
        ...s,
        order: s.order ?? idx + 1,
        updatedAt,
      }))
    );

    await adminDb
      .collection(COLLECTION_NAME)
      .doc(DOC_ID)
      .set({ slides: cleanSlides, updatedAt }, { merge: true });

    return NextResponse.json(
      { success: true, message: 'Onboarding slides updated successfully', slides: cleanSlides, updatedAt },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error saving dynamic onboarding slides:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save slides' },
      { status: 500, headers: NO_CACHE_CORS_HEADERS }
    );
  }
}
