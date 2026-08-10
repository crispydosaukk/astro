import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { consultationId } = await req.json();

    if (!consultationId) {
      return NextResponse.json({ error: 'Missing consultation ID' }, { status: 400 });
    }

    const consultationRef = adminDb.collection('consultations').doc(consultationId);
    
    // Update consultation status to active
    await consultationRef.update({
      status: 'active',
      acceptedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Accept call error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
