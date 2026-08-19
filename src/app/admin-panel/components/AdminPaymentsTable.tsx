'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  RefreshCw,
  Eye,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  User,
  Mail,
  Receipt,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

import { db } from '@/lib/firebase/config';
import { collection, collectionGroup, getDocs, doc, updateDoc, query } from 'firebase/firestore';
import { useCurrency } from '@/lib/CurrencyContext';
import { toast } from 'sonner';

const statusBadgeStyles: Record<string, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  completed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  failed: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  refunded: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  pending: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
};

interface TransactionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userAvatar?: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  status: 'success' | 'completed' | 'failed' | 'pending' | 'refunded';
  gateway: 'Razorpay' | 'Stripe' | 'Wallet';
  orderId?: string;
  paymentId?: string;
  stripeSessionId?: string;
  astrologerName?: string;
  durationMinutes?: number;
  rawDoc?: any;
}

export default function AdminPaymentsTable() {
  const { formatPrice } = useCurrency();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGateway, setFilterGateway] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Selected Transaction Modal
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);

  // Fetch all transactions and map with dynamic user data
  const fetchTransactions = async () => {
    try {
      setRefreshing(true);

      // 1. Fetch all users to create a lookup map for dynamic names & emails
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap = new Map<string, { name: string; email: string; phone?: string; avatar?: string }>();

      usersSnap.forEach((userDoc) => {
        const uData = userDoc.data();
        usersMap.set(userDoc.id, {
          name: uData.name || uData.displayName || 'Customer',
          email: uData.email || 'No email provided',
          phone: uData.phone || uData.phoneNumber || '',
          avatar: uData.avatar || uData.photoURL || '',
        });
      });

      // 2. Fetch all wallet_transactions across all users
      const q = query(collectionGroup(db, 'wallet_transactions'));
      const querySnapshot = await getDocs(q);

      const items: TransactionItem[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const parentUserId = docSnap.ref.parent?.parent?.id || data.userId || '';
        const userProfile = usersMap.get(parentUserId);

        // Derive user name dynamically
        const userName =
          data.userName ||
          data.user ||
          userProfile?.name ||
          (parentUserId ? `User (${parentUserId.slice(0, 6)})` : 'Customer');

        const userEmail = data.userEmail || userProfile?.email || 'N/A';
        const userPhone = data.userPhone || userProfile?.phone || '';
        const userAvatar =
          data.userAvatar ||
          userProfile?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

        // Gateway derivation
        let gateway: 'Razorpay' | 'Stripe' | 'Wallet' = 'Wallet';
        if (data.paymentId || data.orderId || data.razorpayPaymentId || data.razorpay_payment_id) {
          gateway = 'Razorpay';
        } else if (data.stripeSessionId || String(docSnap.id).startsWith('cs_test_') || String(docSnap.id).startsWith('cs_live_')) {
          gateway = 'Stripe';
        } else if (data.type === 'debit') {
          gateway = 'Wallet';
        }

        // Status normalization
        let rawStatus = (data.status || 'completed').toLowerCase();
        let status: TransactionItem['status'] = 'success';
        if (rawStatus === 'failed' || rawStatus === 'failure') status = 'failed';
        else if (rawStatus === 'refunded') status = 'refunded';
        else if (rawStatus === 'pending') status = 'pending';
        else status = 'success';

        // Date normalization
        let dateStr = data.date || data.createdAt;
        if (dateStr?.toDate) {
          dateStr = dateStr.toDate().toISOString();
        } else if (typeof dateStr === 'number') {
          dateStr = new Date(dateStr).toISOString();
        } else if (!dateStr) {
          dateStr = new Date().toISOString();
        }

        items.push({
          id: docSnap.id,
          userId: parentUserId,
          userName,
          userEmail,
          userPhone,
          userAvatar,
          amount: Number(data.amount) || 0,
          type: data.type === 'credit' ? 'credit' : 'debit',
          description: data.description || (data.type === 'credit' ? 'Wallet Recharge' : 'Astrology Consultation'),
          date: dateStr,
          status,
          gateway,
          orderId: data.orderId || data.razorpayOrderId || data.razorpay_order_id,
          paymentId: data.paymentId || data.razorpayPaymentId || data.razorpay_payment_id,
          stripeSessionId: data.stripeSessionId || (String(docSnap.id).startsWith('cs_') ? docSnap.id : undefined),
          astrologerName: data.astrologerName,
          durationMinutes: data.durationMinutes,
          rawDoc: data,
        });
      });

      // Sort newest first
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(items);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load live transactions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const term = search.toLowerCase();
      const matchSearch =
        !term ||
        t.id.toLowerCase().includes(term) ||
        t.userName.toLowerCase().includes(term) ||
        t.userEmail.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        (t.orderId && t.orderId.toLowerCase().includes(term)) ||
        (t.paymentId && t.paymentId.toLowerCase().includes(term)) ||
        (t.stripeSessionId && t.stripeSessionId.toLowerCase().includes(term));

      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchGateway = filterGateway === 'all' || t.gateway === filterGateway;
      const matchType = filterType === 'all' || t.type === filterType;

      return matchSearch && matchStatus && matchGateway && matchType;
    });
  }, [transactions, search, filterStatus, filterGateway, filterType]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const successful = filtered.filter((t) => t.status === 'success');
    const topups = successful.filter((t) => t.type === 'credit');
    const deductions = successful.filter((t) => t.type === 'debit');

    const totalTopups = topups.reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = deductions.reduce((sum, t) => sum + t.amount, 0);
    const successCount = successful.length;
    const failedCount = filtered.filter((t) => t.status === 'failed').length;
    const refundedCount = filtered.filter((t) => t.status === 'refunded').length;

    return {
      totalTopups,
      totalSpent,
      successCount,
      failedCount,
      refundedCount,
      totalCount: filtered.length,
    };
  }, [filtered]);

  // Export CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'User Name',
      'User Email',
      'Type',
      'Amount',
      'Gateway',
      'Status',
      'Date & Time',
      'Description',
      'Gateway Order ID',
      'Gateway Payment ID',
      'Stripe Session ID',
    ];

    const rows = filtered.map((t) => [
      `"${t.id}"`,
      `"${t.userName.replace(/"/g, '""')}"`,
      `"${t.userEmail.replace(/"/g, '""')}"`,
      `"${t.type.toUpperCase()}"`,
      t.amount,
      `"${t.gateway}"`,
      `"${t.status.toUpperCase()}"`,
      `"${new Date(t.date).toLocaleString()}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.orderId || ''}"`,
      `"${t.paymentId || ''}"`,
      `"${t.stripeSessionId || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `astroparihar_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded successfully.');
  };

  // Handle Refund Action
  const handleProcessRefund = async (txn: TransactionItem) => {
    if (!window.confirm(`Are you sure you want to mark transaction ${txn.id} as Refunded?`)) return;

    try {
      if (txn.userId && txn.id) {
        const txDocRef = doc(db, 'users', txn.userId, 'wallet_transactions', txn.id);
        await updateDoc(txDocRef, {
          status: 'refunded',
          refundedAt: new Date().toISOString(),
        });
        toast.success(`Transaction ${txn.id.slice(0, 8)}... marked as Refunded.`);
        setSelectedTxn(null);
        await fetchTransactions();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update refund status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Top-Ups (Revenue)</p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1">
              +{formatPrice(metrics.totalTopups)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Direct customer recharge inflow</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ArrowDownLeft size={20} className="text-emerald-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consultation Spend</p>
            <p className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1">
              -{formatPrice(metrics.totalSpent)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Wallet calls & report debits</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ArrowUpRight size={20} className="text-amber-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Successful TXNs</p>
            <p className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {metrics.successCount}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({metrics.totalCount > 0 ? Math.round((metrics.successCount / metrics.totalCount) * 100) : 0}%)
              </span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">{metrics.totalCount} total logged records</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-blue-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed / Refunded</p>
            <p className="text-xl sm:text-2xl font-extrabold text-rose-400 mt-1">
              {metrics.failedCount + metrics.refundedCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {metrics.failedCount} Failed · {metrics.refundedCount} Refunded
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle size={20} className="text-rose-400" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-amber-400" /> Live Payment Transactions
            </h3>
            <button
              type="button"
              onClick={fetchTransactions}
              disabled={refreshing}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50"
              title="Refresh Transactions"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-amber-400' : ''} />
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user, TXN, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-amber-400 w-48 sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white outline-none focus:border-amber-400"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="pending">Pending</option>
            </select>

            {/* Gateway Filter */}
            <select
              value={filterGateway}
              onChange={(e) => setFilterGateway(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white outline-none focus:border-amber-400"
            >
              <option value="all">All Gateways</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Stripe">Stripe</option>
              <option value="Wallet">Wallet (Internal)</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white outline-none focus:border-amber-400"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit (Top-ups)</option>
              <option value="debit">Debit (Deductions)</option>
            </select>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-xs font-semibold text-white transition-all shadow-sm"
            >
              <Download size={13} className="text-amber-400" /> Export CSV
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer / User</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Type & Purpose</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Gateway</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      Loading dynamic transactions from database...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No transactions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((txn, i) => {
                  let formattedDate = 'Unknown';
                  try {
                    formattedDate = new Date(txn.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });
                  } catch (e) {
                    formattedDate = txn.date;
                  }

                  const displayTxnId = txn.stripeSessionId || txn.paymentId || txn.orderId || txn.id;

                  return (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTxn(txn)}
                    >
                      {/* TXN ID */}
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400 whitespace-nowrap">
                        <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {displayTxnId.length > 14 ? `${displayTxnId.slice(0, 10)}...${displayTxnId.slice(-4)}` : displayTxnId}
                        </span>
                      </td>

                      {/* User Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={txn.userAvatar}
                            alt={txn.userName}
                            className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate max-w-[150px]">{txn.userName}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{txn.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-3.5 text-xs text-slate-300">
                        <p className="line-clamp-1 max-w-[220px] font-medium">{txn.description}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`text-xs font-bold font-mono ${
                            txn.type === 'credit' ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {txn.type === 'credit' ? '+' : '-'}
                          {formatPrice(txn.amount)}
                        </span>
                      </td>

                      {/* Gateway */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-950 border border-slate-800 text-slate-300">
                          {txn.gateway}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            statusBadgeStyles[txn.status] || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedTxn(txn)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Transaction Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            Showing <span className="text-white font-bold">{filtered.length}</span> transactions ·{' '}
            <span className="text-emerald-400 font-semibold">{metrics.successCount} Successful</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-medium">● Success: {metrics.successCount}</span>
            <span className="text-rose-400 font-medium">● Failed: {metrics.failedCount}</span>
            <span className="text-amber-400 font-medium">● Refunded: {metrics.refundedCount}</span>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Transaction Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Amount Header */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Amount</p>
                    <p
                      className={`text-2xl font-extrabold font-mono mt-0.5 ${
                        selectedTxn.type === 'credit' ? 'text-emerald-400' : 'text-white'
                      }`}
                    >
                      {selectedTxn.type === 'credit' ? '+' : '-'}
                      {formatPrice(selectedTxn.amount)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      statusBadgeStyles[selectedTxn.status]
                    }`}
                  >
                    {selectedTxn.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Profile</p>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedTxn.userAvatar}
                      alt={selectedTxn.userName}
                      className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{selectedTxn.userName}</p>
                      <p className="text-xs text-slate-400 truncate">{selectedTxn.userEmail}</p>
                      {selectedTxn.userPhone && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedTxn.userPhone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Reference</p>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Payment Gateway:</span>
                      <p className="font-semibold text-white mt-0.5">{selectedTxn.gateway}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Transaction Type:</span>
                      <p className="font-semibold text-white mt-0.5 capitalize">{selectedTxn.type}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Date & Timestamp:</span>
                      <p className="font-semibold text-white mt-0.5">{new Date(selectedTxn.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Description:</span>
                      <p className="font-semibold text-white mt-0.5">{selectedTxn.description}</p>
                    </div>
                    {selectedTxn.orderId && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Gateway Order ID:</span>
                        <p className="font-mono text-slate-200 mt-0.5 select-all bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {selectedTxn.orderId}
                        </p>
                      </div>
                    )}
                    {selectedTxn.paymentId && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Gateway Payment ID:</span>
                        <p className="font-mono text-slate-200 mt-0.5 select-all bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {selectedTxn.paymentId}
                        </p>
                      </div>
                    )}
                    {selectedTxn.stripeSessionId && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Stripe Session ID:</span>
                        <p className="font-mono text-slate-200 mt-0.5 select-all bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {selectedTxn.stripeSessionId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
                {selectedTxn.status === 'success' && selectedTxn.type === 'credit' ? (
                  <button
                    type="button"
                    onClick={() => handleProcessRefund(selectedTxn)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} /> Process Refund
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
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
