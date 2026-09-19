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

export interface CandidateHistoryItem {
  stage: string;
  timestamp: string;
  notes: string;
  actor?: string;
  status?: string;
}

export interface Candidate {
  id: string;
  name: string;
  businessName: string;
  location: string;
  specialisations: string[];
  aiScore: number;
  theoryScore?: number;
  chartCaseScore?: number;
  aiInterviewScore?: number;
  source: string;
  outreachStatus: string;
  applicationStatus: string | null;
  lifecycleStatus: string;
  discoveredDate: string;
  isDuplicate: boolean;
  experience: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  website?: string;
  profileSummary?: string;
  learningBackground?: string;
  courseDetails?: string;
  idProofType?: 'aadhaar' | 'pan' | string;
  idProofNumber?: string;
  idProofDocument?: string;
  campaignName?: string;
  rating?: number;
  userRatingsTotal?: number;
  history?: CandidateHistoryItem[];
  // Assessment, Kundali, and Interview Details
  chartCaseTitle?: string;
  chartCaseLagna?: string;
  chartCaseQuery?: string;
  chartCasePlacements?: any[];
  chartCaseAnalysis?: string;
  chartRemedy?: string;
  chartEvaluation?: any;
  conversationHistory?: Array<{ role: 'ai' | 'user' | string; text: string; topic?: string; timestamp?: string }>;
  aiInterviewEvaluation?: any;
  theoryAnswers?: Record<number, number>;
  theoryQuestionsList?: any[];
  interviewDurationSeconds?: number;
  interviewDurationFormatted?: string;
  assessmentDurationSeconds?: number;
  assessmentDurationFormatted?: string;
  assessmentLanguage?: string;
  tabViolations?: number;
  proctorLogs?: any[];
  isDisqualified?: boolean;
  disqualificationReason?: string;
  bio?: string;
  languages?: string;
  appliedAt?: any;
  applicationData?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface ResolvedCandidateContact {
  phone: string | null;
  rawPhone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string;
  website: string | null;
  profileSummary: string;
  learningBackground?: string;
  idProofType?: string;
  idProofNumber?: string;
  idProofDocument?: string;
  history: CandidateHistoryItem[];
  // Assessment fields
  theoryScore: number;
  chartCaseScore: number;
  aiInterviewScore: number;
  overallScore: number;
  chartCaseAnalysis: string;
  chartRemedy: string;
  chartEvaluation: any;
  chartCaseTitle?: string;
  chartCaseLagna?: string;
  chartCaseQuery?: string;
  chartCasePlacements?: any[];
  conversationHistory: Array<{ role: 'ai' | 'user' | string; text: string; topic?: string; timestamp?: string }>;
  aiInterviewEvaluation: any;
  theoryAnswers: Record<number, number>;
  theoryQuestionsList: any[];
  interviewDurationSeconds: number;
  interviewDurationFormatted: string;
  assessmentDurationFormatted: string;
  tabViolations: number;
  proctorLogs: any[];
  isDisqualified: boolean;
  disqualificationReason: string;
  assessmentLanguage: string;
}

/**
 * Returns genuine contact details and profile history.
 * If a phone or email is not publicly listed or available, it cleanly returns null.
 */
export function resolveCandidateContact(candidate: Candidate): ResolvedCandidateContact {
  // Only return real phone number if provided by discovery source
  const hasPhone = Boolean(candidate.phone && candidate.phone.trim() !== '');
  const phone = hasPhone ? candidate.phone!.trim() : null;
  const rawPhone = phone ? phone.replace(/[^0-9+]/g, '') : null;

  // Only return genuine email if provided by discovery source (filter out mock domains)
  const isMockEmail = candidate.email && (
    candidate.email.includes('@astroparihar.verified') ||
    candidate.email.includes('@jyotish.in') ||
    candidate.email.includes('@vedicconsult.in') ||
    candidate.email.includes('@kundali.org')
  );
  const email = candidate.email && candidate.email.trim() !== '' && !isMockEmail
    ? candidate.email.trim()
    : null;

  // Real website if available
  const website = candidate.website && candidate.website.trim() !== ''
    ? candidate.website.trim()
    : null;

  const address = candidate.address && candidate.address.trim() !== ''
    ? candidate.address
    : candidate.location;

  const profileSummary = candidate.profileSummary && candidate.profileSummary.trim() !== ''
    ? candidate.profileSummary
    : `${candidate.name} is an astrologer based in ${candidate.location}, specializing in ${candidate.specialisations?.join(', ') || 'Vedic Astrology'}.`;

  // Construct complete lifecycle history timeline
  const defaultHistory: CandidateHistoryItem[] = [
    {
      stage: 'Discovered',
      timestamp: candidate.discoveredDate || 'Campaign Launch',
      notes: `Discovered through ${candidate.source || 'AI Discovery & Google Places'}${candidate.campaignName ? ` for campaign "${candidate.campaignName}"` : ''}.`,
      actor: 'Autonomous Discovery Agent',
      status: 'success'
    },
    {
      stage: 'AI Qualification',
      timestamp: candidate.discoveredDate || 'Campaign Launch',
      notes: `Evaluated by GPT-4o with qualification score of ${candidate.aiScore}/100. Status: ${candidate.aiScore >= 80 ? 'Qualified' : 'Pending Review'}.`,
      actor: 'AI Scoring Engine',
      status: candidate.aiScore >= 80 ? 'success' : 'info'
    },
    {
      stage: 'Outreach Stage',
      timestamp: candidate.outreachStatus === 'Sent' ? 'Recent' : 'In Pipeline',
      notes: candidate.outreachStatus === 'Sent' 
        ? 'Personalized AI outreach email/WhatsApp invitation dispatched.'
        : candidate.outreachStatus === 'Approved'
        ? 'Approved by recruitment admin for automated outreach dispatch.'
        : 'Awaiting admin outreach approval and personalized message review.',
      actor: candidate.outreachStatus === 'Sent' ? 'Recruiter Outreach Agent' : 'Recruitment Admin',
      status: candidate.outreachStatus === 'Sent' ? 'success' : 'pending'
    }
  ];

  if (candidate.lifecycleStatus === 'verified' || candidate.lifecycleStatus === 'probation') {
    defaultHistory.push({
      stage: 'Verification & Onboarding',
      timestamp: 'Active',
      notes: `Advanced to ${candidate.lifecycleStatus.toUpperCase()} lifecycle stage. Credentials and identity verified.`,
      actor: 'Compliance Specialist',
      status: 'success'
    });
  }

  const history = candidate.history && candidate.history.length > 0
    ? candidate.history
    : defaultHistory;

  const appData = candidate.applicationData || {};
  const chartCaseAnalysis = candidate.chartCaseAnalysis || appData.chartCaseAnalysis || '';
  const chartRemedy = candidate.chartRemedy || appData.chartRemedy || '';
  const chartEvaluation = candidate.chartEvaluation || appData.chartEvaluation || null;
  const conversationHistory = candidate.conversationHistory || appData.conversationHistory || [];
  const aiInterviewEvaluation = candidate.aiInterviewEvaluation || appData.aiInterviewEvaluation || null;
  const theoryAnswers = candidate.theoryAnswers || appData.theoryAnswers || {};
  const theoryQuestionsList = candidate.theoryQuestionsList || appData.theoryQuestionsList || [];
  const theoryScore = candidate.theoryScore ?? appData.theoryScore ?? 0;
  const chartCaseScore = candidate.chartCaseScore ?? appData.chartCaseScore ?? 0;
  const aiInterviewScore = candidate.aiInterviewScore ?? appData.aiInterviewScore ?? 0;
  const overallScore = candidate.aiScore ?? 0;
  const interviewDurationSeconds = candidate.interviewDurationSeconds ?? appData.interviewDurationSeconds ?? 0;
  const interviewDurationFormatted = candidate.interviewDurationFormatted || appData.interviewDurationFormatted || (interviewDurationSeconds > 0 ? `${Math.floor(interviewDurationSeconds / 60)}m ${interviewDurationSeconds % 60}s` : 'Not recorded');
  const assessmentDurationFormatted = candidate.assessmentDurationFormatted || appData.assessmentDurationFormatted || 'Completed';
  const tabViolations = candidate.tabViolations ?? appData.tabViolations ?? appData.proctoring?.tabViolations ?? 0;
  const proctorLogs = candidate.proctorLogs || appData.proctorLogs || appData.proctoring?.proctorLogs || [];
  const isDisqualified = Boolean(candidate.isDisqualified ?? appData.isDisqualified ?? appData.proctoring?.isDisqualified);
  const disqualificationReason = candidate.disqualificationReason || appData.disqualificationReason || appData.proctoring?.disqualificationReason || '';
  const assessmentLanguage = candidate.assessmentLanguage || appData.assessmentLanguage || 'en';

  return {
    phone,
    rawPhone,
    whatsapp: candidate.whatsapp || phone,
    email,
    address,
    website,
    profileSummary,
    learningBackground: candidate.learningBackground || appData.learningBackground,
    idProofType: candidate.idProofType || appData.idProofType,
    idProofNumber: candidate.idProofNumber || appData.idProofNumber,
    idProofDocument: candidate.idProofDocument || appData.idProofDocument,
    history,
    theoryScore,
    chartCaseScore,
    aiInterviewScore,
    overallScore,
    chartCaseAnalysis,
    chartRemedy,
    chartEvaluation,
    chartCaseTitle: candidate.chartCaseTitle || appData.chartCaseTitle || '',
    chartCaseLagna: candidate.chartCaseLagna || appData.chartCaseLagna || '',
    chartCaseQuery: candidate.chartCaseQuery || appData.chartCaseQuery || '',
    chartCasePlacements: candidate.chartCasePlacements || appData.chartCasePlacements || [],
    conversationHistory,
    aiInterviewEvaluation,
    theoryAnswers,
    theoryQuestionsList,
    interviewDurationSeconds,
    interviewDurationFormatted,
    assessmentDurationFormatted,
    tabViolations,
    proctorLogs,
    isDisqualified,
    disqualificationReason,
    assessmentLanguage,
  };
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
  // Strip undefined values to prevent Firestore unsupported field value errors
  const cleanData = Object.fromEntries(
    Object.entries(candidate).filter(([_, val]) => val !== undefined)
  );
  await setDoc(docRef, {
    ...cleanData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Update candidate lifecycle, outreach status, assessment, or review data
 */
export async function updateCandidateStatus(
  id: string, 
  updates: Partial<Candidate> | Record<string, any>
): Promise<void> {
  const docRef = doc(db, CANDIDATES_COLLECTION, id);
  const clean = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(docRef, {
    ...clean,
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
 * Delete ALL candidates from Firestore
 */
export async function deleteAllCandidatesFromFirestore(): Promise<{ count: number; success: boolean }> {
  try {
    const colRef = collection(db, CANDIDATES_COLLECTION);
    const snap = await getDocs(colRef);
    let deleted = 0;
    for (const docSnap of snap.docs) {
      await deleteDoc(docSnap.ref);
      deleted++;
    }
    return { count: deleted, success: true };
  } catch (err) {
    console.error('Failed to delete all candidates:', err);
    return { count: 0, success: false };
  }
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
