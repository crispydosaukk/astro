import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Candidate {
  id: string;
  name: string;
  businessName: string;
  location: string;
  specialisations: string[];
  aiScore: number;
  source: string;
  outreachStatus: string;
  applicationStatus: string | null;
  lifecycleStatus: string;
  discoveredDate: string;
  isDuplicate: boolean;
  experience: string;
  createdAt?: any;
  updatedAt?: any;
}

export const initialCandidatesData: Candidate[] = [
  { id: 'cand-001', name: 'Venkataraman Subramanian', businessName: 'Sri Jyotish Kendra', location: 'Chennai, TN', specialisations: ['Vedic', 'Prashna'], aiScore: 94, source: 'Google Places', outreachStatus: 'Approved', applicationStatus: 'Submitted', lifecycleStatus: 'human-review', discoveredDate: '12 Aug 2026', isDuplicate: false, experience: '18 yrs' },
  { id: 'cand-002', name: 'Padmavathi Krishnaswamy', businessName: 'Nakshatra Jyotish', location: 'Coimbatore, TN', specialisations: ['KP System'], aiScore: 88, source: 'Web Search', outreachStatus: 'Sent', applicationStatus: 'Under Screening', lifecycleStatus: 'screening', discoveredDate: '10 Aug 2026', isDuplicate: false, experience: '12 yrs' },
  { id: 'cand-003', name: 'Ravi Kumar Pandey', businessName: 'Vaidik Jyotish Centre', location: 'Varanasi, UP', specialisations: ['Vedic', 'Muhurtha'], aiScore: 91, source: 'Google Places', outreachStatus: 'Sent', applicationStatus: 'Submitted', lifecycleStatus: 'probation', discoveredDate: '05 Aug 2026', isDuplicate: false, experience: '22 yrs' },
  { id: 'cand-004', name: 'Meenakshi Sundaram Iyer', businessName: 'Jyotish Aalayam', location: 'Madurai, TN', specialisations: ['Vedic', 'Nadi'], aiScore: 96, source: 'Google Places', outreachStatus: 'Sent', applicationStatus: 'Approved', lifecycleStatus: 'verified', discoveredDate: '01 Aug 2026', isDuplicate: false, experience: '25 yrs' },
  { id: 'cand-005', name: 'Subramaniam Narayanan', businessName: 'Saptarishi Astrology', location: 'Bengaluru, KA', specialisations: ['KP System', 'Numerology'], aiScore: 82, source: 'Web Search', outreachStatus: 'Pending Approval', applicationStatus: null, lifecycleStatus: 'ready-for-outreach', discoveredDate: '15 Aug 2026', isDuplicate: false, experience: '9 yrs' },
  { id: 'cand-006', name: 'Annapurna Devi Sharma', businessName: 'Devi Jyotish Sansthan', location: 'Jaipur, RJ', specialisations: ['Vedic', 'Vastu'], aiScore: 79, source: 'Directory', outreachStatus: 'Not Sent', applicationStatus: null, lifecycleStatus: 'qualified', discoveredDate: '14 Aug 2026', isDuplicate: false, experience: '14 yrs' },
  { id: 'cand-007', name: 'Krishnamurthy Pillai', businessName: 'KP Jyotish Hub', location: 'Thrissur, KL', specialisations: ['KP System'], aiScore: 87, source: 'Google Places', outreachStatus: 'Sent', applicationStatus: 'Started', lifecycleStatus: 'applied', discoveredDate: '08 Aug 2026', isDuplicate: false, experience: '16 yrs' },
  { id: 'cand-008', name: 'Rajeshwari Balasubramanian', businessName: 'Nadi Jyotish Trust', location: 'Thanjavur, TN', specialisations: ['Nadi'], aiScore: 93, source: 'Web Search', outreachStatus: 'Approved', applicationStatus: null, lifecycleStatus: 'outreach-approved', discoveredDate: '13 Aug 2026', isDuplicate: false, experience: '20 yrs' },
  { id: 'cand-009', name: 'Govind Prasad Upadhyay', businessName: 'Kashi Jyotish Mandir', location: 'Varanasi, UP', specialisations: ['Vedic', 'Prashna', 'Muhurtha'], aiScore: 76, source: 'Web Search', outreachStatus: 'Not Sent', applicationStatus: null, lifecycleStatus: 'discovered', discoveredDate: '17 Aug 2026', isDuplicate: false, experience: '11 yrs' },
  { id: 'cand-010', name: 'Shantha Kumari Nambiar', businessName: 'Parashara Jyotish', location: 'Thiruvananthapuram, KL', specialisations: ['Vedic'], aiScore: 85, source: 'Google Places', outreachStatus: 'Sent', applicationStatus: 'Submitted', lifecycleStatus: 'screening', discoveredDate: '09 Aug 2026', isDuplicate: false, experience: '13 yrs' },
  { id: 'cand-011', name: 'Murugesan Thiyagarajan', businessName: 'Agasthya Nadi Centre', location: 'Kumbakonam, TN', specialisations: ['Nadi', 'Prashna'], aiScore: 90, source: 'Directory', outreachStatus: 'Sent', applicationStatus: 'Submitted', lifecycleStatus: 'human-review', discoveredDate: '07 Aug 2026', isDuplicate: false, experience: '19 yrs' },
  { id: 'cand-012', name: 'Prabhavathi Venkatesan', businessName: 'Cosmic Jyotish Nilayam', location: 'Puducherry, PY', specialisations: ['Vedic', 'Numerology'], aiScore: 62, source: 'Web Search', outreachStatus: 'Not Sent', applicationStatus: null, lifecycleStatus: 'discovered', discoveredDate: '16 Aug 2026', isDuplicate: true, experience: '6 yrs' },
];

const CANDIDATES_COLLECTION = 'candidates';

/**
 * Fetch all candidates from Firestore
 */
export async function getCandidatesFromFirestore(): Promise<Candidate[]> {
  try {
    const colRef = collection(db, CANDIDATES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return [];
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate));
  } catch (error) {
    console.error('Error fetching candidates from Firestore:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time candidate updates in Firestore
 */
export function subscribeToCandidates(
  onData: (candidates: Candidate[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, CANDIDATES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const candidates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Candidate));
      onData(candidates);
    },
    (err) => {
      console.warn('Realtime subscription error (may be using offline/fallback):', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add or update candidate in Firestore
 */
export async function saveCandidateToFirestore(candidate: Candidate): Promise<void> {
  const docRef = doc(db, CANDIDATES_COLLECTION, candidate.id);
  await setDoc(docRef, {
    ...candidate,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Update candidate lifecycle or outreach status
 */
export async function updateCandidateStatus(
  id: string, 
  updates: Partial<Pick<Candidate, 'lifecycleStatus' | 'outreachStatus' | 'applicationStatus' | 'aiScore'>>
): Promise<void> {
  const docRef = doc(db, CANDIDATES_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete candidate from Firestore
 */
export async function deleteCandidateFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, CANDIDATES_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Seed initial candidate records to Firestore if empty or on request
 */
export async function seedInitialCandidates(): Promise<{ count: number; success: boolean; message: string }> {
  try {
    let seeded = 0;
    for (const cand of initialCandidatesData) {
      const docRef = doc(db, CANDIDATES_COLLECTION, cand.id);
      await setDoc(docRef, {
        ...cand,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      seeded++;
    }
    return {
      success: true,
      count: seeded,
      message: `Successfully seeded ${seeded} candidates to Firestore database.`
    };
  } catch (error: any) {
    console.error('Failed to seed candidates:', error);
    return {
      success: false,
      count: 0,
      message: error?.message || 'Failed to seed candidate data into Firestore'
    };
  }
}

/**
 * Test connectivity with Firestore
 */
export async function testFirestoreConnection(): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
}> {
  const start = Date.now();
  try {
    const testDocRef = doc(db, '_health_check', 'ping');
    await setDoc(testDocRef, {
      ping: true,
      timestamp: serverTimestamp(),
      clientInfo: 'AstroParihar Web App'
    });
    const snap = await getDoc(testDocRef);
    const latencyMs = Date.now() - start;

    if (snap.exists()) {
      return {
        success: true,
        latencyMs,
        message: `Connected successfully to Firestore project "${db.app.options.projectId}" (${latencyMs}ms)`
      };
    } else {
      return {
        success: false,
        latencyMs,
        message: 'Connected but test document was not retrieved.'
      };
    }
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      latencyMs,
      message: error?.message || 'Unable to connect to Firestore. Check security rules in Firebase Console.'
    };
  }
}
