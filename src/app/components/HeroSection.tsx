'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, Bot, Sparkles } from 'lucide-react';
import AshtaDigbandhanaWheel from '@/components/AshtaDigbandhanaWheel';
import { HomepageContent } from '@/lib/cms';
import { useUserData } from '@/lib/useUserData';

const stats = [
  { label: 'Happy Users', value: '2,50,000+' },
  { label: 'Expert Astrologers', value: '500+' },
  { label: 'Reports Generated', value: '18,00,000+' },
  { label: 'Countries', value: '42+' },
];

interface HeroSectionProps {
  content?: HomepageContent['hero'];
}

export default function HeroSection({ content }: HeroSectionProps) {
  const { user } = useUserData();

  return (
    <section className="relative min-h-screen cosmic-bg overflow-hidden flex flex-col justify-between">
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
      <div className="flex-1 flex items-center justify-center pt-24 pb-8">
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
                  {content?.headline1 || 'Discover Your'}{' '}
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
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/talk-to-ai-astrologer"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all duration-200 gold-shadow animate-pulse-gold transform hover:-translate-y-0.5"
                >
                  <Bot size={18} className="animate-pulse" />
                  AI Expert Astrologer
                  <Sparkles size={14} className="text-amber-200" />
                </Link>
                <Link
                  href="/talk-to-astrologer"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#FFFDFC]/10 backdrop-blur-md border border-[#D8B66A]/40 text-white hover:border-[#D8B66A] hover:text-[#D8B66A] transition-all duration-200"
                >
                  <Play size={16} />
                  {content?.secondaryBtnText || 'Talk to Astrologer'}
                </Link>
                <Link
                  href="/#services"
                  className="group flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold border border-white/20 text-white/90 hover:bg-white/10 transition-all duration-200"
                >
                  ✦ Explore Remedies
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
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

            {/* Right visual - Ashta Digbandhana Wheel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="relative flex items-center justify-center"
            >
              <AshtaDigbandhanaWheel hideInfoCard={true} hideFooter={true} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="flex justify-center pb-8">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/50 text-xs font-medium cursor-pointer hover:text-white/80 transition-colors"
          onClick={() => {
            document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span>Scroll to explore</span>
          <ChevronDown size={16} />
        </motion.div>
      </div>
    </section>
  );
}
