'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, Plus, SlidersHorizontal, X, MessageCircle, Mail, Phone, Users, CheckCircle2, Send, ChevronDown, GitBranch, MapPin } from 'lucide-react';

const statusOptions = ['All', 'Discovered', 'AI Qualified', 'Ready for Outreach', 'Contacted', 'Applied', 'Screening', 'Human Review', 'Probation', 'Verified'];
const specialisations = ['All', 'Vedic Jyotish', 'KP System', 'Nadi Astrology', 'Numerology', 'Vastu Shastra', 'Prashna', 'Muhurtha', 'Lal Kitab', 'Gemology', 'Palmistry'];
const sources = ['All', 'Google Places', 'YouTube', 'LinkedIn', 'Instagram', 'Manual Entry', 'Web Search', 'CSV Upload', 'Referral', 'Directory'];
const scoreRanges = ['All', '90–100', '80–89', '70–79', '60–69', 'Below 60'];
const channelFilterOptions = [
  { value: 'all', label: 'All Channels' },
  { value: 'only-whatsapp', label: '🟢 Only WhatsApp (Phone, No Email)' },
  { value: 'only-email', label: '📧 Only Email (No Phone)' },
  { value: 'only-sms', label: '📱 Only SMS (Has Phone)' },
  { value: 'multi-channel', label: '⚡ Multi-Channel (Both Phone & Email)' },
  { value: 'need-whatsapp', label: '💬 Need WhatsApp Outreach' },
  { value: 'need-email', label: '📧 Need Email Outreach' },
  { value: 'whatsapp-sent', label: '✅ WhatsApp Sent' },
  { value: 'email-sent', label: '✅ Email Sent' },
  { value: 'sms-sent', label: '✅ SMS Sent' },
  { value: 'phone-only', label: '📱 Phone Only (No Email)' },
  { value: 'both', label: '✨ Both Phone & Email' },
];

export interface ColumnVisibility {
  contact?: boolean;
  phone: boolean;
  email: boolean;
  location: boolean;
  website: boolean;
  specialisations: boolean;
  rating: boolean;
  experience: boolean;
  source: boolean;
  outreach: boolean;
  lifecycle: boolean;
  discovered: boolean;
}

export interface OutreachCounts {
  total: number;
  needWhatsapp: number;
  needEmail: number;
  whatsappSent: number;
  emailSent: number;
  phoneOnly: number;
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
  channelFilter: string;
  onChannelFilterChange: (value: string) => void;
  campaign?: string;
  onCampaignChange?: (value: string) => void;
  campaignOptions?: string[];
  location?: string;
  onLocationChange?: (value: string) => void;
  locationOptions?: string[];
  counts?: OutreachCounts;
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
  channelFilter,
  onChannelFilterChange,
  campaign = 'All',
  onCampaignChange,
  campaignOptions = [],
  location = 'All',
  onLocationChange,
  locationOptions = [],
  counts,
  onExportCsv,
  onAddCandidateClick,
  columns,
  onToggleColumn
}: CandidateTableHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);

  const activeFilters = [
    status !== 'All',
    spec !== 'All',
    source !== 'All',
    scoreRange !== 'All',
    channelFilter !== 'all',
    campaign !== 'All',
    location !== 'All'
  ].filter(Boolean).length;

  const columnLabels: { key: keyof ColumnVisibility; label: string }[] = [
    { key: 'phone', label: 'Contact Number' },
    { key: 'email', label: 'Email Address' },
    { key: 'location', label: 'Location' },
    { key: 'specialisations', label: 'Specialisations' },
    { key: 'rating', label: 'Rating & Reviews' },
    { key: 'experience', label: 'Experience' },
    { key: 'source', label: 'Discovery Source' },
    { key: 'outreach', label: 'Outreach Status' },
    { key: 'lifecycle', label: 'Lifecycle Stage' },
    { key: 'discovered', label: 'Discovered Date' },
    { key: 'website', label: 'Website Link' },
  ];

  return (
    <div className="space-y-3">
      {/* Top Action Row */}
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

        {/* Campaign Filter Dropdown */}
        {onCampaignChange && (
          <div className="relative min-w-[190px]">
            <select
              value={campaign}
              onChange={e => onCampaignChange(e.target.value)}
              className={`w-full appearance-none pl-8 pr-8 py-2 text-sm border rounded-lg font-semibold transition-all cursor-pointer shadow-2xs ${
                campaign !== 'All'
                  ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary/30'
                  : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
              }`}
              title="Filter candidates by discovery campaign"
            >
              <option value="All">All Campaigns ({campaignOptions.length})</option>
              {campaignOptions.map(camp => (
                <option key={`quick-camp-${camp}`} value={camp}>
                  🎯 {camp}
                </option>
              ))}
            </select>
            <GitBranch size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${campaign !== 'All' ? 'text-primary' : 'text-slate-500'}`} />
            <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${campaign !== 'All' ? 'text-primary' : 'text-slate-600'}`} />
          </div>
        )}

        {/* Location Filter Dropdown */}
        {onLocationChange && (
          <div className="relative min-w-[170px]">
            <select
              value={location}
              onChange={e => onLocationChange(e.target.value)}
              className={`w-full appearance-none pl-8 pr-8 py-2 text-sm border rounded-lg font-semibold transition-all cursor-pointer shadow-2xs ${
                location !== 'All'
                  ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary/30'
                  : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
              }`}
              title="Filter candidates by location"
            >
              <option value="All">All Locations ({locationOptions.length})</option>
              {locationOptions.map(loc => (
                <option key={`quick-loc-${loc}`} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>
            <MapPin size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${location !== 'All' ? 'text-primary' : 'text-slate-500'}`} />
            <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${location !== 'All' ? 'text-primary' : 'text-slate-600'}`} />
          </div>
        )}

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

      {/* Quick Filter Metric Chips (Channel & Outreach Status) */}
      {counts && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => onChannelFilterChange('all')}
            className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
              channelFilter === 'all'
                ? 'bg-foreground text-background border-foreground shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            <Users size={12} />
            <span>All Pipeline ({counts.total})</span>
          </button>

          <button
            onClick={() => onChannelFilterChange('need-whatsapp')}
            className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
              channelFilter === 'need-whatsapp'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Candidates with verified phone numbers waiting for WhatsApp invitation"
          >
            <MessageCircle size={12} />
            <span>Need WhatsApp ({counts.needWhatsapp})</span>
          </button>

          <button
            onClick={() => onChannelFilterChange('need-email')}
            className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
              channelFilter === 'need-email'
                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
            }`}
            title="Candidates with listed email addresses waiting for email outreach"
          >
            <Mail size={12} />
            <span>Need Email ({counts.needEmail})</span>
          </button>

          <button
            onClick={() => onChannelFilterChange('whatsapp-sent')}
            className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
              channelFilter === 'whatsapp-sent'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-card text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50'
            }`}
            title="Candidates already contacted via WhatsApp"
          >
            <CheckCircle2 size={12} />
            <span>WhatsApp Sent ({counts.whatsappSent})</span>
          </button>

          <button
            onClick={() => onChannelFilterChange('email-sent')}
            className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
              channelFilter === 'email-sent'
                ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                : 'bg-card text-violet-700 dark:text-violet-400 border-violet-500/30 hover:bg-violet-50'
            }`}
            title="Candidates already dispatched via Gmail SMTP"
          >
            <Send size={12} />
            <span>Email Sent ({counts.emailSent})</span>
          </button>

          <button
            onClick={() => onChannelFilterChange('phone-only')}
            className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border transition-all whitespace-nowrap cursor-pointer ${
              channelFilter === 'phone-only'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-card text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-50'
            }`}
            title="Candidates who only have phone listed (no email)"
          >
            <Phone size={12} />
            <span>Phone Only ({counts.phoneOnly})</span>
          </button>
        </div>
      )}

      {/* Expanded Filter Panel */}
      {filtersOpen && (
        <div className="card-elevated p-4 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
            <div>
              <label className="label-field text-xs font-bold text-slate-800">Discovery Campaign</label>
              <select
                value={campaign}
                onChange={e => onCampaignChange && onCampaignChange(e.target.value)}
                className="input-field text-sm py-2 font-medium"
              >
                <option value="All">All Campaigns</option>
                {campaignOptions.map(camp => (
                  <option key={`panel-camp-${camp}`} value={camp}>{camp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field text-xs font-bold text-slate-800">Location / City</label>
              <select
                value={location}
                onChange={e => onLocationChange && onLocationChange(e.target.value)}
                className="input-field text-sm py-2 font-medium"
              >
                <option value="All">All Locations</option>
                {locationOptions.map(loc => (
                  <option key={`panel-loc-${loc}`} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field text-xs">Outreach Channel</label>
              <select
                value={channelFilter}
                onChange={e => onChannelFilterChange(e.target.value)}
                className="input-field text-sm py-2"
              >
                {channelFilterOptions.map(opt => (
                  <option key={`ch-opt-${opt.value}`} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

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
                onChannelFilterChange('all');
                onCampaignChange && onCampaignChange('All');
                onLocationChange && onLocationChange('All');
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