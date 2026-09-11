import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

export const dynamic = 'force-dynamic';

const INTERVIEW_QUESTIONS = [
  {
    id: 1,
    topic: 'Client Consulting & Empathy',
    question: 'A client comes to you in extreme distress, having experienced severe financial loss and marriage conflict. How do you approach the consultation without instilling fear while providing practical Vedic guidance?',
  },
  {
    id: 2,
    topic: 'Remedial Ethics & Upaya',
    question: 'What is your philosophy regarding astrological remedies (gems, mantras, charity)? How do you respond if a client is unable to afford expensive gemstone remedies?',
  },
  {
    id: 3,
    topic: 'Planetary Transits & Dasha Interpretation',
    question: 'When analyzing a complex chart with contradictory indications (e.g. strong benefic transits during a difficult Sade Sati or Maraka dasha), how do you synthesize the outcome and explain timing to the client?',
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      candidateName = 'Astrologer', 
      specialisation = 'Vedic Astrology',
      currentQuestionIndex = 0, 
      userAnswer = '',
      conversationHistory = [] 
    } = body;

    const openai = getOpenAIClient();

    // If final evaluation requested
    if (body.isFinalEvaluation) {
      const prompt = `You are the Chief Astrological Examiner at AstroParihar, conducting a rigorous interview for an astrologer candidate named ${candidateName} specializing in ${specialisation}.

Here is the complete interview conversation:
${JSON.stringify(conversationHistory, null, 2)}

Evaluate this candidate thoroughly across 4 dimensions:
1. Astrological Technical Depth & Vedic Logic (0-25)
2. Remedial Ethics & Non-Exploitative Counseling (0-25)
3. Client Communication & Empathy (0-25)
4. Clarity & Solution-Oriented Guidance (0-25)

Return a JSON response matching this EXACT schema:
{
  "totalScore": number (0-100),
  "recommendation": "STRONG_PROCEED" | "PROCEED_WITH_ASSESSMENT" | "HOLD_FOR_REVIEW" | "REJECT",
  "summary": "2-3 sentences concise summary of interview performance",
  "strengths": ["strength 1", "strength 2"],
  "areasForImprovement": ["area 1"],
  "ethicalRating": "High" | "Medium" | "Low"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert Vedic Astrological interviewer and compliance auditor. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return NextResponse.json({ success: true, evaluation: parsed });
    }

    // Step-by-step interview interaction
    const currentQ = INTERVIEW_QUESTIONS[currentQuestionIndex] || INTERVIEW_QUESTIONS[0];
    const nextQ = INTERVIEW_QUESTIONS[currentQuestionIndex + 1] || null;

    let aiFeedback = '';
    if (userAnswer.trim()) {
      const feedbackCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are the AI Interviewer for AstroParihar. The candidate (${candidateName}) just answered the question: "${currentQ.question}".
Provide a short, encouraging 1-2 sentence acknowledgment highlighting what was good about their astrological reasoning, and smoothly transition to the next step. Keep tone respectful, traditional yet professional.`,
          },
          {
            role: 'user',
            content: `Candidate's Answer: "${userAnswer}"`
          }
        ],
        max_tokens: 150,
        temperature: 0.5,
      });

      aiFeedback = feedbackCompletion.choices[0]?.message?.content || 'Thank you for sharing your insightful perspective.';
    }

    return NextResponse.json({
      success: true,
      currentQuestion: currentQ,
      nextQuestion: nextQ,
      aiFeedback,
      isFinished: nextQ === null,
    });
  } catch (error: any) {
    console.error('AI Interview error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to process AI interview',
    }, { status: 500 });
  }
}
