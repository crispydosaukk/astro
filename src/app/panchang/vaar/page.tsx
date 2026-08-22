'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Sun,
  Moon,
  Loader2,
  Sparkles,
  Check,
  Compass,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Gem,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CityLocationInput from '@/components/CityLocationInput';
import Navbar from '@/components/Navbar';
import { calculatePanchang, PanchangData } from '@/lib/panchangEngine';

interface VaarDetail {
  day: string;
  sanskrit: string;
  planet: string;
  planetSanskrit: string;
  nature: string;
  fastDeity: string;
  color: string;
  gemstone: string;
  direction: string;
  mantra: string;
  element: string;
  bestFor: string;
  avoidFor: string;
  significance: string;
}

const VAAR_PROFILES: Record<string, VaarDetail> = {
  Sunday: {
    day: 'Sunday (Ravivar)',
    sanskrit: 'रविवासरः (Ravivāsaraḥ)',
    planet: 'Sun (Surya)',
    planetSanskrit: 'सूर्य देव (Surya Deva)',
    nature: 'Administrative, Vital & Royal',
    fastDeity: 'Lord Surya / Gayatri Mata',
    color: 'Red, Copper, Orange, Gold',
    gemstone: 'Ruby (Manikya)',
    direction: 'East (Purva)',
    mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ॥',
    element: 'Fire (Tejas)',
    bestFor: 'Leadership decisions, government liaisons, taking medicines, inaugurations, public speeches, father blessings.',
    avoidFor: 'Lending money, signing deceptive contracts, purchasing iron or dark blue items.',
    significance: 'Governed by Surya Bhagavan, the Atmakaraka (soul significator) of Vedic astrology, infusing vitality, authority, and inner illumination.'
  },
  Monday: {
    day: 'Monday (Somavar)',
    sanskrit: 'सोमवासरः (Somavāsaraḥ)',
    planet: 'Moon (Chandra)',
    planetSanskrit: 'चन्द्र देव (Chandra Deva)',
    nature: 'Nurturing, Emotional & Peaceful',
    fastDeity: 'Lord Shiva / Chandra Dev',
    color: 'White, Silver, Pearl, Light Cream',
    gemstone: 'Pearl (Moti) / Moonstone',
    direction: 'North-West (Vayavya)',
    mantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः ॥',
    element: 'Water (Jala)',
    bestFor: 'Mental peace rituals, Shiva Puja, buying silver/milk/water products, planting flowers, romantic harmony, artistic pursuits.',
    avoidFor: 'Harsh disciplinary arguments, heavy construction, surgical cuts or blood donations if Moon is debilitated.',
    significance: 'Ruled by Chandra, presiding over the mind (Manas), intuition, maternal grace, and emotional equilibrium.'
  },
  Tuesday: {
    day: 'Tuesday (Mangalvar)',
    sanskrit: 'मङ्गलवासरः (Maṅgalavāsaraḥ)',
    planet: 'Mars (Mangal / Kuja)',
    planetSanskrit: 'मङ्गल देव (Mangal Deva)',
    nature: 'Dynamic, Courageous & Assertive',
    fastDeity: 'Lord Hanuman / Kartikeya',
    color: 'Bright Red, Coral, Crimson, Saffron',
    gemstone: 'Red Coral (Moonga)',
    direction: 'South (Dakshina)',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥',
    element: 'Fire (Agni)',
    bestFor: 'Competitive exams, sports, legal litigation, Hanuman Chalisa recitation, land/property deeds, gym training, surgeries.',
    avoidFor: 'Lending money (recovery becomes delayed), solemn peace treaties, delicate romantic discussions.',
    significance: 'Governed by Mars, commander of the cosmic forces, bestowing immense physical stamina, bravery, and victory over adversaries.'
  },
  Wednesday: {
    day: 'Wednesday (Budhavar)',
    sanskrit: 'बुधवासरः (Budhavāsaraḥ)',
    planet: 'Mercury (Budh)',
    planetSanskrit: 'बुध देव (Budha Deva)',
    nature: 'Intellectual, Analytical & Commercial',
    fastDeity: 'Lord Ganesha / Lord Vishnu',
    color: 'Emerald Green, Parrot Green, Jade',
    gemstone: 'Emerald (Panna) / Green Tourmaline',
    direction: 'North (Uttara)',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥',
    element: 'Earth (Prithvi)',
    bestFor: 'Business agreements, bookkeeping, marketing campaigns, communication, software coding, academic studies, signing contracts.',
    avoidFor: 'Rash impulsive speculation, arguing with siblings or merchants, heavy emotional drama.',
    significance: 'Governed by Budha, the planet of intelligence, speech (Vak), commerce, wit, and trade expansion.'
  },
  Thursday: {
    day: 'Thursday (Guruvar)',
    sanskrit: 'गुरुवासरः (Guruvāsaraḥ)',
    planet: 'Jupiter (Brihaspati / Guru)',
    planetSanskrit: 'बृहस्पति देव (Brihaspati Deva)',
    nature: 'Auspicious, Expansive & Philosophical',
    fastDeity: 'Lord Vishnu / Brihaspati / Dattatreya',
    color: 'Yellow, Saffron, Golden Amber',
    gemstone: 'Yellow Sapphire (Pukhraj) / Topaz',
    direction: 'North-East (Ishanya)',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः ॥',
    element: 'Ether (Akasha)',
    bestFor: 'Spiritual initiation, higher studies, temple visits, wealth investments, charity, legal advice, marriages, new learning.',
    avoidFor: 'Washing hair/clothes with harsh chemicals (traditional lore), cruelty, gambling, excessive sarcasm.',
    significance: 'Ruled by Devaguru Brihaspati, supreme benefactor of wisdom, righteousness (Dharma), wealth, progeny, and spiritual enlightenment.'
  },
  Friday: {
    day: 'Friday (Shukravar)',
    sanskrit: 'शुक्रवासरः (Śukravāsaraḥ)',
    planet: 'Venus (Shukra)',
    planetSanskrit: 'शुक्र देव (Shukra Deva)',
    nature: 'Harmonious, Luxurious & Creative',
    fastDeity: 'Goddess Mahalakshmi / Santoshi Mata',
    color: 'White, Pink, Silver, Pastel Shades',
    gemstone: 'Diamond (Heera) / White Zircon',
    direction: 'South-East (Agneya)',
    mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ॥',
    element: 'Water (Jala)',
    bestFor: 'Purchasing luxury goods, vehicle delivery, weddings, romance, music & dance, jewelry, spa treatments, Lakshmi Puja.',
    avoidFor: 'Lending fine jewelry, contentious battles, harsh austerity or extreme ascetic practices.',
    significance: 'Ruled by Shukracharya, bringing material prosperity, conjugal bliss, aesthetic refinement, and magnetic beauty.'
  },
  Saturday: {
    day: 'Saturday (Shanivar)',
    sanskrit: 'शनिवासरः (Śanivāsaraḥ)',
    planet: 'Saturn (Shani)',
    planetSanskrit: 'शनि देव (Shani Deva)',
    nature: 'Disciplinary, Karmic & Grounding',
    fastDeity: 'Lord Shani / Lord Hanuman / Lord Shiva',
    color: 'Black, Dark Navy Blue, Charcoal',
    gemstone: 'Blue Sapphire (Neelam) / Amethyst',
    direction: 'West (Pashchima)',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ॥',
    element: 'Air (Vayu)',
    bestFor: 'Charity to underprivileged, feeding crows/dogs, Saturn temple oil lamps, long-term discipline, meditation, machinery maintenance.',
    avoidFor: 'Starting joyful celebrations (vivaha), purchasing mustard oil for personal use, disrespecting laborers or elders.',
    significance: 'Governed by Shani Bhagavan, Lord of Karma and Justice, instilling perseverance, detachment, endurance, and profound life lessons.'
  }
};

const ALL_VAARS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export default function VaarPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [location, setLocation] = useState('New Delhi, Delhi, India');
  const [panchang, setPanchang] = useState<PanchangData>(() =>
    calculatePanchang(new Date().toISOString().split('T')[0], 'New Delhi, Delhi, India')
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setPanchang(calculatePanchang(selectedDate, location));
  }, [selectedDate, location]);

  const activeDayKey = useMemo(() => {
    return panchang.weekday || 'Saturday';
  }, [panchang.weekday]);

  const activeVaar = useMemo(() => {
    return VAAR_PROFILES[activeDayKey] || VAAR_PROFILES.Saturday;
  }, [activeDayKey]);

  // Hourly Planetary Hora for the specified time
  const activeHoraPlanet = useMemo(() => {
    const HORA_ORDER = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
    const DAY_START_PLANET: Record<string, string> = {
      Sunday: 'Sun',
      Monday: 'Moon',
      Tuesday: 'Mars',
      Wednesday: 'Mercury',
      Thursday: 'Jupiter',
      Friday: 'Venus',
      Saturday: 'Saturn'
    };

    const [h, m] = selectedTime.split(':').map(Number);
    const totalMinutes = (h || 0) * 60 + (m || 0);
    // Approximate sunrise at 6:00 AM (360 mins)
    const minutesSinceSunrise = (totalMinutes - 360 + 1440) % 1440;
    const horaIndex = Math.floor(minutesSinceSunrise / 60);

    const startPlanet = DAY_START_PLANET[activeDayKey] || 'Sun';
    const startIdx = HORA_ORDER.indexOf(startPlanet);
    const currentPlanet = HORA_ORDER[(startIdx + horaIndex) % HORA_ORDER.length];

    return {
      planet: currentPlanet,
      horaNumber: (horaIndex % 12) + 1,
      isNightHora: horaIndex >= 12
    };
  }, [selectedTime, activeDayKey]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    await new Promise((res) => setTimeout(res, 350));
    const calculated = calculatePanchang(selectedDate, location);
    setPanchang(calculated);
    setIsCalculating(false);
    setToastMessage(`Vaar calculated for ${calculated.formattedDate} (${location})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8] shadow-sm">
            <Sparkles size={14} className="text-[#B88A44]" />
            Weekday Planetary Lords & Almanac
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Today Vaar — Planetary Day Ruler
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
            Discover the cosmic ruler, presiding deity, lucky gemstone, colors, and ideal actions for any chosen date and location.
          </p>
        </div>

        {/* Date & Location Input Form */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 relative z-30 shadow-xl">
          <div className="grid md:grid-cols-4 gap-4 items-end">
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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-[#C9952B]" /> SELECT TIME (FOR HORA)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm focus:border-[#C9952B] outline-none transition-colors"
                />
                <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9952B] pointer-events-none" />
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
              <span>{isCalculating ? 'Calculating...' : 'Check Vaar'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-semibold text-[#C9952B]">
            <div className="flex items-center gap-2"><MapPin size={15} /><span>{location}</span></div>
            <div className="flex items-center gap-2"><Calendar size={15} /><span>{panchang.formattedDate}</span></div>
            <div className="flex items-center gap-2"><Sun size={15} /><span>Sunrise: {panchang.sunrise}</span></div>
            <div className="flex items-center gap-2"><Moon size={15} /><span>Sunset: {panchang.sunset}</span></div>
            <div className="flex items-center gap-2"><Sparkles size={15} /><span>Tithi: {panchang.tithi}</span></div>
          </div>
        </div>

        {/* Active Vaar Spotlight Card */}
        <div className="p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#B88A44]/50 bg-gradient-to-br from-[#2D1B28] via-[#432332] to-[#1E111B] shadow-2xl text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#F6D075] bg-white/10 px-3.5 py-1 rounded-full border border-white/15 inline-flex items-center gap-1.5 mb-2">
                <Sparkles size={13} className="text-[#F6D075]" /> Active Weekday Lord (वार अधिपति)
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {activeVaar.day}
                </h2>
                <span className="text-xl font-serif text-[#F6D075]">({activeVaar.sanskrit})</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#B88A44]/30 text-[#F6D075] border border-[#B88A44]/50">
                  {activeVaar.nature}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right bg-white/10 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/10 sm:border-0 space-y-0.5">
              <p className="text-xs text-white/75 uppercase tracking-wider">Hourly Hora Ruler ({selectedTime})</p>
              <p className="text-lg sm:text-xl font-extrabold text-[#F6D075]">
                {activeHoraPlanet.planet} Hora (Slot #{activeHoraPlanet.horaNumber})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-white/75 flex items-center gap-1.5">
                <Sun size={14} className="text-[#F6D075]" /> Ruling Planet
              </span>
              <p className="text-sm font-bold text-[#F6D075]">{activeVaar.planet}</p>
              <p className="text-xs text-white/70">{activeVaar.planetSanskrit}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-white/75 flex items-center gap-1.5">
                <Flame size={14} className="text-[#F6D075]" /> Fasting & Presiding Deity
              </span>
              <p className="text-sm font-bold text-white">{activeVaar.fastDeity}</p>
              <p className="text-xs text-emerald-300">Auspicious for prayer & vrat</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-white/75 flex items-center gap-1.5">
                <Gem size={14} className="text-[#F6D075]" /> Favorable Gem & Color
              </span>
              <p className="text-sm font-bold text-white">{activeVaar.gemstone}</p>
              <p className="text-xs text-white/70">{activeVaar.color}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span className="text-xs text-white/75 flex items-center gap-1.5">
                <Compass size={14} className="text-[#F6D075]" /> Cosmic Direction & Element
              </span>
              <p className="text-sm font-bold text-[#F6D075]">{activeVaar.direction}</p>
              <p className="text-xs text-white/70">{activeVaar.element}</p>
            </div>
          </div>

          {/* Sacred Mantra */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-xs font-bold text-[#F6D075] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} /> Sacred Graha Mantra for {activeVaar.day}
            </span>
            <p className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
              {activeVaar.mantra}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase">
                <CheckCircle2 size={15} /> Highly Favorable Activities
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{activeVaar.bestFor}</p>
            </div>

            <div className="p-4.5 rounded-2xl bg-rose-950/50 border border-rose-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase">
                <XCircle size={15} /> Activities to Avoid
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">{activeVaar.avoidFor}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed pt-1 border-t border-white/15">
            <strong className="text-[#F6D075]">Vedic Significance:</strong> {activeVaar.significance}
          </p>
        </div>

        {/* Complete 7 Vaars Comparative Table with Dynamic Active Row Highlight */}
        <div className="bg-[#FFFDFC] p-6 sm:p-8 rounded-3xl border border-[#E5D9C8] space-y-6 shadow-xl text-[#292522]">
          <div className="space-y-1 border-b border-[#E5D9C8] pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full border border-[#E5D9C8] inline-block mb-1">
              Comparative Almanac
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#292522]">
              The 7 Vaars and Planetary Lords
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E55]">
              Highlighted row corresponds to your selected date ({panchang.formattedDate}).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5D9C8] bg-[#F8F3EA] text-left text-xs font-bold text-[#713B32] uppercase">
                  <th className="px-4 py-3">Vaar (Day)</th>
                  <th className="px-4 py-3">Ruling Planet</th>
                  <th className="px-4 py-3">Nature & Energy</th>
                  <th className="px-4 py-3">Fasting Deity</th>
                  <th className="px-4 py-3">Lucky Color</th>
                  <th className="px-4 py-3">Gemstone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D9C8]">
                {ALL_VAARS.map((dayKey) => {
                  const item = VAAR_PROFILES[dayKey];
                  const isSelected = dayKey === activeDayKey;

                  return (
                    <tr
                      key={dayKey}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-[#EDE4D5]/80 font-bold border-l-4 border-l-[#713B32]'
                          : 'hover:bg-[#F8F3EA]'
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-[#292522] flex items-center gap-2">
                        <span>{item.day}</span>
                        {isSelected && (
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#713B32] text-white">
                            Selected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#713B32] font-bold">{item.planet}</td>
                      <td className="px-4 py-3 text-[#6B5E55]">{item.nature}</td>
                      <td className="px-4 py-3 text-emerald-800 font-semibold">{item.fastDeity}</td>
                      <td className="px-4 py-3 text-[#6B5E55]">{item.color}</td>
                      <td className="px-4 py-3 text-[#713B32] font-semibold">{item.gemstone}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

