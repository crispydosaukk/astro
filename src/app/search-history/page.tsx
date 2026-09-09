'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { ScrollText, Search, ChevronDown, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { 
  SearchRecord, 
  initialSearchHistory, 
  subscribeToSearchHistory 
} from '@/lib/firebase/discoveryService';

const statusConfig = {
  success: { label: 'Success', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={11} /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: <XCircle size={11} /> },
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700', icon: <Clock size={11} /> },
};

export default function SearchHistoryPage() {
  const [history, setHistory] = useState<SearchRecord[]>(initialSearchHistory);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToSearchHistory(
        (liveRecords) => {
          if (liveRecords && liveRecords.length > 0) {
            setHistory(liveRecords);
            setIsLive(true);
          }
        },
        (err) => {
          console.warn('Search history subscription fallback:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Search history setup fallback:', e);
    }
  }, []);

  const filtered = history.filter(h => {
    const matchSearch = h.query.toLowerCase().includes(search.toLowerCase()) || h.campaign.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalResults = history.reduce((a, h) => a + h.resultsFound, 0);
  const totalExtracted = history.reduce((a, h) => a + h.candidatesExtracted, 0);
  const successCount = history.filter(h => h.status === 'success').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ScrollText size={28} className="text-primary" /> Search History
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span>Complete log of all discovery queries executed via Google Places & Web Search</span>
              {isLive && (
                <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Live Sync
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Queries Executed', value: history.length },
            { label: 'Successful Searches', value: successCount },
            { label: 'Results Found', value: totalResults.toLocaleString() },
            { label: 'Astrologers Extracted', value: totalExtracted },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search queries or campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="table-header-cell">Query</th>
                  <th className="table-header-cell">Source</th>
                  <th className="table-header-cell">Campaign</th>
                  <th className="table-header-cell text-right">Results</th>
                  <th className="table-header-cell text-right">Extracted</th>
                  <th className="table-header-cell">Duration</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Executed At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => {
                  const cfg = statusConfig[h.status] || statusConfig.success;
                  return (
                    <tr key={h.id} className="table-row">
                      <td className="table-cell">
                        <span className="font-mono text-xs font-semibold text-foreground">{h.query}</span>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                          {h.source}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-foreground font-medium">{h.campaign}</span>
                      </td>
                      <td className="table-cell text-right">
                        <span className="font-bold tabular-nums text-sm text-blue-700">{h.resultsFound}</span>
                      </td>
                      <td className="table-cell text-right">
                        <span className="font-bold tabular-nums text-sm text-green-700">{h.candidatesExtracted}</span>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-muted-foreground tabular-nums">{h.duration}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs text-muted-foreground tabular-nums">{h.executedAt}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
