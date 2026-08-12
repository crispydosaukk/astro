import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSettings } from '@/lib/settings';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userEmail, amount, displayAmount, currency } = body;

    if (!userId || !amount || amount <= 0 || !displayAmount || !currency) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Fetch dynamic settings
    const settings = await getSettings();
    const secretKey = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-07-29.dahlia' as any,
    });

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: (userEmail && userEmail !== 'demo@example.com') ? userEmail : undefined,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Wallet Top-up',
              description: 'Add funds to your AstroParihar wallet',
              images: ['https://astroparihar.com/AstroParihar_Logo.png'],
            },
            unit_amount: Math.round(displayAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/wallet/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/wallet`,
      metadata: {
        userId: userId,
        userEmail: userEmail || 'No Email Provided',
        type: 'Wallet Top-up',
        amount: amount.toString(),
      },
    });

    // Import admin dynamically or at top. We will import at top.
    const { adminDb } = await import('@/lib/firebase/admin');
    
    // Create pending transaction in Firestore
    await adminDb.collection('users').doc(userId).collection('wallet_transactions').doc(session.id).set({
      amount: amount,
      type: 'credit',
      status: 'failed', // Default to failed, verify API will mark it as completed
      date: new Date().toISOString(),
      description: 'Wallet Recharge',
      stripeSessionId: session.id,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe wallet session error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
