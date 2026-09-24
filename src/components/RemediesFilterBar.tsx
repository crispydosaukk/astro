'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Gem,
  CircleDot,
  Triangle,
  Music,
  Flame,
  Compass,
  ShieldCheck,
  Heart,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

export interface RemedyItem {
  id: string;
  name: string;
  sanskrit: string;
  href: string;
  icon: any;
  highlight?: boolean;
}

export const REMEDIES_NAV_LIST: RemedyItem[] = [
  {
    id: 'all',
    name: '✦ All Remedies',
    sanskrit: '8 Systems',
    href: '/remedies',
    icon: Sparkles,
    highlight: true,
  },
  {
    id: 'gemstone',
    name: 'Gemstones',
    sanskrit: 'रत्न',
    href: '/remedies/gemstone',
    icon: Gem,
  },
  {
    id: 'rudraksha',
    name: 'Rudraksha',
    sanskrit: 'रुद्राक्ष',
    href: '/remedies/rudraksha',
    icon: CircleDot,
  },
  {
    id: 'yantra',
    name: 'Sacred Yantras',
    sanskrit: 'यन्त्र',
    href: '/remedies/yantra',
    icon: Triangle,
  },
  {
    id: 'mantra',
    name: 'Vedic Mantras',
    sanskrit: 'मन्त्र',
    href: '/remedies/mantra',
    icon: Music,
  },
  {
    id: 'homa',
    name: 'Homa & Puja',
    sanskrit: 'होम',
    href: '/remedies/homa',
    icon: Flame,
  },
  {
    id: 'vastu',
    name: 'Vastu Shastra',
    sanskrit: 'वास्तु',
    href: '/remedies/vastu',
    icon: Compass,
  },
  {
    id: 'ishta-devata',
    name: 'Devata Upasana',
    sanskrit: 'उपासना',
    href: '/remedies/ishta-devata',
    icon: ShieldCheck,
  },
  {
    id: 'fasting',
    name: 'Fasting & Vrat',
    sanskrit: 'व्रत',
    href: '/remedies/fasting',
    icon: BookOpen,
  },
  {
    id: 'charity',
    name: 'Dāna & Seva',
    sanskrit: 'दान',
    href: '/remedies/charity',
    icon: Heart,
  },
];

interface RemediesFilterBarProps {
  className?: string;
  title?: string;
  subtitle?: string;
  selectedRemedy?: string;
  onSelectRemedy?: (remedyId: string) => void;
  remedyCounts?: Record<string, number>;
  showExploreLink?: boolean;
}

export default function RemediesFilterBar({
  className = '',
  title = 'Vedic Remedies & Parihar',
  subtitle = '8 Ashta-Digbandhana Sacred Solutions',
  selectedRemedy = 'all',
  onSelectRemedy,
  remedyCounts,
  showExploreLink = true,
}: RemediesFilterBarProps) {
  const isFilterMode = typeof onSelectRemedy === 'function';

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-[#C9952B]" /> {title}
          <span className="hidden sm:inline-block text-[11px] font-normal text-muted-foreground/80 lowercase">
            · {subtitle}
          </span>
        </h3>
        {showExploreLink && (
          <Link
            href="/remedies"
            className="text-xs text-[#C9952B] hover:text-[#966f33] font-semibold flex items-center gap-1 transition-colors group"
          >
            <span>Explore All Remedies</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {REMEDIES_NAV_LIST.map((item) => {
          const Icon = item.icon;
          const isSelected = isFilterMode
            ? selectedRemedy === item.id || (item.id === 'all' && (!selectedRemedy || selectedRemedy === 'all'))
            : false;
          const count = remedyCounts?.[item.id];

          if (isFilterMode) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectRemedy(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 group cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#C9952B] to-[#b08022] text-white border-[#C9952B] shadow-md font-bold ring-2 ring-[#C9952B]/30'
                    : 'bg-card border-border/80 text-foreground/80 hover:text-foreground hover:border-[#C9952B]/60 hover:bg-[#C9952B]/5 shadow-sm font-medium'
                }`}
              >
                <Icon
                  size={13}
                  className={`${
                    isSelected ? 'text-white scale-110' : 'text-[#C9952B] group-hover:scale-110'
                  } transition-transform`}
                />
                <span>{item.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-muted text-muted-foreground group-hover:bg-[#C9952B]/15 group-hover:text-[#966f33] dark:group-hover:text-[#E5B54F]'
                  }`}
                >
                  {item.sanskrit}
                </span>
                {typeof count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/30 text-white'
                        : count > 0
                        ? 'bg-[#C9952B]/15 text-[#966f33] dark:text-[#E5B54F]'
                        : 'bg-muted text-muted-foreground/60'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          }

          if (item.highlight) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white border-[#C9952B] shadow-sm flex items-center gap-1.5 group"
              >
                <Icon size={13} className="text-white group-hover:scale-110 transition-transform" />
                <span>{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-medium">
                  {item.sanskrit}
                </span>
                <ArrowUpRight size={11} className="opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 bg-card border-border/80 text-foreground/80 hover:text-foreground hover:border-[#C9952B]/60 hover:bg-[#C9952B]/5 shadow-sm group"
            >
              <Icon
                size={13}
                className="text-[#C9952B] group-hover:scale-110 transition-transform"
              />
              <span className="font-semibold">{item.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground group-hover:bg-[#C9952B]/15 group-hover:text-[#966f33] dark:group-hover:text-[#E5B54F] transition-colors">
                {item.sanskrit}
              </span>
              <ArrowUpRight size={11} className="text-muted-foreground/60 group-hover:text-[#C9952B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
