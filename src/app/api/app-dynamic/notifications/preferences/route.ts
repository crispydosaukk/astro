import { NextRequest, NextResponse } from 'next/server';
import {
  getUserNotificationPreferences,
  saveUserNotificationPreferences,
} from '@/lib/notificationService';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid') || undefined;
    const preferences = await getUserNotificationPreferences(uid);
    return NextResponse.json({ success: true, preferences }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API /notifications/preferences GET] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch preferences' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uid = String(body?.uid || '').trim();
    const preferences = body?.preferences;

    if (!uid || !preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { success: false, error: 'uid and preferences object are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const saved = await saveUserNotificationPreferences(uid, preferences);
    return NextResponse.json({ success: true, preferences: saved }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API /notifications/preferences POST] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save preferences' },
      { status: 500, headers: corsHeaders }
    );
  }
}
