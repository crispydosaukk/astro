'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, RefreshCw, Eye } from 'lucide-react';

import { db } from '@/lib/firebase/config';
import { collectionGroup, getDocs, query } from 'firebase/firestore';
import { useCurrency } from '@/lib/CurrencyContext';

const statusColors: Record<string, string> = {
  completed: 'bg-green-500/15 text-green-400',
  success: 'bg-green-500/15 text-green-400',
  failed: 'bg-red-500/15 text-red-400',
  refunded: 'bg-amber-500/15 text-amber-400',
  pending: 'bg-blue-500/15 text-blue-400',
};

export default function AdminPaymentsTable() {
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGateway, setFilterGateway] = useState('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchPayments = async () => {
      try {
        const q = query(collectionGroup(db, 'wallet_transactions'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort locally to avoid needing a composite index in Firestore
        data.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const pId = p.stripeSessionId || p.id || '';
    const matchSearch =
      (p.user || '').toLowerCase().includes(search.toLowerCase()) ||
      pId.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    
    // Default our status logic for 'completed' vs 'success'
    const status = p.status || 'completed';
    const mappedStatus = status === 'completed' ? 'success' : status;
    const matchStatus = filterStatus === 'all' || mappedStatus === filterStatus;
    
    const gateway = p.stripeSessionId ? 'Stripe' : 'Wallet';
    const matchGateway = filterGateway === 'all' || gateway === filterGateway;
    
    return matchSearch && matchStatus && matchGateway;
  });

  const totalRevenue = filtered
    .filter((p) => (p.status === 'completed' || p.status === 'success') && p.type === 'credit')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h2 className="text-base font-bold text-foreground">Payment Transactions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Filtered Revenue (Top-ups):{' '}
            <span className="text-accent font-semibold">{formatPrice(totalRevenue)}</span>
          </p>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search TXN or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none w-44"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={filterGateway}
          onChange={(e) => setFilterGateway(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none"
        >
          <option value="all">All Gateways</option>
          <option value="Stripe">Stripe</option>
          <option value="Wallet">Wallet Deductions</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:border-accent/50 text-sm hover:text-accent transition-all">
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                'Transaction ID',
                'User',
                'Type',
                'Amount',
                'Gateway',
                'Date',
                'Status',
                'Actions',
              ].map((h) => (
                <th
                  key={`pay-th-${h}`}
                  className="text-left px-5 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                  Loading payments...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                  No payments found
                </td>
              </tr>
            ) : (
              filtered.map((pay, i) => {
                const gateway = pay.stripeSessionId ? 'Stripe' : 'Wallet';
                const status = pay.status || 'completed';
                const mappedStatus = status === 'completed' ? 'success' : status;
                let dateStr = 'Unknown';
                if (pay.date) {
                   dateStr = new Date(pay.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                }

                return (
                  <motion.tr
                    key={pay.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{pay.stripeSessionId?.substring(0,12) || pay.id.substring(0,8)}...</td>
                    <td className="px-5 py-4 font-medium text-foreground">{pay.user || 'Customer'}</td>
                    <td className="px-5 py-4 text-muted-foreground">{pay.description || 'Transaction'}</td>
                    <td className={`px-5 py-4 font-bold tabular-nums ${pay.type === 'credit' ? 'text-green-400' : 'text-foreground'}`}>
                      {pay.type === 'credit' ? '+' : '-'}{formatPrice(pay.amount || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {gateway}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{dateStr}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[mappedStatus] || 'bg-muted text-muted-foreground'}`}
                      >
                        {mappedStatus.charAt(0).toUpperCase() + mappedStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 rounded-lg hover:bg-muted transition-all"
                          title="View transaction"
                        >
                          <Eye size={13} className="text-muted-foreground" />
                        </button>
                        {mappedStatus === 'success' && (
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-all"
                            title="Process refund"
                          >
                            <RefreshCw size={13} className="text-amber-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 border-t border-border flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {filtered.length} transactions · {filtered.filter((p) => p.status === 'completed' || p.status === 'success').length}{' '}
          successful
        </span>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-green-400 font-semibold">
            ✓ {filtered.filter((p) => p.status === 'completed' || p.status === 'success').length} Success
          </span>
          <span className="text-red-400 font-semibold">
            ✗ {filtered.filter((p) => p.status === 'failed').length} Failed
          </span>
          <span className="text-amber-400 font-semibold">
            ↩ {filtered.filter((p) => p.status === 'refunded').length} Refunded
          </span>
        </div>
      </div>
    </div>
  );
}
