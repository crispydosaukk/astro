'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Send, 
  MoreHorizontal, 
  Trash2, 
  UserCheck, 
  GitMerge, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Database,
  RefreshCw,
  CheckCircle2,
  CloudUpload,
  Sparkles,
  FileText,
  Upload,
  Download,
  X,
  Plus,
  Check,
  Users,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { 
  Candidate, 
  initialCandidatesData, 
  subscribeToCandidates, 
  seedInitialCandidates, 
  deleteCandidateFromFirestore,
  deleteAllCandidatesFromFirestore,
  saveCandidateToFirestore,
  updateCandidateStatus,
  resolveCandidateContact
} from '@/lib/firebase/candidateService';
import CandidateProfileModal from '@/components/candidates/CandidateProfileModal';

type SortKey = 'name' | 'rating' | 'discoveredDate' | 'lifecycleStatus';

export default function CandidateTable() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isFirestoreLive, setIsFirestoreLive] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('discoveredDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Profile History Modal state (Eye icon)
  const [profileCandidate, setProfileCandidate] = useState<Candidate | null>(null);

  // AI Re-score & Dossier modal
  const [qualifyingId, setQualifyingId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<{ candidate: Candidate; evaluation: any } | null>(null);

  // CSV Import Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (firestoreCandidates) => {
          setCandidates(firestoreCandidates || []);
          setIsFirestoreLive(true);
        },
        (err) => {
          console.warn('Firestore subscription status:', err.message);
          setIsFirestoreLive(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Unable to subscribe to Firestore candidates:', e);
      setIsFirestoreLive(false);
    }
  }, []);

  const handleSeedToFirestore = async () => {
    setIsSeeding(true);
    setSyncStatus('Syncing to Firestore...');
    const result = await seedInitialCandidates();
    if (result.success) {
      setSyncStatus(`Synced ${result.count} candidates to Firestore!`);
      setIsFirestoreLive(true);
    } else {
      setSyncStatus(`Error: ${result.message}`);
    }
    setTimeout(() => setSyncStatus(null), 4000);
    setIsSeeding(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCandidateFromFirestore(id);
    } catch (e) {
      console.warn('Local delete fallback:', e);
    }
    setCandidates(prev => prev.filter(c => c.id !== id));
    setSelectedRows(prev => prev.filter(r => r !== id));
    setActionMenuOpen(null);
  };

  const handleStatusChange = async (id: string, newLifecycle: string, newOutreach?: string) => {
    try {
      await updateCandidateStatus(id, {
        lifecycleStatus: newLifecycle,
        ...(newOutreach ? { outreachStatus: newOutreach } : {})
      });
    } catch (_e) {}
    setCandidates(prev => prev.map(c => c.id === id ? {
      ...c,
      lifecycleStatus: newLifecycle,
      ...(newOutreach ? { outreachStatus: newOutreach } : {})
    } : c));
    setActionMenuOpen(null);
  };

  // Live AI Qualification with GPT-4o
  const handleAiQualify = async (candidate: Candidate) => {
    setQualifyingId(candidate.id);
    try {
      const res = await fetch('/api/ai/qualify-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: candidate.name,
          specialization: candidate.specialisations.join(', '),
          experienceYears: parseInt(candidate.experience) || 10,
          consultationCount: 500,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        const newScore = data.evaluation.qualificationScore;
        // Update candidate in state and Firestore
        const updated = {
          ...candidate,
          aiScore: newScore,
          lifecycleStatus: newScore >= 80 ? 'qualified' : candidate.lifecycleStatus,
        };
        try {
          await saveCandidateToFirestore(updated);
        } catch (_e) {}
        setCandidates(prev => prev.map(c => c.id === candidate.id ? updated : c));
        setDossier({
          candidate: updated,
          evaluation: data.evaluation,
        });
      }
    } catch (err) {
      console.error('AI Re-Score failed:', err);
    } finally {
      setQualifyingId(null);
    }
  };

  // CSV Import handler
  const handleCsvImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    const lines = csvContent.trim().split('\n');
    const newAdded: Candidate[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toLowerCase().startsWith('name,')) continue; // skip header
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const location = parts[1] || 'India';
        const spec = parts[2] ? [parts[2]] : ['Vedic Jyotish'];
        const exp = parts[3] || '8 yrs';
        const cand: Candidate = {
          id: `cand-${Date.now().toString().slice(-4)}-${i}`,
          name,
          businessName: `${name} Astrology Centre`,
          location,
          specialisations: spec,
          aiScore: Math.floor(Math.random() * 15) + 82,
          source: 'CSV Upload',
          outreachStatus: 'Not Sent',
          applicationStatus: null,
          lifecycleStatus: 'discovered',
          discoveredDate: 'Today',
          isDuplicate: false,
          experience: exp,
        };
        try {
          await saveCandidateToFirestore(cand);
        } catch (_e) {}
        newAdded.push(cand);
      }
    }

    if (newAdded.length > 0) {
      setCandidates(prev => [...newAdded, ...prev]);
      setSyncStatus(`Imported ${newAdded.length} candidates from CSV!`);
      setTimeout(() => setSyncStatus(null), 4000);
    }
    setIsCsvModalOpen(false);
    setCsvContent('');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = 'ID,Name,Business,Location,Specialisations,AIScore,Experience,Source,OutreachStatus,LifecycleStatus\n';
    const rows = candidates.map(c => 
      `"${c.id}","${c.name}","${c.businessName}","${c.location}","${c.specialisations.join(';')}","${c.aiScore}","${c.experience}","${c.source}","${c.outreachStatus}","${c.lifecycleStatus}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astroparihar_candidates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allSelected = selectedRows.length === candidates.length && candidates.length > 0;

  const toggleAll = () => {
    setSelectedRows(allSelected ? [] : candidates.map(c => c.id));
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...candidates].sort((a, b) => {
    let av: string | number = (a[sortKey] as string | number) ?? '';
    let bv: string | number = (b[sortKey] as string | number) ?? '';
    if (sortKey === 'rating') {
      av = a.rating || 0;
      bv = b.rating || 0;
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / perPage) || 1;
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col opacity-40">
      <ChevronUp size={9} className={sortKey === col && sortDir === 'asc' ? 'opacity-100 text-primary' : ''} />
      <ChevronDown size={9} className={sortKey === col && sortDir === 'desc' ? 'opacity-100 text-primary' : ''} />
    </span>
  );

  const handlePurgeAllCandidates = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL candidate profiles? This will completely empty your candidate pipeline.'
    );
    if (!confirmed) return;

    try {
      setSyncStatus('Purging all candidate profiles...');
      const res = await deleteAllCandidatesFromFirestore();
      if (res.success) {
        setCandidates([]);
        setSelectedRows([]);
        setSyncStatus(`Purged ${res.count} candidates.`);
      } else {
        alert('Failed to delete candidates.');
      }
    } catch (err: any) {
      alert('Error deleting candidates: ' + err.message);
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <div className="card-elevated overflow-hidden">
      {/* Firestore Database Connection & Quick Actions Toolbar */}
      <div className="bg-muted/30 border-b border-border px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-primary" />
          <span className="font-semibold text-foreground">Pipeline Database:</span>
          {isFirestoreLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Firestore Sync ({candidates.length} records)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Active Local Memory ({candidates.length} records)
            </span>
          )}
          {syncStatus && (
            <span className="text-2xs font-semibold text-primary animate-fade-in">
              ✓ {syncStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {candidates.length > 0 && (
            <button
              onClick={handlePurgeAllCandidates}
              className="btn-secondary text-2xs py-1 px-2.5 text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1"
              title="Delete all candidate profiles from database"
            >
              <Trash2 size={12} />
              Purge All Candidates
            </button>
          )}

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="btn-secondary text-2xs py-1 px-2.5 text-primary border-primary/30 hover:bg-primary/5 flex items-center gap-1.5"
            title="Import astrologers from CSV"
          >
            <Upload size={12} />
            Bulk CSV Import
          </button>

          <button
            onClick={handleExportCsv}
            className="btn-secondary text-2xs py-1 px-2.5 text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            title="Download CSV"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Bulk action banner */}
      {selectedRows.length > 0 && (
        <div className="bulk-action-bar flex items-center justify-between px-5 py-2.5 bg-primary/5 border-b border-primary/20 animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-primary">
              {selectedRows.length} candidate{selectedRows.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => {
                selectedRows.forEach(id => handleStatusChange(id, 'ready-for-outreach', 'Approved'));
                setSelectedRows([]);
              }}
              className="text-xs bg-primary text-primary-foreground font-semibold px-3 py-1 rounded-md hover:opacity-90 flex items-center gap-1"
            >
              <Send size={11} />
              Approve for Outreach
            </button>
            <button
              onClick={() => {
                selectedRows.forEach(id => handleStatusChange(id, 'human-review'));
                setSelectedRows([]);
              }}
              className="text-xs bg-muted text-foreground font-semibold px-3 py-1 rounded-md hover:bg-muted/80 flex items-center gap-1"
            >
              <UserCheck size={11} />
              Move to Human Review
            </button>
          </div>
          <button
            onClick={() => setSelectedRows([])}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Deselect all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header-row">
              <th className="table-header-cell w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-primary rounded"
                  aria-label="Select all candidates"
                />
              </th>
              <th className="table-header-cell cursor-pointer min-w-64" onClick={() => handleSort('name')}>
                Astrologer & Contact Details <SortIcon col="name" />
              </th>
              <th className="table-header-cell">Specialisations</th>
              <th className="table-header-cell cursor-pointer" onClick={() => handleSort('rating')}>
                Rating & Reviews <SortIcon col="rating" />
              </th>
              <th className="table-header-cell">Experience</th>
              <th className="table-header-cell">Source</th>
              <th className="table-header-cell">Outreach</th>
              <th className="table-header-cell cursor-pointer" onClick={() => handleSort('lifecycleStatus')}>
                Lifecycle Stage <SortIcon col="lifecycleStatus" />
              </th>
              <th className="table-header-cell cursor-pointer" onClick={() => handleSort('discoveredDate')}>
                Discovered <SortIcon col="discoveredDate" />
              </th>
              <th className="table-header-cell w-28 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-muted-foreground text-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Users size={32} className="opacity-30 text-muted-foreground" />
                    <p className="font-semibold text-foreground text-base">No candidates in pipeline</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Run a discovery campaign to populate genuine astrologers with contact details.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map(candidate => (
              <tr
                key={candidate.id}
                className={`table-row ${selectedRows.includes(candidate.id) ? 'selected' : ''}`}
              >
                {/* Checkbox */}
                <td className="table-cell">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(candidate.id)}
                    onChange={() => toggleRow(candidate.id)}
                    className="w-4 h-4 accent-primary rounded"
                    aria-label={`Select ${candidate.name}`}
                  />
                </td>

                {/* Candidate name + contact info */}
                <td className="table-cell">
                  {(() => {
                    const contact = resolveCandidateContact(candidate);
                    return (
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => setProfileCandidate(candidate)}
                          className="w-9 h-9 rounded-full terracotta-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 hover:scale-105 transition-transform shadow-xs cursor-pointer"
                          title="Click to view full astrologer profile (Eye)"
                        >
                          {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setProfileCandidate(candidate)}
                              className="font-semibold text-sm text-foreground truncate max-w-[175px] text-left hover:text-primary hover:underline transition-colors"
                              title="Click to view complete profile and history"
                            >
                              {candidate.name}
                            </button>
                            {candidate.isDuplicate && (
                              <span className="tooltip-label" data-tooltip="Possible duplicate detected">
                                <AlertTriangle size={12} className="text-amber-600 flex-shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{candidate.businessName}</p>
                          <p className="text-xs text-muted-foreground">{candidate.location}</p>

                          {/* Contact Details Quick Preview - Only render if genuine contact exists */}
                          {(contact.phone || contact.website || contact.email) ? (
                            <div className="flex flex-col gap-0.5 mt-1.5 pt-1 border-t border-border/40">
                              {contact.phone && (
                                <div className="flex items-center gap-1.5 text-2xs text-foreground font-medium">
                                  <Phone size={10} className="text-primary flex-shrink-0" />
                                  <span className="tabular-nums font-mono truncate">{contact.phone}</span>
                                </div>
                              )}
                              {contact.website && (
                                <div className="flex items-center gap-1.5 text-2xs text-primary/90 truncate" title={contact.website}>
                                  <Globe size={10} className="text-primary flex-shrink-0" />
                                  <a
                                    href={contact.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="truncate hover:underline"
                                  >
                                    {contact.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                                  </a>
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-1.5 text-2xs text-muted-foreground truncate" title={contact.email}>
                                  <Mail size={10} className="text-primary flex-shrink-0" />
                                  <a
                                    href={`mailto:${contact.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="truncate hover:text-primary hover:underline"
                                  >
                                    {contact.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1 text-2xs text-muted-foreground/60 italic">
                              Direct phone not publicly listed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </td>

                {/* Specialisations */}
                <td className="table-cell">
                  <div className="flex flex-wrap gap-1">
                    {candidate.specialisations.slice(0, 2).map(s => (
                      <span
                        key={`spec-${candidate.id}-${s}`}
                        className="text-2xs font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                    {candidate.specialisations.length > 2 && (
                      <span className="text-2xs text-muted-foreground">+{candidate.specialisations.length - 2}</span>
                    )}
                  </div>
                </td>

                {/* Rating & Reviews */}
                <td className="table-cell">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      ★ {candidate.rating || 4.8}
                    </span>
                    <span className="text-2xs text-muted-foreground font-medium">
                      ({candidate.userRatingsTotal || 25})
                    </span>
                  </div>
                </td>

                {/* Experience */}
                <td className="table-cell">
                  <span className="text-sm font-semibold tabular-nums text-foreground">{candidate.experience}</span>
                </td>

                {/* Source */}
                <td className="table-cell">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-medium">
                    {candidate.source}
                  </span>
                </td>

                {/* Outreach status */}
                <td className="table-cell">
                  {candidate.outreachStatus === 'Pending Approval' || candidate.outreachStatus === 'Not Sent' ? (
                    <button 
                      onClick={() => handleStatusChange(candidate.id, 'ready-for-outreach', 'Approved')}
                      className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
                    >
                      <Send size={10} />
                      Approve
                    </button>
                  ) : (
                    <span className={`text-xs font-semibold ${
                      candidate.outreachStatus === 'Sent' ? 'text-violet-700' :
                      candidate.outreachStatus === 'Approved'? 'text-emerald-700' : 'text-muted-foreground'
                    }`}>
                      {candidate.outreachStatus}
                    </span>
                  )}
                </td>

                {/* Lifecycle status */}
                <td className="table-cell">
                  <StatusBadge status={candidate.lifecycleStatus} />
                </td>

                {/* Discovered date */}
                <td className="table-cell text-xs text-muted-foreground">
                  {candidate.discoveredDate}
                </td>

                {/* Actions */}
                <td className="table-cell text-center">
                  {(() => {
                    const contact = resolveCandidateContact(candidate);
                    return (
                      <div className="flex items-center justify-center gap-1">
                        {/* Eye icon: View Astrologer Complete Profile & Contact Details */}
                        <button
                          onClick={() => setProfileCandidate(candidate)}
                          className="btn-ghost p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                          title="View Complete Profile History & Contact Details (Eye)"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleAiQualify(candidate)}
                          className="btn-ghost p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded"
                          title="View AI Qualification Dossier (GPT-4o)"
                        >
                          <Sparkles size={14} />
                        </button>
                        <Link
                          href={`/outreach/messages?name=${encodeURIComponent(candidate.name)}${contact.email ? `&email=${encodeURIComponent(contact.email)}` : ''}${contact.phone ? `&phone=${encodeURIComponent(contact.phone)}` : ''}&location=${encodeURIComponent(candidate.location)}&specialisation=${encodeURIComponent(candidate.specialisations?.[0] || 'Vedic Astrology')}`}
                          className="btn-ghost p-1.5 text-muted-foreground hover:text-foreground rounded"
                          title="Compose Outreach with AI"
                        >
                          <Send size={14} />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === candidate.id ? null : candidate.id)}
                            className="btn-ghost p-1.5 rounded"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {actionMenuOpen === candidate.id && (
                            <div className="absolute right-0 top-full mt-1 w-56 card-elevated z-30 py-1 animate-slide-up text-xs shadow-xl">
                              <button 
                                onClick={() => { setProfileCandidate(candidate); setActionMenuOpen(null); }}
                                className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground font-medium"
                              >
                                <Eye size={13} className="text-primary" />
                                View Profile & Contacts
                              </button>
                              <div className="border-t border-border my-1" />
                              <button 
                                onClick={() => handleStatusChange(candidate.id, 'screening')}
                                className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <Check size={13} className="text-blue-600" />
                                Advance to Screening
                              </button>
                              <button 
                                onClick={() => handleStatusChange(candidate.id, 'human-review')}
                                className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <UserCheck size={13} className="text-purple-600" />
                                Send to Human Review
                              </button>
                              <button 
                                onClick={() => handleStatusChange(candidate.id, 'probation')}
                                className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-foreground"
                              >
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                Approve for Probation
                              </button>
                              <div className="border-t border-border my-1" />
                              <button 
                                onClick={() => handleDelete(candidate.id)}
                                className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-700"
                              >
                                <Trash2 size={13} />
                                Remove Candidate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-4 border-t border-border flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{(page - 1) * perPage + 1}–{Math.min(page * perPage, candidates.length)}</span> of{' '}
          <span className="font-semibold text-foreground">{candidates.length}</span> candidates
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
              key={`page-${i + 1}`}
              onClick={() => setPage(i + 1)}
              className={`w-7 h-7 rounded-md text-sm font-semibold transition-colors ${
                page === i + 1
                  ? 'bg-primary text-primary-foreground'
                  : 'btn-ghost'
              }`}
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

      {/* MODAL 0: Complete Profile History & Contact Details Modal (Eye icon) */}
      <CandidateProfileModal
        candidate={profileCandidate}
        onClose={() => setProfileCandidate(null)}
        onApproveOutreach={(id) => handleStatusChange(id, 'ready-for-outreach', 'Approved')}
      />

      {/* MODAL 1: AI Dossier Modal */}
      {dossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                <h3 className="font-bold text-lg text-foreground">AI Qualification Dossier</h3>
              </div>
              <button
                onClick={() => setDossier(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between bg-muted/40 p-3.5 rounded-xl border border-border">
              <div>
                <h4 className="font-bold text-base text-foreground">{dossier.candidate.name}</h4>
                <p className="text-xs text-muted-foreground">{dossier.candidate.location} • {dossier.candidate.experience}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary block">{dossier.evaluation.qualificationScore}/100</span>
                <span className="bg-emerald-100 text-emerald-800 text-2xs font-bold px-2 py-0.5 rounded-full">
                  {dossier.evaluation.recommendation}
                </span>
              </div>
            </div>

            <p className="text-xs text-foreground italic bg-primary/5 p-3 rounded-lg border border-primary/15 leading-relaxed">
              "{dossier.evaluation.summary}"
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <strong className="text-emerald-700 font-semibold block mb-1">Key Strengths:</strong>
                <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                  {dossier.evaluation.strengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {dossier.evaluation.concerns?.length > 0 && (
                <div>
                  <strong className="text-amber-700 font-semibold block mb-1">Verification Points:</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                    {dossier.evaluation.concerns.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {dossier.evaluation.suggestedFocusAreas?.length > 0 && (
                <div>
                  <strong className="text-primary font-semibold block mb-1">Suggested Assessment Focus:</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                    {dossier.evaluation.suggestedFocusAreas.map((f: string, idx: number) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setDossier(null)}
                className="btn-primary text-xs py-2 px-4 rounded-lg"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CSV Bulk Import */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Upload size={20} className="text-primary" />
                <h3 className="font-bold text-lg text-foreground">Bulk CSV Import Candidates</h3>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Paste CSV text formatted as: <code>Name, Location, Specialization, Experience</code>
            </p>

            <form onSubmit={handleCsvImportSubmit} className="space-y-3">
              <textarea
                rows={6}
                value={csvContent}
                onChange={e => setCsvContent(e.target.value)}
                placeholder="Acharya Rameshwar, Varanasi, Vedic Jyotish, 16 yrs&#10;Pandit Ananth, Bengaluru, KP System, 11 yrs&#10;Dr. Gayatri Devi, New Delhi, Prashna & Vastu, 19 yrs"
                className="w-full p-3 font-mono text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="btn-ghost text-xs py-2 px-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-4 rounded-lg flex items-center gap-1.5"
                >
                  <Upload size={13} />
                  Import Candidates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}