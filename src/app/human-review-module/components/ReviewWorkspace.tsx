'use client';

import React, { useState, useEffect } from 'react';
import ReviewCandidateList from './ReviewCandidateList';
import ReviewDetailPanel from './ReviewDetailPanel';
import { subscribeToCandidates, initialCandidatesData, Candidate } from '@/lib/firebase/candidateService';
import { Loader2 } from 'lucide-react';

export interface ReviewCandidate {
  id: string;
  name: string;
  location: string;
  specialisations: string[];
  aiScore: number;
  appId: string;
  status: string;
  questionsScore: number;
  chartScore: number;
  interviewScore: number;
  overallAssessmentScore: number;
  aiRecommendation: string;
  reviewerAssigned: string | null;
  priority: 'high' | 'medium' | 'low';
}

function mapCandidateToReview(c: Candidate, index: number): ReviewCandidate {
  const qScore = Math.min(99, Math.round(c.aiScore * 0.94));
  const cScore = Math.min(99, Math.round(c.aiScore * 0.96));
  const iScore = Math.min(99, Math.round(c.aiScore * 0.93));
  const overall = Math.round((qScore + cScore + iScore) / 3);
  
  const rec = c.aiScore >= 90 ? 'Strong Candidate' : c.aiScore >= 80 ? 'Suitable' : 'Needs Human Review';
  const priority: 'high' | 'medium' | 'low' = c.aiScore >= 90 ? 'high' : c.aiScore >= 80 ? 'medium' : 'low';
  const assigned = index % 3 === 0 ? 'Priya Nair' : index % 3 === 1 ? 'Suresh Menon' : null;

  return {
    id: c.id,
    name: c.name,
    location: c.location,
    specialisations: c.specialisations && c.specialisations.length > 0 ? c.specialisations : ['Vedic Jyotish'],
    aiScore: c.aiScore,
    appId: `AP-2026-${c.id.replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0101'}`,
    status: c.applicationStatus || (c.lifecycleStatus === 'probation' ? 'Approved' : 'Human Review'),
    questionsScore: qScore,
    chartScore: cScore,
    interviewScore: iScore,
    overallAssessmentScore: overall,
    aiRecommendation: rec,
    reviewerAssigned: assigned,
    priority,
  };
}

export default function ReviewWorkspace() {
  const [candidates, setCandidates] = useState<ReviewCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (allCandidates) => {
          const pool = allCandidates || [];
          // Prioritize candidates with application or in review stages
          const reviewPool = pool.filter(c => 
            c.lifecycleStatus === 'human-review' || 
            c.lifecycleStatus === 'screening' || 
            c.lifecycleStatus === 'applied' ||
            c.applicationStatus !== null
          );
          const mapped = reviewPool.map((c, i) => mapCandidateToReview(c, i));
          setCandidates(mapped);
          if (mapped.length > 0) {
            setSelectedId(prev => (prev && mapped.some(m => m.id === prev) ? prev : mapped[0].id));
          } else {
            setSelectedId('');
          }
          setLoading(false);
        },
        () => {
          setCandidates([]);
          setSelectedId('');
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setCandidates([]);
      setSelectedId('');
      setLoading(false);
    }
  }, []);

  const selected = candidates.find(c => c.id === selectedId) || candidates[0];

  const pendingCount = candidates.filter(c => c.status === 'Human Review' || c.status === 'Under Screening').length;
  const unassignedCount = candidates.filter(c => !c.reviewerAssigned).length;
  const approvedCount = candidates.filter(c => c.status === 'Approved').length;

  if (loading) {
    return (
      <div className="card-elevated p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm font-semibold">Loading candidate review queue from Firestore...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Human Review Module</h1>
        <p className="text-muted-foreground mt-1 text-md">
          Reviewer workspace — complete 360° candidate evaluation with live GPT-4o Advisory before final decision
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {pendingCount} Pending Reviews
        </div>
        <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold">
          {unassignedCount} Unassigned
        </div>
        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
          {approvedCount} Approved in Pipeline
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="card-elevated p-12 text-center text-muted-foreground">
          <p className="text-base font-semibold">No candidates currently in the review queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
          {/* Candidate list panel */}
          <div className="xl:col-span-1">
            <ReviewCandidateList
              candidates={candidates}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Detail panel */}
          <div className="xl:col-span-3">
            {selected && <ReviewDetailPanel candidate={selected} />}
          </div>
        </div>
      )}
    </div>
  );
}