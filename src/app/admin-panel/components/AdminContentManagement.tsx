'use client';
import React, { useEffect, useState } from 'react';
import { getHomepageContent, updateHomepageContent, HomepageContent, defaultHomepageContent } from '@/lib/cms';
import { Save, Loader2, Info, LayoutTemplate, Sparkles, Users, Star, CreditCard, ChevronUp, ChevronDown } from 'lucide-react';

const contentTabs = [
  { id: 'tab-hero', label: 'Hero Section', icon: LayoutTemplate },
  { id: 'tab-services', label: 'Services', icon: Sparkles },
  { id: 'tab-astrologers', label: 'Astrologers', icon: Users },
  { id: 'tab-testimonials', label: 'Testimonials', icon: Star },
];

export default function AdminContentManagement() {
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('tab-hero');

  useEffect(() => {
    async function fetchContent() {
      const data = await getHomepageContent();
      setContent(data);
      setLoading(false);
    }
    fetchContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateHomepageContent(content);
      setMessage({ type: 'success', text: 'Content updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save content. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatChange = (index: number, field: 'value' | 'label', val: string) => {
    const newStats = [...content.hero.stats];
    newStats[index][field] = val;
    setContent({ ...content, hero: { ...content.hero, stats: newStats } });
  };

  const handleServiceChange = (index: number, field: keyof typeof content.services.items[0], val: string) => {
    const newItems = [...content.services.items];
    newItems[index] = { ...newItems[index], [field]: val };
    setContent({ ...content, services: { ...content.services, items: newItems } });
  };

  const moveService = (index: number, direction: 'up' | 'down') => {
    const newItems = [...content.services.items];
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    } else {
      return;
    }
    setContent({ ...content, services: { ...content.services, items: newItems } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CMS Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide max-w-full">
          {contentTabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${activeTab === tab.id ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              >
                <TabIcon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-all disabled:opacity-70 text-sm flex-shrink-0 whitespace-nowrap"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
          <Info size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Editor Content */}
      <form onSubmit={handleSave} className="space-y-8">
        {activeTab === 'tab-hero' && (
          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Main Headings</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Headline Line 1</label>
                  <input 
                    type="text" 
                    value={content.hero.headline1}
                    onChange={e => setContent({ ...content, hero: { ...content.hero, headline1: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Headline Line 2 (Gold)</label>
                  <input 
                    type="text" 
                    value={content.hero.headline2}
                    onChange={e => setContent({ ...content, hero: { ...content.hero, headline2: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subtitle Text</label>
                <textarea 
                  rows={3}
                  value={content.hero.subtitle}
                  onChange={e => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="border-t border-border pt-8 space-y-6">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Call to Action Buttons</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Primary Button Text</label>
                  <input 
                    type="text" 
                    value={content.hero.primaryBtnText}
                    onChange={e => setContent({ ...content, hero: { ...content.hero, primaryBtnText: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Secondary Button Text</label>
                  <input 
                    type="text" 
                    value={content.hero.secondaryBtnText}
                    onChange={e => setContent({ ...content, hero: { ...content.hero, secondaryBtnText: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8 space-y-6">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Key Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {content.hero.stats.map((stat, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-xl bg-background space-y-4">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Stat {idx + 1}</div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Value</label>
                      <input 
                        type="text" 
                        value={stat.value}
                        onChange={e => handleStatChange(idx, 'value', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Label</label>
                      <input 
                        type="text" 
                        value={stat.label}
                        onChange={e => handleStatChange(idx, 'label', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'tab-hero' && activeTab !== 'tab-services' && (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border border-dashed text-center">
            <LayoutTemplate size={48} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground">Section Configuration Upcoming</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              This section's dynamic content editor is not yet implemented. It will be added in future updates to manage other parts of the homepage.
            </p>
          </div>
        )}

        {activeTab === 'tab-services' && (
          <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Services Header</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tagline (e.g., Our Services)</label>
                  <input 
                    type="text" 
                    value={content.services.tagline}
                    onChange={e => setContent({ ...content, services: { ...content.services, tagline: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Title (e.g., Ancient Wisdom,)</label>
                  <input 
                    type="text" 
                    value={content.services.title}
                    onChange={e => setContent({ ...content, services: { ...content.services, title: e.target.value } })}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title Highlight (Gold) (e.g., Modern Precision)</label>
                <input 
                  type="text" 
                  value={content.services.titleHighlight}
                  onChange={e => setContent({ ...content, services: { ...content.services, titleHighlight: e.target.value } })}
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subtitle Description</label>
                <textarea 
                  rows={2}
                  value={content.services.subtitle}
                  onChange={e => setContent({ ...content, services: { ...content.services, subtitle: e.target.value } })}
                  className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="border-t border-border pt-8 space-y-6">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Service Cards</h3>
              
              <div className="space-y-4">
                {content.services.items.map((svc, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-xl space-y-4 bg-muted/20 relative group">
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => moveService(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-background border border-border hover:bg-muted disabled:opacity-50"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveService(idx, 'down')}
                        disabled={idx === content.services.items.length - 1}
                        className="p-1 rounded bg-background border border-border hover:bg-muted disabled:opacity-50"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Title</label>
                        <input type="text" value={svc.title} onChange={e => handleServiceChange(idx, 'title', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                        <input type="text" value={svc.description} onChange={e => handleServiceChange(idx, 'description', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Icon (e.g., Gem, Music)</label>
                        <input type="text" value={svc.icon} onChange={e => handleServiceChange(idx, 'icon', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Badge (e.g., Premium)</label>
                        <input type="text" value={svc.badge} onChange={e => handleServiceChange(idx, 'badge', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Link (href)</label>
                        <input type="text" value={svc.href} onChange={e => handleServiceChange(idx, 'href', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
