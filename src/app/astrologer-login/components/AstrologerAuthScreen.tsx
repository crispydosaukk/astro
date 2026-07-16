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
  const [signupSuccessToken, setSignupSuccessToken] = useState<number | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const pobRef = useRef<HTMLInputElement | null>(null);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: '', email: '', password: '', confirmPassword: '', dob: '', city: '', gender: '', languages: '', skills: '', phoneType: '', workingElsewhere: 'no', dailyHours: '', learningSource: '' } });

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
      await signInWithEmailAndPassword(auth, data.email, data.password);
      setShowSuccessPopup('login');
      setTimeout(() => {
        window.location.href = '/admin-panel'; // Assuming they go to a dashboard, admin-panel is fine for now
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
      const token = Math.floor(100000 + Math.random() * 900000);
      
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
        tokenNumber: token,
        createdAt: new Date().toISOString()
      });
      
      await signOut(auth);
      
      setSignupSuccessToken(token);
      setIsLoading(false);
      loginForm.setValue('email', data.email);
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
            <span className="text-8xl">✨</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Join as an Astrologer</h2>
            <p className="text-white/60 text-base max-w-sm mx-auto leading-relaxed">
              Guide thousands of seekers on their cosmic journey using our advanced platform.
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

          {signupSuccessToken ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-card border border-border p-10 rounded-3xl shadow-xl flex flex-col items-center w-full text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 gold-gradient-bg opacity-5 pointer-events-none" />
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent animate-pulse-glow relative z-10">
                <Sparkles size={40} className="animate-float" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-3 relative z-10">
                Thank You!
              </h3>
              <p className="text-base text-muted-foreground relative z-10">
                <span className="flex flex-col gap-3">
                  <span>Thank you for submitting your details with AstroParihar! Your token number is <strong className="text-foreground">{signupSuccessToken}</strong>.</span>
                  <span>Please join the waitlist on the Astrologer Hiring App once you get shortlisted. Please note that you will be notified about any updates both via WhatsApp and email.</span>
                  <span>For further details, feel free to reach out to us via email at onboarding@astroparihar.com. Looking forward to having you on board!</span>
                </span>
              </p>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mt-8 relative z-10 text-green-500"
              >
                <CheckCircle2 size={32} className="mx-auto" />
              </motion.div>
              
              <button 
                onClick={() => {
                  setSignupSuccessToken(null);
                  setMode('login');
                  setStep(1);
                  signupForm.reset();
                }}
                className="mt-8 px-6 py-2.5 rounded-xl border border-border text-sm font-semibold hover:border-accent/50 transition-all z-10"
              >
                Go back to Login
              </button>
            </motion.div>
          ) : (
            <>
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
                <h1 className="text-2xl font-bold text-foreground mb-1">Astrologer Portal</h1>
                <p className="text-sm text-muted-foreground mb-8">Sign in to your astrologer dashboard</p>

                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        {...loginForm.register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all"
                        placeholder="guru@astroparihar.com"
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
                  {step === 1 ? 'Personal Details' : 'Professional Details'}
                </h1>
                <p className="text-sm text-muted-foreground mb-8">
                  {step === 1 ? 'Basic information to get started' : 'Tell us about your astrology background'}
                </p>

                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-5">
                  {step === 1 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" {...signupForm.register('name', { required: 'Name is required' })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all" placeholder="Guru Sharma" />
                        </div>
                        {signupForm.formState.errors.name && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="email" {...signupForm.register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none text-sm transition-all" placeholder="guru@example.com" />
                        </div>
                        {signupForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.email.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Date of Birth</label>
                          <div className="relative">
                            <input type="date" style={{ colorScheme: 'dark' }} {...signupForm.register('dob', { required: 'Date of birth required' })} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" />
                          </div>
                          {signupForm.formState.errors.dob && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.dob.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Gender</label>
                          <select {...signupForm.register('gender', { required: 'Required' })} style={{ colorScheme: 'dark' }} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all appearance-none cursor-pointer">
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          {signupForm.formState.errors.gender && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.gender.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Current City, State, Country</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input 
                            type="text" 
                            {...signupForm.register('city', { required: 'City is required' })}
                            ref={(e) => {
                              signupForm.register('city').ref(e);
                              pobRef.current = e;
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" 
                            placeholder="Mumbai, Maharashtra, India" 
                          />
                        </div>
                        {signupForm.formState.errors.city && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.city.message}</p>}
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
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Languages</label>
                        <input type="text" {...signupForm.register('languages', { required: 'Required' })} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" placeholder="English, Hindi, Telugu" />
                        {signupForm.formState.errors.languages && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.languages.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Skills</label>
                        <input type="text" {...signupForm.register('skills', { required: 'Required' })} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" placeholder="Numerology, Palmistry, Vastu" />
                        {signupForm.formState.errors.skills && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.skills.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Which phone do you use?</label>
                          <select {...signupForm.register('phoneType')} style={{ colorScheme: 'dark' }} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all appearance-none cursor-pointer">
                            <option value="Android">Android</option>
                            <option value="iPhone">iPhone</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Working on other platform?</label>
                          <div className="flex gap-4 h-[46px] items-center">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                              <input type="radio" value="yes" {...signupForm.register('workingElsewhere')} className="text-accent" />
                              Yes
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                              <input type="radio" value="no" {...signupForm.register('workingElsewhere')} className="text-accent" />
                              No
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Daily Hours Contribution</label>
                          <select {...signupForm.register('dailyHours')} style={{ colorScheme: 'dark' }} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all appearance-none cursor-pointer">
                            <option value="2">2 Hours</option>
                            <option value="4">4 Hours</option>
                            <option value="6">6 Hours</option>
                            <option value="8">8 Hours</option>
                            <option value="10">10+ Hours</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Where did you learn Astrology?</label>
                          <input type="text" {...signupForm.register('learningSource', { required: 'Required' })} className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-ring outline-none text-sm transition-all" placeholder="Institution / Self-taught" />
                          {signupForm.formState.errors.learningSource && <p className="text-red-400 text-xs mt-1">{signupForm.formState.errors.learningSource.message}</p>}
                        </div>
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
                Sign In Success!
              </h3>
              <p className="text-base text-muted-foreground relative z-10">
                Welcome back, Astrologer! Redirecting you to the portal...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
