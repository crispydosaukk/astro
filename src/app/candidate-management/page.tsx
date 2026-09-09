import React from 'react';
import AppLayout from '@/components/AppLayout';
import CandidateTableHeader from './components/CandidateTableHeader';
import CandidateTable from './components/CandidateTable';

export default function CandidateManagementPage() {
  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Candidate Management</h1>
          <p className="text-muted-foreground mt-1 text-md">
            2,847 total candidates across all lifecycle stages
          </p>
        </div>
        <CandidateTableHeader />
        <CandidateTable />
      </div>
    </AppLayout>
  );
}