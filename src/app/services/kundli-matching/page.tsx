'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  User,
  ArrowRight,
  ChevronDown,
  Globe,
  CheckCircle2,
  FileText,
  PhoneCall,
  Star,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';
import { useUserData } from '@/lib/useUserData';
import { calculateAshtakootGunMilan } from '@/lib/vedicAstrologyEngine';

export default function FreeKundliMatchingPage() {
  const { user } = useUserData();
  const [groomData, setGroomData] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
    lat: '',
    lon: '',
  });
  const [brideData, setBrideData] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
    lat: '',
    lon: '',
  });
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [apiReportData, setApiReportData] = useState<any | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatching(true);

    // 1. Calculate Authentic Vedic Ashtakoot Gun Milan mathematically
    const computedMatch = calculateAshtakootGunMilan(
      groomData.dob || '1995-01-01',
      groomData.tob || '12:00',
      groomData.pob || 'India',
      brideData.dob || '1996-01-01',
      brideData.tob || '12:00',
      brideData.pob || 'India',
      groomData.name || 'Your Name',
      brideData.name || "Partner's Name"
    );

    setMatchResult(computedMatch);

    // 2. Call OpenAI API endpoint for deep personalized Astrotalk-grade dynamic synthesis
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest-user',
          userEmail: user?.email || '',
          type: 'Free Kundli Matching Report',
          details: {
            groomName: groomData.name,
            brideName: brideData.name,
            dob: `${groomData.dob} & ${brideData.dob}`,
            time: `${groomData.tob} & ${brideData.tob}`,
            place: `${groomData.pob} & ${brideData.pob}`,
          },
          reportData: computedMatch,
        }),
      });
      const data = await res.json();
      if (data?.reportData) {
        setApiReportData(data.reportData);
        setMatchResult(data.reportData);
      }
    } catch (err) {
      console.warn('API report call error:', err);
    }

    setIsMatching(false);
    setTimeout(() => {
      document.getElementById('match-report')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const ashtakootGuide = [
    {
      title: 'Varna Koot (1 Point)',
      desc: 'Evaluates mental compatibility, spiritual ego, and mutual respect between bride and groom.',
    },
    {
      title: 'Vashya Koot (2 Points)',
      desc: 'Measures magnetic attraction, mutual influence, and power balance in marriage.',
    },
    {
      title: 'Tara Koot (3 Points)',
      desc: 'Calculates planetary birth star harmony for long-term health, destiny, and mutual well-being.',
    },
    {
      title: 'Yoni Koot (4 Points)',
      desc: 'Determines physical compatibility, intimacy, and biological harmony between partners.',
    },
    {
      title: 'Graha Maitri (5 Points)',
      desc: 'Assesses friendship, communication, intellectual connection, and emotional understanding.',
    },
    {
      title: 'Gana Koot (6 Points)',
      desc: 'Evaluates behavioral temperament (Deva, Manushya, Rakshasa) and daily lifestyle harmony.',
    },
    {
      title: 'Bhakoot Koot (7 Points)',
      desc: 'Governs financial prosperity, family growth, emotional depth, and marital longevity.',
    },
    {
      title: 'Nadi Koot (8 Points)',
      desc: 'The most critical 8-point factor evaluating health of future progeny and genetic compatibility.',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section with Image as Background */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/kundli_matching_banner.jpg"
            alt="Kundli Matching Background"
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
                  Free Vedic Gun Milan & Compatibility
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
                  Free Online <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    Kundli Matching
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#F8F3EA]/90 font-medium leading-relaxed max-w-2xl drop-shadow">
                  Check marriage compatibility, Ashta Koota 36 Gun Milan score, Nadi Dosha, and
                  Manglik alignment between you and your partner.
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
                  <Star size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">
                    36 Gun Milan Score
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md shadow-lg">
                  <Heart size={16} className="text-rose-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">
                    Manglik Dosha Check
                  </span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md shadow-lg">
                  <ShieldCheck size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">
                    Ashta Koota Analysis
                  </span>
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
                    document
                      .getElementById('matching-form')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center gap-2.5 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#C9952B]/40 text-sm sm:text-base"
                >
                  Match Kundli Now <ArrowRight size={18} />
                </button>
                <Link
                  href="/talk-to-ai-astrologer"
                  className="px-7 py-4 rounded-full bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white font-bold hover:scale-[1.02] transition-all text-sm sm:text-base shadow-lg shadow-[#C9952B]/30 flex items-center gap-2"
                >
                  <Bot size={18} className="animate-pulse" /> AI Expert Astrologer
                </Link>
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

      {/* Matching Form Section */}
      <section id="matching-form" className="py-12 lg:py-16 bg-background relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold text-[#713B32] uppercase tracking-widest bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
              Kundli Milan Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              Enter Partner Details for 36 Gun Milan
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E55]">
              Calculate Ashta Koota compatibility, Nadi Dosha, and Manglik cancellation
            </p>
          </div>

          <form onSubmit={handleMatch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Boy Details */}
              <div className="glass-card p-6 sm:p-7 rounded-3xl border border-[#B88A44]/30 space-y-4 shadow-xl">
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-[#713B32]">
                  <User size={18} className="text-[#B88A44]" /> Boy Details
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#713B32]">Full Name*</label>
                    <input
                      type="text"
                      required
                      placeholder="Boy's Full Name"
                      value={groomData.name}
                      onChange={(e) => setGroomData({ ...groomData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] placeholder:text-[#6B5E55]/60 text-sm outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#713B32]">Birth Date*</label>
                      <input
                        type="date"
                        required
                        value={groomData.dob}
                        onChange={(e) => setGroomData({ ...groomData, dob: e.target.value })}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-xs sm:text-sm outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 shadow-sm cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#713B32]">Birth Time*</label>
                      <input
                        type="time"
                        required
                        value={groomData.tob}
                        onChange={(e) => setGroomData({ ...groomData, tob: e.target.value })}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-xs sm:text-sm outline-none focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 shadow-sm cursor-pointer"
                      />
                    </div>
                  </div>
                  <CityLocationInput
                    label="Birth Place (City Search)*"
                    value={groomData.pob}
                    onChange={(city, details) =>
                      setGroomData({
                        ...groomData,
                        pob: city,
                        lat: details?.lat || '',
                        lon: details?.lon || '',
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Girl Details */}
              <div className="glass-card p-6 sm:p-7 rounded-3xl border border-rose-500/30 space-y-4 shadow-xl">
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-rose-700">
                  <Heart size={18} className="text-rose-500" /> Girl Details
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#713B32]">Full Name*</label>
                    <input
                      type="text"
                      required
                      placeholder="Girl's Full Name"
                      value={brideData.name}
                      onChange={(e) => setBrideData({ ...brideData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] placeholder:text-[#6B5E55]/60 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#713B32]">Birth Date*</label>
                      <input
                        type="date"
                        required
                        value={brideData.dob}
                        onChange={(e) => setBrideData({ ...brideData, dob: e.target.value })}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-xs sm:text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 shadow-sm cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#713B32]">Birth Time*</label>
                      <input
                        type="time"
                        required
                        value={brideData.tob}
                        onChange={(e) => setBrideData({ ...brideData, tob: e.target.value })}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-xs sm:text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 shadow-sm cursor-pointer"
                      />
                    </div>
                  </div>
                  <CityLocationInput
                    label="Birth Place (City Search)*"
                    value={brideData.pob}
                    onChange={(city, details) =>
                      setBrideData({
                        ...brideData,
                        pob: city,
                        lat: details?.lat || '',
                        lon: details?.lon || '',
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={isMatching}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full gold-gradient-bg text-[#292522] font-extrabold text-sm sm:text-base shadow-xl hover:brightness-110 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={18} />
                <span>
                  {isMatching
                    ? 'Calculating Gun Milan Score...'
                    : 'Calculate Marriage Compatibility'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Result Section */}
      <AnimatePresence>
        {matchResult && (
          <section
            id="match-report"
            className="py-8 bg-background/50 border-t border-white/5 space-y-6"
          >
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-6">
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 text-center space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#C9952B]">
                      Gun Milan: {matchResult.groomName} & {matchResult.brideName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      Saved to My Reports 📄
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href="/talk-to-ai-astrologer"
                      className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white text-xs font-bold flex items-center gap-1 shadow transition-all"
                    >
                      <Bot size={12} className="animate-pulse" /> AI Expert Astrologer
                    </Link>
                    <Link
                      href="/talk-to-astrologer?category=Kundli%20Matching"
                      className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow transition-colors"
                    >
                      <PhoneCall size={12} /> Talk to Astrologer 📞
                    </Link>
                    <Link
                      href="/my-reports"
                      className="px-4 py-1.5 rounded-full gold-gradient-bg text-white text-xs font-bold flex items-center gap-1 shadow"
                    >
                      <FileText size={12} /> View in My Reports 📄
                    </Link>
                  </div>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-gradient-gold font-mono">
                  {matchResult.totalScore}{' '}
                  <span className="text-xl text-muted-foreground">/ 36</span>
                </div>
                <p className="text-emerald-400 font-bold text-base">{matchResult.status}</p>
                <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  {matchResult.verdict}
                </p>

                {/* Planetary Signs & Manglik Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left">
                  {matchResult.groomAstro && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">
                        Your Planetary Alignment
                      </div>
                      <div className="text-xs font-bold text-[#C9952B]">
                        {matchResult.groomAstro.rashiName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {matchResult.groomAstro.nakshatraName} · {matchResult.groomAstro.gana} Gana
                        · {matchResult.groomAstro.nadi} Nadi
                      </div>
                    </div>
                  )}

                  {matchResult.brideAstro && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">
                        Partner's Planetary Alignment
                      </div>
                      <div className="text-xs font-bold text-rose-400">
                        {matchResult.brideAstro.rashiName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {matchResult.brideAstro.nakshatraName} · {matchResult.brideAstro.gana} Gana
                        · {matchResult.brideAstro.nadi} Nadi
                      </div>
                    </div>
                  )}
                </div>

                {matchResult.manglikStatus && (
                  <div className="p-3 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/20 text-xs text-left">
                    <span className="font-bold text-[#C9952B]">Manglik Compatibility: </span>
                    <span className="text-foreground/90">{matchResult.manglikStatus.summary}</span>
                  </div>
                )}
              </div>

              {/* Dynamic AI Astrological Analysis */}
              {(apiReportData?.astrologicalAnalysis || matchResult.astrologicalAnalysis) && (
                <div className="glass-card p-6 rounded-3xl border border-[#C9952B]/30 space-y-2 bg-[#C9952B]/5">
                  <h3 className="text-base font-bold text-[#C9952B] flex items-center gap-2">
                    <Sparkles size={16} /> Astrological Compatibility Insights
                  </h3>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {apiReportData?.astrologicalAnalysis || matchResult.astrologicalAnalysis}
                  </p>
                </div>
              )}

              {/* Ashtakoot Grid */}
              <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Ashtakoot Score Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchResult.ashtakoot &&
                    matchResult.ashtakoot.map((a: any) => (
                      <div
                        key={a.koot}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground text-xs">{a.koot}</span>
                          <span className="text-xs font-bold text-[#C9952B]">{a.score}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Dynamic Content Managed via Admin Panel */}
              <DynamicPageContent pageId="kundli-matching" />

              {/* Consultation CTA Banner */}
              <AstrologerCtaBanner
                theme="rose"
                category="Kundli Matching"
                title="Need Personalized Consultation for Marriage Compatibility?"
                subtitle="Discuss your 36 Gun Milan score, Manglik Dosha cancellation, Bhakoot or Nadi Dosha pariharam with India's top relationship astrologers."
                badge="Talk to Marriage Astrologer"
              />
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Educational Guide */}
      <section className="py-8 lg:py-12 bg-background/50 border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-8">
          <div className="glass-card p-6 lg:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">36 Ashtakoot Gun Milan System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {ashtakootGuide.map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1"
                >
                  <h4 className="font-bold text-[#C9952B] text-xs">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
