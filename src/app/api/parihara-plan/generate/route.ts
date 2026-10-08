import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getPricingSettings } from '@/lib/settings';
import { calculateBirthChartData, formatChartSummaryForAI } from '@/lib/vedicAstrologyEngine';
import { resolveVedicRemedies, generate48DayRemedyProtocol } from '@/lib/vedicRemediesEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      userEmail,
      name,
      gender = 'Male',
      dob,
      time = '12:00',
      place = 'New Delhi, India',
      primaryConcern = 'Career, Wealth & Planetary Dosha Relief',
      paymentMethod = 'wallet', // 'wallet' or 'razorpay'
      razorpayPaymentId,
    } = body;

    if (!userId || !dob) {
      return NextResponse.json(
        { error: 'Missing required parameters (userId, dob)' },
        { status: 400 }
      );
    }

    // 1. Fetch Dynamic Parihara Plan Price from Platform Settings
    const pricing = await getPricingSettings();
    const pariharaPrice = Number(pricing.pariharaPlanPrice) || 499;

    let remainingBalance = 0;

    // 2. Handle Wallet Payment
    if (paymentMethod === 'wallet') {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      const userData = userSnap.data();
      const currentBalance = Number(userData?.walletBalance) || 0;

      if (currentBalance < pariharaPrice) {
        return NextResponse.json(
          {
            error: `Insufficient wallet balance. Complete Parihara Plan requires ₹${pariharaPrice}, but your wallet has ₹${currentBalance}.`,
            isInsufficient: true,
            requiredAmount: pariharaPrice,
            availableBalance: currentBalance,
          },
          { status: 402 }
        );
      }

      remainingBalance = currentBalance - pariharaPrice;

      // Update user wallet
      await userRef.update({
        walletBalance: remainingBalance,
      });

      // Record transaction
      await userRef.collection('wallet_transactions').add({
        userId,
        amount: pariharaPrice,
        type: 'debit',
        description: `Complete Parihara Plan Blueprint (₹${pariharaPrice})`,
        serviceType: 'parihara-plan',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'completed',
        paymentMethod: 'wallet',
      });
    }

    // 3. Synthesize Authentic Janam Kundli & 8-Fold Sacred Parihara Plan
    let birthChart: any = null;
    try {
      birthChart = calculateBirthChartData(
        dob,
        time,
        place,
        '28.6139',
        '77.2090',
        name || 'Devotee',
        gender
      );
    } catch (e) {
      console.warn('Error calculating birth chart for parihara plan:', e);
    }

    const resolvedRemedies = resolveVedicRemedies({
      concern: primaryConcern,
      lagna: birthChart?.ascendant || 'Aries',
      moonRashi: birthChart?.moonSign || 'Taurus',
      dasha: birthChart ? `${birthChart.dasha.currentMahadasha} - ${birthChart.dasha.currentAntardasha}` : 'Jupiter Mahadasha',
      name: name || 'Devotee',
    });

    const protocol48 = generate48DayRemedyProtocol({
      domain: primaryConcern,
      concern: primaryConcern,
    });

    const ishtaDeity = birthChart?.ishtaDevata?.deityName || 'Bhagavan Shiva / Sri Mahavishnu';
    const lagnaSign = birthChart?.ascendant || 'Vedic Ascendant';
    const moonSign = birthChart?.moonSign || 'Vedic Moon';
    const nakshatra = birthChart?.nakshatra || 'Auspicious Nakshatra';
    const currentDasha = birthChart
      ? `${birthChart.dasha.currentMahadasha} Mahadasha (${birthChart.dasha.currentAntardasha} Antardasha)`
      : 'Active Mahadasha Phase';

    // Construct Complete 8-Fold Parihara Plan Payload
    const completePlanData = {
      title: 'Complete 8-Fold Vedic Parihara Plan',
      planPrice: pariharaPrice,
      devoteeName: name || 'Devotee',
      gender,
      birthDetails: { dob, time, place, primaryConcern },
      astrologicalFoundation: {
        lagna: lagnaSign,
        moonSign,
        nakshatra,
        currentDasha,
        ishtaDevata: ishtaDeity,
        chartSummary: birthChart ? formatChartSummaryForAI(birthChart) : 'Vedic Janam Kundli synthesized.',
      },
      // The 8 Sacred Remedies
      eightSacredRemedies: [
        {
          id: 'remedy-1-mantra',
          number: 1,
          category: 'Mantra Shakti (मन्त्र शक्ति)',
          direction: 'North (N)',
          title: resolvedRemedies.primaryMantra.title,
          deity: resolvedRemedies.primaryMantra.deity,
          sanskritMantra: resolvedRemedies.primaryMantra.sanskrit,
          transliteration: resolvedRemedies.primaryMantra.transliteration,
          prescribedCount: '108 repetitions daily on Rudraksha/Tulsi mala at Brahma Muhurtha',
          benefits: 'Purifies subtle energy channels, pacifies malefic dasha vibrations, and elevates mental clarity.',
        },
        {
          id: 'remedy-2-yantra',
          number: 2,
          category: 'Yantra Sthapana (यन्त्र प्रतिष्ठा)',
          direction: 'North-East (NE)',
          title: `${resolvedRemedies.primaryHomam.deity} Sacred Yantra`,
          placementZone: 'North-East (Ishanya) or Home Puja Altar',
          energizationMethod: 'Wash with Ganga Jal & Panchamrit, offer white flowers and sandal paste on Friday/Monday morning.',
          benefits: 'Harmonizes spatial energy vortexes and shields dwelling against malefic astrological transits.',
        },
        {
          id: 'remedy-3-homa',
          number: 3,
          category: 'Homa / Havan (हवन एवं अग्नि अनुष्ठान)',
          direction: 'East (E)',
          title: resolvedRemedies.primaryHomam.name,
          deity: resolvedRemedies.primaryHomam.deity,
          timing: resolvedRemedies.primaryHomam.day,
          ahutisCount: '108 or 1,008 Ahutis with consecrated herbs, guggul, cow ghee and samidha sticks',
          benefits: resolvedRemedies.primaryHomam.benefits || resolvedRemedies.primaryHomam.purpose,
        },
        {
          id: 'remedy-4-ishta',
          number: 4,
          category: 'Devata Upasana (इष्टदेवता उपासना)',
          direction: 'South-East (SE)',
          title: `Surrender & Devotion to ${ishtaDeity}`,
          indicator: birthChart?.ishtaDevata?.indicator || '5th/9th House Atmakaraka Sign',
          dailyOffering: 'Light a pure sesame or cow ghee lamp, chant the kavacham stotram and express unconditional gratitude.',
          benefits: 'Activates divine grace, dissolving deep past-life karmic knots and providing lifetime protection.',
        },
        {
          id: 'remedy-5-gemstone',
          number: 5,
          category: 'Ratna / Gemstone (रत्न धारण)',
          direction: 'South (S)',
          gemstoneName: resolvedRemedies.gemstone.name,
          weightRatti: resolvedRemedies.gemstone.caratWeight,
          recommendedMetal: resolvedRemedies.gemstone.metal,
          wearingFinger: resolvedRemedies.gemstone.finger,
          consecrationDay: resolvedRemedies.gemstone.auspiciousDay,
          benefits: 'Magnifies functional benefic planetary rays and restores vitality, prosperity and decision-making.',
        },
        {
          id: 'remedy-6-rudraksha',
          number: 6,
          category: 'Rudraksha Bead (रुद्राक्ष रक्षा कवच)',
          direction: 'South-West (SW)',
          beadMukhi: '5-Mukhi or 7-Mukhi Nepali Rudraksha',
          wearingGuide: 'String in red silk thread or silver cap, consecrate with "Om Namah Shivaya" on a Monday or Pradosham.',
          benefits: 'Calms fluctuating mental waves, pacifies malefic planetary stress, and bestows physical and emotional equilibrium.',
        },
        {
          id: 'remedy-7-vastu',
          number: 7,
          category: 'Vastu Directional Harmonization (वास्तु शोधन)',
          direction: 'West (W)',
          directionalRemedy: 'North-East (Ishanya) & North (Kubera)',
          elementBalance: 'Water and Space Elements',
          actionStep: 'Keep the North-East zone immaculately clean, declutter, and place an auspicious copper vessel with water.',
          benefits: 'Restores elemental balance across 16 residential zones, preventing financial stagnation and emotional stress.',
        },
        {
          id: 'remedy-8-charity',
          number: 8,
          category: 'Dāna & Seva (दान एवं सेवा)',
          direction: 'North-West (NW)',
          charityDay: 'Saturday or Thursday',
          recommendedOfferings: protocol48.midMandalaMilestoneDay24.charityDaana || 'Anna Dana (food donation) to underprivileged elders',
          beneficiary: 'Needy devotees, local orphanages, or holy goshalas',
          benefits: 'Directly appeases ancestral obligations (Pitri Rin) and burns off residual negative karmic imprints.',
        },
      ],
      // 48-Day Sankalpa Text
      sankalpaProtocol: {
        durationDays: 48,
        sankalpaMantra: protocol48.initiationDay1.sankalpaText || 'Om Tat Sat - Sri Parameshwara Preethyartham...',
        dailyRoutine: [
          protocol48.dailyDiscipline.morningRitual,
          ...protocol48.dailyDiscipline.lifestyleGuidelines,
        ],
      },
      // Sacred Temple Pariharams
      templePariharams: [
        {
          templeName: 'Vaitheeswaran Koil (Navagraha Angaraka Kshetram)',
          location: 'Tamil Nadu',
          purpose: 'Severe Dosha Nivarana, bodily healing and ancestral blessing.',
        },
        {
          templeName: 'Sri Kalahasti (Vayu Lingam / Rahu-Ketu Kshetram)',
          location: 'Andhra Pradesh',
          purpose: 'Sarpa, Rahu-Ketu and Kalasarpa dosha permanent alleviation.',
        },
        {
          templeName: 'Trimbakeshwar Shiva Jyotirlinga',
          location: 'Nashik, Maharashtra',
          purpose: 'Narayan Nagbali and Pitri Dosha absolute purification.',
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    // 4. Save to Firestore `service_requests` Collection for persistent access in "My Reports"
    const serviceDocRef = await adminDb.collection('service_requests').add({
      userId,
      userEmail: userEmail || '',
      type: 'Complete Parihara Plan',
      serviceId: 'complete-parihara-plan',
      serviceTitle: 'Generate My Complete Parihara Plan — 8 Sacred Remedies Blueprint',
      displayAmount: pariharaPrice,
      currency: 'inr',
      details: {
        name,
        gender,
        dob,
        time,
        place,
        primaryConcern,
      },
      reportContent: JSON.stringify(completePlanData),
      reportData: completePlanData,
      status: 'completed',
      paymentMethod,
      paymentId: razorpayPaymentId || `wallet_deduct_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      reportId: serviceDocRef.id,
      pariharaPlan: completePlanData,
      remainingBalance,
      message: 'Complete Parihara Plan generated and stored successfully!',
    });
  } catch (error: any) {
    console.error('Error generating complete parihara plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate Complete Parihara Plan.' },
      { status: 500 }
    );
  }
}
