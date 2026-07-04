'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Crown, Gem, Star } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';



const metrics = [
  {
    id: 'metric-reports',
    icon: FileText,
    label: 'AI Reports Generated',
    value: '12',
    sub: '3 new this month',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    trend: '+2',
    trendUp: true,
  },
  {
    id: 'metric-appointments',
    icon: Calendar,
    label: 'Consultations',
    value: '8',
    sub: 'Next: Jul 6, 3:00 PM',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    trend: '1 upcoming',
    trendUp: true,
  },
  {
    id: 'metric-premium',
    icon: Crown,
    label: 'Membership',
    value: 'Premium',
    sub: 'Expires 3 Aug 2026',
    color: 'text-accent',
    bg: 'bg-accent/10',
    trend: '31 days left',
    trendUp: true,
  },
  {
    id: 'metric-remedies',
    icon: Gem,
    label: 'Active Remedies',
    value: '3',
    sub: 'Ruby · Emerald · Yantra',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    trend: 'On track',
    trendUp: true,
  },
  {
    id: 'metric-kundlis',
    icon: Star,
    label: 'Saved Kundlis',
    value: '4',
    sub: 'Self + Family members',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    trend: '+1 this week',
    trendUp: true,
  },
];

export default function DashboardMetrics() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics?.map((m, i) => {
        const Icon = m?.icon;
        return (
          <motion.div
            key={m?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-light dark:glass-card rounded-2xl p-5 border border-border card-hover"
          >
            <div className={`w-10 h-10 rounded-xl ${m?.bg} flex items-center justify-center mb-3 icon-hover-animate`}>
              <Icon size={18} className={m?.color} />
            </div>
            <div className="text-xs font-500 text-muted-foreground uppercase tracking-wide mb-1">{m?.label}</div>
            <div className="text-2xl font-bold text-foreground tabular-nums mb-0.5">{m?.value}</div>
            <div className="text-xs text-muted-foreground">{m?.sub}</div>
            <div className={`text-xs font-medium mt-2 ${m?.trendUp ? 'text-green-400' : 'text-red-400'}`}>
              {m?.trend}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}