'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { ScrollText, Search, Mail, MessageSquare, ChevronDown, CheckCircle2, Send } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface CommRecord {
  id: string;
  candidate: string;
  type: 'Email Sent' | 'WhatsApp Sent' | 'Email Received' | 'WhatsApp Received' | 'System Note';
  subject?: string;
  preview: string;
  date: string;
  channel: 'Email' | 'WhatsApp' | 'System';
  direction: 'outbound' | 'inbound' | 'system';
}

const defaultRecords: CommRecord[] = [];

const directionConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  outbound: { color: 'border-l-primary', icon: <Mail size={14} className="text-primary" /> },
  inbound: { color: 'border-l-green-500', icon: <MessageSquare size={14} className="text-green-500" /> },
  system: { color: 'border-l-slate-400', icon: <ScrollText size={14} className="text-slate-400" /> },
};

export default function CommunicationHistoryPage() {
  const [records, setRecords] = useState<CommRecord[]>([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  // Subscribe to Firestore 'mail' collection to pick up real emails queued/sent
  useEffect(() => {
    try {
      const colRef = collection(db, 'mail');
      const unsubscribe = onSnapshot(
        colRef,
        (snap) => {
          if (!snap.empty) {
            const liveMailRecords: CommRecord[] = snap.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                candidate: data.candidateName || data.to?.[0] || 'Astrologer Candidate',
                type: 'Email Sent',
                subject: data.message?.subject || 'Invitation to Join AstroParihar',
                preview: data.message?.text || 'Invitation letter dispatched via Firebase Cloud Functions.',
                date: 'Recently Queued',
                channel: 'Email',
                direction: 'outbound',
              };
            });
            setRecords(liveMailRecords);
          } else {
            setRecords([]);
          }
        },
        (err) => {
          console.warn('Mail collection history fallback:', err);
          setRecords([]);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Mail history subscription error:', e);
    }
  }, []);

  const filtered = records.filter(r => {
    const matchSearch = r.candidate.toLowerCase().includes(search.toLowerCase()) || r.preview.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === 'all' || r.channel === channelFilter;
    return matchSearch && matchChannel;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ScrollText size={28} className="text-primary" /> Communication History
            </h1>
            <p className="text-muted-foreground mt-1">Audit log of all outreach emails and notifications dispatched</p>
          </div>
          <Link href="/outreach/messages" className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
            <Send size={14} /> Compose New Outreach
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search by candidate name or text..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
          >
            <option value="all">All Channels</option>
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>

        {/* List of communications */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground card-elevated">
              <ScrollText size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground text-sm">No communication logs found.</p>
              <p className="text-xs text-muted-foreground mt-1">Dispatched emails and outreach invitations will appear here in real time.</p>
            </div>
          ) : (
            filtered.map(r => {
              const dir = directionConfig[r.direction] || directionConfig.outbound;
              return (
              <div
                key={r.id}
                className={`card-elevated p-4 border-l-4 ${dir.color} hover:shadow-card-hover transition-all`}
              >
                <div className="flex items-start justify-between flex-wrap gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-muted flex items-center justify-center">
                      {dir.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{r.candidate}</h3>
                      <p className="text-xs text-muted-foreground">{r.type} · {r.date}</p>
                    </div>
                  </div>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {r.channel}
                  </span>
                </div>

                {r.subject && (
                  <p className="text-xs font-semibold text-foreground mt-2">
                    Subject: {r.subject}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 font-mono whitespace-pre-wrap leading-relaxed line-clamp-2">
                  {r.preview}
                </p>
              </div>
            );
          }))}
        </div>
      </div>
    </AppLayout>
  );
}
