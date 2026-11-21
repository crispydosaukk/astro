import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../../components/AdminContent';

export default function AdminAppAllScreensPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-app-all-screens" />
    </AppLayout>
  );
}
