'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Heart,
  Briefcase,
  Activity,
  DollarSign,
  ArrowRight,
  ChevronDown,
  PhoneCall,
  Sparkles,
  User,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  Star,
  Compass,
  Bot,
} from 'lucide-react';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';
import CityLocationInput from '@/components/CityLocationInput';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function FreeDailyHoroscopePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [selectedZodiac, setSelectedZodiac] = useState('Aries');
  const [isCalculating, setIsCalculating] = useState(false);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [apiReportData, setApiReportData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    tob: '',
    pob: 'India',
    lat: '20.59',
    lon: '78.96',
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const zodiacSigns = [
    { name: 'Aries', dates: 'Mar 21 - Apr 19', symbol: '♈' },
    { name: 'Taurus', dates: 'Apr 20 - May 20', symbol: '♉' },
    { name: 'Gemini', dates: 'May 21 - Jun 20', symbol: '♊' },
    { name: 'Cancer', dates: 'Jun 21 - Jul 22', symbol: '♋' },
    { name: 'Leo', dates: 'Jul 23 - Aug 22', symbol: '♌' },
    { name: 'Virgo', dates: 'Aug 23 - Sep 22', symbol: '♍' },
    { name: 'Libra', dates: 'Sep 23 - Oct 22', symbol: '♎' },
    { name: 'Scorpio', dates: 'Oct 23 - Nov 21', symbol: '♏' },
    { name: 'Sagittarius', dates: 'Nov 22 - Dec 21', symbol: '♐' },
    { name: 'Capricorn', dates: 'Dec 22 - Jan 19', symbol: '♑' },
    { name: 'Aquarius', dates: 'Jan 20 - Feb 18', symbol: '♒' },
    { name: 'Pisces', dates: 'Feb 19 - Mar 20', symbol: '♓' },
  ];

  const predictions: Record<string, any> = {
    Aries: {
      overall:
        'High cosmic energy propels your career endeavors today. Focus on long-term goal setting and remain open to fresh collaborations.',
      career:
        'Promising growth in leadership roles. A new project proposal gets positive feedback.',
      love: 'Warm communication brings harmony to your relationship. Singles may meet someone special.',
      health: 'Vitality is high, but ensure proper hydration and afternoon rest.',
      finance: 'Favorable time for prudent investments and financial planning.',
      luckyNum: '7',
      luckyColor: 'Crimson Red',
    },
    Taurus: {
      overall:
        'Patience and steady perseverance yield excellent outcomes. Financial stability brings peace of mind.',
      career: 'Methodical work impresses senior management. Stay focused on quality.',
      love: 'Deep mutual understanding strengthens your bond.',
      health: 'Incorporate gentle stretches or yoga into your daily routine.',
      finance: 'Good day for savings and reviewing expenses.',
      luckyNum: '6',
      luckyColor: 'Emerald Green',
    },
    Gemini: {
      overall:
        'Mercurial curiosity inspires creative breakthroughs today. Effective networking opens unexpected doors.',
      career: 'Great day for presentations, brainstorming, and signing client agreements.',
      love: 'Lively banter and shared laughter deepen your relationship bond.',
      health: 'Keep your nervous system calm with mindful breathing.',
      finance: 'Short-term trade or intellectual ventures yield positive returns.',
      luckyNum: '5',
      luckyColor: 'Canary Yellow',
    },
    Cancer: {
      overall:
        'Moon transits favorable houses, bringing intuitive clarity and domestic harmony to your daily schedule.',
      career: 'Team members look to you for guidance and emotional support.',
      love: 'Heart-to-heart conversations heal past misunderstandings effortlessly.',
      health: 'Nourish yourself with warm herbal teas and light sattvic meals.',
      finance: 'Stable monetary inflow; ideal day to allocate funds for home enhancements.',
      luckyNum: '2',
      luckyColor: 'Pearl White',
    },
    Leo: {
      overall:
        'Surya Dev shines brightly on your 10th house axis, bestowing executive authority and vibrant charisma.',
      career: 'Your proposals receive applause from superiors and clients alike.',
      love: 'Generous gestures and romantic dinner plans spark delight.',
      health: 'Energy is robust; engage in cardiovascular exercise or brisk walking.',
      finance: 'Lucrative opportunities in business or side ventures present themselves.',
      luckyNum: '1',
      luckyColor: 'Royal Gold',
    },
    Virgo: {
      overall:
        'Analytical precision and attention to detail enable you to solve complex hurdles with ease today.',
      career: 'Organizing workflows and auditing reports yields stellar recognition.',
      love: 'Acts of thoughtful service communicate your love louder than words.',
      health: 'Focus on gut wellness and avoid overly spicy or street food.',
      finance: 'Disciplined budgeting ensures consistent wealth accumulation.',
      luckyNum: '4',
      luckyColor: 'Sage Green',
    },
    Libra: {
      overall:
        'Venusian grace fosters diplomatic negotiations and artistic inspiration across personal and work spheres.',
      career: 'Partnership negotiations and creative design tasks flourish effortlessly.',
      love: 'Romantic vibes are peaked; an ideal evening for date night or celebrations.',
      health: 'Balance work hours with relaxation to avoid mental fatigue.',
      finance: 'Financial balance restored through wise expense prioritization.',
      luckyNum: '6',
      luckyColor: 'Rose Pink',
    },
    Scorpio: {
      overall:
        'Mars and Ketu empower your investigative focus, allowing you to master intricate tasks ahead of deadlines.',
      career: 'Strategic planning and confidential negotiations swing in your favor.',
      love: 'Intense emotional connection brings profound closeness with your partner.',
      health: 'Hydrate well and practice evening meditation to ground your energy.',
      finance: 'Unexpected gains through past investments or settlements.',
      luckyNum: '9',
      luckyColor: 'Deep Maroon',
    },
    Sagittarius: {
      overall:
        'Jupiterian optimism fuels your desire for learning, philosophical discussions, and ambitious travel plans.',
      career: 'Mentorship and advisory roles bring deep satisfaction and prestige.',
      love: 'Sharing philosophical insights and adventures sparks romantic warmth.',
      health: 'High stamina; enjoy outdoor activities or fitness workouts.',
      finance: 'Long-term investments in education or assets prove highly auspicious.',
      luckyNum: '3',
      luckyColor: 'Saffron Yellow',
    },
    Capricorn: {
      overall:
        'Shani Dev rewards your disciplined dedication with steady progress on milestone career projects.',
      career: 'Structured execution impresses corporate decision-makers.',
      love: 'Loyalty and commitment form the bedrock of lasting marital happiness.',
      health: 'Pay attention to posture, joint mobility, and restful sleep.',
      finance: 'Sound financial day with opportunities for real estate or fixed deposits.',
      luckyNum: '8',
      luckyColor: 'Charcoal Grey',
    },
    Aquarius: {
      overall:
        'Innovative thinking and humanitarian ideas set you apart as a visionary collaborator today.',
      career: 'Technological innovations and group projects gain strong momentum.',
      love: 'Intellectual synergy and open conversations spark romantic intrigue.',
      health: 'Keep your circulation active with regular movement breaks.',
      finance: 'Promising returns from digital, research, or group investments.',
      luckyNum: '11',
      luckyColor: 'Electric Blue',
    },
    Pisces: {
      overall:
        'Spiritual intuition and creative empathy guide you toward peace, inspiration, and fruitful decisions.',
      career: 'Creative arts, healing, writing, and counseling ventures achieve peak flow.',
      love: 'Soulful empathy and compassionate understanding enchant your partner.',
      health: 'Rejuvenate near water or indulge in soothing music and rest.',
      finance: 'Charity and spiritual giving open auspicious avenues of abundance.',
      luckyNum: '12',
      luckyColor: 'Sea Green',
    },
  };

  const currentPred = predictions[selectedZodiac] || predictions['Aries'];

  const handleLocationChange = (city: string, details?: { lat?: string; lon?: string }) => {
    setFormData((prev) => ({
      ...prev,
      pob: city,
      lat: details?.lat || prev.lat,
      lon: details?.lon || prev.lon,
    }));
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const localDailyResult = {
      recommendationTitle: 'Personalized Daily Horoscope',
      recommendationName: `${formData.name || 'Devotee'}'s Vedic Daily Forecast`,
      timing: todayStr,
      duration: 'Valid for 24 Hours',
      name: formData.name || 'Devotee',
      gender: formData.gender,
      dob: formData.dob || '1995-01-01',
      tob: formData.tob || '12:00 PM',
      pob: formData.pob || 'India',
      sunSign: selectedZodiac,
      moonSign: 'Aries (Mesha)',
      ascendant: 'Leo (Simha)',
      nakshatra: 'Ashwini',
      luckyNumber: currentPred.luckyNum,
      luckyColor: currentPred.luckyColor,
      auspiciousTime: '10:30 AM - 12:15 PM (Abhijit Muhurat)',
      inauspiciousTime: '01:30 PM - 03:00 PM (Rahu Kaal)',
      predictions: {
        career: currentPred.career,
        love: currentPred.love,
        health: currentPred.health,
        finance: currentPred.finance,
      },
      astrologicalAnalysis: `Personalized Vedic Daily Reading for ${formData.name || 'Devotee'} (${todayStr}):\n\nYour birth chart alignment indicates a highly auspicious cosmic flow today. The planetary transit highlights your 10th House of career and 5th House of creative intelligence.\n\nWith Sun and Moon forming a harmonious trine, your decision-making will be sharp and respected by peers. Focus on initiating pending discussions before Rahu Kaal.`,
      procedure: `1. Offer Arghya (water) to Surya Dev at sunrise reciting the Gayatri Mantra 11 times.\n2. Keep a saffron or sandalwood tilak on your forehead for mental clarity.\n3. Feed birds or cows before noon to attract positive planetary vibrations.`,
      materials: `Pure copper vessel, saffron tilak, green grass for cows, pure ghee lamp`,
    };

    setDailyReport(localDailyResult);

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest-user',
          userEmail: user?.email || '',
          type: 'Personalized Daily Horoscope',
          details: {
            name: formData.name,
            gender: formData.gender,
            dob: formData.dob,
            time: formData.tob,
            place: formData.pob,
            lat: formData.lat,
            lon: formData.lon,
            zodiac: selectedZodiac,
          },
          reportData: localDailyResult,
        }),
      });

      const data = await res.json();
      if (data?.reportData) {
        setApiReportData(data.reportData);
        setDailyReport((prev: any) => ({
          ...prev,
          ...data.reportData,
          predictions: data.reportData.predictions || prev?.predictions,
          astrologicalAnalysis: data.reportData.astrologicalAnalysis || prev?.astrologicalAnalysis,
        }));
      }
    } catch (err) {
      console.warn('API daily horoscope call error:', err);
    }

    setIsCalculating(false);
    setTimeout(() => {
      document.getElementById('daily-report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section with Image as Background */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/horoscope_banner.jpg"
            alt="Daily Horoscope Banner"
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
                  Free Daily Planetary Predictions
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
                  Today&apos;s Free <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    Daily Horoscope
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#F8F3EA]/90 font-medium leading-relaxed max-w-2xl drop-shadow">
                  Select your zodiac sign below for today&apos;s predictions on career, love,
                  health, finance, lucky color, and lucky numbers.
                </p>
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
                    document
                      .getElementById('zodiac-selector')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center gap-2.5 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#C9952B]/40 text-sm sm:text-base cursor-pointer"
                >
                  Check Today&apos;s Horoscope <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => {
                    document
                      .getElementById('personalized-form-section')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-7 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 hover:scale-[1.02] transition-all backdrop-blur-sm text-sm sm:text-base shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Sparkles size={16} className="text-[#F6D075]" /> Personalized Birth Horoscope
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 Zodiac Quick Selector Section */}
      <section
        id="zodiac-selector"
        className="py-12 lg:py-16 bg-background relative z-10 space-y-6"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10 space-y-6">
          <div className="text-center space-y-2 mb-4">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">
              12 Rashi Transits
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Explore Today&apos;s Sun & Moon Sign Horoscopes
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select any zodiac sign for instantaneous transit overview
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {zodiacSigns.map((z) => (
              <button
                key={z.name}
                onClick={() => setSelectedZodiac(z.name)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedZodiac === z.name
                    ? 'bg-[#C9952B] text-white border-[#C9952B] font-bold shadow-md scale-105'
                    : 'glass-card text-foreground border-white/10 hover:border-[#C9952B]/50'
                }`}
              >
                <span className="text-xl">{z.symbol}</span>
                <span className="text-xs font-bold">{z.name}</span>
              </button>
            ))}
          </div>

          <motion.div
            key={selectedZodiac}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                <h2 className="text-xl font-bold text-[#C9952B]">
                  {selectedZodiac} Daily Forecast
                </h2>
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C9952B]/20 text-[#C9952B] text-xs font-bold">
                    Lucky Num: {currentPred.luckyNum}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    Lucky Color: {currentPred.luckyColor}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {currentPred.overall}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-[#C9952B] font-bold text-xs">
                  <Briefcase size={16} /> Career
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {currentPred.career}
                </p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <Heart size={16} /> Love & Relationships
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {currentPred.love}
                </p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <Activity size={16} /> Health
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {currentPred.health}
                </p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                  <DollarSign size={16} /> Finance
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {currentPred.finance}
                </p>
              </div>
            </div>

            {/* Dynamic Content Managed via Admin Panel */}
            <DynamicPageContent pageId="daily-horoscope" />

            {/* Consultation CTA Banner */}
            <AstrologerCtaBanner
              theme="gold"
              category="Daily Horoscope"
              title={`Curious About What Today Holds for ${selectedZodiac}?`}
              subtitle={`Connect with our verified Vedic astrologers for live astrological guidance on career decisions, lucky timings, and remedial practices for ${selectedZodiac}.`}
              badge="Talk to Daily Astrologer"
            />
          </motion.div>
        </div>
      </section>

      {/* PERSONALIZED BIRTH DETAILS FORM SECTION (EXACTLY BELOW ASTROLOGER BANNER) */}
      <section
        id="personalized-form-section"
        className="py-12 lg:py-16 bg-background/60 border-t border-white/5 relative z-10"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold text-[#713B32] uppercase tracking-widest bg-[#EDE4D5] px-3.5 py-1 rounded-full border border-[#E5D9C8] inline-block">
              Exact Vedic Birth Chart Calculation
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Generate Your Personalized Daily Horoscope
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
              Enter your exact birth date, time, and birthplace for an AI-synthesized Vedic forecast
              calculated specifically for your Lagna and Nakshatra.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Form Card */}
            <div className="lg:col-span-7 glass-card border border-[#B88A44]/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="space-y-1 border-b border-[#E5D9C8] pb-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#292522]">
                  Enter Your Birth Details
                </h3>
                <p className="text-xs text-[#6B5E55]">
                  All calculations are generated live and 100% private
                </p>
              </div>

              <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-[#C9952B]" /> Full Name*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] placeholder:text-[#6B5E55]/60 text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider">
                    Gender*
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="Male" className="bg-[#FFFDFC] text-[#292522]">
                      Male
                    </option>
                    <option value="Female" className="bg-[#FFFDFC] text-[#292522]">
                      Female
                    </option>
                    <option value="Other" className="bg-[#FFFDFC] text-[#292522]">
                      Other
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#C9952B]" /> Date of Birth*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} className="text-[#C9952B]" /> Time of Birth*
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.tob}
                    onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <CityLocationInput
                    label="Place of Birth (City Search & Map Location)*"
                    value={formData.pob}
                    onChange={handleLocationChange}
                    required
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#C9952B]/30 cursor-pointer"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} className="animate-spin text-[#292522]" /> Generating
                        Daily AI Horoscope...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} className="text-[#292522]" /> Generate My Daily
                        Horoscope
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Information & Value Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card border border-[#B88A44]/20 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-[#713B32] font-bold text-sm">
                  <Sparkles size={16} className="text-[#B88A44]" />
                  <span>Personalized Vedic Scope</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-[#292522]">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      ✓
                    </span>
                    <div>
                      <strong className="text-[#713B32]">Exact Lagna & Moon Sign Analysis</strong>
                      <p className="text-[#6B5E55] text-xs mt-0.5">
                        Calculates how current celestial transits impact your personal houses.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      ✓
                    </span>
                    <div>
                      <strong className="text-[#713B32]">Personalized 4-Pillar Daily Advice</strong>
                      <p className="text-[#6B5E55] text-xs mt-0.5">
                        Tailored recommendations for career, romance, health, and finance.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      ✓
                    </span>
                    <div>
                      <strong className="text-[#713B32]">Today&apos;s Lucky Elements</strong>
                      <p className="text-[#6B5E55] text-xs mt-0.5">
                        Auspicious hours, lucky color, lucky number, and daily mantra remedy.
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="pt-2 border-t border-[#E5D9C8] flex items-center justify-between text-xs text-[#6B5E55]">
                  <span className="flex items-center gap-1 font-semibold text-[#713B32]">
                    <ShieldCheck size={14} className="text-emerald-600" /> 100% Free & Private
                  </span>
                  <span>Instant AI Computation</span>
                </div>
              </div>

              {/* Astrologer Call CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#281123] to-[#170b16] text-white border border-[#B88A44]/30 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F6D075] uppercase tracking-wider">
                    Need Deep Personalized Guidance?
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Live
                  </span>
                </div>
                <p className="text-xs text-[#F8F3EA]/90 leading-relaxed">
                  Have a verified Vedic astrologer analyze your chart live over phone for precise
                  life guidance.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/talk-to-ai-astrologer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white font-extrabold text-xs transition-all shadow-md"
                  >
                    <Bot size={13} className="animate-pulse" /> AI Expert Astrologer
                  </Link>
                  <Link
                    href="/talk-to-astrologer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl gold-gradient-bg text-[#292522] font-extrabold text-xs hover:brightness-110 transition-all shadow-md"
                  >
                    <PhoneCall size={13} /> Consult Astrologer Live
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generated AI Daily Horoscope Report Section */}
      <AnimatePresence>
        {dailyReport && (
          <section
            id="daily-report-section"
            className="py-12 bg-background/50 border-t border-white/5 space-y-8"
          >
            <div className="max-w-6xl mx-auto px-6 lg:px-10 space-y-6">
              {/* Header Summary Banner */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/30">
                      {dailyReport.timing}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {dailyReport.duration}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {dailyReport.recommendationName}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Native: <strong className="text-foreground">{dailyReport.name}</strong> (
                    {dailyReport.gender}) • Birth: {dailyReport.dob} at {dailyReport.pob}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    href="/talk-to-ai-astrologer"
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white font-bold transition-all flex items-center gap-1.5 text-xs shadow-lg"
                  >
                    <Bot size={14} className="animate-pulse" /> AI Expert Astrologer
                  </Link>
                  <Link
                    href="/talk-to-astrologer"
                    className="px-5 py-2.5 rounded-full bg-[#713B32] hover:bg-[#552B24] text-white font-bold transition-colors flex items-center gap-1.5 text-xs shadow-lg"
                  >
                    <PhoneCall size={14} className="text-[#D8B66A]" /> Talk to Astrologer
                  </Link>
                  <Link
                    href="/my-reports"
                    className="px-5 py-2.5 rounded-full gold-gradient-bg text-white font-bold hover:opacity-90 transition-opacity flex items-center gap-2 text-xs shadow-lg"
                  >
                    <FileText size={14} /> View in My Reports
                  </Link>
                </div>
              </div>

              {/* Dynamic AI Astrological Analysis from API */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C9952B]/30 space-y-4 bg-[#C9952B]/5 shadow-xl">
                <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
                  <Sparkles size={20} /> AI Daily Cosmic Analysis
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {dailyReport.astrologicalAnalysis}
                </p>
                {dailyReport.procedure && (
                  <div className="pt-3 border-t border-white/10 space-y-1">
                    <span className="text-xs font-bold text-[#C9952B] uppercase tracking-wider">
                      Today&apos;s Recommended Ritual & Vedic Remedy
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {dailyReport.procedure}
                    </p>
                  </div>
                )}
              </div>

              {/* Today's 4 Pillar Predictions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-[#C9952B] font-bold text-sm">
                    <Briefcase size={18} /> Career & Business
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {dailyReport.predictions?.career || currentPred.career}
                  </p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Heart size={18} /> Love & Relationships
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {dailyReport.predictions?.love || currentPred.love}
                  </p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Activity size={18} /> Health & Energy
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {dailyReport.predictions?.health || currentPred.health}
                  </p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <DollarSign size={18} /> Wealth & Finance
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {dailyReport.predictions?.finance || currentPred.finance}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* SPECIALIZED HOROSCOPES NAVIGATION SECTION */}
      <section className="py-16 bg-background/50 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">
              Personalized Vedic Astrology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Explore Specialized Horoscopes
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Generate tailored birth chart predictions with your exact date and time of birth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Love Card */}
            <Link
              href="/services/horoscope/love"
              className="glass-card p-6 lg:p-8 rounded-3xl border border-rose-500/20 hover:border-rose-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-rose-500/10"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-rose-400 transition-colors">
                  Love & Relationship Horoscope
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Discover 7th House (Kalatra Bhava), Venusian strength, Manglik alignment,
                  relationship synergy, and marriage timing.
                </p>
              </div>
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1 pt-2">
                Open Love Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Finance Card */}
            <Link
              href="/services/horoscope/finance"
              className="glass-card p-6 lg:p-8 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <DollarSign size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  Finance & Wealth Horoscope
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Analyze Dhana Bhava (2nd House), Labha Bhava (11th House), Jupiter&apos;s wealth
                  yogas, and favorable investment timing.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-2">
                Open Finance Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Health Card */}
            <Link
              href="/services/horoscope/health"
              className="glass-card p-6 lg:p-8 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Activity size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                  Health & Vitality Horoscope
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Evaluate Lagna vitality, 6th House (Roga Bhava), Ayurvedic Tridosha balance
                  (Vata/Pitta/Kapha), and longevity remedies.
                </p>
              </div>
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 pt-2">
                Open Health Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
