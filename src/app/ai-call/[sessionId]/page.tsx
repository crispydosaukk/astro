'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AppImage from '@/components/ui/AppImage';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  ShieldCheck,
  Clock,
  Wallet,
  AlertTriangle,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  Download,
  Flame,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
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
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [finalSummary, setFinalSummary] = useState<AIConsultationSummary | null>(null);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

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
          if (data.status === 'completed' && data.summary) {
            setFinalSummary(data.summary);
            setShowSummaryModal(true);
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

  // 4. Setup Speech Recognition for hands-free voice talking
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
      rec.lang = 'en-IN';

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
  }, []);

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
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  // 5. AI Voice / Speech Exchange Handler
  const triggerAiVoiceExchange = async (userText: string | null, isInitial = false) => {
    setIsGeneratingReply(true);
    try {
      const res = await fetch('/api/ai-consultation/voice-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userMessage: userText,
          action: 'chat_voice',
        }),
      });

      const data = await res.json();

      if (data.replyText) {
        const aiMsg = {
          role: 'assistant',
          content: data.replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Play Synthesized Voice Audio if available
        if (data.audioBase64 && !isSpeakerMuted) {
          playAudioFromBase64(data.audioBase64);
        } else if ('speechSynthesis' in window && !isSpeakerMuted) {
          // Browser native TTS fallback
          const utterance = new SpeechSynthesisUtterance(data.replyText);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          utterance.onstart = () => setIsAiSpeaking(true);
          utterance.onend = () => setIsAiSpeaking(false);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error('Voice exchange error:', err);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const playAudioFromBase64 = (base64String: string) => {
    try {
      const audioUrl = `data:audio/mp3;base64,${base64String}`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsAiSpeaking(true);
        audioRef.current.onended = () => {
          setIsAiSpeaking(false);
        };
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
      setIsAiSpeaking(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isGeneratingReply) return;

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Trigger AI response
    triggerAiVoiceExchange(text);
  };

  // 6. End Call & Generate Summary
  const handleEndCall = async (dueToLowBalance = false) => {
    setIsEndingCall(true);
    setCallActive(false);
    if (audioRef.current) audioRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    try {
      const res = await fetch('/api/ai-consultation/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          durationSeconds,
          conversationTranscript: messages,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        setFinalSummary(data.summary);
        setShowSummaryModal(true);
      }
    } catch (err) {
      console.error('Error ending call:', err);
    } finally {
      setIsEndingCall(false);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#C9952B] mb-4" size={48} />
        <p className="text-muted-foreground font-serif">Connecting to Celestial AI Astrologer...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-foreground flex flex-col justify-between relative overflow-hidden select-none">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Top Session Navigation & Ticker HUD */}
      <header className="px-6 py-4 bg-card/60 backdrop-blur-md border-b border-border/40 z-30 flex items-center justify-between">
        {/* Left: Astrologer Badge */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#C9952B] relative">
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
              <h2 className="font-bold text-sm text-foreground">{session?.astrologerName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9952B]/20 text-[#C9952B]">
                {session?.primaryDiscipline}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Consultation ({session?.language || 'English'})
            </p>
          </div>
        </div>

        {/* Center: Live Timer & Billed Minutes */}
        <div className="hidden md:flex items-center gap-4 bg-background/60 px-5 py-2 rounded-2xl border border-border/80 shadow-inner">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-emerald-400">
            <Clock size={16} className="animate-spin text-[#C9952B]" />
            {formatTimer(durationSeconds)}
          </div>
          <span className="text-muted-foreground/40">|</span>
          <div className="text-xs text-muted-foreground">
            Billed: <span className="font-bold text-foreground">{billedMinutes} min</span> (
            {formatPrice(session?.pricePerMin * billedMinutes)})
          </div>
        </div>

        {/* Right: Wallet Balance & Kundli HUD Button */}
        <div className="flex items-center gap-3">
          <div className="bg-muted/40 px-3.5 py-1.5 rounded-xl border border-border/60 flex items-center gap-2 text-xs">
            <Wallet size={14} className="text-[#C9952B]" />
            <span className="font-bold text-foreground">{formatPrice(currentBalance)}</span>
          </div>

          <button
            onClick={() => setShowChartDrawer(!showChartDrawer)}
            className="px-3 py-1.5 rounded-xl bg-card border border-border/80 hover:border-[#C9952B] text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all"
          >
            <Sparkles size={13} className="text-[#C9952B]" />
            <span className="hidden sm:inline">Birth Chart</span>
          </button>
        </div>
      </header>

      {/* Low Balance Warning Banner */}
      {lowBalanceAlert && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-center text-xs text-amber-400 flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle size={15} />
          <span>
            Low Balance Warning: Under 2 minutes remaining. Top up to avoid disconnection.
          </span>
          <Link
            href={`/wallet?redirect=${encodeURIComponent(`/ai-call/${sessionId}`)}`}
            target="_blank"
            className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px] ml-2 hover:bg-amber-400"
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
                <div className="absolute w-72 h-72 rounded-full border border-[#C9952B]/30 animate-ping opacity-30" />
                <div className="absolute w-80 h-80 rounded-full border border-[#713B32]/30 animate-pulse opacity-40" />
              </>
            )}

            {/* Central Avatar Frame */}
            <div
              className={`w-44 h-44 rounded-full p-1.5 transition-all duration-500 ${
                isAiSpeaking
                  ? 'bg-gradient-to-tr from-[#C9952B] via-[#E5B54F] to-[#713B32] shadow-2xl shadow-[#C9952B]/40 scale-105'
                  : 'bg-card border-2 border-border/80'
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
            <h3 className="text-xl font-bold text-foreground font-serif">
              {session?.astrologerName}
            </h3>
            <p className="text-xs text-[#C9952B] font-medium tracking-wide mt-0.5">
              {isAiSpeaking
                ? '✦ Speaking guidance...'
                : isGeneratingReply
                  ? '✦ Consulting birth chart...'
                  : isListening
                    ? '✦ Listening to you...'
                    : '✦ Listening · Tap mic or speak'}
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
                    ? 'bg-gradient-to-t from-[#713B32] to-[#C9952B]'
                    : isListening
                      ? 'bg-emerald-400'
                      : 'bg-muted/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Live Transcript & Chat Log */}
        <div className="w-full lg:w-96 h-80 lg:h-[420px] bg-card/40 backdrop-blur-md border border-border/70 rounded-3xl p-4 flex flex-col justify-between shadow-2xl">
          <div className="border-b border-border/40 pb-2 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText size={13} className="text-[#C9952B]" /> Live Transcript
            </span>
            <span className="text-[10px] text-muted-foreground">{messages.length} exchanges</span>
          </div>

          {/* Chat Messages Log */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                <Sparkles size={24} className="text-[#C9952B] mb-2 opacity-60" />
                <p>Welcome! Speak directly or send a message to ask your question.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[88%] ${
                    msg.role === 'user'
                      ? 'ml-auto bg-[#C9952B]/20 border border-[#C9952B]/40 text-foreground'
                      : 'mr-auto bg-muted/60 border border-border text-foreground/90'
                  }`}
                >
                  <div className="text-[10px] text-muted-foreground mb-1 font-semibold">
                    {msg.role === 'user' ? 'You' : session?.astrologerName} · {msg.time}
                  </div>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              ))
            )}
            {isGeneratingReply && (
              <div className="mr-auto bg-muted/60 border border-border p-3 rounded-2xl text-[11px] text-muted-foreground flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-[#C9952B]" />
                Analyzing planetary alignments...
              </div>
            )}
          </div>

          {/* Quick Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="pt-2 border-t border-border/50 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-background/80 border border-border text-xs focus:border-[#C9952B] outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isGeneratingReply}
              className="p-2 rounded-xl bg-[#C9952B] text-white disabled:opacity-40 hover:bg-[#b08022] transition-colors"
            >
              <Send size={14} />
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-card border border-border/80 rounded-3xl p-5 shadow-2xl z-40 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] flex items-center gap-1.5">
                <Sparkles size={14} /> Synthesized Birth Chart Profile
              </h4>
              <button
                onClick={() => setShowChartDrawer(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Lagna (Ascendant)
                </span>
                <span className="font-bold text-foreground">
                  {session?.astroContext?.lagna || 'Scorpio'}
                </span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Moon Sign (Rashi)
                </span>
                <span className="font-bold text-foreground">
                  {session?.astroContext?.moonRashi || 'Aries'}
                </span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block">Nakshatra</span>
                <span className="font-bold text-foreground">
                  {session?.astroContext?.nakshatra || 'Bharani'}
                </span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block">
                  Active Dasha
                </span>
                <span className="font-bold text-emerald-400">
                  {session?.astroContext?.currentDasha || 'Jupiter-Mars'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-3 italic">
              Devotee: {session?.birthDetails?.name} · Born {session?.birthDetails?.dob} at{' '}
              {session?.birthDetails?.place} · Topic: {session?.birthDetails?.primaryConcern}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Call Control Bar */}
      <footer className="p-6 bg-card/60 backdrop-blur-md border-t border-border/40 z-30 flex items-center justify-center gap-4">
        {/* Mic Listen Toggle */}
        <button
          onClick={toggleMicListening}
          className={`p-4 rounded-2xl border transition-all ${
            isListening
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 scale-110'
              : 'bg-card border-border hover:border-[#C9952B] text-foreground'
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
              : 'bg-card border-border hover:border-[#C9952B] text-foreground'
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
              Generating Summary...
            </>
          ) : (
            <>
              <PhoneOff size={18} />
              End Consultation
            </>
          )}
        </button>
      </footer>

      {/* Post-Consultation AI Summary & Vedic Remedies Modal */}
      <AnimatePresence>
        {showSummaryModal && finalSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 cosmic-bg border-b border-border text-center relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C9952B]/20 text-[#C9952B] border border-[#C9952B]/40 mb-2">
                  <Sparkles size={12} /> Consultation Completed
                </div>
                <h2 className="text-xl font-bold text-foreground font-serif">
                  Vedic Astrological Summary & Remedies
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Consultation with {session?.astrologerName} ({session?.primaryDiscipline})
                </p>
              </div>

              {/* Summary Content Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm">
                {/* Billing Recap */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-2xl border border-border text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">
                      Duration
                    </span>
                    <span className="font-bold text-foreground">{billedMinutes} Minutes</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">
                      Amount Paid
                    </span>
                    <span className="font-bold text-[#C9952B]">
                      {formatPrice(session?.pricePerMin * billedMinutes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">
                      Remaining Balance
                    </span>
                    <span className="font-bold text-emerald-400">
                      {formatPrice(currentBalance)}
                    </span>
                  </div>
                </div>

                {/* Overview */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] mb-1.5">
                    Consultation Overview
                  </h4>
                  <p className="text-xs text-foreground/90 leading-relaxed bg-card p-3 rounded-xl border border-border">
                    {finalSummary.overview}
                  </p>
                </div>

                {/* Astrological Highlights */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] mb-2">
                    Key Planetary Observations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {finalSummary.astrologicalHighlights?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeline Predictions */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] mb-2">
                    Timeline Predictions
                  </h4>
                  <div className="space-y-2">
                    {finalSummary.timelinePredictions?.map((pred, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-card border border-border/80 text-xs text-foreground/90"
                      >
                        {pred}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Remedies */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9952B] mb-2">
                    Recommended Vedic Remedies & Mantras
                  </h4>
                  <div className="space-y-2.5">
                    {finalSummary.recommendedRemedies?.map((rem, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-[#C9952B] uppercase">
                            {rem.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#C9952B]/20 text-[#C9952B] uppercase font-semibold">
                            {rem.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{rem.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Closing Blessing */}
                <div className="p-3.5 bg-gradient-to-r from-[#713B32]/30 to-[#C9952B]/20 rounded-2xl border border-[#C9952B]/40 text-center">
                  <p className="text-xs font-medium text-foreground italic">
                    "{finalSummary.panditJiFinalBlessing}"
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-border hover:border-[#C9952B] text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Download size={14} /> Print / Save Summary
                </button>
                <button
                  onClick={() => router.push('/ai-consultations')}
                  className="px-6 py-2 rounded-xl bg-[#C9952B] text-white text-xs font-bold hover:bg-[#b08022] transition-colors"
                >
                  View All Consultations
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
