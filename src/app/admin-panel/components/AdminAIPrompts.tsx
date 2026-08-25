'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Bot,
  Save,
  RotateCcw,
  Play,
  Check,
  AlertCircle,
  Copy,
  Sliders,
  FileText,
  Search,
  Zap,
  Tag,
  Compass,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
  Loader2,
  ExternalLink,
  Code,
  Eye,
  PlusCircle,
} from 'lucide-react';
import {
  AIPromptItem,
  AIPromptSettingsData,
  DEFAULT_AI_PROMPTS,
  DEFAULT_GLOBAL_AI_CONFIG,
  GlobalAIConfig,
} from '@/lib/aiPromptSettings';

export default function AdminAIPrompts() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<'all' | 'services' | 'remedies' | 'panchang' | 'global'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('kundli-general');

  // Form state
  const [prompts, setPrompts] = useState<Record<string, AIPromptItem>>(DEFAULT_AI_PROMPTS);
  const [config, setConfig] = useState<GlobalAIConfig>(DEFAULT_GLOBAL_AI_CONFIG);
  const [lastSaved, setLastSaved] = useState<string | undefined>();

  // Test Playground state
  const [testInputs, setTestInputs] = useState<Record<string, string>>({
    name: 'Rohan Sharma',
    dob: '1994-08-15',
    time: '09:30 AM',
    place: 'Bengaluru, Karnataka, India',
    userQuery: 'When is the best timing for my new tech startup launch?',
    focus: 'Career Growth & Business Expansion',
  });
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-prompts');
      if (res.ok) {
        const data: AIPromptSettingsData = await res.json();
        if (data.prompts) setPrompts(data.prompts);
        if (data.config) setConfig(data.config);
        if (data.lastSaved) setLastSaved(data.lastSaved);
      }
    } catch (err) {
      console.error('Error loading AI prompts:', err);
      setErrorMessage('Failed to load prompts from server. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/ai-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          prompts,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save prompts');

      setSuccessMessage('AI Prompts & Custom Directives successfully updated in Firestore!');
      setLastSaved(new Date().toISOString());
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSelected = () => {
    if (!DEFAULT_AI_PROMPTS[selectedPromptId]) return;
    if (confirm(`Reset prompt "${prompts[selectedPromptId]?.title}" to its factory default?`)) {
      setPrompts((prev) => ({
        ...prev,
        [selectedPromptId]: {
          ...DEFAULT_AI_PROMPTS[selectedPromptId],
          isCustomized: false,
          lastUpdated: new Date().toISOString(),
        },
      }));
      setSuccessMessage(`Reset "${prompts[selectedPromptId]?.title}" to default.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset ALL prompts and global AI settings to factory defaults?')) {
      setPrompts(DEFAULT_AI_PROMPTS);
      setConfig(DEFAULT_GLOBAL_AI_CONFIG);
      setSuccessMessage('All prompts and settings reset to factory defaults. Click "Save Changes" to commit.');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const currentPrompt = prompts[selectedPromptId] || DEFAULT_AI_PROMPTS['kundli-general'];

  const filteredPromptList = useMemo(() => {
    return Object.values(prompts).filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [prompts, activeCategory, searchQuery]);

  const updateCurrentPrompt = (field: keyof AIPromptItem, value: any) => {
    setPrompts((prev) => ({
      ...prev,
      [selectedPromptId]: {
        ...prev[selectedPromptId],
        [field]: value,
        isCustomized: true,
        lastUpdated: new Date().toISOString(),
      },
    }));
  };

  const appendDirective = (text: string) => {
    const current = currentPrompt.extraDirectives || '';
    const updated = current ? `${current}\n${text}` : text;
    updateCurrentPrompt('extraDirectives', updated);
  };

  const insertVariable = (varName: string) => {
    const placeholder = `{${varName}}`;
    const current = currentPrompt.userPromptTemplate || '';
    updateCurrentPrompt('userPromptTemplate', `${current} ${placeholder}`);
  };

  const handleRunLiveTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const res = await fetch('/api/admin/test-ai-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: currentPrompt.systemPrompt,
          userPrompt: currentPrompt.userPromptTemplate,
          extraDirectives: currentPrompt.extraDirectives,
          model: config.defaultModel,
          temperature: config.temperature,
          sampleDetails: testInputs,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Test prompt execution failed');

      setTestResult(data);
    } catch (err: any) {
      console.error('Test execution error:', err);
      setTestError(err.message || 'Failed to execute test generation');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9952B]" />
        <p className="text-sm font-medium text-muted-foreground">Loading AI Prompt Engine & Directives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-[#2A1713] via-[#3D1F1A] to-[#20110E] border border-[#C9952B]/30 shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9952B]/20 border border-[#C9952B]/40 text-[#F3E5AB] text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-[#F3E5AB]" />
            OpenAI Engine Custom Prompt Manager
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            AI Prompts & Custom Output Directives
          </h2>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            Customize exact system prompts, dynamic templates, and additional output directives for all customer-facing
            Services, Remedies, and Panchang reports generated via OpenAI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200 border border-white/10 transition-all"
            title="Reset everything to factory defaults"
          >
            <RotateCcw size={14} /> Reset All
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save All Prompts'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Check size={18} className="text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs hover:underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs hover:underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-[#713B32] text-white shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All Modules ({Object.keys(prompts).length})
          </button>
          <button
            onClick={() => setActiveCategory('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'services'
                ? 'bg-[#713B32] text-white shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            ⭐ Services & Kundli
          </button>
          <button
            onClick={() => setActiveCategory('remedies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'remedies'
                ? 'bg-[#713B32] text-white shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            🌿 8 Vedic Remedies
          </button>
          <button
            onClick={() => setActiveCategory('panchang')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'panchang'
                ? 'bg-[#713B32] text-white shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            🗓️ Panchang & Muhurat
          </button>
          <button
            onClick={() => setActiveCategory('global')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'global'
                ? 'bg-[#713B32] text-white shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            ⚙️ Global Persona & Model
          </button>
        </div>

        {activeCategory !== 'global' && (
          <div className="relative min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompt modules..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:ring-2 focus:ring-[#C9952B] outline-none"
            />
          </div>
        )}
      </div>

      {/* Global AI Config View */}
      {activeCategory === 'global' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 lg:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="p-2.5 rounded-xl bg-[#C9952B]/10 text-[#C9952B]">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Global Master AI Persona</h3>
                  <p className="text-xs text-muted-foreground">
                    This core Vedic persona instruction is prepended to all OpenAI astrological calls across the platform.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Master System Persona Prompt
                </label>
                <textarea
                  rows={5}
                  value={config.systemPersona}
                  onChange={(e) => setConfig({ ...config, systemPersona: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-background border border-border text-xs text-foreground font-mono focus:ring-2 focus:ring-[#C9952B] outline-none leading-relaxed"
                  placeholder="Define the primary AI persona..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Global Extra Output Directives (Applied to all modules)</span>
                  <span className="text-[11px] text-[#C9952B] font-normal">e.g. Tone, formatting rules</span>
                </label>
                <textarea
                  rows={5}
                  value={config.globalExtraDirectives}
                  onChange={(e) => setConfig({ ...config, globalExtraDirectives: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-background border border-border text-xs text-foreground font-mono focus:ring-2 focus:ring-[#C9952B] outline-none leading-relaxed"
                  placeholder="Enter universal rules to append to all prompt requests..."
                />
              </div>
            </div>
          </div>

          {/* Model & Hyperparameters Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Sliders size={18} className="text-[#C9952B]" /> Model & Parameters
              </div>

              {/* Model Choice */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">OpenAI Model Engine</label>
                <select
                  value={config.defaultModel}
                  onChange={(e) => setConfig({ ...config, defaultModel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-[#C9952B]"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Recommended · Ultra Fast & Accurate)</option>
                  <option value="gpt-4o">gpt-4o (Most Powerful & Comprehensive)</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy Standard)</option>
                  <option value="o1-mini">o1-mini (Deep Reasoning)</option>
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Default: <code className="text-[#C9952B]">gpt-4o-mini</code> provides the ideal balance of deep Vedic depth and sub-second generation.
                </p>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Creativity / Temperature</span>
                  <span className="font-mono font-bold text-[#C9952B]">{config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-[#C9952B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0.1 (Strict & Precise)</span>
                  <span>0.7 (Vedic Blend)</span>
                  <span>1.0 (Creative)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Max Output Tokens</span>
                  <span className="font-mono font-bold text-[#C9952B]">{config.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3500"
                  step="100"
                  value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-[#C9952B] cursor-pointer"
                />
              </div>

              {lastSaved && (
                <div className="pt-2 text-[11px] text-muted-foreground">
                  Last Saved: {new Date(lastSaved).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Prompt Modules 2-Column Split View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Prompt Modules List */}
          <div className="lg:col-span-4 space-y-3 max-h-[820px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredPromptList.map((item) => {
              const isSelected = selectedPromptId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPromptId(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-[#713B32]/10 border-[#C9952B] shadow-md ring-1 ring-[#C9952B]'
                      : 'bg-card border-border hover:border-[#C9952B]/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isCustomized ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground/50'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{item.title}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    {item.isCustomized && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-border/50">
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {item.category.toUpperCase()}
                    </span>
                    {item.tags?.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Prompt Editor & Test Playground */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 lg:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
              {/* Module Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#C9952B] uppercase tracking-wider">
                      Module ID: {currentPrompt.id}
                    </span>
                    {currentPrompt.isCustomized && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        Active Custom Directives
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-foreground mt-0.5">{currentPrompt.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentPrompt.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    <RotateCcw size={13} /> Reset Module
                  </button>
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} className="text-[#C9952B]" /> System Role Prompt
                </label>
                <textarea
                  rows={4}
                  value={currentPrompt.systemPrompt}
                  onChange={(e) => updateCurrentPrompt('systemPrompt', e.target.value)}
                  className="w-full p-4 rounded-2xl bg-background border border-border text-xs text-foreground font-mono focus:ring-2 focus:ring-[#C9952B] outline-none leading-relaxed"
                  placeholder="Enter the AI System role instruction..."
                />
              </div>

              {/* User Prompt Template with Variable Insert Chips */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Code size={14} className="text-[#C9952B]" /> User Prompt Template & Output JSON Schema
                  </label>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-muted-foreground mr-1">Insert Variable:</span>
                    {['name', 'dob', 'time', 'place', 'gender', 'userQuery', 'currentDate'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="px-2 py-0.5 rounded-md bg-[#C9952B]/10 hover:bg-[#C9952B]/20 text-[10px] font-mono text-[#C9952B] border border-[#C9952B]/30 transition-all"
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={9}
                  value={currentPrompt.userPromptTemplate}
                  onChange={(e) => updateCurrentPrompt('userPromptTemplate', e.target.value)}
                  className="w-full p-4 rounded-2xl bg-background border border-border text-xs text-foreground font-mono focus:ring-2 focus:ring-[#C9952B] outline-none leading-relaxed"
                  placeholder="Enter user prompt template and output structure..."
                />
              </div>

              {/* Extra Output Additions & Directives (Admin Custom Box) */}
              <div className="p-5 rounded-2xl bg-[#713B32]/10 border border-[#C9952B]/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#C9952B]" />
                    <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                      ✨ Extra Output Directives & Custom Additions (Admin Defined)
                    </label>
                  </div>
                  <span className="text-[11px] text-[#C9952B] font-medium">
                    Injected into customer generation calls
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Type any extra instructions or specific sections you want OpenAI to compute and return for this report
                  (e.g., specific mantra procedures, lucky colors, planetary dasha timings, or family harmony advice).
                </p>

                <textarea
                  rows={3}
                  value={currentPrompt.extraDirectives || ''}
                  onChange={(e) => updateCurrentPrompt('extraDirectives', e.target.value)}
                  placeholder="e.g. Always include 3 specific gemstone mantras, lucky color and number, and practical modern lifestyle recommendations."
                  className="w-full p-3.5 rounded-xl bg-background border border-border text-xs text-foreground font-mono focus:ring-2 focus:ring-[#C9952B] outline-none leading-relaxed"
                />

                {/* Quick Directive Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-muted-foreground self-center mr-1">Quick Add:</span>
                  <button
                    type="button"
                    onClick={() => appendDirective('• Include a luckyAttributes object with luckyColor, luckyNumber, and favorableDay.')}
                    className="px-2.5 py-1 rounded-lg bg-card border border-border hover:border-[#C9952B] text-[10px] text-foreground transition-all"
                  >
                    + Lucky Colors & Numbers
                  </button>
                  <button
                    type="button"
                    onClick={() => appendDirective('• Include a dailyBlessingShloka in Sanskrit with English translation.')}
                    className="px-2.5 py-1 rounded-lg bg-card border border-border hover:border-[#C9952B] text-[10px] text-foreground transition-all"
                  >
                    + Daily Sanskrit Shloka
                  </button>
                  <button
                    type="button"
                    onClick={() => appendDirective('• Provide 3 actionable modern lifestyle habits to harmonize planetary energies.')}
                    className="px-2.5 py-1 rounded-lg bg-card border border-border hover:border-[#C9952B] text-[10px] text-foreground transition-all"
                  >
                    + 3 Modern Lifestyle Habits
                  </button>
                  <button
                    type="button"
                    onClick={() => appendDirective('• Prescribe strict non-demolition remedial solutions.')}
                    className="px-2.5 py-1 rounded-lg bg-card border border-border hover:border-[#C9952B] text-[10px] text-foreground transition-all"
                  >
                    + Non-Demolition Remedials
                  </button>
                </div>
              </div>
            </div>

            {/* Live Test & Preview Playground Card */}
            <div className="p-6 lg:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-[#C9952B]">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Live Test & Real-time AI Generation</h3>
                    <p className="text-xs text-muted-foreground">
                      Test this prompt module immediately with OpenAI to see exact JSON output and customer preview.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunLiveTest}
                  disabled={testing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#713B32] hover:bg-[#85453B] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {testing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="fill-white" />}
                  {testing ? 'Generating with OpenAI...' : 'Run Live Test'}
                </button>
              </div>

              {/* Sample Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Sample Name</label>
                  <input
                    type="text"
                    value={testInputs.name}
                    onChange={(e) => setTestInputs({ ...testInputs, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Sample DOB & Time</label>
                  <input
                    type="text"
                    value={`${testInputs.dob} | ${testInputs.time}`}
                    onChange={(e) => {
                      const [d, t] = e.target.value.split('|').map((s) => s.trim());
                      setTestInputs({ ...testInputs, dob: d || '', time: t || '' });
                    }}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Sample Place</label>
                  <input
                    type="text"
                    value={testInputs.place}
                    onChange={(e) => setTestInputs({ ...testInputs, place: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                  />
                </div>
              </div>

              {/* Live Test Results Output */}
              {testError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{testError}</span>
                </div>
              )}

              {testResult && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check size={15} /> Generation Succeeded ({testResult.modelUsed})
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      Prompt Tokens: {testResult.usage?.prompt_tokens} · Completion: {testResult.usage?.completion_tokens}
                    </span>
                  </div>

                  {/* Rendered Customer-Facing Preview */}
                  {testResult.parsedContent && (
                    <div className="p-5 rounded-2xl bg-[#EDE4D5]/30 dark:bg-amber-950/20 border border-[#E5D9C8] dark:border-amber-500/30 space-y-4 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <span className="text-[10px] uppercase font-bold text-[#C9952B]">
                          Customer Report Preview
                        </span>
                        <span className="text-[10px] text-muted-foreground">Vedic Synthesis</span>
                      </div>

                      {testResult.parsedContent.astrologicalAnalysis && (
                        <div className="space-y-1">
                          <span className="font-bold text-foreground">Astrological Synthesis:</span>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {testResult.parsedContent.astrologicalAnalysis}
                          </p>
                        </div>
                      )}

                      {testResult.parsedContent.procedure && (
                        <div className="space-y-1">
                          <span className="font-bold text-foreground">Remedial Procedure:</span>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {testResult.parsedContent.procedure}
                          </p>
                        </div>
                      )}

                      {testResult.parsedContent.additionalGuidance && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                          <span className="font-bold text-[#C9952B]">Admin Custom Output Guidance:</span>
                          <p className="text-foreground/90 leading-relaxed">
                            {testResult.parsedContent.additionalGuidance}
                          </p>
                        </div>
                      )}

                      {testResult.parsedContent.luckyAttributes && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {Object.entries(testResult.parsedContent.luckyAttributes).map(([k, v]) => (
                            <div key={k} className="p-2 rounded-lg bg-card border border-border text-center">
                              <span className="text-[9px] uppercase text-muted-foreground font-bold">{k}</span>
                              <p className="text-[11px] font-bold text-[#C9952B] mt-0.5">{String(v)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw JSON View */}
                  <details className="group">
                    <summary className="text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
                      <Code size={13} /> View Raw JSON Response
                    </summary>
                    <pre className="mt-2 p-4 rounded-xl bg-background border border-border text-[11px] text-foreground font-mono overflow-x-auto max-h-60 custom-scrollbar">
                      {JSON.stringify(testResult.parsedContent, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
