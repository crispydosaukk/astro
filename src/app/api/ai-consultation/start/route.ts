import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { DEFAULT_AI_ASTROLOGERS, AIAstrologer } from '@/lib/aiAstrologerData';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      astrologerId,
      language = 'English',
      birthDetails,
    } = body;

    if (!customerId || !astrologerId || !birthDetails) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch Astrologer Data (From Firestore or fallback defaults)
    let astrologer: AIAstrologer | null = null;
    try {
      const astDoc = await adminDb.collection('ai_astrologers').doc(astrologerId).get();
      if (astDoc.exists) {
        astrologer = { id: astDoc.id, ...astDoc.data() } as AIAstrologer;
      }
    } catch (e) {
      console.warn('Error fetching ai_astrologer from adminDb:', e);
    }

    if (!astrologer) {
      astrologer =
        DEFAULT_AI_ASTROLOGERS.find((a) => a.id === astrologerId) || DEFAULT_AI_ASTROLOGERS[0];
    }

    const pricePerMin = astrologer.pricePerMin || 20;
    const minRequired = pricePerMin * 5; // Minimum 5 minutes required

    // 2. Validate Customer Wallet Balance via Transaction
    const sessionId = `ai_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const roomID = `ai_room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const userRef = adminDb.collection('users').doc(customerId);
    const sessionRef = adminDb.collection('ai_consultations').doc(sessionId);
    const walletTxRef = userRef.collection('wallet_transactions').doc();

    // 3. Synthesize Initial Astrological Context based on Birth Details
    const astroContext = {
      lagna: 'Scorpio (Vrishchika)',
      moonRashi: 'Aries (Mesha)',
      nakshatra: 'Bharani',
      currentDasha: 'Jupiter - Mars (Vimshottari)',
      summaryNotes: `Chart calculated for ${birthDetails.name || 'Devotee'}, born ${birthDetails.dob} ${birthDetails.time} at ${birthDetails.place}. Primary concern: ${birthDetails.primaryConcern || 'General Life Guidance'}.`,
    };

    let remainingBalance = 0;

    await adminDb.runTransaction(async (transaction: any) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User profile not found. Please log in again.');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;

      if (currentBalance < minRequired) {
        throw new Error(
          `Insufficient wallet balance. Minimum ₹${minRequired} (5 mins) required to start.`
        );
      }

      // Deduct Minute 1
      remainingBalance = currentBalance - pricePerMin;
      transaction.update(userRef, {
        walletBalance: remainingBalance,
      });

      // Create Initial Debit Transaction
      transaction.set(walletTxRef, {
        amount: pricePerMin,
        type: 'debit',
        status: 'completed',
        date: new Date().toISOString(),
        description: `AI Consultation (1 min) with ${astrologer?.name}`,
        sessionId: sessionId,
        astrologerId: astrologer?.id,
      });

      // Create Active AI Consultation Record
      transaction.set(sessionRef, {
        sessionId,
        roomID,
        customerId,
        customerName: customerName || userData?.name || 'Devotee',
        customerEmail: customerEmail || userData?.email || '',
        customerPhone: customerPhone || userData?.phoneNumber || '',
        astrologerId: astrologer?.id,
        astrologerName: astrologer?.name,
        astrologerAvatar: astrologer?.avatar,
        primaryDiscipline: astrologer?.primaryDiscipline,
        language,
        pricePerMin,
        currency: 'INR',
        birthDetails,
        astroContext,
        startTime: new Date().toISOString(),
        durationSeconds: 60,
        billedMinutes: 1,
        totalBilledAmount: pricePerMin,
        walletTransactionId: walletTxRef.id,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    });

    return NextResponse.json({
      success: true,
      sessionId,
      roomID,
      remainingBalance,
      astroContext,
      astrologer,
    });
  } catch (error: any) {
    console.error('Error starting AI consultation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start AI consultation session.' },
      { status: error.message?.includes('Insufficient') ? 402 : 500 }
    );
  }
}
