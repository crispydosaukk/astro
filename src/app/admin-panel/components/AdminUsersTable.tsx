'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Crown, Ban, Mail, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

const users = [
{ id: 'usr-001', name: 'Arjun Sharma', email: 'arjun.sharma@demo.in', plan: 'Premium', joined: '12 Jan 2026', lastActive: '3 Jul 2026', reports: 12, consultations: 8, status: 'active', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop' },
{ id: 'usr-002', name: 'Ananya Krishnamurthy', email: 'ananya.k@gmail.com', plan: 'Premium', joined: '8 Feb 2026', lastActive: '2 Jul 2026', reports: 24, consultations: 15, status: 'active', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop' },
{ id: 'usr-003', name: 'Rajan Mehta', email: 'rajan.mehta@business.in', plan: 'Annual', joined: '3 Mar 2026', lastActive: '1 Jul 2026', reports: 18, consultations: 22, status: 'active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop' },
{ id: 'usr-004', name: 'Preethi Sundaram', email: 'preethi.s@yahoo.com', plan: 'Free', joined: '20 Mar 2026', lastActive: '28 Jun 2026', reports: 2, consultations: 1, status: 'active', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop' },
{ id: 'usr-005', name: 'Deepak Nambiar', email: 'deepak.nambiar@hospital.in', plan: 'Premium', joined: '5 Apr 2026', lastActive: '3 Jul 2026', reports: 9, consultations: 6, status: 'active', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1fff3ded5-1772146033684.png" },
{ id: 'usr-006', name: 'Kavitha Reddy', email: 'kavitha.r@hotmail.com', plan: 'Free', joined: '15 Apr 2026', lastActive: '25 Jun 2026', reports: 1, consultations: 0, status: 'suspended', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop' },
{ id: 'usr-007', name: 'Suresh Pillai', email: 'suresh.pillai@gmail.com', plan: 'Annual', joined: '2 May 2026', lastActive: '3 Jul 2026', reports: 31, consultations: 18, status: 'active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop' },
{ id: 'usr-008', name: 'Meera Iyer', email: 'meera.iyer@outlook.com', plan: 'Premium', joined: '18 May 2026', lastActive: '30 Jun 2026', reports: 7, consultations: 4, status: 'active', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop' }];


export default function AdminUsersTable() {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = users?.filter((u) => {
    const matchSearch = u?.name?.toLowerCase()?.includes(search?.toLowerCase()) || u?.email?.toLowerCase()?.includes(search?.toLowerCase());
    const matchPlan = filterPlan === 'all' || u?.plan?.toLowerCase() === filterPlan;
    const matchStatus = filterStatus === 'all' || u?.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const paginated = filtered?.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered?.length / perPage);

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
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