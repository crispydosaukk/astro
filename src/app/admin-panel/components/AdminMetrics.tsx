'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Star, Calendar, IndianRupee, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const metrics = [
  { id: 'adm-users', icon: Users, label: 'Total Users', value: '2,51,847', sub: '+1,240 this week', trend: '+8.3%', up: true, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'adm-premium', icon: Crown, label: 'Premium Members', value: '38,420', sub: '15.3% conversion', trend: '+12.1%', up: true, color: 'text-accent', bg: 'bg-accent/10' },
  { id: 'adm-astrologers', icon: Star, label: 'Active Astrologers', value: '487', sub: '12 pending approval', trend: '+5', up: true, color: 'text-purple-400', bg: 'bg-purple-500/10', alert: true },
  { id: 'adm-consult', icon: Calendar, label: 'Consultations Today', value: '1,284', sub: '68 in progress now', trend: '+23%', up: true, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'adm-revenue', icon: IndianRupee, label: 'Revenue This Month', value: '₹48.2L', sub: '₹1.6L today', trend: '+18.4%', up: true, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'adm-reports', icon: Sparkles, label: 'AI Reports Generated', value: '18,04,391', sub: '2,847 today', trend: '+31%', up: true, color: 'text-violet-400', bg: 'bg-violet-500/10' },
];

export default function AdminMetrics() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics?.map((m, i) => {
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
            <div className={`flex items-center gap-1 text-xs font-medium mt-2 ${m?.up ? 'text-green-400' : 'text-red-400'}`}>
              {m?.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {m?.trend}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}