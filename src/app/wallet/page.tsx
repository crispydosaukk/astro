'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useUserData } from '@/lib/useUserData';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Loader2, Plus, Wallet, ArrowUpRight, ArrowDownLeft, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useCurrency } from '@/lib/CurrencyContext';

export default function WalletPage() {
  const { user, userData, loading: userLoading } = useUserData();
  const { formatPrice, currencySymbol, convertPrice, currencyCode } = useCurrency();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to add funds');
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-wallet-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email || userData?.email || '',
          amount: val, // Base INR amount
          displayAmount: convertPrice(val),
          currency: currencyCode.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
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
                <p className="text-sm text-white/40">Securely store funds for instant bookings</p>
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
                {[10, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2 rounded-xl border ${amount === preset.toString() ? 'border-[#C9952B] bg-[#C9952B]/10 text-[#C9952B]' : 'border-white/10 text-white/60 hover:border-white/30'} font-semibold transition-all`}
                  >
                    {formatPrice(preset)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-white/60 mb-1.5 block">Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">{currencySymbol}</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-[#C9952B] transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
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
