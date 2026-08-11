import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\ndemo\n-----END PRIVATE KEY-----\n';
    
    // Handle cases where the platform injects it with surrounding quotes and escaped newlines
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      try { privateKey = JSON.parse(privateKey); } catch (e) {}
    }
    
    // Fallback: replace any remaining literal \n with real newlines and strip loose quotes
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '');

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'demo@demo.com',
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
