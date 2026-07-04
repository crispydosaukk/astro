'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Eye, Star, AlertTriangle } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';

const astrologers = [
{ id: 'adm-ast-001', name: 'Pt. Rajendra Sharma', email: 'rajendra@astro.in', specialty: 'Vedic, KP', experience: 18, rating: 4.9, consultations: 12480, revenue: '₹3.12L', status: 'approved', joined: '10 Jan 2026', avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=60&h=60&fit=crop' },
{ id: 'adm-ast-002', name: 'Jyotishi Meera Devi', email: 'meera.devi@nadi.in', specialty: 'Nadi, Tamil', experience: 22, rating: 4.8, consultations: 15620, revenue: '₹4.69L', status: 'approved', joined: '12 Jan 2026', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop' },
{ id: 'adm-ast-003', name: 'Acharya Vikram Joshi', email: 'vikram.j@lalkitab.in', specialty: 'Lal Kitab, Vastu', experience: 15, rating: 4.7, consultations: 8930, revenue: '₹1.79L', status: 'approved', joined: '15 Jan 2026', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&h=60&fit=crop' },
{ id: 'adm-ast-004', name: 'Naresh Kumar Tripathi', email: 'naresh.t@vedic.in', specialty: 'Vedic, Prashna', experience: 8, rating: null, consultations: 0, revenue: '₹0', status: 'pending', joined: '1 Jul 2026', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop' },
{ id: 'adm-ast-005', name: 'Sunita Batra', email: 'sunita.batra@numerology.in', specialty: 'Numerology, Tarot', experience: 6, rating: null, consultations: 0, revenue: '₹0', status: 'pending', joined: '2 Jul 2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_12c048e6b-1773051813329.png" },
{ id: 'adm-ast-006', name: 'Dr. Priya Nair', email: 'priya.nair@western.in', specialty: 'Western, Numerology', experience: 10, rating: 4.8, consultations: 6240, revenue: '₹1.12L', status: 'approved', joined: '20 Jan 2026', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop' },
{ id: 'adm-ast-007', name: 'Ramesh Dubey', email: 'ramesh.d@jyotish.in', specialty: 'Vedic, Medical', experience: 12, rating: 3.2, consultations: 1240, revenue: '₹0.62L', status: 'flagged', joined: '5 Feb 2026', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop' }];


export default function AdminAstrologersTable() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [localAstrologers, setLocalAstrologers] = useState(astrologers);

  const handleApprove = (id: string) => {
    setLocalAstrologers((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' } : a));
    toast.success('Astrologer approved and notified via email');
  };

  const handleReject = (id: string) => {
    setLocalAstrologers((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' } : a));
    toast.error('Astrologer application rejected');
  };

  const filtered = localAstrologers.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-foreground flex-1">Astrologers Management</h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={13} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            {localAstrologers.filter((a) => a.status === 'pending').length} pending approval
          </span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none focus:border-ring w-40" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none">
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="flagged">Flagged</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Astrologer', 'Specialty', 'Experience', 'Rating', 'Consultations', 'Revenue', 'Status', 'Actions'].map((h) =>
              <th key={`ast-th-${h}`} className="text-left px-5 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ast, i) =>
            <motion.tr
              key={ast.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`border-b border-border/50 hover:bg-muted/30 transition-colors group ${ast.status === 'pending' ? 'bg-amber-500/5' : ast.status === 'flagged' ? 'bg-red-500/5' : ''}`}>
              
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <AppImage src={ast.avatar} alt={`${ast.name} astrologer admin panel`} width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <div className="font-medium text-foreground">{ast.name}</div>
                      <div className="text-xs text-muted-foreground">{ast.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{ast.specialty}</td>
                <td className="px-5 py-4 text-foreground tabular-nums">{ast.experience} yrs</td>
                <td className="px-5 py-4">
                  {ast.rating ?
                <div className="flex items-center gap-1">
                      <Star size={12} fill="currentColor" className={ast.rating < 4 ? 'text-red-400' : 'text-accent'} />
                      <span className={`font-semibold tabular-nums ${ast.rating < 4 ? 'text-red-400' : 'text-foreground'}`}>{ast.rating}</span>
                    </div> :

                <span className="text-muted-foreground">—</span>
                }
                </td>
                <td className="px-5 py-4 text-foreground tabular-nums font-mono">{ast.consultations.toLocaleString()}</td>
                <td className="px-5 py-4 text-foreground font-semibold tabular-nums">{ast.revenue}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ast.status === 'approved' ? 'bg-green-500/15 text-green-400' : ast.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : ast.status === 'flagged' ? 'bg-red-500/15 text-red-400' : 'bg-muted text-muted-foreground'}`}>
                    {ast.status.charAt(0).toUpperCase() + ast.status.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    {ast.status === 'pending' &&
                  <>
                        <button onClick={() => handleApprove(ast.id)} className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-all" title="Approve astrologer">
                          <Check size={13} className="text-green-400" />
                        </button>
                        <button onClick={() => handleReject(ast.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all" title="Reject application">
                          <X size={13} className="text-red-400" />
                        </button>
                      </>
                  }
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-all opacity-0 group-hover:opacity-100" title="View profile">
                      <Eye size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}