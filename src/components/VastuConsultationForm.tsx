'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Compass,
  Home,
  Layers,
  Flame,
  Moon,
  Sparkles,
  MapPin,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUserData } from '@/lib/useUserData';
import { getHomepageContent } from '@/lib/cms';
import { useCurrency } from '@/lib/CurrencyContext';
import { loadRazorpayScript } from '@/lib/razorpay';

export default function VastuConsultationForm() {
  const router = useRouter();
  const { user, loading } = useUserData();
  const { convertPrice, currencyCode } = useCurrency();

  // Vastu Specific Form State
  const [propertyType, setPropertyType] = useState('Residential Apartment / Flat');
  const [entranceFacing, setEntranceFacing] = useState('North-East (Ishanya — Auspicious)');
  const [primaryConcern, setPrimaryConcern] = useState('Financial Inflow & Prosperity (North Zone)');
  const [kitchenLocation, setKitchenLocation] = useState('South-East (Agni Zone — Ideal)');
  const [masterBedroomLocation, setMasterBedroomLocation] = useState('South-West (Nairruti — Ideal)');
  const [pujaLocation, setPujaLocation] = useState('North-East (Ishanya — Ideal)');
  const [toiletLocation, setToiletLocation] = useState('North-West (Vayavya — Standard)');
  
  // Resident & Location Details
  const [ownerName, setOwnerName] = useState('');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');

  // Location Autocomplete
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [price, setPrice] = useState<number | null>(null);
  const [priceUSD, setPriceUSD] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Pricing from CMS
  useEffect(() => {
    async function loadPrice() {
      try {
        const homeData = await getHomepageContent();
        const vastuService = homeData?.services?.items?.find((s: any) => s.id === 'svc-vastu');
        if (vastuService) {
          if (vastuService.price !== undefined) setPrice(vastuService.price);
          if (vastuService.priceUSD !== undefined) setPriceUSD(vastuService.priceUSD);
        }
      } catch (err) {
        console.error('Error fetching Vastu price:', err);
      }
    }
    loadPrice();
  }, []);

  // Location search handler
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setPlace(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Location search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  const handleSelectLocation = (locationName: string) => {
    setPlace(locationName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!ownerName.trim()) {
      toast.error('Please enter the owner or resident name');
      return;
    }
    if (!place.trim()) {
      toast.error('Please enter the property city/location');
      return;
    }

    setIsSubmitting(true);
    try {
      const resLoaded = await loadRazorpayScript();
      if (!resLoaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      const reportAmount = price !== null ? price : 149;

      const reportDetails = {
        userId: user?.uid || 'guest-user',
        userEmail: user?.email || '',
        type: 'Vastu Consultation Report',
        serviceId: 'svc-vastu',
        details: {
          name: ownerName,
          propertyType,
          entranceFacing,
          primaryConcern,
          kitchenLocation,
          masterBedroomLocation,
          pujaLocation,
          toiletLocation,
          dob: dob || 'N/A',
          time: time || 'N/A',
          place,
        },
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
            reportTitle: 'Vastu Consultation Report',
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
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'AstroParihar',
        description: 'Personalized Vastu Consultation & Remedial Report',
        image: '/AstroParihar_Top_Logo.jpg',
        order_id: data.orderId,
        prefill: {
          name: user?.displayName || ownerName,
          email: user?.email || '',
        },
        theme: {
          color: '#713B32',
        },
        handler: async function (paymentRes: any) {
          try {
            // Also generate rich OpenAI dynamic report through /api/generate-report
            const genRes = await fetch('/api/generate-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user?.uid || 'guest-user',
                userEmail: user?.email || '',
                type: 'Vastu Consultation Report',
                details: reportDetails.details,
              }),
            });

            let reportData = null;
            if (genRes.ok) {
              const genData = await genRes.json();
              reportData = genData.reportData;
            }

            const verifyRes = await fetch('/api/verify-razorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: paymentRes.razorpay_order_id,
                razorpay_payment_id: paymentRes.razorpay_payment_id,
                razorpay_signature: paymentRes.razorpay_signature,
                paymentType: 'report',
                reportDetails: {
                  ...reportDetails,
                  reportContent: reportData ? JSON.stringify(reportData) : undefined,
                },
                amount: reportAmount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            toast.success('Vastu Report generated successfully! View in My Reports.');
            router.push('/my-reports');
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error generating Vastu report');
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
      toast.error(error.message || 'Failed to submit Vastu consultation request.');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="get-report" className="pt-6 pb-16 bg-[#FFFDFC] border-t border-[#E5D9C8]">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-6 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#EDE4D5] text-[#713B32] border border-[#E5D9C8]">
            <Compass size={13} className="text-[#B88A44]" /> Vastu Purusha Mandala Analysis
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#292522]">
            Get Your Complete <span className="text-gradient-gold">Vastu Consultation Report</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E55] font-medium max-w-xl mx-auto">
            Enter your property layout and directional coordinates to generate an authentic 8-direction energy audit with 100% non-demolition Vedic remedies.
          </p>
        </div>

        {/* Main Sacred Parchment Card */}
        <div className="relative rounded-3xl border border-[#E5D9C8] bg-[#FFFDFC] p-6 sm:p-10 shadow-xl overflow-hidden text-[#292522] space-y-8">
          
          {/* Section 1: Property & Directional Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E5D9C8] pb-2">
              <Home size={18} className="text-[#713B32]" />
              <h3 className="font-bold text-[#292522] text-sm uppercase tracking-wide">
                1. Property &amp; Directional Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  <option value="Residential Apartment / Flat">Residential Apartment / Flat</option>
                  <option value="Independent House / Villa">Independent House / Villa</option>
                  <option value="Commercial Office Space">Commercial Office Space</option>
                  <option value="Retail Shop / Showroom">Retail Shop / Showroom</option>
                  <option value="Industrial Factory / Warehouse">Industrial Factory / Warehouse</option>
                  <option value="Plot / Open Land">Plot / Open Land</option>
                </select>
              </div>

              {/* Main Entrance Direction */}
              <div>
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5">
                  Main Entrance Facing Direction
                </label>
                <select
                  value={entranceFacing}
                  onChange={(e) => setEntranceFacing(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  <option value="North (Kuber — Wealth & Cash Flow)">North (Kuber — Wealth &amp; Cash Flow)</option>
                  <option value="North-East (Ishanya — Divine Clarity)">North-East (Ishanya — Divine Clarity)</option>
                  <option value="East (Surya — Vitality & Social Fame)">East (Surya — Vitality &amp; Social Fame)</option>
                  <option value="South-East (Agneya — Energy & Liquidity)">South-East (Agneya — Energy &amp; Liquidity)</option>
                  <option value="South (Yama — Stability & Discipline)">South (Yama — Stability &amp; Discipline)</option>
                  <option value="South-West (Nairruti — Earth Foundation)">South-West (Nairruti — Earth Foundation)</option>
                  <option value="West (Varuna — Gains & Profits)">West (Varuna — Gains &amp; Profits)</option>
                  <option value="North-West (Vayavya — Movement & Support)">North-West (Vayavya — Movement &amp; Support)</option>
                </select>
              </div>
            </div>

            {/* Primary Area of Concern */}
            <div>
              <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5">
                Primary Life Concern / Focus Area
              </label>
              <select
                value={primaryConcern}
                onChange={(e) => setPrimaryConcern(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
              >
                <option value="Financial Inflow & Prosperity (North Zone)">Financial Inflow &amp; Wealth Growth (North / Kuber Zone)</option>
                <option value="Health, Vitality & Digestion (Agni Zone)">Health, Low Energy &amp; Digestion (Agni Zone)</option>
                <option value="Marital Harmony & Family Stability (Nairruti Zone)">Marital Harmony &amp; Relationship Peace (Nairruti Zone)</option>
                <option value="Career Opportunities & Recognition (East Zone)">Career Opportunities &amp; Fame (East / Surya Zone)</option>
                <option value="Mental Peace & Clarity (Ishanya Zone)">Mental Fog, Anxiety &amp; Lack of Peace (Ishanya Zone)</option>
                <option value="Complete 360° Vastu Harmony">Complete 360° Property Energy Balance</option>
              </select>
            </div>
          </div>

          {/* Section 2: Key Room Placement Mapping */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E5D9C8] pb-2">
              <Compass size={18} className="text-[#713B32]" />
              <h3 className="font-bold text-[#292522] text-sm uppercase tracking-wide">
                2. Key Room Placement Mapping
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kitchen Zone */}
              <div>
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5 flex items-center justify-between">
                  <span>Kitchen Location</span>
                  <span className="text-[10px] text-[#713B32] font-semibold">Fire Element</span>
                </label>
                <select
                  value={kitchenLocation}
                  onChange={(e) => setKitchenLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  <option value="South-East (Agni Zone — Ideal)">South-East (Agni Zone — Ideal)</option>
                  <option value="North-West (Vayu Zone — Alternative)">North-West (Vayu Zone — Alternative)</option>
                  <option value="North-East (Ishanya — Major Dosha)">North-East (Ishanya — Major Dosha)</option>
                  <option value="South-West (Nairruti — Heavy Conflict)">South-West (Nairruti — Heavy Conflict)</option>
                  <option value="North Zone">North Zone</option>
                  <option value="East Zone">East Zone</option>
                  <option value="South Zone">South Zone</option>
                  <option value="West Zone">West Zone</option>
                </select>
              </div>

              {/* Master Bedroom Zone */}
              <div>
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5 flex items-center justify-between">
                  <span>Master Bedroom Location</span>
                  <span className="text-[10px] text-[#713B32] font-semibold">Earth Element</span>
                </label>
                <select
                  value={masterBedroomLocation}
                  onChange={(e) => setMasterBedroomLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  <option value="South-West (Nairruti — Ideal Foundation)">South-West (Nairruti — Ideal Foundation)</option>
                  <option value="South Zone (Strong Stability)">South Zone (Strong Stability)</option>
                  <option value="West Zone (Gains & Sleep)">West Zone (Gains &amp; Sleep)</option>
                  <option value="North-East (Ishanya — Stress/Instability)">North-East (Ishanya — Stress/Instability)</option>
                  <option value="North-West (Vayavya)">North-West (Vayavya)</option>
                  <option value="South-East (Agneya — Restlessness)">South-East (Agneya — Restlessness)</option>
                </select>
              </div>

              {/* Puja Room / Mandir */}
              <div>
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5 flex items-center justify-between">
                  <span>Puja / Mandir Location</span>
                  <span className="text-[10px] text-[#713B32] font-semibold">Space / Water</span>
                </label>
                <select
                  value={pujaLocation}
                  onChange={(e) => setPujaLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  <option value="North-East (Ishanya — Highest Purity)">North-East (Ishanya — Highest Purity)</option>
                  <option value="East Zone (Surya Alignment)">East Zone (Surya Alignment)</option>
                  <option value="North Zone (Kuber Alignment)">North Zone (Kuber Alignment)</option>
                  <option value="West Zone">West Zone</option>
                  <option value="South / South-West (Inauspicious)">South / South-West (Inauspicious)</option>
                  <option value="Other / Not Established">Other / Not Established</option>
                </select>
              </div>

              {/* Main Washroom / Toilet */}
              <div>
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5 flex items-center justify-between">
                  <span>Main Toilet / Washroom</span>
                  <span className="text-[10px] text-[#713B32] font-semibold">Disposal Zone</span>
                </label>
                <select
                  value={toiletLocation}
                  onChange={(e) => setToiletLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  <option value="North-West (Vayavya — Recommended)">North-West (Vayavya — Recommended)</option>
                  <option value="South of South-West (SSW — Ideal Disposal)">South of South-West (SSW — Ideal Disposal)</option>
                  <option value="West Zone">West Zone</option>
                  <option value="East of South-East (ESE)">East of South-East (ESE)</option>
                  <option value="North-East (Severe Ishan Dosha)">North-East (Severe Ishan Dosha)</option>
                  <option value="South-West (Severe Nairruti Dosha)">South-West (Severe Nairruti Dosha)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Owner / Resident Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E5D9C8] pb-2">
              <Layers size={18} className="text-[#713B32]" />
              <h3 className="font-bold text-[#292522] text-sm uppercase tracking-wide">
                3. Resident &amp; Property Coordinates
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Owner Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5">
                  Owner / Resident Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all placeholder:text-[#6B5E55]/60"
                />
              </div>

              {/* DOB for Astro-Vastu */}
              <div>
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5 flex items-center justify-between">
                  <span>Date of Birth</span>
                  <span className="text-[10px] text-[#6B5E55]">For Kundli Alignment</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
                />
              </div>

              {/* Time of Birth */}
              <div>
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5 flex items-center justify-between">
                  <span>Time of Birth</span>
                  <span className="text-[10px] text-[#6B5E55]">Optional</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all cursor-pointer"
                />
              </div>

              {/* Property City / Location */}
              <div className="sm:col-span-2 relative">
                <label className="block text-xs font-bold text-[#292522] uppercase mb-1.5">
                  Property City / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, Telangana, India"
                  value={place}
                  onChange={handleLocationChange}
                  onFocus={() => place.length >= 3 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFDFC] border border-[#E5D9C8] text-[#292522] focus:border-[#B88A44] outline-none text-xs sm:text-sm font-medium shadow-sm transition-all placeholder:text-[#6B5E55]/60"
                />

                {/* Location Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-20 w-full mt-2 bg-[#FFFDFC] border border-[#E5D9C8] rounded-2xl shadow-2xl overflow-hidden">
                    {isSearching ? (
                      <div className="p-4 text-center text-xs text-[#6B5E55] flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={14} /> Searching locations...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <ul className="max-h-60 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <li
                            key={i}
                            onMouseDown={() => handleSelectLocation(s.display_name)}
                            className="px-4 py-3 text-xs hover:bg-[#F8F3EA] cursor-pointer text-[#292522] border-b border-[#E5D9C8]/60 flex items-start gap-2"
                          >
                            <MapPin size={14} className="text-[#713B32] shrink-0 mt-0.5" />
                            <span>{s.display_name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Report Feature Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#EDE4D5]/60 border border-[#E5D9C8] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#713B32] uppercase">
              <ShieldCheck size={16} /> 100% Non-Demolition Remedial Guarantee
            </div>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              Your personalized consultation report delivers an in-depth room-by-room energy audit, identifies elemental conflicts, and prescribes authentic Vedic remedies (Pyramids, Yantras, color therapy, and metal strips) requiring <strong>zero physical demolition</strong>.
            </p>
          </div>

          {/* Action / Submit Button */}
          <div>
            {!user ? (
              <Link
                href="/auth/login"
                className="w-full py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center justify-center gap-2 hover:brightness-110 shadow-xl shadow-[#C9952B]/30 text-sm sm:text-base cursor-pointer"
              >
                <Lock size={16} /> Sign In to Generate Vastu Report →
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center justify-center gap-2 hover:brightness-110 shadow-xl shadow-[#C9952B]/30 text-sm sm:text-base cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Synthesizing Vastu Consultation...</span>
                  </>
                ) : (
                  <>
                    <Compass size={18} />
                    <span>
                      Generate Vastu Consultation Report ({convertPrice(price || 149, priceUSD !== null ? priceUSD : undefined)})
                    </span>
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
