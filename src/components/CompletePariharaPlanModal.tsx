'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Flame,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Wallet,
  CreditCard,
  Loader2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Gem,
  Music,
  Triangle,
  Heart,
  Compass,
  CircleDot,
} from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { toast } from 'sonner';
import { loadRazorpayScript } from '@/lib/razorpay';

interface CompletePariharaPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConcern?: string;
}

export default function CompletePariharaPlanModal({
  isOpen,
  onClose,
  initialConcern,
}: CompletePariharaPlanModalProps) {
  const router = useRouter();
  const { user, userData } = useUserData();
  const { formatPrice } = useCurrency();

  const [price, setPrice] = useState<number>(499);
  const [planTitle, setPlanTitle] = useState('Generate My Complete Parihara Plan');
  const [loadingPricing, setLoadingPricing] = useState(true);

  // Close AI Chat drawer when Parihara Plan modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-ai-chat-sidebar'));
    }
  }, [isOpen]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '1995-05-15',
    time: '14:30',
    place: 'New Delhi, India',
    primaryConcern: initialConcern || 'Career Growth, Wealth & Graha Dosha Relief',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  // Fetch dynamic pricing
  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/settings/pricing');
        const data = await res.json();
        if (data.pricing?.pariharaPlanPrice) {
          setPrice(data.pricing.pariharaPlanPrice);
        }
        if (data.pricing?.pariharaPlanTitle) {
          setPlanTitle(data.pricing.pariharaPlanTitle);
        }
      } catch (err) {
        console.warn('Could not fetch dynamic parihara price, using fallback ₹499:', err);
      } finally {
        setLoadingPricing(false);
      }
    }
    if (isOpen) {
      fetchPricing();
      if (userData?.name) {
        setFormData((prev) => ({ ...prev, name: userData.name }));
      }
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const userBalance = Number(userData?.walletBalance) || 0;
  const hasEnoughWalletBalance = userBalance >= price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter devotee full name');
      return;
    }
    if (!formData.dob) {
      toast.error('Please select date of birth');
      return;
    }

    if (!user) {
      toast.info('Please sign in to generate and save your Parihara Plan to your account.');
      router.push(`/sign-up-login-screen?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (hasEnoughWalletBalance) {
        // Direct Wallet Deduction
        const res = await fetch('/api/parihara-plan/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            userEmail: user.email || '',
            name: formData.name,
            gender: formData.gender,
            dob: formData.dob,
            time: formData.time,
            place: formData.place,
            primaryConcern: formData.primaryConcern,
            paymentMethod: 'wallet',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate plan');
        }

        toast.success('Divine Parihara Plan generated successfully!');
        setGeneratedReport(data.pariharaPlan);
        router.refresh();
      } else {
        // Razorpay Gateway Flow
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Failed to load Razorpay payment SDK');
        }

        const orderRes = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: price,
            currency: 'INR',
            paymentType: 'report',
            userId: user.uid,
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create payment order');

        const orderKey = orderData.keyId || orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        const options = {
          key: orderKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'AstroParihar',
          description: 'Complete Parihara Plan Blueprint',
          image: '/astrologo.png',
          order_id: orderData.orderId || orderData.id,
          prefill: {
            name: formData.name,
            email: user.email || '',
          },
          theme: { color: '#713B32' },
          handler: async function (paymentRes: any) {
            try {
              const genRes = await fetch('/api/parihara-plan/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.uid,
                  userEmail: user.email || '',
                  name: formData.name,
                  gender: formData.gender,
                  dob: formData.dob,
                  time: formData.time,
                  place: formData.place,
                  primaryConcern: formData.primaryConcern,
                  paymentMethod: 'razorpay',
                  razorpayPaymentId: paymentRes.razorpay_payment_id,
                }),
              });

              const genData = await genRes.json();
              if (genRes.ok) {
                toast.success('Parihara Plan synthesized and consecrated!');
                setGeneratedReport(genData.pariharaPlan);
                router.refresh();
              } else {
                toast.error(genData.error || 'Failed to synthesize plan after payment');
              }
            } catch (err: any) {
              toast.error(err.message || 'Payment verified, but plan generation failed.');
            } finally {
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
        return;
      }
    } catch (err: any) {
      console.error('Parihara plan purchase error:', err);
      toast.error(err.message || 'Failed to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-[#D4AF37]/40 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Header Banner */}
        <div className="relative p-6 bg-gradient-to-r from-[#2B1102] via-[#4A2408] to-[#2B1102] text-white border-b border-[#D4AF37]/30 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/20 text-[#F6D075] border border-[#D4AF37]/40">
              ✦ Authentic Vedic Remedial Architecture
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Flame className="text-[#F6D075]" size={24} /> {planTitle}
              </h2>
              <p className="text-xs text-white/80 mt-1 max-w-md">
                Personalized 8-fold remedial blueprint synthesized from your Janam Kundli & active Vimshottari Mahadasha.
              </p>
            </div>

            <div className="text-right sm:text-right shrink-0">
              <span className="text-2xs text-[#F6D075] font-semibold block uppercase tracking-wider">
                Total Fee
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#F6D075]">
                ₹{price}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!generatedReport ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* What Devotee Receives */}
              <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 space-y-2">
                <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                  Included in Your 8-Fold Blueprint (₹{price}):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Music size={13} className="text-accent" /> 1. Mantra Shakti (Japa)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Triangle size={13} className="text-emerald-500" /> 2. Yantra Sthapana
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Flame size={13} className="text-orange-500" /> 3. Homa / Fire Ritual
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Heart size={13} className="text-rose-500" /> 4. Ishta Devata Grace
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Gem size={13} className="text-amber-500" /> 5. Certified Gemstone
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <CircleDot size={13} className="text-amber-700" /> 6. Mukhi Rudraksha
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Compass size={13} className="text-teal-500" /> 7. 16-Zone Vastu
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <ShieldCheck size={13} className="text-purple-500" /> 8. 48-Day Sankalpa
                  </span>
                </div>
              </div>

              {/* Devotee Birth Intake Form */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User size={16} className="text-accent" /> Devotee Birth Particulars
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-accent outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                      <Calendar size={12} /> Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                      <Clock size={12} /> Time of Birth
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Place of Birth (City, Country)
                  </label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    placeholder="e.g. Varanasi, Uttar Pradesh, India"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Primary Life Focus / Affliction to Resolve
                  </label>
                  <select
                    value={formData.primaryConcern}
                    onChange={(e) => setFormData({ ...formData, primaryConcern: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="Career Growth, Wealth & Graha Dosha Relief">Career Stagnation, Promotion & Financial Growth</option>
                    <option value="Marriage Delay, Manglik Dosha & Kundli Harmony">Delayed Marriage, Compatibility & Relationship Peace</option>
                    <option value="Health Vitality & Chronic Energy Shielding">Health Immunity & Relief from Chronic Obstacles</option>
                    <option value="Rahu-Ketu Transit, Sade Sati & Kalasarpa Dosha">Rahu-Ketu / Shani Sade Sati Karmic Pacification</option>
                    <option value="Business Prosperity & Spatial Vastu Alignment">Business Growth, Debt Clearance & Vastu Corrections</option>
                    <option value="Spiritual Awakening, Ishta Devata & Inner Peace">Spiritual Breakthrough & Ishta Devata Sadhana</option>
                  </select>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Available Wallet Balance:</span>
                  <span className="font-bold text-foreground">
                    {formatPrice(userBalance)}
                  </span>
                </div>

                {hasEnoughWalletBalance ? (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-semibold bg-green-500/10 p-2.5 rounded-xl border border-green-500/20">
                    <Wallet size={16} />
                    <span>
                      Sufficient wallet balance. ₹{price} will be deducted directly. Instant generation!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    <CreditCard size={16} />
                    <span>
                      Wallet balance is low ({formatPrice(userBalance)}). You can pay ₹{price} instantly via Razorpay (UPI, Cards, NetBanking).
                    </span>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] font-black text-sm hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Synthesizing Authentic Parihara Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate My Complete Parihara Plan (₹{price})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success State with Report Highlights */
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Your Sacred Parihara Plan is Consecrated!
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Generated for <strong className="text-foreground">{generatedReport.devoteeName}</strong> with Lagna{' '}
                  <strong className="text-foreground">{generatedReport.astrologicalFoundation?.lagna}</strong> and active Mahadasha{' '}
                  <strong className="text-foreground">{generatedReport.astrologicalFoundation?.currentDasha}</strong>.
                </p>
              </div>

              {/* Preview 8 Remedies */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
                  Blueprint Remedial Summary:
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {generatedReport.eightSacredRemedies?.map((rem: any) => (
                    <div
                      key={rem.id}
                      className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-accent/20 text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {rem.number}
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">
                          {rem.category}: {rem.title || rem.gemstoneName || rem.directionalRemedy}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          {rem.prescribedCount || rem.benefits || rem.actionStep}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push('/my-reports');
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#2C3E50] font-black text-sm hover:shadow-lg transition-all"
                >
                  <FileText size={16} /> View in My Reports
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
