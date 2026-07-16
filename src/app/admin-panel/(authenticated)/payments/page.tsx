import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../components/AdminContent';

export default function PaymentsPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-payments" />
    </AppLayout>
  );
}
