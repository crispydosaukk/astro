'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Star, Search, Eye, Send, CheckCircle2, RefreshCw, Sparkles, X } from 'lucide-react';
import { 
  Candidate, 
  initialCandidatesData, 
  subscribeToCandidates, 
  updateCandidateStatus 
} from '@/lib/firebase/candidateService';
import Link from 'next/link';

export default function QualifiedCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (allCandidates) => {
          const pool = allCandidates && allCandidates.length > 0 ? allCandidates : initialCandidatesData;
          // Filter for AI qualified candidates (aiScore >= 80 or lifecycleStatus is qualified)
          const qualifiedPool = pool.filter(c => c.aiScore >= 80 || c.lifecycleStatus === 'qualified');
          setCandidates(qualifiedPool);
        },
        (err) => {
          console.warn('Qualified candidates subscription fallback:', err);
          const qualifiedPool = initialCandidatesData.filter(c => c.aiScore >= 80 || c.lifecycleStatus === 'qualified');
          setCandidates(qualifiedPool);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Subscription error:', e);
    }
  }, []);

  const handleApprove = async (id: string) => {
    setIsUpdating(true);
    try {
      await updateCandidateStatus(id, {
        outreachStatus: 'Approved',
        lifecycleStatus: 'ready-for-outreach',
      });
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, outreachStatus: 'Approved', lifecycleStatus: 'ready-for-outreach' } : c));
      setToastMessage('Candidate approved for outreach!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.warn('Approval error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkApprove = async () => {
    const targets = selected.length > 0 ? selected : candidates.filter(c => c.outreachStatus !== 'Approved').map(c => c.id);
    if (targets.length === 0) {
      alert('All qualified candidates are already approved.');
      return;
    }

    setIsUpdating(true);
    try {
      for (const id of targets) {
        await updateCandidateStatus(id, {
          outreachStatus: 'Approved',
          lifecycleStatus: 'ready-for-outreach',
        });
      }
      setCandidates(prev => prev.map(c => targets.includes(c.id) ? { ...c, outreachStatus: 'Approved', lifecycleStatus: 'ready-for-outreach' } : c));
      setToastMessage(`Approved ${targets.length} candidates for outreach!`);
      setSelected([]);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.warn('Bulk approval error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map(c => c.id));
    }
  };

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    (c.specialisations && c.specialisations.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  const pendingApprovalCount = candidates.filter(c => c.outreachStatus !== 'Approved' && c.outreachStatus !== 'Sent').length;
  const avgScore = candidates.length > 0 ? Math.round(candidates.reduce((a, c) => a + c.aiScore, 0) / candidates.length) : 88;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Star size={28} className="text-primary" /> Qualified Candidates
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-qualified candidates (Score ≥ 80) ready for outreach approval review
            </p>
          </div>
          <div className="flex items-center gap-2">
            {toastMessage && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 size={12} /> {toastMessage}
              </span>
            )}
            <button 
              onClick={handleBulkApprove}
              disabled={isUpdating}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              Approve All Pending
            </button>
            <button 
              onClick={handleBulkApprove}
              disabled={isUpdating || selected.length === 0}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} /> Approve Selected ({selected.length})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Total Qualified Candidates</p>
            <p className="text-3xl font-bold mt-1 text-foreground">{candidates.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Scored ≥ 80 by GPT-4o</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Pending Outreach Approval</p>
            <p className="text-3xl font-bold mt-1 text-amber-600">{pendingApprovalCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Awaiting admin review</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Average AI Qualification Score</p>
            <p className="text-3xl font-bold mt-1 text-primary">{avgScore} / 100</p>
            <p className="text-xs text-muted-foreground mt-0.5">High quality pool</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search by name, city, specialisation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selected.length > 0 && selected.length === filtered.length}
                      onChange={toggleSelectAll}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specialisation</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outreach Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Discovery Source</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => {
                  const isApproved = c.outreachStatus === 'Approved';
                  const isSent = c.outreachStatus === 'Sent';
                  const isSelected = selected.includes(c.id);

                  return (
                    <tr key={c.id} className={`hover:bg-muted/20 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.businessName || c.location} · {c.experience}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(c.specialisations) ? c.specialisations : [c.specialisations]).map((s, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          c.aiScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Sparkles size={11} /> {c.aiScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isSent ? 'bg-blue-100 text-blue-700' :
                          isApproved ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {c.outreachStatus || 'Pending Approval'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.source}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => setViewCandidate(c)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                            title="View Candidate Dossier"
                          >
                            <Eye size={14} />
                          </button>
                          {!isApproved && !isSent && (
                            <button 
                              onClick={() => handleApprove(c.id)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors" 
                              title="Approve for Outreach"
                            >
                              <Send size={11} /> Approve
                            </button>
                          )}
                          {isApproved && (
                            <Link
                              href={`/outreach/messages`}
                              className="px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Dispatch Email with GPT-4o"
                            >
                              <Send size={11} /> Send Invite
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Modal */}
        {viewCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{viewCandidate.name}</h3>
                  <p className="text-xs text-muted-foreground">{viewCandidate.businessName} · {viewCandidate.location}</p>
                </div>
                <button 
                  onClick={() => setViewCandidate(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 p-3 rounded-xl">
                    <p className="text-2xs font-semibold text-muted-foreground uppercase">AI Qualification Score</p>
                    <p className="text-xl font-bold text-primary mt-0.5">{viewCandidate.aiScore} / 100</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-xl">
                    <p className="text-2xs font-semibold text-muted-foreground uppercase">Experience</p>
                    <p className="text-xl font-bold text-foreground mt-0.5">{viewCandidate.experience}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Specialisations:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewCandidate.specialisations.map((s, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Lifecycle Stage:</p>
                  <p className="text-xs font-mono font-medium text-foreground bg-muted p-2 rounded-lg">{viewCandidate.lifecycleStatus}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => setViewCandidate(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Close
                </button>
                {viewCandidate.outreachStatus !== 'Approved' && (
                  <button
                    onClick={() => {
                      handleApprove(viewCandidate.id);
                      setViewCandidate(null);
                    }}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Send size={12} /> Approve Outreach
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
