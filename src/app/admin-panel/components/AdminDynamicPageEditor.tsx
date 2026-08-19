'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Save,
  Trash2,
  Eye,
  Code,
  CheckCircle2,
  AlertCircle,
  Layers,
  Search,
  Filter,
  Palette,
  Type,
  Edit3,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import {
  DynamicPageItem,
  TARGET_PAGES,
  SECTION_PLACEMENTS,
  getAllDynamicContents,
  saveDynamicPageContent,
  deleteDynamicPageContent,
} from '@/lib/dynamicContent';

export default function AdminDynamicPageEditor() {
  const [items, setItems] = useState<DynamicPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Top Level View Mode: 'composer' (Create/Edit) | 'manager' (Saved Content & Live Previews)
  const [viewMode, setViewMode] = useState<'composer' | 'manager'>('composer');

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPageId, setSelectedPageId] = useState<string>('horoscope-love');
  const [selectedPlacement, setSelectedPlacement] = useState<'top' | 'below-form' | 'educational' | 'remedies' | 'bottom'>('educational');
  const [theme, setTheme] = useState<'gold' | 'rose' | 'emerald' | 'cyan' | 'slate'>('gold');
  const [badge, setBadge] = useState<string>('Vedic Wisdom & Guidance');
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Editor sub-mode & content
  const [editorSubMode, setEditorSubMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const [htmlContent, setHtmlContent] = useState<string>(
    `<p>Enter astrological explanations, remedial instructions, planetary guidance, or classical principles here...</p>`
  );

  // Saved Content Manager State
  const [managerSearch, setManagerSearch] = useState<string>('');
  const [managerCategoryFilter, setManagerCategoryFilter] = useState<string>('all');
  const [previewingItem, setPreviewingItem] = useState<DynamicPageItem | null>(null);

  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Fetch items from Firestore
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const data = await getAllDynamicContents();
    setItems(data);
    if (data.length > 0 && !previewingItem) {
      setPreviewingItem(data[0]);
    }
    setLoading(false);
  }

  // Synchronize visual editor
  useEffect(() => {
    if (visualEditorRef.current && editorSubMode === 'visual') {
      if (visualEditorRef.current.innerHTML !== htmlContent) {
        visualEditorRef.current.innerHTML = htmlContent;
      }
    }
  }, [editorSubMode, editingId]);

  const formatDoc = (cmd: string, value: string = '') => {
    document.execCommand(cmd, false, value);
    if (visualEditorRef.current) {
      setHtmlContent(visualEditorRef.current.innerHTML);
    }
  };

  const handleVisualInput = () => {
    if (visualEditorRef.current) {
      setHtmlContent(visualEditorRef.current.innerHTML);
    }
  };

  const insertCustomBlock = (type: 'mantra' | 'remedy') => {
    if (type === 'mantra') {
      const mantraSnippet = `
        <div style="background: rgba(201,149,43,0.1); border-left: 4px solid #C9952B; padding: 14px 18px; border-radius: 10px; margin: 16px 0;">
          <p style="font-size: 11px; font-weight: 700; color: #f59e0b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">Vedic Shloka / Mantra</p>
          <p style="font-family: serif; font-size: 17px; font-weight: 600; color: #ffffff; margin: 0; line-height: 1.6;">ॐ नमः शिवाय ॥ Om Namah Shivaya ॥</p>
          <p style="font-size: 13px; color: #cbd5e1; margin-top: 6px; margin-bottom: 0;">Meaning & Chanting Rules: Chant 108 times at sunrise facing East using a Rudraksha mala.</p>
        </div>
      `;
      formatDoc('insertHTML', mantraSnippet);
    } else {
      const remedySnippet = `
        <div style="background: rgba(16,185,129,0.1); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 10px; margin: 16px 0;">
          <p style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">Prescribed Vedic Remedy</p>
          <p style="font-size: 14px; font-weight: 600; color: #ffffff; margin: 0;">Feed birds with seven soaked grains every Tuesday morning to alleviate planetary afflictions.</p>
        </div>
      `;
      formatDoc('insertHTML', remedySnippet);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let finalHtml = htmlContent;
    if (editorSubMode === 'visual' && visualEditorRef.current) {
      finalHtml = visualEditorRef.current.innerHTML;
    }

    if (!finalHtml || finalHtml.trim() === '' || finalHtml === '<br>') {
      setStatusMessage({ type: 'error', text: 'Content cannot be empty.' });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const targetPageObj = TARGET_PAGES.find((p) => p.id === selectedPageId);

      const savedPayload: Partial<DynamicPageItem> = {
        pageId: selectedPageId,
        pageTitle: targetPageObj?.title || selectedPageId,
        category: (targetPageObj?.category as any) || 'services',
        sectionPlacement: selectedPlacement,
        theme,
        badge: badge.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        htmlContent: finalHtml,
        status,
        order: 1,
      };

      if (editingId) {
        savedPayload.id = editingId;
      }

      const savedId = await saveDynamicPageContent(savedPayload);

      setStatusMessage({
        type: 'success',
        text: editingId ? 'Content updated successfully.' : 'Content published successfully to the page.',
      });

      setEditingId(savedId);
      await fetchItems();
      const updated = (await getAllDynamicContents()).find((x) => x.id === savedId);
      if (updated) setPreviewingItem(updated);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to save content. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = (item: DynamicPageItem) => {
    setEditingId(item.id);
    setSelectedPageId(item.pageId);
    setSelectedPlacement(item.sectionPlacement || 'educational');
    setTheme(item.theme || 'gold');
    setBadge(item.badge || '');
    setTitle(item.title || '');
    setSubtitle(item.subtitle || '');
    setStatus(item.status || 'published');
    setHtmlContent(item.htmlContent);
    setViewMode('composer');
    setEditorSubMode('visual');
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = item.htmlContent;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this content section?')) return;
    try {
      await deleteDynamicPageContent(id);
      if (editingId === id) {
        resetComposer();
      }
      await fetchItems();
      setStatusMessage({ type: 'success', text: 'Content deleted successfully.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to delete content.' });
    }
  };

  const resetComposer = () => {
    setEditingId(null);
    setSelectedPageId('horoscope-love');
    setSelectedPlacement('educational');
    setTheme('gold');
    setBadge('Vedic Wisdom & Guidance');
    setTitle('');
    setSubtitle('');
    setStatus('published');
    setHtmlContent(
      `<p>Enter astrological explanations, remedial instructions, planetary guidance, or classical principles here...</p>`
    );
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = `<p>Enter astrological explanations, remedial instructions, planetary guidance, or classical principles here...</p>`;
    }
  };

  // Filter pages for composer
  const filteredPages =
    selectedCategory === 'all'
      ? TARGET_PAGES
      : TARGET_PAGES.filter((p) => p.category === selectedCategory);

  // Filter items for manager
  const filteredItems = items.filter((it) => {
    const pageObj = TARGET_PAGES.find((p) => p.id === it.pageId);
    const matchCategory =
      managerCategoryFilter === 'all' || it.category === managerCategoryFilter;
    const term = managerSearch.toLowerCase();
    const matchSearch =
      !term ||
      it.title?.toLowerCase().includes(term) ||
      it.badge?.toLowerCase().includes(term) ||
      it.pageTitle?.toLowerCase().includes(term) ||
      pageObj?.route?.toLowerCase().includes(term);
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Page Content Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish and maintain custom articles, predictions, remedial guidelines, and educational content across Services, Panchang, and Remedy pages.
          </p>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('composer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'composer'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 size={14} />
            <span>{editingId ? 'Edit Content' : 'Create & Edit'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('manager')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'manager'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Saved Content ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border text-xs sm:text-sm transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* VIEW 1: COMPOSER (CREATE / EDIT) */}
      {viewMode === 'composer' && (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Settings Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={15} className="text-amber-400" /> Target Location
                </h3>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetComposer}
                    className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <PlusCircle size={12} /> New Section
                  </button>
                )}
              </div>

              {/* Module Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Module Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setSelectedCategory(newCat);
                    const validPages = newCat === 'all' ? TARGET_PAGES : TARGET_PAGES.filter((p) => p.category === newCat);
                    if (validPages.length > 0 && !validPages.some((p) => p.id === selectedPageId)) {
                      setSelectedPageId(validPages[0].id);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors cursor-pointer"
                >
                  <option value="all" className="bg-slate-950 text-white py-1.5">
                    ✨ All Categories (Services, Panchang, Remedies, General)
                  </option>
                  <option value="services" className="bg-slate-950 text-white py-1.5">
                    🔮 Vedic Services ({TARGET_PAGES.filter((p) => p.category === 'services').length} Pages)
                  </option>
                  <option value="panchang" className="bg-slate-950 text-white py-1.5">
                    🗓️ Panchang &amp; Muhurat ({TARGET_PAGES.filter((p) => p.category === 'panchang').length} Pages)
                  </option>
                  <option value="remedies" className="bg-slate-950 text-white py-1.5">
                    🛡️ Vedic Remedies ({TARGET_PAGES.filter((p) => p.category === 'remedies').length} Pages)
                  </option>
                  <option value="general" className="bg-slate-950 text-white py-1.5">
                    🌐 General &amp; Consultation ({TARGET_PAGES.filter((p) => p.category === 'general').length} Pages)
                  </option>
                </select>
              </div>

              {/* Target Page */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Select Target Page * ({filteredPages.length} available)
                </label>
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors cursor-pointer"
                >
                  {selectedCategory === 'all' ? (
                    <>
                      <optgroup label="🔮 Vedic Services &amp; Horoscopes" className="bg-slate-950 text-amber-400 font-bold">
                        {TARGET_PAGES.filter((p) => p.category === 'services').map((page) => (
                          <option key={page.id} value={page.id} className="bg-slate-950 text-white font-normal py-1">
                            {page.title} ({page.route})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🗓️ Panchang &amp; Muhurat" className="bg-slate-950 text-amber-400 font-bold">
                        {TARGET_PAGES.filter((p) => p.category === 'panchang').map((page) => (
                          <option key={page.id} value={page.id} className="bg-slate-950 text-white font-normal py-1">
                            {page.title} ({page.route})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🛡️ Vedic Remedies" className="bg-slate-950 text-amber-400 font-bold">
                        {TARGET_PAGES.filter((p) => p.category === 'remedies').map((page) => (
                          <option key={page.id} value={page.id} className="bg-slate-950 text-white font-normal py-1">
                            {page.title} ({page.route})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🌐 General &amp; Consultations" className="bg-slate-950 text-amber-400 font-bold">
                        {TARGET_PAGES.filter((p) => p.category === 'general').map((page) => (
                          <option key={page.id} value={page.id} className="bg-slate-950 text-white font-normal py-1">
                            {page.title} ({page.route})
                          </option>
                        ))}
                      </optgroup>
                    </>
                  ) : (
                    filteredPages.map((page) => (
                      <option key={page.id} value={page.id} className="bg-slate-950 text-white py-1">
                        {page.title} ({page.route})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Section Placement */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Section Placement *</label>
                <select
                  value={selectedPlacement}
                  onChange={(e) => setSelectedPlacement(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
                >
                  {SECTION_PLACEMENTS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-950 text-white py-1">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style & Metadata */}
              <div className="pt-3 border-t border-slate-800 space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Styling & Metadata
                </h4>

                {/* Color Theme */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Palette size={13} className="text-amber-400" /> Color Accent
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'gold', label: 'Gold', color: 'bg-amber-500' },
                      { id: 'rose', label: 'Rose', color: 'bg-rose-500' },
                      { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
                      { id: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
                      { id: 'slate', label: 'Slate', color: 'bg-slate-500' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id as any)}
                        className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 border transition-all ${
                          theme === t.id
                            ? 'border-amber-400 bg-amber-500/20 font-bold text-white'
                            : 'border-slate-800 bg-slate-950/60 opacity-70 hover:opacity-100 hover:bg-slate-800'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                        <span className="text-[10px] text-slate-200">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Badge */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Category Tag (Optional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Vedic Wisdom & Guidance"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 text-xs font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
                  />
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Section Heading (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Planetary Transitions & Remedies"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 text-xs font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Section Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Brief introductory summary"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 text-xs font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-colors"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Publication Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        status === 'published'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      ● Live (Published)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('draft')}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        status === 'draft'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      ○ Draft (Hidden)
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Saving Content...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>{editingId ? 'Save & Update Live Page' : 'Publish to Page'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Content Editor (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[580px] shadow-lg">
              {/* Header Bar with View Switcher */}
              <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Type size={14} className="text-amber-400" /> Content Editor
                </span>

                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditorSubMode('visual')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      editorSubMode === 'visual'
                        ? 'bg-slate-800 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Visual Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorSubMode('code')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      editorSubMode === 'code'
                        ? 'bg-slate-800 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code size={12} /> HTML Source
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorSubMode('preview')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      editorSubMode === 'preview'
                        ? 'bg-slate-800 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye size={12} /> Website Preview
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              {editorSubMode === 'visual' && (
                <div className="p-2 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center gap-1 text-xs">
                  {/* Inline formatting */}
                  <div className="flex items-center gap-0.5 border-r border-slate-800 pr-2">
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => formatDoc('bold')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => formatDoc('italic')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Italic size={15} />
                    </button>
                    <button
                      type="button"
                      title="Underline"
                      onClick={() => formatDoc('underline')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Underline size={15} />
                    </button>
                    <button
                      type="button"
                      title="Strikethrough"
                      onClick={() => formatDoc('strikeThrough')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Strikethrough size={15} />
                    </button>
                  </div>

                  {/* Heading options */}
                  <div className="flex items-center gap-0.5 border-r border-slate-800 pr-2">
                    <select
                      onChange={(e) => formatDoc('formatBlock', e.target.value)}
                      defaultValue="p"
                      className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-700 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="p" className="bg-slate-950 text-white">Paragraph</option>
                      <option value="h2" className="bg-slate-950 text-white">Heading 2</option>
                      <option value="h3" className="bg-slate-950 text-white">Heading 3</option>
                      <option value="h4" className="bg-slate-950 text-white">Heading 4</option>
                    </select>
                  </div>

                  {/* Alignment */}
                  <div className="flex items-center gap-0.5 border-r border-slate-800 pr-2">
                    <button
                      type="button"
                      title="Align Left"
                      onClick={() => formatDoc('justifyLeft')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <AlignLeft size={15} />
                    </button>
                    <button
                      type="button"
                      title="Align Center"
                      onClick={() => formatDoc('justifyCenter')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <AlignCenter size={15} />
                    </button>
                    <button
                      type="button"
                      title="Align Right"
                      onClick={() => formatDoc('justifyRight')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <AlignRight size={15} />
                    </button>
                    <button
                      type="button"
                      title="Justify"
                      onClick={() => formatDoc('justifyFull')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <AlignJustify size={15} />
                    </button>
                  </div>

                  {/* Lists & Quotes */}
                  <div className="flex items-center gap-0.5 border-r border-slate-800 pr-2">
                    <button
                      type="button"
                      title="Bullet List"
                      onClick={() => formatDoc('insertUnorderedList')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <List size={15} />
                    </button>
                    <button
                      type="button"
                      title="Numbered List"
                      onClick={() => formatDoc('insertOrderedList')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <ListOrdered size={15} />
                    </button>
                    <button
                      type="button"
                      title="Blockquote"
                      onClick={() => formatDoc('formatBlock', 'blockquote')}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Quote size={15} />
                    </button>
                  </div>

                  {/* Preset Blocks */}
                  <div className="flex items-center gap-1.5 pl-1">
                    <button
                      type="button"
                      onClick={() => insertCustomBlock('mantra')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                    >
                      + Mantra Box
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCustomBlock('remedy')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                    >
                      + Remedy Box
                    </button>
                    <button
                      type="button"
                      title="Insert Link"
                      onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) formatDoc('createLink', url);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <LinkIcon size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Editor Body */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60">
                {editorSubMode === 'visual' && (
                  <div
                    ref={visualEditorRef}
                    contentEditable
                    onInput={handleVisualInput}
                    className="min-h-[420px] outline-none text-slate-100 text-sm sm:text-base leading-relaxed prose prose-invert max-w-none focus:ring-0"
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                )}

                {editorSubMode === 'code' && (
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    rows={18}
                    className="w-full h-full min-h-[420px] font-mono text-xs p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-700 outline-none resize-none focus:border-amber-400"
                    placeholder="<p>HTML Content here...</p>"
                  />
                )}

                {editorSubMode === 'preview' && (
                  <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    {badge && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        ✦ {badge}
                      </span>
                    )}
                    {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
                    {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                    <div
                      className="text-sm text-slate-200 leading-relaxed space-y-3 pt-2"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* VIEW 2: SAVED CONTENT & LIVE PREVIEW MANAGER */}
      {viewMode === 'manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of Saved Contents (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter size={14} className="text-amber-400" /> Filter Saved Contents
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredItems.length} of {items.length} Sections
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  placeholder="Search articles by title, page..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                />
              </div>

              {/* Module Filter */}
              <select
                value={managerCategoryFilter}
                onChange={(e) => setManagerCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white outline-none focus:border-amber-400"
              >
                <option value="all" className="bg-slate-950 text-white">✨ All Categories ({items.length})</option>
                <option value="services" className="bg-slate-950 text-white">🔮 Vedic Services</option>
                <option value="panchang" className="bg-slate-950 text-white">🗓️ Panchang &amp; Muhurat</option>
                <option value="remedies" className="bg-slate-950 text-white">🛡️ Vedic Remedies</option>
                <option value="general" className="bg-slate-950 text-white">🌐 General Pages</option>
              </select>
            </div>

            {/* List of Saved Items */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading contents...</div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-400">
                  No saved contents found matching your search.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const targetPage = TARGET_PAGES.find((p) => p.id === item.pageId);
                  const isSelected = previewingItem?.id === item.id;
                  const pageRoute = targetPage?.route || '/services';
                  return (
                    <div
                      key={item.id}
                      onClick={() => setPreviewingItem(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-400 shadow-md'
                          : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 truncate max-w-[200px]">
                          {item.pageTitle || targetPage?.title || item.pageId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {item.status === 'published' ? '● Live' : '○ Draft'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                          {item.title || item.badge || 'Untitled Content Section'}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{pageRoute}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                        <span className="text-slate-400">Placement: {item.sectionPlacement}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Live Website Preview Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 sticky top-20 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Eye size={15} className="text-amber-400" /> Live Website Preview
                </span>
                {previewingItem && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditItem(previewingItem)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                    >
                      <Edit3 size={12} /> Edit in Composer
                    </button>
                    {(() => {
                      const pageRoute = TARGET_PAGES.find((p) => p.id === previewingItem.pageId)?.route || '/services';
                      return (
                        <a
                          href={pageRoute}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors"
                          title="Open Live Page"
                        >
                          <ExternalLink size={13} />
                        </a>
                      );
                    })()}
                  </div>
                )}
              </div>

              {previewingItem ? (
                <div className="space-y-4">
                  {/* Page context pill */}
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Target Route:</span>
                    <span className="font-mono text-white bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                      {TARGET_PAGES.find((p) => p.id === previewingItem.pageId)?.route || '/services'}
                    </span>
                  </div>

                  {/* Render the card exactly as shown on the website */}
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-inner">
                    {previewingItem.badge && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        ✦ {previewingItem.badge}
                      </span>
                    )}

                    {previewingItem.title && (
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {previewingItem.title}
                      </h3>
                    )}

                    {previewingItem.subtitle && (
                      <p className="text-xs text-slate-400">{previewingItem.subtitle}</p>
                    )}

                    <div
                      className="text-sm text-slate-200 leading-relaxed space-y-3 pt-2"
                      dangerouslySetInnerHTML={{ __html: previewingItem.htmlContent }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-400">
                  Select any saved content section from the left to preview it.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
