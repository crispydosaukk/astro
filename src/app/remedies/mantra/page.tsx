'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Music,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lock,
  Volume2,
  Loader2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ServiceReportForm from '@/components/ServiceReportForm';
import PremiumSection from '@/components/PremiumSection';
import DynamicPageContent from '@/components/DynamicPageContent';
import { getServicePageContent, MantraServiceContent, defaultMantraContent, getHomepageContent, HomepageContent } from '@/lib/cms';

export default function MantraServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [content, setContent] = useState<MantraServiceContent | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const [data, homeData] = await Promise.all([
        getServicePageContent('mantra', defaultMantraContent),
        getHomepageContent()
      ]);
      setHomepageContent(homeData);
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
            {/* Hero */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-screen-2xl w-full mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 items-center min-h-screen">
              
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
                  <Link href="/" className="hover:text-[#C9952B] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/remedies" className="hover:text-[#C9952B] transition-colors">Remedies</Link>
            <span>/</span>
            <span className="text-[#C9952B]">Mantra Guidance</span>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                    <Music size={12} /> {content.hero.tag}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                    {content.hero.titleLine1}
                    <br />
                    <span className="text-gradient-gold">{content.hero.titleLine2}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    {content.hero.description}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-8">
                    <a
                      href="#get-report"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow"
                    >
                      <Music size={16} /> {content.hero.primaryBtnText}
                    </a>
                    <Link
                      href="/talk-to-astrologer"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all"
                    >
                      {content.hero.secondaryBtnText}
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
                <div className="relative w-full h-full max-w-lg lg:max-w-xl">
                  <Image
                    src={homepageContent?.services.items.find(s => s.id === 'svc-mantra')?.image || '/assets/images/remedies/remedies_mantra_1785738410624.png'}
                    alt="Mantra Guidance"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
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
                  <p className="text-xs text-[#C9952B] font-semibold mb-1">Primary Mantra</p>
                  <p className="text-sm font-bold text-foreground">Om Namah Shivaya</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    108 times daily · Brahma Muhurtha (4:30–6:00 AM)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Purpose</p>
                  <p className="text-sm text-foreground">
                    Pacifies Saturn, removes obstacles, brings peace
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border blur-sm select-none">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    Secondary Mantras
                  </p>
                  <p className="text-sm text-foreground">Gayatri Mantra · Om Namo Bhagavate...</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#C9952B]">
                  <Lock size={12} /> Full report requires Premium membership
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Mantra Table */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            {content.guideTitle.split(' ')[0]}{' '}
            <span className="text-gradient-gold">
              {content.guideTitle.split(' ').slice(1).join(' ')}
            </span>
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-[#EDE4D5] border-b border-[#E5D9C8]">
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">
                    Planet
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">
                    Mantra
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">
                    Count
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">
                    Best Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.mantras?.map((m, i) => (
                  <tr
                    key={i}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className={`px-5 py-3.5 text-sm font-semibold ${m?.color}`}>{m?.planet}</td>
                    <td className="px-5 py-3.5 text-xs text-foreground font-mono">{m?.mantra}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{m?.count}x</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{m?.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Dynamic Educational Content Container (Admin CMS Integration) */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
        <DynamicPageContent pageId="remedies-mantra" />
      </div>

      <PremiumSection data={content.premiumDetails} />

      <ServiceReportForm
        titleText="Get Your"
        highlightText="Mantra Report"
        subtitle="Enter your birth details for a personalized mantra recommendation"
        buttonText="Unlock Full Mantra Report"
        Icon={Music}
        serviceId="svc-mantra"
      />
      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            {content.faqTitle.split(' ')[0]}{' '}
            <span className="text-gradient-gold">
              {content.faqTitle.split(' ').slice(1).join(' ')}
            </span>
          </h2>
          <div className="space-y-3">
            {content.faqs?.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground text-sm">{faq?.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={16} className="text-[#C9952B] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
                  )}
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
    </div>
  );
}
