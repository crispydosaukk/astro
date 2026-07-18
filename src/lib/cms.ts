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
}

export const defaultHomaContent: HomaServiceContent = {
  hero: {
    tag: "Sacred Fire Rituals",
    titleLine1: "Homam & Puja",
    titleLine2: "Recommendations",
    description: "Fire rituals (Homam) are among the most powerful Vedic remedies. Get personalized recommendations for the right Homam based on your planetary afflictions and life goals.",
    primaryBtnText: "Get My Homam Report",
    secondaryBtnText: "Consult Astrologer",
  },
  benefitsTitle: "Benefits of Vedic Homam",
  benefits: [
    'Removes planetary afflictions and negative karma',
    'Purifies the environment and creates positive energy',
    'Brings success in career, business, and relationships',
    'Improves family harmony and removes ancestral doshas',
    'Accelerates spiritual growth and divine blessings',
  ],
  homamsTitle: "Popular Homam Types",
  homams: [
    { name: 'Navagraha Homam', purpose: 'Balance all 9 planetary energies', day: 'Saturday', duration: '3–4 hours', color: 'text-orange-400' },
    { name: 'Ganapathi Homam', purpose: 'Remove obstacles, new beginnings', day: 'Any auspicious day', duration: '2–3 hours', color: 'text-yellow-400' },
    { name: 'Sudarshana Homam', purpose: 'Protection from evil, enemies', day: 'Sunday', duration: '3–4 hours', color: 'text-red-400' },
    { name: 'Mrityunjaya Homam', purpose: 'Health, longevity, healing', day: 'Monday', duration: '3–4 hours', color: 'text-blue-400' },
    { name: 'Lakshmi Kubera Homam', purpose: 'Wealth, prosperity, abundance', day: 'Friday', duration: '2–3 hours', color: 'text-pink-400' },
    { name: 'Ayush Homam', purpose: 'Long life, good health', day: 'Birthday', duration: '2–3 hours', color: 'text-green-400' },
  ],
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
}

export const defaultGemstoneContent: GemstoneServiceContent = {
  hero: {
    tag: "Vedic Gemology",
    titleLine1: "Sacred Gemstone",
    titleLine2: "Recommendations",
    description: "Discover the precise gemstone aligned with your birth chart. Each recommendation is based on Navagraha analysis — the nine planetary forces that shape your destiny.",
    primaryBtnText: "Get My Gemstone Report",
    secondaryBtnText: "Consult Astrologer",
  },
  benefitsTitle: "Why Wear the Right Gemstone?",
  benefits: [
    'Strengthens Sun energy and boosts confidence',
    'Improves career prospects and leadership qualities',
    'Enhances vitality, health, and overall well-being',
    'Attracts prosperity and removes obstacles',
    'Balances planetary doshas in your birth chart',
  ],
  chartTitle: "Navagraha Gemstone Chart",
  gemstones: [
    { planet: 'Sun', gem: 'Ruby (Manik)', color: 'text-red-400', bg: 'bg-red-500/10', metal: 'Gold', finger: 'Ring finger', day: 'Sunday' },
    { planet: 'Moon', gem: 'Pearl (Moti)', color: 'text-blue-200', bg: 'bg-blue-200/10', metal: 'Silver', finger: 'Little finger', day: 'Monday' },
    { planet: 'Mars', gem: 'Red Coral (Moonga)', color: 'text-orange-400', bg: 'bg-orange-500/10', metal: 'Gold/Copper', finger: 'Ring finger', day: 'Tuesday' },
    { planet: 'Mercury', gem: 'Emerald (Panna)', color: 'text-green-400', bg: 'bg-green-500/10', metal: 'Gold', finger: 'Little finger', day: 'Wednesday' },
    { planet: 'Jupiter', gem: 'Yellow Sapphire (Pukhraj)', color: 'text-yellow-400', bg: 'bg-yellow-500/10', metal: 'Gold', finger: 'Index finger', day: 'Thursday' },
    { planet: 'Venus', gem: 'Diamond (Heera)', color: 'text-pink-300', bg: 'bg-pink-300/10', metal: 'Gold/Platinum', finger: 'Middle finger', day: 'Friday' },
    { planet: 'Saturn', gem: 'Blue Sapphire (Neelam)', color: 'text-blue-400', bg: 'bg-blue-500/10', metal: 'Silver/Iron', finger: 'Middle finger', day: 'Saturday' },
    { planet: 'Rahu', gem: 'Hessonite (Gomed)', color: 'text-amber-600', bg: 'bg-amber-600/10', metal: 'Silver', finger: 'Middle finger', day: 'Saturday' },
    { planet: 'Ketu', gem: "Cat's Eye (Lehsunia)", color: 'text-gray-400', bg: 'bg-gray-400/10', metal: 'Silver', finger: 'Middle finger', day: 'Tuesday' },
  ],
  faqTitle: "Frequently Asked Questions",
  faqs: [
    { q: 'How is the gemstone determined for me?', a: 'Based on your birth chart, we analyze the strength and weakness of each planet. The gemstone is recommended to strengthen your beneficial planets and neutralize malefic ones.' },
    { q: 'What is the ideal carat weight for a gemstone?', a: 'Generally 3–7 carats for most gemstones. The exact weight depends on your body weight and planetary strength. Our detailed report specifies the ideal weight for you.' },
    { q: 'Can I wear multiple gemstones?', a: 'Yes, but certain combinations are incompatible. For example, Ruby and Blue Sapphire should never be worn together. Our report includes safe combination guidelines.' },
    { q: 'How long before I see results?', a: 'Most people notice effects within 40 days of wearing the correct gemstone. Full benefits are typically experienced within 3–6 months of consistent wear.' },
  ],
};

// ----------------- MANTRA -----------------
export interface MantraItem { planet: string; mantra: string; count: string; time: string; color: string; }
export interface MantraServiceContent {
  hero: { tag: string; titleLine1: string; titleLine2: string; description: string; primaryBtnText: string; secondaryBtnText: string; };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  mantras: MantraItem[];
  faqTitle: string;
  faqs: FaqItem[];
}
export const defaultMantraContent: MantraServiceContent = {
  hero: {
    tag: "Sacred Sound Healing", titleLine1: "Personalized Mantra", titleLine2: "Recommendations",
    description: "Receive sacred mantras precisely aligned with your planetary positions. Each mantra is a vibrational key that unlocks specific cosmic energies in your birth chart.",
    primaryBtnText: "Get My Mantra Report", secondaryBtnText: "Consult Astrologer"
  },
  benefitsTitle: "Power of Vedic Mantras",
  benefits: [
    'Pacifies malefic planets and reduces their negative effects',
    'Brings mental peace, clarity, and emotional balance',
    'Strengthens the positive influence of benefic planets',
    'Removes karmic obstacles and negative energy patterns',
    'Enhances spiritual growth and inner awakening',
  ],
  guideTitle: "Navagraha Mantra Guide",
  mantras: [
    { planet: 'Sun', mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah', count: '108', time: 'Sunrise', color: 'text-red-400' },
    { planet: 'Moon', mantra: 'Om Shraam Shreem Shraum Sah Chandraya Namah', count: '108', time: 'Monday evening', color: 'text-blue-200' },
    { planet: 'Mars', mantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah', count: '108', time: 'Tuesday sunrise', color: 'text-orange-400' },
    { planet: 'Mercury', mantra: 'Om Braam Breem Braum Sah Budhaya Namah', count: '108', time: 'Wednesday morning', color: 'text-green-400' },
    { planet: 'Jupiter', mantra: 'Om Graam Greem Graum Sah Guruve Namah', count: '108', time: 'Thursday morning', color: 'text-yellow-400' },
    { planet: 'Venus', mantra: 'Om Draam Dreem Draum Sah Shukraya Namah', count: '108', time: 'Friday morning', color: 'text-pink-300' },
    { planet: 'Saturn', mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namah', count: '108', time: 'Saturday evening', color: 'text-blue-400' },
  ],
  faqTitle: "Frequently Asked Questions",
  faqs: [
    { q: 'How many times should I chant the mantra?', a: 'The standard count is 108 times per session, as 108 is considered sacred in Vedic tradition. You can use a mala (prayer beads) to keep count.' },
    { q: 'Does pronunciation matter?', a: 'Yes, correct pronunciation is important for maximum benefit. Our detailed report includes phonetic pronunciation guides and audio references.' },
    { q: 'Can I chant mantras silently?', a: 'Yes, silent (mental) chanting is equally effective. However, audible chanting creates sound vibrations that have additional healing benefits.' },
    { q: 'How long before I see results?', a: 'Regular chanting for 40 days (a mandala) typically shows noticeable changes. Full benefits manifest over 3–6 months of consistent practice.' },
  ]
};

// ----------------- YANTRA -----------------
export interface YantraItem { name: string; planet: string; purpose: string; placement: string; color: string; }
export interface YantraServiceContent {
  hero: { tag: string; titleLine1: string; titleLine2: string; description: string; primaryBtnText: string; secondaryBtnText: string; };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  yantras: YantraItem[];
}
export const defaultYantraContent: YantraServiceContent = {
  hero: {
    tag: "Sacred Geometry", titleLine1: "Sacred Yantra", titleLine2: "Recommendations",
    description: "Yantras are sacred geometric diagrams that serve as cosmic antennae, channeling specific planetary energies. Get your personalized Yantra based on your birth chart analysis.",
    primaryBtnText: "Get My Yantra Report", secondaryBtnText: "Consult Astrologer"
  },
  benefitsTitle: "Benefits of Yantra Worship",
  benefits: [
    'Attracts wealth, prosperity, and abundance',
    'Harmonizes all nine planetary energies simultaneously',
    'Removes Vastu doshas and negative energy from spaces',
    'Enhances positive energy flow in home and workplace',
    'Provides protection from evil eye and negative influences',
  ],
  guideTitle: "Planetary Yantra Guide",
  yantras: [
    { name: 'Sri Yantra', planet: 'Venus/Lakshmi', purpose: 'Wealth & Prosperity', placement: 'East wall, pooja room', color: 'text-pink-400' },
    { name: 'Surya Yantra', planet: 'Sun', purpose: 'Health & Authority', placement: 'East wall', color: 'text-red-400' },
    { name: 'Chandra Yantra', planet: 'Moon', purpose: 'Peace & Emotions', placement: 'North wall', color: 'text-blue-200' },
    { name: 'Mangal Yantra', planet: 'Mars', purpose: 'Courage & Energy', placement: 'South wall', color: 'text-orange-400' },
    { name: 'Budh Yantra', planet: 'Mercury', purpose: 'Intelligence & Business', placement: 'North wall', color: 'text-green-400' },
    { name: 'Guru Yantra', planet: 'Jupiter', purpose: 'Wisdom & Blessings', placement: 'North-East', color: 'text-yellow-400' },
    { name: 'Shukra Yantra', planet: 'Venus', purpose: 'Love & Luxury', placement: 'South-East', color: 'text-pink-300' },
    { name: 'Shani Yantra', planet: 'Saturn', purpose: 'Karma & Discipline', placement: 'West wall', color: 'text-blue-400' },
  ]
};

// ----------------- ISHTA DEVATA -----------------
export interface DeityItem { name: string; indicator: string; worship: string; stotra: string; color: string; }
export interface IshtaDevataServiceContent {
  hero: { tag: string; titleLine1: string; titleLine2: string; description: string; primaryBtnText: string; secondaryBtnText: string; };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  deities: DeityItem[];
}
export const defaultIshtaDevataContent: IshtaDevataServiceContent = {
  hero: {
    tag: "Personal Deity Finder", titleLine1: "Discover Your", titleLine2: "Ishta Devata",
    description: "Your Ishta Devata is the personal deity most aligned with your soul's journey. Determined by the 12th house lord and its nakshatra, this deity is your divine protector and guide.",
    primaryBtnText: "Find My Ishta Devata", secondaryBtnText: "Consult Astrologer"
  },
  benefitsTitle: "Why Know Your Ishta Devata?",
  benefits: [
    'Establishes a deep personal connection with your divine protector',
    'Daily worship aligned with your chart brings faster spiritual progress',
    'Specific deity worship removes your unique planetary doshas',
    'Strengthens your natural talents and life purpose',
    'Provides divine protection and guidance in difficult times',
  ],
  guideTitle: "Common Ishta Devatas",
  deities: [
    { name: 'Lord Shiva', indicator: 'Moon in 12th / Ketu aspect', worship: 'Monday Abhishekam', stotra: 'Shiva Panchakshara', color: 'text-blue-400' },
    { name: 'Lord Vishnu', indicator: 'Jupiter strong / Sagittarius rising', worship: 'Thursday Tulsi puja', stotra: 'Vishnu Sahasranama', color: 'text-blue-300' },
    { name: 'Goddess Durga', indicator: 'Mars dominant / Scorpio rising', worship: 'Tuesday Kumkum archana', stotra: 'Durga Saptashati', color: 'text-red-400' },
    { name: 'Lord Ganesha', indicator: 'Ketu in 1st / Moola nakshatra', worship: 'Wednesday modak offering', stotra: 'Ganapathi Atharvashirsha', color: 'text-orange-400' },
    { name: 'Goddess Lakshmi', indicator: 'Venus strong / Taurus rising', worship: 'Friday lotus offering', stotra: 'Sri Sukta', color: 'text-pink-400' },
    { name: 'Lord Surya', indicator: 'Sun in 1st / Leo rising', worship: 'Sunday Arghya at sunrise', stotra: 'Aditya Hridayam', color: 'text-yellow-400' },
  ]
};

// ----------------- MUHURTHAM -----------------
export interface EventItem { name: string; icon: string; desc: string; }
export interface MuhurthamServiceContent {
  hero: { tag: string; titleLine1: string; titleLine2: string; description: string; primaryBtnText: string; secondaryBtnText: string; };
  eventsTitle: string;
  events: EventItem[];
  benefitsTitle: string;
  benefits: string[];
}
export const defaultMuhurthamContent: MuhurthamServiceContent = {
  hero: {
    tag: "Auspicious Timing", titleLine1: "Muhurtham", titleLine2: "Generator",
    description: "Every important event deserves the most auspicious timing. Our Muhurtham generator analyzes planetary positions to find the perfect moment for your life's milestones.",
    primaryBtnText: "Find Auspicious Date", secondaryBtnText: "Consult Astrologer"
  },
  eventsTitle: "Events We Cover",
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
  benefitsTitle: "Why Choose the Right Muhurtham?",
  benefits: [
    'Identifies the most auspicious planetary alignment for your event',
    'Avoids inauspicious periods like Rahu Kalam and Yamagandam',
    'Considers your personal birth chart for maximum compatibility',
    'Provides multiple date options with strength ratings',
    'Includes Nakshatra, Lagna, and Tithi analysis',
  ]
};

// ----------------- VASTU -----------------
export interface DirectionItem { dir: string; deity: string; element: string; color: string; purpose: string; remedy: string; }
export interface VastuServiceContent {
  hero: { tag: string; titleLine1: string; titleLine2: string; description: string; primaryBtnText: string; secondaryBtnText: string; };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  directions: DirectionItem[];
}
export const defaultVastuContent: VastuServiceContent = {
  hero: {
    tag: "Vedic Architecture", titleLine1: "Interactive Vastu", titleLine2: "Analysis",
    description: "Vastu Shastra is the ancient science of spatial arrangement. Get a complete room-by-room analysis of your home or office with specific remedies for each direction.",
    primaryBtnText: "Get Vastu Analysis", secondaryBtnText: "Consult Astrologer"
  },
  benefitsTitle: "Benefits of Vastu Analysis",
  benefits: [
    'Identifies energy imbalances in your living or work space',
    'Provides direction-specific remedies for each zone',
    'Improves health, wealth, and relationship harmony',
    'Removes Vastu doshas without major structural changes',
    'Enhances positive energy flow throughout the property',
  ],
  guideTitle: "8 Directions — Vastu Guide",
  directions: [
    { dir: 'North', deity: 'Kubera', element: 'Water', color: 'text-blue-400', purpose: 'Wealth & Career', remedy: 'Blue/Green colors, water feature' },
    { dir: 'South', deity: 'Yama', element: 'Fire', color: 'text-red-400', purpose: 'Fame & Recognition', remedy: 'Red/Orange colors, avoid bedroom' },
    { dir: 'East', deity: 'Indra', element: 'Air', color: 'text-green-400', purpose: 'Health & Sunrise energy', remedy: 'Green plants, open windows' },
    { dir: 'West', deity: 'Varuna', element: 'Earth', color: 'text-amber-400', purpose: 'Gains & Profits', remedy: 'White/Grey colors, metal objects' },
    { dir: 'North-East', deity: 'Ishanya', element: 'Water+Air', color: 'text-cyan-400', purpose: 'Spirituality & Wisdom', remedy: 'Keep clean, pooja room ideal' },
    { dir: 'North-West', deity: 'Vayu', element: 'Air', color: 'text-sky-400', purpose: 'Support & Relationships', remedy: 'White/Silver, guest room' },
    { dir: 'South-East', deity: 'Agni', element: 'Fire', color: 'text-orange-400', purpose: 'Energy & Kitchen', remedy: 'Kitchen here, red/orange' },
    { dir: 'South-West', deity: 'Nirriti', element: 'Earth', color: 'text-yellow-600', purpose: 'Stability & Master bedroom', remedy: 'Heavy furniture, master bedroom' },
  ]
};

// ----------------- CHARITY -----------------
export interface CharityItem { planet: string; item: string; day: string; recipient: string; color: string; }
export interface CharityServiceContent {
  hero: { tag: string; titleLine1: string; titleLine2: string; description: string; primaryBtnText: string; secondaryBtnText: string; };
  benefitsTitle: string;
  benefits: string[];
  guideTitle: string;
  charityItems: CharityItem[];
}
export const defaultCharityContent: CharityServiceContent = {
  hero: {
    tag: "Karma-Aligned Giving", titleLine1: "Vedic Charity", titleLine2: "Planner",
    description: "Dana (charity) is a powerful Vedic remedy. When you donate the right items to the right people on the right day, it directly reduces planetary afflictions and builds positive karma.",
    primaryBtnText: "Get My Charity Plan", secondaryBtnText: "Consult Astrologer"
  },
  benefitsTitle: "Benefits of Vedic Dana",
  benefits: [
    'Reduces the negative effects of malefic planets through karma',
    'Builds positive karma that manifests as life improvements',
    'Aligns your giving with cosmic timing for maximum impact',
    'Tracks your donation history and karma balance',
    'Provides monthly reminders for scheduled charity activities',
  ],
  guideTitle: "Navagraha Dana Guide",
  charityItems: [
    { planet: 'Sun', item: 'Wheat, Jaggery, Copper', day: 'Sunday', recipient: 'Temples, Brahmins', color: 'text-red-400' },
    { planet: 'Moon', item: 'Rice, Milk, White cloth', day: 'Monday', recipient: 'Women, elderly', color: 'text-blue-200' },
    { planet: 'Mars', item: 'Red lentils, Red cloth', day: 'Tuesday', recipient: 'Soldiers, poor', color: 'text-orange-400' },
    { planet: 'Mercury', item: 'Green vegetables, Books', day: 'Wednesday', recipient: 'Students, teachers', color: 'text-green-400' },
    { planet: 'Jupiter', item: 'Yellow lentils, Gold', day: 'Thursday', recipient: 'Brahmins, gurus', color: 'text-yellow-400' },
    { planet: 'Venus', item: 'White sweets, Perfume', day: 'Friday', recipient: 'Women, artists', color: 'text-pink-300' },
    { planet: 'Saturn', item: 'Black sesame, Iron', day: 'Saturday', recipient: 'Poor, disabled', color: 'text-blue-400' },
    { planet: 'Rahu', item: 'Blue cloth, Coconut', day: 'Saturday', recipient: 'Outcastes, foreigners', color: 'text-amber-600' },
    { planet: 'Ketu', item: 'Multi-color cloth, Blanket', day: 'Tuesday', recipient: 'Spiritual seekers', color: 'text-gray-400' },
  ]
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
    await setDoc(docRef, data);
  } catch (error) {
    console.error(`Error updating service content for ${serviceId}:`, error);
    throw error;
  }
}
