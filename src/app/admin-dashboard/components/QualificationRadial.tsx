'use client';

import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Tooltip } from 'recharts';
import { useDashboard } from '../DashboardContext';

export default function QualificationRadial() {
  const { stats } = useDashboard();

  const dynamicRadialData = [
    { id: 'radial-qual', name: 'Qualification Rate', value: stats.qualificationRate, fill: 'var(--status-qualified)' },
    { id: 'radial-outreach', name: 'Outreach Delivery', value: stats.outreachDeliveryRate, fill: 'var(--status-outreach)' },
    { id: 'radial-verify', name: 'Verification Yield', value: stats.verificationRate, fill: 'var(--status-verified)' },
  ];

  return (
    <div className="card-elevated p-5">
      <h3 className="text-md font-bold text-foreground mb-1">Funnel Conversion Rates</h3>
      <div className="flex items-center gap-4">
        <div style={{ width: 110, height: 110 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={dynamicRadialData} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={3} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="card-elevated px-2.5 py-2 shadow-modal text-xs">
                      <p className="font-semibold">{payload?.[0]?.payload?.name}</p>
                      <p className="text-primary font-bold tabular-nums">{payload?.[0]?.value}%</p>
                    </div>
                  );
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 flex-1">
          {dynamicRadialData.map(d => (
            <div key={d.id} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-xs text-muted-foreground">{d.name}</span>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: d.fill }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}