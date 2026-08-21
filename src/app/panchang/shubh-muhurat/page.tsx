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
  Loader2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
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

    await new Promise((res) => setTimeout(res, 350));

    const calculated = calculatePanchang(selectedDate, location);
    setPanchang(calculated);
    setIsCalculating(false);

    setToastMessage(`Shubh Muhurat updated for ${calculated.formattedDate} (${location})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const auspiciousMuhurats = panchang.shubhMuhurats && panchang.shubhMuhurats.length > 0
    ? panchang.shubhMuhurats
    : [
        { name: 'Abhijit Muhurat', desc: 'Most powerful muhurat for all tasks', timing: `${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}`, isBest: true },
        { name: 'Brahma Muhurat', desc: 'Spiritual practice & meditation', timing: '04:20 AM – 05:08 AM' },
        { name: 'Amrit Kaal', desc: 'Favourable for new beginnings', timing: '06:15 AM – 07:45 AM' },
        { name: 'Vijay Muhurat', desc: 'Success in lawsuits & competitions', timing: '02:15 PM – 03:05 PM' },
        { name: 'Godhuli Muhurat', desc: 'Twilight evening prayer', timing: '06:45 PM – 07:10 PM' },
        { name: 'Nishita Muhurat', desc: 'Midnight spiritual dhyana', timing: '11:45 PM – 12:35 AM' },
      ];

  const relatedPages = [
    { title: 'Today Panchang', href: '/panchang/today-panchang' },
    { title: 'Tomorrow Panchang', href: '/panchang/tomorrow-panchang' },
    { title: 'Daily Horoscope', href: '/services/daily-horoscope' },
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

      <div className="pt-24 lg:pt-28 pb-16 px-6 lg:px-10 max-w-screen-2xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 shadow-md">
            <Sparkles size={14} className="text-[#F6D075]" />
            AUSPICIOUS TIMINGS FINDER
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Shubh Muhurat Today — Auspicious Timings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Discover Abhijit Muhurat, Brahma Muhurat, Vijay Muhurat, Amrit Kaal & Choghadiya auspicious windows for marriage, business, and travel.
          </p>
        </div>

        {/* Date & Location Selector */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 relative z-30 shadow-xl">
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
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-[#292522] font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isCalculating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{isCalculating ? 'Calculating...' : 'Get Shubh Muhurat'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-semibold text-[#C9952B]">
            <div className="flex items-center gap-2"><MapPin size={15} /><span>{location}</span></div>
            <div className="flex items-center gap-2"><Calendar size={15} /><span>{panchang.formattedDate}</span></div>
            <div className="flex items-center gap-2"><Sun size={15} /><span>Sunrise: {panchang.sunrise}</span></div>
            <div className="flex items-center gap-2"><Moon size={15} /><span>Sunset: {panchang.sunset}</span></div>
          </div>
        </div>

        {/* Animated Results Container */}
        <motion.div
          key={`${selectedDate}-${location}-${panchang.formattedDate}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-10"
        >
          {/* Top Highlight Abhijit Muhurat Card */}
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#B88A44]/50 bg-gradient-to-br from-[#2D1B28] via-[#432332] to-[#1E111B] text-center space-y-4 shadow-2xl text-white">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F6D075] bg-white/10 px-4 py-1.5 rounded-full border border-white/15 inline-flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#F6D075]" /> ✨ Today Abhijit Muhurat (Universally Auspicious)
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
              {panchang.abhijitMuhurat.start} – {panchang.abhijitMuhurat.end}
            </h2>
            <p className="text-xs sm:text-sm text-white/85 max-w-xl mx-auto leading-relaxed">
              Calculated for <strong>{location}</strong> on <strong>{panchang.formattedDate}</strong>. Governed by Lord Vishnu, this is the prime time slot for business contracts, asset acquisitions, ceremonies, and travel.
            </p>
          </div>

          {/* Auspicious Timings List Table */}
          <div className="bg-[#FFFDFC] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl text-[#292522]">
            <div className="space-y-1 border-b border-[#E5D9C8] pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-1">
                Auspicious Calendar
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#292522] flex items-center gap-2">
                <CheckCircle2 size={24} className="text-emerald-700" /> Auspicious Periods for {panchang.formattedDate}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5E55]">
                Exact start and end times dynamically calculated based on local sunrise and solar position in {location}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5D9C8] bg-[#F8F3EA] text-left text-xs font-bold text-[#713B32] uppercase">
                    <th className="px-4 py-3.5 rounded-l-xl">Muhurat Name</th>
                    <th className="px-4 py-3.5">Significance & Purpose</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Timing Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D9C8]/70">
                  {auspiciousMuhurats.map((row) => (
                    <tr
                      key={row.name}
                      className={`hover:bg-[#F8F3EA]/70 transition-colors ${
                        row.isBest ? 'bg-emerald-50/80 font-bold border-l-4 border-l-emerald-600' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-bold text-[#292522] flex items-center gap-2">
                        {row.isBest && <Sparkles size={15} className="text-emerald-600 shrink-0" />}
                        <span>{row.name}</span>
                      </td>
                      <td className="px-4 py-4 text-[#6B5E55] text-xs sm:text-sm">{row.desc}</td>
                      <td className="px-4 py-4 font-mono text-xs sm:text-sm font-bold text-[#713B32] whitespace-nowrap">
                        <span className="bg-[#F8F3EA] px-3 py-1.5 rounded-lg border border-[#E5D9C8]">
                          {row.timing}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Related Pages Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {relatedPages.map((page) => (
              <Link
                key={page.title}
                href={page.href}
                className="p-3 rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#713B32] hover:shadow-md text-xs font-semibold text-[#292522] text-center flex items-center justify-center gap-1 transition-all group"
              >
                <span>{page.title}</span>
                <ChevronRight size={12} className="text-[#713B32] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>

          {/* Astrologer Consultation CTA */}
          <AstrologerCtaBanner
            theme="gold"
            category="Shubh Muhurat & Timings"
            title="Need Personalized Muhurat for Marriage, Property or Business?"
            subtitle="Get exact Lagna, Kundli alignment, and auspicious planetary hours calculated by expert Vedic astrologers."
            badge="Consult Vedic Astrologer"
          />
        </motion.div>
      </div>
    </div>
  );
}
