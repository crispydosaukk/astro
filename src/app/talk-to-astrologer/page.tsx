'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Star,
  Video,
  Phone,
  X,
  ChevronRight,
  Check,
  CreditCard,
  Globe,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Award,
  Users,
} from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import AstrologerFilterModal, {
  AstrologerFilterState,
  defaultFilterState,
} from '@/components/AstrologerFilterModal';
import { db } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';

const timeSlots = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
];
const bookedSlots = ['10:00 AM', '11:30 AM', '3:00 PM', '6:00 PM'];

export default function TalkToAstrologerPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { user, userData } = useUserData();
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [filterModalState, setFilterModalState] =
    useState<AstrologerFilterState>(defaultFilterState);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [selectedAstrologer, setSelectedAstrologer] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [consultationType, setConsultationType] = useState<'video' | 'call'>('video');
  const [isBooking, setIsBooking] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const { currencyCode, currencySymbol, formatPrice, convertPrice } = useCurrency();

  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const q = query(collection(db, 'astrologers'), where('status', '==', 'approved'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const fetchedData = querySnapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Astrologer',
              specialty: data.skills
                ? data.skills.split(',').map((s: string) => s.trim())
                : ['Vedic Astrology'],
              experience: Number(data.experienceYears || data.experience) || 10,
              rating: Number(data.rating) || 4.9,
              reviews: Number(data.reviewsCount || data.reviews) || 2847,
              pricePerMin: Number(data.amount) || 20,
              languages: data.languages
                ? data.languages.split(',').map((l: string) => l.trim())
                : ['English', 'Hindi'],
              gender:
                data.gender ||
                (data.name?.toLowerCase().includes('dr. kavya') ||
                data.name?.toLowerCase().includes('meera') ||
                data.name?.toLowerCase().includes('priya') ||
                data.name?.toLowerCase().includes('ananya')
                  ? 'Female'
                  : 'Male'),
              country: data.country || 'India',
              status:
                data.isOnline !== undefined ? (data.isOnline ? 'online' : 'offline') : 'online',
              image:
                data.profileImageUrl ||
                data.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'A')}&background=random`,
              consultations: Number(data.consultations || data.orders) || 12480,
              badge: data.badge !== undefined ? data.badge : 'VERIFIED',
              about:
                data.bio || data.about || 'Experienced astrologer offering insightful guidance.',
            };
          });
          setAstrologers(fetchedData);
        } else {
          setAstrologers([
            {
              id: 'dr-anil-sharma',
              name: 'Dr. Anil Sharma',
              specialty: ['Vedic Astrology', 'Love & Relationship', 'Career & Business'],
              experience: 25,
              rating: 4.9,
              reviews: 1287,
              pricePerMin: 25,
              languages: ['Hindi', 'English', 'Sanskrit'],
              gender: 'Male',
              country: 'India',
              status: 'online',
              image:
                'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600&h=600&fit=crop&crop=face',
              consultations: 15400,
              badge: 'Celebrity Astrologer',
              about:
                'Specialist in Vedic Kundli, career breakthroughs, and love marriage compatibility.',
            },
            {
              id: 'prof-meera-iyer',
              name: 'Prof. Meera Iyer',
              specialty: ['KP Astrology', 'Marriage & Gun Milan', 'Education & Study'],
              experience: 18,
              rating: 4.9,
              reviews: 956,
              pricePerMin: 20,
              languages: ['English', 'Tamil', 'Hindi'],
              gender: 'Female',
              country: 'India',
              status: 'online',
              image:
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&crop=face',
              consultations: 14120,
              badge: 'VERIFIED',
              about: 'Master of KP astrology, timing of events, Prashna, and academic prosperity.',
            },
            {
              id: 'acharya-r-vedant',
              name: 'Acharya R. Vedant',
              specialty: ['Vastu Shastra', 'Wealth & Finance', 'Vedic Astrology'],
              experience: 20,
              rating: 4.9,
              reviews: 1103,
              pricePerMin: 30,
              languages: ['Hindi', 'Sanskrit', 'English', 'Gujarati'],
              gender: 'Male',
              country: 'India',
              status: 'online',
              image:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face',
              consultations: 16300,
              badge: 'Senior Master',
              about:
                'Expert in Vastu Shastra remedies, corporate wealth alignment, and planetary balancing.',
            },
            {
              id: 'dr-kavya-nair',
              name: 'Dr. Kavya Nair',
              specialty: ['Health & Medical Astrology', 'Vedic Astrology', 'Gemstone Therapy'],
              experience: 15,
              rating: 4.8,
              reviews: 789,
              pricePerMin: 22,
              languages: ['Malayalam', 'English', 'Hindi'],
              gender: 'Female',
              country: 'India',
              status: 'online',
              image:
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=face',
              consultations: 13890,
              badge: 'VERIFIED',
              about:
                'Vedic health chart diagnosis, Tridosha balance, and Ayurvedic mantra prescription.',
            },
            {
              id: 'astro-rohit-verma',
              name: 'Astro Rohit Verma',
              specialty: [
                'Tarot Reading',
                'Numerology',
                'Career & Business',
                'Love & Relationship',
              ],
              experience: 12,
              rating: 4.7,
              reviews: 654,
              pricePerMin: 18,
              languages: ['Hindi', 'English', 'Punjabi'],
              gender: 'Male',
              country: 'India',
              status: 'online',
              image:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&crop=face',
              consultations: 9980,
              badge: 'Rising Star',
              about:
                'Modern Vedic & Tarot consultations for youth career, startups, and relationship clarity.',
            },
            {
              id: 'ananya-mukherjee',
              name: 'Ananya Mukherjee',
              specialty: ['Tarot Reading', 'Psychic Reading', 'Love & Relationship'],
              experience: 14,
              rating: 4.9,
              reviews: 840,
              pricePerMin: 24,
              languages: ['Bengali', 'English', 'Hindi'],
              gender: 'Female',
              country: 'India',
              status: 'online',
              image:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&crop=face',
              consultations: 11200,
              badge: 'VERIFIED',
              about:
                'Intuitive Tarot reader, psychic aura counseling, and soulmate connection guidance.',
            },
            {
              id: 'vashikant-shastri',
              name: 'Vashikant Shastri',
              specialty: ['Vedic Astrology', 'Lal Kitab', 'Marriage & Gun Milan'],
              experience: 16,
              rating: 5.0,
              reviews: 2150,
              pricePerMin: 18,
              languages: ['English', 'Hindi', 'Marathi'],
              gender: 'Male',
              country: 'India',
              status: 'online',
              image:
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&crop=face',
              consultations: 18500,
              badge: 'Top Rated',
              about: 'Specialist in Lal Kitab remedies, Manglik Dosha parihar, and marital peace.',
            },
            {
              id: 'siddharth-deshmukh',
              name: 'Pt. Siddharth Deshmukh',
              specialty: ['Numerology', 'Nadi Astrology', 'Wealth & Finance'],
              experience: 22,
              rating: 4.8,
              reviews: 1430,
              pricePerMin: 28,
              languages: ['Marathi', 'Hindi', 'English'],
              gender: 'Male',
              country: 'India',
              status: 'offline',
              image:
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop&crop=face',
              consultations: 14750,
              badge: 'Senior Master',
              about:
                'Nadi palm-leaf astrology, business name numerology, and financial wealth attraction.',
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch astrologers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAstrologers();
  }, []);

  // Dynamically extract all unique skills/talents from registered astrologers with count
  const dynamicSkills = useMemo(() => {
    const map = new Map<string, number>();
    astrologers.forEach((ast) => {
      const list = Array.isArray(ast.specialty)
        ? ast.specialty
        : typeof ast.specialty === 'string'
          ? ast.specialty.split(',')
          : [];
      list.forEach((s: string) => {
        const cleaned = s.trim();
        if (cleaned) {
          map.set(cleaned, (map.get(cleaned) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [astrologers]);

  // Dynamically extract all spoken languages from registered astrologers with count
  const dynamicLanguages = useMemo(() => {
    const map = new Map<string, number>();
    astrologers.forEach((ast) => {
      const list = Array.isArray(ast.languages)
        ? ast.languages
        : typeof ast.languages === 'string'
          ? ast.languages.split(',')
          : [];
      list.forEach((l: string) => {
        const cleaned = l.trim();
        if (cleaned) {
          map.set(cleaned, (map.get(cleaned) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [astrologers]);

  // Dynamically extract all registered countries & cities with count
  const dynamicCountries = useMemo(() => {
    const map = new Map<string, number>();
    astrologers.forEach((ast) => {
      if (ast.country && typeof ast.country === 'string') {
        const c = ast.country.trim();
        if (c) map.set(c, (map.get(c) || 0) + 1);
      }
      if (ast.city && typeof ast.city === 'string' && ast.city.trim() !== ast.country) {
        const city = ast.city.trim();
        if (city) map.set(city, (map.get(city) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [astrologers]);

  // Dynamically compute gender counts
  const dynamicGenders = useMemo(() => {
    const maleCount = astrologers.filter((a) => a.gender?.toLowerCase() === 'male').length;
    const femaleCount = astrologers.filter((a) => a.gender?.toLowerCase() === 'female').length;
    return [
      { id: 'male', label: 'Male', count: maleCount },
      { id: 'female', label: 'Female', count: femaleCount },
    ];
  }, [astrologers]);

  // Dynamically generate top horizontal category pills from registered skills/talents
  const quickTopics = useMemo(() => {
    const topics = ['All'];
    dynamicSkills.forEach((s) => {
      if (!topics.includes(s.name) && topics.length < 20) {
        topics.push(s.name);
      }
    });
    return topics;
  }, [dynamicSkills]);

  // Active filters count calculation
  const activeFiltersCount =
    (filterModalState.sortBy !== 'popularity' ? 1 : 0) +
    filterModalState.skills.length +
    filterModalState.languages.length +
    (filterModalState.gender !== 'all' ? 1 : 0) +
    filterModalState.countries.length +
    (filterModalState.topAstrologer !== 'all' ? 1 : 0) +
    (activeCategory !== 'All' ? 1 : 0);

  // Filtering Engine
  const filtered = astrologers
    .filter((a: any) => {
      // 1. Search filter
      const term = search.toLowerCase();
      const matchSearch =
        !term ||
        a.name.toLowerCase().includes(term) ||
        a.about?.toLowerCase().includes(term) ||
        a.specialty.some((s: string) => s.toLowerCase().includes(term)) ||
        a.languages.some((l: string) => l.toLowerCase().includes(term));

      // 2. Quick Category Topic Pill
      let matchCategory = true;
      if (activeCategory !== 'All') {
        const cat = activeCategory.toLowerCase();
        matchCategory =
          a.specialty.some((s: string) => s.toLowerCase().includes(cat)) ||
          a.about?.toLowerCase().includes(cat);
      }

      // 3. Skills Filter from Modal
      let matchSkills = true;
      if (filterModalState.skills.length > 0) {
        matchSkills = filterModalState.skills.some(
          (sk) =>
            a.specialty.some((s: string) => s.toLowerCase().includes(sk.toLowerCase())) ||
            a.about?.toLowerCase().includes(sk.toLowerCase())
        );
      }

      // 4. Languages Filter from Modal
      let matchLanguages = true;
      if (filterModalState.languages.length > 0) {
        matchLanguages = filterModalState.languages.some((lang) =>
          a.languages.some((l: string) => l.toLowerCase().includes(lang.toLowerCase()))
        );
      }

      // 5. Gender Filter
      let matchGender = true;
      if (filterModalState.gender !== 'all') {
        matchGender = a.gender?.toLowerCase() === filterModalState.gender.toLowerCase();
      }

      // 6. Country Filter
      let matchCountry = true;
      if (filterModalState.countries.length > 0) {
        matchCountry = filterModalState.countries.some((c) =>
          a.country?.toLowerCase().includes(c.toLowerCase())
        );
      }

      // 7. Top Astrologer Filter
      let matchTop = true;
      if (filterModalState.topAstrologer === 'celebrity') {
        matchTop =
          a.badge?.toLowerCase().includes('celebrity') ||
          a.badge?.toLowerCase().includes('master') ||
          a.rating >= 4.9;
      } else if (filterModalState.topAstrologer === 'rising-star') {
        matchTop = a.rating >= 4.8;
      } else if (filterModalState.topAstrologer === 'master') {
        matchTop = a.experience >= 15;
      } else if (filterModalState.topAstrologer === 'online-now') {
        matchTop = a.status === 'online';
      }

      return (
        matchSearch &&
        matchCategory &&
        matchSkills &&
        matchLanguages &&
        matchGender &&
        matchCountry &&
        matchTop
      );
    })
    .sort((a: any, b: any) => {
      const mode = filterModalState.sortBy;
      if (mode === 'popularity' || mode === 'orders-high') {
        return (b.consultations || b.reviews || 0) - (a.consultations || a.reviews || 0);
      }
      if (mode === 'orders-low') {
        return (a.consultations || a.reviews || 0) - (b.consultations || b.reviews || 0);
      }
      if (mode === 'exp-high') return (b.experience || 0) - (a.experience || 0);
      if (mode === 'exp-low') return (a.experience || 0) - (b.experience || 0);
      if (mode === 'price-high') return (b.pricePerMin || 0) - (a.pricePerMin || 0);
      if (mode === 'price-low') return (a.pricePerMin || 0) - (b.pricePerMin || 0);
      if (mode === 'rating-high') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const handleBook = async () => {
    if (!user || !userData) {
      toast.error('Please log in to book a consultation');
      return;
    }

    const pricePerMin = selectedAstrologer?.pricePerMin || 1;
    const currentBalance = userData.walletBalance || 0;
    const minRequired = pricePerMin * 5;

    if (currentBalance < minRequired) {
      toast.error(`Minimum wallet balance of ${formatPrice(minRequired)} (5 mins) required.`);
      router.push(`/wallet?redirect=${encodeURIComponent('/talk-to-astrologer')}`);
      return;
    }

    const maxDuration = Math.floor(currentBalance / pricePerMin);

    setIsBooking(true);

    try {
      const roomID = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Create a consultation record in Firestore with pending status
      const docRef = await addDoc(collection(db, 'consultations'), {
        astrologerId: selectedAstrologer?.id,
        astrologerName: selectedAstrologer?.name,
        customerId: user.uid,
        customerName: user.displayName || user.email,
        roomID,
        type: consultationType,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5), // HH:MM
        duration: maxDuration,
        price: pricePerMin, // Saving the per-minute price for dynamic billing
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setIsWaiting(true);
      toast.success('Request sent! Waiting for astrologer to accept...');

      // Setup timeout to cancel if not accepted in 60 seconds
      const timeoutId = setTimeout(async () => {
        setIsWaiting(false);
        setIsBooking(false);
        toast.error('Astrologer did not respond in time. Please try another astrologer.');
        try {
          await updateDoc(doc(db, 'consultations', docRef.id), { status: 'cancelled' });
        } catch (e) {
          console.error(e);
        }
      }, 60000);

      // Listen for astrologer acceptance
      const unsubscribe = onSnapshot(doc(db, 'consultations', docRef.id), (snapshot) => {
        const data = snapshot.data();
        if (data && data.status === 'active') {
          clearTimeout(timeoutId);
          unsubscribe();
          setIsWaiting(false);
          router.push(`/call/${roomID}`);
        } else if (data && data.status === 'cancelled' && isWaiting) {
          clearTimeout(timeoutId);
          unsubscribe();
          setIsWaiting(false);
          setIsBooking(false);
          toast.error('Astrologer is currently unavailable.');
        }
      });
    } catch (error) {
      console.error('Error booking consultation:', error);
      toast.error('Failed to book consultation. Please try again.');
      setIsBooking(false);
      setIsWaiting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Banner */}
      <section className="relative pt-32 py-16 cosmic-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#713B32]/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#C9952B]/15 blur-3xl" />
        </div>
        <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
              ✦ 500+ Verified Astrologers
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Talk to an <span className="text-gradient-gold">Expert Astrologer</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-6">
              Connect instantly with India&apos;s most trusted Vedic astrologers. Get personalized
              guidance on career, marriage, health, and life&apos;s important decisions.
            </p>

            {/* Quick Switcher: Human vs AI */}
            <div className="inline-flex items-center p-1.5 rounded-2xl glass-card border border-white/20 shadow-2xl mb-6">
              <div className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C9952B] text-white shadow-md flex items-center gap-1.5">
                <Users size={14} /> Human Astrologers
              </div>
              <Link
                href="/talk-to-ai-astrologer"
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
              >
                <Sparkles size={14} className="text-[#C9952B]" /> ✦ AI Expert Astrologers (Instant Voice)
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {astrologers.filter((a) => a.status === 'online').length} Online Now
              </div>
              <div className="flex items-center gap-2">⭐ 4.8 Average Rating</div>
              <div className="flex items-center gap-2">🌍 42+ Countries Served</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Filters & Topic Pills Bar */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border px-6 lg:px-8 py-3.5 space-y-3 shadow-md">
        <div className="max-w-screen-2xl mx-auto flex flex-col gap-3">
          {/* Row 1: Filter Trigger Button, Search, Currency & Counter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Main Filters Modal Trigger (Yellow pill like screenshot) */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all shadow-sm shrink-0 ${
                activeFiltersCount > 0
                  ? 'bg-[#FACC15] hover:bg-[#EAB308] text-black border-yellow-400 font-extrabold shadow-yellow-500/20'
                  : 'bg-muted/90 hover:bg-muted text-foreground border-border'
              }`}
            >
              <SlidersHorizontal
                size={14}
                className={activeFiltersCount > 0 ? 'text-black' : 'text-[#C9952B]'}
              />
              <span>Filters {activeFiltersCount > 0 ? `· ${activeFiltersCount}` : ''}</span>
              <ChevronDown size={14} className="ml-0.5" />
            </button>

            {/* Quick Horizontal Topic Pills Bar (Scrollable) */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
              {quickTopics.map((topic) => {
                const isActive = activeCategory === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setActiveCategory(topic)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all ${
                      isActive
                        ? 'bg-[#FACC15] text-black shadow-sm'
                        : 'bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/50'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-48 sm:min-w-64">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search astrologer, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-full bg-muted border border-border focus:border-[#C9952B] outline-none text-xs sm:text-sm transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Currency Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#C9952B]/10 border border-[#C9952B]/30 shrink-0">
              <Globe size={13} className="text-[#C9952B]" />
              <span className="text-xs font-bold text-[#C9952B]">
                {currencyCode} ({currencySymbol})
              </span>
            </div>

            {/* Count */}
            <div className="text-xs text-muted-foreground font-medium shrink-0">
              <span className="text-foreground font-bold">{filtered.length}</span> Astrologers
            </div>
          </div>

          {/* Row 2: Active Applied Filter Tags Strip (Shown when any filters are active) */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs border-t border-border/40">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles size={12} className="text-[#C9952B]" /> Active Filters:
              </span>

              {activeCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-500 border border-yellow-400/30 font-semibold">
                  Category: {activeCategory}
                  <button
                    type="button"
                    onClick={() => setActiveCategory('All')}
                    className="hover:text-foreground"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {filterModalState.sortBy !== 'popularity' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/30 font-semibold">
                  Sort: {filterModalState.sortBy}
                  <button
                    type="button"
                    onClick={() =>
                      setFilterModalState({ ...filterModalState, sortBy: 'popularity' })
                    }
                    className="hover:text-foreground"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {filterModalState.skills.map((sk) => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-foreground border border-border font-medium"
                >
                  {sk}
                  <button
                    type="button"
                    onClick={() =>
                      setFilterModalState({
                        ...filterModalState,
                        skills: filterModalState.skills.filter((s) => s !== sk),
                      })
                    }
                    className="hover:text-rose-400"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {filterModalState.languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-foreground border border-border font-medium"
                >
                  🗣️ {lang}
                  <button
                    type="button"
                    onClick={() =>
                      setFilterModalState({
                        ...filterModalState,
                        languages: filterModalState.languages.filter((l) => l !== lang),
                      })
                    }
                    className="hover:text-rose-400"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {filterModalState.gender !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-foreground border border-border font-medium capitalize">
                  Gender: {filterModalState.gender}
                  <button
                    type="button"
                    onClick={() => setFilterModalState({ ...filterModalState, gender: 'all' })}
                    className="hover:text-rose-400"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {filterModalState.countries.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-foreground border border-border font-medium"
                >
                  📍 {c}
                  <button
                    type="button"
                    onClick={() =>
                      setFilterModalState({
                        ...filterModalState,
                        countries: filterModalState.countries.filter((x) => x !== c),
                      })
                    }
                    className="hover:text-rose-400"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {filterModalState.topAstrologer !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-[#C9952B] border border-border font-medium capitalize">
                  ⭐ {filterModalState.topAstrologer}
                  <button
                    type="button"
                    onClick={() =>
                      setFilterModalState({ ...filterModalState, topAstrologer: 'all' })
                    }
                    className="hover:text-rose-400"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setFilterModalState(defaultFilterState);
                  setActiveCategory('All');
                  setSearch('');
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors ml-auto"
              >
                <RotateCcw size={11} /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Astrologer Grid */}
      <div className="px-6 lg:px-8 py-8 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
          {filtered.map((ast, i) => (
            <motion.div
              key={ast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#FFFDFC] rounded-2xl border border-[#E5D9C8] hover:border-[#B88A44] transition-all duration-300 shadow-sm hover:shadow-xl card-hover flex flex-col overflow-hidden group w-full"
            >
              {/* Profile Image (Complete Image Visible) */}
              <div className="relative w-full aspect-[4/3] bg-[#F8F3EA] p-2 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    ast.image && typeof ast.image === 'string' && ast.image.trim() !== ''
                      ? ast.image
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(ast.name || 'Astrologer')}&background=713B32&color=fff&size=512`
                  }
                  alt={`${ast.name} - verified astrologer`}
                  className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(ast.name || 'Astrologer')}&background=713B32&color=fff&size=512`;
                  }}
                />
                {/* Verified Badge */}
                <div className="absolute top-3 left-3 z-10 bg-[#15803d] text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow-md flex items-center gap-1">
                  VERIFIED
                </div>

                {/* Online Status Pill */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold backdrop-blur-md ${
                      ast.status === 'online'
                        ? 'bg-black/60 text-green-400 border border-green-500/30'
                        : 'bg-black/60 text-gray-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1 ${
                        ast.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                      }`}
                    />
                    {ast.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Content Section (Centered, Clean & Balanced) */}
              <div className="p-3.5 text-center flex-1 flex flex-col justify-between space-y-1.5 bg-[#FFFDFC]">
                <div className="space-y-1">
                  {/* Name */}
                  <h3 className="font-bold text-[#292522] text-sm sm:text-base leading-tight truncate capitalize">
                    {ast.name}
                  </h3>

                  {/* Specialty */}
                  <p className="text-xs text-[#6B5E55] font-medium truncate capitalize">
                    {Array.isArray(ast.specialty) ? ast.specialty.join(', ') : ast.specialty}
                  </p>

                  {/* Experience */}
                  <p className="text-[11px] text-[#6B5E55]/90 font-medium">
                    {ast.experience}+ Years Exp.
                  </p>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#292522] pt-0.5">
                    <Star size={13} fill="#D8B66A" className="text-[#B88A44] flex-shrink-0" />
                    <span className="font-bold text-[#292522]">{ast.rating}</span>
                    <span className="text-[#6B5E55] font-normal text-[11px]">
                      ({ast.reviews.toLocaleString()})
                    </span>
                  </div>

                  {/* Price & Languages */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#6B5E55] pt-1.5 border-t border-[#E5D9C8] mt-1">
                    <span className="font-extrabold text-[#713B32] text-sm tabular-nums">
                      {formatPrice(ast.pricePerMin)}/min
                    </span>
                    {ast.languages && ast.languages.length > 0 && (
                      <>
                        <span className="text-[#E5D9C8]">•</span>
                        <span className="truncate max-w-[100px] text-[#6B5E55] font-medium">
                          {ast.languages.slice(0, 2).join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Consult Now Button & Profile Link */}
                <div className="pt-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedAstrologer(ast);
                      setConsultationType('call');
                      setBookingStep(1);
                    }}
                    disabled={ast.status === 'offline'}
                    className="w-full inline-flex items-center justify-center py-2 px-3 rounded-full font-bold text-xs text-white uppercase tracking-wider bg-[#713B32] hover:bg-[#552B24] shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    CONSULT NOW
                  </button>
                  <Link
                    href={`/astrologer/${ast.id}`}
                    className="block text-center text-[11px] font-semibold text-[#713B32] hover:text-[#B88A44] transition-colors pt-0.5"
                  >
                    View Full Profile →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search size={40} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No astrologers found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {selectedAstrologer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedAstrologer(null);
                    setBookingStep(1);
                  }
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                      <AppImage
                        src={selectedAstrologer.image}
                        alt={`${selectedAstrologer.name} booking`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h2 className="font-bold text-foreground">{selectedAstrologer.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {selectedAstrologer.specialty[0]} ·{' '}
                          {formatPrice(selectedAstrologer.pricePerMin)}/min
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAstrologer(null);
                        setBookingStep(1);
                      }}
                      className="p-2 rounded-xl hover:bg-muted transition-all"
                    >
                      <X size={18} className="text-muted-foreground" />
                    </button>
                  </div>

                  {/* Step Indicator */}
                  <div className="flex items-center justify-between relative p-5 border-b border-border">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
                    {[
                      { step: 1, label: 'Type' },
                      { step: 2, label: 'Payment' },
                    ].map((s) => (
                      <div key={s.step} className="flex items-center gap-3 bg-card px-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bookingStep >= s.step ? 'gold-gradient-bg text-white' : 'bg-muted text-muted-foreground'}`}
                        >
                          {s.step}
                        </div>
                        <span
                          className={`text-xs font-semibold ${bookingStep >= s.step ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-5">
                    {bookingStep === 1 && (
                      <div className="space-y-5">
                        <div>
                          <h3 className="font-semibold text-foreground mb-4">
                            Choose Consultation Type
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {(['video', 'call'] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => setConsultationType(type)}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${consultationType === type ? 'border-[#C9952B] bg-[#C9952B]/10' : 'border-border hover:border-[#C9952B]/50'}`}
                              >
                                {type === 'video' ? (
                                  <Video
                                    size={24}
                                    className={
                                      consultationType === type
                                        ? 'text-[#C9952B]'
                                        : 'text-muted-foreground'
                                    }
                                  />
                                ) : (
                                  <Phone
                                    size={24}
                                    className={
                                      consultationType === type
                                        ? 'text-[#C9952B]'
                                        : 'text-muted-foreground'
                                    }
                                  />
                                )}
                                <span className="font-semibold text-sm text-foreground capitalize">
                                  {type} Consultation
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {type === 'video' ? 'Face-to-face video call' : 'Audio only'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground mb-1">
                            About {selectedAstrologer.name}
                          </p>
                          <p className="text-sm text-foreground">{selectedAstrologer.about}</p>
                        </div>
                        <button
                          onClick={() => setBookingStep(2)}
                          className="w-full py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                          Continue to Payment <ChevronRight size={16} />
                        </button>
                      </div>
                    )}

                    {/* Step 2 (Payment) */}
                    {bookingStep === 2 && (
                      <div className="space-y-5">
                        <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                          <h3 className="font-semibold text-foreground">Booking Summary</h3>
                          {[
                            { label: 'Astrologer', value: selectedAstrologer.name },
                            {
                              label: 'Type',
                              value:
                                consultationType === 'video'
                                  ? 'Video Consultation'
                                  : 'Phone Consultation',
                            },
                            {
                              label: 'Max Duration',
                              value: `${Math.floor((userData?.walletBalance || 0) / (selectedAstrologer?.pricePerMin || 1))} mins (based on balance)`,
                            },
                            {
                              label: 'Rate',
                              value: `${formatPrice(selectedAstrologer.pricePerMin)}/min`,
                            },
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-medium text-foreground text-right">
                                {item.value}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-border pt-3 flex justify-between">
                            <span className="font-semibold text-foreground">
                              Min Balance Required
                            </span>
                            <span className="text-xl font-bold text-[#C9952B] tabular-nums">
                              {formatPrice(selectedAstrologer.pricePerMin * 5)}
                            </span>
                          </div>
                        </div>

                        {/* Currency note */}
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/20">
                          <Globe size={14} className="text-[#C9952B]" />
                          <p className="text-xs text-muted-foreground">
                            Paying in{' '}
                            <span className="font-semibold text-[#C9952B]">
                              {currencyCode === 'INR' ? 'Indian Rupee' : 'US Dollar'} (
                              {currencyCode})
                            </span>{' '}
                            · Automatically detected for your region
                          </p>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
                          <div className="p-4 rounded-xl border border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#C9952B]/20 flex items-center justify-center">
                                <span className="text-xl">👛</span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">My Wallet</p>
                                <p
                                  className={`text-sm ${(userData?.walletBalance || 0) >= selectedAstrologer.pricePerMin * 5 ? 'text-green-500' : 'text-red-500'}`}
                                >
                                  Available: {formatPrice(userData?.walletBalance || 0)}
                                </p>
                              </div>
                            </div>
                            {(userData?.walletBalance || 0) <
                              selectedAstrologer.pricePerMin * 5 && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/wallet?redirect=${encodeURIComponent('/talk-to-astrologer')}`
                                  )
                                }
                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-colors"
                              >
                                Recharge
                              </button>
                            )}
                          </div>
                          {(userData?.walletBalance || 0) < selectedAstrologer.pricePerMin * 5 && (
                            <p className="text-xs text-red-500 mt-2 text-center">
                              Minimum 5 mins required. Please recharge your wallet to continue.
                            </p>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setBookingStep(1)}
                            className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:border-[#C9952B]/50 transition-all"
                          >
                            Back
                          </button>
                          {(userData?.walletBalance || 0) < selectedAstrologer.pricePerMin * 5 ? (
                            <button
                              onClick={() =>
                                router.push(
                                  `/wallet?redirect=${encodeURIComponent('/talk-to-astrologer')}`
                                )
                              }
                              className="flex-1 py-3 rounded-xl font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                              Recharge Wallet
                            </button>
                          ) : (
                            <button
                              onClick={handleBook}
                              disabled={isBooking || isWaiting}
                              className="flex-1 py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                              {isWaiting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Connecting...
                                </>
                              ) : isBooking ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Phone size={16} /> Connect Now
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Comprehensive Astrologer Filters Modal (Matching Design & Dynamic Data) */}
      <AstrologerFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filterState={filterModalState}
        onApply={(newState) => setFilterModalState(newState)}
        onReset={() => {
          setFilterModalState(defaultFilterState);
          setActiveCategory('All');
          setSearch('');
        }}
        dynamicSkills={dynamicSkills}
        dynamicLanguages={dynamicLanguages}
        dynamicCountries={dynamicCountries}
        dynamicGenders={dynamicGenders}
      />
    </div>
  );
}
