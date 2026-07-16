import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../components/AdminContent';

export default function AppointmentsPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-appointments" />
    </AppLayout>
  );
}
