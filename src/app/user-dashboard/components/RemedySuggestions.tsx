'use client';
import React from 'react';
import { Gem, Music, Moon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';


const remedies = [
  { id: 'rem-001', icon: Gem, title: 'Wear Ruby', sub: 'For Sun strength · Sunday', color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'rem-002', icon: Music, title: 'Om Namah Shivaya', sub: '108 times at dawn', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'rem-003', icon: Moon, title: 'Ekadashi Fast', sub: 'Next: 8 Jul 2026', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export default function RemedySuggestions() {
  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Active Remedies</h2>
        <Link href="/ai-recommendations-screen" className="text-xs text-accent hover:underline">View All</Link>
      </div>
      <div className="p-5 space-y-3">
        {remedies?.map((rem) => {
          const Icon = rem?.icon;
          return (
            <div key={rem?.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group">
              <div className={`w-9 h-9 rounded-xl ${rem?.bg} flex items-center justify-center flex-shrink-0 icon-hover-animate`}>
                <Icon size={16} className={rem?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{rem?.title}</p>
                <p className="text-xs text-muted-foreground">{rem?.sub}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
}