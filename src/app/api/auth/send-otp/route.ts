import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    
    // Clean phone number (remove +)
    const mobile = phone.replace('+', '');

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      return NextResponse.json(
        { error: 'MSG91 credentials not configured in environment variables.' },
        { status: 500 }
      );
    }

    const url = 'https://control.msg91.com/api/v5/otp';
    const options = {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: mobile,
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (data.type === 'error') {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
