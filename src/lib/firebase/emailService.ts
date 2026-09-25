import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface QueuedEmail {
  to: string;
  candidateName?: string;
  candidateId?: string;
  channel: 'Email';
  subject: string;
  body: string;
  html?: string;
  status: 'queued' | 'sent' | 'failed';
  createdAt: any;
}

/**
 * Dispatches an email directly via the SMTP server (Gmail) and records it in Firestore
 */
export async function queueEmailViaCloudFunction(data: {
  to: string;
  candidateName?: string;
  candidateId?: string;
  subject: string;
  body: string;
}): Promise<{ id: string; success: boolean; error?: string }> {
  try {
    const formattedHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6; border: 1px solid #f0e6e0; border-radius: 12px;">
        <div style="margin-bottom: 20px; border-bottom: 2px solid #713B32; padding-bottom: 12px;">
          <h2 style="color: #713B32; margin: 0; font-size: 20px;">AstroParihar Verified Astrologer Network</h2>
        </div>
        <div style="white-space: pre-wrap; font-size: 15px; color: #2d3748; line-height: 1.7;">
          ${data.body.replace(/\n/g, '<br/>')}
        </div>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 28px 0;" />
        <p style="font-size: 12px; color: #718096; margin: 0;">
          Sent by AstroParihar UK Recruitment Team (astropariharuk@gmail.com)<br/>
          © 2026 AstroParihar · India's Premier Astrologer Verification Platform
        </p>
      </div>
    `;

    // 1. Dispatch email directly via our Next.js SMTP API route
    let dispatchSuccess = false;
    let messageId = '';
    let errorMessage = '';
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.to,
          subject: data.subject,
          body: data.body,
          html: formattedHtml,
          candidateName: data.candidateName,
          candidateId: data.candidateId,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        dispatchSuccess = true;
        messageId = resData.messageId;
      } else {
        errorMessage = resData.error || 'SMTP dispatch failed';
      }
    } catch (apiErr: any) {
      errorMessage = apiErr.message || 'Failed to call email API';
      console.warn('Direct SMTP dispatch route warning:', apiErr);
    }

    // 2. Record to Firestore 'mail' collection
    // If direct SMTP succeeded, save as 'sent'.
    // If direct SMTP failed (e.g. GoDaddy port restriction), save as 'queued'
    // so the Firebase Cloud Function automatically processes and delivers it.
    let docId = `mail-${Date.now()}`;
    let isQueuedForCloudFunction = false;
    try {
      const docRef = await addDoc(collection(db, 'mail'), {
        to: [data.to],
        message: {
          subject: data.subject,
          text: data.body,
          html: formattedHtml,
        },
        candidateName: data.candidateName || '',
        candidateId: data.candidateId || '',
        metadata: {
          source: 'AstroParihar AI Admin Portal',
          dispatchedAt: new Date().toISOString(),
          messageId: messageId || null,
        },
        status: dispatchSuccess ? 'sent' : 'queued',
        delivery: dispatchSuccess
          ? { state: 'SUCCESS', sentAt: new Date().toISOString() }
          : { state: 'QUEUED_FOR_CLOUD_FUNCTION', reason: errorMessage || 'Queued for Cloud Functions dispatch' },
        createdAt: serverTimestamp(),
      });
      docId = docRef.id;
      if (!dispatchSuccess) {
        isQueuedForCloudFunction = true;
      }
    } catch (firestoreErr) {
      console.warn('Firestore mail logging warning:', firestoreErr);
    }

    const finalSuccess = dispatchSuccess || isQueuedForCloudFunction;
    return {
      id: docId,
      success: finalSuccess,
      error: finalSuccess ? undefined : (errorMessage || 'Failed to dispatch or queue email'),
    };
  } catch (error: any) {
    console.error('Email queue error:', error);
    return { id: `err-${Date.now()}`, success: false, error: error.message };
  }
}
