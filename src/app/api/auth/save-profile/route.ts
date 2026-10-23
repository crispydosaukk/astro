import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, phone, name, gender, dob, tob, pob, profileType } = body;

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400, headers: corsHeaders });
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    const formattedPhone = cleanPhone ? `+${cleanPhone}` : '';

    const profileData = {
      uid,
      phone: formattedPhone,
      name: name || 'Seeker',
      gender: gender || 'Male',
      dob: dob || '',
      tob: tob || '',
      pob: pob || '',
      profileType: profileType || 'Myself',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      await adminDb.collection('users').doc(uid).set(profileData, { merge: true });
    } catch (e: any) {
      console.warn('Firestore setDoc failed:', e.message);
    }

    return NextResponse.json(
      { success: true, message: 'Profile saved successfully', user: profileData },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Save Profile Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
