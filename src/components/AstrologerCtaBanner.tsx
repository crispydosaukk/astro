'use client';

import React from 'react';
import Link from 'next/link';
import { PhoneCall, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';

interface AstrologerCtaBannerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  category?: string;
  theme?: 'gold' | 'rose' | 'emerald' | 'cyan';
}

export default function AstrologerCtaBanner({
  title = 'Need Personalized Guidance on Your Horoscope?',
  subtitle = 'Connect with India’s top certified Vedic astrologers for deep chart analysis, accurate future predictions, and instant remedies.',
  badge = '24/7 Live Astrologers Available',
  category,
  theme = 'gold',
}: AstrologerCtaBannerProps) {
  const targetUrl = category
    ? `/talk-to-astrologer?category=${encodeURIComponent(category)}`
    : '/talk-to-astrologer';

  return (
    <div className="bg-[#FFFDFC] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#E5D9C8] relative overflow-hidden shadow-xl space-y-6 my-8 text-[#292522]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] flex items-center gap-1.5">
              <Sparkles size={13} /> {badge}
            </span>
            <span className="text-[11px] text-[#6B5E55] flex items-center gap-1 font-semibold">
              <ShieldCheck size={13} className="text-emerald-600" /> 100% Confidential
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-[#292522] tracking-tight">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-[#6B5E55] leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link
            href={targetUrl}
            className="px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg bg-[#713B32] hover:bg-[#552B24] text-white transition-all"
          >
            <PhoneCall size={16} /> Talk to Astrologer
          </Link>
          <Link
            href={targetUrl}
            className="px-6 py-3.5 rounded-full bg-[#EDE4D5] border border-[#E5D9C8] text-[#292522] font-bold text-xs sm:text-sm hover:bg-[#EDE4D5]/80 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} /> Chat Online
          </Link>
        </div>
      </div>
    </div>
  );
}
