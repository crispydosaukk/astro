'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  User,
  MapPin,
  Clock,
  Moon,
  ArrowRight,
  FileText,
  PhoneCall,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';
import { useUserData } from '@/lib/useUserData';

export default function FreeFastingPlannerPage() {
  const { user } = useUserData();
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    tob: '',
    pob: '',
    rashi: 'Aries',
    gender: 'Male',
  });

  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [apiReportData, setApiReportData] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const rashiList = [
    {
      name: 'Aries (Mesha)',
      ruler: 'Mars',
      fastingDay: 'Tuesday (Mangalvar Vrat)',
      fastDeity: 'Lord Hanuman',
    },
    {
      name: 'Taurus (Vrishabha)',
      ruler: 'Venus',
      fastingDay: 'Friday (Shukravar Vrat)',
      fastDeity: 'Goddess Lakshmi',
    },
    {
      name: 'Gemini (Mithuna)',
      ruler: 'Mercury',
      fastingDay: 'Wednesday (Budhvar Vrat)',
      fastDeity: 'Lord Ganesha',
    },
    {
      name: 'Cancer (Karka)',
      ruler: 'Moon',
      fastingDay: 'Monday (Somvar Vrat)',
      fastDeity: 'Lord Shiva',
    },
    {
      name: 'Leo (Simha)',
      ruler: 'Sun',
      fastingDay: 'Sunday (Ravivar Vrat)',
      fastDeity: 'Lord Surya',
    },
    {
      name: 'Virgo (Kanya)',
      ruler: 'Mercury',
      fastingDay: 'Wednesday (Budhvar Vrat)',
      fastDeity: 'Lord Vishnu',
    },
    {
      name: 'Libra (Tula)',
      ruler: 'Venus',
      fastingDay: 'Friday (Shukravar Vrat)',
      fastDeity: 'Goddess Durga',
    },
    {
      name: 'Scorpio (Vrishchika)',
      ruler: 'Mars',
      fastingDay: 'Tuesday (Mangalvar Vrat)',
      fastDeity: 'Lord Kartikeya',
    },
    {
      name: 'Sagittarius (Dhanu)',
      ruler: 'Jupiter',
      fastingDay: 'Thursday (Guruvar Vrat)',
      fastDeity: 'Lord Vishnu / Dattatreya',
    },
    {
      name: 'Capricorn (Makara)',
      ruler: 'Saturn',
      fastingDay: 'Saturday (Shanivar Vrat)',
      fastDeity: 'Lord Shani / Hanuman',
    },
    {
      name: 'Aquarius (Kumbha)',
      ruler: 'Saturn',
      fastingDay: 'Saturday (Shanivar Vrat)',
      fastDeity: 'Lord Shani',
    },
    {
      name: 'Pisces (Meena)',
      ruler: 'Jupiter',
      fastingDay: 'Thursday (Guruvar Vrat)',
      fastDeity: 'Lord Brihaspati',
    },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const selectedRashiObj =
      rashiList.find((r) => r.name.toLowerCase().includes(formData.rashi.toLowerCase())) ||
      rashiList[0];

    const computedFasting = {
      recommendationTitle: 'Free Fasting Schedule Report',
      recommendationName: `${formData.fullName || 'Devotee'}'s Personalized Vedic Fasting & Vrat Planner`,
      timing: `${selectedRashiObj.fastingDay}`,
      duration: 'Weekly & Monthly Vrat Cycles',
      userName: formData.fullName || 'Devotee',
      rashi: selectedRashiObj.name,
      ruler: selectedRashiObj.ruler,
      weeklyFastingDay: selectedRashiObj.fastingDay,
      deity: selectedRashiObj.fastDeity,
      pob: formData.pob || 'India',
      recommendedVrats: [
        {
          name: selectedRashiObj.fastingDay,
          frequency: 'Every Week',
          benefit: `Stabilizes ${selectedRashiObj.ruler} planetary influence, enhances peace and mental clarity.`,
          ritual:
            'Offer milk/water to deity, light ghee lamp, consume only fruits and milk after evening prayers.',
        },
        {
          name: 'Ekadashi Vrat (11th Tithi)',
          frequency: 'Twice a Month (Shukla & Krishna Paksha)',
          benefit: 'Purifies karmic impressions, aids digestion and spiritual alignment.',
          ritual:
            'Abstain from food grains, rice, and beans. Consume fruits, nuts, and sago (Sabudana).',
        },
        {
          name: 'Pradosh Vrat (13th Tithi)',
          frequency: 'Twice a Month (Evening Twilight)',
          benefit: 'Eliminates planetary afflictions and grants inner strength.',
          ritual: 'Observe fast till sunset, perform evening Shiva Puja during Pradosha Kaal.',
        },
      ],
      astrologicalAnalysis: `Vedic Vrat & Fasting guide for ${formData.fullName || 'Devotee'} (Rashi: ${selectedRashiObj.name}, Ruled by ${selectedRashiObj.ruler}).\n\n• Primary Fasting Day: ${selectedRashiObj.fastingDay} dedicated to ${selectedRashiObj.fastDeity}.\n• Auspicious Benefits: Pacifies planetary afflictions, increases satva guna, and clears physical & mental toxins.\n• Bi-Monthly Vrats: Ekadashi and Pradosham fasts to accelerate spiritual progress and mental stability.`,
      procedure: `1. Morning Sankalpa: Take a bath at sunrise, light a Diya facing East, and take vow for ${selectedRashiObj.fastDeity}.\n2. Fasting Rules: Consume Phalahar (fruits, milk, water, sabudana). Avoid grains, salt, and non-sattvic food.\n3. Evening Aarti & Parana: Perform Aarti at sunset, offer Bhog, and break the fast peacefully with Satvik Prasad.`,
    };

    setGeneratedResult(computedFasting);

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest-user',
          userEmail: user?.email || '',
          type: 'Free Fasting Schedule Report',
          details: {
            name: formData.fullName,
            dob: formData.dob,
            time: formData.tob,
            place: formData.pob || 'India',
            rashi: formData.rashi,
          },
          reportData: computedFasting,
        }),
      });
      const data = await res.json();
      if (data?.reportData) setApiReportData(data.reportData);
    } catch (err) {
      console.warn('API report call error:', err);
    }

    setIsGenerating(false);

    setTimeout(() => {
      document.getElementById('fasting-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section with Image as Background */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/fasting_planner_hero.jpg"
            alt="Vedic Fasting Planner Background"
            fill
            className="object-cover object-center lg:object-right scale-100"
            priority
          />
          {/* Targeted overlays: dark gradient on left for crisp readability, open on right for vivid artwork */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#170b16]/95 via-[#230f20]/85 to-[#170b16]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b0d1a] via-transparent to-[#150914]/50" />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/30 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/20 blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 w-full">
            <div className="max-w-3xl space-y-6">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 shadow-xl shadow-black/20 backdrop-blur-md">
                  <Sparkles size={15} className="text-[#F6D075] animate-pulse" />
                  Free Vedic Vrat & Fasting Planner
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-lg">
                  Free Vedic <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    Fasting Planner
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#F8F3EA]/90 font-medium leading-relaxed max-w-2xl drop-shadow">
                  Discover your personalized weekly planetary fasting days, sacred Ekadashi &
                  Pradosh vrat schedule based on your Rashi and birth Nakshatra.
                </p>
              </motion.div>

              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/15 backdrop-blur-md shadow-lg">
                  <Calendar size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">
                    Weekly Planetary Vrat
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md shadow-lg">
                  <Moon size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">
                    Ekadashi & Pradosh Dates
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md shadow-lg">
                  <Sun size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">
                    Vrat Rules & Rituals
                  </span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-3"
              >
                <button
                  onClick={() => {
                    document.getElementById('fasting-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center gap-2.5 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#C9952B]/40 text-sm sm:text-base"
                >
                  Check Fasting Schedule <ArrowRight size={18} />
                </button>
                <Link
                  href="/talk-to-astrologer"
                  className="px-7 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 hover:scale-[1.02] transition-all backdrop-blur-sm text-sm sm:text-base shadow-md"
                >
                  Consult Astrologer
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Fasting Form Section */}
      <section id="fasting-form" className="py-12 lg:py-16 bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left/Main Compact Form Card */}
            <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-[#B88A44]/30 space-y-6 shadow-2xl">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#713B32] uppercase tracking-widest bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
                  Planetary Fasting Generator
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#292522] pt-1">
                  Enter Your Birth Details
                </h2>
                <p className="text-xs sm:text-sm text-[#6B5E55]">
                  Calculate your sacred weekly fasting day according to Vedic astrology
                </p>
              </div>

              <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} className="text-[#B88A44]" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] placeholder:text-[#6B5E55]/60 text-sm outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#B88A44]" /> Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 shadow-sm cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-[#B88A44]" /> Time of Birth
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.tob}
                    onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 shadow-sm cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <CityLocationInput
                    label="Place of Birth"
                    value={formData.pob}
                    onChange={(city) => setFormData({ ...formData, pob: city })}
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                    <Moon size={14} className="text-[#B88A44]" /> Moon Rashi (Optional)
                  </label>
                  <select
                    value={formData.rashi}
                    onChange={(e) => setFormData({ ...formData, rashi: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 shadow-sm cursor-pointer"
                  >
                    <option value="" className="bg-[#FFFDFC] text-[#292522]">
                      -- Don&apos;t know / Detect from birth data --
                    </option>
                    {[
                      'Mesha (Aries)',
                      'Vrishabha (Taurus)',
                      'Mithuna (Gemini)',
                      'Karka (Cancer)',
                      'Simha (Leo)',
                      'Kanya (Virgo)',
                      'Tula (Libra)',
                      'Vrishchika (Scorpio)',
                      'Dhanu (Sagittarius)',
                      'Makara (Capricorn)',
                      'Kumbha (Aquarius)',
                      'Meena (Pisces)',
                    ].map((r) => (
                      <option key={r} value={r} className="bg-[#FFFDFC] text-[#292522]">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3.5 rounded-full gold-gradient-bg text-[#292522] font-extrabold text-sm sm:text-base shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={18} />
                    <span>
                      {isGenerating
                        ? 'Generating Fasting Report...'
                        : 'Generate My Fasting Schedule'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side Guide Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card border border-[#B88A44]/20 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-[#713B32] font-bold text-sm">
                  <Sparkles size={16} className="text-[#B88A44]" />
                  <span>Sacred Vedic Vrat Principles</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-[#292522]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      ✓
                    </span>
                    <div>
                      <strong className="text-[#713B32]">Planetary Lord Alignment</strong>
                      <p className="text-[#6B5E55] text-xs mt-0.5">
                        Fasting on your ruling day balances weak planetary aspects in your chart.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      ✓
                    </span>
                    <div>
                      <strong className="text-[#713B32]">Sattvic Diet Guidelines</strong>
                      <p className="text-[#6B5E55] text-xs mt-0.5">
                        Customized food intake rules (fruits, milk, water, samvat rice).
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      ✓
                    </span>
                    <div>
                      <strong className="text-[#713B32]">Deity & Mantra Infusions</strong>
                      <p className="text-[#6B5E55] text-xs mt-0.5">
                        Specific Stotrams & Japa counts recommended for your Vrat.
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="pt-2 border-t border-[#E5D9C8] flex items-center justify-between text-xs text-[#6B5E55]">
                  <span className="flex items-center gap-1 font-semibold text-[#713B32]">
                    <ShieldCheck size={14} className="text-emerald-600" /> 100% Free Service
                  </span>
                  <span>Pure Jyotish Tradition</span>
                </div>
              </div>

              {/* Astrologer Consultation CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#281123] to-[#170b16] text-white border border-[#B88A44]/30 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F6D075] uppercase tracking-wider">
                    Dosha Remedial Vrat
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[#F8F3EA]/90 leading-relaxed">
                  Have severe planetary afflictions like Rahu Mahadasha or Sade Sati? Consult our
                  Astrologers for intense Vrat sankalpas.
                </p>
                <Link
                  href="/talk-to-astrologer?category=Remedies%20%26%20Fasting"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl gold-gradient-bg text-[#292522] font-extrabold text-xs hover:brightness-110 transition-all shadow-md"
                >
                  <PhoneCall size={13} /> Consult Vrat Astrologer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generated Result Section */}
      <AnimatePresence>
        {generatedResult && (
          <section
            id="fasting-results"
            className="py-8 bg-background/50 border-t border-white/5 space-y-6"
          >
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-6">
              <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Fasting Planner for {generatedResult.userName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      Saved to My Reports 📄
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/talk-to-astrologer?category=Remedies%20%26%20Fasting"
                      className="px-4 py-1.5 rounded-full bg-[#713B32] hover:bg-[#552B24] text-white text-xs font-bold flex items-center gap-1 shadow transition-colors"
                    >
                      <PhoneCall size={12} className="text-[#D8B66A]" /> Talk to Astrologer 📞
                    </Link>
                    <Link
                      href="/my-reports"
                      className="px-4 py-1.5 rounded-full gold-gradient-bg text-white text-xs font-bold flex items-center gap-1 shadow"
                    >
                      <FileText size={12} /> View in My Reports 📄
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-[#C9952B]">
                  📌 <strong>Primary Fasting Day:</strong>{' '}
                  <span className="font-bold">{generatedResult.weeklyFastingDay}</span> — Dedicated
                  to {generatedResult.deity}.
                </p>
              </div>

              {/* Dynamic AI Astrological Analysis */}
              {apiReportData && (
                <div className="glass-card p-6 rounded-3xl border border-[#C9952B]/30 space-y-2 bg-[#C9952B]/5">
                  <h3 className="text-base font-bold text-[#C9952B] flex items-center gap-2">
                    <Sparkles size={16} /> Astrological Vrat Insights
                  </h3>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {apiReportData.astrologicalAnalysis}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedResult.recommendedVrats.map((vrat: any) => (
                  <div
                    key={vrat.name}
                    className="glass-card p-5 rounded-3xl border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-sm">{vrat.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C9952B]/20 text-[#C9952B]">
                        {vrat.frequency}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{vrat.benefit}</p>
                  </div>
                ))}
              </div>

              {/* Dynamic Content Managed via Admin Panel */}
              <DynamicPageContent pageId="fasting-planner" />

              {/* Consultation CTA Banner */}
              <AstrologerCtaBanner
                theme="gold"
                category="Remedies & Fasting"
                title="Need Guidance on Vrat Observance & Planetary Pacification?"
                subtitle="Speak with our master Vedic astrologers to know your specific Sankalpa mantras, Ekadashi rules, and custom fasting rituals for health and prosperity."
                badge="Talk to Vrat & Remedy Specialist"
              />
            </div>
          </section>
        )}
      </AnimatePresence>
    </div>
  );
}
