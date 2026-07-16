'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, CreditCard, User, LogOut, Settings, Calendar } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';

const sidebarGroups = [
  {
    label: 'Dashboard',
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/astrologer-dashboard' },
      { icon: MessageSquare, label: 'Consultations', href: '/astrologer-dashboard/consultations', badge: '3' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: CreditCard, label: 'Earnings', href: '/astrologer-dashboard/earnings' },
      { icon: User, label: 'Profile', href: '/astrologer-dashboard/profile' },
    ],
  },
];

export default function AstrologerSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/astrologer-login';
  };

  return (
    <div className="fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-40 w-64">
      <div className="h-16 flex items-center border-b border-border px-6">
        <AppLogo />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sidebarGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            {group.items.map((item, itemIdx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={itemIdx}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all group relative ${
                    isActive
                      ? 'bg-accent/10 text-accent font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'} />
                  <span className="ml-3 flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          <span className="ml-3 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
