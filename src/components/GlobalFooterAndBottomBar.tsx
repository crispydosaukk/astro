'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PhoneCall, Sparkles, FileText, Bot, Cpu } from 'lucide-react';
import LandingFooter from '@/app/components/LandingFooter';

export default function GlobalFooterAndBottomBar() {
  const pathname = usePathname();

  // Exclude bottom bar and footer from admin, astrologer dashboard, active call rooms, and AI platform dashboards
  const isExcluded =
    pathname?.startsWith('/admin-panel') ||
    pathname?.startsWith('/astrologer-dashboard') ||
    pathname?.startsWith('/call/') ||
    pathname?.startsWith('/admin-dashboard') ||
    pathname?.startsWith('/ai-operations') ||
    pathname?.startsWith('/application-management') ||
    pathname?.startsWith('/audit-logs') ||
    pathname?.startsWith('/candidate-management') ||
    pathname?.startsWith('/candidates') ||
    pathname?.startsWith('/discovery-campaign-management') ||
    pathname?.startsWith('/discovery-jobs') ||
    pathname?.startsWith('/enrolment') ||
    pathname?.startsWith('/human-review-module') ||
    pathname?.startsWith('/outreach') ||
    pathname?.startsWith('/probation') ||
    pathname?.startsWith('/reports') ||
    pathname?.startsWith('/search-history') ||
    pathname?.startsWith('/search-sources') ||
    pathname?.startsWith('/users-roles') ||
    pathname?.startsWith('/verification');

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
      isActive: pathname?.startsWith('/my-reports'),
    },
    {
      label: 'AiASTRO',
      href: '/aiastro',
      icon: Cpu,
      isActive: pathname?.startsWith('/aiastro') || pathname?.startsWith('/admin-dashboard'),
      isHighlight: true,
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
        <div className="max-w-md mx-auto grid grid-cols-6 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-2xl transition-all duration-200 group ${
                  item.isActive
                    ? 'text-[#713B32] font-bold'
                    : item.isHighlight
                      ? 'text-[#B88A44] font-semibold hover:text-[#713B32]'
                      : 'text-[#6B5E55] hover:text-[#292522]'
                }`}
              >
                {/* Active Indicator Pip */}
                {item.isActive && (
                  <span className="absolute top-0 w-6 h-1 rounded-full gold-gradient-bg shadow-sm" />
                )}

                {/* Icon Wrapper */}
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={19}
                    className={`transition-transform duration-200 ${
                      item.isActive
                        ? 'scale-110 text-[#713B32]'
                        : item.isHighlight
                          ? 'text-[#B88A44] group-hover:scale-110'
                          : 'group-hover:scale-105 text-[#6B5E55]'
                    }`}
                  />
                  {/* Live Pulse Dot for Talk to Astrologer / AI Expert */}
                  {item.showLiveDot && (
                    <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
                    </span>
                  )}
                  {/* AiASTRO subtle star/indicator */}
                  {item.isHighlight && !item.isActive && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B88A44]" />
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[9.5px] tracking-tight mt-1 truncate max-w-full leading-none ${
                    item.isActive
                      ? 'text-[#713B32] font-bold'
                      : item.isHighlight
                        ? 'text-[#B88A44] font-bold'
                        : 'text-[#6B5E55]'
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
