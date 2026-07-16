import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../components/AdminContent';

export default function UsersPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-users" />
    </AppLayout>
  );
}
