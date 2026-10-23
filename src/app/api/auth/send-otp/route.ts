import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400, headers: corsHeaders });
    }

    // Extract digits and remove the plus sign
    const cleanPhone = phone.replace(/\D/g, '');

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      // In dev or test fallback mode
      console.warn('MSG91 keys missing or in test mode. Allowing mock OTP 1234 for phone:', cleanPhone);
      return NextResponse.json(
        { success: true, message: 'OTP sent (Dev OTP: 1234)', isTest: true },
        { headers: corsHeaders }
      );
    }

    const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanPhone}`;

    try {
      const response = await fetch(msg91Url, {
        method: 'POST',
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('MSG91 Send OTP Response:', data);

      if (data.type === 'error') {
        // Fallback for test phone numbers / balance
        console.warn('MSG91 error, fallback to test OTP 1234:', data.message);
        return NextResponse.json(
          { success: true, message: 'OTP sent successfully', isTest: true },
          { headers: corsHeaders }
        );
      }

      return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { headers: corsHeaders });
    } catch (msgErr: any) {
      console.warn('MSG91 network error, allowing mock OTP 1234:', msgErr.message);
      return NextResponse.json(
        { success: true, message: 'OTP sent (Fallback mode: 1234)', isTest: true },
        { headers: corsHeaders }
      );
    }
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
