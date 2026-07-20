'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gem, Check, ArrowRight, ChevronDown, ChevronUp, Lock, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ServiceReportForm from '@/components/ServiceReportForm';
import { getServicePageContent, GemstoneServiceContent, defaultGemstoneContent } from '@/lib/cms';

export default function GemstoneServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [content, setContent] = useState<GemstoneServiceContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getServicePageContent('gemstone', defaultGemstoneContent);
      setContent(data);
      setLoading(false);
    }
    load();
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
      {/* Hero */}
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
            <span className="text-[#C9952B]">Gemstone Advice</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                <Gem size={12} /> {content.hero.tag}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                {content.hero.titleLine1}<br /><span className="text-gradient-gold">{content.hero.titleLine2}</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                {content.hero.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#get-report" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                  <Gem size={16} /> {content.hero.primaryBtnText}
                </a>
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
                    <Gem size={64} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">{content.benefitsTitle.split(' ').map((word, i, arr) => i >= arr.length - 2 ? <span key={i} className="text-gradient-gold">{word} </span> : word + ' ')}</h2>
              <div className="space-y-4">
                {content.benefits.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#C9952B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-[#C9952B]" />
                    </div>
                    <p className="text-muted-foreground">{b}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {content.gemstones.slice(0, 6).map((g, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`rounded-2xl p-4 ${g?.bg} border border-border text-center`}>
                  <div className={`text-2xl mb-2 ${g?.color}`}>💎</div>
                  <p className="text-xs font-semibold text-foreground">{g?.planet}</p>
                  <p className="text-xs text-muted-foreground mt-1">{g?.gem?.split(' ')?.[0]}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Gemstone Table */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{content.chartTitle.split(' ').map((word, i, arr) => i >= arr.length - 2 ? <span key={i} className="text-gradient-gold">{word} </span> : word + ' ')}</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-[#6B0F1A]/10 border-b border-border">
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Planet</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Gemstone</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Metal</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Finger</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Day to Wear</th>
                </tr>
              </thead>
              <tbody>
                {content.gemstones.map((g, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className={`px-5 py-3.5 text-sm font-semibold ${g?.color}`}>{g?.planet}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{g?.gem}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{g?.metal}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{g?.finger}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{g?.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <ServiceReportForm
        titleText="Get Your"
        highlightText="Personal Report"
        subtitle="Enter your birth details to receive a precise gemstone recommendation"
        buttonText="Unlock Full Report — Upgrade to Premium"
        Icon={Gem}
        premiumInfo="Full gemstone analysis with metal, finger, mantra, and precautions requires Premium membership"
      />
      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{content.faqTitle.split(' ').map((word, i, arr) => i === arr.length - 1 ? <span key={i} className="text-gradient-gold">{word}</span> : word + ' ')}</h2>
          <div className="space-y-3">
            {content.faqs.map((faq, i) => (
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
      {/* CTA */}
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your <span className="text-gradient-gold">Sacred Gemstone?</span></h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Consult with our expert astrologers for a personalized gemstone recommendation backed by your complete birth chart analysis.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
              <Gem size={18} /> Get Premium Report
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
