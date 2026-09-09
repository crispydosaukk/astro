'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useDashboard } from '../DashboardContext';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="card-elevated px-3 py-2.5 shadow-modal">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="font-bold text-md text-primary tabular-nums">{payload[0].value} candidates</p>
    </div>
  );
}

export default function SpecialisationChart() {
  const { specialisationData } = useDashboard();

  return (
    <div className="card-elevated p-5">
      <h3 className="text-md font-bold text-foreground mb-3">Candidates by Specialisation</h3>
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={specialisationData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="spec" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="var(--primary)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}