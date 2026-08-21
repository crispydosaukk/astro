'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sun, Moon, Loader2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

export default function VaarPage() {
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
    await new Promise((res) => setTimeout(res, 350));
    const calculated = calculatePanchang(selectedDate, location);
    setPanchang(calculated);
    setIsCalculating(false);
    setToastMessage(`Vaar calculated for ${calculated.formattedDate} (${location})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const vaarLords = [
    { day: 'Sunday (Ravivar)', planet: 'Sun (Surya)', nature: 'Administrative & Power', fastDeity: 'Lord Surya' },
    { day: 'Monday (Somavar)', planet: 'Moon (Chandra)', nature: 'Emotional & Peace', fastDeity: 'Lord Shiva' },
    { day: 'Tuesday (Mangalvar)', planet: 'Mars (Mangal)', nature: 'Courage & Action', fastDeity: 'Lord Hanuman' },
    { day: 'Wednesday (Budhavar)', planet: 'Mercury (Budh)', nature: 'Intellect & Trade', fastDeity: 'Lord Ganesha' },
    { day: 'Thursday (Guruvar)', planet: 'Jupiter (Guru)', nature: 'Wisdom & Wealth', fastDeity: 'Lord Brihaspati' },
    { day: 'Friday (Shukravar)', planet: 'Venus (Shukra)', nature: 'Arts & Harmony', fastDeity: 'Goddess Lakshmi' },
    { day: 'Saturday (Shanivar)', planet: 'Saturn (Shani)', nature: 'Discipline & Karma', fastDeity: 'Lord Shani' },
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
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20">
            WEEKDAY PLANETARY LORDS
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Today Vaar — Planetary Day Ruler
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Discover today&apos;s Vaar lord, ruling planetary energy, and recommended fasting rituals.
          </p>
        </div>

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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location / City</label>
              <CityLocationInput value={location} onChange={(city: string) => setLocation(city)} placeholder="Search city" />
            </div>
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C9952B]/20 active:scale-95 cursor-pointer disabled:opacity-75"
            >
              {isCalculating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{isCalculating ? 'Calculating...' : 'Check Vaar'}</span>
            </button>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C9952B]/40 bg-[#C9952B]/10 text-center space-y-2">
          <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">Active Weekday Ruler</span>
          <h2 className="text-3xl font-bold text-foreground">{panchang.weekday}</h2>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-foreground">The 7 Vaars and Planetary Rulers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-left text-xs font-bold text-muted-foreground uppercase">
                  <th className="px-4 py-3">Vaar</th>
                  <th className="px-4 py-3">Ruling Planet</th>
                  <th className="px-4 py-3">Nature</th>
                  <th className="px-4 py-3">Fasting Deity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vaarLords.map((row) => (
                  <tr key={row.day} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">{row.day}</td>
                    <td className="px-4 py-3 text-[#C9952B] font-bold">{row.planet}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.nature}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">{row.fastDeity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
