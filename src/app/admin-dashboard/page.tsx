'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { DashboardProvider } from './DashboardContext';
import DashboardKPIGrid from './components/DashboardKPIGrid';
import DashboardCharts from './components/DashboardCharts';
import DashboardActivityFeed from './components/DashboardActivityFeed';
import DashboardHeader from './components/DashboardHeader';

export default function AdminDashboardPage() {
  return (
    <AppLayout>
      <DashboardProvider>
        <div className="space-y-6">
          <DashboardHeader />
          <DashboardKPIGrid />
          <DashboardCharts />
          <DashboardActivityFeed />
        </div>
      </DashboardProvider>
    </AppLayout>
  );
}