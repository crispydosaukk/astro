'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppOnboardingSlide, DEFAULT_ONBOARDING_SLIDES } from '@/lib/appDynamicContent';
import {
  Smartphone,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  Sparkles,
  Upload,
  CheckCircle2,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Edit2,
  Search,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

const PRESET_ICONS = ['✦', '◉', '❋', '☀️', '🕉️', '🌌', '🪐', '✨', '🌙', '🔮'];

const PRESET_IMAGES = [
  { label: 'Deep Cosmic Stars (Slide 1)', url: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { label: 'Vedic Astrologer & AI (Slide 2)', url: '/assets/images/onboarding_astrologer.jpg' },
  { label: 'Golden Mountain Sunrise (Slide 3)', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&fit=crop' },
  { label: 'Cosmic Nebula Colors', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop' },
  { label: 'Sacred Meditation Lotus', url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop' },
];

export default function AdminAppOnboardingEditor() {
  const [slides, setSlides] = useState<AppOnboardingSlide[]>(DEFAULT_ONBOARDING_SLIDES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/app-dynamic/onboarding');
      const data = await res.json();
      if (data.success && Array.isArray(data.slides) && data.slides.length > 0) {
        setSlides(data.slides);
      }
    } catch (err) {
      console.warn('Failed to load slides from API, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/app-dynamic/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('All onboarding slides published live to mobile app!');
      } else {
        toast.error(data.error || 'Failed to save slides');
      }
    } catch (err: any) {
      toast.error('Network error saving slides');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all slides to default Vedic settings?')) {
      setSlides([...DEFAULT_ONBOARDING_SLIDES]);
      toast.info('Reset to default slides. Click "Save Live Changes" to apply.');
    }
  };

  const handleAddSlide = () => {
    const newSlide: AppOnboardingSlide = {
      id: 'slide-' + Date.now(),
      order: slides.length + 1,
      title: 'New Cosmic\nInsight',
      titleHighlight: 'Cosmic Insight',
      subtitle: 'Personalised astrological predictions and spiritual wisdom tailored for your soul path.',
      icon: '✦',
      imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop',
      semanticLabel: 'Cosmic nebula with glowing stars',
      active: true,
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setEditingSlideIndex(updated.length - 1);
    toast.success('Added new slide draft. Edit details below.');
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert('You must have at least one onboarding slide.');
      return;
    }
    if (confirm(`Delete Slide ${index + 1}?`)) {
      const updated = slides.filter((_, i) => i !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
      setSlides(updated);
      if (editingSlideIndex === index) setEditingSlideIndex(null);
      if (previewSlideIndex === index) setPreviewSlideIndex(null);
      toast.info('Slide deleted');
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const copy = [...slides];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    const reordered = copy.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(reordered);
    if (editingSlideIndex === index) setEditingSlideIndex(targetIndex);
  };

  const handleToggleStatus = (index: number) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], active: !copy[index].active };
      return copy;
    });
    toast.success(`Slide ${index + 1} status updated`);
  };

  const updateSlide = (index: number, patch: Partial<AppOnboardingSlide>) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  const handleFileUpload = async (index: number, file: File) => {
    setUploading(slides[index].id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        updateSlide(index, { imageUrl: data.url });
        toast.success('Image uploaded successfully');
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(null);
    }
  };

  const filteredSlides = slides.filter((s) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      s.title.toLowerCase().includes(term) ||
      s.titleHighlight.toLowerCase().includes(term) ||
      s.subtitle.toLowerCase().includes(term);
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && s.active) ||
      (filterStatus === 'inactive' && !s.active);
    return matchSearch && matchStatus;
  });

  const editingSlide = editingSlideIndex !== null ? slides[editingSlideIndex] : null;
  const previewSlide = previewSlideIndex !== null ? slides[previewSlideIndex] : null;

  return (
    <div className="space-y-4">
      {/* Light Vedic Card Container matching AdminAstrologersTable / AdminAppointmentsTable */}
      <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden shadow-sm relative min-h-[450px]">
        {/* Header Toolbar */}
        <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-card">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 font-serif">
              <Smartphone size={18} className="text-accent" /> App Dynamic : Onboarding Slides
            </h2>
            <button
              type="button"
              onClick={fetchSlides}
              className="p-1.5 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Refresh Slides"
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
                placeholder="Search slides..."
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

            {/* Reset Defaults */}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5 shadow-xs"
              title="Reset to default slides"
            >
              <RotateCcw size={13} />
              Reset
            </button>

            {/* Add Slide */}
            <button
              type="button"
              onClick={handleAddSlide}
              className="px-3.5 py-2 rounded-xl bg-accent/10 border border-accent/30 text-xs font-bold text-accent hover:bg-accent/20 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              Add Slide
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
                <th className="px-5 py-3.5 whitespace-nowrap">HERO IMAGE</th>
                <th className="px-5 py-3.5 whitespace-nowrap">TITLE & HIGHLIGHT</th>
                <th className="px-5 py-3.5">SUBTITLE / WISDOM</th>
                <th className="px-5 py-3.5 text-center whitespace-nowrap">SACRED ICON</th>
                <th className="px-5 py-3.5 whitespace-nowrap">STATUS</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredSlides.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    No onboarding slides match your search query.
                  </td>
                </tr>
              ) : (
                filteredSlides.map((slide, idx) => {
                  const originalIndex = slides.findIndex((s) => s.id === slide.id);
                  return (
                    <motion.tr
                      key={slide.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Order and Reorder arrows */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-muted border border-border text-foreground font-bold text-xs flex items-center justify-center">
                            {slide.order}
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
                              disabled={originalIndex === slides.length - 1}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Hero Image Thumbnail */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div
                          onClick={() => setPreviewSlideIndex(originalIndex)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted border border-border cursor-pointer group/img shadow-xs"
                          title="Click to preview on device"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slide.imageUrl}
                            alt={slide.semanticLabel}
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

                      {/* Title & Vedic Gold Highlight */}
                      <td className="px-5 py-4">
                        <div className="min-w-[180px] max-w-[240px]">
                          <div className="font-bold text-foreground text-xs sm:text-sm whitespace-pre-line leading-tight">
                            {slide.title}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 border border-accent/30 text-accent font-semibold truncate">
                              ★ {slide.titleHighlight}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subtitle / Description */}
                      <td className="px-5 py-4">
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 max-w-sm">
                          {slide.subtitle}
                        </p>
                      </td>

                      {/* Sacred Icon */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/30 text-accent flex items-center justify-center font-bold text-sm mx-auto shadow-xs">
                          {slide.icon}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(originalIndex)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            slide.active
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          ● {slide.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Phone Preview */}
                          <button
                            type="button"
                            onClick={() => setPreviewSlideIndex(originalIndex)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Preview in Mobile Mockup"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit Slide */}
                          <button
                            type="button"
                            onClick={() => setEditingSlideIndex(originalIndex)}
                            className="p-1.5 rounded-lg text-accent hover:text-accent-foreground hover:bg-accent/15 transition-colors"
                            title="Edit Slide Content"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(originalIndex)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="Delete Slide"
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
            Showing <span className="text-foreground font-bold">{slides.length}</span> onboarding slides in carousel rotation
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-[11px] text-muted-foreground font-medium">Real-time sync enabled with iOS & Android app</span>
          </div>
        </div>
      </div>

      {/* EDIT SLIDE MODAL (Light Vedic Theme) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {editingSlide && editingSlideIndex !== null && (
              <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-4xl bg-card text-foreground rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 text-accent font-bold flex items-center justify-center text-xs">
                        {editingSlideIndex + 1}
                      </span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Edit Slide {editingSlideIndex + 1} Configuration
                      </h3>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        ({editingSlide.id})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingSlideIndex(null)}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Body: 2 Columns */}
                  <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left Form (7 cols) */}
                    <div className="md:col-span-7 space-y-4">
                      {/* Active Toggle */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                        <div>
                          <label className="text-xs font-bold text-foreground block">
                            Show in Mobile App
                          </label>
                          <p className="text-[11px] text-muted-foreground">
                            Enable or disable this slide from user scroll flow
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingSlide.active}
                          onChange={(e) =>
                            updateSlide(editingSlideIndex, { active: e.target.checked })
                          }
                          className="h-4 w-4 rounded accent-accent cursor-pointer"
                        />
                      </div>

                      {/* Title */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">Slide Title</label>
                          <span className="text-[11px] text-muted-foreground">Use \n for line break</span>
                        </div>
                        <input
                          type="text"
                          value={editingSlide.title}
                          onChange={(e) =>
                            updateSlide(editingSlideIndex, { title: e.target.value })
                          }
                          placeholder="Discover Your\nCosmic Path"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                        />
                      </div>

                      {/* Highlighted Keyword */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Highlighted Vedic Keyword / Phrase
                          </label>
                          <span className="text-[11px] font-semibold text-accent">
                            Vedic Gold Accent
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editingSlide.titleHighlight}
                          onChange={(e) =>
                            updateSlide(editingSlideIndex, { titleHighlight: e.target.value })
                          }
                          placeholder="Cosmic Path"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Appears in radiant glowing gold inside the title.
                        </p>
                      </div>

                      {/* Subtitle */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">
                          Subtitle / Description
                        </label>
                        <textarea
                          rows={3}
                          value={editingSlide.subtitle}
                          onChange={(e) =>
                            updateSlide(editingSlideIndex, { subtitle: e.target.value })
                          }
                          placeholder="Personalised Vedic astrology based on your exact birth details..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                        />
                      </div>

                      {/* Sacred Icon */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">
                          Sacred Icon Indicator
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingSlide.icon}
                            onChange={(e) =>
                              updateSlide(editingSlideIndex, { icon: e.target.value })
                            }
                            className="w-14 px-2 py-2 rounded-xl bg-background border border-border text-foreground text-center font-bold text-base outline-none focus:border-accent"
                          />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {PRESET_ICONS.map((ic) => (
                              <button
                                key={ic}
                                type="button"
                                onClick={() => updateSlide(editingSlideIndex, { icon: ic })}
                                className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center transition-all ${
                                  editingSlide.icon === ic
                                    ? 'border-accent bg-accent/15 text-accent font-bold'
                                    : 'border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground'
                                }`}
                              >
                                {ic}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hero Image */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            Hero Background Image URL
                          </label>
                          {uploading === editingSlide.id && (
                            <span className="text-[11px] text-accent animate-pulse font-semibold">
                              Uploading...
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingSlide.imageUrl}
                            onChange={(e) =>
                              updateSlide(editingSlideIndex, { imageUrl: e.target.value })
                            }
                            placeholder="https://images.unsplash.com/... or /assets/images/..."
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
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
                                if (file) handleFileUpload(editingSlideIndex, file);
                              }}
                            />
                          </label>
                        </div>

                        {/* Presets */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] text-muted-foreground font-medium">Presets:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_IMAGES.map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() =>
                                  updateSlide(editingSlideIndex, { imageUrl: preset.url })
                                }
                                className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                                  editingSlide.imageUrl === preset.url
                                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                                    : 'border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Semantic Label */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">
                          Semantic Description (Accessibility)
                        </label>
                        <input
                          type="text"
                          value={editingSlide.semanticLabel}
                          onChange={(e) =>
                            updateSlide(editingSlideIndex, { semanticLabel: e.target.value })
                          }
                          placeholder="Description for screen readers and TalkBack"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    {/* Right Live Phone Preview (5 cols) */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="w-full max-w-[280px] space-y-3">
                        <div className="text-center">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                            Live Phone Preview
                          </span>
                        </div>

                        {/* Phone Frame */}
                        <div className="relative mx-auto w-[260px] h-[520px] bg-[#080D1A] rounded-[36px] border-[5px] border-[#222B3E] shadow-2xl overflow-hidden flex flex-col">
                          {/* Notch */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-[#222B3E] rounded-full z-30" />

                          {/* Status Bar */}
                          <div className="absolute top-2.5 left-0 right-0 px-5 flex items-center justify-between text-[10px] font-semibold text-white/80 z-20">
                            <span>9:41</span>
                            <div className="flex items-center gap-1">
                              <span>5G</span>
                              <div className="w-3.5 h-1.5 border border-white/80 rounded-2xs p-0.5">
                                <div className="w-full h-full bg-white/80 rounded-3xs" />
                              </div>
                            </div>
                          </div>

                          {/* Sign In */}
                          <div className="absolute top-8 right-4 z-20">
                            <span className="text-[10px] text-[#C9A84C] font-bold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-[#C9A84C]/30">
                              Sign In
                            </span>
                          </div>

                          {/* Hero Artwork */}
                          <div className="absolute top-0 left-0 right-0 h-[56%] overflow-hidden bg-[#0A1020]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={editingSlide.imageUrl}
                              alt={editingSlide.semanticLabel}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop';
                              }}
                            />
                            <div
                              className="absolute inset-0"
                              style={{
                                background:
                                  'linear-gradient(to bottom, rgba(8,13,26,0) 30%, rgba(8,13,26,0.7) 65%, #080D1A 100%)',
                              }}
                            />
                          </div>

                          {/* Text & Controls */}
                          <div className="absolute top-[46%] left-0 right-0 bottom-0 px-5 flex flex-col justify-between pb-5 z-10">
                            <div className="space-y-2.5">
                              <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[10px] font-bold text-[#C9A84C]">
                                {editingSlide.icon}
                              </div>

                              <h4 className="text-base font-extrabold text-[#F0EAD6] leading-tight whitespace-pre-line">
                                {(() => {
                                  const title = editingSlide.title || '';
                                  const hl = editingSlide.titleHighlight || '';
                                  if (!hl || !title.includes(hl)) {
                                    return title;
                                  }
                                  const parts = title.split(hl);
                                  return (
                                    <>
                                      {parts[0]}
                                      <span className="text-[#C9A84C]">{hl}</span>
                                      {parts[1]}
                                    </>
                                  );
                                })()}
                              </h4>

                              <p className="text-[11px] text-[#A0A8C0] leading-relaxed line-clamp-3">
                                {editingSlide.subtitle}
                              </p>
                            </div>

                            <div className="space-y-3 pt-1">
                              <div className="flex items-center gap-1">
                                {slides.map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`h-1 rounded-full transition-all ${
                                      editingSlideIndex === idx ? 'w-5 bg-[#C9A84C]' : 'w-1 bg-white/20'
                                    }`}
                                  />
                                ))}
                              </div>

                              <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E2C26A] text-[#080D1A] font-extrabold text-[11px] shadow-lg flex items-center justify-center gap-1.5">
                                <span>Continue</span>
                                <ChevronRight size={12} />
                              </div>
                            </div>
                          </div>

                          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-white/30 rounded-full z-20" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(editingSlideIndex)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={13} />
                      Delete Slide
                    </button>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingSlideIndex(null)}
                        className="px-5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlideIndex(null);
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

      {/* QUICK DEVICE PREVIEW MODAL */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {previewSlide && previewSlideIndex !== null && (
              <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative bg-card text-foreground rounded-3xl border border-border shadow-2xl p-6 flex flex-col items-center space-y-4 max-w-sm w-full"
                >
                  <div className="flex items-center justify-between w-full border-b border-border pb-3">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone size={14} /> Mobile App Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewSlideIndex(null)}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Device mockup */}
                  <div className="relative w-[280px] h-[550px] bg-[#080D1A] rounded-[40px] border-[5px] border-[#222B3E] shadow-2xl overflow-hidden flex flex-col">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-[#222B3E] rounded-full z-30" />
                    <div className="absolute top-2.5 left-0 right-0 px-5 flex items-center justify-between text-[10px] font-semibold text-white/80 z-20">
                      <span>9:41</span>
                      <span>5G</span>
                    </div>

                    <div className="absolute top-8 right-4 z-20">
                      <span className="text-[10px] text-[#C9A84C] font-bold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-[#C9A84C]/30">
                        Sign In
                      </span>
                    </div>

                    <div className="absolute top-0 left-0 right-0 h-[56%] overflow-hidden bg-[#0A1020]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewSlide.imageUrl}
                        alt={previewSlide.semanticLabel}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop';
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(to bottom, rgba(8,13,26,0) 30%, rgba(8,13,26,0.7) 65%, #080D1A 100%)',
                        }}
                      />
                    </div>

                    <div className="absolute top-[46%] left-0 right-0 bottom-0 px-5 flex flex-col justify-between pb-5 z-10">
                      <div className="space-y-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[10px] font-bold text-[#C9A84C]">
                          {previewSlide.icon}
                        </div>

                        <h4 className="text-base font-extrabold text-[#F0EAD6] leading-tight whitespace-pre-line">
                          {(() => {
                            const title = previewSlide.title || '';
                            const hl = previewSlide.titleHighlight || '';
                            if (!hl || !title.includes(hl)) {
                              return title;
                            }
                            const parts = title.split(hl);
                            return (
                              <>
                                {parts[0]}
                                <span className="text-[#C9A84C]">{hl}</span>
                                {parts[1]}
                              </>
                            );
                          })()}
                        </h4>

                        <p className="text-[11px] text-[#A0A8C0] leading-relaxed line-clamp-3">
                          {previewSlide.subtitle}
                        </p>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-1">
                          {slides.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewSlideIndex(idx)}
                              className={`h-1 rounded-full transition-all ${
                                previewSlideIndex === idx ? 'w-5 bg-[#C9A84C]' : 'w-1 bg-white/20'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E2C26A] text-[#080D1A] font-extrabold text-[11px] shadow-lg flex items-center justify-center gap-1.5">
                          <span>
                            {previewSlideIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
                          </span>
                          <ChevronRight size={12} />
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-white/30 rounded-full z-20" />
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between w-full pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewSlideIndex((p) =>
                          p !== null ? (p - 1 + slides.length) % slides.length : 0
                        )
                      }
                      className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-semibold text-foreground hover:bg-muted flex items-center gap-1"
                    >
                      <ChevronLeft size={13} />
                      Prev
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Slide {(previewSlideIndex ?? 0) + 1} of {slides.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewSlideIndex((p) =>
                          p !== null ? (p + 1) % slides.length : 0
                        )
                      }
                      className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-semibold text-foreground hover:bg-muted flex items-center gap-1"
                    >
                      Next
                      <ChevronRight size={13} />
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
