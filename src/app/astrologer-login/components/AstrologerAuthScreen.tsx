'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import AppLogo from '@/components/ui/AppLogo';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Star,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, runTransaction, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

type AuthMode = 'login' | 'signup' | 'otp';
type SignupStep = 1 | 2;

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dob: string;
  city: string;
  gender: string;
  languages: string;
  skills: string;
  phoneType: string;
  workingElsewhere: string;
  dailyHours: string;
  learningSource: string;
}

export default function AstrologerAuthScreen() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<'login' | null>(null);
  const [signupSuccessToken, setSignupSuccessToken] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const pobRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const loginForm = useForm<LoginForm>({
    defaultValues: { email: '', password: '', remember: false },
  });
  const signupForm = useForm<SignupForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: '',
      city: '',
      gender: '',
      languages: '',
      skills: '',
      phoneType: '',
      workingElsewhere: 'no',
      dailyHours: '',
      learningSource: '',
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: any) => {
      if (currentUser) {
        const astDocRef = doc(db, 'astrologers', currentUser.uid);
        const astDocSnap = await getDoc(astDocRef);
        if (astDocSnap.exists()) {
          router.push('/astrologer-dashboard');
        } else {
          await signOut(auth);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (step === 1 && isGoogleLoaded && pobRef.current) {
      if (!(pobRef.current as any)._autocompleteAttached) {
        const autocomplete = new (window as any).google.maps.places.Autocomplete(pobRef.current, {
          types: ['(cities)'],
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.formatted_address) {
            signupForm.setValue('city', place.formatted_address, { shouldValidate: true });
          } else if (place && place.name) {
            signupForm.setValue('city', place.name, { shouldValidate: true });
          }
        });
        (pobRef.current as any)._autocompleteAttached = true;
      }
    }
  }, [step, isGoogleLoaded, signupForm]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Fetch astrologer document
      const astDocRef = doc(db, 'astrologers', user.uid);
      const astDocSnap = await getDoc(astDocRef);

      if (!astDocSnap.exists()) {
        await signOut(auth);
        loginForm.setError('email', { message: 'No astrologer account found for this email.' });
        setIsLoading(false);
        return;
      }

      const astData = astDocSnap.data();

      if (astData.status !== 'approved') {
        await signOut(auth);
        loginForm.setError('email', {
          message: `Your application is currently ${astData.status || 'pending'}. Please wait for admin approval.`,
        });
        setIsLoading(false);
        return;
      }

      setShowSuccessPopup('login');
      setTimeout(() => {
        window.location.href = '/astrologer-dashboard';
      }, 2500);
    } catch (error: any) {
      loginForm.setError('email', { message: 'Invalid email or password. Please try again.' });
      setIsLoading(false);
    }
  };

  const onSignup = async (data: SignupForm) => {
    if (step === 1) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      let tokenValue = 1;
      const counterRef = doc(db, 'system', 'astrologerCounter');

      try {
        await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          if (!counterDoc.exists()) {
            transaction.set(counterRef, { count: 1 });
          } else {
            tokenValue = counterDoc.data().count + 1;
            transaction.update(counterRef, { count: tokenValue });
          }
        });
      } catch (err) {
        console.error('Transaction failed: ', err);
        // Fallback to random if transaction fails for any reason
        tokenValue = Math.floor(100 + Math.random() * 900);
      }

      const formattedToken = tokenValue.toString().padStart(3, '0');

      await setDoc(doc(db, 'astrologers', user.uid), {
        name: data.name,
        email: data.email,
        dob: data.dob,
        city: data.city,
        gender: data.gender,
        languages: data.languages,
        skills: data.skills,
        phoneType: data.phoneType,
        workingElsewhere: data.workingElsewhere,
        dailyHours: data.dailyHours,
        learningSource: data.learningSource,
        role: 'astrologer',
        status: 'pending',
        tokenNumber: formattedToken,
        createdAt: new Date().toISOString(),
      });

      await signOut(auth);

      setSignupSuccessToken(formattedToken);
      setIsLoading(false);
      loginForm.setValue('email', data.email);
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F3EA] text-[#292522]">
      <Script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA-CXsyKpvFtpidpOkhOiIQGfXFO3O5lKA&libraries=places"
        strategy="lazyOnload"
        onReady={() => setIsGoogleLoaded(true)}
      />
      {/* Left panel - Celestial Showcase */}
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
          {/* Framed Luxury Logo Capsule */}
          <div className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[#FFFDFC]/95 backdrop-blur-md border border-[#D8B66A]/40 shadow-2xl">
            <AppLogo src="/AstroParihar_Logo.png" size={52} />
          </div>

          <div className="w-44 h-44 mx-auto rounded-full gold-gradient-bg flex items-center justify-center animate-float shadow-2xl border-4 border-[#FFFDFC]/20">
            <span className="text-7xl drop-shadow-md">✨</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Join as an Astrologer</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Guide thousands of seekers on their cosmic journey using our verified Vedic platform.
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
                <div className="text-[11px] text-white/70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Astrologer Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#F8F3EA] overflow-y-auto">
        <div className="w-full max-w-md bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] shadow-xl">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] shadow-sm">
              <AppLogo src="/AstroParihar_Logo.png" size={38} />
            </div>
          </div>

          {signupSuccessToken ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 flex flex-col items-center w-full text-center relative overflow-hidden"
            >
              <div className="w-20 h-20 rounded-full bg-[#EDE4D5] flex items-center justify-center mb-6 text-[#713B32]">
                <Sparkles size={40} className="animate-float" />
              </div>
              <h3 className="text-2xl font-bold text-[#292522] mb-3">Thank You!</h3>
              <div className="text-sm text-[#6B5E55] space-y-3 leading-relaxed">
                <p>
                  Thank you for submitting your details with AstroParihar! Your token number is{' '}
                  <strong className="text-[#713B32] font-bold text-base">#{signupSuccessToken}</strong>.
                </p>
                <p className="text-xs">
                  Please join the waitlist on the Astrologer Hiring App once you get shortlisted. You will be notified via WhatsApp and email.
                </p>
                <p className="text-xs">
                  For further details, reach out at <span className="font-semibold text-[#292522]">onboarding@astroparihar.com</span>.
                </p>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mt-6 text-emerald-600"
              >
                <CheckCircle2 size={36} className="mx-auto" />
              </motion.div>

              <button
                onClick={() => {
                  setSignupSuccessToken(null);
                  setMode('login');
                  setStep(1);
                  signupForm.reset();
                }}
                className="mt-8 px-6 py-2.5 rounded-xl border border-[#E5D9C8] text-sm font-bold text-[#292522] hover:bg-[#F8F3EA] transition-all"
              >
                Go back to Login
              </button>
            </motion.div>
          ) : (
            <>
              {/* Mode tabs */}
              <div className="flex rounded-xl bg-[#EDE4D5] p-1 mb-8">
                {(['login', 'signup'] as const).map((m) => (
                  <button
                    key={`mode-${m}`}
                    onClick={() => {
                      setMode(m);
                      setStep(1);
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                      mode === m
                        ? 'bg-[#FFFDFC] text-[#713B32] shadow-sm'
                        : 'text-[#6B5E55] hover:text-[#292522]'
                    }`}
                  >
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {mode === 'login' && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-[#292522] mb-1">Astrologer Portal</h1>
                      <p className="text-sm text-[#6B5E55]">
                        Sign in to your Vedic astrologer dashboard
                      </p>
                    </div>

                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55]"
                          />
                          <input
                            type="email"
                            {...loginForm.register('email', {
                              required: 'Email is required',
                              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                            })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                            placeholder="guru@astroparihar.com"
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55]"
                          />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            {...loginForm.register('password', {
                              required: 'Password is required',
                            })}
                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55] hover:text-[#292522] transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-red-500 text-xs mt-1">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-[#292522] cursor-pointer">
                          <input
                            type="checkbox"
                            {...loginForm.register('remember')}
                            className="rounded border-[#E5D9C8] text-[#713B32] focus:ring-[#713B32] accent-[#713B32]"
                          />
                          <span>Remember me</span>
                        </label>
                        <button type="button" className="text-sm font-semibold text-[#713B32] hover:underline">
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:shadow-lg"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles size={16} /> Sign In
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {mode === 'signup' && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-6">
                      {[1, 2].map((s) => (
                        <React.Fragment key={`step-${s}`}>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              step >= s
                                ? 'gold-gradient-bg text-white shadow-sm'
                                : 'bg-[#EDE4D5] text-[#6B5E55]'
                            }`}
                          >
                            {s}
                          </div>
                          {s < 2 && (
                            <div
                              className={`flex-1 h-1 rounded-full transition-all ${
                                step > s ? 'gold-gradient-bg' : 'bg-[#EDE4D5]'
                              }`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <h1 className="text-2xl font-bold text-[#292522] mb-1">
                      {step === 1 ? 'Personal Details' : 'Professional Details'}
                    </h1>
                    <p className="text-sm text-[#6B5E55] mb-8">
                      {step === 1
                        ? 'Basic information to get started'
                        : 'Tell us about your astrology background'}
                    </p>

                    <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-5">
                      {step === 1 && (
                        <>
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
                                {...signupForm.register('name', { required: 'Name is required' })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                                placeholder="Guru Sharma"
                              />
                            </div>
                            {signupForm.formState.errors.name && (
                              <p className="text-red-500 text-xs mt-1">
                                {signupForm.formState.errors.name.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55]"
                              />
                              <input
                                type="email"
                                {...signupForm.register('email', {
                                  required: 'Email is required',
                                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                                })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                                placeholder="guru@example.com"
                              />
                            </div>
                            {signupForm.formState.errors.email && (
                              <p className="text-red-500 text-xs mt-1">
                                {signupForm.formState.errors.email.message}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                                Date of Birth
                              </label>
                              <div className="relative">
                                <input
                                  type="date"
                                  {...signupForm.register('dob', {
                                    required: 'Date of birth required',
                                  })}
                                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm cursor-pointer"
                                />
                              </div>
                              {signupForm.formState.errors.dob && (
                                <p className="text-red-500 text-xs mt-1">
                                  {signupForm.formState.errors.dob.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                                Gender
                              </label>
                              <select
                                {...signupForm.register('gender', { required: 'Required' })}
                                className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all appearance-none cursor-pointer shadow-sm"
                              >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                              {signupForm.formState.errors.gender && (
                                <p className="text-red-500 text-xs mt-1">
                                  {signupForm.formState.errors.gender.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                              Current City, State, Country
                            </label>
                            <div className="relative">
                              <MapPin
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55] pointer-events-none"
                              />
                              <input
                                type="text"
                                {...signupForm.register('city', { required: 'City is required' })}
                                ref={(e) => {
                                  signupForm.register('city').ref(e);
                                  pobRef.current = e;
                                }}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                                placeholder="Mumbai, Maharashtra, India"
                              />
                            </div>
                            {signupForm.formState.errors.city && (
                              <p className="text-red-500 text-xs mt-1">
                                {signupForm.formState.errors.city.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                              Password
                            </label>
                            <div className="relative">
                              <Lock
                                size={18}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55]"
                              />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                {...signupForm.register('password', {
                                  required: 'Password required',
                                  minLength: { value: 8, message: 'Min 8 characters' },
                                })}
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                                placeholder="Min 8 characters"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55] hover:text-[#292522]"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            {signupForm.formState.errors.password && (
                              <p className="text-red-500 text-xs mt-1">
                                {signupForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md"
                          >
                            Continue <ChevronRight size={16} />
                          </button>

                          <p className="text-xs text-[#6B5E55] text-center">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-[#713B32] font-semibold underline">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-[#713B32] font-semibold underline">
                              Privacy Policy
                            </Link>
                          </p>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                              Languages
                            </label>
                            <input
                              type="text"
                              {...signupForm.register('languages', { required: 'Required' })}
                              className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                              placeholder="English, Hindi, Telugu"
                            />
                            {signupForm.formState.errors.languages && (
                              <p className="text-red-500 text-xs mt-1">
                                {signupForm.formState.errors.languages.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                              Skills
                            </label>
                            <input
                              type="text"
                              {...signupForm.register('skills', { required: 'Required' })}
                              className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                              placeholder="Numerology, Palmistry, Vastu"
                            />
                            {signupForm.formState.errors.skills && (
                              <p className="text-red-500 text-xs mt-1">
                                {signupForm.formState.errors.skills.message}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                                Phone Device
                              </label>
                              <select
                                {...signupForm.register('phoneType')}
                                className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all appearance-none cursor-pointer shadow-sm"
                              >
                                <option value="Android">Android</option>
                                <option value="iPhone">iPhone</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                                On other platforms?
                              </label>
                              <div className="flex gap-4 h-[46px] items-center text-sm text-[#292522]">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    value="yes"
                                    {...signupForm.register('workingElsewhere')}
                                    className="text-[#713B32] accent-[#713B32]"
                                  />
                                  <span>Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    value="no"
                                    {...signupForm.register('workingElsewhere')}
                                    className="text-[#713B32] accent-[#713B32]"
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                                Daily Hours
                              </label>
                              <select
                                {...signupForm.register('dailyHours')}
                                className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all appearance-none cursor-pointer shadow-sm"
                              >
                                <option value="2">2 Hours</option>
                                <option value="4">4 Hours</option>
                                <option value="6">6 Hours</option>
                                <option value="8">8 Hours</option>
                                <option value="10">10+ Hours</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[#292522] mb-1.5">
                                Astrology Education
                              </label>
                              <input
                                type="text"
                                {...signupForm.register('learningSource', { required: 'Required' })}
                                className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] focus:border-[#B88A44] focus:ring-2 focus:ring-[#B88A44]/20 outline-none text-sm text-[#292522] transition-all shadow-sm"
                                placeholder="Institution / Guru / Self"
                              />
                              {signupForm.formState.errors.learningSource && (
                                <p className="text-red-500 text-xs mt-1">
                                  {signupForm.formState.errors.learningSource.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="flex-1 py-3.5 rounded-xl border border-[#E5D9C8] text-sm font-bold text-[#292522] hover:bg-[#F8F3EA] transition-all"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="flex-[2] py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
                            >
                              {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Sparkles size={16} /> Submit Application
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* Success Popup Modal */}
      <AnimatePresence>
        {showSuccessPopup === 'login' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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
              <h3 className="text-3xl font-bold text-[#292522] mb-3">
                Sign In Success!
              </h3>
              <p className="text-base text-[#6B5E55]">
                Welcome back, Astrologer! Redirecting to your dashboard...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
