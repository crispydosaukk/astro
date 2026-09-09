'use client';

import React from 'react';
import Link from 'next/link';
import {
  Telescope,
  Sparkles,
  Send,
  CheckCircle2,
  Mail,
  FileText,
  Search,
  UserCheck,
  Timer,
  BadgeCheck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useDashboard } from '../DashboardContext';

interface KPICard {
  id: string;
  label: string;
  value: number;
  change?: number;
  changeLabel: string;
  icon: React.ReactNode;
  variant: 'default' | 'positive' | 'warning' | 'alert' | 'hero';
  href: string;
  colSpan?: number;
}

const variantStyles = {
  hero: 'bg-primary text-primary-foreground border-primary/20',
  positive: 'bg-card border-border',
  warning: 'bg-amber-50 border-amber-200',
  alert: 'bg-red-50 border-red-200',
  default: 'bg-card border-border',
};

const iconStyles = {
  hero: 'bg-white/20 text-white',
  positive: 'bg-primary/10 text-primary',
  warning: 'bg-amber-100 text-amber-700',
  alert: 'bg-red-100 text-red-700',
  default: 'bg-muted text-muted-foreground',
};

const valuStyles = {
  hero: 'text-white',
  positive: 'text-foreground',
  warning: 'text-amber-900',
  alert: 'text-red-900',
  default: 'text-foreground',
};

const labelStyles = {
  hero: 'text-white/70',
  positive: 'text-muted-foreground',
  warning: 'text-amber-700',
  alert: 'text-red-700',
  default: 'text-muted-foreground',
};

export default function DashboardKPIGrid() {
  const { stats } = useDashboard();

  const dynamicKpiCards: KPICard[] = [
    {
      id: 'kpi-total',
      label: 'Total Candidates',
      value: stats.totalCandidates,
      change: stats.qualificationRate,
      changeLabel: `${stats.qualificationRate}% qualified by AI`,
      icon: <Telescope size={18} />,
      variant: 'hero',
      href: '/candidate-management',
      colSpan: 2,
    },
    {
      id: 'kpi-qualified',
      label: 'AI Qualified',
      value: stats.aiQualified,
      change: stats.qualificationRate,
      changeLabel: 'Score ≥80 benchmark',
      icon: <Sparkles size={18} />,
      variant: 'positive',
      href: '/candidate-management',
    },
    {
      id: 'kpi-outreach-pending',
      label: 'Ready for Outreach',
      value: stats.readyForOutreach,
      change: 0,
      changeLabel: 'Awaiting admin approval',
      icon: <AlertTriangle size={18} />,
      variant: stats.readyForOutreach > 0 ? 'alert' : 'default',
      href: '/candidate-management',
    },
    {
      id: 'kpi-outreach-sent',
      label: 'Outreach Sent',
      value: stats.outreachSent,
      change: 0,
      changeLabel: 'Dispatched invitations',
      icon: <Mail size={18} />,
      variant: 'default',
      href: '/candidate-management',
    },
    {
      id: 'kpi-contacted',
      label: 'Contacted',
      value: stats.contacted,
      change: stats.outreachDeliveryRate,
      changeLabel: `${stats.outreachDeliveryRate}% delivery rate`,
      icon: <CheckCircle2 size={18} />,
      variant: 'default',
      href: '/candidate-management',
    },
    {
      id: 'kpi-applications',
      label: 'Applications Received',
      value: stats.applications,
      change: 0,
      changeLabel: 'Completed intake forms',
      icon: <FileText size={18} />,
      variant: 'positive',
      href: '/application-management',
    },
    {
      id: 'kpi-screening',
      label: 'Screening in Progress',
      value: stats.screening,
      change: 0,
      changeLabel: 'Theory & doc audits',
      icon: <Search size={18} />,
      variant: 'warning',
      href: '/application-management',
    },
    {
      id: 'kpi-human-review',
      label: 'Human Review Pending',
      value: stats.humanReview,
      change: 0,
      changeLabel: stats.humanReview > 0 ? `${stats.humanReview} awaiting committee` : 'Queue cleared',
      icon: <UserCheck size={18} />,
      variant: stats.humanReview > 0 ? 'alert' : 'default',
      href: '/human-review-module',
    },
    {
      id: 'kpi-probation',
      label: 'Probation Active',
      value: stats.probation,
      change: 0,
      changeLabel: '30-day live trials active',
      icon: <Timer size={18} />,
      variant: 'warning',
      href: '/probation/active',
    },
    {
      id: 'kpi-verified',
      label: 'Verified Astrologers',
      value: stats.verified,
      change: stats.verificationRate,
      changeLabel: `${stats.overallConversionRate}% conversion yield`,
      icon: <BadgeCheck size={18} />,
      variant: 'positive',
      href: '/verification',
    },
    {
      id: 'kpi-rejected',
      label: 'Rejected',
      value: stats.rejected,
      change: 0,
      changeLabel: `${stats.rejectionRate}% non-compliant`,
      icon: <XCircle size={18} />,
      variant: 'default',
      href: '/candidate-management',
    },
    {
      id: 'kpi-send-outreach',
      label: 'Outreach Approval Queue',
      value: stats.outreachApprovalQueue,
      change: 0,
      changeLabel: 'Approve in candidates table',
      icon: <Send size={18} />,
      variant: stats.outreachApprovalQueue > 0 ? 'alert' : 'default',
      href: '/candidate-management',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4">
      {dynamicKpiCards.map(card => (
        <Link
          key={card.id}
          href={card.href}
          className={`rounded-xl border p-5 transition-all duration-150 hover:shadow-card-hover cursor-pointer block ${
            card.colSpan === 2 ? 'col-span-2' : 'col-span-1'
          } ${variantStyles[card.variant]}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconStyles[card.variant]}`}>
              {card.icon}
            </div>
            {card.change !== undefined && card.change > 0 && (
              <span className={`text-xs font-bold tabular-nums ${
                card.variant === 'hero' ? 'text-green-300' : 'text-green-700'
              }`}>
                +{card.change}%
              </span>
            )}
          </div>
          <p className={`text-4xl lg:text-5xl font-bold tabular-nums leading-none mb-1.5 ${valuStyles[card.variant]}`}>
            {card.value.toLocaleString()}
          </p>
          <p 
            className={`text-xs font-semibold mb-1 ${labelStyles[card.variant]}`}
            style={{ fontWeight: 600, letterSpacing: '0.02em' }}
          >
            {card.label}
          </p>
          <p className={`text-xs ${labelStyles[card.variant]} opacity-80 truncate`}>
            {card.changeLabel}
          </p>
        </Link>
      ))}
    </div>
  );
}