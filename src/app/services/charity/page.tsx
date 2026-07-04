'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gift, Check, ArrowRight, Lock } from 'lucide-react';

const charityItems = [
  { planet: 'Sun', item: 'Wheat, Jaggery, Copper', day: 'Sunday', recipient: 'Temples, Brahmins', color: 'text-red-400' },
  { planet: 'Moon', item: 'Rice, Milk, White cloth', day: 'Monday', recipient: 'Women, elderly', color: 'text-blue-200' },
  { planet: 'Mars', item: 'Red lentils, Red cloth', day: 'Tuesday', recipient: 'Soldiers, poor', color: 'text-orange-400' },
  { planet: 'Mercury', item: 'Green vegetables, Books', day: 'Wednesday', recipient: 'Students, teachers', color: 'text-green-400' },
  { planet: 'Jupiter', item: 'Yellow lentils, Gold', day: 'Thursday', recipient: 'Brahmins, gurus', color: 'text-yellow-400' },
  { planet: 'Venus', item: 'White sweets, Perfume', day: 'Friday', recipient: 'Women, artists', color: 'text-pink-300' },
  { planet: 'Saturn', item: 'Black sesame, Iron', day: 'Saturday', recipient: 'Poor, disabled', color: 'text-blue-400' },
  { planet: 'Rahu', item: 'Blue cloth, Coconut', day: 'Saturday', recipient: 'Outcastes, foreigners', color: 'text-amber-600' },
  { planet: 'Ketu', item: 'Multi-color cloth, Blanket', day: 'Tuesday', recipient: 'Spiritual seekers', color: 'text-gray-400' },
];

const benefits = [
  'Reduces the negative effects of malefic planets through karma',
  'Builds positive karma that manifests as life improvements',
  'Aligns your giving with cosmic timing for maximum impact',
  'Tracks your donation history and karma balance',
  'Provides monthly reminders for scheduled charity activities',
];

export default function CharityServicePage() {
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
            <span className="text-[#C9952B]">Charity Planner</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                <Gift size={12} /> Karma-Aligned Giving
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                Vedic Charity<br /><span className="text-gradient-gold">Planner</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Dana (charity) is a powerful Vedic remedy. When you donate the right items to the right people on the right day, it directly reduces planetary afflictions and builds positive karma.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                  <Gift size={16} /> Get My Charity Plan
                </Link>
                <Link href="/talk-to-astrologer" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all">
                  Consult Astrologer
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-[#C9952B]/30 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl animate-float">
                    <Gift size={64} className="text-white" />
                  </div>
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
              <h2 className="text-3xl font-bold text-foreground mb-6">Benefits of <span className="text-gradient-gold">Vedic Dana</span></h2>
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
                  <p className="text-xs text-[#C9952B] font-semibold mb-1">Priority Charity — Saturn</p>
                  <p className="text-sm font-bold text-foreground">Black sesame seeds + Iron</p>
                  <p className="text-xs text-muted-foreground mt-1">Every Saturday · Donate to poor/disabled</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Monthly Budget</p>
                  <p className="text-sm text-foreground">₹500–₹1,000 recommended</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border blur-sm select-none">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Full Charity Calendar</p>
                  <p className="text-sm text-foreground">9 planets · Monthly schedule...</p>
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
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Navagraha <span className="text-gradient-gold">Dana Guide</span></h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-[#6B0F1A]/10 border-b border-border">
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Planet</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Items to Donate</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Day</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Recipients</th>
                </tr>
              </thead>
              <tbody>
                {charityItems?.map((c, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className={`px-5 py-3.5 text-sm font-semibold ${c?.color}`}>{c?.planet}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{c?.item}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c?.day}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c?.recipient}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Your <span className="text-gradient-gold">Karma Journey</span></h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Get your personalized charity plan with monthly schedules, donation tracker, and karma reminders.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
              <Gift size={18} /> Get Premium Plan
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
