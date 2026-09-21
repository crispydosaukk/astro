'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  X, 
  HelpCircle, 
  FileQuestion, 
  Sliders, 
  Layers, 
  Check, 
  Globe 
} from 'lucide-react';
import { THEORY_QUESTIONS, TheoryQuestion } from '@/lib/theoryQuestions';

export interface ChartCase {
  id: string;
  title: string;
  clientQuery: string;
  lagna: string;
  moonSign: string;
  dasha: string;
  keyPlacements: string;
  expectedObservations: string;
  recommendedRemedies: string;
  enabled?: boolean;
}

export default function AssessmentSettingsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Configuration State
  const [useCustomQuestions, setUseCustomQuestions] = useState<boolean>(true);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [customQuestions, setCustomQuestions] = useState<TheoryQuestion[]>([]);

  const [useCustomChartCases, setUseCustomChartCases] = useState<boolean>(true);
  const [chartCasesCount, setChartCasesCount] = useState<number>(1);
  const [customChartCases, setCustomChartCases] = useState<ChartCase[]>([]);

  const [passingThreshold, setPassingThreshold] = useState<number>(75);
  const [theoryWeight, setTheoryWeight] = useState<number>(35);
  const [chartCaseWeight, setChartCaseWeight] = useState<number>(25);
  const [aiInterviewWeight, setAiInterviewWeight] = useState<number>(40);

  // Modals State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [qQuestion, setQQuestion] = useState('');
  const [qTopic, setQTopic] = useState('Houses & Bhavas');
  const [qOption0, setQOption0] = useState('');
  const [qOption1, setQOption1] = useState('');
  const [qOption2, setQOption2] = useState('');
  const [qOption3, setQOption3] = useState('');
  const [qCorrectIndex, setQCorrectIndex] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState('');
  const [qQuestionHi, setQQuestionHi] = useState('');
  const [qQuestionTe, setQQuestionTe] = useState('');
  const [qQuestionTa, setQQuestionTa] = useState('');
  const [showLangInputs, setShowLangInputs] = useState(false);

  // Chart Case Modal State
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [cTitle, setCTitle] = useState('');
  const [cQuery, setCQuery] = useState('');
  const [cLagna, setCLagna] = useState('');
  const [cMoon, setCMoon] = useState('');
  const [cDasha, setCDasha] = useState('');
  const [cPlacements, setCPlacements] = useState('');
  const [cObservations, setCObservations] = useState('');
  const [cRemedies, setCRemedies] = useState('');

  // Search filter inside custom questions list
  const [questionSearch, setQuestionSearch] = useState('');

  // Fetch Settings from API on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/assessment');
      const data = await res.json();
      if (data.success && data.config) {
        const c = data.config;
        setUseCustomQuestions(c.useCustomQuestions !== undefined ? c.useCustomQuestions : true);
        setQuestionCount(c.questionCount || 15);
        setCustomQuestions(c.customQuestions && c.customQuestions.length > 0 ? c.customQuestions : THEORY_QUESTIONS);
        setUseCustomChartCases(c.useCustomChartCases !== undefined ? c.useCustomChartCases : true);
        setChartCasesCount(c.chartCasesCount || 1);
        setCustomChartCases(c.customChartCases || []);
        setPassingThreshold(c.passingThreshold || 75);
        setTheoryWeight(c.theoryWeight || 35);
        setChartCaseWeight(c.chartCaseWeight || 25);
        setAiInterviewWeight(c.aiInterviewWeight || 40);
      }
    } catch (err: any) {
      console.warn('Failed to load assessment settings:', err);
      setCustomQuestions(THEORY_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuestion = (id: number) => {
    setCustomQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, enabled: q.enabled === false ? true : false };
      }
      return q;
    }));
  };

  const handleToggleChartCase = (id: string) => {
    setCustomChartCases(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, enabled: c.enabled === false ? true : false };
      }
      return c;
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setToast(null);
    try {
      const payload = {
        useCustomQuestions,
        questionCount,
        customQuestions,
        useCustomChartCases,
        chartCasesCount,
        customChartCases,
        passingThreshold,
        theoryWeight,
        chartCaseWeight,
        aiInterviewWeight,
      };

      const res = await fetch('/api/settings/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Assessment settings & dynamic questions saved successfully!', type: 'success' });
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast({ message: data.error || 'Failed to save settings', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Error connecting to server', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Open modal for Adding new Question
  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQQuestion('');
    setQTopic('Houses & Bhavas');
    setQOption0('');
    setQOption1('');
    setQOption2('');
    setQOption3('');
    setQCorrectIndex(0);
    setQExplanation('');
    setQQuestionHi('');
    setQQuestionTe('');
    setQQuestionTa('');
    setShowLangInputs(false);
    setIsQuestionModalOpen(true);
  };

  // Open modal for Editing existing Question
  const handleOpenEditQuestion = (q: TheoryQuestion) => {
    setEditingQuestionId(q.id);
    setQQuestion(q.question);
    setQTopic(q.topic || 'Houses & Bhavas');
    setQOption0(q.options[0] || '');
    setQOption1(q.options[1] || '');
    setQOption2(q.options[2] || '');
    setQOption3(q.options[3] || '');
    setQCorrectIndex(q.correctIndex || 0);
    setQExplanation(q.explanation || '');
    setQQuestionHi(q.questionHi || '');
    setQQuestionTe(q.questionTe || '');
    setQQuestionTa(q.questionTa || '');
    setShowLangInputs(Boolean(q.questionHi || q.questionTe || q.questionTa));
    setIsQuestionModalOpen(true);
  };

  // Save Question from Modal
  const handleSaveQuestion = () => {
    if (!qQuestion.trim()) {
      alert('Please enter the question text.');
      return;
    }
    if (!qOption0.trim() || !qOption1.trim() || !qOption2.trim() || !qOption3.trim()) {
      alert('Please fill in all 4 answer options.');
      return;
    }

    const options = [qOption0.trim(), qOption1.trim(), qOption2.trim(), qOption3.trim()];

    if (editingQuestionId !== null) {
      // Edit existing
      setCustomQuestions(prev => prev.map(q => q.id === editingQuestionId ? {
        ...q,
        question: qQuestion.trim(),
        topic: qTopic.trim(),
        options,
        correctIndex: qCorrectIndex,
        explanation: qExplanation.trim(),
        questionHi: qQuestionHi.trim() || undefined,
        questionTe: qQuestionTe.trim() || undefined,
        questionTa: qQuestionTa.trim() || undefined,
      } : q));
    } else {
      // Create new with unique ID
      const newId = customQuestions.length > 0 ? Math.max(...customQuestions.map(q => Number(q.id) || 0)) + 1 : 1;
      const newQuestion: TheoryQuestion = {
        id: newId,
        question: qQuestion.trim(),
        topic: qTopic.trim(),
        options,
        correctIndex: qCorrectIndex,
        explanation: qExplanation.trim(),
        questionHi: qQuestionHi.trim() || undefined,
        questionTe: qQuestionTe.trim() || undefined,
        questionTa: qQuestionTa.trim() || undefined,
        enabled: true,
      };
      setCustomQuestions(prev => [newQuestion, ...prev]);
    }

    setIsQuestionModalOpen(false);
  };

  // Delete Question
  const handleDeleteQuestion = (id: number) => {
    if (confirm('Are you sure you want to remove this question from your custom bank?')) {
      setCustomQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  // Open modal for Adding new Chart Case
  const handleOpenAddChart = () => {
    setEditingChartId(null);
    setCTitle('');
    setCQuery('');
    setCLagna('');
    setCMoon('');
    setCDasha('');
    setCPlacements('');
    setCObservations('');
    setCRemedies('');
    setIsChartModalOpen(true);
  };

  // Open modal for Editing Chart Case
  const handleOpenEditChart = (c: ChartCase) => {
    setEditingChartId(c.id);
    setCTitle(c.title);
    setCQuery(c.clientQuery);
    setCLagna(c.lagna);
    setCMoon(c.moonSign);
    setCDasha(c.dasha);
    setCPlacements(c.keyPlacements);
    setCObservations(c.expectedObservations);
    setCRemedies(c.recommendedRemedies);
    setIsChartModalOpen(true);
  };

  // Save Chart Case from Modal
  const handleSaveChartCase = () => {
    if (!cTitle.trim() || !cQuery.trim()) {
      alert('Please enter a case study title and client query.');
      return;
    }

    if (editingChartId) {
      setCustomChartCases(prev => prev.map(c => c.id === editingChartId ? {
        ...c,
        title: cTitle.trim(),
        clientQuery: cQuery.trim(),
        lagna: cLagna.trim(),
        moonSign: cMoon.trim(),
        dasha: cDasha.trim(),
        keyPlacements: cPlacements.trim(),
        expectedObservations: cObservations.trim(),
        recommendedRemedies: cRemedies.trim(),
      } : c));
    } else {
      const newChart: ChartCase = {
        id: `case-${Date.now()}`,
        title: cTitle.trim(),
        clientQuery: cQuery.trim(),
        lagna: cLagna.trim(),
        moonSign: cMoon.trim(),
        dasha: cDasha.trim(),
        keyPlacements: cPlacements.trim(),
        expectedObservations: cObservations.trim(),
        recommendedRemedies: cRemedies.trim(),
        enabled: true,
      };
      setCustomChartCases(prev => [newChart, ...prev]);
    }

    setIsChartModalOpen(false);
  };

  // Delete Chart Case
  const handleDeleteChartCase = (id: string) => {
    if (confirm('Are you sure you want to remove this Kundali Case Study?')) {
      setCustomChartCases(prev => prev.filter(c => c.id !== id));
    }
  };

  const activeQuestionsCount = customQuestions.filter(q => q.enabled !== false).length;
  const activeChartCasesCount = customChartCases.filter(c => c.enabled !== false).length;

  const filteredQuestions = customQuestions.filter(q => {
    if (!questionSearch.trim()) return true;
    const s = questionSearch.toLowerCase();
    return q.question.toLowerCase().includes(s) || (q.topic && q.topic.toLowerCase().includes(s));
  });

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <RefreshCw size={24} className="animate-spin text-primary mx-auto" />
        <p className="text-xs text-muted-foreground">Loading assessment configuration & questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Save */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare size={22} className="text-primary" /> Assignment & Dynamic Questions Management
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage Theory Assessment questions and Kundali Case Studies. Toggle between your own custom dashboard questions and AI auto-generation mode.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm font-bold cursor-pointer"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
            : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. MASTER TOGGLE & QUESTION ALLOCATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theory Questions Mode Toggle */}
        <div className={`p-4 rounded-xl border transition-all ${
          useCustomQuestions 
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-2xs' 
            : 'bg-primary/5 border-primary/30 shadow-2xs'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                Stage 1: Multiple-Choice Questions Mode
              </span>
              <h4 className="text-sm font-bold text-foreground mt-0.5">
                {useCustomQuestions ? 'Custom Dashboard Questions Bank' : 'AI Auto-Generated Questions (GPT-4o)'}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setUseCustomQuestions(prev => !prev)}
              className="cursor-pointer transition-transform active:scale-95 shrink-0"
              title="Toggle Custom Questions ON / OFF"
            >
              {useCustomQuestions ? (
                <ToggleRight size={32} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ToggleLeft size={32} className="text-primary" />
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {useCustomQuestions 
              ? '✓ ON: Candidates will receive the exact questions and options added in your custom question bank below.' 
              : '⚡ OFF: AI (GPT-4o) dynamically creates fresh, randomized questions on the fly for each candidate based on their specialization and language.'}
          </p>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-2xs">
            <span className="font-semibold text-foreground">Current Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold ${
              useCustomQuestions 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-primary/10 text-primary'
            }`}>
              {useCustomQuestions ? 'Custom Questions [ON]' : 'AI Auto-Generate [OFF]'}
            </span>
          </div>
        </div>

        {/* Number of Questions Selector */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
              Candidate Question Allocation
            </span>
            <h4 className="text-sm font-bold text-foreground mt-0.5">
              How Many Questions To Ask Each Candidate?
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Select how many questions are served to each applicant during their online examination.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[3, 5, 8, 10, 15, 20].map(cnt => (
              <button
                type="button"
                key={cnt}
                onClick={() => setQuestionCount(cnt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  questionCount === cnt 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-muted/50 hover:bg-muted border border-border text-foreground'
                }`}
              >
                {cnt} Qs
              </button>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-muted-foreground">Custom:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={e => setQuestionCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 px-2 py-1 text-xs border border-border rounded-lg bg-background font-bold text-center"
              />
            </div>
          </div>

          <p className="text-2xs text-muted-foreground italic">
            Candidates will receive {questionCount} questions from your pool of {activeQuestionsCount} active questions ({customQuestions.length} total in bank).
          </p>
        </div>
      </div>

      {/* 2. STAGE 1: CUSTOM QUESTIONS BANK MANAGEMENT */}
      <div className="card-elevated overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <FileQuestion size={16} className="text-primary" />
              Stage 1: Vedic Theory Questions Bank ({activeQuestionsCount} Active / {customQuestions.length} in Pool)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create, edit, delete, or toggle questions ON/OFF. Only active questions are assigned to applicants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter questions..."
              value={questionSearch}
              onChange={e => setQuestionSearch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-border rounded-lg bg-background w-44"
            />
            <button
              onClick={handleOpenAddQuestion}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 font-bold cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Custom Question</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No questions found. Click "Add Custom Question" to create your first question!
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div 
                key={q.id || idx} 
                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                  q.enabled !== false
                    ? 'border-border bg-card hover:border-primary/40'
                    : 'border-dashed border-border/80 bg-muted/20 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-primary font-mono">#{idx + 1}</span>
                      {q.topic && (
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {q.topic}
                        </span>
                      )}
                      {q.enabled === false && (
                        <span className="text-3xs font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Disabled / Off
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-relaxed">
                      {q.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleQuestion(q.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer ${
                        q.enabled !== false
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                          : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                      }`}
                      title={q.enabled !== false ? 'Currently ACTIVE in candidate exam pool. Click to turn OFF.' : 'Currently TURNED OFF. Click to enable in candidate exam pool.'}
                    >
                      {q.enabled !== false ? (
                        <>
                          <ToggleRight size={15} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Active [ON]</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={15} className="text-muted-foreground" />
                          <span>Off</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                      title="Edit Question"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                          isCorrect 
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500/50' 
                            : 'bg-muted/20 border-border/60 text-muted-foreground'
                        }`}
                      >
                        <span className="truncate">
                          <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                        </span>
                        {isCorrect && (
                          <span className="text-2xs font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white shrink-0">
                            ✓ Correct Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Shastra Explanation */}
                {q.explanation && (
                  <p className="text-2xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/60">
                    <strong className="text-foreground">Classical Reason: </strong>{q.explanation}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. STAGE 2: KUNDALI CASE STUDIES MANAGEMENT */}
      <div className="card-elevated overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              Stage 2: Blind Kundali Case Studies ({activeChartCasesCount} Active / {customChartCases.length} in Pool)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure real-life client cases presented to candidates. Toggle cases ON or OFF, or add new dynamic cases.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Custom Chart Cases */}
            <button
              type="button"
              onClick={() => setUseCustomChartCases(prev => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-border bg-background cursor-pointer"
            >
              {useCustomChartCases ? (
                <>
                  <ToggleRight size={18} className="text-emerald-600" />
                  <span>Custom Cases [ON]</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={18} className="text-muted-foreground" />
                  <span>AI Dynamic [OFF]</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenAddChart}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 font-bold cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Chart Case</span>
            </button>
          </div>
        </div>

        {/* Number of Chart Cases Selector */}
        <div className="p-4 border-b border-border bg-muted/10 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                Case Study Allocation
              </span>
              <h4 className="text-sm font-bold text-foreground mt-0.5">
                How Many Kundali Cases To Assign Each Candidate?
              </h4>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3].map(cnt => (
                <button
                  type="button"
                  key={cnt}
                  onClick={() => setChartCasesCount(cnt)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartCasesCount === cnt 
                      ? 'bg-primary text-primary-foreground shadow-xs' 
                      : 'bg-muted/50 hover:bg-muted border border-border text-foreground'
                  }`}
                >
                  {cnt} Case{cnt > 1 ? 's' : ''}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-xs text-muted-foreground">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={chartCasesCount}
                  onChange={e => setChartCasesCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-14 px-2 py-1 text-xs border border-border rounded-lg bg-background font-bold text-center"
                />
              </div>
            </div>
          </div>
          <p className="text-2xs text-muted-foreground italic">
            Candidates will solve {chartCasesCount} Kundali case{chartCasesCount > 1 ? 's' : ''} from your {activeChartCasesCount} active case{activeChartCasesCount !== 1 ? 's' : ''} ({customChartCases.length} total configured).
          </p>
        </div>

        <div className="p-4 space-y-4">
          {customChartCases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No custom chart cases added yet. Default case will be assigned or click "Add Chart Case".
            </div>
          ) : (
            customChartCases.map((c, idx) => (
              <div 
                key={c.id || idx} 
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  c.enabled !== false
                    ? 'border-border bg-card'
                    : 'border-dashed border-border/80 bg-muted/20 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-bold uppercase tracking-wider text-primary">Case Study #{idx + 1}</span>
                      {c.enabled === false && (
                        <span className="text-3xs font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Excluded / Off
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-foreground mt-0.5">{c.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleChartCase(c.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer ${
                        c.enabled !== false
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                          : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                      }`}
                      title={c.enabled !== false ? 'Active case study - click to turn OFF' : 'Turned OFF - click to turn ON'}
                    >
                      {c.enabled !== false ? (
                        <>
                          <ToggleRight size={15} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Active [ON]</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={15} className="text-muted-foreground" />
                          <span>Off</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEditChart(c)}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
                      title="Edit Case"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteChartCase(c.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 transition-colors cursor-pointer"
                      title="Delete Case"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Client Query Box */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs">
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Client's Question & Dilemma:
                  </span>
                  <p className="text-foreground italic">"{c.clientQuery}"</p>
                </div>

                {/* Chart Placements */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/80">
                    <span className="text-2xs font-bold text-muted-foreground block">Lagna</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{c.lagna || 'Scorpio Lagna'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/80">
                    <span className="text-2xs font-bold text-muted-foreground block">Moon & Dasha</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{c.dasha || 'Saturn-Rahu Dasha'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/80">
                    <span className="text-2xs font-bold text-muted-foreground block">Key Placements</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{c.keyPlacements || 'Mars in 10th Digbala'}</span>
                  </div>
                </div>

                {/* Remedies and observations */}
                {(c.expectedObservations || c.recommendedRemedies) && (
                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-2xs space-y-1">
                    {c.expectedObservations && (
                      <p><strong className="text-primary">Expected Astrological Logic:</strong> {c.expectedObservations}</p>
                    )}
                    {c.recommendedRemedies && (
                      <p><strong className="text-amber-600 dark:text-amber-400">Target Remedies:</strong> {c.recommendedRemedies}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. MODAL: ADD / EDIT THEORY QUESTION */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileQuestion size={18} className="text-primary" />
                {editingQuestionId ? 'Edit Theory Question' : 'Add New Custom Theory Question'}
              </h3>
              <button 
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Question Text (English) *
                </label>
                <textarea
                  rows={2}
                  value={qQuestion}
                  onChange={e => setQQuestion(e.target.value)}
                  placeholder="e.g. Which planetary combination forms a classic Gajakesari Yoga?"
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  Astrological Topic / Category *
                </label>
                <select
                  value={qTopic}
                  onChange={e => setQTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                >
                  <option value="Houses & Bhavas">Houses & Bhavas (भाव एवं स्थान)</option>
                  <option value="Classical Yogas">Classical Yogas (गजकेसरी, राजयोग, आदि)</option>
                  <option value="Divisional Charts">Divisional Charts / Navamsha (नवांश D9)</option>
                  <option value="Dasha Systems">Dasha Systems (विंशोत्तरी दशा)</option>
                  <option value="Transits (Gochara)">Transits / Gochara (गोचर विचार)</option>
                  <option value="Remedial Upayas & Ethics">Remedial Upayas & Ethics (सात्विक उपाय)</option>
                  <option value="Longevity & Marakas">Longevity & Marakas (मारक भाव)</option>
                  <option value="Kundali Matching">Kundali Matching / Ashtakoot (कुंडली मिलान)</option>
                </select>
              </div>

              {/* 4 Options and radio to pick correct */}
              <div className="space-y-2">
                <label className="block font-bold text-foreground">
                  4 Multiple-Choice Options & Correct Key *
                </label>
                <p className="text-2xs text-muted-foreground">
                  Type each option and click the radio circle to mark which one is the correct answer.
                </p>

                {[
                  { label: 'Option A', val: qOption0, set: setQOption0, idx: 0 },
                  { label: 'Option B', val: qOption1, set: setQOption1, idx: 1 },
                  { label: 'Option C', val: qOption2, set: setQOption2, idx: 2 },
                  { label: 'Option D', val: qOption3, set: setQOption3, idx: 3 },
                ].map(opt => (
                  <div 
                    key={opt.idx}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      qCorrectIndex === opt.idx 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' 
                        : 'border-border bg-background'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correctKey"
                      checked={qCorrectIndex === opt.idx}
                      onChange={() => setQCorrectIndex(opt.idx)}
                      className="cursor-pointer text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="font-bold text-2xs text-foreground w-16">{opt.label}:</span>
                    <input
                      type="text"
                      value={opt.val}
                      onChange={e => opt.set(e.target.value)}
                      placeholder={`Enter text for ${opt.label}...`}
                      className="flex-1 px-2.5 py-1 text-xs border border-border rounded bg-card focus:outline-none"
                    />
                    {qCorrectIndex === opt.idx && (
                      <span className="text-2xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        ✓ Correct Key
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Classical Shastra Explanation (Shown in Review & Grading)
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={e => setQExplanation(e.target.value)}
                  placeholder="e.g. Gajakesari Yoga is formed when Jupiter occupies a Kendra from Moon or Lagna..."
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none"
                />
              </div>

              {/* Multi-language inputs toggle */}
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowLangInputs(prev => !prev)}
                  className="text-xs text-primary font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Globe size={13} />
                  <span>{showLangInputs ? 'Hide Hindi / Telugu / Tamil Translations' : '+ Add Hindi / Telugu / Tamil Translations (Optional)'}</span>
                </button>

                {showLangInputs && (
                  <div className="mt-2.5 space-y-2.5 bg-muted/20 p-3 rounded-xl border border-border">
                    <div>
                      <label className="block text-2xs font-semibold text-muted-foreground mb-0.5">Hindi (हिन्दी) Question:</label>
                      <input
                        type="text"
                        value={qQuestionHi}
                        onChange={e => setQQuestionHi(e.target.value)}
                        placeholder="हिन्दी में प्रश्न..."
                        className="w-full px-2.5 py-1 text-xs border border-border rounded bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-muted-foreground mb-0.5">Telugu (తెలుగు) Question:</label>
                      <input
                        type="text"
                        value={qQuestionTe}
                        onChange={e => setQQuestionTe(e.target.value)}
                        placeholder="తెలుగులో ప్రశ్న..."
                        className="w-full px-2.5 py-1 text-xs border border-border rounded bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-muted-foreground mb-0.5">Tamil (தமிழ்) Question:</label>
                      <input
                        type="text"
                        value={qQuestionTa}
                        onChange={e => setQQuestionTa(e.target.value)}
                        placeholder="தமிழில் கேள்வி..."
                        className="w-full px-2.5 py-1 text-xs border border-border rounded bg-background"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                className="btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
              >
                {editingQuestionId ? 'Update Question' : 'Add to Question Bank'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: ADD / EDIT CHART CASE */}
      {isChartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                {editingChartId ? 'Edit Kundali Case Study' : 'Add New Kundali Case Study'}
              </h3>
              <button 
                onClick={() => setIsChartModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Case Study Title *</label>
                <input
                  type="text"
                  value={cTitle}
                  onChange={e => setCTitle(e.target.value)}
                  placeholder="e.g. Blind Kundali Case Study #K-501 (Career Crisis & Business Delay)"
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Client Query & Problem Statement *</label>
                <textarea
                  rows={3}
                  value={cQuery}
                  onChange={e => setCQuery(e.target.value)}
                  placeholder="e.g. Severe career delays over past 8 months despite hard work. Will my business launch successfully and what remedies are needed?"
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Lagna & Lagna Lord</label>
                  <input
                    type="text"
                    value={cLagna}
                    onChange={e => setCLagna(e.target.value)}
                    placeholder="e.g. Scorpio Lagna - Mars in 10th Digbala"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Moon Sign & Dasha</label>
                  <input
                    type="text"
                    value={cDasha}
                    onChange={e => setCDasha(e.target.value)}
                    placeholder="e.g. Capricorn Moon, Saturn-Rahu Dasha"
                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Key Planetary Placements</label>
                <input
                  type="text"
                  value={cPlacements}
                  onChange={e => setCPlacements(e.target.value)}
                  placeholder="e.g. Mars in 10th (Leo), Sun in 11th (Virgo), Saturn in 12th"
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Expected Astrological Reasoning</label>
                <textarea
                  rows={2}
                  value={cObservations}
                  onChange={e => setCObservations(e.target.value)}
                  placeholder="e.g. Astrologer must recognize Mars Digbala and explain Saturn-Rahu friction timing..."
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Expected Sattvic Remedies</label>
                <input
                  type="text"
                  value={cRemedies}
                  onChange={e => setCRemedies(e.target.value)}
                  placeholder="e.g. Shani-Rahu pacification, Hanuman Chalisa, selfless service"
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsChartModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChartCase}
                className="btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
              >
                {editingChartId ? 'Update Case' : 'Add Case Study'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
