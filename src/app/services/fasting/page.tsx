'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Moon, Check, ArrowRight, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import ServiceReportForm from '@/components/ServiceReportForm';

const fastTypes = [
  { name: 'Ekadashi Fast', deity: 'Lord Vishnu', day: 'Bi-monthly (11th lunar day)', benefit: 'Removes sins, pleases Vishnu', food: 'Fruits, milk, sabudana' },
  { name: 'Monday Fast', deity: 'Lord Shiva', day: 'Every Monday', benefit: 'Fulfills wishes, marriage blessings', food: 'One meal, no salt' },
  { name: 'Saturday Fast', deity: 'Lord Shani', day: 'Every Saturday', benefit: 'Reduces Saturn afflictions', food: 'Black sesame, oil-free food' },
  { name: 'Navratri Fast', deity: 'Goddess Durga', day: '9 days twice yearly', benefit: 'Divine protection, prosperity', food: 'Fruits, sendha namak only' },
  { name: 'Pradosh Fast', deity: 'Lord Shiva', day: 'Bi-monthly (13th lunar day)', benefit: 'Removes obstacles, health', food: 'One meal after sunset' },
  { name: 'Purnima Fast', deity: 'Lord Vishnu/Moon', day: 'Full moon day monthly', benefit: 'Mental peace, prosperity', food: 'Fruits and milk only' },
];

const benefits = [
  'Aligns your fasting practice with your specific planetary needs',
  'Maximizes spiritual benefits through correct timing and deity',
  'Provides a personalized monthly fasting calendar',
  'Includes food guidelines specific to each fast type',
  'Sends reminders for upcoming fasting dates',
];

export default function FastingServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'How is my fasting schedule determined?', a: 'Based on your birth chart, we identify which planets need strengthening or pacifying. The fasting schedule is then aligned with those planetary deities and their auspicious days.' },
    { q: 'Can I fast if I have health conditions?', a: 'Yes, but always consult your doctor first. We provide modified fasting options that are spiritually effective while being gentle on the body.' },
    { q: 'What if I miss a fast?', a: 'Missing a fast occasionally is fine. Simply resume on the next occurrence. Consistency over time is more important than perfection.' },
  ];

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
            <span className="text-[#C9952B]">Fasting Planner</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                <Moon size={12} /> Spiritual Detox Calendar
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                Personalized Fasting<br /><span className="text-gradient-gold">Planner</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Fasting is one of the most powerful Vedic remedies. Get a personalized fasting calendar aligned with your birth chart, complete with food guides and spiritual practices.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                  <Moon size={16} /> Get My Fasting Plan
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
                    <Moon size={64} className="text-white" />
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
              <h2 className="text-3xl font-bold text-foreground mb-6">Benefits of <span className="text-gradient-gold">Vedic Fasting</span></h2>
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
              <h3 className="font-bold text-foreground mb-4">Sample Monthly Calendar</h3>
              <div className="space-y-2">
                {[
                  { date: 'Jul 8', fast: 'Ekadashi', deity: 'Vishnu', status: 'upcoming' },
                  { date: 'Jul 14', fast: 'Monday Fast', deity: 'Shiva', status: 'upcoming' },
                  { date: 'Jul 21', fast: 'Pradosh', deity: 'Shiva', status: 'upcoming' },
                ]?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#C9952B]/20 flex items-center justify-center text-xs font-bold text-[#C9952B]">{item?.date}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item?.fast}</p>
                        <p className="text-xs text-muted-foreground">{item?.deity}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-500">Upcoming</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs text-[#C9952B] mt-2">
                  <Lock size={12} /> Full calendar requires Premium membership
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Popular <span className="text-gradient-gold">Vedic Fasts</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {fastTypes?.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-border bg-card p-6">
                <Moon size={24} className="text-[#C9952B] mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{f?.name}</h3>
                <p className="text-xs text-[#C9952B] mb-2">{f?.deity}</p>
                <p className="text-xs text-muted-foreground mb-2">📅 {f?.day}</p>
                <p className="text-xs text-muted-foreground mb-2">✨ {f?.benefit}</p>
                <p className="text-xs text-muted-foreground">🍎 {f?.food}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <ServiceReportForm
        titleText="Get Your"
        highlightText="Fasting Plan"
        subtitle="Enter your birth details for a personalized fasting recommendation"
        buttonText="Unlock Full Fasting Plan"
        Icon={Moon}
        premiumInfo="Full fasting calendar with monthly reminders, food guides, and spiritual practices requires Premium membership"
      />
      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked <span className="text-gradient-gold">Questions</span></h2>
          <div className="space-y-3">
            {faqs?.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors">
                  <span className="font-semibold text-foreground text-sm">{faq?.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-[#C9952B] flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq?.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Your <span className="text-gradient-gold">Fasting Journey</span></h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Get your personalized fasting calendar with monthly reminders, food guides, and spiritual practices.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
              <Moon size={18} /> Get Premium Plan
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
