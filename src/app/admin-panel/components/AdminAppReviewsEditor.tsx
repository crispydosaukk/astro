'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Phone,
  Video,
  MessagesSquare,
  User,
  ShieldCheck,
  Check,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

export interface AppReview {
  id: string;
  astrologerId: string;
  astrologerName: string;
  customerId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  tags?: string[];
  serviceType: 'Voice Call' | 'Video Call' | 'Chat';
  date: string;
  showInApp: boolean;
  status: 'approved' | 'pending' | 'hidden';
}

export default function AdminAppReviewsEditor() {
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAstrologer, setFilterAstrologer] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/app-dynamic/reviews');
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShowInApp = async (review: AppReview) => {
    setUpdatingId(review.id);
    const newShowInApp = !review.showInApp;
    const newStatus = newShowInApp ? 'approved' : 'hidden';

    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, showInApp: newShowInApp, status: newStatus } : r))
    );

    try {
      const res = await fetch('/api/app-dynamic/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: review.id,
          showInApp: newShowInApp,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          newShowInApp
            ? '✓ Review is now LIVE in the mobile app!'
            : 'Review is now HIDDEN from the mobile app'
        );
      } else {
        toast.error('Failed to update review visibility');
        fetchReviews();
      }
    } catch {
      toast.error('Network error updating review');
      fetchReviews();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/app-dynamic/reviews?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Review deleted');
      } else {
        toast.error('Delete failed');
        fetchReviews();
      }
    } catch {
      toast.error('Network error deleting review');
      fetchReviews();
    }
  };

  // Metrics
  const totalReviews = reviews.length;
  const liveInApp = reviews.filter((r) => r.showInApp).length;
  const hiddenCount = reviews.filter((r) => !r.showInApp).length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : '5.0';
  const fiveStarPct = totalReviews > 0 ? Math.round((reviews.filter((r) => r.rating === 5).length / totalReviews) * 100) : 100;

  // Astrologers list for filter
  const astrologerOptions = Array.from(new Set(reviews.map((r) => r.astrologerName)));

  // Filtered Reviews
  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.customerName.toLowerCase().includes(q) ||
      r.astrologerName.toLowerCase().includes(q) ||
      r.reviewText.toLowerCase().includes(q) ||
      (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)));

    const matchRating = filterRating === 'all' || String(r.rating) === filterRating;
    const matchStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'live'
        ? r.showInApp
        : !r.showInApp;
    const matchAstro = filterAstrologer === 'all' || r.astrologerName === filterAstrologer;

    return matchSearch && matchRating && matchStatus && matchAstro;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9952B]/15 text-[#C9952B] border border-[#C9952B]/30 flex items-center gap-1.5">
              <Sparkles size={12} /> App Dynamics Module
            </span>
            <span className="text-xs text-muted-foreground font-semibold">Real-Time Mobile Sync</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-1.5 flex items-center gap-2">
            Customer Reviews & Ratings Control
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, verify, and toggle customer feedback submitted after voice/video/chat consultations. Toggling ON/OFF instantly reflects in the AstroParihar mobile app.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border hover:border-accent text-xs font-bold text-foreground hover:bg-muted transition-all"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-accent' : ''} />
            Sync Reviews
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">Total Reviews</span>
            <MessageSquare size={16} className="text-accent" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalReviews}</span>
            <span className="text-[11px] text-muted-foreground font-medium">all sessions</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-emerald-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">Live in App (ON)</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-500">{liveInApp}</span>
            <span className="text-[11px] text-emerald-500/80 font-bold">visible to devotees</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-amber-500/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">Hidden / Off</span>
            <EyeOff size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-500">{hiddenCount}</span>
            <span className="text-[11px] text-muted-foreground font-medium">not in app</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-[#C9952B]/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">Avg Satisfaction</span>
            <Star size={16} className="text-[#C9952B] fill-[#C9952B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#C9952B]">{avgRating}★</span>
            <span className="text-[11px] text-muted-foreground font-medium">{fiveStarPct}% 5-stars</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, astrologer, review text, or tags..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Filter by Astrologer */}
          <select
            value={filterAstrologer}
            onChange={(e) => setFilterAstrologer(e.target.value)}
            className="px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="all">All Astrologers ({astrologerOptions.length})</option>
            {astrologerOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Filter by Rating */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>

          {/* Filter by In-App Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="live">🟢 Live in App Only</option>
            <option value="hidden">⚪ Hidden Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table & Cards */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/30">
          <span className="text-xs font-bold text-foreground">
            Customer Reviews ({filtered.length} of {reviews.length})
          </span>
          <span className="text-[11px] text-muted-foreground">
            Click the ON/OFF switch on any review to show or hide in the mobile app
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw size={24} className="animate-spin text-accent mx-auto" />
            <p className="text-xs text-muted-foreground mt-3 font-semibold">Loading live reviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted/80 flex items-center justify-center mx-auto text-muted-foreground">
              <MessageSquare size={20} />
            </div>
            <p className="text-sm font-bold text-foreground">No customer reviews found</p>
            <p className="text-xs text-muted-foreground">Try clearing or adjusting your search filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((rev) => {
              const isUpdating = updatingId === rev.id;
              return (
                <div key={rev.id} className="p-5 hover:bg-muted/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left: Customer Info, Astrologer, Rating & Comment */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
                        {rev.customerName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-foreground">{rev.customerName}</span>
                      <span className="text-xs text-muted-foreground">• {rev.date}</span>

                      {/* Service Badge */}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground border border-border flex items-center gap-1">
                        {rev.serviceType === 'Video Call' ? <Video size={10} /> : rev.serviceType === 'Voice Call' ? <Phone size={10} /> : <MessagesSquare size={10} />}
                        {rev.serviceType}
                      </span>

                      {/* Astrologer target */}
                      <span className="text-xs font-semibold text-[#C9952B] bg-[#C9952B]/10 px-2 py-0.5 rounded-full border border-[#C9952B]/20">
                        Consulted: {rev.astrologerName}
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < rev.rating ? 'text-[#C9952B] fill-[#C9952B]' : 'text-muted-foreground/30'}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-foreground">{rev.rating}.0</span>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-foreground/90 leading-relaxed font-normal bg-muted/40 p-3 rounded-xl border border-border/60">
                      "{rev.reviewText}"
                    </p>

                    {/* Tags */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: ON/OFF Switch & Controls */}
                  <div className="flex md:flex-col items-center md:items-end gap-3 shrink-0">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                          rev.showInApp
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        {rev.showInApp ? <CheckCircle2 size={12} /> : <EyeOff size={12} />}
                        {rev.showInApp ? 'LIVE IN APP' : 'HIDDEN'}
                      </span>
                    </div>

                    {/* Prominent ON / OFF Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-semibold">
                        App Display:
                      </span>
                      <button
                        onClick={() => handleToggleShowInApp(rev)}
                        disabled={isUpdating}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                          rev.showInApp ? 'bg-emerald-500' : 'bg-zinc-600'
                        }`}
                        title={rev.showInApp ? 'Click to HIDE from app' : 'Click to SHOW in app'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                            rev.showInApp ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Delete Review"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
