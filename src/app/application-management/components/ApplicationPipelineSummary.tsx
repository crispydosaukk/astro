'use client';

import React from 'react';
import { Candidate } from '@/lib/firebase/candidateService';

interface ApplicationPipelineSummaryProps {
  candidates: Candidate[];
  activeFilter: string;
  onSelectStage: (stage: string) => void;
}

export default function ApplicationPipelineSummary({
  candidates,
  activeFilter,
  onSelectStage,
}: ApplicationPipelineSummaryProps) {
  const started = candidates.filter(c => c.applicationStatus === 'Started' || c.lifecycleStatus === 'applied').length;
  const submitted = candidates.filter(c => c.applicationStatus === 'Submitted' || c.lifecycleStatus === 'submitted').length;
  const screening = candidates.filter(c => c.applicationStatus === 'Under Screening' || c.lifecycleStatus === 'screening').length;
  const assessment = candidates.filter(c => c.applicationStatus === 'Assessment Pending' || c.lifecycleStatus === 'assessment').length;
  const interview = candidates.filter(c => c.applicationStatus === 'Interview Pending' || c.lifecycleStatus === 'interview').length;
  const review = candidates.filter(c => c.applicationStatus === 'Human Review' || c.lifecycleStatus === 'human-review').length;
  const approved = candidates.filter(c => c.applicationStatus === 'Approved' || c.lifecycleStatus === 'probation' || c.lifecycleStatus === 'verified').length;
  const rejected = candidates.filter(c => c.applicationStatus === 'Rejected' || c.lifecycleStatus === 'rejected').length;

  const total = candidates.length;

  const pipelineStages = [
    { id: 'Started', label: 'Started', count: started, color: 'bg-muted text-muted-foreground' },
    { id: 'Submitted', label: 'Submitted', count: submitted, color: 'bg-blue-100 text-blue-700' },
    { id: 'Under Screening', label: 'Screening', count: screening, color: 'bg-orange-100 text-orange-700' },
    { id: 'Assessment Pending', label: 'Assessment', count: assessment, color: 'bg-violet-100 text-violet-700' },
    { id: 'Interview Pending', label: 'AI Interview', count: interview, color: 'bg-teal-100 text-teal-700' },
    { id: 'Human Review', label: 'Human Review', count: review, color: 'bg-pink-100 text-pink-700' },
    { id: 'Approved', label: 'Approved', count: approved, color: 'bg-green-100 text-green-700' },
    { id: 'Rejected', label: 'Rejected', count: rejected, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-md font-bold text-foreground">Application Pipeline</h3>
          <span className="text-xs text-muted-foreground">{total} total live applications</span>
        </div>
        {activeFilter !== 'All' && (
          <button 
            onClick={() => onSelectStage('All')}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Clear stage filter
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {pipelineStages.map(stage => {
          const isSelected = activeFilter === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(isSelected ? 'All' : stage.id)}
              className={`rounded-xl p-3 text-center transition-all duration-150 hover:scale-105 hover:shadow-card cursor-pointer ${stage.color} ${
                isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''
              }`}
            >
              <p className="text-2xl font-bold tabular-nums">{stage.count}</p>
              <p className="text-2xs font-semibold mt-0.5 leading-tight">{stage.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}