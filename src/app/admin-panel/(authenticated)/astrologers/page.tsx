import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminContent from '../../components/AdminContent';

export default function AstrologersPage() {
  return (
    <AppLayout>
      <AdminContent activeTab="tab-astrologers" />
    </AppLayout>
  );
}
