'use client';
import React from 'react';
import DashboardMetrics from './DashboardMetrics';
import KundliSummary from './KundliSummary';
import UpcomingAppointments from './UpcomingAppointments';
import RecentReports from './RecentReports';
import DailyHoroscope from './DailyHoroscope';
import RemedySuggestions from './RemedySuggestions';
import { Bell, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Namaste, Arjun 🙏</h1>
            <p className="text-sm text-muted-foreground">Thursday, 3 July 2026 · Guruvar · Shukla Saptami</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-muted transition-all icon-hover-animate">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
            </button>
            <Link href="/sign-up-login-screen" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-all">
              <div className="w-7 h-7 rounded-full indigo-gradient-bg flex items-center justify-center">
                <User size={13} className="text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:block">Arjun Sharma</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 space-y-8 max-w-screen-2xl">
        <DashboardMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DailyHoroscope />
            <KundliSummary />
          </div>
          <div className="space-y-6">
            <UpcomingAppointments />
            <RemedySuggestions />
          </div>
        </div>

        <RecentReports />
      </div>
    </div>
  );
}