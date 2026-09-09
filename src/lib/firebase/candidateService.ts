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

export const initialCandidatesData: Candidate[] = [];

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
    return [];
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
