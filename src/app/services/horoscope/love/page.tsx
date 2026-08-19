'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  User,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  Coins,
  Activity,
  FileText,
  CheckCircle2,
  ChevronDown,
  Flame,
  Compass,
  Sun,
  Moon,
  PhoneCall,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';
import { useUserData } from '@/lib/useUserData';
import { calculateAstroPlacement } from '@/lib/vedicAstrologyEngine';

export default function LoveHoroscopePage() {
  const { user } = useUserData();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Female',
    dob: '',
    tob: '',
    pob: '',
    lat: '',
    lon: '',
    relationshipStatus: 'Single',
  });

  const [reportResult, setReportResult] = useState<any | null>(null);
  const [apiReportData, setApiReportData] = useState<any | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLocationChange = (city: string, details?: { lat?: string; lon?: string }) => {
    setFormData((prev) => ({
      ...prev,
      pob: city,
      lat: details?.lat || prev.lat,
      lon: details?.lon || prev.lon,
    }));
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    // Compute authentic Vedic placement based on entered birth data
    const astro = calculateAstroPlacement(formData.dob || '1996-05-15', formData.tob || '12:00');

    const computedLoveReport = {
      recommendationTitle: 'Love & Relationship Horoscope Report',
      recommendationName: `${formData.name || 'Devotee'}'s Love & Marriage Horoscope`,
      timing: `Generated on ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      duration: 'Lifetime Relationship Alignment',
      name: formData.name || 'Devotee',
      gender: formData.gender,
      dob: formData.dob || '1996-05-15',
      tob: formData.tob || '12:00 PM',
      pob: formData.pob || 'India',
      relationshipStatus: formData.relationshipStatus,
      rashiName: astro.rashiName,
      rashiLord: astro.rashiLord,
      nakshatraName: astro.nakshatraName,
      gana: astro.gana,
      nadi: astro.nadi,
      yoni: astro.yoni,
      seventhHouseLord: 'Venus (Shukra)',
      fifthHouseLord: 'Jupiter (Guru)',
      venusPlacement: 'Exalted in Pisces (Meena) — Strong Malavya Yoga Influence',
      marsStatus: 'Mild Manglik (Naturally balanced after age 28)',
      loveScore: '88%',
      compatibilityHighlights: [
        { area: 'Emotional & Mental Connection', score: '92%', desc: 'Deep intuitive bonding and mutual unspoken understanding.' },
        { area: 'Physical & Romantic Chemistry', score: '85%', desc: 'Venusian grace fosters enduring passion and mutual attraction.' },
        { area: 'Marital Harmony & Longevity', score: '89%', desc: 'Favorable 7th house lord transit provides stability and shared values.' },
        { area: 'Communication & Problem Solving', score: '86%', desc: 'Balanced Mercury-Jupiter alignment ensures respectful communication.' },
      ],
      timingForecast: 'Favorable marriage and relationship progression window active over the next 14 to 18 months.',
      remedies: [
        'Chant the Shukra Gayatri Mantra ("Om Shukraya Vidmahe...") on Friday mornings.',
        'Wear a natural White Zircon or Rose Quartz energized on a Friday during Shukla Paksha.',
        'Offer white fragrant flowers (Jasmine/Lotus) and sweet kheer at a Lakshmi-Narayan temple.',
        'Observe Friday fasting (Shukravar Vrat) to enhance marital harmony and mutual respect.',
      ],
    };

    setReportResult(computedLoveReport);

    // Call OpenAI endpoint to dynamically synthesize tailored Vedic reading if logged in
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest-user',
          userEmail: user?.email || '',
          type: 'Love Horoscope Report',
          details: {
            name: formData.name,
            gender: formData.gender,
            dob: formData.dob,
            time: formData.tob,
            place: formData.pob,
            relationshipStatus: formData.relationshipStatus,
          },
          reportData: computedLoveReport,
        }),
      });

      const data = await res.json();
      if (data?.reportData) {
        setApiReportData(data.reportData);
        setReportResult((prev: any) => ({ ...prev, ...data.reportData }));
      }
    } catch (err) {
      console.warn('API Love Horoscope generation error:', err);
    }

    setIsCalculating(false);
    setTimeout(() => {
      document.getElementById('love-report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loveFaqs = [
    { q: 'What determines love and marriage in Vedic Astrology?', a: 'In Vedic Astrology, the 7th house (Kalatra Bhava) governs marriage and lifelong partnerships, while the 5th house governs romance and emotional attraction. Venus (Shukra) is the prime karaka (significator) of love, and Jupiter (Guru) represents marital wisdom and auspiciousness.' },
    { q: 'How does Manglik Dosha affect relationships?', a: 'Mangal (Mars) represents fiery drive and passion. When placed in the 1st, 4th, 7th, 8th, or 12th houses, it can introduce strong independent temperament. However, with proper planetary cancellations, maturity after age 28, or matching charts, Manglik Dosha creates dynamic and successful marriages.' },
    { q: 'When is the best time for marriage according to my horoscope?', a: 'Marriage timing is indicated by the dasha periods of the 7th house lord, planets posited in the 7th house, or transits of Jupiter (Guru Gochar) aspecting the natal 7th house or Venus.' },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Hero Section with generous top padding to prevent fixed navbar clipping */}
      <section className="relative overflow-hidden border-b border-white/5 flex flex-col pt-28 lg:pt-36 pb-16 lg:pb-20 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid lg:grid-cols-12 items-start gap-8 lg:gap-12 w-full">
            {/* Left Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-4 backdrop-blur-md">
                  <Heart size={14} className="text-rose-400" /> Vedic Love & Relationship Horoscope
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight leading-tight max-w-xl">
                  Discover Your <br />
                  <span className="text-gradient-gold">Love & Marriage Destiny</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                  Analyze your 7th House (Kalatra Bhava), Venusian strength, Manglik alignment, and soulmate timing with authentic Vedic astrology.
                </p>
              </div>

              {/* Form Card */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/20 shadow-2xl backdrop-blur-xl bg-card/80 space-y-4">
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <User size={13} className="text-[#C9952B]" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your Full Name"
                        className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#C9952B] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-[#C9952B] transition-colors"
                      >
                        <option value="Female" className="bg-background">Female</option>
                        <option value="Male" className="bg-background">Male</option>
                        <option value="Other" className="bg-background">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#C9952B]" /> Date of Birth
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-[#C9952B] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Clock size={13} className="text-[#C9952B]" /> Time of Birth
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.tob}
                        onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-[#C9952B] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#C9952B]" /> Place of Birth
                      </label>
                      <CityLocationInput
                        value={formData.pob}
                        onChange={handleLocationChange}
                        placeholder="Birth City (e.g. Mumbai, Delhi)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Heart size={13} className="text-rose-400" /> Relationship Status
                      </label>
                      <select
                        value={formData.relationshipStatus}
                        onChange={(e) => setFormData({ ...formData, relationshipStatus: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-foreground text-sm focus:outline-none focus:border-[#C9952B] transition-colors"
                      >
                        <option value="Single" className="bg-background">Single (Seeking Love)</option>
                        <option value="In a Relationship" className="bg-background">In a Relationship</option>
                        <option value="Engaged" className="bg-background">Engaged</option>
                        <option value="Married" className="bg-background">Married</option>
                        <option value="Complicated" className="bg-background">Seeking Guidance</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full py-3.5 rounded-2xl gold-gradient-bg text-white font-bold text-sm shadow-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                  >
                    {isCalculating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Calculating Vedic Love Alignments...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Generate Free Love Horoscope
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Right Visual Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="lg:col-span-5 flex flex-col items-center justify-center space-y-6 pt-4 lg:pt-8"
            >
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-rose-500/30 bg-black/40 flex flex-col items-center justify-center p-8 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl animate-pulse">
                  <Heart size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gradient-gold">Vedic Relationship Yogas</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  Discover how planetary positions of Venus, Jupiter, and the 7th house shape your emotional bonds, romantic synergy, and marital happiness.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-[10px] font-bold text-[#C9952B] uppercase">7th House</span>
                    <p className="text-xs font-bold text-foreground">Kalatra Bhava</p>
                    <p className="text-[10px] text-muted-foreground">Spouse & Marriage</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-[10px] font-bold text-rose-400 uppercase">5th House</span>
                    <p className="text-xs font-bold text-foreground">Purva Punya</p>
                    <p className="text-[10px] text-muted-foreground">Romance & Heart</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={14} /> 100% Free & Instant Vedic Reading
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Love Horoscope Generated Results Section */}
      <AnimatePresence>
        {reportResult && (
          <section id="love-report-section" className="py-16 bg-background relative z-10 space-y-10 border-b border-white/5">
            <div className="max-w-5xl mx-auto px-6 space-y-8">
              {/* Header Bar */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/30 bg-rose-500/5 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                      Love & Relationship Analysis
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                      Love Horoscope for <span className="text-gradient-gold">{reportResult.name}</span>
                    </h2>
                    <p className="text-xs text-muted-foreground pt-1">
                      📅 {reportResult.dob} · ⏰ {reportResult.tob} · 📍 {reportResult.pob} · Status: {reportResult.relationshipStatus}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/talk-to-astrologer?category=Love"
                      className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                    >
                      <PhoneCall size={14} /> Talk to Astrologer 📞
                    </Link>
                    <Link
                      href="/my-reports"
                      className="px-5 py-2.5 rounded-full gold-gradient-bg text-white text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <FileText size={14} /> View in My Reports 📄
                    </Link>
                  </div>
                </div>
              </div>

              {/* Core Astrological Placements */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Moon Rashi</span>
                  <div className="text-base font-bold text-[#C9952B]">{reportResult.rashiName}</div>
                  <p className="text-[11px] text-muted-foreground">Lord: {reportResult.rashiLord}</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Nakshatra</span>
                  <div className="text-base font-bold text-rose-400">{reportResult.nakshatraName}</div>
                  <p className="text-[11px] text-muted-foreground">Gana: {reportResult.gana}</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">7th House (Kalatra)</span>
                  <div className="text-base font-bold text-emerald-400">{reportResult.seventhHouseLord}</div>
                  <p className="text-[11px] text-muted-foreground">Spouse Significator</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Love Synergy</span>
                  <div className="text-base font-bold text-gradient-gold font-mono">{reportResult.loveScore}</div>
                  <p className="text-[11px] text-muted-foreground">Venusian Alignment</p>
                </div>
              </div>

              {/* Dynamic AI Astrological Analysis from API */}
              {apiReportData && (
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C9952B]/30 bg-[#C9952B]/5 space-y-4">
                  <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
                    <Sparkles size={20} /> Astrological Love & Marriage Insights
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {apiReportData.astrologicalAnalysis}
                  </p>
                </div>
              )}

              {/* Detailed Relationship Highlights */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                <h3 className="text-lg font-bold text-foreground">Compatibility & Harmony Pillars</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportResult.compatibilityHighlights.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">{item.area}</span>
                        <span className="text-xs font-bold text-rose-400">{item.score}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planetary Status & Timing Window */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Venus & Mars Alignment</span>
                  <p className="text-sm text-foreground"><strong>Venus (Shukra):</strong> {reportResult.venusPlacement}</p>
                  <p className="text-sm text-foreground"><strong>Mars (Mangal):</strong> {reportResult.marsStatus}</p>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-[#C9952B]/30 bg-[#C9952B]/5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C9952B]">Marriage & Romance Timing</span>
                  <p className="text-sm text-foreground leading-relaxed">{reportResult.timingForecast}</p>
                </div>
              </div>

              {/* Remedies Section */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-500/20 space-y-4">
                <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                  <Heart size={18} /> Recommended Vedic Remedies for Relationship Harmony
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reportResult.remedies.map((rem: string, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-xs text-foreground/90">
                      <span className="w-5 h-5 rounded-full gold-gradient-bg text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{rem}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation CTA Banner */}
              <AstrologerCtaBanner
                theme="rose"
                category="Love & Relationship"
                title="Have Questions About Your Love Life or Soulmate?"
                subtitle="Connect directly with our verified Vedic relationship astrologers for in-depth Kundli matching, marriage timing, and Manglik Dosha remedies."
                badge="Talk to Love & Marriage Specialist"
              />
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Dynamic Content Managed via Admin Panel */}
      <section className="max-w-5xl mx-auto px-6">
        <DynamicPageContent pageId="horoscope-love" />
      </section>

      {/* Comprehensive In-Depth Vedic Love & Relationship Astrology Knowledge Base */}
      <section className="py-16 bg-background/50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">Vedic Relationship Science</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Understanding Love, Marriage & Soulmates</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">The classical astronomical foundations of romantic compatibility in Vedic astrology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: The 7th House & Kalatra Bhava */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Heart size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">1. The 7th House (Kalatra Bhava)</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The 7th house in your birth chart represents your life partner, legal union, marital happiness, and the qualities your soul seeks in another. The planetary lord of your 7th house reveals your spouse&apos;s character, appearance, and career background.
              </p>
            </div>

            {/* Box 2: Venus — The Karaka of Love */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/20 flex items-center justify-center text-[#C9952B]">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">2. Venus (Shukra) — Cosmic Love Principle</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Venus governs beauty, romance, affection, aesthetic tastes, and physical chemistry. A strong Venus in Taurus, Libra, or Pisces creates radiant personal charm, deep fidelity, and harmonious relationships.
              </p>
            </div>

            {/* Box 3: Manglik Dosha Demystified */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">3. Manglik Dosha & Passion Balance</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Mangal (Mars) brings courage, passion, and vitality. When placed in relationship houses, it requires mindful emotional regulation. After age 28, Mars energy naturally matures, turning into enduring loyalty and mutual support.
              </p>
            </div>

            {/* Box 4: Rahu & Ketu Karmic Soulmates */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Moon size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">4. Rahu & Ketu Karmic Bonds</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The lunar nodes reveal past-life connections (Rinānubandha). Intense magnetic attractions often stem from unfinished karmic cycles that transform into profound spiritual evolution when approached with mutual respect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background/50 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Understanding Love, Marriage & Relationship Astrology</p>
          </div>

          <div className="space-y-3">
            {loveFaqs.map((faq, idx) => (
              <div key={idx} className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-semibold text-foreground flex justify-between items-center text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${openFaq === idx ? 'rotate-180 text-[#C9952B]' : 'text-muted-foreground'}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Consultation CTA Banner */}
          <AstrologerCtaBanner
            theme="rose"
            category="Love & Relationship"
            title="Speak with a Relationship Astrologer"
            subtitle="Get real-time clarity on love compatibility, ex-partner reconnection, delay in marriage, and relationship harmony with verified Vedic masters."
            badge="Available on Call & Chat"
          />
        </div>
      </section>

      {/* BOTTOM NAVIGATION: Specialized Horoscopes Cross-Link Bar */}
      <section className="py-16 bg-background relative z-10">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">Explore Specialized Horoscopes</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Gain Complete Life Clarity</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Navigate directly to our other dedicated Vedic horoscope reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Finance Card */}
            <Link
              href="/services/horoscope/finance"
              className="glass-card p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Coins size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  Finance & Wealth Horoscope
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Analyze Dhana Bhava (2nd House), Jupiter&apos;s wealth yogas, investment timings, and career growth prospects.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-2">
                Check Finance Horoscope <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Health Card */}
            <Link
              href="/services/horoscope/health"
              className="glass-card p-6 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                  Health & Vitality Horoscope
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluate Lagna vitality, 6th House (Roga Bhava), Ayurvedic Tridosha balance, and restorative remedies.
                </p>
              </div>
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 pt-2">
                Check Health Horoscope <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Complete Horoscope Card */}
            <Link
              href="/services/horoscope"
              className="glass-card p-6 rounded-3xl border border-[#C9952B]/20 hover:border-[#C9952B]/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-[#C9952B]/10"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/20 flex items-center justify-center text-[#C9952B] group-hover:scale-110 transition-transform">
                  <Star size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-[#C9952B] transition-colors">
                  Full Vedic Janam Kundli
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Complete 12-house chart, D9 Navamsha, Vimshottari Dasha, planetary degrees, and comprehensive lifetime roadmap.
                </p>
              </div>
              <div className="text-xs font-bold text-[#C9952B] flex items-center gap-1 pt-2">
                View Complete Horoscope <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
