'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Video, Phone, ChevronLeft, Check, MapPin, Clock, Award, MessageCircle, ThumbsUp, Calendar, Globe, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import Navbar from '@/components/Navbar';


const astrologersData: Record<string, {
  id: string;name: string;specialty: string[];experience: number;rating: number;
  reviews: number;pricePerMin: number;languages: string[];status: string;
  image: string;consultations: number;badge: string | null;about: string;
  location: string;education: string;certifications: string[];
  expertise: {name: string;level: number;}[];
  reviewsList: {name: string;avatar: string;rating: number;date: string;comment: string;helpful: number;}[];
}> = {
  'ast-001': {
    id: 'ast-001', name: 'Pt. Rajendra Sharma', specialty: ['Vedic', 'KP Astrology', 'Prashna'], experience: 18,
    rating: 4.9, reviews: 2847, pricePerMin: 25, languages: ['Hindi', 'English'], status: 'online',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3885eb8-1777028192064.png",
    consultations: 12480, badge: 'Top Rated', location: 'Varanasi, India',
    education: 'M.A. Jyotish Shastra, Banaras Hindu University',
    certifications: ['Jyotish Acharya', 'KP Astrology Certified', 'Prashna Shastra Expert'],
    about: 'Pt. Rajendra Sharma is a renowned Vedic astrologer with 18 years of dedicated practice. He specializes in KP Astrology and Prashna (horary astrology), offering precise predictions for career, marriage, and financial matters. His deep knowledge of ancient Vedic texts combined with modern analytical techniques makes him one of the most sought-after astrologers on the platform. He has guided over 12,000 clients across 40+ countries with life-changing insights.',
    expertise: [
    { name: 'Vedic Astrology', level: 98 }, { name: 'KP Astrology', level: 95 },
    { name: 'Prashna Shastra', level: 92 }, { name: 'Career Guidance', level: 90 },
    { name: 'Marriage & Relationships', level: 88 }, { name: 'Financial Astrology', level: 85 }],

    reviewsList: [
    { name: 'Arjun Mehta', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14ffa8b76-1772101717598.png", rating: 5, date: '2 days ago', comment: 'Absolutely accurate predictions! Pt. Sharma predicted my job change 3 months in advance. His KP analysis is unmatched. Highly recommend for career-related queries.', helpful: 47 },
    { name: 'Priya Kapoor', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14ceba124-1776062537292.png", rating: 5, date: '1 week ago', comment: 'I was skeptical at first but his reading of my birth chart was incredibly detailed. He identified issues I never mentioned and gave practical remedies. Life-changing session!', helpful: 38 },
    { name: 'Ravi Kumar', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3885eb8-1777028192064.png", rating: 4, date: '2 weeks ago', comment: 'Very knowledgeable and patient. Explained everything in simple terms. The Prashna reading was spot on. Will definitely consult again for my marriage timing.', helpful: 29 },
    { name: 'Sunita Rao', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_150a0ce18-1765973273605.png", rating: 5, date: '3 weeks ago', comment: 'Best astrologer I have consulted. His remedies are simple and effective. My business has improved significantly after following his guidance. Thank you Pt. Sharma!', helpful: 52 }]

  },
  'ast-002': {
    id: 'ast-002', name: 'Jyotishi Meera Devi', specialty: ['Nadi', 'Tamil Astrology', 'Remedies'], experience: 22,
    rating: 4.8, reviews: 3124, pricePerMin: 30, languages: ['Tamil', 'English'], status: 'online',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_152c415d9-1783117245559.png",
    consultations: 15620, badge: 'Expert', location: 'Chennai, India',
    education: 'Ph.D. in Jyotish, Tamil Nadu University',
    certifications: ['Nadi Astrology Master', 'Tamil Astrology Expert', 'Remedial Astrology Certified'],
    about: 'Jyotishi Meera Devi is a master of Nadi astrology with access to rare ancient palm leaf manuscripts. With 22 years of dedicated practice, she has helped over 15,000 clients find clarity and direction. Her expertise in Tamil astrology and powerful remedies has transformed countless lives. She is known for her compassionate approach and highly accurate readings.',
    expertise: [
    { name: 'Nadi Astrology', level: 99 }, { name: 'Tamil Astrology', level: 97 },
    { name: 'Remedial Astrology', level: 94 }, { name: 'Palm Leaf Reading', level: 96 },
    { name: 'Marriage Compatibility', level: 90 }, { name: 'Health Astrology', level: 87 }],

    reviewsList: [
    { name: 'Kavitha Nair', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17f62d275-1765106881422.png", rating: 5, date: '3 days ago', comment: 'Meera Devi is truly gifted. Her Nadi reading revealed things about my past that no one could have known. The remedies she suggested have brought peace to my family.', helpful: 61 },
    { name: 'Suresh Pillai', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_161275a24-1767210617391.png", rating: 5, date: '1 week ago', comment: 'Exceptional knowledge of Tamil astrology. She predicted my promotion timing accurately. Her remedies are practical and easy to follow. Truly blessed to have found her.', helpful: 44 },
    { name: 'Anitha Krishnan', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1288b2af6-1766324190334.png", rating: 4, date: '2 weeks ago', comment: 'Very detailed and accurate reading. She explained the planetary positions clearly and the remedies are working well. Highly recommend for health-related queries.', helpful: 33 },
    { name: 'Murali Rajan', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1eeec489e-1778447165266.png", rating: 5, date: '1 month ago', comment: 'Outstanding consultation. Her knowledge of ancient texts is remarkable. She identified my career obstacles and the remedies she gave have shown results within weeks.', helpful: 57 }]

  },
  'ast-005': {
    id: 'ast-005', name: 'Pandit Suresh Iyer', specialty: ['Vedic', 'Muhurtham', 'Panchang'], experience: 25,
    rating: 4.9, reviews: 4210, pricePerMin: 35, languages: ['Tamil', 'Telugu', 'English'], status: 'online',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a67f10f0-1767013801785.png",
    consultations: 22100, badge: 'Grand Master', location: 'Tirupati, India',
    education: 'Vedic Jyotish Acharya, Rashtriya Sanskrit Vidyapeetha',
    certifications: ['Grand Master Vedic Astrologer', 'Muhurtham Specialist', 'Panchang Expert'],
    about: 'Pandit Suresh Iyer is a Vedic astrology grandmaster with 25 years of unparalleled experience. Renowned for his expertise in Muhurtham (auspicious timing) and Panchang calculations, he has guided over 22,000 clients in making life\'s most important decisions at the right time. His deep understanding of planetary cycles and their impact on human life makes him the most consulted astrologer on the platform.',
    expertise: [
    { name: 'Vedic Astrology', level: 99 }, { name: 'Muhurtham', level: 99 },
    { name: 'Panchang', level: 98 }, { name: 'Marriage Timing', level: 96 },
    { name: 'Business Muhurtham', level: 94 }, { name: 'Electional Astrology', level: 92 }],

    reviewsList: [
    { name: 'Venkat Rao', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_140612fcc-1782372061262.png", rating: 5, date: '1 day ago', comment: 'Pandit Iyer is simply the best. His Muhurtham for our wedding was perfect and everything went smoothly. His knowledge of Panchang is extraordinary. Blessed to have his guidance.', helpful: 78 },
    { name: 'Lakshmi Devi', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3885eb8-1777028192064.png", rating: 5, date: '5 days ago', comment: 'Consulted for business opening Muhurtham. The timing he suggested was auspicious and our business has been thriving since. His predictions about the first year were 100% accurate.', helpful: 65 },
    { name: 'Karthik Subramanian', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13ded3a28-1767975323802.png", rating: 5, date: '2 weeks ago', comment: 'Exceptional grandmaster. His reading of my birth chart revealed deep insights about my life path. The remedies are powerful yet simple. Truly a gem of Vedic astrology.', helpful: 59 },
    { name: 'Padma Krishnan', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1288b2af6-1766324190334.png", rating: 4, date: '3 weeks ago', comment: 'Very thorough and patient consultation. He explained every aspect of my chart in detail. His Muhurtham calculations are precise and backed by deep scriptural knowledge.', helpful: 41 }]

  }
};

const currencies = [
{ code: 'USD', symbol: '$', label: 'US Dollar', rate: 0.012 },
{ code: 'INR', symbol: '₹', label: 'Indian Rupee', rate: 1 },
{ code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.0095 },
{ code: 'EUR', symbol: '€', label: 'Euro', rate: 0.011 }];


const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];
const bookedSlots = ['10:00 AM', '11:30 AM', '3:00 PM', '6:00 PM'];

// Generate calendar for July 2026
const calendarYear = 2026;
const calendarMonth = 6; // July (0-indexed)
const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
const unavailableDays = [6, 7, 13, 14, 20, 21, 27, 28]; // weekends
const fullyBookedDays = [8, 15, 22];

export default function AstrologerDetailPage({ params }: {params: Promise<{id: string;}>;}) {
  const { id } = React.use(params);
  const astrologer = astrologersData[id] || astrologersData['ast-001'];
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]); // Default USD
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState<'video' | 'call'>('video');
  const [duration, setDuration] = useState(30);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  const [isBooking, setIsBooking] = useState(false);

  const convertPrice = (inrPrice: number) => {
    const converted = inrPrice * selectedCurrency.rate;
    return converted < 1 ? converted.toFixed(2) : Math.round(converted).toString();
  };

  const hourlyRate = astrologer.pricePerMin * 60;
  const totalCost = astrologer.pricePerMin * duration;

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time slot');
      return;
    }
    setIsBooking(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsBooking(false);
    toast.success(`Consultation booked with ${astrologer.name}! Confirmation sent to your email.`);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Back Navigation */}
      <div className="bg-card border-b border-border px-6 lg:px-10 py-4 mt-16 lg:mt-20">
        <div className="max-w-screen-xl mx-auto">
          <Link href="/talk-to-astrologer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#C9952B] transition-colors">
            <ChevronLeft size={16} />
            Back to Astrologers
          </Link>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl border border-border p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative flex-shrink-0">
                  <AppImage
                    src={astrologer.image}
                    alt={`${astrologer.name} - expert astrologer specializing in ${astrologer.specialty[0]}`}
                    width={120} height={120}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover" />
                  
                  <div className={`absolute -bottom-1.5 -right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${astrologer.status === 'online' ? 'bg-green-500/20 border-green-500/40 text-green-400' : astrologer.status === 'busy' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-gray-500/20 border-gray-500/40 text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${astrologer.status === 'online' ? 'bg-green-400 animate-pulse' : astrologer.status === 'busy' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                    {astrologer.status === 'online' ? 'Online' : astrologer.status === 'busy' ? 'Busy' : 'Offline'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{astrologer.name}</h1>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <MapPin size={13} />
                        <span>{astrologer.location}</span>
                      </div>
                    </div>
                    {astrologer.badge &&
                    <span className="px-3 py-1 rounded-full text-xs font-semibold gold-gradient-bg text-white">{astrologer.badge}</span>
                    }
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {astrologer.specialty.map((s) =>
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[#6B0F1A]/10 text-[#6B0F1A] dark:text-[#C9952B] font-medium border border-[#C9952B]/20">{s}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} fill="currentColor" className="text-[#C9952B]" />
                      <span className="font-bold text-foreground">{astrologer.rating}</span>
                      <span className="text-muted-foreground">({astrologer.reviews.toLocaleString()} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} />
                      <span>{astrologer.experience} yrs experience</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageCircle size={13} />
                      <span>{astrologer.consultations.toLocaleString()} consultations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#C9952B]">{astrologer.experience}+</div>
                  <div className="text-xs text-muted-foreground">Years Exp.</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-xl font-bold text-[#C9952B]">{(astrologer.consultations / 1000).toFixed(1)}K+</div>
                  <div className="text-xs text-muted-foreground">Consultations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#C9952B]">{astrologer.rating}</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl border border-border overflow-hidden">
              <div className="flex border-b border-border">
                {(['about', 'reviews'] as const).map((tab) =>
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'text-[#C9952B] border-b-2 border-[#C9952B]' : 'text-muted-foreground hover:text-foreground'}`}>
                    {tab === 'reviews' ? `Reviews (${astrologer.reviews.toLocaleString()})` : 'About & Expertise'}
                  </button>
                )}
              </div>

              <div className="p-6">
                {activeTab === 'about' &&
                <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">About</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{astrologer.about}</p>
                    </div>

                    {/* Education */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Education</h3>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#C9952B]/10 flex items-center justify-center flex-shrink-0">
                          <Award size={14} className="text-[#C9952B]" />
                        </div>
                        <p className="text-sm text-muted-foreground">{astrologer.education}</p>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {astrologer.certifications.map((cert) =>
                      <div key={cert} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-600 dark:text-green-400">
                            <Shield size={11} />
                            {cert}
                          </div>
                      )}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {astrologer.languages.map((lang) =>
                      <span key={lang} className="px-3 py-1.5 rounded-xl bg-muted text-sm text-muted-foreground font-medium">{lang}</span>
                      )}
                      </div>
                    </div>

                    {/* Expertise Bars */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Areas of Expertise</h3>
                      <div className="space-y-3">
                        {astrologer.expertise.map((exp) =>
                      <div key={exp.name}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm text-foreground">{exp.name}</span>
                              <span className="text-xs font-semibold text-[#C9952B]">{exp.level}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${exp.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full gold-gradient-bg" />
                          
                            </div>
                          </div>
                      )}
                      </div>
                    </div>
                  </div>
                }

                {activeTab === 'reviews' &&
                <div className="space-y-5">
                    {/* Rating Summary */}
                    <div className="flex items-center gap-6 p-4 rounded-xl bg-muted/50">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-foreground">{astrologer.rating}</div>
                        <div className="flex items-center justify-center gap-0.5 my-1">
                          {[1, 2, 3, 4, 5].map((s) =>
                        <Star key={s} size={12} fill={s <= Math.round(astrologer.rating) ? 'currentColor' : 'none'} className="text-[#C9952B]" />
                        )}
                        </div>
                        <div className="text-xs text-muted-foreground">{astrologer.reviews.toLocaleString()} reviews</div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                        const pct = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 2 : 1;
                        return (
                          <div key={star} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-3">{star}</span>
                              <Star size={10} fill="currentColor" className="text-[#C9952B]" />
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full gold-gradient-bg rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                            </div>);

                      })}
                      </div>
                    </div>

                    {/* Review Cards */}
                    {astrologer.reviewsList.map((review, i) =>
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-4 rounded-xl border border-border bg-card">
                        <div className="flex items-start gap-3 mb-3">
                          <AppImage src={review.avatar} alt={`${review.name} review`} width={36} height={36} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-foreground">{review.name}</span>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((s) =>
                          <Star key={s} size={10} fill={s <= review.rating ? 'currentColor' : 'none'} className="text-[#C9952B]" />
                          )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        <button className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-[#C9952B] transition-colors">
                          <ThumbsUp size={11} />
                          Helpful ({review.helpful})
                        </button>
                      </motion.div>
                  )}
                  </div>
                }
              </div>
            </motion.div>
          </div>

          {/* Right Column — Booking */}
          <div className="space-y-5">
            {/* Pricing Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl border border-[#C9952B]/30 p-5 sticky top-24">
              {/* Currency Selector */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Book Consultation</h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/20">
                  <Globe size={12} className="text-[#C9952B]" />
                  <select
                    value={selectedCurrency.code}
                    onChange={(e) => setSelectedCurrency(currencies.find((c) => c.code === e.target.value) || currencies[0])}
                    className="bg-transparent text-xs font-semibold text-[#C9952B] outline-none cursor-pointer">
                    
                    {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#6B0F1A]/10 to-[#C9952B]/10 border border-[#C9952B]/20 mb-5">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-[#C9952B]">{selectedCurrency.symbol}{convertPrice(astrologer.pricePerMin)}</span>
                  <span className="text-sm text-muted-foreground">/ min</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ <span className="font-semibold text-foreground">{selectedCurrency.symbol}{convertPrice(hourlyRate)}</span> / hour
                </div>
              </div>

              {/* Consultation Type */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Consultation Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['video', 'call'] as const).map((type) =>
                  <button key={type} onClick={() => setConsultationType(type)} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${consultationType === type ? 'border-[#C9952B] bg-[#C9952B]/10 text-[#C9952B]' : 'border-border text-muted-foreground hover:border-[#C9952B]/40'}`}>
                      {type === 'video' ? <Video size={13} /> : <Phone size={13} />}
                      {type === 'video' ? 'Video' : 'Voice Call'}
                    </button>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Duration</p>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((d) =>
                  <button key={d} onClick={() => setDuration(d)} className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${duration === d ? 'border-[#C9952B] bg-[#C9952B]/10 text-[#C9952B]' : 'border-border text-muted-foreground hover:border-[#C9952B]/40'}`}>
                      {d} min
                    </button>
                  )}
                </div>
              </div>

              {/* Availability Calendar */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Calendar size={12} />
                  Select Date — July 2026
                </p>
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="grid grid-cols-7 bg-muted/50">
                    {weekDays.map((d) =>
                    <div key={d} className="py-1.5 text-center text-xs font-semibold text-muted-foreground">{d}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-7 p-1 gap-0.5">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const isUnavailable = unavailableDays.includes(day);
                      const isFullyBooked = fullyBookedDays.includes(day);
                      const isPast = day < 3;
                      const isSelected = selectedDate === day;
                      const isToday = day === 3;
                      const disabled = isUnavailable || isFullyBooked || isPast;
                      return (
                        <button
                          key={day}
                          disabled={disabled}
                          onClick={() => setSelectedDate(day)}
                          className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all font-medium
                            ${isSelected ? 'gold-gradient-bg text-white font-bold' : ''}
                            ${isToday && !isSelected ? 'border border-[#C9952B] text-[#C9952B]' : ''}
                            ${disabled ? 'opacity-30 cursor-not-allowed' : !isSelected ? 'hover:bg-[#C9952B]/10 hover:text-[#C9952B] text-foreground' : ''}
                          `}>
                          
                          {day}
                        </button>);

                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm gold-gradient-bg" /> Selected</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm border border-[#C9952B]" /> Today</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-muted opacity-30" /> Unavailable</div>
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate &&
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock size={12} />
                    Available Time Slots
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {timeSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-1.5 px-1 rounded-lg text-xs font-medium transition-all border ${selectedTime === slot ? 'gold-gradient-bg text-white border-transparent' : isBooked ? 'bg-muted/50 text-muted-foreground/40 border-border cursor-not-allowed line-through' : 'border-border text-foreground hover:border-[#C9952B] hover:text-[#C9952B]'}`}>
                        
                          {slot}
                        </button>);

                  })}
                  </div>
                </motion.div>
              }

              {/* Total Cost */}
              {selectedDate && selectedTime &&
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-muted/50 border border-border mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{duration} min × {selectedCurrency.symbol}{convertPrice(astrologer.pricePerMin)}/min</span>
                    <span className="font-bold text-foreground">{selectedCurrency.symbol}{convertPrice(totalCost)}</span>
                  </div>
                </motion.div>
              }

              {/* Book Button */}
              <button
                onClick={handleBook}
                disabled={isBooking || astrologer.status === 'offline'}
                className="w-full py-3.5 rounded-xl font-semibold text-sm gold-gradient-bg text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                
                {isBooking ?
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</> :

                <><Zap size={15} /> Book Now</>
                }
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                { icon: Shield, text: 'Verified Expert' },
                { icon: Check, text: 'Secure Payment' }].
                map(({ icon: Icon, text }) =>
                <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon size={11} className="text-green-500" />
                    {text}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4 text-sm">Why Choose {astrologer.name.split(' ')[0]}?</h3>
              <div className="space-y-3">
                {[
                { icon: Award, text: `${astrologer.experience}+ years of dedicated practice` },
                { icon: Star, text: `${astrologer.rating}/5 rating from ${astrologer.reviews.toLocaleString()} clients` },
                { icon: MessageCircle, text: `${astrologer.consultations.toLocaleString()}+ successful consultations` },
                { icon: Globe, text: `Speaks ${astrologer.languages.join(', ')}` }].
                map(({ icon: Icon, text }) =>
                <div key={text} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#C9952B]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-[#C9952B]" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>);

}