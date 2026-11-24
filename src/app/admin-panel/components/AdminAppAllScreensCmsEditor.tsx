'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Code2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  AppScreensCmsConfig,
  AppScreensCmsSectionKey,
  DEFAULT_APP_SCREENS_CMS,
  mergeAppScreensCms,
} from '@/lib/appScreensCmsConfig';
import {
  DEFAULT_REMEDIES_CATALOG,
  mergeRemediesCatalog,
  RemediesCatalogData,
} from '@/lib/remediesCatalogDefaults';

type EditorTargetKey = AppScreensCmsSectionKey | 'remediesCatalog';

interface SectionMeta {
  key: EditorTargetKey;
  label: string;
  group: string;
  description: string;
}

const SECTION_META: SectionMeta[] = [
  // Launch, Nav & Auth
  { key: 'navigation', label: 'Bottom Tab Bar (5 Tabs)', group: 'Launch & Navigation', description: 'Bottom tab labels & Material icon names across the app.' },
  { key: 'splash', label: 'Splash Screen', group: 'Launch & Navigation', description: 'Wheel/emblem/logo URLs, splash duration & optional tagline.' },
  { key: 'onboarding', label: 'Onboarding Buttons & Links', group: 'Launch & Navigation', description: 'Continue, Get Started, and Sign In footer link text.' },
  { key: 'signIn', label: 'Customer Sign In & OTP', group: 'Launch & Navigation', description: 'Phone/OTP headings, buttons, guest mode, astrologer links, country codes & toasts.' },
  { key: 'birthProfileSetup', label: 'Birth Profile Setup (3 Steps)', group: 'Launch & Navigation', description: 'Profile types, gender options, placeholders, tips & validation alerts.' },

  // Home & Discovery
  { key: 'home', label: 'Home Dashboard (Full)', group: 'Home & Discovery', description: 'Greetings, Language Modal, Quick Actions, Horoscope card, AI Prompt, Recommended cards, Carousels & Sticky CTAs.' },
  { key: 'services', label: 'Services Screen Chrome', group: 'Home & Discovery', description: 'Services header, heading, subtitle, search placeholder & empty states.' },
  { key: 'liveAstrologers', label: 'Live & AI Astrologers Directory', group: 'Home & Discovery', description: 'Headers, tabs, all 20 category filter chips, card CTAs & Filter Sheet options.' },
  { key: 'astrologerDetail', label: 'Astrologer Profile Detail', group: 'Home & Discovery', description: 'Tabs, badges, stats labels, availability labels, rates & booking/recharge bottom sheet.' },

  // Astrology Tools & Remedies
  { key: 'horoscope', label: 'Daily Horoscope (12 Signs)', group: 'Astrology Tools', description: 'Zodiacs list, date tabs, category labels, lucky labels & Ask AI CTAs.' },
  { key: 'panchang', label: 'Panchang & Calendar', group: 'Astrology Tools', description: 'Vikram Samvat prefix/override, section headings, card labels, badges & buttons.' },
  { key: 'myKundli', label: 'My Kundli (All 14 Sections)', group: 'Astrology Tools', description: 'Section titles, birth labels, transits, dosha descriptions, planet & house interpretations, generic predictions.' },
  { key: 'matchKundli', label: 'Match Kundli (36-Guna)', group: 'Astrology Tools', description: 'Form labels, partner cards, verdicts, Guna Milan headings & report CTAs.' },
  { key: 'remedies', label: 'Remedies & Detail UI Copy', group: 'Astrology Tools', description: 'Ashta-Digbandhana headings, wheel hints, principle cards & Remedy Detail section headings.' },
  { key: 'remediesCatalog', label: 'Remedies Full Catalog (8 Directions)', group: 'Astrology Tools', description: 'All 8 remedy profiles (whyHelp/benefits/howItWorks), Yantras, Deities, Gemstones, Rudrakshas, Charities, Mantras & Homams.' },

  // AI Chat & Live Consultations
  { key: 'aiChat', label: 'AI Chat (All 6 Languages)', group: 'AI & Consultations', description: 'AI models, languages, quick prompts, welcome templates, placeholders, structured card labels & clarifications.' },
  { key: 'consultation', label: 'Live Voice / Video Call Room', group: 'AI & Consultations', description: 'Connecting status, call tabs, controls, end-call/low-balance modals & review modal.' },

  // Account, Reports & Wallet
  { key: 'wallet', label: 'Wallet, Payments & Coupons', group: 'Account & Wallet', description: 'Currency pills, stats, INR/USD payment methods, coupon card (code/bonus/toggle) & checkout sheet.' },
  { key: 'birthProfiles', label: 'Family Birth Profiles', group: 'Account & Wallet', description: 'Info banner, popular cities, card labels, menu options & Add/Edit profile sheet.' },
  { key: 'kundliReports', label: 'Reports & Mahadasha Vault', group: 'Account & Wallet', description: 'Tabs, empty states, purchase confirmation dialog, report viewer & chapter reader chrome.' },
  { key: 'matchReports', label: 'Saved Match Reports', group: 'Account & Wallet', description: 'Headers, sign-in gate, empty states, status badges & Guna Milan modal copy.' },
  { key: 'savedAstrologers', label: 'Saved Astrologers', group: 'Account & Wallet', description: 'Headers, chips, empty state, recommended heading & Chat/Call buttons.' },
  { key: 'consultationHistory', label: 'Consultation History', group: 'Account & Wallet', description: 'Tabs, summary labels, analytics titles, empty states & report modal labels.' },

  // Astrologer Partner Portal
  { key: 'astrologerLogin', label: 'Astrologer Portal Login', group: 'Astrologer Portal', description: 'Login steps, OTP text, all 4 status banners (Not Found/Pending/Rejected/Suspended) & welcome dialog.' },
  { key: 'astrologerApply', label: 'Astrologer 5-Step Apply', group: 'Astrologer Portal', description: 'Phone codes, strongest areas, specialisations, languages, doc categories & proctor copy.' },
  { key: 'astrologerDashboard', label: 'Astrologer Dashboard', group: 'Astrologer Portal', description: 'Tabs, skill options, probation/directory labels, modals & blocked account notices.' },

  // Micro-Labels across existing CMS screens
  { key: 'cmsMicroLabels', label: 'Micro-Labels (Notifications/Theme/Help/Muhurat)', group: 'Micro-Labels & Polish', description: 'Every remaining micro-label on Notifications Inbox, Notification Settings, Language, Theme, Help Centre, Contact Support & Muhurat.' },
];

const GROUPS = [
  'Launch & Navigation',
  'Home & Discovery',
  'Astrology Tools',
  'AI & Consultations',
  'Account & Wallet',
  'Astrologer Portal',
  'Micro-Labels & Polish',
];

function prettifyKey(k: string): string {
  return k
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function createEmptyTemplateFromSample(sample: any): any {
  if (typeof sample === 'string') return '';
  if (typeof sample === 'number') return 0;
  if (typeof sample === 'boolean') return false;
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === 'object') {
    const obj: Record<string, any> = {};
    for (const key of Object.keys(sample)) {
      obj[key] = createEmptyTemplateFromSample(sample[key]);
    }
    return obj;
  }
  return '';
}

function DynamicValueEditor({
  value,
  onChange,
  fieldKey = '',
  depth = 0,
  searchTerm = '',
}: {
  value: any;
  onChange: (next: any) => void;
  fieldKey?: string;
  depth?: number;
  searchTerm?: string;
}) {
  if (typeof value === 'boolean') {
    return (
      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded accent-amber-600"
        />
        <span className="text-xs font-semibold text-foreground">{value ? 'Enabled' : 'Disabled'}</span>
      </label>
    );
  }

  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full max-w-xs px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    );
  }

  if (typeof value === 'string') {
    const isMultiline = value.length > 75 || value.includes('\n');
    if (isMultiline) {
      return (
        <textarea
          rows={Math.min(6, Math.max(2, Math.ceil(value.length / 72)))}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 leading-relaxed"
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    );
  }

  if (Array.isArray(value)) {
    const sample = value[0];
    return (
      <div className="space-y-2.5">
        {value.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2 relative"
          >
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                #{idx + 1}{' '}
                {typeof item === 'object' && item
                  ? item.label || item.title || item.name || item.sign || item.planet || item.dir || item.mukhi || item.code || ''
                  : ''}
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                title="Remove item"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
            <DynamicValueEditor
              value={item}
              onChange={(nextItem) => {
                const copy = [...value];
                copy[idx] = nextItem;
                onChange(copy);
              }}
              depth={depth + 1}
              searchTerm=""
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const blank =
              sample !== undefined ? createEmptyTemplateFromSample(sample) : '';
            onChange([...value, blank]);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent text-xs font-bold border border-accent/30 transition-colors"
        >
          <Plus size={13} /> Add {fieldKey ? prettifyKey(fieldKey) : 'Item'}
        </button>
      </div>
    );
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    const q = searchTerm.trim().toLowerCase();
    const visibleKeys = q
      ? keys.filter((k) => {
          if (k.toLowerCase().includes(q) || prettifyKey(k).toLowerCase().includes(q)) return true;
          try {
            return JSON.stringify(value[k]).toLowerCase().includes(q);
          } catch {
            return false;
          }
        })
      : keys;

    if (visibleKeys.length === 0) {
      return <p className="text-xs text-muted-foreground py-3">No matching fields in this section.</p>;
    }

    return (
      <div className={depth === 0 ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
        {visibleKeys.map((k) => {
          const child = value[k];
          const isComplex = typeof child === 'object' && child !== null;
          return (
            <div
              key={k}
              className={
                depth === 0
                  ? 'p-4 rounded-2xl bg-card border border-border/80 space-y-2'
                  : isComplex
                  ? 'md:col-span-2 p-3 rounded-xl bg-card/60 border border-border/70 space-y-2'
                  : 'space-y-1'
              }
            >
              <label className="block text-xs font-bold text-foreground">
                {prettifyKey(k)}
                <span className="ml-2 text-[10px] font-mono text-muted-foreground font-normal">
                  {k}
                </span>
              </label>
              <DynamicValueEditor
                value={child}
                fieldKey={k}
                onChange={(nextChild) => onChange({ ...value, [k]: nextChild })}
                depth={depth + 1}
                searchTerm={q ? '' : ''}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

export default function AdminAppAllScreensCmsEditor() {
  const [config, setConfig] = useState<AppScreensCmsConfig>(DEFAULT_APP_SCREENS_CMS);
  const [remediesCatalog, setRemediesCatalog] = useState<RemediesCatalogData>(DEFAULT_REMEDIES_CATALOG);
  const [activeKey, setActiveKey] = useState<EditorTargetKey>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [screenSearch, setScreenSearch] = useState('');
  const [fieldSearch, setFieldSearch] = useState('');
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonDraft, setJsonDraft] = useState('');
  const [jsonError, setJsonError] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      const [cfgRes, remRes] = await Promise.all([
        fetch(`/api/app-dynamic/screens-config?_t=${ts}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        }),
        fetch(`/api/app-dynamic/remedies?_t=${ts}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        }),
      ]);
      const cfgJson = await cfgRes.json();
      if (cfgJson?.success && cfgJson.config) {
        setConfig(mergeAppScreensCms(cfgJson.config));
      }
      const remJson = await remRes.json();
      if (remJson?.success && remJson.catalog) {
        setRemediesCatalog(mergeRemediesCatalog(remJson.catalog));
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to load CMS config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const currentSectionData = useMemo(() => {
    if (activeKey === 'remediesCatalog') return remediesCatalog;
    return (config as any)[activeKey];
  }, [activeKey, config, remediesCatalog]);

  useEffect(() => {
    if (jsonMode) {
      setJsonDraft(JSON.stringify(currentSectionData, null, 2));
      setJsonError('');
    }
  }, [activeKey, jsonMode]);

  const setCurrentSectionData = (next: any) => {
    if (activeKey === 'remediesCatalog') {
      setRemediesCatalog(next);
    } else {
      setConfig((prev) => ({ ...prev, [activeKey]: next }));
    }
  };

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      let payloadData = currentSectionData;
      if (jsonMode) {
        try {
          payloadData = JSON.parse(jsonDraft);
          setCurrentSectionData(payloadData);
          setJsonError('');
        } catch (parseErr: any) {
          setJsonError(parseErr?.message || 'Invalid JSON syntax');
          setSaving(false);
          return;
        }
      }

      if (activeKey === 'remediesCatalog') {
        const res = await fetch('/api/app-dynamic/remedies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ catalog: payloadData }),
        });
        const json = await res.json();
        if (json?.success) {
          if (json.catalog) setRemediesCatalog(mergeRemediesCatalog(json.catalog));
          showToast('success', 'Saved Full Remedies Catalog live to Mobile App!');
        } else {
          showToast('error', json?.error || 'Failed to save remedies catalog');
        }
      } else {
        const res = await fetch('/api/app-dynamic/screens-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section: activeKey, data: payloadData }),
        });
        const json = await res.json();
        if (json?.success) {
          if (json.config) setConfig(mergeAppScreensCms(json.config));
          showToast('success', `Saved "${activeMeta?.label || activeKey}" live to Mobile App!`);
        } else {
          showToast('error', json?.error || 'Failed to save screen section');
        }
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSection = async () => {
    if (!confirm(`Reset "${activeMeta?.label || activeKey}" back to default values?`)) return;
    setSaving(true);
    try {
      if (activeKey === 'remediesCatalog') {
        const res = await fetch('/api/app-dynamic/remedies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reset: true }),
        });
        const json = await res.json();
        if (json?.success) {
          setRemediesCatalog(DEFAULT_REMEDIES_CATALOG);
          if (jsonMode) setJsonDraft(JSON.stringify(DEFAULT_REMEDIES_CATALOG, null, 2));
          showToast('success', 'Reset Remedies Catalog to defaults.');
        }
      } else {
        const res = await fetch('/api/app-dynamic/screens-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resetSection: activeKey }),
        });
        const json = await res.json();
        if (json?.success && json.config) {
          const merged = mergeAppScreensCms(json.config);
          setConfig(merged);
          if (jsonMode) setJsonDraft(JSON.stringify((merged as any)[activeKey], null, 2));
          showToast('success', `Reset "${activeMeta?.label}" to defaults.`);
        }
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to reset section');
    } finally {
      setSaving(false);
    }
  };

  const activeMeta = SECTION_META.find((m) => m.key === activeKey);

  const filteredSections = useMemo(() => {
    const q = screenSearch.trim().toLowerCase();
    if (!q) return SECTION_META;
    return SECTION_META.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        m.group.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.key.toLowerCase().includes(q)
    );
  }, [screenSearch]);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              100% Dynamic Coverage
            </span>
            <span className="text-xs text-muted-foreground">
              All 45 App Screens + Bottom Tab Bar + Full Remedies Catalog
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground mt-1.5 flex items-center gap-2">
            <Sparkles size={18} className="text-accent" /> Complete Mobile App Screens CMS
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Edit any heading, subtitle, button, placeholder, badge, modal, prompt, transit, or remedy text across the entire mobile app. Saves sync live to Firestore immediately.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-accent text-xs font-semibold text-foreground transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Reload
          </button>
          <button
            type="button"
            onClick={() => {
              const nextMode = !jsonMode;
              setJsonMode(nextMode);
              if (nextMode) {
                setJsonDraft(JSON.stringify(currentSectionData, null, 2));
                setJsonError('');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              jsonMode
                ? 'bg-accent/15 border-accent text-accent'
                : 'border-border hover:border-accent text-foreground'
            }`}
          >
            {jsonMode ? <Sliders size={14} /> : <Code2 size={14} />}
            {jsonMode ? 'Visual Form' : 'JSON Mode'}
          </button>
          <button
            type="button"
            onClick={handleSaveSection}
            disabled={saving || loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white hover:opacity-90 disabled:opacity-50 text-xs font-bold shadow-sm transition-all"
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Save Section Live'}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <CheckCircle2 size={15} /> {toast.text}
        </div>
      )}

      {/* Split Workspace: Screen List Sidebar + Visual Field Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 rounded-2xl bg-card border border-border/80 p-3 space-y-3 lg:sticky lg:top-24 max-h-[78vh] overflow-y-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={screenSearch}
              onChange={(e) => setScreenSearch(e.target.value)}
              placeholder="Search screens..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {GROUPS.map((group) => {
            const items = filteredSections.filter((s) => s.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="space-y-1">
                <div className="px-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {group}
                </div>
                {items.map((item) => {
                  const active = activeKey === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setActiveKey(item.key);
                        setFieldSearch('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                        active
                          ? 'bg-accent/15 text-accent font-bold border border-accent/30'
                          : 'text-foreground/85 hover:bg-muted/70 font-medium border border-transparent'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Right Editor Pane */}
        <div className="lg:col-span-8 xl:col-span-9 rounded-2xl bg-card border border-border/80 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                {activeMeta?.group}
              </span>
              <h3 className="text-base font-bold text-foreground mt-0.5">
                {activeMeta?.label || activeKey}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{activeMeta?.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!jsonMode && (
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    placeholder="Filter fields..."
                    className="pl-7 pr-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs text-foreground w-40 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={handleResetSection}
                disabled={saving}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border hover:border-red-400 hover:text-red-500 text-xs font-semibold text-muted-foreground transition-colors"
                title="Reset this section to defaults"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Loading live Firestore CMS configuration...
            </div>
          ) : jsonMode ? (
            <div className="space-y-2">
              {jsonError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 font-semibold">
                  JSON Syntax Error: {jsonError}
                </div>
              )}
              <textarea
                rows={26}
                value={jsonDraft}
                onChange={(e) => setJsonDraft(e.target.value)}
                spellCheck={false}
                className="w-full p-4 rounded-xl bg-background border border-border font-mono text-xs text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          ) : (
            <DynamicValueEditor
              value={currentSectionData}
              onChange={setCurrentSectionData}
              searchTerm={fieldSearch}
            />
          )}

          {/* Bottom Save Footer */}
          <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-3">
            <span className="text-[11px] text-muted-foreground">
              Changes publish directly to Firestore and auto-sync into the mobile app on launch or foreground resume.
            </span>
            <button
              type="button"
              onClick={handleSaveSection}
              disabled={saving || loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-white hover:opacity-90 disabled:opacity-50 text-xs font-bold shadow-sm transition-all"
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save Section Live'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
