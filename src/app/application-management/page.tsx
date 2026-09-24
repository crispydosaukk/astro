'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import ApplicationHeader from './components/ApplicationHeader';
import ApplicationPipelineSummary from './components/ApplicationPipelineSummary';
import ApplicationTable from './components/ApplicationTable';
import { 
  Candidate, 
  subscribeToCandidates, 
  updateCandidateStatus 
} from '@/lib/firebase/candidateService';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function ApplicationManagementPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appStatus, setAppStatus] = useState('All');
  const [reviewer, setReviewer] = useState('All Reviewers');
  const [campaign, setCampaign] = useState('All Campaigns');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to real-time candidates
  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (allCandidates) => {
          setCandidates(allCandidates || []);
          setLoading(false);
        },
        () => {
          setCandidates([]);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch {
      setCandidates([]);
      setLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (id: string, newLifecycle: string, newAppStatus: string) => {
    try {
      await updateCandidateStatus(id, {
        lifecycleStatus: newLifecycle,
        applicationStatus: newAppStatus,
      });
      setCandidates(prev => prev.map(c => c.id === id ? {
        ...c,
        lifecycleStatus: newLifecycle,
        applicationStatus: newAppStatus,
      } : c));
      setToastMessage(`Application updated to "${newAppStatus}"!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.warn('Status update error:', e);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Applicant Name', 'Business', 'Location', 'AI Score', 'Source', 'Status'];
    const rows = filteredCandidates.map(c => [
      `"${c.name}"`,
      `"${c.businessName}"`,
      `"${c.location}"`,
      c.aiScore,
      `"${c.source}"`,
      `"${c.applicationStatus || c.lifecycleStatus}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `astroparihar_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract available campaigns/sources
  const availableCampaigns = Array.from(new Set(
    candidates.flatMap(c => [c.source, c.campaignName, (c as any).campaign].filter(Boolean) as string[])
  ));

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.businessName.toLowerCase().includes(search.toLowerCase());

    const statusMatches = () => {
      if (appStatus === 'All') return true;
      if (appStatus === 'Started') return c.applicationStatus === 'Started' || c.lifecycleStatus === 'applied';
      if (appStatus === 'Submitted') return c.applicationStatus === 'Submitted' || c.lifecycleStatus === 'submitted';
      if (appStatus === 'Under Screening') return c.applicationStatus === 'Under Screening' || c.lifecycleStatus === 'screening';
      if (appStatus === 'Assessment Pending') return c.applicationStatus === 'Assessment Pending' || c.lifecycleStatus === 'assessment';
      if (appStatus === 'Interview Pending') return c.applicationStatus === 'Interview Pending' || c.lifecycleStatus === 'interview';
      if (appStatus === 'Human Review') return c.applicationStatus === 'Human Review' || c.lifecycleStatus === 'human-review';
      if (appStatus === 'Approved') return c.applicationStatus === 'Approved' || c.lifecycleStatus === 'probation' || c.lifecycleStatus === 'verified';
      if (appStatus === 'Rejected') return c.applicationStatus === 'Rejected' || c.lifecycleStatus === 'rejected';
      return (c.applicationStatus || c.lifecycleStatus) === appStatus;
    };

    const matchCampaign = campaign === 'All Campaigns' || 
      c.source === campaign || 
      c.campaignName === campaign || 
      (c as any).campaign === campaign;

    return matchSearch && statusMatches() && matchCampaign;
  });

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Application Management</h1>
            <p className="text-muted-foreground mt-1 text-md">
              {candidates.length} applications tracked in real-time — monitor candidate screening, verify credentials, and manage onboarding pipeline
            </p>
          </div>
          {toastMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 size={13} /> {toastMessage}
            </span>
          )}
        </div>

        <ApplicationHeader 
          search={search}
          setSearch={setSearch}
          appStatus={appStatus}
          setAppStatus={setAppStatus}
          reviewer={reviewer}
          setReviewer={setReviewer}
          campaign={campaign}
          setCampaign={setCampaign}
          availableCampaigns={availableCampaigns}
          onExport={handleExportCSV}
        />

        <ApplicationPipelineSummary 
          candidates={candidates}
          activeFilter={appStatus}
          onSelectStage={(stage) => setAppStatus(stage)}
        />

        {loading ? (
          <div className="card-elevated p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-primary" size={28} />
            <p className="text-sm">Loading applications from Firestore...</p>
          </div>
        ) : (
          <ApplicationTable 
            candidates={filteredCandidates} 
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </AppLayout>
  );
}