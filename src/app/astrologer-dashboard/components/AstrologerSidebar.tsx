'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  CreditCard,
  User,
  LogOut,
  X,
  AlertTriangle,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarGroups = [
  {
    label: 'Dashboard',
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/astrologer-dashboard' },
      {
        icon: MessageSquare,
        label: 'Consultations',
        href: '/astrologer-dashboard/consultations',
        badge: '3',
      },
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      window.location.href = '/astrologer-login';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
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
                    <Icon
                      size={18}
                      className={
                        isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
                      }
                    />
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
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="ml-3 font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Center of Screen Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center"
            >
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-inner">
                <LogOut size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  Confirm Sign Out
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to sign out of your Astrologer Dashboard? You will need to log in again to manage consultations.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-foreground text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <span>Signing Out...</span>
                  ) : (
                    <>
                      <LogOut size={16} />
                      <span>Yes, Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
