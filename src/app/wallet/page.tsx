'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { useUserData } from '@/lib/useUserData';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Loader2, Plus, Wallet, ArrowUpRight, ArrowDownLeft, Clock, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useCurrency } from '@/lib/CurrencyContext';
import { loadRazorpayScript } from '@/lib/razorpay';
import { useRouter, useSearchParams } from 'next/navigation';

function WalletContent() {
  const { user, userData, loading: userLoading } = useUserData();
  const { formatPrice, currencySymbol, convertPrice, currencyCode } = useCurrency();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam) {
      localStorage.setItem('wallet_return_url', redirectParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchTransactions() {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, 'users', user.uid, 'wallet_transactions'),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const txs: any[] = [];
        querySnapshot.forEach((doc) => {
          txs.push({ id: doc.id, ...doc.data() });
        });
        setTransactions(txs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoadingTx(false);
      }
    }

    if (user && !userLoading) {
      fetchTransactions();
    } else if (!userLoading) {
      setLoadingTx(false);
    }
  }, [user, userLoading]);

  const isUSD = currencyCode === 'USD';
  const presets = isUSD ? [1, 5, 10] : [50, 100, 500];
  const minAllowed = isUSD ? 0.50 : 10;
  const numAmount = parseFloat(amount);
  const isTooLow = amount !== '' && !isNaN(numAmount) && numAmount < minAllowed;

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to add funds');
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val < minAllowed) {
      toast.error(`Minimum transaction amount is ${currencySymbol}${minAllowed.toFixed(isUSD ? 2 : 0)}.`);
      return;
    }

    setIsProcessing(true);
    try {
      const resLoaded = await loadRazorpayScript();
      if (!resLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      const baseInrAmount = isUSD ? Math.round(val / 0.012) : val;

      // 1. Create Razorpay order
      const orderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: baseInrAmount,
          currency: 'INR',
          notes: {
            userId: user.uid,
            userEmail: user.email || userData?.email || '',
            type: 'wallet_recharge',
          },
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // 2. Open Razorpay Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AstroParihar',
        description: 'Wallet Balance Recharge',
        image: '/AstroParihar_Top_Logo.jpg',
        order_id: orderData.orderId,
        prefill: {
          name: userData?.name || user.displayName || '',
          email: user.email || userData?.email || '',
          contact: userData?.phone || '',
        },
        theme: {
          color: '#C9952B',
        },
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature and update wallet balance
            const verifyRes = await fetch('/api/verify-razorpay-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentType: 'wallet',
                userId: user.uid,
                amount: baseInrAmount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            toast.success('Funds added to wallet successfully!');
            setAmount('');

            // Check return URL if user came from booking/remedy page
            const returnUrl = searchParams?.get('redirect') || localStorage.getItem('wallet_return_url');
            if (returnUrl) {
              localStorage.removeItem('wallet_return_url');
              setTimeout(() => {
                router.push(returnUrl);
              }, 1000);
            } else {
              window.location.reload();
            }
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error updating wallet');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info('Payment process cancelled');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error processing request');
      setIsProcessing(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9952B]" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark">
        <Navbar />
        <div className="container mx-auto p-8 max-w-4xl pt-32 text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground">Wallet</h1>
          <p className="text-muted-foreground">Please log in to view your wallet.</p>
        </div>
      </div>
    );
  }

  const currentBalance = userData?.walletBalance || 0;

  return (
    <div className="min-h-screen bg-background dark cosmic-bg">
      <Navbar />
      <div className="container mx-auto p-6 max-w-6xl pt-32">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Balance and Add Funds */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Balance Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card border border-white/10 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#C9952B]/20 flex items-center justify-center">
                    <Wallet size={20} className="text-[#C9952B]" />
                  </div>
                  <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">Available Balance</p>
                </div>
                <h2 className="text-5xl font-bold text-white mb-2 tracking-tight">
                  {formatPrice(currentBalance)}
                </h2>
                <p className="text-sm text-white/40 mb-4">Securely store funds for instant bookings</p>
                
                <div className="pt-3 border-t border-white/10 flex items-start gap-2.5 text-xs text-[#C9952B] bg-[#C9952B]/10 p-3 rounded-xl">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Note: A minimum wallet balance for <strong>5 minutes</strong> of consultation is required to connect with an astrologer.</span>
                </div>
              </div>
            </motion.div>

            {/* Add Funds Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card border border-white/10 rounded-3xl p-6"
            >
              <h3 className="text-xl font-bold text-foreground mb-4">Add Funds</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2 rounded-xl border ${amount === preset.toString() ? 'border-[#C9952B] bg-[#C9952B]/10 text-[#C9952B]' : 'border-white/10 text-white/60 hover:border-white/30'} font-semibold transition-all flex items-center justify-center`}
                  >
                    {currencySymbol}{preset}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-white/60">Custom Amount</label>
                    <span className="text-xs text-white/40">Min: {currencySymbol}{minAllowed.toFixed(isUSD ? 2 : 0)}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">{currencySymbol}</span>
                    <input
                      type="number"
                      min={isUSD ? "0.50" : "10"}
                      step={isUSD ? "0.01" : "1"}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Enter amount (Min ${currencySymbol}${minAllowed.toFixed(isUSD ? 2 : 0)})`}
                      className={`w-full bg-white/5 border ${isTooLow ? 'border-red-500 bg-red-500/10 focus:border-red-500' : 'border-white/10 focus:border-[#C9952B]'} rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none transition-colors`}
                      required
                    />
                  </div>
                  {isTooLow && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 mt-2 flex items-center gap-1.5 font-medium"
                    >
                      <span>⚠️ Minimum transaction amount is {currencySymbol}{minAllowed.toFixed(isUSD ? 2 : 0)}. Payments below this amount are not accepted.</span>
                    </motion.p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isProcessing || !amount || isNaN(numAmount) || numAmount < minAllowed}
                  className="w-full py-3.5 rounded-xl gold-gradient-bg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Transaction History */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card border border-white/10 rounded-3xl p-6 h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Transaction History</h3>
                <span className="text-sm text-muted-foreground">{transactions.length} records</span>
              </div>

              {loadingTx ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#C9952B]" size={32} />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <Clock size={48} className="text-white/20 mb-4" />
                  <p className="text-lg font-semibold text-white/60 mb-2">No transactions yet</p>
                  <p className="text-sm text-white/40">Your wallet history will appear here once you add funds.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2 max-h-[600px] custom-scrollbar">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'failed' ? 'bg-red-500/20 text-red-400' : tx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {tx.status === 'failed' ? <XCircle size={20} /> : tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{tx.description || (tx.type === 'credit' ? 'Funds Added' : 'Payment Made')}</p>
                          <p className="text-xs text-white/50">{new Date(tx.date).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.status === 'failed' ? 'text-red-400 line-through opacity-70' : tx.type === 'credit' ? 'text-green-400' : 'text-foreground'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount)}
                        </p>
                        <p className={`text-xs capitalize font-semibold ${tx.status === 'failed' ? 'text-red-500' : 'text-white/50'}`}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#C9952B] mb-4" size={36} />
        <p className="text-muted-foreground text-sm">Loading Wallet...</p>
      </div>
    }>
      <WalletContent />
    </Suspense>
  );
}
