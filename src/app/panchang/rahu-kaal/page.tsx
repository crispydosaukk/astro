'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  AlertOctagon,
  CheckCircle2,
  Loader2,
  Check,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

export default function RahuKaalPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Hyderabad, Telangana, India');
  const [panchang, setPanchang] = useState<PanchangData>(() =>
    calculatePanchang(new Date().toISOString().split('T')[0], 'Hyderabad, Telangana, India')
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setPanchang(calculatePanchang(selectedDate, location));
  }, [selectedDate, location]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setToastMessage(null);

    await new Promise((res) => setTimeout(res, 400));

    const calculated = calculatePanchang(selectedDate, location);
    setPanchang(calculated);
    setIsCalculating(false);

    setToastMessage(`Rahu Kaal updated for ${calculated.formattedDate} (${location})`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const itemsToAvoid = [
    'Planning of a new project or signing off on a contract',
    'Planning key events such as Graha Pravesh, marriage, interviews, or meetings',
    'Planning travels, especially long-distance',
    'Planning to invest or lend money',
    'Planning to purchase new items such as jewellery, electronics, property, or vehicles',
    'Planning to go for a surgical or medical treatment',
  ];

  const relatedPages = [
    { title: 'Today Panchang', href: '/panchang/today-panchang' },
    { title: 'Tomorrow Panchang', href: '/panchang/tomorrow-panchang' },
    { title: 'Daily Horoscope', href: '/services/daily-horoscope' },
    { title: 'Tithi', href: '/panchang/tithi' },
    { title: 'Vaar', href: '/panchang/vaar' },
    { title: 'Yoga', href: '/panchang/yoga' },
    { title: 'Karana', href: '/panchang/karana' },
    { title: 'Hora', href: '/panchang/hora' },
    { title: 'Choghadiya', href: '/panchang/choghadiya' },
  ];

  const faqs = [
    {
      q: 'What happens during Rahu Kaal?',
      a: 'Rahu is a shadow planet. The start of a new venture or any auspicious activity can be marked by delays, obstacles, or mishaps.',
    },
    {
      q: 'How to check Rahu Kalam?',
      a: 'You can check Rahu Kalam today and for the rest of the week by observing sunrise and sunset times. Divide the time span by 8 and choose a slot for the day. Further, at AstroParihar, you can get the precise, immediate duration of Rahu Kaal for the entire week.',
    },
    {
      q: 'What happens during Rahu Kaal?',
      a: 'Rahu Kaal is a 90-minute period each day, not a danger zone but a cautious zone. During this period, the beginning of anything new can create obstacles or hurdles in one’s life.',
    },
    {
      q: 'How long does Rahu Kalam last?',
      a: 'Rahu Kalam lasts 80-100 hours, or about 90 minutes each day. The time varies with sunrise and sunset.',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      {/* Success Toast Banner */}
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

      <div className="pt-24 lg:pt-28 pb-16 px-6 lg:px-10 max-w-screen-2xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 shadow-sm">
            <Clock size={14} className="text-rose-600" />
            Inauspicious Time Window Calculator
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Rahu Kaal Today
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Find the precise Rahu Kaal timing for your location to avoid delays and obstacles in new
            beginnings.
          </p>
        </div>

        {/* Date & Location Selector */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 relative z-30">
          <div className="grid md:grid-cols-3 gap-4 items-end">
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
                <Calendar
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9952B] pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Location / City
              </label>
              <CityLocationInput
                value={location}
                onChange={(city: string) => setLocation(city)}
                placeholder="Search city e.g. Hyderabad, Mumbai"
              />
            </div>

            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C9952B]/20 active:scale-95"
            >
              {isCalculating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              <span>{isCalculating ? 'Calculating...' : 'Get Rahu Kaal'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-sm font-bold text-[#C9952B]">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{panchang.formattedDate}</span>
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
          {/* Red Rahu Kaal Alert Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-red-500/40 bg-red-500/10 text-center space-y-3 shadow-xl">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldAlert size={18} className="animate-pulse" /> 🔴 Rahu Kaal Today
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-mono">
              {panchang.rahuKaal.start} – {panchang.rahuKaal.end}
            </h2>
            <p className="text-xs font-semibold text-red-300">
              Avoid starting new work, travel, or investments during this period.
            </p>
          </div>

          {/* Sun & Moon Timings Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <span className="text-xs text-muted-foreground font-semibold block">☀️ Sunrise</span>
              <span className="text-lg font-bold text-foreground font-mono">
                {panchang.sunrise}
              </span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <span className="text-xs text-muted-foreground font-semibold block">🌅 Sunset</span>
              <span className="text-lg font-bold text-foreground font-mono">{panchang.sunset}</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <span className="text-xs text-muted-foreground font-semibold block">🌕 Moonrise</span>
              <span className="text-lg font-bold text-foreground font-mono">
                {panchang.moonrise}
              </span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/10 text-center space-y-2">
              <span className="text-xs text-muted-foreground font-semibold block">🌑 Moonset</span>
              <span className="text-lg font-bold text-foreground font-mono">
                {panchang.moonset}
              </span>
            </div>
          </div>

          {/* Ashubha Muhurat Table */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
              <AlertOctagon size={20} /> Inauspicious Timings (Ashubha Muhurat)
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
                    <tr
                      key={row.name}
                      className={`hover:bg-white/5 transition-colors ${
                        row.isRahu ? 'bg-red-500/10 border-l-4 border-l-red-500 font-bold' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-foreground flex items-center gap-2">
                        {row.name}
                        {row.isRahu && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-white font-extrabold">
                            Rahu Kaal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-red-400 font-semibold">
                        {row.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Abhijeet Muhurat Card */}
          <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 text-center">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} /> ✨ Auspicious Abhijeet Muhurat
            </span>
            <h2 className="text-2xl font-bold text-foreground font-mono">
              {panchang.abhijitMuhurat.start} – {panchang.abhijitMuhurat.end}
            </h2>
            <p className="text-xs text-muted-foreground">Best window for important activities</p>
          </div>

          {/* Related Pages Links */}
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
                  <ChevronRight
                    size={12}
                    className="text-[#C9952B] group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
