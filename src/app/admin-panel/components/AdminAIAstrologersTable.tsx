'use client';

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import {
  Bot,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  Search,
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
  Clock,
  PhoneCall,
  Loader2,
  Globe,
  Award,
  Layers,
  Save,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import LogoutModal from '@/components/LogoutModal';
import {
  AIAstrologer,
  AIDiscipline,
  DEFAULT_AI_ASTROLOGERS,
  DEFAULT_AI_DISCIPLINES,
} from '@/lib/aiAstrologerData';

export default function AdminAIAstrologersTable() {
  const [astrologers, setAstrologers] = useState<AIAstrologer[]>([]);
  const [disciplines, setDisciplines] = useState<AIDiscipline[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'astrologers' | 'disciplines'>('astrologers');
  const [search, setSearch] = useState('');

  // Edit / Add Modal States
  const [showAstroModal, setShowAstroModal] = useState(false);
  const [editingAstro, setEditingAstro] = useState<AIAstrologer | null>(null);

  const [showDiscModal, setShowDiscModal] = useState(false);
  const [editingDisc, setEditingDisc] = useState<AIDiscipline | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai-astrologers');
      const data = await res.json();
      if (data.astrologers) setAstrologers(data.astrologers);
      if (data.disciplines) setDisciplines(data.disciplines);
      if (data.analytics) setAnalytics(data.analytics);
    } catch (err) {
      console.warn('Fallback to defaults:', err);
      setAstrologers(DEFAULT_AI_ASTROLOGERS);
      setDisciplines(DEFAULT_AI_DISCIPLINES);
    } finally {
      setLoading(false);
    }
  };

  // Save AI Astrologer
  const handleSaveAstrologer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAstro) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/ai-astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_astrologer',
          astrologer: editingAstro,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`AI Astrologer "${editingAstro.name}" saved successfully`);
        setShowAstroModal(false);
        setEditingAstro(null);
        fetchAdminData();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete AI Astrologer
  const handleDeleteAstrologer = async (astro: AIAstrologer) => {
    if (!confirm(`Are you sure you want to delete AI Astrologer "${astro.name}"?`)) return;
    try {
      const res = await fetch('/api/admin/ai-astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_astrologer',
          astrologer: { id: astro.id },
        }),
      });
      if (res.ok) {
        toast.success(`Deleted "${astro.name}"`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // Save Discipline
  const handleSaveDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisc) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/ai-astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_discipline',
          discipline: editingDisc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Discipline "${editingDisc.name}" saved`);
        setShowDiscModal(false);
        setEditingDisc(null);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to save discipline');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAstrologers = astrologers.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.primaryDiscipline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 font-serif">
            <Bot className="text-[#C9952B]" size={26} /> AI Astrologer Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure AI personas, disciplines, per-minute pricing, voice models, and view real-time
            consultation analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-border hover:border-[#C9952B] bg-card text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Refresh Live Data"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin text-[#C9952B]' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Sign Out of Admin Panel"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>

          {activeSubTab === 'astrologers' ? (
            <button
              onClick={() => {
                setEditingAstro({
                  id: '',
                  name: '',
                  avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
                  tagline: '',
                  bio: '',
                  primaryDiscipline: disciplines[0]?.name || 'Vedic Jyotish',
                  secondaryDisciplines: ['Remedial Astrology'],
                  specialities: ['Career & Promotion', 'Marriage & Relationships'],
                  languages: ['English', 'Hindi'],
                  specialityScores: [{ name: 'Vedic Analysis', score: 98 }],
                  pricePerMin: 25,
                  pricePerMinUSD: 1.25,
                  experienceYears: 20,
                  rating: 4.95,
                  totalConsultations: 0,
                  isActive: true,
                  isFeatured: false,
                  voiceGender: 'male',
                  voiceId: 'onyx',
                  consultationStyle: 'Empowering, Classical & Deeply Accurate',
                  systemPersonaPrompt: 'You are an authentic Vedic Astrologer at AstroParihar.',
                });
                setShowAstroModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#C9952B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#C9952B]/20 hover:bg-[#b08022] transition-colors"
            >
              <Plus size={15} /> Add AI Astrologer
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingDisc({
                  id: '',
                  name: '',
                  slug: '',
                  description: '',
                  iconName: 'Sparkles',
                  isActive: true,
                  order: disciplines.length + 1,
                });
                setShowDiscModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#C9952B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#C9952B]/20 hover:bg-[#b08022] transition-colors"
            >
              <Plus size={15} /> Add Discipline
            </button>
          )}
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Total AI Calls</span>
            <PhoneCall size={16} className="text-[#C9952B]" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {analytics ? Number(analytics.totalConsultations || 0).toLocaleString() : '0'}
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold">24x7 Active Agents</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">AI Revenue</span>
            <DollarSign size={16} className="text-[#C9952B]" />
          </div>
          <div className="text-xl font-bold text-[#C9952B]">
            ₹{analytics ? Number(analytics.totalRevenue || 0).toLocaleString() : '0'}
          </div>
          <span className="text-[10px] text-muted-foreground">Prepaid Wallet Debits</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Total Minutes</span>
            <Clock size={16} className="text-[#C9952B]" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {analytics ? Number(analytics.totalMinutes || 0).toLocaleString() : '0'} mins
          </div>
          <span className="text-[10px] text-muted-foreground">
            Avg. {analytics?.avgDurationMinutes || '0.0'} min / call
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Active Personas</span>
            <Bot size={16} className="text-[#C9952B]" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {astrologers.filter((a) => a.isActive).length} / {astrologers.length}
          </div>
          <span className="text-[10px] text-emerald-500">
            {disciplines.filter((d) => d.isActive).length} Disciplines Enabled
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-border">
        <button
          onClick={() => setActiveSubTab('astrologers')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'astrologers'
              ? 'border-[#C9952B] text-[#C9952B]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bot size={15} /> AI Astrologers ({astrologers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('disciplines')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'disciplines'
              ? 'border-[#C9952B] text-[#C9952B]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers size={15} /> Configured Disciplines ({disciplines.length})
        </button>
      </div>

      {/* Search Input */}
      {activeSubTab === 'astrologers' && (
        <div className="relative max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder="Search AI astrologer name or discipline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-xs focus:border-[#C9952B] outline-none"
          />
        </div>
      )}

      {/* AI Astrologers Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[#C9952B] mb-2" size={32} />
          <p className="text-xs text-muted-foreground">Loading AI Astrologers...</p>
        </div>
      ) : activeSubTab === 'astrologers' ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="p-4">Astrologer</th>
                  <th className="p-4">Discipline</th>
                  <th className="p-4">Languages</th>
                  <th className="p-4">Voice / Model</th>
                  <th className="p-4">Price/min</th>
                  <th className="p-4">Rating & Calls</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAstrologers.map((astro) => (
                  <tr key={astro.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#C9952B] relative shrink-0">
                          <AppImage
                            src={astro.avatar}
                            alt={astro.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            {astro.name}
                            {astro.isFeatured && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#C9952B]/20 text-[#C9952B] font-bold">
                                FEATURED
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate max-w-xs block">
                            {astro.tagline}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted border border-border">
                        {astro.primaryDiscipline}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{astro.languages?.join(', ')}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#C9952B]/10 text-[#C9952B] font-mono">
                        {astro.voiceId} ({astro.voiceGender})
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#C9952B]">₹{astro.pricePerMin}/min</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={12} className="fill-amber-500" /> {astro.rating}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {astro.totalConsultations.toLocaleString()} calls
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          astro.isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {astro.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingAstro({ ...astro });
                            setShowAstroModal(true);
                          }}
                          className="p-1.5 rounded-lg border border-border hover:border-[#C9952B] text-muted-foreground hover:text-foreground transition-all"
                          title="Edit AI Astrologer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteAstrologer(astro)}
                          className="p-1.5 rounded-lg border border-border hover:border-red-500 text-muted-foreground hover:text-red-400 transition-all"
                          title="Delete AI Astrologer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Disciplines Management Table */
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Discipline Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Icon</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {disciplines.map((disc, idx) => (
                <tr key={disc.id || idx} className="hover:bg-muted/20">
                  <td className="p-4 font-mono">{disc.order || idx + 1}</td>
                  <td className="p-4 font-bold text-foreground">{disc.name}</td>
                  <td className="p-4 text-muted-foreground max-w-md truncate">
                    {disc.description}
                  </td>
                  <td className="p-4 font-mono text-[10px] text-[#C9952B]">{disc.iconName}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        disc.isActive
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {disc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setEditingDisc({ ...disc });
                        setShowDiscModal(true);
                      }}
                      className="p-1.5 rounded-lg border border-border hover:border-[#C9952B] text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Add AI Astrologer Modal */}
      {showAstroModal && editingAstro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-card border border-border max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="p-5 bg-muted/40 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Bot size={16} className="text-[#C9952B]" />
                {editingAstro.id ? `Edit: ${editingAstro.name}` : 'Add New AI Astrologer'}
              </h3>
              <button
                onClick={() => setShowAstroModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAstrologer} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editingAstro.name}
                    onChange={(e) => setEditingAstro({ ...editingAstro, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    required
                    value={editingAstro.avatar}
                    onChange={(e) => setEditingAstro({ ...editingAstro, avatar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={editingAstro.tagline}
                  onChange={(e) => setEditingAstro({ ...editingAstro, tagline: e.target.value })}
                  placeholder="e.g. Vedic Grandmaster & Parashara Dasha Specialist"
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Primary Discipline</label>
                  <select
                    value={editingAstro.primaryDiscipline}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, primaryDiscipline: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  >
                    {disciplines.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Rate (₹ / min)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingAstro.pricePerMin}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, pricePerMin: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Rate ($ / min)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.1}
                    value={editingAstro.pricePerMinUSD}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, pricePerMinUSD: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Voice Gender</label>
                  <select
                    value={editingAstro.voiceGender}
                    onChange={(e: any) =>
                      setEditingAstro({ ...editingAstro, voiceGender: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Voice Model</label>
                  <select
                    value={editingAstro.voiceId}
                    onChange={(e) => setEditingAstro({ ...editingAstro, voiceId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  >
                    <option value="onyx">Onyx (Deep Male)</option>
                    <option value="echo">Echo (Authoritative Male)</option>
                    <option value="fable">Fable (Warm Male)</option>
                    <option value="shimmer">Shimmer (Expressive Female)</option>
                    <option value="nova">Nova (Warm Female)</option>
                    <option value="alloy">Alloy (Balanced Neutral)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={editingAstro.experienceYears}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, experienceYears: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">
                  Languages (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editingAstro.languages?.join(', ')}
                  onChange={(e) =>
                    setEditingAstro({
                      ...editingAstro,
                      languages: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">
                  Bio / Profile Description
                </label>
                <textarea
                  rows={2}
                  value={editingAstro.bio}
                  onChange={(e) => setEditingAstro({ ...editingAstro, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">
                  System Persona Prompt (Injected into AI Voice)
                </label>
                <textarea
                  rows={4}
                  value={editingAstro.systemPersonaPrompt}
                  onChange={(e) =>
                    setEditingAstro({ ...editingAstro, systemPersonaPrompt: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAstro.isActive}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#C9952B] focus:ring-[#C9952B]"
                  />
                  <span>Active & Available for Calls</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAstro.isFeatured}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#C9952B] focus:ring-[#C9952B]"
                  />
                  <span>Promote as Featured Astrologer</span>
                </label>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAstroModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#C9952B] text-white font-bold hover:bg-[#b08022] flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save AI Astrologer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Discipline Modal */}
      {showDiscModal && editingDisc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-card border border-border max-w-md w-full rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="font-bold text-sm text-foreground mb-4">Edit Astrology Discipline</h3>
            <form onSubmit={handleSaveDiscipline} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Discipline Name</label>
                <input
                  type="text"
                  required
                  value={editingDisc.name}
                  onChange={(e) => setEditingDisc({ ...editingDisc, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingDisc.description}
                  onChange={(e) => setEditingDisc({ ...editingDisc, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Icon Identifier</label>
                <input
                  type="text"
                  value={editingDisc.iconName}
                  onChange={(e) => setEditingDisc({ ...editingDisc, iconName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingDisc.isActive}
                  onChange={(e) => setEditingDisc({ ...editingDisc, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#C9952B]"
                />
                <span>Active</span>
              </label>
              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C9952B] text-white font-bold"
                >
                  Save Discipline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  );
}
