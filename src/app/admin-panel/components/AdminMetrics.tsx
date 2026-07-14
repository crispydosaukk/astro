'use client';
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { motion } from 'framer-motion';
import { Users, Crown, Star, Calendar, IndianRupee, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';



export default function AdminMetrics() {
  const [data, setData] = useState({
    totalUsers: '0',
    premiumUsers: '0'
  });

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        let premium = 0;
        querySnapshot.forEach(doc => {
          if (doc.data().plan === 'Premium') premium++;
        });
        
        setData({
          totalUsers: querySnapshot.size.toLocaleString(),
          premiumUsers: premium.toLocaleString()
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    }
    fetchMetrics();
  }, []);

  const dynamicMetrics = [
    { id: 'adm-users', icon: Users, label: 'Total Users', value: data.totalUsers, sub: 'All registered users', trend: '', up: true, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'adm-premium', icon: Crown, label: 'Premium Members', value: data.premiumUsers, sub: 'Active subscriptions', trend: '', up: true, color: 'text-accent', bg: 'bg-accent/10' },
    { id: 'adm-astrologers', icon: Star, label: 'Active Astrologers', value: '0', sub: '0 pending approval', trend: '', up: true, color: 'text-purple-400', bg: 'bg-purple-500/10', alert: false },
    { id: 'adm-consult', icon: Calendar, label: 'Consultations Today', value: '0', sub: '0 in progress now', trend: '', up: true, color: 'text-green-400', bg: 'bg-green-500/10' },
    { id: 'adm-revenue', icon: IndianRupee, label: 'Revenue This Month', value: '₹0', sub: '₹0 today', trend: '', up: true, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'adm-reports', icon: Sparkles, label: 'AI Reports Generated', value: '0', sub: '0 today', trend: '', up: true, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {dynamicMetrics.map((m, i) => {
        const Icon = m?.icon;
        return (
          <motion.div
            key={m?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card-light dark:glass-card rounded-2xl p-5 border ${m?.alert ? 'border-amber-500/30 bg-amber-500/5' : 'border-border'} card-hover relative`}
          >
            {m?.alert && (
              <div className="absolute top-3 right-3">
                <AlertTriangle size={14} className="text-amber-400" />
              </div>
            )}
            <div className={`w-10 h-10 rounded-xl ${m?.bg} flex items-center justify-center mb-3 icon-hover-animate`}>
              <Icon size={18} className={m?.color} />
            </div>
            <div className="text-xs font-500 text-muted-foreground uppercase tracking-wide mb-1">{m?.label}</div>
            <div className="text-xl font-bold text-foreground tabular-nums mb-0.5">{m?.value}</div>
            <div className="text-xs text-muted-foreground">{m?.sub}</div>
            {m?.trend && (
              <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${m?.up ? 'text-green-400' : 'text-red-400'}`}>
                {m?.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {m?.trend}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}