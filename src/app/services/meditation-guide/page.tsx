'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles, CheckCircle2, ChevronRight, Heart, Compass, ShieldCheck } from 'lucide-react';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';

export default function FreeMeditationGuidePage() {
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(15 * 60);
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section with Image as Background */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/meditation_guide_hero.jpg"
            alt="Vedic Meditation Background"
            fill
            className="object-cover object-center lg:object-right scale-100"
            priority
          />
          {/* Targeted overlays */}
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
                  Free Vedic Meditation & Mindfulness Guide
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
                  AstroParihar — <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    The Art of Meditation
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#F8F3EA]/90 font-medium leading-relaxed max-w-2xl drop-shadow">
                  Ancient Vedic meditation practices, personalised for your journey—cultivating clarity, steadiness, awareness, and inner stillness.
                </p>
              </motion.div>

              {/* Action Buttons & Timer */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-3"
              >
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-8 py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center gap-2.5 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#C9952B]/40 text-sm sm:text-base cursor-pointer"
                >
                  {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                  <span>{isTimerRunning ? 'Pause Practice' : 'Start 15-Min Practice'}</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="p-4 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all shadow-md cursor-pointer"
                  title="Reset 15-Min Timer"
                >
                  <RotateCcw size={18} />
                </button>
                <div className="px-6 py-3.5 rounded-full bg-black/50 border border-[#B88A44]/40 text-[#F6D075] font-mono text-xl font-bold backdrop-blur-md shadow-lg flex items-center gap-2">
                  <span>⏱</span>
                  <span>{formatTime(timerSeconds)}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Full Meditation Guide Content - 2 Cards Per Row from Logo to Profile End */}
      <section className="py-12 lg:py-16 bg-[#F8F3EA] relative z-10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-8">

          {/* Row 1: Section 1 & Section 2 Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Section 1: What Is Meditation? */}
            <div className="bg-[#FFFDFC] p-6 sm:p-8 rounded-3xl border border-[#E5D9C8] space-y-5 shadow-xl text-[#292522] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1.5 border-b border-[#E5D9C8] pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
                    Section 1
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">1. What Is Meditation?</h2>
                </div>

                <p className="text-sm sm:text-base text-[#292522] leading-relaxed">
                  The Sanskrit word <strong className="text-[#713B32]">Dhyāna (ध्यान)</strong> refers to meditation or sustained contemplative awareness.
                </p>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#EDE4D5]/60 border border-[#E5D9C8] space-y-1.5">
                  <p className="text-xs uppercase font-bold text-[#713B32] tracking-wider">A better explanation is:</p>
                  <p className="text-sm sm:text-base font-semibold text-[#292522] leading-relaxed">
                    Meditation is the disciplined practice of directing and sustaining awareness upon a chosen object, mantra, deity, breath or inner principle.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <p className="text-xs sm:text-sm font-bold text-[#713B32] uppercase tracking-wider">
                    In the classical progression:
                  </p>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#281123] via-[#1f0d1b] to-[#150914] text-white border border-[#B88A44]/40 text-center font-bold text-[#F6D075] text-xs sm:text-sm shadow-md tracking-wide">
                    Pratyāhāra → Dhāraṇā → Dhyāna → Samādhi
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="flex items-start gap-2.5 bg-[#F8F3EA] p-3 rounded-xl border border-[#E5D9C8]">
                      <span className="w-2 h-2 rounded-full bg-[#B88A44] mt-1.5 shrink-0" />
                      <span className="text-xs sm:text-sm"><strong className="text-[#713B32]">Pratyāhāra</strong> — sense withdrawal</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-[#F8F3EA] p-3 rounded-xl border border-[#E5D9C8]">
                      <span className="w-2 h-2 rounded-full bg-[#B88A44] mt-1.5 shrink-0" />
                      <span className="text-xs sm:text-sm"><strong className="text-[#713B32]">Dhāraṇā</strong> — concentration</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-[#F8F3EA] p-3 rounded-xl border border-[#E5D9C8]">
                      <span className="w-2 h-2 rounded-full bg-[#B88A44] mt-1.5 shrink-0" />
                      <span className="text-xs sm:text-sm"><strong className="text-[#713B32]">Dhyāna</strong> — sustained flow</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-[#F8F3EA] p-3 rounded-xl border border-[#E5D9C8]">
                      <span className="w-2 h-2 rounded-full bg-[#B88A44] mt-1.5 shrink-0" />
                      <span className="text-xs sm:text-sm"><strong className="text-[#713B32]">Samādhi</strong> — absorption</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#6B5E55] leading-relaxed pt-3 border-t border-[#E5D9C8]">
                Classical sources distinguish dhāraṇā from dhyāna by continuity of attention: concentration fixes awareness, while meditation sustains it.
              </p>
            </div>

            {/* Section 2: Why Meditation Matters in Vedic Practice */}
            <div className="bg-[#FFFDFC] p-6 sm:p-8 rounded-3xl border border-[#E5D9C8] space-y-5 shadow-xl text-[#292522] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1.5 border-b border-[#E5D9C8] pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
                    Section 2
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">2. Why Meditation Matters in Vedic Practice</h2>
                </div>

                <p className="text-sm sm:text-base text-[#292522] leading-relaxed">
                  Meditation is not merely a temporary remedy—its deeper Vedic purpose is to cultivate internal mastery:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-1 shadow-sm">
                    <div className="text-sm font-bold text-[#713B32] flex items-center gap-1.5">
                      <span>🧘</span> Manas Śuddhi
                    </div>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Purification and steadiness of the mind.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-1 shadow-sm">
                    <div className="text-sm font-bold text-[#713B32] flex items-center gap-1.5">
                      <span>🔥</span> Ekāgratā
                    </div>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      One-pointed sustained attention.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-1 shadow-sm">
                    <div className="text-sm font-bold text-[#713B32] flex items-center gap-1.5">
                      <span>🌿</span> Śānti
                    </div>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Unshakeable inner tranquility.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-1 shadow-sm">
                    <div className="text-sm font-bold text-[#713B32] flex items-center gap-1.5">
                      <span>👁️</span> Viveka
                    </div>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Spiritual discernment and wisdom.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-1 sm:col-span-2 shadow-sm">
                    <div className="text-sm font-bold text-[#713B32] flex items-center gap-1.5">
                      <span>🙏</span> Īśvara Praṇidhāna
                    </div>
                    <p className="text-xs text-[#6B5E55] leading-relaxed">
                      Devotional surrender and attunement to Divine consciousness.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#6B5E55] leading-relaxed pt-3 border-t border-[#E5D9C8]">
                The Bhagavad Gītā describes disciplined regulation of the mind and body as an indispensable part of dhyāna-yoga.
              </p>
            </div>
          </div>

          {/* Section 3: AstroParihar's Core 15-Minute Meditation Method Container */}
          <div className="bg-[#FFFDFC] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl text-[#292522]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5D9C8] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-1.5">
                  Section 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
                  3. AstroParihar&apos;s Core Meditation Method
                </h2>
                <p className="text-xs sm:text-sm text-[#6B5E55]">
                  The foundational 15-minute daily Vedic protocol for steadiness, clarity, and peace.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EDE4D5] text-[#713B32] text-xs sm:text-sm font-bold border border-[#E5D9C8] shrink-0 self-start sm:self-auto shadow-sm">
                <Sparkles size={14} className="text-[#B88A44]" /> 15-Minute Protocol
              </span>
            </div>

            {/* 2-Column Grid of 7 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {/* Step 1 */}
              <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-bold text-[#713B32]">Step 1 — Prepare</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5D9C8] text-[#713B32]">1–2 Mins</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#292522]">Choose a clean, quiet place and sit comfortably with spine upright.</p>
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-[#713B32] uppercase">Recommended Postures:</p>
                    <ul className="space-y-1 text-xs text-[#3D332A] pl-2">
                      <li>• Padmāsana (Lotus) or Siddhāsana</li>
                      <li>• Sukhasana (Easy cross-legged)</li>
                      <li>• Or comfortably on a chair with upright spine.</li>
                    </ul>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B5E55] italic pt-2 border-t border-[#E5D9C8]/60">
                  Comfortable posture is priority over difficult contortions.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-bold text-[#713B32]">Step 2 — Sankalpa</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5D9C8] text-[#713B32]">Mantra</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#292522]">Close your eyes, take 3 deep breaths, and mentally recite the sacred resolve:</p>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#281123] via-[#1f0d1b] to-[#150914] text-white border border-[#B88A44]/40 space-y-2 text-center shadow-md">
                    <div className="text-lg sm:text-xl font-serif font-extrabold text-[#F6D075] leading-snug">
                      मममनःशान्त्यर्थं आत्मविचारसिद्ध्यर्थं ध्यानंकरिष्ये।
                    </div>
                    <div className="text-[11px] text-white/90 font-mono">
                      Mama manaḥ-śānty-arthaṃ ātma-vicāra-siddhy-arthaṃ dhyānaṃkariṣye.
                    </div>
                    <p className="text-[11px] italic text-[#FFE29F] pt-1 border-t border-white/20">
                      &quot;For the peace of my mind and self-awareness, I undertake this meditation.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-bold text-[#713B32]">Step 3 — Breath Awareness</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5D9C8] text-[#713B32]">2–3 Mins</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#292522]">Do not force or manipulate the breath. Simply witness the natural respiratory cycle:</p>

                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#281123] to-[#170b16] text-[#F6D075] border border-[#B88A44]/40 text-center font-bold text-xs sm:text-sm shadow-md">
                    Inhale → Pause naturally → Exhale
                  </div>
                </div>
                <p className="text-[11px] text-[#6B5E55] italic pt-2 border-t border-[#E5D9C8]/60">
                  The objective is passive awareness, not forceful breath retention.
                </p>
              </div>

              {/* Step 4 */}
              <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-bold text-[#713B32]">Step 4 — Mantra Japa</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5D9C8] text-[#713B32]">5–7 Mins</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#292522]">Repeat your chosen sacred mantra mentally with deep reverence (27, 54, or 108 times):</p>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#281123] to-[#150914] text-white border border-[#B88A44]/40 space-y-1 text-center shadow-md">
                    <div className="text-2xl font-serif font-extrabold text-[#F6D075]">
                      ॐ नमः शिवाय ॥
                    </div>
                    <div className="text-xs text-white/90 font-mono tracking-widest">
                      Om Namaḥ Śivāya
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-bold text-[#713B32]">Step 5 — Dhāraṇā (Focus)</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5D9C8] text-[#713B32]">Concentration</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#292522]">Rest attention on one focal point (breath at nostrils, third eye, diya flame, or deity image).</p>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-[#713B32] uppercase">When Mind Wanders:</p>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#281123] to-[#170b16] text-[#F6D075] border border-[#B88A44]/40 text-center font-bold text-xs shadow-md">
                      Notice → Don&apos;t judge → Return gently
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B5E55] italic pt-2 border-t border-[#E5D9C8]/60">
                  You are training awareness not to get hijacked by every incoming thought.
                </p>
              </div>

              {/* Step 6 & 7 */}
              <div className="space-y-3 p-5 sm:p-6 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-bold text-[#713B32]">Step 6 & 7 — Dhyāna & Closing</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#E5D9C8] text-[#713B32]">Stillness & Peace</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#292522]">Rest in sustained silent awareness for 3–5 minutes. To conclude, join palms and chant:</p>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#281123] to-[#150914] text-white border border-[#B88A44]/40 space-y-1 text-center shadow-md">
                    <div className="text-xl font-serif font-extrabold text-[#F6D075]">
                      ॐ शान्तिः शान्तिः शान्तिः ॥
                    </div>
                    <div className="text-xs text-white/90 font-mono tracking-wide">
                      Om Śāntiḥ Śāntiḥ Śāntiḥ
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#6B5E55] italic pt-2 border-t border-[#E5D9C8]/60">
                  Remain seated for 30 seconds before slowly opening your eyes.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Section 4 & Sadhana Principles Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Section 4: What Should you Do When Thoughts Come? */}
            <div className="bg-[#FFFDFC] p-6 sm:p-8 rounded-3xl border border-[#E5D9C8] space-y-5 shadow-xl text-[#292522] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1.5 border-b border-[#E5D9C8] pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
                    Section 4
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
                    4. Handling Wandering Thoughts
                  </h2>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-medium">
                    <strong className="text-rose-700">Don&apos;t say:</strong> &quot;Stop thinking.&quot;
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium">
                    <strong className="text-emerald-700">Instead:</strong> &quot;A thought has appeared. Notice it. Let it pass. Return to your chosen object.&quot;
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-2">
                  <p className="text-xs font-bold text-[#713B32] uppercase tracking-wider">Practical Example:</p>
                  <p className="text-xs sm:text-sm text-[#292522]">Thought arises: <em>&quot;I need to call someone.&quot;</em></p>
                  <p className="text-xs sm:text-sm text-[#292522]">Do not follow the storyline. Label it gently: <strong className="text-[#713B32]">Thinking</strong>.</p>
                  <p className="text-xs sm:text-sm text-[#292522]">Return to your breath or mantra smoothly.</p>
                </div>
              </div>

              <p className="text-xs font-bold text-[#713B32] pt-3 border-t border-[#E5D9C8]">
                This constant gentle returning is the true muscle of meditation.
              </p>
            </div>

            {/* Section 5: Astrological Meditation Benefits */}
            <div className="bg-[#FFFDFC] p-6 sm:p-8 rounded-3xl border border-[#E5D9C8] space-y-5 shadow-xl text-[#292522] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1.5 border-b border-[#E5D9C8] pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
                    Vedic Principles
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
                    Astrological Alignment for Dhyāna
                  </h2>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-[#292522]">
                  <li className="flex items-start gap-2.5 bg-[#F8F3EA] p-3 rounded-xl border border-[#E5D9C8]">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">✓</span>
                    <div>
                      <strong className="text-[#713B32]">Brahma Muhurat (4:00 – 6:00 AM)</strong>
                      <p className="text-xs text-[#6B5E55] mt-0.5">Peak Sattvic energy ideal for deep Dhyana and mantra absorption.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 bg-[#F8F3EA] p-3 rounded-xl border border-[#E5D9C8]">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">✓</span>
                    <div>
                      <strong className="text-[#713B32]">Moon & Mercury Pacification</strong>
                      <p className="text-xs text-[#6B5E55] mt-0.5">Calms an agitated Moon (emotions) and restless Mercury (overthinking).</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5 bg-[#F8F3EA] p-3 rounded-xl border border-[#E5D9C8]">
                    <span className="w-5 h-5 rounded-full bg-[#B88A44]/20 text-[#713B32] font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">✓</span>
                    <div>
                      <strong className="text-[#713B32]">Ishta Devata Connection</strong>
                      <p className="text-xs text-[#6B5E55] mt-0.5">Chanting your 5th/9th house Ishta mantra accelerates spiritual breakthroughs.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-[#E5D9C8] flex items-center justify-between text-xs text-[#6B5E55]">
                <span className="flex items-center gap-1 font-semibold text-[#713B32]">
                  <ShieldCheck size={14} className="text-emerald-600" /> Sacred Vedic Practice
                </span>
                <span>Self-Paced Spiritual Discipline</span>
              </div>
            </div>
          </div>

          {/* Dynamic Content Managed via Admin Panel */}
          <DynamicPageContent pageId="meditation-guide" />

          {/* Consultation CTA Banner */}
          <AstrologerCtaBanner
            theme="gold"
            category="Spiritual & Meditation"
            title="Seek Personalized Vedic Mantra & Sadhana Guidance"
            subtitle="Discover your personal Ishta Devata, customized Bija Mantras, and planetary Dhyana protocols by consulting with our revered Vedic astrologers."
            badge="Talk to Sadhana & Mantra Master"
          />
        </div>
      </section>
    </div>
  );
}
