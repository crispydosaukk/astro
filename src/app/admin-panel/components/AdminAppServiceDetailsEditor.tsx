'use client';

import React, { useEffect, useState } from 'react';
import {
  AppServiceDetailPagesContent,
  DEFAULT_SERVICE_DETAIL_PAGES,
  ServiceDetailHero,
  ServiceDetailInfoCard,
  mergeServiceDetailPages,
} from '@/lib/appDynamicContent';
import {
  Save,
  RefreshCw,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

type ScreenKey =
  | 'career'
  | 'marriage'
  | 'business'
  | 'finance'
  | 'tarot'
  | 'numerology'
  | 'muhurat'
  | 'spiritual'
  | 'reports';

const SCREEN_TABS: Array<{ id: ScreenKey; label: string; emoji: string }> = [
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'marriage', label: 'Marriage', emoji: '💍' },
  { id: 'business', label: 'Business', emoji: '🏢' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
  { id: 'tarot', label: 'Tarot', emoji: '🃏' },
  { id: 'numerology', label: 'Numerology', emoji: '🔢' },
  { id: 'muhurat', label: 'Muhurat', emoji: '🗓️' },
  { id: 'spiritual', label: 'Spiritual', emoji: '🧘' },
  { id: 'reports', label: 'Mahadasha Reports', emoji: '📜' },
];

const inputCls =
  'w-full mt-1 px-3 py-2 rounded-xl bg-background border border-border text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent/25';

export default function AdminAppServiceDetailsEditor() {
  const [content, setContent] = useState<AppServiceDetailPagesContent>(DEFAULT_SERVICE_DETAIL_PAGES);
  const [activeTab, setActiveTab] = useState<ScreenKey>('career');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/app-dynamic/service-details?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      const data = await res.json();
      if (data.success && data.content) {
        setContent(mergeServiceDetailPages(data.content));
      }
    } catch {
      toast.error('Failed to load Service Detail Pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/app-dynamic/service-details?_t=${Date.now()}`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.content) {
          setContent(mergeServiceDetailPages(data.content));
        }
        toast.success('All 9 Service Detail Screens published live to mobile app!');
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const renderHeroAndIntro = (
    hero: ServiceDetailHero,
    intro: string,
    onHeroChange: (next: ServiceDetailHero) => void,
    onIntroChange: (val: string) => void
  ) => (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Hero Banner & Introduction</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold">Page Title</label>
          <input className={inputCls} value={hero.title} onChange={(e) => onHeroChange({ ...hero, title: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold">Subtitle</label>
          <input className={inputCls} value={hero.subtitle} onChange={(e) => onHeroChange({ ...hero, subtitle: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold">Accent Color</label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              className="w-10 h-9 rounded border border-border cursor-pointer"
              value={hero.accent}
              onChange={(e) => onHeroChange({ ...hero, accent: e.target.value })}
            />
            <input
              className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono"
              value={hero.accent}
              onChange={(e) => onHeroChange({ ...hero, accent: e.target.value })}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold">Hero Image URL</label>
          <input className={inputCls} value={hero.imageUrl} onChange={(e) => onHeroChange({ ...hero, imageUrl: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-bold">Icon Name</label>
          <input className={inputCls} value={hero.icon} onChange={(e) => onHeroChange({ ...hero, icon: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="text-xs font-bold">Intro Paragraph</label>
          <textarea rows={3} className={inputCls} value={intro} onChange={(e) => onIntroChange(e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderInfoCards = (
    sectionTitle: string,
    cards: ServiceDetailInfoCard[],
    onTitleChange: (t: string) => void,
    onCardsChange: (next: ServiceDetailInfoCard[]) => void
  ) => (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] font-bold text-muted-foreground">Section Heading</label>
          <input className={inputCls} value={sectionTitle} onChange={(e) => onTitleChange(e.target.value)} />
        </div>
        <button
          onClick={() =>
            onCardsChange([...cards, { icon: 'auto_awesome', title: 'New Insight', description: 'Describe this Vedic offering...' }])
          }
          className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1 mt-4"
        >
          <Plus size={13} /> Add Card
        </button>
      </div>
      <div className="space-y-3">
        {cards.map((card, idx) => (
          <div key={idx} className="p-3.5 rounded-xl border border-border bg-background space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold"
                placeholder="Title"
                value={card.title}
                onChange={(e) => {
                  const next = [...cards];
                  next[idx] = { ...card, title: e.target.value };
                  onCardsChange(next);
                }}
              />
              <input
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono"
                placeholder="Icon name"
                value={card.icon}
                onChange={(e) => {
                  const next = [...cards];
                  next[idx] = { ...card, icon: e.target.value };
                  onCardsChange(next);
                }}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => onCardsChange(cards.filter((_, i) => i !== idx))}
                  className="px-2.5 py-1 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              className={inputCls}
              placeholder="Description"
              value={card.description}
              onChange={(e) => {
                const next = [...cards];
                next[idx] = { ...card, description: e.target.value };
                onCardsChange(next);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground text-sm">Loading Service Detail Pages...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="text-accent" size={20} /> Service Detail Content Screens (All 9 Inner Screens)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every title, subtitle, hero image, intro paragraph, card, tarot deck, numerology meaning, muhurat date, spiritual quote & PDF guide is 100% live-editable.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Reload
          </button>
          <button
            onClick={() => {
              if (confirm('Restore default content for all 9 service detail screens?')) {
                setContent(DEFAULT_SERVICE_DETAIL_PAGES);
                toast.info('Defaults restored locally — click Save & Publish Live.');
              }
            }}
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

      {/* Shared CTA Labels */}
      <div className="bg-card border border-border rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold">Bottom CTA Left Button</label>
          <input
            className={inputCls}
            value={content.shared.chatNowLabel}
            onChange={(e) => setContent({ ...content, shared: { ...content.shared, chatNowLabel: e.target.value } })}
          />
        </div>
        <div>
          <label className="text-xs font-bold">Bottom CTA Right Button</label>
          <input
            className={inputCls}
            value={content.shared.consultNowLabel}
            onChange={(e) => setContent({ ...content, shared: { ...content.shared, consultNowLabel: e.target.value } })}
          />
        </div>
        <div>
          <label className="text-xs font-bold">Astrologers Carousel Heading</label>
          <input
            className={inputCls}
            value={content.shared.expertAstrologersTitle}
            onChange={(e) =>
              setContent({ ...content, shared: { ...content.shared, expertAstrologersTitle: e.target.value } })
            }
          />
        </div>
      </div>

      {/* 9 Screen Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {SCREEN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              activeTab === tab.id
                ? 'bg-accent text-white border-accent shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* 1. CAREER */}
      {activeTab === 'career' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.career.hero,
            content.career.intro,
            (hero) => setContent({ ...content, career: { ...content.career, hero } }),
            (intro) => setContent({ ...content, career: { ...content.career, intro } })
          )}
          {renderInfoCards(
            content.career.analysisTitle,
            content.career.analysisCards,
            (analysisTitle) => setContent({ ...content, career: { ...content.career, analysisTitle } }),
            (analysisCards) => setContent({ ...content, career: { ...content.career, analysisCards } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-bold"
                value={content.career.insightsTitle}
                onChange={(e) => setContent({ ...content, career: { ...content.career, insightsTitle: e.target.value } })}
              />
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    career: {
                      ...content.career,
                      insights: [...content.career.insights, { planet: 'Jupiter', role: 'Wisdom & Growth', icon: 'auto_awesome' }],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Insight Chip
              </button>
            </div>
            {content.career.insights.map((ins, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2.5 rounded-xl border border-border bg-background">
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                  value={ins.planet}
                  onChange={(e) => {
                    const next = [...content.career.insights];
                    next[idx] = { ...ins, planet: e.target.value };
                    setContent({ ...content, career: { ...content.career, insights: next } });
                  }}
                />
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  value={ins.role}
                  onChange={(e) => {
                    const next = [...content.career.insights];
                    next[idx] = { ...ins, role: e.target.value };
                    setContent({ ...content, career: { ...content.career, insights: next } });
                  }}
                />
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-mono"
                  value={ins.icon}
                  onChange={(e) => {
                    const next = [...content.career.insights];
                    next[idx] = { ...ins, icon: e.target.value };
                    setContent({ ...content, career: { ...content.career, insights: next } });
                  }}
                />
                <button
                  onClick={() =>
                    setContent({
                      ...content,
                      career: { ...content.career, insights: content.career.insights.filter((_, i) => i !== idx) },
                    })
                  }
                  className="text-red-500 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MARRIAGE */}
      {activeTab === 'marriage' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.marriage.hero,
            content.marriage.intro,
            (hero) => setContent({ ...content, marriage: { ...content.marriage, hero } }),
            (intro) => setContent({ ...content, marriage: { ...content.marriage, intro } })
          )}
          {renderInfoCards(
            content.marriage.analysisTitle,
            content.marriage.analysisCards,
            (analysisTitle) => setContent({ ...content, marriage: { ...content.marriage, analysisTitle } }),
            (analysisCards) => setContent({ ...content, marriage: { ...content.marriage, analysisCards } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-bold"
                value={content.marriage.compatibilityTitle}
                onChange={(e) =>
                  setContent({ ...content, marriage: { ...content.marriage, compatibilityTitle: e.target.value } })
                }
              />
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    marriage: {
                      ...content.marriage,
                      aspects: [...content.marriage.aspects, { name: 'New Koota', maxScore: 4, color: '#FFD700' }],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Aspect
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {content.marriage.aspects.map((asp, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
                  <input
                    className="flex-1 px-2 py-1 rounded-lg border border-border text-xs font-bold"
                    value={asp.name}
                    onChange={(e) => {
                      const next = [...content.marriage.aspects];
                      next[idx] = { ...asp, name: e.target.value };
                      setContent({ ...content, marriage: { ...content.marriage, aspects: next } });
                    }}
                  />
                  <input
                    type="number"
                    className="w-16 px-2 py-1 rounded-lg border border-border text-xs"
                    value={asp.maxScore}
                    onChange={(e) => {
                      const next = [...content.marriage.aspects];
                      next[idx] = { ...asp, maxScore: Number(e.target.value) || 0 };
                      setContent({ ...content, marriage: { ...content.marriage, aspects: next } });
                    }}
                  />
                  <input
                    type="color"
                    className="w-8 h-7 rounded border border-border"
                    value={asp.color}
                    onChange={(e) => {
                      const next = [...content.marriage.aspects];
                      next[idx] = { ...asp, color: e.target.value };
                      setContent({ ...content, marriage: { ...content.marriage, aspects: next } });
                    }}
                  />
                  <button
                    onClick={() =>
                      setContent({
                        ...content,
                        marriage: { ...content.marriage, aspects: content.marriage.aspects.filter((_, i) => i !== idx) },
                      })
                    }
                    className="p-1 text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. BUSINESS */}
      {activeTab === 'business' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.business.hero,
            content.business.intro,
            (hero) => setContent({ ...content, business: { ...content.business, hero } }),
            (intro) => setContent({ ...content, business: { ...content.business, intro } })
          )}
          {renderInfoCards(
            content.business.insightsTitle,
            content.business.analysisCards,
            (insightsTitle) => setContent({ ...content, business: { ...content.business, insightsTitle } }),
            (analysisCards) => setContent({ ...content, business: { ...content.business, analysisCards } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-bold"
                value={content.business.sectorsTitle}
                onChange={(e) =>
                  setContent({ ...content, business: { ...content.business, sectorsTitle: e.target.value } })
                }
              />
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    business: {
                      ...content.business,
                      sectors: [...content.business.sectors, { planet: 'Mercury', sector: 'New Sector', color: '#4FC3F7' }],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Sector
              </button>
            </div>
            {content.business.sectors.map((sec, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
                <input
                  className="w-32 px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                  value={sec.planet}
                  onChange={(e) => {
                    const next = [...content.business.sectors];
                    next[idx] = { ...sec, planet: e.target.value };
                    setContent({ ...content, business: { ...content.business, sectors: next } });
                  }}
                />
                <input
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  value={sec.sector}
                  onChange={(e) => {
                    const next = [...content.business.sectors];
                    next[idx] = { ...sec, sector: e.target.value };
                    setContent({ ...content, business: { ...content.business, sectors: next } });
                  }}
                />
                <input
                  type="color"
                  className="w-8 h-7 rounded border border-border"
                  value={sec.color}
                  onChange={(e) => {
                    const next = [...content.business.sectors];
                    next[idx] = { ...sec, color: e.target.value };
                    setContent({ ...content, business: { ...content.business, sectors: next } });
                  }}
                />
                <button
                  onClick={() =>
                    setContent({
                      ...content,
                      business: { ...content.business, sectors: content.business.sectors.filter((_, i) => i !== idx) },
                    })
                  }
                  className="p-1 text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FINANCE */}
      {activeTab === 'finance' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.finance.hero,
            content.finance.intro,
            (hero) => setContent({ ...content, finance: { ...content.finance, hero } }),
            (intro) => setContent({ ...content, finance: { ...content.finance, intro } })
          )}
          {renderInfoCards(
            content.finance.analysisTitle,
            content.finance.analysisCards,
            (analysisTitle) => setContent({ ...content, finance: { ...content.finance, analysisTitle } }),
            (analysisCards) => setContent({ ...content, finance: { ...content.finance, analysisCards } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-bold"
                value={content.finance.wealthHousesTitle}
                onChange={(e) =>
                  setContent({ ...content, finance: { ...content.finance, wealthHousesTitle: e.target.value } })
                }
              />
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    finance: {
                      ...content.finance,
                      wealthHouses: [
                        ...content.finance.wealthHouses,
                        { house: '9th House', governs: 'Fortune & Dharma', planet: 'Jupiter' },
                      ],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Wealth House
              </button>
            </div>
            {content.finance.wealthHouses.map((wh, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2.5 rounded-xl border border-border bg-background">
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                  value={wh.house}
                  onChange={(e) => {
                    const next = [...content.finance.wealthHouses];
                    next[idx] = { ...wh, house: e.target.value };
                    setContent({ ...content, finance: { ...content.finance, wealthHouses: next } });
                  }}
                />
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  value={wh.governs}
                  onChange={(e) => {
                    const next = [...content.finance.wealthHouses];
                    next[idx] = { ...wh, governs: e.target.value };
                    setContent({ ...content, finance: { ...content.finance, wealthHouses: next } });
                  }}
                />
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  value={wh.planet}
                  onChange={(e) => {
                    const next = [...content.finance.wealthHouses];
                    next[idx] = { ...wh, planet: e.target.value };
                    setContent({ ...content, finance: { ...content.finance, wealthHouses: next } });
                  }}
                />
                <button
                  onClick={() =>
                    setContent({
                      ...content,
                      finance: {
                        ...content.finance,
                        wealthHouses: content.finance.wealthHouses.filter((_, i) => i !== idx),
                      },
                    })
                  }
                  className="text-red-500 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAROT */}
      {activeTab === 'tarot' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.tarot.hero,
            content.tarot.intro,
            (hero) => setContent({ ...content, tarot: { ...content.tarot, hero } }),
            (intro) => setContent({ ...content, tarot: { ...content.tarot, intro } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold">Daily Card Section Title</label>
              <input
                className={inputCls}
                value={content.tarot.dailyDrawTitle}
                onChange={(e) => setContent({ ...content, tarot: { ...content.tarot, dailyDrawTitle: e.target.value } })}
              />
            </div>
            <div>
              <label className="text-xs font-bold">Daily Card Sub-Label</label>
              <input
                className={inputCls}
                value={content.tarot.cardOfTheDayLabel}
                onChange={(e) =>
                  setContent({ ...content, tarot: { ...content.tarot, cardOfTheDayLabel: e.target.value } })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold">Pin Daily Card Name (leave blank for auto-daily rotation!)</label>
              <input
                className={inputCls}
                placeholder="Blank = automatically rotates daily from Major Arcana deck"
                value={content.tarot.pinnedDailyCardName || ''}
                onChange={(e) =>
                  setContent({ ...content, tarot: { ...content.tarot, pinnedDailyCardName: e.target.value } })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold">Pinned Daily Card Description (optional)</label>
              <input
                className={inputCls}
                value={content.tarot.pinnedDailyCardDesc || ''}
                onChange={(e) =>
                  setContent({ ...content, tarot: { ...content.tarot, pinnedDailyCardDesc: e.target.value } })
                }
              />
            </div>
          </div>
          {renderInfoCards(
            content.tarot.readingTypesTitle,
            content.tarot.readingTypes,
            (readingTypesTitle) => setContent({ ...content, tarot: { ...content.tarot, readingTypesTitle } }),
            (readingTypes) => setContent({ ...content, tarot: { ...content.tarot, readingTypes } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-bold"
                value={content.tarot.majorArcanaTitle}
                onChange={(e) =>
                  setContent({ ...content, tarot: { ...content.tarot, majorArcanaTitle: e.target.value } })
                }
              />
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    tarot: {
                      ...content.tarot,
                      cards: [
                        ...content.tarot.cards,
                        { name: 'The World', meaning: 'Completion, harmony, fulfilment', reversed: 'Unfinished cycle' },
                      ],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Tarot Card
              </button>
            </div>
            {content.tarot.cards.map((card, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border bg-background space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                    value={card.name}
                    onChange={(e) => {
                      const next = [...content.tarot.cards];
                      next[idx] = { ...card, name: e.target.value };
                      setContent({ ...content, tarot: { ...content.tarot, cards: next } });
                    }}
                  />
                  <button
                    onClick={() =>
                      setContent({
                        ...content,
                        tarot: { ...content.tarot, cards: content.tarot.cards.filter((_, i) => i !== idx) },
                      })
                    }
                    className="p-1.5 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  className={inputCls}
                  placeholder="Upright Meaning"
                  value={card.meaning}
                  onChange={(e) => {
                    const next = [...content.tarot.cards];
                    next[idx] = { ...card, meaning: e.target.value };
                    setContent({ ...content, tarot: { ...content.tarot, cards: next } });
                  }}
                />
                <input
                  className={inputCls}
                  placeholder="Reversed Meaning"
                  value={card.reversed}
                  onChange={(e) => {
                    const next = [...content.tarot.cards];
                    next[idx] = { ...card, reversed: e.target.value };
                    setContent({ ...content, tarot: { ...content.tarot, cards: next } });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. NUMEROLOGY */}
      {activeTab === 'numerology' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.numerology.hero,
            content.numerology.intro,
            (hero) => setContent({ ...content, numerology: { ...content.numerology, hero } }),
            (intro) => setContent({ ...content, numerology: { ...content.numerology, intro } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                ['calculatorTitle', 'Calculator Section Title'],
                ['nameFieldLabel', 'Name Input Label'],
                ['dobFieldLabel', 'DOB Input Label'],
                ['calculateButtonLabel', 'Calculate Button Text'],
                ['lifePathLabel', 'Life Path Result Label'],
                ['destinyLabel', 'Destiny Result Label'],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="text-xs font-bold">{label}</label>
                <input
                  className={inputCls}
                  value={(content.numerology as any)[field]}
                  onChange={(e) =>
                    setContent({ ...content, numerology: { ...content.numerology, [field]: e.target.value } })
                  }
                />
              </div>
            ))}
          </div>
          {renderInfoCards(
            content.numerology.coreNumbersTitle,
            content.numerology.coreCards,
            (coreNumbersTitle) => setContent({ ...content, numerology: { ...content.numerology, coreNumbersTitle } }),
            (coreCards) => setContent({ ...content, numerology: { ...content.numerology, coreCards } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Numerology Number Meanings (1–9, 11, 22, 33)</h3>
            {content.numerology.meanings.map((m, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2.5 rounded-xl border border-border bg-background">
                <input
                  type="number"
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                  value={m.number}
                  onChange={(e) => {
                    const next = [...content.numerology.meanings];
                    next[idx] = { ...m, number: Number(e.target.value) || 1 };
                    setContent({ ...content, numerology: { ...content.numerology, meanings: next } });
                  }}
                />
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                  value={m.title}
                  onChange={(e) => {
                    const next = [...content.numerology.meanings];
                    next[idx] = { ...m, title: e.target.value };
                    setContent({ ...content, numerology: { ...content.numerology, meanings: next } });
                  }}
                />
                <input
                  className="md:col-span-2 px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  value={m.desc}
                  onChange={(e) => {
                    const next = [...content.numerology.meanings];
                    next[idx] = { ...m, desc: e.target.value };
                    setContent({ ...content, numerology: { ...content.numerology, meanings: next } });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. MUHURAT */}
      {activeTab === 'muhurat' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.muhurat.hero,
            content.muhurat.intro,
            (hero) => setContent({ ...content, muhurat: { ...content.muhurat, hero } }),
            (intro) => setContent({ ...content, muhurat: { ...content.muhurat, intro } })
          )}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-foreground flex items-center gap-2">
            <Sparkles size={15} className="text-amber-600 shrink-0" />
            <span>
              <strong>Live Panchang Sync Active:</strong> Today&apos;s Tithi, Nakshatra, Yoga, Karana, Vara, Rahu Kaal, Yamaganda & Abhijit Muhurat times automatically compute live every day via <code>/api/app-dynamic/panchang</code>. Edit labels and upcoming auspicious dates below.
            </span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ['upcomingDatesTitle', 'Upcoming Dates Heading'],
                ['dailyPanchangTitle', 'Live Panchang Section Heading'],
                ['inauspiciousTitle', 'Timings Section Heading'],
                ['rahuKaalTitle', 'Rahu Kaal Title'],
                ['rahuKaalNote', 'Rahu Kaal Description Note'],
                ['yamagandaTitle', 'Yamaganda Title'],
                ['yamagandaNote', 'Yamaganda Description Note'],
                ['abhijitTitle', 'Abhijit Muhurat Title'],
                ['abhijitNote', 'Abhijit Muhurat Description Note'],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="text-xs font-bold">{label}</label>
                <input
                  className={inputCls}
                  value={(content.muhurat as any)[field]}
                  onChange={(e) => setContent({ ...content, muhurat: { ...content.muhurat, [field]: e.target.value } })}
                />
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Upcoming Auspicious Event Dates</h3>
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    muhurat: {
                      ...content.muhurat,
                      muhurats: [
                        ...content.muhurat.muhurats,
                        { event: 'Namakaran', icon: 'child_care', dates: ['1 Dec 2026', '10 Dec 2026'], color: '#4FC3F7' },
                      ],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Event
              </button>
            </div>
            {content.muhurat.muhurats.map((m, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 rounded-xl border border-border bg-background items-center">
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                  value={m.event}
                  onChange={(e) => {
                    const next = [...content.muhurat.muhurats];
                    next[idx] = { ...m, event: e.target.value };
                    setContent({ ...content, muhurat: { ...content.muhurat, muhurats: next } });
                  }}
                />
                <input
                  className="md:col-span-2 px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  placeholder="Comma-separated dates (e.g. 24 Nov 2026, 2 Dec 2026)"
                  value={m.dates.join(', ')}
                  onChange={(e) => {
                    const next = [...content.muhurat.muhurats];
                    next[idx] = {
                      ...m,
                      dates: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    };
                    setContent({ ...content, muhurat: { ...content.muhurat, muhurats: next } });
                  }}
                />
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-mono"
                  value={m.icon}
                  onChange={(e) => {
                    const next = [...content.muhurat.muhurats];
                    next[idx] = { ...m, icon: e.target.value };
                    setContent({ ...content, muhurat: { ...content.muhurat, muhurats: next } });
                  }}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-8 h-7 rounded border border-border"
                    value={m.color}
                    onChange={(e) => {
                      const next = [...content.muhurat.muhurats];
                      next[idx] = { ...m, color: e.target.value };
                      setContent({ ...content, muhurat: { ...content.muhurat, muhurats: next } });
                    }}
                  />
                  <button
                    onClick={() =>
                      setContent({
                        ...content,
                        muhurat: { ...content.muhurat, muhurats: content.muhurat.muhurats.filter((_, i) => i !== idx) },
                      })
                    }
                    className="p-1 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. SPIRITUAL */}
      {activeTab === 'spiritual' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.spiritual.hero,
            content.spiritual.intro,
            (hero) => setContent({ ...content, spiritual: { ...content.spiritual, hero } }),
            (intro) => setContent({ ...content, spiritual: { ...content.spiritual, intro } })
          )}
          {renderInfoCards(
            content.spiritual.servicesTitle,
            content.spiritual.servicesCards,
            (servicesTitle) => setContent({ ...content, spiritual: { ...content.spiritual, servicesTitle } }),
            (servicesCards) => setContent({ ...content, spiritual: { ...content.spiritual, servicesCards } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-bold"
                value={content.spiritual.practiceTitle}
                onChange={(e) =>
                  setContent({ ...content, spiritual: { ...content.spiritual, practiceTitle: e.target.value } })
                }
              />
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    spiritual: {
                      ...content.spiritual,
                      practices: [
                        ...content.spiritual.practices,
                        { name: 'Satsang', duration: '25 min', icon: 'spa_rounded', color: '#C9A84C' },
                      ],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Practice
              </button>
            </div>
            {content.spiritual.practices.map((pr, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-2.5 rounded-xl border border-border bg-background items-center">
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                  value={pr.name}
                  onChange={(e) => {
                    const next = [...content.spiritual.practices];
                    next[idx] = { ...pr, name: e.target.value };
                    setContent({ ...content, spiritual: { ...content.spiritual, practices: next } });
                  }}
                />
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs"
                  value={pr.duration}
                  onChange={(e) => {
                    const next = [...content.spiritual.practices];
                    next[idx] = { ...pr, duration: e.target.value };
                    setContent({ ...content, spiritual: { ...content.spiritual, practices: next } });
                  }}
                />
                <input
                  className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-mono"
                  value={pr.icon}
                  onChange={(e) => {
                    const next = [...content.spiritual.practices];
                    next[idx] = { ...pr, icon: e.target.value };
                    setContent({ ...content, spiritual: { ...content.spiritual, practices: next } });
                  }}
                />
                <input
                  type="color"
                  className="w-8 h-7 rounded border border-border"
                  value={pr.color}
                  onChange={(e) => {
                    const next = [...content.spiritual.practices];
                    next[idx] = { ...pr, color: e.target.value };
                    setContent({ ...content, spiritual: { ...content.spiritual, practices: next } });
                  }}
                />
                <button
                  onClick={() =>
                    setContent({
                      ...content,
                      spiritual: {
                        ...content.spiritual,
                        practices: content.spiritual.practices.filter((_, i) => i !== idx),
                      },
                    })
                  }
                  className="text-red-500 text-xs font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                className="flex-1 px-3 py-1.5 rounded-lg border border-border text-sm font-bold"
                value={content.spiritual.wisdomTitle}
                onChange={(e) =>
                  setContent({ ...content, spiritual: { ...content.spiritual, wisdomTitle: e.target.value } })
                }
              />
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    spiritual: {
                      ...content.spiritual,
                      quotes: [...content.spiritual.quotes, { text: 'Sacred Vedic verse...', source: 'Bhagavad Gita' }],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Quote
              </button>
            </div>
            {content.spiritual.quotes.map((q, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border bg-background space-y-2">
                <textarea
                  rows={2}
                  className={inputCls}
                  value={q.text}
                  onChange={(e) => {
                    const next = [...content.spiritual.quotes];
                    next[idx] = { ...q, text: e.target.value };
                    setContent({ ...content, spiritual: { ...content.spiritual, quotes: next } });
                  }}
                />
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                    value={q.source}
                    onChange={(e) => {
                      const next = [...content.spiritual.quotes];
                      next[idx] = { ...q, source: e.target.value };
                      setContent({ ...content, spiritual: { ...content.spiritual, quotes: next } });
                    }}
                  />
                  <button
                    onClick={() =>
                      setContent({
                        ...content,
                        spiritual: { ...content.spiritual, quotes: content.spiritual.quotes.filter((_, i) => i !== idx) },
                      })
                    }
                    className="p-1 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. MAHADASHA REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-5">
          {renderHeroAndIntro(
            content.reports.hero,
            content.reports.intro,
            (hero) => setContent({ ...content, reports: { ...content.reports, hero } }),
            (intro) => setContent({ ...content, reports: { ...content.reports, intro } })
          )}
          <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold">Section Heading</label>
              <input
                className={inputCls}
                value={content.reports.sectionTitle}
                onChange={(e) => setContent({ ...content, reports: { ...content.reports, sectionTitle: e.target.value } })}
              />
            </div>
            <div>
              <label className="text-xs font-bold">Card Button Text</label>
              <input
                className={inputCls}
                value={content.reports.buttonLabel}
                onChange={(e) => setContent({ ...content, reports: { ...content.reports, buttonLabel: e.target.value } })}
              />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Mahadasha PDF Dossiers ({content.reports.guides.length})</h3>
              <button
                onClick={() =>
                  setContent({
                    ...content,
                    reports: {
                      ...content.reports,
                      guides: [
                        ...content.reports.guides,
                        {
                          id: `guide-${Date.now()}`,
                          name: 'New Mahadasha Guide',
                          pages: '40 pages (PDF)',
                          price: 499,
                          desc: 'Detailed Vedic remedial dossier.',
                          icon: 'auto_stories',
                          color: '#713B32',
                          badge: 'New Dossier',
                        },
                      ],
                    },
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add Guide
              </button>
            </div>
            {content.reports.guides.map((g, idx) => (
              <div key={g.id} className="p-4 rounded-xl border border-border bg-background space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    className="md:col-span-2 px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                    value={g.name}
                    onChange={(e) => {
                      const next = [...content.reports.guides];
                      next[idx] = { ...g, name: e.target.value };
                      setContent({ ...content, reports: { ...content.reports, guides: next } });
                    }}
                  />
                  <input
                    className="px-2.5 py-1.5 rounded-lg border border-border text-xs"
                    placeholder="Pages"
                    value={g.pages}
                    onChange={(e) => {
                      const next = [...content.reports.guides];
                      next[idx] = { ...g, pages: e.target.value };
                      setContent({ ...content, reports: { ...content.reports, guides: next } });
                    }}
                  />
                  <input
                    type="number"
                    className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-bold"
                    placeholder="Price INR"
                    value={g.price}
                    onChange={(e) => {
                      const next = [...content.reports.guides];
                      next[idx] = { ...g, price: Number(e.target.value) || 0 };
                      setContent({ ...content, reports: { ...content.reports, guides: next } });
                    }}
                  />
                </div>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={g.desc}
                  onChange={(e) => {
                    const next = [...content.reports.guides];
                    next[idx] = { ...g, desc: e.target.value };
                    setContent({ ...content, reports: { ...content.reports, guides: next } });
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <input
                    className="px-2.5 py-1.5 rounded-lg border border-border text-xs"
                    placeholder="Badge"
                    value={g.badge}
                    onChange={(e) => {
                      const next = [...content.reports.guides];
                      next[idx] = { ...g, badge: e.target.value };
                      setContent({ ...content, reports: { ...content.reports, guides: next } });
                    }}
                  />
                  <input
                    className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-mono"
                    placeholder="Icon"
                    value={g.icon}
                    onChange={(e) => {
                      const next = [...content.reports.guides];
                      next[idx] = { ...g, icon: e.target.value };
                      setContent({ ...content, reports: { ...content.reports, guides: next } });
                    }}
                  />
                  <input
                    type="color"
                    className="w-10 h-8 rounded border border-border"
                    value={g.color}
                    onChange={(e) => {
                      const next = [...content.reports.guides];
                      next[idx] = { ...g, color: e.target.value };
                      setContent({ ...content, reports: { ...content.reports, guides: next } });
                    }}
                  />
                  <button
                    onClick={() =>
                      setContent({
                        ...content,
                        reports: { ...content.reports, guides: content.reports.guides.filter((_, i) => i !== idx) },
                      })
                    }
                    className="text-red-500 text-xs font-bold flex items-center gap-1 justify-end"
                  >
                    <Trash2 size={14} /> Delete Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
