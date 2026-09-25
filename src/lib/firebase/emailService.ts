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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject || 'AstroParihar Invitation'}</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfaf8; color: #1e293b;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8dfd8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="background-color: #FFFDFC; padding: 22px 24px 16px 24px; border-bottom: 2px solid #713B32; text-align: center;">
            <a href="https://astroparihar.com" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://astroparihar.com/astrologo.png" alt="AstroParihar" width="220" style="max-width: 220px; width: 100%; height: auto; display: block; margin: 0 auto; border: 0;" />
            </a>
            <p style="margin: 10px 0 0 0; font-size: 12.5px; color: #713B32; font-weight: 600; letter-spacing: 0.3px;">Verified Astrologer Network & Onboarding</p>
          </div>
          
          <div style="padding: 26px 28px; line-height: 1.7; font-size: 14.5px; color: #334155;">
            ${data.body.replace(/\n/g, '<br/>')}
          </div>
          
          <div style="background-color: #faf7f5; padding: 16px 24px; border-top: 1px solid #ede4dc; font-size: 11.5px; color: #786b63; line-height: 1.5; text-align: center;">
            <p style="margin: 0 0 4px 0;">
              Official Astrologer Verification & Onboarding Panel · <strong>AstroParihar</strong>
            </p>
            <p style="margin: 0; font-size: 11px; color: #9c8e85;">
              © 2026 AstroParihar · All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
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
