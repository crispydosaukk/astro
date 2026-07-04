'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Video, Phone, Eye, X } from 'lucide-react';

const appointments = [
  { id: 'appt-001', user: 'Arjun Sharma', astrologer: 'Pt. Rajendra Sharma', type: 'Video', date: '6 Jul 2026', time: '3:00 PM', duration: '45 min', amount: '₹1,125', status: 'confirmed' },
  { id: 'appt-002', user: 'Ananya K.', astrologer: 'Jyotishi Meera Devi', type: 'Call', date: '4 Jul 2026', time: '11:00 AM', duration: '30 min', amount: '₹900', status: 'completed' },
  { id: 'appt-003', user: 'Rajan Mehta', astrologer: 'Dr. Priya Nair', type: 'Video', date: '3 Jul 2026', time: '5:00 PM', duration: '60 min', amount: '₹1,080', status: 'in-progress' },
  { id: 'appt-004', user: 'Suresh Pillai', astrologer: 'Pt. Suresh Iyer', type: 'Video', date: '5 Jul 2026', time: '10:00 AM', duration: '45 min', amount: '₹1,575', status: 'confirmed' },
  { id: 'appt-005', user: 'Preethi Sundaram', astrologer: 'Acharya Vikram Joshi', type: 'Call', date: '2 Jul 2026', time: '2:30 PM', duration: '30 min', amount: '₹600', status: 'completed' },
  { id: 'appt-006', user: 'Deepak Nambiar', astrologer: 'Jyotishi Meera Devi', type: 'Video', date: '8 Jul 2026', time: '4:00 PM', duration: '60 min', amount: '₹1,800', status: 'pending' },
  { id: 'appt-007', user: 'Kavitha Reddy', astrologer: 'Pt. Rajendra Sharma', type: 'Call', date: '1 Jul 2026', time: '9:00 AM', duration: '15 min', amount: '₹375', status: 'cancelled' },
  { id: 'appt-008', user: 'Meera Iyer', astrologer: 'Dr. Priya Nair', type: 'Video', date: '9 Jul 2026', time: '11:30 AM', duration: '45 min', amount: '₹810', status: 'confirmed' },
];

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-500/15 text-blue-400',
  completed: 'bg-green-500/15 text-green-400',
  'in-progress': 'bg-amber-500/15 text-amber-400',
  pending: 'bg-purple-500/15 text-purple-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

export default function AdminAppointmentsTable() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = appointments.filter(a => {
    const matchSearch = a.user.toLowerCase().includes(search.toLowerCase()) || a.astrologer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-foreground flex-1">Appointments</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none w-40" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none">
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['User', 'Astrologer', 'Type', 'Date & Time', 'Duration', 'Amount', 'Status', 'Actions'].map(h => (
                <th key={`appt-th-${h}`} className="text-left px-5 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((appt, i) => (
              <motion.tr key={appt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-4 font-medium text-foreground">{appt.user}</td>
                <td className="px-5 py-4 text-muted-foreground">{appt.astrologer}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {appt.type === 'Video' ? <Video size={12} /> : <Phone size={12} />}
                    {appt.type}
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{appt.date} · {appt.time}</td>
                <td className="px-5 py-4 text-muted-foreground">{appt.duration}</td>
                <td className="px-5 py-4 font-semibold text-foreground tabular-nums">{appt.amount}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[appt.status] || 'bg-muted text-muted-foreground'}`}>
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1).replace('-', ' ')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="View details"><Eye size={13} className="text-muted-foreground" /></button>
                    {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Cancel appointment"><X size={13} className="text-red-400" /></button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}