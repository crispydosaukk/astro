'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 0, consultations: 0, premium: 0 },
  { month: 'Feb', revenue: 0, consultations: 0, premium: 0 },
  { month: 'Mar', revenue: 0, consultations: 0, premium: 0 },
  { month: 'Apr', revenue: 0, consultations: 0, premium: 0 },
  { month: 'May', revenue: 0, consultations: 0, premium: 0 },
  { month: 'Jun', revenue: 0, consultations: 0, premium: 0 },
  { month: 'Jul', revenue: 0, consultations: 0, premium: 0 },
];

const userGrowthData = [
  { week: 'W1 May', users: 0, premium: 0 },
  { week: 'W2 May', users: 0, premium: 0 },
  { week: 'W3 May', users: 0, premium: 0 },
  { week: 'W4 May', users: 0, premium: 0 },
  { week: 'W1 Jun', users: 0, premium: 0 },
  { week: 'W2 Jun', users: 0, premium: 0 },
  { week: 'W3 Jun', users: 0, premium: 0 },
  { week: 'W4 Jun', users: 0, premium: 0 },
];

const consultationTypeData = [
  { name: 'Video Call', value: 0, color: 'var(--secondary)' },
  { name: 'Phone Call', value: 0, color: 'var(--accent)' },
  { name: 'AI Report', value: 0, color: '#10b981' },
];

const aiReportData = [
  { day: 'Mon', gemstone: 0, mantra: 0, yantra: 0, muhurtham: 0 },
  { day: 'Tue', gemstone: 0, mantra: 0, yantra: 0, muhurtham: 0 },
  { day: 'Wed', gemstone: 0, mantra: 0, yantra: 0, muhurtham: 0 },
  { day: 'Thu', gemstone: 0, mantra: 0, yantra: 0, muhurtham: 0 },
  { day: 'Fri', gemstone: 0, mantra: 0, yantra: 0, muhurtham: 0 },
  { day: 'Sat', gemstone: 0, mantra: 0, yantra: 0, muhurtham: 0 },
  { day: 'Sun', gemstone: 0, mantra: 0, yantra: 0, muhurtham: 0 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={`tooltip-entry-${i}`} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground tabular-nums">
              {typeof entry.value === 'number' && entry.value > 100000
                ? `₹${(entry.value / 100000).toFixed(1)}L`
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminChartsInner() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Revenue chart */}
      <div className="xl:col-span-2 glass-card-light dark:glass-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">Monthly Revenue & Consultations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Jan – Jul 2026</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'var(--secondary)' }} /> Revenue</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent)' }} /> Consultations</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="Revenue" />
            <Bar dataKey="consultations" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Consultations" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Consultation types */}
      <div className="glass-card-light dark:glass-card rounded-2xl border border-border p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-foreground">Consultation Types</h3>
          <p className="text-xs text-muted-foreground mt-0.5">July 2026 breakdown</p>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={consultationTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
              {consultationTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-2">
          {consultationTypeData.map((item) => (
            <div key={`pie-legend-${item.name}`} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
              <span className="font-semibold text-foreground tabular-nums">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* User growth */}
      <div className="xl:col-span-2 glass-card-light dark:glass-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">User Growth</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Total vs Premium — May–Jul 2026</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={userGrowthData}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="users" stroke="var(--secondary)" fill="url(#gradTotal)" strokeWidth={2} name="Total Users" />
            <Area type="monotone" dataKey="premium" stroke="var(--accent)" fill="url(#gradPremium)" strokeWidth={2} name="Premium" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Reports by type */}
      <div className="glass-card-light dark:glass-card rounded-2xl border border-border p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-foreground">AI Reports This Week</h3>
          <p className="text-xs text-muted-foreground mt-0.5">By report type</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={aiReportData} layout="vertical" barSize={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="gemstone" fill="var(--accent)" radius={[0, 4, 4, 0]} name="Gemstone" />
            <Bar dataKey="mantra" fill="var(--secondary)" radius={[0, 4, 4, 0]} name="Mantra" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}