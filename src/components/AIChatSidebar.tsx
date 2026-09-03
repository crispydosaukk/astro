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
} from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import AppImage from '@/components/ui/AppImage';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations?: string[];
}

const DEFAULT_RECOMMENDATIONS = [
  '🔮 What do planetary transits say for me in 2026?',
  '❤️ When will I meet my compatible life partner?',
  '💼 When is the best time for a career change or promotion?',
  '✨ What is my lucky gemstone, rudraksha & daily mantra?',
  '🪐 Am I currently running Shani Sade Sati or Rahu Mahadasha?',
  '🙏 What specific Vedic remedies or charity should I perform?',
];

const QUICK_PROMPTS = DEFAULT_RECOMMENDATIONS;

const LANGUAGES = [
  { code: 'Telugu', label: 'తెలుగు (Telugu)', short: 'తె' },
  { code: 'Hindi', label: 'हिन्दी (Hindi)', short: 'हि' },
  { code: 'English', label: 'English', short: 'Eng' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)', short: 'த' },
];

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

  // Dynamic Pricing & Wallet
  const [pricePerPrompt, setPricePerPrompt] = useState<number>(5);
  const [currentWallet, setCurrentWallet] = useState<number>(0);

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

  // Exclude floating button on active call rooms
  const isCallRoom = pathname?.startsWith('/call/') || pathname?.startsWith('/ai-call/');

  // Sync wallet balance
  useEffect(() => {
    if (userData?.walletBalance !== undefined) {
      setCurrentWallet(Number(userData.walletBalance) || 0);
    }
  }, [userData]);

  // Fetch dynamic price from backend
  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/ai-chat');
        if (res.ok) {
          const data = await res.json();
          if (data?.pricePerPrompt !== undefined) {
            setPricePerPrompt(Number(data.pricePerPrompt));
          }
        }
      } catch (err) {
        console.warn('Could not fetch AI chat pricing:', err);
      }
    }
    fetchPricing();
  }, [isOpen]);

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isInsufficient) {
          setCurrentWallet(Number(data.availableBalance) || 0);
        }
        throw new Error(data.error || 'Unable to receive guidance at this moment.');
      }

      // Update remaining wallet balance
      if (data.newBalance !== undefined) {
        setCurrentWallet(Number(data.newBalance));
      }

      if (data.message) {
        const assistantMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message.content,
          timestamp: data.message.timestamp || new Date().toISOString(),
          recommendations:
            data.recommendations || data.message.recommendations || DEFAULT_RECOMMENDATIONS,
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

  if (isCallRoom) {
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
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=300"
                      alt="Acharya Parihar"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-[#FFFDFC]">Acharya Parihar</h3>
                      <ShieldCheck size={14} className="text-[#FFEBB3]" />
                    </div>
                    <p className="text-[10px] text-[#F3EBDD] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Vedic AI Astrologer • 24/7 Active
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
                      className="text-[11px] font-bold text-[#713B32] hover:text-[#C9952B] underline flex items-center gap-0.5"
                    >
                      Recharge <ArrowUpRight size={11} />
                    </Link>
                  ) : (
                    <Link
                      href="/sign-up-login-screen"
                      className="text-[11px] font-bold text-[#713B32] hover:text-[#C9952B] underline flex items-center gap-0.5"
                    >
                      Sign In <LogIn size={11} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Messages Scroll Area */}
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
                        className={`relative max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-[#713B32] text-white rounded-tr-xs font-medium'
                            : 'bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] rounded-tl-xs'
                        }`}
                      >
                        {/* Text Content */}
                        <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                          {m.content.split('\n\n').map((para, i) => (
                            <p key={i}>
                              {para.split('**').map((chunk, j) =>
                                j % 2 === 1 ? (
                                  <strong key={j} className={isUser ? 'text-[#FFEBB3]' : 'text-[#713B32]'}>
                                    {chunk}
                                  </strong>
                                ) : (
                                  chunk
                                )
                              )}
                            </p>
                          ))}
                        </div>

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
                      Acharya Parihar is examining your cosmic alignments...
                    </span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Pre-filled Quick Suggestions Bar */}
              <div className="p-2.5 bg-[#F8F3EA] border-t border-[#E5D9C8] overflow-x-auto flex items-center gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <span className="text-[10px] uppercase font-bold text-[#713B32] shrink-0 pl-1">
                  Suggestions:
                </span>
                {QUICK_PROMPTS.map((prompt, i) => (
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
                        placeholder="Ask about your Kundli, love, career, or remedies..."
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
