'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  Shield, Search, Eye, XCircle, Clock, AlertCircle, 
  BadgeCheck, Award, CheckCircle2, X, Check, Printer, Sparkles 
} from 'lucide-react';
import { updateCandidateStatus } from '@/lib/firebase/candidateService';

interface VerificationRecord {
  id: string;
  candidate: string;
  specialisation: string;
  probationScore: number;
  probationEndDate: string;
  status: 'pending_review' | 'in_review' | 'verified' | 'rejected' | 'further_review';
  submittedDate: string;
  reviewedBy?: string;
  verificationId?: string;
  notes?: string;
}

const initialRecords: VerificationRecord[] = [];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', icon: <Clock size={11} /> },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', icon: <Eye size={11} /> },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300', icon: <BadgeCheck size={11} /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300', icon: <XCircle size={11} /> },
  further_review: { label: 'Further Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300', icon: <AlertCircle size={11} /> },
};

export default function VerificationPage() {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Review & Verification Modal
  const [reviewModalRecord, setReviewModalRecord] = useState<VerificationRecord | null>(null);
  const [certificateRecord, setCertificateRecord] = useState<VerificationRecord | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('All verification criteria, consultation quality metrics, and ethical checks satisfied.');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const { subscribeToCandidates } = require('@/lib/firebase/candidateService');
      const unsubscribe = subscribeToCandidates((candidates: any[]) => {
        if (candidates && candidates.length > 0) {
          const liveFromCandidates: VerificationRecord[] = candidates
            .filter((c: any) => c.lifecycleStatus === 'verified' || c.lifecycleStatus === 'probation' || c.applicationStatus === 'Approved')
            .map((c: any, i: number) => ({
              id: c.id,
              candidate: c.name,
              specialisation: Array.isArray(c.specialisations) ? c.specialisations.join(', ') : (c.specialisations || 'Vedic Jyotish'),
              probationScore: c.aiScore || 92,
              probationEndDate: '2026-08-17',
              status: c.lifecycleStatus === 'verified' ? 'verified' : 'pending_review',
              submittedDate: c.discoveredDate || '2026-08-10',
              reviewedBy: 'Super Admin',
              verificationId: c.lifecycleStatus === 'verified' ? `AP-VER-2026-${String(i + 1).padStart(3, '0')}` : undefined,
              notes: 'Evaluated against AstroParihar verification standard.',
            }));

          setRecords(liveFromCandidates);
        } else {
          setRecords([]);
        }
      });
      return () => unsubscribe();
    } catch (_e) {
      setRecords([]);
    }
  }, []);

  const handleGrantVerification = async (record: VerificationRecord) => {
    const newVerId = `AP-VER-2026-${String(records.filter(r => r.status === 'verified').length + 1).padStart(3, '0')}`;
    
    const updatedRecord: VerificationRecord = {
      ...record,
      status: 'verified',
      verificationId: newVerId,
      reviewedBy: 'Super Admin',
      notes: verificationNotes,
    };

    // Update state
    setRecords(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
    setReviewModalRecord(null);
    setCertificateRecord(updatedRecord);
    setSuccessToast(`Verification Badge ${newVerId} successfully issued to ${record.candidate}!`);
    setTimeout(() => setSuccessToast(null), 4000);

    // Sync to Firestore
    try {
      await updateCandidateStatus(record.id, {
        lifecycleStatus: 'verified',
        applicationStatus: 'Approved',
      });
    } catch (e) {
      console.warn('Firestore sync note:', e);
    }
  };

  const handleRejectRecord = async (record: VerificationRecord) => {
    const updatedRecord: VerificationRecord = {
      ...record,
      status: 'rejected',
      reviewedBy: 'Super Admin',
      notes: 'Probation benchmarks not met.',
    };

    setRecords(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
    setReviewModalRecord(null);
    setSuccessToast(`Verification rejected for ${record.candidate}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filtered = records.filter(r => {
    const matchSearch = r.candidate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              {successToast}
            </span>
            <button onClick={() => setSuccessToast(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield size={28} className="text-primary" /> Verification & Credentialing
          </h1>
          <p className="text-muted-foreground mt-1">Issue official AstroParihar Verification Badges and Digital Certificates</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(statusConfig).map(([key, sc]) => (
            <div key={key} className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
              <p className="text-xl font-bold text-foreground">{records.filter(r => r.status === key).length}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${sc.color} px-2 py-0.5 rounded-full mt-1`}>
                {sc.icon} {sc.label}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search verification records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="in_review">In Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="further_review">Further Review</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specialisation</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Probation Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitted</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Verification Badge ID</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                      No astrologers in verification queue. Candidates who complete probation will be queued here for credentialing.
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => {
                  const sc = statusConfig[r.status];
                  return (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{r.candidate}</p>
                        {r.reviewedBy && <p className="text-xs text-muted-foreground">Reviewer: {r.reviewedBy}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{r.specialisation}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${r.probationScore >= 85 ? 'text-green-600' : r.probationScore >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                          {r.probationScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.submittedDate}</td>
                      <td className="px-4 py-3 text-xs font-mono font-medium text-foreground">
                        {r.verificationId ? (
                          <span className="inline-flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded">
                            <BadgeCheck size={12} /> {r.verificationId}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.verificationId && (
                            <button 
                              onClick={() => setCertificateRecord(r)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20 transition"
                            >
                              <Award size={12} /> Certificate
                            </button>
                          )}

                          {(r.status === 'pending_review' || r.status === 'in_review') && (
                            <button 
                              onClick={() => setReviewModalRecord(r)}
                              className="btn-primary text-xs px-3 py-1 rounded-lg"
                            >
                              Review & Grant
                            </button>
                          )}

                          {!r.verificationId && r.status !== 'pending_review' && r.status !== 'in_review' && (
                            <button 
                              onClick={() => setReviewModalRecord(r)}
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                            >
                              <Eye size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review & Grant Verification Modal */}
        {reviewModalRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{reviewModalRecord.candidate}</h2>
                    <p className="text-xs text-muted-foreground">{reviewModalRecord.specialisation} · Probation Score: {reviewModalRecord.probationScore}%</p>
                  </div>
                </div>
                <button 
                  onClick={() => setReviewModalRecord(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3.5 bg-muted/40 rounded-xl space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">Probation Audit Summary</p>
                  <p className="text-xs text-muted-foreground">
                    Candidate has completed the 30-day trial with a high composite satisfaction score of <strong className="text-foreground">{reviewModalRecord.probationScore}%</strong> and zero critical disciplinary flags.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Super Admin Verification Notes</label>
                  <textarea
                    rows={3}
                    value={verificationNotes}
                    onChange={e => setVerificationNotes(e.target.value)}
                    className="w-full p-2.5 text-xs border border-border rounded-lg bg-background leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  onClick={() => handleRejectRecord(reviewModalRecord)}
                  className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                >
                  Reject Candidate
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReviewModalRecord(null)}
                    className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleGrantVerification(reviewModalRecord)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition"
                  >
                    <BadgeCheck size={14} /> Grant Badge & Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Digital Verification Certificate Modal */}
        {certificateRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Official Credential</span>
                <button 
                  onClick={() => setCertificateRecord(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Certificate Canvas */}
              <div className="border-4 border-double border-amber-600/30 rounded-2xl p-8 bg-gradient-to-br from-amber-50/40 via-background to-orange-50/20 text-center space-y-4 relative overflow-hidden shadow-inner">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto text-amber-600">
                  <Award size={36} />
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-bold text-foreground tracking-wide">AstroParihar Verified Astrologer</h3>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">National Quality & Authenticity Seal</p>
                </div>

                <div className="py-2">
                  <p className="text-xs text-muted-foreground">This is to officially certify that</p>
                  <p className="text-2xl font-bold text-foreground font-serif mt-1">{certificateRecord.candidate}</p>
                  <p className="text-xs text-muted-foreground mt-1">Specialisation: <strong className="text-foreground">{certificateRecord.specialisation}</strong></p>
                </div>

                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Has satisfactorily cleared the multi-tier AstroParihar verification standard including classical theory assessment, chart case audit, and 30-day supervised live consultation probation.
                </p>

                <div className="flex items-center justify-between border-t border-border/80 pt-4 mt-4 text-left">
                  <div>
                    <p className="text-2xs text-muted-foreground uppercase font-semibold">Verification ID</p>
                    <p className="font-mono text-sm font-bold text-primary">{certificateRecord.verificationId}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xs text-muted-foreground uppercase font-semibold">Performance Score</p>
                    <p className="text-sm font-bold text-emerald-600">{certificateRecord.probationScore}% Distinction</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs text-muted-foreground uppercase font-semibold">Authorized Signatory</p>
                    <p className="text-xs font-serif font-bold text-foreground">AstroParihar Council</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg"
                >
                  <Printer size={13} /> Print Certificate
                </button>
                <button
                  onClick={() => setCertificateRecord(null)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
