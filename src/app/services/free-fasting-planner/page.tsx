'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles, User, MapPin, Clock, Moon, ArrowRight, Printer, FileText } from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
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
    { name: 'Aries (Mesha)', ruler: 'Mars', fastingDay: 'Tuesday (Mangalvar Vrat)', fastDeity: 'Lord Hanuman' },
    { name: 'Taurus (Vrishabha)', ruler: 'Venus', fastingDay: 'Friday (Shukravar Vrat)', fastDeity: 'Goddess Lakshmi' },
    { name: 'Gemini (Mithuna)', ruler: 'Mercury', fastingDay: 'Wednesday (Budhvar Vrat)', fastDeity: 'Lord Ganesha' },
    { name: 'Cancer (Karka)', ruler: 'Moon', fastingDay: 'Monday (Somvar Vrat)', fastDeity: 'Lord Shiva' },
    { name: 'Leo (Simha)', ruler: 'Sun', fastingDay: 'Sunday (Ravivar Vrat)', fastDeity: 'Lord Surya' },
    { name: 'Virgo (Kanya)', ruler: 'Mercury', fastingDay: 'Wednesday (Budhvar Vrat)', fastDeity: 'Lord Vishnu' },
    { name: 'Libra (Tula)', ruler: 'Venus', fastingDay: 'Friday (Shukravar Vrat)', fastDeity: 'Goddess Durga' },
    { name: 'Scorpio (Vrishchika)', ruler: 'Mars', fastingDay: 'Tuesday (Mangalvar Vrat)', fastDeity: 'Lord Kartikeya' },
    { name: 'Sagittarius (Dhanu)', ruler: 'Jupiter', fastingDay: 'Thursday (Guruvar Vrat)', fastDeity: 'Lord Vishnu / Dattatreya' },
    { name: 'Capricorn (Makara)', ruler: 'Saturn', fastingDay: 'Saturday (Shanivar Vrat)', fastDeity: 'Lord Shani / Hanuman' },
    { name: 'Aquarius (Kumbha)', ruler: 'Saturn', fastingDay: 'Saturday (Shanivar Vrat)', fastDeity: 'Lord Shani' },
    { name: 'Pisces (Meena)', ruler: 'Jupiter', fastingDay: 'Thursday (Guruvar Vrat)', fastDeity: 'Lord Brihaspati' },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      window.location.href = `/sign-up-login-screen?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const selectedRashiObj = rashiList.find((r) => r.name.toLowerCase().includes(formData.rashi.toLowerCase())) || rashiList[0];

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
          ritual: 'Offer milk/water to deity, light ghee lamp, consume only fruits and milk after evening prayers.',
        },
        {
          name: 'Ekadashi Vrat (11th Tithi)',
          frequency: 'Twice a Month (Shukla & Krishna Paksha)',
          benefit: 'Purifies karmic impressions, aids digestion and spiritual alignment.',
          ritual: 'Abstain from food grains, rice, and beans. Consume fruits, nuts, and sago (Sabudana).',
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section - Spans logo to right edge */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#8B1A2A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full">
            <div className="grid lg:grid-cols-2 items-center min-h-screen">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="px-6 lg:px-12 xl:px-20 space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-6 backdrop-blur-md">
                    Free Fasting Planner
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-xl">
                    Free Vedic <br />
                    <span className="text-gradient-gold">Fasting Planner</span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                    Find your weekly fasting day and sacred Ekadashi & Pradosh vrat dates based on your Rashi.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        document.getElementById('fasting-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                    >
                      Check Fasting Schedule <ArrowRight size={18} />
                    </button>
                    <Link
                      href="/talk-to-astrologer"
                      className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      Consult Astrologer
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="relative h-[40vh] lg:h-[80vh] w-full order-1 lg:order-2 flex items-center justify-center p-6 lg:p-12"
              >
                <div className="relative w-full h-full max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#C9952B]/30">
                  <Image
                    src="/images/fasting_planner_hero.jpg"
                    alt="AstroParihar Fasting Planner"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Input Form Section */}
      <section id="fasting-form" className="py-8 lg:py-12 bg-background relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">Planetary Fasting Generator</span>
              <h2 className="text-2xl font-bold text-foreground">Enter Your Birth Details</h2>
            </div>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-[#C9952B]" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#C9952B]" /> Date of Birth
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-[#C9952B]" /> Time of Birth
                </label>
                <input
                  type="time"
                  required
                  value={formData.tob}
                  onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Moon size={14} className="text-[#C9952B]" /> Moon Rashi
                </label>
                <select
                  value={formData.rashi}
                  onChange={(e) => setFormData({ ...formData, rashi: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-foreground text-sm outline-none"
                >
                  {rashiList.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-full gold-gradient-bg text-white font-bold text-base shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  <span>{isGenerating ? 'Generating Fasting Report...' : 'Generate My Fasting Schedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Generated Result Section */}
      <AnimatePresence>
        {generatedResult && (
          <section id="fasting-results" className="py-8 bg-background/50 border-t border-white/5 space-y-6">
            <div className="max-w-5xl mx-auto px-6 space-y-6">
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

                  <div className="flex items-center gap-2">
                    <Link
                      href="/my-reports"
                      className="px-4 py-1.5 rounded-full gold-gradient-bg text-white text-xs font-bold flex items-center gap-1"
                    >
                      <FileText size={12} /> View in My Reports 📄
                    </Link>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground text-xs font-bold flex items-center gap-1"
                    >
                      <Printer size={12} className="text-[#C9952B]" /> Print
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#C9952B]">
                  📌 <strong>Primary Fasting Day:</strong> <span className="font-bold">{generatedResult.weeklyFastingDay}</span> — Dedicated to {generatedResult.deity}.
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
                  <div key={vrat.name} className="glass-card p-5 rounded-3xl border border-white/10 space-y-2">
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
            </div>
          </section>
        )}
      </AnimatePresence>
    </div>
  );
}
