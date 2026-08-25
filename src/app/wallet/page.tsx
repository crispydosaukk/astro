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
  const presets = isUSD ? [5, 10, 25, 50, 100, 250] : [100, 200, 500, 1000, 2000, 5000];
  const minAllowed = isUSD ? 0.50 : 10;
  const numAmount = parseFloat(amount);
  const isTooLow = amount !== '' && !isNaN(numAmount) && numAmount < minAllowed;

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(numAmount) || numAmount < minAllowed) {
      toast.error(`Minimum transaction amount is ${currencySymbol}${minAllowed.toFixed(isUSD ? 2 : 0)}.`);
      return;
    }

    if (!user) {
      toast.error('Please login to add funds');
      return;
    }

    setIsProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your connection.');
        setIsProcessing(false);
        return;
      }

      // Convert user input amount to base INR amount for Razorpay
      const finalInrAmount = isUSD ? Math.round(numAmount * 85) : Math.round(numAmount);

      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalInrAmount,
          currency: 'INR',
          paymentType: 'wallet_recharge',
          userId: user.uid,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      const orderKey = orderData.keyId || orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!orderKey) {
        throw new Error('Razorpay Key not found. Please verify keys in Admin Settings.');
      }

      const options = {
        key: orderKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AstroParihar',
        description: 'Wallet Recharge',
        image: '/astrologo.png',
        order_id: orderData.orderId || orderData.id,
        prefill: {
          name: userData?.name || user?.displayName || '',
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
                paymentType: 'wallet_recharge',
                userId: user.uid,
                amount: finalInrAmount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            toast.success('Funds added successfully!');
            setAmount('');
            
            // Check for redirect return url
            const returnUrl = localStorage.getItem('wallet_return_url');
            if (returnUrl) {
              localStorage.removeItem('wallet_return_url');
              router.push(returnUrl);
            } else {
              window.location.reload();
            }
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error verifying payment');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">
        <Navbar />
        <div className="container mx-auto p-6 max-w-6xl pt-32 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-[#713B32] mb-4" size={36} />
          <p className="text-[#6B5E55] text-sm">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">
        <Navbar />
        <div className="container mx-auto p-6 max-w-6xl pt-32 text-center">
          <p className="text-[#6B5E55]">Please log in to view your wallet.</p>
        </div>
      </div>
    );
  }

  const currentBalance = userData?.walletBalance || 0;

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#292522]">
      <Navbar />
      <div className="container mx-auto p-6 max-w-6xl pt-32">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Balance and Add Funds */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Balance Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl p-8 relative overflow-hidden shadow-xl"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#EDE4D5] text-[#713B32] flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <p className="text-xs font-bold text-[#6B5E55] uppercase tracking-wider">Available Balance</p>
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-[#292522] mb-2 tracking-tight">
                  {formatPrice(currentBalance)}
                </h2>
                <p className="text-xs text-[#6B5E55] mb-4">Securely store funds for instant consultations</p>
                
                <div className="pt-3 border-t border-[#E5D9C8] flex items-start gap-2.5 text-xs text-[#713B32] bg-[#EDE4D5]/60 p-3 rounded-2xl">
                  <Info size={16} className="flex-shrink-0 mt-0.5 text-[#713B32]" />
                  <span>Note: A minimum wallet balance for <strong>5 minutes</strong> of consultation is required to connect with an astrologer.</span>
                </div>
              </div>
            </motion.div>

            {/* Add Funds Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-bold text-[#292522] mb-4">Add Funds</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2 rounded-xl border ${amount === preset.toString() ? 'border-[#713B32] bg-[#713B32] text-white' : 'border-[#E5D9C8] bg-[#F8F3EA] text-[#292522] hover:bg-[#EDE4D5]'} font-bold text-sm transition-all flex items-center justify-center`}
                  >
                    {currencySymbol}{preset}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#6B5E55]">Custom Amount</label>
                    <span className="text-xs text-[#6B5E55]">Min: {currencySymbol}{minAllowed.toFixed(isUSD ? 2 : 0)}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B5E55] font-bold">{currencySymbol}</span>
                    <input
                      type="number"
                      min={isUSD ? "0.50" : "10"}
                      step={isUSD ? "0.01" : "1"}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Enter amount (Min ${currencySymbol}${minAllowed.toFixed(isUSD ? 2 : 0)})`}
                      className={`w-full bg-[#FFFDFC] border ${isTooLow ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-[#E5D9C8] focus:border-[#B88A44]'} rounded-xl py-3 pl-8 pr-4 text-[#292522] focus:outline-none transition-colors shadow-sm font-semibold text-sm`}
                      required
                    />
                  </div>
                  {isTooLow && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 mt-2 flex items-center gap-1.5 font-medium"
                    >
                      <span>⚠️ Minimum transaction amount is {currencySymbol}{minAllowed.toFixed(isUSD ? 2 : 0)}. Payments below this amount are not accepted.</span>
                    </motion.p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isProcessing || !amount || isNaN(numAmount) || numAmount < minAllowed}
                  className="w-full py-3.5 rounded-xl bg-[#713B32] hover:bg-[#552B24] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="bg-[#FFFDFC] border border-[#E5D9C8] rounded-3xl p-6 h-full flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[#E5D9C8] pb-4">
                <h3 className="text-xl font-bold text-[#292522]">Transaction History</h3>
                <span className="text-xs font-bold text-[#6B5E55] bg-[#EDE4D5] px-3 py-1 rounded-full">{transactions.length} records</span>
              </div>

              {loadingTx ? (
                <div className="flex-1 flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#713B32]" size={32} />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <Clock size={48} className="text-[#6B5E55]/30 mb-4" />
                  <p className="text-base font-bold text-[#292522] mb-1">No transactions yet</p>
                  <p className="text-xs text-[#6B5E55]">Your wallet history will appear here once you add funds.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2 max-h-[600px] custom-scrollbar">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F3EA] hover:bg-[#EDE4D5]/60 transition-colors border border-[#E5D9C8]">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'failed' ? 'bg-red-100 text-red-600' : tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {tx.status === 'failed' ? <XCircle size={20} /> : tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-[#292522] text-sm">{tx.description || (tx.type === 'credit' ? 'Funds Added' : 'Payment Made')}</p>
                          <p className="text-xs text-[#6B5E55]">{new Date(tx.date).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${tx.status === 'failed' ? 'text-red-500 line-through opacity-70' : tx.type === 'credit' ? 'text-green-700' : 'text-[#292522]'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount)}
                        </p>
                        <p className={`text-xs capitalize font-bold ${tx.status === 'failed' ? 'text-red-500' : 'text-[#6B5E55]'}`}>
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
      <div className="min-h-screen bg-[#F8F3EA] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#713B32] mb-4" size={36} />
        <p className="text-[#6B5E55] text-sm">Loading Wallet...</p>
      </div>
    }>
      <WalletContent />
    </Suspense>
  );
}
