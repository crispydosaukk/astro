'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Compass, Check, ArrowRight, Lock, Loader2 } from 'lucide-react';
import ServiceReportForm from '@/components/ServiceReportForm';
import DynamicPageContent from '@/components/DynamicPageContent';
import { getServicePageContent, MuhurthamServiceContent, defaultMuhurthamContent, getHomepageContent, HomepageContent } from '@/lib/cms';

export default function MuhurthamServicePage() {
  const [content, setContent] = useState<MuhurthamServiceContent | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const [data, homeData] = await Promise.all([
        getServicePageContent('muhurtham', defaultMuhurthamContent),
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
                  <span className="text-[#C9952B]">Muhurtham Generator</span>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                    <Compass size={12} /> {content.hero.tag}
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
                      <Compass size={16} /> {content.hero.primaryBtnText}
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
                    src={homepageContent?.services.items.find(s => s.id === 'svc-muhurtha')?.image || '/assets/images/remedies/remedies_muhurtham_1785738473891.png'}
                    alt="Muhurtham Generator"
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

      {/* Events */}
      <section className="py-16 bg-background">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            {content.eventsTitle.split(' ').slice(0, 2).join(' ')}{' '}
            <span className="text-gradient-gold">
              {content.eventsTitle.split(' ').slice(2).join(' ')}
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {content.events?.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-border bg-card p-5 text-center card-hover"
              >
                <div className="text-3xl mb-3">{e?.icon}</div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{e?.name}</h3>
                <p className="text-xs text-muted-foreground">{e?.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {content.benefitsTitle.split(' ').slice(0, -2).join(' ')}{' '}
                <span className="text-gradient-gold">
                  {content.benefitsTitle.split(' ').slice(-2).join(' ')}
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
                  <p className="text-xs text-[#C9952B] font-semibold mb-1">
                    Best Date — Business Opening
                  </p>
                  <p className="text-sm font-bold text-foreground">Wed, 16 Jul 2026 · 10:15 AM</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nakshatra: Rohini · Lagna: Vrishabha · ⭐ Excellent
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    Alternative Date
                  </p>
                  <p className="text-sm text-foreground">Mon, 21 Jul 2026 · 9:30 AM · Very Good</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border blur-sm select-none">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    3rd Option + Avoid Times
                  </p>
                  <p className="text-sm text-foreground">
                    Thu, 24 Jul 2026 · Rahu Kalam details...
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#C9952B]">
                  <Lock size={12} /> Full report requires Premium membership
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Educational Content Container (Admin CMS Integration) */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
        <DynamicPageContent pageId="remedies-muhurtham" />
      </div>

      <ServiceReportForm
        titleText="Find Your"
        highlightText="Perfect Muhurtham"
        subtitle="Get 3 auspicious date options with complete planetary analysis and Nakshatra details"
        buttonText="Unlock Full Muhurtham Report"
        Icon={Compass}
        serviceId="svc-muhurtha"
        premiumInfo="Full report with specific timings, alternative dates, and detailed avoid times requires Premium membership"
      />

      {/* CTA */}
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Find Your <span className="text-gradient-gold">Perfect Muhurtham</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            Get 3 auspicious date options with complete planetary analysis, Nakshatra details, and
            times to avoid.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="#get-report"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow"
            >
              <Compass size={18} /> Get Premium Report
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
