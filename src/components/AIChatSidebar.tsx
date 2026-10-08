'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  Volume2,
  VolumeX,
  Languages,
  ChevronDown,
  User,
  ShieldCheck,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  LogIn,
  CheckCircle2,
  Compass,
  AlertTriangle,
  Calendar,
  Flame,
  Briefcase,
  Heart,
  Activity,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserData } from '@/lib/useUserData';
import AppImage from '@/components/ui/AppImage';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { AIAstrologer } from '@/lib/aiAstrologerData';
import {
  calculateBirthChartData,
  generatePersonalAstrologyProfile,
  generateYearComparison,
  generateInteractiveTimeline,
  PersonalAstrologyProfile,
  YearComparisonOutlook,
  TimelineMilestone,
} from '@/lib/vedicAstrologyEngine';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations?: string[];
  structured?: {
    diagnosis?: {
      activeDasha?: string;
      keyHouses?: string;
      supportingFactors?: string[];
      contradictoryFactors?: string[];
    };
    conclusion?: string;
    timingWindow?: string;
    whyAstroPariharSaysThis?: string[];
    confidence?: 'Strong' | 'Moderate' | 'Mixed';
    confidenceRationale?: string;
    needsAstrologerReview?: boolean;
    escalationReason?: string;
    pariharProtocol?: any;
  };
}

const DEFAULT_RECOMMENDATIONS = [
  '🔮 What do planetary transits say for me in 2026?',
  '❤️ When will I meet my compatible life partner?',
  '💼 When is the best time for a career change or promotion?',
  '✨ What is my lucky gemstone, rudraksha & daily mantra?',
  '🪐 Am I currently running Shani Sade Sati or Rahu Mahadasha?',
  '🙏 What specific Vedic remedies or charity should I perform?',
];

const QUICK_PROMPTS_BY_LANG: Record<string, string[]> = {
  Telugu: [
    '🔮 2026లో నా గ్రహ సంచారాల ఫలితాలు ఎలా ఉన్నాయి?',
    '❤️ నా జాతకంలో వివాహ యోగం ఎప్పుడు ఉంది?',
    '💼 కెరీర్ మార్పు లేదా ప్రమోషన్‌కు సరైన సమయం ఎప్పుడు?',
    '✨ నా అదృష్ట రత్నం, రుద్రాక్ష మరియు నిత్య మంత్రం ఏమిటి?',
    '🪐 నాకు శని సాడే సాతి లేదా రాహు మహర్దశ నడుస్తుందా?',
    '🙏 నా జాతక దోష నివారణకు ఎలాంటి పరిహారాలు లేదా దానం చేయాలి?',
  ],
  Hindi: [
    '🔮 2026 में मेरे मुख्य ग्रह गोचर का क्या प्रभाव रहेगा?',
    '❤️ मेरे विवाह का शुभ योग कब बनेगा?',
    '💼 करियर में पदोन्नति या व्यापार विस्तार का सबसे शुभ समय कब है?',
    '✨ मेरे लिए भाग्यशाली रत्न, रुद्राक्ष और दैनिक मंत्र क्या है?',
    '🪐 क्या मुझ पर शनि की साढ़ेसाती या राहु की महादशा चल रही है?',
    '🙏 ग्रह शांति के लिए मुझे कौन सा विशेष दान या उपाय करना चाहिए?',
  ],
  Tamil: [
    '🔮 2026-ல் எனது கிரக பெயர்ச்சி பலன்கள் எப்படி உள்ளன?',
    '❤️ எனது திருமண யோகம் மற்றும் வாழ்க்கை எப்போது அமையும்?',
    '💼 தொழில் வளர்ச்சி அல்லது வேலை மாற்றத்திற்கு உகந்த நேரம் எப்போது?',
    '✨ எனது அதிர்ஷ்ட ரத்தினம், ருத்ராட்சம் மற்றும் தினசரி மந்திரம் எது?',
    '🪐 எனக்கு ஏழரை சனி அல்லது ராகு தசை நடக்கிறதா?',
    '🙏 கிரக தோஷ நிவர்த்திக்கு என்ன பரிகாரம் அல்லது தானம் செய்ய வேண்டும்?',
  ],
  English: [
    '🔮 What do planetary transits say for me in 2026?',
    '❤️ When will I meet my compatible life partner?',
    '💼 When is the best time for a career change or promotion?',
    '✨ What is my lucky gemstone, rudraksha & daily mantra?',
    '🪐 Am I currently running Shani Sade Sati or Rahu Mahadasha?',
    '🙏 What specific Vedic remedies or charity should I perform?',
  ],
};

const PLACEHOLDERS_BY_LANG: Record<string, string> = {
  Telugu: 'మీ కుండలి, ప్రేమ, కెరీర్ లేదా పరిహారాల గురించి అడగండి...',
  Hindi: 'अपनी कुंडली, प्रेम, करियर या उपायों के बारे में पूछें...',
  Tamil: 'உங்கள் ஜாதகம், தொழில், திருமணம் அல்லது பரிகாரங்கள் பற்றி கேளுங்கள்...',
  English: 'Ask about your Kundli, love, career, or remedies...',
};

const LANGUAGES = [
  { code: 'Telugu', label: 'తెలుగు (Telugu)', short: 'తె' },
  { code: 'Hindi', label: 'हिन्दी (Hindi)', short: 'हि' },
  { code: 'English', label: 'English', short: 'Eng' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)', short: 'த' },
];

function renderFormattedMessageContent(rawContent: string, isUser: boolean) {
  if (!rawContent) return null;

  // Defensive safety: If assistant message content is a JSON object string (e.g. {"Ajay Kumar": ...})
  let textToFormat = rawContent;
  if (!isUser && rawContent.trim().startsWith('{') && rawContent.trim().endsWith('}')) {
    try {
      const obj = JSON.parse(rawContent.trim());
      if (obj.reply && typeof obj.reply === 'string') {
        textToFormat = obj.reply;
      } else if (obj.conclusion && typeof obj.conclusion === 'string') {
        textToFormat = obj.conclusion;
      } else {
        textToFormat = Object.entries(obj)
          .map(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
              const inner = Object.entries(v)
                .map(([ik, iv]) => `${ik}: ${iv}`)
                .join(', ');
              return `**${k}** (${inner})`;
            }
            return `**${k}**: ${v}`;
          })
          .join('\n\n');
      }
    } catch {}
  }

  // 1. Normalize line endings
  const cleaned = textToFormat
    .replace(/\r\n/g, '\n')
    // Remove empty markdown headers with no text following
    .replace(/^#+\s*$/gm, '')
    // Ensure headings have clean line spacing
    .replace(/([^\n])\n(###?\s+)/g, '$1\n\n$2')
    // Strip redundant protocol/confidence headings if they leaked into text
    .replace(/###?\s*[\u{1F300}-\u{1F9FF}\s]*(?:48[- ]?Day|Parihar Protocol|Sacred Mandala|Astrological Confidence|Confidence)[^\n]*/giu, '')
    .replace(/###?\s*[\u{1F300}-\u{1F9FF}\s]*(?:48[- ]?రోజుల|పరిహార ప్రోటోకాల్|జ్యోతిష్య నమ్మకం|ఆత్మవిశ్వాసం)[^\n]*/giu, '')
    .trim();

  // Split into paragraphs / blocks
  const rawBlocks = cleaned
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  // Filter out any consecutive empty headers that have no text between them
  const blocks: string[] = [];
  for (let i = 0; i < rawBlocks.length; i++) {
    const curr = rawBlocks[i];
    const isHeading = /^#+\s+/.test(curr);
    if (isHeading) {
      const lines = curr.split('\n').filter(Boolean);
      // If curr itself has multiple stacked headings with no content:
      if (lines.length > 1 && lines.every((l) => /^#+\s+/.test(l.trim()))) {
        continue;
      }
      // If single heading but next block is also a heading:
      if (i + 1 < rawBlocks.length && /^#+\s+/.test(rawBlocks[i + 1])) {
        continue;
      }
    }
    blocks.push(curr);
  }

  return (
    <div className="space-y-2 text-xs sm:text-sm font-sans">
      {blocks.map((block, idx) => {
        // Heading block
        if (block.startsWith('### ') || block.startsWith('## ') || block.startsWith('# ')) {
          const headingText = block.replace(/^#+\s+/, '').trim();
          if (!headingText) return null;
          return (
            <h4
              key={idx}
              className="text-xs font-bold text-[#713B32] mt-3 pt-2 border-t border-[#E5D9C8]/60 first:mt-0 first:border-0 first:pt-0"
            >
              {headingText}
            </h4>
          );
        }

        // List block or regular paragraph
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

        if (
          lines.length > 1 &&
          lines.every(
            (l) => l.startsWith('•') || l.startsWith('-') || /^\d+[\.\)]/.test(l)
          )
        ) {
          return (
            <ul key={idx} className="space-y-1.5 pl-1 my-1.5">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[•\-\d\.\)]\s*/, '').trim();
                return (
                  <li key={lIdx} className="flex items-start gap-1.5 text-xs leading-relaxed">
                    <span className="text-[#C9952B] font-bold shrink-0">•</span>
                    <span>
                      {cleanLine.split('**').map((chunk, j) =>
                        j % 2 === 1 ? (
                          <strong
                            key={j}
                            className={isUser ? 'text-[#FFEBB3]' : 'text-[#713B32]'}
                          >
                            {chunk}
                          </strong>
                        ) : (
                          chunk
                        )
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-xs leading-relaxed whitespace-pre-line">
            {block.split('**').map((chunk, j) =>
              j % 2 === 1 ? (
                <strong
                  key={j}
                  className={isUser ? 'text-[#FFEBB3]' : 'text-[#713B32]'}
                >
                  {chunk}
                </strong>
              ) : (
                chunk
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function AIChatSidebar() {
  const pathname = usePathname();
  const { user, userData } = useUserData();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Active Navigation Tab: 'chat' | 'profile' | 'compare' | 'timeline'
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'compare' | 'timeline'>('chat');
  const [activeAstrologer, setActiveAstrologer] = useState<AIAstrologer | null>(null);
  const [userProfile, setUserProfile] = useState<PersonalAstrologyProfile | null>(null);
  const [yearComparison, setYearComparison] = useState<YearComparisonOutlook[]>([]);
  const [selectedCompareYear, setSelectedCompareYear] = useState<number>(new Date().getFullYear());
  const [timelineMilestones, setTimelineMilestones] = useState<TimelineMilestone[]>([]);

  // Dynamic Pricing & Wallet
  const [pricePerPrompt, setPricePerPrompt] = useState<number>(5);
  const [currentWallet, setCurrentWallet] = useState<number>(0);

  // Prediction Outcome Verification State
  const [pendingVerification, setPendingVerification] = useState<any>(null);
  const [verificationSubmitted, setVerificationSubmitted] = useState<boolean>(false);

  // Centered Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: 'primary' | 'warning' | 'danger' | 'info';
    action?: () => void;
  }>({ isOpen: false, title: '', description: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Exclude floating button on active call rooms, admin panels, and all AI platform dashboard routes
  const isExcluded =
    pathname?.startsWith('/call/') ||
    pathname?.startsWith('/ai-call/') ||
    pathname?.startsWith('/admin-panel') ||
    pathname?.startsWith('/astrologer-dashboard') ||
    pathname?.startsWith('/aiastro') ||
    pathname?.startsWith('/admin-dashboard') ||
    pathname?.startsWith('/ai-operations') ||
    pathname?.startsWith('/application-management') ||
    pathname?.startsWith('/audit-logs') ||
    pathname?.startsWith('/candidate-management') ||
    pathname?.startsWith('/candidates') ||
    pathname?.startsWith('/discovery-campaign-management') ||
    pathname?.startsWith('/discovery-jobs') ||
    pathname?.startsWith('/enrolment') ||
    pathname?.startsWith('/human-review-module') ||
    pathname?.startsWith('/outreach') ||
    pathname?.startsWith('/probation') ||
    pathname?.startsWith('/reports') ||
    pathname?.startsWith('/search-history') ||
    pathname?.startsWith('/search-sources') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/users-roles') ||
    pathname?.startsWith('/verification');

  // Close chat drawer on route change so it never lingers over newly opened pages
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Broadcast when chat drawer opens so conflicting modals hide
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-chat-opened'));
    }
  }, [isOpen]);

  // Global event listeners to close or open with dedicated astrologer
  useEffect(() => {
    const handleClose = () => {
      setIsOpen(false);
    };

    const handleOpen = (e?: any) => {
      const targetAstro = e?.detail?.astrologer;
      if (targetAstro) {
        setActiveAstrologer(targetAstro);
        // Start fresh consultation with target astrologer, hiding previous astrologer's chat
        const welcomeName = userData?.name || user?.displayName || 'Devotee';
        setMessages([
          {
            id: `welcome-${targetAstro.id}-${Date.now()}`,
            role: 'assistant',
            content: `**Namaste and blessings, ${welcomeName}!** 🙏\n\nI am **${targetAstro.name}**, your specialized ${targetAstro.primaryDiscipline} guide. How may I assist your questions today?`,
            timestamp: new Date().toISOString(),
            recommendations: targetAstro.specialities?.slice(0, 4) || DEFAULT_RECOMMENDATIONS,
          },
        ]);
      }
      setIsOpen(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ai-chat-opened'));
      }
    };

    window.addEventListener('close-ai-chat-sidebar', handleClose);
    window.addEventListener('open-ai-chat-sidebar', handleOpen);
    return () => {
      window.removeEventListener('close-ai-chat-sidebar', handleClose);
      window.removeEventListener('open-ai-chat-sidebar', handleOpen);
    };
  }, [user, userData]);

  // Sync wallet balance
  useEffect(() => {
    if (userData?.walletBalance !== undefined) {
      setCurrentWallet(Number(userData.walletBalance) || 0);
    }
  }, [userData]);

  // Derive Personal Profile, Year Comparison, and Timeline
  useEffect(() => {
    const dob = userData?.dob || (user ? '1995-05-15' : null);
    if (dob) {
      try {
        const chart = calculateBirthChartData(
          dob,
          userData?.tob || '12:00 PM',
          userData?.pob || 'New Delhi, India',
          userData?.lat,
          userData?.lon,
          userData?.name || user?.displayName || 'Devotee',
          userData?.gender || 'Devotee'
        );
        setUserProfile(generatePersonalAstrologyProfile(chart));
        setYearComparison(generateYearComparison(chart, new Date().getFullYear(), 4));
        setTimelineMilestones(generateInteractiveTimeline(chart));
      } catch (err) {
        console.warn('Sidebar chart derivation error:', err);
      }
    }
  }, [userData, user]);

  // Fetch dynamic price and pending predictions from backend
  useEffect(() => {
    async function fetchPricing() {
      try {
        const queryUrl = `/api/ai-chat${user?.uid ? `?userId=${user.uid}` : ''}`;
        const res = await fetch(queryUrl);
        if (res.ok) {
          const data = await res.json();
          if (data?.pricePerPrompt !== undefined) {
            setPricePerPrompt(Number(data.pricePerPrompt));
          }
          if (data?.pendingPrediction) {
            setPendingVerification(data.pendingPrediction);
          }
        }
      } catch (err) {
        console.warn('Could not fetch AI chat pricing:', err);
      }
    }
    fetchPricing();
  }, [isOpen, user?.uid]);

  const handleVerifyOutcome = async (predictionId: string, outcome: string) => {
    if (!user?.uid) return;
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          predictionId,
          outcome,
        }),
      });
      if (res.ok) {
        setVerificationSubmitted(true);
        toast.success('Thank you! Your outcome verification has been saved to AstroParihar Jyotish records.');
      }
    } catch (err) {
      console.warn('Could not verify prediction outcome:', err);
    }
  };

  // Load chat from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('astroparihar_floating_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read chat history from storage:', e);
    }

    // Default welcome message with 6 recommendations
    const welcomeName = userData?.name || user?.displayName || 'Devotee';
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `**Namaste and blessings, ${welcomeName}!** 🙏\n\nI am **Acharya Parihar**, your personal Vedic Astrologer & spiritual guide. Ask me any question about your **Kundli, career, marriage, finances, planetary dashas, or daily remedies** for ${new Date().getFullYear()}. How may I guide your chart today?`,
        timestamp: new Date().toISOString(),
        recommendations: DEFAULT_RECOMMENDATIONS,
      },
    ]);
  }, [user, userData]);

  // Save messages to storage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('astroparihar_floating_chat', JSON.stringify(messages.slice(-25)));
      } catch (e) {
        console.warn('Could not persist chat:', e);
      }
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && user && currentWallet >= pricePerPrompt) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, user, currentWallet, pricePerPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    if (!user) {
      setAlertModal({
        isOpen: true,
        title: 'Sign In to Consult',
        description: `Please sign in to ask Acharya Parihar. Each consultation prompt costs ₹${pricePerPrompt} from your wallet.`,
        confirmText: 'Sign In Now',
        variant: 'primary',
        action: () => {
          window.location.href = `/sign-up-login-screen?redirect=${encodeURIComponent(pathname || '/')}`;
        },
      });
      return;
    }

    if (currentWallet < pricePerPrompt) {
      setAlertModal({
        isOpen: true,
        title: 'Insufficient Wallet Balance',
        description: `Each prompt costs ₹${pricePerPrompt}, but your available wallet balance is ₹${currentWallet.toFixed(2)}. Please recharge your wallet to continue.`,
        confirmText: 'Recharge Wallet',
        variant: 'warning',
        action: () => {
          window.location.href = '/wallet';
        },
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const userInfo = {
        name: userData?.name || user?.displayName || 'Devotee',
        gender: userData?.gender || '',
        dob: userData?.dob || '',
        tob: userData?.tob || '',
        pob: userData?.pob || '',
      };

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: user.uid,
          userInfo,
          language,
          astrologerId: activeAstrologer?.id,
          persona: activeAstrologer?.name,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        if (data?.isInsufficient) {
          setCurrentWallet(Number(data.availableBalance) || 0);
        }
        throw new Error(
          data?.error ||
          (response.status === 404
            ? 'The AI Astrologer service is currently updating. Please try again in a few moments.'
            : 'Unable to receive guidance at this moment. Please try again.')
        );
      }

      // Update remaining wallet balance
      if (data.newBalance !== undefined) {
        setCurrentWallet(Number(data.newBalance));
      }

      if (data.pendingVerification) {
        setPendingVerification(data.pendingVerification);
      }

      if (data.profile) {
        setUserProfile(data.profile);
      }
      if (data.yearComparison) {
        setYearComparison(data.yearComparison);
      }
      if (data.timeline) {
        setTimelineMilestones(data.timeline);
      }

      if (data.message) {
        const assistantMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message.content,
          timestamp: data.message.timestamp || new Date().toISOString(),
          recommendations:
            data.recommendations || data.message.recommendations || DEFAULT_RECOMMENDATIONS,
          structured: data.message.structured || data.structured || undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `*Om Shanti.* ${err.message || 'We encountered a cosmic disturbance. Please ask again.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const executeClearChat = () => {
    const welcomeName = userData?.name || user?.displayName || 'Devotee';
    const initial: ChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `**Namaste, ${welcomeName}!** 🙏\n\nYour consultation session has been refreshed. What astrological inquiry would you like to explore?`,
        timestamp: new Date().toISOString(),
        recommendations: DEFAULT_RECOMMENDATIONS,
      },
    ];
    setMessages(initial);
    localStorage.removeItem('astroparihar_floating_chat');
    setShowClearConfirm(false);
  };

  const handleAskQuestionFromWidget = (questionText: string) => {
    setActiveTab('chat');
    handleSendMessage(questionText);
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isExcluded) {
    return null;
  }

  const isLowBalance = Boolean(user && currentWallet < pricePerPrompt);

  return (
    <>
      {/* 1. FLOATING ROUND CTA BUTTON (Visible across all routes in bottom-right) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-3">
        {/* Tooltip on Desktop */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="hidden md:flex items-center gap-2 bg-[#FFFDFC] text-[#292522] px-3.5 py-2 rounded-2xl border border-[#E5D9C8] shadow-xl text-xs font-bold pointer-events-none"
            >
              <Sparkles size={13} className="text-[#C9952B]" />
              <span>Ask AI Astrologer • ₹{pricePerPrompt}/prompt</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Round Floating Action Button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-[#713B32] via-[#8E4C41] to-[#C9952B] text-white flex items-center justify-center shadow-[0_8px_30px_rgba(113,59,50,0.45)] border-2 border-[#E5D9C8]/40 hover:shadow-[0_12px_36px_rgba(201,149,43,0.55)] transition-all cursor-pointer group"
          aria-label="Open AI Astrology Chat"
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#C9952B]/30 animate-pulse -z-10 group-hover:bg-[#C9952B]/45" />

          {/* Active Online Indicator Dot */}
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#FFFDFC] shadow-sm flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>

          {/* Inner Icon */}
          <div className="relative flex flex-col items-center justify-center">
            <Bot size={26} className="text-white drop-shadow group-hover:rotate-6 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-tighter text-[#FFEBB3] -mt-0.5">
              AI CHAT
            </span>
          </div>
        </motion.button>
      </div>

      {/* 2. SLIDE-IN AI CHAT DRAWER / SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex justify-end">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Sidebar Content Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full sm:w-[420px] h-full bg-[#FFFDFC] text-[#292522] shadow-2xl flex flex-col border-l border-[#E5D9C8] z-10"
            >
              {/* Drawer Header */}
              <div className="p-4 bg-gradient-to-r from-[#713B32] via-[#8E4C41] to-[#552B24] text-[#FFFDFC] flex items-center justify-between border-b border-[#E5D9C8] shadow-sm">
                {/* Astrologer Identity */}
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#C9952B] shadow-md flex-shrink-0">
                    <AppImage
                      src={activeAstrologer?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300"}
                      alt={activeAstrologer?.name || "Acharya Parihar"}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-[#FFFDFC]">
                        {activeAstrologer?.name || "Acharya Parihar"}
                      </h3>
                      <ShieldCheck size={14} className="text-[#FFEBB3]" />
                    </div>
                    <p className="text-[10px] text-[#F3EBDD] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {activeAstrologer?.primaryDiscipline
                        ? `${activeAstrologer.primaryDiscipline} AI Astrologer • 24/7 Active`
                        : "Vedic AI Astrologer • 24/7 Active"}
                    </p>
                  </div>
                </div>

                {/* Header Actions: Language, Clear, Close */}
                <div className="flex items-center gap-1">
                  {/* Language Selector Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLangDropdownOpen((prev) => !prev)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-[#FFFDFC] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Select Language"
                    >
                      <Languages size={13} />
                      <span>{LANGUAGES.find((l) => l.code === language)?.short || language.slice(0, 3)}</span>
                      <ChevronDown size={12} />
                    </button>

                    <AnimatePresence>
                      {langDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute right-0 top-full mt-1.5 w-40 bg-[#FFFDFC] rounded-xl shadow-xl border border-[#E5D9C8] py-1 text-xs text-[#292522] z-50 overflow-hidden"
                        >
                          {LANGUAGES.map((l) => (
                            <button
                              key={l.code}
                              type="button"
                              onClick={() => {
                                setLanguage(l.code);
                                setLangDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-[#F8F3EA] transition-colors ${
                                language === l.code ? 'text-[#713B32] bg-[#EDE4D5]/40 font-bold' : ''
                              }`}
                            >
                              <span>{l.label}</span>
                              {language === l.code && <span className="text-[#C9952B]">✓</span>}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Refresh / Clear Chat */}
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="p-2 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Clear Chat History"
                  >
                    <RotateCcw size={15} />
                  </button>

                  {/* Close / Minimize */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Close Sidebar"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Dynamic Wallet Balance & Pricing Bar */}
              <div className="px-4 py-2.5 bg-[#F8F3EA] border-b border-[#E5D9C8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#713B32]/10 text-[#713B32] flex items-center justify-center">
                    <Wallet size={13} />
                  </div>
                  {user ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#6B5E55] font-medium">Balance:</span>
                      <span
                        className={`font-extrabold ${
                          isLowBalance ? 'text-rose-600' : 'text-[#713B32]'
                        }`}
                      >
                        ₹{currentWallet.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#6B5E55] font-medium">Guest Devotee</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#FFFDFC] border border-[#E5D9C8] text-[11px] font-bold text-[#C9952B]">
                    ⚡ ₹{pricePerPrompt} / prompt
                  </span>
                  {user ? (
                    <Link
                      href="/wallet"
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] font-bold text-[#713B32] hover:text-[#C9952B] underline flex items-center gap-0.5"
                    >
                      Recharge <ArrowUpRight size={11} />
                    </Link>
                  ) : (
                    <Link
                      href="/sign-up-login-screen"
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] font-bold text-[#713B32] hover:text-[#C9952B] underline flex items-center gap-0.5"
                    >
                      Sign In <LogIn size={11} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Prediction Outcome Verification Banner (Did it work?) */}
              {pendingVerification && !verificationSubmitted && user && (
                <div className="mx-3 my-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#C9952B]/10 to-[#713B32]/10 border border-[#C9952B]/40 shadow-xs text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#713B32] flex items-center gap-1.5 text-[11px]">
                      <Sparkles size={13} className="text-[#C9952B]" />
                      Astrological Outcome Verification
                    </span>
                    <button
                      type="button"
                      onClick={() => setVerificationSubmitted(true)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="text-[#292522] text-[11px] leading-snug">
                    Acharya Parihar previously indicated a milestone for <strong>{pendingVerification.topic}</strong> around <em>{pendingVerification.targetPeriod}</em>. Did this event manifest in your life?
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleVerifyOutcome(pendingVerification.id, 'verified_accurate')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      ✓ Yes, Accurately
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyOutcome(pendingVerification.id, 'partially_accurate')}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      ⚡ Partially
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyOutcome(pendingVerification.id, 'inaccurate')}
                      className="px-2.5 py-1 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      ✕ Not Yet
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation: Chat | Profile | Compare Years | Timeline */}
              <div className="flex items-center border-b border-[#E5D9C8] bg-[#FDFBF7] text-xs font-semibold px-2 py-1.5 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-[#713B32] text-white shadow-xs font-bold'
                      : 'text-[#6B5E55] hover:bg-[#E5D9C8]/40'
                  }`}
                >
                  <Bot size={13} />
                  <span>Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-[#713B32] text-white shadow-xs font-bold'
                      : 'text-[#6B5E55] hover:bg-[#E5D9C8]/40'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('compare')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'compare'
                      ? 'bg-[#713B32] text-white shadow-xs font-bold'
                      : 'text-[#6B5E55] hover:bg-[#E5D9C8]/40'
                  }`}
                >
                  <Calendar size={13} />
                  <span>Compare</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'bg-[#713B32] text-white shadow-xs font-bold'
                      : 'text-[#6B5E55] hover:bg-[#E5D9C8]/40'
                  }`}
                >
                  <Compass size={13} />
                  <span>Timeline</span>
                </button>
              </div>

              {/* Messages Scroll Area */}
              {activeTab === 'chat' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FDFBF7]">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar for AI */}
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#713B32] to-[#C9952B] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          <Bot size={14} />
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`relative max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-[#713B32] text-white rounded-tr-xs font-medium'
                            : 'bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] rounded-tl-xs'
                        }`}
                      >
                        {/* Astrological Confidence Badge for AI Responses */}
                        {!isUser && m.structured?.confidence && (
                          <div className="mb-2.5 flex items-center justify-between gap-2 pb-2 border-b border-[#E5D9C8]">
                            <div className="flex items-center gap-1.5">
                              {m.structured.confidence === 'Strong' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 font-extrabold text-[10px]">
                                  <CheckCircle2 size={11} className="text-emerald-600" />
                                  Astrology Confidence: Strong
                                </span>
                              ) : m.structured.confidence === 'Moderate' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 font-extrabold text-[10px]">
                                  <Compass size={11} className="text-amber-600" />
                                  Astrology Confidence: Moderate
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-800 font-extrabold text-[10px]">
                                  <AlertTriangle size={11} className="text-rose-600" />
                                  Astrology Confidence: Mixed
                                </span>
                              )}
                            </div>
                            {m.structured.confidenceRationale && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={m.structured.confidenceRationale}>
                                {m.structured.confidenceRationale}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Text Content */}
                        <div className="space-y-1.5 font-sans">
                          {renderFormattedMessageContent(m.content, isUser)}
                        </div>

                        {/* 48-Day Sacred Mandala Parihar Protocol Card */}
                        {!isUser && m.structured?.pariharProtocol && (
                          <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-[#F8F3EA] to-[#EDE4D5]/60 border border-[#C9952B]/40 shadow-xs space-y-2">
                            <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-[#713B32]">
                              <span className="flex items-center gap-1.5">
                                <Flame size={13} className="text-[#C9952B]" />
                                48-Day Sacred Mandala Protocol
                              </span>
                              <span className="text-[10px] font-bold text-[#C9952B] px-1.5 py-0.5 rounded bg-white/70 border border-[#C9952B]/30">
                                48 Days (మండలం)
                              </span>
                            </div>

                            <p className="text-[11px] text-[#292522] font-semibold">
                              {m.structured.pariharProtocol.title}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                              <div className="p-1.5 rounded-lg bg-white/80 border border-[#E5D9C8]">
                                <span className="text-muted-foreground block text-[9px]">Prescribed Homam:</span>
                                <strong className="text-[#713B32] truncate block">{m.structured.pariharProtocol.recommendedHomam}</strong>
                                <span className="text-[9px] text-[#C9952B] block">Day: {m.structured.pariharProtocol.homamAuspiciousDay}</span>
                              </div>
                              <div className="p-1.5 rounded-lg bg-white/80 border border-[#E5D9C8]">
                                <span className="text-muted-foreground block text-[9px]">Daily Mantra Japa:</span>
                                <strong className="text-[#713B32] truncate block" title={m.structured.pariharProtocol.dailyMantra}>
                                  {m.structured.pariharProtocol.dailyMantra}
                                </strong>
                                <span className="text-[9px] text-emerald-700 block">108 recitations at Sunrise</span>
                              </div>
                            </div>

                            {/* 3 Milestones */}
                            <div className="pt-1.5 border-t border-[#E5D9C8] space-y-1 text-[10px] text-[#6B5E55]">
                              <div className="flex items-start gap-1.5">
                                <span className="font-bold text-[#713B32] shrink-0">Day 1:</span>
                                <span>{m.structured.pariharProtocol.initiationDay1?.action}</span>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <span className="font-bold text-[#C9952B] shrink-0">Day 24:</span>
                                <span>{m.structured.pariharProtocol.midMandalaMilestoneDay24?.charityDaana}</span>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <span className="font-bold text-emerald-700 shrink-0">Day 48:</span>
                                <span>{m.structured.pariharProtocol.culminationDay48?.action}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Human Astrologer Escalation Card */}
                        {!isUser && (m.structured?.needsAstrologerReview || m.structured?.confidence === 'Mixed') && (
                          <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-[#713B32]/10 via-[#C9952B]/10 to-transparent border border-[#C9952B]/50 shadow-sm space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#713B32]">
                              <ShieldCheck size={14} className="text-[#C9952B]" />
                              <span>Senior Astrologer Review Recommended</span>
                            </div>
                            <p className="text-[11px] text-[#292522] leading-snug">
                              {m.structured?.escalationReason ||
                                'This inquiry involves intricate planetary tensions between your active Dasha period and key houses. Direct verification with an AstroParihar Senior Astrologer is recommended.'}
                            </p>
                            <Link
                              href="/talk-to-astrologer"
                              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl gold-gradient-bg text-white font-bold text-xs shadow-md hover:brightness-105 transition-all cursor-pointer"
                            >
                              <span>Consult Senior Vedic Astrologer</span>
                              <ArrowUpRight size={13} />
                            </Link>
                          </div>
                        )}

                        {/* Timestamp & Sound Readout */}
                        <div
                          className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px] ${
                            isUser ? 'border-white/20 text-white/70' : 'border-[#E5D9C8] text-[#6B5E55]'
                          }`}
                        >
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => speakText(m.content)}
                              className="inline-flex items-center gap-1 hover:text-[#713B32] transition-colors cursor-pointer"
                              title="Listen to Astrologer Voice"
                            >
                              {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                              <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                            </button>
                          )}
                        </div>

                        {/* 5-6 Contextual Recommendations per Response */}
                        {!isUser && (
                          <div className="mt-3 pt-2.5 border-t border-[#E5D9C8] space-y-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#713B32]">
                              <Sparkles size={11} className="text-[#C9952B]" />
                              <span>Recommended Inquiries:</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5">
                              {(m.recommendations && m.recommendations.length > 0
                                ? m.recommendations
                                : DEFAULT_RECOMMENDATIONS
                              )
                                .slice(0, 6)
                                .map((rec, rIdx) => (
                                  <button
                                    key={rIdx}
                                    type="button"
                                    onClick={() => handleSendMessage(rec)}
                                    disabled={Boolean(loading || !user || isLowBalance)}
                                    className="w-full text-left px-3 py-2 rounded-xl bg-[#F8F3EA] hover:bg-[#EDE4D5] text-[#292522] hover:text-[#713B32] border border-[#E5D9C8] text-xs font-semibold transition-all hover:translate-x-0.5 active:scale-[0.99] disabled:opacity-40 cursor-pointer shadow-xs flex items-center justify-between group"
                                  >
                                    <span className="leading-snug">{rec}</span>
                                    <span className="text-[#C9952B] font-bold text-xs shrink-0 pl-2 group-hover:translate-x-1 transition-transform">
                                      →
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="w-7 h-7 rounded-xl bg-[#EDE4D5] text-[#713B32] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          <User size={14} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Typing Indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-xs text-[#6B5E55] bg-[#FFFDFC] border border-[#E5D9C8] rounded-2xl px-4 py-3 w-fit shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#713B32] to-[#C9952B] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles size={12} className="animate-spin" />
                    </div>
                    <span className="font-semibold text-[#713B32]">
                      {activeAstrologer?.name || 'Acharya Parihar'} is examining your cosmic alignments...
                    </span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
              )}

              {/* 2. PERSONAL ASTROLOGY PROFILE VIEW (ITEM 4) */}
              {activeTab === 'profile' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FDFBF7]">
                  {userProfile ? (
                    <div className="space-y-3.5">
                      {/* Identity Card */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#713B32] to-[#8E4C41] text-white shadow-md space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm flex items-center gap-1.5 text-[#FFEBB3]">
                            <Sparkles size={15} /> {userData?.name || user?.displayName || 'Devotee'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                            Lagna: {userProfile.personality.ascendant}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="bg-black/20 p-2 rounded-xl">
                            <span className="text-white/70 block text-[9px] uppercase font-semibold">Chandra Rashi</span>
                            <strong className="text-[#FFEBB3]">{userProfile.personality.moonSign}</strong>
                          </div>
                          <div className="bg-black/20 p-2 rounded-xl">
                            <span className="text-white/70 block text-[9px] uppercase font-semibold">Nakshatra</span>
                            <strong className="text-[#FFEBB3]">{userProfile.personality.moonNakshatra}</strong>
                          </div>
                        </div>
                        {userProfile.spirituality && (
                          <div className="bg-black/30 p-2.5 rounded-xl text-[10px] flex items-center justify-between">
                            <div>
                              <span className="text-white/70 block text-[9px]">Verified Ishta Devata:</span>
                              <strong className="text-emerald-300 font-bold">{userProfile.spirituality.ishtaDevataName}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAskQuestionFromWidget(`Who is my Ishta Devata and what is my sacred mantra?`)}
                              className="px-2.5 py-1 rounded-lg bg-[#C9952B] hover:bg-[#B28224] text-white font-bold text-[9px] transition-all cursor-pointer"
                            >
                              Ask Deity
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 10th House: Career & Karma */}
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E5D9C8] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#713B32] flex items-center gap-1.5 text-xs">
                            <Briefcase size={14} className="text-[#C9952B]" /> 10th House: Career & Karma Sthana
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F3EA] text-[#713B32]">
                            Lord: {userProfile.career.tenthHouseLord}
                          </span>
                        </div>
                        <p className="text-[#292522] text-[11px] leading-relaxed">
                          {userProfile.career.professionalPotential}
                        </p>
                        <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
                          {userProfile.career.careerYogas.map((yoga, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#EDE4D5]/60 text-[#713B32] font-semibold">
                              {yoga}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAskQuestionFromWidget(`What are the key career milestones and promotion timing indicated by my 10th house?`)}
                          className="w-full mt-1.5 py-1.5 rounded-xl bg-[#F8F3EA] hover:bg-[#EDE4D5] text-[#713B32] font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Ask About My Career</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* 2nd & 11th House: Wealth & Finance */}
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E5D9C8] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#713B32] flex items-center gap-1.5 text-xs">
                            <TrendingUp size={14} className="text-[#C9952B]" /> 2nd & 11th House: Wealth & Gains
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Dhana Bhavas
                          </span>
                        </div>
                        <p className="text-[#292522] text-[11px] leading-relaxed">
                          {userProfile.finance.dhanaStrength}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAskQuestionFromWidget(`What does my birth chart say about wealth accumulation, investments, and debt clearance?`)}
                          className="w-full mt-1.5 py-1.5 rounded-xl bg-[#F8F3EA] hover:bg-[#EDE4D5] text-[#713B32] font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Ask About My Finances</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* 7th House & D9: Marriage & Partnerships */}
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E5D9C8] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#713B32] flex items-center gap-1.5 text-xs">
                            <Heart size={14} className="text-rose-500" /> 7th House & D9 Navamsha: Marriage
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                            Kalatra Sthana
                          </span>
                        </div>
                        <p className="text-[#292522] text-[11px] leading-relaxed">
                          {userProfile.marriage.maritalDisposition}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAskQuestionFromWidget(`When is my favorable marriage timing window and partner compatibility alignment?`)}
                          className="w-full mt-1.5 py-1.5 rounded-xl bg-[#F8F3EA] hover:bg-[#EDE4D5] text-[#713B32] font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Ask About Marriage</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* 6th House: Health & Vitality */}
                      <div className="p-3.5 rounded-2xl bg-white border border-[#E5D9C8] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#713B32] flex items-center gap-1.5 text-xs">
                            <Activity size={14} className="text-emerald-600" /> 6th House: Health & Immunity
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Roga Sthana
                          </span>
                        </div>
                        <p className="text-[#292522] text-[11px] leading-relaxed">
                          {userProfile.health.vitalityLevel}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAskQuestionFromWidget(`What planetary remedies or Ayurvedic upayas are recommended for my health in ${new Date().getFullYear()}?`)}
                          className="w-full mt-1.5 py-1.5 rounded-xl bg-[#F8F3EA] hover:bg-[#EDE4D5] text-[#713B32] font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Ask About Health</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* Active Vimshottari Dasha */}
                      <div className="p-3.5 rounded-2xl bg-[#EDE4D5]/40 border border-[#C9952B]/40 space-y-2 text-xs">
                        <h4 className="font-bold text-[#713B32] flex items-center gap-1.5 text-xs">
                          <Clock size={14} className="text-[#C9952B]" /> Active Vimshottari Dasha Cycle
                        </h4>
                        <div className="p-2 rounded-xl bg-white border border-[#E5D9C8] text-[11px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mahadasha:</span>
                            <strong className="text-[#713B32]">{userProfile.activeDasha.mahadasha}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Antardasha:</span>
                            <strong className="text-[#C9952B]">{userProfile.activeDasha.antardasha}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pratyantardasha:</span>
                            <strong className="text-emerald-700">{userProfile.activeDasha.pratyantardasha}</strong>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#6B5E55]">
                          Active Window: {userProfile.activeDasha.currentPeriod}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-3 bg-white rounded-2xl border border-[#E5D9C8]">
                      <Sparkles size={28} className="text-[#C9952B] mx-auto" />
                      <h4 className="font-bold text-sm text-[#713B32]">Complete Your Birth Details</h4>
                      <p className="text-xs text-[#6B5E55]">
                        To generate your full personal astrology profile with 10th house career, wealth, and marriage timings, tell Acharya Parihar your birth date, time, and place in chat!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('chat')}
                        className="px-4 py-2 rounded-xl bg-[#713B32] text-white font-bold text-xs"
                      >
                        Go to Chat
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. INTERACTIVE COMPARE YEARS MATRIX (ITEM 11) */}
              {activeTab === 'compare' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FDFBF7]">
                  {yearComparison && yearComparison.length > 0 ? (
                    <div className="space-y-3.5">
                      <div className="text-center space-y-1">
                        <h3 className="font-extrabold text-sm text-[#713B32] flex items-center justify-center gap-1.5">
                          <BarChart3 size={15} className="text-[#C9952B]" /> Multi-Year Astrological Matrix
                        </h3>
                        <p className="text-[11px] text-[#6B5E55]">
                          Year-by-year planetary ratings & Vimshottari Dasha trajectory
                        </p>
                      </div>

                      {/* Year Selector Tabs */}
                      <div className="grid grid-cols-4 gap-1.5 bg-[#EDE4D5]/60 p-1.5 rounded-2xl border border-[#E5D9C8]">
                        {yearComparison.map((item) => (
                          <button
                            key={item.year}
                            type="button"
                            onClick={() => setSelectedCompareYear(item.year)}
                            className={`py-2 rounded-xl text-center transition-all cursor-pointer ${
                              selectedCompareYear === item.year
                                ? 'bg-[#713B32] text-white font-extrabold shadow-sm scale-102'
                                : 'text-[#6B5E55] hover:bg-white/60 font-semibold'
                            }`}
                          >
                            <div className="text-xs">{item.year}</div>
                            <div className="text-[10px] opacity-80">
                              {Math.round((item.careerScore + item.financeScore + item.relationshipScore + item.healthScore) / 4)}%
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Detail for Selected Year */}
                      {(() => {
                        const curr = yearComparison.find((y) => y.year === selectedCompareYear) || yearComparison[0];
                        const overall = Math.round((curr.careerScore + curr.financeScore + curr.relationshipScore + curr.healthScore) / 4);
                        return (
                          <div className="p-4 rounded-2xl bg-white border border-[#E5D9C8] shadow-sm space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-[#E5D9C8]">
                              <div>
                                <h4 className="font-extrabold text-sm text-[#713B32]">
                                  Outlook for {curr.year}
                                </h4>
                                <span className="text-[10px] text-muted-foreground">
                                  Dasha: {curr.dashaCycle}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                                  {overall}/100 • {curr.opportunity}
                                </span>
                              </div>
                            </div>

                            {/* 4 Score Breakdown Cards */}
                            <div className="space-y-2.5">
                              {/* Career */}
                              <div className="p-2.5 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8]/80 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-[#713B32] flex items-center gap-1">
                                    <Briefcase size={12} className="text-[#C9952B]" /> Career & Authority
                                  </span>
                                  <strong className="text-[#713B32]">{curr.careerScore}/100 ({curr.careerOpportunity})</strong>
                                </div>
                                <div className="w-full bg-[#E5D9C8]/60 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-[#713B32] h-full rounded-full transition-all" style={{ width: `${curr.careerScore}%` }} />
                                </div>
                                <p className="text-[10px] text-[#292522] leading-tight pt-0.5">{curr.careerSummary}</p>
                              </div>

                              {/* Finance */}
                              <div className="p-2.5 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8]/80 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                                    <TrendingUp size={12} className="text-emerald-600" /> Wealth & Cash Flow
                                  </span>
                                  <strong className="text-emerald-800">{curr.financeScore}/100 ({curr.financeTrend})</strong>
                                </div>
                                <div className="w-full bg-[#E5D9C8]/60 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${curr.financeScore}%` }} />
                                </div>
                                <p className="text-[10px] text-[#292522] leading-tight pt-0.5">{curr.financeSummary}</p>
                              </div>

                              {/* Relationship */}
                              <div className="p-2.5 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8]/80 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-rose-800 flex items-center gap-1">
                                    <Heart size={12} className="text-rose-500" /> Love & Marriage
                                  </span>
                                  <strong className="text-rose-800">{curr.relationshipScore}/100 ({curr.relationshipStatus})</strong>
                                </div>
                                <div className="w-full bg-[#E5D9C8]/60 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${curr.relationshipScore}%` }} />
                                </div>
                                <p className="text-[10px] text-[#292522] leading-tight pt-0.5">{curr.relationshipSummary}</p>
                              </div>

                              {/* Health */}
                              <div className="p-2.5 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8]/80 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-[#6B5E55] flex items-center gap-1">
                                    <Activity size={12} className="text-emerald-600" /> Health & Vitality
                                  </span>
                                  <strong className="text-[#6B5E55]">{curr.healthScore}/100 ({curr.healthStatus})</strong>
                                </div>
                                <div className="w-full bg-[#E5D9C8]/60 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${curr.healthScore}%` }} />
                                </div>
                                <p className="text-[10px] text-[#292522] leading-tight pt-0.5">{curr.healthSummary}</p>
                              </div>
                            </div>

                            {/* Rationale & Action */}
                            <div className="pt-2 border-t border-[#E5D9C8] space-y-1.5 text-[10px]">
                              <p className="text-[#6B5E55]">
                                <strong className="text-[#713B32]">Astrological Reason:</strong> {curr.whyThisYear}
                              </p>
                              <p className="text-[#6B5E55]">
                                <strong className="text-[#C9952B]">Focal Action:</strong> {curr.focalRecommendation}
                              </p>
                            </div>

                            {/* Tap to Ask */}
                            <button
                              type="button"
                              onClick={() => handleAskQuestionFromWidget(`What specific transits and dasha alignments will shape my life in ${curr.year}?`)}
                              className="w-full mt-2 py-2 rounded-xl bg-[#713B32] hover:bg-[#552B24] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <Bot size={13} />
                              <span>Ask Acharya Parihar About {curr.year}</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-3 bg-white rounded-2xl border border-[#E5D9C8]">
                      <Calendar size={28} className="text-[#C9952B] mx-auto" />
                      <h4 className="font-bold text-sm text-[#713B32]">Multi-Year Outlook Ready</h4>
                      <p className="text-xs text-[#6B5E55]">
                        Ask any question in chat with your birth details to generate the complete 2026–2029 comparison matrix!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('chat')}
                        className="px-4 py-2 rounded-xl bg-[#713B32] text-white font-bold text-xs"
                      >
                        Go to Chat
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 4. VISUAL ASTROLOGY TIMELINE (ITEM 12) */}
              {activeTab === 'timeline' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FDFBF7]">
                  {timelineMilestones && timelineMilestones.length > 0 ? (
                    <div className="space-y-3.5">
                      <div className="text-center space-y-1">
                        <h3 className="font-extrabold text-sm text-[#713B32] flex items-center justify-center gap-1.5">
                          <Compass size={15} className="text-[#C9952B]" /> Dasha & Transit Timeline
                        </h3>
                        <p className="text-[11px] text-[#6B5E55]">
                          Chronological milestones & upcoming planetary transitions
                        </p>
                      </div>

                      <div className="space-y-3 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C9952B]/40">
                        {timelineMilestones.map((m) => (
                          <div
                            key={m.id}
                            className="relative p-3.5 rounded-2xl bg-white border border-[#E5D9C8] shadow-xs space-y-2 hover:border-[#C9952B] transition-all"
                          >
                            {/* Dot on Timeline */}
                            <span className="absolute -left-[19px] top-4 w-2.5 h-2.5 rounded-full bg-[#C9952B] border-2 border-white shadow-xs" />

                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-[#713B32]">{m.periodName}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  m.nature === 'Auspicious'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : m.nature === 'Transformational'
                                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                    : m.nature === 'Mixed'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {m.nature} • {m.category}
                              </span>
                            </div>

                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                              <Calendar size={11} className="text-[#C9952B]" />
                              <span>{m.startDate} – {m.endDate}</span>
                              <span className="ml-auto font-bold text-[#713B32]">Lord: {m.lord}</span>
                            </div>

                            <p className="text-[11px] text-[#292522] leading-snug">
                              {m.astrologicalSignificance}
                            </p>

                            <div className="p-2 rounded-xl bg-[#F8F3EA] border border-[#E5D9C8]/60 text-[10px] text-[#6B5E55]">
                              <strong className="text-[#713B32]">Recommended Upaya:</strong> {m.recommendedAction}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAskQuestionFromWidget(m.suggestedQuestion)}
                              className="w-full py-1.5 rounded-xl bg-[#EDE4D5]/60 hover:bg-[#EDE4D5] text-[#713B32] font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <span>{m.suggestedQuestion}</span>
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-3 bg-white rounded-2xl border border-[#E5D9C8]">
                      <Compass size={28} className="text-[#C9952B] mx-auto" />
                      <h4 className="font-bold text-sm text-[#713B32]">Timeline Ready</h4>
                      <p className="text-xs text-[#6B5E55]">
                        Start a conversation with your birth date to unlock your chronological Dasha timeline milestones!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('chat')}
                        className="px-4 py-2 rounded-xl bg-[#713B32] text-white font-bold text-xs"
                      >
                        Go to Chat
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Pre-filled Quick Suggestions Bar */}
              <div className="p-2.5 bg-[#F8F3EA] border-t border-[#E5D9C8] overflow-x-auto flex items-center gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <span className="text-[10px] uppercase font-bold text-[#713B32] shrink-0 pl-1">
                  Suggestions:
                </span>
                {(QUICK_PROMPTS_BY_LANG[language] || QUICK_PROMPTS_BY_LANG.English).map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={loading || !user || isLowBalance}
                    className="px-2.5 py-1 rounded-full bg-[#FFFDFC] hover:bg-[#EDE4D5] border border-[#E5D9C8] text-[11px] font-semibold text-[#292522] whitespace-nowrap shadow-xs transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area / Low Balance Alert / Sign In Prompt */}
              <div className="border-t border-[#E5D9C8] bg-[#FFFDFC]">
                {!user ? (
                  /* 1. Guest User Prompt */
                  <div className="p-4 bg-[#F8F3EA] text-center space-y-2">
                    <p className="text-xs text-[#6B5E55] font-medium">
                      Please sign in to ask Acharya Parihar. Each prompt costs{' '}
                      <strong className="text-[#713B32]">₹{pricePerPrompt}</strong> from your wallet.
                    </p>
                    <Link
                      href="/sign-up-login-screen"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-[#713B32] hover:bg-[#552B24] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <LogIn size={14} /> Sign In to Chat
                    </Link>
                  </div>
                ) : isLowBalance ? (
                  /* 2. Insufficient Balance Alert */
                  <div className="p-4 bg-rose-50/80 border-t border-rose-200 text-rose-900 space-y-2.5">
                    <div className="flex items-start gap-2.5 text-xs">
                      <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-rose-800">
                          Low Wallet Balance (Available: ₹{currentWallet.toFixed(2)})
                        </p>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          Each prompt requires <strong>₹{pricePerPrompt}</strong>. Please recharge your wallet to continue chatting.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/wallet"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2.5 rounded-xl bg-[#713B32] hover:bg-[#552B24] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      <Wallet size={14} /> ⚡ Recharge Wallet Now
                    </Link>
                  </div>
                ) : (
                  /* 3. Normal Active Input Form */
                  <div className="p-3.5">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={PLACEHOLDERS_BY_LANG[language] || PLACEHOLDERS_BY_LANG.English}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F8F3EA] border border-[#E5D9C8] text-xs text-[#292522] placeholder:text-[#6B5E55] outline-none focus:ring-2 focus:ring-[#C9952B]/60 transition-all font-medium"
                      />
                      <button
                        type="submit"
                        disabled={!inputText.trim() || loading}
                        className="w-10 h-10 rounded-2xl bg-[#713B32] hover:bg-[#552B24] disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                        aria-label="Send Question"
                      >
                        <Send size={16} />
                      </button>
                    </form>

                    <div className="flex items-center justify-between text-[10px] text-[#6B5E55] mt-2 px-1">
                      <span className="font-semibold text-[#713B32]">
                        ⚡ ₹{pricePerPrompt} deducted per prompt
                      </span>
                      <span>Calendar: {new Date().getFullYear()}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. CENTERED CONFIRMATION & ALERT MODALS */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={executeClearChat}
        title="Clear Conversation History?"
        description="Are you sure you want to reset your conversation with Acharya Parihar? All messages from this session will be cleared."
        confirmText="Yes, Clear Chat"
        cancelText="Keep Chat"
        variant="primary"
        icon={<RotateCcw size={24} className="text-[#713B32]" />}
      />

      <ConfirmModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          setAlertModal((prev) => ({ ...prev, isOpen: false }));
          if (alertModal.action) alertModal.action();
        }}
        title={alertModal.title}
        description={alertModal.description}
        confirmText={alertModal.confirmText || 'OK'}
        cancelText="Close"
        variant={alertModal.variant || 'primary'}
      />
    </>
  );
}
