import React, { useState } from 'react';
import ReviewOverviewTab from './tabs/ReviewOverviewTab';
import ReviewAssessmentTab from './tabs/ReviewAssessmentTab';
import ReviewInterviewTab from './tabs/ReviewInterviewTab';
import ReviewScoringForm from './ReviewScoringForm';
import ReviewDecisionBar from './ReviewDecisionBar';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import type { ReviewCandidate } from './ReviewWorkspace';
import { 
  MapPin, Briefcase, FileText, Star, Bot, Sparkles, RefreshCw, 
  ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight 
} from 'lucide-react';

type TabId = 'overview' | 'assessment' | 'interview' | 'documents' | 'timeline';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'assessment', label: 'Assessment (25Q + Charts)' },
  { id: 'interview', label: 'AI Interview' },
  { id: 'documents', label: 'Documents' },
  { id: 'timeline', label: 'Timeline' },
];

interface ReviewDetailPanelProps {
  candidate: ReviewCandidate;
}

interface AIAdvisoryData {
  verdict: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  strengths: string[];
  concerns: string[];
  suggestedProbationConditions: string[];
  reasoning: string;
}

export default function ReviewDetailPanel({ candidate }: ReviewDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isGeneratingAdvisory, setIsGeneratingAdvisory] = useState(false);
  const [advisory, setAdvisory] = useState<AIAdvisoryData | null>(null);

  const handleGenerateAdvisory = async () => {
    setIsGeneratingAdvisory(true);
    try {
      const res = await fetch('/api/ai/reviewer-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidate.name,
          specialisations: candidate.specialisations,
          experience: '18 yrs',
          aiScore: candidate.aiScore,
          questionsScore: candidate.questionsScore,
          chartScore: candidate.chartScore,
          interviewScore: candidate.interviewScore,
        }),
      });

      const data = await res.json();
      if (data.success && data.advisory) {
        setAdvisory(data.advisory);
      } else {
        alert(data.error || 'Failed to generate AI advisory');
      }
    } catch (err: any) {
      alert(`AI Advisory error: ${err.message}`);
    } finally {
      setIsGeneratingAdvisory(false);
    }
  };

  const aiRecColor =
    candidate.aiRecommendation === 'Strong Candidate' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300' :
    candidate.aiRecommendation === 'Suitable' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' :
    candidate.aiRecommendation === 'Needs Human Review'? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-red-100 text-red-800 border-red-200';

  return (
    <div className="space-y-5">
      {/* Candidate header */}
      <div className="card-elevated p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl terracotta-gradient flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">{candidate.name}</h2>
                <StatusBadge status={candidate.status} />
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={13} />
                  {candidate.location}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText size={13} />
                  {candidate.appId}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {candidate.specialisations.map(s => (
                  <span key={`detail-spec-${s}`} className="text-xs font-semibold bg-accent/10 text-accent px-2.5 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Score summary & Advisory CTA */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-2xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">AI Discovery</p>
              <AIScoreBadge score={candidate.aiScore} size="lg" showLabel />
            </div>
            <div className="text-center">
              <p className="text-2xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Assessment</p>
              <AIScoreBadge score={candidate.overallAssessmentScore} size="lg" showLabel />
            </div>
            <div className="text-center">
              <p className="text-2xs text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">AI Recommendation</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${aiRecColor}`}>
                <Bot size={12} />
                {candidate.aiRecommendation}
              </span>
            </div>
            <button
              onClick={handleGenerateAdvisory}
              disabled={isGeneratingAdvisory}
              className="btn-primary flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              {isGeneratingAdvisory ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {isGeneratingAdvisory ? 'Analyzing...' : '360° AI Advisory'}
            </button>
          </div>
        </div>

        {/* 360° AI Advisory Banner */}
        {advisory && (
          <div className="mt-5 p-4 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-primary/20 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">GPT-4o 360° Reviewer Advisory</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  Verdict: {advisory.verdict.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  advisory.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                  advisory.riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                  'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                }`}>
                  Risk: {advisory.riskLevel}
                </span>
              </div>
            </div>

            <p className="text-xs text-foreground leading-relaxed">
              {advisory.reasoning}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <p className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Key Astrological Strengths:
                </p>
                <ul className="space-y-0.5 list-disc list-inside text-foreground">
                  {advisory.strengths.slice(0, 3).map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-1">
                <p className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> Suggested Probation Conditions:
                </p>
                <ul className="space-y-0.5 list-disc list-inside text-foreground">
                  {advisory.suggestedProbationConditions.slice(0, 3).map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Score breakdown row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
          {[
            { id: 'score-25q', label: '25-Question Score', value: candidate.questionsScore, icon: <Star size={13} /> },
            { id: 'score-chart', label: 'Chart Case Score', value: candidate.chartScore, icon: <Briefcase size={13} /> },
            { id: 'score-interview', label: 'AI Interview Score', value: candidate.interviewScore, icon: <Bot size={13} /> },
          ].map(s => (
            <div key={s.id} className="bg-muted/50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{s.icon}</span>
                <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
              </div>
              <AIScoreBadge score={s.value} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + content */}
      <div className="card-elevated overflow-hidden">
        <div className="border-b border-border px-5">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
            {tabs.map(tab => (
              <button
                key={`review-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'overview' && <ReviewOverviewTab candidate={candidate} />}
          {activeTab === 'assessment' && <ReviewAssessmentTab candidate={candidate} />}
          {activeTab === 'interview' && <ReviewInterviewTab candidate={candidate} />}
          {activeTab === 'documents' && <ReviewDocumentsTab />}
          {activeTab === 'timeline' && <ReviewTimelineTab />}
        </div>
      </div>

      {/* Reviewer scoring form */}
      <ReviewScoringForm candidate={candidate} />

      {/* Decision bar */}
      <ReviewDecisionBar candidate={candidate} />
    </div>
  );
}

function ReviewDocumentsTab() {
  const docs = [
    { id: 'doc-001', name: 'Aadhaar Card', category: 'Identity', status: 'Verified', uploadedDate: '10 Aug 2026', size: '2.1 MB' },
    { id: 'doc-002', name: 'Astrology Certification – ICAS', category: 'Professional Credential', status: 'Verified', uploadedDate: '10 Aug 2026', size: '1.4 MB' },
    { id: 'doc-003', name: 'Experience Letter – Jyotish Academy', category: 'Professional Credential', status: 'Verified', uploadedDate: '11 Aug 2026', size: '0.8 MB' },
    { id: 'doc-004', name: 'Business Registration Certificate', category: 'Supporting Document', status: 'Pending', uploadedDate: '12 Aug 2026', size: '3.2 MB' },
    { id: 'doc-005', name: 'Profile Photo', category: 'Identity', status: 'Verified', uploadedDate: '10 Aug 2026', size: '0.5 MB' },
  ];

  return (
    <div className="space-y-3">
      {docs.map(doc => (
        <div key={doc.id} className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{doc.name}</p>
              <p className="text-xs text-muted-foreground">{doc.category} · {doc.size} · Uploaded {doc.uploadedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {doc.status}
            </span>
            <button className="btn-ghost text-xs py-1.5 px-3">Preview</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewTimelineTab() {
  const events = [
    { id: 'tl-001', date: '17 Aug 2026', time: '08:52 AM', event: 'Assigned to reviewer: Priya Nair', type: 'info' },
    { id: 'tl-002', date: '15 Aug 2026', time: '03:14 PM', event: 'AI Interview completed — Score: 90/100', type: 'success' },
    { id: 'tl-003', date: '14 Aug 2026', time: '11:30 AM', event: 'Chart Case Assessment submitted — Score: 91/100', type: 'success' },
    { id: 'tl-004', date: '14 Aug 2026', time: '10:15 AM', event: '25-Question Assessment completed — Score: 88/100', type: 'success' },
    { id: 'tl-005', date: '13 Aug 2026', time: '02:40 PM', event: 'Application submitted — Profile 100% complete', type: 'success' },
    { id: 'tl-006', date: '12 Aug 2026', time: '09:20 AM', event: 'Documents uploaded and verified', type: 'success' },
    { id: 'tl-007', date: '10 Aug 2026', time: '04:00 PM', event: 'Outreach email delivered — candidate responded', type: 'info' },
    { id: 'tl-008', date: '09 Aug 2026', time: '02:30 PM', event: 'Outreach approved by Admin: Arjun Sharma', type: 'info' },
    { id: 'tl-009', date: '08 Aug 2026', time: '11:00 AM', event: 'AI Qualification Score: 94 — Ready for outreach', type: 'success' },
    { id: 'tl-010', date: '08 Aug 2026', time: '10:45 AM', event: 'Candidate discovered via Google Places — Chennai Vedic Campaign', type: 'info' },
  ];

  return (
    <div className="relative">
      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {events.map(ev => (
          <div key={ev.id} className="flex items-start gap-4 relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
              ev.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current" />
            </div>
            <div className="flex-1 pb-1">
              <p className="font-semibold text-sm text-foreground">{ev.event}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ev.date} · {ev.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}