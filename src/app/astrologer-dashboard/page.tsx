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

  return (
    <div className="px-6 lg:px-8 py-8 max-w-screen-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {astrologerName}!</h1>
          <p className="text-muted-foreground mt-1">Here is your daily performance overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleOnlineStatus}
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all hover:opacity-80 ${
              isOnline 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
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
                  {call.type === 'video' ? <Phone className="text-[#C9952B]" /> : <MessageSquare className="text-[#C9952B]" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Incoming {call.type} Call <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-white">{call.customerName}</span> is waiting for you to join the session.
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
