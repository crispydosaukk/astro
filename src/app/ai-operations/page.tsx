'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bot, CheckCircle2, XCircle, RefreshCw, Play, Pause, Eye, Clock } from 'lucide-react';

interface AIJob {
  id: string;
  type: string;
  agent: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  startedAt: string;
  completedAt?: string;
  duration?: string;
  model: string;
  tokensUsed?: number;
  error?: string;
}

const jobs: AIJob[] = [
  { id: 'AIJ-001', type: 'Candidate Qualification', agent: 'Discovery Agent', status: 'completed', startedAt: '2026-08-17 09:05', completedAt: '2026-08-17 09:08', duration: '3m 12s', model: 'gpt-4o', tokensUsed: 12400 },
  { id: 'AIJ-002', type: 'Duplicate Detection', agent: 'Discovery Agent', status: 'completed', startedAt: '2026-08-17 09:10', completedAt: '2026-08-17 09:11', duration: '1m 45s', model: 'gpt-4o', tokensUsed: 5200 },
  { id: 'AIJ-003', type: 'AI Interview', agent: 'Enrolment Agent', status: 'running', startedAt: '2026-08-17 10:30', model: 'gpt-4o', tokensUsed: 8900 },
  { id: 'AIJ-004', type: 'Assessment Evaluation', agent: 'Enrolment Agent', status: 'queued', startedAt: '2026-08-17 11:00', model: 'gpt-4o' },
  { id: 'AIJ-005', type: 'Candidate Extraction', agent: 'Discovery Agent', status: 'failed', startedAt: '2026-08-17 08:00', completedAt: '2026-08-17 08:02', duration: '2m 01s', model: 'gpt-4o', error: 'Rate limit exceeded. Retry scheduled.' },
  { id: 'AIJ-006', type: 'AI Scoring', agent: 'Discovery Agent', status: 'completed', startedAt: '2026-08-16 18:00', completedAt: '2026-08-16 18:04', duration: '4m 22s', model: 'gpt-4o', tokensUsed: 18700 },
];

const agentStatus = [
  { name: 'Discovery Agent', status: 'operational', lastRun: '2026-08-17 09:10', jobsToday: 4, successRate: 92 },
  { name: 'Enrolment Agent', status: 'running', lastRun: '2026-08-17 10:30', jobsToday: 2, successRate: 100 },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  running: { label: 'Running', color: 'bg-blue-100 text-blue-700', icon: <RefreshCw size={11} className="animate-spin" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={11} /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: <XCircle size={11} /> },
  queued: { label: 'Queued', color: 'bg-amber-100 text-amber-700', icon: <Clock size={11} /> },
};

export default function AIOperationsPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'jobs'>('agents');
  const [jobList, setJobList] = useState<AIJob[]>(jobs);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [liveFeedback, setLiveFeedback] = useState<{ message: string; score?: number } | null>(null);

  const handleTriggerAgentJob = async (agentName: string) => {
    setRunningAgent(agentName);
    setLiveFeedback(null);
    const start = Date.now();

    try {
      const res = await fetch('/api/ai/qualify-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Acharya Devavrat Sharma',
          specialization: 'KP Astrology, Horary, Gemology',
          experienceYears: 15,
          languages: ['Hindi', 'English', 'Gujarati'],
          consultationCount: 4200,
        }),
      });

      const data = await res.json();
      const durationSec = Math.round((Date.now() - start) / 1000);

      if (data.success && data.evaluation) {
        const newJob: AIJob = {
          id: `AIJ-${String(jobList.length + 1).padStart(3, '0')}`,
          type: 'Candidate Qualification',
          agent: agentName,
          status: 'completed',
          startedAt: new Date().toLocaleTimeString(),
          completedAt: new Date().toLocaleTimeString(),
          duration: `${durationSec}s`,
          model: 'gpt-4o',
          tokensUsed: 620,
        };

        setJobList([newJob, ...jobList]);
        setLiveFeedback({
          message: `GPT-4o successfully evaluated candidate. Score: ${data.evaluation.qualificationScore}/100 (${data.evaluation.recommendation})`,
          score: data.evaluation.qualificationScore,
        });
      } else {
        throw new Error(data.message || 'Job execution failed');
      }
    } catch (err: any) {
      setLiveFeedback({
        message: `Execution failed: ${err.message}`,
      });
    } finally {
      setRunningAgent(null);
    }
  };

  const totalTokens = jobList.filter(j => j.tokensUsed).reduce((a, j) => a + (j.tokensUsed || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bot size={28} className="text-primary" /> AI Operations
          </h1>
          <p className="text-muted-foreground mt-1">Monitor AI agents, jobs, and API usage across the platform</p>
        </div>

        {/* Live execution feedback */}
        {liveFeedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{liveFeedback.message}</span>
            </div>
            <button
              onClick={() => setLiveFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total AI Jobs', value: jobList.length },
            { label: 'Running', value: jobList.filter(j => j.status === 'running').length },
            { label: 'Failed Today', value: jobList.filter(j => j.status === 'failed').length },
            { label: 'Tokens Used', value: `${(totalTokens / 1000).toFixed(1)}k` },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
          {(['agents', 'jobs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'agents' ? 'AI Agents' : `Job History (${jobList.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentStatus.map(agent => (
              <div key={agent.name} className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bot size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{agent.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-2 h-2 rounded-full ${agent.status === 'running' || runningAgent === agent.name ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className="text-xs text-muted-foreground capitalize">
                          {runningAgent === agent.name ? 'Evaluating with GPT-4o...' : agent.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleTriggerAgentJob(agent.name)}
                      disabled={runningAgent !== null}
                      className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold"
                      title="Run Live OpenAI Evaluation"
                    >
                      {runningAgent === agent.name ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        <Play size={13} />
                      )}
                      Test Agent (GPT-4o)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="font-bold text-foreground text-base">{agent.jobsToday}</p>
                    <p className="text-muted-foreground">Jobs Today</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="font-bold text-green-600 text-base">{agent.successRate}%</p>
                    <p className="text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="font-bold text-foreground text-xs">{agent.lastRun.split(' ')[1]}</p>
                    <p className="text-muted-foreground">Last Run</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Job</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agent</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Model</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tokens</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duration</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Started</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobList.map(job => {
                    const sc = statusConfig[job.status];
                    return (
                      <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{job.type}</p>
                          <p className="text-xs text-muted-foreground font-mono">{job.id}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{job.agent}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{job.model}</td>
                        <td className="px-4 py-3 text-right text-sm">{job.tokensUsed ? job.tokensUsed.toLocaleString() : '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{job.duration || '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{job.startedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded hover:bg-muted"><Eye size={13} /></button>
                            {job.status === 'failed' && <button className="p-1.5 rounded hover:bg-muted text-green-600"><RefreshCw size={13} /></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
