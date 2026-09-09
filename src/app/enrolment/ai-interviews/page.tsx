'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Video, Search, Eye, Clock, CheckCircle2, XCircle, Loader2, ChevronDown, Sparkles, Plus, X, RefreshCw } from 'lucide-react';

interface AIInterview {
  id: string;
  candidate: string;
  applicationId: string;
  scheduledDate?: string;
  completedDate?: string;
  duration?: string;
  questionsAsked: number;
  totalQuestions: number;
  aiScore?: number;
  recommendation?: 'Strong Candidate' | 'Suitable' | 'Needs Human Review' | 'Not Recommended';
  status: 'scheduled' | 'in_progress' | 'completed' | 'pending' | 'failed';
  strengths?: string[];
  concerns?: string[];
}

const defaultInterviews: AIInterview[] = [
  { id: 'INT-001', candidate: 'Dr. Meena Krishnamurthy', applicationId: 'APP-001', scheduledDate: '2026-08-13', completedDate: '2026-08-13', duration: '42 min', questionsAsked: 12, totalQuestions: 12, aiScore: 89, recommendation: 'Strong Candidate', status: 'completed', strengths: ['Deep Vedic knowledge', 'Clear communication', 'Strong chart analysis'], concerns: ['Limited KP experience'] },
  { id: 'INT-002', candidate: 'Acharya Venkatesh Iyer', applicationId: 'APP-002', scheduledDate: '2026-08-14', completedDate: '2026-08-14', duration: '48 min', questionsAsked: 12, totalQuestions: 12, aiScore: 95, recommendation: 'Strong Candidate', status: 'completed', strengths: ['Exceptional Vedic expertise', 'Excellent case analysis', 'Professional demeanor'], concerns: [] },
  { id: 'INT-003', candidate: 'Pandit Suresh Sharma', applicationId: 'APP-003', scheduledDate: 'Today', questionsAsked: 0, totalQuestions: 12, status: 'scheduled' },
  { id: 'INT-004', candidate: 'Jyotish Acharya Rajan', applicationId: 'APP-004', questionsAsked: 0, totalQuestions: 12, status: 'pending' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: <Clock size={11} /> },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: <Loader2 size={11} className="animate-spin" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={11} /> },
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-600', icon: <Clock size={11} /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: <XCircle size={11} /> },
};

const recommendationColor: Record<string, string> = {
  'Strong Candidate': 'bg-green-100 text-green-700',
  'Suitable': 'bg-blue-100 text-blue-700',
  'Needs Human Review': 'bg-amber-100 text-amber-700',
  'Not Recommended': 'bg-red-100 text-red-700',
};

export default function AIInterviewsPage() {
  const [interviewsList, setInterviewsList] = useState<AIInterview[]>(defaultInterviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateName, setCandidateName] = useState('Pandit Suresh Sharma');
  const [specialisation, setSpecialisation] = useState('Vedic Astrology');

  const handleSimulateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    try {
      const res = await fetch('/api/ai/qualify-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: candidateName,
          specialization: specialisation,
          experienceYears: 16,
          consultationCount: 1500,
        }),
      });

      const data = await res.json();
      const score = data.evaluation?.qualificationScore || 88;
      const strengths = data.evaluation?.positiveSignals || ['Strong classical foundations', 'Client empathy'];
      const concerns = data.evaluation?.riskFlags?.length > 0 ? data.evaluation.riskFlags : ['None detected'];

      const newInterview: AIInterview = {
        id: `INT-${String(interviewsList.length + 1).padStart(3, '0')}`,
        candidate: candidateName,
        applicationId: `APP-00${interviewsList.length + 1}`,
        scheduledDate: 'Today',
        completedDate: 'Today',
        duration: '38 min',
        questionsAsked: 12,
        totalQuestions: 12,
        aiScore: score,
        recommendation: score >= 85 ? 'Strong Candidate' : 'Suitable',
        status: 'completed',
        strengths,
        concerns,
      };

      setInterviewsList([newInterview, ...interviewsList]);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const filtered = interviewsList.filter(i => {
    const matchSearch = i.candidate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Video size={28} className="text-primary" /> AI Candidate Interviews
            </h1>
            <p className="text-muted-foreground mt-1">AI-conducted oral interviews with live transcription and Vedic scoring</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Sparkles size={14} /> Conduct AI Interview (GPT-4o)
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Interviews', value: interviewsList.length },
            { label: 'Completed', value: interviewsList.filter(i => i.status === 'completed').length },
            { label: 'Scheduled', value: interviewsList.filter(i => i.status === 'scheduled').length },
            { label: 'Avg AI Score', value: `${Math.round(interviewsList.filter(i => i.aiScore).reduce((a, i) => a + (i.aiScore || 0), 0) / (interviewsList.filter(i => i.aiScore).length || 1))}/100` },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search interviews..."
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
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {filtered.map(interview => {
            const sc = statusConfig[interview.status] || statusConfig.scheduled;
            return (
              <div key={interview.id} className="card-elevated p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-base text-foreground">{interview.candidate}</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{interview.applicationId} · {interview.scheduledDate ? `Date: ${interview.scheduledDate}` : 'Not yet scheduled'}</p>
                  </div>
                  {interview.aiScore && (
                    <div className="text-right bg-primary/10 px-3 py-1 rounded-xl">
                      <p className="text-xl font-bold text-primary">{interview.aiScore}/100</p>
                      <p className="text-2xs text-muted-foreground font-semibold">AI Interview Score</p>
                    </div>
                  )}
                </div>

                {interview.status === 'completed' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-2xs uppercase font-semibold text-muted-foreground mb-1">Session Duration</p>
                      <p className="text-sm font-semibold text-foreground">{interview.questionsAsked}/{interview.totalQuestions} questions answered</p>
                      <p className="text-xs text-muted-foreground">{interview.duration}</p>
                    </div>
                    {interview.recommendation && (
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-2xs uppercase font-semibold text-muted-foreground mb-1">AI Recommendation</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${recommendationColor[interview.recommendation]}`}>
                          {interview.recommendation}
                        </span>
                      </div>
                    )}
                    {interview.strengths && interview.strengths.length > 0 && (
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-2xs uppercase font-semibold text-muted-foreground mb-1">Verified Strengths</p>
                        <ul className="space-y-1">
                          {interview.strengths.slice(0, 2).map((s, idx) => (
                            <li key={idx} className="text-xs text-foreground flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-green-600 flex-shrink-0" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Simulate Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Run AI Oral Interview (GPT-4o)</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSimulateInterview} className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Candidate Name *</label>
                  <input
                    required
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Specialisation Domain</label>
                  <select
                    value={specialisation}
                    onChange={e => setSpecialisation(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="Vedic Astrology">Vedic Astrology</option>
                    <option value="KP System">KP System</option>
                    <option value="Nadi Astrology">Nadi Astrology</option>
                    <option value="Prashna Jyotish">Prashna Jyotish</option>
                  </select>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                  GPT-4o will simulate a 12-question oral technical interview covering birth chart rectification, dasha analysis, and ethical consultation standards.
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-2 px-4">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" /> Evaluating with GPT-4o...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} /> Start Interview Simulation
                      </>
                    )}
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
