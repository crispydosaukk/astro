import { NextRequest, NextResponse } from 'next/server';
import { getAppOnboardingSlides, saveAppOnboardingSlides, DEFAULT_ONBOARDING_SLIDES } from '@/lib/appDynamicContent';

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
    const slides = await getAppOnboardingSlides();
    return NextResponse.json(
      { success: true, slides },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching dynamic onboarding slides:', error);
    return NextResponse.json(
      { success: true, slides: DEFAULT_ONBOARDING_SLIDES, fallback: true },
      { headers: corsHeaders }
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
        { status: 400, headers: corsHeaders }
      );
    }

    await saveAppOnboardingSlides(slides);
    return NextResponse.json(
      { success: true, message: 'Onboarding slides updated successfully', slides },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving dynamic onboarding slides:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save slides' },
      { status: 500, headers: corsHeaders }
    );
  }
}
