'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CircleDot, Check, ArrowRight, Lock, Loader2 } from 'lucide-react';
import ServiceReportForm from '@/components/ServiceReportForm';
import { getServicePageContent, RudrakshaServiceContent, defaultRudrakshaContent } from '@/lib/cms';
import PremiumSection from '@/components/PremiumSection';

export default function RudrakshaServicePage() {
  const [content, setContent] = useState<RudrakshaServiceContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const data = await getServicePageContent('rudraksha', defaultRudrakshaContent);
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
            <Link href="/" className="hover:text-[#C9952B] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/remedies" className="hover:text-[#C9952B] transition-colors">Remedies</Link>
            <span>/</span>
            <span className="text-[#C9952B]">Rudraksha Recommendations</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                <CircleDot size={12} /> {content.hero.tag}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                {content.hero.titleLine1}
                <br />
                <span className="text-gradient-gold">{content.hero.titleLine2}</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                {content.hero.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#get-report"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow"
                >
                  <CircleDot size={16} /> {content.hero.primaryBtnText}
                </Link>
                <Link
                  href="/talk-to-astrologer"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all"
                >
                  {content.hero.secondaryBtnText}
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-[#C9952B]/30 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl animate-float">
                    <CircleDot size={64} className="text-white" />
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
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {content.benefitsTitle.split(' ')[0]}{' '}
                <span className="text-gradient-gold">
                  {content.benefitsTitle.split(' ').slice(1).join(' ')}
                </span>
              </h2>
              <div className="space-y-4">
                {content.benefits?.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
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
                  <p className="text-xs text-[#C9952B] font-semibold mb-1">Recommended Mukhi</p>
                  <p className="text-sm font-bold text-foreground">7 Mukhi Rudraksha</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Red silk thread · Silver capping
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border blur-sm select-none">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    Wearing Procedure
                  </p>
                  <p className="text-sm text-foreground">Cleanse with gangajal and milk...</p>
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
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            {content.guideTitle.split(' ')[0]}{' '}
            <span className="text-gradient-gold">
              {content.guideTitle.split(' ').slice(1).join(' ')}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {content.rudrakshas?.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className={`text-2xl mb-3 ${r?.color}`}>📿</div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{r?.mukhi}</h3>
                <p className={`text-xs font-medium ${r?.color} mb-1`}>{r?.planet} ({r?.deity})</p>
                <p className="text-xs text-muted-foreground">{r?.purpose}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PremiumSection data={content.premiumDetails} />
      <ServiceReportForm
        titleText="Get Your"
        highlightText="Rudraksha Report"
        subtitle="Enter your birth details to discover the right Mukhi Rudraksha for you"
        buttonText="Unlock Full Rudraksha Report"
        Icon={CircleDot}
        serviceId="svc-rudraksha"
        premiumInfo="Full report with specific Mukhi combinations, wearing rituals, and mantra associations requires Premium membership"
      />
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Unlock Your <span className="text-gradient-gold">Rudraksha Report</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Get a detailed Rudraksha recommendation with activation mantras, wearing instructions,
            and combination guidelines.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="#get-report"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow"
            >
              <CircleDot size={18} /> Get Premium Report
            </Link>
            <Link
              href="/talk-to-astrologer"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all"
            >
              Talk to Astrologer <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
