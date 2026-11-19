import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../../components/AdminContent';

export default function AdminAppNotificationsPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-app-notifications" />
    </AppLayout>
  );
}
