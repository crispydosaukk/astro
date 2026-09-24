import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import { DEFAULT_AI_ASTROLOGERS } from '../src/lib/aiAstrologerData';
import { DEFAULT_REMEDY_ASTROLOGERS } from '../src/lib/remedyAstrologersData';

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = (match[2] || '').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  });
}

loadEnv('.env');
loadEnv('.env.local');

let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
  privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
}
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  try { privateKey = JSON.parse(privateKey); } catch(e){}
}
privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '');

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey
  })
});

const db = getFirestore(app);

async function syncAstrologers() {
  console.log(`Starting sync of ${DEFAULT_AI_ASTROLOGERS.length} AI Astrologers (${DEFAULT_REMEDY_ASTROLOGERS.length} remedy specialists)...`);
  
  // Batch writes in chunks of 40 (Firestore batch limit is 500)
  const chunkSize = 40;
  for (let i = 0; i < DEFAULT_AI_ASTROLOGERS.length; i += chunkSize) {
    const chunk = DEFAULT_AI_ASTROLOGERS.slice(i, i + chunkSize);
    const batch = db.batch();
    
    chunk.forEach(astro => {
      const docRef = db.collection('ai_astrologers').doc(astro.id);
      batch.set(docRef, {
        ...astro,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    });

    await batch.commit();
    console.log(`Synced chunk ${i + 1} to ${Math.min(i + chunkSize, DEFAULT_AI_ASTROLOGERS.length)}`);
  }

  console.log('Successfully synced all AI Astrologers to Firestore!');
}

syncAstrologers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error syncing:', err);
    process.exit(1);
  });
