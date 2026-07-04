'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Mail, Lock, User, Calendar, Clock, MapPin, Sparkles, Star, ChevronRight } from 'lucide-react';

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
  tob: string;
  pob: string;
  gender: string;
}

const demoCredentials = [
  { role: 'User', email: 'arjun.sharma@demo.in', password: 'Cosmic@2026' },
  { role: 'Premium', email: 'meera.devi@premium.in', password: 'Vedic@9999' },
  { role: 'Admin', email: 'admin@astroparihar.in', password: 'AstroAdmin#1' },
];

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: '', email: '', password: '', confirmPassword: '', dob: '', tob: '', pob: '', gender: '' } });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleFillCredentials = (cred: typeof demoCredentials[0]) => {
    loginForm.setValue('email', cred.email);
    loginForm.setValue('password', cred.password);
    toast.success(`Filled ${cred.role} credentials`);
  };

  const onLogin = async (data: LoginForm) => {
    const valid = demoCredentials.some(c => c.email === data.email && c.password === data.password);
    if (!valid) {
      loginForm.setError('email', { message: 'Invalid credentials — use the demo accounts below to sign in' });
      return;
    }
    setIsLoading(true);
    // Backend: POST /api/auth/login
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
    toast.success('Welcome back! Redirecting to dashboard...');
    window.location.href = '/user-dashboard';
  };

  const onSignup = async (data: SignupForm) => {
    if (step === 1) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    // Backend: POST /api/auth/register
    await new Promise(r => setTimeout(r, 1800));
    setIsLoading(false);
    toast.success('Account created! Welcome to AstroParihar 🌟');
    window.location.href = '/user-dashboard';
  };

  return (
    <div className="min-h-screen flex dark">
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
            <AppLogo src="/assets/images/AstroParihar_Top_Logo-1783108877658.png" size={56} />
            <span className="text-3xl font-bold text-gradient-gold">AstroParihar</span>
          </div>

          <div className="w-48 h-48 mx-auto rounded-full gold-gradient-bg flex items-center justify-center animate-float shadow-2xl">
            <span className="text-8xl">🔮</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Your Stars Await</h2>
            <p className="text-white/60 text-base max-w-sm mx-auto leading-relaxed">
              Join 2,50,000+ seekers discovering their cosmic path through ancient Vedic wisdom and AI intelligence
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { value: '500+', label: 'Astrologers' },
              { value: '4.9★', label: 'App Rating' },
              { value: '18L+', label: 'Reports' },
            ].map((s) => (
              <div key={`auth-stat-${s.label}`} className="glass-card rounded-xl p-3 text-center border border-white/10">
                <div className="text-xl font-bold text-gradient-gold tabular-nums">{s.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <AppLogo src="/assets/images/AstroParihar_Top_Logo-1783108877658.png" size={36} />
            <span className="text-xl font-bold text-gradient-gold">AstroParihar</span>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl bg-muted p-1 mb-8">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={`mode-${m}`}
                onClick={() => { setMode(m); setStep(1); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <h1 className="text-2xl font-bold text-foreground mb-1">Welcome Back</h1>
                <p className="text-sm text-muted-foreground mb-8">Sign in to continue your cosmic journey</p>

                {/* Social logins */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:border-accent/50 text-sm font-medium hover:text-accent transition-all">
                    <span className="text-lg">G</span> Google
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:border-accent/50 text-sm font-medium hover:text-accent transition-all">
                    <span className="text-lg">📱</span> OTP Login
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or email</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        {...loginForm.register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all"
                        placeholder="arjun@example.com"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...loginForm.register('password', { required: 'Password is required' })}
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-400 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input type="checkbox" {...loginForm.register('remember')} className="rounded" />
                      Remember me
                    </label>
                    <button type="button" className="text-sm text-accent hover:underline">Forgot password?</button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Sparkles size={16} /> Sign In</>
                    )}
                  </button>
                </form>

                {/* Demo credentials */}
                <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <p className="text-xs font-semibold text-accent mb-3 flex items-center gap-1.5"><Star size={12} /> Demo Accounts</p>
                  <div className="space-y-2">
                    {demoCredentials.map((cred) => (
                      <div key={`cred-${cred.role}`} className="flex items-center justify-between gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{cred.role}</span>
                        <span className="text-muted-foreground flex-1 truncate font-mono">{cred.email}</span>
                        <button onClick={() => handleFillCredentials(cred)} className="px-2 py-1 rounded-lg bg-accent/20 text-accent hover:bg-accent hover:text-white transition-all font-medium">
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {mode === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-6">
                  {[1, 2].map((s) => (
                    <React.Fragment key={`step-${s}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= s ? 'gold-gradient-bg text-white' : 'bg-muted text-muted-foreground'}`}>
                        {s}
                      </div>
                      {s < 2 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-accent' : 'bg-border'}`} />}
                    </React.Fragment>
                  ))}
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {step === 1 ? 'Create Account' : 'Birth Details'}
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                  {step === 1 ? 'Start your cosmic journey today' : 'Required for accurate Kundli generation'}
                </p>

                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-5">
                  {step === 1 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" {...signupForm.register('name', { required: 'Name is required' })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all" placeholder="Arjun Sharma" />
                        </div>
                        {signupForm.formState.errors.name && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="email" {...signupForm.register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all" placeholder="arjun@example.com" />
                        </div>
                        {signupForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.email.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type={showPassword ? 'text' : 'password'} {...signupForm.register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })} className="w-full pl-10 pr-10 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all" placeholder="Min 8 characters" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {signupForm.formState.errors.password && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.password.message}</p>}
                      </div>

                      <button type="submit" className="w-full py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center justify-center gap-2">
                        Continue <ChevronRight size={16} />
                      </button>

                      <p className="text-xs text-muted-foreground text-center">
                        By creating an account, you agree to our{' '}
                        <Link href="#" className="text-accent hover:underline">Terms of Service</Link> and{' '}
                        <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>
                      </p>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth</label>
                          <p className="text-xs text-muted-foreground mb-1.5">Required for Kundli</p>
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="date" {...signupForm.register('dob', { required: 'Date of birth required' })} className="w-full pl-10 pr-3 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" />
                          </div>
                          {signupForm.formState.errors.dob && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.dob.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Time of Birth</label>
                          <p className="text-xs text-muted-foreground mb-1.5">As accurate as possible</p>
                          <div className="relative">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="time" {...signupForm.register('tob')} className="w-full pl-10 pr-3 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Place of Birth</label>
                        <p className="text-xs text-muted-foreground mb-1.5">City, State, Country</p>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" {...signupForm.register('pob', { required: 'Place of birth required' })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" placeholder="Mumbai, Maharashtra, India" />
                        </div>
                        {signupForm.formState.errors.pob && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.pob.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                        <select {...signupForm.register('gender')} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all">
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other / Prefer not to say</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:border-accent/50 transition-all">
                          Back
                        </button>
                        <button type="submit" disabled={isLoading} className="flex-2 flex-1 py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles size={16} /> Create Account</>}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}