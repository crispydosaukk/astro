'use client';
import React, { useState, useEffect } from 'react';
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
  Lock,
  Plus,
  Trash2,
  Award,
  MessageSquare,
  Users,
} from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
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
  specialty: string;
  experience: number;
  rating: number | null;
  reviewsCount: number;
  consultations: number;
  revenue: string;
  amount: number;
  badge: string;
  status: string;
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

export default function AdminAstrologersTable() {
  const [search, setSearch] = useState('');
  const [astrologers, setAstrologers] = useState<AstrologerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState<AstrologerData | null>(null);

  // Admin Controls State
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
    fetchApprovedAstrologers();
  }, []);

  const fetchApprovedAstrologers = async () => {
    try {
      const q = query(collection(db, 'astrologers'), where('status', '==', 'approved'));
      const querySnapshot = await getDocs(q);
      const fetchedData: AstrologerData[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedData.push({
          id: docSnap.id,
          name: data.name || 'Unknown',
          email: data.email || 'No email',
          specialty: data.skills || 'Vedic Astrology',
          experience: data.experienceYears || data.experience || 10,
          rating: Number(data.rating) || 4.9,
          reviewsCount: Number(data.reviewsCount || data.reviews) || 2847,
          consultations: Number(data.consultations) || 12480,
          revenue: data.revenue || '₹0',
          amount: Number(data.amount) || 20,
          badge: data.badge || 'Top Rated',
          status: data.status || 'approved',
          avatar:
            data.profileImageUrl ||
            data.avatar ||
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop',
          tokenNumber: data.tokenNumber || 'N/A',
          dob: data.dob,
          gender: data.gender,
          city: data.city || 'Varanasi, India',
          phoneType: data.phoneType,
          languages: data.languages,
          learningSource: data.learningSource,
          workingElsewhere: data.workingElsewhere,
          dailyHours: data.dailyHours,
          createdAt: data.createdAt,
          bio: data.bio || data.about,
          education: data.education,
          certifications: data.certifications,
          reviewsList: data.reviewsList || [
            {
              id: 'rev-1',
              name: 'Arjun Mehta',
              avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_14ffa8b76-1772101717598.png',
              rating: 5,
              date: '2 days ago',
              comment:
                'Absolutely accurate predictions! Pt. Sharma predicted my job change 3 months in advance. His KP analysis is unmatched.',
            },
            {
              id: 'rev-2',
              name: 'Priya Kapoor',
              avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_14ceba124-1776062537292.png',
              rating: 5,
              date: '1 week ago',
              comment:
                'Very calm and detailed consultation. He explained remedies clearly without creating any fear.',
            },
          ],
        });
      });

      fetchedData.sort((a, b) => a.name.localeCompare(b.name));
      setAstrologers(fetchedData);
    } catch (error) {
      console.error('Error fetching astrologers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ast: AstrologerData) => {
    setSelectedAstrologer(ast);
    setEditingAmount(String(ast.amount || 20));
    setEditingRating(String(ast.rating || 4.9));
    setEditingReviewsCount(String(ast.reviewsCount || 2847));
    setEditingConsultations(String(ast.consultations || 12480));
    setEditingBadge(ast.badge || 'Top Rated');
    setReviewsList(ast.reviewsList || []);
  };

  const handleSaveStats = async () => {
    if (!selectedAstrologer) return;
    setIsSavingStats(true);
    const newAmt = Number(editingAmount) || 0;
    const newRating = Number(editingRating) || 4.9;
    const newRevCount = Number(editingReviewsCount) || 2847;
    const newConsCount = Number(editingConsultations) || 12480;

    try {
      const astRef = doc(db, 'astrologers', selectedAstrologer.id);
      const updatePayload = {
        amount: newAmt,
        rating: newRating,
        reviewsCount: newRevCount,
        reviews: newRevCount,
        consultations: newConsCount,
        badge: editingBadge,
        reviewsList,
      };

      await updateDoc(astRef, updatePayload);

      setAstrologers((prev) =>
        prev.map((a) => (a.id === selectedAstrologer.id ? { ...a, ...updatePayload } : a))
      );
      setSelectedAstrologer({ ...selectedAstrologer, ...updatePayload });
      toast.success(`Admin Stats & Rating updated for ${selectedAstrologer.name}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update stats');
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
    toast.success('Review added to draft. Click Save Stats to persist.');
  };

  const handleDeleteReview = (idx: number) => {
    setReviewsList(reviewsList.filter((_, i) => i !== idx));
    toast.info('Review removed from list');
  };

  const filtered = astrologers.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">Approved Astrologers</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring w-40"
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
            <p>Loading approved astrologers...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  'Astrologer',
                  'Specialty',
                  'Experience',
                  'Rate (₹/min)',
                  'Rating & Reviews',
                  'Consultations',
                  'Badge',
                  'Actions',
                ].map((h) => (
                  <th
                    key={`ast-th-${h}`}
                    className="text-left px-5 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    No approved astrologers found.
                  </td>
                </tr>
              ) : (
                filtered.map((ast, i) => (
                  <motion.tr
                    key={ast.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <AppImage
                          src={ast.avatar}
                          alt={ast.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-foreground">{ast.name}</div>
                          <div className="text-xs text-muted-foreground">{ast.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{ast.specialty}</td>
                    <td className="px-5 py-4 text-foreground tabular-nums">{ast.experience} yrs</td>
                    <td className="px-5 py-4 font-bold text-[#C9952B] tabular-nums">
                      ₹{ast.amount || 20}/min
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-foreground font-semibold">
                        <Star size={13} fill="currentColor" className="text-amber-400" />
                        <span>{ast.rating || 4.9}</span>
                        <span className="text-xs text-muted-foreground">({ast.reviewsCount || 2847})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground tabular-nums font-mono">
                      {(ast.consultations || 12480).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      {ast.badge ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C9952B]/15 text-[#C9952B] border border-[#C9952B]/30">
                          {ast.badge}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleOpenModal(ast)}
                        className="px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground font-semibold text-xs transition-all flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        <span>Admin Controls</span>
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Admin Control Modal via Portal */}
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
                  className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto relative space-y-8"
                >
                  <button
                    onClick={() => setSelectedAstrologer(null)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <XCircle size={24} />
                  </button>

                  {/* Header */}
                  <div className="flex items-center gap-4 pb-6 border-b border-border">
                    {selectedAstrologer.avatar && selectedAstrologer.avatar !== 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop' ? (
                      <img src={selectedAstrologer.avatar} alt={selectedAstrologer.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#C9952B]" />
                    ) : (
                      <div className="w-16 h-16 rounded-full gold-gradient-bg flex items-center justify-center text-white text-2xl font-bold">
                        {selectedAstrologer.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{selectedAstrologer.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded-md">
                          Token: #{selectedAstrologer.tokenNumber}
                        </span>
                        <span>•</span>
                        {selectedAstrologer.email}
                      </p>
                    </div>
                  </div>

                  {/* Admin Rate & Rating Control Box */}
                  <div className="p-6 rounded-3xl bg-[#C9952B]/10 border border-[#C9952B]/30 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                        <IndianRupee size={20} className="text-[#C9952B]" />
                        <span>Admin Rating, Rate & Stats Manager</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveStats}
                        disabled={isSavingStats}
                        className="px-6 py-2.5 rounded-xl gold-gradient-bg text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20 disabled:opacity-50"
                      >
                        {isSavingStats ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        <span>Save Admin Stats</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Rate (₹/min)</label>
                        <input
                          type="number"
                          value={editingAmount}
                          onChange={(e) => setEditingAmount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-sm outline-none focus:border-[#C9952B]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Rating (1.0 - 5.0)</label>
                        <input
                          type="number"
                          step="0.1"
                          max="5.0"
                          value={editingRating}
                          onChange={(e) => setEditingRating(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-sm outline-none focus:border-[#C9952B]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Total Reviews Count</label>
                        <input
                          type="number"
                          value={editingReviewsCount}
                          onChange={(e) => setEditingReviewsCount(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-sm outline-none focus:border-[#C9952B]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">Total Consultations</label>
                        <input
                          type="number"
                          value={editingConsultations}
                          onChange={(e) => setEditingConsultations(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground font-bold text-sm outline-none focus:border-[#C9952B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Special Badge</label>
                      <select
                        value={editingBadge}
                        onChange={(e) => setEditingBadge(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground font-semibold text-xs outline-none focus:border-[#C9952B] cursor-pointer"
                      >
                        <option value="Top Rated">Top Rated</option>
                        <option value="Verified Expert">Verified Expert</option>
                        <option value="Celebrity Astrologer">Celebrity Astrologer</option>
                        <option value="Gold Medalist">Gold Medalist</option>
                        <option value="Master Astrologer">Master Astrologer</option>
                        <option value="">None</option>
                      </select>
                    </div>
                  </div>

                  {/* Admin Customer Reviews Manager */}
                  <div className="space-y-4 pt-2">
                    <h4 className="font-bold text-lg text-foreground flex items-center gap-2 border-b border-border pb-3">
                      <MessageSquare size={18} className="text-accent" /> Customer Reviews Manager ({reviewsList.length})
                    </h4>

                    {/* Add New Review Input Card */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                      <span className="text-xs font-bold text-accent uppercase tracking-wider block">Add New Review</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Reviewer Name (e.g. Arjun Mehta)"
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

                    {/* Existing Reviews List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {reviewsList.map((rev, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-muted/20 border border-border flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{rev.name}</span>
                              <span className="text-amber-400 font-bold flex items-center">
                                ★ {rev.rating}
                              </span>
                              <span className="text-muted-foreground text-[10px]">• {rev.date}</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{rev.comment}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(idx)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
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
    </div>
  );
}
