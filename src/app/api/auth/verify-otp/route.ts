import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
    }

    // Extract digits
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = '+' + cleanPhone; // Firebase expects E.164

    const authKey = process.env.MSG91_AUTH_KEY;
    if (!authKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const msg91Url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${cleanPhone}`;

    const response = await fetch(msg91Url, {
      method: 'GET',
      headers: {
        authkey: authKey,
      },
    });

    const data = await response.json();
    console.log('MSG91 Verify OTP Response:', data);

    if (data.type === 'error') {
      return NextResponse.json({ error: data.message || 'Invalid OTP' }, { status: 400 });
    }

    // Successfully verified. Mint a custom Firebase token.
    // Create a deterministic UID based on the phone number
    const uid = `phone_${cleanPhone}`;

    // Create the custom token
    const customToken = await adminAuth.createCustomToken(uid, {
      phoneNumber: formattedPhone,
    });

    return NextResponse.json({ success: true, token: customToken });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
