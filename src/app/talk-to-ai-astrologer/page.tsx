'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import AppImage from '@/components/ui/AppImage';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Star,
  Phone,
  Bot,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Award,
  BookOpen,
  HelpCircle,
  Clock,
  Compass,
  Hash,
  Target,
  Flame,
  Hand,
  Layers,
  X,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Volume2,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import {
  AIAstrologer,
  AIDiscipline,
  DEFAULT_AI_ASTROLOGERS,
  DEFAULT_AI_DISCIPLINES,
  getAIAstrologers,
  getAIDisciplines,
} from '@/lib/aiAstrologerData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Icon Map for disciplines
const disciplineIconMap: Record<string, any> = {
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  Compass,
  Hash,
  Target,
  Award,
  Flame,
  Hand,
  Layers,
  ShieldCheck,
};

export default function TalkToAIAstrologerPage() {
  const router = useRouter();
  const { user, userData } = useUserData();
  const { formatPrice, currencySymbol } = useCurrency();

  const [astrologers, setAstrologers] = useState<AIAstrologer[]>(DEFAULT_AI_ASTROLOGERS);
  const [disciplines, setDisciplines] = useState<AIDiscipline[]>(DEFAULT_AI_DISCIPLINES);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'popularity' | 'price-low' | 'price-high'>(
    'rating'
  );

  // Modals & State
  const [selectedAstrologer, setSelectedAstrologer] = useState<AIAstrologer | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callLanguage, setCallLanguage] = useState<string>('English');

  // Birth Details Intake Form
  const [birthForm, setBirthForm] = useState({
    name: '',
    gender: 'Male',
    dob: '1995-05-15',
    time: '14:30',
    place: 'New Delhi, India',
    primaryConcern: 'Career Growth & Promotion',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [astData, discData] = await Promise.all([getAIAstrologers(), getAIDisciplines()]);
        if (astData?.length) setAstrologers(astData);
        if (discData?.length) setDisciplines(discData);
      } catch (err) {
        console.warn('Using default AI astrologers and disciplines:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Pre-fill user data if available
  useEffect(() => {
    if (userData) {
      setBirthForm((prev) => ({
        ...prev,
        name: userData.name || prev.name,
        gender: userData.gender || prev.gender,
        dob: userData.dob || prev.dob,
        time: userData.birthTime || prev.time,
        place: userData.birthPlace || prev.place,
      }));
    }
  }, [userData]);

  // Languages Available
  const allLanguages = useMemo(() => {
    const langs = new Set<string>();
    astrologers.forEach((a) => a.languages?.forEach((l) => langs.add(l)));
    return ['all', ...Array.from(langs)];
  }, [astrologers]);

  // Filtered Astrologers
  const filteredAstrologers = useMemo(() => {
    return astrologers
      .filter((a) => {
        if (!a.isActive) return false;
        // Search Filter
        const term = search.toLowerCase();
        const matchSearch =
          !term ||
          a.name.toLowerCase().includes(term) ||
          a.tagline.toLowerCase().includes(term) ||
          a.bio.toLowerCase().includes(term) ||
          a.primaryDiscipline.toLowerCase().includes(term) ||
          a.specialities?.some((s) => s.toLowerCase().includes(term));

        // Discipline Filter
        const matchDisc =
          selectedDiscipline === 'all' ||
          a.primaryDiscipline.toLowerCase() === selectedDiscipline.toLowerCase() ||
          a.secondaryDisciplines?.some((d) => d.toLowerCase() === selectedDiscipline.toLowerCase());

        // Language Filter
        const matchLang =
          selectedLanguage === 'all' ||
          a.languages?.some((l) => l.toLowerCase() === selectedLanguage.toLowerCase());

        return matchSearch && matchDisc && matchLang;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'popularity')
          return (b.totalConsultations || 0) - (a.totalConsultations || 0);
        if (sortBy === 'price-low') return (a.pricePerMin || 0) - (b.pricePerMin || 0);
        if (sortBy === 'price-high') return (b.pricePerMin || 0) - (a.pricePerMin || 0);
        return 0;
      });
  }, [astrologers, search, selectedDiscipline, selectedLanguage, sortBy]);

  // Open consultation booking
  const handleInitiateConsultation = (astro: AIAstrologer) => {
    setSelectedAstrologer(astro);
    if (selectedLanguage !== 'all') {
      setCallLanguage(selectedLanguage);
    } else if (astro.languages?.length) {
      setCallLanguage(astro.languages[0]);
    } else {
      setCallLanguage('English');
    }
    setShowBookingModal(true);
  };

  // Start Consultation
  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAstrologer) return;

    if (!user) {
      toast.error('Please sign in to start your AI consultation');
      router.push(`/sign-up-login-screen?redirect=${encodeURIComponent('/talk-to-ai-astrologer')}`);
      return;
    }

    const currentBalance = userData?.walletBalance || 0;
    const pricePerMin = selectedAstrologer.pricePerMin || 20;
    const minRequired = pricePerMin * 5;

    if (currentBalance < minRequired) {
      toast.error(`Insufficient balance. Minimum ${formatPrice(minRequired)} (5 mins) required.`);
      router.push(`/wallet?redirect=${encodeURIComponent('/talk-to-ai-astrologer')}`);
      return;
    }

    setIsConnecting(true);

    try {
      const res = await fetch('/api/ai-consultation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.uid,
          customerName: birthForm.name || user.displayName || 'Devotee',
          customerEmail: user.email || '',
          astrologerId: selectedAstrologer.id,
          language: callLanguage,
          birthDetails: birthForm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          toast.error(data.error || 'Insufficient wallet balance. Please recharge.');
          router.push(`/wallet?redirect=${encodeURIComponent('/talk-to-ai-astrologer')}`);
          return;
        }
        throw new Error(data.error || 'Failed to start AI consultation');
      }

      toast.success(`Connecting you to ${selectedAstrologer.name}...`);
      setShowBookingModal(false);
      router.push(`/ai-call/${data.sessionId}`);
    } catch (err: any) {
      console.error('Start AI call error:', err);
      toast.error(err.message || 'Failed to start AI session. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 cosmic-bg overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/25 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/20 blur-3xl" />
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/40 text-[#C9952B] mb-5 shadow-lg shadow-[#C9952B]/10">
              <Sparkles size={14} className="animate-spin text-[#C9952B]" />✦ 24x7 Instant Voice
              Connect · Zero Waiting Queue · 12+ Disciplines
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 font-serif text-[#FFFDFC]">
              Talk to <span className="text-[#E5B54F]">AI Expert Astrologers</span>
            </h1>
            <p className="text-[#F3EBDD] max-w-2xl mx-auto text-base md:text-lg mb-8 font-normal leading-relaxed">
              Experience authentic, instant, two-way voice consultations with elite Vedic, Tarot,
              KP, and Nadi AI Expert personalities — powered by deep birth-chart synthesis.
            </p>

            {/* Quick Navigation Pill Switcher */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#221B14]/80 backdrop-blur-md border border-[#C9952B]/40 shadow-xl mb-6">
              <Link
                href="/talk-to-astrologer"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#D4C3A3] hover:text-[#FFFDFC] transition-all flex items-center gap-2"
              >
                <User size={16} /> Human Astrologers
              </Link>
              <div className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#C9952B] text-white shadow-md flex items-center gap-2">
                <Bot size={16} /> ✦ AI Expert Astrologers (Instant Voice)
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Marketplace Section */}
      <section className="py-10 max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Disciplines Horizontal Filter Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#C9952B]" /> Browse by Astrology
              Discipline
            </h3>
            <span className="text-xs text-muted-foreground">
              {filteredAstrologers.length} AI Astrologers Available
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDiscipline('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedDiscipline === 'all'
                  ? 'bg-[#C9952B] text-white border-[#C9952B] shadow-md shadow-[#C9952B]/20'
                  : 'glass-card border-border/60 text-muted-foreground hover:text-foreground hover:border-[#C9952B]/40'
              }`}
            >
              ✦ All Disciplines
            </button>
            {disciplines.map((d) => {
              const IconComponent = disciplineIconMap[d.iconName] || Sparkles;
              const isSelected = selectedDiscipline.toLowerCase() === d.name.toLowerCase();
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDiscipline(isSelected ? 'all' : d.name)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#C9952B] text-white border-[#C9952B] shadow-md shadow-[#C9952B]/20 font-semibold'
                      : 'glass-card border-border/60 text-muted-foreground hover:text-foreground hover:border-[#C9952B]/40'
                  }`}
                >
                  <IconComponent
                    size={14}
                    className={isSelected ? 'text-white' : 'text-[#C9952B]'}
                  />
                  {d.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Secondary Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-card/40 p-4 rounded-2xl border border-border/60 backdrop-blur-sm">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by AI Astrologer name, specialty (e.g. Career, Marriage), or discipline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/80 border border-border focus:border-[#C9952B] focus:ring-1 focus:ring-[#C9952B] text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Language Selector */}
          <div className="md:col-span-3">
            <div className="relative">
              <Globe
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-background/80 border border-border focus:border-[#C9952B] text-sm text-foreground outline-none cursor-pointer appearance-none"
              >
                <option value="all">Language: All</option>
                {allLanguages
                  .filter((l) => l !== 'all')
                  .map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Sort By Selector */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background/80 border border-border focus:border-[#C9952B] text-sm text-foreground outline-none cursor-pointer"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="popularity">Sort: Most Consultations</option>
              <option value="price-low">Sort: Price (Low to High)</option>
              <option value="price-high">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* AI Astrologers Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#C9952B] mb-4" size={40} />
            <p className="text-muted-foreground text-sm">Consulting the celestial AI agents...</p>
          </div>
        ) : filteredAstrologers.length === 0 ? (
          <div className="py-20 text-center glass-card border border-border rounded-2xl p-8 max-w-lg mx-auto">
            <Bot size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground mb-1">No AI Astrologers Found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your search criteria, language selection, or discipline filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedDiscipline('all');
                setSelectedLanguage('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#C9952B] text-white text-sm font-semibold hover:bg-[#b08022] transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAstrologers.map((astro) => (
              <motion.div
                key={astro.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative glass-card border border-border/70 hover:border-[#C9952B]/60 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-[#C9952B]/10 flex flex-col justify-between"
              >
                {/* Featured Badge */}
                {astro.isFeatured && (
                  <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/40 flex items-center gap-1">
                    <Sparkles size={11} /> FEATURED
                  </div>
                )}

                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#C9952B]/40 relative group-hover:scale-105 transition-transform">
                        <AppImage
                          src={astro.avatar}
                          alt={astro.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Active AI Agent Indicator */}
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background"></span>
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C9952B]/15 text-[#C9952B] uppercase">
                          {astro.primaryDiscipline}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-foreground truncate group-hover:text-[#C9952B] transition-colors">
                        {astro.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {astro.tagline}
                      </p>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star size={13} className="fill-amber-500" />
                          {astro.rating}
                        </div>
                        <span className="text-muted-foreground/40">·</span>
                        <div className="text-muted-foreground text-[11px]">
                          {astro.totalConsultations.toLocaleString()} calls
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {astro.bio}
                  </p>

                  {/* Specialities Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {astro.specialities?.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-card border border-border/70 text-foreground/80"
                      >
                        {spec}
                      </span>
                    ))}
                    {astro.specialities?.length > 3 && (
                      <span className="px-2 py-1 rounded-lg text-[10px] text-muted-foreground bg-muted">
                        +{astro.specialities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Languages Spoken */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Globe size={13} className="text-[#C9952B]" />
                    <span className="truncate">{astro.languages?.join(', ')}</span>
                  </div>
                </div>

                {/* Bottom Pricing & Call CTA */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Rate
                    </span>
                    <div className="text-base font-bold text-[#C9952B] flex items-baseline gap-1">
                      {formatPrice(astro.pricePerMin)}
                      <span className="text-[11px] font-normal text-muted-foreground">/min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAstrologer(astro);
                        setShowProfileModal(true);
                      }}
                      className="p-2.5 rounded-xl border border-border hover:border-[#C9952B]/60 text-muted-foreground hover:text-foreground transition-all"
                      title="View AI Astrologer Profile"
                    >
                      <User size={16} />
                    </button>
                    <button
                      onClick={() => handleInitiateConsultation(astro)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#713B32] text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#C9952B]/20 hover:opacity-95 active:scale-95 transition-all"
                    >
                      <Phone size={14} className="fill-white" />✦ Instant Call
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* AI Astrologer Detailed Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedAstrologer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="relative p-6 cosmic-bg border-b border-[#C9952B]/40 text-[#FFFDFC]">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/15 text-[#E5D5BA] hover:text-[#FFFDFC] transition-all"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#C9952B] relative shadow-lg">
                    <AppImage
                      src={selectedAstrologer.avatar}
                      alt={selectedAstrologer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#C9952B]/30 text-[#FFFDFC] border border-[#C9952B]/50 uppercase">
                      {selectedAstrologer.primaryDiscipline}
                    </span>
                    <h2 className="text-xl font-bold text-[#FFFDFC] mt-1 font-serif">
                      {selectedAstrologer.name}
                    </h2>
                    <p className="text-xs text-[#E5D5BA] mt-0.5 font-medium">{selectedAstrologer.tagline}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star size={13} className="fill-amber-400" /> {selectedAstrologer.rating}
                      </span>
                      <span className="text-[#D4C3A3]">·</span>
                      <span className="text-[#E5D5BA] font-medium">
                        {selectedAstrologer.experienceYears} Years Vedic Experience
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-1 text-xs uppercase tracking-wider text-[#C9952B]">
                    About & Methodology
                  </h4>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {selectedAstrologer.bio}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-1 text-xs uppercase tracking-wider text-[#C9952B]">
                    Consultation Style
                  </h4>
                  <p className="text-xs text-foreground/90 bg-muted/50 p-3 rounded-xl border border-border">
                    {selectedAstrologer.consultationStyle}
                  </p>
                </div>

                {/* Speciality Scores */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wider text-[#C9952B]">
                    Discipline Expertise Scores
                  </h4>
                  <div className="space-y-2">
                    {selectedAstrologer.specialityScores?.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-bold text-foreground">{item.score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#C9952B] to-[#713B32] rounded-full"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-semibold text-foreground mb-1 text-xs uppercase tracking-wider text-[#C9952B]">
                    Languages Supported
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAstrologer.languages?.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs bg-muted border border-border text-foreground font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-card/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Rate</span>
                  <div className="text-lg font-bold text-[#C9952B]">
                    {formatPrice(selectedAstrologer.pricePerMin)}
                    <span className="text-xs text-muted-foreground font-normal">/min</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowBookingModal(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#713B32] text-white font-semibold text-sm shadow-lg shadow-[#C9952B]/20 hover:opacity-95 transition-all"
                >
                  Proceed to Voice Call
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pre-Consultation Birth Intake & Wallet Gate Modal */}
      <AnimatePresence>
        {showBookingModal && selectedAstrologer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
            >
              {/* Header */}
              <div className="p-5 cosmic-bg border-b border-[#C9952B]/40 flex items-center justify-between text-[#FFFDFC]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#C9952B] relative shadow-md">
                    <AppImage
                      src={selectedAstrologer.avatar}
                      alt={selectedAstrologer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#FFFDFC] text-base font-serif">
                      Connect with {selectedAstrologer.name}
                    </h3>
                    <p className="text-xs text-[#E5D5BA] font-medium">
                      Rate: <span className="text-[#E5B54F] font-bold">{formatPrice(selectedAstrologer.pricePerMin)}/min</span> · Live Voice Call
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 rounded-full hover:bg-white/15 text-[#E5D5BA] hover:text-[#FFFDFC] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleStartCall}
                className="p-6 space-y-4 overflow-y-auto max-h-[75vh]"
              >
                {/* Wallet Balance Summary Card */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#C9952B]/15 text-[#C9952B]">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold block">
                        Wallet Balance
                      </span>
                      <div className="text-base font-bold text-foreground">
                        {formatPrice(userData?.walletBalance || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Calculated Duration */}
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold block">
                      Max Call Time
                    </span>
                    <span className="text-xs font-bold text-emerald-500">
                      ~
                      {Math.floor(
                        (userData?.walletBalance || 0) / (selectedAstrologer.pricePerMin || 20)
                      )}{' '}
                      mins
                    </span>
                  </div>
                </div>

                {/* Low Balance Alert if < 5 mins */}
                {(userData?.walletBalance || 0) < (selectedAstrologer.pricePerMin || 20) * 5 && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="shrink-0" />
                      <span>
                        Min {formatPrice((selectedAstrologer.pricePerMin || 20) * 5)} (5 mins)
                        required.
                      </span>
                    </div>
                    <Link
                      href={`/wallet?redirect=${encodeURIComponent('/talk-to-ai-astrologer')}`}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 transition-colors"
                    >
                      Recharge
                    </Link>
                  </div>
                )}

                {/* Birth Details Intake Form */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#C9952B]" /> Birth Details for Kundli
                    Analysis
                  </h4>

                  {/* Name & Gender */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={birthForm.name}
                        onChange={(e) => setBirthForm({ ...birthForm, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Gender</label>
                      <select
                        value={birthForm.gender}
                        onChange={(e) => setBirthForm({ ...birthForm, gender: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* DOB & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        required
                        value={birthForm.dob}
                        onChange={(e) => setBirthForm({ ...birthForm, dob: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Birth Time</label>
                      <input
                        type="time"
                        required
                        value={birthForm.time}
                        onChange={(e) => setBirthForm({ ...birthForm, time: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      />
                    </div>
                  </div>

                  {/* Birth Place */}
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Birth City / Place
                    </label>
                    <input
                      type="text"
                      required
                      value={birthForm.place}
                      onChange={(e) => setBirthForm({ ...birthForm, place: e.target.value })}
                      placeholder="e.g. New Delhi, India"
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                    />
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1 font-semibold text-[#292522] dark:text-[#E5B54F]">
                      Consultation Language · సంభాషణ భాష / மொழி
                    </label>
                    <select
                      value={callLanguage}
                      onChange={(e) => setCallLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-background border-2 border-[#C9952B] text-xs font-bold focus:border-[#C9952B] outline-none shadow-sm"
                    >
                      <option value="Telugu">✦ Telugu (తెలుగు) — శ్రీ వేద జ్యోతిషం</option>
                      <option value="Hindi">✦ Hindi (हिन्दी) — प्रामाणिक वैदिक ज्योतिष</option>
                      <option value="English">✦ English — Celestial Vedic Astrology</option>
                      <option value="Tamil">✦ Tamil (தமிழ்) — பாரம்பரிய வேத ஜோதிடம்</option>
                    </select>
                  </div>

                  {/* Primary Topic / Concern */}
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Primary Topic of Guidance
                    </label>
                    <select
                      value={birthForm.primaryConcern}
                      onChange={(e) =>
                        setBirthForm({ ...birthForm, primaryConcern: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                    >
                      <option value="Career Growth & Promotion">Career Growth & Promotion</option>
                      <option value="Love, Marriage & Kundli Milan">
                        Love, Marriage & Kundli Milan
                      </option>
                      <option value="Wealth, Finance & Investment">
                        Wealth, Finance & Investment
                      </option>
                      <option value="Health, Vitality & Protection">
                        Health, Vitality & Protection
                      </option>
                      <option value="Foreign Travel & Visa Settlement">
                        Foreign Travel & Visa Settlement
                      </option>
                      <option value="Vastu & Spatial Energies">Vastu & Spatial Energies</option>
                      <option value="Spiritual Awakening & Life Purpose">
                        Spiritual Awakening & Life Purpose
                      </option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-border">
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#713B32] text-white font-bold text-sm shadow-xl shadow-[#C9952B]/20 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Synthesizing Kundli & Connecting Call...
                      </>
                    ) : (
                      <>
                        <Phone size={16} className="fill-white" />
                        Start Live AI Voice Consultation
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground mt-2">
                    Billed per minute from prepaid wallet · Auto-disconnects when balance reaches ₹0
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
