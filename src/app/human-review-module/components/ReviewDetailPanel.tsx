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
  X, Download, Eye, Award, ExternalLink, Shield, Check, FileCheck, ZoomIn, ZoomOut, User, CreditCard
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

interface CandidateDocItem {
  id: string;
  name: string;
  category: string;
  required: boolean;
  docNumber?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  uploadedDate: string;
  status: 'Verified' | 'Pending';
  type: 'aadhaar' | 'pan' | 'certificate' | 'experience' | 'other';
}

function ReviewDocumentsTab({ candidate }: { candidate: ReviewCandidate }) {
  // Directly build authentic document entries from candidate's actual uploads
  const defaultDocs = React.useMemo<CandidateDocItem[]>(() => {
    const list: CandidateDocItem[] = [];

    // 1. Mandatory Aadhaar Card
    const aadhaarDoc = candidate.aadhaarDocument || (candidate.idProofType === 'aadhaar' ? candidate.idProofDocument : '');
    const aadhaarNo = candidate.aadhaarNumber || (candidate.idProofType === 'aadhaar' ? candidate.idProofNumber : '');
    list.push({
      id: 'doc-aadhaar',
      name: 'Aadhaar Card',
      category: 'Government Identity (UIDAI)',
      required: true,
      docNumber: aadhaarNo,
      fileUrl: aadhaarDoc,
      fileName: candidate.aadhaarFileName || (aadhaarDoc ? 'Aadhaar_Document' : undefined),
      fileSize: aadhaarDoc ? 'Attached' : 'Not Uploaded',
      uploadedDate: candidate.appliedAt 
        ? new Date(candidate.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
        : 'On Registration',
      status: aadhaarDoc ? 'Verified' : 'Pending',
      type: 'aadhaar',
    });

    // 2. Mandatory PAN Card
    const panDoc = candidate.panDocument || (candidate.idProofType === 'pan' ? candidate.idProofDocument : '');
    const panNo = candidate.panNumber || (candidate.idProofType === 'pan' ? candidate.idProofNumber : '');
    list.push({
      id: 'doc-pan',
      name: 'PAN Card',
      category: 'Tax & Financial Identity (ITD)',
      required: true,
      docNumber: panNo,
      fileUrl: panDoc,
      fileName: candidate.panFileName || (panDoc ? 'PAN_Card' : undefined),
      fileSize: panDoc ? 'Attached' : 'Not Uploaded',
      uploadedDate: candidate.appliedAt 
        ? new Date(candidate.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
        : 'On Registration',
      status: panDoc ? 'Verified' : 'Pending',
      type: 'pan',
    });

    // 3. Other Uploaded Documents (Astrology Certificates, Degrees, Experience Letters)
    if (candidate.otherDocuments && Array.isArray(candidate.otherDocuments) && candidate.otherDocuments.length > 0) {
      candidate.otherDocuments.forEach((doc, idx) => {
        const fileUrl = doc.document || doc.fileUrl || '';
        const cat = doc.category || 'Astrological Credential';
        const isExp = cat.toLowerCase().includes('experience');
        list.push({
          id: doc.id || `other-doc-${idx}`,
          name: doc.title || (isExp ? `Experience Letter #${idx + 1}` : `Astrology Certificate #${idx + 1}`),
          category: cat,
          required: false,
          fileUrl: fileUrl,
          fileName: doc.fileName || doc.title || `Document_${idx + 1}`,
          fileSize: doc.fileSize || (fileUrl ? 'Attached' : 'Not Uploaded'),
          uploadedDate: doc.uploadedAt 
            ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : (candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'),
          status: fileUrl ? 'Verified' : 'Pending',
          type: isExp ? 'experience' : 'certificate',
        });
      });
    }

    // 4. Legacy fallback: if candidate has an idProofDocument not already captured
    if (candidate.idProofDocument && !aadhaarDoc && !panDoc) {
      list.push({
        id: 'doc-legacy-id',
        name: `${candidate.idProofType?.toUpperCase() || 'ID'} Proof Document`,
        category: 'Identity Proof',
        required: true,
        docNumber: candidate.idProofNumber,
        fileUrl: candidate.idProofDocument,
        fileName: 'Candidate_ID_Proof',
        fileSize: 'Attached',
        uploadedDate: candidate.appliedAt 
          ? new Date(candidate.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
          : 'On Registration',
        status: 'Verified',
        type: 'other',
      });
    }

    return list;
  }, [candidate]);

  const [docStatuses, setDocStatuses] = useState<Record<string, 'Verified' | 'Pending'>>({});
  const [previewDoc, setPreviewDoc] = useState<CandidateDocItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const getDocStatus = (doc: CandidateDocItem) => {
    return docStatuses[doc.id] || doc.status;
  };

  const toggleDocStatus = (docId: string) => {
    setDocStatuses(prev => {
      const current = prev[docId] || defaultDocs.find(d => d.id === docId)?.status || 'Pending';
      return { ...prev, [docId]: current === 'Verified' ? 'Pending' : 'Verified' };
    });
  };

  const handleDownload = (doc: CandidateDocItem) => {
    if (doc.fileUrl) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.fileName || `${candidate.name.replace(/\s+/g, '_')}_${doc.name.replace(/\s+/g, '_')}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([
        `Document: ${doc.name}\nCandidate: ${candidate.name}\nCategory: ${doc.category}\nDocument No: ${doc.docNumber || 'Not provided'}\nStatus: ${getDocStatus(doc)}\nNote: No digital file was uploaded by the candidate for this record.`
      ], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidate.name.replace(/\s+/g, '_')}_${doc.name.replace(/\s+/g, '_')}_summary.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const mandatoryDocs = defaultDocs.filter(d => d.required);
  const optionalDocs = defaultDocs.filter(d => !d.required);

  const isFilePdf = previewDoc?.fileUrl && (
    previewDoc.fileUrl.startsWith('data:application/pdf') ||
    previewDoc.fileName?.toLowerCase().endsWith('.pdf') ||
    previewDoc.fileUrl.toLowerCase().endsWith('.pdf')
  );

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Identity Documents Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">Mandatory Identity Documents</h4>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300">
              Required for Verification
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Aadhaar & PAN</span>
        </div>

        <div className="space-y-3">
          {mandatoryDocs.map(doc => {
            const hasFile = Boolean(doc.fileUrl);
            const status = getDocStatus(doc);

            return (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    {doc.type === 'aadhaar' ? <ShieldCheck size={20} /> : <CreditCard size={20} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{doc.name}</p>
                      {doc.docNumber && (
                        <span className="font-mono text-2xs px-2 py-0.5 rounded bg-muted text-foreground/80 font-medium">
                          {doc.docNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {doc.category} · {doc.fileSize} · {doc.uploadedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    !hasFile 
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                      : status === 'Verified' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {!hasFile ? 'File Missing' : status}
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

                  {hasFile && (
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition"
                      title="Download uploaded file"
                    >
                      <Download size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Astrological Credentials & Other Documents Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">Astrological Certificates & Experience Letters</h4>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              Optional Uploads
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {optionalDocs.length} {optionalDocs.length === 1 ? 'document' : 'documents'} attached
          </span>
        </div>

        {optionalDocs.length > 0 ? (
          <div className="space-y-3">
            {optionalDocs.map(doc => {
              const hasFile = Boolean(doc.fileUrl);
              const status = getDocStatus(doc);

              return (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {doc.type === 'experience' ? <Briefcase size={20} /> : <Award size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.category} · {doc.fileSize} · Uploaded {doc.uploadedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      !hasFile 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : status === 'Verified' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      {status}
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

                    {hasFile && (
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition"
                        title="Download uploaded file"
                      >
                        <Download size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 text-center bg-muted/20 border border-dashed border-border rounded-xl">
            <p className="text-xs text-muted-foreground">
              No optional astrological certificates or experience letters were uploaded by this applicant.
            </p>
          </div>
        )}
      </div>

      {/* Document Direct Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  {previewDoc.type === 'aadhaar' ? (
                    <ShieldCheck size={20} />
                  ) : previewDoc.type === 'pan' ? (
                    <CreditCard size={20} />
                  ) : previewDoc.type === 'experience' ? (
                    <Briefcase size={20} />
                  ) : (
                    <Award size={20} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{previewDoc.name}</h3>
                    <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                      getDocStatus(previewDoc) === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {getDocStatus(previewDoc)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Candidate: <span className="font-medium text-foreground">{candidate.name}</span>
                    {previewDoc.docNumber && <> · ID: <span className="font-mono text-foreground font-semibold">{previewDoc.docNumber}</span></>}
                    {' · '}{previewDoc.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {previewDoc.fileUrl && !isFilePdf && (
                  <>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Zoom In"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Zoom Out"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="px-2 py-1 text-2xs font-mono rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Reset Zoom"
                    >
                      {Math.round(zoomLevel * 100)}%
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted ml-2"
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Document Canvas Body - Directly displays what the candidate uploaded */}
            <div className="p-6 overflow-y-auto flex-1 bg-muted/15 flex items-center justify-center min-h-[380px]">
              {previewDoc.fileUrl ? (
                isFilePdf ? (
                  <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-border shadow-lg bg-background">
                    <iframe
                      src={previewDoc.fileUrl}
                      className="w-full h-full"
                      title={previewDoc.name}
                    />
                  </div>
                ) : (
                  <div className="w-full max-h-[72vh] flex items-center justify-center p-3 bg-slate-950/80 rounded-xl overflow-auto border border-border/40 shadow-inner">
                    <img
                      src={previewDoc.fileUrl}
                      alt={previewDoc.name}
                      style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease' }}
                      className="max-h-[68vh] max-w-full object-contain rounded shadow-2xl transition-transform"
                    />
                  </div>
                )
              ) : (
                <div className="p-10 text-center bg-card border-2 border-dashed border-border rounded-2xl max-w-md w-full shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle size={28} />
                  </div>
                  <h4 className="font-bold text-base text-foreground">No Document File Attached</h4>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    The candidate did not attach an image or PDF file for this document during application submission.
                  </p>
                  {previewDoc.docNumber && (
                    <div className="mt-4 p-3 bg-muted/60 rounded-xl border border-border inline-block">
                      <p className="text-2xs text-muted-foreground uppercase font-bold tracking-wider">Submitted Document Number</p>
                      <p className="font-mono font-bold text-sm text-foreground mt-0.5">{previewDoc.docNumber}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDocStatus(previewDoc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    getDocStatus(previewDoc) === 'Verified'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-200'
                      : 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-200'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  {getDocStatus(previewDoc) === 'Verified' ? 'Mark as Under Review' : 'Approve & Mark Verified'}
                </button>

                {previewDoc.fileUrl && (
                  <>
                    <button
                      onClick={() => handleDownload(previewDoc)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground flex items-center gap-1.5 transition"
                    >
                      <Download size={13} /> Download File
                    </button>

                    <button
                      onClick={() => window.open(previewDoc.fileUrl, '_blank')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground flex items-center gap-1.5 transition"
                    >
                      <ExternalLink size={13} /> Open in New Tab
                    </button>
                  </>
                )}
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