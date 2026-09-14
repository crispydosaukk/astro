'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  BookOpen, 
  Brain, 
  Mic, 
  Send, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  AlertCircle, 
  FileCheck2, 
  Clock, 
  ShieldCheck, 
  Compass, 
  Star, 
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trash2,
  GraduationCap,
  MessageCircle,
  FileUp,
  Eye,
  FileText,
  Sliders,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Shuffle,
  Wand2,
  HelpCircle,
  CheckCheck,
  ShieldAlert,
  Maximize2,
  AlertOctagon,
  Ban,
  EyeOff,
  Radio,
  LockKeyhole
} from 'lucide-react';

interface TheoryQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
}

const THEORY_QUESTIONS: TheoryQuestion[] = [
  {
    id: 1,
    question: 'In Vedic Jyotish, which house represents Dharma, higher wisdom, fortunes (Bhagya), and the Guru?',
    options: ['5th House (Trikona)', '9th House (Bhagya Sthana)', '10th House (Karma Sthana)', '1st House (Lagna)'],
    correctIndex: 1,
    explanation: 'The 9th house is the prime Dharma and Bhagya Bhava representing divine fortunes, pilgrimage, and spiritual guidance.'
  },
  {
    id: 2,
    question: 'Which planetary combination forms a classic "Gajakesari Yoga"?',
    options: [
      'Sun and Mercury in the same house (Budhaditya)',
      'Jupiter and Moon in Kendra (1, 4, 7, 10) from each other',
      'Saturn and Rahu conjunction (Shrapit Yoga)',
      'Mars in the 7th house from Lagna'
    ],
    correctIndex: 1,
    explanation: 'Gajakesari Yoga is formed when Jupiter occupies a Kendra from the Moon or Lagna, conferring wisdom, respect, and enduring fame.'
  },
  {
    id: 3,
    question: 'How is the strength of a planet in the Navamsha (D9) chart interpreted relative to the Rashi (D1) chart?',
    options: [
      'D9 is only used for wealth calculations',
      'A debilitated planet in D1 gaining exaltation in D9 gains Neecha Bhanga and hidden inner strength (Vargottama/Pushkara)',
      'D9 completely overrides D1 in all circumstances',
      'D9 has no bearing on planetary strength'
    ],
    correctIndex: 1,
    explanation: 'Navamsha reveals the fruit (Phala) and underlying core potential of planetary placements in the natal chart.'
  },
  {
    id: 4,
    question: 'What is the standard order of the Vimshottari Dasha system starting from Ketu?',
    options: [
      'Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury',
      'Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus',
      'Jupiter → Saturn → Mercury → Ketu → Venus → Sun → Moon → Mars → Rahu',
      'Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus → Sun → Moon'
    ],
    correctIndex: 0,
    explanation: 'The standard 120-year Vimshottari dasha cycle begins with Ketu (7 yrs) followed by Venus (20 yrs), Sun (6 yrs), Moon (10 yrs), etc.'
  },
  {
    id: 5,
    question: 'When recommending astrological remedies for severe afflictions (e.g. Kaal Sarp or Sade Sati), what is the most ethical approach?',
    options: [
      'Guarantee 100% immediate results within 24 hours for expensive rituals',
      'Explain planetary energies calmly, recommend accessible japa/charity/mantras, and encourage constructive lifestyle action without fear-mongering',
      'Advise the client that their destiny is completely doomed without expensive gems',
      'Recommend avoiding all consultations in the future'
    ],
    correctIndex: 1,
    explanation: 'Ethical Vedic guidance empowers clients with sattvic remedies, positive karma, and realistic guidance without creating anxiety.'
  }
];

function CandidateApplyPortal() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Wizard Step (1: Profile, 2: Theory, 3: Blind Chart, 4: AI Interview, 5: In-Process Submitted)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Profile Form State
  const [candidateId, setCandidateId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('New Delhi, India');
  const [specialisation, setSpecialisation] = useState('Vedic Jyotish');
  const [experience, setExperience] = useState('12+ years');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('Hindi, English');
  
  // Learning Background & Certification
  const [learningBackground, setLearningBackground] = useState('');
  const [courseDetails, setCourseDetails] = useState('');

  // ID Proof Verification & Upload State (Aadhaar / PAN)
  const [idProofType, setIdProofType] = useState<'aadhaar' | 'pan'>('aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [idProofDocument, setIdProofDocument] = useState('');
  const [idProofFileName, setIdProofFileName] = useState('');
  const [idProofFileSize, setIdProofFileSize] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Step 2: Dynamic Questions State & Settings
  const [isCuratedMode, setIsCuratedMode] = useState<boolean>(true); // Toggle ON = Curated, OFF = AI Random Questions
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [questionsList, setQuestionsList] = useState<TheoryQuestion[]>(THEORY_QUESTIONS.slice(0, 5));
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);

  // Dynamic AI Scoring & Qualification Settings
  const [passingThreshold, setPassingThreshold] = useState<number>(75);
  const [theoryWeight, setTheoryWeight] = useState<number>(35);
  const [chartWeight, setChartWeight] = useState<number>(25);
  const [interviewWeight, setInterviewWeight] = useState<number>(40);
  const [showScoreSettings, setShowScoreSettings] = useState<boolean>(false);

  // Anti-Cheating & AI Proctoring Restrictions State
  const [tabViolations, setTabViolations] = useState<number>(0);
  const maxAllowedViolations = 3;
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false);
  const [lastViolationDetail, setLastViolationDetail] = useState<string>('');
  const [proctorLogs, setProctorLogs] = useState<Array<{ id: string; timestamp: string; type: string; details: string }>>([]);
  const [isDisqualified, setIsDisqualified] = useState<boolean>(false);
  const [disqualificationReason, setDisqualificationReason] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [clipboardToast, setClipboardToast] = useState<string | null>(null);

  // Step 2: Theory Assessment State
  const [theoryAnswers, setTheoryAnswers] = useState<Record<number, number>>({});
  const [theorySubmitted, setTheorySubmitted] = useState(false);
  const [theoryScore, setTheoryScore] = useState(0);

  // Show temporary clipboard / shortcut warning toast
  const showToast = (msg: string) => {
    setClipboardToast(msg);
    setTimeout(() => {
      setClipboardToast(null);
    }, 3500);
  };

  // Record a proctoring violation (Tab switch / Window Blur / DevTools)
  const recordViolation = (type: string, details: string) => {
    if (isDisqualified) return;

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = {
      id: `viol-${Date.now()}`,
      timestamp,
      type,
      details
    };

    setProctorLogs(prev => [...prev, logEntry]);
    setLastViolationDetail(details);

    setTabViolations(prev => {
      const newCount = prev + 1;
      if (newCount >= maxAllowedViolations) {
        setIsDisqualified(true);
        const reason = `Exceeded maximum allowable proctoring violations (${newCount}/${maxAllowedViolations}). Multiple tab switches or unauthorized window loss detected during live examination.`;
        setDisqualificationReason(reason);
        setShowViolationModal(false);

        // Auto report disqualification to backend
        fetch('/api/candidate/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: candidateId || `ast-dq-${Date.now()}`,
            name: name || 'Candidate',
            phone: phone || '0000000000',
            email: email || '',
            location,
            specialisations: [specialisation],
            experience,
            isDisqualified: true,
            disqualificationReason: reason,
            tabViolations: newCount,
            proctorLogs: [...proctorLogs, logEntry],
          })
        }).catch(err => console.warn('Failed to auto-report disqualification:', err));

        return newCount;
      } else {
        setShowViolationModal(true);
        return newCount;
      }
    });
  };

  // Fullscreen Management
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Proctored Anti-Cheating Event Listeners (Active during Steps 2, 3, 4)
  useEffect(() => {
    const isExamStep = currentStep >= 2 && currentStep <= 4;
    if (!isExamStep || isDisqualified) return;

    // 1. Visibility Change Listener (Tab switch, minimize window)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation(
          'Tab / Window Switch',
          'Candidate navigated away from the exam tab, switched browser tabs, or minimized the window.'
        );
      }
    };

    // 2. Window Blur Listener (Loss of active browser focus / opening external apps)
    const handleWindowBlur = () => {
      recordViolation(
        'Window Focus Lost',
        'Candidate switched to a secondary program, external chat, or external monitor.'
      );
    };

    // 3. Prevent Copy, Paste, Cut
    const handleClipboardEvent = (e: ClipboardEvent) => {
      e.preventDefault();
      showToast('⚠️ Copy, Paste, and Cut are strictly disabled during this proctored assessment.');
    };

    // 4. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast('⚠️ Right-click context menu is locked during the assessment.');
    };

    // 5. Prevent Keyboard Shortcuts & DevTools (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+C/V/X/S/P)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Devtools: F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Developer Inspection Tools (F12) are strictly prohibited.');
        return;
      }

      // Devtools: Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Developer Console is blocked.');
        return;
      }

      // View Source: Ctrl+U
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Viewing page source is disabled.');
        return;
      }

      // Copy / Paste / Cut / Print / Save Shortcuts (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S)
      // Note: allow Ctrl+Enter for sending interview answer
      if (e.ctrlKey && ['c', 'C', 'v', 'V', 'x', 'X', 'p', 'P', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Clipboard shortcuts and Print/Save commands are locked during test.');
        return;
      }
    };

    // 6. Fullscreen Change Tracker
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleClipboardEvent);
    document.addEventListener('paste', handleClipboardEvent);
    document.addEventListener('cut', handleClipboardEvent);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleClipboardEvent);
      document.removeEventListener('paste', handleClipboardEvent);
      document.removeEventListener('cut', handleClipboardEvent);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentStep, isDisqualified, candidateId, name, phone, email, location, specialisation, experience, proctorLogs]);

  // Fetch or Switch Dynamic Questions
  const fetchQuestions = async (count: number, curated: boolean, spec: string) => {
    setIsLoadingQuestions(true);
    setTheoryAnswers({});
    setTheorySubmitted(false);
    setTheoryScore(0);

    try {
      if (curated) {
        // Curated Standard Question Pool
        setQuestionsList(THEORY_QUESTIONS.slice(0, count));
      } else {
        // AI Dynamic / Random Generated Questions
        const res = await fetch('/api/ai/generate-assignment-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            specialisation: spec || specialisation || 'Vedic Jyotish',
            count,
            isAiDynamic: true
          })
        });
        const data = await res.json();
        if (data.success && data.questions && data.questions.length > 0) {
          setQuestionsList(data.questions);
        } else {
          setQuestionsList(THEORY_QUESTIONS.slice(0, count));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic questions:', err);
      setQuestionsList(THEORY_QUESTIONS.slice(0, count));
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleToggleQuestionMode = (curated: boolean) => {
    setIsCuratedMode(curated);
    fetchQuestions(questionCount, curated, specialisation);
  };

  const handleChangeQuestionCount = (newCount: number) => {
    setQuestionCount(newCount);
    fetchQuestions(newCount, isCuratedMode, specialisation);
  };

  const handleRegenerateAiQuestions = () => {
    fetchQuestions(questionCount, false, specialisation);
  };

  // Step 3: Blind Kundali Chart State
  const [chartAnalysis, setChartAnalysis] = useState('');
  const [chartRemedy, setChartRemedy] = useState('');
  const [chartScore, setChartScore] = useState(85);

  // Step 4: AI Interview State
  const [aiQuestionIndex, setAiQuestionIndex] = useState(0);
  const [userInterviewAnswer, setUserInterviewAnswer] = useState('');
  const [conversationHistory, setConversationHistory] = useState<{ role: 'ai' | 'user'; text: string; topic?: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInterviewComplete, setAiInterviewComplete] = useState(false);
  const [aiInterviewEvaluation, setAiInterviewEvaluation] = useState<any>(null);

  // Step 5: Final Submission State
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [applicationRefId, setApplicationRefId] = useState('');

  // Auto-fill from URL query parameters
  useEffect(() => {
    const idParam = searchParams.get('id');
    const nameParam = searchParams.get('name');
    const phoneParam = searchParams.get('phone');
    const emailParam = searchParams.get('email');
    const locParam = searchParams.get('location');
    const specParam = searchParams.get('specialisation');

    if (idParam) setCandidateId(idParam);
    if (nameParam) setName(nameParam);
    if (phoneParam) {
      setPhone(phoneParam);
      setWhatsapp(phoneParam);
    }
    if (emailParam && emailParam !== 'null' && emailParam !== 'undefined') setEmail(emailParam);
    if (locParam) setLocation(locParam);
    if (specParam) setSpecialisation(specParam);

    // Initial AI Interview Question
    if (conversationHistory.length === 0) {
      setConversationHistory([
        {
          role: 'ai',
          topic: 'Client Consulting & Empathy',
          text: `Namaste ${nameParam || 'Pandit Ji'} 🙏! Welcome to the AstroParihar Astrologer Screening. To begin: A client comes to you in extreme distress over sudden business loss and domestic tension. How do you analyze their state calmly and communicate your Vedic astrological findings without instilling fear?`
        }
      ]);
    }
  }, [searchParams]);

  // Handle Document / Photo Upload
  const handleIdProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller image or PDF document.');
      return;
    }

    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onload = () => {
      setIdProofDocument(reader.result as string);
      setIdProofFileName(file.name);
      setIdProofFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      setIsUploadingDoc(false);
    };
    reader.onerror = () => {
      alert('Failed to process document file.');
      setIsUploadingDoc(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveIdProof = () => {
    setIdProofDocument('');
    setIdProofFileName('');
    setIdProofFileSize('');
  };

  // Step 1: Validation
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Please provide your full name, phone number, and email address.');
      return;
    }
    if (!learningBackground.trim()) {
      alert('Please state where you studied astrology (Institute, Gurukul, or Guru Lineage).');
      return;
    }
    if (!password.trim() || password.length < 6) {
      alert('Please set a secure password of at least 6 characters for your Astrologer Account.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Theory Quiz Grading
  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setTheoryAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGradeTheory = () => {
    let correct = 0;
    questionsList.forEach(q => {
      if (theoryAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const calculatedScore = Math.round((correct / (questionsList.length || 1)) * 100);
    setTheoryScore(calculatedScore);
    setTheorySubmitted(true);
  };

  const handleProceedFromTheory = () => {
    if (!theorySubmitted) {
      handleGradeTheory();
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3: Chart Case Submission
  const handleProceedFromChart = () => {
    if (!chartAnalysis.trim() || chartAnalysis.length < 20) {
      alert('Please provide your astrological observations on the sample Kundali case.');
      return;
    }
    // Estimated score based on depth
    setChartScore(chartAnalysis.length > 80 ? 92 : 85);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4: AI Interview Interactions
  const handleSendInterviewAnswer = async () => {
    if (!userInterviewAnswer.trim() || isAiLoading) return;

    const answerText = userInterviewAnswer.trim();
    setUserInterviewAnswer('');
    setIsAiLoading(true);

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, text: answerText }
    ];
    setConversationHistory(updatedHistory);

    try {
      if (aiQuestionIndex >= 2) {
        // Final Question Answered -> Request Full GPT-4o Evaluation
        const evalRes = await fetch('/api/ai/candidate-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateName: name,
            specialisation,
            isFinalEvaluation: true,
            conversationHistory: updatedHistory,
          })
        });
        const evalData = await evalRes.json();
        if (evalData.success && evalData.evaluation) {
          setAiInterviewEvaluation(evalData.evaluation);
          setAiInterviewComplete(true);
          setConversationHistory(prev => [
            ...prev,
            {
              role: 'ai',
              topic: 'Evaluation Complete',
              text: `Thank you, ${name} Ji! Your AI technical interview has been evaluated with a score of ${evalData.evaluation.totalScore}/100. Our committee will review the complete transcript alongside your theory scores.`
            }
          ]);
        }
      } else {
        // Next Question
        const nextIdx = aiQuestionIndex + 1;
        setAiQuestionIndex(nextIdx);

        const res = await fetch('/api/ai/candidate-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateName: name,
            specialisation,
            currentQuestionIndex: aiQuestionIndex,
            userAnswer: answerText,
            conversationHistory: updatedHistory,
          })
        });
        const data = await res.json();
        if (data.success && data.nextQuestion) {
          setConversationHistory(prev => [
            ...prev,
            {
              role: 'ai',
              topic: data.nextQuestion.topic,
              text: `${data.aiFeedback}\n\n${data.nextQuestion.question}`
            }
          ]);
        }
      }
    } catch (err) {
      console.error('AI Interview error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Final Step 5 Submission to Backend
  const handleFinalSubmit = async () => {
    setIsSubmittingFinal(true);
    try {
      const payload = {
        candidateId: candidateId || `ast-${Date.now()}`,
        name,
        email,
        phone,
        whatsapp: sameAsPhone ? phone : (whatsapp || phone),
        location,
        specialisations: [specialisation],
        experience,
        bio,
        learningBackground,
        courseDetails,
        idProofType,
        idProofNumber,
        idProofDocument,
        password,
        languages: languages.split(',').map(s => s.trim()),
        theoryScore,
        chartCaseScore: chartScore,
        aiInterviewScore: aiInterviewEvaluation?.totalScore || 88,
        aiInterviewEvaluation,
        theoryAnswers,
        chartCaseAnalysis: `${chartAnalysis}\n\nRemedies: ${chartRemedy}`,
        conversationHistory,
        // Dynamic Scoring & Assessment Configuration
        passingThreshold,
        theoryWeight,
        chartCaseWeight: chartWeight,
        aiInterviewWeight: interviewWeight,
        isAiDynamicQuestions: !isCuratedMode,
        questionCount: questionsList.length,
        // Anti-Cheating & Proctoring Data
        tabViolations,
        proctorLogs,
        isDisqualified,
        disqualificationReason,
      };

      const res = await fetch('/api/candidate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setApplicationRefId(data.applicationId || candidateId || 'AP-2026-AST');
        setSubmissionSuccess(true);
        setCurrentStep(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Unable to submit application. Please check details.');
      }
    } catch (err: any) {
      alert('Error submitting application: ' + err.message);
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header Branding */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl terracotta-gradient flex items-center justify-center text-white shadow-xs font-bold text-lg">
            ॐ
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-foreground flex items-center gap-2">
              AstroParihar Onboarding Portal
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Verified Astrologer Network
              </span>
            </h1>
            <p className="text-2xs text-muted-foreground">
              Candidate Credentialing, Vedic Theory Assessment & AI Interview
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Encrypted Submission · Gmail SMTP & Firestore Sync</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Toast Warning for Clipboard / Shortcuts */}
        {clipboardToast && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
            <ShieldAlert size={16} />
            <span>{clipboardToast}</span>
          </div>
        )}

        {/* Tab Switch Violation Warning Modal (Warnings 1 and 2) */}
        {showViolationModal && !isDisqualified && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-card border-2 border-red-500 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-slide-up">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/80 border-2 border-red-500 text-red-600 flex items-center justify-center mx-auto">
                <AlertOctagon size={32} />
              </div>

              <div className="space-y-1">
                <span className="text-2xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                  Security Violation Warning ({tabViolations} of {maxAllowedViolations})
                </span>
                <h3 className="text-lg font-bold text-foreground mt-2">
                  Prohibited Tab Switch / Window Loss Detected!
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lastViolationDetail || 'You navigated away from the examination window or switched browser tabs.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-left text-xs space-y-1.5 text-red-900 dark:text-red-200">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-red-600" />
                  Anti-Cheating Policy Notice:
                </p>
                <p className="text-2xs text-muted-foreground">
                  You have <strong className="text-red-600 font-bold">{maxAllowedViolations - tabViolations}</strong> warning remaining. If you switch tabs again, your exam will be terminated immediately with automatic disqualification for malpractice.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowViolationModal(false)}
                className="w-full btn-primary bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-md"
              >
                I Understand — Return to Examination Now
              </button>
            </div>
          </div>
        )}

        {/* MALPRACTICE DISQUALIFICATION SCREEN (If 3 violations reached) */}
        {isDisqualified && (
          <div className="card-elevated p-8 md:p-12 text-center space-y-6 animate-slide-up border-2 border-red-600 bg-red-50/10">
            <div className="w-18 h-18 rounded-full bg-red-100 dark:bg-red-950/80 border-4 border-red-600 text-red-600 flex items-center justify-center mx-auto shadow-xl">
              <Ban size={40} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-600 text-white shadow-xs">
                Candidate Disqualified · Malpractice Lock
              </span>
              <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mt-3">
                Assessment Terminated Due to Proctoring Violations
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Candidate <strong>{name || 'Unknown'}</strong> has been disqualified from AstroParihar onboarding due to multiple detected tab switches and unauthorized window activity during the exam.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-red-300 dark:border-red-900 max-w-lg mx-auto text-left space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-red-600" />
                Violation Audit Log:
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {proctorLogs.map((log, idx) => (
                  <div key={log.id || idx} className="text-2xs p-2 rounded bg-muted/40 border border-border flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-red-600">[{log.timestamp}] {log.type}:</strong>
                      <p className="text-muted-foreground">{log.details}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-3xs font-bold whitespace-nowrap">
                      Violation #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              This malpractice event has been logged and synchronized with the verification administration system.
            </p>

            <div>
              <Link
                href="/"
                className="btn-secondary text-xs py-2 px-5 inline-flex items-center gap-1.5"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

        {/* LIVE PROCTORING SECURITY STATUS BAR (Steps 2, 3, 4 only) */}
        {!isDisqualified && currentStep >= 2 && currentStep <= 4 && (
          <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 backdrop-blur-xs flex items-center justify-between flex-wrap gap-2 animate-fade-in text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span className="font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider text-2xs flex items-center gap-1">
                <Radio size={13} className="animate-pulse" />
                AI Anti-Cheating Live Proctor Active
              </span>
            </div>

            {/* Violation tally */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-2xs text-muted-foreground font-semibold">Tab Violations:</span>
                <span className={`text-2xs font-extrabold px-2 py-0.5 rounded-full border ${
                  tabViolations === 0
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : tabViolations === 1
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-300'
                    : 'bg-red-100 dark:bg-red-950/60 border-red-300 text-red-800 dark:text-red-300'
                }`}>
                  {tabViolations} / {maxAllowedViolations} Max
                </span>
              </div>

              {/* Security badges */}
              <div className="hidden sm:flex items-center gap-2 text-3xs font-bold text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-muted/60 border border-border flex items-center gap-1">
                  <LockKeyhole size={10} /> No Tab Switch
                </span>
                <span className="px-2 py-0.5 rounded bg-muted/60 border border-border flex items-center gap-1">
                  <EyeOff size={10} /> Copy/Paste Blocked
                </span>
              </div>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="btn-secondary text-3xs py-1 px-2.5 flex items-center gap-1 cursor-pointer font-bold"
                title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen Exam Mode'}
              >
                <Maximize2 size={11} />
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Step Indicator */}
        {!isDisqualified && (
          <div className="card-elevated p-4 bg-muted/20 border-border">
            <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold pb-1">
              {[
                { step: 1, label: '1. Profile & Account', icon: <User size={13} /> },
                { step: 2, label: '2. Vedic Theory Quiz', icon: <BookOpen size={13} /> },
                { step: 3, label: '3. Kundali Case', icon: <Compass size={13} /> },
                { step: 4, label: '4. AI Interview', icon: <Brain size={13} /> },
                { step: 5, label: '5. In Process / Review', icon: <FileCheck2 size={13} /> },
              ].map(item => (
                <div
                  key={item.step}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    currentStep === item.step
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : currentStep > item.step
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                      : 'text-muted-foreground opacity-60'
                  }`}
                >
                  {currentStep > item.step ? <CheckCircle2 size={13} className="text-emerald-600" /> : item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Candidate Profile & Password Setup */}
        {!isDisqualified && currentStep === 1 && (
          <form onSubmit={handleProfileSubmit} className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User size={20} className="text-primary" />
                Astrologer Profile, Training & Identity Verification
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Please provide your contact details, astrological training background/institute, and upload your Aadhaar or PAN card for identity verification.
              </p>
            </div>

            {/* Section 1: Contact & Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} />
                1. Personal & Contact Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="label-field text-xs">Full Name / Pandit Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Acharya Rajesh Sharma"
                    className="input-field text-sm"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="label-field text-xs flex items-center justify-between">
                    <span>Email Address *</span>
                    <span className="text-2xs text-primary font-medium">For Onboarding Confirmation</span>
                  </label>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground">
                      <Mail size={13} className="text-primary" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="astrologer@example.com"
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>

                {/* Calling Phone Number */}
                <div>
                  <label className="label-field text-xs">Calling Phone Number *</label>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground text-xs font-semibold">
                      <Phone size={13} className="mr-1 text-primary" />
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => {
                        setPhone(e.target.value);
                        if (sameAsPhone) setWhatsapp(e.target.value);
                      }}
                      placeholder="9876543210"
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-field text-xs mb-0">WhatsApp Number *</label>
                    <label className="flex items-center gap-1.5 text-2xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={e => {
                          setSameAsPhone(e.target.checked);
                          if (e.target.checked) setWhatsapp(phone);
                        }}
                        className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                      />
                      <span>Same as Calling Phone</span>
                    </label>
                  </div>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground text-xs font-semibold">
                      <MessageCircle size={13} className="mr-1 text-emerald-600 dark:text-emerald-400" />
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      disabled={sameAsPhone}
                      value={sameAsPhone ? phone : whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="9876543210"
                      className={`flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground ${sameAsPhone ? 'opacity-70 bg-muted/20' : ''}`}
                    />
                  </div>
                </div>

                {/* Account Password */}
                <div className="md:col-span-2">
                  <label className="label-field text-xs flex items-center justify-between">
                    <span>Create Astrologer Portal Password *</span>
                    <span className="text-2xs text-muted-foreground">Min 6 characters (Used to access dashboard)</span>
                  </label>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground">
                      <Lock size={13} className="text-primary" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Set your secure login password"
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Astrological Training & Learning Background */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap size={15} />
                2. Astrological Education, Institute & Guru Lineage
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Learning Institute / Gurukul */}
                <div>
                  <label className="label-field text-xs">
                    Where did you learn astrology? (Institute / Gurukul / Guru) *
                  </label>
                  <input
                    type="text"
                    required
                    value={learningBackground}
                    onChange={e => setLearningBackground(e.target.value)}
                    placeholder="e.g. ICAS, Bharatiya Vidya Bhavan, Traditional Gurukul, Parampara Family"
                    className="input-field text-sm"
                  />
                  <p className="text-2xs text-muted-foreground mt-1">
                    State the academy, university, guru name, or family lineage where you received training.
                  </p>
                </div>

                {/* Degree / Diploma Title */}
                <div>
                  <label className="label-field text-xs">
                    Course / Degree / Diploma Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={courseDetails}
                    onChange={e => setCourseDetails(e.target.value)}
                    placeholder="e.g. Jyotish Praveena, Jyotish Visharad, Acharya"
                    className="input-field text-sm"
                  />
                  <p className="text-2xs text-muted-foreground mt-1">
                    Mention your certification title, year of completion, or traditional title.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Identity Verification (Aadhaar / PAN Upload) */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={15} />
                  3. Identity Proof & KYC Verification (Aadhaar / PAN)
                </h3>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  Government Compliance & KYC
                </span>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select ID Type */}
                  <div>
                    <label className="label-field text-xs">Select Document Type *</label>
                    <select
                      value={idProofType}
                      onChange={e => setIdProofType(e.target.value as 'aadhaar' | 'pan')}
                      className="input-field text-sm"
                    >
                      <option value="aadhaar">Aadhaar Card (Front/Back)</option>
                      <option value="pan">PAN Card</option>
                    </select>
                  </div>

                  {/* ID Number */}
                  <div>
                    <label className="label-field text-xs">
                      {idProofType === 'aadhaar' ? 'Aadhaar Card Number (12 Digits)' : 'PAN Card Number (10 Characters)'}
                    </label>
                    <input
                      type="text"
                      value={idProofNumber}
                      onChange={e => setIdProofNumber(e.target.value)}
                      placeholder={idProofType === 'aadhaar' ? 'e.g. 5432 1098 7654' : 'e.g. ABCDE1234F'}
                      className="input-field text-sm uppercase"
                    />
                  </div>
                </div>

                {/* Upload Zone */}
                <div>
                  <label className="label-field text-xs block mb-1.5">
                    Upload {idProofType === 'aadhaar' ? 'Aadhaar Card' : 'PAN Card'} Photo / Document
                  </label>

                  {idProofDocument ? (
                    <div className="flex items-center justify-between p-3.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {idProofDocument.startsWith('data:image') ? (
                            <img src={idProofDocument} alt="ID Document Preview" className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={22} className="text-emerald-700 dark:text-emerald-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            {idProofFileName || `${idProofType.toUpperCase()} Document Attached`}
                          </p>
                          <p className="text-2xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {idProofFileSize ? `Size: ${idProofFileSize} • ` : ''}Ready for verification review
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveIdProof}
                        className="px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-input hover:border-primary/60 bg-muted/10 hover:bg-muted/20 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center mb-2 transition-colors">
                        <Upload size={18} />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        Click to upload or drag and drop your {idProofType === 'aadhaar' ? 'Aadhaar' : 'PAN'} Card photo
                      </p>
                      <p className="text-2xs text-muted-foreground mt-1">
                        Supports JPG, PNG, WEBP, or PDF (Max 10MB)
                      </p>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleIdProofUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Practice & Specialisation Details */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={15} />
                4. Practice & Specialisations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Primary Specialisation */}
                <div>
                  <label className="label-field text-xs">Primary Specialisation *</label>
                  <select
                    value={specialisation}
                    onChange={e => setSpecialisation(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="Vedic Jyotish">Vedic Jyotish (Parashari)</option>
                    <option value="KP System">KP System (Krishnamurti Paddhati)</option>
                    <option value="Nadi Astrology">Nadi Astrology</option>
                    <option value="Numerology">Numerology & Name Correction</option>
                    <option value="Vastu Shastra">Vastu Shastra</option>
                    <option value="Prashna Kundali">Prashna & Horary</option>
                    <option value="Lal Kitab">Lal Kitab Remedies</option>
                    <option value="Tarot Reading">Tarot & Intuitive Guidance</option>
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="label-field text-xs">Consultation Experience *</label>
                  <input
                    type="text"
                    required
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    placeholder="e.g. 12+ years"
                    className="input-field text-sm"
                  />
                </div>

                {/* City & State */}
                <div>
                  <label className="label-field text-xs">Location / City *</label>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground">
                      <MapPin size={13} className="text-primary" />
                    </div>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Varanasi, Uttar Pradesh"
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>

                {/* Languages Spoken */}
                <div>
                  <label className="label-field text-xs">Languages Spoken *</label>
                  <input
                    type="text"
                    required
                    value={languages}
                    onChange={e => setLanguages(e.target.value)}
                    placeholder="e.g. Hindi, English, Sanskrit"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Professional Bio */}
              <div>
                <label className="label-field text-xs">Professional Bio & Astrological Lineage</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Briefly describe your astrological practice, client consultation style, or special areas of expertise..."
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Save Profile & Proceed to Theory Assessment</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Vedic Theory Assessment with Dynamic Questions & AI Score Config */}
        {!isDisqualified && currentStep === 2 && (
          <div className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            {/* Header */}
            <div className="border-b border-border pb-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  Vedic Astrology Theory Assessment
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Evaluate classical astrological logic, divisional charts, dasha analysis, and ethical consultation standards.
                </p>
              </div>

              {theorySubmitted && (
                <div className={`px-3.5 py-1.5 rounded-full border font-bold text-sm flex items-center gap-1.5 ${
                  theoryScore >= passingThreshold 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-300'
                }`}>
                  <Award size={16} />
                  Score: {theoryScore}/100 • {theoryScore >= passingThreshold ? 'Passed' : 'Needs Review'}
                </div>
              )}
            </div>

            {/* DYNAMIC QUESTION CONTROLS TOOLBAR */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* 1. Dynamic Mode Toggle Button (ON / OFF) */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sliders size={14} className="text-primary" />
                    Question Source:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleQuestionMode(!isCuratedMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
                      isCuratedMode 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-2xs' 
                        : 'bg-primary/10 border-primary/30 text-primary shadow-2xs'
                    }`}
                  >
                    {isCuratedMode ? (
                      <>
                        <ToggleRight size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Curated Pool Mode [ON]</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={18} className="text-primary" />
                        <Sparkles size={13} className="text-primary animate-pulse" />
                        <span>AI Random Mode [OFF - Dynamic AI]</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Number of Questions Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">Questions:</span>
                  {[3, 5, 8, 10].map(cnt => (
                    <button
                      type="button"
                      key={cnt}
                      disabled={isLoadingQuestions}
                      onClick={() => handleChangeQuestionCount(cnt)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        questionCount === cnt
                          ? 'bg-primary text-primary-foreground shadow-2xs'
                          : 'bg-background hover:bg-muted border border-border text-muted-foreground'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Action row & AI Generation Status */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                  <span>
                    {isCuratedMode 
                      ? `Showing ${questionsList.length} verified standard questions from curated Jyotish bank.`
                      : `AI is dynamically generating ${questionsList.length} specialized questions for ${specialisation}.`}
                  </span>
                </div>

                {!isCuratedMode && (
                  <button
                    type="button"
                    disabled={isLoadingQuestions}
                    onClick={handleRegenerateAiQuestions}
                    className="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-bold"
                  >
                    {isLoadingQuestions ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Generating via GPT-4o...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={12} />
                        <span>Regenerate AI Questions</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* DYNAMIC AI QUALIFICATION SCORE & PASSING THRESHOLD BAR */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-primary" />
                  <span className="text-xs font-bold text-foreground">Dynamic AI Qualification Passing Threshold:</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {passingThreshold}% Minimum Required
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowScoreSettings(!showScoreSettings)}
                  className="text-2xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1"
                >
                  <span>{showScoreSettings ? 'Hide Scoring Weights' : 'Adjust Scoring Weights'}</span>
                  <ChevronDown size={12} className={`transition-transform ${showScoreSettings ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Slider for passing threshold */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-2xs text-muted-foreground font-semibold">
                  <span>Relaxed (50%)</span>
                  <span>Standard (75%)</span>
                  <span>Strict (90%)</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={passingThreshold}
                  onChange={e => setPassingThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Expandable Weights Config */}
              {showScoreSettings && (
                <div className="p-3 bg-muted/30 rounded-lg border border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-3 animate-fade-in">
                  <div>
                    <label className="label-field text-2xs">Theory Weight (%)</label>
                    <input
                      type="number"
                      min="10"
                      max="80"
                      value={theoryWeight}
                      onChange={e => setTheoryWeight(Number(e.target.value))}
                      className="input-field text-xs py-1"
                    />
                  </div>
                  <div>
                    <label className="label-field text-2xs">Kundali Case Weight (%)</label>
                    <input
                      type="number"
                      min="10"
                      max="80"
                      value={chartWeight}
                      onChange={e => setChartWeight(Number(e.target.value))}
                      className="input-field text-xs py-1"
                    />
                  </div>
                  <div>
                    <label className="label-field text-2xs">AI Interview Weight (%)</label>
                    <input
                      type="number"
                      min="10"
                      max="80"
                      value={interviewWeight}
                      onChange={e => setInterviewWeight(Number(e.target.value))}
                      className="input-field text-xs py-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* QUESTIONS LISTING */}
            {isLoadingQuestions ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw size={28} className="text-primary animate-spin" />
                <p className="text-sm font-bold text-foreground">Generating specialized questions...</p>
                <p className="text-xs text-muted-foreground">GPT-4o is tailoring questions to {specialisation}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questionsList.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-card border border-border space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">
                        <span className="text-primary mr-2">Q{idx + 1}.</span>
                        {q.question}
                      </p>
                      {q.topic && (
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                          {q.topic}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = theoryAnswers[q.id] === optIdx;
                        const isCorrect = optIdx === q.correctIndex;
                        return (
                          <button
                            type="button"
                            key={optIdx}
                            disabled={theorySubmitted}
                            onClick={() => handleAnswerSelect(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-lg text-xs font-medium border transition-all flex items-start justify-between cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-2xs'
                                : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                            } ${
                              theorySubmitted && isCorrect
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                                : ''
                            }`}
                          >
                            <span>{opt}</span>
                            {theorySubmitted && isCorrect && (
                              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {theorySubmitted && (
                      <p className="text-2xs text-muted-foreground bg-muted/40 p-2.5 rounded-md border border-border/50">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Back to Profile
              </button>

              {!theorySubmitted ? (
                <button
                  type="button"
                  onClick={handleGradeTheory}
                  disabled={Object.keys(theoryAnswers).length < questionsList.length || isLoadingQuestions}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Award size={15} />
                  Grade My Assessment ({Object.keys(theoryAnswers).length}/{questionsList.length} Answered)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedFromTheory}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Proceed to Blind Kundali Case</span>
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Kundali Blind Case Study */}
        {!isDisqualified && currentStep === 3 && (
          <div className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Compass size={20} className="text-primary" />
                Blind Kundali Case Study
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Analyze the planetary chart scenario below and provide your diagnosis and remedial recommendations in your own words.
              </p>
            </div>

            {/* Case Chart Scenario Card */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Case Profile #K-402</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">D1 Lagna + D9 Navamsha</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">Ascendant (Lagna)</p>
                  <p className="font-bold text-foreground">Scorpio (Vrishchika)</p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">Moon Sign (Rashi)</p>
                  <p className="font-bold text-foreground">Capricorn (Makara)</p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">Current Mahadasha</p>
                  <p className="font-bold text-foreground">Saturn - Rahu</p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">Key Placements</p>
                  <p className="font-bold text-foreground">Mars in 10th (Leo), Sun in 11th</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Client Query:</strong> "I have experienced sudden career delays and mental restlessness over the past 8 months despite hard work. Will my business venture launch successfully, and what spiritual remedies do you recommend?"
              </p>
            </div>

            {/* Analysis Text Area */}
            <div className="space-y-4">
              <div>
                <label className="label-field text-xs">Your Astrological Reading & Career Timing Diagnosis *</label>
                <textarea
                  rows={4}
                  value={chartAnalysis}
                  onChange={e => setChartAnalysis(e.target.value)}
                  placeholder="Explain the impact of Saturn Mahadasha with Rahu Antardasha, Mars in Leo in 10th House (Digbala), and how timing will unfold..."
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="label-field text-xs">Recommended Ethical Remedies (Mantra / Charity / Gemstone)</label>
                <textarea
                  rows={3}
                  value={chartRemedy}
                  onChange={e => setChartRemedy(e.target.value)}
                  placeholder="Specify Vedic mantras (e.g. Shani Gayatri / Hanuman Chalisa), dana/charity, or gemstone recommendations..."
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Back to Theory
              </button>

              <button
                type="button"
                onClick={handleProceedFromChart}
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Submit Case & Start AI Interview</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Interactive AI Voice / Chat Screening Interview */}
        {!isDisqualified && currentStep === 4 && (
          <div className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            <div className="border-b border-border pb-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Brain size={20} className="text-primary" />
                  AstroParihar AI Technical Interview
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Powered by OpenAI GPT-4o. Answer the examiner questions regarding consultation ethics, challenging client scenarios, and astrological judgment.
                </p>
              </div>

              <div className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Question {Math.min(aiQuestionIndex + 1, 3)} of 3
              </div>
            </div>

            {/* Chat Conversation Thread */}
            <div className="space-y-4 max-h-96 overflow-y-auto p-4 rounded-xl bg-muted/20 border border-border">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    msg.role === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-emerald-600 text-white'
                  }`}>
                    {msg.role === 'ai' ? 'AI' : name.slice(0, 1) || 'U'}
                  </div>

                  <div className={`p-4 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-card border border-border text-foreground shadow-2xs'
                  }`}>
                    {msg.topic && (
                      <p className="text-2xs font-bold uppercase tracking-wider text-primary mb-1">
                        {msg.topic}
                      </p>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 italic">
                  <RefreshCw size={13} className="animate-spin text-primary" />
                  <span>AI Examiner is evaluating your answer and preparing next question...</span>
                </div>
              )}
            </div>

            {/* Answer Input */}
            {!aiInterviewComplete ? (
              <div className="space-y-3">
                <label className="label-field text-xs">Your Answer / Response:</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={userInterviewAnswer}
                    onChange={e => setUserInterviewAnswer(e.target.value)}
                    placeholder="Type your response with your astrological rationale and counseling philosophy..."
                    className="input-field text-sm pr-12"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSendInterviewAnswer();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendInterviewAnswer}
                    disabled={!userInterviewAnswer.trim() || isAiLoading}
                    className="absolute right-3 bottom-3 p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                    title="Send Answer (or Ctrl+Enter)"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <p className="text-2xs text-muted-foreground flex items-center justify-between">
                  <span>Press Send or <kbd className="px-1 py-0.5 rounded bg-muted border border-border">Ctrl + Enter</kbd> to submit answer</span>
                  <span>{userInterviewAnswer.length} characters</span>
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    AI Interview Assessment Completed
                  </h3>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Score: {aiInterviewEvaluation?.totalScore || 88} / 100
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {aiInterviewEvaluation?.summary || 'Candidate demonstrated sound Vedic understanding and empathetic consultation ethics.'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                Back to Chart Case
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmittingFinal}
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isSubmittingFinal ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Complete Application for Human Review</span>
                    <ChevronRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: In Process / Under Review Confirmation Screen */}
        {!isDisqualified && currentStep === 5 && (
          <div className="card-elevated p-8 md:p-12 text-center space-y-6 animate-slide-up border-2 border-primary/30">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <Clock size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Application Status: In Process / Under Human Review
              </span>
              <h2 className="text-2xl font-bold text-foreground mt-3">
                Thank You, {name} Ji! 🙏
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Your profile, Vedic theory assessment, blind Kundali case analysis, and AI interview have been securely submitted to the <strong>AstroParihar Astrological Verification Committee</strong>.
              </p>
            </div>

            {/* Scorecard Summary with Dynamic Threshold Calculation */}
            {(() => {
              const totalW = (Number(theoryWeight) || 35) + (Number(chartWeight) || 25) + (Number(interviewWeight) || 40);
              const compositeScore = Math.round(
                (theoryScore * ((Number(theoryWeight) || 35) / totalW)) +
                (chartScore * ((Number(chartWeight) || 25) / totalW)) +
                ((aiInterviewEvaluation?.totalScore || 88) * ((Number(interviewWeight) || 40) / totalW))
              );
              const meetsThreshold = compositeScore >= passingThreshold;

              return (
                <div className="max-w-xl mx-auto space-y-3 text-left">
                  <div className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-2 ${
                    meetsThreshold 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <div>
                      <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">Overall Composite AI Score</p>
                      <p className="text-2xl font-extrabold text-foreground mt-0.5">{compositeScore} / 100</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1 ${
                        meetsThreshold 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-300'
                      }`}>
                        {meetsThreshold ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {meetsThreshold ? `AI Qualified (≥ ${passingThreshold}%)` : `Review Required (< ${passingThreshold}%)`}
                      </span>
                      <p className="text-2xs text-muted-foreground mt-1">
                        Mode: {isCuratedMode ? 'Curated Bank' : 'AI Dynamic Random'} ({questionsList.length} Qs)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-card border border-border">
                      <p className="text-2xs text-muted-foreground font-semibold uppercase">Theory ({theoryWeight}%)</p>
                      <p className="text-lg font-bold text-foreground mt-1">{theoryScore} / 100</p>
                      <p className="text-2xs text-emerald-600 font-semibold mt-0.5">{questionsList.length} Questions</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border">
                      <p className="text-2xs text-muted-foreground font-semibold uppercase">Kundali Case ({chartWeight}%)</p>
                      <p className="text-lg font-bold text-foreground mt-1">{chartScore} / 100</p>
                      <p className="text-2xs text-emerald-600 font-semibold mt-0.5">Submitted</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border">
                      <p className="text-2xs text-muted-foreground font-semibold uppercase">AI Interview ({interviewWeight}%)</p>
                      <p className="text-lg font-bold text-foreground mt-1">{aiInterviewEvaluation?.totalScore || 88} / 100</p>
                      <p className="text-2xs text-emerald-600 font-semibold mt-0.5">GPT-4o Evaluated</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* What Happens Next Section */}
            <div className="p-5 rounded-xl bg-muted/30 border border-border max-w-xl mx-auto text-left space-y-2 text-xs text-muted-foreground">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-primary" />
                What happens next?
              </h4>
              <p>
                1. Our manual verification panel will review your chart interpretations and verify your credentials.
              </p>
              <p>
                2. You will receive an official approval email at <strong className="text-foreground">{email}</strong> once your verified profile is activated.
              </p>
              <p>
                3. You will then be able to log in to the <strong>Astrologer Dashboard</strong> using your registered credentials.
              </p>
            </div>

            <div className="pt-2">
              <p className="text-2xs text-muted-foreground">
                Application Reference ID: <strong className="font-mono text-foreground">{applicationRefId}</strong>
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="btn-secondary text-xs py-2 px-5 inline-flex items-center gap-1.5"
                >
                  Return to AstroParihar Homepage
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">Loading Onboarding Portal...</div>}>
      <CandidateApplyPortal />
    </Suspense>
  );
}
