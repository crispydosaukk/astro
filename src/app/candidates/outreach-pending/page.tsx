'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Send, CheckCircle2, XCircle, Clock, Eye, Search, Sparkles } from 'lucide-react';
import { 
  Candidate, 
  initialCandidatesData, 
  subscribeToCandidates, 
  updateCandidateStatus,
  resolveCandidateContact
} from '@/lib/firebase/candidateService';
import CandidateProfileModal from '@/components/candidates/CandidateProfileModal';
import Link from 'next/link';

export default function OutreachPendingPage() {
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
          // Candidates pending outreach approval or ready for outreach
          const pending = pool.filter(c => 
            c.lifecycleStatus === 'ready-for-outreach' || 
            c.outreachStatus === 'Pending Approval' || 
            c.outreachStatus === 'Not Sent'
          );
          setCandidates(pending);
        },
        (err) => {
          console.warn('Outreach pending subscription error:', err);
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
        lifecycleStatus: 'outreach-approved',
      });
      setCandidates(prev => prev.filter(c => c.id !== id));
      setToastMessage('Approved candidate for immediate outreach!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      console.warn('Error approving candidate:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkApprove = async () => {
    const targets = selected.length > 0 ? selected : candidates.map(c => c.id);
    if (targets.length === 0) return;

    setIsUpdating(true);
    try {
      for (const id of targets) {
        await updateCandidateStatus(id, {
          outreachStatus: 'Approved',
          lifecycleStatus: 'outreach-approved',
        });
      }
      setCandidates(prev => prev.filter(c => !targets.includes(c.id)));
      setToastMessage(`Approved ${targets.length} candidates!`);
      setSelected([]);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.warn('Bulk approve error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    (c.specialisations && c.specialisations.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Send size={28} className="text-primary" /> Outreach Pending Queue
            </h1>
            <p className="text-muted-foreground mt-1">
              Candidates awaiting administrator approval before invitation dispatch
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
              disabled={isUpdating || candidates.length === 0}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} /> Approve All for Outreach ({candidates.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search pending candidates..."
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
                      onChange={() => {
                        if (selected.length === filtered.length) setSelected([]);
                        else setSelected(filtered.map(c => c.id));
                      }}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specialisation</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      ✓ No candidates currently pending outreach approval.
                    </td>
                  </tr>
                ) : (
                  filtered.map(c => {
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
                                    className="text-primary hover:underline truncate max-w-[140px]"
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
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            ★ {c.rating || 4.8}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                            <Clock size={11} /> Awaiting Approval
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {(() => {
                            const contact = resolveCandidateContact(c);
                            return (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setViewCandidate(c)}
                                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  title="View Candidate Profile & Contact Details (Eye)"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => handleApprove(c.id)}
                                  disabled={isUpdating}
                                  className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <CheckCircle2 size={12} /> Approve
                                </button>
                                <Link
                                  href={`/outreach/messages?name=${encodeURIComponent(c.name)}&email=${encodeURIComponent(contact.email || '')}&phone=${encodeURIComponent(contact.phone || '')}&location=${encodeURIComponent(c.location)}&specialisation=${encodeURIComponent(c.specialisations?.[0] || 'Vedic Astrology')}`}
                                  className="px-3 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-xs font-semibold flex items-center gap-1 transition-opacity"
                                >
                                  <Send size={12} /> Compose
                                </Link>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Profile & History Modal */}
        <CandidateProfileModal
          candidate={viewCandidate}
          onClose={() => setViewCandidate(null)}
          onApproveOutreach={(id) => handleApprove(id)}
        />
      </div>
    </AppLayout>
  );
}
