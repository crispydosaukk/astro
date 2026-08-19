'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Gem, Music, Triangle, Flame, Heart, Compass, CircleDot, ShieldCheck, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';

import AshtaDigbandhanaWheel from '@/components/AshtaDigbandhanaWheel';
import DynamicPageContent from '@/components/DynamicPageContent';
import { getHomepageContent, HomepageContent, defaultHomepageContent, subscribeHomepageContent } from '@/lib/cms';

const iconMap: Record<string, any> = {
  Music,
  Gem,
  Triangle,
  Flame,
  Heart,
  Compass,
  CircleDot,
};

export default function RemediesPage() {
  const [content, setContent] = React.useState<HomepageContent | null>(null);

  React.useEffect(() => {
    getHomepageContent()
      .then((data) => {
        if (data) setContent(data);
      })
      .catch(console.error);

    const unsubscribe = subscribeHomepageContent((updated) => {
      if (updated) setContent(updated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const remediesList = content?.services?.items || defaultHomepageContent.services.items;

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-white/5 pt-28 lg:pt-32 pb-16 lg:pb-20 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-screen-2xl w-full mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 items-center gap-8 lg:gap-16 min-h-[65vh]">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="space-y-6 order-2 lg:order-1"
            >
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-6 backdrop-blur-md">
                  Complete Vedic Healing
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-tight">
                  Transform Your Life With <br />
                  <span className="text-gradient-gold">Sacred Remedies</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mb-8">
                  Explore our 8 powerful Vedic remedy modules designed to balance planetary energies, remove obstacles, and propel your spiritual and material growth.
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/talk-to-astrologer"
                    className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                  >
                    Consult Astrologer <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={() => {
                      document.getElementById('remedies-grid')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground text-sm font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    Explore 8 Remedies
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Animated Wheel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              className="relative w-full order-1 lg:order-2 flex items-center justify-center py-4"
            >
              <AshtaDigbandhanaWheel />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 8 Remedies Grid Section */}
      <section id="remedies-grid" className="py-20 lg:py-28 bg-background relative z-10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20">
              ASHTA-DIGBANDHAN MANDALA
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              The 8 Sacred Vedic Remedies
            </h2>
            <p className="text-sm text-muted-foreground">
              Mantra, Gemstones, Yantra, Homa, Devata Upasana, Vastu, Rudraksha, and Homa / Puja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {remediesList.slice(0, 8).map((remedy, index) => {
              const Icon = iconMap[remedy.icon] || CircleDot;
              const defaultImageMap: Record<string, string> = {
                'svc-mantra': '/assets/images/remedies/remedies_mantra_1785738410624.png',
                'svc-gemstone': '/assets/images/remedies/remedies_gemstone_1785738400359.png',
                'svc-yantra': '/assets/images/remedies/remedies_yantra_1785738431966.png',
                'svc-homam': '/assets/images/remedies/remedies_homam_1785738443734.png',
                'svc-ishta': '/assets/images/remedies/remedies_ishta_1785738453810.png',
                'svc-vastu': '/assets/images/remedies/remedies_vastu_1785738485180.png',
                'svc-rudraksha': '/assets/images/remedies/remedies_homam_1785738443734.png',
                'svc-homa-puja': '/assets/images/remedies/remedies_homam_1785738443734.png',
              };
              const imageSrc = defaultImageMap[remedy.id] || remedy.image || '/assets/images/remedies/remedies_homam_1785738443734.png';
              
              return (
                <motion.div
                  key={remedy.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="h-full"
                >
                  <Link
                    href={remedy.href}
                    className="group relative flex flex-col h-full glass-card border border-white/5 rounded-3xl overflow-hidden hover:border-[#C9952B]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[#C9952B]/10"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={imageSrc}
                        alt={remedy.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                      
                      {remedy.badge && (
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold bg-black/80 text-[#C9952B] border border-[#C9952B]/40 backdrop-blur-md">
                          {remedy.badge}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-grow p-6 relative -mt-8">
                      <div className={`w-12 h-12 rounded-2xl bg-card border border-white/10 flex items-center justify-center shadow-xl mb-3 z-10 ${remedy.iconColor}`}>
                        <Icon size={22} />
                      </div>
                      
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-[#C9952B] transition-colors">
                        {remedy.title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground mb-6 flex-grow leading-relaxed">
                        {remedy.description}
                      </p>
                      
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 group-hover:text-white transition-colors mt-auto pt-2 border-t border-white/5">
                        <span>Explore Remedy</span> <ArrowRight size={14} className="text-[#C9952B] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Content Managed via Admin Panel */}
      <section className="max-w-7xl mx-auto px-6">
        <DynamicPageContent pageId="remedies-overview" />
      </section>

      <LandingFooter />
    </div>
  );
}
