'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Plus, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

const statusOptions = ['All', 'Discovered', 'AI Qualified', 'Ready for Outreach', 'Contacted', 'Applied', 'Screening', 'Human Review', 'Probation', 'Verified', 'Rejected'];
const specialisations = ['All', 'Vedic Jyotish', 'KP System', 'Nadi Astrology', 'Numerology', 'Vastu Shastra', 'Prashna', 'Muhurtha'];
const sources = ['All', 'Google Places', 'Web Search', 'Referral', 'Directory'];
const scoreRanges = ['All', '90–100', '80–89', '70–79', '60–69', 'Below 60'];

export default function CandidateTableHeader() {
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [status, setStatus] = useState('All');
  const [spec, setSpec] = useState('All');
  const [source, setSource] = useState('All');
  const [scoreRange, setScoreRange] = useState('All');

  const activeFilters = [status, spec, source, scoreRange]?.filter(f => f !== 'All')?.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e?.target?.value)}
            placeholder="Search by name, location, email, phone, candidate ID…"
            className="input-field pl-9 py-2 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`btn-secondary text-sm py-2 relative ${filtersOpen ? 'bg-muted' : ''}`}
        >
          <Filter size={13} />
          Filters
          {activeFilters > 0 && (
            <span className="ml-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-2xs font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>

        <button className="btn-secondary text-sm py-2">
          <SlidersHorizontal size={13} />
          Columns
        </button>

        <button className="btn-secondary text-sm py-2">
          <Download size={13} />
          Export CSV
        </button>

        <Link href="/discovery-campaign-management" className="btn-primary text-sm py-2">
          <Plus size={13} />
          Add Candidate
        </Link>
      </div>
      {/* Filter panel */}
      {filtersOpen && (
        <div className="card-elevated p-4 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label-field text-xs">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e?.target?.value)}
                className="input-field text-sm py-2"
              >
                {statusOptions?.map(s => (
                  <option key={`status-opt-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">Specialisation</label>
              <select
                value={spec}
                onChange={e => setSpec(e?.target?.value)}
                className="input-field text-sm py-2"
              >
                {specialisations?.map(s => (
                  <option key={`spec-opt-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">Discovery Source</label>
              <select
                value={source}
                onChange={e => setSource(e?.target?.value)}
                className="input-field text-sm py-2"
              >
                {sources?.map(s => (
                  <option key={`src-opt-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">AI Score Range</label>
              <select
                value={scoreRange}
                onChange={e => setScoreRange(e?.target?.value)}
                className="input-field text-sm py-2"
              >
                {scoreRanges?.map(s => (
                  <option key={`score-opt-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button
              onClick={() => { setStatus('All'); setSpec('All'); setSource('All'); setScoreRange('All'); }}
              className="btn-ghost text-sm text-muted-foreground"
            >
              Clear all filters
            </button>
            <button onClick={() => setFiltersOpen(false)} className="btn-primary text-sm py-1.5">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}