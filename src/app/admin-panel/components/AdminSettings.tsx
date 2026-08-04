'use client';
import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings, GlobalSettings } from '@/lib/settings';
import { Save, Loader2, Sparkles, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

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
            <h3 className="text-lg font-bold text-foreground">Stripe Integration Keys</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Publishable Key</label>
              <input
                type="text"
                value={settings.stripePublishableKey}
                onChange={(e) =>
                  setSettings({ ...settings, stripePublishableKey: e.target.value })
                }
                placeholder="pk_live_..."
                autoComplete="off"
                spellCheck="false"
                data-lpignore="true"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Used on the frontend for rendering elements if needed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Secret Key</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={settings.stripeSecretKey}
                  onChange={(e) =>
                    setSettings({ ...settings, stripeSecretKey: e.target.value })
                  }
                  placeholder="sk_live_..."
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
              <p className="text-xs text-muted-foreground">Keep this secure. Used by the backend to create checkout sessions.</p>
            </div>
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
