'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  ScrollText, Search, ChevronDown, Eye, Download, RotateCcw, 
  CheckCircle2, X, Shield, Terminal, Clock, User, Globe
} from 'lucide-react';
import { 
  getAuditLogs, 
  getAuditStats, 
  resetAuditLogs, 
  AUDIT_EVENT_NAME, 
  AuditEntry 
} from '@/lib/auditLogService';

const categoryColor: Record<string, string> = {
  auth: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  candidate: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  discovery: 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
  outreach: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  application: 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300',
  review: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300',
  settings: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300',
  system: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    setLogs(getAuditLogs());

    const handleUpdate = () => {
      setLogs(getAuditLogs());
    };

    window.addEventListener(AUDIT_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(AUDIT_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const stats = getAuditStats(logs);

  const filtered = logs.filter(log => {
    const q = search.toLowerCase();
    const matchSearch = 
      !search ||
      log.user.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q));

    const matchCat = categoryFilter === 'all' || log.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `astroparihar_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    if (window.confirm('Reset audit trail back to initial baseline entries?')) {
      const refreshed = resetAuditLogs();
      setLogs(refreshed);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ScrollText size={28} className="text-primary" /> Audit Logs
            </h1>
            <p className="text-muted-foreground mt-1">
              Immutable audit trail of all platform decisions, review status transitions, and system actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg hover:bg-muted transition text-foreground"
            >
              <Download size={13} /> Export JSON
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg hover:bg-muted transition text-muted-foreground"
              title="Reset to default seed logs"
            >
              <RotateCcw size={13} /> Reset Baseline
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Total Entries</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Today</p>
            <p className="text-2xl font-bold mt-1 text-primary">{stats.today}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Unique Users</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">{stats.uniqueUsers}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Categories</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.categories}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search by user, action, candidate name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories ({logs.length})</option>
              <option value="review">Review</option>
              <option value="application">Application</option>
              <option value="candidate">Candidate</option>
              <option value="outreach">Outreach</option>
              <option value="discovery">Discovery</option>
              <option value="auth">Authentication</option>
              <option value="settings">Settings</option>
              <option value="system">System</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">IP Address</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <ScrollText size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                      <p className="font-semibold text-sm">No audit logs match your search</p>
                      <p className="text-xs">Try adjusting your category filter or search keywords.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">
                        {log.user}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono font-semibold text-foreground">{log.action}</p>
                        {log.details && (
                          <p className="text-2xs text-muted-foreground mt-0.5 max-w-[280px] truncate" title={log.details}>
                            {log.details}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{log.entity}</p>
                        <p className="text-2xs font-mono text-muted-foreground">{log.entityId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-2xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${categoryColor[log.category] || 'bg-muted text-muted-foreground'}`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {log.ipAddress}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setSelectedEntry(log)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Inspect audit log record"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Entry Inspection Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <h3 className="font-bold text-base text-foreground">Audit Record Inspector</h3>
              </div>
              <button 
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground flex items-center gap-1 font-semibold">
                    <Clock size={12} /> Timestamp
                  </span>
                  <p className="font-mono font-bold text-foreground mt-1">{selectedEntry.timestamp}</p>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl border border-border">
                  <span className="text-muted-foreground flex items-center gap-1 font-semibold">
                    <Globe size={12} /> IP Address
                  </span>
                  <p className="font-mono font-bold text-foreground mt-1">{selectedEntry.ipAddress}</p>
                </div>
              </div>

              <div className="p-3.5 bg-muted/30 rounded-xl border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold flex items-center gap-1">
                    <User size={12} /> Responsible Actor
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-2xs font-bold capitalize ${categoryColor[selectedEntry.category]}`}>
                    {selectedEntry.category}
                  </span>
                </div>
                <p className="font-bold text-sm text-foreground">{selectedEntry.user}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Action Performed</label>
                <div className="p-2.5 bg-primary/5 rounded-xl border border-primary/20 text-xs font-mono font-bold text-primary">
                  {selectedEntry.action}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Target Entity</label>
                <div className="p-3 bg-card border border-border rounded-xl text-xs space-y-0.5">
                  <p className="font-semibold text-foreground">{selectedEntry.entity}</p>
                  <p className="font-mono text-muted-foreground text-2xs">ID: {selectedEntry.entityId}</p>
                </div>
              </div>

              {selectedEntry.details && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Recorded Event Details</label>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-foreground leading-relaxed">
                    {selectedEntry.details}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Terminal size={12} /> Raw JSON Payload
                </label>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-2xs font-mono overflow-x-auto max-h-36">
                  {JSON.stringify(selectedEntry, null, 2)}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
