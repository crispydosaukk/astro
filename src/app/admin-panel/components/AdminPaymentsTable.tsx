'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, RefreshCw, Eye } from 'lucide-react';

const payments = [
  { id: 'pay-001', txnId: 'TXN-AP-84920', user: 'Arjun Sharma', type: 'Premium Subscription', amount: '₹499', gateway: 'Razorpay', date: '3 Jul 2026', status: 'success' },
  { id: 'pay-002', txnId: 'TXN-AP-84919', user: 'Ananya K.', type: 'Consultation (45 min)', amount: '₹1,350', gateway: 'Stripe', date: '3 Jul 2026', status: 'success' },
  { id: 'pay-003', txnId: 'TXN-AP-84918', user: 'Rajan Mehta', type: 'Annual Subscription', amount: '₹3,999', gateway: 'Razorpay', date: '2 Jul 2026', status: 'success' },
  { id: 'pay-004', txnId: 'TXN-AP-84917', user: 'Suresh Pillai', type: 'Consultation (60 min)', amount: '₹2,100', gateway: 'UPI', date: '2 Jul 2026', status: 'success' },
  { id: 'pay-005', txnId: 'TXN-AP-84916', user: 'Deepak Nambiar', type: 'Premium Subscription', amount: '₹499', gateway: 'Razorpay', date: '1 Jul 2026', status: 'refunded' },
  { id: 'pay-006', txnId: 'TXN-AP-84915', user: 'Kavitha Reddy', type: 'Consultation (30 min)', amount: '₹750', gateway: 'UPI', date: '1 Jul 2026', status: 'failed' },
  { id: 'pay-007', txnId: 'TXN-AP-84914', user: 'Meera Iyer', type: 'Annual Subscription', amount: '₹3,999', gateway: 'Stripe', date: '30 Jun 2026', status: 'success' },
  { id: 'pay-008', txnId: 'TXN-AP-84913', user: 'Preethi Sundaram', type: 'Consultation (15 min)', amount: '₹375', gateway: 'Razorpay', date: '30 Jun 2026', status: 'success' },
];

const statusColors: Record<string, string> = {
  success: 'bg-green-500/15 text-green-400',
  failed: 'bg-red-500/15 text-red-400',
  refunded: 'bg-amber-500/15 text-amber-400',
  pending: 'bg-blue-500/15 text-blue-400',
};

export default function AdminPaymentsTable() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGateway, setFilterGateway] = useState('all');

  const filtered = payments.filter(p => {
    const matchSearch = p.user.toLowerCase().includes(search.toLowerCase()) || p.txnId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchGateway = filterGateway === 'all' || p.gateway === filterGateway;
    return matchSearch && matchStatus && matchGateway;
  });

  const totalRevenue = filtered.filter(p => p.status === 'success').reduce((sum, p) => {
    const num = parseInt(p.amount.replace(/[^0-9]/g, ''));
    return sum + num;
  }, 0);

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h2 className="text-base font-bold text-foreground">Payment Transactions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Filtered total: <span className="text-accent font-semibold">₹{totalRevenue.toLocaleString()}</span></p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search TXN or user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none w-44" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none">
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={filterGateway} onChange={e => setFilterGateway(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none">
          <option value="all">All Gateways</option>
          <option value="Razorpay">Razorpay</option>
          <option value="Stripe">Stripe</option>
          <option value="UPI">UPI</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:border-accent/50 text-sm hover:text-accent transition-all">
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Transaction ID', 'User', 'Type', 'Amount', 'Gateway', 'Date', 'Status', 'Actions'].map(h => (
                <th key={`pay-th-${h}`} className="text-left px-5 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((pay, i) => (
              <motion.tr key={pay.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{pay.txnId}</td>
                <td className="px-5 py-4 font-medium text-foreground">{pay.user}</td>
                <td className="px-5 py-4 text-muted-foreground">{pay.type}</td>
                <td className="px-5 py-4 font-bold text-foreground tabular-nums">{pay.amount}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{pay.gateway}</span>
                </td>
                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{pay.date}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[pay.status] || 'bg-muted text-muted-foreground'}`}>
                    {pay.status.charAt(0).toUpperCase() + pay.status.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="View transaction"><Eye size={13} className="text-muted-foreground" /></button>
                    {pay.status === 'success' && (
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Process refund"><RefreshCw size={13} className="text-amber-400" /></button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 border-t border-border flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{filtered.length} transactions · {filtered.filter(p => p.status === 'success').length} successful</span>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-green-400 font-semibold">✓ {filtered.filter(p => p.status === 'success').length} Success</span>
          <span className="text-red-400 font-semibold">✗ {filtered.filter(p => p.status === 'failed').length} Failed</span>
          <span className="text-amber-400 font-semibold">↩ {filtered.filter(p => p.status === 'refunded').length} Refunded</span>
        </div>
      </div>
    </div>
  );
}