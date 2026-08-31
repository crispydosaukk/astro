'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Gem,
  Music,
  Triangle,
  Flame,
  Heart,
  Compass,
  CircleDot,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Bot,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';

import RotatingRemediesWheel from '@/components/RotatingRemediesWheel';
import DynamicPageContent from '@/components/DynamicPageContent';
import {
  getHomepageContent,
  HomepageContent,
  defaultHomepageContent,
  subscribeHomepageContent,
} from '@/lib/cms';

export interface SpokeItem {
  id: string;
  number: string;
  name: string;
  sanskrit: string;
  direction: string;
  directionFull: string;
  mantra: string;
  explanation: string;
  href: string;
  angle: number;
  bgGradientId: string;
  startColor: string;
  endColor: string;
  accentColor: string;
  icon?: React.ReactNode;
}

const iconMap: Record<string, any> = {
  Music,
  Gem,
  Triangle,
  Flame,
  Heart,
  Compass,
  CircleDot,
};

const SPOKES_MAP: Record<string, SpokeItem> = {
  mantra: {
    id: 'mantra',
    number: '1',
    name: 'MANTRA',
    sanskrit: 'मन्त्र',
    direction: 'N',
    directionFull: 'उत्तर (North)',
    mantra: 'ॐ ह्रीं श्रीं क्लीं चामुण्डायै विच्चे ॥',
    explanation:
      'जप से मन, वाणी और कर्म की शुद्धि, ग्रहों की अनुकूलता और आत्मिक शक्ति प्राप्त होती है।',
    href: '/remedies/mantra',
    angle: -90,
    bgGradientId: 'grad-n-mantra',
    startColor: '#5C111A',
    endColor: '#36060C',
    accentColor: '#FBD38D',
  },
  yantra: {
    id: 'yantra',
    number: '2',
    name: 'YANTRA',
    sanskrit: 'यन्त्र',
    direction: 'NE',
    directionFull: 'ईशान (North-East)',
    mantra: 'ॐ श्रीं ह्रीं क्लीं नमः ॥',
    explanation:
      'यन्त्र ऊर्जा को केंद्रित कर वास्तुदोष, ग्रहपीड़ा और नकारात्मकता को दूर करते हैं।',
    href: '/remedies/yantra',
    angle: -45,
    bgGradientId: 'grad-ne-yantra',
    startColor: '#4A2A08',
    endColor: '#281403',
    accentColor: '#F6AD55',
  },
  homa: {
    id: 'homa',
    number: '3',
    name: 'HOMA',
    sanskrit: 'होम',
    direction: 'E',
    directionFull: 'पूर्व (East)',
    mantra: 'ॐ अग्नये स्वाहा ॥',
    explanation:
      'हवन अग्नि द्वारा वातावरण और सूक्ष्म शरीर का शोधन होता है, नवग्रह प्रसन्न होते हैं।',
    href: '/remedies/homa',
    angle: 0,
    bgGradientId: 'grad-e-homa',
    startColor: '#4C240A',
    endColor: '#2B1102',
    accentColor: '#F6AD55',
  },
  ishta: {
    id: 'ishta',
    number: '4',
    name: 'DEVATA UPASANA',
    sanskrit: 'देवता उपासना',
    direction: 'SE',
    directionFull: 'आग्नेय (South-East)',
    mantra: 'ॐ नमः शिवाय ॥',
    explanation:
      'इष्ट या कुलदेवता की उपासना से आध्यात्मिक बल और जीवन में ईश्वरीय कृपा प्राप्त होती है।',
    href: '/remedies/ishta-devata',
    angle: 45,
    bgGradientId: 'grad-se-upasana',
    startColor: '#0E2E1A',
    endColor: '#05180C',
    accentColor: '#68D391',
  },
  gemstone: {
    id: 'gemstone',
    number: '5',
    name: 'RATNA',
    sanskrit: 'रत्न',
    direction: 'S',
    directionFull: 'दक्षिण (South)',
    mantra: 'ॐ ग्रहाय नमः ॥',
    explanation:
      'उचित रत्न धारण करने से कमजोर लेकिन शुभ ग्रहों को बल मिलता है और अनुकूलता बढ़ती है।',
    href: '/remedies/gemstone',
    angle: 90,
    bgGradientId: 'grad-s-ratna',
    startColor: '#453508',
    endColor: '#241B02',
    accentColor: '#FAF089',
  },
  rudraksha: {
    id: 'rudraksha',
    number: '6',
    name: 'RUDRĀKṢA',
    sanskrit: 'रुद्राक्ष',
    direction: 'SW',
    directionFull: 'नैऋत्य (South-West)',
    mantra: 'ॐ नमः शिवाय ॥',
    explanation:
      'रुद्राक्ष शरीर और मन की ऊर्जा को स्थिर करता है और नकारात्मक प्रभावों से रक्षा करता है।',
    href: '/remedies/rudraksha',
    angle: 135,
    bgGradientId: 'grad-sw-rudraksha',
    startColor: '#173646',
    endColor: '#0A1C25',
    accentColor: '#63B3ED',
  },
  vastu: {
    id: 'vastu',
    number: '7',
    name: 'VĀSTU',
    sanskrit: 'वास्तु',
    direction: 'W',
    directionFull: 'पश्चिम (West)',
    mantra: 'ॐ वास्तुपुरुषाय नमः ॥',
    explanation:
      'दिशाओं का संतुलन बनाकर घर और कार्यक्षेत्र में सकारात्मक ऊर्जा का संचार किया जाता है।',
    href: '/remedies/vastu',
    angle: 180,
    bgGradientId: 'grad-w-vastu',
    startColor: '#083B38',
    endColor: '#021F1D',
    accentColor: '#4FD1C5',
  },
  charity: {
    id: 'charity',
    number: '8',
    name: 'DĀNA & SEVA',
    sanskrit: 'दान एवं सेवा',
    direction: 'NW',
    directionFull: 'वायव्य (North-West)',
    mantra: 'ॐ परोपकाराय नमः ॥',
    explanation:
      'निःस्वार्थ दान और सेवा से प्रारब्ध कर्मों के दोष कम होते हैं और आंतरिक शांति मिलती है।',
    href: '/remedies/charity',
    angle: 225,
    bgGradientId: 'grad-nw-dana',
    startColor: '#28133E',
    endColor: '#140620',
    accentColor: '#B794F4',
  },
};

const DEFAULT_SPOKE: SpokeItem = SPOKES_MAP['mantra'];

const EIGHT_SACRED_REMEDIES = [
  {
    id: 'svc-mantra',
    icon: 'Music',
    title: '1. Mantra Shakti (मन्त्र शक्ति)',
    description:
      'Sacred Vedic mantras to purify mind, speech, & actions, balance planetary afflictions, and energize consciousness.',
    href: '/remedies/mantra',
    badge: 'North (N)',
    image: '/assets/images/remedies/remedies_mantra_1785738410624.png',
    iconColor: 'text-blue-600',
  },
  {
    id: 'svc-yantra',
    icon: 'Triangle',
    title: '2. Yantra (यन्त्र)',
    description:
      'Sacred geometric energy conductors for spatial stability, obstacle removal, divine protection, and business prosperity.',
    href: '/remedies/yantra',
    badge: 'North-East (NE)',
    image: '/assets/images/remedies/remedies_yantra_1785738431966.png',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'svc-homam',
    icon: 'Flame',
    title: '3. Homa (होम / हवन)',
    description:
      'Sacred Vedic fire rituals through Agni Deva to destroy negative energies, pacify planetary afflictions, and bring auspiciousness.',
    href: '/remedies/homa',
    badge: 'East (E)',
    image: '/assets/images/remedies/remedies_homam_1785738443734.png',
    iconColor: 'text-orange-600',
  },
  {
    id: 'svc-ishta',
    icon: 'Heart',
    title: '4. Devata Upasana (देवता उपासना)',
    description:
      'Surrender and worship of your personal Ishta Devata (5th/9th house ruler) for spiritual breakthrough and divine grace.',
    href: '/remedies/ishta-devata',
    badge: 'South-East (SE)',
    image: '/assets/images/remedies/remedies_ishta_1785738453810.png',
    iconColor: 'text-rose-600',
  },
  {
    id: 'svc-gemstone',
    icon: 'Gem',
    title: '5. Ratna / Gemstones (रत्न)',
    description:
      'Empower weak benefactor planets, restore life balance, and attract positive cosmic vibrations through certified gemstones.',
    href: '/remedies/gemstone',
    badge: 'South (S)',
    image: '/assets/images/remedies/remedies_gemstone_1785738400359.png',
    iconColor: 'text-amber-600',
  },
  {
    id: 'svc-rudraksha',
    icon: 'CircleDot',
    title: '6. Rudraksha (रुद्राक्ष)',
    description:
      'Pure authentic Mukhi Rudraksha beads to pacify malefic planetary dashas, stabilize nervous energy, and boost inner focus.',
    href: '/remedies/rudraksha',
    badge: 'South-West (SW)',
    image: '/assets/images/remedies/remedies_homam_1785738443734.png',
    iconColor: 'text-amber-700',
  },
  {
    id: 'svc-vastu',
    icon: 'Compass',
    title: '7. Vastu (वास्तु)',
    description:
      'Directional 16-zone Vastu corrections to eliminate geo-stress and cultivate harmonious wealth and health at home & workplace.',
    href: '/remedies/vastu',
    badge: 'West (W)',
    image: '/assets/images/remedies/remedies_vastu_1785738485180.png',
    iconColor: 'text-teal-600',
  },
  {
    id: 'svc-charity',
    icon: 'Heart',
    title: '8. Dāna & Seva (दान एवं सेवा)',
    description:
      'Selfless charity and service to purify karma, invoke ancestral blessings, pacify malefic nodes, and bring lifelong protection.',
    href: '/remedies/charity',
    badge: 'North-West (NW)',
    image: '/assets/images/remedies/remedies_charity_1785738494717.png',
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

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDFC] text-[#292522]">
      <Navbar />

      {/* Hero Banner Section (Matches Home Page Full min-h-screen Height & Atmosphere) */}
      <section className="relative min-h-screen cosmic-bg overflow-hidden flex flex-col">
        {/* Star field background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(60)]?.map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: `${(i % 3) + 1}px`,
                height: `${(i % 3) + 1}px`,
                left: `${(i * 17) % 100}%`,
                top: `${(i * 13) % 100}%`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.4 + (i % 5) * 0.1,
              }}
            />
          ))}
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#B88A44]/20 blur-3xl pointer-events-none" />

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center pt-24 pb-8">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 xl:px-16 w-full">
            <div className="grid lg:grid-cols-12 items-center gap-8 lg:gap-12">
              {/* Left Content - Headline, Description, Buttons, and Active Remedy Card */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="lg:col-span-6 space-y-6 order-1"
              >
                <div>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 mb-3.5 backdrop-blur-md shadow-sm">
                    <Sparkles size={14} className="text-[#F6D075]" />
                    Complete Vedic Healing & Planetary Shield
                  </span>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight hero-text-glow max-w-xl mb-3.5">
                    Transform Your Life With <br />
                    <span className="block text-gradient-gold">Sacred Vedic Remedies</span>
                  </h1>

                  <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed max-w-lg mb-5">
                    Explore our 8 powerful Vedic remedy modules designed to balance planetary
                    energies, remove obstacles, and propel your spiritual and material growth.
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
                    <Link
                      href="/talk-to-ai-astrologer"
                      className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all duration-200 gold-shadow animate-pulse-gold cursor-pointer"
                    >
                      <Bot size={18} className="animate-pulse" />
                      AI Expert Astrologer
                    </Link>
                    <Link
                      href="/talk-to-astrologer"
                      className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#FFFDFC]/10 backdrop-blur-md border border-[#D8B66A]/40 text-white hover:border-[#D8B66A] hover:text-[#D8B66A] transition-all duration-200 cursor-pointer"
                    >
                      ✦ Consult Astrologer
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                    <button
                      onClick={() => {
                        document
                          .getElementById('remedies-grid')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#FFFDFC]/10 backdrop-blur-md border border-[#D8B66A]/30 text-white hover:border-[#D8B66A] hover:text-[#D8B66A] transition-all duration-200 cursor-pointer"
                    >
                      Explore 8 Remedies
                    </button>
                  </div>

                  {/* Interactive Active Remedy Showcase Card */}
                  <motion.div
                    key={selectedSpoke.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 sm:p-5 rounded-2xl border border-[#D8B66A]/30 bg-[#FFFDFC]/10 backdrop-blur-md shadow-2xl space-y-2.5 max-w-xl"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className="px-3 py-0.5 rounded-full text-[11px] font-extrabold text-[#292522] shadow-sm"
                        style={{ backgroundColor: selectedSpoke.accentColor }}
                      >
                        दिशा: {selectedSpoke.directionFull}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white font-serif">
                        {selectedSpoke.number}. {selectedSpoke.name} ({selectedSpoke.sanskrit})
                      </h4>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-[#F6D075] font-serif">
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
                        <ChevronRight size={13} />
                      </Link>
                      <span className="text-[10px] text-white/50 italic">
                        Hover/click any sector on the wheel
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Visual Animated Wheel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="lg:col-span-6 relative w-full order-2 flex items-center justify-center"
              >
                <RotatingRemediesWheel
                  onHoverItem={(id) => {
                    if (id && SPOKES_MAP[id]) {
                      setSelectedSpoke(SPOKES_MAP[id]);
                    }
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center pb-8 pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/50 text-xs font-medium cursor-pointer hover:text-white/80 transition-colors"
            onClick={() => {
              document.getElementById('remedies-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>Scroll to explore remedies</span>
            <ChevronDown size={16} />
          </motion.div>
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
              Mantra, Yantra, Homa, Devata Upasana, Gemstones, Rudraksha, Vastu, and Dāna & Seva.
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
                        <div
                          className={`w-10 h-10 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8] flex items-center justify-center shadow-sm shrink-0 ${remedy.iconColor}`}
                        >
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

      {/* Dynamic Content Managed via Admin Panel */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <DynamicPageContent pageId="remedies-overview" />
      </section>

      <LandingFooter />
    </div>
  );
}
