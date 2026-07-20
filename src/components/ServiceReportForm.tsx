'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUserData } from '@/lib/useUserData';

interface ServiceReportFormProps {
  titleText: string;
  highlightText: string;
  subtitle: string;
  buttonText: string;
  Icon: LucideIcon;
  premiumInfo?: string;
}

export default function ServiceReportForm({
  titleText,
  highlightText,
  subtitle,
  buttonText,
  Icon,
  premiumInfo
}: ServiceReportFormProps) {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const { user, loading } = useUserData();

  const handleSubmit = async () => {
    if (!dob || !time || !place) {
      toast.error('Please fill in all birth details');
      return;
    }

    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'service_requests'), {
        userId: user.uid,
        userEmail: user.email,
        type: `${titleText} ${highlightText}`,
        details: { dob, time, place },
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      toast.success('Request submitted successfully!');
      setDob('');
      setTime('');
      setPlace('');
      router.push('/user-dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="get-report" className="py-16 bg-background">
      <div className="max-w-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            {titleText} <span className="text-gradient-gold">{highlightText}</span>
          </h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="relative rounded-2xl border border-border bg-card p-8 shadow-lg overflow-hidden">
          {!loading && !user && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-background/80 backdrop-blur-sm text-center">
              <Lock size={40} className="text-[#C9952B] mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Sign In Required</h3>
              <p className="text-sm text-muted-foreground mb-6">Please sign in to fill out your details and unlock this report.</p>
              <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow">
                Sign In to Continue
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
          
          <div className={`space-y-5 ${!loading && !user ? 'opacity-30 pointer-events-none select-none' : ''}`}>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Time of Birth</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Place of Birth</label>
              <input type="text" placeholder="e.g. Delhi, India" value={place} onChange={e => setPlace(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-[#C9952B] outline-none text-sm transition-all" />
            </div>
            
            {premiumInfo && (
              <div className="rounded-xl bg-[#C9952B]/10 border border-[#C9952B]/20 p-4 flex items-start gap-3">
                <Lock size={16} className="text-[#C9952B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Premium Report</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{premiumInfo}</p>
                </div>
              </div>
            )}
            
            {user ? (
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Submitting...</span>
                ) : (
                  <>
                    <Icon size={16} /> {buttonText}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white opacity-80">
                <Icon size={16} /> {buttonText}
                <ArrowRight size={16} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
