import { db } from './firebase/config';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export interface MahadashaGuide {
  id: string;
  slug: string;
  title: string;
  pdfTitle: string;
  price: number;
  priceUSD: number;
  pdfUrl: string;
  badge: string;
  subtitle: string;
  description: string;
  previewTopics: string[];
}

export const DEFAULT_MAHADASHA_GUIDES: Record<string, MahadashaGuide> = {
  'rahu-stabilisation': {
    id: 'rahu-stabilisation',
    slug: '/services/rahu-mahadasha-stabilisation-guide',
    title: 'Rahu Mahadasha Stabilisation Guide (PDF)',
    pdfTitle: 'Rahu_Mahadasha_Stabilisation_Guide_AstroParihar.pdf',
    price: 499,
    priceUSD: 9.99,
    pdfUrl: '/assets/pdfs/rahu_mahadasha_stabilisation_guide.pdf',
    badge: 'Stabilisation Module',
    subtitle:
      'Harmonize intense Rahu transit with exact Vedic mantras, protective talismans & dietary discipline.',
    description:
      'The Rahu Mahadasha Stabilisation Guide provides a practical, non-fearful roadmap to grounding hyperactive Rahu energy, preventing mental anxiety, financial volatility, and sudden life disruptions.',
    previewTopics: [
      'Understanding Rahu Energy & Planetary Placement',
      'The 7 Core Symptoms of Rahu Instability',
      'Daily Beej Mantras & Rahu Stotram Protocol',
      'Food & Dietary Rules to Pacify Shadow Planets',
      'Emergency Rahu Pacification Pujas & Charity Guidelines',
    ],
  },
  'rahu-survival': {
    id: 'rahu-survival',
    slug: '/services/rahu-mahadasha-survival-guide',
    title: 'Rahu Mahadasha Survival Guide (PDF)',
    pdfTitle: 'Rahu_Mahadasha_Survival_Guide_AstroParihar.pdf',
    price: 999,
    priceUSD: 19.99,
    pdfUrl: '/assets/pdfs/rahu_mahadasha_survival_guide.pdf',
    badge: 'Complete Survival Protocol',
    subtitle:
      'Tactical survival strategies, spiritual shield, karmic remedies & navigating intense 18-year Rahu Dasha.',
    description:
      'An exhaustive 18-year survival blueprint for navigating Rahu Mahadasha and Rahu Antardashas. Master modern career pivots, foreign migrations, and emotional resilience without fear.',
    previewTopics: [
      'Year-by-Year Breakdown of the 18-Year Rahu Mahadasha',
      'Navigating Rahu-Rahu, Rahu-Jupiter & Rahu-Saturn Chhidra Dasha',
      'Karmic Debt & Ancestral Rahu Remedies (Pitra Dosha)',
      'Protecting Marriage & Business Contracts During Rahu Periods',
      'Master Rahu Yantra & Gemstone Selection Protocol',
    ],
  },
  'sani-stabilisation': {
    id: 'sani-stabilisation',
    slug: '/services/sani-mahadasha-stabilisation-guide',
    title: 'Sani Mahadasha Stabilisation Guide (PDF)',
    pdfTitle: 'Sani_Mahadasha_Stabilisation_Guide_AstroParihar.pdf',
    price: 499,
    priceUSD: 9.99,
    pdfUrl: '/assets/pdfs/sani_mahadasha_stabilisation_guide.pdf',
    badge: 'Saturn Pacification',
    subtitle:
      'Saturn discipline, endurance, Sade Sati pacification & balancing karmic lessons with grace.',
    description:
      'The Sani Mahadasha Stabilisation Guide equips you with classical Saturn remedies, Hanuman Chalisa daily practices, and lifestyle modifications to transform Saturnian delay into rock-solid mastery.',
    previewTopics: [
      'Decoding Saturn (Shani Dev) as the Great Teacher of Karma',
      'Sade Sati 3-Phase Survival & Dhaiya Analysis',
      'Shanivar Vrat & Mustard Oil Offering Rituals',
      'Building Iron Discipline & Health Endurance',
      'Mantra Chanting for Relief from Shani Obstacles',
    ],
  },
  'sani-survival': {
    id: 'sani-survival',
    slug: '/services/sani-mahadasha-survival-guide',
    title: 'Sani Mahadasha Survival Guide (PDF)',
    pdfTitle: 'Sani_Mahadasha_Survival_Guide_AstroParihar.pdf',
    price: 999,
    priceUSD: 19.99,
    pdfUrl: '/assets/pdfs/sani_mahadasha_survival_guide.pdf',
    badge: '19-Year Master Guide',
    subtitle:
      'Mastering Saturn 19-year Dasha trials, major Sade Sati shifts & long-term legacy building.',
    description:
      'The definitive guide to triumphing through the 19-year Saturn Mahadasha. Learn how Saturn rewards honest hard work, integrity, and spiritual devotion with enduring wealth and authority.',
    previewTopics: [
      'Comprehensive Analysis of 19-Year Saturn Mahadasha',
      'Shani-Rahu & Shani-Ketu Antardasha Shield',
      'Karmic Restructuring of Career, Health & Property',
      'Sacred Shani Stotram & Blue Sapphire / Iron Ring Guidelines',
      'Long-Term Prosperity & Spiritual Liberation Protocol',
    ],
  },
};

export async function getMahadashaGuide(id: string): Promise<MahadashaGuide> {
  const fallback = DEFAULT_MAHADASHA_GUIDES[id] || DEFAULT_MAHADASHA_GUIDES['rahu-stabilisation'];
  try {
    const docRef = doc(db, 'mahadasha_guides', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...fallback, ...snap.data() };
    }
  } catch (err) {
    console.error(`Error fetching mahadasha guide ${id}:`, err);
  }
  return fallback;
}

export async function getAllMahadashaGuides(): Promise<MahadashaGuide[]> {
  try {
    const colRef = collection(db, 'mahadasha_guides');
    const snap = await getDocs(colRef);
    const dbGuides: Record<string, MahadashaGuide> = {};
    snap.forEach((docSnap) => {
      dbGuides[docSnap.id] = docSnap.data() as MahadashaGuide;
    });

    return Object.keys(DEFAULT_MAHADASHA_GUIDES).map((id) => ({
      ...DEFAULT_MAHADASHA_GUIDES[id],
      ...(dbGuides[id] || {}),
    }));
  } catch (err) {
    console.error('Error fetching all mahadasha guides:', err);
    return Object.values(DEFAULT_MAHADASHA_GUIDES);
  }
}

export async function updateMahadashaGuide(
  id: string,
  data: Partial<MahadashaGuide>
): Promise<void> {
  try {
    const docRef = doc(db, 'mahadasha_guides', id);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.error(`Error updating mahadasha guide ${id}:`, err);
    throw err;
  }
}
