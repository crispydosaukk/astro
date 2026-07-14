'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import Script from 'next/script';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Mail, Lock, User, Calendar, Clock, MapPin, Sparkles, Star, ChevronRight, CheckCircle2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<'signup' | 'login' | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const pobRef = useRef<HTMLInputElement | null>(null);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: '', email: '', password: '', confirmPassword: '', dob: '', tob: '', pob: '', gender: '' } });

  useEffect(() => {
    if (step === 2 && isGoogleLoaded && pobRef.current) {
      if (!(pobRef.current as any)._autocompleteAttached) {
        const autocomplete = new window.google.maps.places.Autocomplete(pobRef.current, {
          types: ['(cities)'],
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.formatted_address) {
            signupForm.setValue('pob', place.formatted_address, { shouldValidate: true });
          } else if (place && place.name) {
            signupForm.setValue('pob', place.name, { shouldValidate: true });
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
      await signInWithEmailAndPassword(auth, data.email, data.password);
      setShowSuccessPopup('login');
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    } catch (error: any) {
      console.error(error);
      loginForm.setError('email', { message: error.message || 'Invalid credentials' });
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
      
      await setDoc(doc(db, 'users', user.uid), {
        name: data.name,
        email: data.email,
        dob: data.dob,
        tob: data.tob,
        pob: data.pob,
        gender: data.gender,
        createdAt: new Date().toISOString()
      });
      
      await signOut(auth);
      
      setShowSuccessPopup('signup');
      setTimeout(() => {
        setShowSuccessPopup(null);
        setMode('login');
        setStep(1);
        setIsLoading(false);
        signupForm.reset();
        loginForm.setValue('email', data.email);
      }, 3000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dark">
      <Script 
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA-CXsyKpvFtpidpOkhOiIQGfXFO3O5lKA&libraries=places" 
        strategy="lazyOnload" 
        onReady={() => setIsGoogleLoaded(true)}
      />
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
            <AppLogo src="/AstroParihar_Top_Logo.jpg" size={36} />
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
                            <input type="date" style={{ colorScheme: 'dark' }} {...signupForm.register('dob', { required: 'Date of birth required' })} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" />
                          </div>
                          {signupForm.formState.errors.dob && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.dob.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Time of Birth</label>
                          <p className="text-xs text-muted-foreground mb-1.5">As accurate as possible</p>
                          <div className="relative">
                            <input type="time" style={{ colorScheme: 'dark' }} {...signupForm.register('tob')} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Place of Birth</label>
                        <p className="text-xs text-muted-foreground mb-1.5">City, State, Country</p>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input 
                            type="text" 
                            {...signupForm.register('pob', { required: 'Place of birth required' })}
                            ref={(e) => {
                              signupForm.register('pob').ref(e);
                              pobRef.current = e;
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" 
                            placeholder="Mumbai, Maharashtra, India" 
                          />
                        </div>
                        {signupForm.formState.errors.pob && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.pob.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                        <select {...signupForm.register('gender')} style={{ colorScheme: 'dark' }} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all appearance-none cursor-pointer">
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
                {showSuccessPopup === 'signup' ? 'Account Created!' : 'Sign In Success!'}
              </h3>
              <p className="text-base text-muted-foreground relative z-10">
                {showSuccessPopup === 'signup' 
                  ? 'Your cosmic journey begins now. Please sign in to continue.' 
                  : 'Welcome back! Redirecting you to the portal...'}
              </p>
              
              {showSuccessPopup === 'signup' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mt-8 relative z-10 text-green-500"
                >
                  <CheckCircle2 size={32} className="mx-auto" />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}