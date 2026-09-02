'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import AppImage from '@/components/ui/AppImage';
import {
  Mic,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  Clock,
  Wallet,
  AlertTriangle,
  FileText,
  Send,
  Loader2,
  X,
  Globe,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AICallRoomPage() {
  const params = useParams();
  const rawSessionId = params?.sessionId;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : (rawSessionId as string) || 'session_default';

  const router = useRouter();
  const { user, userData } = useUserData();
  const { formatPrice } = useCurrency();

  // Session State
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [callActive, setCallActive] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [billedMinutes, setBilledMinutes] = useState(1);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState<string>('Telugu');

  // Audio & Mic Controls
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveTranscriptPreview, setLiveTranscriptPreview] = useState('');

  // Messages & Transcript
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  // UI Drawers & Modals
  const [showChartDrawer, setShowChartDrawer] = useState(false);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioInstanceRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const latestMessagesRef = useRef<any[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedSpeechRef = useRef<string>('');
  const inputTextRef = useRef<string>('');
  const activeLanguageRef = useRef<string>('Telugu');
  const isSpeakerMutedRef = useRef<boolean>(false);
  const isGeneratingReplyRef = useRef<boolean>(false);
  const handleSendMessageRef = useRef<((textToSend?: string) => void) | null>(null);

  // Keep refs in sync
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  useEffect(() => {
    activeLanguageRef.current = activeLanguage;
  }, [activeLanguage]);

  useEffect(() => {
    isSpeakerMutedRef.current = isSpeakerMuted;
  }, [isSpeakerMuted]);

  // Language speech code translator
  const getLangCode = useCallback((lang: string) => {
    const l = (lang || '').toLowerCase();
    if (l.includes('telugu') || l.includes('te')) return 'te-IN';
    if (l.includes('hindi') || l.includes('hi')) return 'hi-IN';
    if (l.includes('tamil') || l.includes('ta')) return 'ta-IN';
    if (l.includes('kannada') || l.includes('kn')) return 'kn-IN';
    if (l.includes('marathi') || l.includes('mr')) return 'mr-IN';
    if (l.includes('gujarati') || l.includes('gu')) return 'gu-IN';
    if (l.includes('bengali') || l.includes('bn')) return 'bn-IN';
    return 'en-IN';
  }, []);

  // Native Initial Astrologer Greeting Generator (Instant 0ms display)
  const getInitialGreeting = useCallback((lang: string, astrologerName = 'Swami Ji') => {
    const l = (lang || '').toLowerCase();
    if (l.includes('telugu') || l.includes('te')) {
      return `నమస్కారం! నేను మీ జ్యోతిష నిపుణుడు ${astrologerName}. మీ కుండలి పరిశీలించడానికి సిద్ధంగా ఉన్నాను. మీ ఉద్యోగం, వివాహం, ఆర్థికం లేదా గ్రహ పరిహారాల గురించి ఏ ప్రశ్న అయినా అడగండి.`;
    }
    if (l.includes('tamil') || l.includes('ta')) {
      return `வணக்கம்! நான் உங்கள் ஜோதிட நிபுணர் ${astrologerName}. உங்கள் ஜாதக பலன்களை அறிய வேலை, திருமணம், தன லாபம் அல்லது பரிகாரங்கள் பற்றி என்ன கேட்க விரும்புகிறீர்கள்?`;
    }
    if (l.includes('hindi') || l.includes('hi')) {
      return `नमस्ते! मैं आपका ज्योतिषी ${astrologerName} हूँ। आपकी जन्म कुंडली के अनुसार करियर, विवाह, धन या ग्रह शांति के बारे में आप क्या जानना चाहते हैं?`;
    }
    return `Namaste! I am ${astrologerName}. Looking at your Vedic birth chart, what would you like to explore today — career, marriage, finances, or planetary remedies?`;
  }, []);

  // Clean unmount helper
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (activeAudioInstanceRef.current) {
        try {
          activeAudioInstanceRef.current.pause();
          activeAudioInstanceRef.current.src = '';
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // 1. Fetch Consultation Session on Mount & Set Initial Greeting
  useEffect(() => {
    async function initSession() {
      if (!sessionId) return;
      try {
        const sessionDoc = await getDoc(doc(db, 'ai_consultations', sessionId));
        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          setSession(data);
          setBilledMinutes(data.billedMinutes || 1);
          setCallActive(data.status === 'active');
          const lang = data.language || 'Telugu';
          setActiveLanguage(lang);
          activeLanguageRef.current = lang;

          if (data.conversationTranscript && data.conversationTranscript.length > 0) {
            setMessages(data.conversationTranscript);
          } else {
            const initialGreetingMsg = {
              role: 'assistant',
              content: getInitialGreeting(lang, data.astrologerName || 'Swami Ji'),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([initialGreetingMsg]);
          }

          if (data.status === 'completed') {
            router.push(`/order-history?tab=ai&session=${sessionId}`);
            return;
          }
        } else {
          const fallbackLang = 'Telugu';
          setSession({
            astrologerName: 'Swami Ji',
            primaryDiscipline: 'Vedic Jyotish',
            pricePerMin: 20,
            language: fallbackLang,
            status: 'active',
            birthDetails: {
              name: 'Devotee',
              primaryConcern: 'General Life Guidance',
            },
          });
          setCallActive(true);
          setMessages([
            {
              role: 'assistant',
              content: getInitialGreeting(fallbackLang, 'Swami Ji'),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (err) {
        console.warn('Session fetch fallback:', err);
        const fallbackLang = 'Telugu';
        setSession({
          astrologerName: 'Swami Ji',
          primaryDiscipline: 'Vedic Jyotish',
          pricePerMin: 20,
          language: fallbackLang,
          status: 'active',
          birthDetails: {
            name: 'Devotee',
            primaryConcern: 'General Life Guidance',
          },
        });
        setCallActive(true);
        setMessages([
          {
            role: 'assistant',
            content: getInitialGreeting(fallbackLang, 'Swami Ji'),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [sessionId, router, getInitialGreeting]);

  // Sync wallet balance
  useEffect(() => {
    if (userData?.walletBalance !== undefined) {
      setCurrentBalance(userData.walletBalance);
    }
  }, [userData]);

  // Web Speech Synthesis (Client-side speaker fallback)
  const speakNativeWebSpeech = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || isSpeakerMutedRef.current) return;
      
      // If server-synthesized audio is currently playing, NEVER play browser speech to prevent dual voice
      if (activeAudioInstanceRef.current && !activeAudioInstanceRef.current.paused) {
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = getLangCode(activeLanguageRef.current);
        utterance.lang = langCode;
        utterance.rate = 0.90;

        const isFemale =
          session?.voiceGender === 'female' ||
          session?.astrologerName?.toLowerCase().includes('devi') ||
          session?.astrologerName?.toLowerCase().includes('mata') ||
          session?.astrologerName?.toLowerCase().includes('priya') ||
          session?.astrologerName?.toLowerCase().includes('ananya');

        // Authentic voice pitch: lower pitch for male swamis / astrologers, higher for female
        utterance.pitch = isFemale ? 1.05 : 0.80;

        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter((v) => v.lang.startsWith(langCode.substring(0, 2)));

        if (langVoices.length > 0) {
          if (isFemale) {
            const femaleVoice = langVoices.find(
              (v) =>
                v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('zira') ||
                v.name.toLowerCase().includes('swara') ||
                v.name.toLowerCase().includes('heera') ||
                v.name.toLowerCase().includes('shruti') ||
                v.name.toLowerCase().includes('pallavi')
            );
            utterance.voice = femaleVoice || langVoices[0];
          } else {
            // Strictly male voice for male astrologers
            const maleVoice = langVoices.find(
              (v) =>
                v.name.toLowerCase().includes('male') ||
                v.name.toLowerCase().includes('david') ||
                v.name.toLowerCase().includes('george') ||
                v.name.toLowerCase().includes('ravi') ||
                v.name.toLowerCase().includes('mohan') ||
                v.name.toLowerCase().includes('valluvar') ||
                v.name.toLowerCase().includes('madhav')
            );
            if (maleVoice) {
              utterance.voice = maleVoice;
            } else {
              // If no explicit male voice exists, significantly lower pitch to guarantee deep male tone
              utterance.pitch = 0.70;
            }
          }
        }

        utterance.onstart = () => {
          setIsAiSpeaking(true);
        };
        utterance.onend = () => {
          setIsAiSpeaking(false);
        };
        utterance.onerror = () => {
          setIsAiSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        setIsAiSpeaking(false);
      }
    },
    [getLangCode, session]
  );

  // Play Synthesized Voice Audio from Base64 MP3 (Single Authority Audio Source)
  const playAudioFromBase64 = useCallback(
    (base64String: string, fallbackText: string) => {
      if (isSpeakerMutedRef.current) return;
      try {
        // ALWAYS cancel and silence any pending browser SpeechSynthesis
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }

        if (activeAudioInstanceRef.current) {
          try {
            activeAudioInstanceRef.current.pause();
            activeAudioInstanceRef.current.src = '';
          } catch (e) {}
        }

        const audioUrl = `data:audio/mp3;base64,${base64String}`;
        const sound = new Audio(audioUrl);
        activeAudioInstanceRef.current = sound;

        const playPromise = sound.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsAiSpeaking(true);
            })
            .catch((err) => {
              console.warn('Direct audio play blocked by browser autoplay policy:', err);
              // Do NOT call speakNativeWebSpeech here to avoid dual voice mixing!
            });
        }
        sound.onended = () => {
          setIsAiSpeaking(false);
        };
        sound.onerror = () => {
          setIsAiSpeaking(false);
          // Do NOT trigger fallback speech to avoid dual voice mixing!
        };
      } catch (e) {
        console.warn('Audio playback error:', e);
        setIsAiSpeaking(false);
      }
    },
    []
  );

  // 2. AI Voice / Speech Exchange Handler
  const triggerAiVoiceExchange = useCallback(
    async (userText: string, historyOverride: any[]) => {
      if (isGeneratingReplyRef.current) return;
      isGeneratingReplyRef.current = true;
      setIsGeneratingReply(true);
      setIsListening(false);
      setLiveTranscriptPreview('');

      try {
        const res = await fetch('/api/ai-consultation/voice-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId || 'session_default',
            userMessage: userText,
            conversationHistory: historyOverride,
            language: activeLanguageRef.current,
            isInitial: false,
          }),
        });

        const data = await res.json();

        if (data.replyText) {
          const aiMsg = {
            role: 'assistant',
            content: data.replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === data.replyText) {
              return prev;
            }
            return [...prev, aiMsg];
          });

          if (data.audioBase64 && !isSpeakerMutedRef.current) {
            playAudioFromBase64(data.audioBase64, data.replyText);
          } else {
            speakNativeWebSpeech(data.replyText);
          }
        }
      } catch (err) {
        console.error('Voice exchange error:', err);
        toast.error('Could not connect to AI Astrologer. Please try again.');
      } finally {
        setIsGeneratingReply(false);
        isGeneratingReplyRef.current = false;
      }
    },
    [sessionId, playAudioFromBase64, speakNativeWebSpeech]
  );

  // Send User Message - Guaranteed Immediate Execution
  const handleSendMessage = useCallback(
    (textToSend?: string) => {
      const text = textToSend !== undefined ? textToSend : inputTextRef.current;
      if (!text || !text.trim() || isGeneratingReplyRef.current) return;

      const cleanedText = text.trim();
      const userMsg = {
        role: 'user',
        content: cleanedText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Clear input fields and buffers immediately
      setInputText('');
      inputTextRef.current = '';
      setLiveTranscriptPreview('');
      accumulatedSpeechRef.current = '';

      // Immediately append to messages so user sees their question instantly (avoid duplicates)
      let updatedHistory: any[] = [];
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'user' && lastMsg.content === cleanedText) {
          updatedHistory = prev;
          return prev;
        }
        updatedHistory = [...prev, userMsg];
        return updatedHistory;
      });

      // Trigger AI consultation
      triggerAiVoiceExchange(cleanedText, updatedHistory.length ? updatedHistory : [...latestMessagesRef.current, userMsg]);
    },
    [triggerAiVoiceExchange]
  );

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Auto-scroll chat transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isGeneratingReply]);

  // 4. In-Call Duration Timer & 60s Billing Engine
  useEffect(() => {
    if (!callActive || isEndingCall) return;

    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);

    const billingTimer = setInterval(async () => {
      try {
        const res = await fetch('/api/ai-consultation/deduct-minute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (res.status === 402 || data.terminated) {
          setCallActive(false);
          toast.error('Your wallet balance is exhausted. Consultation has ended.');
          handleEndCall(true);
          return;
        }

        if (res.ok) {
          setCurrentBalance(data.remainingBalance);
          setBilledMinutes(data.billedMinutes);

          const pricePerMin = session?.pricePerMin || 20;
          if (data.remainingBalance < pricePerMin * 2) {
            setLowBalanceAlert(true);
            toast.warning(
              `Low balance alert: ${formatPrice(data.remainingBalance)} remaining. Recharge to continue.`
            );
          } else {
            setLowBalanceAlert(false);
          }
        }
      } catch (err) {
        console.error('Minute deduction error:', err);
      }
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(billingTimer);
    };
  }, [callActive, sessionId, session, isEndingCall, formatPrice]);

  // 5. Native Speech Recognition Setup (Single instance with proper cleanup & debounce)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = getLangCode(activeLanguage);

      rec.onstart = () => {
        setIsListening(true);
        accumulatedSpeechRef.current = '';
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        transcript = transcript.trim();

        if (transcript) {
          accumulatedSpeechRef.current = transcript;
          inputTextRef.current = transcript;
          setInputText(transcript);
          setLiveTranscriptPreview(transcript);
        }

        // Automatic 800ms silence detection: Immediately submit when user pauses speaking
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const text = (accumulatedSpeechRef.current || inputTextRef.current || '').trim();
          if (text.length > 0) {
            accumulatedSpeechRef.current = '';
            inputTextRef.current = '';
            try {
              rec.stop();
            } catch (e) {}
            setIsListening(false);
            if (handleSendMessageRef.current) {
              handleSendMessageRef.current(text);
            }
          }
        }, 800);
      };

      rec.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition status:', e.error);
        setIsListening(false);
      };

      recognitionRef.current = rec;

      return () => {
        try {
          rec.abort();
          rec.stop();
        } catch (e) {}
      };
    }
  }, [activeLanguage, getLangCode]);

  // Start Voice Input
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = getLangCode(activeLanguageRef.current);
        accumulatedSpeechRef.current = '';
        inputTextRef.current = '';
        setInputText('');
        setLiveTranscriptPreview('');
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Microphone Active! Speak your question now...');
      } catch (err: any) {
        if (err.name === 'InvalidStateError') {
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              recognitionRef.current?.start();
              setIsListening(true);
            }, 100);
          } catch (e) {}
        } else {
          console.warn('Could not start recognition:', err);
          toast.error('Please allow microphone access in your browser to speak.');
        }
      }
    } else {
      toast.info('Speech recognition is not supported in this browser. Please type below.');
    }
  };

  // Stop Voice Input
  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const textToSend = (accumulatedSpeechRef.current || inputTextRef.current || '').trim();
    accumulatedSpeechRef.current = '';
    inputTextRef.current = '';
    if (textToSend && handleSendMessageRef.current) {
      handleSendMessageRef.current(textToSend);
    }
  };

  // Toggle Mic Button
  const toggleMicListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 6. End Call & Redirect
  const handleEndCall = async (dueToLowBalance = false) => {
    if (isEndingCall) return;
    setIsEndingCall(true);
    setCallActive(false);
    setIsAiSpeaking(false);
    setIsListening(false);

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (activeAudioInstanceRef.current) {
      try {
        activeAudioInstanceRef.current.pause();
        activeAudioInstanceRef.current.src = '';
      } catch (e) {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    try {
      const res = await fetch('/api/ai-consultation/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          durationSeconds: Math.max(durationSeconds, 60),
          conversationTranscript: messages,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        try {
          const cached = JSON.parse(localStorage.getItem('astroparihar_ai_history') || '[]');
          const updatedSession = {
            id: sessionId,
            astrologerName: session?.astrologerName,
            astrologerAvatar: session?.astrologerAvatar,
            primaryDiscipline: session?.primaryDiscipline,
            date: new Date().toLocaleDateString('en-GB'),
            duration: `${Math.ceil(Math.max(durationSeconds, 60) / 60)} mins`,
            billedAmount: (session?.pricePerMin || 20) * Math.ceil(Math.max(durationSeconds, 60) / 60),
            status: 'completed',
            summary: data.summary,
            transcript: messages,
          };
          localStorage.setItem(
            'astroparihar_ai_history',
            JSON.stringify([updatedSession, ...cached.filter((s: any) => s.id !== sessionId)])
          );
        } catch (e) {}
      }

      toast.success('Consultation ended. Redirecting to your AI Astrological Report...');
      router.push(`/order-history?tab=ai&session=${sessionId}`);
    } catch (err) {
      console.error('End call error:', err);
      router.push(`/order-history?tab=ai&session=${sessionId}`);
    }
  };

  // Format Duration Timer
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  // Quick Starter Questions in Selected Language
  const getQuickQuestions = () => {
    const l = activeLanguage.toLowerCase();
    if (l.includes('telugu') || l.includes('te')) {
      return [
        { label: '💼 ఉద్యోగం & కెరీర్', text: 'స్వామీజీ నా ఉద్యోగంలో ప్రమోషన్ మరియు ఆదాయం ఎప్పుడు పెరుగుతాయి?' },
        { label: '💍 వివాహ సమయం', text: 'స్వామీజీ నా వివాహ సమయం మరియు అనుకూల సంబంధాల గురించి చెప్పండి' },
        { label: '💰 ఆర్థిక వృద్ధి', text: 'నాకు ఆర్థిక లాభాలు మరియు అప్పుల నివారణ గురించి మార్గదర్శనం ఇవ్వండి' },
        { label: '🕉️ పరిహారాలు', text: 'నా జాతక దోష నివారణకు ఏ పూజలు మరియు మంత్రాలు చేయాలి?' },
      ];
    }
    if (l.includes('tamil') || l.includes('ta')) {
      return [
        { label: '💼 வேலை வாய்ப்பு', text: 'எனக்கு நல்ல வேலை மற்றும் பதவி உயர்வு எப்போது கிடைக்கும்?' },
        { label: '💍 திருமண யோகம்', text: 'எனது திருமண காலம் எப்போது அமையும்?' },
        { label: '💰 தன லாபம்', text: 'ஆर्थिक வளர்ச்சிக்கு என்ன பரிகாரம் செய்ய வேண்டும்?' },
        { label: '🕉️ பரிகாரங்கள்', text: 'கிரக தோஷங்கள் நீங்க என்ன பூஜை செய்ய வேண்டும்?' },
      ];
    }
    if (l.includes('hindi') || l.includes('hi')) {
      return [
        { label: '💼 नौकरी और करियर', text: 'मुझे नौकरी में पदोन्नति और करियर में सफलता कब मिलेगी?' },
        { label: '💍 विवाह योग', text: 'मेरे विवाह का शुभ समय और वैवाहिक सुख कैसा रहेगा?' },
        { label: '💰 आर्थिक लाभ', text: 'धन लाभ और कर्ज मुक्ति के लिए क्या मार्गदर्शन है?' },
        { label: '🕉️ वैदिक उपाय', text: 'ग्रह शांति और सौभाग्य के लिए कौन से उपाय करें?' },
      ];
    }
    return [
      { label: '💼 Career & Growth', text: 'When will I get a career promotion and financial growth?' },
      { label: '💍 Marriage Timing', text: 'What is the auspicious astrological timing for my marriage?' },
      { label: '💰 Wealth & Debt', text: 'How can I improve my financial stability and manifest wealth?' },
      { label: '🕉️ Vedic Remedies', text: 'What daily remedies and poojas will balance my planets?' },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#140E0A] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#C9952B] mb-4" size={48} />
        <h2 className="text-xl font-bold font-serif text-[#FFFDFC]">Connecting to Voice Channel...</h2>
        <p className="text-xs text-[#E5D5BA] mt-1">Synchronizing birth chart and planetary dasha...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0C0A] text-white flex flex-col justify-between select-none relative overflow-hidden font-sans">
      {/* Hidden Audio Player */}
      <audio ref={audioRef} className="hidden" preload="auto" />

      {/* Background Ambient Cosmic Nebulae */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-[#713B32]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-[#C9952B]/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation & Status Bar */}
      <header className="relative z-20 px-6 py-4 border-b border-[#3D352A] bg-[#14110E]/90 backdrop-blur-md flex items-center justify-between shadow-lg">
        {/* Left: Astrologer Badge */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#C9952B] relative shadow-md shadow-[#C9952B]/20">
            <AppImage
              src={
                session?.astrologerAvatar ||
                '/assets/images/ai-astrologers/swami-ji.png'
              }
              alt={session?.astrologerName || 'Swami Ji'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-[#FFFDFC]">{session?.astrologerName || 'Swami Ji'}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9952B]/20 text-[#E5B54F] border border-[#C9952B]/40">
                {session?.primaryDiscipline || 'Vedic Jyotish'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[#E5D5BA] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Call Active
              </p>
              <span className="text-[#3D352A]">·</span>
              {/* Active Consultation Language Display */}
              <div className="flex items-center gap-1 text-[11px] text-[#E5B54F] font-semibold bg-[#221B14] px-2 py-0.5 rounded-md border border-[#C9952B]/40">
                <Globe size={11} className="text-[#C9952B]" />
                <span>{activeLanguage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Timer & Billed Minutes */}
        <div className="hidden md:flex items-center gap-4 bg-[#181410] px-5 py-2 rounded-2xl border border-[#3D352A] shadow-inner">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-emerald-400">
            <Clock size={16} className="animate-spin text-[#C9952B]" />
            {formatTimer(durationSeconds)}
          </div>
          <span className="text-[#3D352A]">|</span>
          <div className="text-xs text-[#D4C3A3]">
            Billed: <span className="font-bold text-[#FFFDFC]">{billedMinutes} min</span> (
            {formatPrice((session?.pricePerMin || 20) * billedMinutes)})
          </div>
        </div>

        {/* Right: Wallet Balance & Kundli HUD Button */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1C1814] px-3.5 py-1.5 rounded-xl border border-[#3D352A] flex items-center gap-2 text-xs">
            <Wallet size={14} className="text-[#C9952B]" />
            <span className="font-bold text-[#FFFDFC]">{formatPrice(currentBalance)}</span>
          </div>

          <button
            onClick={() => setShowChartDrawer(!showChartDrawer)}
            className="px-3 py-1.5 rounded-xl bg-[#221B14] border border-[#C9952B]/40 hover:border-[#C9952B] text-xs font-semibold text-[#FFFDFC] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles size={13} className="text-[#C9952B]" />
            <span className="hidden sm:inline">Birth Chart</span>
          </button>
        </div>
      </header>

      {/* Low Balance Warning Banner */}
      {lowBalanceAlert && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2 animate-pulse font-medium">
          <AlertTriangle size={15} />
          <span>
            Low Balance Warning: Under 2 minutes remaining. Top up to avoid disconnection.
          </span>
          <Link
            href={`/wallet?redirect=${encodeURIComponent(`/ai-call/${sessionId}`)}`}
            target="_blank"
            className="px-2.5 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px] ml-2 hover:bg-amber-400"
          >
            Quick Top-Up
          </Link>
        </div>
      )}

      {/* Main Interactive Stage */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-8 max-w-screen-2xl mx-auto w-full relative z-10">
        {/* Left Visualizer & Astrologer Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl text-center">
          {/* Animated Mandala Soundwave Rings */}
          <div className="relative flex items-center justify-center my-6">
            {isAiSpeaking && (
              <>
                <div className="absolute w-72 h-72 rounded-full border border-[#C9952B]/40 animate-ping opacity-40" />
                <div className="absolute w-80 h-80 rounded-full border border-[#713B32]/50 animate-pulse opacity-50" />
              </>
            )}

            {/* Central Avatar Frame */}
            <div
              onClick={toggleMicListening}
              className={`w-44 h-44 rounded-full p-1.5 transition-all duration-500 cursor-pointer ${
                isAiSpeaking
                  ? 'bg-gradient-to-tr from-[#C9952B] via-[#E5B54F] to-[#713B32] shadow-2xl shadow-[#C9952B]/50 scale-105'
                  : isListening
                  ? 'bg-gradient-to-tr from-emerald-500 via-[#C9952B] to-emerald-400 shadow-2xl shadow-emerald-500/50 ring-4 ring-emerald-500/40 scale-105'
                  : 'bg-[#1C1814] border-2 border-[#C9952B]/50 shadow-xl hover:scale-102'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <AppImage
                  src={
                    session?.astrologerAvatar ||
                    '/assets/images/ai-astrologers/swami-ji.png'
                  }
                  alt={session?.astrologerName || 'Swami Ji'}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Astrologer Status Caption */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-[#FFFDFC] font-serif tracking-wide">
              {session?.astrologerName || 'Swami Ji'}
            </h3>
            <p className="text-xs font-semibold tracking-wide mt-1.5">
              {isAiSpeaking ? (
                <span className="text-[#E5B54F] flex items-center justify-center gap-1.5 animate-pulse font-medium">
                  <Radio size={14} className="text-[#E5B54F]" /> ✦ Speaking guidance...
                </span>
              ) : isGeneratingReply ? (
                <span className="text-[#C9952B] flex items-center justify-center gap-1.5 animate-pulse font-medium">
                  <Loader2 size={14} className="animate-spin text-[#C9952B]" /> ✦ Consulting your birth chart...
                </span>
              ) : isListening ? (
                <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-pulse">
                  <Mic size={14} className="text-emerald-400" /> ✦ Listening to you... Speak now!
                </span>
              ) : (
                <span className="text-[#E5D5BA] flex items-center justify-center gap-1.5">
                  ✦ Tap the mic button below or click any topic to speak
                </span>
              )}
            </p>

            {/* Live speech preview overlay if speaking */}
            {isListening && liveTranscriptPreview && (
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-medium max-w-md truncate animate-pulse">
                "{liveTranscriptPreview}"
              </div>
            )}
          </div>

          {/* Live Dynamic Sound Wave Bars */}
          <div className="flex items-center justify-center gap-1.5 h-10 w-full mb-6">
            {[40, 65, 85, 95, 75, 45, 80, 100, 60, 35, 70, 90, 50].map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height:
                    isAiSpeaking || isListening ? [`${h * 0.3}%`, `${h}%`, `${h * 0.2}%`] : '15%',
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.06,
                }}
                className={`w-1.5 rounded-full ${
                  isAiSpeaking
                    ? 'bg-gradient-to-t from-[#713B32] to-[#E5B54F]'
                    : isListening
                    ? 'bg-emerald-400'
                    : 'bg-[#3D352A]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Live Transcript & Chat Log */}
        <div className="w-full lg:w-[450px] h-[500px] bg-[#14110E] border border-[#3D352A] rounded-3xl p-4 flex flex-col justify-between shadow-2xl">
          <div className="border-b border-[#3D352A] pb-2.5 mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5B54F] flex items-center gap-1.5">
              <FileText size={14} className="text-[#C9952B]" /> Live Transcript ({activeLanguage})
            </span>
            <span className="text-[11px] text-[#D4C3A3] font-medium">{messages.length} exchanges</span>
          </div>

          {/* Chat Messages Log */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl max-w-[90%] shadow-lg ${
                  msg.role === 'user'
                    ? 'ml-auto bg-gradient-to-r from-[#C9952B] to-[#9E6D14] text-white border border-[#E5B54F]/40'
                    : 'mr-auto bg-[#1C1814] text-[#F5EFE6] border border-[#C9952B]/40'
                }`}
              >
                <div
                  className={`text-[11px] mb-1 font-bold ${
                    msg.role === 'user' ? 'text-amber-100' : 'text-[#E5B54F]'
                  }`}
                >
                  {msg.role === 'user' ? 'You' : session?.astrologerName || 'Swami Ji'} · {msg.time || ''}
                </div>
                <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs">{msg.content}</p>
              </div>
            ))}

            {isGeneratingReply && (
              <div className="mr-auto bg-[#1C1814] border border-[#C9952B]/40 p-3.5 rounded-2xl flex items-center gap-2 text-xs text-[#E5B54F]">
                <Loader2 size={15} className="animate-spin text-[#C9952B]" />
                <span>{session?.astrologerName || 'Swami Ji'} is speaking guidance...</span>
              </div>
            )}
          </div>

          {/* Quick Topic Helper Bar (Shown when messages exist) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none border-t border-[#3D352A]/50">
            {getQuickQuestions().map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q.text)}
                className="px-2.5 py-1 rounded-lg bg-[#1C1814] border border-[#3D352A] hover:border-[#C9952B] text-[10px] text-[#D4C3A3] hover:text-[#E5B54F] whitespace-nowrap transition-colors active:scale-95 cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Quick Text Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const toSend = inputText.trim() || inputTextRef.current.trim();
              if (toSend) {
                handleSendMessage(toSend);
              }
            }}
            className="pt-2 border-t border-[#3D352A] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask in ${activeLanguage}... (e.g. Ask your question)`}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                inputTextRef.current = e.target.value;
              }}
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#1C1814] border border-[#3D352A] text-xs text-[#FFFDFC] placeholder:text-[#A89880] focus:border-[#C9952B] outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const toSend = inputText.trim() || inputTextRef.current.trim();
                if (toSend) {
                  handleSendMessage(toSend);
                }
              }}
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-[#C9952B] text-white disabled:opacity-40 hover:bg-[#b08022] transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Floating Control Bar */}
      <footer className="relative z-20 p-5 bg-[#14110E]/95 border-t border-[#3D352A] flex items-center justify-center gap-5">
        {/* Speak / Mic Button */}
        <button
          onClick={toggleMicListening}
          className={`p-4 rounded-full transition-all duration-200 shadow-xl cursor-pointer ${
            isListening
              ? 'bg-emerald-500 text-white shadow-emerald-500/50 ring-4 ring-emerald-500/30 scale-110'
              : 'bg-[#1C1814] text-[#D4C3A3] border-2 border-[#3D352A] hover:border-[#C9952B] hover:text-white'
          }`}
          title={isListening ? 'Listening (Click to Send)' : 'Click to Speak (Microphone)'}
        >
          {isListening ? <Mic size={24} className="animate-pulse" /> : <Mic size={24} />}
        </button>

        {/* Speaker Mute Button */}
        <button
          onClick={() => {
            const newMuteState = !isSpeakerMuted;
            setIsSpeakerMuted(newMuteState);
            isSpeakerMutedRef.current = newMuteState;
            if (newMuteState) {
              if (activeAudioInstanceRef.current) {
                try {
                  activeAudioInstanceRef.current.pause();
                } catch (e) {}
              }
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setIsAiSpeaking(false);
            }
          }}
          className={`p-4 rounded-full transition-all duration-200 shadow-xl cursor-pointer ${
            isSpeakerMuted
              ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/50'
              : 'bg-[#1C1814] text-[#D4C3A3] border-2 border-[#3D352A] hover:border-[#C9952B]'
          }`}
          title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
        >
          {isSpeakerMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        {/* End Call Button */}
        <button
          onClick={() => handleEndCall(false)}
          className="px-6 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-red-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <PhoneOff size={16} /> End Consultation
        </button>
      </footer>

      {/* Birth Chart Slide-out Drawer */}
      <AnimatePresence>
        {showChartDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-[#14110E] border-l border-[#3D352A] w-full max-w-md h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#3D352A] pb-4 mb-4">
                  <h3 className="font-bold text-sm text-[#FFFDFC] flex items-center gap-2">
                    <Sparkles size={16} className="text-[#C9952B]" /> Birth Chart Details
                  </h3>
                  <button
                    onClick={() => setShowChartDrawer(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/70 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-[#1C1814] rounded-xl border border-[#3D352A]">
                    <span className="text-[#D4C3A3] block text-[10px]">Devotee Name</span>
                    <span className="font-bold text-[#FFFDFC]">{session?.customerName || session?.birthDetails?.name || 'Devotee'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#1C1814] rounded-xl border border-[#3D352A]">
                      <span className="text-[#D4C3A3] block text-[10px]">Date of Birth</span>
                      <span className="font-bold text-[#FFFDFC]">
                        {session?.birthDetails?.dob || 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 bg-[#1C1814] rounded-xl border border-[#3D352A]">
                      <span className="text-[#D4C3A3] block text-[10px]">Birth Time</span>
                      <span className="font-bold text-[#FFFDFC]">
                        {session?.birthDetails?.time || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#1C1814] rounded-xl border border-[#3D352A]">
                    <span className="text-[#D4C3A3] block text-[10px]">Birth Place</span>
                    <span className="font-bold text-[#FFFDFC]">
                      {session?.birthDetails?.place || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#1C1814] rounded-xl border border-[#3D352A]">
                    <span className="text-[#D4C3A3] block text-[10px]">Primary Consultation Topic</span>
                    <span className="font-bold text-[#E5B54F]">
                      {session?.birthDetails?.primaryConcern || 'General Life Guidance'}
                    </span>
                  </div>

                  <div className="p-4 bg-[#1C1814] rounded-xl border border-[#C9952B]/40 space-y-2">
                    <h4 className="font-bold text-xs text-[#E5B54F]">Synthesized Chart Placements</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#D4C3A3]">
                      <div>
                        Lagna: <span className="text-[#FFFDFC] font-bold">{session?.astroContext?.lagna || 'Scorpio (Vrishchika)'}</span>
                      </div>
                      <div>
                        Rashi: <span className="text-[#FFFDFC] font-bold">{session?.astroContext?.moonRashi || 'Aries (Mesha)'}</span>
                      </div>
                      <div>
                        Nakshatra: <span className="text-[#FFFDFC] font-bold">{session?.astroContext?.nakshatra || 'Bharani'}</span>
                      </div>
                      <div>
                        Dasha: <span className="text-[#FFFDFC] font-bold">{session?.astroContext?.currentDasha || 'Jupiter Mahadasha'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowChartDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-[#221B14] border border-[#3D352A] text-xs font-bold text-[#FFFDFC] hover:bg-[#2A221A] mt-6 cursor-pointer"
              >
                Close Drawer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay while ending call & generating report */}
      {isEndingCall && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="p-6 bg-[#181410] border border-[#C9952B] rounded-3xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <Loader2 className="animate-spin text-[#C9952B] mb-3" size={40} />
            <h3 className="text-base font-bold text-[#FFFDFC]">Generating AI Consultation Report</h3>
            <p className="text-xs text-[#D4C3A3] mt-1">
              Synthesizing insights, timeline predictions & Vedic remedies...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
