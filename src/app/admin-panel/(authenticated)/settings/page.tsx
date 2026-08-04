import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminSettings from '../../components/AdminSettings';

export default function AdminSettingsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="px-6 lg:px-8 py-8 max-w-screen-2xl">
          <AdminSettings />
        </div>
      </div>
    </AppLayout>
  );
}
