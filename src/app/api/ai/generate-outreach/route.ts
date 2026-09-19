import { NextRequest, NextResponse } from 'next/server';
import { generateOutreachMessage } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateName = body?.name || body?.candidateName;

    if (!candidateName) {
      return NextResponse.json(
        { success: false, error: 'Candidate name is required to generate outreach message.' },
        { status: 400 }
      );
    }

    let channelNormalized: 'Email' | 'WhatsApp' | 'SMS' = 'Email';
    if (body?.channel) {
      const ch = body.channel.toLowerCase();
      if (ch === 'whatsapp') channelNormalized = 'WhatsApp';
      else if (ch === 'sms') channelNormalized = 'SMS';
    }

    const result = await generateOutreachMessage({
      name: candidateName,
      specialization: body?.specialisation || body?.specialization,
      experienceYears: typeof body?.experience === 'number' ? body.experience : parseInt(body?.experience || '10', 10) || 10,
      platformSource: body?.location ? `${body.location} Practitioner Network` : 'Verified Astrologer Network',
      channel: channelNormalized,
      language: body?.language || 'English',
    });

    return NextResponse.json({
      success: true,
      subject: result.subject,
      body: result.body,
      message: result,
    });
  } catch (err: any) {
    console.error('Error generating AI outreach message:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to generate outreach message with OpenAI',
      },
      { status: 500 }
    );
  }
}
