'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Flame,
  Zap,
  Download,
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
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

      const rawPrice = currencyCode === 'USD' ? guide.priceUSD : guide.price;

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
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'AstroParihar',
        description: `Guide: ${guide.title}`,
        image: '/AstroParihar_Top_Logo.jpg',
        order_id: data.orderId,
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

  const handleDirectDownload = () => {
    if (!guide) return;
    const link = document.createElement('a');
    link.href = guide.pdfUrl;
    link.download = guide.pdfTitle || `${guide.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  if (loadingGuide || !guide) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C9952B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayPrice = currencyCode === 'USD' ? `$${guide.priceUSD}` : `₹${guide.price}`;

  return (
    <div className="min-h-screen bg-background dark text-foreground">
      {/* Fullscreen Hero Section */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 cosmic-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#8B1A2A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#C9952B]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full">
            <div className="grid lg:grid-cols-2 items-center min-h-screen">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="px-6 lg:px-12 xl:px-20 space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C9952B]/10 text-[#C9952B] border border-[#C9952B]/20 backdrop-blur-md">
                      {guide.badge}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-xs font-extrabold gold-gradient-bg text-white shadow">
                      {displayPrice}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                    {guide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    {guide.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-6">
                    {hasPurchased ? (
                      <>
                        <button
                          onClick={() => setShowPdfModal(true)}
                          className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
                        >
                          <Eye size={18} /> View PDF Online 📄
                        </button>
                        <button
                          onClick={handleDirectDownload}
                          className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground font-bold hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Download size={18} className="text-[#C9952B]" /> Download PDF Guide ⬇️
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleBuyGuide}
                          disabled={isProcessingPayment}
                          className="px-8 py-3.5 rounded-full gold-gradient-bg text-white font-bold flex items-center gap-2 shadow-xl hover:opacity-90 transition-opacity"
                        >
                          <Lock size={18} />
                          <span>{isProcessingPayment ? 'Opening Razorpay...' : `Buy & Instant Access (${displayPrice})`}</span>
                        </button>
                        <Link
                          href="/my-reports"
                          className="px-6 py-3.5 rounded-full bg-white/5 border border-white/10 text-foreground font-semibold hover:bg-white/10 transition-colors text-sm"
                        >
                          View My Orders 📄
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Right Visual Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="relative h-[40vh] lg:h-[80vh] w-full order-1 lg:order-2 flex items-center justify-center p-6 lg:p-12"
              >
                <div className="relative w-full h-full max-w-lg lg:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#C9952B]/30 bg-black/40 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl gold-gradient-bg flex items-center justify-center text-white shadow-2xl">
                    <ShieldCheck size={44} />
                  </div>
                  <h3 className="text-2xl font-bold text-gradient-gold">{guide.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md">{guide.description}</p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={14} /> Official AstroParihar PDF Publication
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview & Topics Section */}
      <section className="py-12 lg:py-16 bg-background relative z-10 space-y-12">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
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

          {/* Action Card */}
          <div className="glass-card p-8 rounded-3xl border border-[#C9952B]/30 bg-[#C9952B]/5 flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">Ready to Download {guide.title}?</h3>
              <p className="text-xs text-muted-foreground">Instant PDF access after payment • Available anytime under My Reports</p>
            </div>

            {hasPurchased ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="px-6 py-3 rounded-full gold-gradient-bg text-white font-bold text-xs flex items-center gap-2 shadow"
                >
                  <Eye size={16} /> View Online
                </button>
                <button
                  onClick={handleDirectDownload}
                  className="px-6 py-3 rounded-full bg-white/10 text-foreground font-bold text-xs flex items-center gap-2"
                >
                  <Download size={16} className="text-[#C9952B]" /> Download PDF
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
                  onClick={handleDirectDownload}
                  className="px-6 py-2.5 rounded-full gold-gradient-bg text-white text-xs font-bold flex items-center gap-2 shadow"
                >
                  <Download size={14} /> Download PDF File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
