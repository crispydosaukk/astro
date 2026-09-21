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
  ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight,
  X, Download, Eye, Award, ExternalLink, Shield, Check, FileCheck, ZoomIn, User
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
  onUpdateCandidate?: (id: string, updates: Partial<ReviewCandidate>) => void;
}

interface AIAdvisoryData {
  verdict: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  strengths: string[];
  concerns: string[];
  suggestedProbationConditions: string[];
  reasoning: string;
}

export default function ReviewDetailPanel({ candidate, onUpdateCandidate }: ReviewDetailPanelProps) {
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
          name: candidate.name,
          specialisations: candidate.specialisations,
          experience: '18 yrs',
          aiScore: candidate.aiScore,
          questionsScore: candidate.questionsScore,
          chartScore: candidate.chartScore,
          interviewScore: candidate.interviewScore,
          chartCaseAnalysis: candidate.chartCaseAnalysis,
          chartRemedy: candidate.chartRemedy,
          interviewDurationFormatted: candidate.interviewDurationFormatted,
          conversationHistory: candidate.conversationHistory,
        }),
      });

      const data = await res.json();
      if (data.success && data.advisory) {
        setAdvisory(data.advisory);
      } else {
        alert(data.message || data.error || 'Failed to generate AI advisory');
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
                  Verdict: {advisory.verdict?.replace(/_/g, ' ') || 'SUITABLE'}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  advisory.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                  advisory.riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                  'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                }`}>
                  Risk: {advisory.riskLevel || 'MODERATE'}
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
                  {(advisory.strengths || []).slice(0, 3).map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-1">
                <p className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> Suggested Probation Conditions:
                </p>
                <ul className="space-y-0.5 list-disc list-inside text-foreground">
                  {(advisory.suggestedProbationConditions || advisory.concerns || []).slice(0, 3).map((c, idx) => (
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
          {activeTab === 'documents' && <ReviewDocumentsTab candidate={candidate} />}
          {activeTab === 'timeline' && <ReviewTimelineTab />}
        </div>
      </div>

      {/* Reviewer scoring form */}
      <ReviewScoringForm candidate={candidate} />

      {/* Decision bar */}
      <ReviewDecisionBar candidate={candidate} onUpdateCandidate={onUpdateCandidate} />
    </div>
  );
}

interface ReviewDocItem {
  id: string;
  name: string;
  category: string;
  status: 'Verified' | 'Pending';
  uploadedDate: string;
  size: string;
  type: 'aadhaar' | 'icas' | 'experience' | 'business' | 'photo';
}

function ReviewDocumentsTab({ candidate }: { candidate: ReviewCandidate }) {
  const [docs, setDocs] = useState<ReviewDocItem[]>([
    { id: 'doc-001', name: 'Aadhaar Card', category: 'Identity', status: 'Verified', uploadedDate: '10 Aug 2026', size: '2.1 MB', type: 'aadhaar' },
    { id: 'doc-002', name: 'Astrology Certification – ICAS', category: 'Professional Credential', status: 'Verified', uploadedDate: '10 Aug 2026', size: '1.4 MB', type: 'icas' },
    { id: 'doc-003', name: 'Experience Letter – Jyotish Academy', category: 'Professional Credential', status: 'Verified', uploadedDate: '11 Aug 2026', size: '0.8 MB', type: 'experience' },
    { id: 'doc-004', name: 'Business Registration Certificate', category: 'Supporting Document', status: 'Pending', uploadedDate: '12 Aug 2026', size: '3.2 MB', type: 'business' },
    { id: 'doc-005', name: 'Profile Photo', category: 'Identity', status: 'Verified', uploadedDate: '10 Aug 2026', size: '0.5 MB', type: 'photo' },
  ]);

  const [previewDoc, setPreviewDoc] = useState<ReviewDocItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const toggleDocStatus = (docId: string) => {
    setDocs(prev => prev.map(d => {
      if (d.id === docId) {
        const nextStatus = d.status === 'Verified' ? 'Pending' : 'Verified';
        return { ...d, status: nextStatus };
      }
      return d;
    }));
    if (previewDoc && previewDoc.id === docId) {
      setPreviewDoc(prev => prev ? { ...prev, status: prev.status === 'Verified' ? 'Pending' : 'Verified' } : null);
    }
  };

  const handleDownload = (doc: ReviewDocItem) => {
    // Generate a simple downloadable text/svg file for testing
    const blob = new Blob([
      `Document: ${doc.name}\nCandidate: ${candidate.name}\nCategory: ${doc.category}\nStatus: ${doc.status}\nUploaded: ${doc.uploadedDate}\nVerification ID: AP-DOC-${candidate.id}-${doc.id}`
    ], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidate.name.replace(/\s+/g, '_')}_${doc.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {docs.map(doc => (
        <div key={doc.id} className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
              {doc.type === 'icas' ? <Award size={18} /> : doc.type === 'photo' ? <User size={18} /> : <FileText size={18} />}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{doc.name}</p>
              <p className="text-xs text-muted-foreground">{doc.category} · {doc.size} · Uploaded {doc.uploadedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              doc.status === 'Verified' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
            }`}>
              {doc.status}
            </span>
            <button 
              onClick={() => {
                setZoomLevel(1);
                setPreviewDoc(doc);
              }}
              className="btn-ghost text-xs py-1.5 px-3 border border-border hover:border-primary/50 hover:bg-primary/5 text-foreground font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <Eye size={13} />
              Preview
            </button>
          </div>
        </div>
      ))}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  {previewDoc.type === 'icas' ? <Award size={18} /> : previewDoc.type === 'photo' ? <User size={18} /> : <FileText size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{previewDoc.name}</h3>
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                      previewDoc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {previewDoc.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Candidate: <span className="font-medium text-foreground">{candidate.name}</span> · {previewDoc.category} · {previewDoc.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(prev => (prev === 1 ? 1.25 : 1))}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Toggle Zoom"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Document Canvas Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-muted/10 flex items-center justify-center">
              <div 
                className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* 1. AADHAAR CARD PREVIEW */}
                {previewDoc.type === 'aadhaar' && (
                  <div className="p-6 font-sans">
                    {/* Top tricolour line */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-full mb-4" />
                    
                    {/* UIDAI Header */}
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 tracking-wide">भारत सरकार</p>
                        <p className="text-xs font-bold text-slate-800 tracking-wide">GOVERNMENT OF INDIA</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 rounded-full border border-amber-600/50 flex items-center justify-center mx-auto text-amber-800 font-serif font-bold text-xs">
                          🏛️
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800 tracking-wide">भारतीय विशिष्ट पहचान प्राधिकरण</p>
                        <p className="text-2xs font-semibold text-slate-600">Unique Identification Authority of India</p>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="col-span-1 flex flex-col items-center">
                        <div className="w-28 h-32 bg-slate-100 border-2 border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                          {candidate.idProofDocument && (candidate.idProofDocument.startsWith('data:') || candidate.idProofDocument.startsWith('http')) ? (
                            <img src={candidate.idProofDocument} alt="Aadhaar Document" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg">
                                {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <span className="text-2xs font-bold text-slate-500 mt-2">PHOTO</span>
                            </>
                          )}
                          <div className="absolute bottom-1 right-1 bg-green-600 text-white rounded-full p-0.5">
                            <Check size={10} />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 space-y-1.5 text-xs">
                        <div>
                          <p className="text-slate-500 text-2xs font-semibold">नाम / Name</p>
                          <p className="font-bold text-sm text-slate-900">{candidate.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-2xs font-semibold">जन्म तिथि / DOB</p>
                          <p className="font-medium text-slate-800">15/07/1982</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-2xs font-semibold">लिंग / Gender</p>
                          <p className="font-medium text-slate-800">Male / Female</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-2xs font-semibold">दस्तावेज़ संख्या / Document ID</p>
                          <p className="font-mono font-bold text-slate-800 tracking-wider">
                            XXXX XXXX {candidate.idProofNumber ? candidate.idProofNumber.slice(-4) : '7821'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Aadhaar Number & Slogan Footer */}
                    <div className="mt-5 pt-3 border-t text-center space-y-1">
                      <p className="font-mono font-extrabold text-base tracking-widest text-slate-900">
                        XXXX  XXXX  {candidate.idProofNumber ? candidate.idProofNumber.slice(-4) : '7821'}
                      </p>
                      <p className="text-2xs font-bold text-red-700 tracking-wide">
                        मेरा आधार, मेरी पहचान
                      </p>
                      <div className="flex items-center justify-center gap-1.5 text-2xs text-emerald-700 font-semibold pt-1">
                        <ShieldCheck size={13} />
                        <span>Digitally Verified via UIDAI Sandbox Gateway · AstroParihar Compliant</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ICAS ASTROLOGY CERTIFICATE PREVIEW */}
                {previewDoc.type === 'icas' && (
                  <div className="p-8 bg-[#fffdfa] border-8 border-double border-amber-700/40 relative font-serif text-center">
                    <div className="border border-amber-600/30 p-6 rounded-lg space-y-3">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-700 text-amber-800 flex items-center justify-center mx-auto text-xl">
                        ☀️
                      </div>
                      <h4 className="text-base font-extrabold tracking-widest text-amber-950 uppercase">
                        Indian Council of Astrological Sciences
                      </h4>
                      <p className="text-2xs text-amber-800 italic">
                        (Regd. Under Societies Registration Act XXI of 1860) · Founded by Dr. B. V. Raman
                      </p>
                      <div className="h-px bg-amber-300 w-3/4 mx-auto my-2" />
                      <p className="text-xs text-slate-700 uppercase tracking-wider">This Diploma is Conferred Upon</p>
                      <h3 className="text-2xl font-bold text-amber-900 tracking-wide font-serif">
                        {candidate.name}
                      </h3>
                      <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                        having completed the comprehensive post-graduate curriculum in Classical Vedic Parashari Principles, 
                        Muhurtha calculations, and Horary Prashna Shastra with distinction.
                      </p>
                      <div className="py-2">
                        <span className="inline-block bg-amber-100 text-amber-950 font-bold px-4 py-1.5 rounded-full border border-amber-300 text-xs tracking-widest uppercase">
                          Jyotish Praveena & Jyotish Visharada
                        </span>
                      </div>
                      <div className="flex items-end justify-between pt-6 text-2xs text-slate-600 border-t border-amber-200 mt-4">
                        <div className="text-left">
                          <p className="font-mono font-bold text-slate-800">ICAS/REG/2022/{candidate.id.replace(/[^0-9]/g, '').slice(-4) || '8841'}</p>
                          <p>Issued: 10 August 2022</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-600/10 border-2 border-dashed border-amber-700 flex items-center justify-center text-amber-800 text-2xs font-bold">
                          SEAL
                        </div>
                        <div className="text-right">
                          <p className="font-serif italic font-bold text-slate-800">Justice S. N. Kapoor</p>
                          <p>National President, ICAS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EXPERIENCE LETTER PREVIEW */}
                {previewDoc.type === 'experience' && (
                  <div className="p-8 font-sans text-slate-800 space-y-4">
                    <div className="border-b-2 border-slate-800 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 tracking-wide uppercase">
                          Jyotish Vigyan Research Academy & Sansthan
                        </h4>
                        <p className="text-2xs text-slate-600">Center for Vedic Studies & Applied Astrological Consultation</p>
                      </div>
                      <span className="text-2xs font-mono text-slate-500">Ref: JVRA/EXP/2026/04</span>
                    </div>

                    <div className="text-right text-xs text-slate-500">Date: 11 August 2026</div>

                    <div className="text-center py-1">
                      <h5 className="font-bold text-xs uppercase tracking-wider underline">TO WHOMSOEVER IT MAY CONCERN</h5>
                    </div>

                    <p className="text-xs leading-relaxed text-justify">
                      This is to certify that <strong>{candidate.name}</strong> has been actively associated with our panel of 
                      professional Vedic Astrological consultants for over <strong>{candidate.experience || '12+ years'}</strong>.
                    </p>

                    <p className="text-xs leading-relaxed text-justify">
                      During this tenure, they have conducted rigorous natal horoscope evaluations, matchmaking assessments (Ashtakoota), 
                      and predictive consultations. They uphold exemplary astrological ethics, depth of Shastric knowledge, 
                      and client discretion.
                    </p>

                    <p className="text-xs leading-relaxed">
                      We unconditionally recommend them for verified senior astrologer onboarding on the AstroParihar platform.
                    </p>

                    <div className="pt-8 flex items-end justify-between">
                      <div className="text-left text-xs">
                        <div className="w-16 h-16 rounded-full border border-blue-900/40 flex items-center justify-center text-blue-900 text-2xs font-bold">
                          VERIFIED
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-serif italic font-bold text-slate-900 text-sm">Dr. K. N. Somayaji</p>
                        <p className="text-2xs text-slate-600">Director of Academic Affairs</p>
                        <p className="text-2xs text-slate-600">Jyotish Vigyan Academy</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. BUSINESS REGISTRATION PREVIEW */}
                {previewDoc.type === 'business' && (
                  <div className="p-8 font-sans text-slate-800 space-y-4 bg-slate-50/50">
                    <div className="text-center border-b pb-3 space-y-1">
                      <p className="text-2xs font-bold text-slate-600">GOVERNMENT OF INDIA</p>
                      <h4 className="text-sm font-bold text-slate-900 uppercase">
                        Ministry of Micro, Small and Medium Enterprises
                      </h4>
                      <p className="text-2xs font-semibold text-emerald-700">UDYAM REGISTRATION CERTIFICATE</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border text-xs space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 font-medium">UDYAM REG. NO.</span>
                        <span className="col-span-2 font-mono font-bold text-slate-900">
                          UDYAM-DL-03-00{candidate.id.replace(/[^0-9]/g, '').slice(-4) || '9120'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 font-medium">ENTERPRISE NAME</span>
                        <span className="col-span-2 font-bold text-slate-900">
                          {candidate.businessName || `${candidate.name} Vedic Jyotish & Vastu Solutions`}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 font-medium">CLASSIFICATION</span>
                        <span className="col-span-2 text-slate-800 font-semibold">Micro Enterprise · Professional Services</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 font-medium">NIC CODE (5 DIGIT)</span>
                        <span className="col-span-2 text-slate-800 font-mono">96099 (Astrological and Spiritual Consultation Services)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500 font-medium">LOCATION</span>
                        <span className="col-span-2 text-slate-800">{candidate.location || 'New Delhi, India'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-2xs text-slate-500 pt-2">
                      <span>Digitally Generated via National MSME Portal</span>
                      <span className="font-mono">Checksum: 8fa92b...verified</span>
                    </div>
                  </div>
                )}

                {/* 5. PROFILE PHOTO PREVIEW */}
                {previewDoc.type === 'photo' && (
                  <div className="p-8 text-center space-y-4">
                    <div className="w-40 h-40 mx-auto rounded-full terracotta-gradient flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white relative overflow-hidden">
                      {candidate.idProofDocument && (candidate.idProofDocument.startsWith('data:') || candidate.idProofDocument.startsWith('http')) ? (
                        <img src={candidate.idProofDocument} alt={candidate.name} className="w-full h-full object-cover" />
                      ) : (
                        candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{candidate.name}</h4>
                      <p className="text-xs text-slate-500">{candidate.location} · Vedic Astrology Practitioner</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border max-w-sm mx-auto text-xs space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Biometric Match Score:</span>
                        <span className="font-bold text-emerald-700">99.4% Match</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Image Resolution:</span>
                        <span className="font-mono text-slate-800">1200 x 1200 px (300 DPI)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Lighting & Clarity:</span>
                        <span className="font-semibold text-emerald-700">Pass (Studio Standard)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDocStatus(previewDoc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    previewDoc.status === 'Verified'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      : 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  {previewDoc.status === 'Verified' ? 'Mark as Pending' : 'Approve & Mark Verified'}
                </button>
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground flex items-center gap-1.5 transition"
                >
                  <Download size={13} /> Download Document
                </button>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
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