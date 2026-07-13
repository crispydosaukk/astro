import { db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface HomepageContent {
  hero: {
    headline1: string;
    headline2: string;
    subtitle: string;
    primaryBtnText: string;
    secondaryBtnText: string;
    stats: { value: string; label: string }[];
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
  }
};

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const docRef = doc(db, 'content', 'homepage');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as HomepageContent;
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
