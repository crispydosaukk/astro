'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Script from 'next/script';
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
  Check,
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
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const placeInputRef = useRef<HTMLInputElement | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'popularity' | 'experience' | 'price-low' | 'price-high'>(
    'rating'
  );

  // Modals & State
  const [selectedAstrologer, setSelectedAstrologer] = useState<AIAstrologer | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callLanguage, setCallLanguage] = useState<string>('Telugu');

  // Birth Details Intake Form
  const [birthForm, setBirthForm] = useState({
    name: '',
    gender: 'Male',
    dob: '1995-05-15',
    time: '14:30',
    place: 'New Delhi, India',
    primaryConcern: 'Career Growth & Promotion',
  });

  // Google Places Autocomplete for Birth City / Place
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
      setIsGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (showBookingModal && isGoogleLoaded && placeInputRef.current) {
      if (!(placeInputRef.current as any)._autocompleteAttached && (window as any).google?.maps?.places) {
        try {
          const autocomplete = new (window as any).google.maps.places.Autocomplete(
            placeInputRef.current,
            {
              types: ['(cities)'],
            }
          );
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place && place.formatted_address) {
              setBirthForm((prev) => ({ ...prev, place: place.formatted_address }));
            } else if (place && place.name) {
              setBirthForm((prev) => ({ ...prev, place: place.name }));
            }
          });
          (placeInputRef.current as any)._autocompleteAttached = true;
        } catch (e) {
          console.warn('Google Places autocomplete init warning:', e);
        }
      }
    }
  }, [showBookingModal, isGoogleLoaded]);

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

  // Availability Counts
  const counts = useMemo(() => {
    const activeOnes = astrologers.filter((a) => a.isActive !== false);
    return {
      total: activeOnes.length,
      online: activeOnes.filter((a) => (a.availability || 'online') === 'online').length,
      busy: activeOnes.filter((a) => a.availability === 'busy').length,
      offline: activeOnes.filter((a) => a.availability === 'offline').length,
    };
  }, [astrologers]);

  // Filtered Astrologers
  const filteredAstrologers = useMemo(() => {
    return astrologers
      .filter((a) => {
        if (!a.isActive) return false;
        
        // Search Filter
        const term = search.toLowerCase().trim();
        const matchSearch =
          !term ||
          a.name.toLowerCase().includes(term) ||
          a.tagline.toLowerCase().includes(term) ||
          a.bio.toLowerCase().includes(term) ||
          a.primaryDiscipline.toLowerCase().includes(term) ||
          a.specialities?.some((s) => s.toLowerCase().includes(term)) ||
          a.languages?.some((l) => l.toLowerCase().includes(term));

        // Discipline Filter
        const matchDisc =
          selectedDiscipline === 'all' ||
          a.primaryDiscipline.toLowerCase() === selectedDiscipline.toLowerCase() ||
          a.secondaryDisciplines?.some((d) => d.toLowerCase() === selectedDiscipline.toLowerCase());

        // Language Filter
        const matchLang =
          selectedLanguage === 'all' ||
          a.languages?.some((l) => l.toLowerCase() === selectedLanguage.toLowerCase());

        // Availability Filter
        const avail = a.availability || 'online';
        const matchAvail =
          selectedAvailability === 'all' || avail === selectedAvailability;

        return matchSearch && matchDisc && matchLang && matchAvail;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'popularity')
          return (b.totalConsultations || 0) - (a.totalConsultations || 0);
        if (sortBy === 'experience')
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        if (sortBy === 'price-low') return (a.pricePerMin || 0) - (b.pricePerMin || 0);
        if (sortBy === 'price-high') return (b.pricePerMin || 0) - (a.pricePerMin || 0);
        return 0;
      });
  }, [astrologers, search, selectedDiscipline, selectedLanguage, selectedAvailability, sortBy]);

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
      <section className="relative pt-28 pb-10 cosmic-bg overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#713B32]/25 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#C9952B]/20 blur-3xl" />
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/40 text-[#C9952B] mb-4 shadow-sm">
              <Sparkles size={13} className="text-[#C9952B]" /> 50 AI Astrologers · 24x7 Instant Voice Connect · Zero Queue
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 font-serif text-[#FFFDFC]">
              Talk to <span className="text-[#E5B54F]">AI Expert Astrologers</span>
            </h1>
            <p className="text-[#F3EBDD] max-w-2xl mx-auto text-xs sm:text-sm md:text-base mb-6 font-normal leading-relaxed">
              Instant, authentic voice consultations with 50 AI Astrologers across Vedic, KP, Nadi, Tarot, and Prashna systems.
            </p>

            {/* Switcher */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-[#221B14]/80 backdrop-blur-md border border-[#C9952B]/40 shadow-lg">
              <Link
                href="/talk-to-astrologer"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#D4C3A3] hover:text-[#FFFDFC] transition-all flex items-center gap-1.5"
              >
                <User size={15} /> Human Astrologers
              </Link>
              <div className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#C9952B] text-white shadow-md flex items-center gap-1.5">
                <Bot size={15} /> ✦ 50 AI Astrologers (Instant Call)
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Marketplace Section */}
      <section className="py-8 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
        
        {/* Disciplines Horizontal Carousel */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-[#C9952B]" /> 12 Astrology Disciplines
            </h3>
            <span className="text-xs text-muted-foreground">
              Showing <strong className="text-foreground">{filteredAstrologers.length}</strong> of {counts.total} Personas
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDiscipline('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                selectedDiscipline === 'all'
                  ? 'bg-[#C9952B] text-white border-[#C9952B] shadow-sm'
                  : 'bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-[#C9952B]/40'
              }`}
            >
              ✦ All Disciplines ({astrologers.filter((a) => a.isActive !== false).length})
            </button>
            {disciplines.map((d) => {
              const IconComponent = disciplineIconMap[d.iconName] || Sparkles;
              const isSelected = selectedDiscipline.toLowerCase() === d.name.toLowerCase();
              const discCount = astrologers.filter(
                (a) => a.isActive !== false && a.primaryDiscipline.toLowerCase() === d.name.toLowerCase()
              ).length;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDiscipline(isSelected ? 'all' : d.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-[#C9952B] text-white border-[#C9952B] shadow-sm font-bold'
                      : 'bg-card border-border/80 text-muted-foreground hover:text-foreground hover:border-[#C9952B]/40'
                  }`}
                >
                  <IconComponent
                    size={13}
                    className={isSelected ? 'text-white' : 'text-[#C9952B]'}
                  />
                  <span>{d.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {discCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-card/70 border border-border/70 p-3.5 rounded-2xl backdrop-blur-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={15}
              />
              <input
                type="text"
                placeholder="Search 50 AI Astrologers by name, speciality, topic, or language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Globe
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={14}
                />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] text-xs text-foreground outline-none cursor-pointer appearance-none"
                >
                  <option value="all">Language: All Languages</option>
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
            <div className="lg:col-span-4">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-[#C9952B] text-xs text-foreground outline-none cursor-pointer"
              >
                <option value="rating">Sort: Highest Rated (⭐ 4.9+)</option>
                <option value="popularity">Sort: Most Consultations (Calls)</option>
                <option value="experience">Sort: Experience (Years)</option>
                <option value="price-low">Sort: Price (Low to High)</option>
                <option value="price-high">Sort: Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Quick Availability Switcher Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/50 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground text-[11px] font-semibold mr-1">Availability:</span>
              <button
                onClick={() => setSelectedAvailability('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  selectedAvailability === 'all'
                    ? 'bg-[#C9952B] text-white border-[#C9952B]'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({counts.total})
              </button>
              <button
                onClick={() => setSelectedAvailability('online')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                  selectedAvailability === 'online'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-background border-border text-emerald-600 dark:text-emerald-400 hover:border-emerald-500'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online Now ({counts.online})
              </button>
              <button
                onClick={() => setSelectedAvailability('busy')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                  selectedAvailability === 'busy'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-background border-border text-amber-600 dark:text-amber-400 hover:border-amber-500'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Busy ({counts.busy})
              </button>
            </div>

            {(search || selectedDiscipline !== 'all' || selectedLanguage !== 'all' || selectedAvailability !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedDiscipline('all');
                  setSelectedLanguage('all');
                  setSelectedAvailability('all');
                }}
                className="text-[#C9952B] hover:underline text-[11px] font-bold"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* AI Astrologers Compact & Clean 4-Column Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#C9952B] mb-3" size={36} />
            <p className="text-muted-foreground text-xs">Loading 50 authentic AI Astrologers...</p>
          </div>
        ) : filteredAstrologers.length === 0 ? (
          <div className="py-16 text-center glass-card border border-border rounded-2xl p-6 max-w-md mx-auto">
            <Bot size={40} className="text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-foreground mb-1">No Astrologers Match Your Search</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Try adjusting your search criteria, language selection, or discipline filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedDiscipline('all');
                setSelectedLanguage('all');
                setSelectedAvailability('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#C9952B] text-white text-xs font-semibold hover:bg-[#b08022] transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAstrologers.map((astro) => {
              const currentAvail = astro.availability || 'online';
              return (
                <motion.div
                  key={astro.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group relative bg-card border border-border/80 hover:border-[#C9952B]/70 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar & Header */}
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="relative shrink-0">
                        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-[#C9952B]/40 relative bg-muted group-hover:border-[#C9952B] transition-colors">
                          <AppImage
                            src={astro.avatar}
                            alt={astro.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {/* Live Availability Status Dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                          {currentAvail === 'online' ? (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span
                                className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background"
                                title="Online & Ready for Instant Call"
                              ></span>
                            </>
                          ) : currentAvail === 'busy' ? (
                            <span
                              className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-background"
                              title="Currently Busy on Consultation"
                            ></span>
                          ) : (
                            <span
                              className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-400 border-2 border-background"
                              title="Offline"
                            ></span>
                          )}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#C9952B]/15 text-[#C9952B] uppercase truncate max-w-[120px]">
                            {astro.primaryDiscipline}
                          </span>
                          {astro.isFeatured && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-[#C9952B]/20 text-[#C9952B] flex items-center gap-0.5 shrink-0">
                              <Sparkles size={9} /> FEATURED
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-foreground truncate group-hover:text-[#C9952B] transition-colors">
                          {astro.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {astro.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Key Stats Bar */}
                    <div className="flex items-center justify-between text-[11px] py-1 px-2.5 bg-muted/40 rounded-lg border border-border/40 mb-2.5 text-muted-foreground">
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <Star size={11} className="fill-amber-500" /> {astro.rating}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({(astro.totalConsultations / 1000).toFixed(1)}k)
                        </span>
                      </span>
                      <span>🎓 {astro.experienceYears} Yrs</span>
                      <span className="truncate max-w-[85px]" title={astro.languages?.join(', ')}>
                        🌐 {astro.languages?.slice(0, 2).join(', ')}
                      </span>
                    </div>

                    {/* Top Specialities Chips */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {astro.specialities?.slice(0, 2).map((spec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-background border border-border/80 text-foreground/80 truncate max-w-[130px]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Clean Bottom Rate & Action Bar */}
                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] text-muted-foreground block leading-none">Rate</span>
                      <div className="text-sm font-bold text-[#C9952B]">
                        {formatPrice(astro.pricePerMin)}
                        <span className="text-[10px] font-normal text-muted-foreground">/min</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedAstrologer(astro);
                          setShowProfileModal(true);
                        }}
                        className="p-2 rounded-xl border border-border hover:border-[#C9952B] text-muted-foreground hover:text-foreground transition-all"
                        title="View Profile Details"
                      >
                        <User size={13} />
                      </button>
                      <button
                        onClick={() => handleInitiateConsultation(astro)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#713B32] text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-95 active:scale-95 transition-all"
                      >
                        <Phone size={12} className="fill-white" />
                        <span>Instant Call</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/15 text-[#E5D5BA] hover:text-[#FFFDFC] transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-[#C9952B] relative shrink-0">
                    <AppImage
                      src={selectedAstrologer.avatar}
                      alt={selectedAstrologer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C9952B]/30 text-[#FFFDFC]">
                        {selectedAstrologer.primaryDiscipline}
                      </span>
                      {selectedAstrologer.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-200">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-[#FFFDFC]">{selectedAstrologer.name}</h3>
                    <p className="text-xs text-[#E5D5BA]">{selectedAstrologer.tagline}</p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] text-xs">
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-muted/40 rounded-2xl border border-border text-center">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Rating</span>
                    <span className="font-bold text-amber-500 text-sm flex items-center justify-center gap-1">
                      <Star size={13} className="fill-amber-500" /> {selectedAstrologer.rating}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Consultations</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedAstrologer.totalConsultations.toLocaleString()}+
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Experience</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedAstrologer.experienceYears} Years
                    </span>
                  </div>
                </div>

                {/* Bio Description */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    About Astrologer
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedAstrologer.bio}
                  </p>
                </div>

                {/* Specialities */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    Core Specialities & Guidance
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAstrologer.specialities?.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs bg-muted border border-border text-foreground font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    Languages Spoken
                  </h4>
                  <p className="text-foreground font-semibold">
                    {selectedAstrologer.languages?.join(', ')}
                  </p>
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Consultation Rate
                  </span>
                  <div className="text-base font-bold text-[#C9952B]">
                    {formatPrice(selectedAstrologer.pricePerMin)}/min
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleInitiateConsultation(selectedAstrologer);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#713B32] text-white font-bold text-xs shadow-lg shadow-[#C9952B]/20 flex items-center gap-2"
                >
                  <Phone size={14} className="fill-white" />
                  ✦ Start Voice Consultation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Consultation Intake & Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedAstrologer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-5 cosmic-bg border-b border-[#C9952B]/40 text-[#FFFDFC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#C9952B] relative shrink-0">
                    <AppImage
                      src={selectedAstrologer.avatar}
                      alt={selectedAstrologer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#FFFDFC]">
                      Voice Consultation with {selectedAstrologer.name}
                    </h3>
                    <p className="text-xs text-[#E5D5BA] font-medium">
                      Rate: <span className="text-[#E5B54F] font-bold">{formatPrice(selectedAstrologer.pricePerMin)}/min</span> · 24x7 Instant Voice Call
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
                className="p-5 space-y-3.5 overflow-y-auto max-h-[75vh] text-xs"
              >
                {/* Wallet Balance Summary Card */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#C9952B]/15 text-[#C9952B]">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Wallet Balance
                      </span>
                      <div className="text-sm font-bold text-foreground">
                        {formatPrice(userData?.walletBalance || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
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
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0" />
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
                <div className="space-y-2.5 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#C9952B]" /> Birth Details for Kundli Analysis
                  </h4>

                  {/* Name & Gender */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-muted-foreground block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={birthForm.name}
                        onChange={(e) => setBirthForm({ ...birthForm, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground block mb-1">Gender</label>
                      <select
                        value={birthForm.gender}
                        onChange={(e) => setBirthForm({ ...birthForm, gender: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* DOB & Time */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-muted-foreground block mb-1">Date of Birth</label>
                      <input
                        type="date"
                        required
                        value={birthForm.dob}
                        onChange={(e) => setBirthForm({ ...birthForm, dob: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground block mb-1">Birth Time</label>
                      <input
                        type="time"
                        required
                        value={birthForm.time}
                        onChange={(e) => setBirthForm({ ...birthForm, time: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      />
                    </div>
                  </div>

                  {/* Birth Place */}
                  <div>
                    <label className="text-muted-foreground block mb-1">Birth City / Place</label>
                    <div className="relative">
                      <input
                        ref={placeInputRef}
                        type="text"
                        required
                        value={birthForm.place}
                        onChange={(e) => setBirthForm({ ...birthForm, place: e.target.value })}
                        placeholder="Type city or location (e.g. Chennai, India)"
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                      />
                      <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#C9952B] pointer-events-none" />
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="text-muted-foreground block mb-1 font-semibold text-[#292522] dark:text-[#E5B54F]">
                      Consultation Language · సంభాషణ భాష / மொழி
                    </label>
                    <select
                      value={callLanguage}
                      onChange={(e) => setCallLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-background border-2 border-[#C9952B] text-xs font-bold focus:border-[#C9952B] outline-none shadow-sm"
                    >
                      <option value="Telugu">✦ Telugu (తెలుగు) — శ్రీ వేద జ్యోతిషం</option>
                      <option value="Hindi">✦ Hindi (हिन्दी) — प्रामाणिक वैदिक ज्योतिष</option>
                      <option value="English">✦ English — Celestial Vedic Astrology</option>
                      <option value="Tamil">✦ Tamil (தமிழ்) — பாரம்பரிய வேத ஜோதிடம்</option>
                    </select>
                  </div>

                  {/* Primary Topic / Concern */}
                  <div>
                    <label className="text-muted-foreground block mb-1">Primary Topic of Guidance</label>
                    <select
                      value={birthForm.primaryConcern}
                      onChange={(e) =>
                        setBirthForm({ ...birthForm, primaryConcern: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs focus:border-[#C9952B] outline-none"
                    >
                      <option value="Career Growth & Promotion">Career Growth & Promotion</option>
                      <option value="Love, Marriage & Kundli Milan">Love, Marriage & Kundli Milan</option>
                      <option value="Wealth, Finance & Investment">Wealth, Finance & Investment</option>
                      <option value="Health, Vitality & Protection">Health, Vitality & Protection</option>
                      <option value="Foreign Travel & Visa Settlement">Foreign Travel & Visa Settlement</option>
                      <option value="Vastu & Spatial Energies">Vastu & Spatial Energies</option>
                      <option value="Spiritual Awakening & Life Purpose">Spiritual Awakening & Life Purpose</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-border">
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C9952B] to-[#713B32] text-white font-bold text-xs shadow-lg shadow-[#C9952B]/20 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="animate-spin text-white" size={16} />
                        <span>Initializing Voice Channel...</span>
                      </>
                    ) : (
                      <>
                        <Phone size={14} className="fill-white" />
                        <span>Connect Instant Voice Call Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA-CXsyKpvFtpidpOkhOiIQGfXFO3O5lKA&libraries=places"
        strategy="lazyOnload"
        onReady={() => setIsGoogleLoaded(true)}
      />

      <style jsx global>{`
        .pac-container {
          z-index: 999999 !important;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          border: 1px solid #C9952B;
          font-family: inherit;
          margin-top: 4px;
          background-color: #FFFDFC;
        }
        .pac-item {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
        }
        .pac-item:hover {
          background-color: #EDE4D5;
        }
        .pac-item-query {
          font-size: 13px;
          color: #713B32;
        }
      `}</style>
    </div>
  );
}
