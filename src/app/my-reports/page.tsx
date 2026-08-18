'use client';
import React from 'react';
import Navbar from '@/components/Navbar';
import RecentReports from '@/app/my-reports/components/RecentReports';
import { useUserData } from '@/lib/useUserData';
import { Bell, User } from 'lucide-react';
import Link from 'next/link';

export default function MyReportsPage() {
  const { user, userData, loading } = useUserData();
  const fullName = userData?.name || user?.displayName || user?.email?.split('@')[0] || (loading ? 'Loading...' : 'Guest');

  // Get current date formatted
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);

  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="min-h-screen bg-background pt-20 print:pt-0 print:min-h-0 print:bg-transparent">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">My Reports 📄</h1>
              <p className="text-sm text-muted-foreground">
                All your personalized astrological reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-muted transition-all icon-hover-animate">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
              </button>
              {user ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted transition-all">
                  <div className="w-7 h-7 rounded-full gold-gradient-bg flex items-center justify-center">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{fullName}</span>
                </div>
              ) : (
                <Link
                  href="/sign-up-login-screen"
                  className="px-4 py-2 rounded-xl gold-gradient-bg text-white font-semibold text-xs shadow hover:opacity-90 transition-opacity"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-8 py-8 max-w-screen-2xl">
          <RecentReports />
        </div>
      </div>
    </>
  );
}
