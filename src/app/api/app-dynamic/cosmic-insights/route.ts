import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_COSMIC_INSIGHTS, CosmicInsightCard } from '@/lib/appDynamicContent';
import { NO_CACHE_CORS_HEADERS, stripUndefinedDeep } from '@/lib/noCacheHeaders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COLLECTION_NAME = 'app_dynamic_content';
const INSIGHTS_DOC_ID = 'cosmic_insights';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: NO_CACHE_CORS_HEADERS });
}

export async function GET() {
  try {
    const snap = await adminDb.collection(COLLECTION_NAME).doc(INSIGHTS_DOC_ID).get();
    if (snap.exists && Array.isArray(snap.data()?.insights)) {
      const insights = (snap.data()!.insights as CosmicInsightCard[]).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      return NextResponse.json(
        { success: true, insights, updatedAt: snap.data()?.updatedAt || null },
        { headers: NO_CACHE_CORS_HEADERS }
      );
    }
    return NextResponse.json(
      { success: true, insights: DEFAULT_COSMIC_INSIGHTS },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching cosmic insights:', error);
    return NextResponse.json(
      { success: true, insights: DEFAULT_COSMIC_INSIGHTS, fallback: true },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insights } = body;

    if (!Array.isArray(insights)) {
      return NextResponse.json(
        { success: false, error: 'insights must be an array' },
        { status: 400, headers: NO_CACHE_CORS_HEADERS }
      );
    }

    const updatedAt = new Date().toISOString();
    const cleanInsights = stripUndefinedDeep(
      insights.map((c: CosmicInsightCard, idx: number) => ({
        ...c,
        order: c.order ?? idx + 1,
        updatedAt,
      }))
    );

    await adminDb
      .collection(COLLECTION_NAME)
      .doc(INSIGHTS_DOC_ID)
      .set({ insights: cleanInsights, updatedAt }, { merge: true });

    return NextResponse.json(
      { success: true, message: 'Cosmic insights updated successfully', insights: cleanInsights, updatedAt },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error saving cosmic insights:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save cosmic insights' },
      { status: 500, headers: NO_CACHE_CORS_HEADERS }
    );
  }
}
