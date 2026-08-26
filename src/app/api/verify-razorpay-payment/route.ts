import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSettings } from '@/lib/settings';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentType, // 'wallet' or 'report'
      userId,
      amount,
      reportDetails,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    // Fetch Razorpay Secret Key dynamically from Platform Settings
    const dbSettings = await getSettings();
    const key_secret = (
      process.env.RAZORPAY_KEY_SECRET ||
      dbSettings?.razorpayKeySecret ||
      ''
    ).trim();

    if (!key_secret) {
      return NextResponse.json(
        { error: 'Razorpay Secret Key missing in settings' },
        { status: 500 }
      );
    }

    // Verify HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Razorpay signature mismatch:', { expectedSignature, razorpay_signature });
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    // Process Post-Payment Execution
    if ((paymentType === 'wallet' || paymentType === 'wallet_recharge') && userId) {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const currentBalance = userSnap.exists() ? userSnap.data()?.walletBalance || 0 : 0;
      const rechargeAmount = Number(amount) || 0;
      const newBalance = currentBalance + rechargeAmount;

      await setDoc(userRef, { walletBalance: newBalance }, { merge: true });

      // Record transaction
      await addDoc(collection(db, 'users', userId, 'wallet_transactions'), {
        userId,
        amount: rechargeAmount,
        type: 'credit',
        description: `Wallet Recharge (Razorpay #${razorpay_payment_id})`,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'success',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Wallet balance updated successfully',
        newBalance,
      });
    }

    if (paymentType === 'report' && reportDetails) {
      // Store completed service report in Firestore
      const reportTitle = reportDetails.type || 'Custom Report';
      const detailsStr = reportDetails.details
        ? `Dob: ${reportDetails.details.dob || ''}, Time: ${reportDetails.details.time || ''}, Place: ${reportDetails.details.place || ''}`
        : '';

      const generatedContent = JSON.stringify({
        recommendationTitle: `Astrological Report: ${reportTitle}`,
        recommendationName: `${reportTitle} Insights`,
        timing: 'Immediate Delivery',
        duration: 'Lifetime Guidance',
        materials: 'Personalized Kundli & Planetary Transits',
        astrologicalAnalysis: `Comprehensive astrological analysis for ${reportTitle}. ${detailsStr}. Your planetary chart has been analyzed according to Vedic astrological principles.`,
        procedure:
          'Perform daily morning meditation, chant relevant mantras for weak planets, and consult with our expert astrologers for deeper custom solutions.',
      });

      await addDoc(collection(db, 'service_requests'), {
        userId: reportDetails.userId || userId || 'guest',
        userEmail: reportDetails.userEmail || '',
        type: reportTitle,
        serviceId: reportDetails.serviceId || 'remedy',
        details: reportDetails.details || {},
        displayAmount: reportDetails.displayAmount || amount || 99,
        currency: reportDetails.currency || 'inr',
        reportContent: generatedContent,
        status: 'completed',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        createdAt: serverTimestamp(),
      });

      return NextResponse.json({
        success: true,
        message: 'Report generated and saved successfully',
      });
    }

    return NextResponse.json({ success: true, message: 'Payment verified' });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing payment verification' },
      { status: 500 }
    );
  }
}
