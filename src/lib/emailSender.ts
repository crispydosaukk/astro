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
}: SmtpEmailPayload) {
  const smtpUser = process.env.SMTP_USER || 'astropariharuk@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'yllpmnnrfdtvacan';
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpFrom = process.env.SMTP_FROM || `AstroParihar UK <${smtpUser}>`;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

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
}
