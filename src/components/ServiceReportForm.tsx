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
import { getHomepageContent } from '@/lib/cms';
import { useCurrency } from '@/lib/CurrencyContext';

interface ServiceReportFormProps {
  titleText: string;
  highlightText: string;
  subtitle: string;
  buttonText: string;
  Icon: LucideIcon;
  premiumInfo?: string;
  serviceId?: string;
}

export default function ServiceReportForm({
  titleText,
  highlightText,
  subtitle,
  buttonText,
  Icon,
  premiumInfo,
  serviceId,
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
  const { convertPrice, currencyCode, formatPrice } = useCurrency();

  const [price, setPrice] = useState<number | null>(null);
  const [priceUSD, setPriceUSD] = useState<number | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    let isMounted = true;
    getHomepageContent().then((content) => {
      if (!isMounted) return;
      let p = 100;
      let pUsd = null;
      if (content?.services?.items) {
        const item = content.services.items.find((i) => i.id === serviceId);
        if (item) {
          if (item.price !== undefined) p = item.price;
          if (item.priceUSD !== undefined) pUsd = item.priceUSD;
        }
      }
      setPrice(p);
      setPriceUSD(pUsd);
    }).catch(console.error);
    
    return () => {
      isMounted = false;
    };
  }, [serviceId]);

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
      // Store report details in localStorage to generate after successful payment
      const reportDetails = {
        userId: user?.uid || 'demo-user-id',
        userEmail: user?.email || 'demo@example.com',
        type: `${titleText} ${highlightText}`,
        serviceId: serviceId,
        details: { dob, time, place },
        currency: currencyCode.toLowerCase(),
        displayAmount: convertPrice(price || 100, priceUSD !== null ? priceUSD : undefined)
      };
      localStorage.setItem('pending_report', JSON.stringify(reportDetails));

      // Call create-stripe-session
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="get-report" className="pt-8 pb-16 bg-background">
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

            {!user && !loading ? (
              <button
                onClick={() => router.push('/sign-up-login-screen')}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow"
              >
                <Lock size={16} /> Sign In to Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow disabled:opacity-50"
              >
                {isSubmitting || loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> {loading ? 'Loading...' : 'Submitting...'}
                  </span>
                ) : (
                  <>
                    <Icon size={16} /> {buttonText} {price !== null ? `— ${formatPrice(price, priceUSD !== null ? priceUSD : undefined)}` : ''}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
