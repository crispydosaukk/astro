import { NextRequest, NextResponse } from 'next/server';
import { sendSmtpEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cloudFunctionUrl =
    process.env.FIREBASE_EMAIL_FUNCTION_URL ||
    'https://us-central1-astroparihar-85e2d.cloudfunctions.net/sendMailDirect';

  return NextResponse.json({
    status: 'online',
    cloudFunctionEndpoint: cloudFunctionUrl,
    cloudFunctionActive: true,
    activeMode: 'Firebase Cloud Functions (Google Cloud Platform)',
    smtpAccount: 'astropariharuk@gmail.com',
    diagnostic:
      'Emails are dispatched via live Firebase Cloud Functions on Google Cloud Platform. Immune to GoDaddy/cPanel firewall socket blocks.',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, body: textBody, html: customHtml, candidateName, candidateId } = body;

    if (!to || !subject || !textBody) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, or body' },
        { status: 400 }
      );
    }

    if (typeof to === 'string' && (to.includes('@astroparihar.verified') || to.includes('@jyotish.in') || to.includes('@kundali.org'))) {
      return NextResponse.json(
        {
          success: false,
          error: `Recipient email "${to}" is a simulated placeholder domain from candidate discovery. Please enter a genuine candidate email address before sending.`,
        },
        { status: 400 }
      );
    }

    const result = await sendSmtpEmail({
      to,
      subject,
      body: textBody,
      html: customHtml,
      candidateName,
      candidateId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Direct email dispatch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch email' },
      { status: 500 }
    );
  }
}

