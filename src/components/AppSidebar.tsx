'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home,
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
  ChevronDown,
  LayoutTemplate,
  Users,
  CreditCard,
  ClipboardList,
  Bot,
  Smartphone } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { useUserData } from '@/lib/useUserData';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import LogoutModal from '@/components/LogoutModal';

export interface SidebarSubItem {
  icon?: any;
  label: string;
  href: string;
  badge?: string | null;
}

export interface SidebarItem {
  icon: any;
  label: string;
  href?: string;
  badge?: string | null;
  children?: SidebarSubItem[];
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

const sidebarGroups: SidebarGroup[] = [
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
      {
        icon: Smartphone,
        label: 'App Dynamic',
        badge: 'App',
        children: [
          { icon: Smartphone, label: 'Onboarding', href: '/admin-panel/app-dynamic/onboarding' },
          { icon: LayoutTemplate, label: 'Banners', href: '/admin-panel/app-dynamic/banners' },
          { icon: Sparkles, label: 'Cosmic Insights', href: '/admin-panel/app-dynamic/cosmic-insights' },
          { icon: LayoutTemplate, label: 'Services', href: '/admin-panel/app-dynamic/services' },
          { icon: User, label: 'Profile Menu', href: '/admin-panel/app-dynamic/profile' },
          { icon: Star, label: 'Reviews', href: '/admin-panel/app-dynamic/reviews' },
        ],
      },
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

  const isAppDynamicRoute = pathname.startsWith('/admin-panel/app-dynamic') || pathname.startsWith('/app-dynamic');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'App Dynamic': true,
  });

  React.useEffect(() => {
    if (isAppDynamicRoute) {
      setOpenMenus((prev) => ({ ...prev, 'App Dynamic': true }));
    }
  }, [isAppDynamicRoute]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

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

  const isAdminRoute = pathname.startsWith('/admin-panel') || pathname.startsWith('/app-dynamic');

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
                const hasChildren = !!(item.children && item.children.length > 0);
                const isChildActive =
                  hasChildren &&
                  item.children!.some(
                    (c) => pathname === c.href || pathname.startsWith(c.href)
                  );
                const isParentActive =
                  (item.href && pathname === item.href) || isChildActive;
                const isOpen = !!openMenus[item.label];
                const Icon = item.icon;

                if (hasChildren) {
                  if (collapsed) {
                    return (
                      <div
                        key={`sidebar-${item.label}`}
                        className="relative group flex justify-center"
                      >
                        <button
                          type="button"
                          title={item.label}
                          onClick={() => toggleMenu(item.label)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 relative
                            ${isParentActive ? 'bg-accent/15 text-accent font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                          <Icon size={18} className={isParentActive ? 'text-accent' : ''} />
                          {item.badge && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"></span>
                          )}
                        </button>

                        {/* Floating Flyout for Collapsed Sidebar */}
                        <div className="hidden group-hover:block group-focus-within:block absolute left-full top-0 ml-2 w-52 bg-card border border-border shadow-xl rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-2.5 py-1.5 text-xs font-bold text-foreground border-b border-border mb-1.5 flex items-center justify-between">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-accent text-accent-foreground">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {item.children!.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              const SubIcon = sub.icon;
                              return (
                                <Link
                                  key={`collapsed-sub-${sub.label}`}
                                  href={sub.href}
                                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                                    ${isSubActive ? 'bg-accent text-accent-foreground font-bold shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                >
                                  {SubIcon && <SubIcon size={13} className="shrink-0" />}
                                  <span className="truncate">{sub.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={`sidebar-${item.label}`} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.label)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative select-none
                          ${isParentActive ? 'bg-accent/10 text-accent font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                      >
                        <Icon
                          size={18}
                          className={`flex-shrink-0 icon-hover-animate ${isParentActive ? 'text-accent' : ''}`}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-accent/20 text-accent border border-accent/30">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 text-muted-foreground shrink-0 ${isOpen ? 'rotate-180 text-foreground' : ''}`}
                        />
                      </button>

                      {/* Dropdown Submodules */}
                      {isOpen && (
                        <div className="ml-5 pl-3 py-1 space-y-1 border-l-2 border-border/70 my-1 animate-in slide-in-from-top-1 duration-150">
                          {item.children!.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            const SubIcon = sub.icon;
                            return (
                              <Link
                                key={`sub-${sub.label}`}
                                href={sub.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group/sub
                                  ${isSubActive
                                    ? 'bg-accent text-accent-foreground font-bold shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                              >
                                {SubIcon && (
                                  <SubIcon
                                    size={14}
                                    className={`flex-shrink-0 transition-transform duration-150 group-hover/sub:scale-110 ${isSubActive ? 'text-accent-foreground' : 'text-muted-foreground'}`}
                                  />
                                )}
                                <span className="truncate">{sub.label}</span>
                                {sub.badge && (
                                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-muted text-muted-foreground">
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <Link
                    key={`sidebar-${item.label}`}
                    href={item.href || '#'}
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
