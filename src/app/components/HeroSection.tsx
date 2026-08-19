'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Play, ChevronDown } from 'lucide-react';

const stats = [
  { label: 'Happy Users', value: '2,50,000+' },
  { label: 'Expert Astrologers', value: '500+' },
  { label: 'Reports Generated', value: '18,00,000+' },
  { label: 'Countries', value: '42+' },
];

const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const zodiacPositions = zodiacSigns?.map((_, i) => {
  const angle = (i * 360) / 12;
  const radian = (angle * Math.PI) / 180;
  const r = 130;
  const x = 50 + (r / 2.0) * Math.sin(radian);
  const y = 50 - (r / 2.0) * Math.cos(radian);
  return { x: parseFloat(x?.toFixed(4)), y: parseFloat(y?.toFixed(4)) };
});

import { HomepageContent } from '@/lib/cms';
import { useUserData } from '@/lib/useUserData';

interface HeroSectionProps {
  content?: HomepageContent['hero'];
}

export default function HeroSection({ content }: HeroSectionProps) {
  const [currentZodiac, setCurrentZodiac] = useState(0);
  const { user } = useUserData();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentZodiac((prev) => (prev + 1) % zodiacSigns?.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen cosmic-bg overflow-hidden flex flex-col">
      {/* Star field background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)]?.map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              left: `${(i * 17) % 100}%`,
              top: `${(i * 13) % 100}%`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0.4 + (i % 5) * 0.1,
            }}
          />
        ))}
      </div>
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#B88A44]/20 blur-3xl pointer-events-none" />
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-8"
            >
              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight hero-text-glow max-w-xl">
                  {content?.headline1 || 'Discover Your'}
                  <span className="block text-gradient-gold">
                    {content?.headline2 || 'Cosmic Destiny'}
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed max-w-lg">
                  {content?.subtitle ||
                    'Ancient Vedic wisdom meets modern precision. Get your personalized Kundli, sacred gemstone & mantra recommendations, and consult expert astrologers — all in one platform.'}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/#services"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all duration-200 gold-shadow animate-pulse-gold"
                >
                  ✦ Explore Remedies
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  href="/talk-to-astrologer"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#FFFDFC]/10 backdrop-blur-md border border-[#D8B66A]/30 text-white hover:border-[#D8B66A] hover:text-[#D8B66A] transition-all duration-200"
                >
                  <Play size={16} />
                  {content?.secondaryBtnText || 'Talk to Astrologer'}
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {(content?.stats || stats)?.map((stat: any) => (
                  <div key={`stat-${stat?.label}`} className="text-center">
                    <div className="text-2xl font-bold text-gradient-gold tabular-nums">
                      {stat?.value}
                    </div>
                    <div className="text-xs text-white/70 mt-1">{stat?.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="relative flex items-center justify-center"
            >
              {/* Central mandala/zodiac wheel */}
              <div className="relative w-72 h-72 lg:w-96 lg:h-96">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[#D8B66A]/40 animate-spin-slow" />
                {/* Inner glow */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#713B32]/40 to-[#352433]/70 blur-sm" />
                {/* Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl animate-float border-2 border-[#FFFDFC]/20">
                    <span className="text-6xl lg:text-7xl font-bold text-white">
                      {zodiacSigns?.[currentZodiac]}
                    </span>
                  </div>
                </div>
                {/* Zodiac signs around ring */}
                {zodiacSigns?.map((sign, i) => {
                  const { x, y } = zodiacPositions?.[i];
                  return (
                    <div
                      key={`zodiac-${i}`}
                      className={`absolute w-8 h-8 flex items-center justify-center rounded-full text-lg transition-all duration-500 ${i === currentZodiac ? 'bg-[#FFFDFC]/20 backdrop-blur-md border border-[#D8B66A] text-[#D8B66A] scale-125 shadow-lg' : 'text-white/60'}`}
                      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {sign}
                    </div>
                  );
                })}
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 -left-4 bg-[#FFFDFC]/15 backdrop-blur-md rounded-2xl p-3 border border-[#D8B66A]/30 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#B88A44]/30 flex items-center justify-center">
                    <Star size={14} className="text-[#D8B66A]" />
                  </div>
                  <div>
                    <div className="text-xs text-white/70">Today&apos;s Rashi</div>
                    <div className="text-sm font-semibold text-white">Mithuna (♊)</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating cards */}
              <Link href="/remedies/gemstone">
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-8 -right-4 bg-[#FFFDFC]/15 backdrop-blur-md rounded-2xl p-3 border border-[#D8B66A]/30 shadow-xl hover:border-[#D8B66A] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#713B32]/40 flex items-center justify-center">
                      <span className="text-sm">💎</span>
                    </div>
                    <div>
                      <div className="text-xs text-white/70">Report Ready</div>
                      <div className="text-sm font-semibold text-white">Gemstone: Ruby</div>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/remedies/mantra">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-8 -left-8 bg-[#FFFDFC]/15 backdrop-blur-md rounded-2xl p-3 border border-[#D8B66A]/30 shadow-xl hover:border-[#D8B66A] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#352433]/50 flex items-center justify-center">
                      <span className="text-sm">🎵</span>
                    </div>
                    <div>
                      <div className="text-xs text-white/70">Remedy</div>
                      <div className="text-sm font-semibold text-white">Mantra Guidance</div>
                    </div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/remedies/yantra">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute top-12 -right-12 bg-[#FFFDFC]/15 backdrop-blur-md rounded-2xl p-3 border border-[#D8B66A]/30 shadow-xl hover:border-[#D8B66A] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#713B32]/40 flex items-center justify-center">
                      <span className="text-sm">🔺</span>
                    </div>
                    <div>
                      <div className="text-xs text-white/70">Remedy</div>
                      <div className="text-sm font-semibold text-white">Yantra Rituals</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="flex justify-center pb-8">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/50 text-xs font-medium"
        >
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </motion.div>
      </div>
    </section>
  );
}
