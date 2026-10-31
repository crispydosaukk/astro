'use client';

import React, { useState, useEffect } from 'react';
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
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

const APP_ROUTE_PRESETS = [
  { label: 'Sacred Remedies Screen (Ashta Parihar)', value: '/remedies-screen' },
  { label: 'Remedy Ritual Deep Dive', value: '/remedy-detail-screen' },
  { label: 'My Kundli (Birth Chart)', value: '/my-kundli-screen' },
  { label: 'Kundli Matching (Gun Milan)', value: '/match-kundli-screen' },
  { label: 'Today Panchang & Muhurat', value: '/panchang-screen' },
  { label: 'Daily Horoscope', value: '/horoscope-screen' },
  { label: 'Live Astrologers (Call / Chat)', value: '/live-astrologers-screen' },
  { label: '24/7 AI Astrologer Chat', value: '/ai-chat-screen' },
  { label: 'Career Astrology', value: '/career-astrology-screen' },
  { label: 'Marriage Astrology', value: '/marriage-astrology-screen' },
  { label: 'Business Astrology', value: '/business-astrology-screen' },
  { label: 'Finance & Wealth Astrology', value: '/finance-astrology-screen' },
  { label: 'Tarot Card Reading', value: '/tarot-screen' },
  { label: 'Numerology & Destiny', value: '/numerology-screen' },
  { label: 'Auspicious Muhurat', value: '/muhurat-screen' },
  { label: 'Spiritual Guidance & Meditation', value: '/spiritual-guidance-screen' },
  { label: 'Astrology Reports (PDF)', value: '/astrology-reports-screen' },
  { label: 'Devotee Wallet & Recharge', value: '/wallet-screen' },
  { label: 'Services Screen Hub', value: '/services-screen' },
];

export default function AdminAppServicesEditor() {
  const [categories, setCategories] = useState<AppServiceCategory[]>(DEFAULT_SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>('cat-remedies');
  const [editingItem, setEditingItem] = useState<{ catIndex: number; itemIndex: number } | null>(null);

  // Category Edit State
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);

  // Simulator Tab Filter
  const [simTab, setSimTab] = useState<string>('All');

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
        toast.success('App Services, Category Names, Tabs & Remedies published live to mobile app!');
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
      setEditingCatIndex(null);
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

  // Category CRUD
  const handleAddCategory = () => {
    const newId = `cat-custom-${Date.now()}`;
    const newCat: AppServiceCategory = {
      id: newId,
      order: categories.length + 1,
      category: 'custom',
      title: 'New Service Category',
      sanskrit: 'नई श्रेणी • Special Offerings',
      tabLabel: 'New Category',
      desc: 'Expert personalized spiritual guidance and services',
      badge: 'New',
      icon: 'auto_awesome',
      color: '#713B32',
      active: true,
      items: [],
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    setExpandedCat(newId);
    setEditingCatIndex(updated.length - 1);
    toast.success('New category added. Now you can edit its names, tabs and add items!');
  };

  const handleDeleteCategory = (catIdx: number) => {
    const cat = categories[catIdx];
    if (confirm(`Are you sure you want to delete category "${cat.title}" and its ${cat.items.length} items?`)) {
      const copy = categories.filter((_, i) => i !== catIdx).map((c, i) => ({ ...c, order: i + 1 }));
      setCategories(copy);
      if (editingCatIndex === catIdx) setEditingCatIndex(null);
      if (expandedCat === cat.id) setExpandedCat(copy[0]?.id || null);
      toast.success(`Category "${cat.title}" deleted.`);
    }
  };

  const updateCategoryField = (catIdx: number, field: keyof AppServiceCategory, val: any) => {
    const copy = [...categories];
    copy[catIdx] = { ...copy[catIdx], [field]: val };
    setCategories(copy);
  };

  // Item CRUD
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
      sanskrit: '',
      desc: 'Expert personalized guidance',
      icon: 'auto_awesome',
      route: '/live-astrologers-screen',
      color: cat.color || '#713B32',
      badge: 'New',
      active: true,
    };
    const copy = [...categories];
    copy[catIdx] = { ...cat, items: [...cat.items, newItem] };
    setCategories(copy);
    setEditingItem({ catIndex: catIdx, itemIndex: cat.items.length });
    toast.success(`Added new item to "${cat.title}"`);
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

  // Simulator tabs
  const activeCategories = categories.filter((c) => c.active);
  const simulatorTabs = ['All', ...activeCategories.map((c) => c.tabLabel || c.title.split(' ')[0] || 'Tab')];
  const displayedSimulatorCategories = simTab === 'All'
    ? activeCategories
    : activeCategories.filter(
        (c) =>
          (c.tabLabel && c.tabLabel.toLowerCase() === simTab.toLowerCase()) ||
          c.title.toLowerCase().includes(simTab.toLowerCase()) ||
          c.category.toLowerCase().includes(simTab.toLowerCase())
      );

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
            Edit Category Names, Tab Labels, Badges & Order. Add new categories and content items. Whatever order you set here reflects instantly in the mobile app!
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition shadow-xs"
          >
            <FolderPlus size={15} /> Add Category
          </button>
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers size={16} className="text-[#713B32]" />
              Categories ({categories.length} Total · {activeCategories.length} Active)
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
                const isCatEditing = editingCatIndex === catIdx;

                return (
                  <div
                    key={cat.id || catIdx}
                    className={`rounded-2xl border transition-all ${
                      cat.category === 'remedies'
                        ? 'border-[#713B32]/40 bg-[#713B32]/5'
                        : 'border-border bg-card'
                    } ${!cat.active ? 'opacity-50' : ''}`}
                  >
                    {/* Category Header */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
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

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground truncate">{cat.title}</span>
                            {cat.sanskrit && (
                              <span className="text-xs text-amber-500 font-semibold truncate">{cat.sanskrit}</span>
                            )}
                            {cat.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#713B32]/10 text-[#713B32] dark:text-[#C9A84C] border border-[#713B32]/20">
                                {cat.badge}
                              </span>
                            )}
                            {cat.tabLabel && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                Tab: {cat.tabLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {cat.items.length} items inside ({cat.items.filter((i) => i.active).length} active) · {cat.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Edit Category Name & Details */}
                        <button
                          onClick={() => setEditingCatIndex(isCatEditing ? null : catIdx)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                          title="Edit Category Name & Details"
                        >
                          <Edit2 size={16} />
                        </button>
                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleCategoryActive(catIdx)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                          title={cat.active ? 'Visible in app' : 'Hidden from app'}
                        >
                          {cat.active ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} />}
                        </button>
                        {/* Delete Category */}
                        <button
                          onClick={() => handleDeleteCategory(catIdx)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition"
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                        {/* Expand / Collapse */}
                        <button
                          onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                          title="Expand/Collapse items"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Inline Category Edit Drawer */}
                    {isCatEditing && (
                      <div className="p-4 border-t border-border/80 bg-amber-500/5 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Edit2 size={13} className="text-[#713B32]" />
                            Edit Category Names & Tab Settings
                          </span>
                          <button
                            onClick={() => setEditingCatIndex(null)}
                            className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                          >
                            Done
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground">Category Title</label>
                            <input
                              type="text"
                              value={cat.title}
                              onChange={(e) => updateCategoryField(catIdx, 'title', e.target.value)}
                              placeholder="e.g. Sacred Vedic Remedies"
                              className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs text-foreground font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground">Sanskrit / Subhead</label>
                            <input
                              type="text"
                              value={cat.sanskrit || ''}
                              onChange={(e) => updateCategoryField(catIdx, 'sanskrit', e.target.value)}
                              placeholder="e.g. अष्ट परिहार • Ashta-Digbandhana"
                              className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs text-foreground"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground">App Tab Pill Label</label>
                            <input
                              type="text"
                              value={cat.tabLabel || ''}
                              onChange={(e) => updateCategoryField(catIdx, 'tabLabel', e.target.value)}
                              placeholder="e.g. Remedies, Free Tools, Panchang"
                              className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs text-foreground font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground">Badge Text (Optional)</label>
                            <input
                              type="text"
                              value={cat.badge || ''}
                              onChange={(e) => updateCategoryField(catIdx, 'badge', e.target.value)}
                              placeholder="e.g. 8 in 1 Card, Free, Paid"
                              className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs text-foreground"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
                            <input
                              type="text"
                              value={cat.desc || ''}
                              onChange={(e) => updateCategoryField(catIdx, 'desc', e.target.value)}
                              placeholder="Description of this category"
                              className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs text-foreground"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground">Category Theme Color</label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="color"
                                value={cat.color || '#713B32'}
                                onChange={(e) => updateCategoryField(catIdx, 'color', e.target.value)}
                                className="w-8 h-8 rounded border border-border cursor-pointer p-0.5"
                              />
                              <input
                                type="text"
                                value={cat.color || '#713B32'}
                                onChange={(e) => updateCategoryField(catIdx, 'color', e.target.value)}
                                className="flex-1 p-2 rounded-lg bg-background border border-border text-xs text-foreground font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground">Category Key / Slug</label>
                            <input
                              type="text"
                              value={cat.category || ''}
                              onChange={(e) => updateCategoryField(catIdx, 'category', e.target.value)}
                              placeholder="e.g. remedies, kundli, panchang"
                              className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-xs text-foreground font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category Items List (Expanded) */}
                    {isExpanded && (
                      <div className="border-t border-border/70 p-4 space-y-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Items inside <span className="text-foreground font-bold">{cat.title}</span> ({cat.items.length}):
                          </span>
                          <button
                            onClick={() => handleAddItem(catIdx)}
                            className="flex items-center gap-1 text-xs font-bold text-[#713B32] dark:text-[#C9A84C] hover:underline"
                          >
                            <Plus size={14} /> Add Content Item
                          </button>
                        </div>

                        {cat.items.length === 0 ? (
                          <div className="p-6 text-center rounded-xl border border-dashed border-border bg-card/50">
                            <p className="text-xs text-muted-foreground">No items in this category yet.</p>
                            <button
                              onClick={() => handleAddItem(catIdx)}
                              className="mt-2 text-xs font-bold text-[#713B32] dark:text-[#C9A84C] hover:underline inline-flex items-center gap-1"
                            >
                              <Plus size={13} /> Add First Item
                            </button>
                          </div>
                        ) : (
                          cat.items.map((item, itemIdx) => {
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
                                        {item.route && (
                                          <span className="text-[9px] font-mono text-muted-foreground truncate">
                                            {item.route}
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
                                      title={item.active ? 'Active' : 'Inactive'}
                                    >
                                      {item.active ? <Eye size={13} className="text-emerald-500" /> : <EyeOff size={13} />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(catIdx, itemIdx)}
                                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                      title="Delete item"
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
                                      <label className="text-[11px] font-semibold text-muted-foreground">Destination App Route</label>
                                      <select
                                        value={item.route || '/live-astrologers-screen'}
                                        onChange={(e) => updateItemField(catIdx, itemIdx, 'route', e.target.value)}
                                        className="w-full mt-1 p-2 rounded-lg bg-muted border border-border text-xs font-mono"
                                      >
                                        {APP_ROUTE_PRESETS.map((p) => (
                                          <option key={p.value} value={p.value}>
                                            {p.label} ({p.value})
                                          </option>
                                        ))}
                                      </select>
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
                                    <div>
                                      <label className="text-[11px] font-semibold text-muted-foreground">Direction / Sanskrit Tag</label>
                                      <input
                                        type="text"
                                        value={item.direction || ''}
                                        onChange={(e) => updateItemField(catIdx, itemIdx, 'direction', e.target.value)}
                                        placeholder="e.g. North, East"
                                        className="w-full mt-1 p-2 rounded-lg bg-muted border border-border text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
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
            <div className="mt-3 rounded-2xl bg-[#0F0B15] border border-white/10 p-3 h-[640px] overflow-y-auto space-y-3 font-sans text-xs">
              {/* Header inside phone */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-[#713B32]/30 via-amber-500/10 to-transparent border border-white/10">
                <h4 className="font-extrabold text-sm text-white">AstroParihar Services</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Categorized card models reflecting website remedies & panchang.
                </p>
                {/* Interactive Dynamic Category Tabs */}
                <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1">
                  {simulatorTabs.map((tab) => {
                    const isTabActive = simTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSimTab(tab)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold whitespace-nowrap transition cursor-pointer ${
                          isTabActive
                            ? 'bg-[#713B32] text-white shadow-xs'
                            : 'bg-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Render each Category Card Model in EXACT order */}
              {displayedSimulatorCategories.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-xs">
                  No categories visible for "{simTab}".
                </div>
              ) : (
                displayedSimulatorCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-white">{cat.title}</span>
                          {cat.sanskrit && (
                            <span className="text-[10px] text-amber-400 font-semibold">{cat.sanskrit}</span>
                          )}
                        </div>
                        <p className="text-[9px] text-neutral-400 mt-0.5">{cat.desc}</p>
                      </div>
                      {cat.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#713B32]/30 text-amber-300 border border-amber-400/20 shrink-0">
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
