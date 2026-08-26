import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSettings } from '@/lib/settings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', notes = {} } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    // Fetch dynamic Razorpay API credentials from Platform Settings or env variables
    const dbSettings = await getSettings();
    const key_id = (
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      dbSettings?.razorpayKeyId ||
      ''
    ).trim();
    const key_secret = (
      process.env.RAZORPAY_KEY_SECRET ||
      dbSettings?.razorpayKeySecret ||
      ''
    ).trim();

    if (
      !key_id ||
      !key_secret ||
      key_id === 'PLACEHOLDER_KEY' ||
      key_secret === 'PLACEHOLDER_SECRET'
    ) {
      console.error('Razorpay API keys not configured in Admin Dashboard platform settings');
      return NextResponse.json(
        {
          error:
            'Razorpay API keys are not configured in platform settings. Please configure them in the Admin Dashboard.',
        },
        { status: 500 }
      );
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    // Razorpay expects amount in smallest currency subunit (paise for INR, cents for USD)
    const amountInSubunits = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInSubunits,
      currency: (currency || 'INR').toUpperCase(),
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      notes: notes,
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
      key: key_id,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Razorpay payment order' },
      { status: 500 }
    );
  }
}
