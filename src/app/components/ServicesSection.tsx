'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Gem,
  Music,
  Triangle,
  Flame,
  Heart,
  Compass,
  CircleDot,
  ArrowRight,
  Sun,
  Moon,
  Users,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { defaultHomepageContent } from '@/lib/cms';

const iconDict: Record<string, any> = {
  Sun,
  Moon,
  Users,
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Flame,
  Music,
  Gem,
  Triangle,
  Heart,
  Compass,
  CircleDot,
  'svc-mantra': Music,
  'svc-gemstone': Gem,
  'svc-yantra': Triangle,
  'svc-homam': Flame,
  'svc-ishta': Heart,
  'svc-vastu': Compass,
  'svc-rudraksha': CircleDot,
  'svc-homa-puja': Flame,
  'free-panchang': Sun,
  'free-horoscope': Sun,
  'free-kundli-matching': Users,
  'free-meditation': HeartHandshake,
  'free-fasting': BookOpen,
  'rahu-stabilisation': ShieldCheck,
  'rahu-survival': Flame,
  'sani-survival': Zap,
};

interface ServicesSectionProps {
  content?: any;
  comprehensiveContent?: any;
}

export default function ServicesSection({ content, comprehensiveContent }: ServicesSectionProps) {
  const remediesList = content?.items || defaultHomepageContent.services.items;
  const comprehensiveSection = comprehensiveContent || defaultHomepageContent.comprehensiveServices;
  const coreServicesList = comprehensiveSection?.items || defaultHomepageContent.comprehensiveServices.items;

  return (
    <div className="space-y-24 py-20 bg-background">
      {/* 8 Ashta-Digbandhan Remedies Section */}
      <section id="remedies" className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 space-y-3"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20">
            {content?.tagline || 'ASHTA-DIGBANDHAN MANDALA'}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            {content?.title || 'Sacred Ashta-Digbandhan'}{' '}
            <span className="text-gradient-gold">{content?.titleHighlight || 'Vedic Remedies'}</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {content?.subtitle || '|| आठों दिशाओं की रक्षा – जीवन की पूर्ण स्थिरता और समृद्धि ||'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {remediesList.map((remedy: any, i: number) => {
            const Icon = iconDict[remedy.id] || iconDict[remedy.icon] || Gem;
            return (
              <motion.div
                key={remedy.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative group rounded-3xl p-6 bg-gradient-to-br ${remedy.color || 'from-amber-500/15 to-yellow-500/10'} border border-white/10 hover:border-[#C9952B]/40 transition-all duration-300 card-hover`}
              >
                <Link href={remedy.href} className="block h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-card/80 border border-white/10 flex items-center justify-center shadow-lg ${remedy.iconColor || 'text-[#C9952B]'} group-hover:scale-110 transition-transform`}
                      >
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-black/60 text-[#C9952B] border border-[#C9952B]/30">
                        {remedy.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-[#C9952B] transition-colors">
                      {remedy.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {remedy.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#C9952B]">
                    <span>Explore Remedy</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Comprehensive Services Section */}
      <section id="services" className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 space-y-3"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {comprehensiveSection?.tagline || 'ASTROPARIHAR SERVICES'}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            {comprehensiveSection?.title || 'Our Comprehensive'}{' '}
            <span className="text-gradient-gold">{comprehensiveSection?.titleHighlight || 'Vedic Services & Guides'}</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {comprehensiveSection?.subtitle || 'Free daily Panchang, Horoscope forecasts, Kundli Matching, Meditation guides, Fasting Planners & Mahadasha Survival PDF Guides.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreServicesList.map((service: any, i: number) => {
            const Icon = iconDict[service.id] || iconDict[service.icon] || Sun;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative group rounded-3xl p-6 bg-gradient-to-br ${service.color || 'from-emerald-500/15 to-teal-500/10'} border border-white/10 hover:border-[#C9952B]/40 transition-all duration-300 card-hover`}
              >
                <Link href={service.href} className="block h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-card/80 border border-white/10 flex items-center justify-center shadow-lg ${service.iconColor || 'text-emerald-400'} group-hover:scale-110 transition-transform`}
                      >
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/30">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-[#C9952B] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {service.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>Access Service</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[#C9952B]" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
