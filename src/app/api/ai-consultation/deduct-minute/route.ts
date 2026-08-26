import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const sessionRef = adminDb.collection('ai_consultations').doc(sessionId);
    let remainingBalance = 0;
    let newBilledMinutes = 1;
    let newTotalAmount = 0;

    await adminDb.runTransaction(async (transaction: any) => {
      const sessionDoc = await transaction.get(sessionRef);
      if (!sessionDoc.exists) {
        throw new Error('Consultation session not found');
      }

      const sessionData = sessionDoc.data();
      if (sessionData.status !== 'active') {
        throw new Error(`Session is already ${sessionData.status}`);
      }

      const customerId = sessionData.customerId;
      const pricePerMin = sessionData.pricePerMin || 20;
      const txId = sessionData.walletTransactionId;

      const userRef = adminDb.collection('users').doc(customerId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;

      if (currentBalance < pricePerMin) {
        // Insufficient funds for the next minute: Mark session as terminated due to low balance
        transaction.update(sessionRef, {
          status: 'terminated_low_balance',
          endTime: new Date().toISOString(),
        });
        throw new Error('Insufficient balance');
      }

      // Deduct balance for this minute
      remainingBalance = currentBalance - pricePerMin;
      newBilledMinutes = (sessionData.billedMinutes || 1) + 1;
      newTotalAmount = (sessionData.totalBilledAmount || pricePerMin) + pricePerMin;

      transaction.update(userRef, {
        walletBalance: remainingBalance,
      });

      // Update Session Stats
      transaction.update(sessionRef, {
        billedMinutes: newBilledMinutes,
        durationSeconds: newBilledMinutes * 60,
        totalBilledAmount: newTotalAmount,
        lastHeartbeat: new Date().toISOString(),
      });

      // Update Wallet Transaction Record if present
      if (txId) {
        const walletTxRef = userRef.collection('wallet_transactions').doc(txId);
        transaction.update(walletTxRef, {
          amount: newTotalAmount,
          description: `AI Consultation (${newBilledMinutes} mins) with ${sessionData.astrologerName}`,
        });
      }
    });

    return NextResponse.json({
      success: true,
      remainingBalance,
      billedMinutes: newBilledMinutes,
      totalBilledAmount: newTotalAmount,
    });
  } catch (error: any) {
    console.error('Deduct AI minute error:', error);
    if (error.message === 'Insufficient balance') {
      return NextResponse.json(
        { error: 'Insufficient balance', remainingBalance: 0, terminated: true },
        { status: 402 }
      );
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
