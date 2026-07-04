'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Check, ArrowRight, Lock } from 'lucide-react';

const directions = [
  { dir: 'North', deity: 'Kubera', element: 'Water', color: 'text-blue-400', purpose: 'Wealth & Career', remedy: 'Blue/Green colors, water feature' },
  { dir: 'South', deity: 'Yama', element: 'Fire', color: 'text-red-400', purpose: 'Fame & Recognition', remedy: 'Red/Orange colors, avoid bedroom' },
  { dir: 'East', deity: 'Indra', element: 'Air', color: 'text-green-400', purpose: 'Health & Sunrise energy', remedy: 'Green plants, open windows' },
  { dir: 'West', deity: 'Varuna', element: 'Earth', color: 'text-amber-400', purpose: 'Gains & Profits', remedy: 'White/Grey colors, metal objects' },
  { dir: 'North-East', deity: 'Ishanya', element: 'Water+Air', color: 'text-cyan-400', purpose: 'Spirituality & Wisdom', remedy: 'Keep clean, pooja room ideal' },
  { dir: 'North-West', deity: 'Vayu', element: 'Air', color: 'text-sky-400', purpose: 'Support & Relationships', remedy: 'White/Silver, guest room' },
  { dir: 'South-East', deity: 'Agni', element: 'Fire', color: 'text-orange-400', purpose: 'Energy & Kitchen', remedy: 'Kitchen here, red/orange' },
  { dir: 'South-West', deity: 'Nirriti', element: 'Earth', color: 'text-yellow-600', purpose: 'Stability & Master bedroom', remedy: 'Heavy furniture, master bedroom' },
];

const benefits = [
  'Identifies energy imbalances in your living or work space',
  'Provides direction-specific remedies for each zone',
  'Improves health, wealth, and relationship harmony',
  'Removes Vastu doshas without major structural changes',
  'Enhances positive energy flow throughout the property',
];

export default function VastuServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-24 py-20 cosmic-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#8B1A2A]/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#C9952B]/15 blur-3xl" />
        </div>
        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-[#C9952B] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/#services" className="hover:text-[#C9952B] transition-colors">Services</Link>
            <span>/</span>
            <span className="text-[#C9952B]">Interactive Vastu</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                <Compass size={12} /> Vedic Architecture
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                Interactive Vastu<br /><span className="text-gradient-gold">Analysis</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Vastu Shastra is the ancient science of spatial arrangement. Get a complete room-by-room analysis of your home or office with specific remedies for each direction.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                  <Compass size={16} /> Get Vastu Analysis
                </Link>
                <Link href="/talk-to-astrologer" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all">
                  Consult Astrologer
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex justify-center">
              {/* Vastu compass visual */}
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-[#C9952B]/30 animate-spin-slow" />
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-8">
                  {['NW', 'N', 'NE', 'W', '🏠', 'E', 'SW', 'S', 'SE']?.map((d, i) => (
                    <div key={i} className={`rounded-lg flex items-center justify-center text-xs font-bold ${d === '🏠' ? 'gold-gradient-bg text-white text-lg' : 'glass-card text-[#C9952B]'}`}>{d}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Benefits of <span className="text-gradient-gold">Vastu Analysis</span></h2>
              <div className="space-y-4">
                {benefits?.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#C9952B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-[#C9952B]" />
                    </div>
                    <p className="text-muted-foreground">{b}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold text-foreground mb-4">Sample Report Preview</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/20">
                  <p className="text-xs text-[#C9952B] font-semibold mb-1">North Zone Analysis</p>
                  <p className="text-sm font-bold text-foreground">Kubera Zone — Wealth & Career</p>
                  <p className="text-xs text-muted-foreground mt-1">✅ Good placement · Add water feature</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 font-semibold mb-1">South-West Zone — Issue Found</p>
                  <p className="text-sm text-foreground">Heavy clutter detected · Remedy needed</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border blur-sm select-none">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Full 8-Direction Report</p>
                  <p className="text-sm text-foreground">Complete analysis with remedies...</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#C9952B]">
                  <Lock size={12} /> Full report requires Premium membership
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">8 Directions — <span className="text-gradient-gold">Vastu Guide</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {directions?.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="rounded-2xl border border-border bg-card p-5">
                <div className={`text-2xl mb-2 ${d?.color} font-bold`}>{d?.dir}</div>
                <p className="text-xs text-muted-foreground mb-1">Deity: {d?.deity}</p>
                <p className="text-xs text-muted-foreground mb-2">Element: {d?.element}</p>
                <p className="text-xs font-semibold text-foreground mb-2">{d?.purpose}</p>
                <p className="text-xs text-muted-foreground">{d?.remedy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Harmonize Your <span className="text-gradient-gold">Living Space</span></h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Get a complete interactive Vastu analysis with room-by-room remedies and a personalized action plan.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
              <Compass size={18} /> Get Premium Analysis
            </Link>
            <Link href="/talk-to-astrologer" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all">
              Talk to Astrologer <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
