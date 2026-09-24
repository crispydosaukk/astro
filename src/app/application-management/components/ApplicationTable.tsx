'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import { Eye, UserCheck, MoreHorizontal, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Candidate } from '@/lib/firebase/candidateService';

interface ApplicationTableProps {
  candidates: Candidate[];
  onUpdateStatus: (id: string, newLifecycle: string, newAppStatus: string) => Promise<void>;
}

export default function ApplicationTable({ candidates, onUpdateStatus }: ApplicationTableProps) {
  const [page, setPage] = useState(1);
  const [actionOpen, setActionOpen] = useState<string | null>(null);
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(candidates.length / perPage));
  const paginated = candidates.slice((page - 1) * perPage, page * perPage);

  const getDocStatus = (c: Candidate) => {
    if (c.lifecycleStatus === 'verified' || c.lifecycleStatus === 'probation') return 'Verified';
    if (c.lifecycleStatus === 'human-review' || c.applicationStatus === 'Submitted') return 'Verified';
    if (c.lifecycleStatus === 'screening') return 'Pending';
    return 'Pending';
  };

  const getDocStatusIcon = (status: string) => {
    if (status === 'Verified') return <CheckCircle2 size={13} className="text-green-600" />;
    if (status === 'Pending') return <Clock size={13} className="text-amber-600" />;
    if (status === 'Rejected') return <XCircle size={13} className="text-red-600" />;
    return <AlertCircle size={13} className="text-red-600" />;
  };

  const getInterviewStatus = (c: Candidate) => {
    if (c.lifecycleStatus === 'human-review' || c.lifecycleStatus === 'probation' || c.lifecycleStatus === 'verified') return 'Completed';
    if (c.lifecycleStatus === 'interview') return 'In Progress';
    if (c.lifecycleStatus === 'screening') return 'Pending';
    return 'Pending';
  };

  const interviewStatusColor = (status: string) => {
    if (status === 'Completed') return 'text-green-700 bg-green-100';
    if (status === 'In Progress') return 'text-blue-700 bg-blue-100';
    if (status === 'Pending') return 'text-amber-700 bg-amber-100';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr>
              <th className="table-header-cell">Applicant</th>
              <th className="table-header-cell">App ID</th>
              <th className="table-header-cell">Source / Campaign</th>
              <th className="table-header-cell">Submitted</th>
              <th className="table-header-cell">Profile</th>
              <th className="table-header-cell text-center">Docs</th>
              <th className="table-header-cell text-center">Theory Score</th>
              <th className="table-header-cell text-center">Charts</th>
              <th className="table-header-cell">AI Interview</th>
              <th className="table-header-cell">AI Score</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-muted-foreground">
                  <UserCheck size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="font-semibold text-sm">No applications found</p>
                  <p className="text-xs">Candidates entering the application and onboarding funnel will appear here.</p>
                </td>
              </tr>
            ) : (
              paginated.map(cand => {
                const docStatus = getDocStatus(cand);
                const interviewStatus = getInterviewStatus(cand);
                const appId = `AP-2026-${cand.id.replace(/[^0-9]/g, '').padStart(4, '0').slice(-4) || '0101'}`;
                const profileCompletion = cand.lifecycleStatus === 'verified' ? 100 : cand.aiScore >= 80 ? 95 : 80;
                const statusLabel = cand.applicationStatus || (
                  cand.lifecycleStatus === 'human-review' ? 'Human Review' :
                  cand.lifecycleStatus === 'screening' ? 'Under Screening' :
                  cand.lifecycleStatus === 'probation' ? 'Approved' :
                  cand.lifecycleStatus === 'verified' ? 'Approved' :
                  cand.lifecycleStatus === 'rejected' ? 'Rejected' : 'Submitted'
                );

                return (
                  <tr key={cand.id} className="table-row group">
                    {/* Applicant */}
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full terracotta-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {cand.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground leading-none">{cand.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{cand.location}</p>
                        </div>
                      </div>
                    </td>

                    {/* App ID */}
                    <td className="table-cell">
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {appId}
                      </span>
                    </td>

                    {/* Campaign / Source */}
                    <td className="table-cell">
                      <div className="flex flex-col gap-1.5 min-w-[140px] max-w-[220px]">
                        {/* Source Platform Badge */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-3xs font-semibold px-2 py-0.5 rounded-full border w-fit shadow-2xs ${
                            cand.source === 'Google Places'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                              : cand.source === 'YouTube'
                              ? 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-200'
                              : cand.source === 'LinkedIn'
                              ? 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-200'
                              : cand.source === 'Instagram'
                              ? 'bg-pink-50 text-pink-800 border-pink-300 dark:bg-pink-950/60 dark:text-pink-200'
                              : cand.source === 'Direct Intake'
                              ? 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200'
                              : 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-200'
                          }`}>
                            <span className="opacity-60 text-4xs uppercase tracking-wider font-semibold">Src:</span>
                            {cand.source || 'Direct Intake'}
                          </span>
                        </div>

                        {/* Campaign Name */}
                        {(() => {
                          const camp = cand.campaignName || (cand as any).campaign || (cand as any).applicationData?.campaignName;
                          return camp ? (
                            <span 
                              className="inline-flex items-center gap-1 text-3xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 truncate"
                              title={`Campaign: ${camp}`}
                            >
                              <span className="opacity-70 text-4xs uppercase tracking-wider font-semibold">Camp:</span>
                              🎯 {camp}
                            </span>
                          ) : (
                            <span className="text-3xs text-muted-foreground/75 flex items-center gap-1 pl-0.5">
                              <span className="opacity-60 text-4xs uppercase tracking-wider font-medium">Camp:</span>
                              <span className="italic">Direct Intake / None</span>
                            </span>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Submitted */}
                    <td className="table-cell">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {cand.discoveredDate || 'Recent'}
                      </span>
                    </td>

                    {/* Profile completion */}
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold tabular-nums ${profileCompletion === 100 ? 'text-green-700' : 'text-amber-700'}`}>
                          {profileCompletion}%
                        </span>
                        <div className="progress-bar-track w-12">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${profileCompletion}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Docs */}
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getDocStatusIcon(docStatus)}
                        <span className={`text-xs font-semibold ${
                          docStatus === 'Verified' ? 'text-green-700' :
                          docStatus === 'Pending' ? 'text-amber-700' : 'text-red-700'
                        }`}>
                          {docStatus}
                        </span>
                      </div>
                    </td>

                    {/* Theory Score */}
                    <td className="table-cell text-center">
                      <AIScoreBadge score={cand.theoryScore ?? cand.applicationData?.theoryScore ?? cand.aiScore} size="sm" />
                    </td>

                    {/* Chart cases */}
                    <td className="table-cell text-center">
                      <AIScoreBadge score={cand.chartCaseScore ?? cand.applicationData?.chartCaseScore ?? cand.aiScore} size="sm" />
                    </td>

                    {/* AI Interview */}
                    <td className="table-cell">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${interviewStatusColor(interviewStatus)}`}>
                        {interviewStatus}
                      </span>
                    </td>

                    {/* AI Score */}
                    <td className="table-cell">
                      <AIScoreBadge score={cand.aiScore} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="table-cell">
                      <StatusBadge status={statusLabel} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/human-review-module?id=${cand.id}`}
                          className="btn-ghost p-1.5 text-primary hover:bg-primary/10 rounded"
                          title="Open Full 360° Review Workspace"
                        >
                          <Eye size={14} />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setActionOpen(actionOpen === cand.id ? null : cand.id)}
                            className="btn-ghost p-1.5 text-muted-foreground hover:text-foreground rounded"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {actionOpen === cand.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 card-elevated z-20 py-1 shadow-lg animate-slide-up text-left">
                              <Link 
                                href={`/human-review-module?id=${cand.id}`} 
                                className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 text-foreground font-medium"
                              >
                                <Eye size={12} />
                                Review 360° in Workspace
                              </Link>
                              <button 
                                onClick={async () => {
                                  setActionOpen(null);
                                  await onUpdateStatus(cand.id, 'probation', 'Approved');
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-green-50 flex items-center gap-2 text-green-700"
                              >
                                <CheckCircle2 size={12} />
                                Approve for Probation
                              </button>
                              <button 
                                onClick={async () => {
                                  setActionOpen(null);
                                  await onUpdateStatus(cand.id, 'rejected', 'Rejected');
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 flex items-center gap-2 text-red-700"
                              >
                                <XCircle size={12} />
                                Reject Application
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{candidates.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, candidates.length)}</span> of{' '}
          <span className="font-semibold text-foreground">{candidates.length}</span> applications
        </p>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="btn-ghost p-1.5 disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={`apppage-${i + 1}`}
              onClick={() => setPage(i + 1)}
              className={`w-7 h-7 rounded-md text-sm font-semibold transition-colors ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'btn-ghost'}`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages} 
            className="btn-ghost p-1.5 disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}