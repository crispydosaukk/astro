import React from 'react';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import type { ReviewCandidate } from '../ReviewWorkspace';

interface ReviewAssessmentTabProps {
  candidate: ReviewCandidate;
}

const questionResults = [
  { id: 'q-001', num: 1, category: 'Vedic Fundamentals', question: 'Explain the significance of the Lagna (Ascendant) in a natal chart and its role in personality determination.', score: 9, maxScore: 10, aiEval: 'Excellent — comprehensive explanation with practical examples' },
  { id: 'q-002', num: 2, category: 'Planetary Dignities', question: 'Describe the concept of Shadbala and how it is used to assess planetary strength.', score: 8, maxScore: 10, aiEval: 'Good — covered primary components but missed Sthana Bala nuance' },
  { id: 'q-003', num: 3, category: 'Dasha Systems', question: 'Compare Vimshottari Dasha with Ashtottari Dasha — when would you use each?', score: 9, maxScore: 10, aiEval: 'Excellent — demonstrated deep practical knowledge' },
  { id: 'q-004', num: 4, category: 'Divisional Charts', question: 'Explain the use of Navamsha (D9) chart in marriage and relationship analysis.', score: 10, maxScore: 10, aiEval: 'Outstanding — included advanced interpretation techniques' },
  { id: 'q-005', num: 5, category: 'Prashna', question: 'Describe the key principles of Prashna Jyotish and how it differs from natal chart analysis.', score: 9, maxScore: 10, aiEval: 'Excellent — clear differentiation with practical application' },
];

const chartCases = [
  {
    id: 'cc-001',
    caseNum: 1,
    scenario: 'Career Analysis — Male, born 14 March 1985, 06:30 AM, Chennai',
    candidateAnswer: 'The native has Leo Lagna with Sun in 8th house conjunct Mercury. Saturn aspects Lagna from 10th, indicating career delays but ultimate stability. Jupiter in 5th house in Sagittarius strengthens dharmic career paths. The native is likely in a research, technical or spiritual profession with government connections possible after age 35 due to Saturn maturation...',
    aiScore: 88,
    aiFeedback: 'Good analysis of Lagna lord placement and Saturn influence. Could have expanded on Dasha timing and current period analysis.',
    expectedAreas: ['Lagna analysis', 'Career houses (2, 6, 10)', 'Dasha period', 'Planetary periods'],
  },
  {
    id: 'cc-002',
    caseNum: 2,
    scenario: 'Marriage Timing — Female, born 22 July 1990, 11:45 PM, Madurai',
    candidateAnswer: 'Scorpio Lagna with Mars in 7th house in Taurus — strong desire for partnership but delays indicated. Venus as 7th lord placed in 8th house (Gemini) with Mercury suggests unconventional marriage timing. Navamsha examination shows Venus in Pisces (exalted) — quality of marriage is good despite timing delays. Current Rahu Dasha (2018-2036) with Jupiter antardasha (2023-2026) is highly favourable for marriage...',
    aiScore: 94,
    aiFeedback: 'Excellent Navamsha integration. Precise Dasha-Antardasha analysis with timing. Strong case analysis.',
    expectedAreas: ['7th house analysis', 'Venus placement', 'Navamsha', 'Dasha timing'],
  },
];

export default function ReviewAssessmentTab({ candidate }: ReviewAssessmentTabProps) {
  return (
    <div className="space-y-7">
      {/* 25 Questions Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-bold text-foreground">25-Question Assessment</h4>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Overall Score:</span>
            <AIScoreBadge score={candidate.questionsScore} size="md" showLabel />
          </div>
        </div>

        <div className="space-y-3">
          {questionResults.map(q => (
            <div key={q.id} className="p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 tabular-nums">
                    {q.num}
                  </span>
                  <div className="min-w-0">
                    <span className="text-2xs font-bold text-accent uppercase tracking-wide">{q.category}</span>
                    <p className="text-sm text-foreground font-medium mt-0.5 leading-snug">{q.question}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="font-bold text-md tabular-nums text-foreground">{q.score}/{q.maxScore}</span>
                </div>
              </div>
              <div className="ml-9 mt-2 p-2.5 bg-green-50/60 rounded-lg border border-green-200">
                <p className="text-xs text-green-800 font-medium">
                  <span className="font-bold">AI Evaluation:</span> {q.aiEval}
                </p>
              </div>
            </div>
          ))}

          <div className="p-3 bg-muted/40 rounded-lg text-center text-xs text-muted-foreground">
            Showing 5 of 25 questions — <span className="text-primary font-semibold cursor-pointer hover:underline">View all 25 questions</span>
          </div>
        </div>
      </div>

      {/* Chart Cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-bold text-foreground">5 Chart Case Assessments</h4>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Overall Score:</span>
            <AIScoreBadge score={candidate.chartScore} size="md" showLabel />
          </div>
        </div>

        <div className="space-y-4">
          {chartCases.map(cc => (
            <div key={cc.id} className="border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">Chart Case {cc.caseNum}</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{cc.scenario}</p>
                </div>
                <AIScoreBadge score={cc.aiScore} size="md" showLabel />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Candidate Interpretation</p>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
                    {cc.candidateAnswer}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Expected Areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cc.expectedAreas.map((area, i) => (
                        <span key={`ea-${cc.id}-${i}`} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">AI Feedback</p>
                    <p className="text-xs text-foreground leading-relaxed">{cc.aiFeedback}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="p-3 bg-muted/40 rounded-lg text-center text-xs text-muted-foreground">
            Showing 2 of 5 chart cases — <span className="text-primary font-semibold cursor-pointer hover:underline">View all 5 cases</span>
          </div>
        </div>
      </div>
    </div>
  );
}