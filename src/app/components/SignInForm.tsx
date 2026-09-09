'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const SUPER_ADMIN_CREDENTIALS = {
  email: 'astroai@gmail.com',
  password: '7981255989',
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);

    const inputEmail = data.email.trim().toLowerCase();
    const inputPassword = data.password;

    // Strict authentication: Only allow the authorized Super Admin credentials
    const isSuperAdmin =
      inputEmail === SUPER_ADMIN_CREDENTIALS.email.toLowerCase() &&
      inputPassword === SUPER_ADMIN_CREDENTIALS.password;

    if (!isSuperAdmin) {
      setIsLoading(false);
      setLoginError('Invalid credentials. Access is restricted to authorized Super Admin accounts only.');
      return;
    }

    try {
      // Attempt Firebase Authentication to keep auth state synchronized
      try {
        await signInWithEmailAndPassword(auth, SUPER_ADMIN_CREDENTIALS.email, SUPER_ADMIN_CREDENTIALS.password);
      } catch (fbError: any) {
        if (fbError?.code === 'auth/user-not-found' || fbError?.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, SUPER_ADMIN_CREDENTIALS.email, SUPER_ADMIN_CREDENTIALS.password);
          } catch (_e) {
            // Silently handle if user registration requires different permissions
          }
        }
      }

      // Persist admin session in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'astroparihar_user',
          JSON.stringify({
            email: SUPER_ADMIN_CREDENTIALS.email,
            role: 'Super Admin',
            name: 'Super Admin',
          })
        );
      }

      window.location.href = '/admin-dashboard';
    } catch (err: any) {
      setLoginError(err?.message || 'An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col w-[52%] terracotta-gradient relative overflow-hidden p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-black/10 translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/3 border border-white/10" />

        {/* Hero content */}
        <div className="relative flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-6 w-fit">
            <Sparkles size={12} className="text-highlight" />
            <span className="text-xs text-white/80 font-semibold">AI-Powered Discovery Engine</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Discover & Verify<br />
            <span className="text-highlight">Elite Astrologers</span><br />
            at Scale
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            From AI-powered discovery to final verification — manage your entire astrologer recruitment pipeline in one intelligent platform.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: '2,400+', label: 'Candidates Discovered' },
              { value: '847', label: 'AI Qualified' },
              { value: '312', label: 'Verified Astrologers' },
            ].map(stat => (
              <div key={`stat-${stat.label}`} className="bg-white/10 rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white tabular-nums">{stat.value}</p>
                <p className="text-xs text-white/60 mt-1 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow steps */}
        <div className="relative mt-auto">
          <p className="text-xs text-white/50 font-semibold uppercase tracking-widest mb-3">End-to-End Workflow</p>
          <div className="flex items-center gap-1 flex-wrap">
            {['Discover', 'Qualify', 'Outreach', 'Assess', 'Review', 'Verify'].map((step, i) => (
              <React.Fragment key={`step-${step}`}>
                <span className="text-xs text-white/70 bg-white/10 rounded-full px-2.5 py-1 font-medium">{step}</span>
                {i < 5 && <ArrowRight size={10} className="text-white/30" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-md">
          {/* Top logo */}
          <div className="mb-6">
            <AppLogo
              src="/assets/images/AstroParihar_Logo-1786957316255.webp"
              size={46}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1.5 text-md">Sign in to your AstroParihar admin account</p>
          </div>

          {/* Error state */}
          {loginError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
              <span className="text-red-600 text-sm flex-shrink-0 mt-0.5">⚠</span>
              <p className="text-sm text-red-700">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="label-field">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="astroai@gmail.com"
                className={`input-field ${errors.email ? 'error' : ''}`}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && (
                <p className="error-text">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label-field mb-0">Password</label>
                <button type="button" className="text-xs text-primary font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`input-field pr-10 ${errors.password ? 'error' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="error-text">
                  <span>⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded border-border accent-primary"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
              style={{ minHeight: '42px' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>



          <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
            By signing in, you agree to AstroParihar's{' '}
            <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}