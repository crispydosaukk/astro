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

import { loadRazorpayScript } from '@/lib/razorpay';

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

  // Restore draft form data if returning after login
  useEffect(() => {
    try {
      const key = serviceId ? `draft_report_${serviceId}` : 'draft_report';
      const saved = localStorage.getItem(key) || localStorage.getItem('draft_report');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dob) setDob(parsed.dob);
        if (parsed.time) setTime(parsed.time);
        if (parsed.place) setPlace(parsed.place);
      }
    } catch (e) {
      console.error('Error loading draft form:', e);
    }
  }, [serviceId]);

  const saveDraft = (newDob: string, newTime: string, newPlace: string) => {
    try {
      const data = { dob: newDob, time: newTime, place: newPlace };
      if (serviceId) {
        localStorage.setItem(`draft_report_${serviceId}`, JSON.stringify(data));
      }
      localStorage.setItem('draft_report', JSON.stringify(data));
    } catch (e) {
      console.error('Error saving draft form:', e);
    }
  };

  useEffect(() => {
    if (!serviceId) return;
    let isMounted = true;
    getHomepageContent().then((content) => {
      if (!isMounted) return;
      let p = 99;
      let pUsd = 1.99;
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
      const resLoaded = await loadRazorpayScript();
      if (!resLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      const reportAmount = price || 99;

      const reportDetails = {
        userId: user?.uid || 'guest-user',
        userEmail: user?.email || '',
        type: `${titleText} ${highlightText}`,
        serviceId: serviceId,
        details: { dob, time, place },
        currency: currencyCode.toLowerCase(),
        displayAmount: convertPrice(reportAmount, priceUSD !== null ? priceUSD : undefined),
      };

      // 1. Create Razorpay order
      const response = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: reportAmount,
          currency: 'INR',
          notes: {
            type: 'report_purchase',
            reportTitle: reportDetails.type,
            userId: reportDetails.userId,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // 2. Open Razorpay Modal
      const options = {
        key: data.keyId || data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: data.amount,
        currency: data.currency,
        name: 'AstroParihar',
        description: `Report: ${titleText} ${highlightText}`,
        image: '/astrologo.png',
        order_id: data.orderId || data.id,
        prefill: {
          name: user?.displayName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#713B32',
        },
        handler: async function (paymentRes: any) {
          try {
            const verifyRes = await fetch('/api/verify-razorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: paymentRes.razorpay_order_id,
                razorpay_payment_id: paymentRes.razorpay_payment_id,
                razorpay_signature: paymentRes.razorpay_signature,
                paymentType: 'report',
                reportDetails,
                amount: reportAmount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            toast.success('Report generated successfully! View in My Reports.');
            router.push('/my-reports');
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error processing report generation');
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            toast.info('Payment process cancelled');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="get-report" className="pt-4 pb-12 bg-[#F8F3EA]">
      <div className="max-w-2xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[#292522] mb-2">
            {titleText} <span className="text-gradient-gold">{highlightText}</span>
          </h2>
          <p className="text-[#6B5E55] font-medium">{subtitle}</p>
        </div>
        <div className="relative rounded-3xl border border-[#E5D9C8] bg-[#FFFDFC] p-8 sm:p-10 shadow-xl overflow-hidden text-[#292522]">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#292522] mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  saveDraft(e.target.value, time, place);
                }}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-sm transition-all cursor-pointer shadow-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#292522] mb-2">
                Time of Birth
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  saveDraft(dob, e.target.value, place);
                }}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-sm transition-all cursor-pointer shadow-sm font-medium"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-bold text-[#292522] mb-2">
                Place of Birth
              </label>
              <input
                type="text"
                placeholder="e.g. Delhi, India"
                value={place}
                onChange={(e) => {
                  handleLocationChange(e);
                  saveDraft(dob, time, e.target.value);
                }}
                onFocus={() => place.length >= 3 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-sm transition-all placeholder:text-[#6B5E55]/60 shadow-sm font-medium"
              />
              {/* Location Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-20 w-full mt-2 bg-[#FFFDFC] border border-[#E5D9C8] rounded-2xl shadow-2xl overflow-hidden">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-[#6B5E55] flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={14} /> Searching locations...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto">
                      {suggestions.map((s, i) => (
                        <li
                          key={i}
                          onMouseDown={() => {
                            handleSelectLocation(s.display_name);
                            saveDraft(dob, time, s.display_name);
                          }}
                          className="px-4 py-3 hover:bg-[#F8F3EA] cursor-pointer flex items-start gap-3 transition-colors border-b border-[#E5D9C8]/50 last:border-0"
                        >
                          <MapPin size={16} className="text-[#713B32] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-[#292522] font-medium">{s.display_name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : place.length >= 3 ? (
                    <div className="p-4 text-center text-sm text-[#6B5E55]">
                      No locations found
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {premiumInfo && (
              <div className="rounded-2xl bg-[#EDE4D5] border border-[#E5D9C8] p-4 flex items-start gap-3">
                <Lock size={16} className="text-[#713B32] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#292522]">Premium Report</p>
                  <p className="text-xs text-[#6B5E55] mt-0.5">{premiumInfo}</p>
                </div>
              </div>
            )}

            {!user && !loading ? (
              <button
                onClick={() => {
                  saveDraft(dob, time, place);
                  const returnUrl = typeof window !== 'undefined' ? `${window.location.pathname}#get-report` : '/remedies';
                  router.push(`/sign-up-login-screen?redirect=${encodeURIComponent(returnUrl)}`);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all shadow-md"
              >
                <Lock size={16} /> Sign In to Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-bold gold-gradient-bg text-white hover:opacity-95 transition-all shadow-md disabled:opacity-50"
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

            {/* Option to Contact Human Astrologer */}
            <div className="pt-4 mt-4 border-t border-[#E5D9C8] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <p className="text-xs font-bold text-[#292522]">Prefer Live Personal Guidance?</p>
                <p className="text-[11px] text-[#6B5E55]">Discuss your birth chart & remedies live with verified Human Astrologers.</p>
              </div>
              <Link
                href="/talk-to-astrologer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EDE4D5] border border-[#E5D9C8] text-[#713B32] hover:bg-[#EDE4D5]/80 transition-colors whitespace-nowrap"
              >
                Consult Astrologer →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
