import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSettings } from '@/lib/settings';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Fetch settings and initialize Stripe
    const settings = await getSettings();
    const secretKey =
      settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

    const stripe = new Stripe(secretKey, {
      apiVersion: '2026-07-29.dahlia' as any,
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    const { userId, amount } = session.metadata || {};
    const parsedAmount = parseFloat(amount || '0');

    if (!userId || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 });
    }

    // Check if this transaction has already been processed to avoid double crediting
    const transactionRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('wallet_transactions')
      .doc(sessionId);
    const transactionDoc = await transactionRef.get();

    if (transactionDoc.exists && transactionDoc.data()?.status === 'completed') {
      return NextResponse.json({ message: 'Transaction already processed', balanceUpdated: false });
    }

    // Update user's wallet balance and record transaction in a batch
    const batch = adminDb.batch();
    const userRef = adminDb.collection('users').doc(userId);

    // Increment the balance (if field doesn't exist, it will be initialized)
    // To do an increment in admin SDK: admin.firestore.FieldValue.increment(amount)
    // Since we don't have 'firebase-admin' imported properly for FieldValue, we will read the user first.
    const userDoc = await userRef.get();
    let currentBalance = 0;
    if (userDoc.exists) {
      const data = userDoc.data();
      currentBalance = data?.walletBalance || 0;
    }

    batch.set(userRef, { walletBalance: currentBalance + parsedAmount }, { merge: true });

    // Record the transaction
    batch.set(transactionRef, {
      amount: parsedAmount,
      type: 'credit',
      status: 'completed',
      date: new Date().toISOString(),
      description: 'Wallet Top-up via Stripe',
      stripeSessionId: sessionId,
    });

    await batch.commit();

    return NextResponse.json({
      message: 'Wallet updated successfully',
      balanceUpdated: true,
      newBalance: currentBalance + parsedAmount,
    });
  } catch (error: any) {
    console.error('Verify wallet session error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
