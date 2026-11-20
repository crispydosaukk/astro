import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  DEFAULT_SERVICE_DETAIL_PAGES,
  SERVICE_DETAILS_DOC_ID,
  AppServiceDetailPagesContent,
  mergeServiceDetailPages,
} from '@/lib/appDynamicContent';

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
    const page = searchParams.get('page');

    const snap = await adminDb.collection(COLLECTION_NAME).doc(SERVICE_DETAILS_DOC_ID).get();
    const raw = snap.exists ? (snap.data()?.content as Partial<AppServiceDetailPagesContent>) : null;
    const content = mergeServiceDetailPages(raw);

    if (page && page in content) {
      return NextResponse.json(
        { success: true, [page]: (content as any)[page], shared: content.shared },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true, content }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error fetching dynamic service details:', error);
    return NextResponse.json(
      { success: true, content: DEFAULT_SERVICE_DETAIL_PAGES, fallback: true },
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

    const merged = mergeServiceDetailPages(content);
    merged.updatedAt = new Date().toISOString();

    await adminDb
      .collection(COLLECTION_NAME)
      .doc(SERVICE_DETAILS_DOC_ID)
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
        message: 'Service detail pages updated successfully',
        content: merged,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving dynamic service details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save service detail pages' },
      { status: 500, headers: corsHeaders }
    );
  }
}
