import nodemailer from 'nodemailer';

export interface SmtpEmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
  candidateName?: string;
  candidateId?: string;
}

export async function sendSmtpEmail({
  to,
  subject,
  body: textBody,
  html: customHtml,
  candidateName,
  candidateId,
}: SmtpEmailPayload) {
  const smtpUser = process.env.SMTP_USER || 'astropariharuk@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'yllpmnnrfdtvacan';
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const configuredPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null;
  const smtpFrom = process.env.SMTP_FROM || `AstroParihar UK <${smtpUser}>`;

  // 1. Primary: Dispatch via live Firebase Cloud Function HTTPS endpoint
  // Works from any hosting environment (GoDaddy, cPanel, localhost) over Port 443 HTTPS without port blocks
  const cloudFunctionUrl =
    process.env.FIREBASE_EMAIL_FUNCTION_URL ||
    'https://us-central1-astroparihar-85e2d.cloudfunctions.net/sendMailDirect';

  try {
    const res = await fetch(cloudFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        body: textBody,
        html: customHtml,
        candidateName,
        candidateId,
      }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return {
        success: true,
        messageId: data.messageId,
        deliveredTo: to,
        dispatchedAt: data.dispatchedAt || new Date().toISOString(),
      };
    }
    if (data?.error && data.error.includes('placeholder')) {
      throw new Error(data.error);
    }
  } catch (cfErr: any) {
    if (cfErr?.message && cfErr.message.includes('placeholder')) {
      throw cfErr;
    }
    console.warn('Firebase Cloud Function dispatch attempt failed, falling back:', cfErr);
  }

  // 2. Check for HTTP-based Email API (Resend) which bypasses all hosting SMTP port restrictions
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || `AstroParihar <onboarding@astroparihar.com>`,
          to: [to],
          subject,
          text: textBody,
          html: customHtml || textBody.replace(/\n/g, '<br/>'),
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        return {
          success: true,
          messageId: data.id,
          deliveredTo: to,
          dispatchedAt: new Date().toISOString(),
        };
      }
    } catch (resendErr) {
      console.warn('Resend HTTP dispatch attempt failed, falling back to SMTP:', resendErr);
    }
  }

  // 2. Check for Brevo (Sendinblue) HTTP API
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'AstroParihar UK', email: smtpUser },
          to: [{ email: to }],
          subject,
          textContent: textBody,
          htmlContent: customHtml || textBody.replace(/\n/g, '<br/>'),
        }),
      });
      const data = await res.json();
      if (res.ok && data.messageId) {
        return {
          success: true,
          messageId: data.messageId,
          deliveredTo: to,
          dispatchedAt: new Date().toISOString(),
        };
      }
    } catch (brevoErr) {
      console.warn('Brevo HTTP dispatch attempt failed, falling back to SMTP:', brevoErr);
    }
  }

  const defaultHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfaf8; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8dfd8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="background-color: #713B32; padding: 20px 24px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 19px; font-weight: 700; letter-spacing: 0.5px;">AstroParihar Astrologer Network</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.85;">Official Astrologer Verification & Onboarding</p>
        </div>
        
        <div style="padding: 24px; line-height: 1.7; font-size: 14.5px; color: #334155;">
          ${textBody.replace(/\n/g, '<br/>')}
        </div>
        
        <div style="background-color: #f8fafc; padding: 18px 24px; border-top: 1px solid #f1f5f9; font-size: 11.5px; color: #64748b; line-height: 1.5;">
          <p style="margin: 0 0 6px 0;">
            This invitation was dispatched by the <strong>AstroParihar UK Recruitment Committee</strong> for verified astrology practitioners.
          </p>
          <p style="margin: 0;">
            Sender: <a href="mailto:${smtpUser}" style="color: #713B32; text-decoration: none;">${smtpUser}</a> • AstroParihar Global Astrologer Verification System
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 3. Fallback to standard SMTP with port autodetection (try 587 STARTTLS first, then 465 SSL)
  const portsToTry = configuredPort ? [configuredPort] : [587, 465];
  let lastError: any = null;

  for (const port of portsToTry) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        text: textBody,
        html: customHtml || defaultHtml,
        headers: {
          'X-Mailer': 'AstroParihar Verified Astrologer System',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'List-Unsubscribe': `<mailto:${smtpUser}?subject=unsubscribe>`,
        },
      });

      return {
        success: true,
        messageId: info.messageId,
        deliveredTo: to,
        dispatchedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`SMTP dispatch attempt on ${smtpHost}:${port} failed:`, err.message);
    }
  }

  // If all ports failed, format a clear explanation
  let errorMsg = lastError?.message || 'Failed to dispatch email via SMTP';
  if (errorMsg.includes('EACCES')) {
    errorMsg = `Outgoing SMTP port blocked by hosting firewall (EACCES on ${smtpHost}). Your host (cPanel/GoDaddy) restricts outgoing SMTP socket connections to external mail servers. Switch to an HTTP Email API (e.g., Resend, Brevo) or disable SMTP Restrictions in cPanel.`;
  }

  throw new Error(errorMsg);
}
