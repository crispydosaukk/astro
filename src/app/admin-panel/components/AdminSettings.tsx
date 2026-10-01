'use client';
import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings, GlobalSettings } from '@/lib/settings';
import { Save, Loader2, Sparkles, Key, Eye, EyeOff, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
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
      setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="text-accent" /> Platform Settings
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage global configuration, API keys, and sensitive data.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Key size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Razorpay Payment Integration Keys
              </h3>
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
                <strong> fallback</strong> when Vedika is down or the usage limit is reached.
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

          {/* AI Chat Price */}
          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <span>AI Chat Price Per Prompt (₹ INR)</span>
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-accent">₹</span>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.aiChatPricePerPrompt ?? 5}
                onChange={(e) =>
                  setSettings({ ...settings, aiChatPricePerPrompt: Math.max(0, Number(e.target.value) || 0) })
                }
                placeholder="5"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-bold text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Amount deducted from user's wallet per AI chat prompt. Set to 0 for free access.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] font-bold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
