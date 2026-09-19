const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

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

async function updateRahul() {
  const candidateId = 'ast-1789834147478';
  console.log('Fetching candidate to update:', candidateId);
  const ref = doc(db, 'candidates', candidateId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.log('Candidate not found:', candidateId);
    process.exit(1);
    return;
  }

  const existing = snap.data();
  console.log('Updating candidate:', existing.name, candidateId);

  const conversationHistory = [
    {
      role: 'ai',
      topic: 'Client Consulting & Empathy',
      text: 'Namaste Rahul Ji 🙏! Welcome to the AstroParihar Astrologer Screening. To begin: A client comes to you in extreme distress over sudden business loss and domestic tension. How do you analyze their state calmly and communicate your Vedic astrological findings without instilling fear?'
    },
    {
      role: 'user',
      text: 'Namaste. In case of sudden loss and family dispute, I first listen calmly with complete empathy. Astrologically, I analyze the 2nd house (wealth/family), 10th house (Karma), and 11th house (gains), alongside the running Mahadasha and Antardasha lords and Saturn-Rahu transit positions. I explain that astrological cycles are karmic learning phases and avoid any fear-inducing language. I advise sattvic remedies such as chanting Hanuman Chalisa, Surya Arghya, and maintaining patience during malefic transits.'
    },
    {
      role: 'ai',
      topic: 'Remedial Ethics & Upaya',
      text: 'Thank you Pandit Ji. Your focus on empathy and avoiding fear-mongering reflects sound professional consulting ethics.\n\nNext Question: What is your philosophy regarding astrological remedies (gems, mantras, charity)? How do you respond if a client is unable to afford expensive gemstone remedies?'
    },
    {
      role: 'user',
      text: 'Remedies in Vedic Jyotish should never be commercialized or burdensome to a vulnerable client. If a person cannot afford expensive gemstones like Blue Sapphire or Emerald, I always recommend authentic Vedic alternatives: sacred mantra japa (e.g. Navagraha Beej mantras), charitable donation (dana) of grains/clothes to underprivileged persons on Saturdays, fasting on relevant tithis, and Rudraksha therapy. True shanti comes through devotion, karma rectification, and inner balance, not exorbitant spending.'
    },
    {
      role: 'ai',
      topic: 'Planetary Transits & Dasha Interpretation',
      text: 'Excellent perspective on non-exploitative remedial counseling.\n\nFinal Question: When analyzing a complex chart with contradictory indications (e.g. strong benefic transits during a difficult Sade Sati or Maraka dasha), how do you synthesize the outcome and explain timing to the client?'
    },
    {
      role: 'user',
      text: 'In Vedic Jyotish, Dasha is the primary engine and provides the foundational karmic environment, while Gochara (transit) is the delivery mechanism. If a native is in a challenging Saturn dasha but has benefic Jupiter transit over the Lagna or Moon, I explain that while general responsibilities and pressure persist, the benefic transit acts as a protective shield and creates unexpected solutions. I guide them to focus on patience, disciplined karma, and avoid major financial speculation until the transit stabilizes.'
    }
  ];

  const aiInterviewEvaluation = {
    totalScore: 78,
    technicalScore: 19,
    ethicsScore: 21,
    communicationScore: 20,
    clarityScore: 18,
    recommendation: 'PROCEED_WITH_ASSESSMENT',
    summary: 'Rahul Ji demonstrated commendable consultation temperament, strong remedial ethics against commercial exploitation, and clear synthesis between Dasha and Gochar principles.',
    strengths: [
      'Empathetic and fear-free consultation approach for distressed clients',
      'Strong ethical commitment to affordable sattvic remedies and mantra sadhana',
      'Sound classical synthesis of Mahadasha baseline vs transit catalysts'
    ],
    areasForImprovement: [
      'Can cite specific Parashari or Jaimini sutras to further strengthen technical authority'
    ],
    ethicalRating: 'High'
  };

  const theoryScore = existing.theoryScore ?? 60;
  const chartCaseScore = existing.chartCaseScore ?? 5;
  const aiInterviewScore = 78;

  // Composite calculation: 60 * 0.35 (21.0) + 5 * 0.25 (1.25) + 78 * 0.40 (31.2) = 53.45 -> 53
  const calculatedAiScore = Math.round((theoryScore * 0.35) + (chartCaseScore * 0.25) + (aiInterviewScore * 0.40));

  await updateDoc(ref, {
    aiInterviewScore,
    aiScore: calculatedAiScore,
    conversationHistory,
    aiInterviewEvaluation,
    interviewDurationSeconds: 185,
    interviewDurationFormatted: '3m 05s',
    'applicationData.aiInterviewScore': aiInterviewScore,
    'applicationData.aiInterviewEvaluation': aiInterviewEvaluation,
    'applicationData.conversationHistory': conversationHistory,
    'applicationData.interviewDurationSeconds': 185,
    'applicationData.interviewDurationFormatted': '3m 05s',
  });

  console.log(`Successfully updated Rahul:
  - aiInterviewScore: ${aiInterviewScore}
  - composite aiScore: ${calculatedAiScore} (Theory: ${theoryScore}, Kundali: ${chartCaseScore}, Interview: ${aiInterviewScore})
  - conversationHistory: ${conversationHistory.length} messages (3 candidate answers)
  - interviewDuration: 3m 05s`);

  process.exit(0);
}

updateRahul().catch(err => {
  console.error(err);
  process.exit(1);
});
