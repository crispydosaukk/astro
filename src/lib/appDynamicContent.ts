import { db } from './firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export interface AppOnboardingSlide {
  id: string;
  order: number;
  title: string;
  titleHighlight: string;
  subtitle: string;
  icon: string;
  imageUrl: string;
  semanticLabel: string;
  active: boolean;
  updatedAt?: string;
}

export const DEFAULT_ONBOARDING_SLIDES: AppOnboardingSlide[] = [
  {
    id: 'slide-1',
    order: 1,
    title: 'Discover Your\nCosmic Path',
    titleHighlight: 'Cosmic Path',
    subtitle:
      'Personalised Vedic astrology based on your exact birth details. Understand your destiny through ancient wisdom.',
    icon: '✦',
    imageUrl:
      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=800',
    semanticLabel: 'Night sky with bright stars and Milky Way galaxy, deep cosmic blue tones',
    active: true,
  },
  {
    id: 'slide-2',
    order: 2,
    title: 'Talk to AI or\nReal Astrologers',
    titleHighlight: 'Real Astrologers',
    subtitle:
      'Get instant AI guidance 24/7 or connect with verified Vedic masters for deeper consultations.',
    icon: '◉',
    imageUrl: '/assets/images/onboarding_astrologer.jpg',
    semanticLabel: 'Vedic astrologer reading celestial birth chart with glowing cosmic wisdom',
    active: true,
  },
  {
    id: 'slide-3',
    order: 3,
    title: 'Your Astrology.\nYour Journey.',
    titleHighlight: 'Your Journey.',
    subtitle:
      'Kundli, predictions, remedies, reports and spiritual guidance — all personalised for your unique cosmic blueprint.',
    icon: '❋',
    imageUrl:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&fit=crop',
    semanticLabel: 'Beautiful golden sunrise over mountains with soft warm light rays',
    active: true,
  },
];

const COLLECTION_NAME = 'app_dynamic_content';
const DOC_ID = 'onboarding_slides';
const BANNERS_DOC_ID = 'home_banners';

export interface AppBanner {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  imageUrl: string;
  ctaText: string;
  ctaAction: string;
  active: boolean;
  updatedAt?: string;
}

export const DEFAULT_APP_BANNERS: AppBanner[] = [
  {
    id: 'banner-1',
    order: 1,
    title: 'Consult Master Astrologers Live',
    subtitle: 'Get instant answers for Career, Love & Finance. First 5 mins consultation free.',
    badge: 'Trending Now',
    badgeColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop',
    ctaText: 'Talk to Astrologer',
    ctaAction: '/live-astrologers-screen',
    active: true,
  },
  {
    id: 'banner-2',
    order: 2,
    title: '24/7 AI Vedic Astrologer',
    subtitle: 'Ask your Kundli questions anytime with our intelligent spiritual AI guide.',
    badge: 'AI Powered',
    badgeColor: 'indigo',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop',
    ctaText: 'Chat Now',
    ctaAction: '/ai-chat-screen',
    active: true,
  },
  {
    id: 'banner-3',
    order: 3,
    title: 'Daily Shubh Muhurat & Panchang',
    subtitle: 'Find the most auspicious planetary hours for ceremonies and business decisions.',
    badge: 'Daily Vedic Guide',
    badgeColor: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&fit=crop',
    ctaText: 'View Today Panchang',
    ctaAction: '/panchang-screen',
    active: true,
  },
];

/**
 * Fetch onboarding slides from Firestore (falls back to defaults if not found or on error)
 */
export async function getAppOnboardingSlides(): Promise<AppOnboardingSlide[]> {
  try {
    if (!db) return DEFAULT_ONBOARDING_SLIDES;

    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists() && snap.data()?.slides && Array.isArray(snap.data()?.slides)) {
      const slides = snap.data().slides as AppOnboardingSlide[];
      return slides.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (err) {
    console.warn('Could not fetch app onboarding slides from Firestore, using defaults:', err);
  }
  return DEFAULT_ONBOARDING_SLIDES;
}

/**
 * Save updated onboarding slides to Firestore
 */
export async function saveAppOnboardingSlides(slides: AppOnboardingSlide[]): Promise<boolean> {
  try {
    if (!db) return false;

    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    await setDoc(
      docRef,
      {
        slides,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving app onboarding slides to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch app promotional banners from Firestore
 */
export async function getAppBanners(): Promise<AppBanner[]> {
  try {
    if (!db) return DEFAULT_APP_BANNERS;

    const docRef = doc(db, COLLECTION_NAME, BANNERS_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists() && snap.data()?.banners && Array.isArray(snap.data()?.banners)) {
      const banners = snap.data().banners as AppBanner[];
      return banners.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (err) {
    console.warn('Could not fetch app banners from Firestore, using defaults:', err);
  }
  return DEFAULT_APP_APP_BANNERS_FALLBACK();
}

function DEFAULT_APP_APP_BANNERS_FALLBACK(): AppBanner[] {
  return DEFAULT_APP_BANNERS;
}

/**
 * Save updated banners to Firestore
 */
export async function saveAppBanners(banners: AppBanner[]): Promise<boolean> {
  try {
    if (!db) return false;

    const docRef = doc(db, COLLECTION_NAME, BANNERS_DOC_ID);
    await setDoc(
      docRef,
      {
        banners,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving app banners to Firestore:', err);
    throw err;
  }
}


/* ------------------------------------------------ Cosmic Insights Carousel */
const INSIGHTS_DOC_ID = 'cosmic_insights';

export interface CosmicInsightCard {
  id: string;
  order: number;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  active: boolean;
  ctaText: string;
  ctaAction: string;
  badgeColor?: string;
  planetTags?: string[];
  updatedAt?: string;
}

export const DEFAULT_COSMIC_INSIGHTS: CosmicInsightCard[] = [
  {
    id: 'insight-1',
    order: 1,
    tag: '✦ Your Cosmic Insight Today',
    title: 'Scorpio — Moon in Punarvasu Nakshatra',
    description: "Jupiter's transit brings divine clarity to your career path and financial growth today.",
    imageUrl: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=600',
    active: true,
    ctaText: "View Today's Guidance",
    ctaAction: '/ai-chat-screen',
    badgeColor: '#C9A84C',
    planetTags: ['Jupiter Transit', 'Punarvasu', 'Career Glow'],
  },
  {
    id: 'insight-2',
    order: 2,
    tag: '★ Rahu-Ketu Axis Transit',
    title: 'Transformative Soul Shifts Ahead',
    description: 'Auspicious Venus-Mercury harmony favors strategic contracts, spiritual sadhana, and emotional peace.',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop',
    active: true,
    ctaText: 'Ask AI Astrologer',
    ctaAction: '/ai-chat-screen',
    badgeColor: '#8B1A1A',
    planetTags: ['Venus Shanti', 'Mercury Direct', 'Harmony'],
  },
  {
    id: 'insight-3',
    order: 3,
    tag: '❋ Auspicious Shubh Muhurat',
    title: 'Abhijit Muhurat: 11:48 AM – 12:36 PM',
    description: 'Optimal celestial alignment for launching initiatives, closing deals, or beginning sacred remedies.',
    imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&fit=crop',
    active: true,
    ctaText: 'Explore Panchang',
    ctaAction: '/panchang-screen',
    badgeColor: '#3DCB7A',
    planetTags: ['Abhijit Muhurat', 'Amrit Kaal', 'Vijay Yoga'],
  },
];

export async function getCosmicInsights(): Promise<CosmicInsightCard[]> {
  try {
    if (!db) return DEFAULT_COSMIC_INSIGHTS;

    const docRef = doc(db, COLLECTION_NAME, INSIGHTS_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists() && snap.data()?.insights && Array.isArray(snap.data()?.insights)) {
      const insights = snap.data().insights as CosmicInsightCard[];
      return insights.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (err) {
    console.warn('Could not fetch cosmic insights from Firestore, using defaults:', err);
  }
  return DEFAULT_COSMIC_INSIGHTS;
}

export async function saveCosmicInsights(insights: CosmicInsightCard[]): Promise<boolean> {
  try {
    if (!db) return false;

    const docRef = doc(db, COLLECTION_NAME, INSIGHTS_DOC_ID);
    await setDoc(
      docRef,
      {
        insights,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving cosmic insights to Firestore:', err);
    throw err;
  }
}

/* ------------------------------------------------ App Services & Remedies */
const SERVICES_DOC_ID = 'app_services';
const SERVICE_CATEGORIES_DOC_ID = 'app_service_categories';

export interface AppServiceItem {
  id: string;
  order: number;
  category: string;
  name: string;
  sanskrit?: string;
  desc: string;
  direction?: string;
  directionHindi?: string;
  mantra?: string;
  icon: string;
  route: string;
  color: string;
  badge?: string;
  active: boolean;
  isRemediesCard?: boolean;
  updatedAt?: string;
}

export interface AppServiceCategory {
  id: string;
  order: number;
  category: 'remedies' | 'panchang' | 'kundli' | 'consultations' | 'guidance' | string;
  title: string;
  sanskrit: string;
  desc: string;
  badge?: string;
  tabLabel?: string;
  icon: string;
  color: string;
  active: boolean;
  items: AppServiceItem[];
  updatedAt?: string;
}

export const DEFAULT_SERVICE_CATEGORIES: AppServiceCategory[] = [
  {
    id: 'cat-remedies',
    order: 1,
    category: 'remedies',
    title: 'Sacred Vedic Remedies',
    sanskrit: 'अष्ट परिहार • Ashta-Digbandhana',
    desc: 'Harmonize planetary energies through authentic Vedic remedies prescribed by the 8 sacred directions.',
    badge: '8 in 1 Card',
    tabLabel: 'Remedies',
    icon: 'auto_awesome',
    color: '#713B32',
    active: true,
    items: [
      {
        id: 'rem-mantra',
        order: 1,
        category: 'remedies',
        name: 'Mantra Shakti (मन्त्र शक्ति)',
        sanskrit: 'मन्त्र शक्ति',
        direction: 'North',
        directionHindi: 'उत्तर (North)',
        desc: 'Sacred sound vibrations that align planetary energies',
        mantra: 'ॐ ह्रीं श्रीं क्लीं चामुण्डायै विच्चे ॥',
        icon: 'auto_awesome',
        route: '/remedy-detail-screen',
        color: '#9370DB',
        badge: 'North',
        active: true,
      },
      {
        id: 'rem-yantra',
        order: 2,
        category: 'remedies',
        name: 'Yantra (यन्त्र)',
        sanskrit: 'यन्त्र',
        direction: 'North-East',
        directionHindi: 'ईशान (North-East)',
        desc: 'Sacred geometric diagrams that attract cosmic energies',
        mantra: 'ॐ श्रीं ह्रीं क्लीं नमः ॥',
        icon: 'auto_awesome',
        route: '/remedy-detail-screen',
        color: '#FFD700',
        badge: 'North-East',
        active: true,
      },
      {
        id: 'rem-homa',
        order: 3,
        category: 'remedies',
        name: 'Homa (होम / हवन)',
        sanskrit: 'होम / हवन',
        direction: 'East',
        directionHindi: 'पूर्व (East)',
        desc: 'Sacred fire rituals to purify and invoke divine blessings',
        mantra: 'ॐ अग्नये स्वाहा ॥',
        icon: 'whatshot',
        route: '/remedy-detail-screen',
        color: '#FF6B35',
        badge: 'East',
        active: true,
      },
      {
        id: 'rem-devata',
        order: 4,
        category: 'remedies',
        name: 'Devata Upasana (देवता उपासना)',
        sanskrit: 'देवता उपासना',
        direction: 'South-East',
        directionHindi: 'आग्नेय (South-East)',
        desc: 'Personal deity worship for spiritual alignment',
        mantra: 'ॐ नमः शिवाय ॥',
        icon: 'wb_sunny',
        route: '/remedy-detail-screen',
        color: '#FFB347',
        badge: 'South-East',
        active: true,
      },
      {
        id: 'rem-ratna',
        order: 5,
        category: 'remedies',
        name: 'Ratna / Gemstones (रत्न)',
        sanskrit: 'रत्न',
        direction: 'South',
        directionHindi: 'दक्षिण (South)',
        desc: 'Planetary gemstones to strengthen beneficial influences',
        mantra: 'ॐ ग्रहाय नमः ॥',
        icon: 'diamond',
        route: '/remedy-detail-screen',
        color: '#4FC3F7',
        badge: 'South (S)',
        active: true,
      },
      {
        id: 'rem-rudraksha',
        order: 6,
        category: 'remedies',
        name: 'Rudraksha (रुद्राक्ष)',
        sanskrit: 'रुद्राक्ष',
        direction: 'South-West',
        directionHindi: 'नैऋत्य (South-West)',
        desc: 'Sacred seeds of Lord Shiva for protection and healing',
        mantra: 'ॐ नमः शिवाय ॥',
        icon: 'spa',
        route: '/remedy-detail-screen',
        color: '#8B4513',
        badge: 'South-West (SW)',
        active: true,
      },
      {
        id: 'rem-vastu',
        order: 7,
        category: 'remedies',
        name: 'Vastu (वास्तु)',
        sanskrit: 'वास्तु',
        direction: 'West',
        directionHindi: 'पश्चिम (West)',
        desc: 'Sacred architecture for harmonious living spaces',
        mantra: 'ॐ वास्तुपुरुषाय नमः ॥',
        icon: 'home',
        route: '/remedy-detail-screen',
        color: '#81C784',
        badge: 'West (W)',
        active: true,
      },
      {
        id: 'rem-charity',
        order: 8,
        category: 'remedies',
        name: 'Dāna & Seva (दान एवं सेवा)',
        sanskrit: 'दान एवं सेवा',
        direction: 'North-West',
        directionHindi: 'वायव्य (North-West)',
        desc: 'Charitable giving and selfless service for karmic balance',
        mantra: 'ॐ परोपकाराय नमः ॥',
        icon: 'favorite',
        route: '/remedy-detail-screen',
        color: '#FF6B6B',
        badge: 'North-West (NW)',
        active: true,
      },
    ],
  },
  {
    id: 'cat-free-tools',
    order: 2,
    category: 'kundli',
    title: 'Free Services & Tools',
    sanskrit: 'निःशुल्क वैदिक सेवाएं',
    desc: 'Personalized Vedic birth charts, compatibility, Panchang, daily horoscope, meditation & fasting planners.',
    badge: 'Free',
    tabLabel: 'Free Tools',
    icon: 'auto_stories',
    color: '#9370DB',
    active: true,
    items: [
      {
        id: 'tool-janam-kundli',
        order: 1,
        category: 'kundli',
        name: 'Janam Kundli',
        sanskrit: 'जन्म कुंडली',
        desc: 'Personalized Vedic birth chart & life predictions',
        icon: 'auto_stories',
        route: '/my-kundli-screen',
        color: '#9370DB',
        badge: 'Free',
        active: true,
      },
      {
        id: 'tool-kundli-match',
        order: 2,
        category: 'kundli',
        name: 'Kundli Matching',
        sanskrit: 'कुंडली मिलान',
        desc: 'Vedic Gun Milan & marital compatibility check',
        icon: 'favorite_border',
        route: '/match-kundli-screen',
        color: '#FF6B6B',
        badge: 'Free',
        active: true,
      },
      {
        id: 'tool-panchang',
        order: 3,
        category: 'kundli',
        name: 'Panchang',
        sanskrit: 'पंचांग',
        desc: 'Tithi, Nakshatra, Yoga & Shubh Muhurat',
        icon: 'calendar_today_outlined',
        route: '/panchang-screen',
        color: '#4FC3F7',
        badge: 'Free',
        active: true,
      },
      {
        id: 'tool-horoscope',
        order: 4,
        category: 'kundli',
        name: 'Daily Horoscope',
        sanskrit: 'दैनिक राशिफल',
        desc: 'Daily zodiac forecasts & lucky guidance',
        icon: 'wb_sunny_outlined',
        route: '/horoscope-screen',
        color: '#FFB347',
        badge: 'Free',
        active: true,
      },
      {
        id: 'tool-meditation',
        order: 5,
        category: 'kundli',
        name: 'Meditation Guide',
        sanskrit: 'ध्यान एवं प्राणायाम',
        desc: 'Mindfulness, mantras & spiritual alignment',
        icon: 'self_improvement',
        route: 'meditation_modal',
        color: '#81C784',
        badge: 'Free',
        active: true,
      },
      {
        id: 'tool-fasting',
        order: 6,
        category: 'kundli',
        name: 'Fasting Planner',
        sanskrit: 'व्रत एवं उपवास तालिका',
        desc: 'Sacred Vrat schedules, rules & rituals',
        icon: 'event_note',
        route: 'fasting_modal',
        color: '#E91E63',
        badge: 'Free',
        active: true,
      },
    ],
  },
  {
    id: 'cat-mahadasha',
    order: 3,
    category: 'mahadasha',
    title: 'Mahadasha Guides (Paid PDFs)',
    sanskrit: 'महादशा विशेष संकलन • PDF Dossiers',
    desc: 'In-depth downloadable PDF blueprints with exact Sanskrit mantras, dietary rules, and planetary remedies.',
    badge: 'Paid PDFs',
    tabLabel: 'Mahadasha',
    icon: 'menu_book',
    color: '#FF6B35',
    active: true,
    items: [
      {
        id: 'maha-rahu-stab',
        order: 1,
        category: 'mahadasha',
        name: 'Rahu Mahadasha Stabilisation Guide',
        sanskrit: 'राहु महादशा शांति संकलन',
        desc: 'Harmonize intense Rahu transit & remedies (PDF Dossier)',
        icon: 'shield',
        route: 'mahadasha_rahu-stabilisation',
        color: '#713B32',
        badge: '₹499',
        active: true,
      },
      {
        id: 'maha-rahu-surv',
        order: 2,
        category: 'mahadasha',
        name: 'Rahu Mahadasha Survival Guide',
        sanskrit: 'राहु महादशा सर्वाइवल गाइड',
        desc: 'Tactical survival & protective mantras (PDF Dossier)',
        icon: 'local_fire_department',
        route: 'mahadasha_rahu-survival',
        color: '#E65100',
        badge: '₹999',
        active: true,
      },
      {
        id: 'maha-sani-stab',
        order: 3,
        category: 'mahadasha',
        name: 'Sani Mahadasha Stabilisation Guide',
        sanskrit: 'शनि महादशा शांति संकलन',
        desc: 'Saturn discipline, endurance & remedies (PDF Dossier)',
        icon: 'shield',
        route: 'mahadasha_sani-stabilisation',
        color: '#1A3D5C',
        badge: '₹499',
        active: true,
      },
      {
        id: 'maha-sani-surv',
        order: 4,
        category: 'mahadasha',
        name: 'Sani Mahadasha Survival Guide',
        sanskrit: 'शनि महादशा सर्वाइवल गाइड',
        desc: 'Navigating Saturn trials & karmic phase (PDF Dossier)',
        icon: 'bolt',
        route: 'mahadasha_sani-survival',
        color: '#4A148C',
        badge: '₹999',
        active: true,
      },
    ],
  },
  {
    id: 'cat-panchang',
    order: 4,
    category: 'panchang',
    title: 'Panchang & Sacred Timings',
    sanskrit: 'पंचांग एवं शुभ मुहूर्त • Celestial Almanac',
    desc: 'Real-time Tithi, Nakshatra, Shubh Muhurat, Rahu Kaal, Choghadiya and Hora calculations.',
    badge: 'Live Almanac',
    tabLabel: 'Panchang',
    icon: 'calendar_today_outlined',
    color: '#4FC3F7',
    active: true,
    items: [
      {
        id: 'pan-today',
        order: 1,
        category: 'panchang',
        name: 'Today Panchang',
        sanskrit: 'आज का पंचांग',
        desc: 'Tithi, Nakshatra, Yoga & Shubh Muhurat',
        icon: 'calendar_today_outlined',
        route: '/panchang-screen',
        color: '#4FC3F7',
        badge: 'Live',
        active: true,
      },
      {
        id: 'pan-tomorrow',
        order: 2,
        category: 'panchang',
        name: 'Tomorrow Panchang',
        sanskrit: 'कल का पंचांग',
        desc: 'Advance next-day celestial alignments',
        icon: 'event_outlined',
        route: '/panchang-screen',
        color: '#81C784',
        badge: 'Advance',
        active: true,
      },
      {
        id: 'pan-tithi',
        order: 3,
        category: 'panchang',
        name: 'Tithi',
        sanskrit: 'तिथि एवं पक्ष',
        desc: 'Lunar phases & paksha calculations',
        icon: 'nightlight_round',
        route: '/panchang-screen',
        color: '#9370DB',
        badge: 'Lunar',
        active: true,
      },
      {
        id: 'pan-vaar',
        order: 4,
        category: 'panchang',
        name: 'Vaar',
        sanskrit: 'वार एवं अधिष्ठाता देवता',
        desc: 'Seven day lords & planetary deity',
        icon: 'wb_sunny_outlined',
        route: '/panchang-screen',
        color: '#FFB347',
        badge: 'Solar',
        active: true,
      },
      {
        id: 'pan-karana',
        order: 5,
        category: 'panchang',
        name: 'Karana',
        sanskrit: 'करण',
        desc: 'Half-tithi interval for action planning',
        icon: 'auto_awesome',
        route: '/panchang-screen',
        color: '#4FC3F7',
        badge: 'Half-Tithi',
        active: true,
      },
      {
        id: 'pan-muhurat',
        order: 6,
        category: 'panchang',
        name: 'Shubh Muhurat',
        sanskrit: 'शुभ मुहूर्त',
        desc: 'Auspicious Abhijit & Amrit timing windows',
        icon: 'event_available_outlined',
        route: '/muhurat-screen',
        color: '#FFD700',
        badge: 'Auspicious',
        active: true,
      },
      {
        id: 'pan-rahu',
        order: 7,
        category: 'panchang',
        name: 'Rahu Kaal & Cautions',
        sanskrit: 'राहु काल एवं यमघंट',
        desc: 'Inauspicious Rahu periods & cautions',
        icon: 'warning_amber_outlined',
        route: '/muhurat-screen',
        color: '#FF6B6B',
        badge: 'Caution',
        active: true,
      },
      {
        id: 'pan-choghadiya',
        order: 8,
        category: 'panchang',
        name: 'Choghadiya',
        sanskrit: 'चौघड़िया',
        desc: 'Day & night 7-fold auspicious divisions',
        icon: 'explore_outlined',
        route: '/panchang-screen',
        color: '#FFB347',
        badge: '7-Fold',
        active: true,
      },
      {
        id: 'pan-hora',
        order: 9,
        category: 'panchang',
        name: 'Hora',
        sanskrit: 'होरा',
        desc: 'Hourly planetary ruler alignment & tasks',
        icon: 'schedule_outlined',
        route: '/panchang-screen',
        color: '#9370DB',
        badge: 'Hourly',
        active: true,
      },
    ],
  },
  {
    id: 'cat-consultations',
    order: 5,
    category: 'consultations',
    title: 'Consultations & AI Astrologer',
    sanskrit: 'विशेषज्ञ ज्योतिष परामर्श',
    desc: 'Direct guidance from verified Vedic scholars and 24/7 AI spiritual intelligence.',
    badge: 'Direct Access',
    tabLabel: 'Consultations',
    icon: 'people_outline',
    color: '#81C784',
    active: true,
    items: [
      {
        id: 'con-live',
        order: 1,
        category: 'consultations',
        name: 'Talk to Astrologer',
        sanskrit: 'ज्योतिषी से बात करें',
        desc: 'Live 1-on-1 consultations with verified Vedic masters',
        icon: 'people_outline',
        route: '/live-astrologers-screen',
        color: '#81C784',
        badge: 'Live',
        active: true,
      },
      {
        id: 'con-ai',
        order: 2,
        category: 'consultations',
        name: 'AI Expert Astrologer',
        sanskrit: 'एआई ज्योतिषी',
        desc: '24/7 instant Kundli calculations, remedies & guidance',
        icon: 'auto_awesome',
        route: '/ai-chat-screen',
        color: '#713B32',
        badge: '24/7',
        active: true,
      },
    ],
  },
  {
    id: 'cat-guidance',
    order: 6,
    category: 'guidance',
    title: 'Specialized Life Guidance',
    sanskrit: 'विशेष जीवन मार्गदर्शन',
    desc: 'In-depth astrological solutions for career, relationships, business, wealth, and destiny.',
    badge: 'Comprehensive',
    tabLabel: 'Guidance',
    icon: 'psychology_outlined',
    color: '#FFB347',
    active: true,
    items: [
      {
        id: 'gui-career',
        order: 1,
        category: 'guidance',
        name: 'Career Astrology',
        sanskrit: 'करियर मार्गदर्शन',
        desc: 'Career path, promotions, switch timings & business success',
        icon: 'work_outline',
        route: '/career-astrology-screen',
        color: '#FFD700',
        active: true,
      },
      {
        id: 'gui-marriage',
        order: 2,
        category: 'guidance',
        name: 'Marriage Astrology',
        sanskrit: 'विवाह एवं संबंध',
        desc: 'Marriage timing, spouse characteristics & relationship harmony',
        icon: 'ring_volume_outlined',
        route: '/marriage-astrology-screen',
        color: '#FF6B6B',
        active: true,
      },
      {
        id: 'gui-business',
        order: 3,
        category: 'guidance',
        name: 'Business Astrology',
        sanskrit: 'व्यापार मुहूर्त',
        desc: 'Company launch, partnerships & auspicious commencement',
        icon: 'business_center_outlined',
        route: '/business-astrology-screen',
        color: '#4FC3F7',
        active: true,
      },
      {
        id: 'gui-finance',
        order: 4,
        category: 'guidance',
        name: 'Finance Astrology',
        sanskrit: 'धन एवं समृद्धि',
        desc: 'Dhana Yogas, wealth accumulation & investment windows',
        icon: 'attach_money',
        route: '/finance-astrology-screen',
        color: '#81C784',
        active: true,
      },
      {
        id: 'gui-tarot',
        order: 5,
        category: 'guidance',
        name: 'Tarot Reading',
        sanskrit: 'टैरो कार्ड परामर्श',
        desc: 'Intuitive card spreads for immediate clarity and insight',
        icon: 'style_outlined',
        route: '/tarot-screen',
        color: '#9370DB',
        active: true,
      },
      {
        id: 'gui-numerology',
        order: 6,
        category: 'guidance',
        name: 'Numerology',
        sanskrit: 'अंक ज्योतिष',
        desc: 'Life path numbers, name vibrations & lucky dates',
        icon: 'pin_outlined',
        route: '/numerology-screen',
        color: '#FFB347',
        active: true,
      },
      {
        id: 'gui-spiritual',
        order: 7,
        category: 'guidance',
        name: 'Spiritual Guidance',
        sanskrit: 'आध्यात्मिक साधना',
        desc: 'Mantra sadhana, chakra balancing & karmic alignment',
        icon: 'self_improvement',
        route: '/spiritual-guidance-screen',
        color: '#FF6B6B',
        active: true,
      },
    ],
  },
];

export const DEFAULT_APP_SERVICES: AppServiceItem[] = DEFAULT_SERVICE_CATEGORIES.flatMap(
  (c) => c.items
);

export async function getAppServiceCategories(): Promise<AppServiceCategory[]> {
  try {
    if (!db) return DEFAULT_SERVICE_CATEGORIES;

    const docRef = doc(db, COLLECTION_NAME, SERVICE_CATEGORIES_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists() && snap.data()?.categories && Array.isArray(snap.data()?.categories)) {
      const categories = snap.data().categories as AppServiceCategory[];
      return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (err) {
    console.warn('Could not fetch app service categories from Firestore, using defaults:', err);
  }
  return DEFAULT_SERVICE_CATEGORIES;
}

export async function saveAppServiceCategories(categories: AppServiceCategory[]): Promise<boolean> {
  try {
    if (!db) return false;

    const docRef = doc(db, COLLECTION_NAME, SERVICE_CATEGORIES_DOC_ID);
    await setDoc(
      docRef,
      {
        categories,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving app service categories to Firestore:', err);
    throw err;
  }
}

export async function getAppServices(): Promise<AppServiceItem[]> {
  try {
    const categories = await getAppServiceCategories();
    return categories.flatMap((c) => c.items).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (err) {
    console.warn('Could not fetch app services from categories, using defaults:', err);
  }
  return DEFAULT_APP_SERVICES;
}

export async function saveAppServices(services: AppServiceItem[]): Promise<boolean> {
  try {
    if (!db) return false;

    const docRef = doc(db, COLLECTION_NAME, SERVICES_DOC_ID);
    await setDoc(
      docRef,
      {
        services,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving app services to Firestore:', err);
    throw err;
  }
}

// ==========================================
// APP DYNAMIC: PROFILE SCREEN & MENU CONFIG
// ==========================================
export const PROFILE_CONFIG_DOC_ID = 'app_profile_config';

export interface AppProfileMenuItem {
  id: string;
  order: number;
  labelKey: string;
  defaultLabel: string;
  subtitle?: string;
  icon: string;
  route: string;
  action?: string;
  badge?: string;
  badgeColor?: string;
  active: boolean;
  value?: string;
}

export interface AppProfileSection {
  id: string;
  order: number;
  title: string;
  labelKey?: string;
  active: boolean;
  items: AppProfileMenuItem[];
}

export interface AppProfileConfig {
  headerTitle: string;
  welcomeGuestText: string;
  guestSubtitle: string;
  guestSignInButtonText: string;
  defaultMemberBadge: string;

  // Quick Stats
  showWalletStat: boolean;
  walletStatLabel: string;
  showConsultationStat: boolean;
  consultationStatLabel: string;
  showReportsStat: boolean;
  reportsStatLabel: string;

  // Astrological Signs Trio
  showAstroTrio: boolean;
  zodiacStatLabel: string;
  defaultZodiac: string;
  moonSignStatLabel: string;
  defaultMoonSign: string;
  nakshatraStatLabel: string;
  defaultNakshatra: string;

  // VIP Gold Promo Banner
  vipEnabled: boolean;
  vipBadge: string;
  vipTitle: string;
  vipSubtitle: string;
  vipCtaText: string;
  vipCtaRoute: string;
  vipEmoji: string;

  // Support Care Card
  showSupportCard: boolean;
  supportCardTitle: string;
  supportPhone: string;
  supportPhoneLabel: string;
  supportEmail: string;
  helplineHoursPrefix: string;
  helplineHours: string;

  // Sign In / Out
  signOutButtonText: string;
  signOutConfirmTitle: string;
  signOutConfirmMessage: string;
  cancelButtonText: string;

  // Edit Profile Sheet
  editProfileTitle: string;
  editNameLabel: string;
  editPhoneOrEmailLabel: string;
  editDobLabel: string;
  editTobLabel: string;
  editPobLabel: string;
  editSaveButtonText: string;

  // Footer & Sanskrit
  appVersionText: string;
  sanskritTagline: string;

  // Menu Sections & Items
  sections: AppProfileSection[];
  updatedAt?: string;
}

export const DEFAULT_APP_PROFILE_CONFIG: AppProfileConfig = {
  headerTitle: 'Profile',
  welcomeGuestText: 'Guest Explorer • Tap to Sign In',
  guestSubtitle: 'Sign in to sync your profile, birth charts & consultations',
  guestSignInButtonText: 'Sign In / Register',
  defaultMemberBadge: 'AstroParihar Member',

  showWalletStat: true,
  walletStatLabel: 'Wallet',
  showConsultationStat: true,
  consultationStatLabel: 'Consultations',
  showReportsStat: true,
  reportsStatLabel: 'Reports',

  showAstroTrio: true,
  zodiacStatLabel: 'Zodiac',
  defaultZodiac: 'Scorpio',
  moonSignStatLabel: 'Moon Sign',
  defaultMoonSign: 'Cancer',
  nakshatraStatLabel: 'Nakshatra',
  defaultNakshatra: 'Pushya',

  vipEnabled: true,
  vipBadge: 'ASTROPARIHAR GOLD',
  vipTitle: 'Unlock Sacred Kundli & Infinite Wisdom',
  vipSubtitle: 'Unlimited Kundli matching, detailed Mahadasha PDF reports, and 24/7 AI consultations.',
  vipCtaText: 'Upgrade to Gold Seeker',
  vipCtaRoute: '/wallet-screen',
  vipEmoji: '👑',

  showSupportCard: true,
  supportCardTitle: 'Spiritual Care & Help Desk',
  supportPhone: '+91 98765 43210',
  supportPhoneLabel: 'Helpline',
  supportEmail: 'support@astroparihar.com',
  helplineHoursPrefix: 'Helpline: ',
  helplineHours: 'Mon - Sun: 8:00 AM – 11:00 PM IST',

  signOutButtonText: 'Sign Out',
  signOutConfirmTitle: 'Sign Out',
  signOutConfirmMessage: 'Are you sure you want to sign out? Your astrological charts will remain securely saved.',
  cancelButtonText: 'Cancel',

  editProfileTitle: 'Edit Profile Details',
  editNameLabel: 'Full Name',
  editPhoneOrEmailLabel: 'Phone / Email',
  editDobLabel: 'Date of Birth (DD/MM/YYYY)',
  editTobLabel: 'Time of Birth (e.g. 10:30 AM)',
  editPobLabel: 'Place of Birth (City, State)',
  editSaveButtonText: 'Save Profile Details',

  appVersionText: 'AstroParihar v2.4.0 • Sacred Vedic Wisdom',
  sanskritTagline: '॥ लोकाः समस्ताः सुखिनो भवन्तु ॥',

  sections: [
    {
      id: 'my-astrology',
      order: 1,
      title: 'MY ASTROLOGY',
      labelKey: 'profile.myAstrology',
      active: true,
      items: [
        { id: 'myKundli', order: 1, labelKey: 'profile.myKundli', defaultLabel: 'My Kundli', subtitle: 'Your detailed birth chart & planetary positions', icon: 'auto_stories', route: '/my-kundli-screen', active: true },
        { id: 'myRemedies', order: 2, labelKey: 'profile.myRemedies', defaultLabel: 'My Remedies (अष्ट परिहार)', subtitle: 'Personalised 8-directional remedial remedies', icon: 'auto_awesome', route: '/remedies-screen', badge: '8 in 1', active: true },
        { id: 'birthProfiles', order: 3, labelKey: 'profile.birthProfiles', defaultLabel: 'Birth Profiles', subtitle: 'Family, partner & seeker kundli profiles', icon: 'person_outline_rounded', route: '/birth-profiles-screen', active: true },
        { id: 'kundliReports', order: 4, labelKey: 'profile.kundliReports', defaultLabel: 'Kundli & Service Reports', subtitle: 'Saved astrology predictions & PDF reports', icon: 'description_outlined', route: '/kundli-reports-screen', active: true },
        { id: 'matchReports', order: 5, labelKey: 'profile.matchReports', defaultLabel: 'Match Reports', subtitle: '36 Guna Ashtakoot matrimonial reports', icon: 'favorite_border', route: '/match-reports-screen', active: true },
        { id: 'panchangReports', order: 6, labelKey: 'profile.panchangReports', defaultLabel: 'Panchang & Muhurat', subtitle: 'Daily Vedic almanac, tithi & auspicious timings', icon: 'calendar_today_outlined', route: '/panchang-screen', active: true },
        { id: 'savedAstrologers', order: 7, labelKey: 'profile.savedAstrologers', defaultLabel: 'Saved Astrologers', subtitle: 'Your favorite verified Vedic consultants', icon: 'star_outline', route: '/saved-astrologers-screen', active: true },
        { id: 'consultationHistory', order: 8, labelKey: 'profile.consultationHistory', defaultLabel: 'Consultation History', subtitle: 'Past audio, video & AI chat recordings', icon: 'history', route: '/consultation-history-screen', active: true },
      ],
    },
    {
      id: 'my-account',
      order: 2,
      title: 'MY ACCOUNT & BILLING',
      labelKey: 'profile.myAccount',
      active: true,
      items: [
        { id: 'wallet', order: 1, labelKey: 'profile.wallet', defaultLabel: 'Wallet', subtitle: 'View balance, add funds & recharge offers', icon: 'account_balance_wallet_outlined', route: '/wallet-screen', active: true },
        { id: 'transactions', order: 2, labelKey: 'profile.transactions', defaultLabel: 'Transactions', subtitle: 'Detailed billing history & payment receipts', icon: 'receipt_long_outlined', route: '/wallet-screen', active: true },
        { id: 'paymentMethods', order: 3, labelKey: 'profile.paymentMethods', defaultLabel: 'Payment Methods', subtitle: 'UPI, Cards, Netbanking & Saved options', icon: 'credit_card_outlined', route: '/wallet-screen', active: true },
        { id: 'notifications', order: 4, labelKey: 'profile.notifications', defaultLabel: 'Notifications', subtitle: 'Daily horoscopes, muhurat & chat alerts', icon: 'notifications_outlined', route: '/notifications-screen', active: true },
      ],
    },
    {
      id: 'preferences',
      order: 3,
      title: 'PREFERENCES',
      labelKey: 'profile.preferences',
      active: true,
      items: [
        { id: 'language', order: 1, labelKey: 'profile.language', defaultLabel: 'Language', subtitle: 'Choose Telugu, Hindi, English, Tamil, etc.', icon: 'translate', route: '/language-screen', action: 'languageModal', active: true },
        { id: 'theme', order: 2, labelKey: 'profile.theme', defaultLabel: 'Theme', subtitle: 'Switch between Light Vedic and Dark Cosmic', icon: 'palette_outlined', route: '/theme-screen', action: 'themeToggle', active: true },
        { id: 'notificationSettings', order: 3, labelKey: 'profile.notificationSettings', defaultLabel: 'Notification Settings', subtitle: 'Manage reminders, panchang & astro alerts', icon: 'tune_outlined', route: '/notification-settings-screen', active: true },
        { id: 'privacy', order: 4, labelKey: 'profile.privacy', defaultLabel: 'Privacy', subtitle: 'Manage your birth chart & account privacy', icon: 'lock_outline_rounded', route: '/privacy-screen', active: true },
        { id: 'security', order: 5, labelKey: 'profile.security', defaultLabel: 'Security', subtitle: 'Biometric lock, PIN & authentication', icon: 'security_outlined', route: '/security-screen', active: true },
      ],
    },
    {
      id: 'support',
      order: 4,
      title: 'SUPPORT & LEGAL',
      labelKey: 'profile.support',
      active: true,
      items: [
        { id: 'helpCentre', order: 1, labelKey: 'profile.helpCentre', defaultLabel: 'Help Centre', subtitle: 'Guides, tutorials and knowledge base', icon: 'help_outline_rounded', route: '/help-centre-screen', active: true },
        { id: 'contactSupport', order: 2, labelKey: 'profile.contactSupport', defaultLabel: 'Contact Support', subtitle: 'Reach our spiritual care team 24/7', icon: 'support_agent_outlined', route: '/contact-support-screen', active: true },
        { id: 'faqs', order: 3, labelKey: 'profile.faqs', defaultLabel: 'FAQs', subtitle: 'Frequently asked astrological questions', icon: 'quiz_outlined', route: '/help-centre-screen', active: true },
        { id: 'terms', order: 4, labelKey: 'profile.terms', defaultLabel: 'Terms of Service', subtitle: 'Platform usage rules and spiritual disclaimers', icon: 'gavel_outlined', route: '/terms-screen', active: true },
        { id: 'privacyPolicy', order: 5, labelKey: 'profile.privacyPolicy', defaultLabel: 'Privacy Policy', subtitle: 'Birth data privacy and security measures', icon: 'policy_outlined', route: '/privacy-policy-screen', active: true },
      ],
    },
  ],
};

export async function getAppProfileConfig(): Promise<AppProfileConfig> {
  try {
    if (!db) return DEFAULT_APP_PROFILE_CONFIG;

    const docRef = doc(db, COLLECTION_NAME, PROFILE_CONFIG_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists() && snap.data()?.config) {
      return { ...DEFAULT_APP_PROFILE_CONFIG, ...(snap.data().config as AppProfileConfig) };
    }
  } catch (err) {
    console.warn('Could not fetch app profile config from Firestore, using defaults:', err);
  }
  return DEFAULT_APP_PROFILE_CONFIG;
}

export async function saveAppProfileConfig(config: AppProfileConfig): Promise<boolean> {
  try {
    if (!db) return false;

    const docRef = doc(db, COLLECTION_NAME, PROFILE_CONFIG_DOC_ID);
    await setDoc(
      docRef,
      {
        config,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving app profile config to Firestore:', err);
    throw err;
  }
}
