'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Check, ArrowRight, Lock, Loader2 } from 'lucide-react';
import ServiceReportForm from '@/components/ServiceReportForm';
import { getServicePageContent, IshtaDevataServiceContent, defaultIshtaDevataContent } from '@/lib/cms';

export default function IshtaDevataServicePage() {
  const [content, setContent] = useState<IshtaDevataServiceContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const data = await getServicePageContent('ishta-devata', defaultIshtaDevataContent);
      setContent(data);
      setLoading(false);
    }
    loadContent();
  }, []);

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9952B]" size={32} />
      </div>
    );
  }

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
            <span className="text-[#C9952B]">Ishta Devata</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                <Heart size={12} /> {content.hero.tag}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                {content.hero.titleLine1}<br /><span className="text-gradient-gold">{content.hero.titleLine2}</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                {content.hero.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                  <Heart size={16} /> {content.hero.primaryBtnText}
                </Link>
                <Link href="/talk-to-astrologer" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all">
                  {content.hero.secondaryBtnText}
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-[#C9952B]/30 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl animate-float">
                    <Heart size={64} className="text-white" />
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
              <h2 className="text-3xl font-bold text-foreground mb-6">{content.benefitsTitle.split(' ').slice(0, 2).join(' ')} <span className="text-gradient-gold">{content.benefitsTitle.split(' ').slice(2).join(' ')}</span></h2>
              <div className="space-y-4">
                {content.benefits?.map((b, i) => (
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
                  <p className="text-xs text-[#C9952B] font-semibold mb-1">Your Ishta Devata</p>
                  <p className="text-sm font-bold text-foreground">Lord Shiva</p>
                  <p className="text-xs text-muted-foreground mt-1">Moon in 12th house with Ketu aspect</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Daily Worship</p>
                  <p className="text-sm text-foreground">Monday Abhishekam with milk</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border blur-sm select-none">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Temple Suggestions</p>
                  <p className="text-sm text-foreground">Kashi Vishwanath · Brihadeeswara...</p>
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
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{content.guideTitle.split(' ')[0]} <span className="text-gradient-gold">{content.guideTitle.split(' ').slice(1).join(' ')}</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.deities?.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-border bg-card p-6">
                <Heart size={24} className={`${d?.color} mb-3`} />
                <h3 className="font-semibold text-foreground mb-2">{d?.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">📊 {d?.indicator}</p>
                <p className="text-xs text-muted-foreground mb-1">🙏 {d?.worship}</p>
                <p className="text-xs text-muted-foreground">📖 {d?.stotra}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <ServiceReportForm
        titleText="Discover Your"
        highlightText="Divine Connection"
        subtitle="Get your complete Ishta Devata report with daily worship guide and stotra recommendations"
        buttonText="Unlock Full Devata Report"
        Icon={Heart}
        premiumInfo="Full report with specific stotras, yantras, and detailed worship procedures requires Premium membership"
      />
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Discover Your <span className="text-gradient-gold">Divine Connection</span></h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Get your complete Ishta Devata report with daily worship guide, stotra recommendations, and temple suggestions.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
              <Heart size={18} /> Get Premium Report
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
