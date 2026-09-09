'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  Timer, Search, Eye, AlertCircle, CheckCircle2, Award, 
  CheckSquare, X, ChevronRight, Sparkles 
} from 'lucide-react';
import Link from 'next/link';

interface ProbationRecord {
  id: string;
  candidate: string;
  specialisation: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  daysTotal: number;
  assignedReviewer: string;
  checkpointsCompleted: number;
  checkpointsTotal: number;
  currentScore: number;
  issues: number;
  status: 'active' | 'extended' | 'at_risk';
  checkpointLogs?: { day: number; date: string; notes: string; score: number }[];
}

const initialProbations: ProbationRecord[] = [];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300', icon: <CheckCircle2 size={11} /> },
  extended: { label: 'Extended', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', icon: <Timer size={11} /> },
  at_risk: { label: 'At Risk', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300', icon: <AlertCircle size={11} /> },
};

export default function ProbationActivePage() {
  const [probations, setProbations] = useState<ProbationRecord[]>([]);
  const [search, setSearch] = useState('');

  // Milestone modal
  const [activeRecord, setActiveRecord] = useState<ProbationRecord | null>(null);
  const [newLogNotes, setNewLogNotes] = useState('');
  const [newLogScore, setNewLogScore] = useState(90);
  const [notification, setNotification] = useState<string | null>(null);

  const handleAddCheckpoint = () => {
    if (!activeRecord) return;
    const nextCheckpointNum = activeRecord.checkpointsCompleted + 1;
    const dayMilestone = nextCheckpointNum === 1 ? 7 : nextCheckpointNum === 2 ? 15 : 30;

    const newLog = {
      day: dayMilestone,
      date: new Date().toISOString().substring(0, 10),
      notes: newLogNotes || `Milestone Day ${dayMilestone} checkpoint verified and scored.`,
      score: Number(newLogScore),
    };

    const updated = {
      ...activeRecord,
      checkpointsCompleted: Math.min(activeRecord.checkpointsTotal, nextCheckpointNum),
      currentScore: Math.round((activeRecord.currentScore + Number(newLogScore)) / 2),
      checkpointLogs: [...(activeRecord.checkpointLogs || []), newLog],
    };

    setProbations(prev => prev.map(p => p.id === activeRecord.id ? updated : p));
    setActiveRecord(updated);
    setNewLogNotes('');
    setNotification(`Checkpoint Day ${dayMilestone} logged for ${activeRecord.candidate}!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = probations.filter(p =>
    p.candidate.toLowerCase().includes(search.toLowerCase()) ||
    p.specialisation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {notification && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Timer size={28} className="text-primary" /> Active Probation
            </h1>
            <p className="text-muted-foreground mt-1">Monitor candidate milestone audits (Day 7, 15, 30) during 30-day live trials</p>
          </div>
          <Link
            href="/verification"
            className="btn-secondary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-border"
          >
            <Award size={14} className="text-amber-500" /> Go to Final Verification Queue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Probation', value: probations.filter(p => p.status === 'active').length, color: 'text-green-600' },
            { label: 'Extended', value: probations.filter(p => p.status === 'extended').length, color: 'text-amber-600' },
            { label: 'At Risk', value: probations.filter(p => p.status === 'at_risk').length, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search probation records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground card-elevated">
              <Timer size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground text-sm">No astrologers currently on probation.</p>
              <p className="text-xs text-muted-foreground mt-1">Candidates approved from human review will enter the 30-day monitored probation stage here.</p>
            </div>
          ) : (
            filtered.map(p => {
            const sc = statusConfig[p.status];
            const progressPct = Math.round(((p.daysTotal - p.daysRemaining) / p.daysTotal) * 100);
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-base">{p.candidate}</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.specialisation} · Supervisor: {p.assignedReviewer}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{p.currentScore}%</p>
                      <p className="text-xs text-muted-foreground">Current Score</p>
                    </div>
                    <button 
                      onClick={() => setActiveRecord(p)}
                      className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    >
                      <CheckSquare size={13} /> Checkpoints ({p.checkpointsCompleted}/{p.checkpointsTotal})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground">{p.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="font-medium text-foreground">{p.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Days Remaining</p>
                    <p className={`font-bold ${p.daysRemaining <= 7 ? 'text-amber-600' : 'text-foreground'}`}>{p.daysRemaining} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Milestones</p>
                    <p className="font-medium text-foreground">{p.checkpointsCompleted}/{p.checkpointsTotal} completed</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Probation Completion Progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${p.status === 'at_risk' ? 'bg-red-500' : p.status === 'extended' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {p.issues > 0 && (
                  <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={13} /> {p.issues} issue{p.issues > 1 ? 's' : ''} flagged during active consultations
                  </div>
                )}
              </div>
            );
          }))}
        </div>

        {/* Milestone Detail & Audit Modal */}
        {activeRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{activeRecord.candidate}</h2>
                  <p className="text-xs text-muted-foreground">Probation Audit Tracker · Score: {activeRecord.currentScore}%</p>
                </div>
                <button 
                  onClick={() => setActiveRecord(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Existing Logs */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Completed Milestone Reviews:</p>
                {activeRecord.checkpointLogs && activeRecord.checkpointLogs.length > 0 ? (
                  activeRecord.checkpointLogs.map((log, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>Day {log.day} Checkpoint Audit</span>
                        <span className="text-emerald-600 dark:text-emerald-400">Score: {log.score}%</span>
                      </div>
                      <p className="text-muted-foreground">{log.notes}</p>
                      <p className="text-2xs text-muted-foreground pt-0.5">{log.date}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No checkpoints recorded yet.</p>
                )}
              </div>

              {/* Record Next Checkpoint */}
              {activeRecord.checkpointsCompleted < activeRecord.checkpointsTotal ? (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles size={13} className="text-primary" />
                    Record Milestone Day {activeRecord.checkpointsCompleted === 0 ? 7 : activeRecord.checkpointsCompleted === 1 ? 15 : 30} Checkpoint
                  </p>
                  <div>
                    <label className="text-2xs font-semibold text-muted-foreground block mb-1">Audit Score (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newLogScore}
                      onChange={e => setNewLogScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-2xs font-semibold text-muted-foreground block mb-1">Supervisor Observations & Consultation Notes</label>
                    <textarea
                      rows={3}
                      value={newLogNotes}
                      onChange={e => setNewLogNotes(e.target.value)}
                      placeholder="e.g. Reviewed 8 calls. Good empathy, astrological advice aligned with Parashara principles."
                      className="w-full p-2.5 text-xs border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddCheckpoint}
                      className="btn-primary text-xs px-4 py-2 rounded-lg font-medium"
                    >
                      Save Milestone Audit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">All 3 Milestones Completed!</p>
                  <p className="text-xs text-muted-foreground">Candidate has fulfilled the 30-day monitoring period and is eligible for final badge verification.</p>
                  <Link
                    href="/verification"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                  >
                    Open Final Verification Panel <ChevronRight size={13} />
                  </Link>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveRecord(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
