import React from 'react';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import type { ReviewCandidate } from '../ReviewWorkspace';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  FileQuestion,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { 
  THEORY_QUESTIONS, 
  getQuestionText, 
  getOptionsList, 
  getExplanationText, 
  getTopicText 
} from '@/lib/theoryQuestions';

interface ReviewAssessmentTabProps {
  candidate: ReviewCandidate;
}

export default function ReviewAssessmentTab({ candidate }: ReviewAssessmentTabProps) {
  const hasRealChart = Boolean(candidate.chartCaseAnalysis && candidate.chartCaseAnalysis.trim().length > 0);
  
  // Resolve questions list: use candidate's actual questions list, or fallback to curated THEORY_QUESTIONS
  const questionsList: any[] = (candidate.theoryQuestionsList && candidate.theoryQuestionsList.length > 0)
    ? candidate.theoryQuestionsList
    : THEORY_QUESTIONS;

  const candidateAnswers = candidate.theoryAnswers || {};
  const lang = (candidate.assessmentLanguage || 'en') as 'en' | 'hi' | 'te' | 'ta';

  // Helper to safely resolve candidate's chosen option across string keys, numeric keys, and index keys
  const getCandidateChoice = (q: any, qIndex: number) => {
    if (candidateAnswers[q.id] !== undefined && candidateAnswers[q.id] !== null) {
      return candidateAnswers[q.id];
    }
    if (candidateAnswers[String(q.id)] !== undefined && candidateAnswers[String(q.id)] !== null) {
      return candidateAnswers[String(q.id)];
    }
    if (candidateAnswers[qIndex + 1] !== undefined && candidateAnswers[qIndex + 1] !== null) {
      return candidateAnswers[qIndex + 1];
    }
    if (candidateAnswers[qIndex] !== undefined && candidateAnswers[qIndex] !== null) {
      return candidateAnswers[qIndex];
    }
    return undefined;
  };

  // Calculate actual correct count based on candidate's answers
  let correctCount = 0;
  let answeredCount = 0;
  questionsList.forEach((q, qIndex) => {
    const chosenIdx = getCandidateChoice(q, qIndex);
    if (chosenIdx !== undefined && chosenIdx !== null) {
      answeredCount++;
      if (chosenIdx === q.correctIndex) {
        correctCount++;
      }
    }
  });

  return (
    <div className="space-y-8">
      {/* 1. BLIND KUNDALI CASE ASSESSMENT - REAL CANDIDATE SUBMISSION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-primary" /> {candidate.chartCaseTitle || 'Blind Kundali Case Assessment #K-402'}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {candidate.chartCaseLagna 
                ? `Case Setup: ${candidate.chartCaseLagna} Lagna` 
                : 'Case Setup: Scorpio Lagna, Capricorn Moon, Saturn-Rahu Dasha, Mars 10th House Digbala in Leo'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case Score:</span>
            <AIScoreBadge score={candidate.chartScore} size="md" showLabel />
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-2xs font-bold text-primary uppercase tracking-wide">Client Query</span>
              <p className="text-xs text-foreground mt-0.5 font-medium">
                {candidate.chartCaseQuery 
                  ? `"${candidate.chartCaseQuery}"` 
                  : '"Severe career delays and mental restlessness over past 8 months. Will my business venture launch successfully, and what Vedic remedies do you recommend?"'}
              </p>
            </div>
            <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Evaluated by AI Examiner
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <FileQuestion size={13} className="text-primary" />
                Candidate's Submitted Astrological Reading
              </p>
              {hasRealChart ? (
                <div className="text-xs text-foreground leading-relaxed bg-muted/30 rounded-xl p-4 whitespace-pre-wrap border border-border/80 font-normal">
                  {candidate.chartCaseAnalysis}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic bg-muted/20 rounded-xl p-4 border border-dashed border-border">
                  No written astrological interpretation submitted yet.
                </div>
              )}
            </div>

            {candidate.chartRemedy && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  Candidate's Prescribed Remedies
                </p>
                <div className="text-xs text-foreground leading-relaxed bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 whitespace-pre-wrap font-medium">
                  {candidate.chartRemedy}
                </div>
              </div>
            )}

            {candidate.chartEvaluation && (
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-primary" />
                    AI Examiner Rubric & Verdict: <span className="text-primary">{candidate.chartEvaluation.verdict || 'EVALUATED'}</span>
                  </p>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    Score: {candidate.chartEvaluation.chartScore ?? candidate.chartScore}/100
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {candidate.chartEvaluation.summary || candidate.chartEvaluation.feedbackInLanguage}
                </p>
                {candidate.chartEvaluation.strengths?.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-2xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Strengths:</span>
                    {candidate.chartEvaluation.strengths.map((str: string, i: number) => (
                      <span key={i} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                        {str}
                      </span>
                    ))}
                  </div>
                )}
                {candidate.chartEvaluation.improvements?.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-2xs">
                    <span className="font-bold text-amber-700 dark:text-amber-400">Improvements:</span>
                    {candidate.chartEvaluation.improvements.map((imp: string, i: number) => (
                      <span key={i} className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                        {imp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-muted/20 rounded-lg border border-border">
                <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Expected Core Principles</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {['Scorpio Lagna lord Mars in 10th (Digbala)', 'Saturn-Rahu Dasha friction delays', 'Sun in 11th recovery & gains', 'Sattvic Shani/Rahu remedies'].map((item, i) => (
                    <span key={i} className="text-2xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-muted/20 rounded-lg border border-border">
                <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Anti-Cheating / Proctoring Audit</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-muted-foreground">Tab Switches:</span>
                  <span className="font-bold tabular-nums">{candidate.tabViolations ?? 0}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground">Exam Integrity:</span>
                  <span className={`font-semibold ${candidate.isDisqualified ? 'text-red-600' : 'text-emerald-600'}`}>
                    {candidate.isDisqualified ? 'Malpractice Flagged' : 'Verified Clean'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC VEDIC THEORY ASSESSMENT - QUESTIONS & REAL CANDIDATE ANSWERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileQuestion size={18} className="text-primary" />
              Vedic Theory Assessment — Detailed Question Breakdown
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review candidate's exact choices for each multiple-choice question against authentic classical Jyotish keys
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theory Score:</span>
            <AIScoreBadge score={candidate.questionsScore} size="md" showLabel />
          </div>
        </div>

        {/* Scorecard banner */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-2xs text-muted-foreground uppercase tracking-wider font-semibold">Total Questions</p>
              <p className="text-lg font-bold text-foreground">{questionsList.length}</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <p className="text-2xs text-muted-foreground uppercase tracking-wider font-semibold">Answered</p>
              <p className="text-lg font-bold text-foreground">{answeredCount} of {questionsList.length}</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <p className="text-2xs text-muted-foreground uppercase tracking-wider font-semibold">Correct Answers</p>
              <p className="text-lg font-bold text-emerald-600">{correctCount} of {questionsList.length}</p>
            </div>
            <div className="w-px h-8 bg-border hidden sm:block" />
            <div>
              <p className="text-2xs text-muted-foreground uppercase tracking-wider font-semibold">Calculated Score</p>
              <p className="text-lg font-bold text-primary">{candidate.questionsScore} / 100</p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            candidate.questionsScore >= 75
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {candidate.questionsScore >= 75 ? 'PASSED THEORY CRITERIA' : 'BELOW 75% THRESHOLD'}
          </span>
        </div>

        {/* Detailed Question Cards */}
        <div className="space-y-4">
          {questionsList.map((q, qIndex) => {
            const chosenOptionIndex = getCandidateChoice(q, qIndex);
            const isAnswered = chosenOptionIndex !== undefined && chosenOptionIndex !== null;
            const isCorrect = isAnswered && chosenOptionIndex === q.correctIndex;
            const options = getOptionsList(q, lang);
            const questionText = getQuestionText(q, lang);
            const explanation = getExplanationText(q, lang);
            const topic = getTopicText(q, lang);

            return (
              <div 
                key={q.id || qIndex} 
                className={`p-4 rounded-xl border transition-all ${
                  !isAnswered
                    ? 'bg-muted/20 border-border'
                    : isCorrect
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800/60'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {qIndex + 1}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {topic}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {isAnswered ? (
                    isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        <Check size={11} /> Correct (+{Math.round(100 / (questionsList.length || 1))} pts)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                        <X size={11} /> Incorrect (0 pts)
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Unanswered
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-foreground mb-3 leading-relaxed">
                  {questionText}
                </p>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {options.map((opt: string, optIdx: number) => {
                    const isCandidateChoice = chosenOptionIndex === optIdx;
                    const isTheCorrectOption = optIdx === q.correctIndex;

                    let optStyle = 'border-border bg-card/60 text-muted-foreground';
                    let badge = null;

                    if (isCandidateChoice && isTheCorrectOption) {
                      optStyle = 'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-200 font-bold ring-1 ring-emerald-500';
                      badge = (
                        <span className="ml-auto text-2xs bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Check size={10} /> Candidate Answer (Correct)
                        </span>
                      );
                    } else if (isCandidateChoice && !isTheCorrectOption) {
                      optStyle = 'border-rose-500 bg-rose-100/70 dark:bg-rose-900/40 text-rose-950 dark:text-rose-200 font-bold ring-1 ring-rose-500';
                      badge = (
                        <span className="ml-auto text-2xs bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <X size={10} /> Candidate Selected (Wrong)
                        </span>
                      );
                    } else if (isTheCorrectOption) {
                      optStyle = 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold border-dashed';
                      badge = (
                        <span className="ml-auto text-2xs bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold px-1.5 py-0.5 rounded">
                          ✓ Correct Answer
                        </span>
                      );
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${optStyle}`}
                      >
                        <span className="w-5 h-5 rounded-md bg-muted/60 text-foreground font-mono font-bold flex items-center justify-center flex-shrink-0 text-2xs">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {badge}
                      </div>
                    );
                  })}
                </div>

                {/* Classical Vedic Explanation */}
                {explanation && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-2xs text-muted-foreground flex items-start gap-2">
                    <Sparkles size={12} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-foreground">Classical Shastra Principle: </span>
                      <span>{explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}