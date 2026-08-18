'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, User, ArrowRight, ChevronDown, Printer, Globe, CheckCircle2, FileText } from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import { useUserData } from '@/lib/useUserData';
import { calculateAshtakootGunMilan } from '@/lib/vedicAstrologyEngine';

export default function FreeKundliMatchingPage() {
  const { user } = useUserData();
  const [groomData, setGroomData] = useState({ name: '', dob: '', tob: '', pob: '', lat: '', lon: '' });
  const [brideData, setBrideData] = useState({ name: '', dob: '', tob: '', pob: '', lat: '', lon: '' });
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [apiReportData, setApiReportData] = useState<any | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      window.location.href = `/sign-up-login-screen?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsMatching(true);

    // 1. Calculate Authentic Vedic Ashtakoot Gun Milan mathematically
    const computedMatch = calculateAshtakootGunMilan(
      groomData.dob || '1995-01-01',
      groomData.tob || '12:00',
      groomData.pob || 'India',
      brideData.dob || '1996-01-01',
      brideData.tob || '12:00',
      brideData.pob || 'India',
      groomData.name || 'Groom',
      brideData.name || 'Bride'
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

  const handlePrint = () => {
    window.print();
  };

  const ashtakootGuide = [
    { title: 'Varna Koot (1 Point)', desc: 'Evaluates mental compatibility, spiritual ego, and mutual respect between bride and groom.' },
    { title: 'Vashya Koot (2 Points)', desc: 'Measures magnetic attraction, mutual influence, and power balance in marriage.' },
    { title: 'Tara Koot (3 Points)', desc: 'Calculates planetary birth star harmony for long-term health, destiny, and mutual well-being.' },
    { title: 'Yoni Koot (4 Points)', desc: 'Determines physical compatibility, intimacy, and biological harmony between partners.' },
    { title: 'Graha Maitri (5 Points)', desc: 'Assesses friendship, communication, intellectual connection, and emotional understanding.' },
    { title: 'Gana Koot (6 Points)', desc: 'Evaluates behavioral temperament (Deva, Manushya, Rakshasa) and daily lifestyle harmony.' },
    { title: 'Bhakoot Koot (7 Points)', desc: 'Governs financial prosperity, family growth, emotional depth, and marital longevity.' },
    { title: 'Nadi Koot (8 Points)', desc: 'The most critical 8-point factor evaluating health of future progeny and genetic compatibility.' },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section - Spans logo to right edge */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#8B1A2A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full">
            <div className="grid lg:grid-cols-2 items-center min-h-screen">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="px-6 lg:px-12 xl:px-20 space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-6 backdrop-blur-md">
                    Free Kundli Matching
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-xl">
                    Free Online <br />
                    <span className="text-gradient-gold">Kundli Matching</span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                    Check marriage compatibility, Gun Milan score, and Manglik Dosha between Bride and Groom for a happy married life.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        document.getElementById('matching-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                    >
                      Match Kundli Now <ArrowRight size={18} />
                    </button>
                    <Link
                      href="/talk-to-astrologer"
                      className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      Consult Astrologer
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="relative h-[40vh] lg:h-[80vh] w-full order-1 lg:order-2 flex items-center justify-center p-6 lg:p-12"
              >
                <div className="relative w-full h-full max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#C9952B]/30">
                  <Image
                    src="/images/kundli_matching_banner.jpg"
                    alt="Kundli Matching Banner"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Form Section */}
      <section id="matching-form" className="py-8 lg:py-12 bg-background relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <form onSubmit={handleMatch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Groom Details */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 text-[#C9952B]">
                  <User size={18} /> Groom Details
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Groom's Full Name"
                    value={groomData.name}
                    onChange={(e) => setGroomData({ ...groomData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
                  />
                  <input
                    type="date"
                    required
                    value={groomData.dob}
                    onChange={(e) => setGroomData({ ...groomData, dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
                  />
                  <input
                    type="time"
                    required
                    value={groomData.tob}
                    onChange={(e) => setGroomData({ ...groomData, tob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
                  />
                  <CityLocationInput
                    label="Groom Birth Place"
                    value={groomData.pob}
                    onChange={(city, details) => setGroomData({ ...groomData, pob: city, lat: details?.lat || '', lon: details?.lon || '' })}
                    required
                  />
                </div>
              </div>

              {/* Bride Details */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 text-rose-400">
                  <User size={18} /> Bride Details
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Bride's Full Name"
                    value={brideData.name}
                    onChange={(e) => setBrideData({ ...brideData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
                  />
                  <input
                    type="date"
                    required
                    value={brideData.dob}
                    onChange={(e) => setBrideData({ ...brideData, dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
                  />
                  <input
                    type="time"
                    required
                    value={brideData.tob}
                    onChange={(e) => setBrideData({ ...brideData, tob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm outline-none focus:border-[#C9952B]"
                  />
                  <CityLocationInput
                    label="Bride Birth Place"
                    value={brideData.pob}
                    onChange={(city, details) => setBrideData({ ...brideData, pob: city, lat: details?.lat || '', lon: details?.lon || '' })}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isMatching}
              className="w-full py-4 rounded-full gold-gradient-bg text-white font-bold text-base shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              <span>{isMatching ? 'Matching Kundli...' : 'Match Kundli Now'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Result Section */}
      <AnimatePresence>
        {matchResult && (
          <section id="match-report" className="py-8 bg-background/50 border-t border-white/5 space-y-6">
            <div className="max-w-4xl mx-auto px-6 space-y-6">
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

                  <div className="flex items-center gap-2">
                    <Link
                      href="/my-reports"
                      className="px-4 py-1.5 rounded-full gold-gradient-bg text-white text-xs font-bold flex items-center gap-1"
                    >
                      <FileText size={12} /> View in My Reports 📄
                    </Link>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-foreground text-xs font-bold flex items-center gap-1.5"
                    >
                      <Printer size={12} className="text-[#C9952B]" /> Print
                    </button>
                  </div>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-gradient-gold font-mono">
                  {matchResult.totalScore} <span className="text-xl text-muted-foreground">/ 36</span>
                </div>
                <p className="text-emerald-400 font-bold text-base">{matchResult.status}</p>
                <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">{matchResult.verdict}</p>

                {/* Planetary Signs & Manglik Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-left">
                  {matchResult.groomAstro && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Groom Planetary Alignment</div>
                      <div className="text-xs font-bold text-[#C9952B]">{matchResult.groomAstro.rashiName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {matchResult.groomAstro.nakshatraName} · {matchResult.groomAstro.gana} Gana · {matchResult.groomAstro.nadi} Nadi
                      </div>
                    </div>
                  )}

                  {matchResult.brideAstro && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Bride Planetary Alignment</div>
                      <div className="text-xs font-bold text-rose-400">{matchResult.brideAstro.rashiName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {matchResult.brideAstro.nakshatraName} · {matchResult.brideAstro.gana} Gana · {matchResult.brideAstro.nadi} Nadi
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
                  {matchResult.ashtakoot && matchResult.ashtakoot.map((a: any) => (
                    <div key={a.koot} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground text-xs">{a.koot}</span>
                        <span className="text-xs font-bold text-[#C9952B]">{a.score}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Educational Guide */}
      <section className="py-8 lg:py-12 bg-background/50 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="glass-card p-6 lg:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">36 Ashtakoot Gun Milan System</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {ashtakootGuide.map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
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
