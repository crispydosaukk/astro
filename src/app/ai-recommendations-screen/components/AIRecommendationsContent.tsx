'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, Crown, ChevronDown, ChevronUp, Gem, Music, Triangle, Flame, Heart, Gift, Moon, Compass, Star, Check } from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';


const modules = [
  {
    id: 'mod-gemstone',
    icon: Gem,
    title: 'AI Gemstone Recommendation',
    subtitle: 'Planetary gemstone analysis',
    locked: false,
    color: 'text-red-400',
    bg: 'from-red-500/10 to-rose-500/5',
    border: 'border-red-500/20',
    result: {
      primary: 'Ruby (Manik)',
      metal: 'Gold',
      finger: 'Ring finger, right hand',
      day: 'Sunday at sunrise',
      weight: '5–7 carats',
      benefits: ['Strengthens Sun energy', 'Boosts confidence and leadership', 'Improves career and authority', 'Enhances vitality and health'],
      mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
      precautions: 'Avoid if Moon is in Scorpio. Consult astrologer before wearing.',
      secondary: 'Yellow Sapphire (Pukhraj) — for Jupiter support',
    },
  },
  {
    id: 'mod-mantra',
    icon: Music,
    title: 'AI Mantra Recommendation',
    subtitle: 'Sacred sound healing',
    locked: false,
    color: 'text-blue-400',
    bg: 'from-blue-500/10 to-cyan-500/5',
    border: 'border-blue-500/20',
    result: {
      primary: 'Om Namah Shivaya',
      chantCount: '108 times daily',
      bestTime: 'Brahma Muhurtha (4:30–6:00 AM)',
      benefits: ['Pacifies Shani (Saturn)', 'Removes obstacles and negative karma', 'Brings peace and mental clarity', 'Strengthens 9th house spirituality'],
      additionalMantras: ['Gayatri Mantra — for Sun', 'Om Namo Bhagavate Vasudevaya — for Jupiter'],
      pronunciation: 'ohm-nah-mah-shee-vah-yah',
    },
  },
  {
    id: 'mod-yantra',
    icon: Triangle,
    title: 'AI Yantra Recommendation',
    subtitle: 'Sacred geometric remedy',
    locked: true,
    color: 'text-green-400',
    bg: 'from-green-500/10 to-emerald-500/5',
    border: 'border-green-500/20',
    result: {
      primary: 'Sri Yantra',
      installation: 'East-facing wall, pooja room',
      material: 'Copper or Gold-plated',
      benefits: ['Attracts wealth and prosperity', 'Harmonizes all nine planets', 'Removes Vastu doshas', 'Enhances positive energy flow'],
      activationMantra: 'Om Shreem Hreem Shreem Kamale Kamalalaye Praseed',
    },
  },
  {
    id: 'mod-homam',
    icon: Flame,
    title: 'AI Homam Recommendation',
    subtitle: 'Fire ritual guidance',
    locked: true,
    color: 'text-orange-400',
    bg: 'from-orange-500/10 to-amber-500/5',
    border: 'border-orange-500/20',
    result: {
      primary: 'Navagraha Homam',
      purpose: 'Balance all 9 planetary energies',
      materials: ['Sesame seeds', 'Ghee', 'Navagraha herbs', 'Sacred wood (9 types)'],
      bestMuhurtham: 'Saturday, 12 Jul 2026, 6:00–9:00 AM',
      benefits: ['Removes planetary afflictions', 'Enhances overall life quality', 'Brings success in career', 'Improves family harmony'],
    },
  },
  {
    id: 'mod-ishta',
    icon: Heart,
    title: 'Ishta Devata Finder',
    subtitle: 'Your personal deity',
    locked: true,
    color: 'text-pink-400',
    bg: 'from-pink-500/10 to-rose-500/5',
    border: 'border-pink-500/20',
    result: {
      deity: 'Lord Shiva',
      reason: 'Moon in 12th house with Ketu aspect indicates strong Shiva connection',
      dailyWorship: ['Abhishekam with milk on Monday', 'Bilva patra offering', 'Light a lamp at dusk'],
      stotra: 'Shiva Panchakshara Stotram',
      temples: ['Kashi Vishwanath, Varanasi', 'Brihadeeswara, Thanjavur', 'Somnath, Gujarat'],
    },
  },
  {
    id: 'mod-charity',
    icon: Gift,
    title: 'Charity Planner',
    subtitle: 'Karma-aligned giving',
    locked: true,
    color: 'text-violet-400',
    bg: 'from-violet-500/10 to-purple-500/5',
    border: 'border-violet-500/20',
    result: {
      items: ['Black sesame seeds (Shani)', 'Yellow lentils (Guru)', 'Red cloth (Mangal)'],
      schedule: 'Saturday for Shani, Thursday for Guru',
      recipients: 'Temples, blind people, elderly',
      monthlyBudget: '₹500–₹1,000',
    },
  },
  {
    id: 'mod-fasting',
    icon: Moon,
    title: 'Fasting Planner',
    subtitle: 'Spiritual detox calendar',
    locked: true,
    color: 'text-cyan-400',
    bg: 'from-cyan-500/10 to-sky-500/5',
    border: 'border-cyan-500/20',
    result: {
      primaryFast: 'Ekadashi (bi-monthly)',
      nextDate: '8 Jul 2026',
      foodGuide: ['Fruits and milk only', 'No grains or pulses', 'Sabudana khichdi allowed'],
      benefits: 'Pleases Lord Vishnu, removes sins, improves digestion',
      additionalFasts: ['Monday fast for Shiva', 'Saturday fast for Shani'],
    },
  },
  {
    id: 'mod-muhurtham',
    icon: Compass,
    title: 'Muhurtham Generator',
    subtitle: 'Auspicious timing finder',
    locked: true,
    color: 'text-amber-400',
    bg: 'from-amber-500/10 to-yellow-500/5',
    border: 'border-amber-500/20',
    result: {
      event: 'Business Opening',
      topDates: [
        { date: 'Wed, 16 Jul 2026', time: '10:15 AM', nakshatra: 'Rohini', lagna: 'Vrishabha', strength: 'Excellent' },
        { date: 'Mon, 21 Jul 2026', time: '9:30 AM', nakshatra: 'Hasta', lagna: 'Kanya', strength: 'Very Good' },
        { date: 'Thu, 24 Jul 2026', time: '11:00 AM', nakshatra: 'Pushya', lagna: 'Karka', strength: 'Good' },
      ],
      avoidTimes: 'Rahu Kalam, Yamagandam, Gulika Kalam',
    },
  },
];

export default function AIRecommendationsContent() {
  const [expandedModule, setExpandedModule] = useState<string | null>('mod-gemstone');
  const [selectedEvent, setSelectedEvent] = useState('Business Opening');

  const events = ['Marriage', 'Housewarming', 'Vehicle Purchase', 'Naming Ceremony', 'Business Opening', 'Travel', 'Education', 'Property Registration'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              ✦ Vedic Recommendations
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Personalized Vedic remedies based on your Kundli</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20">
            <Crown size={14} className="text-accent" />
            <span className="text-xs font-semibold text-accent">Premium Active</span>
          </div>
        </div>
      </div>
      {/* Birth details banner */}
      <div className="mx-6 lg:mx-8 mt-6 p-4 rounded-2xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gold-gradient-bg flex items-center justify-center text-2xl">♊</div>
            <div>
              <p className="text-sm font-semibold text-foreground">Arjun Sharma · Mithuna Lagna</p>
              <p className="text-xs text-muted-foreground">15 Mar 1992, 06:30 AM · Mumbai · Rahu-Jupiter Dasha</p>
            </div>
          </div>
          <button className="text-xs font-medium text-accent hover:underline">Update Birth Details</button>
        </div>
      </div>
      {/* Modules grid */}
      <div className="px-6 lg:px-8 py-8 space-y-4 max-w-screen-2xl">
        {modules?.map((mod, i) => {
          const Icon = mod?.icon;
          const isExpanded = expandedModule === mod?.id;

          return (
            <motion.div
              key={mod?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border ${mod?.border} bg-gradient-to-br ${mod?.bg} overflow-hidden`}
            >
              {/* Module header */}
              <button
                onClick={() => !mod?.locked && setExpandedModule(isExpanded ? null : mod?.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-card/80 flex items-center justify-center flex-shrink-0 icon-hover-animate ${mod?.color}`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{mod?.title}</h3>
                    {mod?.locked && <Lock size={13} className="text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{mod?.subtitle}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {mod?.locked ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30">
                      Premium
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400">
                      Ready
                    </span>
                  )}
                  {!mod?.locked && (
                    isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </div>
              </button>
              {/* Locked overlay */}
              {mod?.locked && (
                <div className="px-5 pb-5">
                  <div className="rounded-xl bg-card/50 border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Crown size={18} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Premium Feature</p>
                        <p className="text-xs text-muted-foreground">Upgrade to access this AI module and 6 more</p>
                      </div>
                    </div>
                    <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex-shrink-0">
                      <Sparkles size={14} /> Upgrade to Premium
                    </Link>
                  </div>
                </div>
              )}
              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && !mod?.locked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-6 border-t border-border/50">
                      {/* Gemstone result */}
                      {mod?.id === 'mod-gemstone' && (
                        <div className="pt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-card/80 border border-border">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/30 to-rose-600/20 flex items-center justify-center text-3xl">💎</div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Primary Gemstone</div>
                                <div className="text-xl font-bold text-foreground">{mod?.result?.primary}</div>
                                <div className="text-sm text-muted-foreground">{mod?.result?.weight}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: 'Metal', value: mod?.result?.metal },
                                { label: 'Finger', value: mod?.result?.finger },
                                { label: 'Best Day', value: mod?.result?.day },
                                { label: 'Secondary', value: mod?.result?.secondary?.split('—')?.[0] },
                              ]?.map((item) => (
                                <div key={`gem-detail-${item?.label}`} className="p-3 rounded-xl bg-card/60 border border-border">
                                  <div className="text-xs text-muted-foreground mb-1">{item?.label}</div>
                                  <div className="text-sm font-medium text-foreground">{item?.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-3">Benefits</h4>
                              <ul className="space-y-2">
                                {mod?.result?.benefits?.map((b, bi) => (
                                  <li key={`gem-benefit-${bi}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-card/60 border border-border">
                              <div className="text-xs text-muted-foreground mb-2">Activation Mantra</div>
                              <div className="text-sm font-medium text-foreground font-mono">{mod?.result?.mantra}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                              <div className="text-xs font-semibold text-amber-400 mb-1">⚠️ Precaution</div>
                              <div className="text-xs text-muted-foreground">{mod?.result?.precautions}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mantra result */}
                      {mod?.id === 'mod-mantra' && (
                        <div className="pt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-6 rounded-xl bg-card/80 border border-border text-center">
                              <div className="text-3xl mb-3">🔔</div>
                              <div className="text-xs text-muted-foreground mb-2">Primary Mantra</div>
                              <div className="text-xl font-bold text-foreground mb-1">{mod?.result?.primary}</div>
                              <div className="text-sm text-muted-foreground font-mono">{mod?.result?.pronunciation}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-card/60 border border-border">
                                <div className="text-xs text-muted-foreground mb-1">Chant Count</div>
                                <div className="text-sm font-medium text-foreground">{mod?.result?.chantCount}</div>
                              </div>
                              <div className="p-3 rounded-xl bg-card/60 border border-border">
                                <div className="text-xs text-muted-foreground mb-1">Best Time</div>
                                <div className="text-sm font-medium text-foreground">{mod?.result?.bestTime}</div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-3">Spiritual Benefits</h4>
                              <ul className="space-y-2">
                                {mod?.result?.benefits?.map((b, bi) => (
                                  <li key={`mantra-benefit-${bi}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Star size={12} className="text-accent mt-0.5 flex-shrink-0" />
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-foreground mb-3">Additional Mantras</h4>
                              <ul className="space-y-2">
                                {mod?.result?.additionalMantras?.map((m, mi) => (
                                  <li key={`add-mantra-${mi}`} className="text-sm text-muted-foreground px-3 py-2 rounded-lg bg-muted/50">{m}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-8 cosmic-bg border border-secondary/30 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-48 h-48 rounded-full bg-secondary/15 blur-2xl" />
            <div className="absolute bottom-0 right-1/3 w-40 h-40 rounded-full bg-accent/10 blur-2xl" />
          </div>
          <div className="relative">
            <Crown size={40} className="text-accent mx-auto mb-4 animate-float" />
            <h3 className="text-2xl font-bold text-white mb-2">Unlock All 8 AI Modules</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">Get Yantra, Homam, Ishta Devata, Charity Planner, Fasting Planner, and Muhurtham Generator — plus unlimited reports</p>
            <Link href="/sign-up-login-screen" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
              <Sparkles size={18} /> Upgrade to Premium — ₹499/month
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}