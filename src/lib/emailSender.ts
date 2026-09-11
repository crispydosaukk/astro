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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; line-height: 1.6; border: 1px solid #f0e6e0; border-radius: 12px;">
      <div style="margin-bottom: 20px; border-bottom: 2px solid #713B32; padding-bottom: 12px;">
        <h2 style="color: #713B32; margin: 0; font-size: 20px;">AstroParihar Verified Astrologer Network</h2>
      </div>
      <div style="white-space: pre-wrap; font-size: 15px; color: #2d3748; line-height: 1.7;">
        ${textBody.replace(/\n/g, '<br/>')}
      </div>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 28px 0;" />
      <p style="font-size: 12px; color: #718096; margin: 0;">
        Sent by AstroParihar UK Recruitment Team (${smtpUser})<br/>
        © 2026 AstroParihar · India's Premier Astrologer Verification Platform
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text: textBody,
    html: customHtml || defaultHtml,
  });

  return {
    success: true,
    messageId: info.messageId,
    deliveredTo: to,
    dispatchedAt: new Date().toISOString(),
  };
}
