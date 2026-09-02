'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  'svc-charity': HeartHandshake,
  'free-panchang': Sun,
  'free-horoscope': Sun,
  'free-kundli-matching': Users,
  'free-meditation': HeartHandshake,
  'free-fasting': BookOpen,
  'janam-kundli': Users,
  'kundli-matching': Users,
  'daily-horoscope': Sun,
  panchang: Sun,
  fasting: BookOpen,
  meditation: HeartHandshake,
  'rahu-stabilisation': ShieldCheck,
  'rahu-survival': Flame,
  'sani-survival': Zap,
};

const defaultImages: Record<string, string> = {
  'svc-mantra': '/assets/images/remedies/remedies_mantra_1785738410624.png',
  'svc-yantra': '/assets/images/remedies/remedies_yantra_1785738431966.png',
  'svc-homam': '/assets/images/remedies/remedies_homam_1785738443734.png',
  'svc-ishta': '/assets/images/remedies/remedies_ishta_1785738453810.png',
  'svc-gemstone': '/assets/images/remedies/remedies_gemstone_1785738400359.png',
  'svc-rudraksha': '/assets/images/remedies/remedies_rudraksha.png',
  'svc-vastu': '/assets/images/remedies/remedies_vastu_1785738485180.png',
  'svc-charity': '/assets/images/remedies/remedies_charity_1785738494717.png',
};

interface RemediesSectionProps {
  content?: any;
}

export function RemediesSection({ content }: RemediesSectionProps) {
  const remediesList = content?.items || defaultHomepageContent.services.items;

  return (
    <section id="remedies" className="pt-16 pb-12 bg-[#F8F3EA]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3 max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] shadow-sm">
            {content?.tagline || 'ASHTA-DIGBANDHAN MANDALA'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#292522]">
            {content?.title || 'Sacred Ashta-Digbandhan'}{' '}
            <span className="text-gradient-gold">
              {content?.titleHighlight || 'Vedic Remedies'}
            </span>
          </h2>
          <p className="text-sm md:text-base text-[#6B5E55] font-medium">
            {content?.subtitle || '|| आठों दिशाओं की रक्षा – जीवन की पूर्ण स्थिरता और समृद्धि ||'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {remediesList.map((remedy: any, i: number) => {
            const Icon = iconDict[remedy.id] || iconDict[remedy.icon] || Gem;
            const imgSrc =
              remedy.image ||
              defaultImages[remedy.id] ||
              '/assets/images/remedies/remedies_banner_1785738389383.png';

            return (
              <motion.div
                key={remedy.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="h-full"
              >
                <Link
                  href={remedy.href}
                  className="group relative flex flex-col h-full bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl overflow-hidden hover:border-[#B88A44] transition-all duration-300 hover:shadow-xl shadow-md card-hover"
                >
                  {/* Top Vivid Image */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#281123] flex-shrink-0">
                    <Image
                      src={imgSrc}
                      alt={remedy.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Direction Badge */}
                    {remedy.badge && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-black/85 text-[#F6D075] border border-[#B88A44]/40 backdrop-blur-md shadow-md">
                        {remedy.badge}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-grow p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8] text-[#713B32] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 group-hover:bg-[#713B32] group-hover:text-white transition-all">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#292522] group-hover:text-[#713B32] transition-colors leading-snug">
                        {remedy.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-[#6B5E55] flex-grow leading-relaxed line-clamp-3">
                      {remedy.description}
                    </p>

                    <div className="inline-flex items-center justify-between text-xs font-bold text-[#713B32] group-hover:text-[#292522] transition-colors mt-auto pt-3 border-t border-[#E5D9C8]">
                      <span>Explore Remedy</span>
                      <ArrowRight
                        size={15}
                        className="text-[#B88A44] group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface ComprehensiveServicesSectionProps {
  comprehensiveContent?: any;
}

export function ComprehensiveServicesSection({
  comprehensiveContent,
}: ComprehensiveServicesSectionProps) {
  const comprehensiveSection = comprehensiveContent || defaultHomepageContent.comprehensiveServices;
  const coreServicesList =
    comprehensiveSection?.items || defaultHomepageContent.comprehensiveServices.items;

  return (
    <section id="services" className="pt-8 pb-16 bg-[#F8F3EA]">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 space-y-2.5"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]">
            {comprehensiveSection?.tagline || 'ASTROPARIHAR SERVICES'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#292522]">
            {comprehensiveSection?.title || 'Our Comprehensive'}{' '}
            <span className="text-gradient-gold">
              {comprehensiveSection?.titleHighlight || 'Vedic Services & Guides'}
            </span>
          </h2>
          <p className="text-sm md:text-base text-[#6B5E55] max-w-2xl mx-auto">
            {comprehensiveSection?.subtitle ||
              'Free daily Panchang, Horoscope forecasts, Kundli Matching, Meditation guides, Fasting Planners & Mahadasha Survival PDF Guides.'}
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
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface ServicesSectionProps {
  content?: any;
  comprehensiveContent?: any;
}

export default function ServicesSection({ content, comprehensiveContent }: ServicesSectionProps) {
  return (
    <>
      <RemediesSection content={content} />
      <ComprehensiveServicesSection comprehensiveContent={comprehensiveContent} />
    </>
  );
}
