'use client';
import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Star, Video, Phone, X, ChevronRight, Check, CreditCard, Globe } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

const astrologers = [
  { id: 'ast-001', name: 'Pt. Rajendra Sharma', specialty: ['Vedic', 'KP Astrology', 'Prashna'], experience: 18, rating: 4.9, reviews: 2847, pricePerMin: 25, languages: ['Hindi', 'English'], status: 'online', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15639f0dd-1783110363486.png', consultations: 12480, badge: 'Top Rated', about: 'Expert in Vedic and KP astrology with 18 years of experience. Specializes in career, marriage, and financial predictions.' },
  { id: 'ast-002', name: 'Jyotishi Meera Devi', specialty: ['Nadi', 'Tamil Astrology', 'Remedies'], experience: 22, rating: 4.8, reviews: 3124, pricePerMin: 30, languages: ['Tamil', 'English'], status: 'online', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e180e2d9-1783110364377.png', consultations: 15620, badge: 'Expert', about: 'Master of Nadi astrology with access to ancient palm leaf manuscripts. 22 years of dedicated practice.' },
  { id: 'ast-003', name: 'Acharya Vikram Joshi', specialty: ['Lal Kitab', 'Vastu', 'Numerology'], experience: 15, rating: 4.7, reviews: 1893, pricePerMin: 20, languages: ['Hindi', 'Gujarati'], status: 'busy', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_176bb934d-1783110364175.png', consultations: 8930, badge: null, about: 'Lal Kitab and Vastu specialist. Known for practical and effective remedies that show quick results.' },
  { id: 'ast-004', name: 'Dr. Priya Nair', specialty: ['Numerology', 'Tarot', 'Western Astrology'], experience: 10, rating: 4.8, reviews: 1567, pricePerMin: 18, languages: ['Malayalam', 'English'], status: 'online', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_156173901-1765028487423.png', consultations: 6240, badge: 'Rising Star', about: 'Combines Vedic and Western astrology with numerology for comprehensive life guidance.' },
  { id: 'ast-005', name: 'Pandit Suresh Iyer', specialty: ['Vedic', 'Muhurtham', 'Panchang'], experience: 25, rating: 4.9, reviews: 4210, pricePerMin: 35, languages: ['Tamil', 'Telugu', 'English'], status: 'online', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12575c18b-1783110364261.png', consultations: 22100, badge: 'Grand Master', about: 'Vedic astrology grandmaster with 25 years experience. Expert in Muhurtham and auspicious timing.' },
  { id: 'ast-006', name: 'Jyotishi Lakshmi Bai', specialty: ['Vedic', 'Marriage', 'Compatibility'], experience: 12, rating: 4.6, reviews: 1122, pricePerMin: 15, languages: ['Kannada', 'Hindi', 'English'], status: 'offline', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_13e2e836c-1769286798521.png', consultations: 4580, badge: null, about: 'Specializes in marriage compatibility and relationship astrology. Helped thousands of couples.' },
  { id: 'ast-007', name: 'Acharya Deepak Mishra', specialty: ['Jaimini', 'Parashari', 'Medical Astrology'], experience: 20, rating: 4.7, reviews: 2340, pricePerMin: 28, languages: ['Hindi', 'Bengali', 'English'], status: 'online', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_18a34b9f2-1783110363357.png', consultations: 10850, badge: null, about: 'Expert in Jaimini and Parashari systems. Medical astrology specialist helping with health-related queries.' },
  { id: 'ast-008', name: 'Pt. Kavitha Reddy', specialty: ['Vedic', 'Business Astrology', 'Finance'], experience: 14, rating: 4.8, reviews: 1876, pricePerMin: 22, languages: ['Telugu', 'English'], status: 'online', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_156173901-1765028487423.png', consultations: 7340, badge: 'Business Expert', about: 'Specializes in business astrology, stock market timing, and financial planning through Vedic principles.' },
];

const currencies = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', rate: 1 },
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 0.012 },
  { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.0095 },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.011 },
];

const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'];
const bookedSlots = ['10:00 AM', '11:30 AM', '3:00 PM', '6:00 PM'];

export default function TalkToAstrologerPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedAstrologer, setSelectedAstrologer] = useState<typeof astrologers[0] | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [consultationType, setConsultationType] = useState<'video' | 'call'>('video');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const specialties = ['all', 'Vedic', 'KP Astrology', 'Nadi', 'Lal Kitab', 'Vastu', 'Numerology', 'Muhurtham', 'Marriage'];

  const convertPrice = (inrPrice: number) => {
    const converted = inrPrice * selectedCurrency.rate;
    return converted < 1 ? converted.toFixed(2) : Math.round(converted).toString();
  };

  const filtered = astrologers
    .filter((a) => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.specialty.some((s) => s.toLowerCase().includes(search.toLowerCase()));
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
    await new Promise((r) => setTimeout(r, 2000));
    setIsBooking(false);
    setSelectedAstrologer(null);
    setBookingStep(1);
    toast.success(`Consultation booked with ${selectedAstrologer?.name}! You'll receive a confirmation shortly.`);
  };

  const totalCostINR = selectedAstrologer ? selectedAstrologer.pricePerMin * duration : 0;
  const totalCostConverted = convertPrice(totalCostINR);

  const today = new Date(2026, 6, 3);
  const daysInMonth = new Date(2026, 7, 0).getDate();
  const firstDay = new Date(2026, 6, 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const unavailableDays = [5, 12, 19, 26, 13, 20];

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
              ✦ 500+ Verified Astrologers
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Talk to an <span className="text-gradient-gold">Expert Astrologer</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-6">
              Connect instantly with India's most trusted Vedic astrologers. Get personalized guidance on career, marriage, health, and life's important decisions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{astrologers.filter(a => a.status === 'online').length} Online Now</div>
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
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search astrologer or specialty..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-[#C9952B] transition-all">
            <option value="all">All Status</option>
            <option value="online">Online Now</option>
            <option value="busy">Busy</option>
          </select>
          <select value={filterSpecialty} onChange={(e) => setFilterSpecialty(e.target.value)} className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-[#C9952B] transition-all">
            {specialties.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Specialties' : s}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-[#C9952B] transition-all">
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="experience">Most Experienced</option>
          </select>
          {/* Currency Selector */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/30">
            <Globe size={14} className="text-[#C9952B]" />
            <select value={selectedCurrency.code} onChange={(e) => setSelectedCurrency(currencies.find(c => c.code === e.target.value) || currencies[0])} className="bg-transparent text-sm font-semibold text-[#C9952B] outline-none cursor-pointer">
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
            </select>
          </div>
          <div className="text-sm text-muted-foreground ml-auto">{filtered.length} astrologers</div>
        </div>
      </div>

      {/* Astrologer Grid */}
      <div className="px-6 lg:px-8 py-8 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((ast, i) => (
            <motion.div key={ast.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden card-hover group">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <AppImage src={ast.image} alt={`${ast.name} - verified astrologer specializing in ${ast.specialty[0]}`} width={56} height={56} className="w-14 h-14 rounded-xl object-cover" />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${ast.status === 'online' ? 'bg-green-400' : ast.status === 'busy' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{ast.name}</h3>
                      {ast.badge && <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#C9952B]/15 text-[#C9952B] font-semibold flex-shrink-0">{ast.badge}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ast.experience} yrs experience</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={10} fill="currentColor" className="text-[#C9952B]" />
                      <span className="text-xs font-semibold text-foreground">{ast.rating}</span>
                      <span className="text-xs text-muted-foreground">({ast.reviews.toLocaleString()})</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {ast.specialty.slice(0, 2).map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#6B0F1A]/10 text-[#6B0F1A] dark:text-[#C9952B] font-medium">{s}</span>)}
                  {ast.specialty.length > 2 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{ast.specialty.length - 2}</span>}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-[#C9952B] tabular-nums">{selectedCurrency.symbol}{convertPrice(ast.pricePerMin)}</span>
                    <span className="text-xs text-muted-foreground">/min</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ast.languages.slice(0, 2).map((l) => <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{l}</span>)}
                  </div>
                </div>
                <Link href={`/astrologer/${ast.id}`} className="block w-full text-center py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-[#C9952B] border border-border hover:border-[#C9952B]/40 transition-all mb-2">
                  View Full Profile →
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setSelectedAstrologer(ast); setConsultationType('video'); setBookingStep(1); }} disabled={ast.status === 'offline'} className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-[#6B0F1A]/10 text-[#6B0F1A] dark:text-[#C9952B] hover:bg-[#6B0F1A] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    <Video size={12} /> Video
                  </button>
                  <button onClick={() => { setSelectedAstrologer(ast); setConsultationType('call'); setBookingStep(1); }} disabled={ast.status === 'offline'} className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
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
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedAstrologer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedAstrologer(null); setBookingStep(1); } }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <AppImage src={selectedAstrologer.image} alt={`${selectedAstrologer.name} booking`} width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h2 className="font-bold text-foreground">{selectedAstrologer.name}</h2>
                    <p className="text-xs text-muted-foreground">{selectedAstrologer.specialty[0]} · {selectedCurrency.symbol}{convertPrice(selectedAstrologer.pricePerMin)}/min</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedAstrologer(null); setBookingStep(1); }} className="p-2 rounded-xl hover:bg-muted transition-all">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-0 p-5 border-b border-border">
                {[{ n: 1, label: 'Type' }, { n: 2, label: 'Schedule' }, { n: 3, label: 'Payment' }].map((s, si) => (
                  <React.Fragment key={s.n}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${bookingStep >= s.n ? 'gold-gradient-bg text-white' : 'bg-muted text-muted-foreground'}`}>
                        {bookingStep > s.n ? <Check size={12} /> : s.n}
                      </div>
                      <span className={`text-xs font-medium ${bookingStep >= s.n ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                    </div>
                    {si < 2 && <div className={`flex-1 h-0.5 mx-2 transition-all ${bookingStep > s.n ? 'bg-[#C9952B]' : 'bg-border'}`} />}
                  </React.Fragment>
                ))}
              </div>

              <div className="p-5">
                {/* Step 1 */}
                {bookingStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Choose Consultation Type</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(['video', 'call'] as const).map((type) => (
                          <button key={type} onClick={() => setConsultationType(type)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${consultationType === type ? 'border-[#C9952B] bg-[#C9952B]/10' : 'border-border hover:border-[#C9952B]/50'}`}>
                            {type === 'video' ? <Video size={24} className={consultationType === type ? 'text-[#C9952B]' : 'text-muted-foreground'} /> : <Phone size={24} className={consultationType === type ? 'text-[#C9952B]' : 'text-muted-foreground'} />}
                            <span className="font-semibold text-sm text-foreground capitalize">{type} Consultation</span>
                            <span className="text-xs text-muted-foreground">{type === 'video' ? 'Face-to-face video call' : 'Audio only'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Duration</h3>
                      <div className="flex gap-2 flex-wrap">
                        {[15, 30, 45, 60].map((d) => (
                          <button key={d} onClick={() => setDuration(d)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${duration === d ? 'gold-gradient-bg text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                            {d} min — {selectedCurrency.symbol}{convertPrice(selectedAstrologer.pricePerMin * d)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">About {selectedAstrologer.name}</p>
                      <p className="text-sm text-foreground">{selectedAstrologer.about}</p>
                    </div>
                    <button onClick={() => setBookingStep(2)} className="w-full py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center justify-center gap-2">
                      Continue to Schedule <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Step 2 */}
                {bookingStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Select Date — July 2026</h3>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>)}
                        {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
                        {calendarDays.map((day) => {
                          const dateStr = `2026-07-${day.toString().padStart(2, '0')}`;
                          const isPast = day < 3;
                          const isUnavail = unavailableDays.includes(day);
                          const isSelected = selectedDate === dateStr;
                          return (
                            <button key={day} onClick={() => !isPast && !isUnavail && setSelectedDate(dateStr)} disabled={isPast || isUnavail} className={`aspect-square rounded-lg text-xs font-medium transition-all ${isSelected ? 'gold-gradient-bg text-white' : ''} ${!isSelected && !isPast && !isUnavail ? 'hover:bg-muted text-foreground' : ''} ${isPast || isUnavail ? 'text-muted-foreground/40 cursor-not-allowed' : ''}`}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 className="font-semibold text-foreground mb-3">Available Time Slots</h3>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {timeSlots.map((slot) => {
                            const isBooked = bookedSlots.includes(slot);
                            const isSelected = selectedTime === slot;
                            return (
                              <button key={slot} onClick={() => !isBooked && setSelectedTime(slot)} disabled={isBooked} className={`py-2 rounded-lg text-xs font-medium transition-all ${isSelected ? 'gold-gradient-bg text-white' : ''} ${!isSelected && !isBooked ? 'bg-muted hover:bg-muted/80 text-foreground' : ''} ${isBooked ? 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through' : ''}`}>
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => setBookingStep(1)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:border-[#C9952B]/50 transition-all">Back</button>
                      <button onClick={() => selectedDate && selectedTime && setBookingStep(3)} disabled={!selectedDate || !selectedTime} className="flex-1 py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                        Continue to Payment <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {bookingStep === 3 && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                      <h3 className="font-semibold text-foreground">Booking Summary</h3>
                      {[
                        { label: 'Astrologer', value: selectedAstrologer.name },
                        { label: 'Type', value: consultationType === 'video' ? 'Video Consultation' : 'Phone Consultation' },
                        { label: 'Date', value: selectedDate },
                        { label: 'Time', value: selectedTime + ' IST' },
                        { label: 'Duration', value: `${duration} minutes` },
                        { label: 'Rate', value: `${selectedCurrency.symbol}${convertPrice(selectedAstrologer.pricePerMin)}/min` },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                      <div className="border-t border-border pt-3 flex justify-between">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-[#C9952B] tabular-nums">{selectedCurrency.symbol}{totalCostConverted}</span>
                      </div>
                    </div>

                    {/* Currency note */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/20">
                      <Globe size={14} className="text-[#C9952B]" />
                      <p className="text-xs text-muted-foreground">Paying in <span className="font-semibold text-[#C9952B]">{selectedCurrency.label} ({selectedCurrency.code})</span> · Exchange rates are approximate</p>
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
                          <button key={method.id} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-[#C9952B]/50 text-sm font-medium hover:text-[#C9952B] transition-all">
                            <span>{method.icon}</span> {method.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setBookingStep(2)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:border-[#C9952B]/50 transition-all">Back</button>
                      <button onClick={handleBook} disabled={isBooking} className="flex-1 py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                        {isBooking ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CreditCard size={16} /> Pay {selectedCurrency.symbol}{totalCostConverted}</>}
                      </button>
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
