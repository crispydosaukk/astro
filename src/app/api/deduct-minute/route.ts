import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { consultationId } = await req.json();

    if (!consultationId) {
      return NextResponse.json({ error: 'Missing consultation ID' }, { status: 400 });
    }

    const consultationRef = adminDb.collection('consultations').doc(consultationId);

    // We run a transaction to securely deduct balance
    let remainingBalance = 0;

    await adminDb.runTransaction(async (transaction: any) => {
      const consultationDoc = await transaction.get(consultationRef);

      if (!consultationDoc.exists) {
        throw new Error('Consultation not found');
      }

      const consultationData = consultationDoc.data();
      const customerId = consultationData?.customerId;
      const pricePerMin = consultationData?.price || 0;
      const transactionId = consultationData?.transactionId;

      if (!customerId || !transactionId) {
        throw new Error('Invalid consultation data');
      }

      const userRef = adminDb.collection('users').doc(customerId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('Customer not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;

      if (currentBalance < pricePerMin) {
        throw new Error('Insufficient balance');
      }

      // Deduct balance
      remainingBalance = currentBalance - pricePerMin;
      transaction.update(userRef, {
        walletBalance: remainingBalance,
      });

      // Update existing wallet transaction record
      const walletTxRef = adminDb
        .collection('users')
        .doc(customerId)
        .collection('wallet_transactions')
        .doc(transactionId);
      const newTotalAmount = (consultationData.totalBilledAmount || pricePerMin) + pricePerMin;

      transaction.update(walletTxRef, {
        amount: newTotalAmount,
      });

      // Update consultation stats
      transaction.update(consultationRef, {
        billedMinutes: (consultationData.billedMinutes || 1) + 1,
        totalBilledAmount: newTotalAmount,
      });
    });

    return NextResponse.json({ success: true, remainingBalance });
  } catch (error: any) {
    console.error('Deduct minute error:', error);
    // Return a 402 Payment Required status to signal the client to disconnect
    if (error.message === 'Insufficient balance') {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
