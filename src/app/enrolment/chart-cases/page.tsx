'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart3, Search, Eye, Plus } from 'lucide-react';

interface ChartCase {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxScore: number;
  description: string;
  expectedAreas: string[];
  attemptsCount: number;
  avgScore: number;
  status: 'active' | 'draft';
}

const chartCases: ChartCase[] = [];

const difficultyColor: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
};

export default function ChartCasesPage() {
  const [search, setSearch] = useState('');

  const filtered = chartCases.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 size={28} className="text-primary" /> Chart Cases
            </h1>
            <p className="text-muted-foreground mt-1">Astrological chart case assessments for applicant evaluation</p>
          </div>
          <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={14} /> Add Case
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Cases', value: chartCases.length },
            { label: 'Total Attempts', value: chartCases.length > 0 ? (chartCases[0]?.attemptsCount || 0) : 0 },
            { label: 'Avg Score', value: chartCases.length > 0 ? `${(chartCases.reduce((a, c) => a + c.avgScore, 0) / chartCases.length).toFixed(1)}/20` : '0/20' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search chart cases..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground card-elevated">
              <BarChart3 size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground text-sm">No chart case assessments created yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Click &quot;Add Case&quot; to configure astrological chart evaluation benchmarks.</p>
            </div>
          ) : (
            filtered.map((c, idx) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{c.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[c.difficulty]}`}>{c.difficulty}</span>
                        <span className="text-xs text-muted-foreground">Max: {c.maxScore} pts</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{c.avgScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">avg score</p>
                    </div>
                    <button className="p-1.5 rounded hover:bg-muted"><Eye size={14} /></button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{c.description}</p>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Expected analysis areas:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.expectedAreas.map(area => (
                      <span key={area} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{area}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
