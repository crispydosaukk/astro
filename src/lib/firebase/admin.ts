import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {

  try {
    let privateKey = '';
    
    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
      privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
    } else {
      privateKey = process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\ndemo\n-----END PRIVATE KEY-----\n';
      
      // Handle cases where the platform injects it with surrounding quotes and escaped newlines
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        try { privateKey = JSON.parse(privateKey); } catch (e) {}
      }
      
      // Fallback: replace any remaining literal \n with real newlines and strip loose quotes
      privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '');
      
      // If the user pasted the key WITHOUT the -----BEGIN PRIVATE KEY----- headers, add them back!
      if (!privateKey.includes('BEGIN PRIVATE KEY') && privateKey.length > 100) {
        // Remove all spaces and newlines to get the raw base64 payload
        const rawKey = privateKey.replace(/\s+/g, '');
        // Break into 64-character lines as required by PEM format
        const formattedKey = rawKey.match(/.{1,64}/g)?.join('\n') || rawKey;
        privateKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----\n`;
      }
    }

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
