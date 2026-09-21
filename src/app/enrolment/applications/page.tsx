'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { FileText, Search, Eye, CheckCircle2, Clock, XCircle, Send, MoreHorizontal, ShieldAlert } from 'lucide-react';
import { 
  Candidate, 
  initialCandidatesData, 
  subscribeToCandidates, 
  updateCandidateStatus 
} from '@/lib/firebase/candidateService';
import { logAuditEvent } from '@/lib/auditLogService';
import Link from 'next/link';

export default function EnrolmentApplicationsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (allCandidates) => {
          const pool = allCandidates || [];
          // Filter candidates with application data or in screening/review/applied stages
          const appCandidates = pool.filter(c => 
            Boolean(c.appliedAt) ||
            Boolean(c.theoryAnswers) ||
            Boolean(c.conversationHistory && c.conversationHistory.length > 0) ||
            Boolean(c.applicationData) ||
            c.applicationStatus !== null || 
            c.lifecycleStatus === 'screening' || 
            c.lifecycleStatus === 'applied' || 
            c.lifecycleStatus === 'human-review' ||
            c.lifecycleStatus === 'rejected'
          );

          // Sort newest applications first
          const sorted = [...appCandidates].sort((a, b) => {
            const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
            const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
            return timeB - timeA;
          });

          setCandidates(sorted);
        },
        (err) => {
          console.warn('Enrolment applications fallback:', err);
          setCandidates([]);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Subscription error:', e);
    }
  }, []);

  // Listen for real-time candidate updates broadcast from Review Workspace or other tabs
  useEffect(() => {
    const handleStatusUpdate = (e: any) => {
      const detail = e?.detail;
      if (detail && detail.id) {
        setCandidates(prev => prev.map(c => c.id === detail.id ? { ...c, ...detail.updates } : c));
      }
    };
    window.addEventListener('candidate_status_updated', handleStatusUpdate);
    return () => window.removeEventListener('candidate_status_updated', handleStatusUpdate);
  }, []);

  const handleUpdateStatus = async (id: string, newLifecycle: string, newAppStatus: string) => {
    setIsUpdating(true);
    const targetCandidate = candidates.find(c => c.id === id);
    try {
      await updateCandidateStatus(id, {
        lifecycleStatus: newLifecycle,
        applicationStatus: newAppStatus,
      });

      setCandidates(prev => prev.map(c => c.id === id ? {
        ...c,
        lifecycleStatus: newLifecycle,
        applicationStatus: newAppStatus,
      } : c));

      // Record to audit logs
      logAuditEvent({
        user: 'Admin Reviewer',
        action: 'STATUS_UPDATED',
        entity: `Candidate: ${targetCandidate?.name || id}`,
        entityId: id,
        category: 'application',
        details: `Application status transitioned to "${newAppStatus}" (${newLifecycle}).`,
      });

      setToastMessage(`Updated status to "${newAppStatus}"!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.warn('Update error:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || 
                        c.name?.toLowerCase().includes(q) || 
                        c.location?.toLowerCase().includes(q) ||
                        c.phone?.toLowerCase().includes(q) ||
                        c.email?.toLowerCase().includes(q);

    const appStatusLower = (c.applicationStatus || '').toLowerCase();
    const lifecycleLower = (c.lifecycleStatus || '').toLowerCase();

    let matchStatus = true;
    if (statusFilter === 'all') {
      matchStatus = true;
    } else if (statusFilter === 'Rejected') {
      matchStatus = lifecycleLower === 'rejected' || appStatusLower.includes('reject');
    } else if (statusFilter === 'Disqualified') {
      matchStatus = Boolean(c.isDisqualified) || appStatusLower.includes('disqualif');
    } else if (statusFilter === 'Approved') {
      matchStatus = lifecycleLower === 'verified' || lifecycleLower === 'approved' || appStatusLower.includes('approv');
    } else if (statusFilter === 'human-review') {
      matchStatus = lifecycleLower === 'human-review' || appStatusLower.includes('review');
    } else if (statusFilter === 'Under Screening') {
      matchStatus = lifecycleLower === 'screening' || appStatusLower.includes('screen');
    } else {
      matchStatus = (c.applicationStatus || c.lifecycleStatus) === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText size={28} className="text-primary" /> Astrologer Enrolment Applications
            </h1>
            <p className="text-muted-foreground mt-1">Review onboarding intake submissions, theory credentials, and screening stages</p>
          </div>
          {toastMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 size={12} /> {toastMessage}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Total Applications</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{candidates.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Under Screening</p>
            <p className="text-2xl font-bold mt-1 text-purple-600">
              {candidates.filter(c => c.lifecycleStatus === 'screening' || c.applicationStatus === 'Under Screening').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Human Review Pending</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">
              {candidates.filter(c => c.lifecycleStatus === 'human-review' || (c.applicationStatus && c.applicationStatus.includes('Review'))).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Approved / Verified</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">
              {candidates.filter(c => c.lifecycleStatus === 'verified' || c.lifecycleStatus === 'approved' || (c.applicationStatus && c.applicationStatus.toLowerCase().includes('approv'))).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              placeholder="Search applications..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="human-review">Human Review</option>
            <option value="Under Screening">Under Screening</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Disqualified">Disqualified</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specialisation</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Application Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                      No candidate applications match current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(c => {
                    const appStatusLower = (c.applicationStatus || '').toLowerCase();
                    const lifecycleLower = (c.lifecycleStatus || '').toLowerCase();

                    const isRejected = lifecycleLower === 'rejected' || appStatusLower.includes('reject');
                    const isDisqualified = Boolean(c.isDisqualified) || appStatusLower.includes('disqualif') || (c.tabViolations !== undefined && c.tabViolations >= 3);
                    const isApproved = lifecycleLower === 'verified' || lifecycleLower === 'approved' || appStatusLower.includes('approv');
                    const isInReview = lifecycleLower === 'human-review' || appStatusLower.includes('review') || appStatusLower.includes('under committee');

                    // Dynamic badge styling
                    const badgeClass = isRejected
                      ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                      : isDisqualified
                      ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
                      : isApproved
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : isInReview
                      ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';

                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.businessName || c.location} · {c.experience}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground">
                          {c.specialisations.join(', ')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                            {c.aiScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${badgeClass}`}>
                            {isDisqualified && <ShieldAlert size={11} />}
                            {c.applicationStatus || c.lifecycleStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href="/enrolment/assessments"
                              className="px-2.5 py-1 text-xs bg-muted hover:bg-muted/80 rounded font-semibold text-foreground transition-colors"
                            >
                              Assessment
                            </Link>

                            {/* Show contextual action badge/button */}
                            {isRejected ? (
                              <span className="px-2.5 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold whitespace-nowrap">
                                Rejected
                              </span>
                            ) : isDisqualified ? (
                              <span className="px-2.5 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded font-semibold whitespace-nowrap">
                                Disqualified
                              </span>
                            ) : isApproved ? (
                              <span className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold whitespace-nowrap">
                                Approved ✓
                              </span>
                            ) : isInReview ? (
                              <span className="px-2.5 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded font-semibold whitespace-nowrap">
                                In Review
                              </span>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(c.id, 'human-review', 'Under Committee Review')}
                                disabled={isUpdating}
                                className="px-2.5 py-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded font-semibold transition-colors whitespace-nowrap"
                              >
                                Send to Review
                              </button>
                            )}

                            <Link
                              href={`/human-review-module?id=${c.id}`}
                              className="px-2.5 py-1 text-xs bg-primary text-primary-foreground hover:opacity-90 rounded font-semibold transition-opacity whitespace-nowrap"
                            >
                              Review 360°
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
