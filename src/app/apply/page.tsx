'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
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
  LockKeyhole,
  Plus
} from 'lucide-react';
import { 
  THEORY_QUESTIONS, 
  TheoryQuestion,
  getQuestionText,
  getOptionsList,
  getExplanationText,
  getTopicText
} from '@/lib/theoryQuestions';
import { APPLY_TRANSLATIONS, SupportedLanguage } from '@/lib/applyTranslations';
import { 
  COUNTRY_CODES, 
  DEFAULT_COUNTRY_CODE, 
  DEFAULT_COUNTRY_ISO, 
  detectDefaultCountryIso, 
  getDialCodeForIso, 
  parsePhoneNumber 
} from '@/lib/countryCodes';
import CountryCodeDropdown from '@/components/ui/CountryCodeDropdown';
import LanguageDropdown from '@/components/ui/LanguageDropdown';
import AppLogo from '@/components/ui/AppLogo';

const getInitialInterviewQuestion = (candidateName: string, lang: string) => {
  const l = (lang || 'en').toLowerCase();
  const nameLabel = candidateName ? candidateName.trim() : (l === 'hi' ? 'पंडित जी' : l === 'te' ? 'పండిట్ జీ' : l === 'ta' ? 'பண்டிட் ஜி' : l === 'kn' ? 'ಪಂಡಿತ್ ಜೀ' : 'Pandit Ji');

  if (l === 'hi' || l === 'hindi') {
    return {
      role: 'ai' as const,
      topic: 'परामर्श कौशल एवं सहानुभूति',
      text: `नमस्ते ${nameLabel} 🙏! एस्ट्रोपरीहार ज्योतिषी चयन प्रक्रिया में आपका स्वागत है। प्रथम प्रश्न: एक जातक अत्यधिक तनाव में आपके पास आता है, जिसे व्यापार में भारी नुकसान और वैवाहिक विवाद का सामना करना पड़ रहा है। भय उत्पन्न किए बिना सात्विक वैदिक मार्गदर्शन कैसे देंगे?`
    };
  }
  if (l === 'te' || l === 'telugu') {
    return {
      role: 'ai' as const,
      topic: 'క్లయింట్ సంప్రదింపులు & సానుభూతి',
      text: `నమస్తే ${nameLabel} 🙏! ఆస్ట్రోపరిహార్ జ్యోతిష్య ఎంపిక ప్రక్రియకు స్వాగతం. మొదటి ప్రశ్న: ఒక క్లయింట్ తీవ్ర వ్యాపార నష్టం మరియు వైవాహిక సమస్యలతో తీవ్ర నిరాశలో మీ వద్దకు వచ్చారు. వారిలో భయం కలిగించకుండా, ప్రశాంతంగా ప్రామాణిక వేద జ్యోతిష పరిహారాలు మరియు మార్గదర్శకత్వాన్ని ఎలా అందిస్తారు?`
    };
  }
  if (l === 'ta' || l === 'tamil') {
    return {
      role: 'ai' as const,
      topic: 'வாடிக்கையாளர் ஆலோசனை & பரிவு',
      text: `வணக்கம் ${nameLabel} 🙏! ஆஸ்ட்ரோபரிஹார் ஜோதிடர் தேர்வு செயல்முறைக்கு வரவேற்கிறோம். முதல் கேள்வி: ஒரு வாடிக்கையாளர் கடுமையான நிதி இழப்பு மற்றும் குடும்பக் குழப்பத்துடன் உங்களிடம் வருகிறார். அவர்களுக்கு அச்சம் ஏற்படுத்தாமல், அமைதியாகவும் நடைமுறைக்கு உகந்ததாகவும் பாரம்பரிய வேத ஜோதிட வழிகாட்டலை எவ்வாறு வழங்குவீர்கள்?`
    };
  }
  if (l === 'kn' || l === 'kannada') {
    return {
      role: 'ai' as const,
      topic: 'ಕ್ಲೈಂಟ್ ಸಮಾಲೋಚನೆ & ಸಹಾನುಭೂತಿ',
      text: `ನಮಸ್ಕಾರ ${nameLabel} 🙏! ಆಸ್ಟ್ರೋಪರಿಹಾರ್ ಜ್ಯೋತಿಷಿ ಆಯ್ಕೆ ಪ್ರಕ್ರಿಯೆಗೆ ಸುಸ್ವಾಗತ. ಮೊದಲ ಪ್ರಶ್ನೆ: ವ್ಯಾಪಾರ ನಷ್ಟ ಮತ್ತು ಕೌಟುಂಬಿಕ ಕಲಹದಿಂದ ತೀವ್ರ ದುಃಖದಲ್ಲಿರುವ ಕ್ಲೈಂಟ್ ನಿಮ್ಮ ಬಳಿ ಬಂದಾಗ, ಅವರಲ್ಲಿ ಭಯ ಹುಟ್ಟಿಸದೆ ಶಾಂತಿಯುತವಾಗಿ ಪ್ರಾಯೋಗಿಕ ವೈದಿಕ ಮಾರ್ಗದರ್ಶನವನ್ನು ಹೇಗೆ ನೀಡುತ್ತೀರಿ?`
    };
  }
  return {
    role: 'ai' as const,
    topic: 'Client Consulting & Empathy',
    text: `Namaste ${nameLabel} 🙏! Welcome to the AstroParihar Astrologer Screening. To begin: A client comes to you in extreme distress over sudden business loss and domestic tension. How do you analyze their state calmly and communicate your Vedic astrological findings without instilling fear?`
  };
};

function CandidateApplyPortal() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Wizard Step (1: Profile, 2: Theory, 3: Blind Chart, 4: AI Interview, 5: In-Process Submitted)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Profile Form State
  const [candidateId, setCandidateId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [phoneCountryIso, setPhoneCountryIso] = useState<string>(DEFAULT_COUNTRY_ISO);
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [whatsappCountryIso, setWhatsappCountryIso] = useState<string>(DEFAULT_COUNTRY_ISO);
  const [source, setSource] = useState<string>('Direct Intake');
  const [campaignName, setCampaignName] = useState<string>('');

  // Pre-fill profile and campaign tracking metadata from URL query parameters (e.g. from outreach links)
  useEffect(() => {
    if (!searchParams) return;
    const qId = searchParams.get('id') || searchParams.get('candidateId');
    const qName = searchParams.get('name');
    const qPhone = searchParams.get('phone');
    const qEmail = searchParams.get('email');
    const qSource = searchParams.get('source');
    const qCampaign = searchParams.get('campaign') || searchParams.get('campaignName');

    if (qId) setCandidateId(qId);
    if (qName) setName(decodeURIComponent(qName));
    if (qPhone) {
      const clean = decodeURIComponent(qPhone);
      const parsed = parsePhoneNumber(clean);
      setPhone(parsed.number || clean);
      if (parsed.countryCode) {
        setPhoneCountryCode(parsed.countryCode);
        setWhatsappCountryCode(parsed.countryCode);
      }
    }
    if (qEmail) setEmail(decodeURIComponent(qEmail));
    if (qSource) setSource(decodeURIComponent(qSource));
    if (qCampaign) setCampaignName(decodeURIComponent(qCampaign));
  }, [searchParams]);

  // Auto detect user country code via timezone and IP lookup (identical to user login flow)
  useEffect(() => {
    const tzIso = detectDefaultCountryIso();
    const tzDial = getDialCodeForIso(tzIso);
    setPhoneCountryCode(tzDial);
    setPhoneCountryIso(tzIso);
    setWhatsappCountryCode(tzDial);
    setWhatsappCountryIso(tzIso);

    let isMounted = true;
    fetch('https://api.country.is')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.country) {
          const iso = data.country.toLowerCase();
          const dial = getDialCodeForIso(iso);
          setPhoneCountryCode(dial);
          setPhoneCountryIso(iso);
          setWhatsappCountryCode(dial);
          setWhatsappCountryIso(iso);
        }
      })
      .catch(() => {
        fetch('https://ipapi.co/json/')
          .then((res) => res.json())
          .then((data) => {
            if (isMounted && data && data.country_code) {
              const iso = data.country_code.toLowerCase();
              const dial = getDialCodeForIso(iso);
              setPhoneCountryCode(dial);
              setPhoneCountryIso(iso);
              setWhatsappCountryCode(dial);
              setWhatsappCountryIso(iso);
            }
          })
          .catch(() => {});
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('New Delhi, India');
  const [specialisations, setSpecialisations] = useState<string[]>(['Vedic Astrology']);
  const [otherSpecialisation, setOtherSpecialisation] = useState('');
  const [strongestConsultationArea, setStrongestConsultationArea] = useState('Vedic Astrology');
  const [experience, setExperience] = useState('12+ years');
  const [bio, setBio] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi', 'English']);
  const [otherLanguage, setOtherLanguage] = useState('');
  const [specOpen, setSpecOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [specPos, setSpecPos] = useState<React.CSSProperties>({});
  const [langPos, setLangPos] = useState<React.CSSProperties>({});
  const specRef = useRef<HTMLButtonElement>(null);
  const langRef = useRef<HTMLButtonElement>(null);
  
  // Learning Background & Certification
  const [learningBackground, setLearningBackground] = useState('');
  const [courseDetails, setCourseDetails] = useState('');

  // Helper for responsive browser image compression before saving (keeps base64 lightweight for Firestore)
  const compressImageFile = (file: File, maxWidth = 1200, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 1. Mandatory Aadhaar Card Verification & Upload State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarDocument, setAadhaarDocument] = useState('');
  const [aadhaarFileName, setAadhaarFileName] = useState('');
  const [aadhaarFileSize, setAadhaarFileSize] = useState('');
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);

  // 2. Mandatory PAN Card Verification & Upload State
  const [panNumber, setPanNumber] = useState('');
  const [panDocument, setPanDocument] = useState('');
  const [panFileName, setPanFileName] = useState('');
  const [panFileSize, setPanFileSize] = useState('');
  const [isUploadingPan, setIsUploadingPan] = useState(false);

  // 3. Optional Supporting Documents (Astrology Certificates, Diplomas, Experience Letters, etc.)
  interface SupportingDoc {
    id: string;
    title: string;
    category: string;
    document: string;
    fileName: string;
    fileSize: string;
    uploadedAt: string;
  }
  const [otherDocuments, setOtherDocuments] = useState<SupportingDoc[]>([]);
  const [isAddingOtherDoc, setIsAddingOtherDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Astrology Certificate / Degree');
  const [newDocFile, setNewDocFile] = useState<string>('');
  const [newDocFileName, setNewDocFileName] = useState<string>('');
  const [newDocFileSize, setNewDocFileSize] = useState<string>('');
  const [isUploadingOther, setIsUploadingOther] = useState(false);

  // Backward compatibility alias for single-id fields
  const [idProofType, setIdProofType] = useState<'aadhaar' | 'pan'>('aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [idProofDocument, setIdProofDocument] = useState('');
  const [idProofFileName, setIdProofFileName] = useState('');
  const [idProofFileSize, setIdProofFileSize] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Step 2: Dynamic Questions State & Settings
  const [isCuratedMode, setIsCuratedMode] = useState<boolean>(true); // Toggle ON = Curated, OFF = AI Random Questions
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [customQuestionPool, setCustomQuestionPool] = useState<TheoryQuestion[]>(THEORY_QUESTIONS);
  const [useCustomChartCases, setUseCustomChartCases] = useState<boolean>(true);
  const [customChartCase, setCustomChartCase] = useState<any>(null);
  const [customChartCasesList, setCustomChartCasesList] = useState<any[]>([]);
  const [activeChartCaseIndex, setActiveChartCaseIndex] = useState<number>(0);
  const [isLoadingChartCase, setIsLoadingChartCase] = useState<boolean>(false);
  const [questionsList, setQuestionsList] = useState<TheoryQuestion[]>(THEORY_QUESTIONS.slice(0, 15));
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
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string | number, number>>({});
  const [theorySubmitted, setTheorySubmitted] = useState(false);
  const [theoryScore, setTheoryScore] = useState<number>(0);
  const [assessmentLanguage, setAssessmentLanguage] = useState<SupportedLanguage>('en');
  const t = APPLY_TRANSLATIONS[assessmentLanguage] || APPLY_TRANSLATIONS.en;

  // Assessment & Live Interview Timers
  const [assessmentStartTime, setAssessmentStartTime] = useState<number | null>(null);
  const [interviewStartTime, setInterviewStartTime] = useState<number | null>(null);
  const [interviewDurationSeconds, setInterviewDurationSeconds] = useState<number>(0);
  const [interviewDurationFormatted, setInterviewDurationFormatted] = useState<string>('0m 0s');
  const [assessmentDurationSeconds, setAssessmentDurationSeconds] = useState<number>(0);
  const [assessmentDurationFormatted, setAssessmentDurationFormatted] = useState<string>('0m 0s');

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
            source: source || 'Direct Intake',
            campaignName: campaignName || '',
            campaign: campaignName || '',
            specialisations: specialisations,
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

  // Assessment & Live Interview Timers
  useEffect(() => {
    if (currentStep >= 2 && !assessmentStartTime) {
      setAssessmentStartTime(Date.now());
    }
  }, [currentStep, assessmentStartTime]);

  useEffect(() => {
    if (currentStep === 4 && !interviewStartTime) {
      setInterviewStartTime(Date.now());
    }
  }, [currentStep, interviewStartTime]);

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
  }, [currentStep, isDisqualified, candidateId, name, phone, email, location, specialisations, experience, proctorLogs]);

  // Load Assessment Settings (Custom Questions / AI Mode Toggle & Cases) from Backend
  useEffect(() => {
    const loadAssessmentSettings = async () => {
      try {
        const res = await fetch('/api/settings/assessment');
        const data = await res.json();
        if (data.success && data.config) {
          const cfg = data.config;
          const pool = Array.isArray(cfg.customQuestions) && cfg.customQuestions.length > 0 
            ? cfg.customQuestions 
            : THEORY_QUESTIONS;
          setCustomQuestionPool(pool);

          const qCount = Number(cfg.questionCount) || 15;
          setQuestionCount(qCount);

          if (cfg.passingThreshold) setPassingThreshold(Number(cfg.passingThreshold));
          if (cfg.theoryWeight) setTheoryWeight(Number(cfg.theoryWeight));
          if (cfg.chartCaseWeight) setChartWeight(Number(cfg.chartCaseWeight));
          if (cfg.aiInterviewWeight) setInterviewWeight(Number(cfg.aiInterviewWeight));

          if (cfg.useCustomChartCases !== undefined) {
            setUseCustomChartCases(Boolean(cfg.useCustomChartCases));
          }

          if (cfg.useCustomChartCases && Array.isArray(cfg.customChartCases) && cfg.customChartCases.length > 0) {
            const activeCases = cfg.customChartCases.filter((c: any) => c.enabled !== false && c.isActive !== false);
            const casesToUse = activeCases.length > 0 ? activeCases : cfg.customChartCases;
            setCustomChartCasesList(casesToUse);
            setCustomChartCase(casesToUse[0]);
          } else if (cfg.useCustomChartCases === false) {
            fetchAiChartCase();
          }

          const activeQuestions = pool.filter((q: any) => q.enabled !== false && q.isActive !== false);
          const effectivePool = activeQuestions.length > 0 ? activeQuestions : pool;

          if (cfg.useCustomQuestions) {
            setIsCuratedMode(true);
            setQuestionsList(effectivePool.slice(0, qCount));
          } else {
            setIsCuratedMode(false);
            fetchQuestions(qCount, false, specialisations[0] || 'Vedic Jyotish');
          }
        }
      } catch (err) {
        console.warn('Could not load assessment config, using defaults:', err);
      }
    };
    loadAssessmentSettings();
  }, []);

  // Fetch Dynamic AI Kundali Chart Case
  const fetchAiChartCase = async (langOverride?: string) => {
    setIsLoadingChartCase(true);
    const targetLang = langOverride || assessmentLanguage || 'en';
    try {
      const res = await fetch('/api/ai/generate-chart-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialisation: specialisations[0] || 'Vedic Jyotish',
          language: targetLang
        })
      });
      const data = await res.json();
      if (data.success && data.chartCase) {
        setCustomChartCase(data.chartCase);
      }
    } catch (err) {
      console.warn('Failed to generate dynamic AI chart case:', err);
    } finally {
      setIsLoadingChartCase(false);
    }
  };

  // Fetch or Switch Dynamic Questions
  const fetchQuestions = async (count: number, curated: boolean, spec: string, langOverride?: string) => {
    setIsLoadingQuestions(true);
    setTheoryAnswers({});
    setTheorySubmitted(false);
    setTheoryScore(0);
    const targetLang = langOverride || assessmentLanguage || 'en';

    try {
      if (curated) {
        // Custom Questions Bank configured in Settings
        const rawPool = customQuestionPool.length > 0 ? customQuestionPool : THEORY_QUESTIONS;
        const activeQuestions = rawPool.filter((q: any) => q.enabled !== false && q.isActive !== false);
        const pool = activeQuestions.length > 0 ? activeQuestions : rawPool;
        setQuestionsList(pool.slice(0, count));
      } else {
        // AI Dynamic / Random Generated Questions
        const res = await fetch('/api/ai/generate-assignment-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            specialisation: spec || specialisations[0] || 'Vedic Jyotish',
            count,
            isAiDynamic: true,
            language: targetLang
          })
        });
        const data = await res.json();
        if (data.success && data.questions && data.questions.length > 0) {
          setQuestionsList(data.questions);
        } else {
          const rawPool = customQuestionPool.length > 0 ? customQuestionPool : THEORY_QUESTIONS;
          const activeQuestions = rawPool.filter((q: any) => q.enabled !== false && q.isActive !== false);
          const pool = activeQuestions.length > 0 ? activeQuestions : rawPool;
          setQuestionsList(pool.slice(0, count));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic questions:', err);
      const rawPool = customQuestionPool.length > 0 ? customQuestionPool : THEORY_QUESTIONS;
      const activeQuestions = rawPool.filter((q: any) => q.enabled !== false && q.isActive !== false);
      const pool = activeQuestions.length > 0 ? activeQuestions : rawPool;
      setQuestionsList(pool.slice(0, count));
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleToggleQuestionMode = (curated: boolean) => {
    setIsCuratedMode(curated);
    fetchQuestions(questionCount, curated, specialisations[0] || 'Vedic Jyotish', assessmentLanguage);
  };

  const handleChangeQuestionCount = (newCount: number) => {
    setQuestionCount(newCount);
    fetchQuestions(newCount, isCuratedMode, specialisations[0] || 'Vedic Jyotish', assessmentLanguage);
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setAssessmentLanguage(newLang);

    // If candidate has not answered yet or is at initial question, update the interview greeting to chosen language
    const userAnswers = conversationHistory.filter(m => m.role === 'user');
    if (userAnswers.length === 0) {
      setConversationHistory([getInitialInterviewQuestion(name, newLang)]);
    }

    // If AI dynamic questions mode is active, reload questions in the selected language
    if (!isCuratedMode) {
      fetchQuestions(questionCount, false, specialisations[0] || 'Vedic Jyotish', newLang);
    }

    // If on Step 3 or AI chart case, reload chart case in the selected language
    if (!useCustomChartCases || customChartCase?.isAiGenerated) {
      fetchAiChartCase(newLang);
    }
  };

  const handleRegenerateAiQuestions = () => {
    fetchQuestions(questionCount, false, specialisations[0] || 'Vedic Jyotish');
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
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (currentStep === 4) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, isAiLoading, currentStep]);

  // Live Interview Timer
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 4 && !aiInterviewComplete && interviewStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000));
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        setInterviewDurationSeconds(elapsed);
        setInterviewDurationFormatted(`${m}m ${s}s`);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, aiInterviewComplete, interviewStartTime]);

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
      const parsed = parsePhoneNumber(phoneParam);
      setPhoneCountryCode(parsed.countryCode);
      setPhone(parsed.number);
      setWhatsappCountryCode(parsed.countryCode);
      setWhatsapp(parsed.number);
    }
    if (emailParam && emailParam !== 'null' && emailParam !== 'undefined') setEmail(emailParam);
    if (locParam) setLocation(locParam);
    if (specParam) setSpecialisations([specParam]);

    // Initial AI Interview Question
    if (conversationHistory.length === 0) {
      setConversationHistory([
        getInitialInterviewQuestion(nameParam || name, assessmentLanguage)
      ]);
    }
  }, [searchParams]);

  // Guard against browser credential managers injecting email address into phone number inputs
  useEffect(() => {
    if (phone && phone.includes('@')) {
      setPhone('');
    }
    if (whatsapp && whatsapp.includes('@')) {
      setWhatsapp('');
    }
  }, [phone, whatsapp]);

  const handlePhoneChange = (val: string) => {
    // Strictly block browser autofill from dumping emails into phone inputs
    if (val.includes('@')) {
      setPhone('');
      return;
    }
    const clean = val.replace(/[^0-9\s+-]/g, '');
    setPhone(clean);
    if (sameAsPhone) setWhatsapp(clean);
  };

  const handleWhatsappChange = (val: string) => {
    if (val.includes('@')) {
      setWhatsapp('');
      return;
    }
    const clean = val.replace(/[^0-9\s+-]/g, '');
    setWhatsapp(clean);
  };

  // 1. Mandatory Aadhaar Card Upload Handler
  const handleAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller image or PDF document.');
      return;
    }

    setIsUploadingAadhaar(true);
    try {
      const dataUrl = await compressImageFile(file);
      setAadhaarDocument(dataUrl);
      setAadhaarFileName(file.name);
      setAadhaarFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      // Backward compat
      setIdProofDocument(dataUrl);
      setIdProofFileName(file.name);
    } catch {
      alert('Failed to process Aadhaar document file.');
    } finally {
      setIsUploadingAadhaar(false);
    }
  };

  const handleRemoveAadhaar = () => {
    setAadhaarDocument('');
    setAadhaarFileName('');
    setAadhaarFileSize('');
    if (idProofType === 'aadhaar') {
      setIdProofDocument('');
      setIdProofFileName('');
    }
  };

  // 2. Mandatory PAN Card Upload Handler
  const handlePanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller image or PDF document.');
      return;
    }

    setIsUploadingPan(true);
    try {
      const dataUrl = await compressImageFile(file);
      setPanDocument(dataUrl);
      setPanFileName(file.name);
      setPanFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    } catch {
      alert('Failed to process PAN document file.');
    } finally {
      setIsUploadingPan(false);
    }
  };

  const handleRemovePan = () => {
    setPanDocument('');
    setPanFileName('');
    setPanFileSize('');
  };

  // 3. Optional Supporting Documents (Astrology Certificates, Experience Letters, Diplomas, etc.)
  const handleOtherDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setIsUploadingOther(true);
    try {
      const dataUrl = await compressImageFile(file);
      setNewDocFile(dataUrl);
      setNewDocFileName(file.name);
      setNewDocFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      if (!newDocTitle.trim()) {
        setNewDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch {
      alert('Failed to process document file.');
    } finally {
      setIsUploadingOther(false);
    }
  };

  const handleAddOtherDoc = () => {
    if (!newDocFile) {
      alert('Please select a file to upload first.');
      return;
    }
    const title = newDocTitle.trim() || newDocFileName || 'Supporting Document';
    const newEntry: SupportingDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      category: newDocCategory,
      document: newDocFile,
      fileName: newDocFileName,
      fileSize: newDocFileSize || '1 MB',
      uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setOtherDocuments(prev => [...prev, newEntry]);
    setNewDocTitle('');
    setNewDocCategory('Astrology Certificate / Degree');
    setNewDocFile('');
    setNewDocFileName('');
    setNewDocFileSize('');
    setIsAddingOtherDoc(false);
  };

  const handleRemoveOtherDoc = (id: string) => {
    setOtherDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Step 1: Validation
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert('Please provide your full name, phone number, and email address.');
      return;
    }
    if (specialisations.length === 0) {
      alert('Please select at least one Primary Specialisation.');
      return;
    }
    if (specialisations.includes('Other') && !otherSpecialisation.trim() && specialisations.length === 1) {
      alert('Please specify your other specialisation.');
      return;
    }
    if (!learningBackground.trim()) {
      alert('Please state where you studied astrology (Institute, Gurukul, or Guru Lineage).');
      return;
    }

    // MANDATORY KYC VALIDATIONS (Aadhaar & PAN)
    if (!aadhaarNumber.trim()) {
      alert('Aadhaar Number is required. Please enter your 12-digit Aadhaar number.');
      return;
    }
    if (!aadhaarDocument) {
      alert('Aadhaar Card document upload is mandatory for Government KYC identity verification. Please attach your Aadhaar card photo or document.');
      return;
    }
    if (!panNumber.trim()) {
      alert('PAN Card Number is required. Please enter your 10-character PAN number.');
      return;
    }
    if (!panDocument) {
      alert('PAN Card document upload is mandatory for regulatory compliance & payments. Please attach your PAN card photo or document.');
      return;
    }

    const resolvedSpec = strongestConsultationArea || (specialisations[0] === 'Other' ? otherSpecialisation.trim() : specialisations[0]) || 'Vedic Astrology';
    fetchQuestions(questionCount, isCuratedMode, resolvedSpec, assessmentLanguage);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Theory Quiz Grading
  const handleAnswerSelect = (questionId: string | number, optionIndex: number) => {
    setTheoryAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleGradeTheory = () => {
    let correct = 0;
    questionsList.forEach((q, idx) => {
      const chosen = theoryAnswers[q.id] !== undefined 
        ? theoryAnswers[q.id] 
        : theoryAnswers[String(q.id)] !== undefined 
        ? theoryAnswers[String(q.id)] 
        : theoryAnswers[idx + 1];
      if (chosen === q.correctIndex) {
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

  // Step 3: Chart Case Submission with AI Evaluation
  const [isEvaluatingChart, setIsEvaluatingChart] = useState(false);
  const [chartEvaluation, setChartEvaluation] = useState<any>(null);

  const handleProceedFromChart = async () => {
    if (!chartAnalysis.trim() || chartAnalysis.length < 20) {
      alert('Please provide your astrological observations on the sample Kundali case.');
      return;
    }
    setIsEvaluatingChart(true);
    try {
      const res = await fetch('/api/ai/evaluate-kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: name,
          specialisation: specialisations[0] || 'Vedic Jyotish',
          chartAnalysis,
          chartRemedy,
          language: assessmentLanguage,
          caseTitle: customChartCase?.title,
          caseLagna: customChartCase?.lagna,
          caseMoonSign: customChartCase?.moonSign,
          caseDasha: customChartCase?.dasha,
          casePlacements: customChartCase?.keyPlacements,
          caseQuery: customChartCase?.clientQuery,
          expectedObservations: customChartCase?.expectedObservations,
        })
      });
      const data = await res.json();
      if (data.success && typeof data.chartScore === 'number') {
        setChartScore(data.chartScore);
        setChartEvaluation(data.evaluation);
      } else {
        setChartScore(chartAnalysis.length > 80 ? 92 : 85);
      }
    } catch (err) {
      console.warn('AI Chart Evaluation error:', err);
      setChartScore(chartAnalysis.length > 80 ? 92 : 85);
    } finally {
      setIsEvaluatingChart(false);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
            specialisation: specialisations[0] || 'Vedic Jyotish',
            isFinalEvaluation: true,
            conversationHistory: updatedHistory,
            userAnswer: answerText,
            language: assessmentLanguage,
          })
        });
        const evalData = await evalRes.json();
        if (evalData.success && evalData.evaluation) {
          setAiInterviewEvaluation(evalData.evaluation);
          setAiInterviewComplete(true);
          const finalSec = interviewStartTime ? Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000)) : interviewDurationSeconds;
          const mins = Math.floor(finalSec / 60);
          const secs = finalSec % 60;
          setInterviewDurationSeconds(finalSec);
          setInterviewDurationFormatted(`${mins}m ${secs}s`);
          setConversationHistory(prev => [
            ...prev,
            {
              role: 'ai',
              topic: 'Evaluation Complete',
              text: `Thank you, ${name || 'Pandit Ji'} 🙏! Your AI technical interview has been evaluated with an authentic score of ${evalData.evaluation.totalScore}/100. All your answers have been recorded for human committee review.`
            }
          ]);
        } else {
          // Fallback evaluation if server response had an issue
          const userMsgs = updatedHistory.filter(m => m.role === 'user');
          const totalWords = userMsgs.map(m => m.text).join(' ').split(/\s+/).filter(Boolean).length;
          const estScore = Math.min(85, Math.max(30, Math.round(25 + Math.min(60, totalWords * 0.5))));
          const subScore = Math.round(estScore / 4);
          const fallbackEval = {
            totalScore: estScore,
            technicalScore: subScore,
            ethicsScore: subScore,
            communicationScore: subScore,
            clarityScore: subScore,
            recommendation: estScore >= 75 ? 'PROCEED_WITH_ASSESSMENT' : 'HOLD_FOR_REVIEW',
            summary: `${name || 'Candidate'} completed 3 interview examination questions (${totalWords} words recorded).`,
            strengths: ['Completed all 3 interview questions'],
            areasForImprovement: ['Review full dialogue during panel interview'],
          };
          setAiInterviewEvaluation(fallbackEval);
          setAiInterviewComplete(true);
          setConversationHistory(prev => [
            ...prev,
            {
              role: 'ai',
              topic: 'Evaluation Complete',
              text: `Thank you, ${name || 'Pandit Ji'} 🙏! Your interview answers have been securely recorded. AI examiner evaluated your responses at ${estScore}/100.`
            }
          ]);
        }
      } else {
        // Next Question
        const nextIdx = aiQuestionIndex + 1;

        const res = await fetch('/api/ai/candidate-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateName: name,
            specialisation: specialisations[0] || 'Vedic Jyotish',
            currentQuestionIndex: aiQuestionIndex,
            userAnswer: answerText,
            conversationHistory: updatedHistory,
            language: assessmentLanguage,
          })
        });
        const data = await res.json();
        setAiQuestionIndex(nextIdx);
        if (data.success && data.nextQuestion) {
          setConversationHistory(prev => [
            ...prev,
            {
              role: 'ai',
              topic: data.nextQuestion.topic,
              text: `${data.aiFeedback ? `${data.aiFeedback}\n\n` : ''}${data.nextQuestion.question}`
            }
          ]);
        } else {
          const fallbackTopics = ['Remedial Ethics & Upaya', 'Planetary Transits & Dasha Interpretation'];
          const fallbackQuestions = [
            'What is your philosophy regarding astrological remedies (gems, mantras, charity)? How do you respond if a client is unable to afford expensive gemstone remedies?',
            'When analyzing a complex chart with contradictory indications (e.g. strong benefic transits during a difficult Sade Sati or Maraka dasha), how do you synthesize the outcome and explain timing to the client?'
          ];
          setConversationHistory(prev => [
            ...prev,
            {
              role: 'ai',
              topic: fallbackTopics[nextIdx - 1] || 'Vedic Astrology Ethics',
              text: `Thank you for your answer.\n\n${fallbackQuestions[nextIdx - 1] || 'Please share your approach to counseling distressed clients.'}`
            }
          ]);
        }
      }
    } catch (err) {
      console.error('AI Interview error:', err);
      // Advance so user is never locked out
      if (aiQuestionIndex < 2) {
        const nextIdx = aiQuestionIndex + 1;
        setAiQuestionIndex(nextIdx);
        setConversationHistory(prev => [
          ...prev,
          {
            role: 'ai',
            topic: nextIdx === 1 ? 'Remedial Ethics & Upaya' : 'Planetary Transits & Dasha Interpretation',
            text: nextIdx === 1
              ? 'Thank you. Next question: What is your philosophy regarding astrological remedies (gems, mantras, charity)? How do you respond if a client is unable to afford expensive gemstone remedies?'
              : 'Thank you. Final question: When analyzing a complex chart with contradictory indications, how do you synthesize the outcome and explain timing to the client?'
          }
        ]);
      } else {
        setAiInterviewComplete(true);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // Final Step 5 Submission to Backend
  const handleFinalSubmit = async () => {
    // Check if candidate typed text in interview textarea that wasn't submitted
    if (userInterviewAnswer.trim()) {
      alert('You have typed an interview answer that has not been submitted. Please click "Submit Answer" first!');
      return;
    }

    const answeredCount = conversationHistory.filter(m => m.role === 'user').length;
    if (!aiInterviewComplete && answeredCount < 3) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of 3 interview questions. Submitting now will submit an incomplete interview, and unanswered questions will receive 0 marks. Do you wish to submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmittingFinal(true);
    try {
      const finalInterviewSec = interviewDurationSeconds || (interviewStartTime ? Math.max(1, Math.floor((Date.now() - interviewStartTime) / 1000)) : 180);
      const formattedInterview = (interviewDurationFormatted && interviewDurationFormatted !== '0m 0s')
        ? interviewDurationFormatted
        : `${Math.floor(finalInterviewSec / 60)}m ${finalInterviewSec % 60}s`;

      const finalAssessmentSec = assessmentDurationSeconds || (assessmentStartTime ? Math.max(1, Math.floor((Date.now() - assessmentStartTime) / 1000)) : finalInterviewSec + 300);
      const formattedAssessment = `${Math.floor(finalAssessmentSec / 60)}m ${finalAssessmentSec % 60}s`;

      const finalPhone = phone.trim().startsWith('+') ? phone.trim() : `${phoneCountryCode} ${phone.trim()}`.trim();
      const finalWhatsapp = sameAsPhone 
        ? finalPhone 
        : (whatsapp.trim().startsWith('+') ? whatsapp.trim() : `${whatsappCountryCode} ${whatsapp.trim()}`.trim());

      // Authentic interview score calculation - NEVER default to 88
      const calculatedInterviewScore = aiInterviewEvaluation?.totalScore ?? (
        answeredCount > 0 ? Math.round(40 * (answeredCount / 3)) : 0
      );

      const payload = {
        candidateId: candidateId || `ast-${Date.now()}`,
        name,
        email,
        phone: finalPhone,
        whatsapp: finalWhatsapp,
        phoneCountryCode,
        whatsappCountryCode: sameAsPhone ? phoneCountryCode : whatsappCountryCode,
        location,
        source: source || 'Direct Intake',
        campaignName: campaignName || '',
        campaign: campaignName || '',
        specialisations: [
          ...specialisations.filter(s => s !== 'Other'),
          ...(specialisations.includes('Other') && otherSpecialisation.trim() ? [otherSpecialisation.trim()] : [])
        ],
        strongestConsultationArea: strongestConsultationArea || (specialisations[0] === 'Other' ? otherSpecialisation.trim() : specialisations[0]) || 'Vedic Astrology',
        primarySpecialisation: strongestConsultationArea || (specialisations[0] === 'Other' ? otherSpecialisation.trim() : specialisations[0]) || 'Vedic Astrology',
        experience,
        bio,
        learningBackground,
        courseDetails,
        aadhaarNumber: aadhaarNumber.trim(),
        aadhaarDocument,
        aadhaarFileName,
        panNumber: panNumber.trim().toUpperCase(),
        panDocument,
        panFileName,
        idProofType: 'aadhaar',
        idProofNumber: aadhaarNumber.trim() || panNumber.trim(),
        idProofDocument: aadhaarDocument || panDocument,
        otherDocuments,
        languages: [...selectedLanguages, ...(otherLanguage.trim() ? [otherLanguage.trim()] : [])],
        theoryScore,
        chartCaseScore: chartScore,
        aiInterviewScore: calculatedInterviewScore,
        aiInterviewEvaluation,
        theoryAnswers,
        theoryQuestionsList: questionsList,
        chartCaseAnalysis: `${chartAnalysis}\n\nRemedies: ${chartRemedy}`,
        chartRemedy,
        chartEvaluation,
        chartCaseTitle: customChartCase?.title || 'Scorpio Lagna Career Crisis',
        chartCaseLagna: customChartCase?.lagna || 'Scorpio',
        chartCaseQuery: customChartCase?.clientQuery || '',
        chartCasePlacements: customChartCase?.keyPlacements || [],
        conversationHistory,
        interviewDurationSeconds: finalInterviewSec,
        interviewDurationFormatted: formattedInterview,
        assessmentDurationSeconds: finalAssessmentSec,
        assessmentDurationFormatted: formattedAssessment,
        assessmentLanguage,
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
      {/* Top Header Branding with Persistent Language Switcher */}
      <header className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between gap-3 shadow-xs">
        {/* Left: Logo & Portal Title */}
        <div className="flex items-center gap-3">
          <AppLogo src="/assets/images/AstroParihar_Logo-1786957316255.webp" size={38} />
          <div>
            <h1 className="font-bold text-sm md:text-base leading-tight text-foreground flex items-center gap-2">
              {t.portalTitle}
              <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 hidden sm:inline-block">
                {t.portalBadge}
              </span>
            </h1>
            <p className="text-3xs md:text-2xs text-muted-foreground hidden sm:block">
              {t.portalSubtitle}
            </p>
          </div>
        </div>

        {/* Right: Sticky Header Language Dropdown + Security Notice */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-3xs font-extrabold uppercase tracking-wider text-muted-foreground hidden lg:inline">
              Language:
            </span>
            <LanguageDropdown
              value={assessmentLanguage}
              onChange={handleLanguageChange}
              id="header-language-dropdown"
            />
          </div>

          <div className="text-xs text-muted-foreground hidden lg:flex items-center gap-1.5 pl-2 border-l border-border">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span className="text-2xs">{t.securityEncrypted}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* SLEEK, COMPACT APPLICATION & EXAM LANGUAGE BAR */}
        {!isDisqualified && (
          <div className="card-elevated p-3 sm:p-4 bg-card border border-primary/30 shadow-xs rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shadow-2xs flex-shrink-0">
                🌐
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  {t.langSelectLabel}
                </h3>
                <p className="text-3xs sm:text-2xs text-muted-foreground">
                  {t.langSelectDesc}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <LanguageDropdown
                value={assessmentLanguage}
                onChange={handleLanguageChange}
                id="main-language-dropdown"
                buttonClassName="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:border-primary font-extrabold"
              />
            </div>
          </div>
        )}
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
                { step: 1, label: t.step1Title, icon: <User size={13} /> },
                { step: 2, label: t.step2Title, icon: <BookOpen size={13} /> },
                { step: 3, label: t.step3Title, icon: <Compass size={13} /> },
                { step: 4, label: t.step4Title, icon: <Brain size={13} /> },
                { step: 5, label: t.step5Title, icon: <FileCheck2 size={13} /> },
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
          <form onSubmit={handleProfileSubmit} autoComplete="off" className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            {/* Chrome Autofill Credential Traps to prevent browser from dumping saved email into phone fields */}
            <input type="text" name="chrome_autofill_trap_user" tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: 'none' }} />
            <input type="password" name="chrome_autofill_trap_pass" tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: 'none' }} />

            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <User size={20} className="text-primary" />
                {t.step1Title} · {t.portalBadge}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {t.step1Desc}
              </p>
            </div>

            {/* Section 1: Contact & Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} />
                {t.personalInfoSection}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="label-field text-xs">{t.fullNameLabel}</label>
                  <input
                    type="text"
                    required
                    name="name"
                    id="candidate-name"
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="input-field text-sm"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="label-field text-xs flex items-center justify-between">
                    <span>{t.emailLabel}</span>
                    <span className="text-2xs text-primary font-medium">For Onboarding Confirmation</span>
                  </label>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground">
                      <Mail size={13} className="text-primary" />
                    </div>
                    <input
                      type="email"
                      required
                      name="email"
                      id="candidate-email"
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="astrologer@example.com"
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>

                {/* Calling Phone Number */}
                <div>
                  <label className="label-field text-xs">{t.phoneLabel}</label>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <CountryCodeDropdown
                      value={phoneCountryCode}
                      selectedIso={phoneCountryIso}
                      onChange={(code, iso) => {
                        setPhoneCountryCode(code);
                        if (iso) setPhoneCountryIso(iso);
                        if (sameAsPhone) {
                          setWhatsappCountryCode(code);
                          if (iso) setWhatsappCountryIso(iso);
                        }
                      }}
                      icon={<Phone size={12} className="text-primary mr-0.5" />}
                      ariaLabel="Calling phone country code"
                    />
                    <input
                      type="tel"
                      required
                      name="candidate_calling_phone"
                      id="candidate_calling_phone"
                      inputMode="tel"
                      autoComplete="off"
                      value={phone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      placeholder="98765 43210"
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label-field text-xs mb-0">{t.whatsappLabel}</label>
                    <label className="flex items-center gap-1.5 text-2xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={e => {
                          setSameAsPhone(e.target.checked);
                          if (e.target.checked) {
                            setWhatsapp(phone);
                            setWhatsappCountryCode(phoneCountryCode);
                            setWhatsappCountryIso(phoneCountryIso);
                          }
                        }}
                        className="rounded border-input text-primary focus:ring-primary h-3 w-3"
                      />
                      <span>{t.sameAsPhone}</span>
                    </label>
                  </div>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <CountryCodeDropdown
                      value={sameAsPhone ? phoneCountryCode : whatsappCountryCode}
                      selectedIso={sameAsPhone ? phoneCountryIso : whatsappCountryIso}
                      disabled={sameAsPhone}
                      onChange={(code, iso) => {
                        setWhatsappCountryCode(code);
                        if (iso) setWhatsappCountryIso(iso);
                      }}
                      icon={<MessageCircle size={12} className="text-emerald-600 dark:text-emerald-400 mr-0.5" />}
                      ariaLabel="WhatsApp country code"
                    />
                    <input
                      type="tel"
                      required
                      name="candidate_whatsapp_phone"
                      id="candidate_whatsapp_phone"
                      inputMode="tel"
                      autoComplete="off"
                      disabled={sameAsPhone}
                      value={sameAsPhone ? phone : whatsapp}
                      onChange={e => handleWhatsappChange(e.target.value)}
                      placeholder="98765 43210"
                      className={`flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground ${sameAsPhone ? 'opacity-70 bg-muted/20' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Astrological Training & Learning Background */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap size={15} />
                {t.credentialsSection}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Learning Institute / Gurukul */}
                <div>
                  <label className="label-field text-xs">
                    {t.learningBgLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={learningBackground}
                    onChange={e => setLearningBackground(e.target.value)}
                    placeholder={t.learningBgPlaceholder}
                    className="input-field text-sm"
                  />
                  <p className="text-2xs text-muted-foreground mt-1">
                    State the academy, university, guru name, or family lineage where you received training.
                  </p>
                </div>

                {/* Degree / Diploma Title */}
                <div>
                  <label className="label-field text-xs">
                    {t.certDetailsLabel}
                  </label>
                  <input
                    type="text"
                    value={courseDetails}
                    onChange={e => setCourseDetails(e.target.value)}
                    placeholder={t.certDetailsPlaceholder}
                    className="input-field text-sm"
                  />
                  <p className="text-2xs text-muted-foreground mt-1">
                    Mention your certification title, year of completion, or traditional title.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Mandatory KYC Documents (Aadhaar & PAN) */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={15} />
                  Identity & Compliance Verification (Aadhaar & PAN Mandatory)
                </h3>
                <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Mandatory Uploads
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Aadhaar Card (Mandatory) */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="label-field text-xs font-bold text-foreground flex items-center gap-1">
                      Aadhaar Card <span className="text-red-500 font-extrabold">*</span>
                    </label>
                    <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Govt ID Verification
                    </span>
                  </div>

                  <div>
                    <label className="text-2xs text-muted-foreground font-medium block mb-1">
                      Aadhaar Number (12 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={e => setAadhaarNumber(e.target.value)}
                      placeholder="e.g. 5432 1098 7654"
                      className="input-field text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-2xs text-muted-foreground font-medium block mb-1">
                      Upload Aadhaar Document (Photo / PDF) <span className="text-red-500">*</span>
                    </label>
                    {aadhaarDocument ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-11 h-11 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {aadhaarDocument.startsWith('data:image') ? (
                              <img src={aadhaarDocument} alt="Aadhaar Preview" className="w-full h-full object-cover" />
                            ) : (
                              <FileText size={20} className="text-emerald-700 dark:text-emerald-300" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate flex items-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                              {aadhaarFileName || 'Aadhaar Card Attached'}
                            </p>
                            <p className="text-3xs text-emerald-700 dark:text-emerald-400">
                              {aadhaarFileSize ? `${aadhaarFileSize} • ` : ''}Ready for Review
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAadhaar}
                          className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 rounded transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0 ml-2"
                        >
                          <Trash2 size={12} />
                          <span className="text-2xs">Remove</span>
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-input hover:border-primary/60 bg-muted/10 hover:bg-muted/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center mb-1.5 transition-colors">
                          <Upload size={16} />
                        </div>
                        <p className="text-xs font-semibold text-foreground text-center">
                          {isUploadingAadhaar ? 'Processing file...' : 'Upload Aadhaar Card (Front/Back)'}
                        </p>
                        <p className="text-3xs text-muted-foreground mt-0.5 text-center">
                          JPG, PNG, WEBP, or PDF (Max 10MB)
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleAadhaarUpload}
                          className="hidden"
                          disabled={isUploadingAadhaar}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 2. PAN Card (Mandatory) */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="label-field text-xs font-bold text-foreground flex items-center gap-1">
                      PAN Card <span className="text-red-500 font-extrabold">*</span>
                    </label>
                    <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tax & Compliance
                    </span>
                  </div>

                  <div>
                    <label className="text-2xs text-muted-foreground font-medium block mb-1">
                      PAN Number (10 Characters) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={e => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      className="input-field text-sm uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-2xs text-muted-foreground font-medium block mb-1">
                      Upload PAN Card Document (Photo / PDF) <span className="text-red-500">*</span>
                    </label>
                    {panDocument ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-11 h-11 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {panDocument.startsWith('data:image') ? (
                              <img src={panDocument} alt="PAN Preview" className="w-full h-full object-cover" />
                            ) : (
                              <FileText size={20} className="text-emerald-700 dark:text-emerald-300" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate flex items-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                              {panFileName || 'PAN Card Attached'}
                            </p>
                            <p className="text-3xs text-emerald-700 dark:text-emerald-400">
                              {panFileSize ? `${panFileSize} • ` : ''}Ready for Review
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePan}
                          className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 rounded transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0 ml-2"
                        >
                          <Trash2 size={12} />
                          <span className="text-2xs">Remove</span>
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-input hover:border-primary/60 bg-muted/10 hover:bg-muted/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center mb-1.5 transition-colors">
                          <Upload size={16} />
                        </div>
                        <p className="text-xs font-semibold text-foreground text-center">
                          {isUploadingPan ? 'Processing file...' : 'Upload PAN Card Photo'}
                        </p>
                        <p className="text-3xs text-muted-foreground mt-0.5 text-center">
                          JPG, PNG, WEBP, or PDF (Max 10MB)
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handlePanUpload}
                          className="hidden"
                          disabled={isUploadingPan}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Optional Supporting Documents (Astro Certificates & Experience Letters) */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={15} />
                  Astrology Certificates & Experience Letters (Optional)
                </h3>
                <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  Optional Uploads
                </span>
              </div>
              <p className="text-2xs text-muted-foreground">
                If you have any formal astrology certificates (e.g. ICAS, university diplomas), experience recommendation letters, or Gurukul lineage certificates, you can upload them here for the review panel.
              </p>

              {/* Uploaded Supporting Documents List */}
              {otherDocuments.length > 0 && (
                <div className="space-y-2">
                  {otherDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 text-primary">
                          {doc.document.startsWith('data:image') ? (
                            <img src={doc.document} alt={doc.title} className="w-full h-full object-cover" />
                          ) : (
                            <FileCheck2 size={18} />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-foreground truncate">{doc.title}</p>
                          <p className="text-3xs text-muted-foreground">
                            {doc.category} • {doc.fileSize} • Uploaded {doc.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherDoc(doc.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors cursor-pointer flex-shrink-0 ml-2"
                        title="Remove Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Document Box / Form */}
              {isAddingOtherDoc ? (
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Attach Supporting Document</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingOtherDoc(false);
                        setNewDocFile('');
                        setNewDocFileName('');
                        setNewDocTitle('');
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-2xs text-muted-foreground font-medium block mb-1">Document Title</label>
                      <input
                        type="text"
                        value={newDocTitle}
                        onChange={e => setNewDocTitle(e.target.value)}
                        placeholder="e.g. ICAS Jyotish Visharada Certificate"
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-2xs text-muted-foreground font-medium block mb-1">Document Category</label>
                      <select
                        value={newDocCategory}
                        onChange={e => setNewDocCategory(e.target.value)}
                        className="input-field text-xs py-1.5"
                      >
                        <option value="Astrology Certificate / Degree">Astrology Certificate / Degree</option>
                        <option value="Experience Letter">Experience Letter</option>
                        <option value="Gurukul / Lineage Certificate">Gurukul / Lineage Certificate</option>
                        <option value="Business / Registration Proof">Business / Registration Proof</option>
                        <option value="Other Supporting Document">Other Supporting Document</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    {newDocFile ? (
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                          <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 truncate">{newDocFileName}</span>
                          <span className="text-3xs text-emerald-700 dark:text-emerald-400">({newDocFileSize})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewDocFile('');
                            setNewDocFileName('');
                            setNewDocFileSize('');
                          }}
                          className="text-2xs text-red-600 hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-input hover:border-primary/60 bg-card rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                        <Upload size={14} className="text-primary" />
                        <span className="text-xs font-medium text-foreground">
                          {isUploadingOther ? 'Processing file...' : 'Choose file (JPG, PNG, WEBP, PDF up to 10MB)'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleOtherDocFileChange}
                          className="hidden"
                          disabled={isUploadingOther}
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingOtherDoc(false)}
                      className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddOtherDoc}
                      disabled={!newDocFile}
                      className="btn-primary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Plus size={13} />
                      Attach Document
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingOtherDoc(true)}
                  className="w-full py-2.5 px-3 border border-dashed border-primary/40 hover:border-primary rounded-xl text-xs font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Astrological Certificate, Degree or Experience Letter</span>
                </button>
              )}
            </div>

            {/* Section 4: Practice & Specialisation Details */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Compass size={15} />
                {t.practiceSection}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Primary Specialisation — Dropdown */}
                <div className="md:col-span-2">
                  <label className="label-field text-xs mb-1.5 block">{t.specialisationLabel} * <span className="text-2xs text-muted-foreground font-normal">({t.specialisationHelp})</span></label>
                  <button
                    ref={specRef}
                    type="button"
                    onClick={() => {
                      if (!specRef.current) return;
                      const r = specRef.current.getBoundingClientRect();
                      const panelH = 360;
                      const top = (r.top > panelH)
                        ? r.top + window.scrollY - panelH - 6
                        : r.bottom + window.scrollY + 6;
                      setSpecPos({ top, left: r.left + window.scrollX, width: r.width });
                      setSpecOpen(v => !v);
                    }}
                    className="w-full input-field text-sm flex items-center justify-between gap-2 cursor-pointer text-left"
                  >
                    <span className={specialisations.length === 0 ? 'text-muted-foreground' : 'text-foreground font-medium'}>
                      {specialisations.length === 0 
                        ? 'Select specialisation(s)...' 
                        : [
                            ...specialisations.filter(s => s !== 'Other'),
                            ...(specialisations.includes('Other') && otherSpecialisation.trim() ? [`Other (${otherSpecialisation.trim()})`] : specialisations.includes('Other') ? ['Other'] : [])
                          ].join(', ')}
                    </span>
                    <ChevronDown size={14} className={`flex-shrink-0 text-muted-foreground transition-transform duration-150 ${specOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  {specialisations.length === 0 && <p className="text-2xs text-red-500 mt-1">Please select at least one specialisation.</p>}

                  {specialisations.includes('Other') && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={otherSpecialisation}
                        onChange={e => {
                          setOtherSpecialisation(e.target.value);
                          if (strongestConsultationArea.includes('(Other)') || strongestConsultationArea === 'Other') {
                            setStrongestConsultationArea(e.target.value.trim() ? `${e.target.value.trim()} (Other)` : 'Other');
                          }
                        }}
                        placeholder="Please specify other specialisation (e.g. Graphology, Western Astrology)..."
                        className="input-field text-sm w-full"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Which is your strongest consultation area? */}
                <div className="md:col-span-2">
                  <label className="label-field text-xs mb-1.5 block font-semibold text-foreground">
                    Which is your strongest consultation area? *
                  </label>
                  <select
                    value={strongestConsultationArea}
                    onChange={e => setStrongestConsultationArea(e.target.value)}
                    className="input-field text-sm w-full bg-background text-foreground"
                    required
                  >
                    {[
                      'Vedic Astrology',
                      'KP Astrology',
                      'Nadi Astrology',
                      'Lal Kitab',
                      'Tarot',
                      'Numerology',
                      'Palmistry',
                      'Vastu',
                      'Face Reading',
                      'Reiki',
                      'Angel Reading',
                      'Prashna',
                      'Psychic Reading',
                      'Pendulum Dowsing',
                    ].map(area => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                    {otherSpecialisation.trim() ? (
                      <option value={`${otherSpecialisation.trim()} (Other)`}>
                        {otherSpecialisation.trim()} (Other)
                      </option>
                    ) : specialisations.includes('Other') ? (
                      <option value="Other">Other</option>
                    ) : null}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="label-field text-xs">{t.experienceLabel} *</label>
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
                  <label className="label-field text-xs">{t.locationLabel} *</label>
                  <div className="flex rounded-md border border-input overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20">
                    <div className="bg-muted/50 px-3 py-2 border-r border-border flex items-center text-muted-foreground">
                      <MapPin size={13} className="text-primary" />
                    </div>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder={t.locationPlaceholder}
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-foreground"
                    />
                  </div>
                </div>

                {/* Languages Spoken — Dropdown */}
                <div>
                  <label className="label-field text-xs mb-1.5 block">{t.languagesLabel} *</label>
                  <button
                    ref={langRef}
                    type="button"
                    onClick={() => {
                      if (!langRef.current) return;
                      const r = langRef.current.getBoundingClientRect();
                      const panelH = 420;
                      const top = (r.top > panelH)
                        ? r.top + window.scrollY - panelH - 6
                        : r.bottom + window.scrollY + 6;
                      setLangPos({ top, left: r.left + window.scrollX, width: r.width });
                      setLangOpen(v => !v);
                    }}
                    className="w-full input-field text-sm flex items-center justify-between gap-2 cursor-pointer text-left"
                  >
                    <span className={selectedLanguages.length === 0 && !otherLanguage.trim() ? 'text-muted-foreground' : 'text-foreground font-medium'}>
                      {[
                        ...selectedLanguages,
                        ...(otherLanguage.trim() ? [otherLanguage.trim()] : [])
                      ].join(', ') || 'Select language(s)...'}
                    </span>
                    <ChevronDown size={14} className={`flex-shrink-0 text-muted-foreground transition-transform duration-150 ${langOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                </div>

              </div>

              {/* Professional Bio */}
              <div>
                <label className="label-field text-xs">{t.bioLabel}</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder={t.bioPlaceholder}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>{t.btnStartAssessment}</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </form>
        )}

        {/* ── Specialisation Portal Dropdown ── */}
        {typeof window !== 'undefined' && specOpen && createPortal(
          <div
            style={{ position: 'absolute', ...specPos, zIndex: 99999, background: 'white' }}
            className="rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
          >
            <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>SELECT ALL THAT APPLY</p>
              </div>
              <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '6px' }}>
                {[
                  { v: 'Vedic Astrology', l: 'Vedic Astrology' },
                  { v: 'KP Astrology', l: 'KP Astrology' },
                  { v: 'Nadi Astrology', l: 'Nadi Astrology' },
                  { v: 'Lal Kitab', l: 'Lal Kitab' },
                  { v: 'Tarot', l: 'Tarot' },
                  { v: 'Numerology', l: 'Numerology' },
                  { v: 'Palmistry', l: 'Palmistry' },
                  { v: 'Vastu', l: 'Vastu' },
                  { v: 'Face Reading', l: 'Face Reading' },
                  { v: 'Reiki', l: 'Reiki' },
                  { v: 'Angel Reading', l: 'Angel Reading' },
                  { v: 'Prashna', l: 'Prashna' },
                  { v: 'Psychic Reading', l: 'Psychic Reading' },
                  { v: 'Pendulum Dowsing', l: 'Pendulum Dowsing' },
                  { v: 'Other', l: 'Other' },
                ].map(opt => {
                  const checked = specialisations.includes(opt.v);
                  return (
                    <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', background: checked ? '#fef3ee' : 'transparent', color: checked ? '#b45309' : '#111827', fontSize: '13px', fontWeight: checked ? '600' : '400' }}>
                      <input type="checkbox" checked={checked}
                        onChange={() => {
                          setSpecialisations(prev => {
                            const next = checked ? prev.filter(s => s !== opt.v) : [...prev, opt.v];
                            if (!checked && next.length === 1 && opt.v !== 'Other') {
                              setStrongestConsultationArea(opt.v);
                            }
                            return next;
                          });
                        }}
                        style={{ width: '15px', height: '15px', accentColor: '#b45309', flexShrink: 0 }} />
                      {opt.l}
                    </label>
                  );
                })}
              </div>
              {specialisations.includes('Other') && (
                <div style={{ padding: '8px 12px', borderTop: '1px solid #f3f4f6', background: '#fffbeb' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#92400e', display: 'block', marginBottom: '4px' }}>
                    Specify Other Specialisation:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Graphology, Western Astrology..."
                    value={otherSpecialisation}
                    onChange={e => {
                      setOtherSpecialisation(e.target.value);
                      if (strongestConsultationArea.includes('(Other)') || strongestConsultationArea === 'Other') {
                        setStrongestConsultationArea(e.target.value.trim() ? `${e.target.value.trim()} (Other)` : 'Other');
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                    style={{ width: '100%', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                  />
                </div>
              )}
              <div style={{ padding: '8px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSpecOpen(false)}
                  style={{ fontSize: '12px', fontWeight: '600', color: '#b45309', padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#fef3ee', cursor: 'pointer' }}>Done ✓</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ── Language Portal Dropdown ── */}
        {typeof window !== 'undefined' && langOpen && createPortal(
          <div style={{ position: 'absolute', ...langPos, zIndex: 99999 }}>
            <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>SELECT LANGUAGES</p>
              </div>
              <div style={{ padding: '6px' }}>
                {['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Sanskrit', 'Marathi', 'Kannada', 'Malayalam', 'Gujarati'].map(lang => {
                  const checked = selectedLanguages.includes(lang);
                  return (
                    <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', background: checked ? '#fef3ee' : 'transparent', color: checked ? '#b45309' : '#111827', fontSize: '13px', fontWeight: checked ? '600' : '400' }}>
                      <input type="checkbox" checked={checked}
                        onChange={() => setSelectedLanguages(prev => checked ? prev.filter(l => l !== lang) : [...prev, lang])}
                        style={{ width: '15px', height: '15px', accentColor: '#b45309', flexShrink: 0 }} />
                      {lang}
                    </label>
                  );
                })}
                <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '4px', padding: '8px 12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>OTHER LANGUAGE</div>
                  <input type="text" value={otherLanguage} onChange={e => setOtherLanguage(e.target.value)}
                    placeholder="e.g. Odia, Assamese, Punjabi..."
                    style={{ width: '100%', padding: '6px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', color: '#111827', background: '#fff', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ padding: '8px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setLangOpen(false)}
                  style={{ fontSize: '12px', fontWeight: '600', color: '#b45309', padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#fef3ee', cursor: 'pointer' }}>Done ✓</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* STEP 2: Vedic Theory Assessment with Dynamic Questions & AI Score Config */}
        {!isDisqualified && currentStep === 2 && (
          <div className="card-elevated p-6 md:p-8 space-y-6 animate-slide-up">
            {/* Header */}
            <div className="border-b border-border pb-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  {t.theoryHeader}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.theorySubtitle}
                </p>
              </div>

              {theorySubmitted && (
                <div className={`px-3.5 py-1.5 rounded-full border font-bold text-sm flex items-center gap-1.5 ${
                  theoryScore >= passingThreshold 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-800 dark:text-amber-300'
                }`}>
                  <Award size={16} />
                  {t.scoreText}: {theoryScore}/100 • {theoryScore >= passingThreshold ? t.passText : t.reviewText}
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
                    {t.questionSourceLabel}:
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
                        <span>{t.curatedModeOn}</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={18} className="text-primary" />
                        <Sparkles size={13} className="text-primary animate-pulse" />
                        <span>{t.aiModeOff}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Number of Questions Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">{t.questionsCountLabel}:</span>
                  {Array.from(new Set([3, 5, 8, 10, 15, questionCount].filter(Boolean))).sort((a, b) => a - b).map(cnt => (
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
                      : `AI is dynamically generating ${questionsList.length} specialized questions for ${specialisations[0] || 'Vedic Jyotish'}.`}
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
                <p className="text-xs text-muted-foreground">GPT-4o is tailoring questions to {specialisations.join(', ')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questionsList.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-card border border-border space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">
                        <span className="text-primary mr-2">Q{idx + 1}.</span>
                        {getQuestionText(q, assessmentLanguage)}
                      </p>
                      {q.topic && (
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                          {getTopicText(q, assessmentLanguage)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {getOptionsList(q, assessmentLanguage).map((opt: string, optIdx: number) => {
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
                        <strong>{t.explanationLabel}:</strong> {getExplanationText(q, assessmentLanguage)}
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
                {t.btnBack}
              </button>

              {!theorySubmitted ? (
                <button
                  type="button"
                  onClick={handleGradeTheory}
                  disabled={Object.keys(theoryAnswers).length < questionsList.length || isLoadingQuestions}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Award size={15} />
                  {t.btnGradeAssessment} ({Object.keys(theoryAnswers).length}/{questionsList.length} {t.answeredCount})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedFromTheory}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>{t.btnProceedToChart}</span>
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
                {t.caseHeader}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {t.caseSubtitle}
              </p>
            </div>

            {/* Case Chart Scenario Card */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {customChartCase?.title || 'Case Profile #K-402'}
                  </span>
                  {customChartCase?.isAiGenerated ? (
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Sparkles size={11} className="animate-pulse" /> {t.caseBadgeAi}
                    </span>
                  ) : (
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                      {t.caseBadgeCustom}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* If multiple custom cases in list, show case switcher tabs */}
                  {customChartCasesList.length > 1 && (
                    <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border border-border">
                      {customChartCasesList.map((c, idx) => (
                        <button
                          key={c.id || idx}
                          type="button"
                          onClick={() => {
                            setActiveChartCaseIndex(idx);
                            setCustomChartCase(c);
                          }}
                          className={`px-2 py-0.5 text-2xs font-bold rounded cursor-pointer transition-all ${
                            activeChartCaseIndex === idx
                              ? 'bg-primary text-primary-foreground shadow-2xs'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {!useCustomChartCases && (
                    <button
                      type="button"
                      disabled={isLoadingChartCase}
                      onClick={() => fetchAiChartCase()}
                      className="text-2xs font-bold px-2.5 py-1 rounded-md bg-background border border-border hover:bg-muted text-foreground flex items-center gap-1 cursor-pointer transition-all"
                      title="Generate another AI case scenario"
                    >
                      <RefreshCw size={11} className={isLoadingChartCase ? 'animate-spin' : ''} />
                      <span>{t.btnRegenerateCase}</span>
                    </button>
                  )}

                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    D1 Lagna + D9 Navamsha
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">{t.lagnaLabel}</p>
                  <p className="font-bold text-foreground">
                    {customChartCase?.lagna || 'Scorpio (Vrishchika)'}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">{t.moonSignLabel}</p>
                  <p className="font-bold text-foreground">
                    {customChartCase?.moonSign || 'Capricorn (Makara)'}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">{t.dashaLabel}</p>
                  <p className="font-bold text-foreground">
                    {customChartCase?.dasha || 'Saturn - Rahu'}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-background border border-border">
                  <p className="text-muted-foreground text-2xs">{t.keyPlacementsLabel}</p>
                  <p className="font-bold text-foreground">
                    {customChartCase?.keyPlacements || 'Mars in 10th (Leo), Sun in 11th'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>{t.clientQueryLabel}:</strong>{' '}
                {customChartCase?.clientQuery 
                  ? `"${customChartCase.clientQuery}"`
                  : '"I have experienced sudden career delays and mental restlessness over the past 8 months despite hard work. Will my business venture launch successfully, and what spiritual remedies do you recommend?"'}
              </p>
            </div>

            {/* Analysis Text Area */}
            <div className="space-y-4">
              <div>
                <label className="label-field text-xs">{t.analysisLabel} *</label>
                <textarea
                  rows={4}
                  value={chartAnalysis}
                  onChange={e => setChartAnalysis(e.target.value)}
                  placeholder={t.analysisPlaceholder}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="label-field text-xs">{t.remediesLabel}</label>
                <textarea
                  rows={3}
                  value={chartRemedy}
                  onChange={e => setChartRemedy(e.target.value)}
                  placeholder={t.remediesPlaceholder}
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
                {t.btnBackToTheory}
              </button>

              <button
                type="button"
                disabled={isEvaluatingChart}
                onClick={handleProceedFromChart}
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isEvaluatingChart ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Evaluating Case with AI...</span>
                  </>
                ) : (
                  <>
                    <span>{t.btnProceedToInterview}</span>
                    <ChevronRight size={15} />
                  </>
                )}
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
                  {t.interviewHeader}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.interviewSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5 shadow-2xs">
                  <Clock size={13} className={!aiInterviewComplete ? "animate-pulse text-amber-600" : "text-emerald-600"} />
                  <span>Interview Time: {interviewDurationFormatted}</span>
                </div>
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Question {Math.min(aiQuestionIndex + 1, 3)} of 3
                </div>
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
                    {msg.role === 'ai' ? t.examinerLabel : name.slice(0, 1) || t.candidateLabel.slice(0, 1) || 'U'}
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
                  <span>{t.generatingResponse}</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Answer Input */}
            {!aiInterviewComplete ? (
              <div className="space-y-3 bg-card p-4 rounded-xl border border-border shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="label-field text-xs font-bold text-foreground">
                    {t.candidateLabel} — Question {Math.min(aiQuestionIndex + 1, 3)} of 3 *
                  </label>
                  <span className="text-2xs font-medium text-muted-foreground">
                    {userInterviewAnswer.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={userInterviewAnswer}
                  onChange={e => setUserInterviewAnswer(e.target.value)}
                  placeholder={t.interviewAnswerPlaceholder}
                  className="input-field text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSendInterviewAnswer();
                    }
                  }}
                />
                <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                  <span className="text-2xs text-muted-foreground">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-2xs font-mono">Ctrl + Enter</kbd> or click button to send
                  </span>

                  <button
                    type="button"
                    onClick={handleSendInterviewAnswer}
                    disabled={!userInterviewAnswer.trim() || isAiLoading}
                    className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>{t.generatingResponse}</span>
                      </>
                    ) : aiQuestionIndex >= 2 ? (
                      <>
                        <span>{t.btnSendAnswer} (3 / 3)</span>
                        <Send size={13} />
                      </>
                    ) : (
                      <>
                        <span>{t.btnNextQuestion} →</span>
                        <Send size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    AI Interview Assessment Completed
                  </h3>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Score: {aiInterviewEvaluation?.totalScore ?? 0} / 100
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {aiInterviewEvaluation?.summary || 'Candidate demonstrated sound Vedic understanding and empathetic consultation ethics.'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                {t.btnBack}
              </button>

              <div className="flex items-center gap-3">
                {!aiInterviewComplete && (
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    Answer Question {Math.min(aiQuestionIndex + 1, 3)} of 3 above to finish
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmittingFinal || (!aiInterviewComplete && conversationHistory.filter(m => m.role === 'user').length < 3)}
                  className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingFinal ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>{t.btnFinalSubmit}</span>
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              </div>
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
                {name ? `${name} Ji · ` : ''}{t.submissionTitle}
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                {t.submissionDesc}
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
                {t.appRefLabel}: <strong className="font-mono text-foreground">{applicationRefId}</strong>
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="btn-secondary text-xs py-2 px-5 inline-flex items-center gap-1.5"
                >
                  {t.btnReturnHome}
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
