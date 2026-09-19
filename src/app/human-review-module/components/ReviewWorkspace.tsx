'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  // Real candidate assessment data
  chartCaseAnalysis?: string;
  chartRemedy?: string;
  chartEvaluation?: any;
  chartCaseTitle?: string;
  chartCaseLagna?: string;
  chartCaseQuery?: string;
  chartCasePlacements?: any[];
  conversationHistory?: Array<{ role: 'ai' | 'user' | string; text: string; topic?: string; timestamp?: string }>;
  aiInterviewEvaluation?: any;
  interviewDurationSeconds?: number;
  interviewDurationFormatted?: string;
  assessmentDurationFormatted?: string;
  theoryAnswers?: Record<string | number, number>;
  theoryQuestionsList?: any[];
  tabViolations?: number;
  isDisqualified?: boolean;
  // Candidate dossier & credentials
  learningBackground?: string;
  courseDetails?: string;
  bio?: string;
  languages?: string[];
  phone?: string;
  email?: string;
  appliedAt?: string;
  experience?: string;
  idProofType?: string;
  idProofNumber?: string;
  idProofDocument?: string;
  assessmentLanguage?: string;
}

function mapCandidateToReview(c: Candidate, index: number): ReviewCandidate {
  const appData = c.applicationData || {};

  // Preserve authentic zero scores
  const qScore = typeof c.theoryScore === 'number' ? c.theoryScore 
    : typeof appData.theoryScore === 'number' ? appData.theoryScore 
    : (typeof c.aiScore === 'number' ? Math.min(99, Math.round(c.aiScore * 0.94)) : 0);

  const cScore = typeof c.chartCaseScore === 'number' ? c.chartCaseScore 
    : typeof appData.chartCaseScore === 'number' ? appData.chartCaseScore 
    : (typeof c.aiScore === 'number' ? Math.min(99, Math.round(c.aiScore * 0.96)) : 0);

  const iScore = typeof c.aiInterviewScore === 'number' ? c.aiInterviewScore 
    : typeof appData.aiInterviewScore === 'number' ? appData.aiInterviewScore 
    : (typeof c.aiScore === 'number' ? Math.min(99, Math.round(c.aiScore * 0.93)) : 0);

  const overall = typeof c.aiScore === 'number' ? c.aiScore : Math.round((qScore + cScore + iScore) / 3);
  
  const rec = overall >= 75 ? (overall >= 90 ? 'Strong Candidate' : 'Suitable') : 'Needs Human Review';
  const priority: 'high' | 'medium' | 'low' = overall >= 90 ? 'high' : overall >= 75 ? 'medium' : 'low';
  const assigned = index % 3 === 0 ? 'Priya Nair' : index % 3 === 1 ? 'Suresh Menon' : null;

  return {
    id: c.id,
    name: c.name,
    location: c.location,
    specialisations: c.specialisations && c.specialisations.length > 0 ? c.specialisations : ['Vedic Jyotish'],
    aiScore: overall,
    appId: `AP-2026-${c.id.replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0101'}`,
    status: c.applicationStatus || (c.lifecycleStatus === 'probation' ? 'Approved' : 'Human Review'),
    questionsScore: qScore,
    chartScore: cScore,
    interviewScore: iScore,
    overallAssessmentScore: overall,
    aiRecommendation: rec,
    reviewerAssigned: assigned,
    priority,
    chartCaseAnalysis: c.chartCaseAnalysis || appData.chartCaseAnalysis || '',
    chartRemedy: c.chartRemedy || appData.chartRemedy || '',
    chartEvaluation: c.chartEvaluation || appData.chartEvaluation || null,
    chartCaseTitle: c.chartCaseTitle || appData.chartCaseTitle || '',
    chartCaseLagna: c.chartCaseLagna || appData.chartCaseLagna || '',
    chartCaseQuery: c.chartCaseQuery || appData.chartCaseQuery || '',
    chartCasePlacements: c.chartCasePlacements || appData.chartCasePlacements || [],
    conversationHistory: c.conversationHistory || appData.conversationHistory || [],
    aiInterviewEvaluation: c.aiInterviewEvaluation || appData.aiInterviewEvaluation || null,
    interviewDurationSeconds: c.interviewDurationSeconds || appData.interviewDurationSeconds || 0,
    interviewDurationFormatted: c.interviewDurationFormatted || appData.interviewDurationFormatted || 'Not recorded',
    assessmentDurationFormatted: c.assessmentDurationFormatted || appData.assessmentDurationFormatted || 'Completed',
    theoryAnswers: c.theoryAnswers || appData.theoryAnswers || {},
    theoryQuestionsList: c.theoryQuestionsList || appData.theoryQuestionsList || [],
    tabViolations: c.tabViolations ?? appData.tabViolations ?? 0,
    isDisqualified: c.isDisqualified ?? appData.isDisqualified ?? false,
    learningBackground: c.learningBackground || appData.learningBackground || '',
    courseDetails: c.courseDetails || appData.courseDetails || '',
    bio: c.bio || c.profileSummary || appData.bio || '',
    languages: c.languages || appData.languages || [],
    phone: c.phone || '',
    email: c.email || '',
    appliedAt: c.appliedAt || (c.createdAt?.toDate ? c.createdAt.toDate().toISOString() : '') || '',
    experience: c.experience || '10+ years',
    idProofType: c.idProofType || appData.idProofType || '',
    idProofNumber: c.idProofNumber || appData.idProofNumber || '',
    idProofDocument: c.idProofDocument || appData.idProofDocument || '',
    assessmentLanguage: c.assessmentLanguage || appData.assessmentLanguage || 'en',
  };
}

export default function ReviewWorkspace() {
  const searchParams = useSearchParams();
  const urlCandidateId = searchParams.get('id') || searchParams.get('candidateId');

  const [candidates, setCandidates] = useState<ReviewCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string>(urlCandidateId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (allCandidates) => {
          const pool = allCandidates || [];
          // Filter candidates with application or in review stages
          let reviewPool = pool.filter(c => 
            Boolean(c.appliedAt) ||
            Boolean(c.theoryAnswers) ||
            Boolean(c.applicationData) ||
            Boolean(c.conversationHistory && c.conversationHistory.length > 0) ||
            c.lifecycleStatus === 'human-review' || 
            c.lifecycleStatus === 'screening' || 
            c.lifecycleStatus === 'applied' ||
            c.lifecycleStatus === 'rejected' ||
            c.applicationStatus !== null
          );

          // If a specific candidate was requested by ID but wasn't caught by filter, include them at top
          if (urlCandidateId && !reviewPool.some(c => c.id === urlCandidateId)) {
            const requested = pool.find(c => c.id === urlCandidateId);
            if (requested) {
              reviewPool = [requested, ...reviewPool];
            }
          }

          // Fallback if empty
          if (reviewPool.length === 0 && initialCandidatesData.length > 0) {
            reviewPool = initialCandidatesData;
          }

          const mapped = reviewPool.map((c, i) => mapCandidateToReview(c, i));
          // Sort newest applications first
          const sorted = [...mapped].sort((a, b) => {
            const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
            const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
            return timeB - timeA;
          });
          setCandidates(sorted);
          
          if (urlCandidateId && sorted.some(m => m.id === urlCandidateId)) {
            setSelectedId(urlCandidateId);
          } else if (sorted.length > 0) {
            setSelectedId(prev => (prev && sorted.some(m => m.id === prev) ? prev : sorted[0].id));
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
  }, [urlCandidateId]);

  // Sync if query param changes dynamically
  useEffect(() => {
    if (urlCandidateId && candidates.some(c => c.id === urlCandidateId)) {
      setSelectedId(urlCandidateId);
    }
  }, [urlCandidateId, candidates]);

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