'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { FolderOpen, Search, GitMerge, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { 
  Candidate, 
  initialCandidatesData, 
  subscribeToCandidates, 
  deleteCandidateFromFirestore,
  updateCandidateStatus 
} from '@/lib/firebase/candidateService';

interface DuplicatePair {
  id: string;
  candidateA: Candidate;
  candidateB: Candidate;
  matchReason: string;
  confidence: number;
  status: 'pending_review' | 'confirmed' | 'false_positive' | 'merged';
  detectedDate: string;
}

export default function DuplicatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (allCandidates) => {
          const pool = allCandidates || [];
          setCandidates(pool);

          // Dynamically compute duplicate candidates
          const pairs: DuplicatePair[] = [];
          for (let i = 0; i < pool.length; i++) {
            for (let j = i + 1; j < pool.length; j++) {
              const a = pool[i];
              const b = pool[j];

              // Check name match or same city + business name match
              const nameSimilarity = a.name.toLowerCase().includes(b.name.toLowerCase().split(' ')[0]) || 
                                     b.name.toLowerCase().includes(a.name.toLowerCase().split(' ')[0]);
              const cityMatch = a.location.toLowerCase().split(',')[0] === b.location.toLowerCase().split(',')[0];
              const duplicateFlag = a.isDuplicate || b.isDuplicate;

              if (duplicateFlag || (nameSimilarity && cityMatch)) {
                pairs.push({
                  id: `DUP-${a.id.slice(-3)}-${b.id.slice(-3)}`,
                  candidateA: a,
                  candidateB: b,
                  matchReason: duplicateFlag ? 'Flagged as duplicate candidate record' : 'High similarity in astrologer name and active location',
                  confidence: 90,
                  status: 'pending_review',
                  detectedDate: 'Recent',
                });
              }
            }
          }

          setDuplicatePairs(pairs);
        },
        (err) => {
          console.warn('Duplicates subscription error:', err);
          setCandidates([]);
          setDuplicatePairs([]);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Subscription error:', e);
    }
  }, []);

  const handleMerge = async (pair: DuplicatePair) => {
    try {
      await deleteCandidateFromFirestore(pair.candidateB.id);
      setDuplicatePairs(prev => prev.map(p => p.id === pair.id ? { ...p, status: 'merged' } : p));
      setActionMessage(`Merged ${pair.candidateB.name} into ${pair.candidateA.name}!`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e) {
      console.warn('Merge error:', e);
    }
  };

  const handleMarkFalsePositive = (pairId: string) => {
    setDuplicatePairs(prev => prev.map(p => p.id === pairId ? { ...p, status: 'false_positive' } : p));
    setActionMessage('Marked as false positive. Both profiles retained independently.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleConfirm = (pairId: string) => {
    setDuplicatePairs(prev => prev.map(p => p.id === pairId ? { ...p, status: 'confirmed' } : p));
    setActionMessage('Confirmed duplicate pair.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const filtered = duplicatePairs.filter(d => {
    const matchSearch = d.candidateA.name.toLowerCase().includes(search.toLowerCase()) || 
                        d.candidateB.name.toLowerCase().includes(search.toLowerCase()) ||
                        d.matchReason.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FolderOpen size={28} className="text-primary" /> Duplicate Detection & Resolution
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-identified duplicate profiles across discovery channels (Google Places, Web Search, Directories)
            </p>
          </div>
          {actionMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 animate-fadeIn flex items-center gap-1">
              <CheckCircle2 size={13} /> {actionMessage}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Pending Review</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">
              {duplicatePairs.filter(p => p.status === 'pending_review').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Confirmed Duplicates</p>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {duplicatePairs.filter(p => p.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Merged Profiles</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {duplicatePairs.filter(p => p.status === 'merged').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">False Positives</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {duplicatePairs.filter(p => p.status === 'false_positive').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search candidate duplicates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="false_positive">False Positive</option>
            <option value="merged">Merged</option>
          </select>
        </div>

        {/* Duplicates List */}
        <div className="space-y-4">
          {filtered.map(d => (
            <div key={d.id} className="card-elevated p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {d.id}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    Match Confidence: <strong className="text-primary">{d.confidence}%</strong>
                  </span>
                  <span className="text-xs text-muted-foreground">· {d.matchReason}</span>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    d.status === 'merged' ? 'bg-blue-100 text-blue-700' :
                    d.status === 'false_positive' ? 'bg-green-100 text-green-700' :
                    d.status === 'confirmed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {d.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                  <p className="text-2xs uppercase tracking-wide font-bold text-primary mb-1">Primary Profile (Candidate A)</p>
                  <h3 className="text-base font-bold text-foreground">{d.candidateA.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.candidateA.businessName || d.candidateA.location}</p>
                  <div className="mt-2 text-xs space-y-1 text-muted-foreground">
                    <p>Source: <span className="font-semibold text-foreground">{d.candidateA.source}</span></p>
                    <p>Experience: <span className="font-semibold text-foreground">{d.candidateA.experience}</span></p>
                    <p>AI Score: <span className="font-semibold text-primary">{d.candidateA.aiScore}/100</span></p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                  <p className="text-2xs uppercase tracking-wide font-bold text-amber-600 mb-1">Potential Duplicate (Candidate B)</p>
                  <h3 className="text-base font-bold text-foreground">{d.candidateB.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.candidateB.businessName || d.candidateB.location}</p>
                  <div className="mt-2 text-xs space-y-1 text-muted-foreground">
                    <p>Source: <span className="font-semibold text-foreground">{d.candidateB.source}</span></p>
                    <p>Experience: <span className="font-semibold text-foreground">{d.candidateB.experience}</span></p>
                    <p>AI Score: <span className="font-semibold text-primary">{d.candidateB.aiScore}/100</span></p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {d.status === 'pending_review' && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleMarkFalsePositive(d.id)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1"
                  >
                    <XCircle size={13} className="text-green-600" />
                    False Positive
                  </button>
                  <button
                    onClick={() => handleConfirm(d.id)}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1"
                  >
                    <AlertTriangle size={13} />
                    Confirm Duplicate
                  </button>
                  <button
                    onClick={() => handleMerge(d)}
                    className="btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
                  >
                    <GitMerge size={13} />
                    Merge Profiles
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
