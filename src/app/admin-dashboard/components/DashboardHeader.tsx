'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Download, ChevronDown, Telescope, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../DashboardContext';

const dateRanges = [
  { id: 'range-7d', label: 'Last 7 days' },
  { id: 'range-30d', label: 'Last 30 days' },
  { id: 'range-90d', label: 'Last 90 days' },
  { id: 'range-ytd', label: 'Year to date (All)' },
];

export default function DashboardHeader() {
  const { 
    selectedRange, 
    setSelectedRange, 
    lastUpdated, 
    isLive, 
    isRefreshing, 
    refreshData, 
    exportDataToCsv,
    stats
  } = useDashboard();
  
  const [rangeOpen, setRangeOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const currentLabel = dateRanges.find(r => r.id === selectedRange)?.label ?? 'Last 30 days';

  const handleRefreshClick = async () => {
    await refreshData();
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-foreground">Operations Dashboard</h1>
          {isLive ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live Firestore Sync
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Live Real-Time
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
          <span>Last synchronized: <strong className="text-foreground">{lastUpdated || 'Updating...'}</strong></span>
          {copiedNotification && (
            <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 size={12} /> Live data reloaded ({stats.totalCandidates} records)
            </span>
          )}
        </p>
      </div>
      
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Date range filter */}
        <div className="relative">
          <button
            onClick={() => setRangeOpen(!rangeOpen)}
            className="btn-secondary text-sm py-2 px-3.5 flex items-center gap-1.5"
          >
            {currentLabel}
            <ChevronDown size={13} />
          </button>
          {rangeOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 card-elevated z-20 py-1 shadow-lg animate-slide-up">
              {dateRanges.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedRange(r.id); setRangeOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${selectedRange === r.id ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="btn-secondary text-sm py-2 px-3.5 flex items-center gap-1.5"
          title="Reload live data from Firestore"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-primary' : ''} />
          {isRefreshing ? 'Syncing...' : 'Refresh'}
        </button>

        <button 
          onClick={exportDataToCsv}
          className="btn-secondary text-sm py-2 px-3.5 flex items-center gap-1.5"
          title="Download live dashboard metrics CSV"
        >
          <Download size={13} />
          Export
        </button>

        <Link href="/discovery-campaign-management" className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
          <Telescope size={13} />
          New Campaign
        </Link>
      </div>
    </div>
  );
}