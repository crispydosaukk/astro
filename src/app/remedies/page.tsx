'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Gem, Music, Triangle, Flame, Heart, Compass, CircleDot, ShieldCheck, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';

import AshtaDigbandhanaWheel, { SpokeItem } from '@/components/AshtaDigbandhanaWheel';
import DynamicPageContent from '@/components/DynamicPageContent';
import { getHomepageContent, HomepageContent, defaultHomepageContent, subscribeHomepageContent } from '@/lib/cms';
import { ChevronRight } from 'lucide-react';

const iconMap: Record<string, any> = {
  Music,
  Gem,
  Triangle,
  Flame,
  Heart,
  Compass,
  CircleDot,
};

const DEFAULT_SPOKE: SpokeItem = {
  id: 'mantra',
  number: '1',
  name: 'MANTRA शक्ति',
  sanskrit: 'मन्त्र शक्ति',
  direction: 'N',
  directionFull: 'उत्तर (North)',
  mantra: 'ॐ ह्रीं श्रीं क्लीं चामुण्डायै विच्चे ॥',
  explanation: 'जप से मन, वाणी और कर्म की शुद्धि व रक्षा होती है।',
  href: '/remedies/mantra',
  angle: -90,
  bgGradientId: 'grad-n-mantra',
  startColor: '#5C111A',
  endColor: '#36060C',
  accentColor: '#FBD38D',
  icon: null,
};

const EIGHT_SACRED_REMEDIES = [
  {
    id: 'svc-mantra',
    icon: 'Music',
    title: '1. Mantra Shakti (मन्त्र शक्ति)',
    description: 'Sacred Vedic mantras to purify mind, speech, & actions, balance planetary afflictions, and energize consciousness.',
    href: '/remedies/mantra',
    badge: 'North (N)',
    image: '/assets/images/remedies/remedies_mantra_1785738410624.png',
    iconColor: 'text-blue-600',
  },
  {
    id: 'svc-gemstone',
    icon: 'Gem',
    title: '2. Gemstones (रत्न)',
    description: 'Empower weak benefactor planets, restore life balance, and attract positive cosmic vibrations through certified gemstones.',
    href: '/remedies/gemstone',
    badge: 'North-East (NE)',
    image: '/assets/images/remedies/remedies_gemstone_1785738400359.png',
    iconColor: 'text-amber-600',
  },
  {
    id: 'svc-yantra',
    icon: 'Triangle',
    title: '3. Yanthra (यन्त्र)',
    description: 'Sacred geometric energy conductors for spatial stability, obstacle removal, divine protection, and business prosperity.',
    href: '/remedies/yantra',
    badge: 'East (E)',
    image: '/assets/images/remedies/remedies_yantra_1785738431966.png',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'svc-homam',
    icon: 'Flame',
    title: '4. Homa (हवन)',
    description: 'Sacred Vedic fire rituals through Agni Deva to destroy negative energies, pacify planetary afflictions, and bring auspiciousness.',
    href: '/remedies/homa',
    badge: 'South-East (SE)',
    image: '/assets/images/remedies/remedies_homam_1785738443734.png',
    iconColor: 'text-orange-600',
  },
  {
    id: 'svc-ishta',
    icon: 'Heart',
    title: '5. Devata Upasana (देवता उपासना)',
    description: 'Surrender and worship of your personal Ishta Devata (5th/9th house ruler) for spiritual breakthrough and divine grace.',
    href: '/remedies/mantra',
    badge: 'South (S)',
    image: '/assets/images/remedies/remedies_ishta_1785738453810.png',
    iconColor: 'text-rose-600',
  },
  {
    id: 'svc-vastu',
    icon: 'Compass',
    title: '6. Vasthu (वास्तु)',
    description: 'Directional 16-zone Vastu corrections to eliminate geo-stress and cultivate harmonious wealth and health at home & workplace.',
    href: '/remedies/vastu',
    badge: 'South-West (SW)',
    image: '/assets/images/remedies/remedies_vastu_1785738485180.png',
    iconColor: 'text-teal-600',
  },
  {
    id: 'svc-rudraksha',
    icon: 'CircleDot',
    title: '7. Rudraksha (रुद्राक्ष)',
    description: 'Pure authentic Mukhi Rudraksha beads to pacify malefic planetary dashas, stabilize nervous energy, and boost inner focus.',
    href: '/remedies/rudraksha',
    badge: 'West (W)',
    image: '/assets/images/remedies/remedies_charity_1785738494717.png',
    iconColor: 'text-amber-700',
  },
  {
    id: 'svc-homa-puja',
    icon: 'Flame',
    title: '8. Homa / Puja (हवन / पूजा)',
    description: 'Comprehensive directional purification rituals, Navagraha Shanti, and consecrated deity pujas for total life protection.',
    href: '/remedies/homa',
    badge: 'North-West (NW)',
    image: '/assets/images/remedies/remedies_muhurtham_1785738473891.png',
    iconColor: 'text-purple-600',
  },
];

export default function RemediesPage() {
  const [content, setContent] = React.useState<HomepageContent | null>(null);
  const [selectedSpoke, setSelectedSpoke] = React.useState<SpokeItem>(DEFAULT_SPOKE);

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
      <section className="relative overflow-hidden border-b border-white/5 pt-24 lg:pt-28 pb-16 lg:pb-20 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-screen-2xl w-full mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 items-start gap-8 lg:gap-12">
            
            {/* Left Content - Fully populated with Headline, Pillars, Buttons, and Live Remedy Card */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="space-y-6 order-2 lg:order-1"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 mb-4 backdrop-blur-md shadow-lg shadow-black/20">
                  <Sparkles size={14} className="text-[#F6D075]" />
                  Complete Vedic Healing & Planetary Shield
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight leading-[1.15] drop-shadow-lg">
                  Transform Your Life With <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    Sacred Vedic Remedies
                  </span>
                </h1>
                
                <p className="text-sm sm:text-base text-[#F8F3EA]/90 font-medium leading-relaxed max-w-xl mb-5 drop-shadow">
                  Explore our 8 powerful Vedic remedy modules designed to balance planetary energies, remove obstacles, and propel your spiritual and material growth.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 mb-6">
                  <Link
                    href="/talk-to-astrologer"
                    className="px-7 py-3.5 rounded-full gold-gradient-bg text-[#292522] font-extrabold text-sm sm:text-base flex items-center gap-2 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#C9952B]/40 cursor-pointer"
                  >
                    Consult Astrologer <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={() => {
                      document.getElementById('remedies-grid')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 hover:scale-[1.02] transition-all backdrop-blur-sm text-sm sm:text-base shadow-md cursor-pointer"
                  >
                    Explore 8 Remedies
                  </button>
                </div>

                {/* Interactive Active Remedy Showcase Card (Eliminates Left Void) */}
                <motion.div
                  key={selectedSpoke.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-5 sm:p-6 rounded-3xl border border-[#B88A44]/40 bg-black/60 backdrop-blur-md shadow-2xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span
                      className="px-3.5 py-1 rounded-full text-xs font-extrabold text-[#292522] shadow-sm"
                      style={{ backgroundColor: selectedSpoke.accentColor }}
                    >
                      दिशा: {selectedSpoke.directionFull}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white font-serif">
                      {selectedSpoke.number}. {selectedSpoke.name} ({selectedSpoke.sanskrit})
                    </h4>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-[#F6D075] font-serif">
                    {selectedSpoke.mantra}
                  </p>

                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-medium">
                    {selectedSpoke.explanation}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                    <Link
                      href={selectedSpoke.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F6D075] hover:text-[#FFE29F] transition-colors"
                    >
                      <span>Explore {selectedSpoke.name.split(' ')[0]} Module</span>
                      <ChevronRight size={14} />
                    </Link>
                    <span className="text-[11px] text-white/50 italic">Hover/click any sector on the wheel</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Visual Animated Wheel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              className="relative w-full order-1 lg:order-2 flex items-center justify-center"
            >
              <AshtaDigbandhanaWheel
                hideInfoCard={true}
                hideFooter={true}
                onHoverSpoke={(spoke) => {
                  if (spoke) setSelectedSpoke(spoke);
                }}
              />
            </motion.div>

          </div>

          {/* Full Width Bottom Shloka Banner */}
          <div className="pt-10 mt-10 border-t border-white/10 text-center space-y-1.5">
            <p className="text-sm sm:text-base text-[#F6D075] font-serif font-bold tracking-wide">
              मंत्र – रत्न – यंत्र – हवन – देवता उपासना – वास्तु – रुद्राक्ष – हवन / पूजा
            </p>
            <p className="text-xs sm:text-sm text-white/70 font-medium">
              ॥ इन आठ स्तम्भों से होता है सम्पूर्ण अष्टदिग्बन्धन और जीवन का संरक्षण ॥
            </p>
          </div>
        </div>
      </section>

      {/* 8 Remedies Grid Section */}
      <section id="remedies-grid" className="py-16 lg:py-24 bg-[#F8F3EA] relative z-10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] shadow-sm">
              ASHTA-DIGBANDHAN MANDALA
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#292522]">
              The 8 Sacred Vedic Remedies
            </h2>
            <p className="text-sm text-[#6B5E55]">
              Mantra, Gemstones, Yantra, Homa, Devata Upasana, Vastu, Rudraksha, and Homa / Puja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {EIGHT_SACRED_REMEDIES.map((remedy, index) => {
              const Icon = iconMap[remedy.icon] || CircleDot;
              
              return (
                <motion.div
                  key={remedy.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  className="h-full"
                >
                  <Link
                    href={remedy.href}
                    className="group relative flex flex-col h-full bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl overflow-hidden hover:border-[#B88A44] transition-all duration-300 hover:shadow-xl shadow-md"
                  >
                    {/* Clear, Vivid Image with NO white overlay wash */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#281123] flex-shrink-0">
                      <Image
                        src={remedy.image}
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
                    
                    {/* Card Body with High Contrast & Clear Typography */}
                    <div className="flex flex-col flex-grow p-5 sm:p-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8] flex items-center justify-center shadow-sm shrink-0 ${remedy.iconColor}`}>
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
                        <ArrowRight size={15} className="text-[#B88A44] group-hover:translate-x-1 transition-transform" />
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
      <section className="max-w-7xl mx-auto px-6 py-8">
        <DynamicPageContent pageId="remedies-overview" />
      </section>

      <LandingFooter />
    </div>
  );
}
