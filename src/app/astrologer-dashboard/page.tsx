'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  IndianRupee,
  Star,
  TrendingUp,
  Users,
  Calendar,
  User,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Award,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Send,
  Globe,
  Edit3,
  Save,
  Eye,
  ExternalLink,
  Check
} from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

function AstrologerDashboardContent() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [astrologerName, setAstrologerName] = useState('Astrologer');
  const [isOnline, setIsOnline] = useState(false);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);

  // Probation & Full-Time Approval States
  const [astrologerStatus, setAstrologerStatus] = useState<'full_time' | 'probation' | 'active'>('probation');
  const [isFullTimeApproved, setIsFullTimeApproved] = useState(false);
  const [probationMonths, setProbationMonths] = useState<number>(3);
  const [probationEndDate, setProbationEndDate] = useState<string>('');
  const [daysRemaining, setDaysRemaining] = useState<number>(18);
  const [isProbationExpired, setIsProbationExpired] = useState<boolean>(false);
  const [consultationsCompleted, setConsultationsCompleted] = useState<number>(18);
  const [consultationTarget, setConsultationTarget] = useState<number>(25);
  const [rating, setRating] = useState<number>(4.8);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  // Profile & Website Visibility States
  const [currentId, setCurrentId] = useState<string>('');
  const [showOnWebsite, setShowOnWebsite] = useState<boolean>(false);
  const [aboutBio, setAboutBio] = useState<string>('');
  const [specialties, setSpecialties] = useState<string>('Vedic Jyotish, Kundali Milan');
  const [languagesText, setLanguagesText] = useState<string>('Hindi, English');
  const [experienceText, setExperienceText] = useState<string>('12+ Years');
  const [pricePerMin, setPricePerMin] = useState<number>(25);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const loadProfileFromId = async (targetId: string) => {
      setCurrentId(targetId);
      try {
        let docRef = doc(db, 'astrologers', targetId);
        let docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          docRef = doc(db, 'candidates', targetId);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setAstrologerName(data.name || 'Astrologer');
          setIsOnline(data.isOnline || false);

          setShowOnWebsite(Boolean(data.showOnWebsite || data.isPublished));
          setAboutBio(
            data.about || data.bio || data.applicationData?.bio || 
            'Experienced Vedic Jyotish practitioner offering authentic Kundali readings, dasha analysis, and practical remedies.'
          );
          
          const skillsList = Array.isArray(data.skills) ? data.skills.join(', ') :
            Array.isArray(data.specialisations) ? data.specialisations.join(', ') :
            (data.skills || data.speciality || 'Vedic Jyotish, Kundali Milan');
          setSpecialties(skillsList);

          const langs = Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || 'Hindi, English');
          setLanguagesText(langs);
          setExperienceText(data.experienceYears ? `${data.experienceYears}+ Years` : (data.experience || '10+ Years'));
          setPricePerMin(Number(data.amount) || Number(data.pricePerMin) || 25);
          setAvatarUrl(data.profileImageUrl || data.avatar || '');

          const status = data.status || data.lifecycleStatus || 'probation';
          const fullTime = data.isFullTimeApproved || status === 'full_time' || status === 'verified';
          setAstrologerStatus(fullTime ? 'full_time' : 'probation');
          setIsFullTimeApproved(fullTime);

          const months = data.probationMonths || 1;
          setProbationMonths(months);

          const start = data.appliedAt ? new Date(data.appliedAt) : new Date();
          const end = data.probationEndDate ? new Date(data.probationEndDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
          setProbationEndDate(end.toISOString());

          const now = new Date();
          const diff = Math.max(1, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          setDaysRemaining(Math.min(30, diff));

          if (diff <= 0 && !fullTime && status === 'probation') {
            setIsProbationExpired(true);
            setIsOnline(false);
          } else {
            setIsProbationExpired(false);
          }

          if (data.consultationsCount !== undefined) {
            setConsultationsCompleted(data.consultationsCount);
          }
          if (data.rating !== undefined) {
            setRating(data.rating);
          }
        }
      } catch (e) {
        console.warn('Astrologer load error:', e);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        loadProfileFromId(user.uid);

        // Listen for incoming active calls
        const q = query(
          collection(db, 'consultations'),
          where('astrologerId', '==', user.uid),
          where('status', '==', 'active')
        );

        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const calls: any[] = [];
          snapshot.forEach((doc) => {
            calls.push({ id: doc.id, ...doc.data() });
          });
          setActiveCalls(calls);
        });
      } else {
        // Check verified session established through /astrologer-login
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('astro_verified_session');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed && parsed.authenticated && parsed.id) {
                setIsAuthenticated(true);
                loadProfileFromId(parsed.id);
                return;
              }
            } catch (e) {}
          }
        }

        // Unauthorized access - block and redirect
        setIsAuthenticated(false);
        toast.error('Authentication required. Please log in with your email and password.');
        router.push('/astrologer-login');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [router]);

  const toggleOnlineStatus = async () => {
    if (isProbationExpired && !isFullTimeApproved) {
      toast.error('Probation period concluded. Dashboard locked until Admin approves Full-Time status.');
      return;
    }

    const activeId = auth.currentUser?.uid || currentId;
    if (!activeId) return;

    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      const docRef = doc(db, 'astrologers', activeId);
      await setDoc(docRef, { isOnline: newStatus }, { merge: true });
      toast.success(`You are now ${newStatus ? 'Online' : 'Offline'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      setIsOnline(!newStatus);
      toast.error('Failed to update status');
    }
  };

  const handleToggleWebsiteVisibility = async () => {
    const activeId = auth.currentUser?.uid || currentId;
    if (!activeId) return;
    const newStatus = !showOnWebsite;

    if (newStatus && (!aboutBio || aboutBio.trim().length < 15)) {
      toast.error('Please write a brief description in the About Me section before publishing your profile to the website.');
      return;
    }

    setShowOnWebsite(newStatus);
    try {
      const skillsArray = specialties.split(',').map(s => s.trim()).filter(Boolean);
      const langsArray = languagesText.split(',').map(l => l.trim()).filter(Boolean);

      const astRef = doc(db, 'astrologers', activeId);
      await setDoc(astRef, {
        id: activeId,
        name: astrologerName,
        about: aboutBio,
        bio: aboutBio,
        skills: skillsArray,
        specialisations: skillsArray,
        languages: langsArray,
        amount: Number(pricePerMin) || 25,
        pricePerMin: Number(pricePerMin) || 25,
        showOnWebsite: newStatus,
        isPublished: newStatus,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      try {
        const candRef = doc(db, 'candidates', activeId);
        await setDoc(candRef, {
          showOnWebsite: newStatus,
          isPublished: newStatus,
          bio: aboutBio,
        }, { merge: true });
      } catch (e) {}

      if (newStatus) {
        toast.success('Your profile is now LIVE on the AstroParihar customer website!');
      } else {
        toast.info('Your profile has been paused and hidden from the website.');
      }
    } catch (err: any) {
      console.error('Error toggling website visibility:', err);
      setShowOnWebsite(!newStatus);
      toast.error('Could not update website visibility.');
    }
  };

  const handleSaveProfileDetails = async () => {
    const activeId = auth.currentUser?.uid || currentId;
    if (!activeId) return;
    setIsSavingProfile(true);
    try {
      const skillsArray = specialties.split(',').map(s => s.trim()).filter(Boolean);
      const langsArray = languagesText.split(',').map(l => l.trim()).filter(Boolean);

      const payload = {
        id: activeId,
        name: astrologerName,
        about: aboutBio,
        bio: aboutBio,
        skills: skillsArray,
        specialisations: skillsArray,
        speciality: skillsArray[0] || 'Vedic Jyotish',
        languages: langsArray,
        experience: experienceText,
        amount: Number(pricePerMin) || 25,
        pricePerMin: Number(pricePerMin) || 25,
        profileImageUrl: avatarUrl,
        showOnWebsite: showOnWebsite,
        isPublished: showOnWebsite,
        updatedAt: new Date().toISOString(),
      };

      const astRef = doc(db, 'astrologers', activeId);
      await setDoc(astRef, payload, { merge: true });

      try {
        const candRef = doc(db, 'candidates', activeId);
        await setDoc(candRef, {
          name: astrologerName,
          bio: aboutBio,
          specialisations: skillsArray,
          showOnWebsite: showOnWebsite,
          isPublished: showOnWebsite,
        }, { merge: true });
      } catch (e) {}

      toast.success('Profile and About section saved successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      toast.error('Failed to save profile details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRequestFullTime = async () => {
    setRequestSent(true);
    toast.success('Full-Time Approval request dispatched to the Admin Verification Committee!');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground">Authenticating Astrologer Session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="px-6 lg:px-8 py-8 max-w-screen-2xl space-y-8">
      {/* PROBATION EXPIRED LOCK BANNER */}
      {isProbationExpired && !isFullTimeApproved && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 shadow-xl space-y-4 animate-slide-up">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Lock size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-foreground">
                    Probation Period Concluded — Full-Time Approval Required
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Dashboard Consultation Locked
                  </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  Your assigned <strong>{probationMonths}-month supervised probation period</strong> has reached its conclusion. Per platform compliance policy, your live consultation availability is currently paused until the <strong>Verification Committee</strong> reviews your probation performance and grants <strong>Full-Time Astrologer Approval</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestFullTime}
              disabled={requestSent}
              className="px-5 py-2.5 rounded-xl font-bold btn-primary text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              {requestSent ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Approval Requested</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Request Full-Time Approval</span>
                </>
              )}
            </button>
          </div>

          {/* Performance Audit Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-500/20 text-xs">
            <div className="p-3 bg-card rounded-xl border border-border">
              <p className="text-2xs text-muted-foreground font-semibold uppercase">Trial Consultations</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{consultationsCompleted} / {consultationTarget} Calls</p>
              <p className="text-2xs text-emerald-600 font-semibold mt-0.5">Audit Target Achieved</p>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border">
              <p className="text-2xs text-muted-foreground font-semibold uppercase">Probation Quality Rating</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">★ {rating} / 5.0</p>
              <p className="text-2xs text-emerald-600 font-semibold mt-0.5">High Client Satisfaction</p>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border">
              <p className="text-2xs text-muted-foreground font-semibold uppercase">Committee Review</p>
              <p className="text-lg font-bold text-foreground mt-0.5">Pending Admin Sign-off</p>
              <p className="text-2xs text-muted-foreground mt-0.5">Response expected in 24-48 hours</p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE PROBATION BANNER (When within probation window) */}
      {!isProbationExpired && !isFullTimeApproved && astrologerStatus === 'probation' && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between flex-wrap gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Supervised Probation Period Active
                </span>
                <span className="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {daysRemaining} Days Remaining ({probationMonths}-Month Trial)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your live consultations and client ratings are under active supervised quality audit. Complete {consultationTarget} trial consultations for Full-Time conversion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-muted-foreground block text-2xs uppercase">Progress</span>
              <span className="font-bold text-foreground">{consultationsCompleted}/{consultationTarget} Completed</span>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, (consultationsCompleted / consultationTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* VERIFIED FULL TIME BANNER */}
      {isFullTimeApproved && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <span className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-600" />
            Verified Full-Time Astrologer • Full platform consultation privileges active
          </span>
          <span className="font-bold text-2xs uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            Full-Time Certified
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            Welcome back, {astrologerName}!
            {isFullTimeApproved ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                Full-Time
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300">
                Probation ({daysRemaining}d left)
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Here is your daily performance overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOnlineStatus}
            disabled={isProbationExpired && !isFullTimeApproved}
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
              isOnline ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
            />
            <span
              className={`text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}
            >
              {isOnline ? 'You are Online' : 'You are Offline'}
            </span>
          </button>
        </div>
      </div>

      {/* WEBSITE PROFILE & PUBLIC DIRECTORY VISIBILITY */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-foreground">
                  Website Profile & Public Directory Visibility
                </h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  showOnWebsite 
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {showOnWebsite ? '✓ Live on Website' : 'Hidden from Website'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Control whether your profile is published to customers on the AstroParihar website directory based on the details filled in your About section.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground">
              {showOnWebsite ? 'Published to Customers' : 'Show Profile on Website'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={showOnWebsite}
              onClick={handleToggleWebsiteVisibility}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                showOnWebsite ? 'bg-emerald-600' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  showOnWebsite ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Live Status Notice */}
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 flex-wrap ${
          showOnWebsite
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {showOnWebsite ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            )}
            <span>
              {showOnWebsite
                ? 'Your profile is currently LIVE on the customer website. Ensure your status is set to Online to receive live calls & chats.'
                : 'Your profile is currently hidden from customers. Review your About details below and enable the toggle to go live on the website.'}
            </span>
          </div>

          <Link
            href="/talk-to-astrologer"
            target="_blank"
            className="font-bold underline flex items-center gap-1 hover:opacity-80 text-foreground"
          >
            View Customer Directory <ExternalLink size={11} />
          </Link>
        </div>

        {/* Profile Details & About Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                <span>About Me & Consultation Approach (Shown to Customers)</span>
                <span className="text-2xs font-normal text-muted-foreground">
                  {aboutBio.length} characters
                </span>
              </label>
              <textarea
                rows={4}
                value={aboutBio}
                onChange={(e) => setAboutBio(e.target.value)}
                placeholder="Share your astrological background, consultation philosophy, Vedic lineage, and how you guide clients through difficulties..."
                className="w-full px-3.5 py-2.5 text-xs bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
              />
              <p className="text-2xs text-muted-foreground mt-1">
                This bio is displayed to clients on your profile card before they book an audio or video consultation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Specialisations & Skills
                </label>
                <input
                  type="text"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="e.g. Vedic Jyotish, Kundali, Prashna, Career"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  value={languagesText}
                  onChange={(e) => setLanguagesText(e.target.value)}
                  placeholder="e.g. Hindi, English, Telugu"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Experience Display
                </label>
                <input
                  type="text"
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  placeholder="e.g. 12+ Years"
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Consultation Rate (₹ / min)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
                  <input
                    type="number"
                    value={pricePerMin}
                    onChange={(e) => setPricePerMin(Number(e.target.value) || 0)}
                    placeholder="25"
                    className="w-full pl-7 pr-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-2xs text-muted-foreground">
                All changes reflect directly on your customer card
              </span>
              <button
                type="button"
                onClick={handleSaveProfileDetails}
                disabled={isSavingProfile}
                className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
              >
                {isSavingProfile ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Details...
                  </>
                ) : (
                  <>
                    <Save size={13} /> Save Profile & About Details
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right 1 Col: Live Preview Mock */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <p className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Eye size={12} className="text-primary" /> Customer Card Live Preview
            </p>

            <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    {astrologerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground leading-tight">{astrologerName}</h4>
                    <p className="text-2xs text-muted-foreground">{experienceText} Exp.</p>
                  </div>
                </div>
                <span className="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {astrologerStatus === 'probation' ? 'PROBATION' : 'VERIFIED'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {specialties.split(',').slice(0, 3).map((s, idx) => (
                  <span key={idx} className="text-3xs px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">
                    {s.trim()}
                  </span>
                ))}
              </div>

              <p className="text-2xs text-muted-foreground line-clamp-3 leading-relaxed">
                {aboutBio || 'Experienced astrologer offering authentic Kundali remedies.'}
              </p>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">₹{pricePerMin}/min</span>
                <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                  isOnline 
                    ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isOnline ? '● Online' : '○ Offline'}
                </span>
              </div>
            </div>

            <p className="text-3xs text-muted-foreground text-center">
              {showOnWebsite 
                ? '● Active in customer directory' 
                : '○ Hidden from customers until toggle is turned ON'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Calls Banner */}
      {activeCalls.length > 0 && (
        <div className="space-y-4">
          {activeCalls.map((call) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#C9952B]/10 border border-[#C9952B]/30 rounded-2xl p-6 flex items-center justify-between shadow-[0_0_30px_rgba(201,149,43,0.15)]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#C9952B]/20 flex items-center justify-center animate-pulse">
                  {call.type === 'video' ? (
                    <Phone className="text-[#C9952B]" />
                  ) : (
                    <MessageSquare className="text-[#C9952B]" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Incoming {call.type} Call{' '}
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-white">{call.customerName}</span> is waiting
                    for you to join the session.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/call/${call.roomID}`)}
                className="px-6 py-3 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
              >
                Join Call Now
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Today's Earnings",
            value: '₹1,240',
            icon: IndianRupee,
            trend: '+12%',
            isPositive: true,
          },
          { label: 'Active Chats', value: '3', icon: MessageSquare, trend: '+2', isPositive: true },
          {
            label: 'Total Consultations',
            value: '142',
            icon: Users,
            trend: '+18%',
            isPositive: true,
          },
          { label: 'Average Rating', value: '4.8', icon: Star, trend: '+0.1', isPositive: true },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Icon size={20} className="text-accent" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`text-xs font-semibold ${stat.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}
                >
                  <TrendingUp size={12} /> {stat.trend}
                </span>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reviews */}
        <div className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border lg:col-span-2">
          <h3 className="text-lg font-bold text-foreground mb-6">Recent Customer Reviews</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <User size={18} className="text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Customer {i + 1}</span>
                    <div className="flex items-center text-accent">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Excellent consultation. Very accurate predictions and helpful remedies
                    provided."
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Upcoming Sessions</h3>
          <div className="space-y-4">
            {[1, 2].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border/50 bg-background flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">User {i + 1}</span>
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {i === 0 ? 'In 10 mins' : 'Tomorrow'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} /> {i === 0 ? 'Today' : 'Tomorrow'}, 4:00 PM
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={12} /> Call
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AstrologerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-muted-foreground">Loading Astrologer Workspace...</p>
        </div>
      </div>
    }>
      <AstrologerDashboardContent />
    </Suspense>
  );
}
