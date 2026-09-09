'use client';

import React from 'react';
import { MapPin, Target, Zap, TrendingUp, Play, Loader2, Pause, CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { useDiscovery } from '../DiscoveryContext';

export default function CampaignCards() {
  const { campaigns, runCampaign, isExecuting, pauseCampaign, resumeCampaign } = useDiscovery();

  // Show running or top 3 campaigns
  const activeCampaigns = campaigns.slice(0, 3);

  if (activeCampaigns.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      {activeCampaigns.map(c => (
        <div key={c.id} className="card-elevated p-5 hover:shadow-card-hover transition-all duration-150 relative group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="font-bold text-md text-foreground leading-snug">{c.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin size={11} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{c.location}</span>
              </div>
            </div>
            <StatusBadge status={c.status} size="sm" />
          </div>

          <div className="flex items-center justify-between gap-1.5 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                {c.specialisation}
              </span>
              <span className="text-xs text-muted-foreground">Min score: {c.minScore}</span>
            </div>

            {c.status === 'completed' ? (
              <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={11} /> Target Reached
              </span>
            ) : c.status === 'paused' ? (
              <button
                onClick={() => resumeCampaign(c.id)}
                disabled={isExecuting}
                className="text-2xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                title={`Resume discovering up to target ${c.target}`}
              >
                <Play size={10} /> Resume ({c.discovered}/{c.target})
              </button>
            ) : isExecuting && c.status === 'running' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <Loader2 size={10} className="animate-spin" /> Discovering...
                </span>
                <button
                  onClick={() => pauseCampaign(c.id)}
                  className="text-2xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md transition-colors"
                  title="Pause discovery"
                >
                  <Pause size={9} /> Pause
                </button>
              </div>
            ) : (
              <button
                onClick={() => runCampaign(c)}
                disabled={isExecuting}
                className="text-2xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                title={`Continuously discover until target of ${c.target} is reached`}
              >
                <Play size={10} /> {c.discovered > 0 ? `Continue to ${c.target}` : `Run to Target (${c.target})`}
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">Discovery Progress</span>
              <span className="text-xs font-bold tabular-nums text-foreground">{c.discovered}/{c.target} ({c.progress}%)</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill transition-all duration-500" 
                style={{ width: `${Math.max(4, Math.min(100, c.progress))}%` }} 
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            <div className="text-center">
              <p className="text-xl font-bold tabular-nums text-foreground">{c.target}</p>
              <p className="text-2xs text-muted-foreground font-medium flex items-center justify-center gap-0.5">
                <Target size={9} /> Target
              </p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xl font-bold tabular-nums text-blue-700">{c.discovered}</p>
              <p className="text-2xs text-muted-foreground font-medium flex items-center justify-center gap-0.5">
                <Zap size={9} /> Found
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold tabular-nums text-green-700">{c.qualified}</p>
              <p className="text-2xs text-muted-foreground font-medium flex items-center justify-center gap-0.5">
                <TrendingUp size={9} /> Qualified
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}