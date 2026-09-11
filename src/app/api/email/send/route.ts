import { NextRequest, NextResponse } from 'next/server';
import { sendSmtpEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

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
