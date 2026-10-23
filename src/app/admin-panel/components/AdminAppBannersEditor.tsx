'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppBanner, DEFAULT_APP_BANNERS } from '@/lib/appDynamicContent';
import {
  LayoutTemplate,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Edit2,
  Search,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAppBannersEditor() {
  const [banners, setBanners] = useState<AppBanner[]>(DEFAULT_APP_BANNERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null);
  const [previewBannerIndex, setPreviewBannerIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/app-dynamic/banners');
      const data = await res.json();
      if (data.success && Array.isArray(data.banners)) {
        setBanners(data.banners);
      }
    } catch (err) {
      console.warn('Failed to load banners from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/app-dynamic/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('All promotional banners published live to mobile app!');
      } else {
        toast.error(data.error || 'Failed to save banners');
      }
    } catch (err: any) {
      toast.error('Network error saving banners');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all promotional banners to default settings?')) {
      setBanners([...DEFAULT_APP_BANNERS]);
      toast.info('Reset to default banners. Click "Save Live Changes" to apply.');
    }
  };

  const handleAddBanner = () => {
    const newBanner: AppBanner = {
      id: 'banner-' + Date.now(),
      order: banners.length + 1,
      title: 'Special Muhurat Pooja & Remedies',
      subtitle: 'Book sacred Vedic rituals performed by verified temple priests.',
      badge: 'Special Pooja',
      badgeColor: 'amber',
      imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop',
      ctaText: 'Book Pooja',
      ctaAction: '/consultation-booking-screen',
      active: true,
    };
    const updated = [...banners, newBanner];
    setBanners(updated);
    setEditingBannerIndex(updated.length - 1);
    toast.success('Added new promotional banner draft');
  };

  const handleDeleteBanner = (index: number) => {
    
    if (confirm(`Delete Banner ${index + 1}?`)) {
      const updated = banners.filter((_, i) => i !== index).map((b, idx) => ({ ...b, order: idx + 1 }));
      setBanners(updated);
      if (editingBannerIndex === index) setEditingBannerIndex(null);
      if (previewBannerIndex === index) setPreviewBannerIndex(null);
      toast.info('Banner removed');
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const copy = [...banners];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    const reordered = copy.map((b, idx) => ({ ...b, order: idx + 1 }));
    setBanners(reordered);
    if (editingBannerIndex === index) setEditingBannerIndex(targetIndex);
  };

  const handleToggleStatus = (index: number) => {
    setBanners((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], active: !copy[index].active };
      return copy;
    });
    toast.success(`Banner ${index + 1} status updated`);
  };

  const updateBanner = (index: number, patch: Partial<AppBanner>) => {
    setBanners((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const handleFileUpload = async (index: number, file: File) => {
    setUploading(banners[index].id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        updateBanner(index, { imageUrl: data.url });
        toast.success('Banner image uploaded successfully');
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(null);
    }
  };

  const filteredBanners = banners.filter((b) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      b.title.toLowerCase().includes(term) ||
      b.subtitle.toLowerCase().includes(term) ||
      (b.badge && b.badge.toLowerCase().includes(term));
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && b.active) ||
      (filterStatus === 'inactive' && !b.active);
    return matchSearch && matchStatus;
  });

  const editingBanner = editingBannerIndex !== null ? banners[editingBannerIndex] : null;
  const previewBanner = previewBannerIndex !== null ? banners[previewBannerIndex] : null;

  return (
    <div className="space-y-4">
      {/* Light Vedic Card Container */}
      <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden shadow-sm relative min-h-[450px]">
        {/* Header Toolbar */}
        <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-card">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 font-serif">
              <LayoutTemplate size={18} className="text-accent" /> App Dynamic : Home Banners & Promos
            </h2>
            <button
              type="button"
              onClick={fetchBanners}
              className="p-1.5 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Refresh Banners"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-accent' : ''} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search banners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-accent w-44"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-medium text-foreground outline-none focus:border-accent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5 shadow-xs"
              title="Reset to default banners"
            >
              <RotateCcw size={13} />
              Reset
            </button>

            {/* Add Banner */}
            <button
              type="button"
              onClick={handleAddBanner}
              className="px-3.5 py-2 rounded-xl bg-accent/10 border border-accent/30 text-xs font-bold text-accent hover:bg-accent/20 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              Add Banner
            </button>

            {/* Save Changes */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Live Changes'}
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40">
                <th className="px-5 py-3.5 whitespace-nowrap">ORDER</th>
                <th className="px-5 py-3.5 whitespace-nowrap">PREVIEW IMAGE</th>
                <th className="px-5 py-3.5 whitespace-nowrap">HEADLINE & PROMOTION</th>
                <th className="px-5 py-3.5 whitespace-nowrap">BADGE</th>
                <th className="px-5 py-3.5 whitespace-nowrap">ACTION TARGET</th>
                <th className="px-5 py-3.5 whitespace-nowrap">STATUS</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    No banners match your search query.
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner, idx) => {
                  const originalIndex = banners.findIndex((b) => b.id === banner.id);
                  return (
                    <motion.tr
                      key={banner.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Order and Reorder */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-muted border border-border text-foreground font-bold text-xs flex items-center justify-center">
                            {banner.order}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMove(originalIndex, 'up')}
                              disabled={originalIndex === 0}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(originalIndex, 'down')}
                              disabled={originalIndex === banners.length - 1}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Preview Image Thumbnail */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div
                          onClick={() => setPreviewBannerIndex(originalIndex)}
                          className="relative w-20 h-12 rounded-xl overflow-hidden bg-muted border border-border cursor-pointer group/img shadow-xs"
                          title="Click to preview banner card"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={14} className="text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Title & Subtitle */}
                      <td className="px-5 py-4">
                        <div className="max-w-xs">
                          <div className="font-bold text-foreground text-xs sm:text-sm leading-tight">
                            {banner.title}
                          </div>
                          <p className="mt-1 text-muted-foreground text-xs leading-relaxed line-clamp-1">
                            {banner.subtitle}
                          </p>
                        </div>
                      </td>

                      {/* Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {banner.badge ? (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              banner.badgeColor === 'indigo'
                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                                : banner.badgeColor === 'emerald'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : banner.badgeColor === 'red'
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-accent/15 text-accent border border-accent/30'
                            }`}
                          >
                            {banner.badge}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* CTA & Route */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground font-semibold text-xs flex items-center gap-1">
                            {banner.ctaText} <ExternalLink size={11} className="text-accent" />
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {banner.ctaAction}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(originalIndex)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            banner.active
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          ● {banner.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Card */}
                          <button
                            type="button"
                            onClick={() => setPreviewBannerIndex(originalIndex)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Preview Banner Card"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setEditingBannerIndex(originalIndex)}
                            className="p-1.5 rounded-lg text-accent hover:text-accent-foreground hover:bg-accent/15 transition-colors"
                            title="Edit Banner"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(originalIndex)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="Delete Banner"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-3">
          <div>
            Showing <span className="text-foreground font-bold">{banners.length}</span> promotional banners in mobile home carousel
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-[11px] text-muted-foreground font-medium">Auto-synced with mobile home screen</span>
          </div>
        </div>
      </div>

      {/* EDIT BANNER MODAL (Vedic Light Cream) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {editingBanner && editingBannerIndex !== null && (
              <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-2xl bg-card text-foreground rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 text-accent font-bold flex items-center justify-center text-xs">
                        {editingBannerIndex + 1}
                      </span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Edit Promotional Banner
                      </h3>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        ({editingBanner.id})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingBannerIndex(null)}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto space-y-4">
                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <div>
                        <label className="text-xs font-bold text-foreground block">Active on Mobile</label>
                        <p className="text-[11px] text-muted-foreground">Display this banner in user home carousel</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingBanner.active}
                        onChange={(e) => updateBanner(editingBannerIndex, { active: e.target.checked })}
                        className="h-4 w-4 rounded accent-accent cursor-pointer"
                      />
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Banner Headline</label>
                      <input
                        type="text"
                        value={editingBanner.title}
                        onChange={(e) => updateBanner(editingBannerIndex, { title: e.target.value })}
                        placeholder="Consult Master Astrologers Live"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Promotion Subtitle / Offer</label>
                      <textarea
                        rows={2}
                        value={editingBanner.subtitle}
                        onChange={(e) => updateBanner(editingBannerIndex, { subtitle: e.target.value })}
                        placeholder="Get instant answers for Career, Love & Finance..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-accent resize-none"
                      />
                    </div>

                    {/* Badge & Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Badge Text (Optional)</label>
                        <input
                          type="text"
                          value={editingBanner.badge || ''}
                          onChange={(e) => updateBanner(editingBannerIndex, { badge: e.target.value })}
                          placeholder="e.g. Trending Now"
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Badge Color</label>
                        <select
                          value={editingBanner.badgeColor || 'amber'}
                          onChange={(e) => updateBanner(editingBannerIndex, { badgeColor: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-accent"
                        >
                          <option value="amber">Amber / Vedic Gold</option>
                          <option value="indigo">Cosmic Indigo</option>
                          <option value="emerald">Emerald Green</option>
                          <option value="red">Vermilion Red</option>
                        </select>
                      </div>
                    </div>

                    {/* CTA Text and Route */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Button Text</label>
                        <input
                          type="text"
                          value={editingBanner.ctaText}
                          onChange={(e) => updateBanner(editingBannerIndex, { ctaText: e.target.value })}
                          placeholder="Talk to Astrologer"
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">App Route Target</label>
                        <input
                          type="text"
                          value={editingBanner.ctaAction}
                          onChange={(e) => updateBanner(editingBannerIndex, { ctaAction: e.target.value })}
                          placeholder="/talk-to-ai-astrologer"
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-accent font-mono"
                        />
                      </div>
                    </div>

                    {/* Image URL & Upload */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Banner Background Artwork URL</label>
                        {uploading === editingBanner.id && (
                          <span className="text-[11px] text-accent animate-pulse font-semibold">
                            Uploading image...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingBanner.imageUrl}
                          onChange={(e) => updateBanner(editingBannerIndex, { imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-xs font-bold text-foreground transition-all shadow-xs">
                          <Upload size={13} />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(editingBannerIndex, file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(editingBannerIndex)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      Delete Banner
                    </button>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingBannerIndex(null)}
                        className="px-5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBannerIndex(null);
                          handleSave();
                        }}
                        className="px-6 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Check size={14} />
                        Apply & Publish
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* QUICK BANNER PREVIEW MODAL */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {previewBanner && previewBannerIndex !== null && (
              <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative bg-card text-foreground rounded-3xl border border-border shadow-2xl p-6 flex flex-col space-y-4 max-w-md w-full"
                >
                  <div className="flex items-center justify-between w-full border-b border-border pb-3">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <LayoutTemplate size={14} /> Mobile Home Carousel Card
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewBannerIndex(null)}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Card mockup */}
                  <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl h-52 flex flex-col justify-between p-5 bg-[#080D1A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewBanner.imageUrl}
                      alt={previewBanner.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-45"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-[#080D1A]/70 to-transparent" />

                    <div className="relative z-10 flex items-center justify-between">
                      {previewBanner.badge && (
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            previewBanner.badgeColor === 'indigo'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                              : previewBanner.badgeColor === 'emerald'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : previewBanner.badgeColor === 'red'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {previewBanner.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-white/70 bg-black/60 px-2 py-0.5 rounded-md font-mono">
                        Slide #{previewBanner.order}
                      </span>
                    </div>

                    <div className="relative z-10 space-y-2">
                      <h4 className="text-base font-extrabold text-white leading-tight">
                        {previewBanner.title}
                      </h4>
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                        {previewBanner.subtitle}
                      </p>
                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E2C26A] text-[#080D1A] font-extrabold text-xs shadow-md flex items-center gap-1.5"
                        >
                          <span>{previewBanner.ctaText}</span>
                          <ExternalLink size={11} />
                        </button>
                        <span className="text-[10px] text-white/60 font-mono">
                          {previewBanner.ctaAction}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewBannerIndex(null)}
                      className="px-5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs"
                    >
                      Close Preview
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
