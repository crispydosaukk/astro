'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Check,
  ArrowRight,
  Sparkles,
  Flame,
  Sun,
  Shield,
  Droplets,
  Wind,
  Coins,
  Eye,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  Award,
  PhoneCall,
  Lock,
  ImageIcon,
  Maximize2,
  X,
} from 'lucide-react';
import ServiceReportForm from '@/components/ServiceReportForm';
import { getServicePageContent, VastuServiceContent, defaultVastuContent, getHomepageContent, HomepageContent } from '@/lib/cms';
import DynamicPageContent from '@/components/DynamicPageContent';

export default function VastuServicePage() {
  const [content, setContent] = useState<VastuServiceContent | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDiagnostic, setActiveDiagnostic] = useState<string>('wealth');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadContent() {
      const [data, homeData] = await Promise.all([
        getServicePageContent('vastu', defaultVastuContent),
        getHomepageContent(),
      ]);
      setHomepageContent(homeData);
      setContent(data);
      setLoading(false);
    }
    loadContent();
  }, []);

  const directionsData = [
    {
      id: 'east',
      dir: 'EAST',
      sanskrit: 'पूर्व',
      deity: 'Indra (इन्द्र)',
      element: 'Sun / Light (सूर्य)',
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bgGrad: 'from-amber-950/40 to-slate-950',
      icon: Sun,
      mainImage: '/assets/images/vastu/image3.jpeg',
      gallery: ['/assets/images/vastu/image2.jpeg', '/assets/images/vastu/image3.jpeg', '/assets/images/vastu/image1.gif'],
      governs: ['Growth', 'Reputation & Fame', 'New Opportunities', 'Vitality & Health'],
      imbalance: ['Lack of recognition', 'Low confidence', 'Slow career progress', 'Stagnant opportunities'],
      remedy: 'Keep uncluttered and open to morning sunlight. Place copper Sun symbol or crystal prisms.',
    },
    {
      id: 'southeast',
      dir: 'SOUTHEAST',
      sanskrit: 'आग्नेय',
      deity: 'Agni (अग्नि)',
      element: 'Fire (अग्नि तत्व)',
      color: 'text-orange-400',
      border: 'border-orange-500/30',
      bgGrad: 'from-orange-950/40 to-slate-950',
      icon: Flame,
      mainImage: '/assets/images/vastu/image5.png',
      gallery: ['/assets/images/vastu/image4.jpeg', '/assets/images/vastu/image5.png', '/assets/images/vastu/image6.jpeg'],
      governs: ['Energy & Vitality', 'Health & Digestion', 'Cash Flow & Liquidity', 'Power & Drive'],
      imbalance: ['Health complications', 'Frequent anger & conflicts', 'Financial instability & cash crunch'],
      remedy: 'Ideal for kitchen/electricals. Avoid blue colors or water tanks here. Keep warm and energized.',
    },
    {
      id: 'south',
      dir: 'SOUTH',
      sanskrit: 'दक्षिण',
      deity: 'Yama (यम / मंगल)',
      element: 'Earth + Heat (भूमि + तेज)',
      color: 'text-red-400',
      border: 'border-red-500/30',
      bgGrad: 'from-red-950/40 to-slate-950',
      icon: Shield,
      mainImage: '/assets/images/vastu/image7.jpeg',
      gallery: ['/assets/images/vastu/image7.jpeg', '/assets/images/vastu/image8.jpeg', '/assets/images/vastu/image9.jpeg'],
      governs: ['Discipline', 'Authoritative Control', 'Longevity & Health', 'Career Stability'],
      imbalance: ['Inner fears & anxiety', 'Career instability', 'Lack of command & authority'],
      remedy: 'Keep heavier than North/East. Use closed solid walls, earthy tones, and avoid underground water.',
    },
    {
      id: 'southwest',
      dir: 'SOUTHWEST',
      sanskrit: 'नैऋत्य',
      deity: 'Nairṛti (नैऋति / राहू)',
      element: 'Earth (पृथ्वी तत्व - Foundation)',
      color: 'text-yellow-400',
      border: 'border-yellow-500/30',
      bgGrad: 'from-yellow-950/40 to-slate-950',
      icon: Layers,
      mainImage: '/assets/images/vastu/image10.png',
      gallery: ['/assets/images/vastu/image10.png'],
      governs: ['Master Stability', 'Marital Relationships', 'Long-term Success', 'Life Foundation'],
      imbalance: ['Severe life instability', 'Relationship disputes & divorces', 'Financial insecurity'],
      remedy: 'Master bedroom zone. Heaviest part of property. Use yellow/earth tones, zero borewells or cuts.',
    },
    {
      id: 'west',
      dir: 'WEST',
      sanskrit: 'पश्चिम',
      deity: 'Varuna (वरुण / शनि)',
      element: 'Water / Metal (जल + धातु)',
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bgGrad: 'from-blue-950/40 to-slate-950',
      icon: Droplets,
      mainImage: '/assets/images/vastu/image11.png',
      gallery: ['/assets/images/vastu/image11.png', '/assets/images/vastu/image12.jpeg'],
      governs: ['Gains & Profitability', 'Fulfillment of Desires', 'Rewards of Hard Work', 'Emotional Balance'],
      imbalance: ['Delayed results despite effort', 'Emotional stress', 'Chronic dissatisfaction'],
      remedy: 'Ideal for dining room, study, or overhead water tanks. Use grey/white tones and metallic accents.',
    },
    {
      id: 'northwest',
      dir: 'NORTHWEST',
      sanskrit: 'वायव्य',
      deity: 'Vayu (वायु / चन्द्र)',
      element: 'Air (वायु तत्व)',
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bgGrad: 'from-cyan-950/40 to-slate-950',
      icon: Wind,
      mainImage: '/assets/images/vastu/image13.png',
      gallery: ['/assets/images/vastu/image13.png', '/assets/images/vastu/image14.png', '/assets/images/vastu/image15.jpeg'],
      governs: ['Movement & Travel', 'Social Networks & Support', 'Helpful Friends', 'Positive Change'],
      imbalance: ['Unstable living situations', 'Disruptive frequent changes', 'Mental restlessness & anxiety'],
      remedy: 'Guest bedroom or finished product storage. Use white/cream tones, ensure active fresh airflow.',
    },
    {
      id: 'north',
      dir: 'NORTH',
      sanskrit: 'उत्तर',
      deity: 'Kubera (कुबेर / बुध)',
      element: 'Water + Flow (जल प्रवाह)',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bgGrad: 'from-emerald-950/40 to-slate-950',
      icon: Coins,
      mainImage: '/assets/images/vastu/image16.png',
      gallery: ['/assets/images/vastu/image16.png', '/assets/images/vastu/image17.jpeg', '/assets/images/vastu/image18.jpeg'],
      governs: ['Wealth & Prosperity', 'Continuous Income Flow', 'New Career Openings', 'Business Growth'],
      imbalance: ['Financial blockage', 'Missed business opportunities', 'Stagnant income growth'],
      remedy: 'Keep light, open, and clean. Place cash locker facing North, water fountain, or green plants.',
    },
    {
      id: 'northeast',
      dir: 'NORTHEAST',
      sanskrit: 'ईशान',
      deity: 'Ishana (ईशान / शिव / गुरु)',
      element: 'Water + Space (ईश्वरीय ऊर्जा)',
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bgGrad: 'from-indigo-950/40 to-slate-950',
      icon: Sparkles,
      mainImage: '/assets/images/vastu/image21.png',
      gallery: ['/assets/images/vastu/image21.png', '/assets/images/vastu/image19.jpeg', '/assets/images/vastu/image20.jpeg'],
      governs: ['Mental Clarity', 'Spiritual Awakening', 'Divine Intuition', 'Wisdom & Life Vision'],
      imbalance: ['Chronic confusion', 'Disastrous decision-making', 'Lack of life direction & focus'],
      remedy: 'Sacred Mandir / Meditation zone. Keep completely clutter-free, clean water pot, zero toilets/heavy loads.',
    },
  ];

  const diagnosticScenarios = [
    {
      id: 'wealth',
      title: 'Financial Blockages & Cash Crunch',
      icon: Coins,
      problem: 'Money gets stuck, delayed payments, lack of new client opportunities, irregular cash flow.',
      targetDirections: ['North (Kubera Zone)', 'Southeast (Agni Zone)'],
      insights:
        'The North governs wealth inflow and new opportunities, while Southeast governs daily cash liquidity and expenditure. Check for clutter or heavy storage in the North, and water elements/blue colors in the Southeast.',
      actionPlan: 'Clear the North zone, place an energizing water fountain or Kubera Yantra. Ensure Southeast is illuminated with fire elements.',
    },
    {
      id: 'clarity',
      title: 'Confusion & Wrong Decision Making',
      icon: Eye,
      problem: 'Mental fog, lack of clear life purpose, repeating identical mistakes, lack of peace.',
      targetDirections: ['Northeast (Ishana Zone)'],
      insights:
        'Northeast is the sacred head of Vastu Purusha representing divine consciousness. Any toilet, heavy clutter, or kitchen in the Northeast blocks clarity and leads to poor judgments.',
      actionPlan: 'Establish a pristine prayer/meditation space in the Northeast. Remove all dustbins and heavy items immediately.',
    },
    {
      id: 'instability',
      title: 'Life & Career Instability / Family Disputes',
      icon: Layers,
      problem: 'Constant instability, marital disharmony, fear of future, lack of firm grounding.',
      targetDirections: ['Southwest (Nairṛti Zone)'],
      insights:
        'Southwest is the anchor of stability and relationships. Underground tanks, missing corners, or main doors in the Southwest create severe vulnerability and relationship fractures.',
      actionPlan: 'Position the master bedroom in the Southwest with heavy wooden furniture and warm earthy yellow tones.',
    },
    {
      id: 'health',
      title: 'Low Energy, Frequent Anger & Digestion Issues',
      icon: Flame,
      problem: 'Persistent lethargy, digestive problems, quick temper, family arguments.',
      targetDirections: ['Southeast (Agni Zone)', 'East (Surya Zone)'],
      insights:
        'Southeast governs metabolic fire (Jatharagni) and drive. Water in Southeast extinguishes vitality, while a blocked East stops solar life energy (Prana).',
      actionPlan: 'Ensure morning sunlight enters the East. Keep the kitchen fire in the Southeast quadrant facing East while cooking.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-screen-2xl w-full mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-2 items-center min-h-[90vh]">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="space-y-6 py-16 lg:py-0 order-2 lg:order-1"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60 mb-3">
                  <Link href="/" className="hover:text-[#C9952B] transition-colors">Home</Link>
                  <span>/</span>
                  <Link href="/remedies" className="hover:text-[#C9952B] transition-colors">Remedies</Link>
                  <span>/</span>
                  <span className="text-[#C9952B] font-semibold">Vastu Alignment</span>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold glass-card border border-[#C9952B]/30 text-[#C9952B]">
                  <Compass size={13} /> Aṣṭa Digbandhana Vāstu Alignment
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                  When Space is Aligned,
                  <br />
                  <span className="text-gradient-gold">Life Flows with Less Resistance.</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-xl">
                  Vāstu is not merely about physical structure—it is about harmonizing natural directional energies with your internal karma to unlock clarity, health, stability, and enduring wealth.
                </p>

                {/* Classical Vedic Shloka Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400 font-serif">
                    ॥ वैदिक वास्तु प्रमाण ॥
                  </p>
                  <p className="text-sm sm:text-base font-serif font-bold text-white leading-relaxed">
                    दिशासु सम्यग्विन्यस्ते वास्तु शान्तिः प्रजायते ।
                    <br />
                    तस्मात् सुसंस्थिते देशे सुखं समृद्धिर्विवर्धते ॥
                  </p>
                  <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800">
                    &quot;When space is properly aligned in all directions, harmony arises. In a well-balanced environment, happiness and prosperity naturally grow.&quot;
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="#get-report"
                    className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold gold-gradient-bg text-slate-950 hover:opacity-90 transition-all gold-shadow text-sm"
                  >
                    <Compass size={16} /> Get Vastu Analysis
                  </a>
                  <Link
                    href="/talk-to-astrologer"
                    className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all text-sm"
                  >
                    <PhoneCall size={15} /> Talk to Vastu Expert
                  </Link>
                </div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="relative h-[45vh] lg:h-[75vh] w-full order-1 lg:order-2 flex items-center justify-center p-4 lg:p-8"
              >
                <div className="relative w-full h-full max-w-lg lg:max-w-xl">
                  <Image
                    src="/assets/images/remedies/remedies_vastu_1785738485180.png"
                    alt="Vastu Purusha Mandala Alignment"
                    fill
                    className="object-contain drop-shadow-[0_20px_50px_rgba(201,149,43,0.3)]"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Vastu as a Remedy */}
      <section className="py-20 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Core Principles
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              Why Vāstu is Important as a Remedy
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Vāstu aligns your external physical environment to actively support and accelerate your internal karma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-lg">
                1️⃣
              </div>
              <h3 className="text-base font-bold text-white">Space Influences Results</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Even with an auspicious horoscope, improper space creates friction and delays. Aligned space enables smoother outcomes and faster manifestation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                2️⃣
              </div>
              <h3 className="text-base font-bold text-white">Directional Life Energies</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Each of the 8 directions governs a fundamental quadrant of human experience—from wealth (North) and clarity (Northeast) to stability (Southwest).
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-lg">
                3️⃣
              </div>
              <h3 className="text-base font-bold text-white">Silent 24/7 Remedy</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Unlike rituals or mantras that require daily effort, aligned space works continuously around the clock, silently supporting and magnifying all other remedies.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-lg">
              4️⃣
            </div>
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-lg">
                4️⃣
              </div>
              <h3 className="text-base font-bold text-white">Reduces Life Resistance</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When environmental resistance is removed, personal effort produces exponential results. Timing (Astrology) and Environment (Vāstu) work in unison.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AṢṬA DIK - The 8 Directions Deep Dive with Integrated Images */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Aṣṭa Dik Visual Guide
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              The 8 Directions &amp; Life Areas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore the governing deities, elements, visual layout diagrams, and corrective remedies for each directional sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {directionsData.map((d) => {
              const IconComp = d.icon;
              return (
                <div
                  key={d.id}
                  className={`p-5 rounded-3xl border ${d.border} bg-gradient-to-b ${d.bgGrad} shadow-xl flex flex-col justify-between hover:border-amber-500/60 transition-all duration-300 group`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-base sm:text-lg font-black ${d.color} tracking-wide`}>
                          {d.dir} ({d.sanskrit})
                        </h3>
                        <p className="text-xs text-slate-400">{d.deity}</p>
                      </div>
                      <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
                        <IconComp size={18} className={d.color} />
                      </div>
                    </div>

                    {/* Vastu Direction Diagram Image from Word Document */}
                    <div
                      onClick={() => setSelectedImage(d.mainImage)}
                      className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 cursor-pointer group-hover:border-amber-500/50 transition-all shadow-inner"
                    >
                      <Image
                        src={d.mainImage}
                        alt={`${d.dir} Vastu Diagram`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                        <Maximize2 size={10} /> View Diagram
                      </div>
                    </div>

                    {/* Element badge */}
                    <div className="text-xs bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <p className="text-slate-300 text-[11px]">
                        <strong className="text-white">Element:</strong> {d.element}
                      </p>
                    </div>

                    {/* Governs */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Governs:</p>
                      <ul className="text-xs text-slate-200 space-y-1">
                        {d.governs.map((g, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[11.5px]">
                            <Check size={11} className="text-emerald-400 shrink-0" /> {g}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Imbalance */}
                    <div className="space-y-1 pt-2 border-t border-white/10">
                      <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">If Imbalanced:</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {d.imbalance.map((imb, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-rose-400 text-[10px]">⚠️</span> {imb}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Remedy */}
                  <div className="p-3 mt-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-amber-300">Remedy:</strong> {d.remedy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Image Modal Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[85vh] aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-amber-500/40 shadow-2xl p-2 flex items-center justify-center"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/80 text-white hover:text-amber-400 transition-colors border border-white/20"
              >
                <X size={20} />
              </button>
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage}
                  alt="Enlarged Vastu Diagram"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Problem Diagnostic Tool */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Interactive Troubleshooter
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              Direction-Based Problem Diagnosis
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Identify real-world challenges and discover which specific directional zones require immediate balancing.
            </p>
          </div>

          {/* Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {diagnosticScenarios.map((diag) => {
              const Icon = diag.icon;
              const isSelected = activeDiagnostic === diag.id;
              return (
                <button
                  key={diag.id}
                  onClick={() => setActiveDiagnostic(diag.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'gold-gradient-bg text-slate-950 shadow-lg scale-105'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  <span>{diag.title}</span>
                </button>
              );
            })}
          </div>

          {/* Diagnostic Card Display */}
          <div className="mt-8">
            {diagnosticScenarios
              .filter((d) => d.id === activeDiagnostic)
              .map((active) => (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white">{active.title}</h3>
                      <p className="text-xs sm:text-sm text-rose-400 mt-1 flex items-center gap-1.5 font-medium">
                        <AlertTriangle size={14} /> Symptoms: {active.problem}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {active.targetDirections.map((dir, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold"
                        >
                          Check: {dir}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <HelpCircle size={15} /> Vastu Root Cause Analysis
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{active.insights}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={15} /> Corrective Action Plan
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">{active.actionPlan}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* The 3 Master Pillars (KEY INSIGHT) */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-2xl text-center space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                🔥 Key Astrological Insight
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white pt-2">
                The 3 Golden Pillars of Life Harmony
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                If these three cardinal zones are balanced, personal stability, mental clarity, and wealth flow improve dramatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-2xl mb-1">🪨</div>
                <h3 className="text-base font-bold text-yellow-400">Southwest = Stability</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The immovable foundation of personal life, relationships, and long-term health.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-2xl mb-1">🕉️</div>
                <h3 className="text-base font-bold text-indigo-400">Northeast = Clarity</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The head of consciousness providing vision, sound decision-making, and divine grace.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-2xl mb-1">💰</div>
                <h3 className="text-base font-bold text-emerald-400">North = Wealth</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The active flow of financial abundance, income streams, and expanding opportunities.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-amber-300 italic">
              &quot;Each direction governs a specific aspect of life — when balanced, it supports complete harmony, stability, and growth.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Educational Content Container (Admin CMS Integration) */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-10">
        <DynamicPageContent pageId="remedies-vastu" sectionPlacement="educational" />
      </div>

      {/* Service Report Form */}
      <ServiceReportForm
        titleText="Get Your Complete"
        highlightText="Vastu Consultation Report"
        subtitle="Enter your property & birth details for a personalized 8-direction analysis with remedial placements"
        buttonText="Unlock Full Vastu Analysis"
        Icon={Compass}
        serviceId="svc-vastu"
        premiumInfo="Full report with specific directional remedies, color recommendations, and room-by-room corrections requires Premium membership"
      />

      {/* Classical Astrological Advisory Disclaimer */}
      <section className="py-10 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-2">
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
            <strong>Advisory Note:</strong> The above guidance is based on classical Vedic astrological &amp; Vastu Shastra principles. Astrology (Graha) governs planetary timing &amp; karma, while Vāstu governs your immediate living environment. For personalized recommendations tailored to your birth chart and property layout, we strongly recommend consulting a certified AstroParihar astrologer.
          </p>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Harmonize Your <span className="text-gradient-gold">Living &amp; Working Space</span>
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto text-sm sm:text-base">
            Get an interactive 8-directional Vastu analysis with room-by-room non-demolition remedies.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="#get-report"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold gold-gradient-bg text-slate-950 hover:opacity-90 transition-all gold-shadow text-sm"
            >
              <Compass size={18} /> Get Vastu Analysis
            </Link>
            <Link
              href="/talk-to-astrologer"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all text-sm"
            >
              Talk to Vastu Astrologer <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
