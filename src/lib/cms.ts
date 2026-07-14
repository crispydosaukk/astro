import { db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  iconColor: string;
  href: string;
  badge: string;
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
  };
}

export const defaultHomepageContent: HomepageContent = {
  hero: {
    headline1: "Discover Your",
    headline2: "Cosmic Destiny",
    subtitle: "Ancient Vedic wisdom meets modern precision. Get your personalized Kundli, sacred gemstone & mantra recommendations, and consult expert astrologers — all in one platform.",
    primaryBtnText: "✦ Get Free Kundli",
    secondaryBtnText: "Talk to Astrologer",
    stats: [
      { value: "2,50,000+", label: "Happy Users" },
      { value: "500+", label: "Expert Astrologers" },
      { value: "18,00,000+", label: "Reports Generated" },
      { value: "42+", label: "Countries" }
    ]
  },
  services: {
    tagline: "Our Services",
    title: "Ancient Wisdom,",
    titleHighlight: "Modern Precision",
    subtitle: "Comprehensive Vedic astrology services powered by Swiss Ephemeris calculations and expert guidance",
    items: [
      { id: 'svc-gemstone', icon: 'Gem', title: 'Gemstone Advice', description: 'Personalized gemstone recommendations based on your planetary analysis and birth chart', color: 'from-amber-500/15 to-yellow-500/10', iconColor: 'text-amber-400', href: '/services/gemstone', badge: 'Premium' },
      { id: 'svc-mantra', icon: 'Music', title: 'Mantra Guidance', description: 'Sacred mantras tailored to strengthen your weak planets and amplify positive energies', color: 'from-blue-500/15 to-cyan-500/10', iconColor: 'text-blue-400', href: '/services/mantra', badge: 'Premium' },
      { id: 'svc-yantra', icon: 'Triangle', title: 'Yantra Recommendations', description: 'Sacred geometric tools for specific planetary remedies and energy balancing', color: 'from-green-500/15 to-emerald-500/10', iconColor: 'text-green-400', href: '/services/yantra', badge: 'Premium' },
      { id: 'svc-homam', icon: 'Flame', title: 'Homam & Puja', description: 'Recommended fire rituals and pujas for planetary appeasement and divine blessings', color: 'from-orange-500/15 to-red-500/10', iconColor: 'text-orange-400', href: '/services/homa', badge: 'Premium' },
      { id: 'svc-ishta', icon: 'Heart', title: 'Ishta Devata', description: 'Discover your personal deity and daily worship practices for spiritual growth', color: 'from-pink-500/15 to-rose-500/10', iconColor: 'text-pink-400', href: '/services/ishta-devata', badge: 'Premium' },
      { id: 'svc-muhurtha', icon: 'Moon', title: 'Muhurtham Generator', description: 'Find the most auspicious time for marriage, business, travel and more', color: 'from-violet-500/15 to-purple-500/10', iconColor: 'text-violet-400', href: '/services/muhurtham', badge: 'Premium' },
      { id: 'svc-vastu', icon: 'Compass', title: 'Interactive Vastu', description: 'Room-by-room Vastu analysis with remedies for every direction of your home', color: 'from-teal-500/15 to-cyan-500/10', iconColor: 'text-teal-400', href: '/services/vastu', badge: 'Premium' },
      { id: 'svc-charity', icon: 'Gift', title: 'Charity Planner', description: 'Karma-aligned giving schedule based on your planetary positions and doshas', color: 'from-purple-500/15 to-indigo-500/10', iconColor: 'text-purple-400', href: '/services/charity', badge: 'Premium' }
    ]
  },
  panchang: {
    dateLabel: "Thursday, 3 July 2026 · Ashadha Shukla Saptami · IST",
    tithiValue: "Shukla Saptami",
    tithiSub: "Ends 11:45 PM",
    nakshatraValue: "Punarvasu",
    nakshatraSub: "Until 08:30 PM",
    yogaValue: "Siddha Yoga",
    yogaSub: "Auspicious",
    karanaValue: "Bava",
    karanaSub: "Till 12:30 PM",
    varaValue: "Guruvar",
    varaSub: "Thursday",
    rahuKalamValue: "01:30 – 03:00 PM",
    rahuKalamSub: "Avoid this time"
  }
};

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const docRef = doc(db, 'content', 'homepage');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<HomepageContent>;
      return {
        ...defaultHomepageContent,
        ...data,
        panchang: data.panchang || defaultHomepageContent.panchang,
        services: data.services || defaultHomepageContent.services,
      } as HomepageContent;
    } else {
      // If no document exists, return the defaults
      return defaultHomepageContent;
    }
  } catch (error) {
    console.error("Error fetching homepage content:", error);
    return defaultHomepageContent;
  }
}

export async function updateHomepageContent(data: HomepageContent): Promise<void> {
  try {
    const docRef = doc(db, 'content', 'homepage');
    await setDoc(docRef, data);
  } catch (error) {
    console.error("Error updating homepage content:", error);
    throw error;
  }
}
