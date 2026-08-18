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
  HelpCircle,
  Loader2,
  Check,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

export default function ChoghadiyaPage() {
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

    setToastMessage(`Choghadiya updated for ${calculated.formattedDate} (${location})`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentChoghadiyaSlot = panchang.dayChoghadiya.find((c) => c.isCurrent) || panchang.dayChoghadiya[4];

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Good':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Neutral':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Bad':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'Evil':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const relatedPages = [
    { title: 'Today Panchang', href: '/panchang/today-panchang' },
    { title: 'Tomorrow Panchang', href: '/panchang/tomorrow-panchang' },
    { title: 'Daily Horoscope', href: '/services/free-daily-horoscope' },
    { title: 'Rahu Kaal', href: '/panchang/rahu-kaal' },
    { title: 'Tithi', href: '/panchang/tithi' },
    { title: 'Vaar', href: '/panchang/vaar' },
    { title: 'Yoga', href: '/panchang/yoga' },
    { title: 'Karana', href: '/panchang/karana' },
    { title: 'Hora', href: '/panchang/hora' },
  ];

  const faqs = [
    {
      q: 'Which Choghadiya is the best?',
      a: 'The Amrit, Shubh, Labh, and Char choghadiyas are the best, as they are ruled by benefic planets such as the Moon, Jupiter, Mercury, and Venus.',
    },
    {
      q: 'Which Choghadiya is good for marriage?',
      a: 'Amrit (Moon), Labh (Mercury), and Shubh (Jupiter) are good for marriage. This period roughly lasts for 96 minutes and is best suited for performing the ceremony.',
    },
    {
      q: 'Which Choghadiya muhurat is best?',
      a: 'Amrit (Moon), Labh (Mercury), and Shubh (Jupiter) are the best Choghadiya muhurat. Amrit is best for all types of work, Shubh for performing ceremonies, and Labh for intellectual work or learning.',
    },
    {
      q: 'Is Amrit Muhurat good or bad?',
      a: 'Amrit Muhurat, governed by the moon, is auspicious for religious practices, starting a new business, and educational activities.',
    },
    {
      q: 'What is the auspicious time today, Choghadiya?',
      a: 'To know today choghadiya auspicious timings, visit AstroParihar. You will learn about choghadiyas according to the timings and choose the favourable and unfavourable ones.',
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

      <div className="pt-24 lg:pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 backdrop-blur-md">
            VEDIC TIME CALCULATOR
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Today Choghadiya — Find Auspicious Time Today
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Accurate Day & Night Choghadiya timings to select the best muhurat for business, travel, and spiritual work.
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
              <span>{isCalculating ? 'Calculating...' : 'Get Choghadiya'}</span>
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
          {/* Current Active Choghadiya Period Banner */}
          <div className="glass-card p-6 rounded-3xl border border-orange-500/30 bg-orange-500/5 space-y-2 text-center">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Clock size={16} /> Current Active Choghadiya Period
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {currentChoghadiyaSlot.name}{' '}
              <span className="text-orange-400 text-lg font-normal">
                ({currentChoghadiyaSlot.start} – {currentChoghadiyaSlot.end} · {currentChoghadiyaSlot.type})
              </span>
            </h2>
          </div>

          {/* Day & Night Choghadiya Tables */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Day Table */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Sun size={20} />
                <h2 className="text-xl font-bold text-foreground">Day Choghadiya</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-bold text-muted-foreground uppercase">
                      <th className="px-3 py-3">#</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Start</th>
                      <th className="px-3 py-3">End</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {panchang.dayChoghadiya.map((row) => (
                      <tr
                        key={`day-${row.num}-${row.name}`}
                        className={`hover:bg-white/5 transition-colors ${
                          row.isCurrent ? 'bg-[#C9952B]/15 border-l-4 border-l-[#C9952B]' : ''
                        }`}
                      >
                        <td className="px-3 py-3 font-bold text-muted-foreground">{row.num}</td>
                        <td className="px-3 py-3 font-bold text-foreground">
                          {row.name}
                          {row.isCurrent && (
                            <span className="ml-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#C9952B] text-black animate-pulse">
                              NOW
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${getTypeBadgeClass(row.type)}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.start}</td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.end}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Night Table */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Moon size={20} />
                <h2 className="text-xl font-bold text-foreground">Night Choghadiya</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-bold text-muted-foreground uppercase">
                      <th className="px-3 py-3">#</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Start</th>
                      <th className="px-3 py-3">End</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {panchang.nightChoghadiya.map((row) => (
                      <tr key={`night-${row.num}-${row.name}`} className="hover:bg-white/5 transition-colors">
                        <td className="px-3 py-3 font-bold text-muted-foreground">{row.num}</td>
                        <td className="px-3 py-3 font-bold text-foreground">{row.name}</td>
                        <td className="px-3 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${getTypeBadgeClass(row.type)}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.start}</td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.end}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
