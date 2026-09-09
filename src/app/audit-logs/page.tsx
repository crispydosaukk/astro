'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { ScrollText, Search, ChevronDown, Eye } from 'lucide-react';

interface AuditEntry {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  details?: string;
  category: 'auth' | 'candidate' | 'discovery' | 'outreach' | 'application' | 'review' | 'settings' | 'system';
}

const auditLogs: AuditEntry[] = [];

const categoryColor: Record<string, string> = {
  auth: 'bg-slate-100 text-slate-600',
  candidate: 'bg-blue-100 text-blue-700',
  discovery: 'bg-purple-100 text-purple-700',
  outreach: 'bg-amber-100 text-amber-700',
  application: 'bg-orange-100 text-orange-700',
  review: 'bg-green-100 text-green-700',
  settings: 'bg-red-100 text-red-700',
  system: 'bg-gray-100 text-gray-600',
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = auditLogs.filter(log => {
    const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || log.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ScrollText size={28} className="text-primary" /> Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">Complete audit trail of all platform actions and changes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Entries', value: auditLogs.length },
            { label: 'Today', value: auditLogs.filter(l => l.timestamp.startsWith('2026-08-17')).length },
            { label: 'Unique Users', value: [...new Set(auditLogs.map(l => l.user))].length },
            { label: 'Categories', value: [...new Set(auditLogs.map(l => l.category))].length },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search audit logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="candidate">Candidate</option>
              <option value="discovery">Discovery</option>
              <option value="outreach">Outreach</option>
              <option value="review">Review</option>
              <option value="settings">Settings</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">IP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <ScrollText size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                      <p className="font-semibold text-sm">No audit logs recorded</p>
                      <p className="text-xs">All user actions and pipeline events will be recorded here.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(log => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{log.timestamp}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{log.user}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono font-medium text-foreground">{log.action}</p>
                      {log.details && <p className="text-xs text-muted-foreground mt-0.5 max-w-[250px] truncate">{log.details}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-foreground">{log.entity}</p>
                      <p className="text-xs font-mono text-muted-foreground">{log.entityId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${categoryColor[log.category]}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.ipAddress}</td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded hover:bg-muted"><Eye size={13} /></button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
