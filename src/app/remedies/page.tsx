'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Gem, Music, Triangle, Flame, Heart, Moon, Compass, Gift, CircleDot } from 'lucide-react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';

import { getHomepageContent, HomepageContent, defaultHomepageContent, ServiceItem } from '@/lib/cms';

const iconMap: Record<string, any> = {
  Gem,
  Music,
  Triangle,
  Flame,
  Heart,
  Moon,
  Compass,
  Gift,
  CircleDot,
};

export default function RemediesPage() {
  const [content, setContent] = React.useState<HomepageContent | null>(null);

  React.useEffect(() => {
    async function load() {
      const data = await getHomepageContent();
      setContent(data);
    }
    load();
  }, []);

  const remediesList = content?.services.items || defaultHomepageContent.services.items;

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#8B1A2A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-[2000px] w-full mx-auto">
            <div className="grid lg:grid-cols-2 items-center min-h-screen">
              
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="px-6 lg:px-12 xl:px-20 space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-6 backdrop-blur-md">
                    Complete Vedic Healing
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                    Transform Your Life With <br />
                    <span className="text-gradient-gold">Sacred Remedies</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    Explore our 9 powerful Vedic remedy modules designed to balance planetary energies, remove obstacles, and propel your spiritual and material growth.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Link
                      href="/talk-to-astrologer"
                      className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                    >
                      Consult Astrologer <ArrowRight size={18} />
                    </Link>
                    <button
                      onClick={() => {
                        document.getElementById('remedies-grid')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      Explore Remedies
                    </button>
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
                    src={"/assets/images/remedies/remedies_banner_1785738389383.png"}
                    alt="Vedic Remedies Banner"
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

      {/* Remedies Grid Section */}
      <section id="remedies-grid" className="py-20 lg:py-28 bg-background relative z-10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {remediesList.map((remedy, index) => {
              const Icon = iconMap[remedy.icon] || CircleDot;
              return (
                <motion.div
                  key={remedy.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="h-full"
                >
                  <Link
                    href={remedy.href}
                    className="group relative flex flex-col h-full glass-card border border-white/5 rounded-3xl overflow-hidden hover:border-[#C9952B]/30 transition-all duration-500"
                  >
                    <div className="relative h-56 w-full overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={remedy.image || '/assets/images/remedies/remedies_homam_1785738443734.png'}
                        alt={remedy.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </div>
                    
                    <div className="flex flex-col flex-grow p-6 relative -mt-10">
                      <div className={`w-12 h-12 rounded-2xl bg-card border border-white/10 flex items-center justify-center shadow-xl mb-4 z-10 ${remedy.iconColor}`}>
                        <Icon size={22} />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-[#C9952B] transition-colors">
                        {remedy.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-6 flex-grow leading-relaxed">
                        {remedy.description}
                      </p>
                      
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white transition-colors mt-auto">
                        Explore Remedy <ArrowRight size={16} className="text-[#C9952B] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
