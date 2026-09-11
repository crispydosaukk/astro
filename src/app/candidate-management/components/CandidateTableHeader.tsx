'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Plus, SlidersHorizontal, X, Check } from 'lucide-react';

const statusOptions = ['All', 'Discovered', 'AI Qualified', 'Ready for Outreach', 'Contacted', 'Applied', 'Screening', 'Human Review', 'Probation', 'Verified'];
const specialisations = ['All', 'Vedic Jyotish', 'KP System', 'Nadi Astrology', 'Numerology', 'Vastu Shastra', 'Prashna', 'Muhurtha', 'Lal Kitab', 'Gemology', 'Palmistry'];
const sources = ['All', 'Google Places', 'Manual Entry', 'Web Search', 'CSV Upload', 'Referral', 'Directory'];
const scoreRanges = ['All', '90–100', '80–89', '70–79', '60–69', 'Below 60'];

export interface ColumnVisibility {
  contact: boolean;
  specialisations: boolean;
  rating: boolean;
  experience: boolean;
  source: boolean;
  outreach: boolean;
  lifecycle: boolean;
  discovered: boolean;
}

interface CandidateTableHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  spec: string;
  onSpecChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  scoreRange: string;
  onScoreRangeChange: (value: string) => void;
  onExportCsv: () => void;
  onAddCandidateClick: () => void;
  columns?: ColumnVisibility;
  onToggleColumn?: (key: keyof ColumnVisibility) => void;
}

export default function CandidateTableHeader({
  search,
  onSearchChange,
  status,
  onStatusChange,
  spec,
  onSpecChange,
  source,
  onSourceChange,
  scoreRange,
  onScoreRangeChange,
  onExportCsv,
  onAddCandidateClick,
  columns,
  onToggleColumn
}: CandidateTableHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);

  const activeFilters = [status, spec, source, scoreRange].filter(f => f !== 'All').length;

  const columnLabels: { key: keyof ColumnVisibility; label: string }[] = [
    { key: 'contact', label: 'Contact Info' },
    { key: 'specialisations', label: 'Specialisations' },
    { key: 'rating', label: 'Rating & Reviews' },
    { key: 'experience', label: 'Experience' },
    { key: 'source', label: 'Discovery Source' },
    { key: 'outreach', label: 'Outreach Status' },
    { key: 'lifecycle', label: 'Lifecycle Stage' },
    { key: 'discovered', label: 'Discovered Date' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search by name, location, email, phone, business, ID…"
            style={{ paddingLeft: '2.25rem' }}
            className="input-field py-2 text-sm"
          />
          {search && (
            <button 
              onClick={() => onSearchChange('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => { setFiltersOpen(!filtersOpen); setColumnsOpen(false); }}
          className={`btn-secondary text-sm py-2 relative ${filtersOpen ? 'bg-muted ring-1 ring-primary/30' : ''}`}
        >
          <Filter size={13} />
          Filters
          {activeFilters > 0 && (
            <span className="ml-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-2xs font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>

        {/* Columns Toggle */}
        <div className="relative">
          <button 
            onClick={() => { setColumnsOpen(!columnsOpen); setFiltersOpen(false); }}
            className={`btn-secondary text-sm py-2 ${columnsOpen ? 'bg-muted ring-1 ring-primary/30' : ''}`}
          >
            <SlidersHorizontal size={13} />
            Columns
          </button>

          {columnsOpen && columns && onToggleColumn && (
            <div className="absolute right-0 top-full mt-1.5 w-52 card-elevated p-3 z-30 shadow-xl space-y-2 animate-slide-up text-xs">
              <div className="font-semibold text-foreground pb-1 border-b border-border flex items-center justify-between">
                <span>Toggle Columns</span>
                <button onClick={() => setColumnsOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={13} />
                </button>
              </div>
              <div className="space-y-1.5">
                {columnLabels.map(({ key, label }) => (
                  <label 
                    key={key} 
                    className="flex items-center justify-between p-1 hover:bg-muted/50 rounded cursor-pointer select-none"
                  >
                    <span className="text-muted-foreground hover:text-foreground">{label}</span>
                    <input 
                      type="checkbox" 
                      checked={columns[key]} 
                      onChange={() => onToggleColumn(key)}
                      className="accent-primary rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export CSV */}
        <button 
          onClick={onExportCsv}
          className="btn-secondary text-sm py-2"
          title="Export filtered candidates to CSV"
        >
          <Download size={13} />
          Export CSV
        </button>

        {/* Add Candidate Button */}
        <button 
          onClick={onAddCandidateClick}
          className="btn-primary text-sm py-2 shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
          title="Manually add a new candidate"
        >
          <Plus size={14} />
          Add Candidate
        </button>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="card-elevated p-4 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label-field text-xs">Status / Lifecycle</label>
              <select
                value={status}
                onChange={e => onStatusChange(e.target.value)}
                className="input-field text-sm py-2"
              >
                {statusOptions.map(s => (
                  <option key={`status-opt-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">Specialisation</label>
              <select
                value={spec}
                onChange={e => onSpecChange(e.target.value)}
                className="input-field text-sm py-2"
              >
                {specialisations.map(s => (
                  <option key={`spec-opt-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">Discovery Source</label>
              <select
                value={source}
                onChange={e => onSourceChange(e.target.value)}
                className="input-field text-sm py-2"
              >
                {sources.map(s => (
                  <option key={`src-opt-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field text-xs">AI Score Range</label>
              <select
                value={scoreRange}
                onChange={e => onScoreRangeChange(e.target.value)}
                className="input-field text-sm py-2"
              >
                {scoreRanges.map(s => (
                  <option key={`score-opt-${s}`} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button
              onClick={() => { 
                onStatusChange('All'); 
                onSpecChange('All'); 
                onSourceChange('All'); 
                onScoreRangeChange('All'); 
              }}
              className="btn-ghost text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all filters
            </button>
            <button onClick={() => setFiltersOpen(false)} className="btn-primary text-sm py-1.5 px-4">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}