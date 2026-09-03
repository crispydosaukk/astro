'use client';

import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import ConfirmModal from '@/components/ui/ConfirmModal';
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
  Power,
  Radio,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import LogoutModal from '@/components/LogoutModal';
import {
  AIAstrologer,
  AIDiscipline,
  DEFAULT_AI_ASTROLOGERS,
  DEFAULT_AI_DISCIPLINES,
  SADHU_AVATAR_PRESETS,
} from '@/lib/aiAstrologerData';

export default function AdminAIAstrologersTable() {
  const [astrologers, setAstrologers] = useState<AIAstrologer[]>([]);
  const [disciplines, setDisciplines] = useState<AIDiscipline[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'astrologers' | 'disciplines'>('astrologers');
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
  const [selectedFeatured, setSelectedFeatured] = useState<'all' | 'featured'>('all');

  // Edit / Add Modal States
  const [showAstroModal, setShowAstroModal] = useState(false);
  const [editingAstro, setEditingAstro] = useState<AIAstrologer | null>(null);

  const [showDiscModal, setShowDiscModal] = useState(false);
  const [editingDisc, setEditingDisc] = useState<AIDiscipline | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Centered Confirmation Modals
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [astroToDelete, setAstroToDelete] = useState<AIAstrologer | null>(null);

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

  // Sync All 50 Astrologers to Database
  const handleResetAstrologers = () => {
    setShowSyncConfirm(true);
  };

  const executeSyncAllAstrologers = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/ai-astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all_50' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully synced all ${data.count} AI Astrologers and ${data.disciplinesCount} disciplines!`);
        fetchAdminData();
      } else {
        toast.error('Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setIsResetting(false);
      setShowSyncConfirm(false);
    }
  };

  // Save AI Astrologer
  const handleSaveAstrologer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAstro) return;

    // Verify Name Uniqueness
    const duplicate = astrologers.find(
      (a) => a.name.trim().toLowerCase() === editingAstro.name.trim().toLowerCase() && a.id !== editingAstro.id
    );
    if (duplicate) {
      toast.error(`Astrologer name "${editingAstro.name}" is already used by another astrologer! Please use a unique name.`);
      return;
    }

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
        toast.success(`AI Astrologer "${editingAstro.name}" saved successfully!`);
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
  const handleDeleteAstrologer = (astro: AIAstrologer) => {
    setAstroToDelete(astro);
  };

  const executeDeleteAstrologer = async () => {
    if (!astroToDelete) return;
    const astro = astroToDelete;
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
        setAstrologers((prev) => prev.filter((a) => a.id !== astro.id));
      }
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setAstroToDelete(null);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleAstrologerStatus = async (astro: AIAstrologer) => {
    const newStatus = !astro.isActive;
    setUpdatingStatusId(astro.id);

    // Optimistic UI update
    setAstrologers((prev) =>
      prev.map((a) => (a.id === astro.id ? { ...a, isActive: newStatus } : a))
    );

    try {
      const res = await fetch('/api/admin/ai-astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          astrologerId: astro.id,
          isActive: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `AI Astrologer "${astro.name}" is now ${newStatus ? 'Active' : 'Inactive'}`
        );
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err: any) {
      // Revert optimistic update
      setAstrologers((prev) =>
        prev.map((a) => (a.id === astro.id ? { ...a, isActive: astro.isActive } : a))
      );
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Set Availability Status (Online / Busy / Offline)
  const handleSetAvailability = async (astro: AIAstrologer, newAvailability: 'online' | 'busy' | 'offline') => {
    setUpdatingStatusId(astro.id);

    // Optimistic UI update
    setAstrologers((prev) =>
      prev.map((a) => (a.id === astro.id ? { ...a, availability: newAvailability } : a))
    );

    try {
      const res = await fetch('/api/admin/ai-astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_availability',
          astrologerId: astro.id,
          availability: newAvailability,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`"${astro.name}" availability set to ${newAvailability.toUpperCase()}`);
      } else {
        throw new Error(data.error || 'Failed to update availability');
      }
    } catch (err: any) {
      // Revert
      setAstrologers((prev) =>
        prev.map((a) => (a.id === astro.id ? { ...a, availability: astro.availability } : a))
      );
      toast.error('Failed to update availability');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (astro: AIAstrologer) => {
    const newFeatured = !astro.isFeatured;
    setUpdatingStatusId(astro.id);

    // Optimistic UI update
    setAstrologers((prev) =>
      prev.map((a) => (a.id === astro.id ? { ...a, isFeatured: newFeatured } : a))
    );

    try {
      const res = await fetch('/api/admin/ai-astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_featured',
          astrologerId: astro.id,
          isFeatured: newFeatured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `"${astro.name}" ${newFeatured ? 'marked as Featured' : 'removed from Featured'}`
        );
      }
    } catch (err) {
      setAstrologers((prev) =>
        prev.map((a) => (a.id === astro.id ? { ...a, isFeatured: astro.isFeatured } : a))
      );
      toast.error('Failed to toggle featured');
    } finally {
      setUpdatingStatusId(null);
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
        toast.success(`Discipline "${editingDisc.name}" saved!`);
        setShowDiscModal(false);
        setEditingDisc(null);
        fetchAdminData();
      } else {
        toast.error(data.error || 'Failed to save discipline');
      }
    } catch (err) {
      toast.error('Failed to save discipline');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Discipline Status
  const handleToggleDisciplineStatus = async (disc: AIDiscipline) => {
    const newStatus = !disc.isActive;
    setUpdatingStatusId(disc.id);

    setDisciplines((prev) =>
      prev.map((d) => (d.id === disc.id ? { ...d, isActive: newStatus } : d))
    );

    try {
      const res = await fetch('/api/admin/ai-astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_discipline',
          discipline: {
            ...disc,
            isActive: newStatus,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Discipline "${disc.name}" is now ${newStatus ? 'Active' : 'Inactive'}`);
      }
    } catch (err: any) {
      setDisciplines((prev) =>
        prev.map((d) => (d.id === disc.id ? { ...d, isActive: disc.isActive } : d))
      );
      toast.error('Failed to update discipline status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filtered Astrologers list
  const filteredAstrologers = astrologers.filter((a) => {
    // Search query match
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      a.primaryDiscipline.toLowerCase().includes(q) ||
      a.languages?.some((l) => l.toLowerCase().includes(q)) ||
      a.specialities?.some((s) => s.toLowerCase().includes(q));

    // Discipline filter
    const matchesDiscipline =
      selectedDiscipline === 'all' || a.primaryDiscipline.toLowerCase() === selectedDiscipline.toLowerCase();

    // Status filter
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && a.isActive) ||
      (selectedStatus === 'inactive' && !a.isActive);

    // Availability filter
    const currentAvail = a.availability || 'online';
    const matchesAvailability =
      selectedAvailability === 'all' || currentAvail === selectedAvailability;

    // Featured filter
    const matchesFeatured = selectedFeatured === 'all' || a.isFeatured;

    return matchesSearch && matchesDiscipline && matchesStatus && matchesAvailability && matchesFeatured;
  });

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 font-serif">
            <Bot className="text-[#C9952B]" size={26} /> 50 AI Astrologers Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure live availability (Online/Busy/Offline), active status, voice personas, pricing, disciplines, and analytics.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
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
            type="button"
            onClick={handleResetAstrologers}
            disabled={isResetting}
            className="px-3.5 py-2 rounded-xl bg-[#C9952B]/15 border border-[#C9952B]/40 text-[#C9952B] hover:bg-[#C9952B] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Sync all 50 authentic AI Astrologers across 12 disciplines to database"
          >
            {isResetting ? <Loader2 size={14} className="animate-spin text-[#C9952B]" /> : <Sparkles size={14} />}
            Sync All 50 Astrologers
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Sign Out of Admin Panel"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>

          {activeSubTab === 'astrologers' ? (
            <button
              onClick={() => {
                setEditingAstro({
                  id: '',
                  name: '',
                  avatar: '/assets/images/ai-astrologers/swami-ji.png',
                  tagline: '',
                  bio: '',
                  primaryDiscipline: disciplines[0]?.name || 'Vedic Jyotish',
                  secondaryDisciplines: ['Remedial Astrology', 'Muhurtha'],
                  specialities: ['Career & Promotion', 'Marriage & Kundli Milan', 'Wealth & Finance'],
                  languages: ['English', 'Hindi', 'Telugu'],
                  specialityScores: [
                    { name: 'Vedic Analysis', score: 98 },
                    { name: 'Kundli Dasha', score: 97 },
                  ],
                  pricePerMin: 22,
                  pricePerMinUSD: 1.10,
                  experienceYears: 20,
                  rating: 4.96,
                  totalConsultations: 12000,
                  isActive: true,
                  isFeatured: false,
                  availability: 'online',
                  voiceGender: 'male',
                  voiceId: 'onyx',
                  consultationStyle: 'Empowering, Classical & Deeply Accurate',
                  systemPersonaPrompt:
                    'You are an authentic Vedic Astrologer at AstroParihar with deep expertise in Kundli, Dasha, and planetary remedies. Reply in 2-3 concise spoken sentences with practical guidance.',
                });
                setShowAstroModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#C9952B] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C9952B]/20 hover:bg-[#b08022] transition-colors"
            >
              <Plus size={15} /> Add Astrologer
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
              className="px-4 py-2 rounded-xl bg-[#C9952B] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C9952B]/20 hover:bg-[#b08022] transition-colors"
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
            <span className="text-xs font-medium">Total AI Astrologers</span>
            <Bot size={16} className="text-[#C9952B]" />
          </div>
          <div className="text-xl font-bold text-foreground">{astrologers.length} Personas</div>
          <span className="text-[10px] text-emerald-500 font-semibold">
            {astrologers.filter((a) => a.isActive).length} Active · {astrologers.filter((a) => (a.availability || 'online') === 'online').length} Online
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">AI Consultations</span>
            <PhoneCall size={16} className="text-[#C9952B]" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {analytics ? Number(analytics.totalConsultations || 0).toLocaleString() : '0'} calls
          </div>
          <span className="text-[10px] text-muted-foreground">
            Avg. {analytics?.avgDurationMinutes || '0.0'} mins/call
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">AI Revenue</span>
            <DollarSign size={16} className="text-[#C9952B]" />
          </div>
          <div className="text-xl font-bold text-[#C9952B]">
            ₹{analytics ? Number(analytics.totalRevenue || 0).toLocaleString() : '0'}
          </div>
          <span className="text-[10px] text-muted-foreground">Prepaid Wallet Usage</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Disciplines</span>
            <Layers size={16} className="text-[#C9952B]" />
          </div>
          <div className="text-xl font-bold text-foreground">{disciplines.length} Disciplines</div>
          <span className="text-[10px] text-emerald-500">
            {disciplines.filter((d) => d.isActive).length} Active Categories
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

      {/* Filters & Search Toolbar (Only in Astrologers sub-tab) */}
      {activeSubTab === 'astrologers' && (
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={15}
              />
              <input
                type="text"
                placeholder="Search by name, discipline, language, speciality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
              />
            </div>

            {/* Discipline Dropdown Filter */}
            <div>
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
              >
                <option value="all">All Disciplines ({astrologers.length})</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Active / Inactive Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e: any) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only ({astrologers.filter((a) => a.isActive).length})</option>
                <option value="inactive">Inactive Only ({astrologers.filter((a) => !a.isActive).length})</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={selectedAvailability}
                onChange={(e: any) => setSelectedAvailability(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
              >
                <option value="all">All Availability</option>
                <option value="online">🟢 Online Only ({astrologers.filter((a) => (a.availability || 'online') === 'online').length})</option>
                <option value="busy">🟡 Busy Only ({astrologers.filter((a) => a.availability === 'busy').length})</option>
                <option value="offline">⚪ Offline Only ({astrologers.filter((a) => a.availability === 'offline').length})</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
            <span>
              Showing <strong className="text-foreground">{filteredAstrologers.length}</strong> of{' '}
              <strong className="text-foreground">{astrologers.length}</strong> AI Astrologers
            </span>
            {(search || selectedDiscipline !== 'all' || selectedStatus !== 'all' || selectedAvailability !== 'all' || selectedFeatured !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedDiscipline('all');
                  setSelectedStatus('all');
                  setSelectedAvailability('all');
                  setSelectedFeatured('all');
                }}
                className="text-[#C9952B] hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
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
                  <th className="p-4">Availability</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAstrologers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No AI astrologers match your current search/filters.
                    </td>
                  </tr>
                ) : (
                  filteredAstrologers.map((astro) => {
                    const currentAvail = astro.availability || 'online';
                    return (
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
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeatured(astro)}
                                  title={astro.isFeatured ? 'Featured Astrologer (Click to unset)' : 'Click to mark as Featured'}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    size={13}
                                    className={
                                      astro.isFeatured
                                        ? 'text-[#C9952B] fill-[#C9952B]'
                                        : 'text-muted-foreground/40 hover:text-[#C9952B]'
                                    }
                                  />
                                </button>
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
                        <td className="p-4 text-muted-foreground max-w-[140px] truncate">
                          {astro.languages?.join(', ')}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#C9952B]/10 text-[#C9952B] font-mono">
                            {astro.voiceId} ({astro.voiceGender})
                          </span>
                        </td>
                        <td className="p-4 font-bold text-[#C9952B]">
                          ₹{astro.pricePerMin}/min
                        </td>

                        {/* Availability Selector (Online / Busy / Offline) */}
                        <td className="p-4">
                          <select
                            value={currentAvail}
                            onChange={(e) =>
                              handleSetAvailability(astro, e.target.value as any)
                            }
                            disabled={updatingStatusId === astro.id}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer outline-none ${
                              currentAvail === 'online'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : currentAvail === 'busy'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                            }`}
                          >
                            <option value="online">🟢 Online</option>
                            <option value="busy">🟡 Busy</option>
                            <option value="offline">⚪ Offline</option>
                          </select>
                        </td>

                        {/* Active / Inactive Status Toggle Button */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleAstrologerStatus(astro)}
                            disabled={updatingStatusId === astro.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 ${
                              astro.isActive
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            }`}
                            title={`Click to set ${astro.isActive ? 'Inactive' : 'Active'}`}
                          >
                            {updatingStatusId === astro.id ? (
                              <Loader2 size={10} className="animate-spin text-current" />
                            ) : (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  astro.isActive
                                    ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse'
                                    : 'bg-rose-500 dark:bg-rose-400'
                                }`}
                              />
                            )}
                            <span>{astro.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAstro({ ...astro });
                                setShowAstroModal(true);
                              }}
                              className="p-1.5 rounded-lg border border-border hover:border-[#C9952B] text-muted-foreground hover:text-foreground transition-all"
                              title="Edit Astrologer Profile"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAstrologer(astro)}
                              className="p-1.5 rounded-lg border border-border hover:border-red-500 text-muted-foreground hover:text-red-500 transition-all"
                              title="Delete Astrologer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
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
                    <button
                      type="button"
                      onClick={() => handleToggleDisciplineStatus(disc)}
                      disabled={updatingStatusId === disc.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 ${
                        disc.isActive
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}
                      title={`Click to set ${disc.isActive ? 'Inactive' : 'Active'}`}
                    >
                      {updatingStatusId === disc.id ? (
                        <Loader2 size={10} className="animate-spin text-current" />
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            disc.isActive
                              ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse'
                              : 'bg-rose-500 dark:bg-rose-400'
                          }`}
                        />
                      )}
                      <span>{disc.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDisc({ ...disc });
                          setShowDiscModal(true);
                        }}
                        className="p-1.5 rounded-lg border border-border hover:border-[#C9952B] text-muted-foreground hover:text-foreground"
                        title="Edit Discipline"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
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
          <div className="bg-card border border-border max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
            <div className="p-5 bg-muted/40 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Bot size={16} className="text-[#C9952B]" />
                {editingAstro.id ? `Edit Astrologer: ${editingAstro.name}` : 'Add New AI Astrologer'}
              </h3>
              <button
                onClick={() => setShowAstroModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAstrologer} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Visual Sadhu Avatar Selector */}
              <div>
                <label className="block text-muted-foreground mb-1.5 font-semibold">
                  Select Visual Avatar Preset (Sadhu, Rishi, KP Master, Devi & Oracle)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2.5 bg-muted/20 border border-border rounded-2xl max-h-44 overflow-y-auto">
                  {SADHU_AVATAR_PRESETS.map((preset) => {
                    const isSelected = editingAstro.avatar === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setEditingAstro({ ...editingAstro, avatar: preset.url })}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#C9952B] bg-[#C9952B]/15 scale-105 shadow-md shadow-[#C9952B]/20'
                            : 'border-border hover:border-[#C9952B]/50 hover:bg-muted/40'
                        }`}
                        title={`${preset.name} - ${preset.title}`}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C9952B]/40 relative shrink-0">
                          <AppImage src={preset.url} alt={preset.name} fill className="object-cover" />
                        </div>
                        <span className="text-[9px] font-bold truncate max-w-full text-foreground">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Astrologer Name</label>
                  <input
                    type="text"
                    required
                    value={editingAstro.name}
                    onChange={(e) => setEditingAstro({ ...editingAstro, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Avatar Image URL</label>
                  <input
                    type="text"
                    required
                    value={editingAstro.avatar}
                    onChange={(e) => setEditingAstro({ ...editingAstro, avatar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Tagline / Subtitle</label>
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
                  <label className="block text-muted-foreground mb-1 font-semibold">Primary Discipline</label>
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
                  <label className="block text-muted-foreground mb-1 font-semibold">Rate (₹ / min)</label>
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
                  <label className="block text-muted-foreground mb-1 font-semibold">Rate ($ / min)</label>
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
                  <label className="block text-muted-foreground mb-1 font-semibold">Availability Status</label>
                  <select
                    value={editingAstro.availability || 'online'}
                    onChange={(e: any) =>
                      setEditingAstro({ ...editingAstro, availability: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  >
                    <option value="online">🟢 Online</option>
                    <option value="busy">🟡 Busy</option>
                    <option value="offline">⚪ Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Voice Model</label>
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
                  <label className="block text-muted-foreground mb-1 font-semibold">Voice Gender</label>
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
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={editingAstro.experienceYears}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, experienceYears: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={1}
                    max={5}
                    value={editingAstro.rating}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, rating: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Total Calls Count</label>
                  <input
                    type="number"
                    value={editingAstro.totalConsultations}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, totalConsultations: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">
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
                <label className="block text-muted-foreground mb-1 font-semibold">
                  Specialities (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editingAstro.specialities?.join(', ')}
                  onChange={(e) =>
                    setEditingAstro({
                      ...editingAstro,
                      specialities: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">
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
                <label className="block text-muted-foreground mb-1 font-semibold">
                  System Persona Prompt (Injected into AI Voice LLM)
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
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={editingAstro.isActive}
                    onChange={(e) =>
                      setEditingAstro({ ...editingAstro, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#C9952B] focus:ring-[#C9952B]"
                  />
                  <span>Active in App</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
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
                  Save Astrologer
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
                <label className="block text-muted-foreground mb-1 font-semibold">Discipline Name</label>
                <input
                  type="text"
                  required
                  value={editingDisc.name}
                  onChange={(e) => setEditingDisc({ ...editingDisc, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={editingDisc.description}
                  onChange={(e) => setEditingDisc({ ...editingDisc, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Icon Identifier</label>
                <input
                  type="text"
                  value={editingDisc.iconName}
                  onChange={(e) => setEditingDisc({ ...editingDisc, iconName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] outline-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1 font-semibold">
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

      {/* Sync All Confirmation Modal */}
      <ConfirmModal
        isOpen={showSyncConfirm}
        onClose={() => setShowSyncConfirm(false)}
        onConfirm={executeSyncAllAstrologers}
        title="Sync All 50 AI Astrologers?"
        description="This will publish and synchronize all 50 authentic AI Astrologers across all 12 Vedic disciplines to your Firestore database. Do you wish to continue?"
        confirmText="Yes, Sync Database"
        cancelText="Cancel"
        variant="primary"
        confirmLoading={isResetting}
      />

      {/* Delete Astrologer Confirmation Modal */}
      <ConfirmModal
        isOpen={!!astroToDelete}
        onClose={() => setAstroToDelete(null)}
        onConfirm={executeDeleteAstrologer}
        title={`Delete "${astroToDelete?.name}"?`}
        description={`Are you sure you want to permanently remove AI Astrologer "${astroToDelete?.name}" (${astroToDelete?.primaryDiscipline})? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
