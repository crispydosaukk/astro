import React from 'react';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import type { ReviewCandidate } from '../ReviewWorkspace';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Bot, 
  GraduationCap, 
  MapPin, 
  Globe, 
  Award, 
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface ReviewOverviewTabProps {
  candidate: ReviewCandidate;
}

export default function ReviewOverviewTab({ candidate }: ReviewOverviewTabProps) {
  const dynamicBreakdown = [
    { 
      id: 'qual-theory', 
      label: 'Vedic Theory Assessment', 
      score: candidate.questionsScore, 
      weight: '35%',
      desc: 'Multiple-choice classical Parashari principles & dasha calculations'
    },
    { 
      id: 'qual-chart', 
      label: 'Kundali Case Interpretation', 
      score: candidate.chartScore, 
      weight: '25%',
      desc: 'Blind chart interpretation, house/graha analysis & remedial ethics'
    },
    { 
      id: 'qual-interview', 
      label: 'AI Technical & Ethics Interview', 
      score: candidate.interviewScore, 
      weight: '40%',
      desc: 'Live interactive conversational test covering client empathy and ethics'
    },
    { 
      id: 'qual-composite', 
      label: 'Overall Composite Score', 
      score: candidate.aiScore, 
      weight: '100%',
      desc: 'Holistic weighted performance across all 3 screening pillars'
    },
  ];

  // Derive dynamic strengths from candidate's real assessment & interview evaluations
  const dynamicStrengths: string[] = [];
  if (candidate.chartEvaluation?.strengths && Array.isArray(candidate.chartEvaluation.strengths)) {
    candidate.chartEvaluation.strengths.forEach((s: string) => dynamicStrengths.push(`Kundali Case: ${s}`));
  }
  if (candidate.aiInterviewEvaluation?.strengths && Array.isArray(candidate.aiInterviewEvaluation.strengths)) {
    candidate.aiInterviewEvaluation.strengths.forEach((s: string) => dynamicStrengths.push(`Interview: ${s}`));
  }
  if (candidate.learningBackground) {
    dynamicStrengths.push(`Verified Training: Studied at ${candidate.learningBackground}`);
  }
  if (candidate.questionsScore >= 75) {
    dynamicStrengths.push(`Demonstrated solid theoretical grasp on classical Vedic shastra (${candidate.questionsScore}/100)`);
  }
  if (dynamicStrengths.length === 0) {
    dynamicStrengths.push(
      `${candidate.name} is a practitioner in ${candidate.location} specializing in ${candidate.specialisations.join(', ')}`,
      `Completed full multi-step recruitment screening on AstroParihar portal`
    );
  }

  // Derive dynamic areas for review / concerns
  const dynamicConcerns: string[] = [];
  if (candidate.questionsScore < 75) {
    dynamicConcerns.push(`Theory score (${candidate.questionsScore}/100) is below the 75% standard threshold.`);
  }
  if (candidate.chartScore < 75) {
    dynamicConcerns.push(`Kundali case interpretation score (${candidate.chartScore}/100) requires verification by senior panel.`);
  }
  if (candidate.interviewScore < 75) {
    dynamicConcerns.push(`Interview evaluation score (${candidate.interviewScore}/100) reflects hesitation or brief answers.`);
  }
  if (candidate.tabViolations && candidate.tabViolations > 0) {
    dynamicConcerns.push(`Proctoring alert: ${candidate.tabViolations} browser window/tab switches were logged during the exam.`);
  }
  if (candidate.chartEvaluation?.improvements && Array.isArray(candidate.chartEvaluation.improvements)) {
    candidate.chartEvaluation.improvements.forEach((imp: string) => dynamicConcerns.push(`Case Study: ${imp}`));
  }
  if (candidate.aiInterviewEvaluation?.areasForImprovement && Array.isArray(candidate.aiInterviewEvaluation.areasForImprovement)) {
    candidate.aiInterviewEvaluation.areasForImprovement.forEach((imp: string) => dynamicConcerns.push(`Interview: ${imp}`));
  }
  if (dynamicConcerns.length === 0) {
    dynamicConcerns.push('Standard document verification required before assigning live client calls.');
  }

  return (
    <div className="space-y-6">
      {/* Candidate Dossier Overview Card */}
      <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <GraduationCap size={16} className="text-primary" />
          Astrological Pedigree & Candidate Background
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground uppercase font-bold text-2xs">Studied At / Gurukul:</span>
            <p className="font-semibold text-foreground">
              {candidate.learningBackground || 'Gurukul / Traditional Parampara'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground uppercase font-bold text-2xs">Primary Practice Location:</span>
            <p className="font-semibold text-foreground flex items-center gap-1">
              <MapPin size={12} className="text-primary" />
              {candidate.location}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground uppercase font-bold text-2xs">Consultation Languages:</span>
            <p className="font-semibold text-foreground flex items-center gap-1">
              <Globe size={12} className="text-primary" />
              {candidate.languages && candidate.languages.length > 0 ? candidate.languages.join(', ') : 'Hindi, English'}
            </p>
          </div>
        </div>

        {candidate.bio && (
          <div className="pt-2 border-t border-border">
            <span className="text-muted-foreground uppercase font-bold text-2xs">Candidate Profile Bio:</span>
            <p className="text-xs text-foreground mt-1 leading-relaxed italic bg-card/60 p-3 rounded-lg border border-border/60">
              "{candidate.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Assessment Score Breakdown */}
      <div>
        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Bot size={16} className="text-primary" />
          Candidate's Real Assessment Score Breakdown
        </h4>
        <div className="space-y-3">
          {dynamicBreakdown.map(item => (
            <div key={item.id} className="p-3 bg-card rounded-xl border border-border flex items-center gap-4 flex-wrap">
              <div className="w-56 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground font-bold">{item.label}</span>
                  <span className="text-2xs text-muted-foreground font-semibold">{item.weight}</span>
                </div>
                <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</p>
              </div>
              <div className="flex-1 progress-bar-track min-w-[120px]">
                <div 
                  className={`progress-bar-fill ${
                    item.score >= 75 ? 'bg-emerald-500' : item.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`} 
                  style={{ width: `${Math.max(4, Math.min(100, item.score))}%` }} 
                />
              </div>
              <AIScoreBadge score={item.score} size="md" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dynamic Strengths */}
        <div className="bg-green-50/60 dark:bg-green-950/20 border border-green-200 dark:border-green-800/60 rounded-xl p-4">
          <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} />
            Evaluated Candidate Strengths
          </h4>
          <ul className="space-y-2">
            {dynamicStrengths.map((s, i) => (
              <li key={`str-${i}`} className="flex items-start gap-2 text-xs text-green-900 dark:text-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Concerns / Areas for Review */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4">
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
            <AlertTriangle size={15} />
            Areas for Committee Review
          </h4>
          <ul className="space-y-2 mb-4">
            {dynamicConcerns.map((c, i) => (
              <li key={`conc-${i}`} className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-amber-200 dark:border-amber-800/60 pt-3 mt-3">
            <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck size={13} />
              Proctoring & Assessment Integrity
            </h5>
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p>• Window / Tab switches recorded: <strong>{candidate.tabViolations ?? 0}</strong></p>
              <p>• Disqualification status: <strong>{candidate.isDisqualified ? 'Disqualified for Malpractice' : 'Passed Proctor Check'}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}