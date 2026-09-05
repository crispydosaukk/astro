import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateReportDataInternal } from '@/lib/reportGenerator';

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

    // 1. Fetch user's current wallet balance via adminDb
    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
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
    await userRef.set({ walletBalance: newBalance }, { merge: true });

    // 4. Record debit transaction in user's wallet_transactions subcollection
    const txDoc = await adminDb.collection('users').doc(userId).collection('wallet_transactions').add({
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

    // 5. Generate authentic, dynamic Vedic AI report using admin prompts
    let dynamicReportData = reportData;
    try {
      dynamicReportData = await generateReportDataInternal(
        serviceTitle,
        { ...(details || {}), serviceId },
        reportData
      );
    } catch (aiErr) {
      console.warn('Error synthesizing AI report in wallet deduction:', aiErr);
    }

    const generatedContent = JSON.stringify({
      ...(dynamicReportData || {}),
      recommendationTitle: dynamicReportData?.recommendationTitle || `Astrological Report: ${serviceTitle}`,
      recommendationName: dynamicReportData?.recommendationName || `${serviceTitle} Insights`,
      timing: dynamicReportData?.timing || 'Immediate Delivery (Wallet Deducted)',
      duration: dynamicReportData?.duration || 'Lifetime Guidance',
      ...(pdfUrl ? { pdfUrl } : {}),
    });

    // 6. Save completed request to `service_requests` collection
    const requestDoc = await adminDb.collection('service_requests').add({
      userId,
      userEmail: userEmail || userData?.email || '',
      type: serviceTitle,
      serviceId,
      details,
      displayAmount: numAmount,
      currency: currency.toLowerCase(),
      reportContent: generatedContent,
      reportData: dynamicReportData || null,
      status: 'completed',
      paymentId: `wallet_${txDoc.id}`,
      orderId: `wallet_ord_${Date.now()}`,
      paymentMethod: 'wallet',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Report generated successfully! ₹${numAmount} deducted from wallet.`,
      newBalance,
      requestId: requestDoc.id,
      transactionId: txDoc.id,
      reportData: dynamicReportData,
    });
  } catch (error: any) {
    console.error('Error processing wallet service deduction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process wallet service deduction' },
      { status: 500 }
    );
  }
}
