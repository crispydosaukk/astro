'use client';
import React, { useEffect, useState } from 'react';
import {
  getHomepageContent,
  updateHomepageContent,
  HomepageContent,
  defaultHomepageContent,
} from '@/lib/cms';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AdminServicePagesEditor from './AdminServicePagesEditor';
import AdminMahadashaGuidesEditor from './AdminMahadashaGuidesEditor';
import {
  Save,
  Loader2,
  Info,
  LayoutTemplate,
  Sparkles,
  Users,
  Star,
  ChevronUp,
  ChevronDown,
  ImagePlus,
  X,
  FileText,
} from 'lucide-react';

const contentTabs = [
  { id: 'tab-hero', label: 'Hero Section', icon: LayoutTemplate },
  { id: 'tab-services', label: 'Ashta-Digbandhan Remedies', icon: Sparkles },
  { id: 'tab-core-services', label: 'Vedic Services & Guides', icon: LayoutTemplate },
  { id: 'tab-panchang', label: 'Daily Panchang Data', icon: Sparkles },
  { id: 'tab-service-pages', label: 'Remedy Pages', icon: LayoutTemplate },
  { id: 'tab-mahadasha-guides', label: 'Mahadasha PDF Guides', icon: FileText },
  { id: 'tab-astrologers', label: 'Astrologers', icon: Users },
  { id: 'tab-testimonials', label: 'Testimonials', icon: Star },
];

export default function AdminContentManagement() {
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('tab-hero');
  const [uploadingImage, setUploadingImage] = useState<{ [key: number]: boolean }>({});

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

  const handleServiceChange = (
    index: number,
    field: keyof (typeof content.services.items)[0],
    val: any
  ) => {
    const newItems = [...content.services.items];
    newItems[index] = { ...newItems[index], [field]: val };
    setContent({ ...content, services: { ...content.services, items: newItems } });
  };

  const handleComprehensiveChange = (index: number, field: string, val: any) => {
    const section = content.comprehensiveServices || defaultHomepageContent.comprehensiveServices;
    const newItems = [...section.items];
    newItems[index] = { ...newItems[index], [field]: val };
    setContent({
      ...content,
      comprehensiveServices: { ...section, items: newItems },
    });
  };

  const handleComprehensiveSectionChange = (field: string, val: string) => {
    const section = content.comprehensiveServices || defaultHomepageContent.comprehensiveServices;
    setContent({
      ...content,
      comprehensiveServices: { ...section, [field]: val },
    });
  };

  const handlePanchangChange = (
    field: keyof typeof defaultHomepageContent.panchang,
    val: string
  ) => {
    const currentPanchang = content.panchang || defaultHomepageContent.panchang;
    setContent({
      ...content,
      panchang: { ...currentPanchang, [field]: val },
    });
  };

  const handleImageUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage((prev) => ({ ...prev, [idx]: true }));

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      handleServiceChange(idx, 'image', data.url);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage((prev) => ({ ...prev, [idx]: false }));
    }
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
          {contentTabs.map((tab) => {
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
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
        >
          <Info size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Editor Content */}
      {activeTab !== 'tab-service-pages' && activeTab !== 'tab-mahadasha-guides' && (
        <form onSubmit={handleSave} className="space-y-8">
          {activeTab === 'tab-hero' && (
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Main Headings
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Headline Line 1</label>
                    <input
                      type="text"
                      value={content.hero.headline1}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, headline1: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Headline Line 2 (Gold)
                    </label>
                    <input
                      type="text"
                      value={content.hero.headline2}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, headline2: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subtitle Text</label>
                  <textarea
                    rows={3}
                    value={content.hero.subtitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, subtitle: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-8 space-y-6">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Call to Action Buttons
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={content.hero.primaryBtnText}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, primaryBtnText: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Secondary Button Text
                    </label>
                    <input
                      type="text"
                      value={content.hero.secondaryBtnText}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, secondaryBtnText: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8 space-y-6">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Key Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {content.hero.stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-border rounded-xl bg-background space-y-4"
                    >
                      <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                        Stat {idx + 1}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Value</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'tab-hero' &&
            activeTab !== 'tab-services' &&
            activeTab !== 'tab-service-pages' &&
            activeTab !== 'tab-mahadasha-guides' && (
              <div className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border border-dashed text-center">
                <LayoutTemplate size={48} className="text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-foreground">
                  Section Configuration Upcoming
                </h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  This section's dynamic content editor is not yet implemented. It will be added in
                  future updates to manage other parts of the homepage.
                </p>
              </div>
            )}

          {activeTab === 'tab-services' && (
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Remedies Header
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Tagline (e.g., Our Remedies)
                    </label>
                    <input
                      type="text"
                      value={content.services.tagline}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          services: { ...content.services, tagline: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Title (e.g., Ancient Wisdom,)
                    </label>
                    <input
                      type="text"
                      value={content.services.title}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          services: { ...content.services, title: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Title Highlight (Gold) (e.g., Modern Precision)
                  </label>
                  <input
                    type="text"
                    value={content.services.titleHighlight}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        services: { ...content.services, titleHighlight: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={content.services.subtitle}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        services: { ...content.services, subtitle: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-8 space-y-6">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Remedy Cards
                </h3>

                <div className="space-y-4">
                  {content.services.items.map((svc, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-border rounded-xl space-y-4 bg-muted/20 relative group"
                    >
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
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={svc.title}
                            onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Description
                          </label>
                          <input
                            type="text"
                            value={svc.description}
                            onChange={(e) =>
                              handleServiceChange(idx, 'description', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-5 gap-4 mt-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Price (Base INR)
                          </label>
                          <input
                            type="number"
                            value={svc.price || 100}
                            onChange={(e) =>
                              handleServiceChange(idx, 'price' as any, Number(e.target.value))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Price (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={svc.priceUSD || ''}
                            onChange={(e) =>
                              handleServiceChange(idx, 'priceUSD' as any, Number(e.target.value))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                            placeholder="e.g. 10.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Icon (e.g., Gem, Music)
                          </label>
                          <input
                            type="text"
                            value={svc.icon}
                            onChange={(e) => handleServiceChange(idx, 'icon', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Badge (e.g., Premium)
                          </label>
                          <input
                            type="text"
                            value={svc.badge}
                            onChange={(e) => handleServiceChange(idx, 'badge', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Link (href)
                          </label>
                          <input
                            type="text"
                            value={svc.href}
                            onChange={(e) => handleServiceChange(idx, 'href', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <label className="text-xs font-medium text-muted-foreground flex justify-between items-center">
                          <span>Remedy Image</span>
                          {uploadingImage[idx] && (
                            <Loader2 size={12} className="animate-spin text-accent" />
                          )}
                        </label>
                        <div className="flex gap-4 items-start">
                          <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center">
                            {svc.image ? (
                              <img
                                src={svc.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImagePlus className="text-muted-foreground opacity-50" size={24} />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <label className="cursor-pointer flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium">
                              <ImagePlus size={16} />
                              Upload Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(idx, e)}
                                disabled={uploadingImage[idx]}
                              />
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">or URL:</span>
                              <input
                                type="text"
                                value={svc.image || ''}
                                onChange={(e) => handleServiceChange(idx, 'image', e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-border text-xs"
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CORE SERVICES */}
          {activeTab === 'tab-core-services' && (
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Vedic Services & Guides Header
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Tagline (e.g., ASTROPARIHAR SERVICES)
                    </label>
                    <input
                      type="text"
                      value={
                        content.comprehensiveServices?.tagline ||
                        defaultHomepageContent.comprehensiveServices.tagline
                      }
                      onChange={(e) => handleComprehensiveSectionChange('tagline', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Title Line 1 (e.g., Our Comprehensive)
                    </label>
                    <input
                      type="text"
                      value={
                        content.comprehensiveServices?.title ||
                        defaultHomepageContent.comprehensiveServices.title
                      }
                      onChange={(e) => handleComprehensiveSectionChange('title', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Title Highlight (Gold) (e.g., Vedic Services & Guides)
                  </label>
                  <input
                    type="text"
                    value={
                      content.comprehensiveServices?.titleHighlight ||
                      defaultHomepageContent.comprehensiveServices.titleHighlight
                    }
                    onChange={(e) =>
                      handleComprehensiveSectionChange('titleHighlight', e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={
                      content.comprehensiveServices?.subtitle ||
                      defaultHomepageContent.comprehensiveServices.subtitle
                    }
                    onChange={(e) => handleComprehensiveSectionChange('subtitle', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent outline-none resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-8 space-y-6">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Service Cards List
                </h3>

                <div className="space-y-4">
                  {(
                    content.comprehensiveServices?.items ||
                    defaultHomepageContent.comprehensiveServices.items
                  ).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 border border-border rounded-xl space-y-4 bg-muted/20"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              handleComprehensiveChange(idx, 'title', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Badge (e.g. Free / ₹999)
                          </label>
                          <input
                            type="text"
                            value={item.badge}
                            onChange={(e) =>
                              handleComprehensiveChange(idx, 'badge', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={item.desc}
                          onChange={(e) => handleComprehensiveChange(idx, 'desc', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm resize-none"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Link (href)
                          </label>
                          <input
                            type="text"
                            value={item.href}
                            onChange={(e) => handleComprehensiveChange(idx, 'href', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Card Gradient / Color Class
                          </label>
                          <input
                            type="text"
                            value={item.color || ''}
                            onChange={(e) =>
                              handleComprehensiveChange(idx, 'color', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB PANCHANG */}
          {activeTab === 'tab-panchang' && (
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm space-y-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                  Live Daily Panchang Highlights
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date & Header Label</label>
                  <input
                    type="text"
                    value={content.panchang?.dateLabel || defaultHomepageContent.panchang.dateLabel}
                    onChange={(e) => handlePanchangChange('dateLabel', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-background border border-border text-foreground focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Tithi */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-accent">Tithi</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Value</label>
                      <input
                        type="text"
                        value={content.panchang?.tithiValue || ''}
                        onChange={(e) => handlePanchangChange('tithiValue', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Timing / Subtext</label>
                      <input
                        type="text"
                        value={content.panchang?.tithiSub || ''}
                        onChange={(e) => handlePanchangChange('tithiSub', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                  </div>

                  {/* Nakshatra */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-accent">Nakshatra</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Value</label>
                      <input
                        type="text"
                        value={content.panchang?.nakshatraValue || ''}
                        onChange={(e) => handlePanchangChange('nakshatraValue', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Timing / Subtext</label>
                      <input
                        type="text"
                        value={content.panchang?.nakshatraSub || ''}
                        onChange={(e) => handlePanchangChange('nakshatraSub', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                  </div>

                  {/* Yoga */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-accent">Yoga</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Value</label>
                      <input
                        type="text"
                        value={content.panchang?.yogaValue || ''}
                        onChange={(e) => handlePanchangChange('yogaValue', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Subtext</label>
                      <input
                        type="text"
                        value={content.panchang?.yogaSub || ''}
                        onChange={(e) => handlePanchangChange('yogaSub', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                  </div>

                  {/* Karana */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-accent">Karana</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Value</label>
                      <input
                        type="text"
                        value={content.panchang?.karanaValue || ''}
                        onChange={(e) => handlePanchangChange('karanaValue', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Subtext</label>
                      <input
                        type="text"
                        value={content.panchang?.karanaSub || ''}
                        onChange={(e) => handlePanchangChange('karanaSub', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                  </div>

                  {/* Vara / Day */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-accent">Vara (Day)</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Value</label>
                      <input
                        type="text"
                        value={content.panchang?.varaValue || ''}
                        onChange={(e) => handlePanchangChange('varaValue', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Subtext</label>
                      <input
                        type="text"
                        value={content.panchang?.varaSub || ''}
                        onChange={(e) => handlePanchangChange('varaSub', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                  </div>

                  {/* Rahu Kalam */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-accent">Rahu Kalam</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Timing Window</label>
                      <input
                        type="text"
                        value={content.panchang?.rahuKalamValue || ''}
                        onChange={(e) => handlePanchangChange('rahuKalamValue', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Notice / Subtext</label>
                      <input
                        type="text"
                        value={content.panchang?.rahuKalamSub || ''}
                        onChange={(e) => handlePanchangChange('rahuKalamSub', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                      />
                    </div>
                  </div>

                  {/* Abhijit Muhurat */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-accent">Abhijit Muhurat</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Timing</label>
                      <input
                        type="text"
                        value={content.panchang?.abhijitMuhurat || ''}
                        onChange={(e) => handlePanchangChange('abhijitMuhurat', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                        placeholder="11:58 AM – 12:48 PM"
                      />
                    </div>
                  </div>

                  {/* Sunrise & Sunset */}
                  <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-accent">Sunrise & Sunset</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Sunrise</label>
                        <input
                          type="text"
                          value={content.panchang?.sunrise || ''}
                          onChange={(e) => handlePanchangChange('sunrise', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          placeholder="05:42 AM"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Sunset</label>
                        <input
                          type="text"
                          value={content.panchang?.sunset || ''}
                          onChange={(e) => handlePanchangChange('sunset', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm"
                          placeholder="07:12 PM"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      )}

      {activeTab === 'tab-service-pages' && <AdminServicePagesEditor />}
      {activeTab === 'tab-mahadasha-guides' && <AdminMahadashaGuidesEditor />}
    </div>
  );
}
