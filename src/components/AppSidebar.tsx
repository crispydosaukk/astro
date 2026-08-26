'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Calendar,
  Star,
  Crown,
  LayoutDashboard,
  Sparkles,
  Bell,
  Shield,
  LogOut,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  Users,
  CreditCard,
  ClipboardList,
  Bot,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { useUserData } from '@/lib/useUserData';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import LogoutModal from '@/components/LogoutModal';

const sidebarGroups = [
  {
    label: 'Main',
    items: [
      { icon: Home, label: 'Home', href: '/' },
      {
        icon: Bot,
        label: 'Talk to AI Astrologer',
        href: '/talk-to-ai-astrologer',
        badge: 'AI',
      },
      {
        icon: Calendar,
        label: 'Book Consultation',
        href: '/consultation-booking-screen',
        badge: null,
      },
    ],
  },
  {
    label: 'My Space',
    items: [
      { icon: FileText, label: 'My Reports', href: '/my-reports', badge: '3' },
      { icon: Bot, label: 'AI Consultations', href: '/ai-consultations', badge: null },
      { icon: Star, label: 'Saved Kundlis', href: '/', badge: null },
      { icon: Crown, label: 'Membership', href: '/', badge: null },
      { icon: Bell, label: 'Notifications', href: '/notifications', badge: '5' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: Shield, label: 'Overview', href: '/admin-panel', badge: null },
      { icon: Bot, label: 'AI Astrologers', href: '/admin-panel/ai-astrologers', badge: 'AI' },
      { icon: LayoutTemplate, label: 'Content', href: '/admin-panel/content', badge: null },
      { icon: FileText, label: 'Page Content', href: '/admin-panel/page-content', badge: null },
      { icon: Users, label: 'Users', href: '/admin-panel/users', badge: null },
      { icon: Star, label: 'Astrologers', href: '/admin-panel/astrologers', badge: null },
      {
        icon: ClipboardList,
        label: 'Applications',
        href: '/admin-panel/applications',
        badge: null,
      },
      { icon: Calendar, label: 'Appointments', href: '/admin-panel/appointments', badge: null },
      { icon: CreditCard, label: 'Payments', href: '/admin-panel/payments', badge: null },
      { icon: Bot, label: 'AI Prompts', href: '/admin-panel/prompts', badge: 'AI' },
      { icon: Sparkles, label: 'Settings', href: '/admin-panel/settings', badge: null },
    ],
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function AppSidebar({ collapsed = false, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, userData, loading } = useUserData();
  const [reportsCount, setReportsCount] = useState<number | null>(null);

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

  const isUserLoggedIn = !!user;
  const fullName = userData?.name || 'User';
  // Check if admin by email or custom claim, but for now fallback to false unless explicitly mocked
  const isAdminLoggedIn = false;

  const isAdminRoute = pathname.startsWith('/admin-panel');

  const visibleGroups = sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        badge:
          item.label === 'My Reports' && reportsCount !== null
            ? reportsCount > 0
              ? reportsCount.toString()
              : null
            : item.badge,
      })),
    }))
    .filter((group) => {
      if (isAdminRoute) {
        return group.label === 'Admin';
      }
      return group.label !== 'Admin';
    });

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'} bg-card border-r border-border`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-border ${collapsed ? 'justify-center' : 'gap-3'}`}
      >
        <AppLogo src="/astrologo.png" size={44} />
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-6 px-2">
        {visibleGroups.map((group) => (
          <div key={`group-${group.label}`}>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-600 uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={`sidebar-${item.label}`}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                      ${isActive ? 'nav-link-active text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    <Icon
                      size={18}
                      className={`flex-shrink-0 icon-hover-animate ${isActive ? 'text-accent' : ''}`}
                    />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${item.badge === 'NEW' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-white'}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile & Sign Out Controls */}
      <div className="flex-shrink-0 border-t border-border p-3 space-y-2 bg-card">
        {isAdminRoute && (
          <>
            {!collapsed ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted border border-border/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Shield size={15} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">System Admin</p>
                      <p className="text-[10px] text-muted-foreground truncate">AstroParihar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all font-bold text-xs shadow-sm"
                >
                  <LogOut size={15} className="flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-10 h-10 mx-auto rounded-xl bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            )}
          </>
        )}

        {!isAdminRoute && isUserLoggedIn && (
          <>
            {!collapsed ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted border border-border/60">
                  <div className="w-8 h-8 rounded-full indigo-gradient-bg flex items-center justify-center shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{fullName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">Customer Account</p>
                  </div>
                  <Crown size={14} className="text-accent flex-shrink-0" />
                </div>
                <button
                  onClick={async () => {
                    await signOut(auth);
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all font-bold text-xs shadow-sm"
                >
                  <LogOut size={15} className="flex-shrink-0" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  await signOut(auth);
                  window.location.href = '/';
                }}
                className="w-10 h-10 mx-auto rounded-xl bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            )}
          </>
        )}

        {!isAdminRoute && !isUserLoggedIn && (
          <button
            onClick={() => (window.location.href = '/sign-up-login-screen')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:bg-accent/90 transition-all shadow-sm"
          >
            <User size={15} /> {!collapsed && 'Sign In'}
          </button>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>

      {/* Modals */}
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </aside>
  );
}
