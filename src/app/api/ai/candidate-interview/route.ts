import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

export const dynamic = 'force-dynamic';

interface InterviewQuestion {
  id: number;
  topic: string;
  topicHi: string;
  topicTe: string;
  topicTa: string;
  question: string;
  questionHi: string;
  questionTe: string;
  questionTa: string;
}

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    topic: 'Client Consulting & Empathy',
    topicHi: 'परामर्श कौशल एवं सहानुभूति',
    topicTe: 'క్లయింట్ సంప్రదింపులు & సానుభూతి',
    topicTa: 'வாடிக்கையாளர் ஆலோசனை & பரிவு',
    question: 'A client comes to you in extreme distress, having experienced severe financial loss and marriage conflict. How do you approach the consultation without instilling fear while providing practical Vedic guidance?',
    questionHi: 'एक जातक अत्यधिक तनाव में आपके पास आता है, जिसे व्यापार में भारी नुकसान और वैवाहिक विवाद का सामना करना पड़ रहा है। भय उत्पन्न किए बिना सात्विक वैदिक मार्गदर्शन कैसे देंगे?',
    questionTe: 'ఒక క్లయింట్ తీవ్ర వ్యాపార నష్టం మరియు వైవాహిక సమస్యలతో తీవ్ర నిరాశలో మీ వద్దకు వచ్చారు. వారిలో భయం కలిగించకుండా, ప్రశాంతంగా ప్రామాణిక వేద జ్యోతిష పరిహారాలు మరియు మార్గదర్శకత్వాన్ని ఎలా అందిస్తారు?',
    questionTa: 'ஒரு வாடிக்கையாளர் கடுமையான நிதி இழப்பு மற்றும் குடும்பக் குழப்பத்துடன் உங்களிடம் வருகிறார். அவர்களுக்கு அச்சம் ஏற்படுத்தாமல், அமைதியாகவும் நடைமுறைக்கு உகந்ததாகவும் பாரம்பரிய வேத ஜோதிட வழிகாட்டலை எவ்வாறு வழங்குவீர்கள்?',
  },
  {
    id: 2,
    topic: 'Remedial Ethics & Upaya',
    topicHi: 'सात्विक उपाय एवं नैतिकता',
    topicTe: 'పరిహార నైతికత & ఉపాయాలు',
    topicTa: 'பரிகார நெறிமுறைகள் & உபாயங்கள்',
    question: 'What is your philosophy regarding astrological remedies (gems, mantras, charity)? How do you respond if a client is unable to afford expensive gemstone remedies?',
    questionHi: 'ज्योतिषीय उपायों (रत्न, मंत्र, दान) को लेकर आपका क्या दृष्टिकोण है? यदि कोई जातक महंगे रत्न खरीदने में असमर्थ हो, तो आप उसे क्या विकल्प सुझाते हैं?',
    questionTe: 'జ్యోతిష పరిహారాల (రత్నాలు, మంత్రాలు, దానాలు) పై మీ దృక్పథం ఏమిటి? ఒకవేళ క్లయింట్ ఖరీదైన రత్నాలు ధరించలేని స్థితిలో ఉంటే, మీరు వారికి ఎలాంటి సాత్విక ప్రత్యామ్నాయాలు సూచిస్తారు?',
    questionTa: 'ஜோதிட பரிகாரங்கள் (ரத்தினங்கள், மந்திரங்கள், தானங்கள்) குறித்த உங்கள் அணுகுமுறை என்ன? விலை உயர்ந்த ரத்தினங்களை வாங்க முடியாத நிலையில் ஒரு வாடிக்கையாளர் இருந்தால், அவர்களுக்கு என்ன சாத்விக மாற்று வழிகளை பரிந்துரைப்பீர்கள்?',
  },
  {
    id: 3,
    topic: 'Planetary Transits & Dasha Interpretation',
    topicHi: 'दशा व गोचर समन्वय',
    topicTe: 'దశా మరియు గోచార సమన్వయం',
    topicTa: 'தசா & கோச்சார பலன்கள்',
    question: 'When analyzing a complex chart with contradictory indications (e.g. strong benefic transits during a difficult Sade Sati or Maraka dasha), how do you synthesize the outcome and explain timing to the client?',
    questionHi: 'परस्पर विरोधी संकेतों वाली कुंडली में (जैसे मारक दशा या साढ़े साती के समय शुभ गोचर), आप फलादेश का समन्वय कैसे करते हैं और समय-काल कैसे समझाते हैं?',
    questionTe: 'పరస్పర విరుద్ధ గ్రహ స్థితులు ఉన్నప్పుడు (ఉదాహరణకు మారక దశ లేదా ఏలినాటి శనిలో శుభ గ్రహాల గోచారం), మీరు ఫలితాలను ఎలా సమన్వయం చేసి సరైన సమయ కాలాన్ని వివరిస్తారు?',
    questionTa: 'முரண்பட்ட கிரக நிலைகள் காணப்படும் ஜாதகத்தில் (உதாரணமாக மாரக தசா அல்லது ஏழரை சனியின் போது சுப கிரகங்களின் கோச்சாரம்), பலன்களை எவ்வாறு ஒருங்கிணைத்து சரியான காலக்கட்டத்தை வாடிக்கையாளருக்கு விளக்குவீர்கள்?',
  },
];

function getLocalizedInterviewQ(q: InterviewQuestion, lang: string) {
  const l = (lang || 'en').toLowerCase();
  if (l === 'te' || l === 'telugu') {
    return { id: q.id, topic: q.topicTe, question: q.questionTe };
  }
  if (l === 'ta' || l === 'tamil') {
    return { id: q.id, topic: q.topicTa, question: q.questionTa };
  }
  if (l === 'hi' || l === 'hindi') {
    return { id: q.id, topic: q.topicHi, question: q.questionHi };
  }
  return { id: q.id, topic: q.topic, question: q.question };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      candidateName = 'Astrologer', 
      specialisation = 'Vedic Astrology',
      currentQuestionIndex = 0, 
      userAnswer = '',
      conversationHistory = [],
      language = 'en',
      isFinalEvaluation = false,
    } = body;

    const langStr = String(language || 'en').toLowerCase();
    const langLabel = (langStr === 'te' || langStr === 'telugu') ? 'Telugu (తెలుగు)'
      : (langStr === 'ta' || langStr === 'tamil') ? 'Tamil (தமிழ்)'
      : (langStr === 'hi' || langStr === 'hindi') ? 'Hindi (हिन्दी)'
      : 'English';

    const openai = getOpenAIClient();

    // Raw question pointers
    const safeIdx = Math.max(0, Math.min(INTERVIEW_QUESTIONS.length - 1, Number(currentQuestionIndex) || 0));
    const rawCurrentQ = INTERVIEW_QUESTIONS[safeIdx];
    const rawNextQ = INTERVIEW_QUESTIONS[safeIdx + 1] || null;

    const currentQ = getLocalizedInterviewQ(rawCurrentQ, langStr);
    const nextQ = rawNextQ ? getLocalizedInterviewQ(rawNextQ, langStr) : null;

    // Full Interview Evaluation
    if (isFinalEvaluation || safeIdx >= INTERVIEW_QUESTIONS.length - 1) {
      // Ensure the latest user answer is reflected in the transcript if provided
      const completeHistory = [...conversationHistory];
      if (userAnswer && (!completeHistory.length || completeHistory[completeHistory.length - 1].text !== userAnswer)) {
        completeHistory.push({ role: 'user', text: userAnswer });
      }

      const userResponses = completeHistory.filter(m => m.role === 'user');
      const userAnswersCount = userResponses.length;

      // Handle candidate with 0 answers
      if (userAnswersCount === 0) {
        return NextResponse.json({
          success: true,
          currentQuestion: currentQ,
          nextQuestion: null,
          aiFeedback: 'No candidate answers recorded for the interview.',
          isFinished: true,
          evaluation: {
            qFeedback: 'Candidate did not provide answers to the examiner questions.',
            totalScore: 0,
            technicalScore: 0,
            ethicsScore: 0,
            communicationScore: 0,
            clarityScore: 0,
            recommendation: 'REJECT',
            summary: `${candidateName} did not record any answers during the AI screening interview.`,
            strengths: [],
            areasForImprovement: ['Must answer all 3 interview questions with classical Vedic principles'],
            ethicalRating: 'Low'
          }
        });
      }

      const evalPrompt = `You are the Chief Astrological Examiner at AstroParihar, conducting a rigorous interview evaluation for astrologer candidate "${candidateName}" (Specialisation: ${specialisation}).
Candidate's interview language: ${langLabel}.
Total Questions Answered by Candidate: ${userAnswersCount} of 3.

Here is the complete interview dialog transcript:
${JSON.stringify(completeHistory, null, 2)}

Latest Answer provided for Question ${safeIdx + 1} ("${currentQ.question}"):
"""
${userAnswer || (completeHistory[completeHistory.length - 1]?.role === 'user' ? completeHistory[completeHistory.length - 1].text : 'None')}
"""

Instructions:
1. FIRST, provide direct, personalized feedback specifically addressing what the candidate answered in their latest response. Cite specific terms or remedies they mentioned. If they wrote nonsense, gibberish, or irrelevant words, call it out honestly.
2. SECOND, evaluate all answers given by this candidate across 4 dimensions:
   - Astrological Technical Depth & Vedic Logic (0-25)
   - Remedial Ethics & Non-Exploitative Counseling (0-25)
   - Client Communication & Empathy (0-25)
   - Clarity & Solution-Oriented Guidance (0-25)
3. Calculate the totalScore (0-100) dynamically based on the substance of their answers.
   - If the candidate answered fewer than 3 questions (e.g. only ${userAnswersCount} of 3), the total score CANNOT exceed ${Math.min(100, userAnswersCount * 33)}.
   - If the candidate typed gibberish, nonsensical words, keyboard mashing (e.g. random letters), or non-astrological text, assign a totalScore between 0-15, set recommendation to "REJECT", and ethicalRating to "Low".
   - If answers are brief, shallow or low quality, score realistically (25-50).
   - If authentic and deep Vedic astrology, score 70-95.
   - NEVER default to 88 or any static number.

Return a JSON response matching this EXACT schema:
{
  "qFeedback": "2-3 sentences direct critique/acknowledgment of the candidate's latest answer in ${langLabel}",
  "totalScore": number (0-100),
  "technicalScore": number (0-25),
  "ethicsScore": number (0-25),
  "communicationScore": number (0-25),
  "clarityScore": number (0-25),
  "recommendation": "STRONG_PROCEED" | "PROCEED_WITH_ASSESSMENT" | "HOLD_FOR_REVIEW" | "REJECT",
  "summary": "2-3 sentences concise summary of interview performance in English",
  "strengths": ["strength 1", "strength 2"],
  "areasForImprovement": ["improvement 1"],
  "ethicalRating": "High" | "Medium" | "Low"
}`;

      try {
        const evalCompletion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an authoritative Vedic Astrological interviewer and compliance auditor. Output valid JSON only.' },
            { role: 'user', content: evalPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const rawEval = evalCompletion.choices[0]?.message?.content || '{}';
        let parsedEval: any = {};
        try {
          parsedEval = JSON.parse(rawEval);
        } catch {
          let cleaned = rawEval.trim();
          if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '');
          else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '');
          const fixed = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
          parsedEval = JSON.parse(fixed);
        }

        const rawScore = Number(parsedEval.totalScore);
        const totalScore = (!isNaN(rawScore) && rawScore >= 0) ? Math.min(100, Math.max(0, Math.round(rawScore))) : 0;
        const fullEvaluation = {
          ...parsedEval,
          totalScore,
        };

        return NextResponse.json({
          success: true,
          currentQuestion: currentQ,
          nextQuestion: null,
          aiFeedback: parsedEval.qFeedback || 'Thank you for your comprehensive response.',
          isFinished: true,
          evaluation: fullEvaluation,
        });
      } catch (openAiErr) {
        console.warn('OpenAI evaluation failed, using dynamic astrological heuristic fallback:', openAiErr);
        // Robust Heuristic Vedic Evaluator Fallback
        const allText = userResponses.map(r => r.text).join(' ').toLowerCase();
        const vedicKeywords = [
          'dasha', 'mahadasha', 'antardasha', 'transit', 'gochar', 'lagna', 'ascendant', 'shani', 'saturn',
          'rahu', 'ketu', 'guru', 'jupiter', 'mangal', 'mars', 'shukra', 'venus', 'budh', 'mercury',
          'surya', 'sun', 'chandra', 'moon', 'bhava', 'house', 'navamsha', 'kundali', 'nakshatra',
          'mantra', 'upaya', 'remedy', 'remedies', 'dana', 'charity', 'puja', 'pooja', 'sade sati',
          'karma', 'dharma', 'bhagya', 'trikona', 'kendra', 'planetary', 'astrology', 'vedic'
        ];
        let matchCount = 0;
        vedicKeywords.forEach(kw => {
          if (allText.includes(kw)) matchCount++;
        });

        const wordCount = allText.split(/\s+/).filter(Boolean).length;
        let heuristicScore = 0;

        if (wordCount < 10 || matchCount === 0) {
          heuristicScore = Math.min(15, wordCount * 2);
        } else {
          heuristicScore = Math.min(85, Math.round(15 + (matchCount * 4.5) + (Math.min(100, wordCount) * 0.35)));
        }

        // Pro-rate by questions answered
        heuristicScore = Math.round((heuristicScore * userAnswersCount) / 3);
        const subScore = Math.round(heuristicScore / 4);

        return NextResponse.json({
          success: true,
          currentQuestion: currentQ,
          nextQuestion: null,
          aiFeedback: 'Thank you for completing the technical interview screening.',
          isFinished: true,
          evaluation: {
            qFeedback: userAnswersCount >= 3 ? 'Completed all 3 interview questions with astrological context.' : `Partially completed ${userAnswersCount} of 3 questions.`,
            totalScore: heuristicScore,
            technicalScore: subScore,
            ethicsScore: subScore,
            communicationScore: subScore,
            clarityScore: subScore,
            recommendation: heuristicScore >= 75 ? 'PROCEED_WITH_ASSESSMENT' : heuristicScore >= 45 ? 'HOLD_FOR_REVIEW' : 'REJECT',
            summary: `${candidateName} answered ${userAnswersCount} of 3 questions (${wordCount} total words, ${matchCount} Vedic terms identified).`,
            strengths: matchCount >= 3 ? ['Demonstrated familiarity with core planetary terminology'] : ['Participated in interview screening'],
            areasForImprovement: userAnswersCount < 3 ? ['Must complete all 3 interview questions in full'] : ['Elaborate deeper on remedial philosophy and classical shastra references'],
            ethicalRating: heuristicScore >= 60 ? 'Medium' : 'Low'
          }
        });
      }
    }

    // Step-by-step interview interaction (Questions 1 & 2)
    let aiFeedback = '';
    if (userAnswer.trim()) {
      try {
        const feedbackCompletion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are the Chief AI Astrological Examiner for AstroParihar interviewing candidate ${candidateName} (Specialisation: ${specialisation}).
The candidate was asked Question ${safeIdx + 1}:
"${currentQ.question}"

Candidate's Actual Answer:
"${userAnswer}"

INSTRUCTIONS:
1. CAREFULLY READ and DIRECTLY ADDRESS what the candidate actually wrote.
2. Mention specific astrological concepts, remedies, or counseling attitudes they described.
3. If their answer is sound, provide an appreciative observation in 2 sentences.
4. If their answer is off-topic, evasive, or inadequate, constructively mention what was missing.
5. End with a smooth 1-sentence transition leading into the next question.
6. CRITICAL: You MUST write your entire feedback in ${langLabel}. Tone must be respectful, traditional yet professional.`,
            },
            {
              role: 'user',
              content: `Candidate's exact answer: "${userAnswer}"`
            }
          ],
          max_tokens: 180,
          temperature: 0.3,
        });

        aiFeedback = feedbackCompletion.choices[0]?.message?.content || 'Thank you for sharing your astrological perspective.';
      } catch (feedErr) {
        console.warn('AI feedback generation warning:', feedErr);
        aiFeedback = 'Thank you for your response Pandit Ji. Let us proceed to the next examination question.';
      }
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
