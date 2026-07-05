'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, Sparkles, Calendar, FileText, Star, ChevronLeft, ChevronRight, Bell, Crown, User, Home, Shield } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const sidebarGroups = [
  {
    label: 'Main',
    items: [
      { icon: Home, label: 'Home', href: '/' },
      { icon: LayoutDashboard, label: 'Dashboard', href: '/user-dashboard', badge: null },
      { icon: Sparkles, label: 'AI Insights', href: '/ai-recommendations-screen', badge: 'NEW' },
      { icon: Calendar, label: 'Book Consultation', href: '/consultation-booking-screen', badge: null },
    ],
  },
  {
    label: 'My Space',
    items: [
      { icon: FileText, label: 'My Reports', href: '/user-dashboard', badge: '3' },
      { icon: Star, label: 'Saved Kundlis', href: '/user-dashboard', badge: null },
      { icon: Crown, label: 'Membership', href: '/user-dashboard', badge: null },
      { icon: Bell, label: 'Notifications', href: '/user-dashboard', badge: '5' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: Shield, label: 'Admin Panel', href: '/admin-panel', badge: null },
    ],
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function AppSidebar({ collapsed = false, onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'} bg-card border-r border-border`}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-border ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <AppLogo src="/AstroParihar_Top_Logo.jpg" size={32} />
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-6 px-2">
        {sidebarGroups.map((group) => (
          <div key={`group-${group.label}`}>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-600 uppercase tracking-widest text-muted-foreground">{group.label}</p>
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
                    <Icon size={18} className={`flex-shrink-0 icon-hover-animate ${isActive ? 'text-accent' : ''}`} />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${item.badge === 'NEW' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-white'}`}>
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

      {/* Bottom */}
      <div className="border-t border-border p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted">
            <div className="w-8 h-8 rounded-full indigo-gradient-bg flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Arjun Sharma</p>
              <p className="text-xs text-muted-foreground truncate">Premium Member</p>
            </div>
            <Crown size={14} className="text-accent flex-shrink-0" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}