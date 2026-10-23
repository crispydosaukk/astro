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
    ctaAction: '/consultation-booking-screen',
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
    ctaAction: '/talk-to-ai-astrologer',
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
    ctaAction: '/panchang',
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
