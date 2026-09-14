import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      astrologerId, 
      action = 'approve_full_time', // 'approve_full_time' | 'extend_probation'
      extensionMonths = 1,
      adminNotes = 'Approved for Full-Time practice based on satisfactory probation audit.' 
    } = body;

    if (!astrologerId) {
      return NextResponse.json({
        success: false,
        error: 'Astrologer ID is required'
      }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({
        success: true,
        message: `Simulated: Astrologer ${astrologerId} status updated to ${action}.`
      });
    }

    const astRef = doc(db, 'astrologers', astrologerId);
    const candidateRef = doc(db, 'candidates', astrologerId);

    if (action === 'approve_full_time') {
      const updateData = {
        status: 'full_time',
        isFullTimeApproved: true,
        fullTimeApprovedAt: serverTimestamp(),
        lifecycleStatus: 'verified',
        isVerified: true,
        adminNotes,
        updatedAt: serverTimestamp()
      };

      await setDoc(astRef, updateData, { merge: true });
      await setDoc(candidateRef, {
        lifecycleStatus: 'verified',
        applicationStatus: 'Full-Time Active',
        updatedAt: serverTimestamp()
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Astrologer approved as Full-Time Astrologer. Dashboard restrictions lifted.',
        status: 'full_time',
        isFullTimeApproved: true
      });
    } else if (action === 'extend_probation') {
      const extDays = Number(extensionMonths) * 30;
      const newEndDate = new Date(Date.now() + extDays * 24 * 60 * 60 * 1000).toISOString();

      const updateData = {
        status: 'probation',
        isFullTimeApproved: false,
        probationEndDate: newEndDate,
        adminNotes,
        updatedAt: serverTimestamp()
      };

      await setDoc(astRef, updateData, { merge: true });

      return NextResponse.json({
        success: true,
        message: `Probation extended by ${extensionMonths} month(s). New end date: ${newEndDate.substring(0, 10)}.`,
        probationEndDate: newEndDate
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action requested'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error updating astrologer full time status:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update full time approval'
    }, { status: 500 });
  }
}
