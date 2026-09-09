import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Candidate, saveCandidateToFirestore } from '@/lib/firebase/candidateService';

export interface Campaign {
  id: string;
  name: string;
  location: string;
  specialisation: string;
  target: number;
  discovered: number;
  qualified: number;
  rejected: number;
  duplicates: number;
  status: 'running' | 'completed' | 'paused' | 'queued' | 'draft' | 'failed';
  jobStatus?: string;
  minScore: number;
  progress: number;
  createdDate: string;
  lastRun: string;
  sources?: string[];
  createdAt?: any;
}

export interface JobLog {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warn';
}

export interface DiscoveryJob {
  id: string;
  campaignId: string;
  campaign: string;
  status: 'running' | 'completed' | 'paused' | 'queued' | 'failed';
  startTime: string;
  elapsed: string;
  searched: number;
  discovered: number;
  rejected: number;
  duplicates: number;
  qualified: number;
  apiCalls: number;
  queries: string[];
  logs: JobLog[];
}

export interface SearchRecord {
  id: string;
  query: string;
  source: string;
  campaign: string;
  executedAt: string;
  resultsFound: number;
  candidatesExtracted: number;
  status: 'success' | 'failed' | 'partial';
  duration: string;
}

export const initialCampaigns: Campaign[] = [];

export const initialSearchHistory: SearchRecord[] = [];

const CAMPAIGNS_COLLECTION = 'discovery_campaigns';
const SEARCH_HISTORY_COLLECTION = 'search_history';

/**
 * Fetch all campaigns from Firestore
 */
export async function getCampaignsFromFirestore(): Promise<Campaign[]> {
  try {
    const colRef = collection(db, CAMPAIGNS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return [];
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
  } catch (err) {
    console.warn('Error fetching campaigns from Firestore:', err);
    return [];
  }
}

/**
 * Subscribe to real-time campaign updates
 */
export function subscribeToCampaigns(
  onData: (campaigns: Campaign[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, CAMPAIGNS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData([]);
        return;
      }
      const campaigns = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
      onData(campaigns);
    },
    (err) => {
      console.warn('Campaign subscription error:', err);
      onData([]);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or update campaign in Firestore
 */
export async function saveCampaignToFirestore(campaign: Campaign): Promise<void> {
  try {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
    await setDoc(docRef, {
      ...campaign,
      createdAt: campaign.createdAt || serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving campaign to Firestore:', err);
  }
}

/**
 * Delete campaign from Firestore
 */
export async function deleteCampaignFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Error deleting campaign from Firestore:', err);
  }
}

/**
 * Save search history record
 */
export async function saveSearchRecordToFirestore(record: SearchRecord): Promise<void> {
  try {
    const docRef = doc(db, SEARCH_HISTORY_COLLECTION, record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    console.warn('Error saving search record to Firestore:', err);
  }
}

/**
 * Subscribe to search history
 */
export function subscribeToSearchHistory(
  onData: (records: SearchRecord[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, SEARCH_HISTORY_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData([]);
        return;
      }
      const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SearchRecord));
      onData(records);
    },
    (err) => {
      console.warn('Search history subscription error:', err);
      onData([]);
      if (onError) onError(err);
    }
  );
}
