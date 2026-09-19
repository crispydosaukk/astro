'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Star, Search, Eye, Send, CheckCircle2, RefreshCw, Sparkles, X } from 'lucide-react';
import { 
  Candidate, 
  initialCandidatesData, 
  subscribeToCandidates, 
  updateCandidateStatus,
  resolveCandidateContact
} from '@/lib/firebase/candidateService';
import CandidateProfileModal from '@/components/candidates/CandidateProfileModal';
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
          const pool = allCandidates || [];
          // Filter for AI qualified candidates (aiScore >= 80 or lifecycleStatus is qualified)
          const qualifiedPool = pool.filter(c => c.aiScore >= 80 || c.lifecycleStatus === 'qualified');
          setCandidates(qualifiedPool);
        },
        (err) => {
          console.warn('Qualified candidates subscription fallback:', err);
          setCandidates([]);
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
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rating</th>
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
                        {(() => {
                          const contact = resolveCandidateContact(c);
                          return (
                            <div>
                              <button
                                onClick={() => setViewCandidate(c)}
                                className="font-semibold text-foreground text-left hover:text-primary hover:underline transition-colors block"
                                title="Click to view complete profile and contact details"
                              >
                                {c.name}
                              </button>
                              <p className="text-xs text-muted-foreground">{c.businessName || c.location} · {c.experience}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-2xs text-muted-foreground">
                                {contact.phone && <span className="font-mono text-foreground">{contact.phone}</span>}
                                {contact.phone && (contact.website || contact.email) && <span>•</span>}
                                {contact.website && (
                                  <a
                                    href={contact.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate max-w-[150px]"
                                  >
                                    {contact.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                                  </a>
                                )}
                                {contact.email && (
                                  <>
                                    {contact.website && <span>•</span>}
                                    <a
                                      href={`mailto:${contact.email}`}
                                      className="text-muted-foreground hover:text-primary hover:underline truncate max-w-[180px]"
                                    >
                                      {contact.email}
                                    </a>
                                  </>
                                )}
                                {!contact.phone && !contact.website && !contact.email && (
                                  <span className="text-muted-foreground/60 italic">Contact not publicly listed</span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
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
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs">
                          <span className="text-amber-600 dark:text-amber-400 font-black">★</span>
                          <span>{c.rating ? Number(c.rating).toFixed(c.rating % 1 === 0 ? 0 : 1) : '4.8'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
                          isSent ? 'bg-blue-100 text-blue-950 dark:bg-blue-900/70 dark:text-blue-100 border border-blue-300 dark:border-blue-600' :
                          isApproved ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/70 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-600' : 
                          'bg-amber-100 text-amber-950 dark:bg-amber-900/70 dark:text-amber-100 border border-amber-300 dark:border-amber-600'
                        }`}>
                          {c.outreachStatus || 'Pending Approval'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.source}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => setViewCandidate(c)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" 
                            title="View Candidate Dossier"
                          >
                            <Eye size={14} />
                          </button>
                          <Link
                            href={`/human-review-module?id=${c.id}`}
                            className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                            title="Open 360° Candidate Review Workspace"
                          >
                            <Sparkles size={14} />
                          </Link>
                          {!isApproved && !isSent && (
                            <button 
                              onClick={() => handleApprove(c.id)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap" 
                              title="Approve for Outreach"
                            >
                              <Send size={11} /> Approve
                            </button>
                          )}
                          {isApproved && (
                            <Link
                              href={`/outreach/messages`}
                              className="px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
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

        {/* View Modal - Complete Profile & History */}
        <CandidateProfileModal
          candidate={viewCandidate}
          onClose={() => setViewCandidate(null)}
          onApproveOutreach={(id) => handleApprove(id)}
        />
      </div>
    </AppLayout>
  );
}
