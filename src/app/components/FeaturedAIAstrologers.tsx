'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, PhoneCall, Star, Sparkles, ArrowRight, ShieldCheck, Zap, Phone } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { getAIAstrologers, AIAstrologer, DEFAULT_AI_ASTROLOGERS } from '@/lib/aiAstrologerData';
import { useCurrency } from '@/lib/CurrencyContext';

export default function FeaturedAIAstrologers() {
  const [astrologers, setAstrologers] = useState<AIAstrologer[]>(DEFAULT_AI_ASTROLOGERS);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    getAIAstrologers()
      .then((data) => {
        if (data && data.length > 0) {
          setAstrologers(data.filter((a) => a.isActive !== false).slice(0, 8));
        }
      })
      .catch((err) => console.error('Failed to load AI astrologers:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="ai-astrologers" className="py-10 bg-gradient-to-b from-[#140E0A] via-[#1A130E] to-[#140E0A] text-white relative overflow-hidden border-y border-[#D8B66A]/20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#C9952B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#713B32]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#C9952B]/20 text-[#D8B66A] border border-[#C9952B]/40">
                <Sparkles size={12} className="animate-pulse" /> 50 AI Astrologers · 24x7 Instant Voice Calls
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Zap size={11} /> Zero Wait Time
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Talk to <span className="text-gradient-gold">AI Expert Astrologers</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/70 mt-0.5 max-w-2xl">
              Authentic Vedic, Nadi, Prashna & KP systems with intelligent real-time conversational voice. Instant answers, birth chart calculations & practical remedies.
            </p>
          </div>
          <Link
            href="/talk-to-ai-astrologer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#C9952B]/40 hover:border-[#C9952B] text-xs font-bold text-[#D8B66A] hover:text-white transition-all bg-[#C9952B]/10 hover:bg-[#C9952B]/20 shadow-md whitespace-nowrap shrink-0"
          >
            <Bot size={15} /> View All 50 AI Astrologers <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* AI Astrologers Grid - Compact & Clean */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {astrologers.map((astro, idx) => {
            const currentAvail = astro.availability || 'online';
            return (
              <motion.div
                key={astro.id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="group bg-[#1E1712]/90 border border-[#D8B66A]/20 hover:border-[#D8B66A]/60 rounded-2xl p-4 shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm"
              >
                <div>
                  {/* Top Row: Avatar & Info */}
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="relative shrink-0">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-[#C9952B]/60 relative shadow-md group-hover:scale-105 transition-transform">
                        <AppImage
                          src={astro.avatar}
                          alt={astro.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Availability status dot */}
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                        {currentAvail === 'online' ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#1E1712]"></span>
                          </>
                        ) : currentAvail === 'busy' ? (
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-[#1E1712]"></span>
                        ) : (
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-400 border-2 border-[#1E1712]"></span>
                        )}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#C9952B]/20 text-[#D8B66A] uppercase tracking-wider inline-block mb-0.5 truncate max-w-[120px]">
                        {astro.primaryDiscipline}
                      </span>
                      <h3 className="font-bold text-sm text-white group-hover:text-[#D8B66A] transition-colors truncate">
                        {astro.name}
                      </h3>
                      <p className="text-[11px] text-white/60 truncate">
                        {astro.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Rating & Consultations Bar */}
                  <div className="flex items-center justify-between text-[11px] py-1 px-2.5 bg-white/5 rounded-lg border border-white/10 mb-2.5 text-white/80">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={11} className="fill-amber-400" />
                      <span>{astro.rating.toFixed(2)}</span>
                      <span className="text-white/40 text-[10px]">
                        ({(astro.totalConsultations / 1000).toFixed(1)}k)
                      </span>
                    </div>
                    <div className="text-white/60 text-[10px]">
                      {astro.experienceYears}+ Yrs Exp
                    </div>
                  </div>

                  {/* Speciality Badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(astro.specialities || []).slice(0, 2).map((spec, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/80 border border-white/10 truncate max-w-[130px]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Price & Call CTA */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[9px] text-white/50 block leading-none">Rate</span>
                    <span className="text-xs font-bold text-[#D8B66A]">
                      {formatPrice(astro.pricePerMin)}<span className="text-[10px] font-normal text-white/50">/min</span>
                    </span>
                  </div>

                  <Link
                    href={`/talk-to-ai-astrologer?astrologer=${astro.id}`}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white shadow-md shadow-[#C9952B]/20 transition-all active:scale-95"
                  >
                    <Phone size={11} className="fill-white" /> Call Instant
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
