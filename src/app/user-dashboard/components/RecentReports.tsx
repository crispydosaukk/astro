'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Gem, Music, Triangle, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';


const reports = [
  { id: 'rep-001', icon: Gem, title: 'Gemstone Recommendation Report', type: 'AI Gemstone', date: '28 Jun 2026', status: 'ready', color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'rep-002', icon: Music, title: 'Personal Mantra Analysis', type: 'AI Mantra', date: '20 Jun 2026', status: 'ready', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'rep-003', icon: Triangle, title: 'Yantra Remedy Report', type: 'AI Yantra', date: '15 Jun 2026', status: 'ready', color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'rep-004', icon: Flame, title: 'Navagraha Homam Guidance', type: 'AI Homam', date: '10 Jun 2026', status: 'ready', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'rep-005', icon: FileText, title: 'Annual Kundli 2026 Report', type: 'Full Kundli', date: '1 Jan 2026', status: 'ready', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export default function RecentReports() {
  return (
    <div className="glass-card-light dark:glass-card rounded-2xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Recent Reports</h2>
        <Link href="/ai-recommendations-screen" className="flex items-center gap-1 text-xs text-accent hover:underline">
          Generate New <ArrowRight size={10} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">Report</th>
              <th className="text-left px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">Type</th>
              <th className="text-left px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">Generated</th>
              <th className="text-left px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="text-right px-6 py-3 text-xs font-500 text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports?.map((rep, i) => {
              const Icon = rep?.icon;
              return (
                <motion.tr
                  key={rep?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${rep?.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={15} className={rep?.color} />
                      </div>
                      <span className="font-medium text-foreground">{rep?.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{rep?.type}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{rep?.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400">
                      Ready
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="View report">
                        <Eye size={14} className="text-muted-foreground hover:text-foreground" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Download PDF">
                        <Download size={14} className="text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}