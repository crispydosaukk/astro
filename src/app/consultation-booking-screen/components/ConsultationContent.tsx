'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';

import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface Astrologer {
  id: string;
  name: string;
  specialty: string[];
  experience: number;
  rating: number;
  reviews: number;
  pricePerMin: number;
  languages: string[];
  status: string;
  image: string;
  consultations: number;
  badge: string | null;
  about: string;
}

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

const currencies = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', rate: 1 },
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 0.012 },
];

export default function ConsultationContent() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [consultationType, setConsultationType] = useState<'video' | 'call'>('video');
  const [duration, setDuration] = useState(5);
  const [isBooking, setIsBooking] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const q = query(collection(db, 'astrologers'), where('status', '==', 'approved'));
        const snapshot = await getDocs(q);
        const fetched: Astrologer[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetched.push({
            id: doc.id,
            name: data.name || 'Unknown Astrologer',
            specialty: data.skills ? data.skills.split(',').map((s: string) => s.trim()) : ['Vedic'],
            experience: data.experience || 10,
            rating: data.rating || 4.5,
            reviews: data.consultations || 120,
            pricePerMin: Number(data.amount) || 20,
            languages: data.languages ? data.languages.split(',').map((s: string) => s.trim()) : ['Hindi', 'English'],
            status: 'online', // Mock online status for display
            image: data.profileImageUrl || data.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop',
            consultations: data.consultations || 0,
            badge: data.rating >= 4.8 ? 'Top Rated' : null,
            about: data.bio || 'Experienced Vedic astrologer providing personalized guidance.',
          });
        });
        setAstrologers(fetched);
      } catch (err) {
        console.error('Error fetching astrologers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAstrologers();
  }, []);

  const specialties = [
    'all',
    'Vedic',
    'KP Astrology',
    'Nadi',
    'Lal Kitab',
    'Vastu',
    'Numerology',
    'Muhurtham',
    'Marriage',
  ];

  const convertPrice = (inrPrice: number) => {
    const converted = inrPrice * selectedCurrency.rate;
    return converted < 1 ? converted.toFixed(2) : Math.round(converted).toString();
  };

  const filtered = astrologers
    .filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.specialty.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchSpec = filterSpecialty === 'all' || a.specialty.includes(filterSpecialty);
      return matchSearch && matchStatus && matchSpec;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.pricePerMin - b.pricePerMin;
      if (sortBy === 'price-high') return b.pricePerMin - a.pricePerMin;
      if (sortBy === 'experience') return b.experience - a.experience;
      return 0;
    });

  const handleBook = async () => {
    setIsBooking(true);
    // Simulate booking API
    await new Promise((r) => setTimeout(r, 1000));
    setIsWaiting(true);
    toast.success('Request sent! Waiting for astrologer to accept...');
    
    // Simulate wait time
    await new Promise((r) => setTimeout(r, 3000));
    setIsWaiting(false);
    setIsBooking(false);
    setSelectedAstrologer(null);
    setBookingStep(1);
    toast.success(`Connected to ${selectedAstrologer?.name}! Redirecting...`);
  };

  const totalCost = selectedAstrologer ? selectedAstrologer.pricePerMin * duration : 0;
  const totalCostConverted = convertPrice(totalCost);

  // Generate calendar days for current month
  const today = new Date(2026, 6, 3);
  const daysInMonth = new Date(2026, 7, 0).getDate();
  const firstDay = new Date(2026, 6, 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const unavailableDays = [5, 12, 19, 26, 13, 20];

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="sticky top-20 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Book a Consultation</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Connect with 500+ verified Vedic astrologers
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/30">
              <Globe size={13} className="text-[#C9952B]" />
              <select
                value={selectedCurrency.code}
                onChange={(e) =>
                  setSelectedCurrency(
                    currencies.find((c) => c.code === e.target.value) || currencies[0]
                  )
                }
                className="bg-transparent text-xs font-semibold text-[#C9952B] outline-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {astrologers.filter((a) => a.status === 'online').length} online now
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6 max-w-screen-2xl">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search astrologer or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:border-ring outline-none text-sm transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring transition-all"
          >
            <option value="all">All Status</option>
            <option value="online">Online Now</option>
            <option value="busy">Busy</option>
          </select>

          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring transition-all"
          >
            {specialties.map((s) => (
              <option key={`spec-filter-${s}`} value={s}>
                {s === 'all' ? 'All Specialties' : s}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring transition-all"
          >
            <option value="rating">Sort: Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="experience">Most Experienced</option>
          </select>

          <div className="text-sm text-muted-foreground ml-auto">
            {filtered.length} astrologers found
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-muted border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Astrologer grid */}
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
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ast.name || 'Astrologer')}&background=713B32&color=fff&size=512`;
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
                      {selectedCurrency.symbol}{convertPrice(ast.pricePerMin)}/min
                    </span>
                    {ast.languages && ast.languages.length > 0 && (
                      <>
                        <span className="text-[#E5D9C8]">•</span>
                        <span className="truncate max-w-[100px] text-[#6B5E55] font-medium">{ast.languages.slice(0, 2).join(', ')}</span>
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
          </>
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
                  {/* Modal header */}
                  <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                      <AppImage
                        src={selectedAstrologer.image}
                        alt={`${selectedAstrologer.name} booking modal profile`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-xl object-cover"
                      />

                      <div>
                        <h2 className="font-bold text-foreground">{selectedAstrologer.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {selectedAstrologer.specialty[0]} · {selectedCurrency.symbol}
                          {convertPrice(selectedAstrologer.pricePerMin)}/min
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

                  {/* Step indicator */}
                  <div className="flex items-center justify-between relative p-5 border-b border-border">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
                    {[
                      { step: 1, label: 'Type' },
                      { step: 2, label: 'Payment' },
                    ].map((s) => (
                      <div key={`step-${s.step}`} className="flex items-center gap-3 bg-card px-2">
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
                    {/* Step 1: Consultation type */}
                    {bookingStep === 1 && (
                      <div className="space-y-5">
                        <div>
                          <h3 className="font-semibold text-foreground mb-4">
                            Choose Consultation Type
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {(['video', 'call'] as const).map((type) => (
                              <button
                                key={`type-${type}`}
                                onClick={() => setConsultationType(type)}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${consultationType === type ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'}`}
                              >
                                {type === 'video' ? (
                                  <Video
                                    size={24}
                                    className={
                                      consultationType === type
                                        ? 'text-accent'
                                        : 'text-muted-foreground'
                                    }
                                  />
                                ) : (
                                  <Phone
                                    size={24}
                                    className={
                                      consultationType === type
                                        ? 'text-accent'
                                        : 'text-muted-foreground'
                                    }
                                  />
                                )}
                                <span className="font-semibold text-sm text-foreground capitalize">
                                  {type} Consultation
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {type === 'video' ? 'Face-to-face via video' : 'Audio only'}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground mb-3">Duration</h3>
                          <div className="flex gap-2 flex-wrap">
                            {[5, 10, 15, 30, 45, 60].map((d) => (
                              <button
                                key={`dur-${d}`}
                                onClick={() => setDuration(d)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${duration === d ? 'gold-gradient-bg text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                              >
                                {d} min — {selectedCurrency.symbol}
                                {convertPrice(selectedAstrologer.pricePerMin * d)}
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

                    {/* Step 2: Payment */}
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
                            { label: 'Mode', value: 'Instant Connect' },
                            { label: 'Duration', value: `${duration} minutes` },
                            {
                              label: 'Rate',
                              value: `${selectedCurrency.symbol}${convertPrice(selectedAstrologer.pricePerMin)}/min`,
                            },
                          ].map((item) => (
                            <div key={`summary-${item.label}`} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-medium text-foreground">{item.value}</span>
                            </div>
                          ))}
                      <div className="border-t border-border pt-3 flex justify-between">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-accent tabular-nums">
                          {selectedCurrency.symbol}
                          {totalCostConverted}
                        </span>
                      </div>
                    </div>

                    {/* Currency note */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
                      <Globe size={14} className="text-accent" />
                      <p className="text-xs text-muted-foreground">
                        Paying in{' '}
                        <span className="font-semibold text-accent">
                          {selectedCurrency.label} ({selectedCurrency.code})
                        </span>{' '}
                        · Exchange rates are approximate
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'pay-upi', label: 'UPI', icon: '📱' },
                          { id: 'pay-card', label: 'Card', icon: '💳' },
                          { id: 'pay-nb', label: 'Net Banking', icon: '🏦' },
                          { id: 'pay-wallet', label: 'Wallet', icon: '👛' },
                        ].map((method) => (
                          <button
                            key={method.id}
                            className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-accent/50 text-sm font-medium hover:text-accent transition-all"
                          >
                            <span>{method.icon}</span> {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setBookingStep(1)}
                        className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:border-accent/50 transition-all"
                      >
                        Back
                      </button>
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
                            <CreditCard size={16} /> Pay {selectedCurrency.symbol}
                            {totalCostConverted}
                          </>
                        )}
                      </button>
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
    </div>
  );
}
