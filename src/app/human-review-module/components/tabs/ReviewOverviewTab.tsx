import React from 'react';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import type { ReviewCandidate } from '../ReviewWorkspace';
import { CheckCircle2, AlertTriangle, Lightbulb, Bot } from 'lucide-react';

interface ReviewOverviewTabProps {
  candidate: ReviewCandidate;
}

const aiQualificationBreakdown = [
  { id: 'qual-vedic', label: 'Vedic Relevance', score: 98, weight: '25%' },
  { id: 'qual-exp', label: 'Professional Experience', score: 94, weight: '20%' },
  { id: 'qual-identity', label: 'Professional Identity', score: 91, weight: '15%' },
  { id: 'qual-website', label: 'Website Credibility', score: 88, weight: '15%' },
  { id: 'qual-spec', label: 'Specialisation Fit', score: 95, weight: '15%' },
  { id: 'qual-contact', label: 'Contactability', score: 90, weight: '10%' },
];

const strengths = [
  '18+ years of documented professional Vedic astrology practice',
  'Established physical practice in Chennai with verifiable business registration',
  'Strong online presence — website with client testimonials and certifications',
  'Certified by ICAS (Indian Council of Astrological Sciences)',
  'Specialises in both Vedic Jyotish and Prashna — rare combination',
];

const concerns = [
  'Business registration certificate upload still pending verification',
  'Limited social media presence compared to peers in the same region',
];

const aiNotes = [
  'Candidate demonstrates consistent professional practice over an extended period.',
  'Evidence of formal certification strengthens qualification significantly.',
  'Website content is domain-specific and professionally presented.',
  'AI confidence in qualification: 96% — recommend proceeding to probation.',
];

export default function ReviewOverviewTab({ candidate }: ReviewOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* AI Qualification Breakdown */}
      <div>
        <h4 className="text-md font-bold text-foreground mb-3 flex items-center gap-2">
          <Bot size={16} className="text-primary" />
          AI Qualification Score Breakdown
        </h4>
        <div className="space-y-2.5">
          {aiQualificationBreakdown.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-52 flex-shrink-0">
                <span className="text-sm text-foreground font-medium">{item.label}</span>
                <span className="text-2xs text-muted-foreground ml-auto">{item.weight}</span>
              </div>
              <div className="flex-1 progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${item.score}%` }} />
              </div>
              <AIScoreBadge score={item.score} size="sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="bg-green-50/60 border border-green-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} />
            AI-Identified Strengths
          </h4>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={`strength-${i}`} className="flex items-start gap-2 text-xs text-green-900">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} />
            Areas for Review
          </h4>
          <ul className="space-y-2 mb-4">
            {concerns.map((c, i) => (
              <li key={`concern-${i}`} className="flex items-start gap-2 text-xs text-amber-900">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>

          <div className="border-t border-amber-200 pt-3 mt-3">
            <h5 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
              <Lightbulb size={12} />
              AI Assessment Notes
            </h5>
            <ul className="space-y-1.5">
              {aiNotes.map((n, i) => (
                <li key={`note-${i}`} className="text-xs text-amber-800 leading-relaxed">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Discovery Evidence */}
      <div>
        <h4 className="text-md font-bold text-foreground mb-3">Discovery Evidence</h4>
        <div className="space-y-2.5">
          {[
            { id: 'ev-001', source: 'Google Places', url: 'maps.google.com/place/Sri-Jyotish-Kendra', evidence: 'Business listing — 4.8★ rating, 127 reviews, verified astrology practice since 2008', confidence: 98 },
            { id: 'ev-002', source: 'Web Search', url: 'jyotishkendra.in', evidence: 'Professional website with service descriptions, client testimonials, ICAS certification badge', confidence: 94 },
            { id: 'ev-003', source: 'Directory', url: 'astrologyindia.net/practitioners/venkataraman', evidence: 'Listed as certified Vedic astrologer with 18 years experience — profile verified', confidence: 89 },
          ].map(ev => (
            <div key={ev.id} className="p-3.5 bg-muted/40 rounded-xl border border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {ev.source}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono truncate">{ev.url}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{ev.evidence}</p>
                </div>
                <AIScoreBadge score={ev.confidence} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}