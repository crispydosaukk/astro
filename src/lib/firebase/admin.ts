import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initFirebaseAdmin() {
  if (getApps().length > 0) return true;

  try {
    let privateKey = '';
    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
      privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
    } else {
      privateKey = process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\ndemo\n-----END PRIVATE KEY-----\n';
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        try { privateKey = JSON.parse(privateKey); } catch (e) {}
      }
      privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '');
      
      if (!privateKey.includes('BEGIN PRIVATE KEY') && privateKey.length > 100) {
        const rawKey = privateKey.replace(/\s+/g, '');
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
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Firebase admin initialization error', error);
    }
    return false;
  }
}

// Lazy initialization proxies
export const adminAuth = new Proxy({} as any, {
  get: (target, prop) => {
    initFirebaseAdmin();
    return (getAuth() as any)[prop];
  }
});

export const adminDb = new Proxy({} as any, {
  get: (target, prop) => {
    initFirebaseAdmin();
    return (getFirestore() as any)[prop];
  }
});
