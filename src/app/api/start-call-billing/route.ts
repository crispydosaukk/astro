import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { consultationId } = await req.json();

    if (!consultationId) {
      return NextResponse.json({ error: 'Missing consultation ID' }, { status: 400 });
    }

    const consultationRef = adminDb.collection('consultations').doc(consultationId);

    // We run a transaction to securely deduct balance and mark as billed
    await adminDb.runTransaction(async (transaction: any) => {
      const consultationDoc = await transaction.get(consultationRef);

      if (!consultationDoc.exists) {
        throw new Error('Consultation not found');
      }

      const consultationData = consultationDoc.data();

      if (consultationData?.billed) {
        // Already billed, do nothing to prevent double charging
        return;
      }

      const customerId = consultationData?.customerId;
      const price = consultationData?.price || 0;

      if (!customerId) {
        throw new Error('Customer ID missing from consultation');
      }

      const userRef = adminDb.collection('users').doc(customerId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('Customer not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;

      // Allow negative balance if they somehow join with exactly 0, but they shouldn't be able to book
      if (currentBalance < price) {
        console.warn(
          `User ${customerId} had insufficient balance during join, but billing anyway.`
        );
      }

      // Deduct balance
      transaction.update(userRef, {
        walletBalance: currentBalance - price,
      });

      // Add wallet transaction record
      const walletTxRef = adminDb
        .collection('users')
        .doc(customerId)
        .collection('wallet_transactions')
        .doc();
      transaction.set(walletTxRef, {
        amount: price,
        type: 'debit',
        status: 'completed',
        date: new Date().toISOString(),
        description: `Consultation with ${consultationData?.astrologerName || 'Astrologer'}`,
        consultationId: consultationId,
      });

      // Update consultation status to billed and save the transaction ID
      transaction.update(consultationRef, {
        billed: true,
        billedAt: new Date().toISOString(),
        billedMinutes: 1,
        totalBilledAmount: price,
        transactionId: walletTxRef.id,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Start call billing error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
