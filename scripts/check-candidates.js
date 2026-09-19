const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCXZ9S7Th0lpAVLMnZnRlgusCH1dPgF98g',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'astroparihar-85e2d.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'astroparihar-85e2d',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'astroparihar-85e2d.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1002993374554',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1002993374554:web:ae1c5ee1fc07e9cc620f63',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-GKGGF6XP61',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const targetId = 'ast-1789834147478';
  console.log('Fetching candidate:', targetId);
  const snap = await getDoc(doc(db, 'candidates', targetId));
  if (snap.exists()) {
    const data = snap.data();
    console.log('ID:', data.id);
    console.log('Name:', data.name);
    console.log('aiScore:', data.aiScore);
    console.log('theoryScore:', data.theoryScore);
    console.log('chartCaseScore:', data.chartCaseScore);
    console.log('aiInterviewScore:', data.aiInterviewScore);
    console.log('conversationHistory:', JSON.stringify(data.conversationHistory, null, 2));
    console.log('aiInterviewEvaluation:', JSON.stringify(data.aiInterviewEvaluation, null, 2));
  } else {
    console.log('Candidate not found by direct ID. Listing recent candidates...');
    const all = await getDocs(collection(db, 'candidates'));
    all.forEach(d => {
      const dData = d.data();
      if (dData.name && dData.name.toLowerCase().includes('rahul')) {
        console.log('Found Rahul:', d.id, dData.name, 'aiScore:', dData.aiScore, 'aiInterviewScore:', dData.aiInterviewScore);
        console.log('conversationHistory:', JSON.stringify(dData.conversationHistory, null, 2));
      }
    });
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
