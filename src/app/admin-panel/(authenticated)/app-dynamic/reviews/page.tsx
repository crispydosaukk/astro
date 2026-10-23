import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../../components/AdminContent';

export default function AdminAppReviewsPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-app-reviews" />
    </AppLayout>
  );
}
