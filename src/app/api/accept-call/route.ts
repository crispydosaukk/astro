import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { consultationId } = await req.json();

    if (!consultationId) {
      return NextResponse.json({ error: 'Missing consultation ID' }, { status: 400 });
    }

    const consultationRef = adminDb.collection('consultations').doc(consultationId);
    const consultSnap = await consultationRef.get();
    const consultData = consultSnap.exists ? consultSnap.data() : null;

    if (consultData?.astrologerId) {
      const astSnap = await adminDb.collection('astrologers').doc(String(consultData.astrologerId)).get();
      if (astSnap.exists) {
        const ast = astSnap.data() || {};
        const astStatus = String(ast.status || '').toLowerCase();
        if (
          ast.isSuspended === true ||
          ast.isActive === false ||
          ast.dashboardDisabled === true ||
          astStatus === 'suspended' ||
          astStatus === 'deactivated'
        ) {
          return NextResponse.json(
            { error: 'Your astrologer account is suspended or deactivated. You cannot accept calls.' },
            { status: 403 }
          );
        }
      }
    }

    // Update consultation status to active
    await consultationRef.update({
      status: 'active',
      acceptedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Accept call error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
