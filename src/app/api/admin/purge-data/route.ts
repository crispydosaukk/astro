import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

async function purgeCollection(colName: string): Promise<number> {
  try {
    const colRef = adminDb.collection(colName);
    const snap = await colRef.get();
    if (snap.empty) return 0;

    let deleted = 0;
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const chunk = docs.slice(i, i + 400);
      const batch = adminDb.batch();
      chunk.forEach((d: any) => batch.delete(d.ref));
      await batch.commit();
      deleted += chunk.length;
    }
    return deleted;
  } catch (err) {
    console.warn(`Error purging collection ${colName}:`, err);
    return 0;
  }
}

export async function POST(_req: NextRequest) {
  try {
    const [
      deletedCandidates,
      deletedCampaigns,
      deletedSearchHistory,
      deletedCommunications,
      deletedCommunicationLogs,
      deletedMail,
    ] = await Promise.all([
      purgeCollection('candidates'),
      purgeCollection('discovery_campaigns'),
      purgeCollection('search_history'),
      purgeCollection('communications'),
      purgeCollection('communication_logs'),
      purgeCollection('mail'),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Successfully purged all candidates, campaigns, search logs, and outreach records.',
      deletedCandidates,
      deletedCampaigns,
      deletedSearchHistory,
      deletedCommunications: deletedCommunications + deletedCommunicationLogs + deletedMail,
    });
  } catch (err: any) {
    console.error('Purge data error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to purge platform data' },
      { status: 500 }
    );
  }
}

