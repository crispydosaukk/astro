import React, { useState } from 'react';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import { AlertCircle, Clock, User, Search, X, ShieldAlert } from 'lucide-react';
import type { ReviewCandidate } from './ReviewWorkspace';

interface ReviewCandidateListProps {
  candidates: ReviewCandidate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ReviewCandidateList({ candidates, selectedId, onSelect }: ReviewCandidateListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'review' | 'disqualified'>('all');

  const filtered = candidates.filter(c => {
    // 1. Text Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchLoc = c.location?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchAppId = c.appId?.toLowerCase().includes(q);
      const matchSpec = c.specialisations?.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchLoc && !matchPhone && !matchEmail && !matchAppId && !matchSpec) {
        return false;
      }
    }

    // 2. Status Filter
    if (statusFilter === 'disqualified') {
      return c.isDisqualified || (c.tabViolations && c.tabViolations >= 3);
    }
    if (statusFilter === 'review') {
      return !c.isDisqualified;
    }

    return true;
  });

  return (
    <div className="card-elevated overflow-hidden flex flex-col max-h-[85vh]">
      {/* Header & Search */}
      <div className="p-3.5 border-b border-border bg-card space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground">Review Queue</h3>
            <p className="text-2xs text-muted-foreground mt-0.5">{candidates.length} total applicants</p>
          </div>
          <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {filtered.length} visible
          </span>
        </div>

        {/* Quick Search Input */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidate name, phone..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-2xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('review')}
            className={`text-2xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
              statusFilter === 'review'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Under Review
          </button>
          <button
            onClick={() => setStatusFilter('disqualified')}
            className={`text-2xs px-2 py-0.5 rounded-full font-semibold transition-colors flex items-center gap-1 ${
              statusFilter === 'disqualified'
                ? 'bg-red-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <ShieldAlert size={10} /> Disqualified
          </button>
        </div>
      </div>

      {/* Candidate List */}
      <div className="divide-y divide-border overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No applicants match "{search}".
          </div>
        ) : (
          filtered.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-3.5 py-3 transition-colors duration-150 hover:bg-muted/40 ${
                selectedId === c.id ? 'bg-primary/5 border-l-3 border-primary' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full terracotta-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-foreground truncate">{c.name}</p>
                    <p className="text-2xs text-muted-foreground truncate">{c.location}</p>
                  </div>
                </div>
                <AIScoreBadge score={c.aiScore} size="sm" />
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {c.specialisations.slice(0, 2).map(s => (
                  <span key={`rev-spec-${c.id}-${s}`} className="text-2xs font-semibold bg-accent/10 text-accent px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                    {s}
                  </span>
                ))}
                {c.isDisqualified && (
                  <span className="text-2xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldAlert size={9} /> Disqualified
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40 text-2xs text-muted-foreground">
                <span className="font-mono">{c.appId}</span>
                <div className="flex items-center gap-1.5">
                  {c.priority === 'high' && (
                    <span className="flex items-center gap-0.5 text-red-700 dark:text-red-400 font-bold">
                      <AlertCircle size={9} />
                      High Priority
                    </span>
                  )}
                  {c.reviewerAssigned ? (
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <User size={9} />
                      {c.reviewerAssigned.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-semibold">
                      <Clock size={9} />
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}