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

  // Sign In / Out & Delete Account
  signOutButtonText: string;
  signOutConfirmTitle: string;
  signOutConfirmMessage: string;
  cancelButtonText: string;
  deleteAccountButtonText?: string;
  deleteAccountConfirmTitle?: string;
  deleteAccountConfirmMessage?: string;
  deleteAccountSuccessTitle?: string;
  deleteAccountSuccessMessage?: string;

  // Birth Details & Guest Card Labels
  birthDetailsCardTitle?: string;
  birthDetailsCardSubtitle?: string;
  editButtonLabel?: string;
  switchProfileSuffix?: string;
  guestCardTitle?: string;
  guestCardSubtitle?: string;
  guestCardNotice?: string;
  guestCardFeatures?: string[];
  selectLanguageTitle?: string;

  // Edit Profile Sheet
  editProfileTitle: string;
  editProfileSubtitle?: string;
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
  deleteAccountButtonText: 'Delete Account Permanently',
  deleteAccountConfirmTitle: 'Delete Account Permanently?',
  deleteAccountConfirmMessage:
    'Are you sure you want to permanently delete your AstroParihar account?\n\nAll your Janam Kundli charts, consultations, wallet balance, and birth profiles will be erased forever.\n\nOnce deleted, this phone number cannot be reused to log in.',
  deleteAccountSuccessTitle: 'Account Deleted',
  deleteAccountSuccessMessage: 'Your account has been deleted. You can no longer log in with this phone number.',

  birthDetailsCardTitle: 'Birth Details & Location',
  birthDetailsCardSubtitle: 'Verified Vedic Kundli Baseline',
  editButtonLabel: 'Edit',
  switchProfileSuffix: 'Switch Profile',
  guestCardTitle: 'Sign In to AstroParihar',
  guestCardSubtitle: 'Sign in to unlock your full spiritual profile',
  guestCardNotice:
    'Sign in to access your personal Kundli, birth charts, detailed reports, daily Panchang, saved astrologers, wallet & transaction receipts.',
  guestCardFeatures: [
    'My Kundli & Birth Chart',
    'Kundli & Service Reports',
    'Panchang & Auspicious Muhurat',
    'Saved Astrologers',
    'Wallet Balance & Transactions',
  ],
  selectLanguageTitle: 'Select Language',

  editProfileTitle: 'Edit Profile Details',
  editProfileSubtitle: 'Manage personal Vedic information',
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

// ===================================================
// APP DYNAMIC: SUPPORT, LEGAL, PRIVACY & SECURITY
// ===================================================
export const SUPPORT_LEGAL_DOC_ID = 'support_legal_content';

export interface AppTopicCategory {
  emoji: string;
  title: string;
  count: number;
  color: string;
}

export interface AppFaqItem {
  q: string;
  a: string;
  category?: string;
}

export interface AppContactOption {
  emoji: string;
  title: string;
  desc: string;
  color: string;
  action: string;
  actionType?: 'chat' | 'email' | 'call' | 'whatsapp';
  value?: string;
}

export interface AppHelpCentreContent {
  appBarTitle: string;
  searchPlaceholder: string;
  needHelpBanner: {
    emoji: string;
    title: string;
    subtitle: string;
  };
  browseTopicsTitle: string;
  categories: AppTopicCategory[];
  faqsTitle: string;
  faqs: AppFaqItem[];
  noResultsText: string;
}

export interface AppContactSupportContent {
  appBarTitle: string;
  banner: {
    emoji: string;
    title: string;
    subtitle: string;
  };
  responseTimes: Array<[string, string]>;
  optionsTitle: string;
  options: AppContactOption[];
  ticketTitle: string;
  ticketSubjectLabel: string;
  ticketSubjectHint: string;
  ticketDescLabel: string;
  ticketDescHint: string;
  ticketButtonLabel: string;
  ticketSuccessMessage: string;
}

export interface AppTermsContent {
  title: string;
  emoji: string;
  lastUpdated: string;
  sections: Array<[string, string]>;
}

export interface AppPrivacyPolicyContent {
  title: string;
  emoji: string;
  lastUpdated: string;
  sections: Array<[string, string]>;
}

export interface AppPrivacyScreenContent {
  appBarTitle: string;
  bannerEmoji: string;
  bannerTitle: string;
  bannerSubtitle: string;
  controlsSectionTitle: string;
  controls: Array<{ key: string; defaultValue: boolean }>;
  dataSectionTitle: string;
  downloadDataTitle: string;
  downloadDataSubtitle: string;
  downloadDataMessage: string;
  deleteAccountTitle: string;
  deleteAccountSubtitle: string;
  deleteAccountConfirmTitle: string;
  deleteAccountConfirmMessage: string;
  deleteAccountSuccessTitle: string;
  deleteAccountSuccessMessage: string;
  cancelButtonText?: string;
  confirmDeleteButtonText?: string;
  privacyPolicyLinkTitle: string;
  termsLinkTitle: string;
}

export interface AppSecurityScreenContent {
  appBarTitle: string;
  statusTitleHigh: string;
  statusSubtitleHigh: string;
  statusTitleLow: string;
  statusSubtitleLow: string;
  sectionTitle: string;
  biometricTitle: string;
  biometricSubtitle: string;
  twoFactorTitle: string;
  twoFactorSubtitle: string;
  alertsTitle: string;
  alertsSubtitle: string;
  credentialsSectionTitle?: string;
  changePasswordTitle?: string;
  changePasswordSubtitle?: string;
  changePasswordMessage?: string;
  changePhoneTitle?: string;
  changePhoneSubtitle?: string;
  changePhoneMessage?: string;
  pinSectionTitle: string;
  changePinTitle: string;
  changePinSubtitle: string;
  sessionSectionTitle: string;
  deviceTitle: string;
  deviceSubtitle: string;
  currentBadgeText?: string;
  secondarySessionTitle?: string;
  secondarySessionSubtitle?: string;
  revokeButtonText?: string;
  revokeMessage?: string;
  logoutOtherDevicesTitle: string;
  logoutOtherDevicesSubtitle: string;
}

export interface AppPreferencesScreenContent {
  languageAppBarTitle: string;
  languageInfoBanner: string;
  languageSaveButtonText: string;
  themeAppBarTitle: string;
  themeHeading: string;
  themeSubtitle: string;
  lightVedicTitle: string;
  lightVedicDesc: string;
  darkCosmicTitle: string;
  darkCosmicDesc: string;
  accentHeading: string;
  accentSubtitle: string;
  themeFooterNote: string;
}

export interface AppSupportLegalContent {
  helpCentre: AppHelpCentreContent;
  contactSupport: AppContactSupportContent;
  terms: AppTermsContent;
  privacyPolicy: AppPrivacyPolicyContent;
  privacyScreen: AppPrivacyScreenContent;
  securityScreen: AppSecurityScreenContent;
  preferencesScreen?: AppPreferencesScreenContent;
  updatedAt?: string;
}

export const DEFAULT_SUPPORT_LEGAL_CONTENT: AppSupportLegalContent = {
  helpCentre: {
    appBarTitle: 'Help Centre',
    searchPlaceholder: 'Search help articles...',
    needHelpBanner: {
      emoji: '🎧',
      title: 'Need more help?',
      subtitle: 'Our Vedic support team is available 24/7',
    },
    browseTopicsTitle: 'Browse by Topic',
    categories: [
      { emoji: '🔮', title: 'Getting Started', count: 5, color: '#9370DB' },
      { emoji: '💬', title: 'Consultations', count: 6, color: '#4FC3F7' },
      { emoji: '💳', title: 'Payments & Wallet', count: 5, color: '#FFD700' },
      { emoji: '📜', title: 'Reports & Kundli', count: 5, color: '#FF6B6B' },
      { emoji: '👤', title: 'Account & Profile', count: 5, color: '#81C784' },
      { emoji: '🔒', title: 'Privacy & Security', count: 4, color: '#FFB347' },
    ],
    faqsTitle: 'Frequently Asked Questions',
    faqs: [
      {
        category: 'Getting Started',
        q: 'What is AstroParihar and how does it work?',
        a: 'AstroParihar is an authentic Vedic astrology platform combining ancient Sanskrit Jyotish principles with modern astronomical precision (Swiss Ephemeris Lahiri Ayanamsha). You can consult verified Vedic astrologers, calculate Janam Kundlis, check daily Panchang, and receive personalized 8-directional remedial plans (Ashta-Digbandhana).',
      },
      {
        category: 'Getting Started',
        q: 'How do I create and set up my Janam Kundli birth profile?',
        a: 'Go to Profile → Birth Profiles → Add New Profile. Enter your exact birth date, time of birth, and birth city. The system automatically fetches your geographical coordinates to calculate your Lagna, Moon sign, planetary houses, and Mahadasha.',
      },
      {
        category: 'Getting Started',
        q: 'Why is exact birth time important in Vedic astrology?',
        a: 'In Vedic astrology, the rising sign (Lagna) changes approximately every two hours. An accurate birth time ensures precise house placement, accurate planetary dashas, and correct Navamsha (D9) chart calculations.',
      },
      {
        category: 'Getting Started',
        q: 'Is AstroParihar free to use?',
        a: 'Many core tools on AstroParihar—including Daily Horoscope, Daily Panchang, Choghadiya, and basic Janam Kundli charts—are 100% free. Personalized 1-on-1 consultations with astrologers and custom in-depth PDF dossiers are billed per minute or per report from your wallet.',
      },
      {
        category: 'Getting Started',
        q: 'What is the difference between Vedic, Nadi, and KP astrology?',
        a: 'Vedic (Parashari) astrology focuses on planetary houses, dashas, and yogas. Nadi astrology uses ancient palm-leaf revelations for destiny and karmic patterns. KP (Krishnamurti Paddhati) uses stellar sub-lords for highly accurate event timing. Our verified astrologers specialize in each discipline.',
      },
      {
        category: 'Consultations',
        q: 'How do live 1-on-1 astrologer consultations work?',
        a: 'Browse available astrologers in the Astrologers tab. You can filter by language, specialty, or rating. Tap Chat or Call on any astrologer card to instantly connect. Calls use encrypted HD audio/video via ZegoCloud RTC.',
      },
      {
        category: 'Consultations',
        q: 'How does the AI Pandit chat consultation work?',
        a: 'The AI Pandit is trained on classical Vedic treatises (Brihat Parashara Hora Shastra, Phaladeepika, Jataka Parijata). It analyzes your live Kundli degrees in real-time, speaks with a male or female voice in your language, and offers Vedic guidance 24/7.',
      },
      {
        category: 'Consultations',
        q: 'What happens if my consultation disconnects unexpectedly?',
        a: 'If a call disconnects due to network instability within the first 5 minutes, our billing engine automatically protects you. Minutes are only deducted for actual talk time, and unspent balances remain safely in your wallet.',
      },
      {
        category: 'Consultations',
        q: 'Are my personal birth details and consultations private?',
        a: 'Yes, strictly 100%. All chat messages and audio/video calls are end-to-end encrypted. Astrologers cannot download or export your private data, and we never share your birth chart with external advertisers.',
      },
      {
        category: 'Consultations',
        q: 'Can I ask for specific remedies and gemstone recommendations during a call?',
        a: 'Yes. Our Acharyas will analyze your weak (Neecha) and exalted (Uchha) planets and prescribe exact Sanskrit Beej Mantras, fasts (Vrats), Yantras, and energised gemstone (Ratna) recommendations tailored to your birth chart.',
      },
      {
        category: 'Consultations',
        q: 'How is per-minute consultation billing calculated?',
        a: 'Each astrologer has a transparent rate displayed on their card (e.g. ₹15/min). Billing begins only after the astrologer accepts your call and you are connected. The call screen displays a live timer and your remaining wallet balance.',
      },
      {
        category: 'Payments & Wallet',
        q: 'How do I add money or recharge my AstroParihar wallet?',
        a: 'Go to Profile → Wallet → Recharge Wallet. Select an amount (e.g. ₹100, ₹500, ₹1000) and complete payment using UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, or Net Banking. Funds reflect instantly.',
      },
      {
        category: 'Payments & Wallet',
        q: 'Which payment methods are accepted?',
        a: 'We accept all major Indian and international payment methods via secure Razorpay and Stripe gateways, including UPI, RuPay, Visa, Mastercard, Net Banking, and popular mobile wallets.',
      },
      {
        category: 'Payments & Wallet',
        q: 'What should I do if my money was deducted but not credited to the wallet?',
        a: 'Bank processing delays can occasionally occur. If your balance does not update within 5 minutes, tap Submit a Ticket in Contact Support with your UPI Reference/UTR number. Our finance team resolves all pending credits within 2 hours.',
      },
      {
        category: 'Payments & Wallet',
        q: 'Are wallet balances refundable?',
        a: 'Wallet balances can be refunded to the original payment source upon request if no consultations have been consumed. Unused promotional bonus credits are non-cashable.',
      },
      {
        category: 'Payments & Wallet',
        q: 'How do promotional recharge bonuses work?',
        a: 'We regularly offer 100% or 50% bonus credits on first-time wallet recharges. Bonus credits are automatically added to your promotional wallet balance and can be spent on any astrologer consultation or PDF report.',
      },
      {
        category: 'Reports & Kundli',
        q: 'How accurate are the Janam Kundli calculations?',
        a: 'Our planetary engine runs on the renowned Swiss Ephemeris with Lahiri (Chitra Paksha) Ayanamsha, calibrated to 1/100th of an arcsecond. It calculates planetary degrees, Bhavas, Navamsha (D9), Dashamsha (D10), and Vimshottari Mahadasha.',
      },
      {
        category: 'Reports & Kundli',
        q: 'What is 36-Guna Ashtakoot Kundli Matching?',
        a: 'Ashtakoot matching evaluates 8 vital compatibility dimensions between bride and groom: Varna (ego/work), Vashya (dominance), Tara (destiny), Yoni (biological), Graha Maitri (friendship), Gana (temperament), Bhakoot (emotional harmony), and Nadi (genetic health). A score above 18 is auspicious.',
      },
      {
        category: 'Reports & Kundli',
        q: 'What is the Ashta-Digbandhana 8-in-1 Sacred Remedy Plan?',
        a: 'Ashta-Digbandhana is our signature personalized remedial protocol. It shields all 8 cardinal directions of your life (North, South, East, West, NE, NW, SE, SW) with specific Yantras, Mantras, Daana (charity), and temple rituals to nullify doshas.',
      },
      {
        category: 'Reports & Kundli',
        q: 'How do I download and save my Mahadasha PDF dossier?',
        a: 'After purchasing a Mahadasha report, open Profile → Kundli & Service Reports. Tap Download PDF to save the complete dossier with Sanskrit mantras and 48-day protocol to your device.',
      },
      {
        category: 'Reports & Kundli',
        q: 'Can I share my Kundli chart with my family or astrologer?',
        a: 'Yes. Open My Kundli, tap the Share icon in the top right corner, and you can share a high-resolution chart image or PDF via WhatsApp, Email, or Telegram.',
      },
      {
        category: 'Account & Profile',
        q: 'How do I edit my name, email, or birth time in my profile?',
        a: 'Open Profile → tap the Edit pencil icon next to your name. Update your details and tap Save Profile Details. Your astrological stats (Zodiac, Moon Sign, Nakshatra) will automatically recalculate.',
      },
      {
        category: 'Account & Profile',
        q: 'How do I add multiple family members to Birth Profiles?',
        a: 'Open Profile → Birth Profiles → tap Add Profile. You can save birth charts for your spouse, children, parents, and friends, and quickly switch between them when consulting astrologers.',
      },
      {
        category: 'Account & Profile',
        q: 'How do I switch the app language?',
        a: 'Go to Profile → Preferences → Language. We support Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), and English. The entire app, including AI voice synthesis, switches instantly.',
      },
      {
        category: 'Account & Profile',
        q: 'How do I toggle between Light Vedic and Dark Cosmic themes?',
        a: 'Go to Profile → Preferences → Theme. Tap to toggle between the radiant warm cream Light Vedic theme and the deep navy Dark Cosmic theme.',
      },
      {
        category: 'Account & Profile',
        q: 'How do I permanently delete my account and data?',
        a: 'Go to Profile → Privacy → Delete Account Permanently. Confirming this action permanently purges all your Janam Kundli charts, consultations, wallet balance, and birth profiles from our servers.',
      },
      {
        category: 'Privacy & Security',
        q: 'Is my birth date, time, and location secure?',
        a: 'Yes. All birth information is stored in secure, encrypted cloud databases protected by Firebase and Google Cloud security rules. Your birth data is used solely to calculate your Vedic astrological charts.',
      },
      {
        category: 'Privacy & Security',
        q: 'Can astrologers see my phone number or contact details?',
        a: 'Never. Calls and chats are routed anonymously through our secure server-side RTC proxy. Astrologers only see your chosen devotee display name and birth chart.',
      },
      {
        category: 'Privacy & Security',
        q: 'How do I enable biometric or app PIN lock?',
        a: 'Go to Profile → Security → Biometric Authentication. You can toggle fingerprint or Face ID lock to require verification every time the app opens.',
      },
      {
        category: 'Privacy & Security',
        q: 'Does AstroParihar sell or share user data with third-party advertisers?',
        a: 'Never. We do not sell, rent, or monetize your personal or astrological data with any advertising network. Our sole revenue comes from direct consultations and premium reports.',
      },
    ],
    noResultsText: 'No results found',
  },
  contactSupport: {
    appBarTitle: 'Contact Support',
    banner: {
      emoji: '🎧',
      title: "We're Here to Help",
      subtitle: 'Our customer care team is available 24/7 to assist you with any questions or consultations.',
    },
    responseTimes: [
      ['Chat', '< 2 min'],
      ['Email', '< 4 hrs'],
      ['Call', '< 5 min'],
    ],
    optionsTitle: 'Contact Options',
    options: [
      {
        emoji: '💬',
        title: 'Live Chat',
        desc: 'Chat with our support team instantly',
        color: '#4FC3F7',
        action: 'Start Chat',
        actionType: 'chat',
      },
      {
        emoji: '📧',
        title: 'Email Support',
        desc: 'support@astroparihar.com',
        color: '#2D9E6B',
        action: 'Send Email',
        actionType: 'email',
        value: 'mailto:support@astroparihar.com',
      },
      {
        emoji: '📞',
        title: 'Phone Support',
        desc: '+91 1800-ASTRO (Toll Free)',
        color: '#FFB347',
        action: 'Call Now',
        actionType: 'call',
        value: 'tel:+91180027876',
      },
      {
        emoji: '📱',
        title: 'WhatsApp',
        desc: 'Message us on WhatsApp',
        color: '#25D366',
        action: 'Open WhatsApp',
        actionType: 'whatsapp',
        value: 'https://wa.me/917981255989',
      },
    ],
    ticketTitle: 'Submit a Ticket',
    ticketSubjectLabel: 'Subject',
    ticketSubjectHint: 'Briefly describe your inquiry',
    ticketDescLabel: 'Description',
    ticketDescHint: 'Provide more details...',
    ticketButtonLabel: 'Submit Ticket',
    ticketSuccessMessage: 'Support ticket submitted successfully. Ticket ID #ASTRO-9281',
  },
  terms: {
    title: 'Terms of Service',
    emoji: '⚖️',
    lastUpdated: 'Last updated: January 2026',
    sections: [
      [
        '1. Acceptance of Terms',
        "By accessing or using AstroParihar's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.\n\nAstroParihar provides astrology-related content, AI-powered guidance, and connections to professional astrologers for informational and guidance purposes.",
      ],
      [
        '2. Services Provided',
        'AstroParihar offers:\n• AI-powered astrology guidance\n• Live consultations with verified astrologers\n• Kundli generation and analysis\n• Horoscope reports and predictions\n• Vedic remedies and recommendations\n• Panchang and astrological calendar\n\nAll services are provided for spiritual guidance and should not replace professional medical, legal, or financial advice.',
      ],
      [
        '3. User Accounts',
        'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate birth details for accurate astrological analysis.',
      ],
      [
        '4. Payments and Refunds',
        'Wallet credits can be utilized for consultations and reports in real-time. Unused balance is stored securely.',
      ],
      [
        '5. Disclaimer',
        'Astrology is an ancient practice. Our services are for spiritual guidance. We do not promote fear-based astrology or guarantee specific outcomes.',
      ],
      [
        '6. Privacy',
        'Your birth data and consultation history are kept strictly confidential. We do not sell personal data to third parties.',
      ],
      [
        '7. Contact',
        'For questions about these Terms, contact us at:\nlegal@astroparihar.com\n\nAstroParihar',
      ],
    ],
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    emoji: '🔒',
    lastUpdated: 'Last updated: January 2026',
    sections: [
      [
        '1. Information We Collect',
        'We collect the following information to provide our services:\n\n• Personal details: Name, email, phone number\n• Birth details: Date, time, and place of birth\n• Usage data: App interactions and preferences\n• Payment information: Transaction records\n• Consultation history: Chat and call records',
      ],
      [
        '2. How We Use Your Information',
        'Your information is used to:\n• Generate accurate Kundli and horoscope reports\n• Connect you with appropriate astrologers\n• Provide personalised recommendations\n• Process payments and maintain wallet balance\n• Improve our AI astrology models\n• Send relevant notifications (with your consent)',
      ],
      [
        '3. Data Security',
        'AstroParihar employs industry-standard security measures:\n• End-to-end encryption for consultations\n• Secure payment processing via 256-bit SSL\n• Regular security audits\n• Strict access controls\n\nYour birth data is treated as sensitive personal information and is never shared without your explicit consent.',
      ],
      [
        '4. Data Sharing',
        'We do not sell your personal data. We may share data with:\n• Astrologers (only birth details necessary for consultation)\n• Payment processors (for transaction processing)\n\nWe never share your consultation content with third parties.',
      ],
      [
        '5. Your Rights',
        'You have the right to:\n• Access your personal data\n• Correct inaccurate information\n• Delete your account and data\n• Download an archive copy of your data',
      ],
      [
        '6. Contact Us',
        'For privacy-related queries:\nprivacy@astroparihar.com\n\nAstroParihar Privacy Team',
      ],
    ],
  },
  privacyScreen: {
    appBarTitle: 'Privacy',
    bannerEmoji: '🔒',
    bannerTitle: 'Your Privacy Matters',
    bannerSubtitle: 'AstroParihar keeps your birth coordinates and consultations completely encrypted and private.',
    controlsSectionTitle: 'Privacy Controls',
    controls: [
      { key: 'Profile Visibility', defaultValue: true },
      { key: 'Show Online Status', defaultValue: true },
      { key: 'Allow Astrologers to View Birth Chart', defaultValue: true },
      { key: 'Personalised Recommendations', defaultValue: true },
      { key: 'Analytics & Improvement', defaultValue: false },
      { key: 'Marketing Communications', defaultValue: false },
    ],
    dataSectionTitle: 'Your Data',
    downloadDataTitle: 'Download My Astrological Data',
    downloadDataSubtitle: 'Get an encrypted copy of all saved charts and reports',
    downloadDataMessage: 'Preparing your data archive... Link will be sent via email.',
    deleteAccountTitle: 'Delete My Account',
    deleteAccountSubtitle: 'Permanently remove your account and all data',
    deleteAccountConfirmTitle: 'Delete Account Permanently?',
    deleteAccountConfirmMessage:
      'Are you sure you want to permanently delete your AstroParihar account?\n\nAll your Janam Kundli charts, consultations, wallet balance, and birth profiles will be erased forever.\n\nOnce deleted, this phone number cannot be reused to log in.',
    deleteAccountSuccessTitle: 'Account Deleted',
    deleteAccountSuccessMessage: 'Your account has been deleted. You can no longer log in with this phone number.',
    cancelButtonText: 'Cancel',
    confirmDeleteButtonText: 'Delete Account',
    privacyPolicyLinkTitle: 'Privacy Policy',
    termsLinkTitle: 'Terms of Service',
  },
  securityScreen: {
    appBarTitle: 'Security',
    statusTitleHigh: 'Excellent Security',
    statusSubtitleHigh: 'Your account is fully protected',
    statusTitleLow: 'Good Security',
    statusSubtitleLow: 'Enable 2FA to achieve 100% protection',
    sectionTitle: 'Authentication',
    biometricTitle: 'Biometric Login',
    biometricSubtitle: 'Use fingerprint or Face ID',
    twoFactorTitle: 'Two-Factor Authentication',
    twoFactorSubtitle: 'Extra security via SMS/WhatsApp OTP',
    alertsTitle: 'Login Alerts',
    alertsSubtitle: 'Get notified of new logins',
    credentialsSectionTitle: 'Account Credentials',
    changePasswordTitle: 'Change Password',
    changePasswordSubtitle: 'Update your master passcode',
    changePasswordMessage: 'Passcode reset link sent to registered mobile',
    changePhoneTitle: 'Change Mobile Number',
    changePhoneSubtitle: 'Update linked OTP number',
    changePhoneMessage: 'Verification OTP will be required on new phone number',
    pinSectionTitle: 'PIN Protection',
    changePinTitle: 'Change App PIN',
    changePinSubtitle: 'Update your 4-digit security code',
    sessionSectionTitle: 'Active Sessions',
    deviceTitle: 'Primary Mobile App',
    deviceSubtitle: 'Current Active Device',
    currentBadgeText: 'Current',
    secondarySessionTitle: 'Web Astro Dashboard',
    secondarySessionSubtitle: 'Active 2h ago',
    revokeButtonText: 'Revoke',
    revokeMessage: 'Web session logged out',
    logoutOtherDevicesTitle: 'Log Out All Other Devices',
    logoutOtherDevicesSubtitle: 'Revoke access from other browsers & phones',
  },
  preferencesScreen: {
    languageAppBarTitle: 'Language',
    languageInfoBanner:
      'Select your preferred language. All application navigation, profile, and astrology content will translate instantly.',
    languageSaveButtonText: 'Save Language',
    themeAppBarTitle: 'Theme',
    themeHeading: 'Select App Theme',
    themeSubtitle:
      'Choose between Light Vedic or Dark Cosmic. Both provide high-contrast text and optimal readability.',
    lightVedicTitle: 'Light Vedic',
    lightVedicDesc: 'Luminous pearl white and sacred gold tones with crystal-clear readability',
    darkCosmicTitle: 'Dark Cosmic',
    darkCosmicDesc: 'Deep cosmic space with starry depth and luminous gold accents',
    accentHeading: 'Accent Colour',
    accentSubtitle: 'Personalise highlight badges and interactive buttons',
    themeFooterNote: 'Theme changes apply immediately across all screens and bottom navigation.',
  },
};

export async function getAppSupportLegalContent(): Promise<AppSupportLegalContent> {
  try {
    if (!db) return DEFAULT_SUPPORT_LEGAL_CONTENT;

    const docRef = doc(db, COLLECTION_NAME, SUPPORT_LEGAL_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists() && snap.data()?.content) {
      const data = snap.data().content as Partial<AppSupportLegalContent>;
      return {
        helpCentre: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.helpCentre, ...(data.helpCentre || {}) },
        contactSupport: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.contactSupport, ...(data.contactSupport || {}) },
        terms: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.terms, ...(data.terms || {}) },
        privacyPolicy: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.privacyPolicy, ...(data.privacyPolicy || {}) },
        privacyScreen: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.privacyScreen, ...(data.privacyScreen || {}) },
        securityScreen: { ...DEFAULT_SUPPORT_LEGAL_CONTENT.securityScreen, ...(data.securityScreen || {}) },
        preferencesScreen: {
          ...(DEFAULT_SUPPORT_LEGAL_CONTENT.preferencesScreen!),
          ...(data.preferencesScreen || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Could not fetch support legal content from Firestore, using defaults:', err);
  }
  return DEFAULT_SUPPORT_LEGAL_CONTENT;
}

export async function saveAppSupportLegalContent(content: AppSupportLegalContent): Promise<boolean> {
  try {
    if (!db) return false;

    const docRef = doc(db, COLLECTION_NAME, SUPPORT_LEGAL_DOC_ID);
    await setDoc(
      docRef,
      {
        content,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving support legal content to Firestore:', err);
    throw err;
  }
}

// ===================================================
// APP DYNAMIC: SERVICE DETAIL SCREENS (ALL 9 SCREENS)
// ===================================================
export const SERVICE_DETAILS_DOC_ID = 'service_detail_pages';

export interface ServiceDetailHero {
  title: string;
  subtitle: string;
  imageUrl: string;
  semanticLabel: string;
  accent: string;
  icon: string;
}

export interface ServiceDetailInfoCard {
  icon: string;
  title: string;
  description: string;
}

export interface TarotCardItem {
  name: string;
  meaning: string;
  reversed: string;
}

export interface NumerologyMeaningItem {
  number: number;
  title: string;
  desc: string;
}

export interface MuhuratEventItem {
  event: string;
  icon: string;
  dates: string[];
  color: string;
}

export interface MahadashaReportGuideItem {
  id: string;
  name: string;
  pages: string;
  price: number;
  desc: string;
  icon: string;
  color: string;
  badge: string;
}

export interface AppServiceDetailPagesContent {
  shared: {
    chatNowLabel: string;
    consultNowLabel: string;
    expertAstrologersTitle: string;
  };
  career: {
    hero: ServiceDetailHero;
    intro: string;
    analysisTitle: string;
    analysisCards: ServiceDetailInfoCard[];
    insightsTitle: string;
    insights: Array<{ planet: string; role: string; icon: string }>;
  };
  marriage: {
    hero: ServiceDetailHero;
    intro: string;
    analysisTitle: string;
    analysisCards: ServiceDetailInfoCard[];
    compatibilityTitle: string;
    aspects: Array<{ name: string; maxScore: number; color: string }>;
  };
  business: {
    hero: ServiceDetailHero;
    intro: string;
    insightsTitle: string;
    analysisCards: ServiceDetailInfoCard[];
    sectorsTitle: string;
    sectors: Array<{ planet: string; sector: string; color: string }>;
  };
  finance: {
    hero: ServiceDetailHero;
    intro: string;
    analysisTitle: string;
    analysisCards: ServiceDetailInfoCard[];
    wealthHousesTitle: string;
    wealthHouses: Array<{ house: string; governs: string; planet: string }>;
  };
  tarot: {
    hero: ServiceDetailHero;
    intro: string;
    dailyDrawTitle: string;
    cardOfTheDayLabel: string;
    pinnedDailyCardName?: string;
    pinnedDailyCardDesc?: string;
    readingTypesTitle: string;
    readingTypes: ServiceDetailInfoCard[];
    majorArcanaTitle: string;
    uprightLabel: string;
    reversedLabel: string;
    cards: TarotCardItem[];
  };
  numerology: {
    hero: ServiceDetailHero;
    intro: string;
    calculatorTitle: string;
    nameFieldLabel: string;
    dobFieldLabel: string;
    calculateButtonLabel: string;
    lifePathLabel: string;
    destinyLabel: string;
    coreNumbersTitle: string;
    coreCards: ServiceDetailInfoCard[];
    meanings: NumerologyMeaningItem[];
  };
  muhurat: {
    hero: ServiceDetailHero;
    intro: string;
    upcomingDatesTitle: string;
    muhurats: MuhuratEventItem[];
    dailyPanchangTitle: string;
    inauspiciousTitle: string;
    rahuKaalTitle: string;
    rahuKaalNote: string;
    yamagandaTitle: string;
    yamagandaNote: string;
    abhijitTitle: string;
    abhijitNote: string;
  };
  spiritual: {
    hero: ServiceDetailHero;
    intro: string;
    servicesTitle: string;
    servicesCards: ServiceDetailInfoCard[];
    practiceTitle: string;
    practices: Array<{ name: string; duration: string; icon: string; color: string }>;
    wisdomTitle: string;
    quotes: Array<{ text: string; source: string }>;
  };
  reports: {
    hero: ServiceDetailHero;
    intro: string;
    sectionTitle: string;
    buttonLabel: string;
    guides: MahadashaReportGuideItem[];
  };
  updatedAt?: string;
}

export const DEFAULT_SERVICE_DETAIL_PAGES: AppServiceDetailPagesContent = {
  shared: {
    chatNowLabel: 'Chat Now',
    consultNowLabel: 'Consult Now',
    expertAstrologersTitle: 'Expert Astrologers',
  },
  career: {
    hero: {
      title: 'Career Astrology',
      subtitle: 'Unlock your professional destiny',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
      semanticLabel: 'Professional office setting with charts and career planning documents on a desk',
      accent: '#FFD700',
      icon: 'work_outline_rounded',
    },
    intro:
      'Your birth chart holds the blueprint of your professional life. Vedic astrology reveals the most favourable career paths, promotion timings, and business opportunities aligned with your planetary positions.',
    analysisTitle: 'What We Analyse',
    analysisCards: [
      {
        icon: 'trending_up_rounded',
        title: 'Career Path & Profession',
        description: 'Identify the most suitable career fields based on your 10th house lord, Saturn, and Sun placements.',
      },
      {
        icon: 'schedule_rounded',
        title: 'Promotion & Growth Timing',
        description: 'Pinpoint the exact Dasha and transit periods when career advancement is most likely to occur.',
      },
      {
        icon: 'business_center_rounded',
        title: 'Job vs Business',
        description: 'Determine whether employment or entrepreneurship is written in your stars for maximum success.',
      },
      {
        icon: 'swap_horiz_rounded',
        title: 'Career Change Analysis',
        description: 'Evaluate the planetary support for switching careers and identify the best timing for transitions.',
      },
    ],
    insightsTitle: 'Career Insights',
    insights: [
      { planet: 'Saturn', role: 'Career Karaka', icon: 'circle_outlined' },
      { planet: '10th House', role: 'Profession House', icon: 'home_work_outlined' },
      { planet: 'Sun', role: 'Authority & Status', icon: 'wb_sunny_outlined' },
      { planet: 'Mercury', role: 'Business & Trade', icon: 'swap_horiz_rounded' },
    ],
  },
  marriage: {
    hero: {
      title: 'Marriage Astrology',
      subtitle: 'Find your destined life partner',
      imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop',
      semanticLabel: 'Indian couple in traditional wedding attire with floral decorations and warm golden lighting',
      accent: '#FF6B6B',
      icon: 'favorite_rounded',
    },
    intro:
      'Marriage is one of the most significant events in life. Vedic astrology provides deep insights into marriage timing, partner characteristics, compatibility, and the strength of your marital bond through the 7th house and Venus analysis.',
    analysisTitle: 'Marriage Analysis',
    analysisCards: [
      {
        icon: 'schedule_rounded',
        title: 'Marriage Timing',
        description: 'Determine the most auspicious period for marriage based on Venus Dasha, 7th house transits, and Navamsa chart analysis.',
      },
      {
        icon: 'people_rounded',
        title: 'Partner Characteristics',
        description: 'Understand the nature, appearance, and qualities of your future spouse through 7th house lord and Venus placement.',
      },
      {
        icon: 'favorite_border_rounded',
        title: 'Kundli Milan (36 Gunas)',
        description: 'Complete compatibility matching using traditional Ashtakoot system covering all 8 aspects of marital harmony.',
      },
      {
        icon: 'warning_amber_rounded',
        title: 'Mangal Dosha Analysis',
        description: 'Identify and assess Mangal Dosha, its severity, and effective remedies to ensure a harmonious marriage.',
      },
    ],
    compatibilityTitle: 'Compatibility Score',
    aspects: [
      { name: 'Varna', maxScore: 1, color: '#9370DB' },
      { name: 'Vashya', maxScore: 2, color: '#FF6B6B' },
      { name: 'Tara', maxScore: 3, color: '#FFB347' },
      { name: 'Yoni', maxScore: 4, color: '#4FC3F7' },
      { name: 'Graha Maitri', maxScore: 5, color: '#81C784' },
      { name: 'Gana', maxScore: 6, color: '#FFD700' },
      { name: 'Bhakoot', maxScore: 7, color: '#FF6B6B' },
      { name: 'Nadi', maxScore: 8, color: '#9370DB' },
    ],
  },
  business: {
    hero: {
      title: 'Business Astrology',
      subtitle: 'Align your enterprise with the cosmos',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
      semanticLabel: 'Business team meeting around a conference table with charts and graphs on screens',
      accent: '#4FC3F7',
      icon: 'business_center_rounded',
    },
    intro:
      'Every successful business has cosmic timing. Vedic astrology helps entrepreneurs identify the best time to launch, expand, or pivot their business, choose the right partners, and navigate challenging periods with confidence.',
    insightsTitle: 'Business Insights',
    analysisCards: [
      {
        icon: 'rocket_launch_rounded',
        title: 'Business Launch Timing',
        description: 'Identify the most auspicious Muhurat for launching your business, signing contracts, or opening new ventures.',
      },
      {
        icon: 'handshake_rounded',
        title: 'Partnership Compatibility',
        description: 'Analyse the compatibility between business partners using Synastry and composite chart techniques.',
      },
      {
        icon: 'trending_up_rounded',
        title: 'Growth & Expansion Periods',
        description: 'Identify Jupiter and Venus transits that signal the best windows for business expansion and investment.',
      },
      {
        icon: 'shield_rounded',
        title: 'Risk & Challenge Periods',
        description: 'Foresee Saturn and Rahu transits that may bring obstacles, and prepare strategic remedies in advance.',
      },
    ],
    sectorsTitle: 'Business Sectors by Planet',
    sectors: [
      { planet: 'Mercury', sector: 'IT & Communication', color: '#4FC3F7' },
      { planet: 'Venus', sector: 'Fashion & Beauty', color: '#FF6B6B' },
      { planet: 'Mars', sector: 'Real Estate', color: '#FF6B35' },
      { planet: 'Jupiter', sector: 'Education & Law', color: '#FFD700' },
      { planet: 'Saturn', sector: 'Manufacturing', color: '#9370DB' },
      { planet: 'Sun', sector: 'Government & Politics', color: '#FFB347' },
    ],
  },
  finance: {
    hero: {
      title: 'Finance Astrology',
      subtitle: 'Wealth, investments & financial destiny',
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop',
      semanticLabel: 'Gold coins and financial charts with upward trending graphs on a dark background',
      accent: '#81C784',
      icon: 'account_balance_rounded',
    },
    intro:
      'The 2nd, 5th, 8th, and 11th houses in your birth chart govern wealth accumulation, speculative gains, inheritance, and income respectively. Our expert astrologers decode your financial destiny and guide you toward prosperity.',
    analysisTitle: 'Financial Analysis',
    analysisCards: [
      {
        icon: 'savings_rounded',
        title: 'Wealth Accumulation Periods',
        description: 'Identify Jupiter and Venus Dasha periods that bring maximum financial growth and wealth accumulation.',
      },
      {
        icon: 'show_chart_rounded',
        title: 'Investment Timing',
        description: 'Determine the best planetary windows for stock market investments, real estate purchases, and gold buying.',
      },
      {
        icon: 'warning_amber_rounded',
        title: 'Financial Loss Prevention',
        description: 'Foresee Ketu and Saturn transits that may cause financial setbacks and take preventive measures.',
      },
      {
        icon: 'home_rounded',
        title: 'Property & Real Estate',
        description: 'Analyse the 4th house for property ownership timing and the best periods for buying or selling property.',
      },
    ],
    wealthHousesTitle: 'Wealth Houses',
    wealthHouses: [
      { house: '2nd House', governs: 'Savings & Assets', planet: 'Venus' },
      { house: '5th House', governs: 'Speculation & Gains', planet: 'Jupiter' },
      { house: '8th House', governs: 'Inheritance', planet: 'Saturn' },
      { house: '11th House', governs: 'Income & Profits', planet: 'Jupiter' },
    ],
  },
  tarot: {
    hero: {
      title: 'Tarot Reading',
      subtitle: 'Ancient wisdom through sacred cards',
      imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop',
      semanticLabel: 'Mystical tarot cards spread on a dark velvet cloth with candles and crystals',
      accent: '#9370DB',
      icon: 'style_rounded',
    },
    intro:
      'Tarot is a powerful divination tool that uses 78 symbolic cards to reveal hidden truths, illuminate life paths, and provide guidance on love, career, and spiritual growth. Each card carries profound archetypal wisdom.',
    dailyDrawTitle: 'Daily Card Draw',
    cardOfTheDayLabel: 'Your Card of the Day',
    pinnedDailyCardName: '',
    pinnedDailyCardDesc: '',
    readingTypesTitle: 'Reading Types',
    readingTypes: [
      {
        icon: 'favorite_rounded',
        title: 'Love & Relationship Spread',
        description: 'A 5-card spread revealing the current state of your love life, obstacles, and the path forward.',
      },
      {
        icon: 'work_rounded',
        title: 'Career & Finance Spread',
        description: 'A 3-card spread covering your current career situation, challenges, and the best action to take.',
      },
      {
        icon: 'psychology_rounded',
        title: 'Celtic Cross Spread',
        description: 'The most comprehensive 10-card spread providing a complete overview of your life situation.',
      },
    ],
    majorArcanaTitle: 'Major Arcana Cards',
    uprightLabel: 'Upright',
    reversedLabel: 'Reversed',
    cards: [
      { name: 'The Star', meaning: 'Hope, faith, purpose, renewal, and spirituality. A period of calm after a storm — trust in the universe.', reversed: 'Lack of faith, despair, disconnection' },
      { name: 'The Fool', meaning: 'New beginnings, innocence, spontaneity, and a bold leap of faith.', reversed: 'Recklessness, hesitation, risk-taking' },
      { name: 'The Magician', meaning: 'Manifestation, resourcefulness, inspired action, and personal power.', reversed: 'Manipulation, poor planning, untapped talents' },
      { name: 'The High Priestess', meaning: 'Intuition, sacred knowledge, divine feminine, and inner wisdom.', reversed: 'Secrets, disconnected from intuition' },
      { name: 'The Empress', meaning: 'Femininity, beauty, abundance, nature, and nurturing energy.', reversed: 'Creative block, dependence on others' },
      { name: 'The Emperor', meaning: 'Authority, establishment, structure, and steady leadership.', reversed: 'Domination, excessive control, rigidity' },
      { name: 'The Hierophant', meaning: 'Spiritual wisdom, sacred traditions, mentorship, and dharma.', reversed: 'Personal beliefs, challenging the status quo' },
      { name: 'The Lovers', meaning: 'Love, harmony, relationships, alignment of values and choices.', reversed: 'Disharmony, imbalance, misalignment' },
      { name: 'The Chariot', meaning: 'Control, willpower, victory, and focused determination.', reversed: 'Lack of direction, opposition, self-doubt' },
      { name: 'The Sun', meaning: 'Positivity, radiant success, vitality, joy, and divine clarity.', reversed: 'Temporary setbacks, overly optimistic expectations' },
    ],
  },
  numerology: {
    hero: {
      title: 'Numerology',
      subtitle: 'Decode the numbers of your destiny',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop',
      semanticLabel: 'Sacred numbers and mathematical symbols glowing in golden light on a dark mystical background',
      accent: '#FFB347',
      icon: 'tag_rounded',
    },
    intro:
      'Numerology is the ancient science of numbers and their divine influence on human life. Every number carries a unique vibration that shapes your personality, destiny, and life path.',
    calculatorTitle: 'Calculate Your Numbers',
    nameFieldLabel: 'Full Name',
    dobFieldLabel: 'Date of Birth (DD/MM/YYYY)',
    calculateButtonLabel: 'Calculate My Numbers',
    lifePathLabel: 'Life Path',
    destinyLabel: 'Destiny',
    coreNumbersTitle: 'Core Numbers',
    coreCards: [
      {
        icon: 'route_rounded',
        title: 'Life Path Number',
        description: "Derived from your birth date, this is the most important number — it reveals your life's purpose and the path you are meant to walk.",
      },
      {
        icon: 'star_rounded',
        title: 'Destiny Number',
        description: 'Calculated from your full birth name, this reveals your talents, abilities, and the goals you are destined to achieve.',
      },
      {
        icon: 'favorite_rounded',
        title: 'Soul Urge Number',
        description: 'Derived from the vowels in your name, this reveals your innermost desires, motivations, and what truly makes your soul happy.',
      },
    ],
    meanings: [
      { number: 1, title: 'The Leader', desc: 'Independent, pioneering, ambitious. Born to lead and innovate.' },
      { number: 2, title: 'The Diplomat', desc: 'Cooperative, sensitive, harmonious. Natural peacemaker and mediator.' },
      { number: 3, title: 'The Communicator', desc: 'Creative, expressive, joyful. Gifted in arts and communication.' },
      { number: 4, title: 'The Builder', desc: 'Practical, disciplined, reliable. Creates lasting foundations.' },
      { number: 5, title: 'The Adventurer', desc: 'Freedom-loving, versatile, curious. Thrives on change and experience.' },
      { number: 6, title: 'The Nurturer', desc: 'Caring, responsible, loving. Natural healer and family person.' },
      { number: 7, title: 'The Seeker', desc: 'Analytical, introspective, spiritual. Pursues truth and wisdom.' },
      { number: 8, title: 'The Achiever', desc: 'Ambitious, authoritative, successful. Manifests material abundance.' },
      { number: 9, title: 'The Humanitarian', desc: 'Compassionate, generous, idealistic. Serves humanity with love.' },
      { number: 11, title: 'The Illuminator', desc: 'Highly intuitive, inspirational, visionary. Master number of spiritual insight.' },
      { number: 22, title: 'The Master Builder', desc: 'Practical visionary, powerful, capable. Builds dreams into reality.' },
      { number: 33, title: 'The Master Teacher', desc: 'Selfless compassion, spiritual upliftment, and sacred service to humanity.' },
    ],
  },
  muhurat: {
    hero: {
      title: 'Muhurat',
      subtitle: 'Auspicious timings for life events',
      imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop',
      semanticLabel: 'Traditional Hindu calendar with auspicious dates marked, surrounded by marigold flowers and diyas',
      accent: '#FFD700',
      icon: 'event_available_rounded',
    },
    intro:
      'Muhurat is the Vedic science of selecting the most auspicious time for important life events. Starting any significant activity at the right cosmic moment ensures divine blessings and minimises obstacles.',
    upcomingDatesTitle: 'Upcoming Auspicious Dates',
    muhurats: [
      { event: 'Marriage', icon: 'favorite_rounded', dates: ['24 Nov 2026', '2 Dec 2026', '11 Dec 2026'], color: '#FF6B6B' },
      { event: 'Business Launch', icon: 'rocket_launch_rounded', dates: ['23 Nov 2026', '30 Nov 2026', '9 Dec 2026'], color: '#4FC3F7' },
      { event: 'Property Purchase', icon: 'home_rounded', dates: ['25 Nov 2026', '4 Dec 2026', '14 Dec 2026'], color: '#81C784' },
      { event: 'Vehicle Purchase', icon: 'directions_car_rounded', dates: ['22 Nov 2026', '29 Nov 2026', '8 Dec 2026'], color: '#FFB347' },
      { event: 'Griha Pravesh', icon: 'door_front_door_rounded', dates: ['26 Nov 2026', '6 Dec 2026', '16 Dec 2026'], color: '#9370DB' },
    ],
    dailyPanchangTitle: "Today's Live Panchang",
    inauspiciousTitle: 'Auspicious & Inauspicious Periods',
    rahuKaalTitle: 'Rahu Kaal',
    rahuKaalNote: 'Avoid starting new ventures during this period governed by Rahu.',
    yamagandaTitle: 'Yamaganda',
    yamagandaNote: 'An inauspicious period associated with Yama; avoid major beginnings.',
    abhijitTitle: 'Abhijit Muhurat',
    abhijitNote: 'Most victorious midday window blessed by Lord Vishnu for starting important tasks.',
  },
  spiritual: {
    hero: {
      title: 'Spiritual Guidance',
      subtitle: "Illuminate your soul's sacred path",
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
      semanticLabel: 'Person meditating in lotus position on a mountain peak at sunset with golden light and spiritual energy',
      accent: '#9370DB',
      icon: 'psychology_rounded',
    },
    intro:
      "Beyond the material world lies the realm of the soul. Our spiritual astrologers and guides help you understand your karmic journey, past life influences, dharmic purpose, and the spiritual practices best suited for your soul's evolution.",
    servicesTitle: 'Spiritual Services',
    servicesCards: [
      {
        icon: 'loop_rounded',
        title: 'Karma & Past Life Analysis',
        description: 'Explore karmic debts and past life influences through the 12th house, Saturn, and Rahu-Ketu axis in your birth chart.',
      },
      {
        icon: 'self_improvement_rounded',
        title: 'Dharma & Life Purpose',
        description: "Discover your soul's true purpose through the Atmakaraka planet and the 9th house of dharma and higher wisdom.",
      },
      {
        icon: 'spa_rounded',
        title: 'Spiritual Practice Guidance',
        description: 'Receive personalised recommendations for meditation, yoga, mantra, and spiritual practices aligned with your birth chart.',
      },
      {
        icon: 'star_rounded',
        title: 'Ishta Devata (Personal Deity)',
        description: 'Identify your personal deity through the Atmakaraka and Karakamsha chart for deepened spiritual connection.',
      },
    ],
    practiceTitle: 'Daily Spiritual Practice',
    practices: [
      { name: 'Meditation', duration: '20 min', icon: 'self_improvement_rounded', color: '#9370DB' },
      { name: 'Pranayama', duration: '15 min', icon: 'air_rounded', color: '#4FC3F7' },
      { name: 'Mantra Japa', duration: '108 times', icon: 'music_note_rounded', color: '#FFD700' },
      { name: 'Yoga Asana', duration: '30 min', icon: 'accessibility_new_rounded', color: '#81C784' },
    ],
    wisdomTitle: 'Sacred Wisdom',
    quotes: [
      {
        text: 'The soul is not born; it does not die; it was not produced from anyone. Unborn, eternal, ever-existing and primeval.',
        source: 'Bhagavad Gita 2.20',
      },
      {
        text: 'You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions.',
        source: 'Bhagavad Gita 2.47',
      },
    ],
  },
  reports: {
    hero: {
      title: 'Mahadasha PDF Guides',
      subtitle: 'Official Rahu & Sani Remedial Dossiers',
      imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop',
      semanticLabel: 'Detailed astrological charts and reports spread on a desk with a pen and cosmic symbols',
      accent: '#4FC3F7',
      icon: 'description_rounded',
    },
    intro:
      'Our authentic Vedic Mahadasha dossiers provide exhaustive blueprints to navigate Rahu and Saturn periods safely with consecrated Sanskrit Beej Mantras, 48-day protocols, and protective talismans.',
    sectionTitle: 'Official Mahadasha Dossiers',
    buttonLabel: 'View Guide →',
    guides: [
      {
        id: 'rahu-stabilisation',
        name: 'Rahu Mahadasha Stabilisation Guide',
        pages: '36 pages (PDF)',
        price: 499,
        desc: 'Harmonize intense Rahu transit with exact mantras, diet rules & silver talisman (PDF Dossier).',
        icon: 'shield_outlined',
        color: '#713B32',
        badge: 'Stabilisation Module',
      },
      {
        id: 'rahu-survival',
        name: 'Rahu Mahadasha Survival Guide',
        pages: '48 pages (PDF)',
        price: 999,
        desc: 'Tactical survival strategies, spiritual shield and karmic remedies for 18-year cycle.',
        icon: 'local_fire_department_rounded',
        color: '#E65100',
        badge: 'Complete Protocol',
      },
      {
        id: 'sani-stabilisation',
        name: 'Sani Mahadasha Stabilisation Guide',
        pages: '36 pages (PDF)',
        price: 499,
        desc: 'Saturn discipline, endurance & remedies for Sade Sati / Dhayya (PDF Dossier).',
        icon: 'spa_rounded',
        color: '#1A3D5C',
        badge: 'Saturn Pacification',
      },
      {
        id: 'sani-survival',
        name: 'Sani Mahadasha Survival Guide',
        pages: '52 pages (PDF)',
        price: 999,
        desc: 'Mastering Saturn 19-year Dasha trials, major Sade Sati shifts & long-term legacy.',
        icon: 'bolt_rounded',
        color: '#4A148C',
        badge: '19-Year Master Guide',
      },
    ],
  },
};

export function mergeServiceDetailPages(
  partial?: Partial<AppServiceDetailPagesContent> | null
): AppServiceDetailPagesContent {
  if (!partial) return DEFAULT_SERVICE_DETAIL_PAGES;
  return {
    shared: { ...DEFAULT_SERVICE_DETAIL_PAGES.shared, ...(partial.shared || {}) },
    career: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.career,
      ...(partial.career || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.career.hero, ...(partial.career?.hero || {}) },
    },
    marriage: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.marriage,
      ...(partial.marriage || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.marriage.hero, ...(partial.marriage?.hero || {}) },
    },
    business: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.business,
      ...(partial.business || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.business.hero, ...(partial.business?.hero || {}) },
    },
    finance: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.finance,
      ...(partial.finance || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.finance.hero, ...(partial.finance?.hero || {}) },
    },
    tarot: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.tarot,
      ...(partial.tarot || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.tarot.hero, ...(partial.tarot?.hero || {}) },
    },
    numerology: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.numerology,
      ...(partial.numerology || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.numerology.hero, ...(partial.numerology?.hero || {}) },
    },
    muhurat: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.muhurat,
      ...(partial.muhurat || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.muhurat.hero, ...(partial.muhurat?.hero || {}) },
    },
    spiritual: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.spiritual,
      ...(partial.spiritual || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.spiritual.hero, ...(partial.spiritual?.hero || {}) },
    },
    reports: {
      ...DEFAULT_SERVICE_DETAIL_PAGES.reports,
      ...(partial.reports || {}),
      hero: { ...DEFAULT_SERVICE_DETAIL_PAGES.reports.hero, ...(partial.reports?.hero || {}) },
    },
    updatedAt: partial.updatedAt,
  };
}

export async function getAppServiceDetailPages(): Promise<AppServiceDetailPagesContent> {
  try {
    if (!db) return DEFAULT_SERVICE_DETAIL_PAGES;
    const docRef = doc(db, COLLECTION_NAME, SERVICE_DETAILS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.content) {
      return mergeServiceDetailPages(snap.data().content as Partial<AppServiceDetailPagesContent>);
    }
  } catch (err) {
    console.warn('Could not fetch service detail pages from Firestore, using defaults:', err);
  }
  return DEFAULT_SERVICE_DETAIL_PAGES;
}

export async function saveAppServiceDetailPages(content: AppServiceDetailPagesContent): Promise<boolean> {
  try {
    if (!db) return false;
    const docRef = doc(db, COLLECTION_NAME, SERVICE_DETAILS_DOC_ID);
    await setDoc(
      docRef,
      {
        content,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving service detail pages to Firestore:', err);
    throw err;
  }
}
