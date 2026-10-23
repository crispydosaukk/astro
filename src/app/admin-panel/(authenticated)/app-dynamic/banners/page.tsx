import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../../components/AdminContent';

export default function AdminAppBannersPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-app-banners" />
    </AppLayout>
  );
}
