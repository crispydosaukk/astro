'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useUserData } from '@/lib/useUserData';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  Loader2,
  Video,
  Phone,
  Calendar,
  Clock,
  Bot,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Download,
  X,
  Globe,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '@/lib/CurrencyContext';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

export default function OrderHistoryPage() {
  const { user, loading: userLoading } = useUserData();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'ai' | 'human'>('ai');

  const [humanHistory, setHumanHistory] = useState<any[]>([]);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected AI Session for detailed modal view
  const [selectedAiSession, setSelectedAiSession] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'remedies' | 'transcript'>('remedies');

  useEffect(() => {
    const fetchAllHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Human Astrologer Calls
        const humanQ = query(
          collection(db, 'consultations'),
          where('customerId', '==', user.uid),
          where('status', '==', 'completed')
        );
        const humanSnap = await getDocs(humanQ);
        const humanData = humanSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        humanData.sort((a: any, b: any) => {
          if (a.createdAt && b.createdAt) {
            return (b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime()) -
                   (a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime());
          }
          return 0;
        });
        setHumanHistory(humanData);

        // 2. Fetch AI Astrologer Consultations
        const aiQ = query(
          collection(db, 'ai_consultations'),
          where('customerId', '==', user.uid)
        );
        const aiSnap = await getDocs(aiQ);
        const aiData = aiSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Merge with locally cached sessions if any
        try {
          const cached = JSON.parse(localStorage.getItem('astroparihar_ai_history') || '[]');
          cached.forEach((item: any) => {
            if (!aiData.some((existing: any) => existing.id === item.id)) {
              aiData.push(item);
            }
          });
        } catch (e) {
          console.warn('Cache merge warning:', e);
        }

        aiData.sort((a: any, b: any) => {
          const timeB = new Date(b.createdAt || b.startTime || 0).getTime();
          const timeA = new Date(a.createdAt || a.startTime || 0).getTime();
          return timeB - timeA;
        });
        setAiHistory(aiData);

        // Auto-open session if session ID is in URL query or if recently completed
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const tabParam = params.get('tab');
          if (tabParam === 'ai' || tabParam === 'human') {
            setActiveTab(tabParam);
          }
          const sessionParam = params.get('session');
          if (sessionParam) {
            const found = aiData.find((s: any) => s.id === sessionParam);
            if (found) {
              setSelectedAiSession(found);
              setActiveTab('ai');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching order history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchAllHistory();
    }
  }, [user, userLoading]);

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">
      <Navbar />
      <div className="container mx-auto p-6 lg:p-8 max-w-5xl pt-36 lg:pt-40 pb-20">
        {/* Page Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#292522] flex items-center gap-3 font-serif">
              <Clock className="text-[#713B32]" size={32} />
              Consultation & Order History
            </h1>
            <p className="text-sm text-[#6B5E55] mt-1.5">
              Review your complete AI voice consultations, conversation transcripts, and astrologer bookings.
            </p>
          </div>

          <Link
            href="/talk-to-ai-astrologer"
            className="px-5 py-2.5 rounded-xl bg-[#713B32] hover:bg-[#552B24] text-white font-semibold text-xs flex items-center gap-2 shadow-md hover:opacity-95 transition-all self-start md:self-auto"
          >
            <Bot size={15} />✦ Talk to AI Astrologer
          </Link>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-3 p-1.5 bg-[#EDE4D5] rounded-2xl border border-[#E5D9C8] mb-8 w-full max-w-md shadow-inner">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-[#713B32] text-white shadow-md'
                : 'text-[#6B5E55] hover:text-[#292522]'
            }`}
          >
            <Bot size={15} /> ✦ AI Consultations ({aiHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('human')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'human'
                ? 'bg-[#713B32] text-white shadow-md'
                : 'text-[#6B5E55] hover:text-[#292522]'
            }`}
          >
            <Phone size={14} /> Astrologer Calls ({humanHistory.length})
          </button>
        </div>

        {/* Loading State */}
        {loading || userLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#713B32]" size={40} />
          </div>
        ) : activeTab === 'ai' ? (
          /* AI Consultations Tab */
          aiHistory.length > 0 ? (
            <div className="space-y-4">
              {aiHistory.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#FFFDFC] rounded-2xl border border-[#E5D9C8] hover:border-[#C9952B] p-6 shadow-sm hover:shadow-md transition-all text-[#292522]"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Astrologer & Details */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#C9952B] relative flex-shrink-0 shadow-sm">
                        <AppImage
                          src={
                            item.astrologerAvatar ||
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300'
                          }
                          alt={item.astrologerName || 'Astrologer'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-[#292522] font-serif">
                            {item.astrologerName}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8F3EA] text-[#713B32] border border-[#E5D9C8]">
                            {item.primaryDiscipline || 'Vedic Jyotish'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {item.status === 'completed' ? 'Completed' : 'Ended'}
                          </span>
                        </div>

                        <p className="text-xs text-[#6B5E55] mt-1">
                          Topic: <span className="font-semibold text-[#292522]">{item.birthDetails?.primaryConcern || 'General Life Guidance'}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#6B5E55]">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar size={14} className="text-[#C9952B]" />
                            {new Date(item.createdAt || item.startTime || Date.now()).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock size={14} className="text-[#C9952B]" />
                            {item.billedMinutes || 1} minutes
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <Globe size={14} className="text-[#C9952B]" />
                            Language: <span className="text-[#713B32] font-bold">{item.language || 'English'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & View Action */}
                    <div className="flex flex-col md:items-end justify-between gap-3 bg-[#F8F3EA] p-4 rounded-xl border border-[#E5D9C8]">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-[#6B5E55] font-bold uppercase tracking-wider block">
                          Total Amount Paid
                        </span>
                        <span className="text-2xl font-bold text-[#C9952B]">
                          {formatPrice(item.totalBilledAmount || (item.billedMinutes || 1) * (item.pricePerMin || 20))}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedAiSession(item);
                          setModalTab('remedies');
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#B08022] hover:from-[#B08022] hover:to-[#966B1A] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Sparkles size={13} /> View Transcript & Remedies
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FFFDFC] rounded-2xl border border-[#E5D9C8] p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#EDE4D5] flex items-center justify-center mx-auto mb-4 text-[#713B32]">
                <Bot size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#292522] mb-2 font-serif">
                No AI Consultations Yet
              </h3>
              <p className="text-[#6B5E55] mb-6 text-sm max-w-md mx-auto">
                Connect instantly with our elite AI Vedic Astrologers in your preferred language (Telugu, Hindi, English, and Tamil).
              </p>
              <Link
                href="/talk-to-ai-astrologer"
                className="px-6 py-2.5 rounded-xl font-bold bg-[#713B32] hover:bg-[#552B24] text-white transition-all shadow-md inline-flex items-center gap-2 text-xs"
              >
                <Bot size={15} /> Start AI Voice Consultation
              </Link>
            </div>
          )
        ) : (
          /* Human Astrologer Calls Tab */
          humanHistory.length > 0 ? (
            <div className="space-y-4">
              {humanHistory.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#FFFDFC] rounded-2xl border border-[#E5D9C8] hover:border-[#713B32]/40 p-6 shadow-sm transition-all text-[#292522]"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#713B32]/10 flex items-center justify-center flex-shrink-0 text-[#713B32]">
                        {order.type === 'video' ? (
                          <Video size={24} />
                        ) : (
                          <Phone size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#292522] font-serif">
                          {order.type === 'video' ? 'Video' : 'Audio'} Consultation with{' '}
                          {order.astrologerName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[#6B5E55]">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-[#C9952B]" /> {order.date} at {order.time}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-[#C9952B]" /> {order.duration} minutes
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end justify-center bg-[#F8F3EA] p-4 rounded-xl border border-[#E5D9C8]">
                      <span className="text-xs text-[#6B5E55] font-bold mb-1 uppercase tracking-wider">
                        Amount Paid
                      </span>
                      <span className="text-2xl font-bold text-[#C9952B] flex items-center gap-1.5">
                        {formatPrice(order.price || 0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FFFDFC] rounded-2xl border border-[#E5D9C8] p-12 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#EDE4D5] flex items-center justify-center mx-auto mb-4 text-[#6B5E55]">
                <Phone size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#292522] mb-2 font-serif">
                No Past Astrologer Calls
              </h3>
              <p className="text-[#6B5E55] mb-6 text-sm">
                You haven't completed any live consultations with human astrologers yet.
              </p>
              <Link
                href="/talk-to-astrologer"
                className="px-6 py-2.5 rounded-xl font-semibold bg-[#EDE4D5] hover:bg-[#EDE4D5]/80 text-[#292522] border border-[#E5D9C8] transition-all text-xs inline-block"
              >
                Book Astrologer Session
              </Link>
            </div>
          )
        )}
      </div>

      {/* Detailed Modal for AI Session (Transcript & Remedies in Authentic Theme) */}
      <AnimatePresence>
        {selectedAiSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFDFC] border border-[#E5D9C8] max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col text-[#292522]"
            >
              {/* Header in rich celestial terracotta */}
              <div className="p-6 bg-gradient-to-r from-[#713B32] via-[#8E4C41] to-[#552B24] text-[#FFFDFC] text-center relative border-b border-[#E5D9C8]">
                <button
                  onClick={() => setSelectedAiSession(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFDFC]/20 text-[#FFFDFC] border border-white/30 mb-1.5">
                  <Sparkles size={12} /> {selectedAiSession.primaryDiscipline || 'Vedic Jyotish'}
                </div>
                <h2 className="text-2xl font-bold text-[#FFFDFC] font-serif">
                  Consultation with {selectedAiSession.astrologerName}
                </h2>
                <p className="text-xs text-[#F3EBDD] mt-1">
                  Language: <span className="font-bold text-[#FFDF80]">{selectedAiSession.language || 'English'}</span> · {new Date(selectedAiSession.createdAt || selectedAiSession.startTime || Date.now()).toLocaleString()}
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
                    <MessageSquare size={13} /> Full Conversation Transcript ({selectedAiSession.conversationTranscript?.length || 0})
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
                        {selectedAiSession.summary?.overview ||
                          `Divine consultation completed with ${selectedAiSession.astrologerName} covering ${selectedAiSession.birthDetails?.primaryConcern || 'life guidance'}.`}
                      </p>
                    </div>

                    {/* Planetary Insights */}
                    {selectedAiSession.summary?.astrologicalHighlights?.length > 0 && (
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-2">
                          Key Planetary Observations
                        </h4>
                        <ul className="space-y-2 text-[#292522]">
                          {selectedAiSession.summary.astrologicalHighlights.map((h: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 bg-[#F8F3EA] p-2.5 rounded-xl border border-[#E5D9C8]">
                              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-relaxed font-medium">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Timeline Predictions */}
                    {selectedAiSession.summary?.timelinePredictions?.length > 0 && (
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-2">
                          Timeline Predictions
                        </h4>
                        <div className="space-y-2">
                          {selectedAiSession.summary.timelinePredictions.map((p: string, i: number) => (
                            <div key={i} className="p-3 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8] text-[#292522] leading-relaxed font-medium">
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remedies */}
                    {selectedAiSession.summary?.recommendedRemedies?.length > 0 && (
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-2">
                          Recommended Remedies & Mantras
                        </h4>
                        <div className="space-y-2.5">
                          {selectedAiSession.summary.recommendedRemedies.map((r: any, i: number) => (
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
                    {selectedAiSession.summary?.panditJiFinalBlessing && (
                      <div className="p-4 bg-gradient-to-r from-[#F8F3EA] to-[#EDE4D5] rounded-2xl border border-[#C9952B]/50 text-center italic text-[#713B32] font-medium font-serif leading-relaxed">
                        "{selectedAiSession.summary.panditJiFinalBlessing}"
                      </div>
                    )}
                  </>
                ) : (
                  /* Conversation Transcript Tab */
                  <div className="space-y-3">
                    <h4 className="font-bold uppercase tracking-wider text-[#713B32] mb-2 flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#C9952B]" /> Complete Conversation Exchanges
                    </h4>
                    {(!selectedAiSession.conversationTranscript || selectedAiSession.conversationTranscript.length === 0) ? (
                      <div className="bg-[#F8F3EA] p-6 rounded-2xl border border-[#E5D9C8] text-center text-[#6B5E55]">
                        <p>No chat messages recorded in this consultation.</p>
                      </div>
                    ) : (
                      selectedAiSession.conversationTranscript.map((msg: any, i: number) => (
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
                              {msg.role === 'user' ? 'Devotee (You)' : selectedAiSession.astrologerName}
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
