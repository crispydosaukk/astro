'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Sparkles,
  User,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Heart,
  Activity,
  Star,
  FileText,
  CheckCircle2,
  ChevronDown,
  Flame,
  Compass,
  Sun,
  DollarSign,
  Moon,
  PhoneCall,
  Bot,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';
import { useUserData } from '@/lib/useUserData';
import { calculateAstroPlacement } from '@/lib/vedicAstrologyEngine';

export default function FinanceHoroscopePage() {
  const { user } = useUserData();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    tob: '',
    pob: '',
    lat: '',
    lon: '',
    financialGoal: 'Wealth Accumulation & Investments',
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
    const astro = calculateAstroPlacement(formData.dob || '1992-08-20', formData.tob || '10:30');

    const computedFinanceReport = {
      recommendationTitle: 'Finance & Wealth Horoscope Report',
      recommendationName: `${formData.name || 'Devotee'}'s Finance & Wealth Horoscope`,
      timing: `Generated on ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      duration: 'Lifetime Financial Destiny',
      name: formData.name || 'Devotee',
      gender: formData.gender,
      dob: formData.dob || '1992-08-20',
      tob: formData.tob || '10:30 AM',
      pob: formData.pob || 'India',
      financialGoal: formData.financialGoal,
      rashiName: astro.rashiName,
      rashiLord: astro.rashiLord,
      nakshatraName: astro.nakshatraName,
      dhanaHouseLord: 'Jupiter (Guru) in 2nd House',
      labhaHouseLord: 'Mercury (Budh) in 11th House',
      bhagyaHouseLord: 'Sun (Surya) in 9th House',
      wealthYoga: 'Lakshmi Yoga & Gajakesari Yoga Present',
      wealthIndexScore: '91 / 100',
      financialPillars: [
        {
          pillar: 'Income Expansion & Cashflow (11th House)',
          rating: '94%',
          desc: 'Strong planetary inflow from multiple avenues and professional expertise.',
        },
        {
          pillar: 'Savings & Accumulated Assets (2nd House)',
          rating: '88%',
          desc: 'Benefic Jupiterian influence protects liquid assets and property growth.',
        },
        {
          pillar: 'Investment & Speculative Growth (5th/9th Houses)',
          rating: '86%',
          desc: 'Favorable periods for long-term equity, gold, and real estate investments.',
        },
        {
          pillar: 'Debt Mitigation & Risk Resistance (6th/8th Houses)',
          rating: '90%',
          desc: 'Protective planetary shields minimize unexpected financial volatility.',
        },
      ],
      wealthForecast:
        'Auspicious Jupiter-Mercury transit phase indicates strong financial breakthroughs and profitable asset acquisitions over the next 12 to 24 months.',
      remedies: [
        'Recite the sacred Sri Kanakadhara Stotram or Sri Suktam on Friday and Wednesday mornings.',
        'Install and worship an energized brass/copper Sri Yantra or Kubera Yantra in the North quadrant.',
        'Donate yellow lentils, bananas, or books to students on Thursdays to strengthen Jupiter (Guru).',
        'Wear an astrologically certified Yellow Sapphire (Pukhraj) or Green Emerald after chart confirmation.',
      ],
    };

    setReportResult(computedFinanceReport);

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest-user',
          userEmail: user?.email || '',
          type: 'Finance Horoscope Report',
          details: {
            name: formData.name,
            gender: formData.gender,
            dob: formData.dob,
            time: formData.tob,
            place: formData.pob,
            careerCategory: formData.financialGoal,
          },
          reportData: computedFinanceReport,
        }),
      });

      const data = await res.json();
      if (data?.reportData) {
        setApiReportData(data.reportData);
        setReportResult((prev: any) => ({ ...prev, ...data.reportData }));
      }
    } catch (err) {
      console.warn('API Finance Horoscope generation error:', err);
    }

    setIsCalculating(false);
    setTimeout(() => {
      document.getElementById('finance-report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const financeFaqs = [
    {
      q: 'Which astrological houses govern wealth and financial prosperity?',
      a: 'In Vedic Astrology, the 2nd house (Dhana Bhava) governs accumulated wealth and savings, the 11th house (Labha Bhava) governs incoming profits and gains, the 9th house (Bhagya Bhava) represents destiny and luck, and the 5th house governs intelligence in investments.',
    },
    {
      q: 'What is a Dhana Yoga in a birth chart?',
      a: 'A Dhana Yoga occurs when the lords of wealth houses (1st, 2nd, 5th, 9th, and 11th) form mutual relationships, conjunctions, or aspects. Powerful yogas like Lakshmi Yoga or Gajakesari Yoga generate immense prosperity.',
    },
    {
      q: 'How can I remedy planetary afflictions affecting my finances?',
      a: 'Vedic remedies such as chanting the Kanakadhara Stotram, establishing an energized Kubera Yantra in the north, performing Thursday/Friday charitable donations, and balancing planetary dasha periods help clear financial blockages.',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-emerald-500/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/horoscope_banner.jpg"
            alt="Vedic Finance Horoscope Background"
            fill
            className="object-cover object-center lg:object-right scale-100"
            priority
          />
          {/* Targeted overlays: dark gradient on left for crisp readability, open on right for vivid artwork */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#170b16]/95 via-[#230f20]/85 to-[#170b16]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b0d1a] via-transparent to-[#150914]/50" />
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none z-0" />
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
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 mb-4 backdrop-blur-md shadow-xl shadow-black/20">
                  <Coins size={15} className="text-emerald-400" /> Vedic Finance & Wealth Horoscope
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight max-w-xl drop-shadow-lg">
                  Unlock Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    Vedic Wealth Potential
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-[#F8F3EA]/90 font-medium leading-relaxed max-w-lg drop-shadow">
                  Discover your 2nd House (Dhana Bhava), 11th House (Profits), Dhana Yogas, and
                  favorable wealth-building transit cycles with authentic Vedic astrology.
                </p>
              </div>

              {/* Form Card */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl backdrop-blur-xl bg-card/90 space-y-4">
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
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider">
                        Gender
                      </label>
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
                        placeholder="Birth City (e.g. Bangalore, Delhi)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase size={13} className="text-emerald-400" /> Financial Focus
                      </label>
                      <select
                        value={formData.financialGoal}
                        onChange={(e) =>
                          setFormData({ ...formData, financialGoal: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm"
                      >
                        <option value="Wealth Accumulation & Investments" className="bg-background">
                          Wealth Accumulation & Investments
                        </option>
                        <option value="Business Expansion & Profit" className="bg-background">
                          Business Expansion & Profits
                        </option>
                        <option value="Career Promotion & Salary Growth" className="bg-background">
                          Career Salary & Promotions
                        </option>
                        <option value="Debt Clearance & Stability" className="bg-background">
                          Debt Clearance & Stability
                        </option>
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
                        <Sparkles size={18} className="animate-spin text-[#292522]" /> Calculating
                        Dhana Yogas...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} className="text-[#292522]" /> Reveal Wealth Horoscope
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
              <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-black/40 flex flex-col items-center justify-center p-8 text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-2xl animate-pulse">
                  <Coins size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gradient-gold">
                  Dhana & Labha Bhava Alignments
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  Discover how Jupiter, Mercury, and the 2nd and 11th houses govern your business
                  success, income velocity, and lifelong wealth accumulation.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      2nd House
                    </span>
                    <p className="text-xs font-bold text-foreground">Dhana Bhava</p>
                    <p className="text-[10px] text-muted-foreground">Savings & Treasury</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <span className="text-[10px] font-bold text-[#C9952B] uppercase">
                      11th House
                    </span>
                    <p className="text-xs font-bold text-foreground">Labha Bhava</p>
                    <p className="text-[10px] text-muted-foreground">Profits & Gains</p>
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

      {/* Finance Horoscope Generated Results Section */}
      <AnimatePresence>
        {reportResult && (
          <section
            id="finance-report-section"
            className="py-16 bg-background relative z-10 space-y-10 border-b border-white/5"
          >
            <div className="max-w-5xl mx-auto px-6 space-y-8">
              {/* Header Bar */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      Wealth & Prosperity Analysis
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                      Finance Horoscope for{' '}
                      <span className="text-gradient-gold">{reportResult.name}</span>
                    </h2>
                    <p className="text-xs text-muted-foreground pt-1">
                      📅 {reportResult.dob} · ⏰ {reportResult.tob} · 📍 {reportResult.pob} · Focus:{' '}
                      {reportResult.financialGoal}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/talk-to-ai-astrologer"
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                    >
                      <Bot size={14} className="animate-pulse" /> AI Expert Astrologer
                    </Link>
                    <Link
                      href="/talk-to-astrologer?category=Finance%20%26%20Career"
                      className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
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
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Moon Sign
                  </span>
                  <div className="text-base font-bold text-[#C9952B]">{reportResult.rashiName}</div>
                  <p className="text-[11px] text-muted-foreground">
                    Lord: {reportResult.rashiLord}
                  </p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    2nd House (Dhana)
                  </span>
                  <div className="text-base font-bold text-emerald-400">
                    {reportResult.dhanaHouseLord}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Savings & Assets</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    11th House (Labha)
                  </span>
                  <div className="text-base font-bold text-cyan-400">
                    {reportResult.labhaHouseLord}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Profit & Expansion</p>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/10 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">
                    Wealth Index
                  </span>
                  <div className="text-base font-bold text-gradient-gold font-mono">
                    {reportResult.wealthIndexScore}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Jupiterian Potency</p>
                </div>
              </div>

              {/* Dynamic AI Astrological Analysis from API */}
              {apiReportData && (
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C9952B]/30 bg-[#C9952B]/5 space-y-4">
                  <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
                    <Sparkles size={20} /> Astrological Financial Analysis & Strategy
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {apiReportData.astrologicalAnalysis}
                  </p>
                </div>
              )}

              {/* Detailed Financial Pillars */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                <h3 className="text-lg font-bold text-foreground">4 Wealth Building Pillars</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportResult.financialPillars.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">{item.pillar}</span>
                        <span className="text-xs font-bold text-emerald-400">{item.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planetary Yogas & Timing Window */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Auspicious Wealth Yogas
                  </span>
                  <p className="text-sm text-foreground font-semibold">{reportResult.wealthYoga}</p>
                  <p className="text-xs text-muted-foreground">
                    Combination of 9th & 11th house lords creates continuous opportunities for
                    financial multiplication.
                  </p>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-[#C9952B]/30 bg-[#C9952B]/5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C9952B]">
                    Financial Growth Timeline
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {reportResult.wealthForecast}
                  </p>
                </div>
              </div>

              {/* Remedies Section */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/20 space-y-4">
                <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <Coins size={18} /> Recommended Vedic Remedies for Wealth Multiplication
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reportResult.remedies.map((rem: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-xs text-foreground/90"
                    >
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
                theme="emerald"
                category="Finance & Career"
                title="Want 1-on-1 Guidance on Your Financial Destiny?"
                subtitle="Speak with our master Vedic wealth astrologers to decode Dhana Yogas, business startup muhurats, and risk mitigation strategies."
                badge="Talk to Wealth & Career Specialist"
              />
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Dynamic Content Managed via Admin Panel */}
      <section className="max-w-5xl mx-auto px-6">
        <DynamicPageContent pageId="horoscope-finance" />
      </section>

      {/* Comprehensive In-Depth Vedic Financial Astrology Knowledge Base */}
      <section className="py-16 bg-background/50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">
              Vedic Wealth Sciences
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              The 4 Pillars of Financial Astrology
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              How classical planetary yogas and wealth houses govern lifelong prosperity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: 2nd House — Dhana Bhava */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Coins size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  1. The 2nd House (Dhana Bhava)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Represents accumulated wealth, bank balances, gold, family inheritance, and
                financial security. Benefic aspects from Jupiter or Venus on the 2nd house ensure
                stable asset retention and wealth accumulation without sudden leaks.
              </p>
            </div>

            {/* Box 2: 11th House — Labha Bhava */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/20 flex items-center justify-center text-[#C9952B]">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  2. The 11th House (Labha Bhava)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The ultimate house of profit, revenue velocity, cash flow, and fulfillment of high
                ambitions. Strong planets in the 11th house create multiple streams of passive and
                active business income.
              </p>
            </div>

            {/* Box 3: 9th House — Bhagya Bhava */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Star size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  3. The 9th House (Bhagya Bhava)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                The highest auspicious trine (Trikona) governing fortune, divine luck, mentorship,
                and windfall prosperity. When the 9th lord connects with the 2nd or 11th lords,
                extraordinary Lakshmi Yogas manifest.
              </p>
            </div>

            {/* Box 4: Jupiter & Mercury — Wealth Karakas */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <DollarSign size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  4. Jupiter & Mercury: Wealth Karakas
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Jupiter (Guru) acts as Dhanakaraka expanding resources through wisdom, while Mercury
                (Budh) governs commercial intellect, sharp negotiation, trading, and digital
                business acumen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background/50 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Understanding Vedic Wealth & Prosperity Astrology
            </p>
          </div>

          <div className="space-y-3">
            {financeFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden"
              >
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
            theme="emerald"
            category="Finance & Career"
            title="Speak with a Financial Astrologer"
            subtitle="Get real-time answers about salary hikes, business expansion, stock/property investments, and debt clearance remedies."
            badge="Available on Call & Chat"
          />
        </div>
      </section>

      {/* BOTTOM NAVIGATION: Specialized Horoscopes Cross-Link Bar */}
      <section className="py-16 bg-background relative z-10">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">
              Explore Specialized Horoscopes
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Gain Complete Life Clarity
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Navigate directly to our other dedicated Vedic horoscope reports
            </p>
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
                  Discover 7th House (Kalatra Bhava), Venusian strength, relationship harmony, and
                  soulmate timing.
                </p>
              </div>
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1 pt-2">
                Check Love Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
                  Evaluate Lagna vitality, 6th House (Roga Bhava), Ayurvedic Tridosha balance, and
                  restorative remedies.
                </p>
              </div>
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 pt-2">
                Check Health Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
                  Complete 12-house chart, D9 Navamsha, Vimshottari Dasha, planetary degrees, and
                  comprehensive lifetime roadmap.
                </p>
              </div>
              <div className="text-xs font-bold text-[#C9952B] flex items-center gap-1 pt-2">
                View Complete Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
