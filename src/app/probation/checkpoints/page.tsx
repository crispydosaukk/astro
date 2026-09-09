'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { CheckSquare, Calendar, AlertCircle, CheckCircle2, Clock, Eye, Plus, X } from 'lucide-react';

interface Checkpoint {
  id: string;
  candidate: string;
  probationId: string;
  day: number;
  scheduledDate: string;
  completedDate?: string;
  reviewerScore?: number;
  reviewerComments?: string;
  issues?: string;
  recommendation?: 'Continue' | 'Extend' | 'Terminate';
  status: 'upcoming' | 'due' | 'completed' | 'overdue';
}

const defaultCheckpoints: Checkpoint[] = [
  { id: 'CP-001', candidate: 'Dr. Meena Krishnamurthy', probationId: 'PRB-001', day: 7, scheduledDate: '2026-07-25', completedDate: '2026-07-25', reviewerScore: 92, reviewerComments: 'Excellent performance. Strong client feedback. Punctual and professional.', recommendation: 'Continue', status: 'completed' },
  { id: 'CP-002', candidate: 'Dr. Meena Krishnamurthy', probationId: 'PRB-001', day: 15, scheduledDate: '2026-08-02', completedDate: '2026-08-02', reviewerScore: 94, reviewerComments: 'Consistently high quality. No issues reported.', recommendation: 'Continue', status: 'completed' },
  { id: 'CP-003', candidate: 'Dr. Meena Krishnamurthy', probationId: 'PRB-001', day: 30, scheduledDate: 'Today', reviewerScore: undefined, status: 'due' },
  { id: 'CP-004', candidate: 'Acharya Venkatesh Iyer', probationId: 'PRB-002', day: 7, scheduledDate: '2026-08-01', completedDate: '2026-08-01', reviewerScore: 96, reviewerComments: 'Outstanding. Exceptional astrology knowledge demonstrated.', recommendation: 'Continue', status: 'completed' },
  { id: 'CP-005', candidate: 'Acharya Venkatesh Iyer', probationId: 'PRB-002', day: 15, scheduledDate: '2026-08-09', completedDate: '2026-08-09', reviewerScore: 97, reviewerComments: 'Excellent client satisfaction. No concerns.', recommendation: 'Continue', status: 'completed' },
  { id: 'CP-006', candidate: 'Acharya Venkatesh Iyer', probationId: 'PRB-002', day: 30, scheduledDate: 'In 7 days', status: 'upcoming' },
  { id: 'CP-007', candidate: 'Pandit Gopal Mishra', probationId: 'PRB-003', day: 7, scheduledDate: '2026-08-09', completedDate: '2026-08-09', reviewerScore: 85, reviewerComments: 'Good performance. One minor scheduling issue noted.', issues: 'Late for one session', recommendation: 'Continue', status: 'completed' },
  { id: 'CP-008', candidate: 'Pandit Gopal Mishra', probationId: 'PRB-003', day: 15, scheduledDate: 'Today', status: 'due' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: <Calendar size={11} /> },
  due: { label: 'Due Today', color: 'bg-amber-100 text-amber-700', icon: <Clock size={11} /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={11} /> },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: <AlertCircle size={11} /> },
};

const recommendationColor: Record<string, string> = {
  Continue: 'text-green-600',
  Extend: 'text-amber-600',
  Terminate: 'text-red-600',
};

export default function ProbationCheckpointsPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(defaultCheckpoints);
  const [statusFilter, setStatusFilter] = useState('all');
  const [evalModalCp, setEvalModalCp] = useState<Checkpoint | null>(null);
  const [score, setScore] = useState(92);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState<'Continue' | 'Extend' | 'Terminate'>('Continue');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('astroparihar_checkpoints');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setCheckpoints(parsed);
      } catch (_e) {}
    }
  }, []);

  const saveCheckpoints = (newList: Checkpoint[]) => {
    setCheckpoints(newList);
    localStorage.setItem('astroparihar_checkpoints', JSON.stringify(newList));
  };

  const handleOpenReview = (cp: Checkpoint) => {
    setEvalModalCp(cp);
    setScore(cp.reviewerScore || 90);
    setComments(cp.reviewerComments || 'Consultation reviews completed. Accurate planetary analysis and clear remedial prescriptions.');
    setRecommendation(cp.recommendation || 'Continue');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalModalCp) return;

    const updated = checkpoints.map(c => c.id === evalModalCp.id ? {
      ...c,
      status: 'completed' as const,
      completedDate: 'Today',
      reviewerScore: Number(score),
      reviewerComments: comments,
      recommendation,
    } : c);

    saveCheckpoints(updated);
    setEvalModalCp(null);
    setToastMessage(`Checkpoint D${evalModalCp.day} completed for ${evalModalCp.candidate}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filtered = checkpoints.filter(c => statusFilter === 'all' || c.status === statusFilter);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <CheckSquare size={28} className="text-primary" /> Probation Checkpoints
            </h1>
            <p className="text-muted-foreground mt-1">Day 7, Day 15, and Day 30 review checkpoints for all probation candidates</p>
          </div>
          {toastMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 animate-fadeIn flex items-center gap-1">
              <CheckCircle2 size={12} /> {toastMessage}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Checkpoints', value: checkpoints.length },
            { label: 'Due Today', value: checkpoints.filter(c => c.status === 'due').length },
            { label: 'Overdue', value: checkpoints.filter(c => c.status === 'overdue').length },
            { label: 'Completed', value: checkpoints.filter(c => c.status === 'completed').length },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
          {(['all', 'due', 'overdue', 'upcoming', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${statusFilter === tab ? 'bg-card shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'all' ? 'All' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Checkpoints */}
        <div className="space-y-3">
          {filtered.map(cp => {
            const sc = statusConfig[cp.status];
            return (
              <div key={cp.id} className="card-elevated p-4 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      cp.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      cp.status === 'overdue' ? 'bg-red-100 text-red-700' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      D{cp.day}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{cp.candidate}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                        <span className="text-xs text-muted-foreground">Scheduled: {cp.scheduledDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cp.reviewerScore && (
                      <div className="text-right bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        <p className="text-sm font-bold text-emerald-700">{cp.reviewerScore}%</p>
                        <p className="text-2xs text-muted-foreground">Audit Score</p>
                      </div>
                    )}
                    {cp.status === 'due' || cp.status === 'overdue' || cp.status === 'upcoming' ? (
                      <button
                        onClick={() => handleOpenReview(cp)}
                        className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 font-semibold"
                      >
                        <Plus size={12} /> Evaluate Checkpoint
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenReview(cp)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                        title="Edit Review"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {cp.status === 'completed' && cp.reviewerComments && (
                  <div className="mt-3 ml-12 bg-muted/40 rounded-xl p-3 text-xs border border-border">
                    <p className="text-foreground leading-relaxed">{cp.reviewerComments}</p>
                    {cp.recommendation && (
                      <p className={`mt-2 font-bold ${recommendationColor[cp.recommendation]}`}>
                        Recommendation: {cp.recommendation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {evalModalCp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Evaluate Day {evalModalCp.day} Checkpoint</h3>
                  <p className="text-xs text-muted-foreground">{evalModalCp.candidate}</p>
                </div>
                <button onClick={() => setEvalModalCp(null)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Audit Score (0-100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={score}
                    onChange={e => setScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background font-bold text-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Recommendation</label>
                  <select
                    value={recommendation}
                    onChange={e => setRecommendation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="Continue">Continue Probation</option>
                    <option value="Extend">Extend Probation (15 Days)</option>
                    <option value="Terminate">Terminate Candidate</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Reviewer Audit Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-xs"
                    placeholder="Enter observation notes on consultation quality and ethics..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button type="button" onClick={() => setEvalModalCp(null)} className="btn-secondary text-xs py-2 px-4">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4">
                    Save Checkpoint
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
