'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ReviewCandidate } from './ReviewWorkspace';
import { Star, CheckCircle, Loader2 } from 'lucide-react';
import { updateCandidateStatus } from '@/lib/firebase/candidateService';

interface ReviewFormData {
  knowledgeScore: number;
  experienceScore: number;
  communicationScore: number;
  caseAnalysisScore: number;
  professionalismScore: number;
  overallSuitabilityScore: number;
  reviewNotes: string;
  privateNotes: string;
  recommendation: string;
}

interface ReviewScoringFormProps {
  candidate: ReviewCandidate;
}

const scoringDimensions = [
  { id: 'knowledgeScore', label: 'Astrology Knowledge', description: 'Depth and accuracy of astrological knowledge demonstrated' },
  { id: 'experienceScore', label: 'Professional Experience', description: 'Quality and relevance of documented professional experience' },
  { id: 'communicationScore', label: 'Communication', description: 'Clarity, structure and professionalism in communication' },
  { id: 'caseAnalysisScore', label: 'Case Analysis', description: 'Quality of chart case interpretations and reasoning' },
  { id: 'professionalismScore', label: 'Professionalism', description: 'Professional conduct, ethics and client management' },
  { id: 'overallSuitabilityScore', label: 'Overall Suitability', description: 'Overall fit for AstroParihar verified astrologer network' },
] as const;

function ScoreSlider({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-primary cursor-pointer"
        aria-label={`Score for ${label}`}
      />
      <span className={`w-10 text-center font-bold text-sm tabular-nums rounded-md px-1.5 py-0.5 ${
        value >= 85 ? 'ai-score-high' : value >= 65 ? 'ai-score-medium' : 'ai-score-low'
      }`}>
        {value}
      </span>
    </div>
  );
}

export default function ReviewScoringForm({ candidate }: ReviewScoringFormProps) {
  const [scores, setScores] = useState<Record<string, number>>({
    knowledgeScore: 0,
    experienceScore: 0,
    communicationScore: 0,
    caseAnalysisScore: 0,
    professionalismScore: 0,
    overallSuitabilityScore: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ReviewFormData>();

  const averageScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setIsSaving(true);
      await updateCandidateStatus(candidate.id, {
        reviewerScores: {
          ...scores,
          averageScore,
          recommendation: data.recommendation,
          reviewNotes: data.reviewNotes,
          privateNotes: data.privateNotes,
          savedAt: new Date().toISOString(),
        },
        applicationStatus:
          data.recommendation === 'approve-probation' ? 'Approved' :
          data.recommendation === 'reject' ? 'Rejected' : 'Human Review',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(`Failed to save reviewer scores: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Star size={16} className="text-accent" />
            Reviewer Scoring
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your scores are independent of AI scores — human reviewer is final authority
          </p>
        </div>
        {averageScore > 0 && (
          <div className="text-center">
            <p className="text-2xs text-muted-foreground font-semibold uppercase tracking-wide">Reviewer Average</p>
            <span className={`text-2xl font-bold tabular-nums mt-1 block ${
              averageScore >= 85 ? 'text-green-700' : averageScore >= 65 ? 'text-amber-700' : 'text-red-700'
            }`}>
              {averageScore}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Scoring dimensions */}
        <div className="space-y-4">
          {scoringDimensions.map(dim => (
            <div key={dim.id} className="p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-start justify-between mb-1">
                <label className="label-field mb-0">{dim.label}</label>
              </div>
              <p className="helper-text mb-2">{dim.description}</p>
              <ScoreSlider
                value={scores[dim.id] ?? 0}
                onChange={v => setScores(prev => ({ ...prev, [dim.id]: v }))}
                label={dim.label}
              />
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div>
          <label className="label-field">Reviewer Recommendation</label>
          <p className="helper-text mb-2">Your final recommendation for this candidate</p>
          <select
            className={`input-field ${errors.recommendation ? 'error' : ''}`}
            {...register('recommendation', { required: 'Please select a recommendation' })}
          >
            <option value="">Select recommendation…</option>
            <option value="approve-probation">Approve for 30-Day Probation</option>
            <option value="request-info">Request Additional Information</option>
            <option value="hold">Put on Hold — Pending Further Review</option>
            <option value="reject">Reject Application</option>
          </select>
          {errors.recommendation && <p className="error-text">⚠ {errors.recommendation.message}</p>}
        </div>

        {/* Review notes */}
        <div>
          <label className="label-field">Review Notes</label>
          <p className="helper-text mb-1.5">These notes will be visible to the candidate if requested</p>
          <textarea
            rows={3}
            placeholder="Summarise your review findings — strengths, concerns, and basis for your recommendation…"
            className="input-field resize-none"
            {...register('reviewNotes')}
          />
        </div>

        {/* Private notes */}
        <div>
          <label className="label-field">Private Notes</label>
          <p className="helper-text mb-1.5">Internal notes visible only to admin and reviewers</p>
          <textarea
            rows={2}
            placeholder="Internal observations not shared with the candidate…"
            className="input-field resize-none"
            {...register('privateNotes')}
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="submit" 
            disabled={isSaving}
            className="btn-primary py-2.5 px-6 flex items-center gap-2"
          >
            {isSaving && <Loader2 size={15} className="animate-spin" />}
            {isSaving ? 'Saving Scores...' : 'Save Review Scores'}
          </button>
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-fade-in">
              <CheckCircle size={14} /> Review scores saved to candidate record!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}