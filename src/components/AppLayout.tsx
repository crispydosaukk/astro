'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AppSidebar from './AppSidebar';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // If inside existing consumer admin panel (/admin-panel), use AppSidebar
  if (pathname?.startsWith('/admin-panel')) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main
          className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} min-h-screen`}
        >
          {children}
        </main>
      </div>
    );
  }

  // Otherwise, use the AI Platform Sidebar and Topbar
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-6 py-6 xl:px-8 2xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
