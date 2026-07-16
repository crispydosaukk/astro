import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../components/AdminContent';

export default function ContentPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-content" />
    </AppLayout>
  );
}
