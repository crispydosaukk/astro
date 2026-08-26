import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Extract digits and remove the plus sign
    const cleanPhone = phone.replace(/\D/g, '');

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      return NextResponse.json(
        { error: 'Server configuration error (MSG91 keys missing)' },
        { status: 500 }
      );
    }

    const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanPhone}`;

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
      return NextResponse.json({ error: data.message || 'Failed to send OTP' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
