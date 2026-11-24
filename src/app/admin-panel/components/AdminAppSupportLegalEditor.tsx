'use client';

import React, { useEffect, useState } from 'react';
import {
  AppSupportLegalContent,
  DEFAULT_SUPPORT_LEGAL_CONTENT,
} from '@/lib/appDynamicContent';
import {
  HelpCircle,
  MessageSquare,
  FileText,
  Shield,
  Sliders,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Clock,
  Ticket,
} from 'lucide-react';
import { toast } from 'sonner';

type TabKey = 'faq' | 'contact' | 'legal' | 'privacySecurity' | 'preferences';

interface SupportTicketRecord {
  id: string;
  ticketId: string;
  subject: string;
  description: string;
  userName?: string;
  userPhone?: string;
  status: string;
  createdAt: string;
}

const inputCls =
  'w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent/25';

export default function AdminAppSupportLegalEditor() {
  const [content, setContent] = useState<AppSupportLegalContent>(DEFAULT_SUPPORT_LEGAL_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('faq');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('ALL');
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/app-dynamic/support-legal?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      const data = await res.json();
      if (data.success && data.content) {
        setContent({
          helpCentre: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.helpCentre, ...(data.content.helpCentre || {}) },
          contactSupport: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.contactSupport, ...(data.content.contactSupport || {}) },
          terms: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.terms, ...(data.content.terms || {}) },
          privacyPolicy: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.privacyPolicy, ...(data.content.privacyPolicy || {}) },
          privacyScreen: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.privacyScreen, ...(data.content.privacyScreen || {}) },
          securityScreen: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.securityScreen, ...(data.content.securityScreen || {}) },
          preferencesScreen: {
            ...(DEFAULT_SUPPORT_LEGAL_CONTENT.preferencesScreen!),
            ...(data.content.preferencesScreen || {}),
          },
        });
      }
    } catch {
      toast.error('Failed to load Support & Legal content');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch(`/api/app-dynamic/support-tickets?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      }
    } catch {
      // ignore
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadContent();
    loadTickets();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/app-dynamic/support-legal?_t=${Date.now()}`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.content) {
          setContent({
            helpCentre: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.helpCentre, ...(data.content.helpCentre || {}) },
            contactSupport: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.contactSupport, ...(data.content.contactSupport || {}) },
            terms: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.terms, ...(data.content.terms || {}) },
            privacyPolicy: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.privacyPolicy, ...(data.content.privacyPolicy || {}) },
            privacyScreen: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.privacyScreen, ...(data.content.privacyScreen || {}) },
            securityScreen: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.securityScreen, ...(data.content.securityScreen || {}) },
            preferencesScreen: {
              ...(DEFAULT_SUPPORT_LEGAL_CONTENT.preferencesScreen!),
              ...(data.content.preferencesScreen || {}),
            },
          });
        }
        toast.success('All Support, FAQ, Legal, Privacy, Security & Preferences content synced live to app!');
      } else {
        toast.error(data.error || 'Failed to save changes');
      }
    } catch {
      toast.error('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all Support, FAQ, Legal, Privacy & Security content to default values?')) {
      setContent(DEFAULT_SUPPORT_LEGAL_CONTENT);
      toast.info('Defaults restored locally — click Save Changes to publish live.');
    }
  };

  const handleTicketStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch('/api/app-dynamic/support-tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
        toast.success(`Ticket marked as ${nextStatus}`);
      }
    } catch {
      toast.error('Failed to update ticket status');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    try {
      const res = await fetch(`/api/app-dynamic/support-tickets?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        toast.success('Ticket removed');
      }
    } catch {
      toast.error('Failed to delete ticket');
    }
  };

  const prefs = content.preferencesScreen || DEFAULT_SUPPORT_LEGAL_CONTENT.preferencesScreen!;

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground text-sm">
        Loading Support, FAQs & Legal dynamic configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="text-accent" size={20} /> Profile Inner Screens: FAQs, Support, Legal, Privacy & Security
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Edit every single heading, FAQ question/answer, contact button, legal clause, privacy toggle, security text, and preferences label live.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadContent}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Reload
          </button>
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1.5"
          >
            <RotateCcw size={13} /> Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            <Save size={14} /> {saving ? 'Publishing...' : 'Save & Publish Live'}
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'faq', label: `Help Centre & FAQs (${content.helpCentre.faqs.length})`, icon: HelpCircle },
          { id: 'contact', label: `Contact & Tickets (${tickets.length})`, icon: MessageSquare },
          { id: 'legal', label: 'Terms & Privacy Policy', icon: FileText },
          { id: 'privacySecurity', label: 'Privacy & Security Screens', icon: Shield },
          { id: 'preferences', label: 'Language & Theme Text', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap border transition-all ${
                active
                  ? 'bg-accent text-white border-accent shadow-xs'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HELP CENTRE & FAQS */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Help Centre Headings & Banner
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold">Screen Title</label>
                <input
                  className={inputCls}
                  value={content.helpCentre.appBarTitle}
                  onChange={(e) =>
                    setContent({ ...content, helpCentre: { ...content.helpCentre, appBarTitle: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Search Placeholder</label>
                <input
                  className={inputCls}
                  value={content.helpCentre.searchPlaceholder}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      helpCentre: { ...content.helpCentre, searchPlaceholder: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">No Results Text</label>
                <input
                  className={inputCls}
                  value={content.helpCentre.noResultsText}
                  onChange={(e) =>
                    setContent({ ...content, helpCentre: { ...content.helpCentre, noResultsText: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Banner Emoji</label>
                <input
                  className={inputCls}
                  value={content.helpCentre.needHelpBanner.emoji}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      helpCentre: {
                        ...content.helpCentre,
                        needHelpBanner: { ...content.helpCentre.needHelpBanner, emoji: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Banner Title</label>
                <input
                  className={inputCls}
                  value={content.helpCentre.needHelpBanner.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      helpCentre: {
                        ...content.helpCentre,
                        needHelpBanner: { ...content.helpCentre.needHelpBanner, title: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Banner Subtitle</label>
                <input
                  className={inputCls}
                  value={content.helpCentre.needHelpBanner.subtitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      helpCentre: {
                        ...content.helpCentre,
                        needHelpBanner: { ...content.helpCentre.needHelpBanner, subtitle: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Topics Section Heading</label>
                <input
                  className={inputCls}
                  value={content.helpCentre.browseTopicsTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      helpCentre: { ...content.helpCentre, browseTopicsTitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">FAQs Section Heading</label>
                <input
                  className={inputCls}
                  value={content.helpCentre.faqsTitle}
                  onChange={(e) =>
                    setContent({ ...content, helpCentre: { ...content.helpCentre, faqsTitle: e.target.value } })
                  }
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">Topic Categories</h3>
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    helpCentre: {
                      ...content.helpCentre,
                      categories: [
                        ...content.helpCentre.categories,
                        { emoji: '✨', title: 'New Topic', count: 1, color: '#C9A84C' },
                      ],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Topic
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {content.helpCentre.categories.map((cat, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      className="w-14 px-2 py-1 rounded-lg border border-border text-center text-sm"
                      value={cat.emoji}
                      onChange={(e) => {
                        const next = [...content.helpCentre.categories];
                        next[idx] = { ...cat, emoji: e.target.value };
                        setContent({ ...content, helpCentre: { ...content.helpCentre, categories: next } });
                      }}
                    />
                    <input
                      className="flex-1 px-2.5 py-1 rounded-lg border border-border text-xs font-bold"
                      value={cat.title}
                      onChange={(e) => {
                        const next = [...content.helpCentre.categories];
                        next[idx] = { ...cat, title: e.target.value };
                        setContent({ ...content, helpCentre: { ...content.helpCentre, categories: next } });
                      }}
                    />
                    <button
                      onClick={() => {
                        const next = content.helpCentre.categories.filter((_, i) => i !== idx);
                        setContent({ ...content, helpCentre: { ...content.helpCentre, categories: next } });
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-8 h-7 rounded cursor-pointer border border-border"
                      value={cat.color}
                      onChange={(e) => {
                        const next = [...content.helpCentre.categories];
                        next[idx] = { ...cat, color: e.target.value };
                        setContent({ ...content, helpCentre: { ...content.helpCentre, categories: next } });
                      }}
                    />
                    <input
                      className="flex-1 px-2 py-1 rounded-lg border border-border text-xs font-mono"
                      value={cat.color}
                      onChange={(e) => {
                        const next = [...content.helpCentre.categories];
                        next[idx] = { ...cat, color: e.target.value };
                        setContent({ ...content, helpCentre: { ...content.helpCentre, categories: next } });
                      }}
                    />
                    <input
                      type="number"
                      className="w-16 px-2 py-1 rounded-lg border border-border text-xs"
                      value={cat.count}
                      onChange={(e) => {
                        const next = [...content.helpCentre.categories];
                        next[idx] = { ...cat, count: Number(e.target.value) || 0 };
                        setContent({ ...content, helpCentre: { ...content.helpCentre, categories: next } });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs CRUD */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-sm font-bold text-foreground">
                  Frequently Asked Questions ({content.helpCentre.faqs.length})
                </h3>
                <select
                  value={faqCategoryFilter}
                  onChange={(e) => setFaqCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold"
                >
                  <option value="ALL">All Categories</option>
                  {content.helpCentre.categories.map((c) => (
                    <option key={c.title} value={c.title}>
                      {c.emoji} {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    helpCentre: {
                      ...content.helpCentre,
                      faqs: [
                        {
                          category:
                            faqCategoryFilter !== 'ALL'
                              ? faqCategoryFilter
                              : content.helpCentre.categories[0]?.title || 'Getting Started',
                          q: 'New Question?',
                          a: 'Detailed Vedic answer here...',
                        },
                        ...content.helpCentre.faqs,
                      ],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add FAQ
              </button>
            </div>

            <div className="space-y-3">
              {content.helpCentre.faqs.map((faq, idx) => {
                if (
                  faqCategoryFilter !== 'ALL' &&
                  (faq.category || '').toLowerCase() !== faqCategoryFilter.toLowerCase()
                ) {
                  return null;
                }
                return (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-background space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <select
                        className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-bold"
                        value={faq.category || ''}
                        onChange={(e) => {
                          const next = [...content.helpCentre.faqs];
                          next[idx] = { ...faq, category: e.target.value };
                          setContent({ ...content, helpCentre: { ...content.helpCentre, faqs: next } });
                        }}
                      >
                        <option value="">Uncategorized</option>
                        {content.helpCentre.categories.map((c) => (
                          <option key={c.title} value={c.title}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const next = content.helpCentre.faqs.filter((_, i) => i !== idx);
                          setContent({ ...content, helpCentre: { ...content.helpCentre, faqs: next } });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg text-xs flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                    <input
                      className={inputCls}
                      placeholder="Question"
                      value={faq.q}
                      onChange={(e) => {
                        const next = [...content.helpCentre.faqs];
                        next[idx] = { ...faq, q: e.target.value };
                        setContent({ ...content, helpCentre: { ...content.helpCentre, faqs: next } });
                      }}
                    />
                    <textarea
                      rows={3}
                      className={inputCls}
                      placeholder="Answer"
                      value={faq.a}
                      onChange={(e) => {
                        const next = [...content.helpCentre.faqs];
                        next[idx] = { ...faq, a: e.target.value };
                        setContent({ ...content, helpCentre: { ...content.helpCentre, faqs: next } });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACT SUPPORT & LIVE TICKETS */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              Contact Support Banner & Ticket Form Labels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold">Screen Title</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.appBarTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: { ...content.contactSupport, appBarTitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Banner Emoji</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.banner.emoji}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: {
                        ...content.contactSupport,
                        banner: { ...content.contactSupport.banner, emoji: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Banner Title</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.banner.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: {
                        ...content.contactSupport,
                        banner: { ...content.contactSupport.banner, title: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold">Banner Subtitle</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.banner.subtitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: {
                        ...content.contactSupport,
                        banner: { ...content.contactSupport.banner, subtitle: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Ticket Section Title</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.ticketTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: { ...content.contactSupport, ticketTitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Subject Label</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.ticketSubjectLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: { ...content.contactSupport, ticketSubjectLabel: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Subject Placeholder</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.ticketSubjectHint}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: { ...content.contactSupport, ticketSubjectHint: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Description Label</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.ticketDescLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: { ...content.contactSupport, ticketDescLabel: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Description Placeholder</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.ticketDescHint}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: { ...content.contactSupport, ticketDescHint: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold">Submit Button Text</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.ticketButtonLabel}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: { ...content.contactSupport, ticketButtonLabel: e.target.value },
                    })
                  }
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold">Ticket Success Toast Message</label>
                <input
                  className={inputCls}
                  value={content.contactSupport.ticketSuccessMessage}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      contactSupport: { ...content.contactSupport, ticketSuccessMessage: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Contact Options */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">Contact Channels (Chat / Email / Phone / WhatsApp)</h3>
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    contactSupport: {
                      ...content.contactSupport,
                      options: [
                        ...content.contactSupport.options,
                        {
                          emoji: '📞',
                          title: 'New Channel',
                          desc: 'Channel description',
                          color: '#C9A84C',
                          action: 'Connect',
                          actionType: 'call',
                          value: 'tel:+919876543210',
                        },
                      ],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Channel
              </button>
            </div>
            <div className="space-y-3">
              {content.contactSupport.options.map((opt, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-background grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    className={inputCls}
                    placeholder="Emoji"
                    value={opt.emoji}
                    onChange={(e) => {
                      const next = [...content.contactSupport.options];
                      next[idx] = { ...opt, emoji: e.target.value };
                      setContent({ ...content, contactSupport: { ...content.contactSupport, options: next } });
                    }}
                  />
                  <input
                    className={inputCls}
                    placeholder="Title"
                    value={opt.title}
                    onChange={(e) => {
                      const next = [...content.contactSupport.options];
                      next[idx] = { ...opt, title: e.target.value };
                      setContent({ ...content, contactSupport: { ...content.contactSupport, options: next } });
                    }}
                  />
                  <input
                    className={inputCls}
                    placeholder="Description"
                    value={opt.desc}
                    onChange={(e) => {
                      const next = [...content.contactSupport.options];
                      next[idx] = { ...opt, desc: e.target.value };
                      setContent({ ...content, contactSupport: { ...content.contactSupport, options: next } });
                    }}
                  />
                  <input
                    className={inputCls}
                    placeholder="Button Text"
                    value={opt.action}
                    onChange={(e) => {
                      const next = [...content.contactSupport.options];
                      next[idx] = { ...opt, action: e.target.value };
                      setContent({ ...content, contactSupport: { ...content.contactSupport, options: next } });
                    }}
                  />
                  <select
                    className={inputCls}
                    value={opt.actionType || 'chat'}
                    onChange={(e) => {
                      const next = [...content.contactSupport.options];
                      next[idx] = { ...opt, actionType: e.target.value as any };
                      setContent({ ...content, contactSupport: { ...content.contactSupport, options: next } });
                    }}
                  >
                    <option value="chat">In-App Chat</option>
                    <option value="email">Email (mailto:)</option>
                    <option value="call">Phone (tel:)</option>
                    <option value="whatsapp">WhatsApp URL</option>
                  </select>
                  <input
                    className={`${inputCls} md:col-span-2`}
                    placeholder="Link / Value (e.g. mailto:..., tel:..., https://wa.me/...)"
                    value={opt.value || ''}
                    onChange={(e) => {
                      const next = [...content.contactSupport.options];
                      next[idx] = { ...opt, value: e.target.value };
                      setContent({ ...content, contactSupport: { ...content.contactSupport, options: next } });
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-9 rounded cursor-pointer border border-border"
                      value={opt.color}
                      onChange={(e) => {
                        const next = [...content.contactSupport.options];
                        next[idx] = { ...opt, color: e.target.value };
                        setContent({ ...content, contactSupport: { ...content.contactSupport, options: next } });
                      }}
                    />
                    <button
                      onClick={() => {
                        const next = content.contactSupport.options.filter((_, i) => i !== idx);
                        setContent({ ...content, contactSupport: { ...content.contactSupport, options: next } });
                      }}
                      className="px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Incoming Support Tickets */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Ticket size={15} className="text-accent" /> Live User Support Tickets ({tickets.length})
              </h3>
              <button
                onClick={loadTickets}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold flex items-center gap-1"
              >
                <RefreshCw size={12} /> Refresh Tickets
              </button>
            </div>
            {loadingTickets ? (
              <p className="text-xs text-muted-foreground">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No support tickets submitted from the mobile app yet.
              </p>
            ) : (
              <div className="space-y-3">
                {tickets.map((tk) => (
                  <div key={tk.id} className="p-4 rounded-xl border border-border bg-background flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-accent/15 text-accent">
                          #{tk.ticketId}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            tk.status === 'resolved'
                              ? 'bg-emerald-500/15 text-emerald-600'
                              : 'bg-amber-500/15 text-amber-600'
                          }`}
                        >
                          {tk.status.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-foreground">{tk.subject}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{tk.description}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>User: {tk.userName || 'Guest'}</span>
                        {tk.userPhone && <span>• {tk.userPhone}</span>}
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {new Date(tk.createdAt).toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTicketStatus(tk.id, tk.status === 'resolved' ? 'open' : 'resolved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} /> {tk.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(tk.id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TERMS OF SERVICE & PRIVACY POLICY */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          {(['terms', 'privacyPolicy'] as const).map((key) => {
            const docObj = content[key];
            return (
              <div key={key} className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {key === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                  </h3>
                  <button
                    onClick={() =>
                      setContent({
                        ...content,
                        [key]: {
                          ...docObj,
                          sections: [...docObj.sections, ['New Section Heading', 'Section details...']],
                        },
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Clause
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold">Title</label>
                    <input
                      className={inputCls}
                      value={docObj.title}
                      onChange={(e) => setContent({ ...content, [key]: { ...docObj, title: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Emoji</label>
                    <input
                      className={inputCls}
                      value={docObj.emoji}
                      onChange={(e) => setContent({ ...content, [key]: { ...docObj, emoji: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold">Last Updated Text</label>
                    <input
                      className={inputCls}
                      value={docObj.lastUpdated}
                      onChange={(e) => setContent({ ...content, [key]: { ...docObj, lastUpdated: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {docObj.sections.map(([heading, body], idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-border bg-background space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs font-bold"
                          value={heading}
                          onChange={(e) => {
                            const next = [...docObj.sections] as Array<[string, string]>;
                            next[idx] = [e.target.value, body];
                            setContent({ ...content, [key]: { ...docObj, sections: next } });
                          }}
                        />
                        <button
                          onClick={() => {
                            const next = docObj.sections.filter((_, i) => i !== idx);
                            setContent({ ...content, [key]: { ...docObj, sections: next } });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        className={inputCls}
                        value={body}
                        onChange={(e) => {
                          const next = [...docObj.sections] as Array<[string, string]>;
                          next[idx] = [heading, e.target.value];
                          setContent({ ...content, [key]: { ...docObj, sections: next } });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: PRIVACY & SECURITY SCREENS */}
      {activeTab === 'privacySecurity' && (
        <div className="space-y-6">
          {/* Privacy Screen */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Privacy Settings Screen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  ['appBarTitle', 'App Bar Title'],
                  ['bannerEmoji', 'Banner Emoji'],
                  ['bannerTitle', 'Banner Title'],
                  ['bannerSubtitle', 'Banner Subtitle'],
                  ['controlsSectionTitle', 'Controls Section Heading'],
                  ['dataSectionTitle', 'Data Section Heading'],
                  ['downloadDataTitle', 'Download Data Title'],
                  ['downloadDataSubtitle', 'Download Data Subtitle'],
                  ['downloadDataMessage', 'Download Data Toast'],
                  ['deleteAccountTitle', 'Delete Account Title'],
                  ['deleteAccountSubtitle', 'Delete Account Subtitle'],
                  ['deleteAccountConfirmTitle', 'Delete Dialog Title'],
                  ['deleteAccountConfirmMessage', 'Delete Dialog Message'],
                  ['deleteAccountSuccessTitle', 'Deleted Success Title'],
                  ['deleteAccountSuccessMessage', 'Deleted Success Message'],
                  ['cancelButtonText', 'Cancel Button Text'],
                  ['confirmDeleteButtonText', 'Confirm Delete Button'],
                  ['privacyPolicyLinkTitle', 'Privacy Policy Link Title'],
                  ['termsLinkTitle', 'Terms Link Title'],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className={field.includes('Message') || field.includes('Subtitle') ? 'md:col-span-3' : ''}>
                  <label className="text-xs font-bold">{label}</label>
                  <input
                    className={inputCls}
                    value={(content.privacyScreen as any)[field] || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        privacyScreen: { ...content.privacyScreen, [field]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            {/* Privacy Toggle Controls */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Privacy Toggle Controls</span>
                <button
                  onClick={() =>
                    setContent({
                      ...content,
                      privacyScreen: {
                        ...content.privacyScreen,
                        controls: [...content.privacyScreen.controls, { key: 'New Privacy Setting', defaultValue: true }],
                      },
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={12} /> Add Control
                </button>
              </div>
              {content.privacyScreen.controls.map((ctrl, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-background">
                  <input
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold"
                    value={ctrl.key}
                    onChange={(e) => {
                      const next = [...content.privacyScreen.controls];
                      next[idx] = { ...ctrl, key: e.target.value };
                      setContent({ ...content, privacyScreen: { ...content.privacyScreen, controls: next } });
                    }}
                  />
                  <label className="flex items-center gap-1.5 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={ctrl.defaultValue}
                      onChange={(e) => {
                        const next = [...content.privacyScreen.controls];
                        next[idx] = { ...ctrl, defaultValue: e.target.checked };
                        setContent({ ...content, privacyScreen: { ...content.privacyScreen, controls: next } });
                      }}
                    />
                    Default ON
                  </label>
                  <button
                    onClick={() => {
                      const next = content.privacyScreen.controls.filter((_, i) => i !== idx);
                      setContent({ ...content, privacyScreen: { ...content.privacyScreen, controls: next } });
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security Screen */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Security Settings Screen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  ['appBarTitle', 'App Bar Title'],
                  ['statusTitleHigh', '100% Score Title'],
                  ['statusSubtitleHigh', '100% Score Subtitle'],
                  ['statusTitleLow', '65% Score Title'],
                  ['statusSubtitleLow', '65% Score Subtitle'],
                  ['sectionTitle', 'Authentication Heading'],
                  ['biometricTitle', 'Biometric Title'],
                  ['biometricSubtitle', 'Biometric Subtitle'],
                  ['twoFactorTitle', '2FA Title'],
                  ['twoFactorSubtitle', '2FA Subtitle'],
                  ['alertsTitle', 'Login Alerts Title'],
                  ['alertsSubtitle', 'Login Alerts Subtitle'],
                  ['credentialsSectionTitle', 'Credentials Section Heading'],
                  ['changePasswordTitle', 'Change Password Title'],
                  ['changePasswordSubtitle', 'Change Password Subtitle'],
                  ['changePasswordMessage', 'Change Password Toast'],
                  ['changePhoneTitle', 'Change Phone Title'],
                  ['changePhoneSubtitle', 'Change Phone Subtitle'],
                  ['changePhoneMessage', 'Change Phone Toast'],
                  ['sessionSectionTitle', 'Active Sessions Heading'],
                  ['deviceTitle', 'Primary Device Title'],
                  ['deviceSubtitle', 'Primary Device Subtitle'],
                  ['currentBadgeText', 'Current Badge Text'],
                  ['secondarySessionTitle', 'Secondary Session Title'],
                  ['secondarySessionSubtitle', 'Secondary Session Subtitle'],
                  ['revokeButtonText', 'Revoke Button Text'],
                  ['revokeMessage', 'Revoke Toast Message'],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="text-xs font-bold">{label}</label>
                  <input
                    className={inputCls}
                    value={(content.securityScreen as any)[field] || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        securityScreen: { ...content.securityScreen, [field]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LANGUAGE & THEME SCREENS COPY */}
      {activeTab === 'preferences' && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
            Language & Theme Preferences Screen Copy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ['languageAppBarTitle', 'Language Screen Title'],
                ['languageSaveButtonText', 'Save Language Button Text'],
                ['languageInfoBanner', 'Language Info Banner'],
                ['themeAppBarTitle', 'Theme Screen Title'],
                ['themeHeading', 'Theme Section Heading'],
                ['themeSubtitle', 'Theme Section Subtitle'],
                ['lightVedicTitle', 'Light Vedic Card Title'],
                ['lightVedicDesc', 'Light Vedic Description'],
                ['darkCosmicTitle', 'Dark Cosmic Card Title'],
                ['darkCosmicDesc', 'Dark Cosmic Description'],
                ['accentHeading', 'Accent Colour Heading'],
                ['accentSubtitle', 'Accent Colour Subtitle'],
                ['themeFooterNote', 'Theme Bottom Info Banner'],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className={field.includes('Banner') || field.includes('Note') || field.includes('Subtitle') ? 'md:col-span-2' : ''}>
                <label className="text-xs font-bold">{label}</label>
                <input
                  className={inputCls}
                  value={(prefs as any)[field] || ''}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      preferencesScreen: { ...prefs, [field]: e.target.value },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
