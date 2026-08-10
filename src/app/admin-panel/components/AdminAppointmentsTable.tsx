'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Video, Phone, Eye, X } from 'lucide-react';

import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useCurrency } from '@/lib/CurrencyContext';

const statusColors: Record<string, string> = {
  active: 'bg-amber-500/15 text-amber-400',
  completed: 'bg-green-500/15 text-green-400',
  pending: 'bg-blue-500/15 text-blue-400',
  cancelled: 'bg-red-500/15 text-red-400',
  declined: 'bg-red-500/15 text-red-400',
  missed: 'bg-red-500/15 text-red-400',
};

export default function AdminAppointmentsTable() {
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = appointments.filter((a) => {
    const userMatch = a.customerName?.toLowerCase().includes(search.toLowerCase()) || '';
    const astroMatch = a.astrologerName?.toLowerCase().includes(search.toLowerCase()) || '';
    const matchSearch = userMatch || astroMatch;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-foreground flex-1">Appointments</h2>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm outline-none w-40"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl bg-muted border border-border text-sm outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="declined">Declined</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {[
                'User',
                'Astrologer',
                'Type',
                'Date & Time',
                'Duration',
                'Amount',
                'Status',
                'Actions',
              ].map((h) => (
                <th
                  key={`appt-th-${h}`}
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
                  Loading appointments...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                  No appointments found
                </td>
              </tr>
            ) : (
              filtered.map((appt, i) => {
                let dateStr = appt.date || 'Unknown';
                let timeStr = appt.time || '';
                
                if (appt.createdAt) {
                  const d = appt.createdAt.toDate ? appt.createdAt.toDate() : new Date(appt.createdAt);
                  dateStr = d.toLocaleDateString();
                  timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }

                return (
                  <motion.tr
                    key={appt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-5 py-4 font-medium text-foreground">{appt.customerName || 'Unknown'}</td>
                    <td className="px-5 py-4 text-muted-foreground">{appt.astrologerName || 'Unknown'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {appt.type === 'video' || appt.type === 'Video' ? <Video size={12} /> : <Phone size={12} />}
                        <span className="capitalize">{appt.type || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {dateStr} · {timeStr}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{appt.duration} min</td>
                    <td className="px-5 py-4 font-semibold text-foreground tabular-nums">
                      {formatPrice(appt.price || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[appt.status] || 'bg-muted text-muted-foreground'}`}
                      >
                        {appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1).replace('-', ' ') : 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 rounded-lg hover:bg-muted transition-all"
                          title="View details"
                        >
                          <Eye size={13} className="text-muted-foreground" />
                        </button>
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-all"
                            title="Cancel appointment"
                          >
                            <X size={13} className="text-red-400" />
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
    </div>
  );
}
