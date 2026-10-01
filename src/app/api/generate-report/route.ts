import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateReportDataInternal } from '@/lib/reportGenerator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = 'guest-user',
      userEmail = '',
      type = 'Custom Astrology Report',
      details = {},
      reportContent: clientReportContent,
      reportData: clientReportData,
    } = body;

    let existingData = clientReportData || null;
    if (!existingData && clientReportContent) {
      try {
        existingData =
          typeof clientReportContent === 'string'
            ? JSON.parse(clientReportContent)
            : clientReportContent;
      } catch (e) {
        existingData = null;
      }
    }

    const reportJsonObj = await generateReportDataInternal(
      type,
      { ...(details || {}), serviceId: body.serviceId || details?.serviceId },
      existingData
    );
    const reportContent = JSON.stringify(reportJsonObj);

    // Save to Firestore `service_requests` collection using adminDb (with 1500ms timeout guard)
    let docId = 'temp-' + Date.now();
    try {
      const savePromise = adminDb.collection('service_requests').add({
        userId,
        userEmail,
        type,
        details,
        status: 'completed',
        reportContent,
        reportData: reportJsonObj,
        createdAt: new Date().toISOString(),
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 1500)
      );
      const docRef: any = await Promise.race([savePromise, timeoutPromise]);
      docId = docRef.id;
    } catch (dbErr: any) {
      console.warn('Firestore write warning (using fallback docId):', dbErr?.message || dbErr);
    }

    return NextResponse.json({
      success: true,
      reportId: docId,
      reportContent,
      reportData: reportJsonObj,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
