import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../../components/AdminContent';

export default function AdminAppOnboardingPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-app-onboarding" />
    </AppLayout>
  );
}
