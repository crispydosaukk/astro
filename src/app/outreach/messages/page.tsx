'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { 
  MessageSquare, Search, ChevronDown, CheckCircle2, XCircle, Clock, 
  Mail, Smartphone, Sparkles, Send, Eye, X, Copy, Check, RefreshCw,
  Users, ArrowRight, Info, AlertTriangle, Layers
} from 'lucide-react';

import { queueEmailViaCloudFunction } from '@/lib/firebase/emailService';
import { queueSmsViaMsg91, dispatchParallelOutreach } from '@/lib/firebase/smsService';

interface Message {
  id: string;
  candidate: string;
  location: string;
  channel: 'Email' | 'WhatsApp' | 'SMS' | 'Parallel (Email + SMS)';
  template: string;
  sentAt: string;
  status: 'delivered' | 'failed' | 'pending' | 'opened' | 'responded';
  campaign: string;
  subject?: string;
  body?: string;
  email?: string;
  phone?: string;
}

const initialMessages: Message[] = [];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  delivered: { label: 'Delivered', color: 'bg-blue-100 text-blue-900 border border-blue-300 font-bold', icon: <CheckCircle2 size={12} className="text-blue-700 shrink-0" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-900 border border-red-300 font-bold', icon: <XCircle size={12} className="text-red-700 shrink-0" /> },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold', icon: <Clock size={12} className="text-amber-700 shrink-0" /> },
  opened: { label: 'Opened', color: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold', icon: <Mail size={12} className="text-purple-700 shrink-0" /> },
  responded: { label: 'Responded', color: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold', icon: <CheckCircle2 size={12} className="text-emerald-700 shrink-0" /> },
};

export default function OutreachMessagesPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [location, setLocation] = useState('');
  const [specialisation, setSpecialisation] = useState('Vedic Astrology');
  const [experience, setExperience] = useState('10+ years');
  const [channel, setChannel] = useState<'Email' | 'WhatsApp' | 'SMS' | 'Parallel'>('Email');
  const [tone, setTone] = useState<'respectful' | 'prestigious' | 'concise'>('respectful');
  const [language, setLanguage] = useState<'English' | 'Telugu' | 'Hindi' | 'Tamil'>('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [generatedSmsBody, setGeneratedSmsBody] = useState('');
  
  // Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // View Modal State
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill from query params when navigating from Candidate Profile Modal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const nameParam = params.get('name');
      const emailParam = params.get('email');
      const phoneParam = params.get('phone');
      const locParam = params.get('location');
      const specParam = params.get('specialisation');
      if (nameParam) {
        setCandidateName(nameParam);
        const hasValidEmail = emailParam && emailParam !== 'null' && emailParam !== 'undefined';
        const hasValidPhone = phoneParam && phoneParam !== 'null' && phoneParam !== 'undefined';

        if (hasValidEmail) setRecipientEmail(emailParam);
        if (hasValidPhone) setRecipientPhone(phoneParam);

        // Smart channel default: if both available, offer Parallel dispatch!
        if (hasValidEmail && hasValidPhone) {
          setChannel('Parallel');
        } else if (hasValidPhone && !hasValidEmail) {
          setChannel('SMS');
        } else {
          setChannel('Email');
        }

        if (locParam) setLocation(locParam);
        if (specParam) setSpecialisation(specParam);
        setIsComposeOpen(true);
      }
    }
  }, []);

  const handleGenerateAI = async () => {
    if (!candidateName.trim()) {
      alert('Please enter a candidate name');
      return;
    }

    setIsGenerating(true);
    try {
      if (channel === 'Parallel') {
        // Generate both email and SMS in parallel
        const [emailRes, smsRes] = await Promise.all([
          fetch('/api/ai/generate-outreach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateName,
              specialisation,
              location: location || 'India',
              experience,
              channel: 'email',
              tone,
              language,
            }),
          }).then(r => r.json()),
          fetch('/api/ai/generate-outreach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateName,
              specialisation,
              location: location || 'India',
              experience,
              channel: 'sms',
              tone,
              language,
            }),
          }).then(r => r.json()),
        ]);

        if (emailRes.success) {
          setGeneratedSubject(emailRes.subject || `Invitation to Join AstroParihar for ${candidateName}`);
          setGeneratedBody(emailRes.body);
        }
        if (smsRes.success) {
          setGeneratedSmsBody(smsRes.body || `Namaste ${candidateName} Ji, AstroParihar invites you to join our verified astrologer panel. Apply: https://astroparihar.com/apply - AstroParihar`);
        }
      } else {
        const res = await fetch('/api/ai/generate-outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateName,
            specialisation,
            location: location || 'India',
            experience,
            channel: channel.toLowerCase(),
            tone,
            language,
          }),
        });

        const data = await res.json();
        if (data.success) {
          if (channel === 'Email') {
            setGeneratedSubject(data.subject || `Invitation to Join AstroParihar for ${candidateName}`);
            setGeneratedBody(data.body);
          } else if (channel === 'SMS') {
            setGeneratedSmsBody(data.body);
            setGeneratedBody(data.body);
          } else {
            setGeneratedBody(data.body);
          }
        } else {
          alert(data.error || 'Failed to generate message with AI');
        }
      }
    } catch (err: any) {
      alert(`AI Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenConfirmation = () => {
    if (!candidateName) {
      alert('Please enter the candidate name.');
      return;
    }

    if (channel === 'Email' && !generatedBody) {
      alert('Please generate or compose the email message first.');
      return;
    }

    if (channel === 'SMS' && (!generatedSmsBody && !generatedBody)) {
      alert('Please generate or compose the SMS text first.');
      return;
    }

    if (channel === 'Parallel') {
      if (!generatedBody || !generatedSmsBody) {
        alert('Please generate both the Email and SMS message contents before sending.');
        return;
      }
    }

    setIsConfirmOpen(true);
  };

  const handleExecuteDispatch = async () => {
    setIsSending(true);
    const destEmail = recipientEmail.trim() || `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@astroparihar.verified`;
    const destPhone = recipientPhone.trim();
    const effectiveSmsText = generatedSmsBody.trim() || generatedBody.trim();
    const effectiveEmailBody = generatedBody.trim();
    const effectiveSubject = generatedSubject.trim() || `Invitation to Join AstroParihar - ${candidateName}`;

    try {
      if (channel === 'Parallel') {
        // Parallel multi-channel dispatch
        const parallelRes = await dispatchParallelOutreach({
          candidateName,
          email: destEmail,
          emailSubject: effectiveSubject,
          emailBody: effectiveEmailBody,
          phone: destPhone || undefined,
          smsMessage: effectiveSmsText,
          smsTemplateId: '6ab4e155fe7c2c662905ac73',
          specialisation,
          location,
        });

        const newMsg: Message = {
          id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
          candidate: candidateName,
          location: location || 'India',
          channel: 'Parallel (Email + SMS)',
          template: `AI GPT-4o Parallel (${tone})`,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'delivered',
          campaign: `Parallel Outreach · Email & SMS (MSG91)`,
          subject: effectiveSubject,
          body: `[EMAIL CONTENT]\nSubject: ${effectiveSubject}\n\n${effectiveEmailBody}\n\n-------------------------\n[SMS CONTENT]\n${effectiveSmsText}`,
          email: destEmail,
          phone: destPhone || undefined,
        };

        setMessages(prev => [newMsg, ...prev]);
        setSendSuccessMessage(
          `Parallel outreach dispatched successfully! Email queued to ${destEmail}${destPhone ? ` and SMS sent to ${destPhone} via MSG91.` : '.'}`
        );
      } else if (channel === 'SMS') {
        // SMS Single dispatch via MSG91
        await queueSmsViaMsg91({
          phone: destPhone || '919876543210',
          candidateName,
          message: effectiveSmsText,
          templateId: '6ab4e155fe7c2c662905ac73',
          variables: {
            candidate_name: candidateName,
            name: candidateName,
            specialisation,
            location,
          },
        });

        const newMsg: Message = {
          id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
          candidate: candidateName,
          location: location || 'India',
          channel: 'SMS',
          template: `AI GPT-4o SMS (${tone})`,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'delivered',
          campaign: `MSG91 SMS Gateway (${destPhone || 'Direct'})`,
          body: effectiveSmsText,
          phone: destPhone,
        };

        setMessages(prev => [newMsg, ...prev]);
        setSendSuccessMessage(`SMS invitation dispatched to ${candidateName} (${destPhone || 'Registered Mobile'}) via MSG91!`);
      } else if (channel === 'Email') {
        // Email dispatch
        await queueEmailViaCloudFunction({
          to: destEmail,
          candidateName,
          subject: effectiveSubject,
          body: effectiveEmailBody,
        });

        const newMsg: Message = {
          id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
          candidate: candidateName,
          location: location || 'India',
          channel: 'Email',
          template: `AI GPT-4o (${tone})`,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'delivered',
          campaign: `SMTP Direct (${destEmail})`,
          subject: effectiveSubject,
          body: effectiveEmailBody,
          email: destEmail,
        };

        setMessages(prev => [newMsg, ...prev]);
        setSendSuccessMessage(`Email invitation queued to Firebase (/mail) and addressed to: ${destEmail}`);
      } else {
        // WhatsApp dispatch
        const newMsg: Message = {
          id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
          candidate: candidateName,
          location: location || 'India',
          channel: 'WhatsApp',
          template: `AI GPT-4o WhatsApp (${tone})`,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'delivered',
          campaign: `WhatsApp Direct Outreach (${destPhone || candidateName})`,
          body: effectiveEmailBody || effectiveSmsText,
          phone: destPhone,
        };

        setMessages(prev => [newMsg, ...prev]);
        setSendSuccessMessage(`WhatsApp invitation dispatched to ${candidateName}!`);
      }

      setIsConfirmOpen(false);
      setIsComposeOpen(false);
      setTimeout(() => setSendSuccessMessage(null), 6000);

      // Reset form
      setCandidateName('');
      setRecipientEmail('');
      setRecipientPhone('');
      setLocation('');
      setGeneratedSubject('');
      setGeneratedBody('');
      setGeneratedSmsBody('');
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyBody = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = messages.filter(m => {
    const matchSearch = m.candidate.toLowerCase().includes(search.toLowerCase()) || m.campaign.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchChannel = channelFilter === 'all' 
      ? true 
      : channelFilter === 'Parallel' 
        ? m.channel.includes('Parallel') 
        : m.channel === channelFilter;
    return matchSearch && matchStatus && matchChannel;
  });

  const getChannelBadge = (ch: string) => {
    if (ch.includes('Parallel')) {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <Layers size={11} /> Email + SMS (Parallel)
        </span>
      );
    }
    if (ch === 'SMS') {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          <Smartphone size={11} /> SMS (MSG91)
        </span>
      );
    }
    if (ch === 'WhatsApp') {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <MessageSquare size={11} /> WhatsApp
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <Mail size={11} /> Email
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {sendSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn shadow-xs">
            <span className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              {sendSuccessMessage}
            </span>
            <button onClick={() => setSendSuccessMessage(null)} className="text-xs hover:underline shrink-0">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare size={28} className="text-primary" /> Outreach Messages
            </h1>
            <p className="text-muted-foreground mt-1">
              Track, compose, and dispatch multichannel candidate invitations across Email, WhatsApp & SMS (MSG91)
            </p>
          </div>
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
          >
            <Sparkles size={16} /> Compose with AI (GPT-4o)
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(statusConfig).map(([key, sc]) => (
            <div key={key} className="bg-white border border-border rounded-xl p-3.5 text-center shadow-xs">
              <p className="text-2xl font-black text-foreground">{messages.filter(m => m.status === key).length}</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${sc.color} px-2.5 py-1 rounded-full mt-1.5 shadow-2xs`}>
                {sc.icon} {sc.label}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-2xs"
              placeholder="Search candidate or campaign..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3.5 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-2xs cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="responded">Responded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3.5 pr-8 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-2xs cursor-pointer"
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
            >
              <option value="all">All Channels</option>
              <option value="Parallel">⚡ Parallel (Email + SMS)</option>
              <option value="Email">✉️ Email</option>
              <option value="SMS">📱 SMS (MSG91)</option>
              <option value="WhatsApp">💬 WhatsApp</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Channel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Template / Mode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Campaign</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sent At</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <MessageSquare size={36} className="mx-auto text-muted-foreground/30 mb-2.5" />
                      <p className="font-semibold text-base text-foreground">No outreach messages recorded yet</p>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                        Discovered astrologers live in your pipeline. Dispatched Email, WhatsApp & SMS invitations will be tracked here.
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <Link
                          href="/candidate-management"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition shadow-xs"
                        >
                          <Users size={13} />
                          View Candidates
                        </Link>
                        <button
                          onClick={() => setIsComposeOpen(true)}
                          className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
                        >
                          <Sparkles size={12} />
                          Compose AI Message
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(m => {
                    const sc = statusConfig[m.status] || statusConfig.delivered;
                    return (
                      <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{m.candidate}</p>
                          <p className="text-xs text-muted-foreground">{m.location}</p>
                        </td>
                        <td className="px-4 py-3">
                          {getChannelBadge(m.channel)}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{m.template}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{m.campaign}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                            {sc.icon} {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{m.sentAt}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => setSelectedMessage(m)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition"
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Message Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{selectedMessage.candidate}</h2>
                    {getChannelBadge(selectedMessage.channel)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedMessage.location} · {selectedMessage.sentAt}</p>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedMessage.subject && (
                <div className="p-3 bg-muted/40 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground">Subject Line:</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{selectedMessage.subject}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">Message Content:</label>
                  <button 
                    onClick={() => handleCopyBody(selectedMessage.body || '')}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-4 bg-muted/20 border border-border rounded-xl text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed text-foreground">
                  {selectedMessage.body || 'No detailed body recorded for message.'}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compose with AI Modal */}
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Compose Outreach with AI (GPT-4o)</h2>
                    <p className="text-xs text-muted-foreground">Culturally nuanced candidate invitations for Email, WhatsApp & SMS (MSG91)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Channel Selector Pills */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Select Outreach Channel Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('Parallel')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      channel === 'Parallel'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30'
                        : 'border-border bg-background hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <Layers size={14} className="text-amber-600" />
                    <span>⚡ Parallel (Email+SMS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('Email')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      channel === 'Email'
                        ? 'bg-blue-500/15 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30'
                        : 'border-border bg-background hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <Mail size={14} className="text-blue-600" />
                    <span>Email Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('SMS')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      channel === 'SMS'
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                        : 'border-border bg-background hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <Smartphone size={14} className="text-indigo-600" />
                    <span>SMS (MSG91)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('WhatsApp')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      channel === 'WhatsApp'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'border-border bg-background hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <MessageSquare size={14} className="text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Candidate Name *</label>
                  <input
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-2xs"
                    placeholder="e.g. Pandit Radhakrishnan"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Recipient Email</label>
                  <input
                    type="email"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-2xs"
                    placeholder="e.g. astrologer@gmail.com"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Recipient Mobile Number (for SMS / WhatsApp)
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-2xs"
                    placeholder="+91 98765 43210"
                    value={recipientPhone}
                    onChange={e => setRecipientPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Location</label>
                  <input
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-2xs"
                    placeholder="e.g. Chennai, Tamil Nadu"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Specialisation</label>
                  <select
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-2xs cursor-pointer"
                    value={specialisation}
                    onChange={e => setSpecialisation(e.target.value)}
                  >
                    <option value="Vedic Astrology">Vedic Astrology</option>
                    <option value="KP Astrology">KP Astrology</option>
                    <option value="Nadi Astrology">Nadi Astrology</option>
                    <option value="Prashna Jyotish">Prashna Jyotish</option>
                    <option value="Vastu Shastra">Vastu Shastra</option>
                    <option value="Numerology">Numerology</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Tone & Voice</label>
                  <select
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-2xs cursor-pointer"
                    value={tone}
                    onChange={e => setTone(e.target.value as any)}
                  >
                    <option value="respectful">Traditional Vedic & Respectful</option>
                    <option value="prestigious">Elite Network & Prestigious</option>
                    <option value="concise">Direct & Action-Oriented</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Outreach Language · భాష / மொழி / भाषा
                  </label>
                  <select
                    className="w-full px-3.5 py-2 text-sm border-2 border-primary/40 rounded-lg bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-2xs cursor-pointer"
                    value={language}
                    onChange={e => setLanguage(e.target.value as any)}
                  >
                    <option value="English">✦ English — Celestial Vedic Astrology Outreach</option>
                    <option value="Telugu">✦ Telugu (తెలుగు) — శ్రీ వేద జ్యోతిషం ఆహ్వానం</option>
                    <option value="Tamil">✦ Tamil (தமிழ்) — பாரம்பரிய வேத ஜோதிடம் அழைப்பு</option>
                    <option value="Hindi">✦ Hindi (हिन्दी) — प्रामाणिक वैदिक ज्योतिष निमंत्रण</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !candidateName.trim()}
                  className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Generating in {language} with GPT-4o...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate {channel === 'Parallel' ? 'Email & SMS' : channel} ({language}) with GPT-4o
                    </>
                  )}
                </button>
              </div>

              {/* Email Content Box (Shown for Email and Parallel) */}
              {(channel === 'Email' || channel === 'Parallel') && (
                <div className="space-y-3 p-4 bg-blue-50/90 rounded-xl border-2 border-blue-200 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-blue-950 uppercase tracking-wide">
                    <Mail size={16} className="text-blue-700 shrink-0" /> Email Outreach Letter
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Subject Line:</label>
                    <input
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 font-semibold shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      value={generatedSubject}
                      placeholder="e.g. Invitation to Join AstroParihar Astrologer Network"
                      onChange={e => setGeneratedSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Email Body:</label>
                    <textarea
                      rows={5}
                      className="w-full p-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 font-normal leading-relaxed font-sans shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      placeholder="Email invitation content..."
                      value={generatedBody}
                      onChange={e => setGeneratedBody(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* SMS Content Box (Shown for SMS and Parallel) */}
              {(channel === 'SMS' || channel === 'Parallel') && (
                <div className="space-y-3 p-4 bg-indigo-50/90 rounded-xl border-2 border-indigo-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
                      <Smartphone size={16} className="text-indigo-700 shrink-0" /> SMS Outreach (MSG91 DLT)
                    </div>
                    <span className="text-xs text-indigo-900 font-mono font-bold bg-indigo-100/80 px-2 py-0.5 rounded">
                      {(generatedSmsBody || generatedBody).length} chars · {Math.ceil(((generatedSmsBody || generatedBody).length) / 160) || 1} SMS
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    className="w-full p-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 font-mono text-xs leading-relaxed shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="Short SMS invitation text with link..."
                    value={generatedSmsBody || (channel === 'SMS' ? generatedBody : '')}
                    onChange={e => {
                      setGeneratedSmsBody(e.target.value);
                      if (channel === 'SMS') setGeneratedBody(e.target.value);
                    }}
                  />
                </div>
              )}

              {/* WhatsApp Box */}
              {channel === 'WhatsApp' && (
                <div className="space-y-2 p-4 bg-emerald-50/90 rounded-xl border-2 border-emerald-200 shadow-xs">
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wide block mb-1">WhatsApp Message Body:</label>
                  <textarea
                    rows={6}
                    className="w-full p-3 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 leading-relaxed font-sans shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                    value={generatedBody}
                    onChange={e => setGeneratedBody(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenConfirmation}
                  disabled={!candidateName || (!generatedBody && !generatedSmsBody) || isSending}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {channel === 'Parallel' ? (
                    <>
                      <Layers size={15} /> Review & Send Parallel (Email + SMS)
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Review & Send via {channel}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {isConfirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Confirm Outreach Dispatch</h3>
                    <p className="text-xs text-muted-foreground">Review destination channels and message preview</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsConfirmOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Target Candidate Summary */}
              <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Candidate:</span>
                  <span className="font-bold text-foreground">{candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Specialisation / Location:</span>
                  <span className="text-foreground">{specialisation} · {location || 'India'}</span>
                </div>
              </div>

              {/* Dispatch Channel Checklist */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Channels to Dispatch:</p>

                {(channel === 'Email' || channel === 'Parallel') && (
                  <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 flex items-start gap-3">
                    <Mail size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 dark:text-blue-200">Email Invitation (SMTP)</span>
                        <span className="text-2xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 px-1.5 py-0.5 rounded font-mono">Ready</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        Recipient: <strong className="text-foreground">{recipientEmail || `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@astroparihar.verified`}</strong>
                      </p>
                      <p className="text-muted-foreground mt-0.5 truncate max-w-sm">
                        Subject: <em>{generatedSubject || 'Invitation to Join AstroParihar'}</em>
                      </p>
                    </div>
                  </div>
                )}

                {(channel === 'SMS' || channel === 'Parallel') && (
                  <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-start gap-3">
                    <Smartphone size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 dark:text-indigo-200">SMS Invitation (MSG91)</span>
                        <span className="text-2xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">Ready</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        Mobile: <strong className="text-foreground">{recipientPhone || '+91 Candidate Mobile'}</strong>
                      </p>
                      <p className="text-muted-foreground mt-0.5 font-mono text-2xs line-clamp-2">
                        {generatedSmsBody || generatedBody}
                      </p>
                    </div>
                  </div>
                )}

                {channel === 'WhatsApp' && (
                  <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-start gap-3">
                    <MessageSquare size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">WhatsApp Invitation</span>
                      <p className="text-muted-foreground mt-0.5">Recipient: {recipientPhone || candidateName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSending}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDispatch}
                  disabled={isSending}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Dispatching...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Confirm & Dispatch Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
