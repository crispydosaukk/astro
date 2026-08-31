'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import AppImage from '@/components/ui/AppImage';
import {
  Mic,
  MicOff,
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
  CheckCircle2,
  Download,
  X,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AIConsultationSummary } from '@/lib/aiAstrologerData';
import Link from 'next/link';

export default function AICallRoomPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user, userData } = useUserData();
  const { formatPrice } = useCurrency();

  // Session State
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [billedMinutes, setBilledMinutes] = useState(1);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState<string>('English');

  // Audio & Mic Controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Messages & Transcript
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  // UI Drawers & Modals
  const [showChartDrawer, setShowChartDrawer] = useState(false);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const isCallEndedRef = useRef(false);

  // Global unmount audio cleanup
  useEffect(() => {
    return () => {
      isCallEndedRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
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

  // Get Speech Recognition Language Code
  const getLangCode = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes('telugu') || l.includes('te')) return 'te-IN';
    if (l.includes('hindi') || l.includes('hi')) return 'hi-IN';
    if (l.includes('tamil') || l.includes('ta')) return 'ta-IN';
    if (l.includes('kannada') || l.includes('kn')) return 'kn-IN';
    if (l.includes('marathi') || l.includes('mr')) return 'mr-IN';
    if (l.includes('gujarati') || l.includes('gu')) return 'gu-IN';
    if (l.includes('bengali') || l.includes('bn')) return 'bn-IN';
    return 'en-IN';
  };

  // 1. Fetch Consultation Session on Mount
  useEffect(() => {
    async function initSession() {
      if (!sessionId) return;
      try {
        const sessionDoc = await getDoc(doc(db, 'ai_consultations', sessionId as string));
        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          setSession(data);
          setBilledMinutes(data.billedMinutes || 1);
          setCallActive(data.status === 'active');
          if (data.language) setActiveLanguage(data.language);
          if (data.conversationTranscript?.length) {
            setMessages(data.conversationTranscript);
          }
          if (data.status === 'completed') {
            router.push(`/order-history?tab=ai&session=${sessionId}`);
            return;
          }
        } else {
          toast.error('Session not found');
          router.push('/talk-to-ai-astrologer');
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, [sessionId, router]);

  // Sync wallet balance
  useEffect(() => {
    if (userData?.walletBalance !== undefined) {
      setCurrentBalance(userData.walletBalance);
    }
  }, [userData]);

  // 2. Play initial greeting from AI Astrologer when call connects
  useEffect(() => {
    if (session && !callActive && session.status === 'active') {
      setCallActive(true);
      // Trigger initial AI greeting
      triggerAiVoiceExchange(null, true);
    }
  }, [session, callActive]);

  // Auto-scroll chat transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isGeneratingReply]);

  // 3. In-Call Duration Timer & 60s Billing Engine
  useEffect(() => {
    if (!callActive || isEndingCall) return;

    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);

    // Every 60 seconds, trigger billing deduction
    const billingTimer = setInterval(async () => {
      try {
        const res = await fetch('/api/ai-consultation/deduct-minute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (res.status === 402 || data.terminated) {
          // Balance exhausted -> Terminate Call
          setCallActive(false);
          toast.error('Your wallet balance is exhausted. Consultation has ended.');
          handleEndCall(true);
          return;
        }

        if (res.ok) {
          setCurrentBalance(data.remainingBalance);
          setBilledMinutes(data.billedMinutes);

          // Check if remaining balance is less than 2 minutes
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

  // 4. Setup Speech Recognition for hands-free voice talking with dynamic language support
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = getLangCode(activeLanguage);

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          handleSendMessage(transcript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition event:', e.error);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [activeLanguage]);

  const toggleMicListening = () => {
    if (isMicMuted) {
      toast.info('Microphone is muted');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = getLangCode(activeLanguage);
          recognitionRef.current.start();
          setIsListening(true);
        } else {
          toast.info('Voice input is not supported in this browser. Please type your message.');
        }
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  // 5. AI Voice / Speech Exchange Handler with full history & language context
  const triggerAiVoiceExchange = async (
    userText: string | null,
    isInitial = false,
    historyOverride?: any[]
  ) => {
    if (isCallEndedRef.current) return;
    setIsGeneratingReply(true);
    try {
      const historyToSend = historyOverride || messages;
      const res = await fetch('/api/ai-consultation/voice-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userMessage: userText,
          conversationHistory: historyToSend,
          language: activeLanguage,
          isInitial: isInitial,
          action: isInitial ? 'initial_greeting' : 'chat_voice',
        }),
      });

      if (isCallEndedRef.current) return;

      const data = await res.json();
      if (isCallEndedRef.current) return;

      if (data.replyText) {
        const aiMsg = {
          role: 'assistant',
          content: data.replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Play Synthesized Voice Audio if available and call is still active
        if (data.audioBase64 && !isSpeakerMuted && !isCallEndedRef.current) {
          playAudioFromBase64(data.audioBase64);
        } else if ('speechSynthesis' in window && !isSpeakerMuted && !isCallEndedRef.current) {
          // Browser native TTS fallback with correct language code
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.replyText);
          const langCode = getLangCode(activeLanguage);
          utterance.lang = langCode;
          utterance.rate = 0.95;
          utterance.pitch = 1.0;

          // Attempt to find a native voice for the language
          const voices = window.speechSynthesis.getVoices();
          const matchingVoice = voices.find((v) => v.lang.startsWith(langCode.substring(0, 2)));
          if (matchingVoice) utterance.voice = matchingVoice;

          utterance.onstart = () => {
            if (isCallEndedRef.current) {
              window.speechSynthesis.cancel();
              setIsAiSpeaking(false);
              return;
            }
            setIsAiSpeaking(true);
          };
          utterance.onend = () => setIsAiSpeaking(false);
          utterance.onerror = () => setIsAiSpeaking(false);
          if (!isCallEndedRef.current) {
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    } catch (err) {
      console.error('Voice exchange error:', err);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const playAudioFromBase64 = (base64String: string) => {
    if (isCallEndedRef.current) return;
    try {
      const audioUrl = `data:audio/mp3;base64,${base64String}`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (isCallEndedRef.current) {
                audioRef.current?.pause();
                setIsAiSpeaking(false);
                return;
              }
              setIsAiSpeaking(true);
            })
            .catch((err) => {
              console.warn('Audio play error:', err);
              setIsAiSpeaking(false);
            });
        }
        audioRef.current.onended = () => {
          setIsAiSpeaking(false);
        };
        audioRef.current.onerror = () => {
          setIsAiSpeaking(false);
        };
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
      setIsAiSpeaking(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    if (isCallEndedRef.current || isEndingCall || !callActive) return;
    const text = textToSend || inputText;
    if (!text.trim() || isGeneratingReply) return;

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');

    // Trigger dynamic AI response with updated conversation history!
    triggerAiVoiceExchange(text, false, updatedHistory);
  };

  // 6. End Call, Stop All Audio & Redirect to AI Reports
  const handleEndCall = async (dueToLowBalance = false) => {
    if (isEndingCall) return;
    isCallEndedRef.current = true;
    setIsEndingCall(true);
    setCallActive(false);
    setIsAiSpeaking(false);
    setIsListening(false);

    // 1. Immediately abort & stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // 2. Immediately stop HTML audio element and clear source
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      } catch (e) {}
    }

    // 3. Immediately cancel browser speech synthesis
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
        // Cache completed session locally for instant redundancy
        try {
          const cached = JSON.parse(localStorage.getItem('astroparihar_ai_history') || '[]');
          const updatedSession = {
            id: sessionId,
            astrologerName: session?.astrologerName,
            astrologerAvatar: session?.astrologerAvatar,
            primaryDiscipline: session?.primaryDiscipline,
            language: activeLanguage,
            billedMinutes: data.billedMinutes || billedMinutes,
            totalBilledAmount: data.totalBilledAmount || session?.pricePerMin * billedMinutes,
            status: 'completed',
            createdAt: new Date().toISOString(),
            conversationTranscript: messages,
            summary: data.summary,
            birthDetails: session?.birthDetails,
          };
          localStorage.setItem(
            'astroparihar_ai_history',
            JSON.stringify([updatedSession, ...cached.filter((c: any) => c.id !== sessionId)])
          );
        } catch (storageErr) {
          console.warn('LocalStorage save error:', storageErr);
        }
      }
    } catch (err) {
      console.error('Error ending call:', err);
    } finally {
      toast.success('Consultation completed! Redirecting to your AI Report...');
      router.push(`/order-history?tab=ai&session=${sessionId}`);
    }
  };

  // Format Timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center text-[#FBF7EE]">
        <Loader2 className="animate-spin text-[#C9952B] mb-4" size={48} />
        <p className="text-[#E5D5BA] font-serif tracking-wide text-sm">Connecting to Celestial AI Astrologer...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#FBF7EE] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Top Session Navigation & Ticker HUD */}
      <header className="px-6 py-4 bg-[#14110E]/90 backdrop-blur-md border-b border-[#3D352A] z-30 flex items-center justify-between shadow-lg">
        {/* Left: Astrologer Badge */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#C9952B] relative shadow-md shadow-[#C9952B]/20">
            <AppImage
              src={
                session?.astrologerAvatar ||
                'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400'
              }
              alt={session?.astrologerName || 'Astrologer'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-[#FFFDFC]">{session?.astrologerName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9952B]/20 text-[#E5B54F] border border-[#C9952B]/40">
                {session?.primaryDiscipline}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[#E5D5BA] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Call
              </p>
              <span className="text-[#3D352A]">·</span>
              {/* Language Selector in Top HUD */}
              <div className="flex items-center gap-1 text-[11px] text-[#E5B54F] font-semibold bg-[#221B14] px-2 py-0.5 rounded-md border border-[#C9952B]/40">
                <Globe size={11} className="text-[#C9952B]" />
                <select
                  value={activeLanguage}
                  onChange={(e) => {
                    setActiveLanguage(e.target.value);
                    toast.success(`Language switched to ${e.target.value}`);
                  }}
                  className="bg-transparent text-[#FFFDFC] text-[11px] font-bold outline-none cursor-pointer"
                >
                  <option value="Telugu" className="bg-[#1C1814] text-white">✦ Telugu (తెలుగు)</option>
                  <option value="Hindi" className="bg-[#1C1814] text-white">✦ Hindi (हिन्दी)</option>
                  <option value="English" className="bg-[#1C1814] text-white">✦ English</option>
                  <option value="Tamil" className="bg-[#1C1814] text-white">✦ Tamil (தமிழ்)</option>
                </select>
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
            {formatPrice(session?.pricePerMin * billedMinutes)})
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
            className="px-3 py-1.5 rounded-xl bg-[#221B14] border border-[#C9952B]/40 hover:border-[#C9952B] text-xs font-semibold text-[#FFFDFC] flex items-center gap-1.5 transition-all shadow-sm"
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
        {/* Left/Center Visualizer & Astrologer Avatar Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl text-center">
          {/* Animated Mandala Soundwave Rings */}
          <div className="relative flex items-center justify-center my-6">
            {/* Outer Pulsing Wave Rings when AI speaks */}
            {isAiSpeaking && (
              <>
                <div className="absolute w-72 h-72 rounded-full border border-[#C9952B]/40 animate-ping opacity-40" />
                <div className="absolute w-80 h-80 rounded-full border border-[#713B32]/50 animate-pulse opacity-50" />
              </>
            )}

            {/* Central Avatar Frame */}
            <div
              className={`w-44 h-44 rounded-full p-1.5 transition-all duration-500 ${
                isAiSpeaking
                  ? 'bg-gradient-to-tr from-[#C9952B] via-[#E5B54F] to-[#713B32] shadow-2xl shadow-[#C9952B]/50 scale-105'
                  : 'bg-[#1C1814] border-2 border-[#C9952B]/50 shadow-xl'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <AppImage
                  src={
                    session?.astrologerAvatar ||
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'
                  }
                  alt={session?.astrologerName || 'Astrologer'}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Astrologer Status Caption */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-[#FFFDFC] font-serif tracking-wide">
              {session?.astrologerName}
            </h3>
            <p className="text-xs text-[#E5B54F] font-semibold tracking-wide mt-1">
              {isAiSpeaking
                ? '✦ Speaking guidance...'
                : isGeneratingReply
                  ? '✦ Consulting birth chart...'
                  : isListening
                    ? '✦ Listening to you...'
                    : '✦ Listening · Tap mic or send message'}
            </p>
          </div>

          {/* Sound Wave Bars */}
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

        {/* Right: Live Transcript & Chat Log (High Contrast Overhaul) */}
        <div className="w-full lg:w-[420px] h-96 lg:h-[460px] bg-[#14110E] border border-[#3D352A] rounded-3xl p-4 flex flex-col justify-between shadow-2xl">
          <div className="border-b border-[#3D352A] pb-2 mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5B54F] flex items-center gap-1.5">
              <FileText size={14} className="text-[#C9952B]" /> Live Transcript ({activeLanguage})
            </span>
            <span className="text-[11px] text-[#D4C3A3] font-medium">{messages.length} exchanges</span>
          </div>

          {/* Chat Messages Log */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#D4C3A3] p-4">
                <Sparkles size={26} className="text-[#C9952B] mb-2 opacity-80 animate-pulse" />
                <p className="text-xs font-medium text-[#FFFDFC]">Connecting with {session?.astrologerName}...</p>
                <p className="text-[11px] text-[#D4C3A3] mt-1">Speak directly or type your question below.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
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
                    {msg.role === 'user' ? 'You' : session?.astrologerName} · {msg.time}
                  </div>
                  <p className="leading-relaxed text-xs whitespace-pre-wrap font-normal">
                    {msg.content}
                  </p>
                </div>
              ))
            )}
            {isGeneratingReply && (
              <div className="mr-auto bg-[#1C1814] border border-[#C9952B]/40 p-3 rounded-2xl text-xs text-[#E5B54F] flex items-center gap-2 shadow-md">
                <Loader2 size={13} className="animate-spin text-[#C9952B]" />
                <span>Consulting birth chart & planetary transits...</span>
              </div>
            )}
          </div>

          {/* Quick Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="pt-2.5 border-t border-[#3D352A] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask in ${activeLanguage}... (e.g. Can you speak in Telugu?)`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#1C1814] border border-[#3D352A] text-xs text-[#FFFDFC] placeholder-[#8F8171] focus:border-[#C9952B] outline-none shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isGeneratingReply}
              className="p-2.5 rounded-xl bg-[#C9952B] text-white disabled:opacity-40 hover:bg-[#b08022] transition-colors shadow-md"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </main>

      {/* In-Call Astrological Chart HUD Drawer */}
      <AnimatePresence>
        {showChartDrawer && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#1A1612] border border-[#C9952B]/50 rounded-3xl p-5 shadow-2xl z-40 backdrop-blur-xl text-[#FBF7EE]"
          >
            <div className="flex items-center justify-between mb-3 border-b border-[#3D352A] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5B54F] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#C9952B]" /> Synthesized Birth Chart Profile
              </h4>
              <button
                onClick={() => setShowChartDrawer(false)}
                className="text-[#D4C3A3] hover:text-[#FFFDFC]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#221B14] rounded-xl border border-[#3D352A]">
                <span className="text-[10px] text-[#D4C3A3] uppercase block font-semibold">
                  Lagna (Ascendant)
                </span>
                <span className="font-bold text-[#FFFDFC]">
                  {session?.astroContext?.lagna || 'Scorpio'}
                </span>
              </div>
              <div className="p-3 bg-[#221B14] rounded-xl border border-[#3D352A]">
                <span className="text-[10px] text-[#D4C3A3] uppercase block font-semibold">
                  Moon Sign (Rashi)
                </span>
                <span className="font-bold text-[#FFFDFC]">
                  {session?.astroContext?.moonRashi || 'Aries'}
                </span>
              </div>
              <div className="p-3 bg-[#221B14] rounded-xl border border-[#3D352A]">
                <span className="text-[10px] text-[#D4C3A3] uppercase block font-semibold">Nakshatra</span>
                <span className="font-bold text-[#FFFDFC]">
                  {session?.astroContext?.nakshatra || 'Bharani'}
                </span>
              </div>
              <div className="p-3 bg-[#221B14] rounded-xl border border-[#3D352A]">
                <span className="text-[10px] text-[#D4C3A3] uppercase block font-semibold">
                  Active Dasha
                </span>
                <span className="font-bold text-emerald-400">
                  {session?.astroContext?.currentDasha || 'Jupiter-Mars'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#D4C3A3] mt-3 italic">
              Devotee: {session?.birthDetails?.name} · Born {session?.birthDetails?.dob} at{' '}
              {session?.birthDetails?.place} · Topic: {session?.birthDetails?.primaryConcern}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Call Control Bar */}
      <footer className="p-6 bg-[#14110E]/90 backdrop-blur-md border-t border-[#3D352A] z-30 flex items-center justify-center gap-4">
        {/* Mic Listen Toggle */}
        <button
          onClick={toggleMicListening}
          className={`p-4 rounded-2xl border transition-all ${
            isListening
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 scale-110'
              : 'bg-[#1C1814] border-[#3D352A] hover:border-[#C9952B] text-[#FFFDFC]'
          }`}
          title={isListening ? 'Listening active' : 'Click to Speak'}
        >
          {isMicMuted ? <MicOff size={22} className="text-red-400" /> : <Mic size={22} />}
        </button>

        {/* Speaker Mute/Unmute */}
        <button
          onClick={() => {
            setIsSpeakerMuted(!isSpeakerMuted);
            if (audioRef.current) audioRef.current.muted = !isSpeakerMuted;
          }}
          className={`p-4 rounded-2xl border transition-all ${
            isSpeakerMuted
              ? 'bg-red-500/20 border-red-500 text-red-400'
              : 'bg-[#1C1814] border-[#3D352A] hover:border-[#C9952B] text-[#FFFDFC]'
          }`}
          title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
        >
          {isSpeakerMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>

        {/* End Call Button */}
        <button
          onClick={() => handleEndCall(false)}
          disabled={isEndingCall}
          className="px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isEndingCall ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating Vedic Report...
            </>
          ) : (
            <>
              <PhoneOff size={18} />
              End Consultation
            </>
          )}
        </button>
      </footer>

      {/* Ending Call Full-Screen Transition Overlay */}
      {isEndingCall && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-md text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#C9952B] flex items-center justify-center mb-4 relative shadow-lg shadow-[#C9952B]/30 animate-pulse">
            <Loader2 className="animate-spin text-[#C9952B]" size={36} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#C9952B]/20 text-[#E5B54F] border border-[#C9952B]/50 mb-3">
            <Sparkles size={13} /> Consultation Completed
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#FFFDFC] font-serif mb-2">
            Finalizing Vedic Report & Remedies
          </h2>
          <p className="text-xs text-[#E5D5BA] max-w-sm leading-relaxed">
            Generating your personalized chart observations, timeline predictions, and transcript. Redirecting you to your AI Reports...
          </p>
        </div>
      )}
    </div>
  );
}
