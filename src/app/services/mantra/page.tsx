'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Check, ArrowRight, ChevronDown, ChevronUp, Lock, Volume2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

const benefits = [
  'Pacifies malefic planets and reduces their negative effects',
  'Brings mental peace, clarity, and emotional balance',
  'Strengthens the positive influence of benefic planets',
  'Removes karmic obstacles and negative energy patterns',
  'Enhances spiritual growth and inner awakening',
];

const mantras = [
  { planet: 'Sun', mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah', count: '108', time: 'Sunrise', color: 'text-red-400' },
  { planet: 'Moon', mantra: 'Om Shraam Shreem Shraum Sah Chandraya Namah', count: '108', time: 'Monday evening', color: 'text-blue-200' },
  { planet: 'Mars', mantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah', count: '108', time: 'Tuesday sunrise', color: 'text-orange-400' },
  { planet: 'Mercury', mantra: 'Om Braam Breem Braum Sah Budhaya Namah', count: '108', time: 'Wednesday morning', color: 'text-green-400' },
  { planet: 'Jupiter', mantra: 'Om Graam Greem Graum Sah Guruve Namah', count: '108', time: 'Thursday morning', color: 'text-yellow-400' },
  { planet: 'Venus', mantra: 'Om Draam Dreem Draum Sah Shukraya Namah', count: '108', time: 'Friday morning', color: 'text-pink-300' },
  { planet: 'Saturn', mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namah', count: '108', time: 'Saturday evening', color: 'text-blue-400' },
];

const faqs = [
  { q: 'How many times should I chant the mantra?', a: 'The standard count is 108 times per session, as 108 is considered sacred in Vedic tradition. You can use a mala (prayer beads) to keep count.' },
  { q: 'Does pronunciation matter?', a: 'Yes, correct pronunciation is important for maximum benefit. Our detailed report includes phonetic pronunciation guides and audio references.' },
  { q: 'Can I chant mantras silently?', a: 'Yes, silent (mental) chanting is equally effective. However, audible chanting creates sound vibrations that have additional healing benefits.' },
  { q: 'How long before I see results?', a: 'Regular chanting for 40 days (a mandala) typically shows noticeable changes. Full benefits manifest over 3–6 months of consistent practice.' },
];

export default function MantraServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <section className="relative pt-24 py-20 cosmic-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#8B1A2A]/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#C9952B]/15 blur-3xl" />
        </div>
        <div className="relative max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-[#C9952B] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/#services" className="hover:text-[#C9952B] transition-colors">Services</Link>
            <span>/</span>
            <span className="text-[#C9952B]">Mantra Guidance</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                <Music size={12} /> Sacred Sound Healing
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                Personalized Mantra<br /><span className="text-gradient-gold">Recommendations</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Receive sacred mantras precisely aligned with your planetary positions. Each mantra is a vibrational key that unlocks specific cosmic energies in your birth chart.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#get-report" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                  <Music size={16} /> Get My Mantra Report
                </a>
                <Link href="/talk-to-astrologer" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all">
                  Consult Astrologer
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-[#C9952B]/30 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl animate-float">
                    <Volume2 size={64} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Power of <span className="text-gradient-gold">Vedic Mantras</span></h2>
              <div className="space-y-4">
                {benefits?.map((b, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#C9952B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-[#C9952B]" />
                    </div>
                    <p className="text-muted-foreground">{b}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold text-foreground mb-4">Sample Report Preview</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/20">
                  <p className="text-xs text-[#C9952B] font-semibold mb-1">Primary Mantra</p>
                  <p className="text-sm font-bold text-foreground">Om Namah Shivaya</p>
                  <p className="text-xs text-muted-foreground mt-1">108 times daily · Brahma Muhurtha (4:30–6:00 AM)</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Purpose</p>
                  <p className="text-sm text-foreground">Pacifies Saturn, removes obstacles, brings peace</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border blur-sm select-none">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Secondary Mantras</p>
                  <p className="text-sm text-foreground">Gayatri Mantra · Om Namo Bhagavate...</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#C9952B]">
                  <Lock size={12} /> Full report requires Premium membership
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Mantra Table */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Navagraha <span className="text-gradient-gold">Mantra Guide</span></h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-[#6B0F1A]/10 border-b border-border">
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Planet</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Mantra</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Count</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Best Time</th>
                </tr>
              </thead>
              <tbody>
                {mantras?.map((m, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className={`px-5 py-3.5 text-sm font-semibold ${m?.color}`}>{m?.planet}</td>
                    <td className="px-5 py-3.5 text-xs text-foreground font-mono">{m?.mantra}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{m?.count}x</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{m?.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Get Report */}
      <section id="get-report" className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Get Your <span className="text-gradient-gold">Mantra Report</span></h2>
            <p className="text-muted-foreground">Enter your birth details for a personalized mantra recommendation</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Date of Birth</label>
                <input type="date" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Time of Birth</label>
                <input type="time" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Place of Birth</label>
                <input type="text" placeholder="e.g. Delhi, India" className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
              </div>
              <Link href="/sign-up-login-screen" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                <Music size={16} /> Unlock Full Mantra Report
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked <span className="text-gradient-gold">Questions</span></h2>
          <div className="space-y-3">
            {faqs?.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors">
                  <span className="font-semibold text-foreground text-sm">{faq?.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-[#C9952B] flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq?.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
