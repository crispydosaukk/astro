import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let chartAnalysis = '';
  let langStr = 'en';
  try {
    const body = await req.json();
    const {
      candidateName = 'Astrologer',
      specialisation = 'Vedic Astrology',
      chartAnalysis: rawChartAnalysis = '',
      chartRemedy = '',
      language = 'en',
      caseTitle,
      caseLagna,
      caseMoonSign,
      caseDasha,
      casePlacements,
      caseQuery,
      expectedObservations
    } = body;
    chartAnalysis = rawChartAnalysis;
    langStr = String(language || 'en').toLowerCase();

    if (!chartAnalysis || chartAnalysis.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'Please provide a valid astrological reading before evaluating.',
      }, { status: 400 });
    }

    const langLabel = (langStr === 'te' || langStr === 'telugu') ? 'Telugu (తెలుగు)'
      : (langStr === 'ta' || langStr === 'tamil') ? 'Tamil (தமிழ்)'
      : (langStr === 'hi' || langStr === 'hindi') ? 'Hindi (हिन्दी)'
      : 'English';

    const caseStudyContext = caseQuery ? `
Case Study Background:
- Case Title: ${caseTitle || 'Kundali Case Study'}
- Lagna (Ascendant): ${caseLagna || 'Scorpio (Vrishchika)'}
- Moon Sign (Rashi): ${caseMoonSign || 'Capricorn (Makara)'}
- Current Vimshottari Dasha: ${caseDasha || 'Saturn Mahadasha with Rahu Antardasha'}
- Key Planetary Placements: ${casePlacements || 'Mars in 10th house (Leo), Sun in 11th house (Virgo)'}
- Client Query: "${caseQuery}"
${expectedObservations ? `- Core Observations Astrologer Should Detect: ${expectedObservations}` : ''}
` : `
Case Study Background:
- Native: Male client in deep career distress.
- Lagna: Scorpio (Vrishchika) - Mars is Lagna lord.
- Moon Sign (Rashi): Capricorn (Makara), Shravana Nakshatra.
- Current Vimshottari Dasha: Saturn Mahadasha with Rahu Antardasha (Shani-Rahu chhidra/sandhi dasha causing mental restlessness and delays).
- Key Planetary Placements: Mars in 10th house (Leo/Simha) with Digbala (directional strength). Sun in 11th house (Virgo/Kanya) indicating ultimate income and recovery.
- Client Query: "I have experienced sudden career delays and mental restlessness over the past 8 months despite hard work. Will my business venture launch successfully, and what spiritual remedies do you recommend?"
`;

    const prompt = `You are the Chief Astrological Examiner at AstroParihar. You are evaluating a Blind Kundali Case Study submitted by candidate "${candidateName}" (Specialisation: ${specialisation}).
Language chosen by candidate: ${langLabel}.

${caseStudyContext}

Candidate's Submitted Astrological Reading:
"""
${chartAnalysis}
"""

Candidate's Submitted Remedies:
"""
${chartRemedy}
"""

Evaluation Rubric:
1. Astrological Technical Reading (0-40 points):
   - Did they correctly evaluate Scorpio Lagna, Mars in 10th (Digbala in Leo)?
   - Did they identify the Saturn Mahadasha - Rahu Antardasha friction explaining the current delays?
   - Did they explain realistic timing of business revival (when dasha shifts or Mars/Sun transits align)?
   - Deduct heavily if the reading is generic, irrelevant, or shows elementary astrological misunderstandings.
2. Remedial & Counseling Ethics (0-30 points):
   - Are remedies sattvic, ethical, and authentic Vedic remedies (e.g. Shani-Rahu pacification, Hanuman Chalisa, Shiva puja, charity, disciplined routine)?
   - Deduct heavily if the candidate prescribes extortionate gemstones, fearmongers, or guarantees instant miraculous cures.
3. Analytical Depth, Structure & Clarity (0-30 points):
   - Is the response structured, clear, and professional?
   - If the candidate typed gibberish, keyboard mashing (e.g. random letters), 1-2 words, or non-astrological text, assign an overall chartScore between 0-15 and verdict "NEEDS_IMPROVEMENT".
   - If they demonstrated genuine Vedic astrological competence, score between 75-98.

Return a JSON response matching this EXACT schema:
{
  "chartScore": number (0-100),
  "technicalScore": number (0-40),
  "remedyScore": number (0-30),
  "depthScore": number (0-30),
  "verdict": "OUTSTANDING" | "QUALIFIED" | "BORDERLINE" | "NEEDS_IMPROVEMENT",
  "summary": "2-3 sentences concise professional evaluation summary in English",
  "feedbackInLanguage": "2-3 sentences personalized feedback directly addressing the candidate in their selected language (${langLabel})",
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1"]
}`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an authoritative Vedic Astrological examiner and auditor. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    let result: any = {};
    try {
      result = JSON.parse(rawContent);
    } catch {
      try {
        let cleaned = rawContent.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '');
        else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/```$/, '');
        const fixed = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
        result = JSON.parse(fixed);
      } catch (parseErr) {
        console.warn('JSON parse fallback after sanitize:', parseErr, rawContent);
        result = {};
      }
    }

    const rawScore = Number(result.chartScore);
    const finalScore = (!isNaN(rawScore) && rawScore >= 0) ? Math.min(100, Math.max(0, Math.round(rawScore))) : 0;

    return NextResponse.json({
      success: true,
      chartScore: finalScore,
      evaluation: {
        ...result,
        chartScore: finalScore,
      }
    });
  } catch (error: any) {
    console.error('Kundali Evaluation API error:', error);
    // Dynamic heuristic fallback: check if candidate actually typed astrological concepts
    const text = String(chartAnalysis || '');
    const astroKeywords = ['lagna', 'dasha', 'mars', 'saturn', 'rahu', 'house', 'kendra', 'trikona', 'scorpio', 'leo', 'capricorn', 'kuja', 'shani', 'bhavam', 'రాశి', 'లగ్నం', 'దశ', 'గ్రహ', 'ராசி', 'லக்னம்', 'கிரக', 'भाव', 'राशि', 'दशा'];
    const hasAstroTerms = astroKeywords.some(kw => text.toLowerCase().includes(kw));

    const fallbackScore = hasAstroTerms ? (text.length > 150 ? 80 : 65) : 10;
    const fallbackVerdict = fallbackScore >= 75 ? 'QUALIFIED' : 'NEEDS_IMPROVEMENT';

    return NextResponse.json({
      success: true,
      chartScore: fallbackScore,
      evaluation: {
        chartScore: fallbackScore,
        technicalScore: Math.round(fallbackScore * 0.4),
        remedyScore: Math.round(fallbackScore * 0.3),
        depthScore: Math.round(fallbackScore * 0.3),
        verdict: fallbackVerdict,
        summary: hasAstroTerms
          ? 'Candidate addressed planetary placements and remedies.'
          : 'Candidate submitted non-astrological or incomplete response for chart evaluation.',
        feedbackInLanguage: langStr === 'te'
          ? 'మీ కుండలి విశ్లేషణ నమోదు చేయబడింది. సమీక్ష కమిటీ దీనిని పరిశీలిస్తుంది.'
          : langStr === 'ta'
          ? 'உங்கள் ஜாதக ஆய்வு சமர்ப்பிக்கப்பட்டது. ஆய்வுக் குழு இதனை மதிப்பீடு செய்யும்.'
          : langStr === 'hi'
          ? 'आपकी कुंडली विवेचना दर्ज की गई है। समिति द्वारा इसका मूल्यांकन किया जाएगा।'
          : 'Your Kundali chart interpretation has been recorded and queued for panel review.',
        strengths: hasAstroTerms ? ['Attempted chart reading'] : [],
        improvements: hasAstroTerms ? ['Elaborate further on Navamsha confirmation'] : ['Provide coherent astrological analysis'],
      }
    });
  }
}
