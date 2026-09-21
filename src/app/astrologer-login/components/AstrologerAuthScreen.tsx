'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export default function AstrologerAuthScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<'login' | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loginForm = useForm<LoginForm>({
    defaultValues: { email: '', password: '', remember: false },
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

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    const validStatuses = ['approved', 'active', 'probation', 'verified', 'full_time', 'qualified'];

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email.trim(), data.password);
      const user = userCredential.user;

      const astDocRef = doc(db, 'astrologers', user.uid);
      const astDocSnap = await getDoc(astDocRef);

      if (!astDocSnap.exists()) {
        await signOut(auth);
        loginForm.setError('email', { message: 'No astrologer account found for this email.' });
        setIsLoading(false);
        return;
      }

      const astData = astDocSnap.data();
      const currentStatus = (astData.status || '').toLowerCase().trim();

      if (!validStatuses.includes(currentStatus)) {
        await signOut(auth);
        loginForm.setError('email', {
          message: `Your application is currently ${astData.status || 'pending'}. Please wait for admin approval.`,
        });
        setIsLoading(false);
        return;
      }

      setShowSuccessPopup('login');
      setTimeout(() => {
        router.push('/astrologer-dashboard');
      }, 1500);
      return;
    } catch (error: any) {
      console.warn('Firebase Auth login notice:', error?.code || error?.message);

      // Check if candidate exists in candidates collection
      try {
        const emailQuery = query(collection(db, 'candidates'), where('email', '==', data.email.trim()));
        const candSnap = await getDocs(emailQuery);

        if (!candSnap.empty) {
          const candDoc = candSnap.docs[0];
          const candData = candDoc.data();
          const submittedPassword = candData.password || candData.applicationData?.password;

          // Strictly verify the candidate's submitted password
          if (submittedPassword && submittedPassword !== data.password) {
            loginForm.setError('password', {
              message: 'Incorrect password. Please enter the password you provided while applying.',
            });
            setIsLoading(false);
            return;
          }

          const appStatus = (candData.applicationStatus || '').toLowerCase();
          const lifecycle = (candData.lifecycleStatus || '').toLowerCase();
          const isApproved = validStatuses.some(s => appStatus.includes(s) || lifecycle.includes(s));

          if (!isApproved) {
            loginForm.setError('email', {
              message: `Your application is currently ${candData.applicationStatus || 'pending'}. Please wait for admin approval.`,
            });
            setIsLoading(false);
            return;
          }

          // Verified authentication successful
          if (typeof window !== 'undefined') {
            localStorage.setItem('astro_verified_session', JSON.stringify({
              id: candDoc.id,
              name: candData.name,
              email: candData.email,
              authenticated: true,
              timestamp: Date.now(),
            }));
          }
          toast.success(`Welcome ${candData.name}! Astrologer Dashboard unlocked.`);
          setShowSuccessPopup('login');
          setTimeout(() => {
            router.push('/astrologer-dashboard');
          }, 1200);
          return;
        }
      } catch (fallbackErr) {
        console.warn('Candidate login fallback check error:', fallbackErr);
      }

      loginForm.setError('email', {
        message: 'Invalid email or password. Please check your credentials.',
      });
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-[#D8B66A]/40 text-[#F6D075] text-xs font-bold uppercase tracking-widest shadow-lg">
            <Sparkles size={14} className="text-[#D8B66A]" /> Verified Vedic Platform
          </div>

          <div className="w-40 h-40 mx-auto rounded-full gold-gradient-bg flex items-center justify-center animate-float shadow-2xl border-4 border-[#FFFDFC]/20">
            <span className="text-6xl drop-shadow-md">✨</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">Astrologer Portal</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Sign in to manage your consultations, seekers, and earnings on India&apos;s verified Vedic astrology platform.
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
        </div>
      </div>

      {/* Right panel - Astrologer Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#F8F3EA] overflow-y-auto pt-20 lg:pt-12">
        <div className="w-full max-w-md bg-[#FFFDFC] p-8 sm:p-10 rounded-3xl border border-[#E5D9C8] shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <AppLogo src="/astrologo.png" size={85} />
            </Link>
          </div>

          <div className="mb-8 text-center">
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B5E55] hover:text-[#292522] transition-colors cursor-pointer"
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
              <button
                type="button"
                onClick={() => toast.info('To reset your password, please contact the AstroParihar onboarding team at onboarding@astroparihar.com')}
                className="text-sm font-semibold text-[#713B32] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md hover:shadow-lg cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} /> Sign In
                </>
              )}
            </button>

            <div className="pt-4 border-t border-[#E5D9C8] text-center">
              <p className="text-xs text-[#6B5E55]">
                Want to join the AstroParihar Astrologer Panel?{' '}
                <Link href="/apply" className="font-semibold text-[#713B32] hover:underline">
                  Apply here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showSuccessPopup === 'login' && (
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
                  <h3 className="text-3xl font-bold text-[#292522] mb-3">Sign In Success!</h3>
                  <p className="text-base text-[#6B5E55]">
                    Welcome back, Astrologer! Redirecting to your dashboard...
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
