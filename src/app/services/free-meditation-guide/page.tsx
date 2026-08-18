'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Pause, ArrowRight, Sparkles, HeartHandshake, BookOpen, Sun, Moon, Compass } from 'lucide-react';

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
                    Free Meditation Guide
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-xl">
                    Free Vedic <br />
                    <span className="text-gradient-gold">Meditation Guide</span>
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
                    Ancient Vedic meditation practices, breathing exercises, and sacred mantras to cultivate calm focus and inner peace.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-6">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#C9952B]/20"
                    >
                      {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                      <span>{isTimerRunning ? 'Pause Practice' : 'Start 15-Min Practice'}</span>
                    </button>
                    <div className="px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-[#C9952B] font-mono text-lg font-bold backdrop-blur-sm">
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
                className="relative h-[40vh] lg:h-[80vh] w-full order-1 lg:order-2 flex items-center justify-center p-6 lg:p-12"
              >
                <div className="relative w-full h-full max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#C9952B]/30">
                  <Image
                    src="/images/meditation_guide_hero.jpg"
                    alt="AstroParihar Meditation"
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

      {/* Full Unbroken Meditation Document Content Section */}
      <section className="py-12 lg:py-16 bg-background relative z-10 space-y-8">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">Free Meditation Guide</span>
            <h2 className="text-3xl font-bold text-foreground">ASTROPARIHAR — THE ART OF MEDITATION</h2>
            <p className="text-sm text-muted-foreground">Still the Mind. Discover the Self.</p>
          </div>

          {/* Section 1: What Is Meditation */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <Sparkles size={20} /> 1. What Is Meditation? (Dhyāna — ध्यान)
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              The Sanskrit word <strong>Dhyāna (ध्यान)</strong> refers to meditation or sustained contemplative awareness. At AstroParihar, meditation is not described simply as &quot;emptying your mind.&quot;
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A better explanation is: Meditation is the disciplined practice of directing and sustaining awareness upon a single point of focus, bringing tranquility to the mind and connecting with your inner self.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              {[
                { stage: 'Stage 1', title: 'Pratyāhāra', desc: 'Sense Withdrawal — turning senses inward away from external distractions.' },
                { stage: 'Stage 2', title: 'Dhāraṇā', desc: 'Single-Pointed Concentration — focusing mind on breath, mantra, or flame.' },
                { stage: 'Stage 3', title: 'Dhyāna', desc: 'Sustained Meditation — continuous flow of awareness without interruption.' },
                { stage: 'Stage 4', title: 'Samādhi', desc: 'Complete Absorption — union of observer, observation, and object.' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-[#C9952B]">{item.stage}</span>
                  <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Preparation & Sacred Sankalpa */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <HeartHandshake size={20} /> 2. Preparation & Establishing the Sankalpa
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              Choose a clean, quiet place facing East or North. Sit comfortably in <strong>Padmāsana</strong> (Lotus pose), <strong>Siddhāsana</strong>, <strong>Sukhasana</strong> (Cross-legged), or on an upright chair with your spine straight and shoulders relaxed.
            </p>

            <div className="p-5 rounded-2xl bg-black/40 border border-[#C9952B]/30 space-y-3 text-center">
              <span className="text-xs font-bold text-[#C9952B] uppercase tracking-wider">The Sacred Meditation Sankalpa Mantra</span>
              <div className="text-2xl font-serif font-bold text-gradient-gold">
                मम मनःशान्त्यर्थं आत्मविचारसिद्ध्यर्थं ध्यानं करिष्ये।
              </div>
              <p className="text-xs italic text-muted-foreground">
                Transliteration: Mama manaḥ-śānty-arthaṃ ātma-vicāra-siddhy-arthaṃ dhyānaṃ kariṣye.
              </p>
              <p className="text-xs text-foreground font-medium pt-1">
                Translation: &quot;For the peace of my mind and the cultivation of self-awareness, I undertake this meditation practice.&quot;
              </p>
            </div>
          </div>

          {/* Section 3: Breath & Prāṇāyāma Awareness */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <Sun size={20} /> 3. Breath & Prāṇāyāma Awareness
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              Observe your natural breath rhythm without force or strain. Inhale gently ➔ allow a natural brief pause ➔ exhale slowly for 2 to 3 minutes.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As breath stabilizes, mental agitation naturally subsides. The mind follows the breath like a shadow follows a body.
            </p>
          </div>

          {/* Section 4: Sacred Mantra Meditation (Japa Dhyāna) */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <BookOpen size={20} /> 4. Sacred Mantra Meditation (Japa Dhyāna)
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              Mentally repeat the universal Panchakshari Shiva Mantra with steady devotion:
            </p>

            <div className="p-5 rounded-2xl bg-black/40 border border-[#C9952B]/30 text-center space-y-2">
              <div className="text-3xl font-serif font-bold text-gradient-gold">
                ॐ नमः शिवाय॥
              </div>
              <p className="text-xs italic text-muted-foreground">Transliteration: Om Namaḥ Śivāya</p>
            </div>
          </div>

          {/* Section 5: Dhāraṇā (Concentration) */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <Compass size={20} /> 5. Dhāraṇā (Concentration) & Mind Quietude
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              Rest attention on one single point—either the cool sensation of breath entering the nostrils or a glowing ghee diya flame at the eye center (Ajna Chakra).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Whenever thoughts wander, do not fight or judge the mind. Gently guide attention back to the breath or mantra.
            </p>
          </div>

          {/* Section 6: Dhyāna (Meditation) */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <Moon size={20} /> 6. Dhyāna — Pure Witness Consciousness (Sākṣī Bhāva)
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              Remain still for 5 to 10 minutes in pure witness awareness (Sākṣī Bhāva). Observe thoughts as passing clouds in the vast, serene sky of consciousness.
            </p>
          </div>

          {/* Section 7: Shanti Mantra Closing */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
              <Sparkles size={20} /> 7. Closing Prayer & Dedication
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              Conclude your meditation practice by placing hands in Anjali Mudra (Prayer posture) and reciting the Peace Mantra:
            </p>

            <div className="p-5 rounded-2xl bg-black/40 border border-[#C9952B]/30 text-center space-y-2">
              <div className="text-2xl font-serif font-bold text-gradient-gold">
                ॐ शान्तिः शान्तिः शान्तिः॥
              </div>
              <p className="text-xs italic text-muted-foreground">Transliteration: Om Śāntiḥ Śāntiḥ Śāntiḥ</p>
              <p className="text-xs text-foreground font-medium pt-1">
                &quot;May there be peace in the physical realm, peace in the mental realm, and peace in the spiritual realm.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
