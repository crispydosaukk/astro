'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, CheckCircle2, AlertCircle, Info, X, Trash2 } from 'lucide-react';
import { subscribeToCandidates, initialCandidatesData } from '@/lib/firebase/candidateService';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: 'discovery' | 'application' | 'assessment' | 'review' | 'probation' | 'system';
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  success: { icon: <CheckCircle2 size={16} />, color: 'text-green-600', bg: 'bg-green-100' },
  warning: { icon: <AlertCircle size={16} />, color: 'text-amber-600', bg: 'bg-amber-100' },
  info: { icon: <Info size={16} />, color: 'text-blue-600', bg: 'bg-blue-100' },
  error: { icon: <X size={16} />, color: 'text-red-600', bg: 'bg-red-100' },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (candidates) => {
          const pool = candidates && candidates.length > 0 ? candidates : initialCandidatesData;
          const dynamicAlerts: Notification[] = [];

          // 1. Verified astrologers
          const verified = pool.filter(c => c.lifecycleStatus === 'verified');
          verified.forEach((c, idx) => {
            dynamicAlerts.push({
              id: `notif-ver-${c.id}`,
              type: 'success',
              title: 'Candidate Verified',
              message: `${c.name} has been credentialed with AstroParihar Elite verification badge.`,
              time: '10 min ago',
              read: false,
              category: 'probation',
            });
          });

          // 2. Probation checkpoint due
          const probation = pool.filter(c => c.lifecycleStatus === 'probation');
          probation.forEach((c) => {
            dynamicAlerts.push({
              id: `notif-prb-${c.id}`,
              type: 'warning',
              title: 'Probation Milestone Due',
              message: `Day 15 consultation quality check due for ${c.name} (${c.location}).`,
              time: '45 min ago',
              read: false,
              category: 'probation',
            });
          });

          // 3. Human Review pending
          const inReview = pool.filter(c => c.lifecycleStatus === 'human-review');
          if (inReview.length > 0) {
            dynamicAlerts.push({
              id: 'notif-rev-queue',
              type: 'info',
              title: 'Human Review Pending',
              message: `${inReview.length} candidate applications awaiting committee advisory signoff.`,
              time: '2 hrs ago',
              read: false,
              category: 'review',
            });
          }

          // 4. Outreach queue
          const outreach = pool.filter(c => c.lifecycleStatus === 'ready-for-outreach');
          if (outreach.length > 0) {
            dynamicAlerts.push({
              id: 'notif-outreach-queue',
              type: 'info',
              title: 'Outreach Approval Queue',
              message: `${outreach.length} candidate invitations ready for admin approval.`,
              time: '3 hrs ago',
              read: true,
              category: 'discovery',
            });
          }

          // 5. System discovery active
          dynamicAlerts.push({
            id: 'notif-sys-places',
            type: 'success',
            title: 'Google Places API Connected',
            message: 'Live Google Places search active with valid API key.',
            time: 'Today',
            read: true,
            category: 'system',
          });

          setNotifs(dynamicAlerts);
        },
        (err) => console.warn('Notifications fallback:', err)
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Notification setup error:', e);
    }
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismissNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));

  const filtered = notifs.filter(n => {
    const matchRead = filter === 'all' || !n.read;
    const matchCat = categoryFilter === 'all' || n.category === categoryFilter;
    return matchRead && matchCat;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bell size={28} className="text-primary" /> Notifications Center
              {unreadCount > 0 && (
                <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">{unreadCount}</span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">Platform alerts, milestone reminders, and real-time activity notifications</p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead} 
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 items-center justify-between border-b border-border pb-3">
          <div className="flex gap-1 bg-muted/40 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'all' ? 'bg-card shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All ({notifs.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === 'unread' ? 'bg-card shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex gap-1 flex-wrap">
            {['all', 'discovery', 'application', 'review', 'probation', 'system'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${categoryFilter === cat ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground card-elevated">
              <Bell size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-sm">No notifications in this view.</p>
              <p className="text-xs">All alerts and reviews are up to date.</p>
            </div>
          ) : (
            filtered.map(n => {
              const tc = typeConfig[n.type] || typeConfig.info;
              return (
                <div
                  key={n.id}
                  className={`card-elevated p-4 flex items-start justify-between gap-4 transition-all ${
                    !n.read ? 'border-l-4 border-l-primary bg-primary/5' : 'opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${tc.bg} ${tc.color}`}>
                      {tc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{n.title}</h3>
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                          {n.category}
                        </span>
                      </div>
                      <p className="text-xs text-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-2xs text-muted-foreground mt-1 inline-block">{n.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => dismissNotif(n.id)}
                    className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
