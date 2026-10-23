import { NextRequest, NextResponse } from 'next/server';
import { getAppBanners, saveAppBanners, DEFAULT_APP_BANNERS } from '@/lib/appDynamicContent';

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
    const banners = await getAppBanners();
    return NextResponse.json(
      { success: true, banners },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching dynamic banners:', error);
    return NextResponse.json(
      { success: true, banners: DEFAULT_APP_BANNERS, fallback: true },
      { headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    await saveAppBanners(banners);
    return NextResponse.json(
      { success: true, message: 'Banners updated successfully', banners },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving dynamic banners:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save banners' },
      { status: 500, headers: corsHeaders }
    );
  }
}
