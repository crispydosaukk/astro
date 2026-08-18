'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Phone, CheckCircle2, User, Calendar, Sparkles, ChevronRight, Loader2, KeyRound } from 'lucide-react';
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
        if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Edmonton') || tz.includes('Winnipeg') || tz.includes('Halifax') || tz.includes('Montreal')) return 'ca';
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
  
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <div className="min-h-screen flex dark">
      <style dangerouslySetInnerHTML={{__html: `
        .react-tel-input .country-list .country.highlight,
        .react-tel-input .country-list .country:hover {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
        }
      `}} />

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 cosmic-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={`auth-star-${i}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: `${(i % 3) + 1}px`,
                height: `${(i % 3) + 1}px`,
                left: `${(i * 17) % 100}%`,
                top: `${(i * 13) % 100}%`,
                animationDelay: `${i * 0.15}s`,
                opacity: 0.3 + (i % 4) * 0.1,
              }}
            />
          ))}
        </div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative text-center space-y-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <AppLogo src="/AstroParihar_Top_Logo.jpg" size={56} />
          </div>

          <div className="w-48 h-48 mx-auto rounded-full gold-gradient-bg flex items-center justify-center animate-float shadow-2xl">
            <span className="text-8xl">🔮</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Your Stars Await</h2>
            <p className="text-white/60 text-base max-w-sm mx-auto leading-relaxed">
              Join 2,50,000+ seekers discovering their cosmic path through ancient Vedic wisdom and
              Expert intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <AppLogo src="/AstroParihar_Top_Logo.jpg" size={36} />
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
                <h1 className="text-2xl font-bold text-foreground mb-1">Sign In / Register</h1>
                <p className="text-sm text-muted-foreground mb-8">
                  Enter your phone number to continue your cosmic journey
                </p>

                <form onSubmit={requestOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
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
                          autoFocus: true
                        }}
                        containerClass="flex rounded-xl bg-input border border-border focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 transition-all overflow-visible w-full"
                        inputClass="!w-full !pl-[60px] !pr-4 !py-6 !bg-transparent !outline-none !text-sm !text-foreground !border-none"
                        buttonClass="!bg-transparent !border-none !border-r !border-border !rounded-l-xl hover:!bg-accent/50"
                        dropdownClass="!bg-[#0f1115] !text-[#f1f1f1] !border-border !rounded-xl !overflow-hidden !shadow-xl !z-50"
                        searchClass="!bg-input !text-foreground !border-border !py-2 !px-3"
                      />
                    </div>

                    {/* Carrier Rate Notice & Legal Consent */}
                    <div className="space-y-3 pt-1">
                      <p className="text-xs text-muted-foreground/80 text-center">
                        We will send OTP. Carrier rates may apply.
                      </p>

                      <div className="space-y-2 text-xs text-muted-foreground bg-white/5 border border-white/10 p-3.5 rounded-xl">
                        <p>
                          By Signing up, you agree to our{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-[#C9952B] underline font-semibold hover:text-[#e0ad3d] transition-colors"
                          >
                            Terms of Use
                          </button>{' '}
                          and{' '}
                          <button
                            type="button"
                            onClick={() => setShowPrivacyModal(true)}
                            className="text-[#C9952B] underline font-semibold hover:text-[#e0ad3d] transition-colors"
                          >
                            Privacy Policy
                          </button>
                        </p>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-muted-foreground select-none pt-1">
                          <input
                            type="checkbox"
                            checked={authorizedContact}
                            onChange={(e) => setAuthorizedContact(e.target.checked)}
                            className="w-4 h-4 rounded border-border text-[#C9952B] focus:ring-[#C9952B] accent-[#C9952B] cursor-pointer"
                          />
                          <span>I authorize AstroParihar & associates to contact me.</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phone.length < 8}
                    className="w-full py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
                <h1 className="text-2xl font-bold text-foreground mb-1">Verify OTP</h1>
                <p className="text-sm text-muted-foreground mb-8">
                  Enter the code sent to +{phone}
                </p>

                <form onSubmit={verifyOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      One-Time Password
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all text-center tracking-widest font-mono text-lg"
                        placeholder="••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:border-accent/50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 4}
                      className="flex-[2] py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>Verify & Continue <ChevronRight size={16} /></>
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
                <h1 className="text-2xl font-bold text-foreground mb-1">Complete Profile</h1>
                <p className="text-sm text-muted-foreground mb-8">
                  Just a few more details to start your journey
                </p>

                <form onSubmit={saveProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all"
                        placeholder="Arjun Sharma"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all custom-calendar-icon cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !name || !dob}
                    className="w-full py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>Complete Setup <CheckCircle2 size={16} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Success Popup Modal */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-card border border-border p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 gold-gradient-bg opacity-5 pointer-events-none" />
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent animate-pulse-glow relative z-10">
                <Sparkles size={40} className="animate-float" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-3 relative z-10">
                Success!
              </h3>
              <p className="text-base text-muted-foreground relative z-10">
                Welcome! Redirecting you to the portal...
              </p>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mt-8 relative z-10 text-green-500"
              >
                <CheckCircle2 size={32} className="mx-auto" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Use Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border max-w-2xl w-full max-h-[85vh] rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="text-xl font-bold text-foreground">Terms of Use</h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
              </div>

              <div className="overflow-y-auto py-6 space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <p><strong className="text-foreground">1. Introduction:</strong> Welcome to AstroParihar. By signing up or using our services, you agree to these Terms of Use and Privacy Policy.</p>
                <p><strong className="text-foreground">2. Communication Consent:</strong> By providing your mobile number, you authorize AstroParihar & authorized associates to send authentication OTPs, booking updates, and service communication. Standard carrier rates may apply.</p>
                <p><strong className="text-foreground">3. Astrological Guidance:</strong> AstroParihar provides digital Kundli analysis, Vedic remedies, and consultation services. Reports and advice are intended for personal guidance.</p>
                <p><strong className="text-foreground">4. Privacy & Payments:</strong> All transactions are securely processed via Razorpay. Your personal details and consultation records remain strictly private.</p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <a
                  href="/terms"
                  target="_blank"
                  className="text-xs text-[#C9952B] underline font-semibold hover:text-[#e0ad3d]"
                >
                  Read Full Terms Page →
                </a>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-white font-bold text-xs"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border max-w-2xl w-full max-h-[85vh] rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="text-xl font-bold text-foreground">Privacy Policy</h3>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
              </div>

              <div className="overflow-y-auto py-6 space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <p><strong className="text-foreground">1. Data Security:</strong> AstroParihar protects your personal birth details, mobile phone numbers, and astrological reports with strict confidentiality.</p>
                <p><strong className="text-foreground">2. Usage:</strong> Information collected during registration is used exclusively for generating accurate Vedic astrological charts and verifying account authentication.</p>
                <p><strong className="text-foreground">3. Call Encryption:</strong> Audio/video consultations with astrologers are encrypted, ensuring complete privacy during your session.</p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-xs text-[#C9952B] underline font-semibold hover:text-[#e0ad3d]"
                >
                  Read Full Privacy Policy Page →
                </a>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-6 py-2.5 rounded-xl gold-gradient-bg text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
