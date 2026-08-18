'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Heart, Briefcase, Activity, DollarSign, ArrowRight, ChevronDown } from 'lucide-react';

export default function FreeDailyHoroscopePage() {
  const [selectedZodiac, setSelectedZodiac] = useState('Aries');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const zodiacSigns = [
    { name: 'Aries', dates: 'Mar 21 - Apr 19', symbol: '♈' },
    { name: 'Taurus', dates: 'Apr 20 - May 20', symbol: '♉' },
    { name: 'Gemini', dates: 'May 21 - Jun 20', symbol: '♊' },
    { name: 'Cancer', dates: 'Jun 21 - Jul 22', symbol: '♋' },
    { name: 'Leo', dates: 'Jul 23 - Aug 22', symbol: '♌' },
    { name: 'Virgo', dates: 'Aug 23 - Sep 22', symbol: '♍' },
    { name: 'Libra', dates: 'Sep 23 - Oct 22', symbol: '♎' },
    { name: 'Scorpio', dates: 'Oct 23 - Nov 21', symbol: '♏' },
    { name: 'Sagittarius', dates: 'Nov 22 - Dec 21', symbol: '♐' },
    { name: 'Capricorn', dates: 'Dec 22 - Jan 19', symbol: '♑' },
    { name: 'Aquarius', dates: 'Jan 20 - Feb 18', symbol: '♒' },
    { name: 'Pisces', dates: 'Feb 19 - Mar 20', symbol: '♓' },
  ];

  const predictions: Record<string, any> = {
    Aries: {
      overall: 'High cosmic energy propels your career endeavors today. Focus on long-term goal setting and remain open to fresh collaborations.',
      career: 'Promising growth in leadership roles. A new project proposal gets positive feedback.',
      love: 'Warm communication brings harmony to your relationship. Singles may meet someone special.',
      health: 'Vitality is high, but ensure proper hydration and afternoon rest.',
      finance: 'Favorable time for prudent investments and financial planning.',
      luckyNum: '7',
      luckyColor: 'Crimson Red',
    },
    Taurus: {
      overall: 'Patience and steady perseverance yield excellent outcomes. Financial stability brings peace of mind.',
      career: 'Methodical work impresses senior management. Stay focused on quality.',
      love: 'Deep mutual understanding strengthens your bond.',
      health: 'Incorporate gentle stretches or yoga into your daily routine.',
      finance: 'Good day for savings and reviewing expenses.',
      luckyNum: '6',
      luckyColor: 'Emerald Green',
    },
  };

  const currentPred = predictions[selectedZodiac] || predictions['Aries'];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section - Spans logo to right edge */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#8B1A2A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full">
            <div className="grid lg:grid-cols-2 items-center min-h-screen">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="px-6 lg:px-12 xl:px-20 space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-6 backdrop-blur-md">
                    Free Daily Horoscope
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                    Today&apos;s Free <br />
                    <span className="text-gradient-gold">Daily Horoscope</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    Select your zodiac sign below for today&apos;s predictions on career, love, health, finance, lucky color, and lucky numbers.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        document.getElementById('zodiac-selector')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                    >
                      Check Today&apos;s Horoscope <ArrowRight size={18} />
                    </button>
                    <Link
                      href="/talk-to-astrologer"
                      className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      Consult Astrologer
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="relative h-[40vh] lg:h-[80vh] w-full order-1 lg:order-2 flex items-center justify-center p-6 lg:p-12"
              >
                <div className="relative w-full h-full max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#C9952B]/30">
                  <Image
                    src="/images/horoscope_banner.jpg"
                    alt="Daily Horoscope Banner"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Zodiac Selector Section */}
      <section id="zodiac-selector" className="py-8 lg:py-12 bg-background relative z-10 space-y-6">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {zodiacSigns.map((z) => (
              <button
                key={z.name}
                onClick={() => setSelectedZodiac(z.name)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedZodiac === z.name
                    ? 'bg-[#C9952B] text-white border-[#C9952B] font-bold shadow-md scale-105'
                    : 'glass-card text-foreground border-white/10 hover:border-[#C9952B]/50'
                }`}
              >
                <span className="text-xl">{z.symbol}</span>
                <span className="text-xs font-bold">{z.name}</span>
              </button>
            ))}
          </div>

          <motion.div key={selectedZodiac} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                <h2 className="text-xl font-bold text-[#C9952B]">
                  {selectedZodiac} Daily Forecast
                </h2>
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C9952B]/20 text-[#C9952B] text-xs font-bold">
                    Lucky Num: {currentPred.luckyNum}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    Lucky Color: {currentPred.luckyColor}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{currentPred.overall}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-[#C9952B] font-bold text-xs">
                  <Briefcase size={16} /> Career
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{currentPred.career}</p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <Heart size={16} /> Love & Relationships
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{currentPred.love}</p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <Activity size={16} /> Health
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{currentPred.health}</p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                  <DollarSign size={16} /> Finance
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{currentPred.finance}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
