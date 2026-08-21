'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Sparkles, ShieldAlert, CheckCircle2, XCircle, Info, ChevronRight, HelpCircle, Sun, Moon, Clock, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

interface KaranaDetail {
  name: string;
  sanskrit: string;
  type: 'Chara (Movable)' | 'Sthira (Fixed)';
  ruler: string;
  symbol: string;
  nature: 'Auspicious' | 'Moderate' | 'Inauspicious / Fierce';
  bestFor: string;
  avoidFor: string;
  description: string;
}

const ALL_11_KARANAS: KaranaDetail[] = [
  {
    name: 'Bava (Bav)',
    sanskrit: 'बव',
    type: 'Chara (Movable)',
    ruler: 'Lord Indra / Vishnu',
    symbol: 'Lion (Simha)',
    nature: 'Auspicious',
    bestFor: 'Commencing new business, health treatments, government affairs, leadership tasks, charity, religious ceremonies.',
    avoidFor: 'Destructive or aggressive conflicts.',
    description: 'Bava represents courage, vitality, and expansion. Governed by Indra, it gives stability and success to ventures started in this half-tithi.',
  },
  {
    name: 'Balava (Balav)',
    sanskrit: 'बालव',
    type: 'Chara (Movable)',
    ruler: 'Lord Brahma',
    symbol: 'Leopard / Tiger (Vyaghra)',
    nature: 'Auspicious',
    bestFor: 'Education, academic enrollment, yajnas, performing pujas, studying spiritual texts, learning fine arts.',
    avoidFor: 'Unethical shortcuts or deceiving others.',
    description: 'Balava is ruled by the Creator Brahma, making it supreme for intellectual pursuits, scholastic endeavors, and creative arts.',
  },
  {
    name: 'Kaulava (Kaulav)',
    sanskrit: 'कौलव',
    type: 'Chara (Movable)',
    ruler: 'Mitra (Solar Deity of Friendship)',
    symbol: 'Boar / Pig (Varaha)',
    nature: 'Auspicious',
    bestFor: 'Friendship, treaties, partnerships, signing alliances, romantic agreements, marriage talks, social gatherings.',
    avoidFor: 'Breaking promises or instigating disputes.',
    description: 'Kaulava promotes harmony, mutual affection, and auspicious social connections. Excellent for building lasting alliances.',
  },
  {
    name: 'Taitila (Taitil)',
    sanskrit: 'तैतिल',
    type: 'Chara (Movable)',
    ruler: 'Aryaman (God of Chivalry & Wealth)',
    symbol: 'Donkey / Rhinoceros',
    nature: 'Auspicious',
    bestFor: 'Commercial trade, buying clothes, ornaments, real estate construction, public welfare works, hospitality.',
    avoidFor: 'Extreme physical sports or risky gambling.',
    description: 'Taitila is associated with worldly comfort, craftsmanship, social respect, and material security.',
  },
  {
    name: 'Gara (Gar)',
    sanskrit: 'गर',
    type: 'Chara (Movable)',
    ruler: 'Bhumi Devi (Mother Earth)',
    symbol: 'Elephant (Gaja)',
    nature: 'Auspicious',
    bestFor: 'Agriculture, planting trees, plowing, laying building foundations, buying cattle, digging wells.',
    avoidFor: 'Fast-paced speculative intraday trading.',
    description: 'Gara brings earthy strength, fertile beginnings, and grounded growth. Highly praised for agricultural and domestic construction work.',
  },
  {
    name: 'Vanija (Vanij)',
    sanskrit: 'वणिज',
    type: 'Chara (Movable)',
    ruler: 'Goddess Lakshmi & Manibhadra',
    symbol: 'Bull (Vrishabha)',
    nature: 'Auspicious',
    bestFor: 'Business deals, opening bank accounts, investments, large sales transactions, purchasing luxury items.',
    avoidFor: 'Lending money without documentation.',
    description: 'Vanija is the hallmark Karana for traders and entrepreneurs. Blessed by Lakshmi, it multiplies transactional prosperity.',
  },
  {
    name: 'Vishti (Bhadra)',
    sanskrit: 'विष्टि (भद्रा)',
    type: 'Chara (Movable)',
    ruler: 'Lord Yama (God of Justice & Death)',
    symbol: 'Dog / Black Hornet',
    nature: 'Inauspicious / Fierce',
    bestFor: 'Defeating enemies, legal battles, research into occult/poisons, surgical operations, defensive military action, detox.',
    avoidFor: 'Strictly avoid Vivaha (Marriage), Griha Pravesh, buying new vehicles, or starting celebratory business.',
    description: 'Vishti is famously known as Bhadra. It is a fierce energy suitable only for overcoming obstacles and aggressive competition.',
  },
  {
    name: 'Shakuni',
    sanskrit: 'शकुनि',
    type: 'Sthira (Fixed)',
    ruler: 'Garuda / Vayu',
    symbol: 'Bird / Vulture (Pakshi)',
    nature: 'Moderate',
    bestFor: 'Administering herbal medicines, taking diagnosis, settling old disputes, tantric sadhana, bird feeding.',
    avoidFor: 'New romantic proposals or joyful beginnings.',
    description: 'A fixed Karana occurring in Krishna Chaturdashi 2nd half. Great for medical treatments and diagnosing chronic ailments.',
  },
  {
    name: 'Chatushpada',
    sanskrit: 'चतुष्पद',
    type: 'Sthira (Fixed)',
    ruler: 'Pashupati / Lord Shiva',
    symbol: 'Four-legged Cattle',
    nature: 'Moderate',
    bestFor: 'Shraddha rituals, Pitru Tarpana, animal husbandry, donations, veterinary care, charitable trusts.',
    avoidFor: 'Weddings and festive material celebrations.',
    description: 'Occurs during the first half of Amavasya. Specially consecrated for ancestral debt clearance and caring for animals.',
  },
  {
    name: 'Naga',
    sanskrit: 'नाग',
    type: 'Sthira (Fixed)',
    ruler: 'Naga Devatas (Serpent Gods)',
    symbol: 'Serpent (Sarpa)',
    nature: 'Inauspicious / Fierce',
    bestFor: 'Mining, mineral excavation, subduing adversaries, snake worship (Nag Puja), mystical studies.',
    avoidFor: 'Auspicious social events, Griha Pravesh, long journeys.',
    description: 'Occurs in the 2nd half of Amavasya. Ruled by underworld Serpent deities; demands caution and spiritual protection.',
  },
  {
    name: 'Kimstughna',
    sanskrit: 'किंस्तुघ्न',
    type: 'Sthira (Fixed)',
    ruler: 'Vayu / Kubera',
    symbol: 'Worm / Swan',
    nature: 'Auspicious',
    bestFor: 'Performing peace yajnas, taking spiritual vows, starting educational curriculums, charitable feeds.',
    avoidFor: 'Aggressive confrontations.',
    description: 'Occurs in the first half of Shukla Pratipada. Symbolizes auspicious freshness, divine blessings, and harmonious beginnings.',
  },
];

export default function KaranaPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('New Delhi, Delhi, India');
  const [panchang, setPanchang] = useState<PanchangData>(() =>
    calculatePanchang(new Date().toISOString().split('T')[0], 'New Delhi, Delhi, India')
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setPanchang(calculatePanchang(selectedDate, location));
  }, [selectedDate, location]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    await new Promise((res) => setTimeout(res, 350));
    const calculated = calculatePanchang(selectedDate, location);
    setPanchang(calculated);
    setIsCalculating(false);
    setToastMessage(`Karana timings calculated for ${calculated.formattedDate} (${location})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find active Karana details
  const activeKaranaName = panchang.karana || 'Balav';
  const activeKaranaInfo =
    ALL_11_KARANAS.find((k) => activeKaranaName.toLowerCase().includes(k.name.toLowerCase().split(' ')[0])) ||
    ALL_11_KARANAS[1];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is a Karana in Vedic Astrology?',
      a: 'A Karana is exactly half of a Tithi (Lunar day). In Vedic astronomy, a Tithi corresponds to 12 degrees of angular distance between the Sun and the Moon, so one Karana spans 6 degrees. There are 2 Karanas in every Tithi, adding up to 60 Karanas in a 30-day lunar month.',
    },
    {
      q: 'What is the difference between Chara (Movable) and Sthira (Fixed) Karanas?',
      a: 'There are 7 Chara (Movable) Karanas (Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti) which repeat 8 times across the lunar month (56 times total). There are 4 Sthira (Fixed) Karanas (Shakuni, Chatushpada, Naga, Kimstughna) that occur only once per month during the Amavasya and Shukla Pratipada transition.',
    },
    {
      q: 'Why is Vishti (Bhadra) Karana considered inauspicious?',
      a: 'Vishti is also known as Bhadra, ruled by Yama (the God of Justice and Mortality). Its fiery, aggressive energy is considered unsuitable for auspicious celebrations like Marriage, House Warming (Griha Pravesh), and starting businesses. However, it is powerful for competitive lawsuits, surgery, and overcoming enemies.',
    },
    {
      q: 'Can I do business or shopping during Vanija or Bava Karana?',
      a: 'Yes! Vanija (ruled by Goddess Lakshmi) and Bava (ruled by Lord Indra) are among the most auspicious Karanas for business deals, signing agreements, buying property or gold, and opening new commercial accounts.',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      <Navbar />

      {/* Success Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] px-5 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <Check size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 lg:pt-28 pb-16 px-6 lg:px-10 max-w-screen-2xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 shadow-md">
            <Sparkles size={14} className="text-[#F6D075]" />
            HALF LUNAR DAY CALCULATOR & GUIDE
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Today Karana Timings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
            Discover the active Karana (Half-Tithi), ruling deities, cosmic nature, and ideal timing for business, ceremonies, and rituals.
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
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-3.5 rounded-2xl gold-gradient-bg text-[#292522] font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isCalculating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>{isCalculating ? 'Calculating...' : 'Get Karana Timings'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-semibold text-[#C9952B]">
            <div className="flex items-center gap-2"><MapPin size={15} /><span>{location}</span></div>
            <div className="flex items-center gap-2"><Calendar size={15} /><span>{panchang.formattedDate}</span></div>
            <div className="flex items-center gap-2"><Moon size={15} /><span>{panchang.tithi} ({panchang.paksha} Paksha)</span></div>
          </div>
        </div>

        {/* Active Karana Spotlight Card */}
        <div className="p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#B88A44]/50 bg-gradient-to-br from-[#2D1B28] via-[#432332] to-[#1E111B] shadow-2xl text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#F6D075] bg-white/10 px-3.5 py-1 rounded-full border border-white/15 inline-block mb-2">
                Active Half-Lunar Ruler
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {activeKaranaInfo.name} <span className="text-xl font-serif text-[#F6D075]">({activeKaranaInfo.sanskrit})</span>
                </h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  activeKaranaInfo.nature === 'Auspicious'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : activeKaranaInfo.nature === 'Moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {activeKaranaInfo.nature}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right bg-white/10 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/10 sm:border-0">
              <p className="text-xs text-white/75 uppercase tracking-wider">Classification</p>
              <p className="text-sm sm:text-base font-bold text-[#F6D075]">{activeKaranaInfo.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-white/75">Ruling Deity</span>
              <p className="text-sm font-bold text-[#F6D075]">{activeKaranaInfo.ruler}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-white/75">Cosmic Symbol</span>
              <p className="text-sm font-bold text-white">{activeKaranaInfo.symbol}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-white/75">Tithi Alignment</span>
              <p className="text-sm font-bold text-white">{panchang.tithi}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-white/75">Sunrise – Sunset</span>
              <p className="text-sm font-bold text-[#F6D075] font-mono">{panchang.sunrise} – {panchang.sunset}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase">
                <CheckCircle2 size={15} /> Recommended Activities
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{activeKaranaInfo.bestFor}</p>
            </div>

            <div className="p-4.5 rounded-2xl bg-rose-950/50 border border-rose-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase">
                <XCircle size={15} /> Activities to Avoid
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{activeKaranaInfo.avoidFor}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed pt-1 border-t border-white/15">
            <strong className="text-[#F6D075]">Vedic Insights:</strong> {activeKaranaInfo.description}
          </p>
        </div>

        {/* 2-Column Section: 1st Half & 2nd Half Karana Periods + Bhadra Advisory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Today's Half-Tithi Karana Schedule */}
          <div className="bg-[#FFFDFC] p-6 sm:p-8 rounded-3xl border border-[#E5D9C8] space-y-5 shadow-xl text-[#292522] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1 border-b border-[#E5D9C8] pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block">
                  Daily Half-Tithi Breakdown
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#292522]">Today&apos;s Karana Sequence</h3>
              </div>

              <p className="text-xs sm:text-sm text-[#6B5E55]">
                Each lunar Tithi is split into two halves (Karanas). Here is the location-synchronized sequence of Karanas for {location}:
              </p>

              <div className="space-y-3 pt-1">
                {/* 1st Half */}
                <div className="p-4 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#713B32] uppercase">{panchang.firstHalfKarana?.type || '1st Half Karana (Prathama)'}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      panchang.firstHalfKarana?.nature?.includes('Inauspicious') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {panchang.firstHalfKarana?.nature || 'Auspicious'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#292522] flex items-center justify-between flex-wrap gap-2">
                    <span>{panchang.firstHalfKarana?.name || panchang.karana}</span>
                    <span className="text-xs font-mono font-bold text-[#713B32] bg-white px-2.5 py-1 rounded-lg border border-[#E5D9C8]">
                      {panchang.firstHalfKarana?.start} – {panchang.firstHalfKarana?.end}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B5E55]">Favorable for general transactions, writing, commercial trade, and constructive actions.</p>
                </div>

                {/* 2nd Half */}
                <div className="p-4 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#713B32] uppercase">{panchang.secondHalfKarana?.type || '2nd Half Karana (Dwitiya)'}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      panchang.secondHalfKarana?.nature?.includes('Inauspicious') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {panchang.secondHalfKarana?.nature || 'Auspicious'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#292522] flex items-center justify-between flex-wrap gap-2">
                    <span>{panchang.secondHalfKarana?.name || 'Kaulav'}</span>
                    <span className="text-xs font-mono font-bold text-[#713B32] bg-white px-2.5 py-1 rounded-lg border border-[#E5D9C8]">
                      {panchang.secondHalfKarana?.start} – {panchang.secondHalfKarana?.end}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B5E55]">Follows continuous cyclical movement through the 7 Chara Karanas.</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5D9C8] text-xs text-[#6B5E55] flex items-center justify-between">
              <span>Formula: 1 Tithi = 2 Karanas (6° arc each)</span>
              <span className="font-bold text-[#713B32]">Total: 60 Karanas/Month</span>
            </div>
          </div>

          {/* Special Bhadra (Vishti) Advisory Card */}
          <div className="bg-[#FFFDFC] p-6 sm:p-8 rounded-3xl border border-[#E5D9C8] space-y-5 shadow-xl text-[#292522] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1 border-b border-[#E5D9C8] pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-block">
                  Crucial Vedic Rule
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#292522] flex items-center gap-2">
                  <ShieldAlert size={20} className="text-rose-600" />
                  Vishti Karana (Bhadra) Guidelines
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#292522] leading-relaxed">
                <strong>Vishti Karana</strong> is personified as <em>Bhadra</em>, the fierce daughter of Surya and Chhaya. In Vedic Muhurat astrology, Bhadra is strictly avoided for auspicious rites.
              </p>

              <div className="space-y-2 pt-1">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                  <p className="font-bold text-rose-800 flex items-center gap-1.5">
                    <XCircle size={14} /> Strict Prohibitions during Bhadra:
                  </p>
                  <p>Marriage (Vivaha), Griha Pravesh, buying new property, signing major partnerships, travel starts.</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Allowed / Favorable Actions:
                  </p>
                  <p>Litigation, warfare, taking medicine, poison removal, competitive exams, Hanuman Chalisa recitation.</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#6B5E55] pt-3 border-t border-[#E5D9C8] italic">
              When Bhadra resides in Swarga (Heaven) or Patala (Underworld), its negative impact on Earth (Mrityu Loka) is nullified.
            </p>
          </div>
        </div>

        {/* Complete Reference Guide: All 11 Karanas in Vedic Astrology */}
        <div className="bg-[#FFFDFC] p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl text-[#292522]">
          <div className="border-b border-[#E5D9C8] pb-4 space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-1">
              Encyclopedia
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              Complete Guide to the 11 Karanas
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E55]">
              Detailed Vedic classification, ruling deities, symbols, and recommended activities for all 11 Karanas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALL_11_KARANAS.map((k) => (
              <div
                key={k.name}
                className="p-5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#713B32]">{k.type}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      k.nature === 'Auspicious'
                        ? 'bg-emerald-100 text-emerald-800'
                        : k.nature === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {k.nature}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-[#292522]">
                      {k.name} <span className="text-sm font-serif text-[#713B32]">({k.sanskrit})</span>
                    </h4>
                    <p className="text-xs text-[#6B5E55]">Ruler: <strong className="text-[#292522]">{k.ruler}</strong> • Symbol: <strong className="text-[#292522]">{k.symbol}</strong></p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-emerald-800 font-semibold flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">✓ Best:</span> {k.bestFor}
                    </p>
                    <p className="text-rose-800 font-semibold flex items-start gap-1">
                      <span className="text-rose-600 font-bold">✗ Avoid:</span> {k.avoidFor}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-[#6B5E55] pt-2 border-t border-[#E5D9C8]/80 leading-relaxed">
                  {k.description}
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
              Frequently Asked Questions About Karana
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
            className="p-4 rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#713B32] hover:shadow-md transition-all text-center space-y-1 group"
          >
            <Moon size={20} className="mx-auto text-[#B88A44] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#292522]">Today Tithi</p>
          </Link>
          <Link
            href="/panchang/hora"
            className="p-4 rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#713B32] hover:shadow-md transition-all text-center space-y-1 group"
          >
            <Clock size={20} className="mx-auto text-[#B88A44] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#292522]">Hora Timings</p>
          </Link>
          <Link
            href="/panchang/choghadiya"
            className="p-4 rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#713B32] hover:shadow-md transition-all text-center space-y-1 group"
          >
            <Sun size={20} className="mx-auto text-[#B88A44] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#292522]">Choghadiya</p>
          </Link>
          <Link
            href="/panchang/rahu-kaal"
            className="p-4 rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#713B32] hover:shadow-md transition-all text-center space-y-1 group"
          >
            <ShieldAlert size={20} className="mx-auto text-[#B88A44] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#292522]">Rahu Kaal</p>
          </Link>
          <Link
            href="/panchang/shubh-muhurat"
            className="p-4 rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#713B32] hover:shadow-md transition-all text-center space-y-1 group"
          >
            <Sparkles size={20} className="mx-auto text-[#B88A44] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#292522]">Shubh Muhurat</p>
          </Link>
          <Link
            href="/panchang/today-panchang"
            className="p-4 rounded-2xl bg-[#FFFDFC] border border-[#E5D9C8] hover:border-[#713B32] hover:shadow-md transition-all text-center space-y-1 group"
          >
            <Calendar size={20} className="mx-auto text-[#B88A44] group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#292522]">Full Panchang</p>
          </Link>
        </div>

        {/* Consultation CTA Banner */}
        <AstrologerCtaBanner
          theme="gold"
          category="Panchang & Muhurat"
          title="Need Auspicious Muhurat & Karana Guidance?"
          subtitle="Consult our experienced Vedic astrologers to pick the ideal Shubh Muhurat for marriage, Griha Pravesh, business launches, and vehicle purchase."
          badge="Talk to Muhurat Astrologer"
        />
      </div>
    </div>
  );
}
