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

export default function HeroSection() {
  const [currentZodiac, setCurrentZodiac] = useState(0);

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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#8B1A2A]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />
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
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[#C9952B]/30 text-sm font-medium text-[#C9952B]"
              >
                ✦ Authentic Vedic Astrology Platform ✦
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight hero-text-glow">
                  Discover Your
                  <span className="block text-gradient-gold">Cosmic Destiny</span>
                </h1>
                <p className="text-lg lg:text-xl text-white/70 leading-relaxed max-w-lg">
                  Ancient Vedic wisdom meets modern precision. Get your personalized Kundli, 
                  sacred gemstone & mantra recommendations, and consult expert 
                  astrologers — all in one platform.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/sign-up-login-screen"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all duration-200 gold-shadow animate-pulse-gold"
                >
                  ✦ Get Free Kundli
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/talk-to-astrologer"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all duration-200"
                >
                  <Play size={16} />
                  Talk to Astrologer
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {stats?.map((stat) => (
                  <div key={`stat-${stat?.label}`} className="text-center">
                    <div className="text-2xl font-bold text-gradient-gold tabular-nums">{stat?.value}</div>
                    <div className="text-xs text-white/60 mt-1">{stat?.label}</div>
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
                <div className="absolute inset-0 rounded-full border-2 border-[#C9952B]/30 animate-spin-slow" />
                {/* Inner glow */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#8B1A2A]/40 to-[#6B0F1A]/60 blur-sm" />
                {/* Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl animate-float">
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
                      className={`absolute w-8 h-8 flex items-center justify-center rounded-full text-lg transition-all duration-500 ${i === currentZodiac ? 'glass-card border border-[#C9952B] text-[#C9952B] scale-125' : 'text-white/50'}`}
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
                className="absolute top-4 -left-4 glass-card rounded-xl p-3 border border-white/10 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C9952B]/20 flex items-center justify-center">
                    <Star size={14} className="text-[#C9952B]" />
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Today&apos;s Rashi</div>
                    <div className="text-sm font-semibold text-white">Mithuna (♊)</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-8 -right-4 glass-card rounded-xl p-3 border border-white/10 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8B1A2A]/30 flex items-center justify-center">
                    <span className="text-sm">💎</span>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Report Ready</div>
                    <div className="text-sm font-semibold text-white">Gemstone: Ruby</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="flex justify-center pb-8">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/40 text-xs"
        >
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </motion.div>
      </div>
    </section>
  );
}