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
  'janam-kundli': Users,
  'kundli-matching': Users,
  'daily-horoscope': Sun,
  'panchang': Sun,
  'fasting': BookOpen,
  'meditation': HeartHandshake,
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
    <div className="space-y-24 py-20 bg-[#F8F3EA]">
      {/* 8 Ashta-Digbandhan Remedies Section */}
      <section id="remedies" className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 space-y-3"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]">
            {content?.tagline || 'ASHTA-DIGBANDHAN MANDALA'}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#292522]">
            {content?.title || 'Sacred Ashta-Digbandhan'}{' '}
            <span className="text-gradient-gold">{content?.titleHighlight || 'Vedic Remedies'}</span>
          </h2>
          <p className="text-sm md:text-base text-[#6B5E55] max-w-2xl mx-auto font-medium">
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
                className="relative group rounded-3xl p-6 bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#B88A44] transition-all duration-300 shadow-sm hover:shadow-xl card-hover"
              >
                <Link href={remedy.href} className="block h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#713B32] group-hover:text-white transition-all">
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]">
                        {remedy.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#292522] mb-2 group-hover:text-[#713B32] transition-colors">
                      {remedy.title}
                    </h3>
                    <p className="text-xs text-[#6B5E55] leading-relaxed line-clamp-3">
                      {remedy.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#E5D9C8] flex items-center justify-between text-xs font-bold text-[#713B32]">
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
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]">
            {comprehensiveSection?.tagline || 'ASTROPARIHAR SERVICES'}
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#292522]">
            {comprehensiveSection?.title || 'Our Comprehensive'}{' '}
            <span className="text-gradient-gold">{comprehensiveSection?.titleHighlight || 'Vedic Services & Guides'}</span>
          </h2>
          <p className="text-sm md:text-base text-[#6B5E55] max-w-2xl mx-auto">
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
                className="relative group rounded-3xl p-6 bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#B88A44] transition-all duration-300 shadow-sm hover:shadow-xl card-hover"
              >
                <Link href={service.href} className="block h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#713B32] group-hover:text-white transition-all">
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#292522] mb-2 group-hover:text-[#713B32] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#6B5E55] leading-relaxed line-clamp-3">
                      {service.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#E5D9C8] flex items-center justify-between text-xs font-bold text-[#713B32]">
                    <span>Access Service</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
