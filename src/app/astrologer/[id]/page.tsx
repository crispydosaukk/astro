'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Video,
  Phone,
  ChevronLeft,
  Check,
  MapPin,
  Clock,
  Award,
  MessageCircle,
  ThumbsUp,
  Calendar,
  Globe,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import Navbar from '@/components/Navbar';
import { useCurrency } from '@/lib/CurrencyContext';
import { useUserData } from '@/lib/useUserData';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } from 'firebase/firestore';

const astrologersData: Record<
  string,
  {
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
    location: string;
    education: string;
    certifications: string[];
    expertise: { name: string; level: number }[];
    reviewsList: {
      name: string;
      avatar: string;
      rating: number;
      date: string;
      comment: string;
      helpful: number;
    }[];
  }
> = {
  'ast-001': {
    id: 'ast-001',
    name: 'Pt. Rajendra Sharma',
    specialty: ['Vedic', 'KP Astrology', 'Prashna'],
    experience: 18,
    rating: 4.9,
    reviews: 2847,
    pricePerMin: 25,
    languages: ['Hindi', 'English'],
    status: 'online',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d3885eb8-1777028192064.png',
    consultations: 12480,
    badge: 'Top Rated',
    location: 'Varanasi, India',
    education: 'M.A. Jyotish Shastra, Banaras Hindu University',
    certifications: ['Jyotish Acharya', 'KP Astrology Certified', 'Prashna Shastra Expert'],
    about:
      'Pt. Rajendra Sharma is a renowned Vedic astrologer with 18 years of dedicated practice. He specializes in KP Astrology and Prashna (horary astrology), offering precise predictions for career, marriage, and financial matters. His deep knowledge of ancient Vedic texts combined with modern analytical techniques makes him one of the most sought-after astrologers on the platform. He has guided over 12,000 clients across 40+ countries with life-changing insights.',
    expertise: [
      { name: 'Vedic Astrology', level: 98 },
      { name: 'KP Astrology', level: 95 },
      { name: 'Prashna Shastra', level: 92 },
      { name: 'Career Guidance', level: 90 },
      { name: 'Marriage & Relationships', level: 88 },
      { name: 'Financial Astrology', level: 85 },
    ],

    reviewsList: [
      {
        name: 'Arjun Mehta',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_14ffa8b76-1772101717598.png',
        rating: 5,
        date: '2 days ago',
        comment:
          'Absolutely accurate predictions! Pt. Sharma predicted my job change 3 months in advance. His KP analysis is unmatched. Highly recommend for career-related queries.',
        helpful: 47,
      },
      {
        name: 'Priya Kapoor',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_14ceba124-1776062537292.png',
        rating: 5,
        date: '1 week ago',
        comment:
          'I was skeptical at first but his reading of my birth chart was incredibly detailed. He identified issues I never mentioned and gave practical remedies. Life-changing session!',
        helpful: 38,
      },
      {
        name: 'Ravi Kumar',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d3885eb8-1777028192064.png',
        rating: 4,
        date: '2 weeks ago',
        comment:
          'Very knowledgeable and patient. Explained everything in simple terms. The Prashna reading was spot on. Will definitely consult again for my marriage timing.',
        helpful: 29,
      },
      {
        name: 'Sunita Rao',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_150a0ce18-1765973273605.png',
        rating: 5,
        date: '3 weeks ago',
        comment:
          'Best astrologer I have consulted. His remedies are simple and effective. My business has improved significantly after following his guidance. Thank you Pt. Sharma!',
        helpful: 52,
      },
    ],
  },
  'ast-002': {
    id: 'ast-002',
    name: 'Jyotishi Meera Devi',
    specialty: ['Nadi', 'Tamil Astrology', 'Remedies'],
    experience: 22,
    rating: 4.8,
    reviews: 3124,
    pricePerMin: 30,
    languages: ['Tamil', 'English'],
    status: 'online',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_152c415d9-1783117245559.png',
    consultations: 15620,
    badge: 'Expert',
    location: 'Chennai, India',
    education: 'Ph.D. in Jyotish, Tamil Nadu University',
    certifications: [
      'Nadi Astrology Master',
      'Tamil Astrology Expert',
      'Remedial Astrology Certified',
    ],
    about:
      'Jyotishi Meera Devi is a master of Nadi astrology with access to rare ancient palm leaf manuscripts. With 22 years of dedicated practice, she has helped over 15,000 clients find clarity and direction. Her expertise in Tamil astrology and powerful remedies has transformed countless lives. She is known for her compassionate approach and highly accurate readings.',
    expertise: [
      { name: 'Nadi Astrology', level: 99 },
      { name: 'Tamil Astrology', level: 97 },
      { name: 'Remedial Astrology', level: 94 },
      { name: 'Palm Leaf Reading', level: 96 },
      { name: 'Marriage Compatibility', level: 90 },
      { name: 'Health Astrology', level: 87 },
    ],

    reviewsList: [
      {
        name: 'Kavitha Nair',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_17f62d275-1765106881422.png',
        rating: 5,
        date: '3 days ago',
        comment:
          'Meera Devi is truly gifted. Her Nadi reading revealed things about my past that no one could have known. The remedies she suggested have brought peace to my family.',
        helpful: 61,
      },
      {
        name: 'Suresh Pillai',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_161275a24-1767210617391.png',
        rating: 5,
        date: '1 week ago',
        comment:
          'Exceptional knowledge of Tamil astrology. She predicted my promotion timing accurately. Her remedies are practical and easy to follow. Truly blessed to have found her.',
        helpful: 44,
      },
      {
        name: 'Anitha Krishnan',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1288b2af6-1766324190334.png',
        rating: 4,
        date: '2 weeks ago',
        comment:
          'Very detailed and accurate reading. She explained the planetary positions clearly and the remedies are working well. Highly recommend for health-related queries.',
        helpful: 33,
      },
      {
        name: 'Murali Rajan',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1eeec489e-1778447165266.png',
        rating: 5,
        date: '1 month ago',
        comment:
          'Outstanding consultation. Her knowledge of ancient texts is remarkable. She identified my career obstacles and the remedies she gave have shown results within weeks.',
        helpful: 57,
      },
    ],
  },
  'ast-005': {
    id: 'ast-005',
    name: 'Pandit Suresh Iyer',
    specialty: ['Vedic', 'Muhurtham', 'Panchang'],
    experience: 25,
    rating: 4.9,
    reviews: 4210,
    pricePerMin: 35,
    languages: ['Tamil', 'Telugu', 'English'],
    status: 'online',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1a67f10f0-1767013801785.png',
    consultations: 22100,
    badge: 'Grand Master',
    location: 'Tirupati, India',
    education: 'Vedic Jyotish Acharya, Rashtriya Sanskrit Vidyapeetha',
    certifications: ['Grand Master Vedic Astrologer', 'Muhurtham Specialist', 'Panchang Expert'],
    about:
      "Pandit Suresh Iyer is a Vedic astrology grandmaster with 25 years of unparalleled experience. Renowned for his expertise in Muhurtham (auspicious timing) and Panchang calculations, he has guided over 22,000 clients in making life's most important decisions at the right time. His deep understanding of planetary cycles and their impact on human life makes him the most consulted astrologer on the platform.",
    expertise: [
      { name: 'Vedic Astrology', level: 99 },
      { name: 'Muhurtham', level: 99 },
      { name: 'Panchang', level: 98 },
      { name: 'Marriage Timing', level: 96 },
      { name: 'Business Muhurtham', level: 94 },
      { name: 'Electional Astrology', level: 92 },
    ],

    reviewsList: [
      {
        name: 'Venkat Rao',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_140612fcc-1782372061262.png',
        rating: 5,
        date: '1 day ago',
        comment:
          'Pandit Iyer is simply the best. His Muhurtham for our wedding was perfect and everything went smoothly. His knowledge of Panchang is extraordinary. Blessed to have his guidance.',
        helpful: 78,
      },
      {
        name: 'Lakshmi Devi',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d3885eb8-1777028192064.png',
        rating: 5,
        date: '5 days ago',
        comment:
          'Consulted for business opening Muhurtham. The timing he suggested was auspicious and our business has been thriving since. His predictions about the first year were 100% accurate.',
        helpful: 65,
      },
      {
        name: 'Karthik Subramanian',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_13ded3a28-1767975323802.png',
        rating: 5,
        date: '2 weeks ago',
        comment:
          'Exceptional grandmaster. His reading of my birth chart revealed deep insights about my life path. The remedies are powerful yet simple. Truly a gem of Vedic astrology.',
        helpful: 59,
      },
      {
        name: 'Padma Krishnan',
        avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1288b2af6-1766324190334.png',
        rating: 4,
        date: '3 weeks ago',
        comment:
          'Very thorough and patient consultation. He explained every aspect of my chart in detail. His Muhurtham calculations are precise and backed by deep scriptural knowledge.',
        helpful: 41,
      },
    ],
  },
};

export default function AstrologerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  const [dbAstrologer, setDbAstrologer] = useState<any>(null);
  const { user, userData } = useUserData();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchAstrologer = async () => {
      try {
        const docRef = doc(db, 'astrologers', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDbAstrologer({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching astrologer:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAstrologer();
  }, [id]);

  const fallbackData = astrologersData[id] || astrologersData['ast-001'];

  const astrologer = React.useMemo(() => {
    if (!dbAstrologer) return fallbackData;
    const certs = Array.isArray(dbAstrologer.certifications)
      ? dbAstrologer.certifications
      : dbAstrologer.certifications
      ? dbAstrologer.certifications.split(',').map((c: string) => c.trim())
      : fallbackData.certifications;

    const skillsList = dbAstrologer.skills
      ? dbAstrologer.skills.split(',').map((s: string) => s.trim())
      : fallbackData.specialty;

    // Generate dynamic expertise bars based on skills
    const dynamicExpertise = skillsList.map((skill: string, idx: number) => ({
      name: skill,
      level: Math.max(80, 98 - idx * 3),
    }));

    return {
      ...fallbackData,
      name: dbAstrologer.name || fallbackData.name,
      location: dbAstrologer.city || dbAstrologer.location || fallbackData.location,
      experience: Number(dbAstrologer.experienceYears || dbAstrologer.experience) || fallbackData.experience,
      rating: Number(dbAstrologer.rating) || fallbackData.rating,
      reviews: Number(dbAstrologer.reviewsCount || dbAstrologer.reviews) || fallbackData.reviews,
      pricePerMin: Number(dbAstrologer.amount) || fallbackData.pricePerMin,
      specialty: skillsList,
      image: dbAstrologer.profileImageUrl || dbAstrologer.avatar || fallbackData.image,
      consultations: Number(dbAstrologer.consultations) || fallbackData.consultations,
      badge: dbAstrologer.badge !== undefined ? dbAstrologer.badge : fallbackData.badge,
      about: dbAstrologer.bio || dbAstrologer.about || fallbackData.about,
      education: dbAstrologer.education || fallbackData.education,
      certifications: certs,
      languages: dbAstrologer.languages
        ? dbAstrologer.languages.split(',').map((s: string) => s.trim())
        : fallbackData.languages,
      expertise: dynamicExpertise.length > 0 ? dynamicExpertise : fallbackData.expertise,
      reviewsList: Array.isArray(dbAstrologer.reviewsList) && dbAstrologer.reviewsList.length > 0
        ? dbAstrologer.reviewsList
        : fallbackData.reviewsList,
    };
  }, [dbAstrologer, fallbackData]);

  const { currencyCode, currencySymbol, formatPrice, convertPrice } = useCurrency();
  const [consultationType, setConsultationType] = useState<'video' | 'call'>('video');
  const [duration, setDuration] = useState(15);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  const [isBooking, setIsBooking] = useState(false);

  const hourlyRate = astrologer.pricePerMin * 60;
  const totalCost = astrologer.pricePerMin * duration;

  const handleBook = async () => {
    if (!user || !userData) {
      toast.error('Please log in to start a live consultation');
      router.push(`/sign-up-login-screen?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const currentBalance = userData.walletBalance || 0;
    const minRequired = astrologer.pricePerMin * 5;

    if (currentBalance < minRequired) {
      toast.error(`Minimum wallet balance of ${formatPrice(minRequired)} (5 mins) required.`);
      router.push(`/wallet?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (currentBalance < totalCost) {
      toast.error(`Insufficient wallet balance for ${duration} min consultation. Please recharge.`);
      router.push(`/wallet?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsBooking(true);
    
    try {
      const roomID = `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      await updateDoc(doc(db, 'users', user.uid), {
        walletBalance: increment(-totalCost)
      });

      await addDoc(collection(db, 'consultations'), {
        astrologerId: astrologer.id,
        astrologerName: astrologer.name,
        customerId: user.uid,
        customerName: user.displayName || user.email || 'Client',
        customerPhone: user.phoneNumber || userData?.phone || '',
        roomID,
        type: consultationType,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
        duration,
        price: astrologer.pricePerMin,
        totalAmount: totalCost,
        createdAt: serverTimestamp(),
      });
      
      toast.success(`Starting Live ${consultationType === 'video' ? 'Video' : 'Voice'} Call with ${astrologer.name}!`);
      router.push(`/call/${roomID}`);
    } catch (error) {
      console.error('Error starting live call:', error);
      toast.error('Failed to start consultation. Please try again.');
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="w-10 h-10 border-4 border-muted border-t-[#C9952B] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Back Navigation */}
      <div className="bg-card border-b border-border px-6 lg:px-10 py-4 mt-16 lg:mt-20">
        <div className="max-w-screen-xl mx-auto">
          <Link
            href="/talk-to-astrologer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#C9952B] transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Astrologers
          </Link>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column — Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-border p-6"
            >
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="relative flex-shrink-0">
                  <AppImage
                    src={astrologer.image}
                    alt={`${astrologer.name} - expert astrologer specializing in ${astrologer.specialty[0]}`}
                    width={120}
                    height={120}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover"
                  />

                  <div
                    className={`absolute -bottom-1.5 -right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${astrologer.status === 'online' ? 'bg-green-500/20 border-green-500/40 text-green-400' : astrologer.status === 'busy' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-gray-500/20 border-gray-500/40 text-gray-400'}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${astrologer.status === 'online' ? 'bg-green-400 animate-pulse' : astrologer.status === 'busy' ? 'bg-amber-400' : 'bg-gray-400'}`}
                    />
                    {astrologer.status === 'online'
                      ? 'Online'
                      : astrologer.status === 'busy'
                        ? 'Busy'
                        : 'Offline'}
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
                    {astrologer.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold gold-gradient-bg text-white">
                        {astrologer.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {astrologer.specialty.map((s: string) => (
                      <span
                        key={s}
                        className="text-xs px-2.5 py-1 rounded-full bg-[#EDE4D5] text-[#713B32] font-semibold border border-[#E5D9C8]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} fill="currentColor" className="text-[#C9952B]" />
                      <span className="font-bold text-foreground">{astrologer.rating}</span>
                      <span className="text-muted-foreground">
                        ({astrologer.reviews.toLocaleString()} reviews)
                      </span>
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
                  <div className="text-xl font-bold text-[#C9952B]">
                    {(astrologer.consultations / 1000).toFixed(1)}K+
                  </div>
                  <div className="text-xs text-muted-foreground">Consultations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#C9952B]">{astrologer.rating}</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="flex border-b border-border">
                {(['about', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'text-[#C9952B] border-b-2 border-[#C9952B]' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab === 'reviews'
                      ? `Reviews (${astrologer.reviews.toLocaleString()})`
                      : 'About & Expertise'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">About</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {astrologer.about}
                      </p>
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
                        {astrologer.certifications.map((cert: string) => (
                          <div
                            key={cert}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-600 dark:text-green-400"
                          >
                            <Shield size={11} />
                            {cert}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {astrologer.languages.map((lang: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded bg-secondary/5 text-secondary font-medium"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expertise Bars */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Areas of Expertise</h3>
                      <div className="space-y-3">
                        {astrologer.expertise.map((exp: { name: string; level: number }) => (
                          <div key={exp.name}>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span className="text-foreground">{exp.name}</span>
                              <span className="text-[#C9952B]">{exp.level}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${exp.level}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full rounded-full gold-gradient-bg"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Rating Overview */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-foreground">
                          {astrologer.rating}
                        </div>
                        <div className="flex items-center gap-0.5 justify-center mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              fill="currentColor"
                              className="text-[#C9952B]"
                            />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {astrologer.reviews.toLocaleString()} ratings
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[
                          { star: 5, pct: 85 },
                          { star: 4, pct: 10 },
                          { star: 3, pct: 3 },
                          { star: 2, pct: 1 },
                          { star: 1, pct: 1 },
                        ].map(({ star, pct }) => (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground w-3">{star}</span>
                            <Star size={9} fill="currentColor" className="text-[#C9952B]" />
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full gold-gradient-bg"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground w-6 text-right">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reviews List */}
                    {astrologer.reviewsList.map((review: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl border border-border bg-card"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <AppImage
                            src={review.avatar}
                            alt={`${review.name} review`}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-foreground">
                                {review.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={10}
                                  fill={s <= review.rating ? 'currentColor' : 'none'}
                                  className="text-[#C9952B]"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                        <button className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-[#C9952B] transition-colors">
                          <ThumbsUp size={11} />
                          Helpful ({review.helpful})
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column — Instant Live Consultation (Self-contained sticky sidebar) */}
          <div className="lg:col-span-1 space-y-6 sticky top-24 self-start">
            {/* Live Consultation Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#FFFDF9] dark:bg-[#1E1714] rounded-3xl border-2 border-[#E8DCB9] dark:border-[#B88A44]/40 p-5 lg:p-6 shadow-2xl space-y-0"
            >
              {/* Status Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8DCB9] dark:border-[#3D2C24]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    Online • Instant Connect
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#713B32]/10 dark:bg-[#C9952B]/20 border border-[#713B32]/20 dark:border-[#C9952B]/30">
                  <Globe size={11} className="text-[#713B32] dark:text-[#E6CA65]" />
                  <span className="text-[11px] font-bold text-[#713B32] dark:text-[#E6CA65]">
                    {currencyCode} ({currencySymbol})
                  </span>
                </div>
              </div>

              {/* Live Rate Display (Vivid, High-Contrast & Clear) */}
              <div className="p-4 rounded-2xl bg-[#F8F4EC] dark:bg-[#2A1F1B] border-2 border-[#E5D9C8] dark:border-[#4D382D] mb-5">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#713B32] dark:text-[#F6D075] tabular-nums tracking-tight">
                      {formatPrice(astrologer.pricePerMin)}
                    </span>
                    <span className="text-sm font-bold text-[#8C5D53] dark:text-[#D1A056]">/min</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700 shadow-xs">
                    <Zap size={12} className="fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
                    0 Min Wait Time
                  </span>
                </div>
                <p className="text-xs font-bold text-[#5A483E] dark:text-[#D8C7B8] mt-2.5 leading-relaxed">
                  Start instant 1-on-1 private live consultation with {astrologer.name}.
                </p>
              </div>

              {/* Consultation Type Selector */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-black text-[#5A483E] dark:text-[#D8C7B8] uppercase tracking-wider">
                    Select Consultation Mode
                  </p>
                  <span className="text-[10px] text-[#713B32] dark:text-[#E6CA65] font-extrabold bg-[#713B32]/10 dark:bg-[#E6CA65]/10 px-2 py-0.5 rounded-full">
                    100% Private
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('video')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      consultationType === 'video'
                        ? 'border-[#C9952B] bg-[#FFF8EB] dark:bg-[#38261E] text-[#713B32] dark:text-[#F6D075] shadow-md shadow-[#C9952B]/20'
                        : 'border-[#E5D9C8] dark:border-[#3D2C24] bg-white dark:bg-[#221815] text-[#5A483E] dark:text-[#C5B3A3] hover:border-[#C9952B]/60 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${consultationType === 'video' ? 'bg-[#713B32] text-[#F6D075] shadow-sm' : 'bg-[#EDE4D5] dark:bg-[#3D2C24] text-[#713B32] dark:text-[#E6CA65]'}`}>
                      <Video size={18} />
                    </div>
                    <span className="font-extrabold text-sm text-[#292522] dark:text-white">Live Video Call</span>
                    <span className="text-[11px] font-bold text-[#8C5D53] dark:text-[#D1A056] mt-0.5">Face-to-Face HD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('call')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      consultationType === 'call'
                        ? 'border-[#C9952B] bg-[#FFF8EB] dark:bg-[#38261E] text-[#713B32] dark:text-[#F6D075] shadow-md shadow-[#C9952B]/20'
                        : 'border-[#E5D9C8] dark:border-[#3D2C24] bg-white dark:bg-[#221815] text-[#5A483E] dark:text-[#C5B3A3] hover:border-[#C9952B]/60 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${consultationType === 'call' ? 'bg-[#713B32] text-[#F6D075] shadow-sm' : 'bg-[#EDE4D5] dark:bg-[#3D2C24] text-[#713B32] dark:text-[#E6CA65]'}`}>
                      <Phone size={18} />
                    </div>
                    <span className="font-extrabold text-sm text-[#292522] dark:text-white">Live Voice Call</span>
                    <span className="text-[11px] font-bold text-[#8C5D53] dark:text-[#D1A056] mt-0.5">Direct Voice Line</span>
                  </button>
                </div>
              </div>

              {/* Session Duration Selector */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-black text-[#5A483E] dark:text-[#D8C7B8] uppercase tracking-wider">
                    Select Initial Duration
                  </p>
                  <span className="text-[11px] font-bold text-[#8C5D53] dark:text-[#D1A056]">
                    Extendable during call
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 15, 30, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                        duration === d
                          ? 'border-[#C9952B] bg-[#FFF8EB] dark:bg-[#38261E] text-[#713B32] dark:text-[#F6D075] shadow-sm'
                          : 'border-[#E5D9C8] dark:border-[#3D2C24] bg-white dark:bg-[#221815] text-[#5A483E] dark:text-[#C5B3A3] hover:border-[#C9952B]/60'
                      }`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Calculation & Wallet Status */}
              <div className="space-y-3 mb-5">
                <div className="p-3.5 rounded-xl bg-[#F8F4EC] dark:bg-[#2A1F1B] border border-[#E5D9C8] dark:border-[#3D2C24]">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#5A483E] dark:text-[#D8C7B8]">
                      {duration} mins × {formatPrice(astrologer.pricePerMin)}/min
                    </span>
                    <span className="font-black text-[#713B32] dark:text-[#F6D075] text-sm sm:text-base tabular-nums">
                      {formatPrice(totalCost)}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E5D9C8] dark:border-[#3D2C24] flex items-center justify-between bg-white dark:bg-[#221815] shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">👛</span>
                    <div>
                      <p className="text-[10px] text-[#8C5D53] dark:text-[#D1A056] font-black uppercase tracking-wider">
                        Your Wallet Balance
                      </p>
                      <p className={`text-sm font-black tabular-nums ${(userData?.walletBalance || 0) >= totalCost ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatPrice(userData?.walletBalance || 0)}
                      </p>
                    </div>
                  </div>
                  {(userData?.walletBalance || 0) < totalCost ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/wallet?redirect=${encodeURIComponent(window.location.pathname)}`)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-black border border-rose-200 dark:border-rose-800 hover:bg-rose-200 transition-colors cursor-pointer"
                    >
                      + Recharge
                    </button>
                  ) : (
                    <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                      ✓ Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Live Call Action Button */}
              {(userData?.walletBalance || 0) < totalCost ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/wallet?redirect=${encodeURIComponent(window.location.pathname)}`)}
                    className="w-full py-4 rounded-2xl font-black text-sm gold-gradient-bg text-[#292522] hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#C9952B]/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap size={16} /> Recharge Wallet ({formatPrice(totalCost - (userData?.walletBalance || 0))} Needed)
                  </button>
                  <p className="text-[11px] text-center font-bold text-[#7C6A5E] dark:text-[#BAA797]">
                    Instant recharge via UPI / GooglePay / Cards / NetBanking
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBook}
                  disabled={isBooking || astrologer.status === 'offline'}
                  className="w-full py-4 rounded-2xl font-black text-sm gold-gradient-bg text-[#292522] hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#C9952B]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer animate-pulse-gold"
                >
                  {isBooking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#292522]/30 border-t-[#292522] rounded-full animate-spin" />
                      Connecting to Live Call...
                    </>
                  ) : (
                    <>
                      {consultationType === 'video' ? <Video size={18} /> : <Phone size={18} />}
                      <span>
                        Start Live {consultationType === 'video' ? 'Video Call' : 'Voice Call'} Now
                      </span>
                    </>
                  )}
                </button>
              )}

              {/* Trust & Live Highlights */}
              <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-[#E8DCB9] dark:border-[#3D2C24]">
                {[
                  { icon: Shield, text: '100% Private & Secure' },
                  { icon: Check, text: 'Verified Jyotish Master' },
                  { icon: Zap, text: 'Instant Connection' },
                  { icon: Award, text: 'Fair Per-Min Billing' },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-[#5A483E] dark:text-[#D8C7B8]"
                  >
                    <Icon size={12} className="text-[#713B32] dark:text-[#F6D075] flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#FFFDF9] dark:bg-[#1E1714] rounded-3xl border border-[#E8DCB9] dark:border-[#3D2C24] p-5 shadow-md"
            >
              <h3 className="font-bold text-[#292522] dark:text-white mb-3.5 text-sm">
                Why Consult with {astrologer.name.split(' ')[0]}?
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Award, text: `${astrologer.experience}+ years of dedicated practice` },
                  {
                    icon: Star,
                    text: `${astrologer.rating}/5 rating from ${astrologer.reviews.toLocaleString()} clients`,
                  },
                  {
                    icon: MessageCircle,
                    text: `${astrologer.consultations.toLocaleString()}+ successful consultations`,
                  },
                  { icon: Globe, text: `Speaks ${astrologer.languages.join(', ')}` },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#F8F4EC] dark:bg-[#2A1F1B] border border-[#E5D9C8] dark:border-[#3D2C24] flex items-center justify-center flex-shrink-0 text-[#713B32] dark:text-[#F6D075]">
                      <Icon size={13} />
                    </div>
                    <p className="text-xs font-medium text-[#5A483E] dark:text-[#D8C7B8] leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
