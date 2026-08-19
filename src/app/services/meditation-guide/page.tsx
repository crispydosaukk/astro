'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles, Flame, Eye, Compass, Moon, Sun, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
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
      {/* Fullscreen Hero Section */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 w-full">
            <div className="grid lg:grid-cols-2 items-center min-h-screen gap-12">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div>
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 mb-6 backdrop-blur-md">
                    Free Meditation guide
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-xl">
                    ASTROPARIHAR — <br />
                    <span className="text-gradient-gold">THE ART OF MEDITATION</span>
                  </h1>
                  <p className="text-lg font-medium text-[#C9952B] italic mb-2">
                    Still the Mind. Discover the Self.
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                    Ancient Vedic meditation practices, personalised for your journey—helping you cultivate clarity, steadiness, awareness and inner peace.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-6">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                    >
                      {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                      <span>{isTimerRunning ? 'Pause Practice' : 'Start 15-Minute Practice'}</span>
                    </button>
                    <button
                      onClick={resetTimer}
                      className="p-3.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                      title="Reset 15-Min Timer"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <div className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-[#C9952B] font-mono text-lg font-bold backdrop-blur-sm">
                      ⏱ {formatTime(timerSeconds)}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="relative h-[45vh] lg:h-[75vh] w-full order-1 lg:order-2 flex items-center justify-center p-4 lg:p-8"
              >
                <div className="relative w-full h-full max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#C9952B]/30 bg-black/40">
                  <Image
                    src="/images/meditation_guide_hero.jpg"
                    alt="AstroParihar Meditation"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Full Unbroken Meditation Guide Content */}
      <section className="py-16 lg:py-24 bg-background relative z-10 space-y-16">
        <div className="max-w-4xl mx-auto px-6 space-y-14">

          {/* Section 1: What Is Meditation? */}
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-2 border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9952B]">Section 1</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">1. What Is Meditation?</h2>
            </div>

            <p className="text-base text-foreground leading-relaxed">
              The Sanskrit word <strong>Dhyāna (ध्यान)</strong> refers to meditation or sustained contemplative awareness.
            </p>

            <p className="text-base text-foreground leading-relaxed">
              It is important that AstroParihar doesn&apos;t describe meditation simply as &quot;emptying your mind.&quot;
            </p>

            <div className="p-5 rounded-2xl bg-[#C9952B]/10 border border-[#C9952B]/30 space-y-2">
              <p className="text-xs uppercase font-bold text-[#C9952B] tracking-wider">A better explanation is:</p>
              <p className="text-base font-medium text-foreground leading-relaxed">
                Meditation is the disciplined practice of directing and sustaining awareness upon a chosen object, mantra, deity, breath or inner principle.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-sm font-bold text-[#C9952B] uppercase tracking-wider">
                In the classical progression:
              </p>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center font-bold text-[#C9952B] text-sm sm:text-base">
                Pratyāhāra → Dhāraṇā → Dhyāna → Samādhi
              </div>

              <ul className="space-y-2.5 pt-2 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C9952B] mt-2 shrink-0" />
                  <span><strong>Pratyāhāra</strong> — withdrawal of the senses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C9952B] mt-2 shrink-0" />
                  <span><strong>Dhāraṇā</strong> — concentration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C9952B] mt-2 shrink-0" />
                  <span><strong>Dhyāna</strong> — sustained meditation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#C9952B] mt-2 shrink-0" />
                  <span><strong>Samādhi</strong> — deep absorption</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              Classical sources distinguish dhāraṇā from dhyāna by the continuity of attention: concentration fixes awareness on an object, while meditation sustains that awareness.
            </p>
          </div>

          <div className="w-full border-t border-white/10 my-8" />

          {/* Section 2: Why Meditation Matters in Vedic Practice */}
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-2 border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9952B]">Section 2</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">2. Why Meditation Matters in Vedic Practice</h2>
            </div>

            <p className="text-base text-foreground leading-relaxed">
              Meditation should not be presented as a quick remedy for every problem.
            </p>

            <p className="text-sm font-bold text-[#C9952B] uppercase tracking-wider">
              Its deeper purpose is to cultivate:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>🧘</span> Manas Śuddhi
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Purification and steadiness of the mind.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>🔥</span> Ekāgratā
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  One-pointed attention.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>🌿</span> Śānti
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Inner peace.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>👁️</span> Viveka
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Discernment.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1 sm:col-span-2">
                <div className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>🙏</span> ĪśvaraPraṇidhāna
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Devotional surrender to the Divine.
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              The Bhagavad Gītā describes disciplined regulation of the mind and body as part of dhyāna-yoga.
            </p>
          </div>

          <div className="w-full border-t border-white/10 my-8" />

          {/* Section 3: AstroParihar's Core Meditation Method */}
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 space-y-8">
            <div className="space-y-2 border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9952B]">Section 3</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">3. AstroParihar&apos;s Core Meditation Method</h2>
              <p className="text-sm text-muted-foreground">
                I recommend making this the basic meditation protocol available to every user.
              </p>
            </div>

            <div className="text-center py-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gradient-gold">
                The 15-Minute AstroParihar Meditation
              </h3>
            </div>

            {/* Step 1 */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-[#C9952B]">Step 1 — Prepare</h4>
              <p className="text-sm text-foreground">Choose a clean, quiet place.</p>
              <p className="text-sm text-foreground">Sit comfortably.</p>
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-muted-foreground uppercase">You can sit:</p>
                <ul className="space-y-1.5 text-sm text-foreground/90 pl-2">
                  <li>• Padmāsana</li>
                  <li>• Siddhāsana</li>
                  <li>• Sukhasana</li>
                  <li>• or simply on a chair with the spine comfortably upright.</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic pt-1">
                Don&apos;t make difficult postures a requirement.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-[#C9952B]">Step 2 — Establish the Sankalpa</h4>
              <p className="text-sm text-foreground">Close your eyes.</p>
              <p className="text-sm text-foreground">Take three slow, natural breaths.</p>
              <p className="text-sm text-foreground">Then mentally say:</p>

              <div className="p-5 rounded-2xl bg-black/50 border border-[#C9952B]/30 space-y-3 text-center">
                <div className="text-xl sm:text-2xl font-serif font-bold text-gradient-gold leading-relaxed">
                  मममनःशान्त्यर्थं<br />
                  आत्मविचारसिद्ध्यर्थं<br />
                  ध्यानंकरिष्ये।
                </div>
                <div className="text-xs sm:text-sm text-foreground/80 font-mono leading-relaxed">
                  Mama manaḥ-śānty-arthaṃ<br />
                  ātma-vicāra-siddhy-arthaṃ<br />
                  dhyānaṃkariṣye.
                </div>
                <p className="text-xs sm:text-sm italic text-[#C9952B] pt-2 border-t border-white/10">
                  &quot;For the peace of my mind and the cultivation of self-awareness, I undertake this meditation.&quot;
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-[#C9952B]">Step 3 — Breath Awareness</h4>
              <p className="text-sm text-foreground">Don&apos;t force the breath.</p>
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">Simply observe:</p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center font-bold text-[#C9952B] text-sm">
                  Inhale → Pause naturally → Exhale
                </div>
              </div>
              <p className="text-sm text-foreground">Do this for approximately 2–3 minutes.</p>
              <p className="text-xs text-muted-foreground italic">
                The objective is awareness, not aggressive breath manipulation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-[#C9952B]">Step 4 — Mantra</h4>
              <p className="text-sm text-foreground">Choose one mantra.</p>
              <p className="text-sm text-foreground">For the general AstroParihar programme:</p>

              <div className="p-5 rounded-2xl bg-black/50 border border-[#C9952B]/30 space-y-2 text-center">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-gradient-gold">
                  ॐनमःशिवाय॥
                </div>
                <div className="text-sm text-foreground font-mono">
                  Om NamaḥŚivāya
                </div>
              </div>

              <p className="text-sm text-foreground">Repeat mentally.</p>
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-muted-foreground uppercase">The user can use:</p>
                <ul className="space-y-1.5 text-sm text-foreground/90 pl-2">
                  <li>• 27 repetitions</li>
                  <li>• 54 repetitions</li>
                  <li>• 108 repetitions</li>
                  <li>• 1008 repetitions</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic pt-1">
                depending on experience and available time.
              </p>
            </div>

            {/* Step 5 */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-[#C9952B]">Step 5 — Dharana</h4>
              <p className="text-sm text-foreground">
                After the mantra, allow attention to rest on one point.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase">For example:</p>
                <ul className="space-y-1.5 text-sm text-foreground/90 pl-2">
                  <li>• breath at the nostrils,</li>
                  <li>• the mantra,</li>
                  <li>• a deity image,</li>
                  <li>• a diya flame,</li>
                  <li>• or a chosen spiritual symbol.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-xs font-bold text-muted-foreground uppercase">When the mind wanders:</p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center font-bold text-[#C9952B] text-sm">
                  Notice → Don&apos;t judge → Return.
                </div>
              </div>

              <p className="text-sm text-[#C9952B] font-bold">This is crucial.</p>
              <p className="text-sm text-foreground">The objective isn&apos;t to prevent thoughts.</p>
              <p className="text-sm text-foreground">The objective is to stop being carried away by every thought.</p>
            </div>

            {/* Step 6 */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-[#C9952B]">Step 6 — Dhyāna</h4>
              <p className="text-sm font-bold text-[#C9952B]">For approximately five minutes:</p>
              <ul className="space-y-2 text-sm text-foreground/90">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9952B]" />
                  Don&apos;t actively repeat instructions.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9952B]" />
                  Don&apos;t analyse.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9952B]" />
                  Don&apos;t fight thoughts.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9952B]" />
                  Remain aware.
                </li>
              </ul>
              <p className="text-sm text-foreground pt-1">
                Mantra may continue softly in the background if that is your chosen method.
              </p>
              <p className="text-xs text-muted-foreground italic">
                This is the transition from deliberate concentration toward sustained meditation.
              </p>
            </div>

            {/* Step 7 */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-[#C9952B]">Step 7 — Closing</h4>
              <p className="text-sm text-foreground">Place your palms together.</p>
              <p className="text-sm text-foreground">Take three gentle breaths.</p>
              <p className="text-sm text-foreground">Then recite:</p>

              <div className="p-5 rounded-2xl bg-black/50 border border-[#C9952B]/30 space-y-2 text-center">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-gradient-gold">
                  ॐशान्तिःशान्तिःशान्तिः॥
                </div>
                <div className="text-sm text-foreground font-mono">
                  Om ŚāntiḥŚāntiḥŚāntiḥ
                </div>
              </div>

              <p className="text-sm text-foreground">Remain seated for another 30 seconds.</p>
              <p className="text-sm text-foreground">Then slowly open your eyes.</p>
            </div>
          </div>

          <div className="w-full border-t border-white/10 my-8" />

          {/* Section 4: What Should you Do When Thoughts Come? */}
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6">
            <div className="space-y-2 border-b border-white/10 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9952B]">Section 4</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                4. What Should you Do When Thoughts Come?
              </h2>
              <p className="text-sm text-[#C9952B] font-semibold">
                AstroPariharsays.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                <strong>Don&apos;t say:</strong> &quot;Stop thinking.&quot;
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                <strong>Instead:</strong> &quot;A thought has appeared. Notice it. Let it pass. Return to your chosen object.&quot;
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">For example:</p>
              <p className="text-sm text-foreground font-medium">Thought: &quot;I need to call someone.&quot;</p>
              <p className="text-sm text-foreground">Don&apos;t follow it.</p>
              <div className="space-y-1 py-1">
                <p className="text-xs font-bold text-[#C9952B] uppercase">Simply recognise:</p>
                <p className="text-sm font-semibold text-foreground">Thinking.</p>
              </div>
              <p className="text-sm text-foreground">Return to the breath/mantra.</p>
            </div>

            <p className="text-base font-bold text-[#C9952B] pt-2">
              This is meditation practice.
            </p>
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
