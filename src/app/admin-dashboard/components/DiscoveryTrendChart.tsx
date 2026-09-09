'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useDashboard } from '../DashboardContext';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="card-elevated px-3.5 py-3 shadow-modal min-w-[140px]">
      <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">{label}</p>
      {payload.map(entry => (
        <div key={`tt-${entry.name}`} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-sm text-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </span>
          <span className="font-bold text-sm tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DiscoveryTrendChart() {
  const { trendData } = useDashboard();

  return (
    <div className="card-elevated p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Discovery Trends</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live progression of discovered vs qualified vs verified</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { id: 'leg-disc', color: 'var(--status-discovered)', label: 'Discovered' },
            { id: 'leg-qual', color: 'var(--status-qualified)', label: 'Qualified' },
            { id: 'leg-ver', color: 'var(--status-verified)', label: 'Verified' },
          ].map(l => (
            <div key={l.id} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-xs text-muted-foreground font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradDiscovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--status-discovered)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--status-discovered)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradQualified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--status-qualified)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--status-qualified)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradVerified" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--status-verified)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--status-verified)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="discovered" name="Discovered" stroke="var(--status-discovered)" strokeWidth={2} fill="url(#gradDiscovered)" />
            <Area type="monotone" dataKey="qualified" name="Qualified" stroke="var(--status-qualified)" strokeWidth={2} fill="url(#gradQualified)" />
            <Area type="monotone" dataKey="verified" name="Verified" stroke="var(--status-verified)" strokeWidth={2} fill="url(#gradVerified)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}