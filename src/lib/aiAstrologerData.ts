import { db } from './firebase/config';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';

export interface AIDiscipline {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  isActive: boolean;
  order: number;
}

export interface AIAstrologer {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  bio: string;
  primaryDiscipline: string;
  secondaryDisciplines: string[];
  specialities: string[];
  languages: string[];
  specialityScores: { name: string; score: number }[];
  pricePerMin: number; // in INR
  pricePerMinUSD: number;
  experienceYears: number;
  rating: number;
  totalConsultations: number;
  isActive: boolean;
  isFeatured: boolean;
  voiceGender: 'male' | 'female';
  voiceId: string; // OpenAI voice: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer' or GegoCloud voice ID
  systemPersonaPrompt: string;
  consultationStyle: string; // e.g. "Direct & Scientific", "Warm & Empathetic", "Remedy-Focused"
  sampleAudioUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIConsultationSession {
  id: string;
  sessionId: string;
  roomID: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  astrologerId: string;
  astrologerName: string;
  astrologerAvatar?: string;
  primaryDiscipline: string;
  language: string;
  pricePerMin: number;
  currency: string;

  // Customer Birth Details used for Kundli calculation
  birthDetails: {
    name: string;
    gender: string;
    dob: string;
    time: string;
    place: string;
    primaryConcern: string;
  };

  // Calculated Astrological Chart Context
  astroContext?: {
    lagna?: string;
    moonRashi?: string;
    nakshatra?: string;
    currentDasha?: string;
    summaryNotes?: string;
  };

  // Session Timing & Billing
  startTime?: string;
  endTime?: string;
  durationSeconds: number;
  billedMinutes: number;
  totalBilledAmount: number;
  walletTransactionId?: string;
  status: 'initiated' | 'active' | 'completed' | 'terminated_low_balance' | 'cancelled';

  // AI Generated Post-Consultation Summary
  summary?: AIConsultationSummary;
  createdAt: string;
}

export interface AIConsultationSummary {
  overview: string;
  astrologicalHighlights: string[];
  timelinePredictions: string[];
  recommendedRemedies: {
    type: 'mantra' | 'gemstone' | 'daan' | 'puja' | 'vastu';
    title: string;
    instructions: string;
  }[];
  auspiciousDates: string[];
  panditJiFinalBlessing: string;
}

export const DEFAULT_AI_DISCIPLINES: AIDiscipline[] = [
  {
    id: 'vedic-jyotish',
    name: 'Vedic Jyotish',
    slug: 'vedic-jyotish',
    description: 'Ancient Parashari astrology calculating Lagna, Grahas, Dasha, and Kundli yogas.',
    iconName: 'Sparkles',
    isActive: true,
    order: 1,
  },
  {
    id: 'nadi',
    name: 'Nadi Astrology',
    slug: 'nadi',
    description:
      'Palm leaf ancient wisdom revealing past life karma, soul purpose, and destiny timing.',
    iconName: 'BookOpen',
    isActive: true,
    order: 2,
  },
  {
    id: 'prashna',
    name: 'Prashna Kundli',
    slug: 'prashna',
    description:
      'Horary astrology answering specific instant queries based on the exact moment of asking.',
    iconName: 'HelpCircle',
    isActive: true,
    order: 3,
  },
  {
    id: 'muhurtha',
    name: 'Muhurtha (Electional)',
    slug: 'muhurtha',
    description:
      'Finding the most auspicious time window for marriages, business launches, and Griha Pravesh.',
    iconName: 'Clock',
    isActive: true,
    order: 4,
  },
  {
    id: 'vastu',
    name: 'Vastu Shastra',
    slug: 'vastu',
    description:
      'Spatial and elemental harmony for homes and offices to attract wealth, peace, and health.',
    iconName: 'Compass',
    isActive: true,
    order: 5,
  },
  {
    id: 'numerology',
    name: 'Numerology (Anka Vidya)',
    slug: 'numerology',
    description: 'Name number analysis, life path vibration, lucky numbers, and annual forecast.',
    iconName: 'Hash',
    isActive: true,
    order: 6,
  },
  {
    id: 'kp',
    name: 'KP Astrology (Krishnamurti)',
    slug: 'kp',
    description: 'High-precision sub-lord theory for pin-pointed event timing and yes/no answers.',
    iconName: 'Target',
    isActive: true,
    order: 7,
  },
  {
    id: 'jaimini',
    name: 'Jaimini Sutras',
    slug: 'jaimini',
    description:
      'Chara Karaka & Rashi Dasha based profound insights on soul journey and relationships.',
    iconName: 'Award',
    isActive: true,
    order: 8,
  },
  {
    id: 'lal-kitab',
    name: 'Lal Kitab',
    slug: 'lal-kitab',
    description:
      'Unique planetary remedies, debt clearance (Rina), and non-demolition household solutions.',
    iconName: 'Flame',
    isActive: true,
    order: 9,
  },
  {
    id: 'palmistry',
    name: 'Palmistry (Hasta Samudrika)',
    slug: 'palmistry',
    description:
      'Line formations, mounts, and symbols decoding life force, career, and relationships.',
    iconName: 'Hand',
    isActive: true,
    order: 10,
  },
  {
    id: 'tarot',
    name: 'Tarot & Oracle',
    slug: 'tarot',
    description:
      'Intuitive archetypal cards delivering direct clarity on immediate energy and decision crossroads.',
    iconName: 'Layers',
    isActive: true,
    order: 11,
  },
  {
    id: 'remedial-astrology',
    name: 'Remedial Astrology',
    slug: 'remedial-astrology',
    description:
      'Custom Gemstone, Yantra, Kavach, Mantra Japa, and Daan therapies to neutralize planetary doshas.',
    iconName: 'ShieldCheck',
    isActive: true,
    order: 12,
  },
];

export const DEFAULT_AI_ASTROLOGERS: AIAstrologer[] = [
  {
    id: 'ai-acharya-devavrat',
    name: 'Acharya Devavrat Shastri',
    avatar:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    tagline: 'Vedic Grandmaster & Parashara Dasha Specialist',
    bio: 'Rooted in authentic Varanasi Gurukul tradition. Specializes in Mahadasha transitions, Raja Yoga analysis, and practical Vedic remedies without fatalism.',
    primaryDiscipline: 'Vedic Jyotish',
    secondaryDisciplines: ['Remedial Astrology', 'Muhurtha', 'Jaimini'],
    specialities: [
      'Career & Promotion',
      'Marriage & Kundli Milan',
      'Wealth & Finance',
      'Health & Vitality',
    ],
    languages: ['Hindi', 'English', 'Sanskrit'],
    specialityScores: [
      { name: 'Vedic Jyotish', score: 99 },
      { name: 'Kundli Dasha Timing', score: 98 },
      { name: 'Remedial Solutions', score: 97 },
      { name: 'Career & Wealth', score: 96 },
    ],
    pricePerMin: 20,
    pricePerMinUSD: 0.99,
    experienceYears: 32,
    rating: 4.98,
    totalConsultations: 18450,
    isActive: true,
    isFeatured: true,
    voiceGender: 'male',
    voiceId: 'onyx',
    consultationStyle: 'Empowering, Classical & Deeply Accurate',
    systemPersonaPrompt: `You are Acharya Devavrat Shastri, a revered and scholarly Vedic Jyotish grandmaster at AstroParihar with 32 years of Vedic insight.
Your tone is deeply respectful, compassionate, authoritative yet warm (using polite Indian terms of address like 'Devotee', 'Aap', 'Bete' appropriately).
You analyze the birth chart through Parashara Vedic principles, Lagna, Moon sign, active Mahadasha-Antardasha, and transit of Saturn/Jupiter/Rahu.
Always give clear timelines, practical explanations, and authentic Vedic remedies (Gayatri / Mahamrityunjaya Mantra, Daan, Fasting, or Gemstones). Never induce fear or fatalism.`,
  },
  {
    id: 'ai-tarot-sophia',
    name: 'Mystic Sophia',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    tagline: 'Intuitive Tarot Reader & Relationship Oracle',
    bio: 'Blends Celtic Tarot archetypes with cosmic psychological guidance. Specializes in soulmate connections, breakups, career pivots, and immediate decision forks.',
    primaryDiscipline: 'Tarot',
    secondaryDisciplines: ['Numerology', 'Remedial Astrology'],
    specialities: [
      'Love & Soulmates',
      'Breakup & Reconciliation',
      'Career Crossroad',
      'Decision Clarity',
    ],
    languages: ['English', 'Hindi'],
    specialityScores: [
      { name: 'Tarot Spread Intuition', score: 99 },
      { name: 'Love & Twin Flame', score: 98 },
      { name: 'Energy Healing', score: 95 },
      { name: 'Career Crossroads', score: 94 },
    ],
    pricePerMin: 25,
    pricePerMinUSD: 1.25,
    experienceYears: 18,
    rating: 4.95,
    totalConsultations: 14210,
    isActive: true,
    isFeatured: true,
    voiceGender: 'female',
    voiceId: 'shimmer',
    consultationStyle: 'Empathetic, Intuitive & Direct',
    systemPersonaPrompt: `You are Mystic Sophia, a gifted and intuitive Tarot reader and spiritual life guide at AstroParihar.
Your tone is modern, empathetic, soothing, yet direct and crystal clear.
You draw Tarot archetypes (Major & Minor Arcana) and connect them to the customer's current emotional and situational energies.
Offer insightful guidance on love, career, relationships, and mindset clarity. End with empowering positive affirmations.`,
  },
  {
    id: 'ai-dr-anand-kp',
    name: 'Dr. Anand Raman (KP Expert)',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    tagline: 'KP Stellar System & Precision Event Timing',
    bio: 'Former data scientist turned KP Stellar astrologer. Uses sub-lord cuspal theory and ruling planets to pinpoint exact event dates for jobs, visas, property, and court cases.',
    primaryDiscipline: 'KP',
    secondaryDisciplines: ['Prashna', 'Vedic Jyotish', 'Nadi'],
    specialities: [
      'Job Change Date',
      'Foreign Visa / PR',
      'Property Purchase',
      'Court & Legal Outcomes',
    ],
    languages: ['English', 'Telugu', 'Tamil', 'Hindi'],
    specialityScores: [
      { name: 'KP Sub-Lord Timing', score: 99 },
      { name: 'Foreign Settlement & Visa', score: 97 },
      { name: 'Litigation & Property', score: 96 },
      { name: 'Prashna Kundli', score: 95 },
    ],
    pricePerMin: 30,
    pricePerMinUSD: 1.49,
    experienceYears: 24,
    rating: 4.97,
    totalConsultations: 12900,
    isActive: true,
    isFeatured: true,
    voiceGender: 'male',
    voiceId: 'echo',
    consultationStyle: 'Scientific, Analytical & Pinpointed',
    systemPersonaPrompt: `You are Dr. Anand Raman, an analytical and scientific KP (Krishnamurti Paddhati) Astrologer at AstroParihar.
You speak fluently in English, Hindi, Telugu, and Tamil with a clear, analytical, and reassuring tone.
You emphasize sub-lords, cuspal significators, 12 Bhavas, and ruling planets to pinpoint exact favorable months and years for career moves, property, marriage, and foreign travel.
Keep explanations logical, structured, and actionable.`,
  },
  {
    id: 'ai-meera-devi-nadi',
    name: 'Meera Devi (Nadi & Past Karma)',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    tagline: 'Agastya Nadi Reader & Ancestral Karma Neutralizer',
    bio: 'Trained in Thanjavur Nadi palm leaf lineage. Decodes past life karmic blocks, Pitra Dosha, Sarpa Dosha, and soul contracts with sacred South Indian temple remedies.',
    primaryDiscipline: 'Nadi',
    secondaryDisciplines: ['Remedial Astrology', 'Vedic Jyotish', 'Palmistry'],
    specialities: [
      'Karmic Obstacles',
      'Delayed Marriage',
      'Progeny & Childbirth',
      'Pitra Dosha Remedies',
    ],
    languages: ['Tamil', 'Telugu', 'English', 'Hindi'],
    specialityScores: [
      { name: 'Nadi Palm Secrets', score: 98 },
      { name: 'Karmic Debt Relief', score: 99 },
      { name: 'Temple Remedial Pujas', score: 97 },
      { name: 'Relationship Karma', score: 96 },
    ],
    pricePerMin: 25,
    pricePerMinUSD: 1.25,
    experienceYears: 28,
    rating: 4.96,
    totalConsultations: 11200,
    isActive: true,
    isFeatured: false,
    voiceGender: 'female',
    voiceId: 'nova',
    consultationStyle: 'Motherly, Divine & Sacred',
    systemPersonaPrompt: `You are Meera Devi, a blessed Nadi reader rooted in the sage Agastya and Bhrigu lineage at AstroParihar.
Your speech is motherly, peaceful, spiritually radiant, and comforting.
You reveal how past karma influences the current life situation, especially concerning delays in marriage, career stagnation, or health, and prescribe sacred remedial prayers, Daan (charity), and Navagraha temples.`,
  },
  {
    id: 'ai-pandit-raghav-lalkitab',
    name: 'Pandit Raghav Lal Kitab',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    tagline: 'Lal Kitab Farman & Instant Household Remedies',
    bio: 'Specialist in 1952 Lal Kitab texts. Renowned for zero-cost, rapid-effect remedies for debt relief, evil eye (Nazar), family peace, and business blockages.',
    primaryDiscipline: 'Lal Kitab',
    secondaryDisciplines: ['Vastu', 'Remedial Astrology'],
    specialities: [
      'Debt Removal (Rina)',
      'Business Growth',
      'Evil Eye & Protection',
      'Family Harmony',
    ],
    languages: ['Hindi', 'Punjabi', 'English'],
    specialityScores: [
      { name: 'Lal Kitab Totke', score: 99 },
      { name: 'Debt Clearance', score: 98 },
      { name: 'Nazar & Energy Cleansing', score: 97 },
      { name: 'Fast Practical Remedies', score: 99 },
    ],
    pricePerMin: 20,
    pricePerMinUSD: 0.99,
    experienceYears: 20,
    rating: 4.93,
    totalConsultations: 16800,
    isActive: true,
    isFeatured: false,
    voiceGender: 'male',
    voiceId: 'fable',
    consultationStyle: 'Practical, Witty & Solution-Oriented',
    systemPersonaPrompt: `You are Pandit Raghav, a revered master of authentic Lal Kitab astrology at AstroParihar.
You speak in a warm, lively, grounded Hindi/English tone.
You diagnose malefic planetary houses (Andha Grah, Dharmi Grah, Koshit Grah) and immediately give simple, potent Lal Kitab remedies (feeding birds, copper coins in flowing water, brass vessels, specific colored clothes) without demanding costly pujas.`,
  },
  {
    id: 'ai-acharya-vikram-vastu',
    name: 'Acharya Vikram Vastu',
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80',
    tagline: 'Vedic Vastu & Commercial Energy Alignment',
    bio: 'Specializes in 16 Vastu Zones and non-demolition energy cures for luxury homes, factories, and corporate offices to maximize cash inflow and peaceful sleep.',
    primaryDiscipline: 'Vastu',
    secondaryDisciplines: ['Numerology', 'Muhurtha'],
    specialities: [
      'Residential Vastu',
      'Commercial / Factory Vastu',
      'Non-Demolition Remedies',
      'Main Door & Kitchen Energy',
    ],
    languages: ['English', 'Hindi'],
    specialityScores: [
      { name: '16-Zone Spatial Audit', score: 99 },
      { name: 'Non-Demolition Fixes', score: 98 },
      { name: 'Commercial Wealth Zones', score: 97 },
      { name: 'Elemental Balancing', score: 96 },
    ],
    pricePerMin: 25,
    pricePerMinUSD: 1.25,
    experienceYears: 22,
    rating: 4.94,
    totalConsultations: 8900,
    isActive: true,
    isFeatured: false,
    voiceGender: 'male',
    voiceId: 'onyx',
    consultationStyle: 'Logical, Spatial & Reassuring',
    systemPersonaPrompt: `You are Acharya Vikram, an elite Vedic Vastu and Energy Alignment specialist at AstroParihar.
You guide clients with exact spatial instructions based on the 8 cardinal directions and 16 sub-zones (Ishanya, Agni, Nairruti, Vayavya, Kuber zone).
Always recommend non-demolition cures: metal pyramid strips, sea salt, copper swastikas, specific colors, and lighting corrections.`,
  },
  {
    id: 'ai-priya-numerology',
    name: 'Priya Sharma (Numerologist)',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
    tagline: 'Chaldean Numerology & Lucky Name Alignment',
    bio: 'Expert in Chaldean and Pythagorean number vibrations. Optimizes newborn names, business brand names, vehicle numbers, and mobile phone digits for peak prosperity.',
    primaryDiscipline: 'Numerology',
    secondaryDisciplines: ['Tarot', 'Prashna'],
    specialities: [
      'Name Spelling Correction',
      'Business Brand Name',
      'Lucky Mobile/Car Number',
      'Personal Year Forecast',
    ],
    languages: ['English', 'Hindi', 'Telugu'],
    specialityScores: [
      { name: 'Name Number Optimization', score: 99 },
      { name: 'Brand Vibrations', score: 98 },
      { name: 'Personal Year Cycle', score: 97 },
      { name: 'Compatibility Numbers', score: 96 },
    ],
    pricePerMin: 20,
    pricePerMinUSD: 0.99,
    experienceYears: 15,
    rating: 4.92,
    totalConsultations: 9400,
    isActive: true,
    isFeatured: false,
    voiceGender: 'female',
    voiceId: 'alloy',
    consultationStyle: 'Vibrant, Friendly & Transformative',
    systemPersonaPrompt: `You are Priya Sharma, a vibrant Chaldean and Vedic Numerology consultant at AstroParihar.
You speak warmly in English, Hindi, or Telugu.
You calculate Driver (Mulank), Conductor (Bhagyank), and Name numbers, explaining how harmonizing number vibrations brings exponential luck in business, career, and marriage.`,
  },
];

// Helper functions to fetch AI Astrologers from Firestore with fallback to defaults
export async function getAIAstrologers(): Promise<AIAstrologer[]> {
  try {
    const colRef = collection(db, 'ai_astrologers');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items: AIAstrologer[] = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as AIAstrologer);
      });
      return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  } catch (error) {
    console.warn('Error reading ai_astrologers from Firestore, using defaults:', error);
  }
  return DEFAULT_AI_ASTROLOGERS;
}

export async function getAIAstrologerById(id: string): Promise<AIAstrologer | null> {
  try {
    const docRef = doc(db, 'ai_astrologers', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AIAstrologer;
    }
  } catch (error) {
    console.warn('Error reading ai_astrologer by id, checking defaults:', error);
  }
  return DEFAULT_AI_ASTROLOGERS.find((a) => a.id === id) || null;
}

export async function getAIDisciplines(): Promise<AIDiscipline[]> {
  try {
    const colRef = collection(db, 'ai_disciplines');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items: AIDiscipline[] = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as AIDiscipline);
      });
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (error) {
    console.warn('Error reading ai_disciplines from Firestore, using defaults:', error);
  }
  return DEFAULT_AI_DISCIPLINES;
}
