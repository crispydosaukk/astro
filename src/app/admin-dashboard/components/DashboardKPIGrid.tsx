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
  MessageCircle,
  Phone,
  ArrowRight,
  Sparkle
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
  warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40',
  alert: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40',
  default: 'bg-card border-border',
};

const iconStyles = {
  hero: 'bg-white/20 text-white',
  positive: 'bg-primary/10 text-primary',
  warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
  alert: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
  default: 'bg-muted text-muted-foreground',
};

const valuStyles = {
  hero: 'text-white',
  positive: 'text-foreground',
  warning: 'text-amber-900 dark:text-amber-200',
  alert: 'text-red-900 dark:text-red-200',
  default: 'text-foreground',
};

const labelStyles = {
  hero: 'text-white/70',
  positive: 'text-muted-foreground',
  warning: 'text-amber-700 dark:text-amber-400',
  alert: 'text-red-700 dark:text-red-400',
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
      changeLabel: 'Awaiting outreach dispatch',
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
    <div className="space-y-4">
      {/* Primary Lifecycle Metric Grid */}
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

      {/* Dedicated Outreach & Channel Breakdown Hub */}
      <div className="card-elevated p-5 space-y-3.5 border-primary/20 bg-linear-to-r from-card via-card to-primary/5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageCircle size={16} className="text-primary" />
              Direct Outreach & Dispatch Channel Breakdown
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instant channel filters: Click any category to view and contact targeted candidates directly
            </p>
          </div>
          <Link 
            href="/candidate-management" 
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All in Candidate Management <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* 1. Need WhatsApp */}
          <Link
            href="/candidate-management?channel=need-whatsapp"
            className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 hover:border-emerald-500 hover:shadow-md transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <MessageCircle size={14} className="text-emerald-600" />
                Need WhatsApp
              </span>
              <span className="text-2xs bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Action Required
              </span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-emerald-900 dark:text-emerald-100 group-hover:scale-105 transition-transform origin-left">
              {stats.needWhatsapp}
            </p>
            <p className="text-2xs text-emerald-700/80 dark:text-emerald-400 mt-1 flex items-center justify-between">
              <span>Awaiting WhatsApp invite</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-emerald-600 font-bold">Filter →</span>
            </p>
          </Link>

          {/* 2. WhatsApp Sent */}
          <Link
            href="/candidate-management?channel=whatsapp-sent"
            className="rounded-xl border border-emerald-500/20 bg-card p-3.5 hover:border-emerald-500 hover:shadow-md transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                WhatsApp Sent
              </span>
              <span className="text-2xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                Delivered
              </span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-foreground group-hover:scale-105 transition-transform origin-left">
              {stats.whatsappSent}
            </p>
            <p className="text-2xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Invited via WhatsApp</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-primary font-bold">Filter →</span>
            </p>
          </Link>

          {/* 3. Need Email */}
          <Link
            href="/candidate-management?channel=need-email"
            className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 hover:border-primary hover:shadow-md transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Mail size={14} className="text-primary" />
                Need Email
              </span>
              <span className="text-2xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                Action Required
              </span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-foreground group-hover:scale-105 transition-transform origin-left">
              {stats.needEmail}
            </p>
            <p className="text-2xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Has email, awaiting dispatch</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-primary font-bold">Filter →</span>
            </p>
          </Link>

          {/* 4. Mail Sent */}
          <Link
            href="/candidate-management?channel=email-sent"
            className="rounded-xl border border-border bg-card p-3.5 hover:border-primary hover:shadow-md transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-primary" />
                Mail Sent
              </span>
              <span className="text-2xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                SMTP Sent
              </span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-foreground group-hover:scale-105 transition-transform origin-left">
              {stats.emailSent}
            </p>
            <p className="text-2xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Email invitations dispatched</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-primary font-bold">Filter →</span>
            </p>
          </Link>

          {/* 5. Phone Only (Missing Email) */}
          <Link
            href="/candidate-management?channel=phone-only"
            className="rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 hover:border-amber-500 hover:shadow-md transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Phone size={14} className="text-amber-600" />
                Phone Only
              </span>
              <span className="text-2xs bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                WhatsApp Only
              </span>
            </div>
            <p className="text-3xl font-bold tabular-nums text-amber-900 dark:text-amber-100 group-hover:scale-105 transition-transform origin-left">
              {stats.phoneOnly}
            </p>
            <p className="text-2xs text-amber-700/80 dark:text-amber-400 mt-1 flex items-center justify-between">
              <span>No email found; send WA</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-amber-600 font-bold">Filter →</span>
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}