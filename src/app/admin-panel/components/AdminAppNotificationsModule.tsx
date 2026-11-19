'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Sparkles,
  RefreshCw,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Search,
  Image as ImageIcon,
  Compass,
  Clock,
  Check,
  Filter,
  Megaphone,
  AlertCircle,
  Zap,
  Save,
  Copy,
  Calendar,
  Flame,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  AppNotificationItem,
  NotificationAudience,
  NotificationCategory,
  NotificationDeliveryMode,
  NotificationPriority,
} from '@/lib/notificationService';
import type { AutomatedScheduleItem } from '@/lib/notificationAutomations';

interface AdminCustomerTarget {
  uid: string;
  name: string;
  phone: string;
  email: string;
  hasPushToken: boolean;
  platform: string;
}

interface OverviewStats {
  totalSent: number;
  totalDevices: number;
  iosDevices: number;
  androidDevices: number;
  totalUsers: number;
}

const CATEGORIES: {
  id: NotificationCategory;
  label: string;
  emoji: string;
  badgeClass: string;
}[] = [
  { id: 'horoscope', label: 'Daily Horoscope', emoji: '✨', badgeClass: 'bg-purple-500/15 text-purple-600 border-purple-500/30' },
  { id: 'panchang', label: 'Panchang & Muhurat', emoji: '🪔', badgeClass: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  { id: 'consultation', label: 'Consultations', emoji: '📞', badgeClass: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  { id: 'offers', label: 'Offers & Wallet', emoji: '🎁', badgeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  { id: 'remedies', label: 'Remedies & Reports', emoji: '🕉️', badgeClass: 'bg-rose-500/15 text-rose-600 border-rose-500/30' },
  { id: 'system', label: 'System Alert', emoji: '🔔', badgeClass: 'bg-slate-500/15 text-slate-600 border-slate-500/30' },
];

const DEEP_LINK_ROUTES = [
  { label: 'Notifications Inbox (Default)', value: '/notifications-screen' },
  { label: 'Home Dashboard', value: '/home-dashboard-screen' },
  { label: 'Daily Horoscope', value: '/horoscope-screen' },
  { label: 'Panchang & Muhurat', value: '/panchang-screen' },
  { label: 'My Kundli Chart', value: '/my-kundli-screen' },
  { label: 'Match Kundli (36 Guna)', value: '/match-kundli-screen' },
  { label: 'Live Astrologers', value: '/live-astrologers-screen' },
  { label: 'AI Astrologer Chat', value: '/ai-chat-screen' },
  { label: 'Vedic Remedies (Ashta Parihar)', value: '/remedies-screen' },
  { label: 'Auspicious Muhurat', value: '/muhurat-screen' },
  { label: 'Services & Reports', value: '/services-screen' },
  { label: 'Wallet & Recharge Offers', value: '/wallet-screen' },
];

const QUICK_TEMPLATES: {
  name: string;
  title: string;
  subtitle: string;
  body: string;
  ctaText: string;
  category: NotificationCategory;
  actionRoute: string;
}[] = [
  {
    name: 'Morning Horoscope',
    title: '✨ Your Stars Have Spoken Today!',
    subtitle: 'Daily Vedic Horoscope Ready',
    body: 'Lucky colour, auspicious timing & today’s planetary shift for your Rashi are live now. Tap to read!',
    ctaText: 'Read Horoscope',
    category: 'horoscope',
    actionRoute: '/horoscope-screen',
  },
  {
    name: 'Flash Wallet Bonus',
    title: '🎁 Flat Bonus Credits Unlocked!',
    subtitle: 'Limited-Time Offer • Today Only',
    body: 'Recharge your AstroParihar wallet now and get instant extra minutes for live Acharya consultations.',
    ctaText: 'Claim Offer',
    category: 'offers',
    actionRoute: '/wallet-screen',
  },
  {
    name: 'Abhijit Muhurat',
    title: '🪔 Auspicious Muhurat Starting Soon',
    subtitle: 'Today’s Panchang & Rahu Kaal',
    body: 'Check today’s Tithi, Nakshatra & Abhijit Muhurat before starting any important work or journey.',
    ctaText: 'View Panchang',
    category: 'panchang',
    actionRoute: '/panchang-screen',
  },
  {
    name: 'Acharya Online Now',
    title: '📞 Top Vedic Acharyas Are Online!',
    subtitle: 'Zero Wait Time • Instant Connect',
    body: 'Confused about Career, Marriage, or Dasha? Start a private 1-on-1 call or chat right now.',
    ctaText: 'Consult Now',
    category: 'consultation',
    actionRoute: '/live-astrologers-screen',
  },
  {
    name: 'Kundli Match Alert',
    title: '💍 36-Guna Kundli Milan Ready',
    subtitle: 'Vedic Compatibility Analysis',
    body: 'Check Ashta Koota points, Manglik Dosha & Bhakoot status instantly with accurate Vedic algorithms.',
    ctaText: 'Match Now',
    category: 'remedies',
    actionRoute: '/match-kundli-screen',
  },
];

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminAppNotificationsModule() {
  const [moduleTab, setModuleTab] = useState<'broadcast' | 'automations'>('broadcast');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [users, setUsers] = useState<AdminCustomerTarget[]>([]);
  const [stats, setStats] = useState<OverviewStats>({
    totalSent: 0,
    totalDevices: 0,
    iosDevices: 0,
    androidDevices: 0,
    totalUsers: 0,
  });

  // Composer fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<NotificationDeliveryMode>('push_and_inapp');
  const [previewPlatform, setPreviewPlatform] = useState<'ios' | 'android'>('ios');
  const [category, setCategory] = useState<NotificationCategory>('horoscope');
  const [audience, setAudience] = useState<NotificationAudience>('all');
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [actionRoute, setActionRoute] = useState('/notifications-screen');
  const [imageUrl, setImageUrl] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('high');

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategory, setHistoryCategory] = useState<string>('all');

  // Automations state
  const [automations, setAutomations] = useState<AutomatedScheduleItem[]>([]);
  const [loadingAutomations, setLoadingAutomations] = useState(false);
  const [savingAutomations, setSavingAutomations] = useState(false);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [runningCron, setRunningCron] = useState(false);
  const [currentTimeIST, setCurrentTimeIST] = useState('');
  const [currentDateIST, setCurrentDateIST] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/app-dynamic/notifications?mode=admin');
      const data = await res.json();
      if (data.success) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUsers(Array.isArray(data.users) ? data.users : []);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.error || 'Failed to load notifications dashboard');
      }
    } catch {
      toast.error('Network error loading notifications overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchAutomations = async () => {
    setLoadingAutomations(true);
    try {
      const res = await fetch('/api/app-dynamic/notifications/automations');
      const data = await res.json();
      if (data.success) {
        setAutomations(Array.isArray(data.schedules) ? data.schedules : []);
        if (data.currentTimeIST) setCurrentTimeIST(data.currentTimeIST);
        if (data.currentDateIST) setCurrentDateIST(data.currentDateIST);
      } else {
        toast.error(data.error || 'Failed to load automated schedules');
      }
    } catch {
      toast.error('Network error loading automations');
    } finally {
      setLoadingAutomations(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchAutomations();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return notifications.filter((n) => {
      if (historyCategory !== 'all' && n.category !== historyCategory) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    });
  }, [notifications, historySearch, historyCategory]);

  const totalPushesDelivered = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.stats?.pushDelivered || 0), 0),
    [notifications]
  );

  const toggleUserSelection = (uid: string) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const applyTemplate = (tpl: (typeof QUICK_TEMPLATES)[number]) => {
    setTitle(tpl.title);
    setSubtitle(tpl.subtitle);
    setBody(tpl.body);
    setCtaText(tpl.ctaText);
    setCategory(tpl.category);
    setActionRoute(tpl.actionRoute);
    setDeliveryMode('push_and_inapp');
    setPriority('high');
    toast.info(`Loaded "${tpl.name}" Swiggy/Zomato push template`);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter both a notification title and message.');
      return;
    }
    if (audience === 'specific' && selectedUids.length === 0) {
      toast.error('Please select at least one target customer.');
      return;
    }

    setSending(true);
    try {
      const recipientNames =
        audience === 'specific'
          ? users.filter((u) => selectedUids.includes(u.uid)).map((u) => u.name || u.phone || u.uid)
          : [];

      const res = await fetch('/api/app-dynamic/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          body: body.trim(),
          ctaText: ctaText.trim() || undefined,
          deliveryMode,
          category,
          audience,
          recipientUids: audience === 'specific' ? selectedUids : [],
          recipientNames,
          imageUrl: imageUrl.trim() || undefined,
          actionRoute,
          priority,
          sentBy: 'Admin',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const s = data.notification?.stats;
        toast.success(
          `Notification sent! Bell inbox targets: ${s?.totalTargets || 0} • Lock-screen push delivered: ${s?.pushDelivered || 0}/${s?.pushAttempted || 0} device(s).`
        );
        setTitle('');
        setSubtitle('');
        setBody('');
        setCtaText('');
        setImageUrl('');
        setSelectedUids([]);
        await fetchOverview();
      } else {
        toast.error(data.error || 'Failed to send notification');
      }
    } catch {
      toast.error('Network error dispatching notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification from customer inboxes and history?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/app-dynamic/notifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success('Notification deleted');
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error deleting notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReuse = (n: AppNotificationItem) => {
    setTitle(n.title);
    setSubtitle(n.subtitle || '');
    setBody(n.body);
    setCtaText(n.ctaText || '');
    setDeliveryMode(n.deliveryMode || 'push_and_inapp');
    setCategory(n.category);
    setAudience(n.audience);
    setSelectedUids(n.recipientUids || []);
    setActionRoute(n.actionRoute || '/notifications-screen');
    setImageUrl(n.imageUrl || '');
    setPriority(n.priority || 'high');
    setModuleTab('broadcast');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('Loaded notification into composer for resending');
  };

  // Automations helpers
  const handleToggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleUpdateAutomationField = (
    id: string,
    field: keyof AutomatedScheduleItem,
    val: any
  ) => {
    setAutomations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveAutomations = async () => {
    setSavingAutomations(true);
    try {
      const res = await fetch('/api/app-dynamic/notifications/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: automations }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAutomations(data.schedules);
        toast.success('Automated daily schedules saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save schedules');
      }
    } catch {
      toast.error('Network error saving automations');
    } finally {
      setSavingAutomations(false);
    }
  };

  const handleTriggerAutomation = async (id: string, name: string) => {
    setTriggeringId(id);
    try {
      const res = await fetch('/api/app-dynamic/notifications/automations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const stats = data.notification?.stats;
        toast.success(
          `⚡ "${name}" broadcasted! Bell inboxes: ${stats?.totalTargets || 0} • Lock-screen push: ${stats?.pushDelivered || 0}/${stats?.pushAttempted || 0} devices.`
        );
        await fetchAutomations();
        await fetchOverview();
      } else {
        toast.error(data.error || `Failed to trigger ${name}`);
      }
    } catch {
      toast.error('Network error executing automation');
    } finally {
      setTriggeringId(null);
    }
  };

  const handleRunCronNow = async () => {
    setRunningCron(true);
    try {
      const res = await fetch('/api/cron/daily-notifications');
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          `Hourly Cron evaluation completed! Ran ${data.report?.ranCount || 0} due automation(s) for IST ${data.report?.istTime}.`
        );
        await fetchAutomations();
        await fetchOverview();
      } else {
        toast.error(data.error || 'Cron check failed');
      }
    } catch {
      toast.error('Network error executing cron check');
    } finally {
      setRunningCron(false);
    }
  };

  const activeCategoryMeta = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Customer Notifications & Push Engine
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/25">
                Lock-Screen Push + In-App Live
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Broadcast instant Swiggy/Zomato-style lock-screen push alerts or configure Astrotalk-style automated daily Panchang, Horoscopes & Astrologer recommendations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => {
              fetchOverview();
              fetchAutomations();
            }}
            disabled={loading || loadingAutomations}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-bold text-foreground transition-all"
          >
            <RefreshCw size={14} className={loading || loadingAutomations ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Sent</span>
            <Bell size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{stats.totalSent}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Campaigns & automated alerts</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active App Devices</span>
            <Smartphone size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{stats.totalDevices}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            iOS: {stats.iosDevices} • Android: {stats.androidDevices}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Devotees</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{stats.totalUsers}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Registered customer profiles</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Lock-Screen Pushes</span>
            <Sparkles size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{totalPushesDelivered}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Via Expo / Firebase FCM V1</p>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/60 border border-border rounded-2xl">
        <button
          type="button"
          onClick={() => setModuleTab('broadcast')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            moduleTab === 'broadcast'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Send size={15} className={moduleTab === 'broadcast' ? 'text-amber-600' : ''} />
          Manual Broadcast Composer
          <span className="hidden sm:inline text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
            Instant Send + Phone Preview
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModuleTab('automations')}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            moduleTab === 'automations'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar size={15} className={moduleTab === 'automations' ? 'text-amber-600' : ''} />
          Astrotalk Automated Daily Engine
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600">
            {automations.filter((a) => a.enabled).length} Active Daily
          </span>
        </button>
      </div>

      {/* TAB 1: MANUAL BROADCAST COMPOSER */}
      {moduleTab === 'broadcast' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left: Composer Form */}
            <form
              onSubmit={handleSend}
              className="xl:col-span-8 bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Send size={16} className="text-amber-600" />
                  Compose Push Notification
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">Templates:</span>
                  {QUICK_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.name}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted/80 hover:bg-amber-500/15 hover:text-amber-700 border border-border transition-all"
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => {
                    const active = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-left ${
                          active
                            ? 'bg-amber-500/15 border-amber-500 text-foreground shadow-xs'
                            : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/70'
                        }`}
                      >
                        <span className="text-base">{c.emoji}</span>
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Notification Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ✨ Your Stars Have Spoken Today!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Daily Horoscope Ready"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Notification Message Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="e.g. Lucky colour, auspicious timing & today's planetary shift for your Rashi are live now. Tap to read!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Action Route & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <Compass size={13} className="text-amber-600" />
                    Deep Link (Target Screen)
                  </label>
                  <select
                    value={actionRoute}
                    onChange={(e) => setActionRoute(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    {DEEP_LINK_ROUTES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label} ({r.value})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Action Button Label (CTA)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Read Now, Consult Now, Claim Offer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Delivery Mode & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Delivery Channels
                  </label>
                  <select
                    value={deliveryMode}
                    onChange={(e) => setDeliveryMode(e.target.value as NotificationDeliveryMode)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="push_and_inapp">
                      🔔 Lock-Screen Push & In-App Notification Center
                    </option>
                    <option value="push_only">📲 Lock-Screen Push Notification Only</option>
                    <option value="inapp_only">📬 In-App Bell Notification Center Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-amber-600" />
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Audience Selector */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">Target Audience</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === 'all'}
                      onChange={() => setAudience('all')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>All Devotees ({stats.totalUsers} registered • {stats.totalDevices} active push devices)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === 'specific'}
                      onChange={() => setAudience('specific')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Specific Customers ({selectedUids.length} selected)</span>
                  </label>
                </div>

                {/* Specific User Search Table */}
                {audience === 'specific' && (
                  <div className="mt-3 border border-border rounded-xl p-3 bg-muted/20 space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name, phone or email..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-border/50">
                      {filteredUsers.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center">No customers found.</p>
                      ) : (
                        filteredUsers.map((u) => {
                          const selected = selectedUids.includes(u.uid);
                          return (
                            <button
                              key={u.uid}
                              type="button"
                              onClick={() => toggleUserSelection(u.uid)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                                selected ? 'bg-amber-500/15' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    selected
                                      ? 'bg-amber-600 border-amber-600 text-white'
                                      : 'border-border bg-background'
                                  }`}
                                >
                                  {selected && <Check size={12} />}
                                </div>
                                <span className="font-semibold text-foreground">{u.name}</span>
                                {u.phone && <span className="text-muted-foreground font-mono">({u.phone})</span>}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {u.hasPushToken ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold">
                                    {u.platform || 'push'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    inbox only
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Delivers to iOS & Android lock-screens via Firebase FCM V1 + Expo Push API
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Sending Broadcast...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Broadcast Now
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Right: Real-Time Interactive Lock-Screen Preview */}
            <div className="xl:col-span-4 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Smartphone size={14} className="text-amber-600" />
                    Lock-Screen Live Preview
                  </h4>
                  <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setPreviewPlatform('ios')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        previewPlatform === 'ios'
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Apple iOS
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPlatform('android')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        previewPlatform === 'android'
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Android
                    </button>
                  </div>
                </div>

                {/* Simulated Phone Lock-Screen */}
                <div className="rounded-3xl bg-gradient-to-b from-[#1A1512] via-[#261D17] to-[#17120F] p-4 border border-amber-500/25 shadow-lg space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-amber-100/70 px-1">
                    <span>{previewPlatform === 'ios' ? '9:41' : '10:30 AM'}</span>
                    <span>5G · 100%</span>
                  </div>

                  <div className="text-center py-2">
                    <p className="text-2xl font-extrabold tracking-tight text-amber-50">
                      {previewPlatform === 'ios' ? '9:41' : '10:30'}
                    </p>
                    <p className="text-[10px] text-amber-200/70">Wednesday, 19 November</p>
                  </div>

                  <div className="rounded-2xl bg-white/95 text-[#1F1A17] p-3.5 shadow-md space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-amber-600 flex items-center justify-center text-[11px] text-white font-bold">
                          ॐ
                        </div>
                        <span className="text-[11px] font-bold tracking-wide uppercase text-amber-800">
                          AstroParihar
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">now</span>
                    </div>
                    <p className="text-xs font-extrabold leading-snug">
                      {title.trim() || '✨ Your Stars Have Spoken Today!'}
                    </p>
                    {subtitle.trim() && (
                      <p className="text-[11px] font-semibold text-amber-700 leading-tight">
                        {subtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">
                      {body.trim() ||
                        'Your Swiggy/Zomato-style lock-screen alert will pop right here on customer phones and inside the Bell icon inbox.'}
                    </p>
                    {imageUrl.trim() && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="Notification preview"
                        className="w-full h-24 object-cover rounded-xl border border-neutral-200 mt-1"
                      />
                    )}
                    {ctaText.trim() && (
                      <div className="pt-1">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-600/15 text-amber-800">
                          {ctaText} →
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                      {activeCategoryMeta.emoji} {activeCategoryMeta.label}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-amber-100/80">
                      {deliveryMode === 'push_and_inapp'
                        ? 'Lock-Screen + Bell'
                        : deliveryMode === 'push_only'
                        ? 'Lock-Screen Only'
                        : 'Bell Inbox Only'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sent Notifications History */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" />
                  Sent Notifications & Campaign Logs
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View past broadcasts, delivery rates, and reuse or delete notifications.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search history..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  />
                </div>
                <select
                  value={historyCategory}
                  onChange={(e) => setHistoryCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell size={28} className="mx-auto text-muted-foreground opacity-50" />
                <p className="text-sm font-semibold text-foreground">No notifications found</p>
                <p className="text-xs text-muted-foreground">
                  Send your first notification above to see it recorded here with delivery stats.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((n) => {
                  const cat = CATEGORIES.find((c) => c.id === n.category) || CATEGORIES[0];
                  return (
                    <div
                      key={n.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}>
                            {cat.emoji} {cat.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                          {n.sentBy && (
                            <span className="text-[10px] text-muted-foreground">
                              by <strong className="text-foreground">{n.sentBy}</strong>
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                          <span>
                            In-app targets: <strong className="text-foreground">{n.stats?.totalTargets ?? 0}</strong>
                          </span>
                          <span>
                            Push delivered:{' '}
                            <strong className="text-emerald-600">
                              {n.stats?.pushDelivered ?? 0}/{n.stats?.pushAttempted ?? 0}
                            </strong>
                          </span>
                          {n.actionRoute && (
                            <span>
                              Route: <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{n.actionRoute}</code>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleReuse(n)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/50 hover:border-amber-500 text-xs font-semibold text-foreground transition-all"
                          title="Load into composer to resend"
                        >
                          <RotateCcw size={13} />
                          Reuse
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === n.id}
                          onClick={() => handleDelete(n.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/25 bg-red-500/10 hover:bg-red-600 hover:text-white text-xs font-semibold text-red-600 transition-all disabled:opacity-50"
                          title="Delete notification"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: ASTROTALK AUTOMATED DAILY ENGINE */}
      {moduleTab === 'automations' && (
        <div className="space-y-6">
          {/* Engine Header Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-600" />
                    Astrotalk-Style Automated Daily Engagement Engine
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 border border-purple-500/25">
                    Cron Ready
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automate high-converting daily push notifications like Astrotalk: Morning Panchang, Midday Astrologer Recommendations, Kundli Transits, and Evening Sandhya Aarti.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {currentTimeIST && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground">
                    <Clock size={13} className="text-amber-600" />
                    <span>IST Time: <strong className="text-amber-700">{currentTimeIST}</strong></span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRunCronNow}
                  disabled={runningCron}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-muted/60 hover:bg-muted text-xs font-bold text-foreground transition-all"
                  title="Check and trigger any automations that are due right now"
                >
                  <RefreshCw size={13} className={runningCron ? 'animate-spin' : ''} />
                  {runningCron ? 'Evaluating...' : 'Run Cron Check Now'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAutomations}
                  disabled={savingAutomations}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <Save size={14} />
                  {savingAutomations ? 'Saving Schedules...' : 'Save All Schedules'}
                </button>
              </div>
            </div>

            {/* Cron Webhook Quick Info Banner */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-600" />
                  Automated Daily Cron Trigger URL
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Vercel Cron is configured in <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">vercel.json</code> to ping this endpoint hourly. You can also hook this up to EasyCron or cron-job.org.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/api/cron/daily-notifications`;
                  navigator.clipboard.writeText(url);
                  toast.success('Copied Cron URL to clipboard!');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-card hover:bg-muted text-xs font-bold text-amber-800 transition-all shrink-0"
              >
                <Copy size={13} />
                Copy Webhook URL
              </button>
            </div>
          </div>

          {/* List of Automated Daily Schedules */}
          <div className="space-y-4">
            {automations.map((sch) => {
              const cat = CATEGORIES.find((c) => c.id === sch.category) || CATEGORIES[0];
              const isTriggering = triggeringId === sch.id;

              return (
                <div
                  key={sch.id}
                  className={`bg-card border rounded-2xl p-5 shadow-xs transition-all space-y-4 ${
                    sch.enabled ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-border opacity-85'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
                        {cat.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground">{sch.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}>
                            {cat.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{sch.description}</p>
                      </div>
                    </div>

                    {/* Enable Switch & Time */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground">Time (IST):</span>
                        <input
                          type="time"
                          value={sch.time}
                          onChange={(e) => handleUpdateAutomationField(sch.id, 'time', e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAutomation(sch.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          sch.enabled ? 'bg-emerald-600' : 'bg-muted'
                        }`}
                        title={sch.enabled ? 'Enabled' : 'Disabled'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            sch.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card Editable Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Notification Title
                      </label>
                      <input
                        type="text"
                        value={sch.title}
                        onChange={(e) => handleUpdateAutomationField(sch.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Subtitle (Optional)
                      </label>
                      <input
                        type="text"
                        value={sch.subtitle || ''}
                        onChange={(e) => handleUpdateAutomationField(sch.id, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Message Body
                      </label>
                      <textarea
                        rows={2}
                        value={sch.body}
                        onChange={(e) => handleUpdateAutomationField(sch.id, 'body', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Deep Link Destination
                      </label>
                      <select
                        value={sch.actionRoute}
                        onChange={(e) => handleUpdateAutomationField(sch.id, 'actionRoute', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {DEEP_LINK_ROUTES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label} ({r.value})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Delivery Mode
                      </label>
                      <select
                        value={sch.deliveryMode}
                        onChange={(e) => handleUpdateAutomationField(sch.id, 'deliveryMode', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="push_and_inapp">🔔 Lock-Screen Push + In-App Bell</option>
                        <option value="push_only">📲 Lock-Screen Push Only</option>
                        <option value="inapp_only">📬 In-App Bell Inbox Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Card Footer: Status & Manual Test Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      <span>
                        Status:{' '}
                        <strong className={sch.enabled ? 'text-emerald-600 font-bold' : 'text-neutral-500'}>
                          {sch.enabled ? `Active • Fires daily at ${sch.time} IST` : 'Paused / Inactive'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Last triggered:{' '}
                        <strong className="text-foreground">
                          {sch.lastTriggeredAt ? formatTimeAgo(sch.lastTriggeredAt) : 'Never'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Lifetime sent: <strong className="text-foreground">{sch.totalSentCount || 0} times</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isTriggering}
                      onClick={() => handleTriggerAutomation(sch.id, sch.name)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-600 hover:text-white text-xs font-bold text-amber-800 transition-all disabled:opacity-50 self-start sm:self-auto"
                      title="Trigger this automated notification immediately to test delivery on your phone"
                    >
                      <Zap size={13} className={isTriggering ? 'animate-spin' : ''} />
                      {isTriggering ? 'Broadcasting...' : '⚡ Test Send Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
