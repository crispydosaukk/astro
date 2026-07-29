'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Loader2, MapPin } from 'lucide-react';
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
  premiumInfo,
}: ServiceReportFormProps) {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');

  // Location Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { user, loading } = useUserData();

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlace(value);

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    setIsSearching(true);
    setShowSuggestions(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectLocation = (locationName: string) => {
    setPlace(locationName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!dob || !time || !place) {
      toast.error('Please fill in all birth details');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid || 'demo-user-id',
          userEmail: user?.email || 'demo@example.com',
          type: `${titleText} ${highlightText}`,
          details: { dob, time, place },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      toast.success('Payment successful! Your report is ready.');
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
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:border-[#C9952B] outline-none text-sm transition-all custom-calendar-icon cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Time of Birth
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:border-[#C9952B] outline-none text-sm transition-all custom-clock-icon cursor-pointer"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Place of Birth
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi, India"
                value={place}
                onChange={handleLocationChange}
                onFocus={() => place.length >= 3 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:border-[#C9952B] outline-none text-sm transition-all placeholder:text-muted-foreground"
              />
              {/* Location Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={14} /> Searching locations...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto">
                      {suggestions.map((s, i) => (
                        <li
                          key={i}
                          onMouseDown={() => handleSelectLocation(s.display_name)}
                          className="px-4 py-3 hover:bg-muted cursor-pointer flex items-start gap-3 transition-colors border-b border-border/50 last:border-0"
                        >
                          <MapPin size={16} className="text-[#C9952B] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{s.display_name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : place.length >= 3 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No locations found
                    </div>
                  ) : null}
                </div>
              )}
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

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Submitting...
                </span>
              ) : (
                <>
                  <Icon size={16} /> {buttonText}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
