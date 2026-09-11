import { NextRequest, NextResponse } from 'next/server';
import { deleteAllCandidatesFromFirestore } from '@/lib/firebase/candidateService';
import { deleteAllCampaignsFromFirestore, clearSearchHistoryFromFirestore } from '@/lib/firebase/discoveryService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const [candidatesResult, campaignsResult] = await Promise.all([
      deleteAllCandidatesFromFirestore(),
      deleteAllCampaignsFromFirestore(),
      clearSearchHistoryFromFirestore(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully purged all candidates, campaigns, and search logs.',
      deletedCandidates: candidatesResult.count,
      deletedCampaigns: campaignsResult.count,
    });
  } catch (err: any) {
    console.error('Purge data error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to purge platform data' },
      { status: 500 }
    );
  }
}
