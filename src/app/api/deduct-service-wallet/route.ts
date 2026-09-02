import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      userEmail = '',
      amount = 0,
      serviceId = 'service',
      serviceTitle = 'Astrology Service',
      serviceType = 'report',
      details = {},
      reportData = null,
      currency = 'inr',
      pdfUrl = '',
    } = body;

    if (!userId || userId === 'guest-user') {
      return NextResponse.json(
        { error: 'User must be authenticated to use wallet balance' },
        { status: 401 }
      );
    }

    const numAmount = Number(amount) || 0;

    // 1. Fetch user's current wallet balance
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    const currentBalance = Number(userData?.walletBalance) || 0;

    // 2. Check if user has sufficient wallet balance
    if (currentBalance < numAmount) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. Available: ₹${currentBalance}, Required: ₹${numAmount}`,
          availableBalance: currentBalance,
          requiredAmount: numAmount,
          isInsufficient: true,
        },
        { status: 400 }
      );
    }

    // 3. Deduct amount from wallet balance
    const newBalance = Math.max(0, currentBalance - numAmount);
    await setDoc(userRef, { walletBalance: newBalance }, { merge: true });

    // 4. Record debit transaction in user's wallet_transactions subcollection
    const txDoc = await addDoc(collection(db, 'users', userId, 'wallet_transactions'), {
      userId,
      amount: numAmount,
      type: 'debit',
      description: `Service Order: ${serviceTitle}`,
      serviceId,
      serviceType,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'success',
      paymentMethod: 'wallet',
    });

    // 5. Build structured report content
    const detailsStr = details
      ? Object.entries(details)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      : '';

    const generatedContent = JSON.stringify({
      recommendationTitle: `Astrological Report: ${serviceTitle}`,
      recommendationName: `${serviceTitle} Insights`,
      timing: 'Immediate Delivery (Wallet Deducted)',
      duration: 'Lifetime Guidance',
      materials: 'Personalized Kundli, Transit & Vedic Calculations',
      astrologicalAnalysis: `Comprehensive astrological analysis for ${serviceTitle}. ${detailsStr}. Planetary alignments and personalized insights calculated accurately based on ancient Vedic texts.`,
      procedure:
        'Perform daily morning meditation, chant relevant mantras for weak planets, and consult with our expert astrologers for deeper custom remedies.',
      ...(pdfUrl ? { pdfUrl } : {}),
    });

    // 6. Save completed request to `service_requests` collection
    const requestDoc = await addDoc(collection(db, 'service_requests'), {
      userId,
      userEmail: userEmail || userData?.email || '',
      type: serviceTitle,
      serviceId,
      details,
      displayAmount: numAmount,
      currency: currency.toLowerCase(),
      reportContent: generatedContent,
      reportData: reportData || null,
      status: 'completed',
      paymentId: `wallet_${txDoc.id}`,
      orderId: `wallet_ord_${Date.now()}`,
      paymentMethod: 'wallet',
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: `Report generated successfully! ₹${numAmount} deducted from wallet.`,
      newBalance,
      requestId: requestDoc.id,
      transactionId: txDoc.id,
    });
  } catch (error: any) {
    console.error('Error processing wallet service deduction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process wallet service deduction' },
      { status: 500 }
    );
  }
}
