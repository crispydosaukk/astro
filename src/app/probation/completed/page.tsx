'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { BadgeCheck, Calendar, User, Star, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface CompletedProbation {
  id: string;
  candidate: string;
  specialisation: string;
  startDate: string;
  endDate: string;
  finalScore: number;
  outcome: 'verified' | 'failed' | 'extended';
  reviewedBy: string;
  notes: string;
  checkpointScores: number[];
}

const completed: CompletedProbation[] = [];

const outcomeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: <BadgeCheck size={12} /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
  extended: { label: 'Extended', color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
};

export default function ProbationCompletedPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 size={28} className="text-primary" /> Completed Probation
          </h1>
          <p className="text-muted-foreground mt-1">Historical record of all completed probation periods and outcomes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Completed', value: completed.length, color: 'text-foreground' },
            { label: 'Verified', value: completed.filter(c => c.outcome === 'verified').length, color: 'text-green-600' },
            { label: 'Failed', value: completed.filter(c => c.outcome === 'failed').length, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Records */}
        <div className="space-y-4">
          {completed.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground card-elevated">
              <CheckCircle2 size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground text-sm">No completed probation records found.</p>
              <p className="text-xs text-muted-foreground mt-1">Concluded 30-day candidate evaluations will be archived here.</p>
            </div>
          ) : (
            completed.map(p => {
            const oc = outcomeConfig[p.outcome];
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{p.candidate}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${oc.color}`}>
                        {oc.icon} {oc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.specialisation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{p.finalScore}%</p>
                    <p className="text-xs text-muted-foreground">Final Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar size={11} /> {p.startDate} – {p.endDate}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User size={11} /> {p.reviewedBy}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Star size={11} /> Checkpoints: {p.checkpointScores.join(', ')}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{p.notes}</p>
              </div>
            );
          }))}
        </div>
      </div>
    </AppLayout>
  );
}
