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

const chartCases: ChartCase[] = [
  { id: 'CC-001', title: 'Natal Chart Analysis – Career Path', category: 'Vedic Jyotish', difficulty: 'Medium', maxScore: 20, description: 'Analyse the provided natal chart and identify key career indicators, planetary positions affecting profession, and timing of career changes.', expectedAreas: ['10th house analysis', 'Saturn placement', 'Jupiter influence', 'Dasha periods', 'Career timing'], attemptsCount: 18, avgScore: 14.2, status: 'active' },
  { id: 'CC-002', title: 'Marriage Timing Prediction', category: 'Vedic Jyotish', difficulty: 'Hard', maxScore: 20, description: 'Using the provided birth chart, predict marriage timing, spouse characteristics, and marital compatibility indicators.', expectedAreas: ['7th house', 'Venus placement', 'Jupiter for females', 'Navamsa chart', 'Dasha analysis'], attemptsCount: 18, avgScore: 12.8, status: 'active' },
  { id: 'CC-003', title: 'Health Analysis from Birth Chart', category: 'Medical Astrology', difficulty: 'Hard', maxScore: 20, description: 'Identify potential health vulnerabilities, timing of health challenges, and protective factors from the provided chart.', expectedAreas: ['1st house', '6th house', '8th house', 'Ascendant lord', 'Malefic influences'], attemptsCount: 18, avgScore: 11.5, status: 'active' },
  { id: 'CC-004', title: 'Prashna Chart Interpretation', category: 'Prashna Jyotish', difficulty: 'Medium', maxScore: 20, description: 'Interpret the provided Prashna (horary) chart to answer the specific question posed by the querent.', expectedAreas: ['Ascendant', 'Moon placement', 'Significators', 'Aspects', 'Answer determination'], attemptsCount: 18, avgScore: 15.1, status: 'active' },
  { id: 'CC-005', title: 'Muhurtha Selection', category: 'Muhurtha', difficulty: 'Easy', maxScore: 20, description: 'Select an auspicious muhurtha for a business inauguration from the provided time window, explaining your selection criteria.', expectedAreas: ['Tithi', 'Nakshatra', 'Vara', 'Lagna', 'Avoiding inauspicious periods'], attemptsCount: 18, avgScore: 16.3, status: 'active' },
];

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
            <p className="text-muted-foreground mt-1">5 astrological chart case assessments for applicant evaluation</p>
          </div>
          <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={14} /> Add Case
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Cases', value: chartCases.length },
            { label: 'Total Attempts', value: chartCases[0]?.attemptsCount || 0 },
            { label: 'Avg Score', value: `${(chartCases.reduce((a, c) => a + c.avgScore, 0) / chartCases.length).toFixed(1)}/20` },
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
          {filtered.map((c, idx) => (
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
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
