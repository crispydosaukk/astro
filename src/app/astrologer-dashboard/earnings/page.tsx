'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  TrendingUp,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useUserData } from '@/lib/useUserData';
import { useCurrency } from '@/lib/CurrencyContext';
import { format } from 'date-fns';

export default function EarningsPage() {
  const { user } = useUserData();
  const { formatPrice } = useCurrency();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'consultations'),
      where('astrologerId', '==', user.uid),
      where('status', '==', 'completed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        total += data.price || 0;
        return { id: doc.id, ...data };
      });

      // Sort by createdAt descending
      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setTransactions(docs);
      setTotalEarnings(total);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // We format the date nicely
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'dd MMM yyyy, h:mm a');
  };

  return (
    <div className="px-6 lg:px-8 py-8 max-w-screen-2xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Earnings & Payouts</h1>
          <p className="text-muted-foreground mt-1">Track your revenue and manage withdrawals.</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center gap-2 hover:bg-accent/90 transition-colors w-fit">
          <Download size={18} /> Download Statement
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold text-foreground flex items-center">
            {formatPrice(totalEarnings)}
          </h2>
          <button className="mt-4 w-full py-2.5 rounded-xl border border-accent text-accent font-semibold hover:bg-accent/10 transition-colors">
            Withdraw Funds
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Total Earnings (All Time)
          </p>
          <h2 className="text-4xl font-bold text-foreground">{formatPrice(totalEarnings)}</h2>
          <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-semibold">
            <TrendingUp size={16} /> Based on completed consultations
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-light dark:glass-card p-6 rounded-2xl border border-border"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">Next Payout Date</p>
          <h2 className="text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <Calendar size={24} className="text-accent" />
            01 Aug 2026
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Automatic payouts process on the 1st of every month.
          </p>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">Recent Transactions</h3>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No completed consultations yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, i) => (
                    <tr
                      key={txn.id || i}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-muted-foreground">
                        {txn.id.substring(0, 9).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                        <ArrowDownRight size={16} className="text-green-400" />
                        Consultation ({txn.type || 'Call'})
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold tabular-nums text-green-400`}>
                        +{formatPrice(txn.price)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
