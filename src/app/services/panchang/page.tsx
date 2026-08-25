'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  Star,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Check,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';
import { useUserData } from '@/lib/useUserData';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

export default function FreePanchangPage() {
  const { user } = useUserData();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('New Delhi, Delhi, India');
  const [panchang, setPanchang] = useState<PanchangData>(() =>
    calculatePanchang(new Date().toISOString().split('T')[0], 'New Delhi, Delhi, India')
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAiSynthesis = async (dateStr: string, locStr: string) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-panchang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, location: locStr }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.aiSummary) setAiSummary(data.aiSummary);
      }
    } catch (err) {
      console.warn('AI Panchang fetch error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const calculated = calculatePanchang(selectedDate, location);
    setPanchang(calculated);
    fetchAiSynthesis(selectedDate, location);
  }, [selectedDate, location]);

  const handleGeneratePanchang = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsGenerating(true);
    setToastMessage(null);

    const calculated = calculatePanchang(selectedDate, location);
    setPanchang(calculated);
    fetchAiSynthesis(selectedDate, location);
    setIsGenerating(false);

    setToastMessage(`Panchang calculated successfully for ${calculated.formattedDate} (${location})`);
    setTimeout(() => setToastMessage(null), 4000);

    if (user) {
      try {
        await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            userEmail: user.email || '',
            type: 'Free Daily Panchang Report',
            details: {
              date: selectedDate,
              place: location || 'New Delhi, Delhi, India',
              generatedAt: new Date().toISOString(),
            },
            reportData: {
              recommendationTitle: 'Daily Panchang & Vedic Timing',
              recommendationName: `Panchang for ${location || 'New Delhi'} on ${calculated.formattedDate}`,
              timing: `Sunrise ${calculated.sunrise} — Sunset ${calculated.sunset}`,
              duration: 'Full Day Cosmic Calculations',
              tithi: `${calculated.paksha} Paksha ${calculated.tithi}`,
              nakshatra: calculated.nakshatra,
              yoga: calculated.yoga,
              karana: calculated.karana,
              vara: calculated.weekday,
              rahuKaal: `${calculated.rahuKaal.start} – ${calculated.rahuKaal.end}`,
              abhijitMuhurat: `${calculated.abhijitMuhurat.start} – ${calculated.abhijitMuhurat.end}`,
              sunrise: calculated.sunrise,
              sunset: calculated.sunset,
              astrologicalAnalysis: `Daily Vedic Panchang overview for ${location} on ${calculated.formattedDate}.\n\n• Active Tithi: ${calculated.paksha} Paksha ${calculated.tithi} with ${calculated.nakshatra} Nakshatra.\n• Yoga & Karana: Auspicious ${calculated.yoga} Yoga and ${calculated.karana} Karana.\n• Favorable Windows: Abhijit Muhurat (${calculated.abhijitMuhurat.start} to ${calculated.abhijitMuhurat.end}).\n• Inauspicious Periods: Avoid starting new ventures during Rahu Kaal (${calculated.rahuKaal.start} to ${calculated.rahuKaal.end}).`,
              procedure: `1. Surya Arghya: Offer sacred water to Surya Dev at sunrise (${calculated.sunrise}).\n2. Key Undertakings: Schedule important work, deals, and spiritual rituals during Abhijit Muhurat.\n3. Daily Chanting: Recite Gayatri Mantra or personal Ishta Devata mantra for cosmic alignment.`,
            },
          }),
        });
      } catch (err) {
        console.error('Panchang report save error:', err);
      }
    }
  };

  const relatedPages = [
    { title: 'Tomorrow Panchang', href: '/panchang/tomorrow-panchang' },
    { title: 'Daily Horoscope', href: '/services/daily-horoscope' },
    { title: 'Rahu Kaal', href: '/panchang/rahu-kaal' },
    { title: 'Tithi', href: '/panchang/tithi' },
    { title: 'Vaar', href: '/panchang/vaar' },
    { title: 'Yoga', href: '/panchang/yoga' },
    { title: 'Karana', href: '/panchang/karana' },
    { title: 'Hora', href: '/panchang/hora' },
    { title: 'Choghadiya', href: '/panchang/choghadiya' },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Floating Success Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] px-5 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <Check size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Hero Section with Image as Background */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/horoscope_banner.jpg"
            alt="Vedic Panchang Background"
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
                  Daily Vedic Almanac & Muhurat
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
                  Today&apos;s Sacred <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    Panchangam Report
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#F8F3EA]/90 font-medium leading-relaxed max-w-2xl drop-shadow">
                  Accurate Vedic Tithi, Nakshatra, Yoga, Karana, Abhijit Muhurat, Rahu Kaal, Sunrise, Sunset, and auspicious timings calculated for your exact location.
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
                  <Sun size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">Abhijit Muhurat</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md shadow-lg">
                  <Moon size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">Tithi & Nakshatra</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md shadow-lg">
                  <Clock size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">Rahu Kaal Timings</span>
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
                    document.getElementById('panchang-selector')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center gap-2.5 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#C9952B]/40 text-sm sm:text-base"
                >
                  View Today&apos;s Panchang <ChevronRight size={18} />
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

      <div id="panchang-selector" className="pt-8 pb-16 px-6 lg:px-10 max-w-screen-2xl mx-auto space-y-12">
        {/* Date & Location Form Selector - Compact & Clean */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-[#B88A44]/30 space-y-5 shadow-2xl relative z-30">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-[#713B32] uppercase tracking-widest bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
                Panchang Calculator
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#292522]">Calculate Today&apos;s Vedic Almanac</h2>
            </div>

            <form onSubmit={handleGeneratePanchang} className="grid sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#B88A44]" /> Select Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-xl bg-white border border-[#E5D9C8] text-[#292522] text-sm focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none transition-all shadow-sm"
                  />
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B88A44] pointer-events-none" />
                </div>
              </div>

              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#B88A44]" /> Location / City
                </label>
                <CityLocationInput
                  value={location}
                  onChange={(city: string) => setLocation(city)}
                  placeholder="Search city e.g. New Delhi, Mumbai"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-xl gold-gradient-bg text-[#292522] font-extrabold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C9952B]/30 cursor-pointer"
                >
                  {isGenerating ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  <span>{isGenerating ? 'Calculating...' : 'Get Panchang'}</span>
                </button>
              </div>
            </form>

            <div className="pt-3 border-t border-[#E5D9C8] flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-[#713B32]">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#B88A44]" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#B88A44]" />
                <span>{panchang.formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Results Container */}
        <motion.div
          key={`${selectedDate}-${location}-${panchang.formattedDate}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-12"
        >
          {/* Dynamic AI Cosmic Insights Card (Admin Configured Engine) */}
          {aiSummary && (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C9952B]/40 bg-gradient-to-br from-[#2A1713]/80 via-[#1F100E]/70 to-[#120807]/90 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#C9952B]/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#C9952B]/20 text-[#F3E5AB]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#F3E5AB]">
                      ✨ AI Vedic Cosmic Weather &amp; Daily Guidance
                    </h3>
                    <p className="text-xs text-amber-200/70">
                      Personalized daily synthesis powered by AstroParihar OpenAI Engine
                    </p>
                  </div>
                </div>
                {aiLoading && <Loader2 size={16} className="animate-spin text-[#C9952B]" />}
              </div>

              {aiSummary.dailyVedicSummary && (
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                  {aiSummary.dailyVedicSummary}
                </p>
              )}

              {/* Favorable Activities & Precautions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {aiSummary.favorableActivities && Array.isArray(aiSummary.favorableActivities) && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      ✓ Favorable Deeds &amp; Activities
                    </span>
                    <ul className="space-y-1 text-xs text-gray-200">
                      {aiSummary.favorableActivities.map((act: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.inauspiciousPrecautions && Array.isArray(aiSummary.inauspiciousPrecautions) && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                      ⚠ Inauspicious Periods &amp; Precautions
                    </span>
                    <ul className="space-y-1 text-xs text-gray-200">
                      {aiSummary.inauspiciousPrecautions.map((prec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{prec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sacred Daily Shloka */}
              {aiSummary.dailyBlessingShloka && (
                <div className="p-4 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/20 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#F3E5AB]">Daily Sacred Vedic Shloka</span>
                  <p className="text-xs sm:text-sm font-serif text-[#F3E5AB] italic">
                    &ldquo;{aiSummary.dailyBlessingShloka}&rdquo;
                  </p>
                </div>
              )}

              {/* Admin Extra Guidance */}
              {aiSummary.additionalGuidance && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
                  <strong className="text-[#C9952B]">Zonal &amp; Lifestyle Guidance: </strong>
                  <span>{aiSummary.additionalGuidance}</span>
                </div>
              )}
            </div>
          )}

          {/* Sun & Moon Timings Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Sun size={20} />
              </div>
              <span className="text-xs text-muted-foreground font-semibold block">☀️ Sunrise</span>
              <span className="text-lg font-bold text-foreground font-mono">{panchang.sunrise}</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto">
                <Sun size={20} />
              </div>
              <span className="text-xs text-muted-foreground font-semibold block">🌅 Sunset</span>
              <span className="text-lg font-bold text-foreground font-mono">{panchang.sunset}</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <Moon size={20} />
              </div>
              <span className="text-xs text-muted-foreground font-semibold block">🌕 Moonrise</span>
              <span className="text-lg font-bold text-foreground font-mono">{panchang.moonrise}</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Moon size={20} />
              </div>
              <span className="text-xs text-muted-foreground font-semibold block">🌑 Moonset</span>
              <span className="text-lg font-bold text-foreground font-mono">{panchang.moonset}</span>
            </div>
          </div>

          {/* Core 5 Limbs Elements Grid */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <Sparkles size={20} /> Core Panchangam Elements
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Tithi', val: panchang.tithi },
                { label: 'Nakshatra', val: panchang.nakshatra },
                { label: 'Yoga', val: panchang.yoga },
                { label: 'Karana', val: panchang.karana },
                { label: 'Paksha', val: panchang.paksha },
                { label: 'Weekday', val: panchang.weekday },
                { label: 'Shaka Samvat', val: panchang.shakaSamvat },
                { label: 'Vikram Samvat', val: panchang.vikramSamvat },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">{item.label}</span>
                  <span className="text-sm font-bold text-foreground block">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inauspicious Timings */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                <ShieldAlert size={20} /> Inauspicious Timings (Ashubha Muhurat)
              </h2>
              <span className="text-xs text-muted-foreground">Avoid starting major tasks in Rahu Kaal</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left text-xs font-bold text-muted-foreground uppercase">
                    <th className="px-4 py-3">Inauspicious Period</th>
                    <th className="px-4 py-3">Timing Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {panchang.ashubhaMuhurats.map((row) => (
                    <tr key={row.name} className={`hover:bg-white/5 transition-colors ${row.isRahu ? 'bg-red-500/10 font-bold' : ''}`}>
                      <td className="px-4 py-3 font-bold text-foreground">{row.name}</td>
                      <td className="px-4 py-3 text-red-400 font-mono text-xs font-semibold">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Auspicious Timings */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={18} /> Abhijit Muhurat
              </h3>
              <p className="text-xs text-muted-foreground">Most auspicious window of the day</p>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center font-mono font-bold text-emerald-400 text-sm">
                {panchang.abhijitMuhurat.start} – {panchang.abhijitMuhurat.end}
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Clock size={18} /> Choghadiya
              </h3>
              <p className="text-xs text-muted-foreground">Shubh, Amrit, Labh & Chara Muhurats</p>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center font-mono font-bold text-amber-400 text-xs leading-relaxed">
                Amrit: {panchang.dayChoghadiya[0]?.start || '05:51 AM'} - {panchang.dayChoghadiya[0]?.end || '07:29 AM'} <br />
                Shubh: {panchang.dayChoghadiya[2]?.start || '09:08 AM'} - {panchang.dayChoghadiya[2]?.end || '10:46 AM'}
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                <Star size={18} /> Hora Timing
              </h3>
              <p className="text-xs text-muted-foreground">Planetary ruling hours</p>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center font-mono font-bold text-blue-400 text-xs leading-relaxed">
                Sun Hora: {panchang.sunrise} - 07:00 AM <br />
                Jupiter Hora: 12:00 PM - 01:00 PM
              </div>
            </div>
          </div>

          {/* Planetary Positions */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <Star size={20} /> Planetary Positions (Graha Sthiti)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left text-xs font-bold text-muted-foreground uppercase">
                    <th className="px-4 py-3">Planets</th>
                    <th className="px-4 py-3">Rashi</th>
                    <th className="px-4 py-3">Longitude</th>
                    <th className="px-4 py-3">Nakshatra</th>
                    <th className="px-4 py-3">Pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {panchang.planetaryPositions.map((row) => (
                    <tr key={row.planet} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground">{row.planet}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.rashi}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{row.lon}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.nakshatra}</td>
                      <td className="px-4 py-3 font-bold text-[#C9952B]">{row.pada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Content Managed via Admin Panel */}
          <DynamicPageContent pageId="panchang" />

          {/* Consultation CTA Banner */}
          <AstrologerCtaBanner
            theme="gold"
            category="Muhurat & Panchang"
            title="Need Expert Astrological Guidance for Auspicious Muhurat?"
            subtitle="Planning a wedding, griha pravesh, vehicle purchase, or business launch? Consult our senior Vedic astrologers for exact customized muhurat calculations."
            badge="Talk to Muhurat Specialist"
          />

          {/* Related Pages */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Related Panchang Pages</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relatedPages.map((page) => (
                <Link
                  key={page.title}
                  href={page.href}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground text-center flex items-center justify-center gap-1 transition-all group"
                >
                  <span>{page.title}</span>
                  <ChevronRight size={12} className="text-[#C9952B] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
