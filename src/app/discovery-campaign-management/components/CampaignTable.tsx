'use client';

import React, { useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Eye, Play, Pause, RotateCcw, MoreHorizontal, MapPin, Trash2, Loader2, X } from 'lucide-react';
import { useDiscovery } from '../DiscoveryContext';
import { Campaign } from '@/lib/firebase/discoveryService';

export default function CampaignTable() {
  const { 
    campaigns, 
    runCampaign, 
    pauseCampaign, 
    resumeCampaign, 
    deleteCampaign, 
    isExecuting 
  } = useDiscovery();
  
  const [actionOpen, setActionOpen] = useState<string | null>(null);
  const [queriesModalCampaign, setQueriesModalCampaign] = useState<Campaign | null>(null);

  return (
    <>
      <div className="card-elevated overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">All Campaigns</h3>
          <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-semibold">
            {campaigns.length} campaigns active
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="table-header-cell">Campaign</th>
                <th className="table-header-cell">Specialisation</th>
                <th className="table-header-cell text-right">Target</th>
                <th className="table-header-cell text-right">Found</th>
                <th className="table-header-cell text-right">Qualified</th>
                <th className="table-header-cell text-right">Dupes</th>
                <th className="table-header-cell">Min Score</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Last Run</th>
                <th className="table-header-cell w-28 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="table-row group hover:bg-muted/30 transition-colors">
                  <td className="table-cell">
                    <p className="font-semibold text-sm text-foreground">{c.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{c.location}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      {c.specialisation}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="font-bold tabular-nums text-sm">{c.target}</span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="font-bold tabular-nums text-sm text-blue-700">{c.discovered}</span>
                  </td>
                  <td className="table-cell text-right">
                    <span className="font-bold tabular-nums text-sm text-green-700">{c.qualified}</span>
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-bold tabular-nums text-sm ${c.duplicates > 0 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                      {c.duplicates}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-bold tabular-nums text-foreground">{c.minScore}</span>
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="table-cell">
                    <span className="text-xs text-muted-foreground tabular-nums">{c.lastRun}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {c.status === 'running' ? (
                        <button 
                          onClick={() => pauseCampaign(c.id)}
                          className="tooltip-label btn-ghost p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                          title="Pause discovery job"
                        >
                          <Pause size={14} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => runCampaign(c)}
                          disabled={isExecuting}
                          className="tooltip-label btn-ghost p-1.5 text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-50" 
                          title="Run live discovery (Google Places + GPT-4o)"
                        >
                          <Play size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => setQueriesModalCampaign(c)}
                        className="btn-ghost p-1.5 text-muted-foreground hover:text-foreground rounded"
                        title="View search queries"
                      >
                        <Eye size={14} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActionOpen(actionOpen === c.id ? null : c.id)}
                          className="btn-ghost p-1.5 text-muted-foreground hover:text-foreground rounded"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {actionOpen === c.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 card-elevated z-20 py-1 shadow-xl animate-slide-up">
                            <button 
                              onClick={() => { runCampaign(c); setActionOpen(null); }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 text-foreground"
                            >
                              <RotateCcw size={13} />
                              Re-run Discovery
                            </button>
                            <button 
                              onClick={() => { setQueriesModalCampaign(c); setActionOpen(null); }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 text-foreground"
                            >
                              <Eye size={13} />
                              View Queries
                            </button>
                            <div className="border-t border-border my-1" />
                            <button 
                              onClick={() => { deleteCampaign(c.id); setActionOpen(null); }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-700"
                            >
                              <Trash2 size={13} />
                              Delete Campaign
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queries Modal */}
      {queriesModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">{queriesModalCampaign.name}</h3>
                <p className="text-xs text-muted-foreground">Discovery search queries & parameters</p>
              </div>
              <button 
                onClick={() => setQueriesModalCampaign(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Location Target:</span>
                <span className="font-medium text-foreground">{queriesModalCampaign.location}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Primary Search Queries:</span>
                <div className="space-y-1.5 bg-muted/40 p-3 rounded-lg border border-border">
                  <p className="text-xs font-mono text-foreground">• {queriesModalCampaign.specialisation} in {queriesModalCampaign.location}</p>
                  <p className="text-xs font-mono text-foreground">• Best {queriesModalCampaign.specialisation} astrologer {queriesModalCampaign.location}</p>
                  <p className="text-xs font-mono text-foreground">• Top certified jyotish practitioner {queriesModalCampaign.location}</p>
                  <p className="text-xs font-mono text-foreground">• Verified astrologer consultation center {queriesModalCampaign.location}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1">Active Sources:</span>
                <div className="flex gap-2">
                  {(queriesModalCampaign.sources || ['Google Places', 'Web Search']).map(s => (
                    <span key={s} className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => {
                  const target = queriesModalCampaign;
                  setQueriesModalCampaign(null);
                  runCampaign(target);
                }}
                disabled={isExecuting}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <Play size={13} />
                Run Discovery Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}