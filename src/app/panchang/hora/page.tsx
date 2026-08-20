'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Sun, Moon, Sparkles, CheckCircle2, XCircle, Info, ChevronRight, HelpCircle, ShieldCheck } from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

interface PlanetHoraInfo {
  planet: string;
  sanskrit: string;
  element: string;
  nature: 'Highly Auspicious' | 'Auspicious' | 'Moderate' | 'Fierce / Caution';
  deity: string;
  color: string;
  bestFor: string;
  avoidFor: string;
  description: string;
}

const PLANETARY_HORA_PROFILES: Record<string, PlanetHoraInfo> = {
  Sun: {
    planet: 'Sun (Surya)',
    sanskrit: 'सूर्य होरा',
    element: 'Fire / Tejas',
    nature: 'Auspicious',
    deity: 'Lord Surya / Shiva',
    color: '#F59E0B',
    bestFor: 'Executive decisions, government work, meeting authorities, career promotions, leadership speeches, purchasing gold/copper, eye health treatments.',
    avoidFor: 'Submissive negotiation, clandestine deals, borrowing money.',
    description: 'Surya Hora infuses actions with vitality, authority, solar radiance, and commanding influence. Ideal for administrative and royal tasks.',
  },
  Venus: {
    planet: 'Venus (Shukra)',
    sanskrit: 'शुक्र होरा',
    element: 'Water / Jala',
    nature: 'Highly Auspicious',
    deity: 'Goddess Lakshmi',
    color: '#EC4899',
    bestFor: 'Romantic dates, purchasing vehicles, luxury shopping, wearing new clothes/gems, art & music creation, weddings, beauty treatments.',
    avoidFor: 'Arguments, competitive sports, surgical cuts.',
    description: 'Shukra Hora enhances beauty, love, wealth, and artistic elegance. Actions initiated here yield sensual joy and financial prosperity.',
  },
  Mercury: {
    planet: 'Mercury (Budh)',
    sanskrit: 'बुध होरा',
    element: 'Earth / Prithvi',
    nature: 'Auspicious',
    deity: 'Lord Vishnu / Ganesha',
    color: '#10B981',
    bestFor: 'Signing business contracts, trade, banking transactions, intellectual writing, study, learning astrology, accounting, media broadcasts.',
    avoidFor: 'Emotional disputes, impulsive speculations.',
    description: 'Budh Hora bestows quick wit, communicative eloquence, analytical sharpness, and trade success. Optimal for commercial negotiations.',
  },
  Moon: {
    planet: 'Moon (Chandra)',
    sanskrit: 'चन्द्र होरा',
    element: 'Water / Jala',
    nature: 'Auspicious',
    deity: 'Lord Shiva / Parvati',
    color: '#60A5FA',
    bestFor: 'Travel, starting journeys, water-related business, gardening, public relations, purchasing silver/pearls, emotional reconciliations, culinary arts.',
    avoidFor: 'Deep surgeries, long-term rigid commitments during a weak moon.',
    description: 'Chandra Hora brings emotional fluidity, soothing peace, social receptivity, and success in public-facing interactions.',
  },
  Saturn: {
    planet: 'Saturn (Shani)',
    sanskrit: 'शनि होरा',
    element: 'Air / Vayu',
    nature: 'Fierce / Caution',
    deity: 'Lord Shani / Hanuman',
    color: '#6B7280',
    bestFor: 'Real estate, laying building foundations, land purchases, construction, dealing with heavy machinery/iron/oil, debt repayments, deep meditation.',
    avoidFor: 'Starting joyous celebrations, weddings, starting journeys, buying new luxury clothing.',
    description: 'Shani Hora brings endurance, discipline, karmic focus, and grounded stability. Excellent for long-term construction and clearing liabilities.',
  },
  Jupiter: {
    planet: 'Jupiter (Guru)',
    sanskrit: 'गुरु होरा',
    element: 'Ether / Akasha',
    nature: 'Highly Auspicious',
    deity: 'Lord Brihaspati / Brahma',
    color: '#EAB308',
    bestFor: 'Supreme for all auspicious beginnings: opening bank accounts, purchasing gold, wedding rituals, higher education, consulting gurus, legal victories.',
    avoidFor: 'Unethical practices, gambling, negative speech.',
    description: 'Guru Hora is the most benevolent of all planetary hours. Blessed with divine grace, wisdom, and auspicious abundance.',
  },
  Mars: {
    planet: 'Mars (Mangal)',
    sanskrit: 'मंगल होरा',
    element: 'Fire / Tejas',
    nature: 'Moderate',
    deity: 'Lord Kartikeya / Hanuman',
    color: '#EF4444',
    bestFor: 'Sports, athletic training, competitive exams, surgical operations, real estate litigation, purchasing tools/vehicles, military/police operations.',
    avoidFor: 'Peaceful negotiations, romantic proposals, signing delicate treaties.',
    description: 'Mangal Hora generates fierce energy, courage, physical vigor, and competitive dominance. Best utilized for bold, assertive breakthroughs.',
  },
};

// Chaldean / Vedic Planetary order descending by orbital speed
const PLANETARY_ORDER = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];

const DAY_FIRST_HORA_PLANET: Record<string, string> = {
  Sunday: 'Sun',
  Monday: 'Moon',
  Tuesday: 'Mars',
  Wednesday: 'Mercury',
  Thursday: 'Jupiter',
  Friday: 'Venus',
  Saturday: 'Saturn',
};

function formatMinsTo12Hr(totalMins: number): string {
  const m = (Math.round(totalMins) + 1440) % 1440;
  const hours = Math.floor(m / 60);
  const mins = Math.floor(m % 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
}

export default function HoraPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('New Delhi, Delhi, India');
  const [panchang, setPanchang] = useState<PanchangData>(() =>
    calculatePanchang(new Date().toISOString().split('T')[0], 'New Delhi, Delhi, India')
  );

  const [activeTab, setActiveTab] = useState<'day' | 'night'>('day');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setPanchang(calculatePanchang(selectedDate, location));
  }, [selectedDate, location]);

  // Compute 24 Horas
  const targetDate = new Date(selectedDate);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[targetDate.getDay()] || 'Sunday';

  const monthFactor = Math.sin((targetDate.getMonth() / 12) * Math.PI * 2);
  const sunriseMins = 350 + monthFactor * 15; // approx 05:50 AM
  const sunsetMins = 1120 - monthFactor * 20; // approx 06:40 PM

  const dayDurationMins = sunsetMins - sunriseMins;
  const nightDurationMins = 1440 - dayDurationMins;

  const dayHoraDuration = dayDurationMins / 12;
  const nightHoraDuration = nightDurationMins / 12;

  const firstDayPlanet = DAY_FIRST_HORA_PLANET[dayName] || 'Sun';
  const firstDayPlanetIdx = PLANETARY_ORDER.indexOf(firstDayPlanet);

  const now = new Date();
  const isToday = now.toDateString() === targetDate.toDateString();
  const currentNowMins = now.getHours() * 60 + now.getMinutes();

  // 12 Daytime Horas
  const dayHoras = Array.from({ length: 12 }).map((_, idx) => {
    const planet = PLANETARY_ORDER[(firstDayPlanetIdx + idx) % 7];
    const sMins = sunriseMins + idx * dayHoraDuration;
    const eMins = sMins + dayHoraDuration;
    const isCurrent = isToday && currentNowMins >= sMins && currentNowMins < eMins;
    const profile = PLANETARY_HORA_PROFILES[planet];

    return {
      num: idx + 1,
      planet,
      startTime: formatMinsTo12Hr(sMins),
      endTime: formatMinsTo12Hr(eMins),
      isCurrent,
      profile,
    };
  });

  // 12 Nighttime Horas
  const day12thPlanetIdx = (firstDayPlanetIdx + 11) % 7;
  const nightFirstPlanetIdx = (day12thPlanetIdx + 1) % 7;

  const nightHoras = Array.from({ length: 12 }).map((_, idx) => {
    const planet = PLANETARY_ORDER[(nightFirstPlanetIdx + idx) % 7];
    const sMins = sunsetMins + idx * nightHoraDuration;
    const eMins = sMins + nightHoraDuration;
    const isCurrent = isToday && (currentNowMins >= sMins || currentNowMins < (sMins + nightHoraDuration - 1440));
    const profile = PLANETARY_HORA_PROFILES[planet];

    return {
      num: idx + 13,
      planet,
      startTime: formatMinsTo12Hr(sMins),
      endTime: formatMinsTo12Hr(eMins),
      isCurrent,
      profile,
    };
  });

  // Determine currently active Hora
  const currentHora = [...dayHoras, ...nightHoras].find((h) => h.isCurrent) || dayHoras[0];

  const faqs = [
    {
      q: 'What is a Hora in Vedic Astrology?',
      a: 'The word "Hora" is the Vedic origin of the English word "Hour". The 24-hour day is divided into 24 planetary hours (12 during the day from Sunrise to Sunset, and 12 during the night from Sunset to Sunrise). Each Hora is ruled by one of the 7 classic visible planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn).',
    },
    {
      q: 'Which Hora is best for financial and business decisions?',
      a: 'Guru Hora (Jupiter) and Budh Hora (Mercury) are supreme for finances. Guru Hora is unmatched for long-term investments, buying gold, opening accounts, and major purchases. Budh Hora is ideal for day-to-day trade, signing contracts, marketing, and accounting.',
    },
    {
      q: 'What is the best Hora for marriage proposals, buying vehicles, and arts?',
      a: 'Shukra Hora (Venus) is the finest hour for romance, marriage proposals, purchasing new luxury vehicles, clothes, cosmetics, jewelry, and artistic performances.',
    },
    {
      q: 'How is the first Hora of the day determined?',
      a: 'The first Hora at Sunrise is always ruled by the Lord of the Weekday (Ravivar = Sun, Somavar = Moon, Mangalvar = Mars, Budhavar = Mercury, Guruvar = Jupiter, Shukravar = Venus, Shanivar = Saturn). The subsequent hours follow the ancient Chaldean speed sequence: Sun → Venus → Mercury → Moon → Saturn → Jupiter → Mars.',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      <div className="pt-24 lg:pt-28 pb-16 px-6 lg:px-10 max-w-screen-2xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-md">
            <Clock size={14} className="text-blue-400" />
            24-HOUR PLANETARY HORA CALCULATOR
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Today Hora Timings (Planetary Hours)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
            Calculate precise hourly planetary rulers to optimize your business decisions, meetings, investments, journeys, and spiritual practices.
          </p>
        </div>

        {/* Date & Location Input Form */}
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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location / City</label>
              <CityLocationInput value={location} onChange={(city: string) => setLocation(city)} placeholder="Search city" />
            </div>
            <button
              onClick={() => setPanchang(calculatePanchang(selectedDate, location))}
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-[#292522] font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Get Hora Timings
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-semibold text-[#C9952B]">
            <div className="flex items-center gap-2"><MapPin size={15} /><span>{location}</span></div>
            <div className="flex items-center gap-2"><Calendar size={15} /><span>{panchang.formattedDate}</span></div>
            <div className="flex items-center gap-2"><Sun size={15} /><span>Sunrise: {panchang.sunrise}</span></div>
            <div className="flex items-center gap-2"><Moon size={15} /><span>Sunset: {panchang.sunset}</span></div>
          </div>
        </div>

        {/* Current Active Planetary Hora Spotlight Card */}
        <div className="glass-card p-6 sm:p-8 lg:p-10 rounded-3xl border border-blue-500/40 bg-gradient-to-br from-[#121c2e]/90 via-[#18233c]/80 to-[#0e1626]/95 shadow-2xl text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-flex items-center gap-1.5 mb-2">
                <Sparkles size={13} /> Active Planetary Ruler
              </span>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-300">
                  {currentHora.profile.planet} <span className="text-xl font-serif text-white/80">({currentHora.profile.sanskrit})</span>
                </h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  currentHora.profile.nature === 'Highly Auspicious'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : currentHora.profile.nature === 'Auspicious'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : currentHora.profile.nature === 'Moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {currentHora.profile.nature}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-white/70 uppercase">Active Timing Slot</p>
              <p className="text-lg sm:text-2xl font-bold font-mono text-[#F6D075]">{currentHora.startTime} – {currentHora.endTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-white/70">Ruling Deity</span>
              <p className="text-sm font-bold text-[#F6D075]">{currentHora.profile.deity}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-white/70">Cosmic Element</span>
              <p className="text-sm font-bold text-white">{currentHora.profile.element}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-white/70">Weekday Ruler</span>
              <p className="text-sm font-bold text-white">{dayName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-white/70">Day Slot No.</span>
              <p className="text-sm font-bold text-white">Hora #{currentHora.num}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase">
                <CheckCircle2 size={14} /> Highly Recommended Actions
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{currentHora.profile.bestFor}</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase">
                <XCircle size={14} /> Inadvisable Activities
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{currentHora.profile.avoidFor}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed pt-1">
            <strong>Planetary Influence:</strong> {currentHora.profile.description}
          </p>
        </div>

        {/* 24-Hour Hora Timings Interactive Schedule */}
        <div className="bg-[#FFFDFC] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl text-[#292522]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5D9C8] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-1.5">
                24-Hour Almanac
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
                Full Day & Night Hora Schedule
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5E55]">
                Exact start and end times for all 12 Day Horas and 12 Night Horas calculated for {location}.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('day')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'day'
                    ? 'bg-[#713B32] text-white shadow-md'
                    : 'text-[#6B5E55] hover:text-[#292522]'
                }`}
              >
                <Sun size={15} /> Day Horas (12)
              </button>
              <button
                onClick={() => setActiveTab('night')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'night'
                    ? 'bg-[#713B32] text-white shadow-md'
                    : 'text-[#6B5E55] hover:text-[#292522]'
                }`}
              >
                <Moon size={15} /> Night Horas (12)
              </button>
            </div>
          </div>

          {/* Horas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(activeTab === 'day' ? dayHoras : nightHoras).map((hora) => (
              <div
                key={hora.num}
                className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  hora.isCurrent
                    ? 'bg-[#281123] text-white border-[#B88A44] shadow-xl ring-2 ring-[#B88A44]/40'
                    : 'bg-[#F8F3EA] text-[#292522] border-[#E5D9C8] hover:shadow-md'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${
                      hora.isCurrent ? 'bg-white/20 text-[#F6D075]' : 'bg-white border border-[#E5D9C8] text-[#713B32]'
                    }`}>
                      #{hora.num} {activeTab === 'day' ? 'Day' : 'Night'}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      hora.profile.nature === 'Highly Auspicious'
                        ? 'bg-emerald-100 text-emerald-800'
                        : hora.profile.nature === 'Auspicious'
                        ? 'bg-blue-100 text-blue-800'
                        : hora.profile.nature === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {hora.profile.nature}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold">
                      {hora.profile.planet} <span className="text-xs font-serif opacity-80">({hora.profile.sanskrit})</span>
                    </h4>
                    <p className={`text-sm font-bold font-mono ${hora.isCurrent ? 'text-[#F6D075]' : 'text-[#713B32]'}`}>
                      {hora.startTime} – {hora.endTime}
                    </p>
                  </div>

                  <p className={`text-xs leading-relaxed ${hora.isCurrent ? 'text-white/90' : 'text-[#6B5E55]'}`}>
                    <strong>Best for:</strong> {hora.profile.bestFor}
                  </p>
                </div>

                <div className={`pt-2 border-t text-[11px] flex items-center justify-between ${
                  hora.isCurrent ? 'border-white/15 text-white/70' : 'border-[#E5D9C8]/80 text-[#6B5E55]'
                }`}>
                  <span>Deity: {hora.profile.deity}</span>
                  {hora.isCurrent && <span className="font-bold text-[#F6D075] animate-pulse">● LIVE NOW</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7 Planetary Horas Comprehensive Encyclopedia Guide */}
        <div className="bg-[#FFFDFC] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl text-[#292522]">
          <div className="border-b border-[#E5D9C8] pb-4 space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-1">
              Encyclopedia
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              Complete Guide to the 7 Planetary Horas
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E55]">
              How each planet governs specific human actions, elements, and timing throughout the day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(PLANETARY_HORA_PROFILES).map(([key, info]) => (
              <div
                key={key}
                className="p-5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#713B32]">{info.element}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      info.nature === 'Highly Auspicious'
                        ? 'bg-emerald-100 text-emerald-800'
                        : info.nature === 'Auspicious'
                        ? 'bg-blue-100 text-blue-800'
                        : info.nature === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {info.nature}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#292522]">
                      {info.planet} <span className="text-sm font-serif text-[#713B32]">({info.sanskrit})</span>
                    </h4>
                    <p className="text-xs text-[#6B5E55]">Deity: <strong className="text-[#292522]">{info.deity}</strong></p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-emerald-800 font-semibold flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓ Best:</span> {info.bestFor}
                    </p>
                    <p className="text-rose-800 font-semibold flex items-start gap-1">
                      <span className="text-rose-600 font-bold">✗ Avoid:</span> {info.avoidFor}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-[#6B5E55] pt-2 border-t border-[#E5D9C8]/80 leading-relaxed">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-[#FFFDFC] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl text-[#292522]">
          <div className="space-y-1 border-b border-[#E5D9C8] pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-1">
              Knowledge Base
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              Frequently Asked Questions About Hora Timings
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#E5D9C8] rounded-2xl overflow-hidden bg-[#F8F3EA] transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[#292522] flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={18} className="text-[#B88A44] shrink-0" />
                    {faq.q}
                  </span>
                  <span className="text-lg text-[#713B32] font-mono">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#6B5E55] leading-relaxed border-t border-[#E5D9C8]/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Panchang Calculators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/panchang/tithi"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C9952B] transition-all text-center space-y-1 group"
          >
            <Moon size={20} className="mx-auto text-[#F6D075] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-foreground">Today Tithi</p>
          </Link>
          <Link
            href="/panchang/karana"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C9952B] transition-all text-center space-y-1 group"
          >
            <Sparkles size={20} className="mx-auto text-[#F6D075] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-foreground">Karana Timings</p>
          </Link>
          <Link
            href="/panchang/choghadiya"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C9952B] transition-all text-center space-y-1 group"
          >
            <Sun size={20} className="mx-auto text-[#F6D075] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-foreground">Choghadiya</p>
          </Link>
          <Link
            href="/panchang/rahu-kaal"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C9952B] transition-all text-center space-y-1 group"
          >
            <Clock size={20} className="mx-auto text-[#F6D075] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-foreground">Rahu Kaal</p>
          </Link>
          <Link
            href="/panchang/shubh-muhurat"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C9952B] transition-all text-center space-y-1 group"
          >
            <ShieldCheck size={20} className="mx-auto text-[#F6D075] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-foreground">Shubh Muhurat</p>
          </Link>
          <Link
            href="/panchang/today-panchang"
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C9952B] transition-all text-center space-y-1 group"
          >
            <Calendar size={20} className="mx-auto text-[#F6D075] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-foreground">Full Panchang</p>
          </Link>
        </div>

        {/* Consultation CTA Banner */}
        <AstrologerCtaBanner
          theme="gold"
          category="Panchang & Hora"
          title="Plan Your Important Events with Vedic Planetary Horas"
          subtitle="Consult our expert astrologers to calculate individualized Lagna & planetary Hora alignments for business launches, asset purchases, and legal success."
          badge="Consult Vedic Astrologer"
        />
      </div>
    </div>
  );
}
