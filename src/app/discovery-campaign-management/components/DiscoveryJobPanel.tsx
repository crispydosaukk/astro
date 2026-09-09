'use client';

import React, { useState } from 'react';
import { Zap, Clock, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Loader2, Sparkles, Play } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { useDiscovery } from '../DiscoveryContext';

export default function DiscoveryJobPanel() {
  const { activeJob, isExecuting, runCampaign, campaigns } = useDiscovery();
  const [queriesExpanded, setQueriesExpanded] = useState(false);
  const [logsExpanded, setLogsExpanded] = useState(true);

  return (
    <div className="space-y-4">
      {/* Active job card */}
      <div className="card-elevated overflow-hidden border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              activeJob.status === 'running' 
                ? 'bg-green-500 animate-pulse' 
                : activeJob.status === 'completed' 
                ? 'bg-blue-500' 
                : 'bg-amber-500'
            }`} />
            <h3 className="font-bold text-md text-foreground">
              {isExecuting ? 'Active Discovery Run' : 'Latest Discovery Run'}
            </h3>
          </div>
          <StatusBadge status={activeJob.status} size="sm" />
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Campaign</p>
            <p className="font-bold text-sm text-foreground">{activeJob.campaign}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/60 rounded-lg p-3 border border-border/50">
              <p className="text-2xs text-muted-foreground font-semibold uppercase tracking-wide">Started</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{activeJob.startTime}</p>
            </div>
            <div className="bg-muted/60 rounded-lg p-3 border border-border/50">
              <p className="text-2xs text-muted-foreground font-semibold uppercase tracking-wide">Elapsed</p>
              <p className="text-xs font-bold text-foreground mt-0.5 tabular-nums flex items-center gap-1">
                {isExecuting && <Loader2 size={11} className="animate-spin text-primary" />}
                {activeJob.elapsed}
              </p>
            </div>
          </div>

          {/* Job stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'js-searched', label: 'Searched', value: activeJob.searched, color: 'text-foreground', icon: <Zap size={12} /> },
              { id: 'js-found', label: 'Discovered', value: activeJob.discovered, color: 'text-blue-700', icon: <CheckCircle2 size={12} /> },
              { id: 'js-qualified', label: 'Qualified', value: activeJob.qualified, color: 'text-green-700', icon: <CheckCircle2 size={12} /> },
              { id: 'js-calls', label: 'API Calls', value: activeJob.apiCalls, color: 'text-purple-700', icon: <Sparkles size={12} /> },
            ].map(s => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                  {s.icon}
                  <span className="text-2xs font-semibold">{s.label}</span>
                </div>
                <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search Queries dropdown */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setQueriesExpanded(!queriesExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              <span>Executed Search Queries ({activeJob.queries.length})</span>
              {queriesExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {queriesExpanded && (
              <div className="p-3 space-y-1.5 bg-background border-t border-border">
                {activeJob.queries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-2 text-xs font-sans">
                    No search queries executed yet.
                  </p>
                ) : (
                  activeJob.queries.map((q, i) => (
                    <div key={i} className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                      <span className="text-primary font-bold">›</span>
                      <span className="truncate">{q}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Real-time Discovery Logs */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setLogsExpanded(!logsExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Event Stream ({activeJob.logs.length})</span>
              </div>
              {logsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {logsExpanded && (
              <div className="p-3 space-y-2 bg-background border-t border-border max-h-56 overflow-y-auto font-mono text-xs">
                {activeJob.logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-xs font-sans">
                    No active job logs. Launch a campaign to view live events.
                  </p>
                ) : (
                  activeJob.logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-2xs text-muted-foreground flex-shrink-0 mt-0.5">{log.time}</span>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${
                        log.type === 'success' ? 'bg-green-500' :
                        log.type === 'error' ? 'bg-red-500' :
                        log.type === 'warn' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <span className={`flex-1 min-w-0 ${
                        log.type === 'success' ? 'text-green-700 font-medium' :
                        log.type === 'error' ? 'text-red-700' :
                        log.type === 'warn' ? 'text-amber-700' : 'text-foreground'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {!isExecuting && campaigns.length > 0 && (
            <button
              onClick={() => runCampaign(campaigns[0])}
              className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5 rounded-lg font-semibold"
            >
              <Play size={12} />
              Run Discovery Batch on {campaigns[0].name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}