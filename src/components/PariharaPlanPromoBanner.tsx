'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import CompletePariharaPlanModal from './CompletePariharaPlanModal';

interface PariharaPlanPromoBannerProps {
  className?: string;
  source?: string;
}

export default function PariharaPlanPromoBanner({ className = '', source = 'remedies' }: PariharaPlanPromoBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState<number>(499);
  const [title, setTitle] = useState('Generate My Complete Parihara Plan');

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/settings/pricing');
        const data = await res.json();
        if (data.pricing?.pariharaPlanPrice) {
          setPrice(data.pricing.pariharaPlanPrice);
        }
        if (data.pricing?.pariharaPlanTitle) {
          setTitle(data.pricing.pariharaPlanTitle);
        }
      } catch (e) {
        console.warn('Could not fetch dynamic price for banner:', e);
      }
    }
    fetchPricing();
  }, []);

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#2A0F06] via-[#481E0C] to-[#250903] text-white border-2 border-[#D4AF37]/50 shadow-xl ${className}`}
      >
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#D4AF37]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#E53E3E]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/25 text-[#F6D075] border border-[#D4AF37]/40 shadow-xs">
                <Sparkles size={13} className="text-[#F6D075]" />
                FLAGSHIP VEDIC ARCHITECTURE
              </span>
              <span className="text-xs text-white/70">· Personalized to Janam Kundli & Dasha</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Flame className="text-[#F6D075] shrink-0" size={28} />
              <span>{title}</span>
            </h3>

            <p className="text-sm text-white/85 leading-relaxed">
              Synthesize your complete 8-fold remedial blueprint: Sacred Mantras, Yantra Sthapana, Fire Homas,
              Ishta Devata Sadhana, Certified Gemstones, Mukhi Rudraksha, Directional Vastu, and 48-Day Sankalpa.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs text-[#F6D075]">
              <span className="flex items-center gap-1">
                <Check size={13} className="text-green-400" /> 8 Sacred Remedies
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-green-400" /> Ishta Devata Grace
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-green-400" /> Temple Pariharams
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-green-400" /> 48-Day Sankalpa
              </span>
            </div>
          </div>

          {/* CTA & Price Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
            <div className="lg:text-right">
              <span className="text-2xs uppercase tracking-widest text-[#F6D075] font-bold block">
                All-Inclusive Remedial Fee
              </span>
              <span className="text-3xl sm:text-4xl font-black text-[#F6D075] drop-shadow-sm">
                ₹{price}
              </span>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] font-black text-sm hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/30 cursor-pointer"
            >
              <span>Generate My Parihara Plan</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>

      <CompletePariharaPlanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
