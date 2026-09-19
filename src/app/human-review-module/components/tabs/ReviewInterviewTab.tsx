import React from 'react';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import type { ReviewCandidate } from '../ReviewWorkspace';
import { Bot, User, Clock, CheckCircle2, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

interface ReviewInterviewTabProps {
  candidate: ReviewCandidate;
}

export default function ReviewInterviewTab({ candidate }: ReviewInterviewTabProps) {
  const evalData = candidate.aiInterviewEvaluation;
  const history = candidate.conversationHistory || [];
  const duration = candidate.interviewDurationFormatted || 'Completed';
  const candidateAnswers = history.filter(m => m.role === 'user');
  const answeredCount = candidateAnswers.length;
  const safeScore = candidate.interviewScore || 0;

  const dimensions = evalData?.technicalScore !== undefined ? [
    { id: 'dim-knowledge', label: 'Astrology Knowledge Depth', score: Math.round((evalData.technicalScore / 25) * 100) },
    { id: 'dim-ethics', label: 'Remedial & Consultation Ethics', score: Math.round((evalData.ethicsScore / 25) * 100) },
    { id: 'dim-comm', label: 'Client Empathy & Communication', score: Math.round((evalData.communicationScore / 25) * 100) },
    { id: 'dim-clarity', label: 'Clarity & Practical Solution', score: Math.round((evalData.clarityScore / 25) * 100) },
  ] : [
    { id: 'dim-knowledge', label: 'Astrology Knowledge Depth', score: answeredCount === 0 ? 0 : safeScore },
    { id: 'dim-ethics', label: 'Professional & Remedial Ethics', score: answeredCount === 0 ? 0 : safeScore },
    { id: 'dim-comm', label: 'Client Communication Clarity', score: answeredCount === 0 ? 0 : safeScore },
    { id: 'dim-clarity', label: 'Practical Application', score: answeredCount === 0 ? 0 : safeScore },
  ];

  const recommendation = evalData?.recommendation 
    || (answeredCount === 0 ? 'REJECT / NO_ANSWERS' 
        : answeredCount < 3 ? 'HOLD_FOR_REVIEW' 
        : safeScore >= 80 ? 'STRONG_PROCEED' 
        : safeScore >= 60 ? 'PROCEED_WITH_ASSESSMENT' 
        : 'REJECT');

  const recBadgeClass = (safeScore >= 75 && answeredCount >= 3)
    ? 'text-green-700 dark:text-green-400 bg-green-500/10 border-green-500/30'
    : answeredCount === 0
      ? 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/30'
      : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';

  const aiSummaryText = evalData?.summary 
    || (answeredCount === 0 
        ? `${candidate.name} did not record any candidate responses during the AI screening interview.` 
        : answeredCount < 3
          ? `${candidate.name} partially answered ${answeredCount} of 3 interview questions. Full panel verification required.`
          : `${candidate.name} completed the AI interview screening with an evaluated score of ${safeScore}/100.`);

  return (
    <div className="space-y-6">
      {/* Interview summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-muted/40 rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-bold text-foreground">Interview Performance</h4>
            <AIScoreBadge score={safeScore} size="md" showLabel />
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Interval Taken:</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Clock size={13} className="text-amber-600" />
                {duration}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Questions Answered:</span>
              <span className="font-semibold text-foreground">
                {answeredCount} of 3 Key Questions
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">AI Recommendation:</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${recBadgeClass}`}>
                {recommendation}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 bg-muted/20 p-4 rounded-xl border border-border">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Competency Dimension Breakdown
          </h5>
          {dimensions.map(d => (
            <div key={d.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-48 flex-shrink-0 truncate">{d.label}</span>
              <div className="flex-1 progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${d.score}%` }} />
              </div>
              <AIScoreBadge score={d.score} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-2.5">
          <Bot size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">AI Examiner Technical Evaluation</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {aiSummaryText}
            </p>
            {evalData?.strengths?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-2xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Strengths:</span>
                {evalData.strengths.map((str: string, i: number) => (
                  <span key={i} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {str}
                  </span>
                ))}
              </div>
            )}
            {evalData?.areasForImprovement?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-2xs">
                <span className="font-bold text-amber-700 dark:text-amber-400">Areas to Verify:</span>
                {evalData.areasForImprovement.map((imp: string, i: number) => (
                  <span key={i} className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    {imp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h4 className="text-md font-bold text-foreground">Actual Candidate Interview Transcript</h4>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            ⏱️ Total Duration: {duration}
          </span>
        </div>

        {answeredCount === 0 && history.length > 0 && (
          <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
            <span>Candidate only received the initial examiner question and did not submit any response before completing application.</span>
          </div>
        )}

        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((entry, i) => {
              const isCandidate = entry.role === 'user';
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isCandidate ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                    isCandidate ? 'bg-emerald-600 text-white shadow-xs' : 'bg-primary text-primary-foreground'
                  }`}>
                    {isCandidate ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[82%] ${isCandidate ? 'items-end' : ''}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isCandidate ? 'justify-end' : ''}`}>
                      <span className={`text-xs font-bold ${isCandidate ? 'text-emerald-700 dark:text-emerald-400' : 'text-primary'}`}>
                        {isCandidate ? `${candidate.name} (Candidate Actual Answer)` : 'AI Astrological Examiner'}
                      </span>
                      {entry.topic && (
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                          {entry.topic}
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isCandidate
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 text-foreground font-medium shadow-xs'
                        : 'bg-muted/50 border border-border text-foreground shadow-2xs'
                    }`}>
                      {entry.text}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 bg-muted/20 border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground">
              Candidate has not recorded an interview conversation yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}