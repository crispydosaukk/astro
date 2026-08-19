'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Calendar, Sun, HeartHandshake, BookOpen, ShieldCheck, Flame, Zap, ArrowRight, Heart, Coins, Activity } from 'lucide-react';
import DynamicPageContent from '@/components/DynamicPageContent';
import { useCurrency } from '@/lib/CurrencyContext';

export default function ServicesOverviewPage() {
  const { formatPrice } = useCurrency();
  const freeServices = [
    {
      title: 'Janam Kundli',
      desc: 'Get your detailed Janma Kundli, planetary alignments, Lagna report and house predictions.',
      icon: Sparkles,
      href: '/services/janam-kundli',
      badge: 'Free',
    },
    {
      title: 'Kundli Matching',
      desc: '36-point Ashtakoot Gun Milan & marital compatibility score for you and your partner.',
      icon: Compass,
      href: '/services/kundli-matching',
      badge: 'Free',
    },
    {
      title: 'Love Horoscope',
      desc: 'Discover 7th House (Kalatra Bhava), Venusian strength, relationship harmony, and soulmate timing.',
      icon: Heart,
      href: '/services/horoscope/love',
      badge: 'Free',
    },
    {
      title: 'Finance Horoscope',
      desc: 'Analyze Dhana Bhava (2nd House), Labha Bhava (11th House), wealth yogas, and investment timing.',
      icon: Coins,
      href: '/services/horoscope/finance',
      badge: 'Free',
    },
    {
      title: 'Health Horoscope',
      desc: 'Evaluate Lagna vitality, 6th House (Roga Bhava), Ayurvedic Tridosha balance, and restorative remedies.',
      icon: Activity,
      href: '/services/horoscope/health',
      badge: 'Free',
    },
    {
      title: 'Daily Horoscope',
      desc: 'Daily zodiac predictions for Career, Love, Health, Finance, Lucky Number & Color.',
      icon: Sun,
      href: '/services/daily-horoscope',
      badge: 'Free',
    },
    {
      title: 'Panchang',
      desc: 'Daily Tithi, Nakshatra, Yoga, Karana, Abhijit Muhurat and Rahu Kaal timings.',
      icon: Calendar,
      href: '/services/panchang',
      badge: 'Free',
    },
    {
      title: 'Meditation Guide',
      desc: 'The Art of Meditation — classical Vedic Dhyana, mantras & 15-minute practice protocol.',
      icon: HeartHandshake,
      href: '/services/meditation-guide',
      badge: 'Free',
    },
    {
      title: 'Fasting Planner',
      desc: 'Personalized Vrat calendar generator based on your Moon Rashi & planetary alignment.',
      icon: BookOpen,
      href: '/services/fasting-planner',
      badge: 'Free',
    },
  ];

  const mahadashaGuides = [
    {
      title: 'Rahu Mahadasha Stabilisation Guide (PDF)',
      desc: 'Harmonize intense Rahu transit with exact mantras and protective rituals.',
      icon: ShieldCheck,
      priceINR: 499,
      priceUSD: 19,
      href: '/services/rahu-mahadasha-stabilisation-guide',
    },
    {
      title: 'Rahu Mahadasha Survival Guide (PDF)',
      desc: 'Tactical survival strategies, spiritual shield and karmic remedies.',
      icon: Flame,
      priceINR: 999,
      priceUSD: 29,
      href: '/services/rahu-mahadasha-survival-guide',
    },
    {
      title: 'Sani Mahadasha Stabilisation Guide (PDF)',
      desc: 'Saturn discipline, endurance, Sade Sati pacification & remedies.',
      icon: ShieldCheck,
      priceINR: 499,
      priceUSD: 19,
      href: '/services/sani-mahadasha-stabilisation-guide',
    },
    {
      title: 'Sani Mahadasha Survival Guide (PDF)',
      desc: 'Navigating Saturn trials, karmic lessons & long-term stability.',
      icon: Zap,
      priceINR: 999,
      priceUSD: 29,
      href: '/services/sani-mahadasha-survival-guide',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section - Spans logo to right edge */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 w-full">
            <div className="grid lg:grid-cols-2 items-center min-h-screen">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-6 backdrop-blur-md">
                    Vedic Astrology Services
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-xl">
                    Explore Our Sacred <br />
                    <span className="text-gradient-gold">Services & Tools</span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                    Free astrology calculation tools, Kundli matching, daily horoscope insights, meditation guides, and Mahadasha survival guides.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        document.getElementById('services-grid')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                    >
                      Explore Services <ArrowRight size={18} />
                    </button>
                    <Link
                      href="/talk-to-astrologer"
                      className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      Consult Astrologer
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
                <div className="relative w-full h-full max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#C9952B]/30">
                  <Image
                    src="/images/horoscope_banner.jpg"
                    alt="Vedic Services Banner"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section - Compact padding below hero */}
      <section id="services-grid" className="py-8 lg:py-12 bg-background relative z-10 space-y-10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-10">
          {/* Free Services */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <Sparkles size={22} className="text-[#C9952B]" /> Free Services & Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeServices.map((svc, index) => {
                const IconComp = svc.icon;
                return (
                  <motion.div
                    key={svc.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Link
                      href={svc.href}
                      className="group relative flex flex-col h-full glass-card border border-white/5 rounded-3xl p-6 overflow-hidden hover:border-[#C9952B]/30 transition-all duration-300 justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-card border border-white/10 flex items-center justify-center text-[#C9952B] shadow-md">
                            <IconComp size={20} />
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {svc.badge}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-[#C9952B] transition-colors">
                          {svc.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{svc.desc}</p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 group-hover:text-white transition-colors pt-2">
                        Access Free Service <ArrowRight size={14} className="text-[#C9952B] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mahadasha Guides */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <ShieldCheck size={22} className="text-[#C9952B]" /> Mahadasha Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mahadashaGuides.map((guide, index) => {
                const IconComp = guide.icon;
                return (
                  <motion.div
                    key={guide.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Link
                      href={guide.href}
                      className="group relative flex items-start gap-4 glass-card border border-white/5 rounded-3xl p-6 overflow-hidden hover:border-[#C9952B]/30 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-card border border-white/10 flex items-center justify-center text-[#C9952B] shadow-md shrink-0">
                        <IconComp size={24} />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-foreground group-hover:text-[#C9952B] transition-colors">
                            {guide.title}
                          </h3>
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full gold-gradient-bg text-white shrink-0">
                            {formatPrice(guide.priceINR, guide.priceUSD)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{guide.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content Managed via Admin Panel */}
          <DynamicPageContent pageId="services-overview" />
        </div>
      </section>
    </div>
  );
}
