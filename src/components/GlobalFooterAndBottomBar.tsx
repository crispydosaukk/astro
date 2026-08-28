'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PhoneCall, Sparkles, Calendar, FileText, Bot } from 'lucide-react';
import LandingFooter from '@/app/components/LandingFooter';

export default function GlobalFooterAndBottomBar() {
  const pathname = usePathname();

  // Exclude bottom bar and footer from admin, astrologer dashboard, and active call rooms
  const isExcluded =
    pathname?.startsWith('/admin-panel') ||
    pathname?.startsWith('/astrologer-dashboard') ||
    pathname?.startsWith('/call/');

  if (isExcluded) {
    return null;
  }

  // Check which pages already have LandingFooter built into their component
  // to avoid rendering double footers
  const pagesWithDirectFooter = ['/', '/privacy', '/terms', '/refund-policy', '/cookies'];
  const isServicesRoute = pathname?.startsWith('/services');
  const hasDirectFooter =
    pagesWithDirectFooter.includes(pathname || '') || isServicesRoute || pathname === '/remedies';

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'AI Expert',
      href: '/talk-to-ai-astrologer',
      icon: Bot,
      isActive: pathname?.startsWith('/talk-to-ai-astrologer'),
      showLiveDot: true,
    },
    {
      label: 'Talk to Astro',
      href: '/talk-to-astrologer',
      icon: PhoneCall,
      isActive: pathname?.startsWith('/talk-to-astrologer') || pathname?.startsWith('/astrologer/'),
    },
    {
      label: 'Remedies',
      href: '/remedies',
      icon: Sparkles,
      isActive: pathname?.startsWith('/remedies'),
    },
    {
      label: 'My Reports',
      href: '/my-reports',
      icon: FileText,
      isActive: pathname?.startsWith('/my-reports') || pathname?.startsWith('/user-dashboard'),
    },
  ];

  return (
    <>
      {/* 1. Universal Desktop / Tablet / Mobile Footer (if not already included by child page) */}
      {!hasDirectFooter && (
        <div className="w-full">
          <LandingFooter />
        </div>
      )}

      {/* Spacer so page content is never hidden behind the mobile bottom bar */}
      <div className="h-16 md:hidden pointer-events-none" />

      {/* 2. Modern Sticky Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#FFFDFC]/95 backdrop-blur-xl border-t border-[#E5D9C8] shadow-[0_-8px_30px_rgba(53,36,51,0.08)] pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 group ${
                  item.isActive ? 'text-[#713B32] font-bold' : 'text-[#6B5E55] hover:text-[#292522]'
                }`}
              >
                {/* Active Indicator Pip */}
                {item.isActive && (
                  <span className="absolute top-0 w-8 h-1 rounded-full gold-gradient-bg shadow-sm" />
                )}

                {/* Icon Wrapper */}
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={20}
                    className={`transition-transform duration-200 ${
                      item.isActive
                        ? 'scale-110 text-[#713B32]'
                        : 'group-hover:scale-105 text-[#6B5E55]'
                    }`}
                  />
                  {/* Live Pulse Dot for Talk to Astrologer */}
                  {item.showLiveDot && (
                    <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] tracking-tight mt-1 truncate max-w-full leading-none ${
                    item.isActive ? 'text-[#713B32] font-bold' : 'text-[#6B5E55]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
