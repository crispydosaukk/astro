'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { DiscoveryProvider } from './DiscoveryContext';
import CampaignHeader from './components/CampaignHeader';
import CampaignCards from './components/CampaignCards';
import CampaignTable from './components/CampaignTable';
import DiscoveryJobPanel from './components/DiscoveryJobPanel';

export default function DiscoveryCampaignManagementPage() {
  return (
    <AppLayout>
      <DiscoveryProvider>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Discovery Campaigns</h1>
            <p className="text-muted-foreground mt-1 text-md">
              AI-powered astrologer discovery — manage campaigns, monitor live jobs, review search sources
            </p>
          </div>
          <CampaignHeader />
          <CampaignCards />
          <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <CampaignTable />
            </div>
            <div className="xl:col-span-1">
              <DiscoveryJobPanel />
            </div>
          </div>
        </div>
      </DiscoveryProvider>
    </AppLayout>
  );
}