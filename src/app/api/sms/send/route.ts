import { NextRequest, NextResponse } from 'next/server';
import { sendMsg91Sms } from '@/lib/smsSender';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, templateId, message, candidateName, candidateId, variables } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Recipient phone number is required.' },
        { status: 400 }
      );
    }

    const result = await sendMsg91Sms({
      phone,
      templateId,
      message,
      candidateName,
      candidateId,
      variables,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Direct SMS dispatch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch SMS' },
      { status: 500 }
    );
  }
}
