import { db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface GlobalSettings {
  stripeSecretKey: string;
  stripePublishableKey: string;
  zegoAppId?: string;
  zegoServerSecret?: string;
}

const defaultSettings: GlobalSettings = {
  stripeSecretKey: '',
  stripePublishableKey: '',
  zegoAppId: '1951519898',
  zegoServerSecret: 'd68c140051b7d8f2404c2b2b9b586886',
};

export async function getSettings(): Promise<GlobalSettings> {
  try {
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
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}
