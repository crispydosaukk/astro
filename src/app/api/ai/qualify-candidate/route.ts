import { NextRequest, NextResponse } from 'next/server';
import { evaluateAstrologerCandidate } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.name) {
      return NextResponse.json(
        { success: false, message: 'Candidate name is required for AI evaluation.' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateAstrologerCandidate(body);
    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (err: any) {
    console.error('Error during AI candidate evaluation:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to evaluate candidate with OpenAI',
      },
      { status: 500 }
    );
  }
}
