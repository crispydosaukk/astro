import { NextRequest, NextResponse } from 'next/server';
import { evaluateAssessmentAI } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateName = body?.candidateName || 'Applicant Astrologer';
    const specialisation = body?.specialisation || 'Vedic Jyotish';

    const evaluation = await evaluateAssessmentAI(candidateName, specialisation);

    return NextResponse.json({
      success: true,
      evaluation,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error evaluating assessment via OpenAI:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to evaluate assessment with OpenAI',
      },
      { status: 500 }
    );
  }
}
