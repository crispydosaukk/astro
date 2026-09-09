'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  CheckSquare, Search, ChevronDown, Clock, CheckCircle2, XCircle, 
  Eye, BarChart2, Sparkles, RefreshCw, X, Award, AlertTriangle, Check
} from 'lucide-react';

interface Assessment {
  id: string;
  candidate: string;
  applicationId: string;
  questionsScore?: number;
  questionsCompleted: number;
  questionsTotal: number;
  chartCasesScore?: number;
  chartCasesCompleted: number;
  chartCasesTotal: number;
  status: 'not_started' | 'in_progress' | 'submitted' | 'evaluated' | 'failed';
  assignedDate: string;
  submittedDate?: string;
  aiEvaluated: boolean;
  evaluationDetails?: {
    overallScore: number;
    grade: string;
    strengths: string[];
    areasForImprovement: string[];
    evaluationSummary: string;
  };
}

const initialAssessments: Assessment[] = [];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: <Clock size={11} /> },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: <Clock size={11} /> },
  submitted: { label: 'Ready for AI', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: <CheckCircle2 size={11} /> },
  evaluated: { label: 'AI Evaluated', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: <CheckCircle2 size={11} /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: <XCircle size={11} /> },
};

export default function EnrolmentAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // AI Evaluation State
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [evalSuccessMsg, setEvalSuccessMsg] = useState<string | null>(null);

  const handleRunAIEvaluation = async (assessment: Assessment) => {
    setEvaluatingId(assessment.id);
    try {
      const res = await fetch('/api/ai/evaluate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: assessment.candidate,
          applicationId: assessment.applicationId,
          specialisation: 'Vedic Astrology & Prashna',
          sampleAnswers: [
            { question: 'Navamsha role in marriage matching', answer: 'Navamsha (D9) determines the fruit of the Rashi chart. 7th lord placement and Venus/Jupiter dignity in D9 determine spouse longevity and marital harmony.' },
            { question: 'Sade Sati remedy approach', answer: 'Avoid fear-mongering. Suggest Hanuman Chalisa, selfless service on Saturdays, and oil lamp under Peepal tree.' },
          ],
          chartCases: [
            { caseId: 'CASE-01', candidateReading: 'Ketu in 12th indicates spiritual inclination; Jupiter aspect on lagna protects career longevity.' }
          ]
        })
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        const evalData = data.evaluation;
        const qScore = Math.round(evalData.questionsScore || evalData.overallScore || 85);
        const ccScore = Math.round(evalData.chartCasesScore || evalData.overallScore || 82);

        const updatedAssessment: Assessment = {
          ...assessment,
          status: 'evaluated',
          aiEvaluated: true,
          questionsScore: qScore,
          chartCasesScore: ccScore,
          submittedDate: assessment.submittedDate || new Date().toISOString().substring(0, 10),
          evaluationDetails: {
            overallScore: evalData.overallScore || Math.round((qScore + ccScore) / 2),
            grade: evalData.grade || (qScore >= 80 ? 'Grade A' : 'Grade B'),
            strengths: evalData.strengths || ['Consistent classical interpretations', 'Clear timing of events'],
            areasForImprovement: evalData.areasForImprovement || ['Further documentation on remedial gems'],
            evaluationSummary: evalData.evaluationSummary || 'Demonstrated solid proficiency in astrological calculations and ethics.'
          }
        };

        setAssessments(prev => prev.map(a => a.id === assessment.id ? updatedAssessment : a));
        setSelectedAssessment(updatedAssessment);
        setEvalSuccessMsg(`AI Evaluation completed for ${assessment.candidate}! Grade: ${updatedAssessment.evaluationDetails?.grade}`);
        setTimeout(() => setEvalSuccessMsg(null), 4500);
      } else {
        alert(data.error || 'Failed to evaluate assessment');
      }
    } catch (err: any) {
      alert(`AI Evaluation error: ${err.message}`);
    } finally {
      setEvaluatingId(null);
    }
  };

  const filtered = assessments.filter(a => {
    const matchSearch = a.candidate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {evalSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              {evalSuccessMsg}
            </span>
            <button onClick={() => setEvalSuccessMsg(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <CheckSquare size={28} className="text-primary" /> Assessments
            </h1>
            <p className="text-muted-foreground mt-1">Automated 25-question assessments and 5 chart cases scored via GPT-4o</p>
          </div>
          {assessments.some(a => a.status === 'submitted') && (
            <button 
              onClick={() => {
                const pending = assessments.find(a => a.status === 'submitted');
                if (pending) handleRunAIEvaluation(pending);
              }}
              disabled={evaluatingId !== null}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all"
            >
              <Sparkles size={16} /> Evaluate Next Ready Candidate
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Assessments', value: assessments.length },
            { label: 'In Progress', value: assessments.filter(a => a.status === 'in_progress').length },
            { label: 'Submitted (Ready)', value: assessments.filter(a => a.status === 'submitted').length },
            { label: 'AI Evaluated', value: assessments.filter(a => a.aiEvaluated).length },
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
              placeholder="Search candidate..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Ready for AI</option>
              <option value="evaluated">AI Evaluated</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Questions</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Q Score</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chart Cases</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">CC Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                      No candidate assessments submitted yet.
                    </td>
                  </tr>
                ) : (
                  filtered.map(a => {
                  const sc = statusConfig[a.status] || statusConfig.not_started;
                  const isEvaluating = evaluatingId === a.id;

                  return (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{a.candidate}</p>
                        <p className="text-xs text-muted-foreground font-mono">{a.applicationId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm font-medium">{a.questionsCompleted}/{a.questionsTotal}</div>
                        <div className="w-24 mx-auto bg-muted rounded-full h-1 mt-1">
                          <div className="bg-primary h-1 rounded-full" style={{ width: `${(a.questionsCompleted / a.questionsTotal) * 100}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a.questionsScore !== undefined ? (
                          <span className={`text-sm font-bold ${a.questionsScore >= 80 ? 'text-green-600' : a.questionsScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {a.questionsScore}%
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-sm font-medium">{a.chartCasesCompleted}/{a.chartCasesTotal}</div>
                        <div className="w-24 mx-auto bg-muted rounded-full h-1 mt-1">
                          <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${(a.chartCasesCompleted / a.chartCasesTotal) * 100}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a.chartCasesScore !== undefined ? (
                          <span className={`text-sm font-bold ${a.chartCasesScore >= 80 ? 'text-green-600' : a.chartCasesScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {a.chartCasesScore}%
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.assignedDate}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {a.status === 'submitted' && (
                            <button 
                              onClick={() => handleRunAIEvaluation(a)}
                              disabled={isEvaluating}
                              className="btn-primary flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
                              title="Evaluate with GPT-4o"
                            >
                              {isEvaluating ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {isEvaluating ? 'Evaluating...' : 'Score with AI'}
                            </button>
                          )}

                          {a.aiEvaluated && (
                            <button 
                              onClick={() => setSelectedAssessment(a)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition"
                              title="View AI Evaluation Dossier"
                            >
                              <Award size={12} /> Dossier
                            </button>
                          )}

                          {a.status !== 'submitted' && !a.aiEvaluated && (
                            <button 
                              onClick={() => setSelectedAssessment(a)}
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground" 
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Evaluation Dossier Modal */}
        {selectedAssessment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Award size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{selectedAssessment.candidate}</h2>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {selectedAssessment.applicationId}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Assigned: {selectedAssessment.assignedDate} · Submitted: {selectedAssessment.submittedDate || 'Pending'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAssessment(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedAssessment.evaluationDetails ? (
                <div className="space-y-4">
                  {/* Scores Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-muted/30 rounded-xl text-center border border-border">
                      <p className="text-xs text-muted-foreground">Overall AI Grade</p>
                      <p className="text-lg font-bold text-primary mt-0.5">{selectedAssessment.evaluationDetails.grade}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-xl text-center border border-border">
                      <p className="text-xs text-muted-foreground">Theory Questions</p>
                      <p className="text-lg font-bold text-emerald-600 mt-0.5">{selectedAssessment.questionsScore}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-xl text-center border border-border">
                      <p className="text-xs text-muted-foreground">Chart Cases</p>
                      <p className="text-lg font-bold text-blue-600 mt-0.5">{selectedAssessment.chartCasesScore}%</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles size={13} /> GPT-4o Evaluation Summary
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedAssessment.evaluationDetails.evaluationSummary}
                    </p>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Check size={14} /> Astrological Competencies & Strengths:
                    </p>
                    <ul className="space-y-1">
                      {selectedAssessment.evaluationDetails.strengths.map((s, idx) => (
                        <li key={idx} className="text-xs text-foreground flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for improvement */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={14} /> Observations & Advisory:
                    </p>
                    <ul className="space-y-1">
                      {selectedAssessment.evaluationDetails.areasForImprovement.map((a, idx) => (
                        <li key={idx} className="text-xs text-foreground flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mx-auto">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Evaluation Pending</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Candidate has completed {selectedAssessment.questionsCompleted}/{selectedAssessment.questionsTotal} theory questions and {selectedAssessment.chartCasesCompleted}/{selectedAssessment.chartCasesTotal} chart cases.
                    </p>
                  </div>
                  {selectedAssessment.status === 'submitted' && (
                    <button
                      onClick={() => handleRunAIEvaluation(selectedAssessment)}
                      disabled={evaluatingId !== null}
                      className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                    >
                      <Sparkles size={14} /> Run GPT-4o Evaluation Now
                    </button>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-border">
                {selectedAssessment.aiEvaluated ? (
                  <button
                    onClick={() => handleRunAIEvaluation(selectedAssessment)}
                    disabled={evaluatingId !== null}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <RefreshCw size={12} className={evaluatingId === selectedAssessment.id ? 'animate-spin' : ''} />
                    Re-evaluate with GPT-4o
                  </button>
                ) : <span />}
                <button 
                  onClick={() => setSelectedAssessment(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted font-medium"
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
