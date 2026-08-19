'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun,
  Moon,
  Calendar,
  Compass,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  Star,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import { useUserData } from '@/lib/useUserData';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

export default function TomorrowPanchangPage() {
  const { user } = useUserData();

  // Tomorrow's date default calculation
  const tomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(tomorrowDateStr);
  const [location, setLocation] = useState('New Delhi, Delhi, India');
  const [panchang, setPanchang] = useState<PanchangData>(() =>
    calculatePanchang(tomorrowDateStr(), 'New Delhi, Delhi, India')
  );
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setPanchang(calculatePanchang(selectedDate, location));
  }, [selectedDate, location]);

  const handleGeneratePanchang = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user) {
      window.location.href = `/sign-up-login-screen?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsGenerating(true);
    try {
      const calculated = calculatePanchang(selectedDate, location);
      setPanchang(calculated);

      await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest-user',
          userEmail: user?.email || '',
          type: 'Tomorrow Panchang Report',
          details: {
            date: selectedDate,
            place: location || 'New Delhi, Delhi, India',
            generatedAt: new Date().toISOString(),
          },
          reportContent: JSON.stringify({
            recommendationTitle: 'Tomorrow Panchang & Vedic Timing',
            recommendationName: `Tomorrow Panchang for ${location || 'New Delhi'} on ${calculated.formattedDate}`,
            timing: `Sunrise ${calculated.sunrise} - Sunset ${calculated.sunset}`,
            duration: 'Tomorrow Full Day Cosmic Overview',
            materials: 'Kusha Mat, Copper Lota, Diya',
            astrologicalAnalysis: `Tomorrow ${calculated.tithi} Tithi with ${calculated.nakshatra} brings steady planetary alignment. Rahu Kaal window is (${calculated.rahuKaal.start} - ${calculated.rahuKaal.end}).`,
            procedure: `Prepare for tomorrow's morning rituals at ${calculated.sunrise}. Recite mantras during Abhijit Muhurat (${calculated.abhijitMuhurat.start} - ${calculated.abhijitMuhurat.end}).`,
          }),
        }),
      });
    } catch (err) {
      console.error('Tomorrow Panchang generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const relatedPages = [
    { title: 'Today Panchang', href: '/panchang/today-panchang' },
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
      <Navbar />

      <div className="pt-24 lg:pt-28 pb-16 px-6 lg:px-10 max-w-screen-2xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 backdrop-blur-md">
            ADVANCE VEDIC ALMANAC
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Tomorrow Panchang (Panchangam)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Plan ahead with tomorrow&apos;s exact Vedic Tithi, Nakshatra, Shubh Muhurat, Abhijit Muhurat & Rahu Kaal timings.
          </p>
        </div>

        {/* Date & Location Form Selector */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 relative z-30">
          <form onSubmit={handleGeneratePanchang} className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-[#C9952B]" /> SELECT DATE
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:border-[#C9952B] outline-none transition-colors"
                />
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9952B] pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Location / City
              </label>
              <CityLocationInput
                value={location}
                onChange={(city: string) => setLocation(city)}
                placeholder="Search city e.g. New Delhi, Mumbai"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[#C9952B]/20"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{isGenerating ? 'Calculating...' : 'Get Tomorrow Panchang'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-sm font-bold text-[#C9952B]">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Tomorrow: {panchang.formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Sun & Moon Timings Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
            <span className="text-xs text-muted-foreground font-semibold block">☀️ Sunrise</span>
            <span className="text-lg font-bold text-foreground font-mono">{panchang.sunrise}</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
            <span className="text-xs text-muted-foreground font-semibold block">🌅 Sunset</span>
            <span className="text-lg font-bold text-foreground font-mono">{panchang.sunset}</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
            <span className="text-xs text-muted-foreground font-semibold block">🌕 Moonrise</span>
            <span className="text-lg font-bold text-foreground font-mono">{panchang.moonrise}</span>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
            <span className="text-xs text-muted-foreground font-semibold block">🌑 Moonset</span>
            <span className="text-lg font-bold text-foreground font-mono">{panchang.moonset}</span>
          </div>
        </div>

        {/* Core 5 Limbs Elements Grid */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
            <Sparkles size={20} /> Tomorrow Panchangam Elements
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
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            <ShieldAlert size={20} /> Tomorrow Inauspicious Timings (Ashubha Muhurat)
          </h2>
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

        {/* Auspicious Abhijit Muhurat */}
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} /> ✨ Tomorrow Abhijit Muhurat
          </span>
          <h2 className="text-2xl font-bold text-foreground font-mono">
            {panchang.abhijitMuhurat.start} – {panchang.abhijitMuhurat.end}
          </h2>
          <p className="text-xs text-muted-foreground">Best window for tomorrow&apos;s key activities</p>
        </div>

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
      </div>
    </div>
  );
}
