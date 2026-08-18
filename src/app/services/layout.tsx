import React from 'react';
import Navbar from '@/components/Navbar';
import LandingFooter from '@/app/components/LandingFooter';

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background dark text-foreground flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
