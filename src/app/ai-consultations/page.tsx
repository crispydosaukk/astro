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
  CheckCircle2,
  Download,
  Phone,
  MessageSquare,
  Search,
  Loader2,
  X,
  Globe,
} from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function AIConsultationsHistoryPage() {
  const { user, loading: userLoading } = useUserData();
  const { formatPrice } = useCurrency();

  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'remedies' | 'transcript'>('remedies');

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'ai_consultations'), where('customerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const items: any[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });

        // Merge locally cached sessions
        try {
          const cached = JSON.parse(localStorage.getItem('astroparihar_ai_history') || '[]');
          cached.forEach((item: any) => {
            if (!items.some((existing: any) => existing.id === item.id)) {
              items.push(item);
            }
          });
        } catch (e) {
          console.warn('Cache merge warning:', e);
        }

        // Sort by createdAt desc
        items.sort(
          (a, b) => new Date(b.createdAt || b.startTime || 0).getTime() - new Date(a.createdAt || a.startTime || 0).getTime()
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
      c.birthDetails?.primaryConcern?.toLowerCase().includes(term) ||
      c.language?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">
      <Navbar />

      <section className="pt-32 pb-12 bg-gradient-to-r from-[#713B32] via-[#8E4C41] to-[#552B24] border-b border-[#E5D9C8] text-[#FFFDFC]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFDFC]/20 text-[#FFFDFC] border border-white/30 mb-2">
                <Bot size={13} /> Consultation Records
              </span>
              <h1 className="text-3xl font-bold font-serif text-[#FFFDFC]">
                AI Astrologer Consultations & Reports
              </h1>
              <p className="text-sm text-[#F3EBDD] mt-1">
                View your complete AI voice consultation records, full multi-turn transcripts, and personalized Vedic remedies.
              </p>
            </div>

            <Link
              href="/talk-to-ai-astrologer"
              className="px-5 py-2.5 rounded-xl bg-[#C9952B] hover:bg-[#B08022] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto"
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
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by astrologer name, language, or concern..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#C9952B] text-xs text-[#292522] outline-none shadow-sm font-medium"
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#713B32] mb-3" size={36} />
            <p className="text-xs text-[#6B5E55]">Loading your consultation history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <Bot size={44} className="text-[#713B32] mx-auto mb-3 opacity-60" />
            <h3 className="font-bold text-base text-[#292522] mb-1 font-serif">No Consultations Found</h3>
            <p className="text-xs text-[#6B5E55] mb-6">
              You haven't conducted any AI voice consultations yet.
            </p>
            <Link
              href="/talk-to-ai-astrologer"
              className="px-5 py-2.5 rounded-xl bg-[#713B32] hover:bg-[#552B24] text-white font-bold text-xs transition-colors inline-block shadow-sm"
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
                className="bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#C9952B] rounded-3xl p-5 flex flex-col justify-between transition-all hover:shadow-md text-[#292522]"
              >
                <div>
                  {/* Astrologer Top Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#C9952B] relative flex-shrink-0 shadow-sm">
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#F8F3EA] text-[#713B32] border border-[#E5D9C8] uppercase">
                          {item.primaryDiscipline || 'Vedic Jyotish'}
                        </span>
                        {item.language && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFF8ED] text-[#C9952B] border border-[#C9952B]/40">
                            {item.language}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#292522] truncate mt-0.5 font-serif">
                        {item.astrologerName}
                      </h4>
                      <p className="text-[11px] text-[#6B5E55] truncate font-medium">
                        {item.birthDetails?.primaryConcern || 'General Life Guidance'}
                      </p>
                    </div>
                  </div>

                  {/* Consultation Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#F8F3EA] rounded-xl border border-[#E5D9C8] text-center mb-4 text-xs">
                    <div>
                      <span className="text-[10px] text-[#6B5E55] uppercase block font-semibold">
                        Date
                      </span>
                      <span className="font-semibold text-[#292522]">
                        {new Date(item.createdAt || item.startTime || Date.now()).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B5E55] uppercase block font-semibold">
                        Duration
                      </span>
                      <span className="font-semibold text-[#292522]">
                        {item.billedMinutes || 1} min
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B5E55] uppercase block font-semibold">
                        Amount
                      </span>
                      <span className="font-bold text-[#C9952B]">
                        {formatPrice(item.totalBilledAmount || (item.billedMinutes || 1) * (item.pricePerMin || 20))}
                      </span>
                    </div>
                  </div>

                  {/* Snapshot of Key Observation */}
                  {item.summary?.astrologicalHighlights?.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] text-[#713B32] uppercase font-bold tracking-wider block mb-1">
                        Key Planetary Insight
                      </span>
                      <p className="text-xs text-[#292522] line-clamp-2 bg-[#F8F3EA] p-2.5 rounded-lg border border-[#E5D9C8]">
                        {item.summary.astrologicalHighlights[0]}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedSession(item);
                    setModalTab('remedies');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#713B32] hover:bg-[#552B24] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Sparkles size={13} /> View Transcript & Remedies
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Details & Transcript Modal */}
      <AnimatePresence>
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFDFC] border border-[#E5D9C8] max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col text-[#292522]"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-[#713B32] via-[#8E4C41] to-[#552B24] text-[#FFFDFC] text-center relative border-b border-[#E5D9C8]">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFDFC]/20 text-[#FFFDFC] border border-white/30 mb-1.5">
                  <Sparkles size={12} /> {selectedSession.primaryDiscipline || 'Vedic Jyotish'}
                </div>
                <h2 className="text-2xl font-bold text-[#FFFDFC] font-serif">
                  Consultation with {selectedSession.astrologerName}
                </h2>
                <p className="text-xs text-[#F3EBDD] mt-1">
                  Language: <span className="font-bold text-[#FFDF80]">{selectedSession.language || 'English'}</span> · {new Date(selectedSession.createdAt || selectedSession.startTime || Date.now()).toLocaleString()}
                </p>

                {/* Tab Switcher inside Modal */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setModalTab('remedies')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      modalTab === 'remedies'
                        ? 'bg-[#C9952B] text-white shadow-md'
                        : 'bg-black/20 text-[#F3EBDD] hover:text-white'
                    }`}
                  >
                    <Sparkles size={13} /> Vedic Summary & Remedies
                  </button>
                  <button
                    onClick={() => setModalTab('transcript')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      modalTab === 'transcript'
                        ? 'bg-[#C9952B] text-white shadow-md'
                        : 'bg-black/20 text-[#F3EBDD] hover:text-white'
                    }`}
                  >
                    <MessageSquare size={13} /> Full Conversation Transcript ({selectedSession.conversationTranscript?.length || 0})
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs bg-[#FFFDFC]">
                {modalTab === 'remedies' ? (
                  <>
                    {/* Overview */}
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-1.5">
                        Consultation Overview
                      </h4>
                      <p className="text-[#292522] leading-relaxed bg-[#F8F3EA] p-3.5 rounded-xl border border-[#E5D9C8]">
                        {selectedSession.summary?.overview ||
                          `Divine consultation completed with ${selectedSession.astrologerName} covering ${selectedSession.birthDetails?.primaryConcern || 'life guidance'}.`}
                      </p>
                    </div>

                    {/* Planetary Insights */}
                    {selectedSession.summary?.astrologicalHighlights?.length > 0 && (
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-2">
                          Key Planetary Observations
                        </h4>
                        <ul className="space-y-2 text-[#292522]">
                          {selectedSession.summary.astrologicalHighlights.map((h: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 bg-[#F8F3EA] p-2.5 rounded-xl border border-[#E5D9C8]">
                              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-relaxed font-medium">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Timeline Predictions */}
                    {selectedSession.summary?.timelinePredictions?.length > 0 && (
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-2">
                          Timeline Predictions
                        </h4>
                        <div className="space-y-2">
                          {selectedSession.summary.timelinePredictions.map((p: string, i: number) => (
                            <div key={i} className="p-3 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8] text-[#292522] leading-relaxed font-medium">
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remedies */}
                    {selectedSession.summary?.recommendedRemedies?.length > 0 && (
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-2">
                          Recommended Remedies & Mantras
                        </h4>
                        <div className="space-y-2.5">
                          {selectedSession.summary.recommendedRemedies.map((r: any, i: number) => (
                            <div key={i} className="p-3.5 rounded-xl bg-[#FFF8ED] border border-[#C9952B]/40 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-[#713B32] uppercase tracking-wide">{r.title}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded bg-[#C9952B]/20 text-[#8C6214] uppercase font-bold">
                                  {r.type}
                                </span>
                              </div>
                              <p className="text-[#292522] leading-relaxed">{r.instructions}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blessing */}
                    {selectedSession.summary?.panditJiFinalBlessing && (
                      <div className="p-4 bg-gradient-to-r from-[#F8F3EA] to-[#EDE4D5] rounded-2xl border border-[#C9952B]/50 text-center italic text-[#713B32] font-medium font-serif leading-relaxed">
                        "{selectedSession.summary.panditJiFinalBlessing}"
                      </div>
                    )}
                  </>
                ) : (
                  /* Conversation Transcript Tab */
                  <div className="space-y-3">
                    <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-2 flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#C9952B]" /> Complete Conversation Exchanges
                    </h4>
                    {(!selectedSession.conversationTranscript || selectedSession.conversationTranscript.length === 0) ? (
                      <div className="bg-[#F8F3EA] p-6 rounded-2xl border border-[#E5D9C8] text-center text-[#6B5E55]">
                        <p>No chat messages recorded in this consultation.</p>
                      </div>
                    ) : (
                      selectedSession.conversationTranscript.map((msg: any, i: number) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-[#713B32] text-white ml-8 border border-[#552B24]'
                              : 'bg-[#F8F3EA] border border-[#E5D9C8] text-[#292522] mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold text-[11px] ${msg.role === 'user' ? 'text-amber-200' : 'text-[#713B32]'}`}>
                              {msg.role === 'user' ? 'Devotee (You)' : selectedSession.astrologerName}
                            </span>
                            <span className={`text-[10px] ${msg.role === 'user' ? 'text-white/70' : 'text-[#6B5E55]'}`}>{msg.time || ''}</span>
                          </div>
                          <p className="whitespace-pre-wrap font-normal leading-relaxed">{msg.content || msg.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#E5D9C8] bg-[#F8F3EA] flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-[#E5D9C8] hover:border-[#C9952B] bg-[#FFFDFC] text-xs font-semibold text-[#292522] flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={13} /> Print Summary
                </button>
                <Link
                  href="/talk-to-ai-astrologer"
                  className="px-5 py-2 rounded-xl bg-[#713B32] hover:bg-[#552B24] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Start New AI Consultation
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
