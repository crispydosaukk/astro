import { db } from './firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  iconColor: string;
  href: string;
  badge: string;
  image?: string;
  price?: number;
  priceUSD?: number;
}

export interface CoreServiceItem {
  id: string;
  title: string;
  desc: string;
  badge: string;
  color: string;
  iconColor: string;
  href: string;
}

export interface ComprehensiveServicesSection {
  tagline: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  items: CoreServiceItem[];
}

export interface HomepageContent {
  hero: {
    headline1: string;
    headline2: string;
    subtitle: string;
    primaryBtnText: string;
    secondaryBtnText: string;
    stats: { value: string; label: string }[];
  };
  services: {
    tagline: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    items: ServiceItem[];
  };
  comprehensiveServices: ComprehensiveServicesSection;
  panchang: {
    dateLabel: string;
    tithiValue: string;
    tithiSub: string;
    nakshatraValue: string;
    nakshatraSub: string;
    yogaValue: string;
    yogaSub: string;
    karanaValue: string;
    karanaSub: string;
    varaValue: string;
    varaSub: string;
    rahuKalamValue: string;
    rahuKalamSub: string;
    abhijitMuhurat?: string;
    sunrise?: string;
    sunset?: string;
  };
}

export const defaultHomepageContent: HomepageContent = {
  hero: {
    headline1: 'Discover Your',
    headline2: 'Cosmic Destiny',
    subtitle:
      'Ancient Vedic wisdom meets modern precision. Get your personalized Kundli, sacred gemstone & mantra recommendations, and consult expert astrologers — all in one platform.',
    primaryBtnText: '✦ Get Free Kundli',
    secondaryBtnText: 'Talk to Astrologer',
    stats: [
      { value: '2,50,000+', label: 'Happy Users' },
      { value: '500+', label: 'Expert Astrologers' },
      { value: '18,00,000+', label: 'Reports Generated' },
      { value: '42+', label: 'Countries' },
    ],
  },
  services: {
    tagline: 'Our Remedies',
    title: 'Ashta Digbandhana',
    titleHighlight: 'To Propel Growth',
    subtitle:
      'We stand for: Genuine help, Practical solutions, No fear-based astrology, Spiritual clarity, Long-term transformation.',
    items: [
      {
        id: 'svc-mantra',
        icon: 'Music',
        title: '1. Mantra Shakti (मन्त्र शक्ति)',
        description:
          'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥ Sacred mantras to purify mind, speech, & actions and protect all directions.',
        color: 'from-blue-500/15 to-cyan-500/10',
        iconColor: 'text-blue-400',
        href: '/remedies/mantra',
        badge: 'North (N)',
        price: 99,
        priceUSD: 1.99,
        image: '/assets/images/remedies/remedies_mantra_1785738410624.png',
      },
      {
        id: 'svc-yantra',
        icon: 'Triangle',
        title: '2. Yanthra (यन्त्र)',
        description:
          'ॐ श्रीं ह्रीं क्लीं नमः ॥ Sacred geometric Yantras for energy preservation, spatial stability, and victory.',
        color: 'from-green-500/15 to-emerald-500/10',
        iconColor: 'text-green-400',
        href: '/remedies/yantra',
        badge: 'North-East (NE)',
        price: 99,
        priceUSD: 1.99,
        image: '/assets/images/remedies/remedies_yantra_1785738431966.png',
      },
      {
        id: 'svc-homam',
        icon: 'Flame',
        title: '3. Homa (होम / हवन)',
        description:
          'ॐ अग्नये स्वाहा ॥ Sacred fire rituals to destroy negative energy, pacify planetary afflictions, and bring auspiciousness.',
        color: 'from-orange-500/15 to-red-500/10',
        iconColor: 'text-orange-400',
        href: '/remedies/homa',
        badge: 'East (E)',
        price: 99,
        priceUSD: 1.99,
        image: '/assets/images/remedies/remedies_homam_1785738443734.png',
      },
      {
        id: 'svc-ishta',
        icon: 'Heart',
        title: '4. Devata Upasana (देवता उपासना)',
        description:
          'ॐ नमः शिवाय ॥ Worship of personal Ishta Devata for ultimate spiritual protection and divine grace.',
        color: 'from-pink-500/15 to-rose-500/10',
        iconColor: 'text-pink-400',
        href: '/remedies/ishta-devata',
        badge: 'South-East (SE)',
        price: 99,
        priceUSD: 1.99,
        image: '/assets/images/remedies/remedies_ishta_1785738453810.png',
      },
      {
        id: 'svc-gemstone',
        icon: 'Gem',
        title: '5. Gemstones (रत्न)',
        description:
          'ॐ ग्रहहाय नमः ॥ Empower weak planets, restore life balance, and bring positive cosmic energy through sacred gems.',
        color: 'from-amber-500/15 to-yellow-500/10',
        iconColor: 'text-amber-400',
        href: '/remedies/gemstone',
        badge: 'South (S)',
        price: 99,
        priceUSD: 1.99,
        image: '/assets/images/remedies/remedies_gemstone_1785738400359.png',
      },
      {
        id: 'svc-rudraksha',
        icon: 'CircleDot',
        title: '6. Rudraksha (रुद्राक्ष)',
        description:
          'ॐ नमः शिवाय ॥ Pure Mukhi Rudraksha to pacify planetary doshas, stabilize the mind, and amplify spiritual power.',
        color: 'from-orange-500/15 to-yellow-500/10',
        iconColor: 'text-orange-400',
        href: '/remedies/rudraksha',
        badge: 'South-West (SW)',
        price: 99,
        priceUSD: 1.99,
        image: '/assets/images/remedies/remedies_rudraksha.png',
      },
      {
        id: 'svc-vastu',
        icon: 'Compass',
        title: '7. Vasthu (वास्तु)',
        description:
          'ॐ वास्तुपुरुषाय नमः ॥ Directional Vastu balancing to enhance harmony, prosperity, and peace at home & workplace.',
        color: 'from-teal-500/15 to-cyan-500/10',
        iconColor: 'text-teal-400',
        href: '/remedies/vastu',
        badge: 'West (W)',
        price: 99,
        priceUSD: 1.99,
        image: '/assets/images/remedies/remedies_vastu_1785738485180.png',
      },
      {
        id: 'svc-charity',
        icon: 'Heart',
        title: '8. Dāna & Seva (दान एवं सेवा)',
        description:
          'ॐ परोपकाराय नमः ॥ Selfless charity and seva to purify karma, invoke ancestral grace, and receive total divine protection.',
        color: 'from-purple-500/15 to-rose-500/10',
        iconColor: 'text-purple-400',
        href: '/remedies/charity',
        badge: 'North-West (NW)',
        price: 99,
        priceUSD: 1.99,
        image: '/assets/images/remedies/remedies_charity_1785738494717.png',
      },
    ],
  },
  comprehensiveServices: {
    tagline: 'ASTROPARIHAR SERVICES',
    title: 'Our Comprehensive',
    titleHighlight: 'Vedic Services & Guides',
    subtitle:
      'Free daily Panchang, Horoscope forecasts, Kundli Matching, Meditation guides, Fasting Planners & Mahadasha Survival PDF Guides.',
    items: [
      {
        id: 'janam-kundli',
        title: 'Janam Kundli',
        desc: 'Detailed Vedic birth chart, Lagna report, planetary placements, and future life predictions.',
        badge: 'Free',
        color: 'from-blue-500/15 to-indigo-500/10',
        iconColor: 'text-blue-400',
        href: '/services/janam-kundli',
      },
      {
        id: 'kundli-matching',
        title: 'Kundli Matching',
        desc: '36-point Gun Milan, marital compatibility check, and Manglik Dosha analysis for Bride & Groom.',
        badge: 'Free',
        color: 'from-pink-500/15 to-rose-500/10',
        iconColor: 'text-pink-400',
        href: '/services/kundli-matching',
      },
      {
        id: 'daily-horoscope',
        title: 'Daily Horoscope',
        desc: "Today's 12-Zodiac sign predictions for Career, Love, Health, Money, Lucky Numbers & Colors.",
        badge: 'Free',
        color: 'from-amber-500/15 to-yellow-500/10',
        iconColor: 'text-amber-400',
        href: '/services/daily-horoscope',
      },
      {
        id: 'panchang',
        title: 'Daily Panchang',
        desc: 'Accurate Tithi, Nakshatra, Yoga, Karana, Abhijit Muhurat & Rahu Kaal calculations for your location.',
        badge: 'Free',
        color: 'from-orange-500/15 to-amber-500/10',
        iconColor: 'text-orange-400',
        href: '/services/panchang',
      },
      {
        id: 'fasting',
        title: 'Fasting Planner',
        desc: 'Personalized weekly fasting days and sacred Ekadashi & Pradosham vrat calendars based on your Rashi.',
        badge: 'Free',
        color: 'from-purple-500/15 to-indigo-500/10',
        iconColor: 'text-purple-400',
        href: '/services/fasting-planner',
      },
      {
        id: 'meditation',
        title: 'Meditation Guide',
        desc: 'Classical Vedic meditation practices, breathing exercises, and mantras for daily focus.',
        badge: 'Free',
        color: 'from-emerald-500/15 to-teal-500/10',
        iconColor: 'text-emerald-400',
        href: '/services/meditation-guide',
      },
      {
        id: 'rahu-stabilisation',
        title: 'Rahu Dasha Stabilisation (PDF)',
        desc: 'Harmonize intense Rahu 18-year transit with classical remedies, mantras & lifestyle shield.',
        badge: '₹499',
        color: 'from-red-500/15 to-rose-500/10',
        iconColor: 'text-red-400',
        href: '/services/rahu-mahadasha-stabilisation-guide',
      },
      {
        id: 'rahu-survival',
        title: 'Rahu Dasha Survival (PDF)',
        desc: 'Tactical survival strategies, spiritual shield and karmic remedies for intense Rahu periods.',
        badge: '₹999',
        color: 'from-[#C9952B]/15 to-amber-500/10',
        iconColor: 'text-[#C9952B]',
        href: '/services/rahu-mahadasha-survival-guide',
      },
      {
        id: 'sani-survival',
        title: 'Sani Dasha Survival (PDF)',
        desc: 'Saturn discipline, Sade Sati pacification, endurance strategies and karmic remedies.',
        badge: '₹999',
        color: 'from-slate-500/15 to-zinc-500/10',
        iconColor: 'text-slate-300',
        href: '/services/sani-mahadasha-survival-guide',
      },
    ],
  },
  panchang: {
    dateLabel: 'Thursday, 3 July 2026 · Ashadha Shukla Saptami · IST',
    tithiValue: 'Shukla Saptami',
    tithiSub: 'Ends 11:45 PM',
    nakshatraValue: 'Punarvasu',
    nakshatraSub: 'Until 08:30 PM',
    yogaValue: 'Siddha Yoga',
    yogaSub: 'Auspicious',
    karanaValue: 'Bava',
    karanaSub: 'Till 12:30 PM',
    varaValue: 'Guruvar',
    varaSub: 'Thursday',
    rahuKalamValue: '01:30 – 03:00 PM',
    rahuKalamSub: 'Avoid this time',
    abhijitMuhurat: '11:58 AM – 12:48 PM',
    sunrise: '05:42 AM',
    sunset: '07:12 PM',
  },
};

function mergeHomepageData(data: Partial<HomepageContent>): HomepageContent {
  const mergedServices = {
    ...defaultHomepageContent.services,
    ...(data.services || {}),
    items: defaultHomepageContent.services.items.map((defaultItem) => {
      const customItem = (data.services?.items || []).find(
        (item) => item.id === defaultItem.id
      );
      if (!customItem) return defaultItem;
      return {
        ...defaultItem,
        ...customItem,
      };
    }),
  };

  const mergedComprehensiveServices = {
    ...defaultHomepageContent.comprehensiveServices,
    ...(data.comprehensiveServices || {}),
    items: defaultHomepageContent.comprehensiveServices.items.map((defaultItem) => {
      const customItem = (data.comprehensiveServices?.items || []).find(
        (item) => item.id === defaultItem.id
      );
      if (!customItem) return defaultItem;
      return {
        ...defaultItem,
        ...customItem,
      };
    }),
  };

  return {
    ...defaultHomepageContent,
    ...data,
    hero: {
      ...defaultHomepageContent.hero,
      ...(data.hero || {}),
      stats: data.hero?.stats || defaultHomepageContent.hero.stats,
    },
    services: mergedServices,
    comprehensiveServices: mergedComprehensiveServices,
    panchang: {
      ...defaultHomepageContent.panchang,
      ...(data.panchang || {}),
    },
  } as HomepageContent;
}

export async function getHomepageContent(): Promise<HomepageContent> {
  // On the server (SSR), use adminDb directly for instant, authentic data fetching without dummy fallback flashes
  if (typeof window === 'undefined') {
    try {
      const { adminDb } = await import('./firebase/admin');
      const snap = await adminDb.collection('content').doc('homepage').get();
      if (snap.exists) {
        const data = snap.data() as Partial<HomepageContent>;
        return mergeHomepageData(data);
      }
    } catch (adminErr) {
      console.warn('adminDb getHomepageContent warning:', adminErr);
    }
    return defaultHomepageContent;
  }

  try {
    const docRef = doc(db, 'content', 'homepage');
    const docSnap = await Promise.race([
      getDoc(docRef),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);

    if (docSnap && docSnap.exists()) {
      const data = docSnap.data() as Partial<HomepageContent>;
      return mergeHomepageData(data);
    } else {
      return defaultHomepageContent;
    }
  } catch (error) {
    console.warn('Could not fetch latest homepage content, using defaults:', error);
    return defaultHomepageContent;
  }
}

export function subscribeHomepageContent(callback: (content: HomepageContent) => void): () => void {
  try {
    const docRef = doc(db, 'content', 'homepage');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<HomepageContent>;
          callback(mergeHomepageData(data));
        } else {
          callback(defaultHomepageContent);
        }
      },
      (error) => {
        console.warn('subscribeHomepageContent error:', error);
      }
    );
  } catch (err) {
    console.warn('Could not setup homepage subscription:', err);
    return () => {};
  }
}

export async function updateHomepageContent(data: HomepageContent): Promise<void> {
  try {
    const docRef = doc(db, 'content', 'homepage');
    await setDoc(docRef, data);
  } catch (error) {
    console.error('Error updating homepage content:', error);
    throw error;
  }
}

export interface PremiumDetails {
  enabled: boolean;
  tagline: string;
  titleLine1: string;
  titleLine2Gold: string;
  description: string;
  quote?: string;
  sloka?: {
    sanskrit: string;
    transliteration: string;
    meaning: string;
  };
  infoCards: {
    title: string;
    icon?: string;
    subtitle?: string;
    description?: string;
    points?: string[];
    subSections?: {
      title: string;
      description?: string;
      points?: string[];
    }[];
  }[];
  summaryTitle: string;
  summaryTitleGold: string;
  summaryPoints?: string[];
  summaryFooter?: string;
  bottomNote?: string;
}

export interface HomaItem {
  name: string;
  purpose: string;
  day: string;
  duration: string;
  color: string;
}

export interface HomaServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  benefitsTitle: string;
  benefits: string[];
  homamsTitle: string;
  homams: HomaItem[];
  premiumDetails?: PremiumDetails;
}

export const defaultHomaContent: HomaServiceContent = {
  hero: {
    tag: 'Sacred Fire Rituals',
    titleLine1: 'Homam & Puja',
    titleLine2: 'Recommendations',
    description:
      'Fire rituals (Homam) are among the most powerful Vedic remedies. Get personalized recommendations for the right Homam based on your planetary afflictions and life goals.',
    primaryBtnText: 'Get My Homam Report',
    secondaryBtnText: 'Consult Astrologer',
  },
  benefitsTitle: 'Benefits of Vedic Homam',
  benefits: [
    'Removes planetary afflictions and negative karma',
    'Purifies the environment and creates positive energy',
    'Brings success in career, business, and relationships',
    'Improves family harmony and removes ancestral doshas',
    'Accelerates spiritual growth and divine blessings',
  ],
  homamsTitle: 'Popular Homam Types',
  homams: [
    {
      name: 'Navagraha Homam',
      purpose: 'Balance all 9 planetary energies',
      day: 'Saturday',
      duration: '3–4 hours',
      color: 'text-orange-400',
    },
    {
      name: 'Ganapathi Homam',
      purpose: 'Remove obstacles, new beginnings',
      day: 'Any auspicious day',
      duration: '2–3 hours',
      color: 'text-yellow-400',
    },
    {
      name: 'Sudarshana Homam',
      purpose: 'Protection from evil, enemies',
      day: 'Sunday',
      duration: '3–4 hours',
      color: 'text-red-400',
    },
    {
      name: 'Mrityunjaya Homam',
      purpose: 'Health, longevity, healing',
      day: 'Monday',
      duration: '3–4 hours',
      color: 'text-blue-400',
    },
    {
      name: 'Lakshmi Kubera Homam',
      purpose: 'Wealth, prosperity, abundance',
      day: 'Friday',
      duration: '2–3 hours',
      color: 'text-pink-400',
    },
    {
      name: 'Ayush Homam',
      purpose: 'Long life, good health',
      day: 'Birthday',
      duration: '2–3 hours',
      color: 'text-green-400',
    },
  ],
  premiumDetails: {
    enabled: true,
    tagline: 'Homa & Pūjā as a Remedy',
    titleLine1: 'Sacred',
    titleLine2Gold: 'Active Transformation',
    quote: '“Where intention meets sacred action, transformation begins.”',
    description:
      'Homa and Pūjā are among the most powerful traditional remedies, invoking divine energies to restore balance and reduce obstacles arising from karma. Through the purifying element of fire and focused intention, these practices help create harmony within and around you.',
    sloka: {
      sanskrit:
        'होमपूजाजपैर्नित्यं देवताः प्रीतिमाप्नुयुः ।\nतेषां प्रसादात् नश्यन्ति बाधाः कर्मसमुद्भवाः ॥',
      transliteration:
        'Homa-pūjā-japair nityaṁ devatāḥ prītim āpnuyuḥ\nTeṣāṁ prasādāt naśyanti bādhāḥ karma-samudbhavāḥ',
      meaning:
        '“Through regular homa, worship, and mantra, the deities become pleased; by their grace, obstacles arising from karma are reduced.”',
    },
    infoCards: [
      {
        title: 'Why Homa / Pūjā is Powerful',
        icon: '🕉️',
        subtitle:
          'Core Principle: Homa and Pūjā purify and harmonize subtle energies that influence life.',
        subSections: [
          {
            title: '1 Direct connection with divine forces',
            points: [
              'Invokes specific planetary or deity energies',
              'Aligns individual with higher order',
            ],
          },
          {
            title: '2 Active karmic resolution',
            points: [
              'Offerings symbolize surrender of ego and negative karma',
              'Fire (Agni) acts as the divine messenger and purifier',
            ],
          },
          {
            title: '3 Environmental harmony',
            points: [
              'Vibrations of mantras cleanse the physical space',
              'Creates a protective and auspicious aura',
            ],
          },
        ],
      },
      {
        title: 'Comparing Remedies',
        icon: '⚖️',
        subSections: [
          {
            title: 'Gemstones',
            points: ['Passive support', 'Works externally', 'Slow, steady impact'],
          },
          {
            title: 'Mantras',
            points: [
              'Internal focus',
              'Directly influences the mind',
              'Requires daily consistency',
            ],
          },
          {
            title: 'Homa / Pūjā',
            points: [
              'Active intervention',
              'Transforms environment and energy',
              'Often yields faster, noticeable shifts',
            ],
          },
        ],
      },
      {
        title: 'When is Homa Most Effective?',
        icon: '⏳',
        points: [
          'During intense planetary afflictions (e.g., Sade Sati)',
          'When facing sudden obstacles or inexplicable delays',
          'For specific material or spiritual goals (e.g., health, career)',
          'To express gratitude and maintain continuous blessings',
        ],
      },
      {
        title: 'The Role of Intention (Sankalpa)',
        icon: '🎯',
        description:
          'The power of any ritual lies in the Sankalpa (resolve). A Homa performed with mechanical action yields little. When performed with deep faith, clear intention, and surrender, it becomes a powerful catalyst for change.',
      },
    ],
    summaryTitle: 'Final',
    summaryTitleGold: 'Thoughts',
    summaryPoints: [
      '🔥 Homa is the physical manifestation of prayer',
      '✨ It actively burns negative karmic influences',
      '🙏 Requires purity of intention and action',
      '💎 A profound way to seek divine grace',
    ],
    summaryFooter: 'Consult our experts to find the right Homa for your specific needs.',
  },
};

export interface GemstoneItem {
  planet: string;
  gem: string;
  color: string;
  bg: string;
  metal: string;
  finger: string;
  day: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface GemstoneServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  benefitsTitle: string;
  benefits: string[];
  chartTitle: string;
  gemstones: GemstoneItem[];
  faqTitle: string;
  faqs: FaqItem[];
  premiumDetails?: PremiumDetails;
}

export const defaultGemstoneContent: GemstoneServiceContent = {
  hero: {
    tag: 'Vedic Gemology',
    titleLine1: 'Sacred Gemstone',
    titleLine2: 'Recommendations',
    description:
      'Discover the precise gemstone aligned with your birth chart. Each recommendation is based on Navagraha analysis — the nine planetary forces that shape your destiny.',
    primaryBtnText: 'Get My Gemstone Report',
    secondaryBtnText: 'Consult Astrologer',
  },
  benefitsTitle: 'Why Wear the Right Gemstone?',
  benefits: [
    'Strengthens Sun energy and boosts confidence',
    'Improves career prospects and leadership qualities',
    'Enhances vitality, health, and overall well-being',
    'Attracts prosperity and removes obstacles',
    'Balances planetary doshas in your birth chart',
  ],
  chartTitle: 'Navagraha Gemstone Chart',
  gemstones: [
    {
      planet: 'Sun',
      gem: 'Ruby (Manik)',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      metal: 'Gold',
      finger: 'Ring finger',
      day: 'Sunday',
    },
    {
      planet: 'Moon',
      gem: 'Pearl (Moti)',
      color: 'text-blue-200',
      bg: 'bg-blue-200/10',
      metal: 'Silver',
      finger: 'Little finger',
      day: 'Monday',
    },
    {
      planet: 'Mars',
      gem: 'Red Coral (Moonga)',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      metal: 'Gold/Copper',
      finger: 'Ring finger',
      day: 'Tuesday',
    },
    {
      planet: 'Mercury',
      gem: 'Emerald (Panna)',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      metal: 'Gold',
      finger: 'Little finger',
      day: 'Wednesday',
    },
    {
      planet: 'Jupiter',
      gem: 'Yellow Sapphire (Pukhraj)',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      metal: 'Gold',
      finger: 'Index finger',
      day: 'Thursday',
    },
    {
      planet: 'Venus',
      gem: 'Diamond (Heera)',
      color: 'text-pink-300',
      bg: 'bg-pink-300/10',
      metal: 'Gold/Platinum',
      finger: 'Middle finger',
      day: 'Friday',
    },
    {
      planet: 'Saturn',
      gem: 'Blue Sapphire (Neelam)',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      metal: 'Silver/Iron',
      finger: 'Middle finger',
      day: 'Saturday',
    },
    {
      planet: 'Rahu',
      gem: 'Hessonite (Gomed)',
      color: 'text-amber-600',
      bg: 'bg-amber-600/10',
      metal: 'Silver',
      finger: 'Middle finger',
      day: 'Saturday',
    },
    {
      planet: 'Ketu',
      gem: "Cat's Eye (Lehsunia)",
      color: 'text-gray-400',
      bg: 'bg-gray-400/10',
      metal: 'Silver',
      finger: 'Middle finger',
      day: 'Tuesday',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqs: [
    {
      q: 'How is the gemstone determined for me?',
      a: 'Based on your birth chart, we analyze the strength and weakness of each planet. The gemstone is recommended to strengthen your beneficial planets and neutralize malefic ones.',
    },
    {
      q: 'What is the ideal carat weight for a gemstone?',
      a: 'Generally 3–7 carats for most gemstones. The exact weight depends on your body weight and planetary strength. Our detailed report specifies the ideal weight for you.',
    },
    {
      q: 'Can I wear multiple gemstones?',
      a: 'Yes, but certain combinations are incompatible. For example, Ruby and Blue Sapphire should never be worn together. Our report includes safe combination guidelines.',
    },
    {
      q: 'How long before I see results?',
      a: 'Most people notice effects within 40 days of wearing the correct gemstone. Full benefits are typically experienced within 3–6 months of consistent wear.',
    },
  ],
  premiumDetails: {
    enabled: true,
    tagline: 'Gemstone Remedies',
    titleLine1: 'The True Power of',
    titleLine2Gold: 'Vedic Gemstones',
    description:
      'In Vedic astrology, gemstones are not decorative objects; they are powerful energy conductors. A gemstone, when pure and correctly worn, acts like an antenna that absorbs specific planetary frequencies, amplifies them, and continuously transfers them to the wearer.',
    sloka: {
      sanskrit:
        'रत्नं ग्रहबलप्रदं नित्यं धार्यं विधिविधानतः ।\nदुर्बलग्रहपीडायां शमनं तत्प्रकीर्तितम् ॥',
      transliteration:
        'Ratnaṁ grahabala-pradaṁ nityaṁ dhāryaṁ vidhi-vidhānataḥ |\ndurbala-graha-pīḍāyāṁ śamanaṁ tat prakīrtitam ||',
      meaning:
        '“A gemstone, when worn according to proper rules, continuously strengthens planetary power. In cases of weak or afflicted planets, it is praised as a means of pacification.”',
    },
    infoCards: [
      {
        title: 'What Gemstones DO and DO NOT DO',
        icon: '⚖️',
        subSections: [
          {
            title: 'What gemstones CAN do:',
            points: [
              'Strengthen a weak but benefic planet',
              'Stabilise a planet during its dasha',
              'Improve confidence, clarity, health, luck, or stability',
              'Reduce negative effects caused by planetary weakness',
              'Support long-term effort and discipline',
            ],
          },
          {
            title: 'What gemstones CANNOT do:',
            points: [
              'They cannot change fate overnight',
              'They cannot replace hard work',
              'They cannot fix wrong decisions',
              'They cannot override karma',
              'They cannot make an unsuitable career suddenly successful',
            ],
          },
        ],
      },
      {
        title: 'When Gemstones Are Actually Useful',
        description: 'Gemstones work best when:',
        points: [
          'The planet is benefic for the chart',
          'The planet is weak, afflicted, or underperforming',
          'The person is in that planet’s dasha or sub-dasha',
          'The person is willing to make behavioural corrections',
        ],
      },
      {
        title: 'Why Gemstones Must Be Worn Carefully',
        description:
          'Each planet represents a psychological force: Wearing a gemstone increases that force. If you strengthen the wrong planet, it amplifies the wrong tendencies. This is why gemstones are powerful but neutral tools.',
        subSections: [
          { title: 'Mars', description: 'drive, courage' },
          { title: 'Jupiter', description: 'wisdom, ethics' },
          { title: 'Venus', description: 'pleasure, comfort' },
          { title: 'Saturn', description: 'discipline' },
          { title: 'Moon', description: 'emotions, mind' },
          { title: 'Rahu/Ketu', description: 'obsession' },
        ],
      },
      {
        title: 'Comparing Remedies',
        subSections: [
          { title: 'Gemstones', description: 'Passive | Slow/Steady | Low Control' },
          { title: 'Mantras', description: 'Active | Faster | High Control' },
          { title: 'Lifestyle/Behavior', description: 'Active | Strong | Very High Control' },
        ],
      },
    ],
    summaryTitle: 'Final',
    summaryTitleGold: 'Summary',
    summaryPoints: [
      'Gemstones are tools, not magic',
      'They strengthen planetary energy, not destiny',
      'Must be chosen ONLY after chart analysis',
      'They work best with right action & discipline',
      'They are support systems, not solutions',
    ],
    summaryFooter:
      'Please consult a qualified Astrologer for the best gemstone for you as per your chart.',
  },
};

// ----------------- MANTRA -----------------
export interface MantraItem {
  planet: string;
  mantra: string;
  count: string;
  time: string;
  color: string;
}
export interface MantraServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  mantras: MantraItem[];
  faqTitle: string;
  faqs: FaqItem[];
  premiumDetails?: PremiumDetails;
}
export const defaultMantraContent: MantraServiceContent = {
  hero: {
    tag: 'Sacred Sound Healing',
    titleLine1: 'Personalized Mantra',
    titleLine2: 'Recommendations',
    description:
      'Receive sacred mantras precisely aligned with your planetary positions. Each mantra is a vibrational key that unlocks specific cosmic energies in your birth chart.',
    primaryBtnText: 'Get My Mantra Report',
    secondaryBtnText: 'Consult Astrologer',
  },
  benefitsTitle: 'Power of Vedic Mantras',
  benefits: [
    'Pacifies malefic planets and reduces their negative effects',
    'Brings mental peace, clarity, and emotional balance',
    'Strengthens the positive influence of benefic planets',
    'Removes karmic obstacles and negative energy patterns',
    'Enhances spiritual growth and inner awakening',
  ],
  guideTitle: 'Navagraha Mantra Guide',
  mantras: [
    {
      planet: 'Sun',
      mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
      count: '108',
      time: 'Sunrise',
      color: 'text-red-400',
    },
    {
      planet: 'Moon',
      mantra: 'Om Shraam Shreem Shraum Sah Chandraya Namah',
      count: '108',
      time: 'Monday evening',
      color: 'text-blue-200',
    },
    {
      planet: 'Mars',
      mantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
      count: '108',
      time: 'Tuesday sunrise',
      color: 'text-orange-400',
    },
    {
      planet: 'Mercury',
      mantra: 'Om Braam Breem Braum Sah Budhaya Namah',
      count: '108',
      time: 'Wednesday morning',
      color: 'text-green-400',
    },
    {
      planet: 'Jupiter',
      mantra: 'Om Graam Greem Graum Sah Guruve Namah',
      count: '108',
      time: 'Thursday morning',
      color: 'text-yellow-400',
    },
    {
      planet: 'Venus',
      mantra: 'Om Draam Dreem Draum Sah Shukraya Namah',
      count: '108',
      time: 'Friday morning',
      color: 'text-pink-300',
    },
    {
      planet: 'Saturn',
      mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namah',
      count: '108',
      time: 'Saturday evening',
      color: 'text-blue-400',
    },
  ],
  faqTitle: 'Frequently Asked Questions',
  faqs: [
    {
      q: 'How many times should I chant the mantra?',
      a: 'The standard count is 108 times per session, as 108 is considered sacred in Vedic tradition. You can use a mala (prayer beads) to keep count.',
    },
    {
      q: 'Does pronunciation matter?',
      a: 'Yes, correct pronunciation is important for maximum benefit. Our detailed report includes phonetic pronunciation guides and audio references.',
    },
    {
      q: 'Can I chant mantras silently?',
      a: 'Yes, silent (mental) chanting is equally effective. However, audible chanting creates sound vibrations that have additional healing benefits.',
    },
    {
      q: 'How long before I see results?',
      a: 'Regular chanting for 40 days (a mandala) typically shows noticeable changes. Full benefits manifest over 3–6 months of consistent practice.',
    },
  ],
  premiumDetails: {
    enabled: true,
    tagline: 'Mantra Remedies',
    titleLine1: 'The Fundamental Power of',
    titleLine2Gold: 'Vedic Mantras',
    description:
      '“Graha peedāyām mantraḥ pradhānam” – When planets cause suffering, mantra is the primary remedy. In Vedic astrology, planets are not just physical bodies; they are cosmic principles that influence the mind, decision-making, and karma. A mantra is a sound-based method to harmonize your inner frequency.',
    infoCards: [
      {
        title: 'Mantras Work Directly on the Mind',
        description:
          'In astrology, the Moon governs the mind, and all planetary suffering is experienced through the mind. Mantras calm, stabilize, and strengthen the Moon, leading to:',
        points: [
          'Better emotional regulation',
          'Clearer thinking',
          'Reduced anxiety',
          'Better decisions',
        ],
        subtitle:
          'Even if a planet is malefic, a stable Moon reduces suffering. That is why mantra practice often brings relief even without visible external change.',
      },
      {
        title: 'Why Mantras Are Safer',
        description:
          'Mantras do not force energy. They educate and discipline the mind to handle planetary pressure.',
        subSections: [
          {
            title: 'Example:',
            points: [
              'A weak Mars causes anger or fear',
              'A Mars mantra does NOT make you aggressive',
              'It teaches controlled courage and discipline',
            ],
          },
        ],
      },
      {
        title: 'Remedy Comparison',
        subSections: [
          {
            title: 'Gemstones',
            points: [
              'Work externally',
              'Passive support',
              'Strengthen a planet blindly (good or bad)',
              'Cannot be “adjusted” once worn',
            ],
          },
          {
            title: 'Rituals / Charity',
            points: ['External actions', 'Event-based', 'Helpful but temporary'],
          },
          {
            title: 'Mantras',
            points: [
              'Work internally',
              'Conscious and adjustable',
              'Directly influence the mind (Moon)',
              'Safer than gemstones',
            ],
          },
        ],
      },
      {
        title: 'Correcting Behavior, Not Just Fate',
        description:
          'Astrology does not say: "Planet causes problem → suffer helplessly."\nIt says: "Planet creates pressure → correct response reduces suffering."',
        points: [
          'Slow down impulsive reactions',
          'Improve patience',
          'Increase awareness',
          'Refine judgment',
        ],
      },
      {
        title: 'Why Mantras Require Consistency',
        description:
          'Mantras are not mechanical magic. They work through repetition, rhythm, discipline, and intention.\nJust like physical exercise strengthens the body gradually, mantra strengthens the mental and karmic muscle over time. This is why results are:',
        points: ['Subtle', 'Progressive', 'Stable', 'Long-lasting'],
      },
    ],
    summaryTitle: 'Final',
    summaryTitleGold: 'Summary',
    summaryPoints: [
      'Astrology shows the map',
      'Mantras give you the steering wheel',
      'Gemstones give support, not control',
      'Mantras give control, clarity, and stability',
    ],
    summaryFooter:
      'That is why mantras are considered the most important remedial measure in astrology.\nPlease consult a qualified Astrologer for the best Mantras for you as per your chart.',
  },
};

// ----------------- YANTRA -----------------
export interface YantraItem {
  name: string;
  planet: string;
  purpose: string;
  placement: string;
  color: string;
}
export interface YantraServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  yantras: YantraItem[];
  premiumDetails?: PremiumDetails;
}
export const defaultYantraContent: YantraServiceContent = {
  hero: {
    tag: 'Sacred Geometry',
    titleLine1: 'Sacred Yantra',
    titleLine2: 'Recommendations',
    description:
      'Yantras are sacred geometric diagrams that serve as cosmic antennae, channeling specific planetary energies. Get your personalized Yantra based on your birth chart analysis.',
    primaryBtnText: 'Get My Yantra Report',
    secondaryBtnText: 'Consult Astrologer',
  },
  benefitsTitle: 'Benefits of Yantra Worship',
  benefits: [
    'Attracts wealth, prosperity, and abundance',
    'Harmonizes all nine planetary energies simultaneously',
    'Removes Vastu doshas and negative energy from spaces',
    'Enhances positive energy flow in home and workplace',
    'Provides protection from evil eye and negative influences',
  ],
  guideTitle: 'Planetary Yantra Guide',
  yantras: [
    {
      name: 'Sri Yantra',
      planet: 'Venus/Lakshmi',
      purpose: 'Wealth & Prosperity',
      placement: 'East wall, pooja room',
      color: 'text-pink-400',
    },
    {
      name: 'Surya Yantra',
      planet: 'Sun',
      purpose: 'Health & Authority',
      placement: 'East wall',
      color: 'text-red-400',
    },
    {
      name: 'Chandra Yantra',
      planet: 'Moon',
      purpose: 'Peace & Emotions',
      placement: 'North wall',
      color: 'text-blue-200',
    },
    {
      name: 'Mangal Yantra',
      planet: 'Mars',
      purpose: 'Courage & Energy',
      placement: 'South wall',
      color: 'text-orange-400',
    },
    {
      name: 'Budh Yantra',
      planet: 'Mercury',
      purpose: 'Intelligence & Business',
      placement: 'North wall',
      color: 'text-green-400',
    },
    {
      name: 'Guru Yantra',
      planet: 'Jupiter',
      purpose: 'Wisdom & Blessings',
      placement: 'North-East',
      color: 'text-yellow-400',
    },
    {
      name: 'Shukra Yantra',
      planet: 'Venus',
      purpose: 'Love & Luxury',
      placement: 'South-East',
      color: 'text-pink-300',
    },
    {
      name: 'Shani Yantra',
      planet: 'Saturn',
      purpose: 'Karma & Discipline',
      placement: 'West wall',
      color: 'text-blue-400',
    },
  ],
};

// ----------------- ISHTA DEVATA -----------------
export interface DeityItem {
  name: string;
  planet?: string;
  indicator: string;
  worship: string;
  stotra: string;
  color: string;
}
export interface IshtaDevataServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  deities: DeityItem[];
  premiumDetails?: PremiumDetails;
}
export const defaultIshtaDevataContent: IshtaDevataServiceContent = {
  hero: {
    tag: 'Personal Deity Finder',
    titleLine1: 'Discover Your',
    titleLine2: 'Ishta Devata',
    description:
      "Your Ishta Devata is the personal deity most aligned with your soul's journey. Determined by the 12th house lord and its nakshatra, this deity is your divine protector and guide.",
    primaryBtnText: 'Find My Ishta Devata',
    secondaryBtnText: 'Consult Astrologer',
  },
  benefitsTitle: 'Why Know Your Ishta Devata?',
  benefits: [
    'Establishes a deep personal connection with your divine protector',
    'Daily worship aligned with your chart brings faster spiritual progress',
    'Specific deity worship removes your unique planetary doshas',
    'Strengthens your natural talents and life purpose',
    'Provides divine protection and guidance in difficult times',
  ],
  guideTitle: 'Common Ishta Devatas',
  deities: [
    {
      name: 'Lord Shiva',
      indicator: 'Moon in 12th / Ketu aspect',
      worship: 'Monday Abhishekam',
      stotra: 'Shiva Panchakshara',
      color: 'text-blue-400',
    },
    {
      name: 'Lord Vishnu',
      indicator: 'Jupiter strong / Sagittarius rising',
      worship: 'Thursday Tulsi puja',
      stotra: 'Vishnu Sahasranama',
      color: 'text-blue-300',
    },
    {
      name: 'Maa Durga',
      planet: 'Rahu',
      indicator: 'Atmakaraka in Navamsha',
      worship: 'Durga Saptashati reading, Friday fasting',
      stotra: 'Argala Stotram',
      color: 'text-red-500',
    },
    {
      name: 'Lord Ganesha',
      planet: 'Ketu',
      indicator: 'Ketu in 9th House',
      worship: 'Offering Durva grass, Wednesday prayers',
      stotra: 'Ganesha Pancharatnam',
      color: 'text-orange-400',
    },
    {
      name: 'Goddess Lakshmi',
      indicator: 'Venus strong / Taurus rising',
      worship: 'Friday lotus offering',
      stotra: 'Sri Sukta',
      color: 'text-pink-400',
    },
    {
      name: 'Lord Hanuman',
      indicator: 'Mars in 6th / Rahu dasha',
      worship: 'Tuesday/Saturday Hanuman Chalisa',
      stotra: 'Sankat Mochan',
      color: 'text-orange-500',
    },
  ],
  premiumDetails: {
    enabled: true,
    tagline: 'Devatā Worship / Upasana',
    titleLine1: 'The Power of',
    titleLine2Gold: 'Divine Connection',
    description:
      'Devatā worship is one of the most powerful and direct remedies in the Vedic tradition. By connecting with the divine through devotion, mantra, and simple practices, one can bring clarity, strength, and balance into life. This inner alignment naturally reduces obstacles and supports overall well-being.',
    quote: '“When the mind aligns with the divine, life begins to align naturally.”',
    sloka: {
      sanskrit:
        'देवताभक्तियुक्तानां न बाधाः स्युः कदाचन ।\nप्रसन्ने तु परे देवि सर्वमङ्गलमस्ति हि ॥',
      transliteration:
        'Devatā-bhakti-yuktānāṁ na bādhāḥ syuḥ kadācana\nPrasanne tu pare devi sarva-maṅgalam asti hi',
      meaning:
        '“For those who are devoted to the Divine, obstacles do not persist; when the Deity is pleased, all auspiciousness arises.”',
    },
    infoCards: [
      {
        title: 'Why Devatā worship is powerful',
        icon: '🕉️',
        subtitle:
          'Core Principle: Devatā worship aligns the individual with higher intelligence governing life.',
        subSections: [
          {
            title: 'Direct inner transformation',
            points: ['Calms the mind', 'Increases clarity', 'Builds inner strength'],
          },
          {
            title: 'Aligns with planetary energies',
            description: 'Each graha is connected to a devatā:',
            points: [
              'Sun → Surya',
              'Moon → Shiva / Parvati',
              'Jupiter → Guru / Vishnu',
              'Saturn → Shani / Hanuman',
              '✨ Worship balances planetary effects naturally.',
            ],
          },
          {
            title: 'Works beyond mechanical remedies',
            description:
              'Unlike gemstones and external corrections:\n✨ Devatā worship transforms consciousness itself',
          },
          {
            title: 'Sustained and self-powered remedy',
            points: ['✔ Can be done daily', '✔ No dependency', '✔ Grows stronger over time'],
          },
          {
            title: 'Reduces karmic burden',
            description:
              'Through devotion, the experience of karma becomes lighter and more manageable.',
          },
        ],
      },
      {
        title: 'Astrological View',
        icon: '⚖️',
        points: [
          '🔻 Graha = karma delivery',
          '🔺 Devatā = higher intelligence',
          '✨ Devatā worship helps you rise above karmic difficulty',
        ],
      },
      {
        title: 'Positioning in Platform',
        points: [
          'Mantra → vibration',
          'Homa → action',
          'Vāstu → environment',
          'Devatā → consciousness transformation',
          'Dāna → karmic balance',
        ],
      },
    ],
    summaryTitle: '',
    summaryTitleGold: '',
    summaryFooter:
      'Note: The above guidance is general in nature and based on standard astrological principles. For a more accurate and personalized recommendation tailored to your birth chart and current planetary influences, we strongly advise consulting a qualified astrologer.',
  },
};

// ----------------- MUHURTHAM -----------------
export interface EventItem {
  name: string;
  icon: string;
  desc: string;
}
export interface MuhurthamServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  eventsTitle: string;
  events: EventItem[];
  benefitsTitle: string;
  benefits: string[];
  premiumDetails?: PremiumDetails;
}
export const defaultMuhurthamContent: MuhurthamServiceContent = {
  hero: {
    tag: 'Auspicious Timing',
    titleLine1: 'Muhurtham',
    titleLine2: 'Generator',
    description:
      "Every important event deserves the most auspicious timing. Our Muhurtham generator analyzes planetary positions to find the perfect moment for your life's milestones.",
    primaryBtnText: 'Find Auspicious Date',
    secondaryBtnText: 'Consult Astrologer',
  },
  eventsTitle: 'Events We Cover',
  events: [
    { name: 'Marriage', icon: '💍', desc: 'Find the most auspicious wedding date and time' },
    { name: 'Housewarming', icon: '🏠', desc: 'Griha Pravesh muhurtham for prosperity' },
    { name: 'Vehicle Purchase', icon: '🚗', desc: 'Auspicious time for buying new vehicles' },
    { name: 'Naming Ceremony', icon: '👶', desc: 'Namakarana muhurtham for newborns' },
    { name: 'Business Opening', icon: '🏢', desc: 'Auspicious inauguration timing' },
    { name: 'Travel', icon: '✈️', desc: 'Best time for important journeys' },
    { name: 'Education', icon: '📚', desc: 'Vidyarambha muhurtham for learning' },
    { name: 'Property Registration', icon: '📋', desc: 'Auspicious time for property deals' },
  ],
  benefitsTitle: 'Why Choose the Right Muhurtham?',
  benefits: [
    'Identifies the most auspicious planetary alignment for your event',
    'Avoids inauspicious periods like Rahu Kalam and Yamagandam',
    'Considers your personal birth chart for maximum compatibility',
    'Provides multiple date options with strength ratings',
    'Includes Nakshatra, Lagna, and Tithi analysis',
  ],
};

// ----------------- VASTU -----------------
export interface DirectionItem {
  dir: string;
  deity: string;
  element: string;
  color: string;
  purpose: string;
  remedy: string;
}
export interface VastuServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  directions: DirectionItem[];
  premiumDetails?: PremiumDetails;
}
export const defaultVastuContent: VastuServiceContent = {
  hero: {
    tag: 'Vedic Architecture',
    titleLine1: 'Interactive Vastu',
    titleLine2: 'Analysis',
    description:
      'Vastu Shastra is the ancient science of spatial arrangement. Get a complete room-by-room analysis of your home or office with specific remedies for each direction.',
    primaryBtnText: 'Get Vastu Analysis',
    secondaryBtnText: 'Consult Astrologer',
  },
  benefitsTitle: 'Benefits of Vastu Analysis',
  benefits: [
    'Identifies energy imbalances in your living or work space',
    'Provides direction-specific remedies for each zone',
    'Improves health, wealth, and relationship harmony',
    'Removes Vastu doshas without major structural changes',
    'Enhances positive energy flow throughout the property',
  ],
  guideTitle: '8 Directions — Vastu Guide',
  directions: [
    {
      dir: 'North',
      deity: 'Kubera',
      element: 'Water',
      color: 'text-blue-400',
      purpose: 'Wealth & Career',
      remedy: 'Blue/Green colors, water feature',
    },
    {
      dir: 'South',
      deity: 'Yama',
      element: 'Fire',
      color: 'text-red-400',
      purpose: 'Fame & Recognition',
      remedy: 'Red/Orange colors, avoid bedroom',
    },
    {
      dir: 'East',
      deity: 'Indra',
      element: 'Air',
      color: 'text-green-400',
      purpose: 'Health & Sunrise energy',
      remedy: 'Green plants, open windows',
    },
    {
      dir: 'West',
      deity: 'Varuna',
      element: 'Earth',
      color: 'text-amber-400',
      purpose: 'Gains & Profits',
      remedy: 'White/Grey colors, metal objects',
    },
    {
      dir: 'North-East',
      deity: 'Ishanya',
      element: 'Water+Air',
      color: 'text-cyan-400',
      purpose: 'Spirituality & Wisdom',
      remedy: 'Keep clean, pooja room ideal',
    },
    {
      dir: 'North-West',
      deity: 'Vayu',
      element: 'Air',
      color: 'text-sky-400',
      purpose: 'Support & Relationships',
      remedy: 'White/Silver, guest room',
    },
    {
      dir: 'South-East',
      deity: 'Agni',
      element: 'Fire',
      color: 'text-orange-400',
      purpose: 'Energy & Kitchen',
      remedy: 'Kitchen here, red/orange',
    },
    {
      dir: 'South-West',
      deity: 'Nirriti',
      element: 'Earth',
      color: 'text-yellow-600',
      purpose: 'Stability & Master bedroom',
      remedy: 'Heavy furniture, master bedroom',
    },
  ],
};

// ----------------- CHARITY -----------------
export interface CharityItem {
  icon?: string;
  name?: string;
  gov?: string;
  planet: string;
  item: string;
  day: string;
  recipient: string;
  color: string;
}
export interface CharityServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  charityItems: CharityItem[];
  premiumDetails?: PremiumDetails;
}
export const defaultCharityContent: CharityServiceContent = {
  hero: {
    tag: 'Karma-Aligned Giving',
    titleLine1: 'Vedic Charity',
    titleLine2: 'Planner',
    description:
      'Dana (charity) is a powerful Vedic remedy. When you donate the right items to the right people on the right day, it directly reduces planetary afflictions and builds positive karma.',
    primaryBtnText: 'Get My Charity Plan',
    secondaryBtnText: 'Consult Astrologer',
  },
  benefitsTitle: 'Benefits of Vedic Dana',
  benefits: [
    'Reduces the negative effects of malefic planets through karma',
    'Builds positive karma that manifests as life improvements',
    'Aligns your giving with cosmic timing for maximum impact',
    'Tracks your donation history and karma balance',
    'Provides monthly reminders for scheduled charity activities',
  ],
  guideTitle: 'Navagraha Dana Guide',
  charityItems: [
    {
      icon: '☀️',
      planet: 'Sun',
      name: 'SUN (Surya)',
      gov: 'authority, vitality, ego',
      item: 'Wheat, jaggery, copper items',
      day: 'Sunday',
      recipient: 'Father-like figures, government workers',
      color: 'text-red-400',
    },
    {
      icon: '🌕',
      planet: 'Moon',
      name: 'MOON (Chandra)',
      gov: 'mind, emotions, stability',
      item: 'Rice, milk, white clothes, silver',
      day: 'Monday',
      recipient: 'Women, mothers, needy families',
      color: 'text-blue-200',
    },
    {
      icon: '🔴',
      planet: 'Mars',
      name: 'MARS (Mangala)',
      gov: 'energy, courage, aggression',
      item: 'Red lentils, tools, red cloth',
      day: 'Tuesday',
      recipient: 'Soldiers, workers, young men',
      color: 'text-orange-400',
    },
    {
      icon: '🟢',
      planet: 'Mercury',
      name: 'MERCURY (Budha)',
      gov: 'intellect, communication',
      item: 'Green gram (moong), books, stationery',
      day: 'Wednesday',
      recipient: 'Students, children',
      color: 'text-green-400',
    },
    {
      icon: '🟡',
      planet: 'Jupiter',
      name: 'JUPITER (Guru)',
      gov: 'wisdom, wealth, children',
      item: 'Turmeric, yellow cloth, chana dal',
      day: 'Thursday',
      recipient: 'Teachers, priests, spiritual institutions',
      color: 'text-yellow-400',
    },
    {
      icon: '⚪',
      planet: 'Venus',
      name: 'VENUS (Shukra)',
      gov: 'luxury, relationships, comfort',
      item: 'White sweets, perfumes, clothes',
      day: 'Friday',
      recipient: 'Women, artists, brides / poor families',
      color: 'text-pink-300',
    },
    {
      icon: '⚫',
      planet: 'Saturn',
      name: 'SATURN (Shani)',
      gov: 'karma, delay, suffering',
      item: 'Black sesame, iron, blankets',
      day: 'Saturday',
      recipient: 'Poor, laborers, disabled',
      color: 'text-blue-500',
    },
    {
      icon: '☊',
      planet: 'Rahu',
      name: 'RAHU',
      gov: 'confusion, illusion, sudden events',
      item: 'Blue/black cloth, mustard oil',
      day: 'Saturday',
      recipient: 'Poor, foreigners, marginalized people',
      color: 'text-amber-700',
    },
    {
      icon: '☋',
      planet: 'Ketu',
      name: 'KETU',
      gov: 'detachment, spirituality',
      item: 'Multi-colored cloth, blankets, feeding dogs',
      day: 'Tuesday',
      recipient: 'Spiritual people, monks, animals',
      color: 'text-gray-400',
    },
  ],
  premiumDetails: {
    enabled: true,
    tagline: 'The Power of Dāna',
    titleLine1: 'Understanding',
    titleLine2Gold: 'Vedic Charity',
    description:
      'Charity is one of the most powerful and direct remedies in the Vedic tradition. By giving selflessly, one not only supports others but also restores balance in one’s own life. Dāna helps reduce karmic obstacles, promotes positive energy, and supports overall well-being.',
    quote: '“What is given with sincerity returns as balance in life.”',
    sloka: {
      sanskrit:
        'दानं तपश्च जपश्चैव पापानां नाशनं परम् ।\nतस्माद् दानं विशेषेण कर्तव्यं शुभमिच्छता ॥',
      transliteration:
        'Dānaṁ tapaś ca japaś caiva pāpānāṁ nāśanaṁ param\nTasmād dānaṁ viśeṣeṇa kartavyaṁ śubham icchatā',
      meaning:
        '“Charity, austerity, and mantra are supreme means to reduce negative karma; therefore, one who seeks well-being should especially practice charity.”',
    },
    infoCards: [
      {
        title: 'Importance of Dāna',
        icon: '🕉️',
        subtitle: 'Core Principle: Dāna balances karma through selfless giving.',
        subSections: [
          {
            title: 'Direct karmic correction',
            points: ['Reduces past negative impressions', 'Creates positive karmic flow'],
          },
          {
            title: 'Removes blockages',
            description:
              'In Jyotish, many problems arise from imbalance of give-and-take.\n✨ Dāna restores this balance.',
          },
          {
            title: 'Softens planetary afflictions',
            points: [
              'Saturn → charity reduces suffering',
              'Rahu → charity reduces confusion',
              'Jupiter → charity enhances blessings',
            ],
          },
          {
            title: 'Immediate impact',
            points: ['✔ Charity gives quick mental relief', '✔ Creates positive energy instantly'],
          },
          {
            title: 'Accessible to everyone',
            points: [
              '✔ No complex rituals',
              '✔ No special knowledge required',
              '✔ Universally applicable',
            ],
          },
        ],
      },
      {
        title: 'Astrological View',
        icon: '⚖️',
        points: [
          '🔻 Karma creates imbalance',
          '🔺 Dāna redistributes energy',
          '✨ Leading to smoother life experience',
        ],
      },
      {
        title: 'Remedy Comparison',
        points: [
          'Mantra → vibration',
          'Homa → action',
          'Vāstu → environment',
          'Devatā Upasana → spiritual connection',
          'Dāna → karmic balance',
        ],
      },
      {
        title: 'Universal Charity',
        icon: '🌍',
        description:
          'If unsure, Food donation (Annadāna) is considered the highest form of charity in tradition.',
      },
      {
        title: 'Important Rules',
        icon: '⚠️',
        points: ['✔ Give with humility', '✔ No expectation of return', '✔ Consistency > quantity'],
      },
    ],
    summaryTitle: 'Planet-Wise',
    summaryTitleGold: 'Charity Recommendations',
    summaryFooter: 'Specific items to donate based on planetary influences',
  },
};

// ----------------- RUDRAKSHA -----------------
export interface RudrakshaItem {
  mukhi: string;
  planet: string;
  deity: string;
  purpose: string;
  color: string;
}

export interface RudrakshaServiceContent {
  hero: {
    tag: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryBtnText: string;
    secondaryBtnText: string;
  };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  rudrakshas: RudrakshaItem[];
  premiumDetails?: PremiumDetails;
}

export const defaultRudrakshaContent: RudrakshaServiceContent = {
  hero: {
    tag: 'Sacred Beads',
    titleLine1: 'Rudraksha',
    titleLine2: 'Recommendations',
    description:
      'Rudraksha is the purest of all remedies in the Vedic tradition, born from the tears of Lord Shiva. Discover the right mukhi Rudraksha to harmonize your planetary energies and shield you from negativity.',
    primaryBtnText: 'Get My Rudraksha Report',
    secondaryBtnText: 'Consult Astrologer',
  },
  benefitsTitle: 'Benefits of Rudraksha',
  benefits: [
    'Shields against negative energies and psychic attacks',
    'Balances planetary doshas without any adverse effects',
    'Improves concentration, mental peace, and spiritual growth',
    'Regulates blood pressure and reduces stress (scientifically observed)',
    'Creates a protective energetic aura around the wearer',
  ],
  guideTitle: 'Planetary Rudraksha Guide',
  rudrakshas: [
    {
      mukhi: '1 Mukhi',
      planet: 'Sun',
      deity: 'Lord Shiva',
      purpose: 'Enlightenment, Leadership, Concentration',
      color: 'text-red-400',
    },
    {
      mukhi: '2 Mukhi',
      planet: 'Moon',
      deity: 'Ardhanarishvara',
      purpose: 'Emotional stability, Relationships',
      color: 'text-blue-200',
    },
    {
      mukhi: '3 Mukhi',
      planet: 'Mars',
      deity: 'Agni',
      purpose: 'Confidence, Courage, Removes laziness',
      color: 'text-orange-400',
    },
    {
      mukhi: '4 Mukhi',
      planet: 'Mercury',
      deity: 'Brahma',
      purpose: 'Intelligence, Communication, Creativity',
      color: 'text-green-400',
    },
    {
      mukhi: '5 Mukhi',
      planet: 'Jupiter',
      deity: 'Kalagni Rudra',
      purpose: 'Wisdom, Health, General well-being',
      color: 'text-yellow-400',
    },
    {
      mukhi: '6 Mukhi',
      planet: 'Venus',
      deity: 'Kartikeya',
      purpose: 'Focus, Willpower, Luxury, Art',
      color: 'text-pink-300',
    },
    {
      mukhi: '7 Mukhi',
      planet: 'Saturn',
      deity: 'Mahalakshmi',
      purpose: 'Wealth, Reduces Saturn afflictions (Sade Sati)',
      color: 'text-blue-400',
    },
    {
      mukhi: '8 Mukhi',
      planet: 'Rahu',
      deity: 'Ganesha',
      purpose: 'Removes obstacles, Success in ventures',
      color: 'text-amber-600',
    },
    {
      mukhi: '9 Mukhi',
      planet: 'Ketu',
      deity: 'Durga',
      purpose: 'Courage, Protection, Spiritual growth',
      color: 'text-gray-400',
    },
  ],
  premiumDetails: {
    enabled: true,
    tagline: 'Sacred Beads',
    titleLine1: 'The Purest',
    titleLine2Gold: 'Vedic Remedy',
    description:
      'Rudraksha is the purest of all remedies in the Vedic tradition, born from the tears of Lord Shiva. Discover the right mukhi Rudraksha to harmonize your planetary energies and shield you from negativity.',
    quote: '“Born from the tears of Shiva, Rudraksha is the ultimate shield.”',
    sloka: {
      sanskrit: 'विना भस्म त्रिपुंड्रेण विना रुद्राक्षमालया ।\nपूजितोऽपि महादेवो न तस्य फलदायकः ॥',
      transliteration:
        "Vinā bhasma tripuṇḍreṇa vinā rudrākṣa-mālayā\nPūjito'pi mahādevo na tasya phaladāyakaḥ",
      meaning:
        '“Without the sacred ash and without wearing Rudraksha, even if one worships Mahadeva, it does not yield the complete fruit of devotion.”',
    },
    infoCards: [
      {
        title: 'Why Rudraksha is Unique',
        icon: '🌿',
        subtitle: 'Core Principle: Rudraksha creates an energy shield around the wearer.',
        subSections: [
          {
            title: 'No negative side effects',
            points: [
              'Unlike gemstones, Rudraksha can never harm the wearer',
              'It pacifies malefic planets gently',
            ],
          },
          {
            title: 'Scientific & Spiritual',
            points: [
              'Known to regulate blood pressure and stress',
              'Enhances focus and meditation',
            ],
          },
        ],
      },
      {
        title: 'How to Wear Rudraksha',
        icon: '📿',
        points: [
          'Must be energized with Prana Pratishtha',
          'Best worn touching the skin (chest or throat)',
          'Should be removed during impure activities',
          'Maintained by regular cleaning and oiling',
        ],
      },
    ],
    summaryTitle: 'Final',
    summaryTitleGold: 'Thoughts',
    summaryPoints: [
      '✨ Rudraksha is a universal remedy',
      '🛡️ It acts as a protective energetic shield',
      '💎 Cannot cause harm, only provides support',
      '🙏 Deepens spiritual connection',
    ],
    summaryFooter: 'Consult our experts to find the right Mukhi for your specific needs.',
  },
};

export async function getServicePageContent<T>(serviceId: string, defaultContent: T): Promise<T> {
  try {
    const docRef = doc(db, 'content', `service_${serviceId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<T>;
      return {
        ...defaultContent,
        ...data,
      } as T;
    } else {
      return defaultContent;
    }
  } catch (error) {
    console.error(`Error fetching service content for ${serviceId}:`, error);
    return defaultContent;
  }
}

export async function updateServicePageContent<T>(serviceId: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, 'content', `service_${serviceId}`);
    await setDoc(docRef, data as any);
  } catch (error) {
    console.error(`Error updating service content for ${serviceId}:`, error);
    throw error;
  }
}
