'use client';
import React, { useState } from 'react';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'} min-h-screen`}>
        {children}
      </main>
    </div>
  );
}