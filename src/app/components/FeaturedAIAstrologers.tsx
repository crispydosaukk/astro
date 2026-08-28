'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, PhoneCall, Star, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
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
    <section id="ai-astrologers" className="py-12 bg-gradient-to-b from-[#140E0A] via-[#1A130E] to-[#140E0A] text-white relative overflow-hidden border-y border-[#D8B66A]/20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9952B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#713B32]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#C9952B]/20 text-[#D8B66A] border border-[#C9952B]/40">
                <Sparkles size={13} className="animate-pulse" /> 24x7 Instant Voice Calls
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Zap size={12} /> Zero Wait Time
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Talk to <span className="text-gradient-gold">AI Expert Astrologers</span>
            </h2>
            <p className="text-sm text-white/70 mt-1 max-w-2xl">
              Authentic Vedic, Nadi, Prashna & KP systems with intelligent real-time conversational voice. Instant answers, birth chart calculations & practical remedies.
            </p>
          </div>
          <Link
            href="/talk-to-ai-astrologer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#C9952B]/40 hover:border-[#C9952B] text-sm font-bold text-[#D8B66A] hover:text-white transition-all bg-[#C9952B]/10 hover:bg-[#C9952B]/20 shadow-md whitespace-nowrap shrink-0"
          >
            <Bot size={16} /> View All AI Astrologers <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* AI Astrologers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {astrologers.map((astro, idx) => (
            <motion.div
              key={astro.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="group bg-[#1E1712]/90 border border-[#D8B66A]/20 hover:border-[#D8B66A]/60 rounded-3xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm"
            >
              {/* Subtle top gradient aura */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#C9952B]/15 rounded-full blur-2xl group-hover:bg-[#C9952B]/30 transition-colors" />

              <div>
                {/* Avatar & Online Indicator */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#C9952B]/60 relative shadow-lg group-hover:scale-105 transition-transform">
                      <AppImage
                        src={astro.avatar}
                        alt={astro.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Glowing Live AI Badge */}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#1E1712]"></span>
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C9952B]/20 text-[#D8B66A] uppercase tracking-wider inline-block mb-1">
                      {astro.primaryDiscipline}
                    </span>
                    <h3 className="font-bold text-base text-white group-hover:text-[#D8B66A] transition-colors truncate">
                      {astro.name}
                    </h3>
                    <p className="text-[11px] text-white/60 line-clamp-2 mt-0.5">
                      {astro.tagline}
                    </p>
                  </div>
                </div>

                {/* Rating & Consultations */}
                <div className="flex items-center justify-between text-xs py-2 border-y border-white/10 mb-3 text-white/80">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star size={13} className="fill-amber-400" />
                    <span>{astro.rating.toFixed(2)}</span>
                    <span className="text-white/50 text-[10px]">({astro.totalConsultations.toLocaleString()})</span>
                  </div>
                  <div className="text-white/60 text-[11px]">
                    {astro.experienceYears}+ Yrs Exp
                  </div>
                </div>

                {/* Speciality Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(astro.specialities || []).slice(0, 2).map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-white/80 border border-white/10"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Call Action Button */}
              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div>
                    <span className="text-[10px] text-white/50 block leading-tight">Consultation</span>
                    <span className="text-sm font-bold text-[#D8B66A]">
                      {formatPrice(astro.pricePerMin)}/min
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ● Available Now
                  </span>
                </div>

                <Link
                  href={`/talk-to-ai-astrologer?astrologer=${astro.id}`}
                  className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white shadow-lg shadow-[#C9952B]/20 transition-all duration-200 transform group-hover:scale-[1.02]"
                >
                  <PhoneCall size={14} className="animate-pulse" /> Call AI Expert Astrologer
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
