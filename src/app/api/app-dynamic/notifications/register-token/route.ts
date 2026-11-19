import { NextRequest, NextResponse } from 'next/server';
import { registerDevicePushToken } from '@/lib/notificationService';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const expoPushToken = typeof body?.expoPushToken === 'string' ? body.expoPushToken.trim() : '';
    const nativeToken = typeof body?.nativeToken === 'string' ? body.nativeToken.trim() : '';

    if (!expoPushToken && !nativeToken) {
      return NextResponse.json(
        { success: false, error: 'At least one push token (expoPushToken or nativeToken) is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const platform =
      body?.platform === 'android' ? 'android' : body?.platform === 'web' ? 'web' : 'ios';

    const record = await registerDevicePushToken({
      uid: body?.uid ? String(body.uid) : undefined,
      phone: body?.phone ? String(body.phone) : undefined,
      name: body?.name ? String(body.name) : undefined,
      expoPushToken: expoPushToken || undefined,
      nativeToken: nativeToken || undefined,
      platform,
      deviceName: body?.deviceName ? String(body.deviceName) : undefined,
    });

    return NextResponse.json({ success: true, record }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API /notifications/register-token POST] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register device push token' },
      { status: 500, headers: corsHeaders }
    );
  }
}
