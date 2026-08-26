'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Crown,
  Ban,
  Mail,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  X,
  Wallet,
  Calendar,
  Sparkles,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import { useCurrency } from '@/lib/CurrencyContext';

interface AdminUserItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dob?: string;
  plan: string;
  joined: string;
  lastActive: string;
  reports: number;
  consultations: number;
  walletBalance: number;
  status: 'active' | 'suspended';
  avatar: string;
}

export default function AdminUsersTable() {
  const { formatPrice } = useCurrency();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAuthType, setFilterAuthType] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const perPage = 8;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const dbUsers: AdminUserItem[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let joinedDate = 'Unknown';
        if (data.createdAt) {
          try {
            const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            joinedDate = d.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          } catch (e) {
            joinedDate = String(data.createdAt);
          }
        }

        const email = data.email && data.email.trim() !== '' ? data.email : undefined;
        const phone = data.phone || data.phoneNumber || undefined;

        return {
          id: docSnap.id,
          name: data.name || data.displayName || 'Unknown User',
          email,
          phone,
          dob: data.dob || data.dateOfBirth || undefined,
          plan: data.plan || 'Free',
          joined: joinedDate,
          lastActive: data.lastActive || 'Today',
          reports: Number(data.reports) || 0,
          consultations: Number(data.consultations) || 0,
          walletBalance: Number(data.walletBalance) || 0,
          status: data.status === 'suspended' ? 'suspended' : 'active',
          avatar:
            data.avatar ||
            data.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`,
        };
      });

      setUsers(dbUsers);
    } catch (error) {
      console.error('Error fetching users: ', error);
      toast.error('Failed to load registered users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success(`User status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user status');
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      u.name.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term)) ||
      u.id.toLowerCase().includes(term);

    const matchPlan = filterPlan === 'all' || u.plan.toLowerCase() === filterPlan;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;

    let matchAuth = true;
    if (filterAuthType === 'phone') {
      matchAuth = !!u.phone;
    } else if (filterAuthType === 'email') {
      matchAuth = !!u.email;
    }

    return matchSearch && matchPlan && matchStatus && matchAuth;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage) || 1;

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg overflow-hidden relative min-h-[450px]">
        {/* Header Toolbar */}
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserIcon size={18} className="text-amber-400" /> Registered Users Management
            </h2>
            <button
              type="button"
              onClick={fetchUsers}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
              title="Refresh Users"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-amber-400' : ''} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-amber-400 w-56"
              />
            </div>

            {/* Auth Type Filter */}
            <select
              value={filterAuthType}
              onChange={(e) => {
                setFilterAuthType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white outline-none focus:border-amber-400"
            >
              <option value="all">All Auth Types</option>
              <option value="phone">📱 Phone Number Users</option>
              <option value="email">✉️ Email Users</option>
            </select>

            {/* Plan Filter */}
            <select
              value={filterPlan}
              onChange={(e) => {
                setFilterPlan(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white outline-none focus:border-amber-400"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="annual">Annual</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-white outline-none focus:border-amber-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  User / Contact Info
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Wallet Balance
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Reports
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Consultations
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      Loading users from database...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginated.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    {/* User & Contact */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <AppImage
                          src={user.avatar}
                          alt={user.name}
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-slate-800 border border-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs sm:text-sm truncate max-w-[180px]">
                            {user.name}
                          </div>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            {user.phone && (
                              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                                <Phone size={10} /> {user.phone}
                              </span>
                            )}
                            {user.email && (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[180px]">
                                <Mail size={10} /> {user.email}
                              </span>
                            )}
                            {!user.phone && !user.email && (
                              <span className="text-[11px] text-slate-500 italic">
                                No contact info
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.plan === 'Annual'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : user.plan === 'Premium'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>

                    {/* Wallet Balance */}
                    <td className="px-5 py-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {formatPrice(user.walletBalance)}
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {user.joined}
                    </td>

                    {/* Reports */}
                    <td className="px-5 py-4 text-white font-mono tabular-nums text-xs">
                      {user.reports}
                    </td>

                    {/* Consultations */}
                    <td className="px-5 py-4 text-white font-mono tabular-nums text-xs">
                      {user.consultations}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          user.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {user.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View user profile"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === 'active'
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            Showing{' '}
            <span className="text-white font-bold">
              {Math.min(filtered.length, paginated.length)}
            </span>{' '}
            of <span className="text-white font-bold">{filtered.length}</span> registered users
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="px-2 text-xs font-semibold text-white">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* User Inspection Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {selectedUser && (
              <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <UserIcon size={16} className="text-amber-400" /> User Profile
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <AppImage
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover bg-slate-800 border border-slate-700"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-bold text-white truncate">
                          {selectedUser.name}
                        </h4>
                        <span
                          className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedUser.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          ● {selectedUser.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                      {/* Phone */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Phone size={13} className="text-emerald-400" /> Phone Number:
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {selectedUser.phone || 'Not provided'}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Mail size={13} className="text-blue-400" /> Email:
                        </span>
                        <span className="font-semibold text-slate-200">
                          {selectedUser.email || 'Not provided'}
                        </span>
                      </div>

                      {/* DOB */}
                      {selectedUser.dob && (
                        <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Calendar size={13} className="text-amber-400" /> Date of Birth:
                          </span>
                          <span className="font-semibold text-slate-200">{selectedUser.dob}</span>
                        </div>
                      )}

                      {/* Wallet Balance */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Wallet size={13} className="text-emerald-400" /> Wallet Balance:
                        </span>
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          {formatPrice(selectedUser.walletBalance)}
                        </span>
                      </div>

                      {/* Joined Date */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Joined Date:</span>
                        <span className="text-slate-200">{selectedUser.joined}</span>
                      </div>

                      {/* UID */}
                      <div className="flex flex-col gap-1 py-1">
                        <span className="text-slate-400 text-[11px]">Firebase User UID:</span>
                        <span className="font-mono text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300 select-all break-all">
                          {selectedUser.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        selectedUser.status === 'active'
                          ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10'
                          : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
                      }`}
                    >
                      {selectedUser.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
