import React from 'react';
import AppLayout from '@/components/AppLayout';
import AdminAIPrompts from '../../components/AdminAIPrompts';

export default function AdminPromptsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="px-6 lg:px-8 py-8 max-w-screen-2xl">
          <AdminAIPrompts />
        </div>
      </div>
    </AppLayout>
  );
}
