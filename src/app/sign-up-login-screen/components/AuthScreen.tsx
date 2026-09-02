'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  Phone,
  CheckCircle2,
  User,
  Calendar,
  Sparkles,
  ChevronRight,
  Loader2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

export default function AuthScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState<string>('in');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [authorizedContact, setAuthorizedContact] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dynamic CMS branding state for left banner
  const [authCms, setAuthCms] = useState({
    badge: 'Authentic Vedic Guidance',
    title: 'Your Stars Await',
    subtitle:
      'Join 2,50,000+ seekers discovering their cosmic path through authentic Vedic wisdom and expert guidance.',
    icon: '🔮',
    highlight1: 'Certified Astrologers',
    highlight2: '100% Confidential',
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    async function loadAuthCms() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'auth_page'));
        if (snap.exists()) {
          setAuthCms((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (_e) {
        // Fallback to default
      }
    }
    loadAuthCms();
  }, []);

  // Auto detect user country code via timezone and IP lookup
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

  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      localStorage.setItem('auth_redirect', redirectParam);
    }
  }, [searchParams]);

  const getTargetRedirect = useCallback(() => {
    const redirectParam = searchParams.get('redirect');
    const storedRedirect = localStorage.getItem('auth_redirect');

    if (redirectParam) {
      localStorage.removeItem('auth_redirect');
      return redirectParam;
    }
    if (storedRedirect) {
      localStorage.removeItem('auth_redirect');
      return storedRedirect;
    }
    return '/';
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && step !== 3 && step !== 2) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          router.push(getTargetRedirect());
        } else {
          setStep(3);
        }
      }
    });
    return () => unsubscribe();
  }, [router, step, getTargetRedirect]);

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep(2);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // Login to Firebase with Custom Token
      const userCredential = await signInWithCustomToken(auth, data.token);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const docData = userDocSnap.data();
        if (!docData.phone) {
          await setDoc(userDocRef, { phone: '+' + phone.replace(/\D/g, '') }, { merge: true });
        }
        setShowSuccessPopup(true);
        setTimeout(() => {
          router.push(getTargetRedirect());
        }, 600);
      } else {
        setStep(3);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        name,
        dob,
        phone: '+' + phone.replace(/\D/g, ''),
        createdAt: new Date().toISOString(),
      });

      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push(getTargetRedirect());
      }, 600);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to save profile. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F3EA] text-[#292522] relative">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .react-tel-input .country-list .country.highlight {
          background-color: #EDE4D5 !important;
          color: #292522 !important;
        }
        .react-tel-input .country-list {
          background-color: #FFFDFC !important;
          color: #292522 !important;
          border: 1px solid #E5D9C8 !important;
        }
      `,
        }}
      />

      {/* Back to Home Floating Navigation Button */}
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

      {/* Left panel - Cosmic Celestial Brand Showcase */}
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
            <Sparkles size={14} className="text-[#D8B66A]" /> {authCms.badge}
          </div>

          <div className="w-40 h-40 mx-auto rounded-full gold-gradient-bg flex items-center justify-center animate-float shadow-2xl border-4 border-[#FFFDFC]/20">
            <span className="text-6xl drop-shadow-md">{authCms.icon}</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">{authCms.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed">{authCms.subtitle}</p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#D8B66A]" /> {authCms.highlight1}
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#D8B66A]" /> {authCms.highlight2}
            </span>
          </div>
        </div>
      </div>

      {/* Right panel - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#F8F3EA] overflow-y-auto pt-20 lg:pt-12">
        <div className="w-full max-w-md bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] shadow-2xl">
          {/* Brand Logo matching Header */}
          <div className="flex items-center justify-center mb-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <AppLogo src="/astrologo.png" size={85} />
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 text-center sm:text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#713B32] bg-[#EDE4D5] px-3 py-1 rounded-full inline-block mb-2">
                    Vedic Astro Portal
                  </span>
                  <h1 className="text-2xl font-bold text-[#292522] mb-1">Sign In / Register</h1>
                  <p className="text-sm text-[#6B5E55]">
                    Enter your phone number to continue your cosmic journey
                  </p>
                </div>

                <form onSubmit={requestOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                      Phone Number
                    </label>
                    <div className="react-tel-input-custom">
                      <PhoneInput
                        country={countryCode}
                        value={phone}
                        onChange={(phone) => setPhone(phone)}
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

                    {/* Carrier Rate Notice & Legal Consent */}
                    <div className="space-y-3 pt-2">
                      <p className="text-xs text-[#6B5E55] text-center">
                        We will send OTP. Carrier rates may apply.
                      </p>

                      <div className="space-y-2 text-xs text-[#6B5E55] bg-[#F8F3EA] border border-[#E5D9C8] p-3.5 rounded-xl">
                        <p>
                          By Signing up, you agree to our{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-[#713B32] underline font-semibold hover:text-[#552B24] transition-colors"
                          >
                            Terms of Use
                          </button>{' '}
                          and{' '}
                          <button
                            type="button"
                            onClick={() => setShowPrivacyModal(true)}
                            className="text-[#713B32] underline font-semibold hover:text-[#552B24] transition-colors"
                          >
                            Privacy Policy
                          </button>
                        </p>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#6B5E55] select-none pt-1">
                          <input
                            type="checkbox"
                            checked={authorizedContact}
                            onChange={(e) => setAuthorizedContact(e.target.checked)}
                            className="w-4 h-4 rounded border-[#E5D9C8] text-[#713B32] focus:ring-[#713B32] accent-[#713B32] cursor-pointer"
                          />
                          <span>I authorize AstroParihar & associates to contact me.</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phone.length < 8}
                    className="w-full py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={16} /> Send OTP
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-[#292522] mb-1">Verify OTP</h1>
                  <p className="text-sm text-[#6B5E55]">
                    Enter the verification code sent to{' '}
                    <strong className="text-[#292522]">+{phone}</strong>
                  </p>
                </div>

                <form onSubmit={verifyOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                      One-Time Password
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55]"
                      />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-base transition-all text-center tracking-widest font-mono text-[#292522] font-bold shadow-sm"
                        placeholder="••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl border border-[#E5D9C8] text-sm font-bold text-[#292522] hover:bg-[#F8F3EA] transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 4}
                      className="flex-[2] py-3 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
                    >
                      {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          Verify & Continue <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-[#292522] mb-1">Complete Profile</h1>
                  <p className="text-sm text-[#6B5E55]">
                    Just a few details to create your personalized Vedic charts
                  </p>
                </div>

                <form onSubmit={saveProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55]"
                      />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                        placeholder="Arjun Sharma"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55] pointer-events-none"
                      />
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all cursor-pointer shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !name || !dob}
                    className="w-full py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Complete Setup <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
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
                  className="bg-[#FFFDFC] border border-[#E5D9C8] p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4 text-center relative overflow-hidden"
                >
                  <div className="w-20 h-20 rounded-full bg-[#EDE4D5] flex items-center justify-center mb-6 text-[#713B32]">
                    <Sparkles size={40} className="animate-float" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#292522] mb-3">Success!</h3>
                  <p className="text-base text-[#6B5E55]">
                    Welcome! Redirecting you to your Vedic portal...
                  </p>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="mt-8 text-emerald-600"
                  >
                    <CheckCircle2 size={36} className="mx-auto" />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Terms of Use Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showTermsModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="bg-[#FFFDFC] border border-[#E5D9C8] max-w-2xl w-full max-h-[85vh] rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl relative"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5D9C8]">
                    <h3 className="text-xl font-bold text-[#292522]">Terms of Use</h3>
                    <button
                      onClick={() => setShowTermsModal(false)}
                      className="p-2 rounded-full hover:bg-[#EDE4D5] text-[#6B5E55] hover:text-[#292522] transition-colors"
                    >
                      <span className="text-xl font-bold">✕</span>
                    </button>
                  </div>

                  <div className="overflow-y-auto py-6 space-y-4 text-xs sm:text-sm text-[#6B5E55] leading-relaxed">
                    <p>
                      <strong className="text-[#292522]">1. Introduction:</strong> Welcome to
                      AstroParihar. By signing up or using our services, you agree to these Terms of
                      Use and Privacy Policy.
                    </p>
                    <p>
                      <strong className="text-[#292522]">2. Communication Consent:</strong> By
                      providing your mobile number, you authorize AstroParihar & authorized
                      associates to send authentication OTPs, booking updates, and service
                      communication. Standard carrier rates may apply.
                    </p>
                    <p>
                      <strong className="text-[#292522]">3. Astrological Guidance:</strong>{' '}
                      AstroParihar provides digital Kundli analysis, Vedic remedies, and
                      consultation services. Reports and advice are intended for personal guidance.
                    </p>
                    <p>
                      <strong className="text-[#292522]">4. Privacy & Payments:</strong> All
                      transactions are securely processed via Razorpay. Your personal details and
                      consultation records remain strictly private.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5D9C8] flex items-center justify-between">
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-xs text-[#713B32] underline font-semibold hover:text-[#552B24]"
                    >
                      Read Full Terms Page →
                    </a>
                    <button
                      onClick={() => setShowTermsModal(false)}
                      className="px-6 py-2.5 rounded-xl gold-gradient-bg text-white font-bold text-xs shadow-sm hover:opacity-95"
                    >
                      I Understand
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Privacy Policy Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showPrivacyModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="bg-[#FFFDFC] border border-[#E5D9C8] max-w-2xl w-full max-h-[85vh] rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl relative"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5D9C8]">
                    <h3 className="text-xl font-bold text-[#292522]">Privacy Policy</h3>
                    <button
                      onClick={() => setShowPrivacyModal(false)}
                      className="p-2 rounded-full hover:bg-[#EDE4D5] text-[#6B5E55] hover:text-[#292522] transition-colors"
                    >
                      <span className="text-xl font-bold">✕</span>
                    </button>
                  </div>

                  <div className="overflow-y-auto py-6 space-y-4 text-xs sm:text-sm text-[#6B5E55] leading-relaxed">
                    <p>
                      <strong className="text-[#292522]">1. Data Security:</strong> AstroParihar
                      protects your personal birth details, mobile phone numbers, and astrological
                      reports with strict confidentiality.
                    </p>
                    <p>
                      <strong className="text-[#292522]">2. Usage:</strong> Information collected
                      during registration is used exclusively for generating accurate Vedic
                      astrological charts and verifying account authentication.
                    </p>
                    <p>
                      <strong className="text-[#292522]">3. Call Encryption:</strong> Audio/video
                      consultations with astrologers are encrypted, ensuring complete privacy during
                      your session.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5D9C8] flex items-center justify-between">
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-xs text-[#713B32] underline font-semibold hover:text-[#552B24]"
                    >
                      Read Full Privacy Policy Page →
                    </a>
                    <button
                      onClick={() => setShowPrivacyModal(false)}
                      className="px-6 py-2.5 rounded-xl gold-gradient-bg text-white font-bold text-xs shadow-sm hover:opacity-95"
                    >
                      Close
                    </button>
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
