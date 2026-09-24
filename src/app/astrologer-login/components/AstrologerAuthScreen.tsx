'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  Phone,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { signInWithCustomToken } from 'firebase/auth';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

function detectDefaultCountry(): string {
  if (typeof window === 'undefined') return 'in';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      if (tz.includes('Kolkata') || tz.includes('Calcutta')) return 'in';
      if (tz.includes('London')) return 'gb';
      if (tz.startsWith('America/')) {
        if (
          tz.includes('Toronto') ||
          tz.includes('Vancouver') ||
          tz.includes('Edmonton') ||
          tz.includes('Winnipeg') ||
          tz.includes('Halifax') ||
          tz.includes('Montreal')
        )
          return 'ca';
        return 'us';
      }
      if (tz.startsWith('Australia/')) return 'au';
      if (tz.includes('Dubai')) return 'ae';
      if (tz.includes('Kathmandu')) return 'np';
      if (tz.includes('Dhaka')) return 'bd';
      if (tz.includes('Colombo')) return 'lk';
      if (tz.includes('Karachi')) return 'pk';
      if (tz.includes('Singapore')) return 'sg';
      if (tz.includes('Kuala_Lumpur')) return 'my';
      if (tz.includes('Bangkok')) return 'th';
      if (tz.includes('Jakarta')) return 'id';
      if (tz.includes('Auckland')) return 'nz';
      if (tz.includes('Paris')) return 'fr';
      if (tz.includes('Berlin')) return 'de';
      if (tz.includes('Rome')) return 'it';
      if (tz.includes('Madrid')) return 'es';
      if (tz.includes('Amsterdam')) return 'nl';
      if (tz.includes('Dublin')) return 'ie';
      if (tz.includes('Zurich')) return 'ch';
      if (tz.includes('Johannesburg')) return 'za';
      if (tz.includes('Riyadh')) return 'sa';
    }
  } catch (e) {
    console.error('Timezone detection error:', e);
  }
  return 'in';
}

interface AstrologerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status?: string;
}

export default function AstrologerAuthScreen() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState<string>('in');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Status error feedback
  const [errorState, setErrorState] = useState<{
    type: 'not_registered' | 'pending_approval' | 'general' | null;
    title: string;
    message: string;
    statusBadge?: string;
  } | null>(null);

  const [verifiedAstrologer, setVerifiedAstrologer] = useState<AstrologerRecord | null>(null);

  const router = useRouter();
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    setMounted(true);

    // Check if astrologer is already logged in
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('astro_verified_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.authenticated && parsed?.id) {
            router.push('/astrologer-dashboard');
          }
        } catch (e) {}
      }
    }
  }, [router]);

  // Auto detect user country code via timezone and IP lookup (identical to user login flow)
  useEffect(() => {
    const tzCountry = detectDefaultCountry();
    setCountryCode(tzCountry);

    let isMounted = true;
    fetch('https://api.country.is')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.country) {
          setCountryCode(data.country.toLowerCase());
        }
      })
      .catch(() => {
        fetch('https://ipapi.co/json/')
          .then((res) => res.json())
          .then((data) => {
            if (isMounted && data && data.country_code) {
              setCountryCode(data.country_code.toLowerCase());
            }
          })
          .catch(() => {});
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasteData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 4; i++) {
        newOtp[i] = pasteData[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasteData.length, 3);
      otpInputRefs[nextIndex].current?.focus();
    }
  };

  // STEP 1: Request OTP after validating astrologer approval
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 8) {
      setErrorState({
        type: 'general',
        title: 'Invalid Mobile Number',
        message: 'Please enter a complete and valid mobile number.',
      });
      return;
    }

    setIsLoading(true);
    setErrorState(null);

    const fullPhone = phone.startsWith('+') ? phone : `+${phone}`;

    try {
      const res = await fetch('/api/astrologer/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.registered === false) {
          setErrorState({
            type: 'not_registered',
            title: 'You are not a registered astrologer',
            message:
              'No registered astrologer account was found for this number. Please submit an application to join our verified panel or contact admin.',
          });
          setIsLoading(false);
          return;
        }

        if (data.registered === true && data.approved === false) {
          setErrorState({
            type: 'pending_approval',
            title: 'Application Pending Approval',
            statusBadge: data.status || 'Under Review',
            message:
              data.error ||
              'Your application has been received and is currently under verification. You can access the Astrologer Portal once your onboarding review is completed.',
          });
          setIsLoading(false);
          return;
        }

        throw new Error(data.error || 'Failed to dispatch verification code. Please try again.');
      }

      // Successful OTP dispatch
      setVerifiedAstrologer(data.astrologer);
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '']);
      toast.success('Verification code sent to ' + fullPhone);

      // Focus first digit after render
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 150);
    } catch (err: any) {
      setErrorState({
        type: 'general',
        title: 'Unable to Send Code',
        message: err.message || 'Failed to dispatch OTP. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP and Establish Session
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 4) {
      toast.error('Please enter the complete 4-digit code.');
      return;
    }

    setIsLoading(true);
    const fullPhone = phone.startsWith('+') ? phone : `+${phone}`;

    try {
      const res = await fetch('/api/astrologer/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          otp: fullOtp,
          astrologerId: verifiedAstrologer?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code. Please check and try again.');
      }

      // 1. Sign in with Custom Firebase Auth token if available
      if (data.token) {
        try {
          await signInWithCustomToken(auth, data.token);
        } catch (tokenErr) {
          console.warn('Firebase Custom Token sign-in note:', tokenErr);
        }
      }

      // 2. Persist verified session for Astrologer Portal
      const targetAstrologer = data.astrologer || verifiedAstrologer;
      const sessionData = {
        id: targetAstrologer.id,
        name: targetAstrologer.name,
        phone: targetAstrologer.phone || fullPhone,
        email: targetAstrologer.email || '',
        status: targetAstrologer.status || 'approved',
        authenticated: true,
        timestamp: Date.now(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('astro_verified_session', JSON.stringify(sessionData));
      }

      setShowSuccessPopup(true);
      toast.success(`Welcome ${targetAstrologer.name}!`);

      setTimeout(() => {
        router.push('/astrologer-dashboard');
      }, 1400);
    } catch (err: any) {
      toast.error(err.message || 'Invalid code. Please try again.');
      setOtp(['', '', '', '']);
      otpInputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setIsLoading(true);
    const fullPhone = phone.startsWith('+') ? phone : `+${phone}`;

    try {
      const res = await fetch('/api/astrologer/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }
      toast.success('New verification code sent via SMS!');
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '']);
      otpInputRefs[0].current?.focus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F3EA] text-[#292522] relative">
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFDFC]/95 backdrop-blur-md border border-[#E5D9C8] text-xs sm:text-sm font-bold text-[#713B32] hover:bg-[#EDE4D5] hover:text-[#552B24] transition-all shadow-md group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform text-[#B88A44]"
        />
        <span>Back to Home</span>
      </Link>

      {/* Left panel - Celestial Vedic Showcase */}
      <div className="hidden lg:flex lg:w-1/2 cosmic-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(45)].map((_, i) => (
            <div
              key={`auth-star-${i}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: `${(i % 3) + 1.5}px`,
                height: `${(i % 3) + 1.5}px`,
                left: `${(i * 17) % 100}%`,
                top: `${(i * 13) % 100}%`,
                animationDelay: `${i * 0.15}s`,
                opacity: 0.35 + (i % 4) * 0.15,
              }}
            />
          ))}
        </div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#713B32]/30 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full bg-[#B88A44]/20 blur-3xl" />

        <div className="relative text-center space-y-8 max-w-md z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-[#D8B66A]/40 text-[#F6D075] text-xs font-bold uppercase tracking-widest shadow-lg">
            <Sparkles size={14} className="text-[#D8B66A]" /> Verified Vedic Platform
          </div>

          <div className="w-40 h-40 mx-auto rounded-full gold-gradient-bg flex items-center justify-center animate-float shadow-2xl border-4 border-[#FFFDFC]/20">
            <span className="text-6xl drop-shadow-md">✨</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Astrologer Portal</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Fast, secure passwordless login for verified astrologers. Manage consultations, Kundali charts, and earnings in real time.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { value: '500+', label: 'Astrologers' },
              { value: '4.9★', label: 'App Rating' },
              { value: '18L+', label: 'Reports' },
            ].map((s) => (
              <div
                key={`auth-stat-${s.label}`}
                className="bg-[#FFFDFC]/10 backdrop-blur-md rounded-2xl p-3 text-center border border-[#D8B66A]/30 shadow-lg"
              >
                <div className="text-lg font-bold text-[#D8B66A] tabular-nums">{s.value}</div>
                <div className="text-[11px] text-white/80 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-white/60 text-xs pt-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>End-to-end encrypted mobile verification</span>
          </div>
        </div>
      </div>

      {/* Right panel - OTP Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#F8F3EA] overflow-y-auto pt-20 lg:pt-12">
        <div className="w-full max-w-md bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] shadow-2xl transition-all">
          <div className="flex items-center justify-center mb-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <AppLogo src="/astrologo.png" size={85} />
            </Link>
          </div>

          {step === 'phone' ? (
            /* STEP 1: Enter Mobile Number */
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#713B32]/10 text-[#713B32] text-xs font-bold mb-2">
                  <ShieldCheck size={13} /> Secure OTP Sign In
                </div>
                <h1 className="text-2xl font-bold text-[#292522]">Astrologer Login</h1>
                <p className="text-xs sm:text-sm text-[#6B5E55] mt-1">
                  Enter your registered mobile number to receive your sign-in code
                </p>
              </div>

              {/* Error State Banner */}
              {errorState && (
                <div
                  className={`p-4 rounded-2xl border text-left space-y-3 animate-fadeIn ${
                    errorState.type === 'not_registered'
                      ? 'bg-red-50/90 border-red-200 text-red-950'
                      : errorState.type === 'pending_approval'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={20}
                      className={`shrink-0 mt-0.5 ${
                        errorState.type === 'not_registered'
                          ? 'text-red-600'
                          : errorState.type === 'pending_approval'
                          ? 'text-amber-600'
                          : 'text-red-500'
                      }`}
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm leading-tight">{errorState.title}</p>
                        {errorState.statusBadge && (
                          <span className="text-3xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                            {errorState.statusBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">{errorState.message}</p>
                    </div>
                  </div>

                  {/* Contextual Action Buttons */}
                  {errorState.type === 'not_registered' && (
                    <div className="pt-2 border-t border-red-200/60 flex flex-col sm:flex-row gap-2">
                      <Link
                        href="/apply"
                        className="flex-1 py-2 px-3 text-xs font-bold text-center rounded-xl bg-[#713B32] text-white hover:bg-[#552B24] transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Sparkles size={13} /> Apply to Join Panel
                      </Link>
                      <a
                        href="mailto:astropariharuk@gmail.com?subject=Astrologer%20Registration%20Inquiry"
                        className="py-2 px-3 text-xs font-bold text-center rounded-xl bg-white border border-red-200 text-red-800 hover:bg-red-100/50 transition-all flex items-center justify-center gap-1"
                      >
                        <Mail size={12} /> Contact Admin
                      </a>
                    </div>
                  )}

                  {errorState.type === 'pending_approval' && (
                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                      <span className="text-2xs text-amber-800 flex items-center gap-1">
                        <Clock size={12} /> Verification board reviews within 24-48h
                      </span>
                      <a
                        href="mailto:astropariharuk@gmail.com?subject=Astrologer%20Application%20Status%20Inquiry"
                        className="py-1.5 px-2.5 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors inline-flex items-center gap-1"
                      >
                        <HelpCircle size={12} /> Contact Admin
                      </a>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#292522] uppercase tracking-wider mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="react-tel-input-custom">
                    <PhoneInput
                      country={countryCode}
                      value={phone}
                      onChange={(val) => {
                        setPhone(val);
                        if (errorState) setErrorState(null);
                      }}
                      enableSearch={true}
                      searchPlaceholder="Search country..."
                      inputProps={{
                        required: true,
                        autoFocus: true,
                      }}
                      containerClass="flex rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus-within:border-[#B88A44] focus-within:ring-2 focus-within:ring-[#B88A44]/20 transition-all overflow-visible w-full shadow-sm"
                      inputClass="!w-full !pl-[60px] !pr-4 !py-6 !bg-transparent !outline-none !text-sm !text-[#292522] !border-none !font-medium"
                      buttonClass="!bg-[#EDE4D5]/60 !border-none !border-r !border-[#E5D9C8] !rounded-l-xl hover:!bg-[#EDE4D5]"
                      dropdownClass="!bg-[#FFFDFC] !text-[#292522] !border-[#E5D9C8] !rounded-xl !overflow-hidden !shadow-2xl !z-50"
                      searchClass="!bg-[#F8F3EA] !text-[#292522] !border-[#E5D9C8] !py-2 !px-3"
                    />
                  </div>
                  <p className="text-3xs text-[#6B5E55] mt-2 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
                    Must match the mobile number submitted during your onboarding application.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phone.replace(/\D/g, '').length < 8}
                  className="w-full h-12 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Astrologer Status...</span>
                    </div>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-[#E5D9C8] text-center space-y-2">
                <p className="text-xs text-[#6B5E55]">
                  Not an onboarded astrologer yet?{' '}
                  <Link href="/apply" className="font-bold text-[#713B32] hover:underline">
                    Apply to join panel →
                  </Link>
                </p>
                <p className="text-3xs text-[#6B5E55]/80">
                  Questions regarding your onboarding status? Contact{' '}
                  <a
                    href="mailto:astropariharuk@gmail.com"
                    className="text-[#713B32] hover:underline font-semibold"
                  >
                    astropariharuk@gmail.com
                  </a>
                </p>
              </div>
            </div>
          ) : (
            /* STEP 2: Verify 4-Digit OTP */
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                  <CheckCircle2 size={13} /> Astrologer Account Verified
                </div>
                <h1 className="text-2xl font-bold text-[#292522]">Enter Code</h1>
                <p className="text-xs sm:text-sm text-[#6B5E55] mt-1">
                  We sent a 4-digit code to{' '}
                  <span className="font-bold text-[#292522]">
                    +{phone}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp(['', '', '', '']);
                    setErrorState(null);
                  }}
                  className="text-xs font-bold text-[#713B32] hover:underline mt-1 inline-flex items-center gap-1"
                >
                  Edit mobile number
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 4 Digit Boxes */}
                <div className="flex justify-center gap-3 sm:gap-4 my-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={`otp-box-${idx}`}
                      ref={otpInputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-bold rounded-2xl bg-[#FFFDFC] border-2 border-[#E5D9C8] focus:border-[#713B32] focus:ring-4 focus:ring-[#713B32]/10 outline-none text-[#292522] transition-all shadow-sm"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length < 4}
                  className="w-full h-12 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Verify & Enter Portal</span>
                    </>
                  )}
                </button>

                {/* Resend Code Action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#6B5E55]">Didn&apos;t receive the SMS?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="font-bold text-[#713B32] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Resend OTP
                    </button>
                  ) : (
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <Clock size={12} /> Resend in {resendTimer}s
                    </span>
                  )}
                </div>
              </form>

              <div className="pt-4 border-t border-[#E5D9C8] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp(['', '', '', '']);
                    setErrorState(null);
                  }}
                  className="text-xs text-[#6B5E55] hover:text-[#292522] font-semibold transition-colors"
                >
                  ← Back to phone number entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Popup Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showSuccessPopup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-[#FFFDFC] border border-[#E5D9C8] p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4 text-center relative overflow-hidden"
                >
                  <div className="w-20 h-20 rounded-full bg-[#EDE4D5] flex items-center justify-center mb-6 text-[#713B32] shadow-inner">
                    <Sparkles size={38} className="animate-float" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#292522] mb-2">
                    Namaste, {verifiedAstrologer?.name || 'Astrologer'} Ji! 🙏
                  </h3>
                  <p className="text-sm text-[#6B5E55] mb-4">
                    Your credentials have been verified. Launching your Astrologer Dashboard...
                  </p>
                  <div className="w-full bg-[#EDE4D5] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#713B32] h-full animate-progress" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
