'use client';
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { motion } from 'framer-motion';
import { Search, Crown, Ban, Mail, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

export default function AdminUsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 6;

  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const dbUsers = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const joinedDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            email: data.email || 'N/A',
            plan: data.plan || 'Free',
            joined: joinedDate,
            lastActive: data.lastActive || 'Today',
            reports: data.reports || 0,
            consultations: data.consultations || 0,
            status: data.status || 'active',
            avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`
          };
        });
        setUsers(dbUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filtered = users?.filter((u) => {
    const matchSearch = u?.name?.toLowerCase()?.includes(search?.toLowerCase()) || u?.email?.toLowerCase()?.includes(search?.toLowerCase());
    const matchPlan = filterPlan === 'all' || u?.plan?.toLowerCase() === filterPlan;
    const matchStatus = filterStatus === 'all' || u?.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const paginated = filtered?.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered?.length / perPage);

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden relative min-h-[400px]">
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-muted-foreground font-medium">Loading users...</p>
        </div>
      )}
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-foreground flex-1">Users Management</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => {setSearch(e?.target?.value);setPage(1);}} className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring transition-all w-48" />
        </div>
        <select value={filterPlan} onChange={(e) => setFilterPlan(e?.target?.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none">
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="annual">Annual</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e?.target?.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['User', 'Plan', 'Joined', 'Last Active', 'Reports', 'Consultations', 'Status', 'Actions']?.map((h) =>
              <th key={`usr-th-${h}`} className="text-left px-5 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated?.map((user, i) =>
            <motion.tr
              key={user?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
              
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <AppImage src={user?.avatar} alt={`${user?.name} user profile`} width={32} height={32} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user?.plan === 'Annual' ? 'bg-purple-500/15 text-purple-400' : user?.plan === 'Premium' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'}`}>
                    {user?.plan}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{user?.joined}</td>
                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{user?.lastActive}</td>
                <td className="px-5 py-4 text-foreground font-mono tabular-nums">{user?.reports}</td>
                <td className="px-5 py-4 text-foreground font-mono tabular-nums">{user?.consultations}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user?.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {user?.status === 'active' ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="View user profile"><Eye size={13} className="text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Send email"><Mail size={13} className="text-muted-foreground" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Upgrade to Premium"><Crown size={13} className="text-accent" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Suspend user"><Ban size={13} className="text-red-400" /></button>
                  </div>
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-5 py-4 border-t border-border flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Showing {Math.min(filtered?.length, perPage)} of {filtered?.length} users</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-muted transition-all disabled:opacity-40">
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)?.map((p) =>
          <button key={`page-${p}`} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${page === p ? 'gold-gradient-bg text-white' : 'hover:bg-muted text-muted-foreground'}`}>
              {p}
            </button>
          )}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-muted transition-all disabled:opacity-40">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>);



}