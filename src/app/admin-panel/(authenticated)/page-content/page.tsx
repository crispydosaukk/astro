import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../components/AdminContent';

export default function PageContentAdminPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-page-content" />
    </AppLayout>
  );
}
