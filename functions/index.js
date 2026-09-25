const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

// Credentials (use environment config or fallback to AstroParihar credentials)
const SMTP_USER = process.env.SMTP_USER || 'astropariharuk@gmail.com';
const SMTP_PASS = (process.env.SMTP_PASS || 'yllpmnnrfdtvacan').replace(/\s+/g, '');
const SMTP_FROM = process.env.SMTP_FROM || `AstroParihar <${SMTP_USER}>`;

// Create reusable Nodemailer transporter (Runs on Google Cloud infrastructure without port blocks)
function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

function buildBrandedEmail(bodyText, subject) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject || 'AstroParihar Notification'}</title>
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
          ${bodyText ? bodyText.replace(/\n/g, '<br/>') : ''}
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
}

/**
 * 1. Background Trigger: Automatically fires whenever a document is created in the 'mail' collection
 */
exports.processMailQueue = onDocumentCreated(
  {
    document: 'mail/{mailId}',
    region: 'europe-west2',
    maxInstances: 10,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return null;

    const data = snap.data();
    // Skip if already sent or in-flight
    if (data.status === 'sent' || data.delivery?.state === 'SUCCESS') {
      return null;
    }

    const docRef = snap.ref;
    const recipient = Array.isArray(data.to) ? data.to.join(', ') : data.to;

    if (!recipient) {
      console.warn(`[Mail Queue] Skipped document ${event.params.mailId}: Missing recipient 'to'`);
      return docRef.update({
        status: 'failed',
        delivery: { state: 'FAILED', error: 'Missing recipient email address' },
      });
    }

    // Ignore placeholder discovery emails
    if (recipient.includes('@astroparihar.verified') || recipient.includes('@jyotish.in')) {
      console.warn(`[Mail Queue] Skipped placeholder address: ${recipient}`);
      return docRef.update({
        status: 'skipped',
        delivery: { state: 'SKIPPED', error: 'Placeholder discovery email' },
      });
    }

    const subject = data.message?.subject || data.subject || 'Notification from AstroParihar';
    const textBody = data.message?.text || data.body || '';
    const htmlBody = data.message?.html || data.html || buildBrandedEmail(textBody, subject);

    try {
      console.log(`[Mail Queue] Dispatching email to: ${recipient}, Subject: "${subject}"`);
      const transporter = getTransporter();
      const info = await transporter.sendMail({
        from: SMTP_FROM,
        to: recipient,
        subject,
        text: textBody,
        html: htmlBody,
        headers: {
          'X-Mailer': 'AstroParihar Cloud Functions',
        },
      });

      console.log(`[Mail Queue] Successfully dispatched to ${recipient}. MessageId: ${info.messageId}`);
      return docRef.update({
        status: 'sent',
        delivery: {
          state: 'SUCCESS',
          sentAt: new Date().toISOString(),
          messageId: info.messageId,
          source: 'Firebase Cloud Functions',
        },
      });
    } catch (err) {
      console.error(`[Mail Queue] Failed to send email to ${recipient}:`, err);
      return docRef.update({
        status: 'failed',
        delivery: {
          state: 'FAILED',
          error: err.message || 'SMTP dispatch error in Cloud Function',
          attemptedAt: new Date().toISOString(),
        },
      });
    }
  }
);

/**
 * 2. Direct HTTPS Callable Endpoint: Can be fetched directly from Next.js (or cPanel) via HTTPS POST
 * URL: https://us-central1-astroparihar-85e2d.cloudfunctions.net/sendMailDirect
 */
exports.sendMailDirect = onRequest(
  {
    region: 'us-central1',
    cors: true,
  },
  async (req, res) => {
    // Only accept POST
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
      return;
    }

    try {
      const { to, subject, body: textBody, html: customHtml, candidateName, candidateId } = req.body || {};

      if (!to || !subject || !textBody) {
        res.status(400).json({ success: false, error: 'Missing required fields: to, subject, body' });
        return;
      }

      if (to.includes('@astroparihar.verified') || to.includes('@jyotish.in')) {
        res.status(400).json({
          success: false,
          error: `Recipient "${to}" is a simulated placeholder address. Please enter a genuine candidate email.`,
        });
        return;
      }

      const effectiveHtml = customHtml || buildBrandedEmail(textBody, subject);
      const transporter = getTransporter();
      const info = await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        text: textBody,
        html: effectiveHtml,
      });

      // Also record to Firestore 'mail' collection
      try {
        await db.collection('mail').add({
          to: [to],
          message: { subject, text: textBody, html: effectiveHtml },
          candidateName: candidateName || '',
          candidateId: candidateId || '',
          status: 'sent',
          delivery: {
            state: 'SUCCESS',
            sentAt: new Date().toISOString(),
            messageId: info.messageId,
            source: 'Cloud Functions sendMailDirect',
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (logErr) {
        console.warn('Logging to Firestore failed:', logErr);
      }

      res.status(200).json({
        success: true,
        messageId: info.messageId,
        deliveredTo: to,
        dispatchedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('sendMailDirect error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal Cloud Function dispatch error',
      });
    }
  }
);
