'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Crown, Gem, Star } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

import { useUserData } from '@/lib/useUserData';

const metrics = [
  {
    id: 'metric-reports',
    icon: FileText,
    label: 'Reports Generated',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    id: 'metric-appointments',
    icon: Calendar,
    label: 'Consultations',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'metric-premium',
    icon: Crown,
    label: 'Membership',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    id: 'metric-remedies',
    icon: Gem,
    label: 'Active Remedies',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    id: 'metric-kundlis',
    icon: Star,
    label: 'Saved Kundlis',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
];

export default function DashboardMetrics() {
  const { user } = useUserData();
  const [reportsCount, setReportsCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const { collection, query, where, getCountFromServer } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');
        const q = query(collection(db, 'service_requests'), where('userId', '==', user.uid));
        const snapshot = await getCountFromServer(q);
        setReportsCount(snapshot.data().count);
      } catch (err) {
        console.error('Failed to fetch reports count:', err);
      }
    };
    fetchCount();
  }, [user]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics?.map((m, i) => {
        const Icon = m?.icon;
        
        let displayValue = '0';
        let displaySub = '';
        let displayTrend = '';
        let displayTrendUp = false;

        switch (m.id) {
          case 'metric-reports':
            displayValue = reportsCount !== null ? reportsCount.toString() : '...';
            displaySub = 'Total personalized reports';
            displayTrend = 'Updated';
            displayTrendUp = true;
            break;
          case 'metric-appointments':
            displayValue = '0';
            displaySub = 'No upcoming consultations';
            displayTrend = 'Book now';
            displayTrendUp = false;
            break;
          case 'metric-premium':
            const isPremium = false; // Based on actual userData when available
            displayValue = isPremium ? 'Premium' : 'Free';
            displaySub = isPremium ? 'Active Plan' : 'Basic Plan';
            displayTrend = isPremium ? 'Valid' : 'Upgrade';
            displayTrendUp = isPremium;
            break;
          case 'metric-remedies':
            displayValue = '0';
            displaySub = 'None active';
            displayTrend = 'Start a remedy';
            displayTrendUp = false;
            break;
          case 'metric-kundlis':
            displayValue = '0';
            displaySub = 'No saved profiles';
            displayTrend = 'Create one';
            displayTrendUp = false;
            break;
        }

        return (
          <motion.div
            key={m?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl glass-card-light dark:glass-card border border-border group hover:border-[#C9952B]/30 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl ${m?.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <Icon size={18} className={m?.color} />
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 line-clamp-1">{m?.label}</p>
            <div className="flex items-end gap-2 mb-1">
              <h3 className="text-2xl font-bold text-foreground">{displayValue}</h3>
            </div>
            <div className="text-xs text-muted-foreground mb-1">{displaySub}</div>
            <div className={`text-xs font-medium mt-2 ${displayTrendUp ? 'text-green-400' : 'text-muted-foreground'}`}>
              {displayTrend}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}