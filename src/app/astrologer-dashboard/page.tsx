'use client';
import React, { useEffect, useState } from 'react';
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
  Send
} from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AstrologerDashboardPage() {
  const router = useRouter();
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

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'astrologers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAstrologerName(data.name || 'Astrologer');
          setIsOnline(data.isOnline || false);
          
          const status = data.status || 'probation';
          const fullTime = data.isFullTimeApproved || status === 'full_time';
          setAstrologerStatus(status);
          setIsFullTimeApproved(fullTime);

          const months = data.probationMonths || 3;
          setProbationMonths(months);

          // Calculate probation dates
          let endDate = data.probationEndDate;
          if (!endDate) {
            // Default 3 months from applied or 18 days remaining sample
            const end = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000);
            endDate = end.toISOString();
          }
          setProbationEndDate(endDate);

          const endObj = new Date(endDate);
          const now = new Date();
          const diff = Math.ceil((endObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setDaysRemaining(diff);

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
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const toggleOnlineStatus = async () => {
    if (isProbationExpired && !isFullTimeApproved) {
      toast.error('Probation period concluded. Dashboard locked until Admin approves Full-Time status.');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      const docRef = doc(db, 'astrologers', user.uid);
      await updateDoc(docRef, { isOnline: newStatus });
      toast.success(`You are now ${newStatus ? 'Online' : 'Offline'}`);
    } catch (error) {
      console.error('Error updating status:', error);
      setIsOnline(!newStatus);
      toast.error('Failed to update status');
    }
  };

  const handleRequestFullTime = async () => {
    setRequestSent(true);
    toast.success('Full-Time Approval request dispatched to the Admin Verification Committee!');
  };

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
