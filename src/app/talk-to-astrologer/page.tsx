'use client';
import React, { useState, useEffect } from 'react';

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
} from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, increment, onSnapshot } from 'firebase/firestore';
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
  const router = useRouter();
  const { user, userData } = useUserData();
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<string>('rating');
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
        const fetchedData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Astrologer',
            specialty: data.skills ? data.skills.split(',').map((s:string) => s.trim()) : ['Vedic Astrology'],
            experience: Number(data.experienceYears || data.experience) || 10,
            rating: Number(data.rating) || 4.9,
            reviews: Number(data.reviewsCount || data.reviews) || 2847,
            pricePerMin: Number(data.amount) || 20,
            languages: data.languages ? data.languages.split(',').map((l:string)=>l.trim()) : ['English', 'Hindi'],
            status: data.isOnline !== undefined ? (data.isOnline ? 'online' : 'offline') : 'online',
            image: data.profileImageUrl || data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'A')}&background=random`,
            consultations: Number(data.consultations) || 12480,
            badge: data.badge !== undefined ? data.badge : 'Top Rated',
            about: data.bio || data.about || 'Experienced astrologer offering insightful guidance.',
          };
        });
        setAstrologers(fetchedData);
      } catch (error) {
        console.error("Failed to fetch astrologers", error);
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

  const filtered = astrologers
    .filter((a: any) => {
      const matchSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.specialty.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchSpec = filterSpecialty === 'all' || a.specialty.includes(filterSpecialty);
      return matchSearch && matchStatus && matchSpec;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.pricePerMin - b.pricePerMin;
      if (sortBy === 'price-high') return b.pricePerMin - a.pricePerMin;
      if (sortBy === 'experience') return b.experience - a.experience;
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
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#8B1A2A]/20 blur-3xl" />
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

      {/* Filters + Currency */}
      <div className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4">
        <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center gap-3">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-[#C9952B] transition-all"
          >
            <option value="all">All Status</option>
            <option value="online">Online Now</option>
            <option value="busy">Busy</option>
          </select>
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-[#C9952B] transition-all"
          >
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Specialties' : s}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-[#C9952B] transition-all"
          >
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="experience">Most Experienced</option>
          </select>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/30">
            <Globe size={14} className="text-[#C9952B]" />
            <span className="text-sm font-semibold text-[#C9952B] outline-none">
              {currencyCode} ({currencySymbol})
            </span>
          </div>
          <div className="text-sm text-muted-foreground ml-auto">{filtered.length} astrologers</div>
        </div>
      </div>

      {/* Astrologer Grid */}
      <div className="px-6 lg:px-8 py-8 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((ast, i) => (
            <motion.div
              key={ast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden card-hover group"
            >
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <AppImage
                      src={ast.image}
                      alt={`${ast.name} - verified astrologer specializing in ${ast.specialty[0]}`}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${ast.status === 'online' ? 'bg-green-400' : ast.status === 'busy' ? 'bg-amber-400' : 'bg-gray-400'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">
                        {ast.name}
                      </h3>
                      {ast.badge && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#C9952B]/15 text-[#C9952B] font-semibold flex-shrink-0">
                          {ast.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ast.experience} yrs experience
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={10} fill="currentColor" className="text-[#C9952B]" />
                      <span className="text-xs font-semibold text-foreground">{ast.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({ast.reviews.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {ast.specialty.slice(0, 2).map((s: string) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full bg-[#6B0F1A]/10 text-[#6B0F1A] dark:text-[#C9952B] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                  {ast.specialty.length > 2 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      +{ast.specialty.length - 2}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-[#C9952B] tabular-nums">
                      {formatPrice(ast.pricePerMin)}
                    </span>
                    <span className="text-xs text-muted-foreground">/min</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ast.languages.slice(0, 2).map((l: string) => (
                      <span
                        key={l}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/astrologer/${ast.id}`}
                  className="block w-full text-center py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-[#C9952B] border border-border hover:border-[#C9952B]/40 transition-all mb-2"
                >
                  View Full Profile →
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedAstrologer(ast);
                      setConsultationType('video');
                      setBookingStep(1);
                    }}
                    disabled={ast.status === 'offline'}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-[#6B0F1A]/10 text-[#6B0F1A] dark:text-[#C9952B] hover:bg-[#6B0F1A] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Video size={12} /> Video
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAstrologer(ast);
                      setConsultationType('call');
                      setBookingStep(1);
                    }}
                    disabled={ast.status === 'offline'}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Phone size={12} /> Call
                  </button>
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
      <AnimatePresence>
        {selectedAstrologer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
                      {selectedAstrologer.specialty[0]} · {formatPrice(selectedAstrologer.pricePerMin)}/min
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
                {/* Step 1 */}
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
                          <span className="font-medium text-foreground text-right">{item.value}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-3 flex justify-between">
                        <span className="font-semibold text-foreground">Min Balance Required</span>
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
                          {currencyCode === 'INR' ? 'Indian Rupee' : 'US Dollar'} ({currencyCode})
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
                            <p className={`text-sm ${(userData?.walletBalance || 0) >= selectedAstrologer.pricePerMin * 5 ? 'text-green-500' : 'text-red-500'}`}>
                              Available: {formatPrice(userData?.walletBalance || 0)}
                            </p>
                          </div>
                        </div>
                        {(userData?.walletBalance || 0) < selectedAstrologer.pricePerMin * 5 && (
                          <button 
                            onClick={() => router.push(`/wallet?redirect=${encodeURIComponent('/talk-to-astrologer')}`)}
                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-colors"
                          >
                            Recharge
                          </button>
                        )}
                      </div>
                      {(userData?.walletBalance || 0) < selectedAstrologer.pricePerMin * 5 && (
                         <p className="text-xs text-red-500 mt-2 text-center">Minimum 5 mins required. Please recharge your wallet to continue.</p>
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
                          onClick={() => router.push(`/wallet?redirect=${encodeURIComponent('/talk-to-astrologer')}`)}
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
      </AnimatePresence>
    </div>
  );
}
