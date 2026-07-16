'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Download, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function EarningsPage() {
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
            ₹8,450
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
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Earnings (This Month)</p>
          <h2 className="text-4xl font-bold text-foreground">₹24,500</h2>
          <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-semibold">
            <TrendingUp size={16} /> +15% from last month
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'TXN-00124', type: 'Consultation (Call)', date: 'Today, 2:30 PM', amount: '+₹400', isCredit: true },
                { id: 'TXN-00123', type: 'Consultation (Chat)', date: 'Today, 11:15 AM', amount: '+₹250', isCredit: true },
                { id: 'TXN-00122', type: 'Payout (Bank Transfer)', date: '01 Jul 2026', amount: '-₹15,000', isCredit: false },
                { id: 'TXN-00121', type: 'Consultation (Call)', date: '30 Jun 2026', amount: '+₹600', isCredit: true },
              ].map((txn, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-muted-foreground">{txn.id}</td>
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                    {txn.isCredit ? <ArrowDownRight size={16} className="text-green-400" /> : <ArrowUpRight size={16} className="text-red-400" />}
                    {txn.type}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{txn.date}</td>
                  <td className={`px-6 py-4 text-right font-bold tabular-nums ${txn.isCredit ? 'text-green-400' : 'text-foreground'}`}>
                    {txn.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
