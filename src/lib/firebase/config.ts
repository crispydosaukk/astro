import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage"; // Uncomment if you plan to use Firebase Storage

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if there are no other instances running
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize and export Firestore database
const db = getFirestore(app);

// Initialize other services as needed
const auth = getAuth(app);
// const storage = getStorage(app);

let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, auth, analytics };
