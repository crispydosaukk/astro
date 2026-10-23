import { NextRequest, NextResponse } from 'next/server';
import { getCosmicInsights, saveCosmicInsights, DEFAULT_COSMIC_INSIGHTS } from '@/lib/appDynamicContent';

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
    const insights = await getCosmicInsights();
    return NextResponse.json(
      { success: true, insights },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching cosmic insights:', error);
    return NextResponse.json(
      { success: true, insights: DEFAULT_COSMIC_INSIGHTS, fallback: true },
      { headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    await saveCosmicInsights(insights);
    return NextResponse.json(
      { success: true, message: 'Cosmic insights updated successfully', insights },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving cosmic insights:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save cosmic insights' },
      { status: 500, headers: corsHeaders }
    );
  }
}
