import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../components/AdminContent';

export default function ApplicationsPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-applications" />
    </AppLayout>
  );
}
