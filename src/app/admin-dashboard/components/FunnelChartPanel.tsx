'use client';

import React from 'react';
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
} from 'recharts';
import { useDashboard } from '../DashboardContext';

interface TooltipPayload {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TooltipPayload }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card-elevated px-3 py-2.5 shadow-modal">
      <p className="font-semibold text-sm text-foreground">{d.name}</p>
      <p className="text-xl font-bold tabular-nums text-primary mt-0.5">{d.value.toLocaleString()}</p>
    </div>
  );
}

export default function FunnelChartPanel() {
  const { funnelData, stats } = useDashboard();

  return (
    <div className="card-elevated p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Candidate Pipeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live lifecycle funnel — real-time stages</p>
        </div>
        <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-semibold">
          {stats.overallConversionRate}% verified conversion
        </span>
      </div>

      <div style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip content={<CustomTooltip />} />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
            >
              <LabelList
                position="right"
                fill="var(--foreground)"
                stroke="none"
                dataKey="name"
                style={{ fontSize: 11, fontWeight: 600 }}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}