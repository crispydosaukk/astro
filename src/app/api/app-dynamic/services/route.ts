import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_APP_SERVICES,
  AppServiceCategory,
} from '@/lib/appDynamicContent';
import { NO_CACHE_CORS_HEADERS, stripUndefinedDeep } from '@/lib/noCacheHeaders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COLLECTION_NAME = 'app_dynamic_content';
const SERVICE_CATEGORIES_DOC_ID = 'app_service_categories';
const SERVICES_DOC_ID = 'app_services';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: NO_CACHE_CORS_HEADERS });
}

async function readCategoriesFromAdmin(): Promise<AppServiceCategory[]> {
  const snap = await adminDb.collection(COLLECTION_NAME).doc(SERVICE_CATEGORIES_DOC_ID).get();
  if (snap.exists && Array.isArray(snap.data()?.categories) && snap.data()!.categories.length > 0) {
    return (snap.data()!.categories as AppServiceCategory[]).sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  }
  return DEFAULT_SERVICE_CATEGORIES;
}

export async function GET() {
  try {
    const categories = await readCategoriesFromAdmin();
    const services = categories.flatMap((c) => c.items || []);
    return NextResponse.json(
      { success: true, categories, services },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching app service categories:', error);
    return NextResponse.json(
      { success: true, categories: DEFAULT_SERVICE_CATEGORIES, services: DEFAULT_APP_SERVICES, fallback: true },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories, services } = body;
    const updatedAt = new Date().toISOString();

    if (Array.isArray(categories)) {
      const cleanCategories = stripUndefinedDeep(
        categories.map((cat: AppServiceCategory, idx: number) => ({
          ...cat,
          order: cat.order ?? idx + 1,
          updatedAt,
          items: Array.isArray(cat.items)
            ? cat.items.map((it, i) => ({ ...it, order: it.order ?? i + 1 }))
            : [],
        }))
      );
      await adminDb
        .collection(COLLECTION_NAME)
        .doc(SERVICE_CATEGORIES_DOC_ID)
        .set({ categories: cleanCategories, updatedAt }, { merge: true });
    }

    if (Array.isArray(services)) {
      const cleanServices = stripUndefinedDeep(services);
      await adminDb
        .collection(COLLECTION_NAME)
        .doc(SERVICES_DOC_ID)
        .set({ services: cleanServices, updatedAt }, { merge: true });
    }

    const updatedCategories = await readCategoriesFromAdmin();
    return NextResponse.json(
      {
        success: true,
        message: 'App services and categories updated successfully',
        categories: updatedCategories,
        updatedAt,
      },
      { headers: NO_CACHE_CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error saving app services/categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save app services' },
      { status: 500, headers: NO_CACHE_CORS_HEADERS }
    );
  }
}
