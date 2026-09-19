import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import ReviewWorkspace from './components/ReviewWorkspace';
import { Loader2 } from 'lucide-react';

export default function HumanReviewModulePage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="card-elevated p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm font-semibold">Initializing 360° Candidate Review Workspace...</p>
        </div>
      }>
        <ReviewWorkspace />
      </Suspense>
    </AppLayout>
  );
}