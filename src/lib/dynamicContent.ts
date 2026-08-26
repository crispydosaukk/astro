import { db } from './firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export interface DynamicPageItem {
  id: string;
  pageId: string;
  pageTitle: string;
  category: 'services' | 'panchang' | 'remedies' | 'general';
  sectionPlacement: 'top' | 'below-form' | 'educational' | 'remedies' | 'bottom';
  title?: string;
  subtitle?: string;
  badge?: string;
  htmlContent: string;
  status: 'published' | 'draft';
  theme?: 'gold' | 'rose' | 'emerald' | 'cyan' | 'slate';
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

export const TARGET_PAGES = [
  // ==========================================
  // 🔮 1. VEDIC SERVICES (Services Category)
  // ==========================================
  {
    id: 'janam-kundli',
    title: 'Janam Kundli Report',
    category: 'services',
    route: '/services/janam-kundli',
  },
  {
    id: 'kundli-matching',
    title: 'Kundli Matching & Guna Milan',
    category: 'services',
    route: '/services/kundli-matching',
  },
  {
    id: 'horoscope-love',
    title: 'Love & Relationship Horoscope',
    category: 'services',
    route: '/services/horoscope/love',
  },
  {
    id: 'horoscope-finance',
    title: 'Finance & Wealth Horoscope',
    category: 'services',
    route: '/services/horoscope/finance',
  },
  {
    id: 'horoscope-health',
    title: 'Health & Vitality Horoscope',
    category: 'services',
    route: '/services/horoscope/health',
  },
  {
    id: 'daily-horoscope',
    title: 'Daily Vedic Horoscope',
    category: 'services',
    route: '/services/daily-horoscope',
  },
  {
    id: 'horoscope-main',
    title: 'Comprehensive Vedic Horoscope',
    category: 'services',
    route: '/services/horoscope',
  },
  {
    id: 'meditation-guide',
    title: 'Vedic Meditation & Mind Guide',
    category: 'services',
    route: '/services/meditation-guide',
  },
  {
    id: 'fasting-planner',
    title: 'Vedic Fasting & Vrat Planner',
    category: 'services',
    route: '/services/fasting-planner',
  },
  {
    id: 'services-overview',
    title: 'All Services Catalog Hub',
    category: 'services',
    route: '/services',
  },

  // Special Mahadasha Guides
  {
    id: 'rahu-survival',
    title: 'Rahu Mahadasha Survival Guide',
    category: 'services',
    route: '/services/rahu-mahadasha-survival-guide',
  },
  {
    id: 'rahu-stabilisation',
    title: 'Rahu Mahadasha Stabilisation Guide',
    category: 'services',
    route: '/services/rahu-mahadasha-stabilisation-guide',
  },
  {
    id: 'sani-survival',
    title: 'Sani (Saturn) Mahadasha Survival Guide',
    category: 'services',
    route: '/services/sani-mahadasha-survival-guide',
  },
  {
    id: 'sani-stabilisation',
    title: 'Sani (Saturn) Stabilisation Guide',
    category: 'services',
    route: '/services/sani-mahadasha-stabilisation-guide',
  },

  // ==========================================
  // 🗓️ 2. PANCHANG & MUHURAT (Panchang Category)
  // ==========================================
  {
    id: 'panchang-today',
    title: 'Today Panchang & Tithi',
    category: 'panchang',
    route: '/panchang/today-panchang',
  },
  {
    id: 'panchang-tomorrow',
    title: 'Tomorrow Panchang',
    category: 'panchang',
    route: '/panchang/tomorrow-panchang',
  },
  {
    id: 'panchang-choghadiya',
    title: 'Choghadiya Timings (Day & Night)',
    category: 'panchang',
    route: '/panchang/choghadiya',
  },
  {
    id: 'panchang-rahu-kaal',
    title: 'Rahu Kaal & Inauspicious Periods',
    category: 'panchang',
    route: '/panchang/rahu-kaal',
  },
  {
    id: 'panchang-shubh-muhurat',
    title: 'Shubh Muhurat & Auspicious Timings',
    category: 'panchang',
    route: '/panchang/shubh-muhurat',
  },
  {
    id: 'panchang-tithi',
    title: 'Daily Tithi, Paksha & Moon Phase',
    category: 'panchang',
    route: '/panchang/tithi',
  },
  {
    id: 'panchang-hora',
    title: 'Planetary Hora (Hourly Energy)',
    category: 'panchang',
    route: '/panchang/hora',
  },
  {
    id: 'panchang-karana',
    title: 'Vedic Karana Calculator',
    category: 'panchang',
    route: '/panchang/karana',
  },
  {
    id: 'panchang-vaar',
    title: 'Vaar (Day Lord Energy)',
    category: 'panchang',
    route: '/panchang/vaar',
  },
  { id: 'panchang-main', title: 'Panchang Central Hub', category: 'panchang', route: '/panchang' },
  {
    id: 'services-panchang',
    title: 'Services Panchang Portal',
    category: 'panchang',
    route: '/services/panchang',
  },

  // ==========================================
  // 🛡️ 3. VEDIC REMEDIES (Remedies Category)
  // ==========================================
  {
    id: 'remedies-overview',
    title: 'AshtaDigbandhana Remedies Hub',
    category: 'remedies',
    route: '/remedies',
  },
  {
    id: 'remedies-gemstone',
    title: 'Gemstone (Ratna) Therapy',
    category: 'remedies',
    route: '/remedies/gemstone',
  },
  {
    id: 'remedies-rudraksha',
    title: 'Sacred Rudraksha Beads',
    category: 'remedies',
    route: '/remedies/rudraksha',
  },
  {
    id: 'remedies-yantra',
    title: 'Energized Sri Yantras & Mandalas',
    category: 'remedies',
    route: '/remedies/yantra',
  },
  {
    id: 'remedies-mantra',
    title: 'Vedic Mantras, Japa & Shlokas',
    category: 'remedies',
    route: '/remedies/mantra',
  },
  {
    id: 'remedies-homa',
    title: 'Vedic Homa & Hawan Puja',
    category: 'remedies',
    route: '/remedies/homa',
  },
  {
    id: 'remedies-vastu',
    title: 'Vastu Shastra Spatial Alignment',
    category: 'remedies',
    route: '/remedies/vastu',
  },
  {
    id: 'remedies-fasting',
    title: 'Vedic Fasting & Vrat Remedies',
    category: 'remedies',
    route: '/remedies/fasting',
  },
  {
    id: 'remedies-charity',
    title: 'Charity, Daan & Karma Alleviation',
    category: 'remedies',
    route: '/remedies/charity',
  },
  {
    id: 'remedies-ishta-devata',
    title: 'Ishta Devata Sadhana & Upasana',
    category: 'remedies',
    route: '/remedies/ishta-devata',
  },
  {
    id: 'remedies-muhurtham',
    title: 'Shubh Muhurtham Timing Remedies',
    category: 'remedies',
    route: '/remedies/muhurtham',
  },

  // ==========================================
  // 🌐 4. GENERAL & CONSULTATION (General Category)
  // ==========================================
  {
    id: 'talk-to-astrologer',
    title: 'Talk to Astrologer (Live Consultation)',
    category: 'general',
    route: '/talk-to-astrologer',
  },
  {
    id: 'customer-support',
    title: '24/7 Customer Support Portal',
    category: 'general',
    route: '/customer-support',
  },
];

export const SECTION_PLACEMENTS = [
  { id: 'top', label: 'Top Banner Announcement (Under Title)' },
  { id: 'below-form', label: 'Below Main Calculator / Form' },
  { id: 'educational', label: 'Educational Content Section' },
  { id: 'remedies', label: 'Vedic Remedies & Instructions' },
  { id: 'bottom', label: 'Bottom of Page (Pre-Footer)' },
];

const COLLECTION_NAME = 'page_contents';

/**
 * Fetch all published dynamic content blocks for a specific page
 */
export async function getPublishedPageContents(
  pageId: string,
  sectionPlacement?: string
): Promise<DynamicPageItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('pageId', '==', pageId),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    let items: DynamicPageItem[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as DynamicPageItem);
    });

    if (sectionPlacement) {
      items = items.filter((item) => item.sectionPlacement === sectionPlacement);
    }

    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    return items;
  } catch (err) {
    console.warn(`Error fetching page contents for ${pageId}:`, err);
    return [];
  }
}

/**
 * Fetch all dynamic contents for Admin management
 */
export async function getAllDynamicContents(): Promise<DynamicPageItem[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const items: DynamicPageItem[] = [];
    snap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as DynamicPageItem);
    });
    items.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
    return items;
  } catch (err) {
    console.warn('Error fetching all dynamic contents:', err);
    return [];
  }
}

/**
 * Save or update a dynamic page content item
 */
export async function saveDynamicPageContent(item: Partial<DynamicPageItem>): Promise<string> {
  const itemId = item.id || `${item.pageId}_${item.sectionPlacement}_${Date.now()}`;
  const docRef = doc(db, COLLECTION_NAME, itemId);

  // Strip all undefined properties so Firestore never throws unsupported field value: undefined
  const cleanPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(item)) {
    if (value !== undefined) {
      cleanPayload[key] = value;
    }
  }

  cleanPayload.id = itemId;
  cleanPayload.updatedAt = serverTimestamp();

  if (!item.createdAt) {
    cleanPayload.createdAt = serverTimestamp();
  }

  await setDoc(docRef, cleanPayload, { merge: true });
  return itemId;
}

/**
 * Delete a dynamic page content item
 */
export async function deleteDynamicPageContent(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
