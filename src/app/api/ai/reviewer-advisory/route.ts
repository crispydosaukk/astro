import { NextRequest, NextResponse } from 'next/server';
import { generateReviewerAdvisoryAI } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateName = body?.name || body?.candidateName;
    if (!candidateName) {
      return NextResponse.json(
        { success: false, message: 'Candidate name is required for reviewer advisory.' },
        { status: 400 }
      );
    }

    const advisory = await generateReviewerAdvisoryAI({
      name: candidateName,
      specialisations: body.specialisations || ['Vedic Astrology'],
      aiScore: body.aiScore || 85,
      questionsScore: body.questionsScore,
      chartScore: body.chartScore,
      interviewScore: body.interviewScore,
      experience: body.experience,
      chartCaseAnalysis: body.chartCaseAnalysis,
      chartRemedy: body.chartRemedy,
      interviewDurationFormatted: body.interviewDurationFormatted,
      conversationHistory: body.conversationHistory,
    });

    return NextResponse.json({
      success: true,
      advisory,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error generating reviewer advisory with OpenAI:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to generate review advisory with OpenAI',
      },
      { status: 500 }
    );
  }
}
