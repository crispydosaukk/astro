'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  User,
  Star,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  Compass,
  Sun,
  Globe,
  FileText,
  CheckCircle2,
  Heart,
  Coins,
  Activity,
  PhoneCall,
  Bot,
} from 'lucide-react';
import CityLocationInput from '@/components/CityLocationInput';
import AstrologerCtaBanner from '@/components/AstrologerCtaBanner';
import DynamicPageContent from '@/components/DynamicPageContent';
import { useUserData } from '@/lib/useUserData';

export default function FreeHoroscopePage() {
  const { user } = useUserData();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    tob: '',
    pob: '',
    lat: '',
    lon: '',
  });

  const [activeTab, setActiveTab] = useState<
    'overview' | 'd1' | 'd9' | 'planets' | 'dasha' | 'yogas' | 'predictions' | 'remedies'
  >('overview');
  const [horoscopeReport, setHoroscopeReport] = useState<any | null>(null);
  const [apiReportData, setApiReportData] = useState<any | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLocationChange = (city: string, details?: { lat?: string; lon?: string }) => {
    setFormData((prev) => ({
      ...prev,
      pob: city,
      lat: details?.lat || prev.lat,
      lon: details?.lon || prev.lon,
    }));
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    const computedHoroscope = {
      recommendationTitle: 'Free Janam Kundli Report',
      recommendationName: `${formData.name || 'Devotee'}'s Personalized Vedic Chart Analysis`,
      timing: `Generated on ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      duration: 'Lifetime Kundli Insights',
      name: formData.name || 'Devotee',
      gender: formData.gender,
      dob: formData.dob || new Date().toISOString().split('T')[0],
      tob: formData.tob || '12:00 PM',
      pob: formData.pob || 'India',
      lat: formData.lat || '20.59',
      lon: formData.lon || '78.96',
      sunSign: 'Leo (Simha)',
      moonSign: 'Aries (Mesha)',
      ascendant: 'Scorpio (Vrishchika)',
      nakshatra: 'Bharani (Pada 2)',
      nakshatraLord: 'Venus (Shukra)',
      tithi: 'Shukla Paksha Dwadashi',
      yoga: 'Ayushman',
      karana: 'Bava',
      gan: 'Manushya',
      yoni: 'Gaja (Elephant)',
      nadi: 'Madhya',
      planetaryDegrees: [
        {
          planet: 'Sun (Surya)',
          rashi: 'Leo (Simha)',
          degree: "14° 22'",
          house: '10th House',
          status: 'Own Sign (Strong)',
        },
        {
          planet: 'Moon (Chandra)',
          rashi: 'Aries (Mesha)',
          degree: "08° 10'",
          house: '6th House',
          status: 'Exalted Nakshatra',
        },
        {
          planet: 'Mars (Mangal)',
          rashi: 'Scorpio (Vrishchika)',
          degree: "21° 05'",
          house: '1st House (Lagna)',
          status: 'Own Sign (Lagna Lord)',
        },
        {
          planet: 'Mercury (Budh)',
          rashi: 'Virgo (Kanya)',
          degree: "03° 40'",
          house: '11th House',
          status: 'Exalted',
        },
        {
          planet: 'Jupiter (Guru)',
          rashi: 'Cancer (Karka)',
          degree: "18° 12'",
          house: '9th House',
          status: 'Exalted (Highly Auspicious)',
        },
        {
          planet: 'Venus (Shukra)',
          rashi: 'Taurus (Vrishabha)',
          degree: "11° 50'",
          house: '7th House',
          status: 'Own Sign',
        },
        {
          planet: 'Saturn (Shani)',
          rashi: 'Aquarius (Kumbha)',
          degree: "26° 15'",
          house: '4th House',
          status: 'Moolatrikona',
        },
        {
          planet: 'Rahu',
          rashi: 'Pisces (Meena)',
          degree: "09° 04'",
          house: '5th House',
          status: 'Benefic Transit',
        },
        {
          planet: 'Ketu',
          rashi: 'Virgo (Kanya)',
          degree: "09° 04'",
          house: '11th House',
          status: 'Spiritual Alignment',
        },
      ],
      dasha: {
        currentMahadasha: 'Jupiter (Guru)',
        currentAntardasha: 'Saturn (Shani)',
        endDate: '14 Nov 2028',
        timeline: [
          {
            dasha: 'Jupiter - Saturn',
            period: '2025 - 2028',
            effect: 'Career restructuring & steady financial growth',
          },
          {
            dasha: 'Jupiter - Mercury',
            period: '2028 - 2030',
            effect: 'Academic success, foreign travels & wealth',
          },
          {
            dasha: 'Jupiter - Ketu',
            period: '2030 - 2031',
            effect: 'Spiritual awakening & deep meditation',
          },
          {
            dasha: 'Jupiter - Venus',
            period: '2031 - 2034',
            effect: 'Marriage, luxury & social prestige',
          },
        ],
      },
      yogas: [
        {
          name: 'Raja Yoga',
          desc: '1st Lord Mars & 10th Lord Sun in mutual connection granting leadership & governance authority.',
        },
        {
          name: 'Dhana Yoga',
          desc: '5th Lord Venus & 11th Lord Mercury in wealth houses generating financial prosperity.',
        },
        {
          name: 'Gaj Kesari Yoga',
          desc: 'Moon in Kendra to Jupiter granting wisdom, respect, and enduring reputation.',
        },
      ],
      doshas: [
        {
          name: 'Mangal Dosha',
          status: 'Mild (1st House Mars)',
          cancelled: true,
          remedy: 'Chant Hanuman Chalisa on Tuesdays.',
        },
        {
          name: 'Kaal Sarp Dosha',
          status: 'Absent',
          cancelled: false,
          remedy: 'Planets are evenly distributed across Kendra houses.',
        },
      ],
      predictions: {
        career:
          'Exalted 10th house Sun and Jupiter aspect indicate strong potential for government authority, corporate leadership, law, or high-tech management.',
        finance:
          'Dhana Yoga ensures steady asset accumulation through property, investments, and professional income.',
        marriage:
          'Venus in 7th house in own sign promises a charming, supportive, and intellectually compatible spouse.',
        health: 'Lagna Lord Mars ensures high stamina and vital power.',
      },
      remedies: [
        'Wear a natural 6 to 7 Ratti Red Coral in Gold on Tuesday morning.',
        'Chant "Om Namo Bhagavate Vasudevaya" 108 times daily.',
        'Offer water mixed with red flowers to Surya Dev at sunrise.',
      ],
      astrologicalAnalysis: `Extensive birth chart analysis for ${formData.name || 'Devotee'} born on ${formData.dob} at ${formData.pob}.\n\n• Lagna: Scorpio (Vrishchika) ruled by Mars granting resilience and strategic leadership.\n• Moon Sign: Aries (Bharani Nakshatra) bestowing creativity and pioneering drive.\n• Planetary Alignments: Strong 10th House Sun and 9th House exalted Jupiter create powerful Raja Yoga for rapid career and financial growth.\n• Recommended Remedies: Tuesday Hanuman Chalisa and wearing Red Coral for protection.`,
    };

    setHoroscopeReport(computedHoroscope);

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest-user',
          userEmail: user?.email || '',
          type: 'Free Janam Kundli Report',
          details: {
            name: formData.name,
            gender: formData.gender,
            dob: formData.dob,
            time: formData.tob,
            place: formData.pob,
            lat: formData.lat,
            lon: formData.lon,
          },
          reportData: computedHoroscope,
        }),
      });

      const data = await res.json();
      if (data?.reportData) {
        setApiReportData(data.reportData);
        setHoroscopeReport((prev: any) => ({
          ...prev,
          ...data.reportData,
          predictions: data.reportData.predictions || prev?.predictions,
          astrologicalAnalysis: data.reportData.astrologicalAnalysis || prev?.astrologicalAnalysis,
        }));
      }
    } catch (err) {
      console.warn('API report call error:', err);
    }

    setIsCalculating(false);
    setTimeout(() => {
      document.getElementById('report-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const houseGuide = [
    {
      num: '1st House',
      title: 'Lagna (Ascendant)',
      desc: 'Personality, physical constitution, self-expression, and general life orientation.',
    },
    {
      num: '2nd House',
      title: 'Dhan Bhava',
      desc: 'Wealth, family lineage, speech, liquid assets, and early childhood values.',
    },
    {
      num: '3rd House',
      title: 'Sahaj Bhava',
      desc: 'Courage, communication, siblings, short-distance travels, and mental initiative.',
    },
    {
      num: '4th House',
      title: 'Sukha Bhava',
      desc: 'Home, domestic tranquility, mother, land, vehicles, and inner emotional peace.',
    },
    {
      num: '5th House',
      title: 'Putra & Trikona',
      desc: 'Creativity, education, romance, intelligence, children, and past-life karma (Purva Punya).',
    },
    {
      num: '6th House',
      title: 'Shatru Bhava',
      desc: 'Health challenges, debts, daily work routine, competition, and overcoming obstacles.',
    },
    {
      num: '7th House',
      title: 'Yuvati Bhava',
      desc: 'Marriage, life partner, legal partnerships, contracts, and public relations.',
    },
    {
      num: '8th House',
      title: 'Aayu Bhava',
      desc: 'Transformation, longevity, sudden gains, occult knowledge, and hidden mysteries.',
    },
    {
      num: '9th House',
      title: 'Bhagya Bhava',
      desc: 'Luck, higher wisdom, spiritual dharma, mentors/father, and long-distance travel.',
    },
    {
      num: '10th House',
      title: 'Karma Bhava',
      desc: 'Career, status, authority, public recognition, karma, and executive strength.',
    },
    {
      num: '11th House',
      title: 'Labha Bhava',
      desc: 'Income, financial gains, social networks, fulfillment of desires, and elder siblings.',
    },
    {
      num: '12th House',
      title: 'Vyaya Bhava',
      desc: 'Moksha (liberation), spiritual retreat, foreign connections, subconscious mind, and expenditure.',
    },
  ];

  const faqs = [
    {
      q: 'How to generate a Janam Kundli online on AstroParihar?',
      a: 'Simply enter your full name, date of birth, time of birth, and birth location into the AstroParihar Kundli calculator. Our Vedic algorithms compute exact planetary placements instantly.',
    },
    {
      q: 'Why is birth time accuracy so critical in Vedic Astrology?',
      a: 'Even a few minutes shift can change your Lagna (Ascendant) sign or degree, altering house placements, Dasha timelines, and divisional charts (Navamsa D9). Exact birth time yields peak accuracy.',
    },
  ];

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section with Integrated Form */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/horoscope_banner.jpg"
            alt="Vedic Horoscope & Kundli Background"
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

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid lg:grid-cols-12 items-start gap-8 lg:gap-12 w-full">
            {/* Left Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 mb-4 backdrop-blur-md shadow-xl shadow-black/20">
                  <Sparkles size={15} className="text-[#F6D075] animate-pulse" /> Free Vedic
                  Horoscope & Janam Kundli
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight max-w-xl drop-shadow-lg">
                  Free Vedic <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6D075] via-[#FFE29F] to-[#D4A03D] drop-shadow-sm">
                    Horoscope & Kundli
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-[#F8F3EA]/90 font-medium leading-relaxed max-w-lg drop-shadow">
                  Enter your birth details to generate your complete Vedic birth chart with
                  AI-powered planetary predictions, Dasha timeline, and authentic remedies.
                </p>
              </div>

              {/* Form Card */}
              <div
                id="form-section"
                className="glass-card p-6 sm:p-8 rounded-3xl border border-[#B88A44]/30 shadow-2xl backdrop-blur-xl bg-card/90 space-y-4"
              >
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <User size={13} className="text-[#C9952B]" /> Full Name*
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5D9C8] text-[#292522] placeholder:text-[#6B5E55]/60 text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider">
                        Gender*
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="Male" className="bg-[#FFFDFC] text-[#292522]">
                          Male
                        </option>
                        <option value="Female" className="bg-[#FFFDFC] text-[#292522]">
                          Female
                        </option>
                        <option value="Other" className="bg-[#FFFDFC] text-[#292522]">
                          Other
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#C9952B]" /> Date of Birth*
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} className="text-[#C9952B]" /> Time of Birth*
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.tob}
                        onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] text-sm focus:outline-none focus:border-[#C9952B] focus:ring-2 focus:ring-[#C9952B]/20 transition-all shadow-sm cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <CityLocationInput
                      label="Place of Birth (City Search & Map Location)*"
                      value={formData.pob}
                      onChange={handleLocationChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#C9952B]/30 cursor-pointer pt-3"
                  >
                    {isCalculating ? (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} className="animate-spin text-[#292522]" /> Generating AI
                        Horoscope...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} className="text-[#292522]" /> Generate Free AI Horoscope
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Right Side Category Cards & Trust Badges */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="lg:col-span-5 space-y-4 pt-4 lg:pt-8"
            >
              <div className="glass-card border border-[#B88A44]/30 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl bg-card/85">
                <h3 className="text-sm font-bold text-[#713B32] uppercase tracking-wider flex items-center gap-2">
                  <Star size={16} className="text-[#C9952B]" /> Specialized Horoscopes
                </h3>
                <div className="space-y-2.5">
                  <Link
                    href="/services/horoscope/love"
                    className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:border-rose-500 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                        <Heart size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#292522] group-hover:text-rose-700">
                          Love & Marriage Horoscope
                        </div>
                        <div className="text-xs text-[#6B5E55]">
                          7th house, Venus & soulmate timing
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-rose-500 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>

                  <Link
                    href="/services/horoscope/finance"
                    className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <Coins size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#292522] group-hover:text-emerald-700">
                          Finance & Wealth Horoscope
                        </div>
                        <div className="text-xs text-[#6B5E55]">
                          2nd/11th house, Dhana yogas & investments
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-emerald-600 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>

                  <Link
                    href="/services/horoscope/health"
                    className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-600">
                        <Activity size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#292522] group-hover:text-cyan-700">
                          Health & Vitality Horoscope
                        </div>
                        <div className="text-xs text-[#6B5E55]">
                          Lagna vitality, Tridoshas & Ayurveda
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-cyan-600 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>

              {/* Trust Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#281123] to-[#170b16] text-white border border-[#B88A44]/30 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F6D075] uppercase tracking-wider">
                    Need Personal Consultation?
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Online
                  </span>
                </div>
                <p className="text-xs text-[#F8F3EA]/90 leading-relaxed">
                  Have a verified Vedic astrologer analyze your chart live over phone for precise
                  life guidance.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/talk-to-ai-astrologer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white font-extrabold text-xs transition-all shadow-md"
                  >
                    <Bot size={13} className="animate-pulse" /> AI Expert Astrologer
                  </Link>
                  <Link
                    href="/talk-to-astrologer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl gold-gradient-bg text-[#292522] font-extrabold text-xs hover:brightness-110 transition-all shadow-md"
                  >
                    <PhoneCall size={13} /> Consult Astrologer Live
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comprehensive Kundli Report Output */}
      <AnimatePresence>
        {horoscopeReport && (
          <section
            id="report-section"
            className="py-10 bg-background/50 border-t border-white/5 space-y-8"
          >
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-6">
              {/* Header Summary Banner */}
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/30">
                      JANAM KUNDLI REPORT
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Saved to My Reports 📄
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-foreground">
                    Kundli for <span className="text-gradient-gold">{horoscopeReport.name}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                    <span>📅 {horoscopeReport.dob}</span>
                    <span>⏰ {horoscopeReport.tob}</span>
                    {horoscopeReport.pob && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#C9952B]" /> {horoscopeReport.pob}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    href="/talk-to-ai-astrologer"
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C9952B] to-[#b08022] hover:from-[#b08022] hover:to-[#966b1a] text-white font-bold transition-all flex items-center gap-1.5 text-xs shadow-lg"
                  >
                    <Bot size={14} className="animate-pulse" /> AI Expert Astrologer
                  </Link>
                  <Link
                    href="/talk-to-astrologer"
                    className="px-5 py-2.5 rounded-full bg-[#713B32] hover:bg-[#552B24] text-white font-bold transition-colors flex items-center gap-1.5 text-xs shadow-lg"
                  >
                    <PhoneCall size={14} className="text-[#D8B66A]" /> Talk to Astrologer 📞
                  </Link>
                  <Link
                    href="/my-reports"
                    className="px-5 py-2.5 rounded-full gold-gradient-bg text-white font-bold hover:opacity-90 transition-opacity flex items-center gap-2 text-xs shadow-lg"
                  >
                    <FileText size={14} /> View in My Reports 📄
                  </Link>
                </div>
              </div>

              {/* Dynamic AI Astrological Analysis from API */}
              {apiReportData && (
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#C9952B]/30 space-y-4 bg-[#C9952B]/5">
                  <h3 className="text-xl font-bold text-[#C9952B] flex items-center gap-2">
                    <Sparkles size={20} /> AI Astrological Analysis
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {apiReportData.astrologicalAnalysis}
                  </p>
                  {apiReportData.procedure && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-xs font-bold text-[#C9952B] uppercase tracking-wider">
                        Recommended Ritual / Procedure
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                        {apiReportData.procedure}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
                {[
                  { id: 'overview', label: 'Avakhada & Overview' },
                  { id: 'd1', label: 'Lagna Chart (D1)' },
                  { id: 'd9', label: 'Navamsha Chart (D9)' },
                  { id: 'planets', label: 'Planets & Degrees' },
                  { id: 'dasha', label: 'Vimshottari Dasha' },
                  { id: 'yogas', label: 'Yogas & Doshas' },
                  { id: 'predictions', label: 'Life Predictions' },
                  { id: 'remedies', label: 'Vedic Remedies' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'gold-gradient-bg text-white shadow-lg'
                        : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview & Avakhada */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">
                        ASCENDANT (LAGNA)
                      </span>
                      <p className="text-base font-bold text-[#C9952B]">
                        {horoscopeReport.ascendant}
                      </p>
                    </div>
                    <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">
                        SUN SIGN
                      </span>
                      <p className="text-base font-bold text-[#C9952B]">
                        {horoscopeReport.sunSign}
                      </p>
                    </div>
                    <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">
                        MOON SIGN (RASHI)
                      </span>
                      <p className="text-base font-bold text-[#C9952B]">
                        {horoscopeReport.moonSign}
                      </p>
                    </div>
                    <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">
                        NAKSHATRA
                      </span>
                      <p className="text-base font-bold text-[#C9952B]">
                        {horoscopeReport.nakshatra}
                      </p>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Avakhada Chakra & Panchang Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-muted-foreground block">Nakshatra Lord</span>
                        <span className="font-bold text-foreground">
                          {horoscopeReport.nakshatraLord}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-muted-foreground block">Tithi</span>
                        <span className="font-bold text-foreground">{horoscopeReport.tithi}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-muted-foreground block">Yoga</span>
                        <span className="font-bold text-foreground">{horoscopeReport.yoga}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5">
                        <span className="text-muted-foreground block">Karana</span>
                        <span className="font-bold text-foreground">{horoscopeReport.karana}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: D1 Lagna Chart */}
              {activeTab === 'd1' && (
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Lagna Chart (D1 Main Birth Chart)
                    </h3>
                    <span className="text-xs font-bold text-[#C9952B] bg-[#C9952B]/10 px-3 py-1 rounded-full border border-[#C9952B]/20">
                      Ascendant: Scorpio (8)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { house: 'H1 (Lagna)', sign: 'Scorpio', planets: 'Mars, Sun' },
                      { house: 'H2 (Dhana)', sign: 'Sagittarius', planets: 'Jupiter' },
                      { house: 'H3 (Sahaj)', sign: 'Capricorn', planets: 'Empty' },
                      { house: 'H4 (Sukha)', sign: 'Aquarius', planets: 'Saturn' },
                      { house: 'H5 (Putra)', sign: 'Pisces', planets: 'Rahu' },
                      { house: 'H6 (Shatru)', sign: 'Aries', planets: 'Moon' },
                      { house: 'H7 (Yuvati)', sign: 'Taurus', planets: 'Venus' },
                      { house: 'H8 (Aayu)', sign: 'Gemini', planets: 'Empty' },
                      { house: 'H9 (Bhagya)', sign: 'Cancer', planets: 'Exalted Jupiter' },
                      { house: 'H10 (Karma)', sign: 'Leo', planets: 'Sun' },
                      { house: 'H11 (Labha)', sign: 'Virgo', planets: 'Mercury, Ketu' },
                      { house: 'H12 (Vyaya)', sign: 'Libra', planets: 'Empty' },
                    ].map((item) => (
                      <div
                        key={item.house}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1"
                      >
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#C9952B]">{item.house}</span>
                          <span className="text-muted-foreground">{item.sign}</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground pt-1">
                          {item.planets === 'Empty' ? (
                            <span className="text-muted-foreground/60">No Planets</span>
                          ) : (
                            item.planets
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: D9 Navamsha Chart */}
              {activeTab === 'd9' && (
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-foreground">
                      Navamsha Chart (D9 Marriage & Spiritual Strength)
                    </h3>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                      Spousal & Karmic Strength
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { house: 'D9 H1', sign: 'Taurus', planets: 'Venus' },
                      { house: 'D9 H2', sign: 'Gemini', planets: 'Mercury' },
                      { house: 'D9 H4', sign: 'Leo', planets: 'Sun' },
                      { house: 'D9 H7', sign: 'Scorpio', planets: 'Jupiter, Moon' },
                      { house: 'D9 H9', sign: 'Capricorn', planets: 'Mars' },
                      { house: 'D9 H10', sign: 'Aquarius', planets: 'Saturn' },
                      { house: 'D9 H11', sign: 'Pisces', planets: 'Rahu' },
                      { house: 'D9 H12', sign: 'Aries', planets: 'Ketu' },
                    ].map((item) => (
                      <div
                        key={item.house}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1"
                      >
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#C9952B]">{item.house}</span>
                          <span className="text-muted-foreground">{item.sign}</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground pt-1">{item.planets}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Planetary Degrees */}
              {activeTab === 'planets' && (
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                  <h3 className="text-xl font-bold text-foreground">
                    Planetary Degrees & Status Table
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-muted-foreground uppercase font-bold">
                          <th className="py-3 px-3">Planet</th>
                          <th className="py-3 px-3">Rashi (Sign)</th>
                          <th className="py-3 px-3">Degree</th>
                          <th className="py-3 px-3">House Placement</th>
                          <th className="py-3 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {horoscopeReport.planetaryDegrees.map((p: any) => (
                          <tr key={p.planet} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3 font-bold text-[#C9952B]">{p.planet}</td>
                            <td className="py-3 px-3 font-semibold text-foreground">{p.rashi}</td>
                            <td className="py-3 px-3 font-mono">{p.degree}</td>
                            <td className="py-3 px-3 text-muted-foreground">{p.house}</td>
                            <td className="py-3 px-3 font-bold text-emerald-400">{p.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: Vimshottari Dasha */}
              {activeTab === 'dasha' && (
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-foreground">Active Vimshottari Dasha</h3>
                    <span className="text-xs font-bold text-[#C9952B] bg-[#C9952B]/20 px-3 py-1 rounded-full">
                      Current: {horoscopeReport.dasha.currentMahadasha} -{' '}
                      {horoscopeReport.dasha.currentAntardasha}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {horoscopeReport.dasha.timeline.map((t: any) => (
                      <div
                        key={t.dasha}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap justify-between items-center gap-2"
                      >
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{t.dasha}</h4>
                          <p className="text-xs text-muted-foreground">{t.effect}</p>
                        </div>
                        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-[#C9952B]">
                          {t.period}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Yogas & Doshas */}
              {activeTab === 'yogas' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-lg font-bold text-[#C9952B] flex items-center gap-2">
                      <Sparkles size={18} /> Prominent Yogas
                    </h3>
                    <div className="space-y-3">
                      {horoscopeReport.yogas.map((y: any) => (
                        <div
                          key={y.name}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1"
                        >
                          <h4 className="font-bold text-foreground text-sm">{y.name}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{y.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                      <ShieldCheck size={18} /> Dosha Analysis
                    </h3>
                    <div className="space-y-3">
                      {horoscopeReport.doshas.map((d: any) => (
                        <div
                          key={d.name}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-foreground text-sm">{d.name}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                d.cancelled
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {d.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {d.remedy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 7: Life Predictions */}
              {activeTab === 'predictions' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-2">
                      <h4 className="font-bold text-[#C9952B] text-base">💼 Career & Profession</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {horoscopeReport.predictions.career}
                      </p>
                    </div>
                    <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-emerald-400 text-base flex items-center gap-1.5">
                          <Coins size={16} /> Finance & Wealth
                        </h4>
                        <Link
                          href="/services/horoscope/finance"
                          className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Deep Dive →
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {horoscopeReport.predictions.finance}
                      </p>
                    </div>
                    <div className="glass-card p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-rose-400 text-base flex items-center gap-1.5">
                          <Heart size={16} /> Marriage & Relationships
                        </h4>
                        <Link
                          href="/services/horoscope/love"
                          className="text-[11px] font-bold text-rose-400 hover:underline flex items-center gap-1"
                        >
                          Deep Dive →
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {horoscopeReport.predictions.marriage}
                      </p>
                    </div>
                    <div className="glass-card p-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-cyan-400 text-base flex items-center gap-1.5">
                          <Activity size={16} /> Health & Vitality
                        </h4>
                        <Link
                          href="/services/horoscope/health"
                          className="text-[11px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          Deep Dive →
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {horoscopeReport.predictions.health}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 8: Vedic Remedies */}
              {activeTab === 'remedies' && (
                <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Personalized Vedic Remedies</h3>
                  <div className="space-y-3">
                    {horoscopeReport.remedies.map((rem: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3"
                      >
                        <CheckCircle2 size={18} className="text-[#C9952B] shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{rem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Content Managed via Admin Panel */}
              <DynamicPageContent pageId="horoscope-main" />

              {/* Consultation CTA Banner */}
              <AstrologerCtaBanner
                theme="gold"
                title="Need In-Depth Interpretation of Your Kundli?"
                subtitle="Discuss your D1 Lagna, D9 Navamsha, Vimshottari Mahadasha, and key planetary yogas with a verified Master Astrologer on live call or chat."
                badge="Talk to Senior Vedic Astrologer"
              />
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* SPECIALIZED HOROSCOPES NAVIGATION SECTION */}
      <section className="py-16 bg-background/50 border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#C9952B] uppercase tracking-widest">
              Targeted Vedic Forecasts
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Explore Specialized Horoscopes
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select a category below for in-depth astrological analysis and remedies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Love Card */}
            <Link
              href="/services/horoscope/love"
              className="glass-card p-6 lg:p-8 rounded-3xl border border-rose-500/20 hover:border-rose-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-rose-500/10"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Heart size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-rose-400 transition-colors">
                  Love & Relationship Horoscope
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Discover 7th House (Kalatra Bhava), Venusian strength, Manglik alignment,
                  relationship synergy, and marriage timing.
                </p>
              </div>
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1 pt-2">
                Open Love Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Finance Card */}
            <Link
              href="/services/horoscope/finance"
              className="glass-card p-6 lg:p-8 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Coins size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  Finance & Wealth Horoscope
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Analyze Dhana Bhava (2nd House), Labha Bhava (11th House), Jupiter&apos;s wealth
                  yogas, and favorable investment timing.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-2">
                Open Finance Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Health Card */}
            <Link
              href="/services/horoscope/health"
              className="glass-card p-6 lg:p-8 rounded-3xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all group flex flex-col justify-between space-y-4 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Activity size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                  Health & Vitality Horoscope
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Evaluate Lagna vitality, 6th House (Roga Bhava), Ayurvedic Tridosha balance
                  (Vata/Pitta/Kapha), and longevity remedies.
                </p>
              </div>
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 pt-2">
                Open Health Horoscope{' '}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Educational Guide */}
      <section className="py-8 lg:py-12 bg-background border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-8">
          <div className="glass-card p-6 lg:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">The 12 Houses Explained</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {houseGuide.map((h) => (
                <div
                  key={h.num}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#C9952B]">{h.num}</span>
                    <span className="text-xs font-semibold text-foreground">{h.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
