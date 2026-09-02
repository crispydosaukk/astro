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
    <section id="ai-astrologers" className="py-12 bg-[#F8F3EA] text-[#292522] relative">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] shadow-sm">
                <Sparkles size={13} className="text-[#C9952B] animate-pulse" /> 50 AI Astrologers · 24x7 Instant Voice Calls
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                <Zap size={12} className="text-emerald-600" /> Zero Wait Time
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#292522] tracking-tight">
              Talk to <span className="text-gradient-gold">AI Expert Astrologers</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E55] font-medium mt-1 max-w-2xl leading-relaxed">
              Authentic Vedic, Nadi, Prashna & KP systems with intelligent real-time conversational voice. Instant answers, birth chart calculations & practical remedies.
            </p>
          </div>
          <Link
            href="/talk-to-ai-astrologer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E5D9C8] hover:border-[#713B32] text-xs sm:text-sm font-bold text-[#292522] hover:text-[#713B32] transition-all bg-[#FFFDFC] shadow-sm whitespace-nowrap shrink-0"
          >
            <Bot size={16} className="text-[#C9952B]" /> View All 50 AI Astrologers <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* AI Astrologers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {astrologers.map((astro, idx) => {
            const currentAvail = astro.availability || 'online';
            return (
              <motion.div
                key={astro.id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="group bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#B88A44] rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden card-hover"
              >
                <div>
                  {/* Top Row: Avatar & Info */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E5D9C8] relative shadow-sm group-hover:scale-105 transition-transform bg-[#EDE4D5]">
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
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#FFFDFC]"></span>
                          </>
                        ) : currentAvail === 'busy' ? (
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-[#FFFDFC]"></span>
                        ) : (
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-400 border-2 border-[#FFFDFC]"></span>
                        )}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDE4D5] text-[#713B32] uppercase tracking-wider inline-block mb-1 truncate max-w-[140px] border border-[#E5D9C8]">
                        {astro.primaryDiscipline}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-[#292522] group-hover:text-[#713B32] transition-colors truncate">
                        {astro.name}
                      </h3>
                      <p className="text-xs text-[#6B5E55] font-medium truncate mt-0.5">
                        {astro.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Rating & Consultations Bar */}
                  <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#F8F3EA] rounded-xl border border-[#E5D9C8] mb-3 text-[#292522]">
                    <div className="flex items-center gap-1 font-bold text-[#292522]">
                      <Star size={12} className="fill-[#C9952B] text-[#C9952B]" />
                      <span>{astro.rating.toFixed(2)}</span>
                      <span className="text-[#6B5E55] text-[11px] font-normal">
                        ({(astro.totalConsultations / 1000).toFixed(1)}k)
                      </span>
                    </div>
                    <div className="text-[#6B5E55] text-[11px] font-semibold">
                      {astro.experienceYears}+ Yrs Exp
                    </div>
                  </div>

                  {/* Speciality Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    {(astro.specialities || []).slice(0, 2).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-[#EDE4D5]/70 text-[#713B32] border border-[#E5D9C8] truncate max-w-[140px]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Price & Call CTA */}
                <div className="pt-3 border-t border-[#E5D9C8] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#6B5E55] font-semibold block leading-none">Rate</span>
                    <span className="text-sm font-bold text-[#713B32]">
                      {formatPrice(astro.pricePerMin)}<span className="text-[11px] font-normal text-[#6B5E55]">/min</span>
                    </span>
                  </div>

                  <Link
                    href={`/talk-to-ai-astrologer?astrologer=${astro.id}`}
                    className="px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white shadow-md shadow-[#C9952B]/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Phone size={12} className="fill-white" /> Call Instant
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
