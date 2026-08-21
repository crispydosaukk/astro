'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Flame,
  Zap,
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  FileText,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { getMahadashaGuide, MahadashaGuide } from '@/lib/mahadasha';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { loadRazorpayScript } from '@/lib/razorpay';
import DynamicPageContent from '@/components/DynamicPageContent';

interface MahadashaGuidePageViewProps {
  guideId: string;
}

export default function MahadashaGuidePageView({ guideId }: MahadashaGuidePageViewProps) {
  const router = useRouter();
  const { user } = useUserData();
  const { currencyCode, convertPrice, formatPrice } = useCurrency();

  const [guide, setGuide] = useState<MahadashaGuide | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoadingGuide(true);
      const data = await getMahadashaGuide(guideId);
      setGuide(data);

      if (user) {
        try {
          const q = query(
            collection(db, 'service_requests'),
            where('userId', '==', user.uid),
            where('details.guideId', '==', guideId)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setHasPurchased(true);
          }
        } catch (err) {
          console.warn('Error checking purchase status:', err);
        }
      }
      setLoadingGuide(false);
    }
    loadData();
  }, [guideId, user]);

  const handleBuyGuide = async () => {
    if (!guide) return;

    if (!user) {
      toast.error('Please sign in to purchase this guide');
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname : `/services/${guideId}`;
      router.push(`/sign-up-login-screen?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setIsProcessingPayment(true);
    try {
      const resLoaded = await loadRazorpayScript();
      if (!resLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsProcessingPayment(false);
        return;
      }

      const rawPrice = currencyCode === 'USD' ? (guide.priceUSD || 19) : (guide.price || 499);

      const reportDetails = {
        userId: user.uid,
        userEmail: user.email || '',
        type: guide.title,
        serviceId: guide.id,
        displayAmount: rawPrice,
        currency: currencyCode.toLowerCase(),
        details: {
          guideId: guide.id,
          guideTitle: guide.title,
          pdfUrl: guide.pdfUrl,
        },
      };

      // 1. Create Razorpay Order
      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: rawPrice,
          currency: 'INR',
          notes: {
            type: 'guide_purchase',
            guideId: guide.id,
            userId: user.uid,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // 2. Open Razorpay Modal
      const options = {
        key: data.keyId || data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: data.amount,
        currency: data.currency,
        name: 'AstroParihar',
        description: `Guide: ${guide.title}`,
        image: '/AstroParihar_Top_Logo.jpg',
        order_id: data.orderId || data.id,
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
        },
        theme: {
          color: '#C9952B',
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
                amount: rawPrice,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            toast.success('Guide purchased successfully!');
            setHasPurchased(true);
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error granting guide access');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            toast.info('Payment process cancelled');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || 'Payment initiation failed. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  if (loadingGuide || !guide) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C9952B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayPrice = formatPrice(guide.price || 499, guide.priceUSD || 19);

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section with Image as Background */}
      <section className="relative overflow-hidden border-b border-[#B88A44]/20 flex flex-col justify-center min-h-[85vh] lg:min-h-[90vh] pt-24 lg:pt-28 pb-16 lg:pb-24">
        {/* Background Image with Vedic Cosmic Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/horoscope_banner.jpg"
            alt="Mahadasha Guide Background"
            fill
            className="object-cover object-center lg:object-right scale-100"
            priority
          />
          {/* Targeted overlays: dark gradient on left for crisp readability, open on right for vivid artwork */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#170b16]/95 via-[#230f20]/85 to-[#170b16]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b0d1a] via-transparent to-[#150914]/50" />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#713B32]/30 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/20 blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 w-full">
            <div className="max-w-3xl space-y-6">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide bg-[#B88A44]/20 text-[#F6D075] border border-[#B88A44]/40 shadow-xl shadow-black/20 backdrop-blur-md">
                  <Sparkles size={15} className="text-[#F6D075] animate-pulse" />
                  Official Vedic Mahadasha Guide
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-lg">
                  {guide.title}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#F8F3EA]/90 font-medium leading-relaxed max-w-2xl drop-shadow">
                  {guide.subtitle}
                </p>
              </motion.div>

              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/15 backdrop-blur-md shadow-lg">
                  <ShieldCheck size={16} className="text-[#F6D075]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">100% Authentic Remedies</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/45 border border-white/10 backdrop-blur-md shadow-lg">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white/95">Official PDF Publication</span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-3"
              >
                {hasPurchased ? (
                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="px-8 py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center gap-2.5 shadow-2xl shadow-[#C9952B]/40 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base"
                  >
                    <Eye size={18} /> View Guide Online 📄
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleBuyGuide}
                      disabled={isProcessingPayment}
                      className="px-8 py-4 rounded-full gold-gradient-bg text-[#292522] font-extrabold flex items-center gap-2.5 shadow-2xl shadow-[#C9952B]/40 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base"
                    >
                      <Lock size={18} />
                      <span>{isProcessingPayment ? 'Opening Razorpay...' : `Buy & Instant Access (${displayPrice})`}</span>
                    </button>
                    <Link
                      href="/my-reports"
                      className="px-7 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 hover:scale-[1.02] transition-all backdrop-blur-sm text-sm sm:text-base shadow-md"
                    >
                      View My Orders 📄
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview & Topics Section */}
      <section className="py-12 lg:py-16 bg-background relative z-10 space-y-12">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 space-y-8">
          <div className="glass-card p-8 lg:p-10 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">What This Guide Covers</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{guide.description}</p>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#C9952B]">Table of Contents & Key Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guide.previewTopics.map((topic, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full gold-gradient-bg text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-medium text-foreground leading-relaxed">{topic}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Content Published from Admin CMS */}
          <div className="py-2">
            <DynamicPageContent pageId={guideId} />
          </div>

          {/* Action Card */}
          <div className="glass-card p-8 rounded-3xl border border-[#C9952B]/30 bg-[#C9952B]/5 flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">Ready to Access {guide.title}?</h3>
              <p className="text-xs text-muted-foreground">Instant online access after payment • Available anytime under My Reports</p>
            </div>

            {hasPurchased ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="px-6 py-3 rounded-full gold-gradient-bg text-white font-bold text-xs flex items-center gap-2 shadow"
                >
                  <Eye size={16} /> View Online
                </button>
              </div>
            ) : (
              <button
                onClick={handleBuyGuide}
                disabled={isProcessingPayment}
                className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-bold text-sm shadow-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Lock size={16} />
                <span>{isProcessingPayment ? 'Processing...' : `Get Guide Now (${displayPrice})`}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PDF View Modal */}
      <AnimatePresence>
        {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="text-[#C9952B]" size={20} />
                  <h3 className="font-bold text-foreground text-sm sm:text-base">{guide.title}</h3>
                </div>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-slate-950 flex flex-col">
                <iframe
                  src={guide.pdfUrl}
                  title={guide.title}
                  className="w-full h-[65vh] sm:h-[70vh] rounded-2xl border border-white/10 bg-white"
                />
              </div>

              <div className="p-5 border-t border-white/10 bg-muted/30 flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-muted-foreground font-mono">Status: Verified Purchase</span>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-foreground text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
