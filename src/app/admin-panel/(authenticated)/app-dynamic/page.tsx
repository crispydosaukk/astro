import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../components/AdminContent';

export default function AdminAppDynamicHubPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-app-onboarding" />
    </AppLayout>
  );
}
