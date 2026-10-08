'use client';
import React, { useEffect, useState } from 'react';
import {
  getSettings,
  updateSettings,
  GlobalSettings,
  AISessionPackage,
  DEFAULT_AI_SESSION_PACKAGES,
} from '@/lib/settings';
import {
  Save,
  Loader2,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  ChevronRight,
  Gift,
  PhoneCall,
  MessageSquare,
  Clock,
  Plus,
  Trash2,
  IndianRupee,
  Tag,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  FileText,
  Users,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'pricing' | 'keys'>('pricing');
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [testingVedika, setTestingVedika] = useState(false);
  const [vedikaStatus, setVedikaStatus] = useState<'idle' | 'ok' | 'fail'>('idle');

  const testVedikaConnection = async () => {
    setTestingVedika(true);
    setVedikaStatus('idle');
    try {
      const res = await fetch('/api/settings/test-vedika', { method: 'POST' });
      const json = await res.json();
      if (json.connected) {
        setVedikaStatus('ok');
        toast.success('Vedika AI connected successfully!');
      } else {
        setVedikaStatus('fail');
        toast.error(`Vedika connection failed: ${json.message}`);
      }
    } catch {
      setVedikaStatus('fail');
      toast.error('Could not reach Vedika API. Check key and try again.');
    } finally {
      setTestingVedika(false);
    }
  };

  useEffect(() => {
    async function fetchSettings() {
      const data = await getSettings();
      // Ensure defaults if missing in existing database record
      setSettings({
        ...data,
        newUserTrialMinutes: data.newUserTrialMinutes ?? 5,
        aiChatPricePerMinute: data.aiChatPricePerMinute ?? data.aiChatPricePerPrompt ?? 5,
        aiChatPricePerPrompt: data.aiChatPricePerPrompt ?? data.aiChatPricePerMinute ?? 5,
        aiVoicePricePerMinute: data.aiVoicePricePerMinute ?? 7,
        aiSessionPackages:
          data.aiSessionPackages && data.aiSessionPackages.length > 0
            ? data.aiSessionPackages
            : DEFAULT_AI_SESSION_PACKAGES,
        humanAstrologerMinRate: data.humanAstrologerMinRate ?? 15,
        humanAstrologerMaxRate: data.humanAstrologerMaxRate ?? 100,
        humanAstrologerDefaultRate: data.humanAstrologerDefaultRate ?? 25,
        pariharaPlanPrice: data.pariharaPlanPrice ?? 499,
        pariharaPlanTitle: data.pariharaPlanTitle || 'Generate My Complete Parihara Plan',
        pariharaPlanDescription:
          data.pariharaPlanDescription ||
          'Comprehensive 8-fold Vedic remedial blueprint with personalized Mantras, Yantras, Homas, Gemstones, Rudraksha, Vastu and Temple remedies based on your Janam Kundli.',
        pariharaPlanEnabled: data.pariharaPlanEnabled !== false,
      });
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Dynamic pricing & platform settings saved successfully!');
    } catch (error) {
      toast.error('Failed to update settings. Please check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToStandardPlan = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      newUserTrialMinutes: 5,
      aiChatPricePerMinute: 5,
      aiChatPricePerPrompt: 5,
      aiVoicePricePerMinute: 7,
      aiSessionPackages: DEFAULT_AI_SESSION_PACKAGES,
      humanAstrologerMinRate: 15,
      humanAstrologerMaxRate: 100,
      humanAstrologerDefaultRate: 25,
      pariharaPlanPrice: 499,
      pariharaPlanTitle: 'Generate My Complete Parihara Plan',
      pariharaPlanDescription:
        'Comprehensive 8-fold Vedic remedial blueprint with personalized Mantras, Yantras, Homas, Gemstones, Rudraksha, Vastu and Temple remedies based on your Janam Kundli.',
      pariharaPlanEnabled: true,
    });
    toast.info('Restored preset plan values (New-user 5m free, Chat ₹5, Voice ₹7, Sessions ₹69/₹129/₹249, Parihara Plan ₹499). Click Save to apply.');
  };

  const updatePackage = (index: number, patch: Partial<AISessionPackage>) => {
    if (!settings) return;
    const pkgs = [...(settings.aiSessionPackages || DEFAULT_AI_SESSION_PACKAGES)];
    pkgs[index] = { ...pkgs[index], ...patch };
    setSettings({ ...settings, aiSessionPackages: pkgs });
  };

  const addPackage = () => {
    if (!settings) return;
    const pkgs = [...(settings.aiSessionPackages || DEFAULT_AI_SESSION_PACKAGES)];
    const newMin = 45;
    pkgs.push({
      id: `session-${Date.now()}`,
      minutes: newMin,
      price: 199,
      label: `${newMin}-minute AI session`,
      description: 'Custom duration AI consultation package',
      popular: false,
      enabled: true,
    });
    setSettings({ ...settings, aiSessionPackages: pkgs });
  };

  const removePackage = (index: number) => {
    if (!settings) return;
    const pkgs = [...(settings.aiSessionPackages || DEFAULT_AI_SESSION_PACKAGES)];
    pkgs.splice(index, 1);
    setSettings({ ...settings, aiSessionPackages: pkgs });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="text-accent" /> Platform Settings & Dynamic Pricing
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Dynamically configure consultation prices, free trials, session packages, and API integrations in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'pricing' && (
            <button
              type="button"
              onClick={handleResetToStandardPlan}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all border border-border"
              title="Reset to specified pricing preset"
            >
              <RotateCcw size={14} /> Preset Plan
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all -mb-px ${
            activeTab === 'pricing'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <IndianRupee size={16} />
          <span>Pricing & Consultation Plans</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent/15 text-accent font-bold">
            Live Dynamic
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('keys')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all -mb-px ${
            activeTab === 'keys'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key size={16} />
          <span>API Keys & Integrations</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PRICING & CONSULTATION PLANS                      */}
      {/* ========================================================= */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card border border-border rounded-2xl p-4">
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
              <span className="text-[11px] font-medium text-muted-foreground block">New-User Trial</span>
              <span className="text-lg font-bold text-foreground">
                {settings.newUserTrialMinutes ?? 5} Mins <span className="text-xs text-green-500 font-semibold">FREE</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
              <span className="text-[11px] font-medium text-muted-foreground block">AI Chat & Voice</span>
              <span className="text-lg font-bold text-foreground">
                ₹{settings.aiChatPricePerMinute ?? 5} <span className="text-xs font-normal text-muted-foreground">/min</span> · ₹{settings.aiVoicePricePerMinute ?? 7} <span className="text-xs font-normal text-muted-foreground">/min</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
              <span className="text-[11px] font-medium text-muted-foreground block">AI Session Bundles</span>
              <span className="text-lg font-bold text-foreground">
                ₹69 <span className="text-xs font-normal text-muted-foreground">/15m</span> · ₹129 <span className="text-xs font-normal text-muted-foreground">/30m</span>
              </span>
            </div>
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
              <span className="text-[11px] font-medium text-muted-foreground block">Complete Parihara Plan</span>
              <span className="text-lg font-bold text-accent">
                ₹{settings.pariharaPlanPrice ?? 499}
              </span>
            </div>
          </div>

          {/* Section 1: New-User Trial & Free Minutes */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">New-User Trial (Complimentary Access)</h3>
                  <p className="text-xs text-muted-foreground">
                    Provide first-time registered devotees with complimentary minutes before wallet deduction kicks in.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-500 border border-green-500/30">
                Active Promotion
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Free Trial Duration (Minutes)</label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={settings.newUserTrialMinutes ?? 5}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        newUserTrialMinutes: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent font-bold text-sm"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    minutes FREE
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Default: <strong>5 minutes FREE</strong>. Set to 0 to disable new user trial completely.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-green-500" /> Trial Execution Rule:
                </p>
                <p className="text-muted-foreground">
                  New users can start an AI consultation with zero wallet balance for the first{' '}
                  <strong className="text-foreground">{settings.newUserTrialMinutes ?? 5} minutes</strong>. Billing starts at standard rate only on minute {(settings.newUserTrialMinutes ?? 5) + 1}.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: AI Astrologer Per-Minute Realtime Rates */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                <PhoneCall size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">AI Astrologer Per-Minute Rates (Live Chat & Voice)</h3>
                <p className="text-xs text-muted-foreground">
                  Base per-minute rates deducted from the user's wallet during AI conversations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* AI Chat Rate */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-accent" />
                    <label className="text-sm font-bold text-foreground">AI Astrologer — Chat</label>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent font-mono font-semibold">
                    ₹{settings.aiChatPricePerMinute ?? 5}/min
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cost per minute (or prompt) for text chatting with Acharya Parihar.
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-accent">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.aiChatPricePerMinute ?? 5}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setSettings({
                        ...settings,
                        aiChatPricePerMinute: val,
                        aiChatPricePerPrompt: val,
                      });
                    }}
                    className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-background border border-border text-foreground font-bold text-sm focus:ring-2 focus:ring-accent"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    / minute
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  Specified standard: <strong>₹5/min</strong>.
                </span>
              </div>

              {/* AI Voice Call Rate */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneCall size={16} className="text-amber-500" />
                    <label className="text-sm font-bold text-foreground">AI Astrologer — Voice</label>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono font-semibold">
                    ₹{settings.aiVoicePricePerMinute ?? 7}/min
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Per-minute live voice call fee for 1-on-1 audio consultation with AI Astrologers.
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.aiVoicePricePerMinute ?? 7}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        aiVoicePricePerMinute: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-background border border-border text-foreground font-bold text-sm focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    / minute
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  Specified standard: <strong>₹7/min</strong>.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Fixed AI Session Packages (15m, 30m, 60m) */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">AI Consultation Session Packages</h3>
                  <p className="text-xs text-muted-foreground">
                    Pre-packaged minute blocks offering customers discounted bulk consultation rates.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addPackage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all self-start sm:self-auto"
              >
                <Plus size={14} /> Add Package
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(settings.aiSessionPackages || DEFAULT_AI_SESSION_PACKAGES).map((pkg, idx) => {
                const perMin = Math.round((pkg.price / (pkg.minutes || 1)) * 10) / 10;
                const standardVoiceCost = (pkg.minutes || 15) * (settings.aiVoicePricePerMinute ?? 7);
                const savingsPct =
                  standardVoiceCost > pkg.price
                    ? Math.round(((standardVoiceCost - pkg.price) / standardVoiceCost) * 100)
                    : 0;

                return (
                  <div
                    key={pkg.id || idx}
                    className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      pkg.popular
                        ? 'border-accent bg-accent/5 shadow-sm'
                        : 'border-border bg-card hover:border-border/80'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground shadow-sm">
                        MOST POPULAR
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                          Package #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updatePackage(idx, { popular: !pkg.popular })}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                              pkg.popular ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                            title="Toggle popular highlight tag"
                          >
                            Tag Popular
                          </button>
                          {(settings.aiSessionPackages || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePackage(idx)}
                              className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
                              title="Delete package"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Package Label */}
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Package Title</label>
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={(e) => updatePackage(idx, { label: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-foreground font-semibold text-xs"
                          placeholder="e.g. 15-minute AI session"
                        />
                      </div>

                      {/* Duration & Price Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">Duration</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={pkg.minutes}
                              onChange={(e) =>
                                updatePackage(idx, { minutes: Math.max(1, Number(e.target.value) || 1) })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground font-bold text-xs"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                              mins
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">Price (₹)</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-accent">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={pkg.price}
                              onChange={(e) =>
                                updatePackage(idx, { price: Math.max(0, Number(e.target.value) || 0) })
                              }
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-background border border-border text-foreground font-bold text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={pkg.description || ''}
                          onChange={(e) => updatePackage(idx, { description: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs resize-none"
                          placeholder="Short description for customer..."
                        />
                      </div>
                    </div>

                    {/* Cost Breakdown & Savings Badge */}
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        Effective rate: <strong className="text-foreground">₹{perMin}/min</strong>
                      </span>
                      {savingsPct > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-bold">
                          Save {savingsPct}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Standard</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Human Astrologer Consultation Rates */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Human Astrologer Rate Range & Policy</h3>
                <p className="text-xs text-muted-foreground">
                  Global rate bounds for verified human astrologers on the platform. Individual astrologers can set their personal per-minute fee within this range.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                <label className="text-xs font-semibold text-foreground">Minimum Allowed Rate</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={settings.humanAstrologerMinRate ?? 15}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        humanAstrologerMinRate: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-full pl-8 pr-12 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/min</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Floor rate: <strong>₹15/min</strong></p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                <label className="text-xs font-semibold text-foreground">Maximum Standard Rate</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-500">₹</span>
                  <input
                    type="number"
                    min="10"
                    value={settings.humanAstrologerMaxRate ?? 100}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        humanAstrologerMaxRate: Math.max(10, Number(e.target.value) || 10),
                      })
                    }
                    className="w-full pl-8 pr-12 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/min</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Specified standard: <strong>₹100+/min</strong></p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                <label className="text-xs font-semibold text-foreground">Default Rate (New Astrologers)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={settings.humanAstrologerDefaultRate ?? 25}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        humanAstrologerDefaultRate: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-full pl-8 pr-12 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/min</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Assigned on astrologer approval</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                Specified range: <strong className="text-foreground">₹15 – ₹100+/min, astrologer-dependent</strong>. Verified astrologers can customize their rate from their profile dashboard.
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                Astrologer Dependent
              </span>
            </div>
          </div>

          {/* Section 5: “Generate My Complete Parihara Plan — ₹499” */}
          <div className="bg-card border-2 border-accent/40 rounded-2xl p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] rounded-xl shadow-md">
                  <Flame size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      “Generate My Complete Parihara Plan”
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/20 text-accent">
                      Flagship Service
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Flagship 8-fold Vedic remedial blueprint generated directly from the devotee&apos;s birth chart.
                  </p>
                </div>
              </div>

              {/* Price Tag */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <label className="text-xs font-semibold text-muted-foreground">Plan Status:</label>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      pariharaPlanEnabled: !settings.pariharaPlanEnabled,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    settings.pariharaPlanEnabled !== false
                      ? 'bg-green-500/15 text-green-500 border border-green-500/30'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {settings.pariharaPlanEnabled !== false ? '● ACTIVE & AVAILABLE' : '○ DISABLED'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dynamic Price */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>Parihara Plan Price (₹ INR)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-accent">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.pariharaPlanPrice ?? 499}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pariharaPlanPrice: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-background border-2 border-accent/30 text-foreground font-black text-xl focus:border-accent outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Specified standard: <strong className="text-foreground">₹499</strong>. Deducted directly from user wallet or Razorpay gateway.
                </p>
              </div>

              {/* Title & Description */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Display Title</label>
                  <input
                    type="text"
                    value={settings.pariharaPlanTitle || 'Generate My Complete Parihara Plan'}
                    onChange={(e) => setSettings({ ...settings, pariharaPlanTitle: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Plan Overview & Inclusions Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.pariharaPlanDescription || ''}
                    onChange={(e) => setSettings({ ...settings, pariharaPlanDescription: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Inclusions summary preview */}
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
              <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2">
                What Devotees Receive in this ₹{settings.pariharaPlanPrice ?? 499} Blueprint:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">✓ 1. Mantra Shakti (Japa)</span>
                <span className="flex items-center gap-1.5">✓ 2. Yantra Sthapana</span>
                <span className="flex items-center gap-1.5">✓ 3. Homa / Fire Rituals</span>
                <span className="flex items-center gap-1.5">✓ 4. Ishta Devata Grace</span>
                <span className="flex items-center gap-1.5">✓ 5. Certified Gemstones</span>
                <span className="flex items-center gap-1.5">✓ 6. Mukhi Rudraksha</span>
                <span className="flex items-center gap-1.5">✓ 7. Directional Vastu</span>
                <span className="flex items-center gap-1.5">✓ 8. Dāna & 48-Day Sankalpa</span>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex justify-end pt-2 pb-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] font-black rounded-xl hover:shadow-lg hover:shadow-accent/25 transition-all disabled:opacity-50 text-sm"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving Platform Pricing...' : 'Save & Publish All Pricing Changes'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: API KEYS & INTEGRATIONS                           */}
      {/* ========================================================= */}
      {activeTab === 'keys' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Razorpay Payment Integration Keys */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Key size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Razorpay Payment Integration Keys</h3>
                <p className="text-xs text-muted-foreground">
                  Dynamic Razorpay credentials for wallet recharges & service purchases.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.razorpayKeyId || ''}
                  onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                  placeholder="e.g. rzp_test_... or rzp_live_..."
                  autoComplete="off"
                  spellCheck="false"
                  data-lpignore="true"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Public Key ID obtained from your Razorpay Dashboard API Keys section.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Razorpay Key Secret</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={settings.razorpayKeySecret || ''}
                    onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })}
                    placeholder="e.g. Secret Key"
                    autoComplete="new-password"
                    spellCheck="false"
                    data-lpignore="true"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this secure. Used by backend to verify Razorpay HMAC signatures.
                </p>
              </div>
            </div>
          </div>

          {/* ZegoCloud Call Integration Keys */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Key size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">ZegoCloud Call Keys</h3>
                <p className="text-xs text-muted-foreground">
                  Required for 1-on-1 audio and video calls between customers & astrologers.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ZegoCloud App ID</label>
                <input
                  type="text"
                  value={settings.zegoAppId || ''}
                  onChange={(e) => setSettings({ ...settings, zegoAppId: e.target.value })}
                  placeholder="e.g. 123456789"
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Obtained from your ZegoCloud Admin Console project dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ZegoCloud Server Secret</label>
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.zegoServerSecret || ''}
                  onChange={(e) => setSettings({ ...settings, zegoServerSecret: e.target.value })}
                  placeholder="e.g. 4a5b6c7d..."
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Secret key used to generate room tokens.
                </p>
              </div>
            </div>
          </div>

          {/* AI Engine Configuration — Vedika (Primary) + OpenAI (Fallback) */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Sparkles size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">AI Astrology Engine Keys</h3>
                <p className="text-xs text-muted-foreground">
                  Vedika AI is the <strong>primary</strong> engine. OpenAI is the automatic
                  <strong> fallback</strong> when Vedika is down or usage limit is reached.
                </p>
              </div>
            </div>

            {/* Fallback priority indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-2.5">
              <span className="font-semibold text-accent">Primary:</span>
              <span>Vedika AI (vedika.io)</span>
              <ChevronRight size={14} className="mx-1 opacity-50" />
              <span className="font-semibold text-blue-400">Fallback:</span>
              <span>OpenAI (gpt-4o-mini)</span>
            </div>

            {/* Vedika API Key */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] rounded font-bold">PRIMARY</span>
                Vedika AI API Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.vedikaApiKey || ''}
                  onChange={(e) => setSettings({ ...settings, vedikaApiKey: e.target.value })}
                  placeholder="vk_live_..."
                  autoComplete="new-password"
                  spellCheck={false}
                  data-lpignore="true"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={testVedikaConnection}
                  disabled={testingVedika}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
                >
                  {testingVedika ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : vedikaStatus === 'ok' ? (
                    <Wifi size={14} />
                  ) : vedikaStatus === 'fail' ? (
                    <WifiOff size={14} />
                  ) : (
                    <Wifi size={14} />
                  )}
                  {testingVedika ? 'Testing...' : 'Test Connection'}
                </button>
                {vedikaStatus === 'ok' && (
                  <span className="text-xs text-green-500 font-semibold">✓ Connected</span>
                )}
                {vedikaStatus === 'fail' && (
                  <span className="text-xs text-red-400 font-semibold">✗ Failed — OpenAI fallback will be used</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Obtain from your <span className="font-mono">vedika.io</span> dashboard. Powers live ephemeris, birth charts, panchang, dasha, doshas, and kundli matching.
              </p>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded font-bold">FALLBACK</span>
                OpenAI API Key (sk-...)
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.openaiApiKey || ''}
                  onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  placeholder="sk-proj-..."
                  autoComplete="new-password"
                  spellCheck={false}
                  data-lpignore="true"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically used when Vedika AI is unavailable (server down, timeout, usage limit). Obtain from <span className="font-mono">platform.openai.com/api-keys</span>.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 pb-6">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] font-bold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Keys'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
