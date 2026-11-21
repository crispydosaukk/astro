'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Star,
  Loader2,
  XCircle,
  IndianRupee,
  Save,
  Plus,
  Trash2,
  MessageSquare,
  Users,
  Power,
  Ban,
  ShieldCheck,
  ShieldAlert,
  Radio,
  RefreshCw,
  ExternalLink,
  Award,
  UserPlus,
  Edit3,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

interface ReviewItem {
  id?: string;
  name: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

interface AstrologerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: number;
  rating: number;
  reviewsCount: number;
  consultations: number;
  revenue: string;
  amount: number;
  badge: string;
  status: string;
  previousStatus?: string;
  isOnline: boolean;
  isActive: boolean;
  isSuspended: boolean;
  isFeatured: boolean;
  isFullTimeApproved: boolean;
  dashboardDisabled: boolean;
  showOnWebsite: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  avatar: string;
  tokenNumber?: string | number;
  dob?: string;
  gender?: string;
  city?: string;
  phoneType?: string;
  languages?: string;
  learningSource?: string;
  workingElsewhere?: string;
  dailyHours?: string;
  createdAt?: string;
  bio?: string;
  education?: string;
  certifications?: string[];
  reviewsList?: ReviewItem[];
}

interface AstrologerStats {
  total: number;
  activeCount: number;
  inactiveCount: number;
  onlineCount: number;
  offlineCount: number;
  suspendedCount: number;
  fullTimeCount: number;
}

type StatusFilter = 'all' | 'active' | 'deactivated' | 'online' | 'offline' | 'suspended';

export default function AdminAstrologersTable() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [astrologers, setAstrologers] = useState<AstrologerData[]>([]);
  const [stats, setStats] = useState<AstrologerStats>({
    total: 0,
    activeCount: 0,
    inactiveCount: 0,
    onlineCount: 0,
    offlineCount: 0,
    suspendedCount: 0,
    fullTimeCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Selected astrologer for Full Edit / Controls Modal
  const [selectedAstrologer, setSelectedAstrologer] = useState<AstrologerData | null>(null);

  // Suspend Modal State
  const [suspendTarget, setSuspendTarget] = useState<AstrologerData | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [isSuspending, setIsSuspending] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<AstrologerData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create Human Astrologer Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('Vedic Astrology, Kundli Milan');
  const [newLanguages, setNewLanguages] = useState('Hindi, English');
  const [newExperience, setNewExperience] = useState('10');
  const [newRate, setNewRate] = useState('25');
  const [newCity, setNewCity] = useState('Varanasi, India');
  const [newBio, setNewBio] = useState('');

  // Admin Edit Controls State
  const [editingName, setEditingName] = useState('');
  const [editingPhone, setEditingPhone] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingSpecialty, setEditingSpecialty] = useState('');
  const [editingLanguages, setEditingLanguages] = useState('');
  const [editingExperience, setEditingExperience] = useState('');
  const [editingCity, setEditingCity] = useState('');
  const [editingBio, setEditingBio] = useState('');
  const [editingAmount, setEditingAmount] = useState<string>('');
  const [editingRating, setEditingRating] = useState<string>('');
  const [editingReviewsCount, setEditingReviewsCount] = useState<string>('');
  const [editingConsultations, setEditingConsultations] = useState<string>('');
  const [editingBadge, setEditingBadge] = useState<string>('Top Rated');
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [isSavingStats, setIsSavingStats] = useState(false);

  // New Review Form
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState('5');
  const [newReviewDate, setNewReviewDate] = useState('2 days ago');
  const [newReviewComment, setNewReviewComment] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchAstrologers();
  }, []);

  const recomputeStats = (list: AstrologerData[]): AstrologerStats => ({
    total: list.length,
    activeCount: list.filter((a) => a.isActive && !a.isSuspended).length,
    inactiveCount: list.filter((a) => !a.isActive && !a.isSuspended).length,
    onlineCount: list.filter((a) => a.isOnline && a.isActive && !a.isSuspended).length,
    offlineCount: list.filter((a) => !a.isOnline && a.isActive && !a.isSuspended).length,
    suspendedCount: list.filter((a) => a.isSuspended).length,
    fullTimeCount: list.filter((a) => a.isFullTimeApproved && !a.isSuspended).length,
  });

  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/astrologers', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.astrologers)) {
        setAstrologers(data.astrologers);
        setStats(data.stats || recomputeStats(data.astrologers));
      } else {
        toast.error(data.error || 'Failed to load human astrologers');
      }
    } catch (error) {
      console.error('Error fetching astrologers:', error);
      toast.error('Network error loading human astrologers');
    } finally {
      setLoading(false);
    }
  };

  const replaceRow = (updated: AstrologerData) => {
    setAstrologers((prev) => {
      const next = prev.map((a) => (a.id === updated.id ? updated : a));
      setStats(recomputeStats(next));
      return next;
    });
    if (selectedAstrologer?.id === updated.id) {
      setSelectedAstrologer(updated);
    }
  };

  // Toggle Online / Offline
  const handleToggleOnline = async (ast: AstrologerData) => {
    if (ast.isSuspended) {
      toast.error('Account is suspended. Unsuspend first to bring online.');
      return;
    }
    if (!ast.isActive) {
      toast.error('Account is deactivated. Activate first to bring online.');
      return;
    }

    const nextOnline = !ast.isOnline;
    setBusyId(ast.id);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_online',
          astrologerId: ast.id,
          isOnline: nextOnline,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.astrologer) {
        replaceRow(data.astrologer);
        toast.success(
          `${ast.name} is now ${nextOnline ? 'ONLINE (Live on App & Web)' : 'OFFLINE'}`
        );
      } else {
        toast.error(data.error || 'Failed to toggle online status');
      }
    } catch {
      toast.error('Network error toggling online status');
    } finally {
      setBusyId(null);
    }
  };

  // Toggle Active / Deactive
  const handleToggleActive = async (ast: AstrologerData) => {
    if (ast.isSuspended) {
      toast.error('Account is suspended. Click Unsuspend to restore access.');
      return;
    }

    const nextActive = !ast.isActive;
    setBusyId(ast.id);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_active',
          astrologerId: ast.id,
          isActive: nextActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.astrologer) {
        replaceRow(data.astrologer);
        toast.success(
          nextActive
            ? `${ast.name} ACTIVATED — visible on App & Dashboard unlocked`
            : `${ast.name} DEACTIVATED — hidden from App & Dashboard disabled`
        );
      } else {
        toast.error(data.error || 'Failed to update active status');
      }
    } catch {
      toast.error('Network error updating active status');
    } finally {
      setBusyId(null);
    }
  };

  // Suspend Astrologer (disables dashboard + hides from app/web + takes offline)
  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    setIsSuspending(true);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suspend',
          astrologerId: suspendTarget.id,
          reason:
            suspensionReason.trim() ||
            'Account suspended by Administrator. Contact AstroParihar Admin Support.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.astrologer) {
        replaceRow(data.astrologer);
        toast.warning(
          `${suspendTarget.name} SUSPENDED — removed from App/Web and Individual Dashboard locked.`
        );
        setSuspendTarget(null);
        setSuspensionReason('');
      } else {
        toast.error(data.error || 'Failed to suspend astrologer');
      }
    } catch {
      toast.error('Network error suspending astrologer');
    } finally {
      setIsSuspending(false);
    }
  };

  // Unsuspend / Restore Astrologer
  const handleUnsuspend = async (ast: AstrologerData) => {
    setBusyId(ast.id);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unsuspend',
          astrologerId: ast.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.astrologer) {
        replaceRow(data.astrologer);
        toast.success(
          `${ast.name} UNSUSPENDED — account reactivated & Individual Dashboard restored.`
        );
      } else {
        toast.error(data.error || 'Failed to unsuspend astrologer');
      }
    } catch {
      toast.error('Network error unsuspending astrologer');
    } finally {
      setBusyId(null);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (ast: AstrologerData) => {
    setBusyId(ast.id);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_featured',
          astrologerId: ast.id,
          isFeatured: !ast.isFeatured,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.astrologer) {
        replaceRow(data.astrologer);
        toast.success(
          data.astrologer.isFeatured
            ? `${ast.name} marked as Featured`
            : `${ast.name} removed from Featured`
        );
      }
    } catch {
      toast.error('Failed to update featured flag');
    } finally {
      setBusyId(null);
    }
  };

  // Approve Full-Time
  const handleApproveFullTime = async (ast: AstrologerData) => {
    setBusyId(ast.id);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_full_time',
          astrologerId: ast.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.astrologer) {
        replaceRow(data.astrologer);
        toast.success(`${ast.name} granted Full-Time Verified status!`);
      } else {
        toast.error(data.error || 'Failed to approve full-time');
      }
    } catch {
      toast.error('Network error approving full-time');
    } finally {
      setBusyId(null);
    }
  };

  // Delete Astrologer
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_astrologer',
          astrologerId: deleteTarget.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAstrologers((prev) => {
          const next = prev.filter((a) => a.id !== deleteTarget.id);
          setStats(recomputeStats(next));
          return next;
        });
        if (selectedAstrologer?.id === deleteTarget.id) setSelectedAstrologer(null);
        toast.success(`Deleted ${deleteTarget.name}`);
        setDeleteTarget(null);
      } else {
        toast.error(data.error || 'Failed to delete astrologer');
      }
    } catch {
      toast.error('Network error deleting astrologer');
    } finally {
      setIsDeleting(false);
    }
  };

  // Create Astrologer
  const handleCreateAstrologer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Please enter astrologer name');
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_astrologer',
          astrologer: {
            name: newName.trim(),
            phone: newPhone.trim(),
            email: newEmail.trim(),
            specialty: newSpecialty.trim(),
            languages: newLanguages.trim(),
            experience: Number(newExperience) || 10,
            amount: Number(newRate) || 25,
            city: newCity.trim(),
            bio: newBio.trim(),
            isOnline: true,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.astrologer) {
        setAstrologers((prev) => {
          const next = [data.astrologer, ...prev];
          setStats(recomputeStats(next));
          return next;
        });
        toast.success(`Added Human Astrologer "${data.astrologer.name}"!`);
        setShowCreateModal(false);
        setNewName('');
        setNewPhone('');
        setNewEmail('');
        setNewBio('');
      } else {
        toast.error(data.error || 'Failed to create astrologer');
      }
    } catch {
      toast.error('Network error creating astrologer');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenModal = (ast: AstrologerData) => {
    setSelectedAstrologer(ast);
    setEditingName(ast.name || '');
    setEditingPhone(ast.phone || '');
    setEditingEmail(ast.email || '');
    setEditingSpecialty(ast.specialty || 'Vedic Astrology');
    setEditingLanguages(ast.languages || 'Hindi, English');
    setEditingExperience(String(ast.experience || 10));
    setEditingCity(ast.city || 'Varanasi, India');
    setEditingBio(ast.bio || '');
    setEditingAmount(String(ast.amount || 25));
    setEditingRating(String(ast.rating || 4.9));
    setEditingReviewsCount(String(ast.reviewsCount || 0));
    setEditingConsultations(String(ast.consultations || 0));
    setEditingBadge(ast.badge || 'Top Rated');
    setReviewsList(ast.reviewsList || []);
  };

  const handleSaveStats = async () => {
    if (!selectedAstrologer) return;
    setIsSavingStats(true);
    try {
      const res = await fetch('/api/admin/astrologers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          astrologerId: selectedAstrologer.id,
          updates: {
            name: editingName,
            phone: editingPhone,
            email: editingEmail,
            specialty: editingSpecialty,
            languages: editingLanguages,
            experience: Number(editingExperience) || 10,
            city: editingCity,
            bio: editingBio,
            amount: Number(editingAmount) || 25,
            rating: Number(editingRating) || 4.9,
            reviewsCount: Number(editingReviewsCount) || 0,
            consultations: Number(editingConsultations) || 0,
            badge: editingBadge,
            reviewsList,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.astrologer) {
        replaceRow(data.astrologer);
        toast.success(`Saved profile & stats for ${data.astrologer.name}`);
      } else {
        toast.error(data.error || 'Failed to update astrologer');
      }
    } catch {
      toast.error('Network error updating astrologer');
    } finally {
      setIsSavingStats(false);
    }
  };

  const handleAddReview = () => {
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      toast.error('Please enter reviewer name and comment');
      return;
    }
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: newReviewName.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop',
      rating: Number(newReviewRating) || 5,
      date: newReviewDate.trim() || 'Recently',
      comment: newReviewComment.trim(),
    };
    setReviewsList([newRev, ...reviewsList]);
    setNewReviewName('');
    setNewReviewComment('');
    toast.success('Review added to draft. Click Save Changes to persist.');
  };

  const handleDeleteReview = (idx: number) => {
    setReviewsList(reviewsList.filter((_, i) => i !== idx));
    toast.info('Review removed from draft');
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return astrologers.filter((a) => {
      if (statusFilter === 'active' && (!a.isActive || a.isSuspended)) return false;
      if (statusFilter === 'deactivated' && (a.isActive || a.isSuspended)) return false;
      if (statusFilter === 'online' && (!a.isOnline || !a.isActive || a.isSuspended)) return false;
      if (statusFilter === 'offline' && (a.isOnline || !a.isActive || a.isSuspended)) return false;
      if (statusFilter === 'suspended' && !a.isSuspended) return false;

      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.specialty.toLowerCase().includes(q)
      );
    });
  }, [astrologers, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Human</span>
            <Users size={15} className="text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-1.5">{stats.total}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Active</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1.5">{stats.activeCount}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Online Now</span>
            <Radio size={15} className="text-green-500" />
          </div>
          <p className="text-2xl font-extrabold text-green-600 mt-1.5">{stats.onlineCount}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Offline</span>
            <Power size={15} className="text-slate-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-1.5">{stats.offlineCount}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Deactivated</span>
            <AlertTriangle size={15} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-1.5">{stats.inactiveCount}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Suspended</span>
            <Ban size={15} className="text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-red-600 mt-1.5">{stats.suspendedCount}</p>
        </div>
      </div>

      {/* Main Directory Table Card */}
      <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Human Astrologers Control Panel
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30">
                  Live App & Dashboard Sync
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle Online/Offline, Activate/Deactivate app visibility, or Suspend to instantly lock an astrologer&apos;s individual dashboard.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search name, phone, skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-xs outline-none focus:border-ring w-48 sm:w-56"
                />
              </div>

              <button
                type="button"
                onClick={fetchAstrologers}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted/60 hover:bg-muted text-xs font-bold text-foreground transition-all"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <UserPlus size={14} />
                Add Astrologer
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'all', label: `All (${stats.total})` },
                { id: 'active', label: `Active (${stats.activeCount})` },
                { id: 'online', label: `Online (${stats.onlineCount})` },
                { id: 'offline', label: `Offline (${stats.offlineCount})` },
                { id: 'deactivated', label: `Deactivated (${stats.inactiveCount})` },
                { id: 'suspended', label: `Suspended (${stats.suspendedCount})` },
              ] as Array<{ id: StatusFilter; label: string }>
            ).map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStatusFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  statusFilter === pill.id
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
              <p className="text-sm font-medium">Loading human astrologers...</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[
                    'Astrologer',
                    'Specialty & Rate',
                    'Rating',
                    'Online / Offline',
                    'Active / Deactive',
                    'Account Status',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={`ast-th-${h}`}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      No human astrologers match this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ast, i) => {
                    const isBusy = busyId === ast.id;
                    return (
                      <motion.tr
                        key={ast.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-b border-border/50 transition-colors ${
                          ast.isSuspended
                            ? 'bg-red-500/[0.04] hover:bg-red-500/[0.07]'
                            : !ast.isActive
                            ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06] opacity-85'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        {/* Astrologer Identity */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <AppImage
                                src={ast.avatar}
                                alt={ast.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-xl object-cover border border-border"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                                  ast.isSuspended
                                    ? 'bg-red-500'
                                    : !ast.isActive
                                    ? 'bg-amber-500'
                                    : ast.isOnline
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-400'
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-foreground truncate">
                                  {ast.name}
                                </span>
                                {ast.isFeatured && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700">
                                    ★ Featured
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {ast.phone || ast.email || 'No contact'}
                              </div>
                              {ast.isSuspended && ast.suspensionReason && (
                                <div className="text-[11px] text-red-600 font-medium mt-0.5 max-w-[240px] truncate">
                                  Suspended: {ast.suspensionReason}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Specialty & Rate */}
                        <td className="px-4 py-4">
                          <div className="text-xs font-semibold text-foreground max-w-[200px] truncate">
                            {ast.specialty}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="font-bold text-[#C9952B] tabular-nums">
                              ₹{ast.amount || 25}/min
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground tabular-nums">
                              {ast.experience} yrs
                            </span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-foreground font-semibold text-xs">
                            <Star size={13} fill="currentColor" className="text-amber-400" />
                            <span>{ast.rating || 4.9}</span>
                            <span className="text-muted-foreground">
                              ({ast.reviewsCount || 0})
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {ast.badge || 'Verified'}
                          </div>
                        </td>

                        {/* Online / Offline Toggle */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            disabled={isBusy || ast.isSuspended || !ast.isActive}
                            onClick={() => handleToggleOnline(ast)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all disabled:opacity-45 disabled:cursor-not-allowed ${
                              ast.isOnline && ast.isActive && !ast.isSuspended
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/25'
                                : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                            }`}
                            title={
                              ast.isSuspended
                                ? 'Unsuspend account to toggle online'
                                : !ast.isActive
                                ? 'Activate account to toggle online'
                                : 'Toggle Online / Offline on App & Website'
                            }
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                ast.isOnline && ast.isActive && !ast.isSuspended
                                  ? 'bg-emerald-500 animate-pulse'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span>
                              {ast.isOnline && ast.isActive && !ast.isSuspended
                                ? 'Online'
                                : 'Offline'}
                            </span>
                          </button>
                        </td>

                        {/* Active / Deactive Toggle Switch */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={ast.isActive && !ast.isSuspended}
                              disabled={isBusy || ast.isSuspended}
                              onClick={() => handleToggleActive(ast)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                                ast.isActive && !ast.isSuspended
                                  ? 'bg-emerald-600'
                                  : 'bg-slate-400/60'
                              }`}
                              title={
                                ast.isSuspended
                                  ? 'Account is suspended — click Unsuspend instead'
                                  : ast.isActive
                                  ? 'Deactivate astrologer (hides from App & disables Dashboard)'
                                  : 'Activate astrologer (shows on App & unlocks Dashboard)'
                              }
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                  ast.isActive && !ast.isSuspended
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-xs font-bold ${
                                ast.isSuspended
                                  ? 'text-red-600'
                                  : ast.isActive
                                  ? 'text-emerald-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {ast.isSuspended
                                ? 'Locked'
                                : ast.isActive
                                ? 'Active'
                                : 'Deactive'}
                            </span>
                          </div>
                        </td>

                        {/* Account / Dashboard Status Pill */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {ast.isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-600 border border-red-500/30">
                              <Ban size={11} />
                              Suspended · Dashboard Off
                            </span>
                          ) : !ast.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                              <Power size={11} />
                              Deactivated · Dashboard Off
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                              <ShieldCheck size={11} />
                              {ast.isFullTimeApproved ? 'Full-Time Active' : 'Live · Approved'}
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {/* Suspend / Unsuspend Button */}
                            {ast.isSuspended ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleUnsuspend(ast)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all disabled:opacity-50"
                                title="Unsuspend astrologer and restore dashboard access"
                              >
                                <ShieldCheck size={13} />
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => {
                                  setSuspendTarget(ast);
                                  setSuspensionReason('');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-600 hover:text-white border border-red-500/30 font-bold text-xs transition-all disabled:opacity-50"
                                title="Suspend astrologer — immediately hides from App & blocks their individual dashboard"
                              >
                                <Ban size={13} />
                                Suspend
                              </button>
                            )}

                            {/* Edit / Controls Modal */}
                            <button
                              type="button"
                              onClick={() => handleOpenModal(ast)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground font-semibold text-xs transition-all"
                              title="Edit profile, pricing, ratings, reviews & full-time status"
                            >
                              <Edit3 size={13} />
                              Manage
                            </button>

                            {/* Featured Star */}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleFeatured(ast)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                ast.isFeatured
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-600'
                                  : 'bg-muted/40 border-border text-muted-foreground hover:text-amber-600'
                              }`}
                              title={ast.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                            >
                              <Star
                                size={13}
                                fill={ast.isFeatured ? 'currentColor' : 'none'}
                              />
                            </button>

                            {/* Public Profile Preview */}
                            <a
                              href={`/astrologer/${ast.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                              title="View public profile page"
                            >
                              <ExternalLink size={13} />
                            </a>

                            {/* Permanent Delete */}
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setDeleteTarget(ast)}
                              className="p-1.5 rounded-lg border border-red-500/25 bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white transition-all"
                              title="Delete astrologer permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SUSPEND MODAL WITH REASON */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {suspendTarget && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSuspending && setSuspendTarget(null)}
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 12 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-red-500/30 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 shrink-0">
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Suspend {suspendTarget.name}?
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Suspending will immediately hide this astrologer from the customer mobile app &amp; website, set them Offline, and{' '}
                        <strong className="text-red-600">
                          completely block their individual Astrologer Dashboard &amp; login
                        </strong>
                        .
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Suspension Reason (Shown to Astrologer)
                    </label>
                    <textarea
                      rows={3}
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      placeholder="e.g. Pending quality audit / Policy violation / Account under review..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={isSuspending}
                      onClick={() => setSuspendTarget(null)}
                      className="flex-1 py-2.5 rounded-xl border border-border bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSuspending}
                      onClick={handleConfirmSuspend}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isSuspending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Ban size={14} />
                      )}
                      <span>{isSuspending ? 'Suspending...' : 'Confirm Suspend'}</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* CREATE NEW HUMAN ASTROLOGER MODAL */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isCreating && setShowCreateModal(false)}
                className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.94, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 12 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <UserPlus size={18} className="text-amber-600" />
                      Add New Human Astrologer
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateAstrologer} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Acharya Ramesh Shastri"
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          Mobile Number (for OTP Login)
                        </label>
                        <input
                          type="text"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="acharya@example.com"
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          City / Location
                        </label>
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          Specialties (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newSpecialty}
                          onChange={(e) => setNewSpecialty(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          Languages (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newLanguages}
                          onChange={(e) => setNewLanguages(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          Experience (Years)
                        </label>
                        <input
                          type="number"
                          value={newExperience}
                          onChange={(e) => setNewExperience(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1">
                          Rate (₹ / min)
                        </label>
                        <input
                          type="number"
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Bio / About
                      </label>
                      <textarea
                        rows={3}
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        placeholder="Short Vedic background and consultation expertise..."
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isCreating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Plus size={14} />
                        )}
                        {isCreating ? 'Creating...' : 'Create Astrologer'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* FULL ADMIN CONTROLS / EDIT MODAL */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {selectedAstrologer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAstrologer(null)}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto relative space-y-6"
                >
                  <button
                    onClick={() => setSelectedAstrologer(null)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <XCircle size={24} />
                  </button>

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border pr-8">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedAstrologer.avatar}
                        alt={selectedAstrologer.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C9952B]"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {selectedAstrologer.name}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                          {selectedAstrologer.phone && (
                            <span className="inline-flex items-center gap-1 font-mono bg-muted px-2 py-0.5 rounded-md">
                              <Phone size={11} /> {selectedAstrologer.phone}
                            </span>
                          )}
                          {selectedAstrologer.email && <span>{selectedAstrologer.email}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Quick Lifecycle Action Strip inside Modal */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {!selectedAstrologer.isFullTimeApproved && !selectedAstrologer.isSuspended && (
                        <button
                          type="button"
                          onClick={() => handleApproveFullTime(selectedAstrologer)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Award size={13} />
                          Approve Full-Time
                        </button>
                      )}
                      {selectedAstrologer.isSuspended ? (
                        <button
                          type="button"
                          onClick={() => handleUnsuspend(selectedAstrologer)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1"
                        >
                          <ShieldCheck size={13} />
                          Unsuspend Account
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSuspendTarget(selectedAstrologer);
                            setSuspensionReason('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Ban size={13} />
                          Suspend Account
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Account Controls Bar (Online, Active, Featured) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl border border-border bg-muted/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-foreground">Online Status</p>
                        <p className="text-[11px] text-muted-foreground">
                          {selectedAstrologer.isOnline ? 'Accepting live calls' : 'Currently offline'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={selectedAstrologer.isSuspended || !selectedAstrologer.isActive}
                        onClick={() => handleToggleOnline(selectedAstrologer)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border disabled:opacity-40 ${
                          selectedAstrologer.isOnline
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700'
                            : 'bg-muted border-border text-muted-foreground'
                        }`}
                      >
                        {selectedAstrologer.isOnline ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-border bg-muted/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-foreground">App &amp; Dashboard</p>
                        <p className="text-[11px] text-muted-foreground">
                          {selectedAstrologer.isActive ? 'Active & Visible' : 'Deactivated'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={selectedAstrologer.isSuspended}
                        onClick={() => handleToggleActive(selectedAstrologer)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border disabled:opacity-40 ${
                          selectedAstrologer.isActive
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-700'
                        }`}
                      >
                        {selectedAstrologer.isActive ? 'Active' : 'Deactive'}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-border bg-muted/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-foreground">Featured Star</p>
                        <p className="text-[11px] text-muted-foreground">
                          Highlight in directory
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(selectedAstrologer)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          selectedAstrologer.isFeatured
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-700'
                            : 'bg-muted border-border text-muted-foreground'
                        }`}
                      >
                        {selectedAstrologer.isFeatured ? '★ Featured' : 'Standard'}
                      </button>
                    </div>
                  </div>

                  {/* Admin Profile, Rate & Rating Control Box */}
                  <div className="p-5 rounded-3xl bg-[#C9952B]/10 border border-[#C9952B]/30 space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-foreground font-bold text-base">
                        <IndianRupee size={18} className="text-[#C9952B]" />
                        <span>Profile, Rate &amp; Stats Manager</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveStats}
                        disabled={isSavingStats}
                        className="px-5 py-2 rounded-xl gold-gradient-bg text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
                      >
                        {isSavingStats ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        <span>Save All Changes</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={editingPhone}
                          onChange={(e) => setEditingPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editingEmail}
                          onChange={(e) => setEditingEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Specialties
                        </label>
                        <input
                          type="text"
                          value={editingSpecialty}
                          onChange={(e) => setEditingSpecialty(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Languages
                        </label>
                        <input
                          type="text"
                          value={editingLanguages}
                          onChange={(e) => setEditingLanguages(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={editingCity}
                          onChange={(e) => setEditingCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Rate (₹/min)
                        </label>
                        <input
                          type="number"
                          value={editingAmount}
                          onChange={(e) => setEditingAmount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Exp (Yrs)
                        </label>
                        <input
                          type="number"
                          value={editingExperience}
                          onChange={(e) => setEditingExperience(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Rating
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          max="5.0"
                          value={editingRating}
                          onChange={(e) => setEditingRating(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Reviews
                        </label>
                        <input
                          type="number"
                          value={editingReviewsCount}
                          onChange={(e) => setEditingReviewsCount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Consultations
                        </label>
                        <input
                          type="number"
                          value={editingConsultations}
                          onChange={(e) => setEditingConsultations(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Special Badge
                        </label>
                        <select
                          value={editingBadge}
                          onChange={(e) => setEditingBadge(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground font-semibold text-xs outline-none focus:border-[#C9952B]"
                        >
                          <option value="Top Rated">Top Rated</option>
                          <option value="Verified Expert">Verified Expert</option>
                          <option value="Celebrity Astrologer">Celebrity Astrologer</option>
                          <option value="Gold Medalist">Gold Medalist</option>
                          <option value="Master Astrologer">Master Astrologer</option>
                          <option value="">None</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Bio / About
                        </label>
                        <input
                          type="text"
                          value={editingBio}
                          onChange={(e) => setEditingBio(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs outline-none focus:border-[#C9952B]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Admin Customer Reviews Manager */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-base text-foreground flex items-center gap-2 border-b border-border pb-2.5">
                      <MessageSquare size={17} className="text-accent" /> Customer Reviews Manager (
                      {reviewsList.length})
                    </h4>

                    <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                      <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                        Add New Review
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Reviewer Name"
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none"
                        />
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none"
                        >
                          <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                          <option value="4">4 Stars ⭐⭐⭐⭐</option>
                          <option value="3">3 Stars ⭐⭐⭐</option>
                          <option value="2">2 Stars ⭐⭐</option>
                          <option value="1">1 Star ⭐</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Date (e.g. 2 days ago)"
                          value={newReviewDate}
                          onChange={(e) => setNewReviewDate(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Review Comment text..."
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground outline-none leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={handleAddReview}
                        className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-accent/90 transition-colors"
                      >
                        <Plus size={14} /> Add Review To List
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2">
                      {reviewsList.map((rev, idx) => (
                        <div
                          key={rev.id || idx}
                          className="p-3.5 rounded-2xl bg-muted/20 border border-border flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{rev.name}</span>
                              <span className="text-amber-400 font-bold">★ {rev.rating}</span>
                              <span className="text-muted-foreground text-[10px]">
                                • {rev.date}
                              </span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{rev.comment}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(idx)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.name || 'Astrologer'}?`}
        description="This permanently removes the human astrologer record from Firestore. If you only want to block them temporarily, use Suspend or Deactivate instead."
        confirmText="Delete Permanently"
        variant="danger"
        confirmLoading={isDeleting}
      />
    </div>
  );
}
