import { db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface AISessionPackage {
  id: string;
  minutes: number;
  price: number;
  label: string;
  description?: string;
  popular?: boolean;
  enabled?: boolean;
}

export interface GlobalSettings {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  zegoAppId?: string;
  zegoServerSecret?: string;
  vedikaApiKey?: string;
  openaiApiKey?: string;

  // Fully Dynamic Pricing Configuration
  newUserTrialMinutes?: number; // Default 5 minutes FREE
  aiChatPricePerMinute?: number; // Default ₹5/min
  aiChatPricePerPrompt?: number; // Default ₹5 per prompt (compatible)
  aiVoicePricePerMinute?: number; // Default ₹7/min
  aiSessionPackages?: AISessionPackage[]; // 15m @ ₹69, 30m @ ₹129, 60m @ ₹249
  humanAstrologerMinRate?: number; // Default ₹15/min
  humanAstrologerMaxRate?: number; // Default ₹100/min
  humanAstrologerDefaultRate?: number; // Default ₹25/min
  pariharaPlanPrice?: number; // Default ₹499
  pariharaPlanTitle?: string;
  pariharaPlanDescription?: string;
  pariharaPlanEnabled?: boolean;

  probationDurationMonths?: number;
  autoLockAfterProbation?: boolean;
  minRatingForFullTime?: number;
  minConsultationsForFullTime?: number;
}

export const DEFAULT_AI_SESSION_PACKAGES: AISessionPackage[] = [
  {
    id: 'session-15',
    minutes: 15,
    price: 69,
    label: '15-minute AI session',
    description: 'Quick focused astrological clarity & single query resolution',
    popular: false,
    enabled: true,
  },
  {
    id: 'session-30',
    minutes: 30,
    price: 129,
    label: '30-minute AI session',
    description: 'Comprehensive Kundli, Vimshottari Dasha & career/relationship deep-dive',
    popular: true,
    enabled: true,
  },
  {
    id: 'session-60',
    minutes: 60,
    price: 249,
    label: '60-minute AI session',
    description: 'Complete life roadmap, year ahead timeline & personalized Vedic remedies',
    popular: false,
    enabled: true,
  },
];

const defaultSettings: GlobalSettings = {
  razorpayKeyId: 'rzp_test_TRAxs3TPMmg5AY',
  razorpayKeySecret: 'JADF4vK8qAQAvTMokzVXbYxr',
  stripeSecretKey: '',
  stripePublishableKey: '',
  zegoAppId: '1951519898',
  zegoServerSecret: 'd68c140051b7d8f2404c2b2b9b586886',
  vedikaApiKey: '',
  openaiApiKey: '',

  // Pricing defaults
  newUserTrialMinutes: 5,
  aiChatPricePerMinute: 5,
  aiChatPricePerPrompt: 5,
  aiVoicePricePerMinute: 7,
  aiSessionPackages: DEFAULT_AI_SESSION_PACKAGES,
  humanAstrologerMinRate: 15,
  humanAstrologerMaxRate: 100,
  humanAstrologerDefaultRate: 25,
  pariharaPlanPrice: 499,
  pariharaPlanTitle: 'Generate My Complete Parihara Plan',
  pariharaPlanDescription:
    'Comprehensive 8-fold Vedic remedial blueprint with personalized Mantras, Yantras, Homas, Gemstones, Rudraksha, Vastu and Temple remedies based on your Janam Kundli.',
  pariharaPlanEnabled: true,

  probationDurationMonths: 3,
  autoLockAfterProbation: true,
  minRatingForFullTime: 4.5,
  minConsultationsForFullTime: 25,
};

export async function getSettings(): Promise<GlobalSettings> {
  try {
    if (typeof window === 'undefined') {
      try {
        const { adminDb } = await import('./firebase/admin');
        const snap = await adminDb.collection('settings').doc('general').get();
        if (snap.exists) {
          return {
            ...defaultSettings,
            ...snap.data(),
          } as GlobalSettings;
        }
      } catch (adminErr) {
        console.warn('adminDb settings lookup warning:', adminErr);
      }
    }

    const docRef = doc(db, 'settings', 'general');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ...defaultSettings,
        ...docSnap.data(),
      } as GlobalSettings;
    } else {
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return defaultSettings;
  }
}

export async function updateSettings(data: GlobalSettings): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('./firebase/admin');
      await adminDb.collection('settings').doc('general').set(data, { merge: true });
      return;
    }

    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

export async function getPricingSettings() {
  const settings = await getSettings();
  return {
    newUserTrialMinutes: settings.newUserTrialMinutes ?? 5,
    aiChatPricePerMinute: settings.aiChatPricePerMinute ?? settings.aiChatPricePerPrompt ?? 5,
    aiChatPricePerPrompt: settings.aiChatPricePerPrompt ?? settings.aiChatPricePerMinute ?? 5,
    aiVoicePricePerMinute: settings.aiVoicePricePerMinute ?? 7,
    aiSessionPackages: settings.aiSessionPackages && settings.aiSessionPackages.length > 0 
      ? settings.aiSessionPackages 
      : DEFAULT_AI_SESSION_PACKAGES,
    humanAstrologerMinRate: settings.humanAstrologerMinRate ?? 15,
    humanAstrologerMaxRate: settings.humanAstrologerMaxRate ?? 100,
    humanAstrologerDefaultRate: settings.humanAstrologerDefaultRate ?? 25,
    pariharaPlanPrice: settings.pariharaPlanPrice ?? 499,
    pariharaPlanTitle: settings.pariharaPlanTitle || 'Generate My Complete Parihara Plan',
    pariharaPlanDescription:
      settings.pariharaPlanDescription ||
      'Comprehensive 8-fold Vedic remedial blueprint with personalized Mantras, Yantras, Homas, Gemstones, Rudraksha, Vastu and Temple remedies based on your Janam Kundli.',
    pariharaPlanEnabled: settings.pariharaPlanEnabled !== false,
  };
}

