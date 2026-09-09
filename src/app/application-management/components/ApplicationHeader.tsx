'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, X } from 'lucide-react';

interface ApplicationHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  appStatus: string;
  setAppStatus: (s: string) => void;
  reviewer: string;
  setReviewer: (r: string) => void;
  campaign: string;
  setCampaign: (c: string) => void;
  availableCampaigns: string[];
  onExport: () => void;
}

const appStatuses = ['All', 'Started', 'Draft', 'Submitted', 'Under Screening', 'Assessment Pending', 'Interview Pending', 'Human Review', 'Approved', 'Rejected'];
const reviewers = ['All Reviewers', 'Unassigned', 'Priya Nair', 'Suresh Menon', 'Kavitha Rajan'];

export default function ApplicationHeader({
  search,
  setSearch,
  appStatus,
  setAppStatus,
  reviewer,
  setReviewer,
  campaign,
  setCampaign,
  availableCampaigns,
  onExport,
}: ApplicationHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters = [
    appStatus !== 'All',
    reviewer !== 'All Reviewers',
    campaign !== 'All Campaigns',
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by applicant name, business, location..."
            className="input-field pl-9 py-2 text-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn-secondary text-sm py-2 ${filtersOpen ? 'bg-muted' : ''}`}
        >
          <Filter size={13} />
          Filters
          {activeFilters > 0 && (
            <span className="ml-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-2xs font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>

        <button onClick={onExport} className="btn-secondary text-sm py-2">
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {filtersOpen && (
        <div className="card-elevated p-4 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label-field text-xs">Application Status</label>
              <select 
                value={appStatus} 
                onChange={e => setAppStatus(e.target.value)} 
                className="input-field text-sm py-2"
              >
                {appStatuses.map(s => <option key={`app-status-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">Assigned Reviewer</label>
              <select 
                value={reviewer} 
                onChange={e => setReviewer(e.target.value)} 
                className="input-field text-sm py-2"
              >
                {reviewers.map(r => <option key={`rev-${r}`} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">Campaign Source</label>
              <select 
                value={campaign} 
                onChange={e => setCampaign(e.target.value)} 
                className="input-field text-sm py-2"
              >
                <option value="All Campaigns">All Campaigns</option>
                {availableCampaigns.map(c => <option key={`camp-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">Filter Shortcut</label>
              <button 
                type="button"
                onClick={() => { setAppStatus('Human Review'); }} 
                className="w-full text-left input-field text-xs py-2 text-primary font-semibold hover:bg-muted"
              >
                Show Pending Human Review
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button 
              onClick={() => { setAppStatus('All'); setReviewer('All Reviewers'); setCampaign('All Campaigns'); }} 
              className="btn-ghost text-sm text-muted-foreground"
            >
              Clear all
            </button>
            <button onClick={() => setFiltersOpen(false)} className="btn-primary text-sm py-1.5">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}