'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

export default function KaranaPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('New Delhi, Delhi, India');
  const [panchang, setPanchang] = useState<PanchangData>(() =>
    calculatePanchang(new Date().toISOString().split('T')[0], 'New Delhi, Delhi, India')
  );

  useEffect(() => {
    setPanchang(calculatePanchang(selectedDate, location));
  }, [selectedDate, location]);

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      <div className="pt-24 lg:pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20">
            HALF LUNAR DAY CALCULATOR
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Today Karana Timings
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Discover active Karana periods for half-tithi actions, trade, and business.
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
              onClick={() => setPanchang(calculatePanchang(selectedDate, location))}
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-white font-bold text-sm shadow-lg"
            >
              Get Karana
            </button>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C9952B]/40 bg-[#C9952B]/10 text-center space-y-2">
          <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles size={16} /> Active Karana
          </span>
          <h2 className="text-3xl font-bold text-foreground">{panchang.karana}</h2>
        </div>
      </div>
    </div>
  );
}
