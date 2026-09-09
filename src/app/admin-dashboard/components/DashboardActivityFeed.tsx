'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Telescope, 
  Sparkles, 
  Send, 
  FileText, 
  UserCheck, 
  BadgeCheck, 
  AlertTriangle, 
  Timer 
} from 'lucide-react';
import { useDashboard, ActivityItem } from '../DashboardContext';

const iconMap = {
  telescope: <Telescope size={13} />,
  sparkles: <Sparkles size={13} />,
  send: <Send size={13} />,
  file: <FileText size={13} />,
  review: <UserCheck size={13} />,
  probation: <Timer size={13} />,
  verified: <BadgeCheck size={13} />,
  alert: <AlertTriangle size={13} />,
};

export default function DashboardActivityFeed() {
  const { activities } = useDashboard();

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-foreground">Recent Pipeline Activity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live events generated from candidate actions & reviews</p>
        </div>
        <Link href="/candidate-management" className="btn-ghost text-sm text-primary font-semibold flex items-center gap-1">
          Manage candidates
          <ArrowRight size={13} />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles size={24} className="mx-auto text-muted-foreground/40 mb-2" />
          <p className="font-semibold text-sm">No recent pipeline activity</p>
          <p className="text-xs">Live events will be captured automatically as candidates progress.</p>
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((item: ActivityItem, idx: number) => (
            <div
              key={item.id}
              className={`flex gap-3.5 py-3.5 ${idx < activities.length - 1 ? 'border-b border-border' : ''} ${item.urgent ? 'bg-red-50/50 -mx-5 px-5 rounded' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${item.iconBg}`}>
                {iconMap[item.iconType] || <Sparkles size={13} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold leading-snug ${item.urgent ? 'text-red-800' : 'text-foreground'}`}>
                    {item.title}
                    {item.urgent && (
                      <span className="ml-2 text-2xs font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        Action Required
                      </span>
                    )}
                  </p>
                  <span className="text-2xs text-muted-foreground flex-shrink-0 mt-0.5 font-medium">{item.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                {item.link && (
                  <Link href={item.link} className="text-xs text-primary font-semibold hover:underline mt-1 inline-flex items-center gap-1">
                    View details <ArrowRight size={10} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}