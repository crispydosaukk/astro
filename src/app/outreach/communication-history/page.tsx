'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { ScrollText, Search, Mail, MessageSquare, Smartphone, ChevronDown, CheckCircle2, Send, Layers } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface CommRecord {
  id: string;
  candidate: string;
  type: 'Email Sent' | 'SMS Sent' | 'WhatsApp Sent' | 'Email Received' | 'WhatsApp Received' | 'System Note';
  subject?: string;
  preview: string;
  date: string;
  channel: 'Email' | 'SMS' | 'WhatsApp' | 'System';
  direction: 'outbound' | 'inbound' | 'system';
  targetContact?: string;
}

const defaultRecords: CommRecord[] = [];

const directionConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  outbound: { color: 'border-l-primary', icon: <Mail size={14} className="text-primary" /> },
  inbound: { color: 'border-l-green-500', icon: <MessageSquare size={14} className="text-green-500" /> },
  system: { color: 'border-l-slate-400', icon: <ScrollText size={14} className="text-slate-400" /> },
};

export default function CommunicationHistoryPage() {
  const [mailRecords, setMailRecords] = useState<CommRecord[]>([]);
  const [smsRecords, setSmsRecords] = useState<CommRecord[]>([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  // Subscribe to Firestore 'mail' collection to pick up emails queued/sent
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
                preview: data.message?.text || 'Invitation letter dispatched via SMTP / Firebase.',
                date: data.metadata?.dispatchedAt ? new Date(data.metadata.dispatchedAt).toLocaleString() : 'Recently Dispatched',
                channel: 'Email',
                direction: 'outbound',
                targetContact: data.to?.[0] || '',
              };
            });
            setMailRecords(liveMailRecords);
          } else {
            setMailRecords([]);
          }
        },
        (err) => {
          console.warn('Mail collection history fallback:', err);
          setMailRecords([]);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Mail history subscription error:', e);
    }
  }, []);

  // Subscribe to Firestore 'communications' collection to pick up SMS records
  useEffect(() => {
    try {
      const colRef = collection(db, 'communications');
      const unsubscribe = onSnapshot(
        colRef,
        (snap) => {
          if (!snap.empty) {
            const liveSmsRecords: CommRecord[] = snap.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                candidate: data.candidate || 'Astrologer Candidate',
                type: 'SMS Sent',
                preview: data.message || data.preview || 'SMS invitation dispatched via MSG91.',
                date: data.metadata?.dispatchedAt ? new Date(data.metadata.dispatchedAt).toLocaleString() : 'Recently Dispatched',
                channel: 'SMS',
                direction: 'outbound',
                targetContact: data.toPhone || '',
              };
            });
            setSmsRecords(liveSmsRecords);
          } else {
            setSmsRecords([]);
          }
        },
        (err) => {
          console.warn('Communications SMS history fallback:', err);
          setSmsRecords([]);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Communications history subscription error:', e);
    }
  }, []);

  const allRecords = [...smsRecords, ...mailRecords];

  const filtered = allRecords.filter(r => {
    const matchSearch = r.candidate.toLowerCase().includes(search.toLowerCase()) || 
      r.preview.toLowerCase().includes(search.toLowerCase()) ||
      (r.targetContact && r.targetContact.toLowerCase().includes(search.toLowerCase()));
    const matchChannel = channelFilter === 'all' || r.channel === channelFilter;
    return matchSearch && matchChannel;
  });

  const getChannelBadge = (ch: 'Email' | 'SMS' | 'WhatsApp' | 'System') => {
    switch (ch) {
      case 'SMS':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            <Smartphone size={10} /> SMS (MSG91)
          </span>
        );
      case 'Email':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <Mail size={10} /> Email
          </span>
        );
      case 'WhatsApp':
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <MessageSquare size={10} /> WhatsApp
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {ch}
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ScrollText size={28} className="text-primary" /> Communication History
            </h1>
            <p className="text-muted-foreground mt-1">Audit log of all outreach emails, MSG91 SMS, and notifications dispatched</p>
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
              placeholder="Search by candidate name, phone or text..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background font-medium"
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
          >
            <option value="all">All Channels</option>
            <option value="Email">Email</option>
            <option value="SMS">SMS (MSG91)</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>

        {/* List of communications */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground card-elevated">
              <ScrollText size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground text-sm">No communication logs found.</p>
              <p className="text-xs text-muted-foreground mt-1">Dispatched SMS invitations and emails will appear here in real time.</p>
            </div>
          ) : (
            filtered.map(r => {
              const isSms = r.channel === 'SMS';
              const borderClass = isSms ? 'border-l-indigo-500' : 'border-l-primary';
              const icon = isSms ? <Smartphone size={14} className="text-indigo-600" /> : <Mail size={14} className="text-primary" />;

              return (
                <div
                  key={r.id}
                  className={`card-elevated p-4 border-l-4 ${borderClass} hover:shadow-card-hover transition-all`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-muted flex items-center justify-center">
                        {icon}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{r.candidate}</h3>
                        <p className="text-xs text-muted-foreground">
                          {r.type} · {r.date} {r.targetContact ? `(${r.targetContact})` : ''}
                        </p>
                      </div>
                    </div>
                    {getChannelBadge(r.channel)}
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
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
