import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    
    // Clean phone number (remove +)
    const mobile = phone.replace('+', '');

    const authKey = process.env.MSG91_AUTH_KEY;

    if (!authKey) {
      return NextResponse.json(
        { error: 'MSG91 credentials not configured in environment variables.' },
        { status: 500 }
      );
    }

    const url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${mobile}`;
    const options = {
      method: 'GET',
      headers: {
        'authkey': authKey,
      },
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (data.type === 'error') {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    // OTP Verified Successfully!
    // Generate Firebase Custom Token
    const uid = phone; // Using the E.164 phone number as UID
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ success: true, token: customToken });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
