import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  DEFAULT_REMEDIES_CATALOG,
  mergeRemediesCatalog,
  REMEDIES_CATALOG_DOC_ID,
  RemediesCatalogData,
} from '@/lib/remediesCatalogDefaults';
import {
  ASTROPARIHAR_HOMAMS,
  ASTROPARIHAR_MANTRAS,
  generate48DayRemedyProtocol,
} from '@/lib/vedicRemediesEngine';
import { NO_CACHE_CORS_HEADERS, stripUndefinedDeep } from '@/lib/noCacheHeaders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const corsHeaders = NO_CACHE_CORS_HEADERS;

const COLLECTION_NAME = 'app_dynamic_content';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') || 'Career & Financial Growth';

    const protocol = generate48DayRemedyProtocol({ domain, concern: domain });

    let catalog: RemediesCatalogData = DEFAULT_REMEDIES_CATALOG;
    try {
      const snap = await adminDb.collection(COLLECTION_NAME).doc(REMEDIES_CATALOG_DOC_ID).get();
      if (snap.exists) {
        const raw = snap.data()?.catalog as Partial<RemediesCatalogData> | undefined;
        catalog = mergeRemediesCatalog(raw);
      }
    } catch (e) {
      console.warn('[remedies GET] Firestore read fallback to defaults:', e);
    }

    return NextResponse.json(
      {
        success: true,
        ashtaDirections: catalog.ashtaDirections,
        remedyProfiles: catalog.remedyProfiles,
        navagrahaMantras: catalog.navagrahaMantras,
        yantras: catalog.yantras,
        classicalHomams: catalog.classicalHomams,
        deities: catalog.deities,
        gems: catalog.gems,
        mukhis: catalog.mukhis,
        vastuDirections: catalog.vastuDirections,
        charities: catalog.charities,
        catalog,
        homams: ASTROPARIHAR_HOMAMS,
        mantras: ASTROPARIHAR_MANTRAS,
        protocol,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching remedies in app-dynamic:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch remedies',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { catalog, reset } = body || {};

    const nextCatalog: RemediesCatalogData = reset
      ? { ...DEFAULT_REMEDIES_CATALOG, updatedAt: new Date().toISOString() }
      : mergeRemediesCatalog({
          ...(catalog || {}),
          updatedAt: new Date().toISOString(),
        });

    const cleanCatalog = stripUndefinedDeep(nextCatalog);
    await adminDb
      .collection(COLLECTION_NAME)
      .doc(REMEDIES_CATALOG_DOC_ID)
      .set(
        {
          catalog: cleanCatalog,
          updatedAt: cleanCatalog.updatedAt,
        },
        { merge: true }
      );

    return NextResponse.json(
      {
        success: true,
        message: reset ? 'Remedies catalog reset to defaults' : 'Remedies catalog saved successfully',
        catalog: nextCatalog,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving remedies catalog:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save remedies catalog',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
