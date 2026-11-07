import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

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
    const { phone, uid, reason } = await req.json();

    if (!phone && !uid) {
      return NextResponse.json(
        { error: 'Phone number or user ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
    const formattedPhone = cleanPhone ? '+' + cleanPhone : '';
    const targetUid = uid || (cleanPhone ? `phone_${cleanPhone}` : '');

    const deletedRecord = {
      phone: formattedPhone || phone || '',
      cleanPhone: cleanPhone || '',
      uid: targetUid,
      reason: reason || 'User requested account deletion via App / Website',
      deletedAt: new Date().toISOString(),
      status: 'deleted',
    };

    // 1. Mark in deleted_accounts collection to prevent future logins with this phone number
    try {
      if (cleanPhone) {
        await adminDb.collection('deleted_accounts').doc(cleanPhone).set(deletedRecord);
      }
      if (targetUid) {
        await adminDb.collection('deleted_accounts').doc(targetUid).set(deletedRecord);
      }
    } catch (dbErr: any) {
      console.warn('Could not record in deleted_accounts collection:', dbErr.message);
    }

    // 2. Remove user document from 'users' collection
    try {
      if (targetUid) {
        await adminDb.collection('users').doc(targetUid).delete();
      }
      if (cleanPhone) {
        await adminDb.collection('users').doc(`phone_${cleanPhone}`).delete();
      }
    } catch (delErr: any) {
      console.warn('Could not delete user from users collection:', delErr.message);
    }

    // 3. Remove user from Firebase Auth if exists
    try {
      if (targetUid) {
        await adminAuth.deleteUser(targetUid);
      }
    } catch (authErr: any) {
      // User might already be non-existent in Firebase Auth
      console.log('Firebase auth deletion note:', authErr.message);
    }

    // 4. Clean up birth profiles or cached records in Firestore
    try {
      if (targetUid) {
        const bpSnap = await adminDb.collection('birth_profiles').where('userId', '==', targetUid).get();
        const batch = adminDb.batch();
        bpSnap.docs.forEach((doc: any) => batch.delete(doc.ref));
        await batch.commit();
      }
    } catch (_bpErr) {}

    return NextResponse.json(
      {
        success: true,
        message: 'Your AstroParihar account and associated personal data have been permanently deleted.',
        deletedRecord,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Delete Account API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting account', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
