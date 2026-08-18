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
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  BookOpen,
  Star,
  Loader2,
  Check,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

export default function ShubhMuhuratPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('New Delhi, Delhi, India');
  const [panchang, setPanchang] = useState<PanchangData>(() =>
    calculatePanchang(new Date().toISOString().split('T')[0], 'New Delhi, Delhi, India')
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

    setToastMessage(`Shubh Muhurat updated for ${calculated.formattedDate} (${location})`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const auspiciousMuhurats = [
    { name: 'Abhijit Muhurat', desc: 'Most powerful muhurat for all tasks', timing: `${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}`, isBest: true },
    { name: 'Brahma Muhurat', desc: 'Spiritual practice & meditation', timing: `04:20 AM – 05:08 AM` },
    { name: 'Amrit Kaal', desc: 'Favourable for new beginnings', timing: `06:15 AM – 07:45 AM` },
    { name: 'Vijay Muhurat', desc: 'Success in lawsuits & competitions', timing: `02:15 PM – 03:05 PM` },
    { name: 'Godhuli Muhurat', desc: 'Twilight evening prayer', timing: `06:45 PM – 07:10 PM` },
    { name: 'Nishita Muhurat', desc: 'Midnight spiritual dhyana', timing: `11:45 PM – 12:35 AM` },
  ];

  const relatedPages = [
    { title: 'Today Panchang', href: '/panchang/today-panchang' },
    { title: 'Tomorrow Panchang', href: '/panchang/tomorrow-panchang' },
    { title: 'Daily Horoscope', href: '/services/free-daily-horoscope' },
    { title: 'Rahu Kaal', href: '/panchang/rahu-kaal' },
    { title: 'Choghadiya', href: '/panchang/choghadiya' },
    { title: 'Tithi', href: '/panchang/tithi' },
    { title: 'Vaar', href: '/panchang/vaar' },
    { title: 'Hora', href: '/panchang/hora' },
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

      <div className="pt-24 lg:pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
            AUSPICIOUS TIMINGS FINDER
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Shubh Muhurat Today — Auspicious Timings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Discover Abhijit Muhurat, Brahma Muhurat, Vijay Muhurat & Choghadiya auspicious windows for marriage, business, and travel.
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
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C9952B]/20 active:scale-95"
            >
              {isCalculating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{isCalculating ? 'Calculating...' : 'Get Shubh Muhurat'}</span>
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
          {/* Top Highlight Abhijit Muhurat Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 text-center space-y-3 shadow-xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> ✨ Today Abhijit Muhurat (Best Period)
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-mono">
              {panchang.abhijitMuhurat.start} – {panchang.abhijitMuhurat.end}
            </h2>
            <p className="text-xs font-semibold text-emerald-300">
              Universally auspicious time slot for starting all major tasks, business, and rituals.
            </p>
          </div>

          {/* Auspicious Timings List Table */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={20} /> Auspicious Periods Today
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left text-xs font-bold text-muted-foreground uppercase">
                    <th className="px-4 py-3">Muhurat Name</th>
                    <th className="px-4 py-3">Significance</th>
                    <th className="px-4 py-3">Timing Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auspiciousMuhurats.map((row) => (
                    <tr
                      key={row.name}
                      className={`hover:bg-white/5 transition-colors ${
                        row.isBest ? 'bg-emerald-500/15 font-bold border-l-4 border-l-emerald-500' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-foreground font-bold">{row.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.desc}</td>
                      <td className="px-4 py-3 font-mono text-xs text-emerald-400 font-bold">{row.timing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
