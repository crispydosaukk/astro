import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCXZ9S7Th0lpAVLMnZnRlgusCH1dPgF98g",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "astroparihar-85e2d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "astroparihar-85e2d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "astroparihar-85e2d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1002993374554",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1002993374554:web:ae1c5ee1fc07e9cc620f63",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GKGGF6XP61"
};

// Initialize or reuse Firebase App instance (Next.js SSR safe)
export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore database with auto-detect long polling to prevent WebChannel timeouts
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} catch (_e) {
  firestoreInstance = getFirestore(app);
}

// Firebase Services
export const db: Firestore = firestoreInstance;
export const auth: Auth = getAuth(app);
export const rtdb: Database = getDatabase(app);
export const storage: FirebaseStorage = getStorage(app);

// Client-side Analytics safe initialization
let analyticsInstance: Analytics | null = null;
export const initAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window !== 'undefined' && !analyticsInstance) {
    try {
      const supported = await isSupported();
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    } catch (_err) {
      // Ignore analytics unsupported in non-browser/test envs
    }
  }
  return analyticsInstance;
};

export default app;
