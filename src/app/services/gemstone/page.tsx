'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gem, Check, ArrowRight, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';

const benefits = [
  'Strengthens Sun energy and boosts confidence',
  'Improves career prospects and leadership qualities',
  'Enhances vitality, health, and overall well-being',
  'Attracts prosperity and removes obstacles',
  'Balances planetary doshas in your birth chart',
];

const gemstones = [
  { planet: 'Sun', gem: 'Ruby (Manik)', color: 'text-red-400', bg: 'bg-red-500/10', metal: 'Gold', finger: 'Ring finger', day: 'Sunday' },
  { planet: 'Moon', gem: 'Pearl (Moti)', color: 'text-blue-200', bg: 'bg-blue-200/10', metal: 'Silver', finger: 'Little finger', day: 'Monday' },
  { planet: 'Mars', gem: 'Red Coral (Moonga)', color: 'text-orange-400', bg: 'bg-orange-500/10', metal: 'Gold/Copper', finger: 'Ring finger', day: 'Tuesday' },
  { planet: 'Mercury', gem: 'Emerald (Panna)', color: 'text-green-400', bg: 'bg-green-500/10', metal: 'Gold', finger: 'Little finger', day: 'Wednesday' },
  { planet: 'Jupiter', gem: 'Yellow Sapphire (Pukhraj)', color: 'text-yellow-400', bg: 'bg-yellow-500/10', metal: 'Gold', finger: 'Index finger', day: 'Thursday' },
  { planet: 'Venus', gem: 'Diamond (Heera)', color: 'text-pink-300', bg: 'bg-pink-300/10', metal: 'Gold/Platinum', finger: 'Middle finger', day: 'Friday' },
  { planet: 'Saturn', gem: 'Blue Sapphire (Neelam)', color: 'text-blue-400', bg: 'bg-blue-500/10', metal: 'Silver/Iron', finger: 'Middle finger', day: 'Saturday' },
  { planet: 'Rahu', gem: 'Hessonite (Gomed)', color: 'text-amber-600', bg: 'bg-amber-600/10', metal: 'Silver', finger: 'Middle finger', day: 'Saturday' },
  { planet: 'Ketu', gem: "Cat's Eye (Lehsunia)", color: 'text-gray-400', bg: 'bg-gray-400/10', metal: 'Silver', finger: 'Middle finger', day: 'Tuesday' },
];

const faqs = [
  { q: 'How is the gemstone determined for me?', a: 'Based on your birth chart, we analyze the strength and weakness of each planet. The gemstone is recommended to strengthen your beneficial planets and neutralize malefic ones.' },
  { q: 'What is the ideal carat weight for a gemstone?', a: 'Generally 3–7 carats for most gemstones. The exact weight depends on your body weight and planetary strength. Our detailed report specifies the ideal weight for you.' },
  { q: 'Can I wear multiple gemstones?', a: 'Yes, but certain combinations are incompatible. For example, Ruby and Blue Sapphire should never be worn together. Our report includes safe combination guidelines.' },
  { q: 'How long before I see results?', a: 'Most people notice effects within 40 days of wearing the correct gemstone. Full benefits are typically experienced within 3–6 months of consistent wear.' },
];

export default function GemstoneServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');

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
            <span className="text-[#C9952B]">Gemstone Advice</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                <Gem size={12} /> Vedic Gemology
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
                Sacred Gemstone<br /><span className="text-gradient-gold">Recommendations</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Discover the precise gemstone aligned with your birth chart. Each recommendation is based on Navagraha analysis — the nine planetary forces that shape your destiny.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#get-report" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                  <Gem size={16} /> Get My Gemstone Report
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
                    <Gem size={64} className="text-white" />
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
              <h2 className="text-3xl font-bold text-foreground mb-6">Why Wear the <span className="text-gradient-gold">Right Gemstone?</span></h2>
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
            <div className="grid grid-cols-3 gap-3">
              {gemstones?.slice(0, 6)?.map((g, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`rounded-2xl p-4 ${g?.bg} border border-border text-center`}>
                  <div className={`text-2xl mb-2 ${g?.color}`}>💎</div>
                  <p className="text-xs font-semibold text-foreground">{g?.planet}</p>
                  <p className="text-xs text-muted-foreground mt-1">{g?.gem?.split(' ')?.[0]}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Gemstone Table */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Navagraha <span className="text-gradient-gold">Gemstone Chart</span></h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-[#6B0F1A]/10 border-b border-border">
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Planet</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Gemstone</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Metal</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Finger</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-foreground">Day to Wear</th>
                </tr>
              </thead>
              <tbody>
                {gemstones?.map((g, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className={`px-5 py-3.5 text-sm font-semibold ${g?.color}`}>{g?.planet}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{g?.gem}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{g?.metal}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{g?.finger}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{g?.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Get Report Form */}
      <section id="get-report" className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Get Your <span className="text-gradient-gold">Personal Report</span></h2>
            <p className="text-muted-foreground">Enter your birth details to receive a precise gemstone recommendation</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e?.target?.value)} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Time of Birth</label>
                <input type="time" value={time} onChange={e => setTime(e?.target?.value)} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Place of Birth</label>
                <input type="text" placeholder="e.g. Mumbai, Maharashtra" value={place} onChange={e => setPlace(e?.target?.value)} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
              </div>
              <div className="rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/20 p-4 flex items-start gap-3">
                <Lock size={16} className="text-[#C9952B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Premium Report</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Full gemstone analysis with metal, finger, mantra, and precautions requires Premium membership</p>
                </div>
              </div>
              <Link href="/sign-up-login-screen" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                <Gem size={16} /> Unlock Full Report — Upgrade to Premium
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
      {/* CTA */}
      <section className="py-16 cosmic-bg">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your <span className="text-gradient-gold">Sacred Gemstone?</span></h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Consult with our expert astrologers for a personalized gemstone recommendation backed by your complete birth chart analysis.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
              <Gem size={18} /> Get Premium Report
            </Link>
            <Link href="/talk-to-astrologer" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all">
              Talk to Astrologer <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
