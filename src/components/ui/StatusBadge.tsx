import React from 'react';

type StatusVariant =
  | 'discovered' |'qualified' |'outreach' |'contacted' |'applied' |'screening' |'review' |'probation' |'verified' |'rejected' |'duplicate' |'hold' |'interested' |'not-interested' |'withdrawn' |'draft' |'queued' |'running' |'paused' |'completed' |'failed' |'cancelled';

const variantMap: Record<string, string> = {
  discovered: 'status-badge-discovered',
  qualified: 'status-badge-qualified',
  'ai-qualified': 'status-badge-qualified',
  outreach: 'status-badge-outreach',
  'ready-for-outreach': 'status-badge-outreach',
  'outreach-approved': 'status-badge-outreach',
  contacted: 'status-badge-contacted',
  applied: 'status-badge-applied',
  interested: 'status-badge-applied',
  screening: 'status-badge-screening',
  review: 'status-badge-review',
  'human-review': 'status-badge-review',
  probation: 'status-badge-probation',
  verified: 'status-badge-verified',
  rejected: 'status-badge-rejected',
  duplicate: 'status-badge-duplicate',
  hold: 'status-badge-hold',
  'not-interested': 'status-badge-rejected',
  withdrawn: 'status-badge-hold',
  draft: 'status-badge-hold',
  queued: 'status-badge-discovered',
  running: 'status-badge-applied',
  paused: 'status-badge-hold',
  completed: 'status-badge-verified',
  failed: 'status-badge-rejected',
  cancelled: 'status-badge-duplicate',
};

const labelMap: Record<string, string> = {
  discovered: 'Discovered',
  qualified: 'AI Qualified',
  'ai-qualified': 'AI Qualified',
  outreach: 'Outreach',
  'ready-for-outreach': 'Ready for Outreach',
  'outreach-approved': 'Outreach Approved',
  contacted: 'Contacted',
  applied: 'Applied',
  interested: 'Interested',
  screening: 'Screening',
  review: 'Human Review',
  'human-review': 'Human Review',
  probation: 'Probation',
  verified: 'Verified',
  rejected: 'Rejected',
  duplicate: 'Duplicate',
  hold: 'On Hold',
  'not-interested': 'Not Interested',
  withdrawn: 'Withdrawn',
  draft: 'Draft',
  queued: 'Queued',
  running: 'Running',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, className = '', size = 'md' }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, '-');
  const cls = variantMap[key] || 'status-badge-hold';
  const label = labelMap[key] || status;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${cls} ${
        size === 'sm' ? 'text-2xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${className}`}
    >
      {label}
    </span>
  );
}