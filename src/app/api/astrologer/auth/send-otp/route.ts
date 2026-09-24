import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

const VALID_APPROVED_STATUSES = [
  'approved',
  'active',
  'full_time',
  'full-time active',
  'probation',
  'verified',
  'onboarded',
];

function isFinallyApproved(record: any): boolean {
  const status = String(record.status || '').toLowerCase().trim();
  const appStatus = String(record.applicationStatus || '').toLowerCase().trim();
  const lifecycle = String(record.lifecycleStatus || '').toLowerCase().trim();
  const onboarding = String(record.onboardingStatus || '').toLowerCase().trim();
  const isVerified = Boolean(record.isVerified || record.isFullTimeApproved);

  if (isVerified) return true;
  if (onboarding === 'completed') return true;
  if (VALID_APPROVED_STATUSES.includes(status)) return true;
  if (VALID_APPROVED_STATUSES.includes(appStatus)) return true;
  if (VALID_APPROVED_STATUSES.includes(lifecycle)) return true;

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = body?.phone;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    const rawDigits = String(phone).replace(/\D/g, '');
    if (rawDigits.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const last10 = rawDigits.slice(-10);
    const cleanPhone = '91' + last10;

    let foundRecord: any = null;
    let sourceCollection: 'astrologers' | 'candidates' = 'astrologers';

    // 1. Search in 'astrologers' collection
    try {
      const astSnap = await adminDb.collection('astrologers').get();
      for (const doc of astSnap.docs) {
        const d = doc.data();
        const dPhone = String(d.phone || d.whatsapp || d.mobile || '').replace(/\D/g, '');
        if (dPhone.endsWith(last10)) {
          foundRecord = { id: doc.id, ...d };
          sourceCollection = 'astrologers';
          break;
        }
      }
    } catch (err) {
      console.warn('Astrologer check error in astrologers collection:', err);
    }

    // 2. If not found in 'astrologers', search in 'candidates' collection
    if (!foundRecord) {
      try {
        const candSnap = await adminDb.collection('candidates').get();
        for (const doc of candSnap.docs) {
          const d = doc.data();
          const dPhone = String(d.phone || d.whatsapp || d.applicationData?.phone || '').replace(/\D/g, '');
          if (dPhone.endsWith(last10)) {
            foundRecord = { id: doc.id, ...d };
            sourceCollection = 'candidates';
            break;
          }
        }
      } catch (err) {
        console.warn('Astrologer check error in candidates collection:', err);
      }
    }

    // 3. If no record found at all: show user-requested error
    if (!foundRecord) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          approved: false,
          error: 'You are not a registered astrologer. Please submit an application or contact admin.',
        },
        { status: 404 }
      );
    }

    // 4. Record found, verify if status is finally approved/onboarded
    const approved = isFinallyApproved(foundRecord);

    if (!approved) {
      const currentStage =
        foundRecord.applicationStatus ||
        foundRecord.lifecycleStatus ||
        foundRecord.status ||
        'Pending Review';

      return NextResponse.json(
        {
          success: false,
          registered: true,
          approved: false,
          status: currentStage,
          error: `Your astrologer application is currently ${currentStage}. Only finally approved and onboarded astrologers can sign in. Please contact admin for assistance.`,
        },
        { status: 403 }
      );
    }

    // 5. Astrologer is registered and fully approved: Send OTP via MSG91
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully (Simulated mode)',
        isSimulated: true,
        astrologer: {
          id: foundRecord.id,
          name: foundRecord.name || 'Astrologer',
          phone: cleanPhone,
          email: foundRecord.email || '',
        },
      });
    }

    const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${cleanPhone}&otp_length=4`;

    try {
      const msgRes = await fetch(msg91Url, {
        method: 'POST',
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await msgRes.json().catch(() => ({}));
      console.log('MSG91 Astrologer OTP Send Response:', data);

      if (data.type === 'error') {
        // If MSG91 gives rate limit error in dev, still allow proceeding
        return NextResponse.json(
          {
            success: false,
            error: data.message || 'Failed to dispatch OTP via SMS. Please try again in a few moments.',
          },
          { status: 400 }
        );
      }
    } catch (smsErr: any) {
      console.error('Error sending SMS via MSG91:', smsErr);
      return NextResponse.json(
        { success: false, error: 'SMS service temporarily unavailable. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your registered mobile number.',
      astrologer: {
        id: foundRecord.id,
        name: foundRecord.name || 'Astrologer',
        phone: cleanPhone,
        email: foundRecord.email || '',
      },
    });
  } catch (err: any) {
    console.error('Astrologer send-otp server error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
