'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppServiceCategory,
  AppServiceItem,
  DEFAULT_SERVICE_CATEGORIES,
} from '@/lib/appDynamicContent';
import {
  Grid,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit2,
  RefreshCw,
  X,
  Check,
  Smartphone,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAppServicesEditor() {
  const [categories, setCategories] = useState<AppServiceCategory[]>(DEFAULT_SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>('cat-remedies');
  const [editingItem, setEditingItem] = useState<{ catIndex: number; itemIndex: number } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/app-dynamic/services');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.warn('Failed to fetch service categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/app-dynamic/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('App Services, Remedies & Panchang order published live to mobile app!');
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch {
      toast.error('Network error saving services configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset services and categories back to Vedic defaults?')) {
      setCategories(DEFAULT_SERVICE_CATEGORIES);
      setEditingItem(null);
      toast.info('Reset to default Vedic layout. Click "Publish Live to App" to save.');
    }
  };

  // Swapping Category order (Move Up/Down)
  const handleMoveCategory = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= categories.length) return;
    const copy = [...categories];
    const [moved] = copy.splice(idx, 1);
    copy.splice(target, 0, moved);
    const reordered = copy.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(reordered);
    toast.success(`Moved category "${moved.title}" ${dir === -1 ? 'Up' : 'Down'} (Position #${target + 1})`);
  };

  // Swapping Item order within Category (Move Up/Down)
  const handleMoveItem = (catIdx: number, itemIdx: number, dir: -1 | 1) => {
    const cat = categories[catIdx];
    const target = itemIdx + dir;
    if (target < 0 || target >= cat.items.length) return;
    const copyCats = [...categories];
    const copyItems = [...cat.items];
    const [moved] = copyItems.splice(itemIdx, 1);
    copyItems.splice(target, 0, moved);
    copyCats[catIdx] = {
      ...cat,
      items: copyItems.map((it, i) => ({ ...it, order: i + 1 })),
    };
    setCategories(copyCats);
    toast.success(`Moved item "${moved.name}" ${dir === -1 ? 'Up' : 'Down'} in ${cat.title}`);
  };

  const handleToggleCategoryActive = (catIdx: number) => {
    const copy = [...categories];
    copy[catIdx] = { ...copy[catIdx], active: !copy[catIdx].active };
    setCategories(copy);
  };

  const handleToggleItemActive = (catIdx: number, itemIdx: number) => {
    const copy = [...categories];
    const cat = copy[catIdx];
    const copyItems = [...cat.items];
    copyItems[itemIdx] = { ...copyItems[itemIdx], active: !copyItems[itemIdx].active };
    copy[catIdx] = { ...cat, items: copyItems };
    setCategories(copy);
  };

  const updateItemField = (catIdx: number, itemIdx: number, field: keyof AppServiceItem, val: any) => {
    const copy = [...categories];
    const cat = copy[catIdx];
    const copyItems = [...cat.items];
    copyItems[itemIdx] = { ...copyItems[itemIdx], [field]: val };
    copy[catIdx] = { ...cat, items: copyItems };
    setCategories(copy);
  };

  const handleAddItem = (catIdx: number) => {
    const cat = categories[catIdx];
    const newItem: AppServiceItem = {
      id: `item-${Date.now()}`,
      order: cat.items.length + 1,
      category: cat.category,
      name: 'New Service Item',
      desc: 'Expert personalized guidance',
      icon: 'auto_awesome',
      route: '/ai-chat-screen',
      color: cat.color || '#713B32',
      badge: 'New',
      active: true,
    };
    const copy = [...categories];
    copy[catIdx] = { ...cat, items: [...cat.items, newItem] };
    setCategories(copy);
    setEditingItem({ catIndex: catIdx, itemIndex: cat.items.length });
  };

  const handleDeleteItem = (catIdx: number, itemIdx: number) => {
    const cat = categories[catIdx];
    if (confirm(`Delete "${cat.items[itemIdx].name}" from ${cat.title}?`)) {
      const copy = [...categories];
      const filtered = cat.items.filter((_, i) => i !== itemIdx).map((it, i) => ({ ...it, order: i + 1 }));
      copy[catIdx] = { ...cat, items: filtered };
      setCategories(copy);
      if (editingItem?.catIndex === catIdx && editingItem?.itemIndex === itemIdx) {
        setEditingItem(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#713B32]/15 via-amber-500/10 to-transparent border border-[#713B32]/25 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#713B32]/20 text-[#713B32] dark:text-[#C9A84C]">
              <Grid size={22} />
            </span>
            <h2 className="text-xl font-bold text-foreground">
              Dynamic Services & Remedies Management
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage all 5 category card models: Sacred Remedies (Ashta Parihar), Panchang & Timings, Kundli & Vedic Tools, Consultations, and Life Guidance.
            Swap category positions and item positions in real time!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            title="Reset to default arrangement"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#713B32] text-white font-bold text-sm hover:bg-[#552B24] shadow-md transition disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Publishing...' : 'Publish Live to App'}
          </button>
        </div>
      </div>

      {/* Main Grid: Categories Management (7 cols) + Mobile Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Categories & Items Reordering */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Categories ({categories.length} Total · {categories.filter((c) => c.active).length} Active)
            </h3>
            <span className="text-xs text-muted-foreground">Use arrows to swap category order</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#713B32]" />
              <p className="text-sm font-semibold">Loading services configuration...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat, catIdx) => {
                const isExpanded = expandedCat === cat.id;
                const isFirst = catIdx === 0;
                const isLast = catIdx === categories.length - 1;

                return (
                  <div
                    key={cat.id}
                    className={`rounded-2xl border transition-all ${
                      cat.category === 'remedies'
                        ? 'border-[#713B32]/40 bg-[#713B32]/5'
                        : 'border-border bg-card'
                    } ${!cat.active ? 'opacity-50' : ''}`}
                  >
                    {/* Category Header */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-muted-foreground w-6 text-center">
                          #{catIdx + 1}
                        </span>

                        {/* Category Position Swapping (Up / Down) */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveCategory(catIdx, -1)}
                            disabled={isFirst}
                            title="Move Category UP (Swap position)"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 transition"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveCategory(catIdx, 1)}
                            disabled={isLast}
                            title="Move Category DOWN (Swap position)"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-20 transition"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{cat.title}</span>
                            <span className="text-xs text-amber-500 font-semibold">{cat.sanskrit}</span>
                            {cat.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#713B32]/10 text-[#713B32] dark:text-[#C9A84C] border border-[#713B32]/20">
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cat.items.length} items inside ({cat.items.filter((i) => i.active).length} active)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCategoryActive(catIdx)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                          title={cat.active ? 'Visible in app' : 'Hidden from app'}
                        >
                          {cat.active ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                          title="Expand/Collapse items"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Category Items List (Expanded) */}
                    {isExpanded && (
                      <div className="border-t border-border/70 p-4 space-y-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Items inside {cat.title}:
                          </span>
                          <button
                            onClick={() => handleAddItem(catIdx)}
                            className="flex items-center gap-1 text-xs font-bold text-[#713B32] dark:text-[#C9A84C] hover:underline"
                          >
                            <Plus size={14} /> Add Item
                          </button>
                        </div>

                        {cat.items.map((item, itemIdx) => {
                          const isItemEditing =
                            editingItem?.catIndex === catIdx && editingItem?.itemIndex === itemIdx;
                          const isItemFirst = itemIdx === 0;
                          const isItemLast = itemIdx === cat.items.length - 1;

                          return (
                            <div
                              key={item.id || itemIdx}
                              className={`rounded-xl border p-3 bg-card transition-all ${
                                isItemEditing ? 'border-amber-500 shadow-sm' : 'border-border'
                              } ${!item.active ? 'opacity-40' : ''}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {/* Item Position Swapping (Up / Down) */}
                                  <div className="flex flex-col gap-0.5">
                                    <button
                                      onClick={() => handleMoveItem(catIdx, itemIdx, -1)}
                                      disabled={isItemFirst}
                                      title="Move Item UP"
                                      className="p-0.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20"
                                    >
                                      <ArrowUp size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleMoveItem(catIdx, itemIdx, 1)}
                                      disabled={isItemLast}
                                      title="Move Item DOWN"
                                      className="p-0.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-20"
                                    >
                                      <ArrowDown size={12} />
                                    </button>
                                  </div>

                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white"
                                    style={{ backgroundColor: item.color || '#713B32' }}
                                  >
                                    {item.direction ? item.direction[0] : '✦'}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-foreground truncate">
                                        {item.name}
                                      </span>
                                      {item.sanskrit && (
                                        <span className="text-[10px] text-amber-500 font-semibold">
                                          ({item.sanskrit})
                                        </span>
                                      )}
                                      {item.badge && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 font-bold">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setEditingItem(isItemEditing ? null : { catIndex: catIdx, itemIndex: itemIdx })
                                    }
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                                    title="Edit item details"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleToggleItemActive(catIdx, itemIdx)}
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                                  >
                                    {item.active ? <Eye size={13} className="text-emerald-500" /> : <EyeOff size={13} />}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(catIdx, itemIdx)}
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Inline Item Editor Drawer */}
                              {isItemEditing && (
                                <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground">Title Name</label>
                                    <input
                                      type="text"
                                      value={item.name}
                                      onChange={(e) => updateItemField(catIdx, itemIdx, 'name', e.target.value)}
                                      className="w-full mt-1 p-2 rounded-lg bg-muted border border-border text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground">Sanskrit / Subhead</label>
                                    <input
                                      type="text"
                                      value={item.sanskrit || ''}
                                      onChange={(e) => updateItemField(catIdx, itemIdx, 'sanskrit', e.target.value)}
                                      className="w-full mt-1 p-2 rounded-lg bg-muted border border-border text-xs"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
                                    <input
                                      type="text"
                                      value={item.desc}
                                      onChange={(e) => updateItemField(catIdx, itemIdx, 'desc', e.target.value)}
                                      className="w-full mt-1 p-2 rounded-lg bg-muted border border-border text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground">Badge (optional)</label>
                                    <input
                                      type="text"
                                      value={item.badge || ''}
                                      onChange={(e) => updateItemField(catIdx, itemIdx, 'badge', e.target.value)}
                                      className="w-full mt-1 p-2 rounded-lg bg-muted border border-border text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-semibold text-muted-foreground">Color Hex</label>
                                    <input
                                      type="text"
                                      value={item.color}
                                      onChange={(e) => updateItemField(catIdx, itemIdx, 'color', e.target.value)}
                                      className="w-full mt-1 p-2 rounded-lg bg-muted border border-border text-xs"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Mobile App Simulator */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 rounded-3xl border border-border/80 bg-neutral-900 text-white p-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Mobile App Simulator (Services Screen)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                Live Preview
              </span>
            </div>

            {/* Mobile Viewport Screen */}
            <div className="mt-3 rounded-2xl bg-[#0F0B15] border border-white/10 p-3 h-[620px] overflow-y-auto space-y-3 font-sans text-xs">
              {/* Header inside phone */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#713B32]/30 via-amber-500/10 to-transparent border border-white/10">
                <h4 className="font-extrabold text-sm text-white">AstroParihar Services</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Categorized card models reflecting website remedies & panchang.
                </p>
                <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                  {['All', 'Remedies', 'Panchang', 'Kundli', 'Consultations', 'Guidance'].map((tab, i) => (
                    <span
                      key={tab}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        i === 0 ? 'bg-[#713B32] text-white' : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Render each Category Card Model */}
              {categories
                .filter((c) => c.active)
                .map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-white">{cat.title}</span>
                          <span className="text-[10px] text-amber-400 font-semibold">{cat.sanskrit}</span>
                        </div>
                        <p className="text-[9px] text-neutral-400">{cat.desc}</p>
                      </div>
                      {cat.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#713B32]/30 text-amber-300 border border-amber-400/20">
                          {cat.badge}
                        </span>
                      )}
                    </div>

                    {/* Items inside this Category Card Model */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {cat.items
                        .filter((i) => i.active)
                        .map((it) => (
                          <div
                            key={it.id}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-amber-400/30 flex items-center gap-2"
                          >
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: it.color || '#713B32' }}
                            >
                              {it.direction ? it.direction[0] : '✦'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[10px] text-neutral-200 truncate">{it.name}</p>
                              <p className="text-[8px] text-neutral-400 truncate">{it.sanskrit || it.desc}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
