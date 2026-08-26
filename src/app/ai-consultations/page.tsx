'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AppImage from '@/components/ui/AppImage';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Calendar,
  Clock,
  Wallet,
  CheckCircle2,
  Download,
  Phone,
  ChevronRight,
  FileText,
  Search,
  Loader2,
  X,
  Star,
} from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { AIConsultationSession } from '@/lib/aiAstrologerData';
import Link from 'next/link';

export default function AIConsultationsHistoryPage() {
  const { user, loading: userLoading } = useUserData();
  const { formatPrice } = useCurrency();

  const [consultations, setConsultations] = useState<AIConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<AIConsultationSession | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'ai_consultations'), where('customerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const items: AIConsultationSession[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as AIConsultationSession);
        });

        // Sort by createdAt desc
        items.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setConsultations(items);
      } catch (err) {
        console.error('Error fetching consultation history:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!userLoading) {
      fetchHistory();
    }
  }, [user, userLoading]);

  const filtered = consultations.filter((c) => {
    const term = search.toLowerCase();
    return (
      !term ||
      c.astrologerName?.toLowerCase().includes(term) ||
      c.primaryDiscipline?.toLowerCase().includes(term) ||
      c.birthDetails?.primaryConcern?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-32 pb-12 cosmic-bg border-b border-border/40">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/30 mb-2">
                <Bot size={13} /> Consultation Records
              </span>
              <h1 className="text-3xl font-bold font-serif text-foreground">
                AI Astrologer Consultations
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                View your complete AI voice consultation records, duration, and generated Vedic
                remedies.
              </p>
            </div>

            <Link
              href="/talk-to-ai-astrologer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#713B32] text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#C9952B]/20 hover:opacity-95 transition-all self-start md:self-auto"
            >
              <Phone size={14} className="fill-white" />✦ Talk to AI Astrologer
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Search Bar */}
        <div className="relative max-w-md mb-8">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by astrologer name, discipline, or concern..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border focus:border-[#C9952B] text-xs outline-none"
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#C9952B] mb-3" size={36} />
            <p className="text-xs text-muted-foreground">Loading your consultation history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center glass-card border border-border rounded-3xl p-8 max-w-md mx-auto">
            <Bot size={44} className="text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-base text-foreground mb-1">No Consultations Found</h3>
            <p className="text-xs text-muted-foreground mb-6">
              You haven't conducted any AI voice consultations yet.
            </p>
            <Link
              href="/talk-to-ai-astrologer"
              className="px-5 py-2.5 rounded-xl bg-[#C9952B] text-white font-semibold text-xs hover:bg-[#b08022] transition-colors"
            >
              Explore AI Astrologers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-border hover:border-[#C9952B]/60 rounded-3xl p-5 flex flex-col justify-between transition-all hover:shadow-xl"
              >
                <div>
                  {/* Astrologer Top Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#C9952B] relative">
                      <AppImage
                        src={
                          item.astrologerAvatar ||
                          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300'
                        }
                        alt={item.astrologerName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#C9952B]/20 text-[#C9952B] uppercase">
                        {item.primaryDiscipline}
                      </span>
                      <h4 className="font-bold text-sm text-foreground truncate mt-0.5">
                        {item.astrologerName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.birthDetails?.primaryConcern}
                      </p>
                    </div>
                  </div>

                  {/* Consultation Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xl border border-border/70 text-center mb-4 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">
                        Date
                      </span>
                      <span className="font-semibold text-foreground">
                        {new Date(item.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">
                        Duration
                      </span>
                      <span className="font-semibold text-foreground">
                        {item.billedMinutes || 1} min
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">
                        Amount
                      </span>
                      <span className="font-bold text-[#C9952B]">
                        {formatPrice(item.totalBilledAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {item.status === 'completed' ? 'Completed' : 'Ended'}
                  </span>

                  {item.summary ? (
                    <button
                      onClick={() => setSelectedSession(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#C9952B]/15 hover:bg-[#C9952B]/25 text-[#C9952B] font-semibold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles size={12} /> View Remedies
                    </button>
                  ) : (
                    <Link
                      href={`/talk-to-ai-astrologer`}
                      className="text-xs text-muted-foreground hover:text-[#C9952B] flex items-center gap-1"
                    >
                      Consult Again <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Summary & Remedies Details Modal */}
      <AnimatePresence>
        {selectedSession && selectedSession.summary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 cosmic-bg border-b border-border text-center relative">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/20 text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#C9952B]/20 text-[#C9952B] uppercase">
                  {selectedSession.primaryDiscipline}
                </span>
                <h2 className="text-xl font-bold text-foreground font-serif mt-1">
                  Vedic Astrological Summary & Remedies
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Consultation with {selectedSession.astrologerName} on{' '}
                  {new Date(selectedSession.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Overview */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[#C9952B] mb-1">
                    Consultation Overview
                  </h4>
                  <p className="text-foreground/90 leading-relaxed bg-muted/40 p-3 rounded-xl border border-border">
                    {selectedSession.summary.overview}
                  </p>
                </div>

                {/* Planetary Highlights */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[#C9952B] mb-2">
                    Key Planetary Insights
                  </h4>
                  <ul className="space-y-1.5 text-muted-foreground">
                    {selectedSession.summary.astrologicalHighlights?.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeline Predictions */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[#C9952B] mb-2">
                    Timeline Predictions
                  </h4>
                  <div className="space-y-2">
                    {selectedSession.summary.timelinePredictions?.map((p, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-muted/40 border border-border text-foreground/90"
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remedies */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[#C9952B] mb-2">
                    Recommended Remedies & Mantras
                  </h4>
                  <div className="space-y-2">
                    {selectedSession.summary.recommendedRemedies?.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#C9952B] uppercase">{r.title}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-[#C9952B]/20 text-[#C9952B] uppercase">
                            {r.type}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{r.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blessing */}
                <div className="p-3 bg-gradient-to-r from-[#713B32]/30 to-[#C9952B]/20 rounded-xl border border-[#C9952B]/30 text-center italic">
                  "{selectedSession.summary.panditJiFinalBlessing}"
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-card flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-border hover:border-[#C9952B] text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download size={13} /> Print Summary
                </button>
                <Link
                  href="/talk-to-ai-astrologer"
                  className="px-5 py-2 rounded-xl bg-[#C9952B] text-white text-xs font-bold hover:bg-[#b08022] transition-colors"
                >
                  Book New Consultation
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
