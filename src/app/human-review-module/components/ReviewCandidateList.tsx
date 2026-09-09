import React from 'react';
import AIScoreBadge from '@/components/ui/AIScoreBadge';
import { AlertCircle, Clock, User } from 'lucide-react';
import type { ReviewCandidate } from './ReviewWorkspace';

interface ReviewCandidateListProps {
  candidates: ReviewCandidate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ReviewCandidateList({ candidates, selectedId, onSelect }: ReviewCandidateListProps) {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-4 py-3.5 border-b border-border">
        <h3 className="font-bold text-md text-foreground">Review Queue</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{candidates.length} candidates awaiting review</p>
      </div>
      <div className="divide-y divide-border">
        {candidates.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-4 py-4 transition-colors duration-150 hover:bg-muted/40 ${selectedId === c.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full terracotta-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.location}</p>
                </div>
              </div>
              <AIScoreBadge score={c.aiScore} size="sm" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {c.specialisations.map(s => (
                <span key={`rev-spec-${c.id}-${s}`} className="text-2xs font-semibold bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-2.5">
              <span className="text-2xs font-mono text-muted-foreground">{c.appId}</span>
              <div className="flex items-center gap-1.5">
                {c.priority === 'high' && (
                  <span className="flex items-center gap-0.5 text-2xs text-red-700 font-bold">
                    <AlertCircle size={10} />
                    High Priority
                  </span>
                )}
                {c.reviewerAssigned ? (
                  <span className="flex items-center gap-0.5 text-2xs text-muted-foreground">
                    <User size={10} />
                    {c.reviewerAssigned.split(' ')[0]}
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-2xs text-amber-700 font-semibold">
                    <Clock size={10} />
                    Unassigned
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}