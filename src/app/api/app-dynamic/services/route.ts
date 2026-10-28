import { NextRequest, NextResponse } from 'next/server';
import {
  getAppServiceCategories,
  saveAppServiceCategories,
  getAppServices,
  saveAppServices,
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_APP_SERVICES,
} from '@/lib/appDynamicContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const categories = await getAppServiceCategories();
    const services = categories.flatMap((c) => c.items);
    return NextResponse.json(
      { success: true, categories, services },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching app service categories:', error);
    return NextResponse.json(
      { success: true, categories: DEFAULT_SERVICE_CATEGORIES, services: DEFAULT_APP_SERVICES, fallback: true },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories, services } = body;

    if (Array.isArray(categories)) {
      await saveAppServiceCategories(categories);
    }
    if (Array.isArray(services)) {
      await saveAppServices(services);
    }

    const updatedCategories = await getAppServiceCategories();
    return NextResponse.json(
      {
        success: true,
        message: 'App services and categories updated successfully',
        categories: updatedCategories,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving app services/categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save app services' },
      { status: 500, headers: corsHeaders }
    );
  }
}
