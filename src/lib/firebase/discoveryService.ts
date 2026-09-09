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

export const initialCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Chennai Vedic Astrologers',
    location: 'Chennai, TN',
    specialisation: 'Vedic Jyotish',
    target: 100,
    discovered: 73,
    qualified: 41,
    rejected: 18,
    duplicates: 4,
    status: 'running',
    jobStatus: 'Running',
    minScore: 80,
    progress: 73,
    createdDate: '12 Aug 2026',
    lastRun: '17 Aug 2026',
    sources: ['Google Places', 'Web Search'],
  },
  {
    id: 'camp-002',
    name: 'Bangalore KP System Discovery',
    location: 'Bengaluru, KA',
    specialisation: 'KP System',
    target: 60,
    discovered: 58,
    qualified: 34,
    rejected: 12,
    duplicates: 7,
    status: 'completed',
    jobStatus: 'Completed',
    minScore: 75,
    progress: 97,
    createdDate: '08 Aug 2026',
    lastRun: '14 Aug 2026',
    sources: ['Google Places', 'Directory'],
  },
  {
    id: 'camp-003',
    name: 'Varanasi Vedic & Muhurtha',
    location: 'Varanasi, UP',
    specialisation: 'Vedic Jyotish',
    target: 80,
    discovered: 12,
    qualified: 7,
    rejected: 3,
    duplicates: 1,
    status: 'running',
    jobStatus: 'Running',
    minScore: 85,
    progress: 15,
    createdDate: '16 Aug 2026',
    lastRun: '17 Aug 2026',
    sources: ['Google Places', 'Web Search'],
  },
  {
    id: 'camp-004',
    name: 'Mumbai Nadi Astrology',
    location: 'Mumbai, MH',
    specialisation: 'Nadi Astrology',
    target: 50,
    discovered: 0,
    qualified: 0,
    rejected: 0,
    duplicates: 0,
    status: 'queued',
    jobStatus: 'Queued',
    minScore: 82,
    progress: 0,
    createdDate: '17 Aug 2026',
    lastRun: '—',
    sources: ['Google Places'],
  },
  {
    id: 'camp-005',
    name: 'Hyderabad Numerology Experts',
    location: 'Hyderabad, TS',
    specialisation: 'Numerology',
    target: 40,
    discovered: 38,
    qualified: 22,
    rejected: 9,
    duplicates: 3,
    status: 'paused',
    jobStatus: 'Paused',
    minScore: 70,
    progress: 95,
    createdDate: '05 Aug 2026',
    lastRun: '10 Aug 2026',
    sources: ['Web Search', 'Directory'],
  },
  {
    id: 'camp-006',
    name: 'Jaipur Vastu Consultants',
    location: 'Jaipur, RJ',
    specialisation: 'Vastu Shastra',
    target: 30,
    discovered: 30,
    qualified: 18,
    rejected: 8,
    duplicates: 2,
    status: 'completed',
    jobStatus: 'Completed',
    minScore: 75,
    progress: 100,
    createdDate: '01 Aug 2026',
    lastRun: '06 Aug 2026',
    sources: ['Google Places'],
  },
];

export const initialSearchHistory: SearchRecord[] = [
  { id: 'SH-001', query: 'Vedic astrologer Chennai', source: 'Web Search', campaign: 'Vedic Astrologers – Chennai', executedAt: '2026-08-17 09:05', resultsFound: 42, candidatesExtracted: 18, status: 'success', duration: '3.2s' },
  { id: 'SH-002', query: 'Jyotish consultant Chennai', source: 'Web Search', campaign: 'Vedic Astrologers – Chennai', executedAt: '2026-08-17 09:07', resultsFound: 38, candidatesExtracted: 14, status: 'success', duration: '2.8s' },
  { id: 'SH-003', query: 'Vedic astrologer near Chennai', source: 'Google Places', campaign: 'Vedic Astrologers – Chennai', executedAt: '2026-08-17 09:10', resultsFound: 25, candidatesExtracted: 11, status: 'success', duration: '4.1s' },
  { id: 'SH-004', query: 'Nadi astrologer Tamil Nadu', source: 'Web Search', campaign: 'Nadi Astrologers – Tamil Nadu', executedAt: '2026-08-16 14:05', resultsFound: 31, candidatesExtracted: 12, status: 'success', duration: '2.5s' },
  { id: 'SH-005', query: 'Muhurtha specialist Hyderabad', source: 'Astrology Directory India', campaign: 'Muhurtha Specialists – Hyderabad', executedAt: '2026-08-14 09:15', resultsFound: 0, candidatesExtracted: 0, status: 'failed', duration: '0.8s' },
  { id: 'SH-006', query: 'KP astrologer Mumbai', source: 'Web Search', campaign: 'KP Astrologers – Mumbai', executedAt: '2026-08-17 07:35', resultsFound: 19, candidatesExtracted: 7, status: 'partial', duration: '5.2s' },
  { id: 'SH-007', query: 'Prashna Jyotish Bangalore', source: 'Web Search', campaign: 'Prashna Astrologers – Bangalore', executedAt: '2026-08-15 10:05', resultsFound: 14, candidatesExtracted: 5, status: 'partial', duration: '3.7s' },
  { id: 'SH-008', query: 'Vastu consultant Delhi NCR', source: 'Google Places', campaign: 'Vastu Consultants – Delhi', executedAt: '2026-08-17 08:00', resultsFound: 0, candidatesExtracted: 0, status: 'failed', duration: '1.2s' },
  { id: 'SH-009', query: 'Jyotish practitioner Chennai', source: 'Sulekha Professional Listings', campaign: 'Vedic Astrologers – Chennai', executedAt: '2026-08-17 09:12', resultsFound: 22, candidatesExtracted: 9, status: 'success', duration: '2.1s' },
  { id: 'SH-010', query: 'Nadi Jyotish specialist Thanjavur', source: 'Web Search', campaign: 'Nadi Astrologers – Tamil Nadu', executedAt: '2026-08-16 14:20', resultsFound: 17, candidatesExtracted: 8, status: 'success', duration: '3.0s' },
];

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
      return initialCampaigns;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
  } catch (err) {
    console.warn('Error fetching campaigns from Firestore:', err);
    return initialCampaigns;
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
        onData(initialCampaigns);
        return;
      }
      const campaigns = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
      onData(campaigns);
    },
    (err) => {
      console.warn('Campaign subscription error, fallback to memory:', err);
      onData(initialCampaigns);
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
        onData(initialSearchHistory);
        return;
      }
      const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SearchRecord));
      onData(records);
    },
    (err) => {
      console.warn('Search history subscription fallback:', err);
      onData(initialSearchHistory);
      if (onError) onError(err);
    }
  );
}
