'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Sparkles,
  User,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Heart,
  Coins,
  Star,
  FileText,
  CheckCircle2,
  ChevronDown,
  Sun,
  Flame,
  Moon,
  PhoneCall,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';
import { useUserData } from '@/lib/useUserData';
import { calculateAstroPlacement } from '@/lib/vedicAstrologyEngine';

export default function HealthHoroscopePage() {
  const { user } = useUserData();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    tob: '',
    pob: '',
    lat: '',
    lon: '',
    healthFocus: 'Immunity, Stamina & Energy',
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
    const astro = calculateAstroPlacement(formData.dob || '1990-11-10', formData.tob || '07:15');

    const computedHealthReport = {
      recommendationTitle: 'Health & Vitality Horoscope Report',
      recommendationName: `${formData.name || 'Devotee'}'s Health & Vitality Horoscope`,
      timing: `Generated on ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      duration: 'Lifetime Physical & Mental Vitality',
      name: formData.name || 'Devotee',
      gender: formData.gender,
      dob: formData.dob || '1990-11-10',
      tob: formData.tob || '07:15 AM',
      pob: formData.pob || 'India',
      healthFocus: formData.healthFocus,
      rashiName: astro.rashiName,
      rashiLord: astro.rashiLord,
      nakshatraName: astro.nakshatraName,
      lagnaLord: 'Mars (Mangal) in 1st House — High Natural Vitality',
      sixthHouseLord: 'Mercury (Budh) in 6th House',
      eighthHouseLord: 'Jupiter (Guru) Aspecting 8th House',
      ayurvedicDosha: 'Pitta-Vata Balanced Constitution',
      vitalityIndexScore: '89 / 100',
      healthPillars: [
        { pillar: 'Natural Immunity & Ojas (1st House)', rating: '92%', desc: 'Robust physical stamina and strong recovery resilience against acute seasonal changes.' },
        { pillar: 'Metabolic Fire & Digestion (Agni / 6th House)', rating: '87%', desc: 'Balanced digestive agni; maintaining regular meal times prevents acidity spikes.' },
        { pillar: 'Mental Equilibrium & Nervous System (Chandra / 4th House)', rating: '85%', desc: 'Benefic lunar alignment promotes emotional clarity; morning pranayama supports stress relief.' },
        { pillar: 'Cellular Rejuvenation & Longevity (8th House)', rating: '91%', desc: 'Favorable Jupiterian protection supports cellular detoxification and long-term vitality.' },
      ],
      vitalityForecast: 'Strong restorative planetary period ahead. Incorporating sunrise solar therapy and regular hydration optimizes stamina and mental tranquility over the next 18 months.',
      remedies: [
        'Chant the sacred Maha Mrityunjaya Mantra ("Om Tryambakam Yajamahe...") 108 times at sunrise.',
        'Offer fresh water (Surya Arghya) to the Sun in a pure copper vessel each morning.',
        'Drink water energized in a copper vessel overnight to balance Pitta and digestive metabolism.',
        'Wear a 5-Mukhi or 7-Mukhi Nepali Rudraksha energized with Shiva mantras for holistic protection.',
      ],
    };

    setReportResult(computedHealthReport);

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest-user',
          userEmail: user?.email || '',
          type: 'Health Horoscope Report',
          details: {
            name: formData.name,
            gender: formData.gender,
            dob: formData.dob,
            time: formData.tob,
            place: formData.pob,
            healthFocus: formData.healthFocus,
          },
          reportData: computedHealthReport,
        }),
      });

      const data = await res.json();
      if (data?.reportData) {
        setApiReportData(data.reportData);
        setReportResult((prev: any) => ({ ...prev, ...data.reportData }));
      }
    } catch (err) {
      console.warn('API Health Horoscope generation error:', err);
    }

    setIsCalculating(false);
    setTimeout(() => {
      document.getElementById('health-report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const healthFaqs = [
    { q: 'How does Vedic Astrology analyze health and well-being?', a: 'In Ayur-Jyotish (Medical Astrology), the 1st house (Lagna) represents overall vitality and physical constitution, the 6th house (Roga Bhava) identifies potential ailments and recovery capacity, the 8th house governs longevity, and the Sun and Moon govern physical energy and mental peace.' },
    { q: 'What are the Ayurvedic Tridoshas in a Horoscope?', a: 'The three constitutional doshas—Vata (Air/Ether), Pitta (Fire/Water), and Kapha (Water/Earth)—are determined by the zodiac signs and ruling planets prominent in your birth chart, guiding optimal diet, yoga, and lifestyle choices.' },
    { q: 'Can Vedic remedies help improve physical vitality?', a: 'Yes. Practices such as morning Surya Arghya, Maha Mrityunjaya Japa, wearing suitable energized Rudraksha beads, and timing medical treatments according to planetary muhuratas restore energetic balance and accelerate natural healing.' },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-cyan-500/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/horoscope_banner.jpg"
            alt="Vedic Health Horoscope Background"
            fill
            className="object-cover object-center lg:object-right scale-100"
            priority
          />
          {/* Targeted overlays: dark gradient on left for crisp readability, open on right for vivid artwork */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#170b16]/95 via-[#230f20]/85 to-[#170b16]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b0d1a] via-transparent to-[#150914]/50" />
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/15 blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid lg:grid-cols-12 items-start gap-8 lg:gap-12 w-full">
            {/* Left Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 mb-4 backdrop-blur-md shadow-xl shadow-black/20">
                  <Activity size={15} className="text-cyan-400" /> Vedic Health & Vitality Horoscope
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight max-w-xl drop-shadow-lg">
                  Nurture Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">Vedic Health & Vitality</span>
                </h1>
                <p className="text-base sm:text-lg text-[#F8F3EA]/90 font-medium leading-relaxed max-w-lg drop-shadow">
                  Analyze your Lagna vitality, 6th House (Roga Bhava), Ayurvedic Tridosha constitution, and restorative planetary remedies with authentic Vedic astrology.
                </p>
              </div>

              {/* Form Card */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl backdrop-blur-xl bg-card/90 space-y-4">
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <User size={13} className="text-[#C9952B]" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your Full Name"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D9C8] text-[#292522] placeholder:text-[#6B5E55]/60 text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#C9952B]" /> Date of Birth
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} className="text-[#C9952B]" /> Time of Birth
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.tob}
                        onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#C9952B]" /> Place of Birth
                      </label>
                      <CityLocationInput
                        value={formData.pob}
                        onChange={handleLocationChange}
                        placeholder="Birth City (e.g. Pune, Delhi)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <Activity size={13} className="text-cyan-400" /> Health Focus
                      </label>
                      <select
                        value={formData.healthFocus}
                        onChange={(e) => setFormData({ ...formData, healthFocus: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm"
                      >
                        <option value="General Vitality">General Vitality & Stamina</option>
                        <option value="Immunity & Digestion">Immunity & Digestion</option>
                        <option value="Mental Peace & Stress">Mental Peace & Stress Relief</option>
                        <option value="Chronic Prevention">Ayurvedic Dosha Balance</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#C9952B]/30 cursor-pointer pt-3"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} className="animate-spin text-[#292522]" /> Calculating Health Vitality...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} className="text-[#292522]" /> Reveal Health Horoscope
                      </span>
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
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30 bg-black/40 flex flex-col items-center justify-center p-8 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-2xl animate-pulse">
                  <Activity size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gradient-gold">Ayur-Jyotish Vitality Analysis</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  Understand how the 1st House (Lagna), Sun, Moon, and 6th House determine your physical stamina, mental calm, and Ayurvedic Tridosha balance.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">1st House</span>
                    <p className="text-xs font-bold text-foreground">Lagna Bhava</p>
                    <p className="text-[10px] text-muted-foreground">Vitality & Ojas</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">6th House</span>
                    <p className="text-xs font-bold text-foreground">Roga Bhava</p>
                    <p className="text-[10px] text-muted-foreground">Immunity & Defense</p>
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

      {/* Health Horoscope Generated Results Section */}
      <AnimatePresence>
        {reportResult && (
          <section id="health-report-section" className="py-16 bg-background relative z-10 space-y-10 border-b border-white/5">
            <div className="max-w-5xl mx-auto px-6 space-y-8">
              {/* Header Bar */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/5 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                      Ayur-Jyotish & Vitality Analysis
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                      Health Horoscope for <span className="text-gradient-gold">{reportResult.name}</span>
                    </h2>
                    <p className="text-xs text-muted-foreground pt-1">
                      📅 {reportResult.dob} · ⏰ {reportResult.tob} · 📍 {reportResult.pob} · Focus: {reportResult.healthFocus}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/talk-to-astrologer?category=Health%20%26%20Vitality"
                      className="px-5 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
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
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Moon Sign</span>
                  <div className="text-base font-bold text-[#C9952B]">{reportResult.rashiName}</div>
                  <p className="text-[11px] text-muted-foreground">Lord: {reportResult.rashiLord}</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Ayurvedic Dosha</span>
                  <div className="text-base font-bold text-cyan-400">{reportResult.ayurvedicDosha}</div>
                  <p className="text-[11px] text-muted-foreground">Body Constitution</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Lagna Vitality</span>
                  <div className="text-base font-bold text-emerald-400">High Stamina</div>
                  <p className="text-[11px] text-muted-foreground">1st House Strength</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Vitality Index</span>
                  <div className="text-base font-bold text-gradient-gold font-mono">{reportResult.vitalityIndexScore}</div>
                  <p className="text-[11px] text-muted-foreground">Ojas & Immunity</p>
                </div>
              </div>

              {/* Dynamic AI Astrological Analysis from API */}
              {apiReportData && (
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C9952B]/30 bg-[#C9952B]/5 space-y-4">
                  <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
                    <Sparkles size={20} /> Astrological Health & Wellness Insights
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {apiReportData.astrologicalAnalysis}
                  </p>
                </div>
              )}

              {/* Detailed Health Pillars */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                <h3 className="text-lg font-bold text-foreground">4 Vitality & Health Pillars</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportResult.healthPillars.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">{item.pillar}</span>
                        <span className="text-xs font-bold text-cyan-400">{item.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planetary Health Status & Forecast */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Lagna & Roga Bhava Alignments</span>
                  <p className="text-sm text-foreground"><strong>1st House (Vitality):</strong> {reportResult.lagnaLord}</p>
                  <p className="text-sm text-foreground"><strong>6th House (Immunity):</strong> {reportResult.sixthHouseLord}</p>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-[#C9952B]/30 bg-[#C9952B]/5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C9952B]">Vitality & Healing Timeline</span>
                  <p className="text-sm text-foreground leading-relaxed">{reportResult.vitalityForecast}</p>
                </div>
              </div>

              {/* Remedies Section */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/20 space-y-4">
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <Activity size={18} /> Recommended Vedic Remedies for Health & Long Life
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
                theme="cyan"
                category="Health & Vitality"
                title="Seeking Astrological Remedies for Health & Wellness?"
                subtitle="Connect directly with certified Ayur-Jyotish experts to evaluate planetary afflictions, understand your Tridosha constitution, and receive personalized Maha Mrityunjaya healing guidance."
                badge="Talk to Ayur-Jyotish Specialist"
              />
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Dynamic Content Managed via Admin Panel */}
      <section className="max-w-5xl mx-auto px-6">
        <DynamicPageContent pageId="horoscope-health" />
      </section>

      {/* Comprehensive In-Depth Vedic Medical Astrology (Ayur-Jyotish) Knowledge Base */}
      <section className="py-16 bg-background/50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">Ayur-Jyotish Principles</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">The Vedic Foundations of Health & Longevity</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">How planetary alignments govern your immune vitality and constitutional balance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: 1st House — Lagna Vitality */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Activity size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">1. The 1st House (Lagna Bhava)</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Governs overall physical constitution, immune reserve (Ojas), head and brain vitality, and natural resilience. A strong Lagna lord acts as an unbreakable cosmic armor against chronic diseases.
              </p>
            </div>

            {/* Box 2: 6th House — Roga Bhava */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">2. The 6th House (Roga & Immunity)</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Identifies acute bodily ailments, digestive fires (Agni), bacterial/viral defenses, and recovery speeds. Benefic planetary placements here help eliminate toxins and quickly conquer health challenges.
              </p>
            </div>

            {/* Box 3: Sun & Moon — Core Prana */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/20 flex items-center justify-center text-[#C9952B]">
                  <Sun size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">3. Sun (Surya) & Moon (Chandra)</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sun governs the soul, eyesight, bone density, and heart vitality, while Moon rules fluids, sleep cycles, and mental tranquility. Balancing both through solar water therapy and pranayama ensures holistic harmony.
              </p>
            </div>

            {/* Box 4: Ayurvedic Tridoshas */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Flame size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">4. Ayurvedic Tridosha Alignment</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your birth rashi and ascendant reveal your dominant element: Vata (Air/Nervous system), Pitta (Fire/Metabolism), or Kapha (Earth/Fluid stability), guiding optimal dietary timing and herbal therapies.
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
            <p className="text-xs sm:text-sm text-muted-foreground">Understanding Ayur-Jyotish & Medical Astrology</p>
          </div>

          <div className="space-y-3">
            {healthFaqs.map((faq, idx) => (
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
            theme="cyan"
            category="Health & Vitality"
            title="Speak with a Health & Vitality Astrologer"
            subtitle="Get holistic clarity on recurring health patterns, surgery timing muhurats, mental tranquility, and dosha mitigation."
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
            {/* Love Card */}
            <Link
              href="/services/horoscope/love"
              className="glass-card p-6 rounded-3xl border border-rose-500/20 hover:border-rose-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-rose-500/10"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Heart size={24} />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-rose-400 transition-colors">
                  Love & Marriage Horoscope
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Discover 7th House (Kalatra Bhava), Venusian strength, relationship harmony, and soulmate timing.
                </p>
              </div>
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1 pt-2">
                Check Love Horoscope <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

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
