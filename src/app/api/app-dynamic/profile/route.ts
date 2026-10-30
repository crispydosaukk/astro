import { NextRequest, NextResponse } from 'next/server';
import {
  getAppProfileConfig,
  saveAppProfileConfig,
  DEFAULT_APP_PROFILE_CONFIG,
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
    const config = await getAppProfileConfig();
    return NextResponse.json(
      { success: true, config },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error fetching dynamic profile config:', error);
    return NextResponse.json(
      { success: true, config: DEFAULT_APP_PROFILE_CONFIG, fallback: true },
      { headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config || typeof config !== 'object' || !Array.isArray(config.sections)) {
      return NextResponse.json(
        { success: false, error: 'config must be an object with sections array' },
        { status: 400, headers: corsHeaders }
      );
    }

    await saveAppProfileConfig(config);
    return NextResponse.json(
      {
        success: true,
        message: 'Profile configuration updated successfully',
        config,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error saving dynamic profile config:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save profile config' },
      { status: 500, headers: corsHeaders }
    );
  }
}
