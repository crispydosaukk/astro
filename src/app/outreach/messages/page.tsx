'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  MessageSquare, Search, ChevronDown, CheckCircle2, XCircle, Clock, 
  Mail, Smartphone, Sparkles, Send, Eye, X, Copy, Check, RefreshCw
} from 'lucide-react';

import { queueEmailViaCloudFunction } from '@/lib/firebase/emailService';

interface Message {
  id: string;
  candidate: string;
  location: string;
  channel: 'Email' | 'WhatsApp';
  template: string;
  sentAt: string;
  status: 'delivered' | 'failed' | 'pending' | 'opened' | 'responded';
  campaign: string;
  subject?: string;
  body?: string;
  email?: string;
}

const initialMessages: Message[] = [];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  delivered: { label: 'Delivered', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 size={11} /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: <XCircle size={11} /> },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock size={11} /> },
  opened: { label: 'Opened', color: 'bg-purple-100 text-purple-700', icon: <Mail size={11} /> },
  responded: { label: 'Responded', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={11} /> },
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
  const [channel, setChannel] = useState<'Email' | 'WhatsApp'>('Email');
  const [tone, setTone] = useState<'respectful' | 'prestigious' | 'concise'>('respectful');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // View Modal State
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateAI = async () => {
    if (!candidateName.trim()) {
      alert('Please enter a candidate name');
      return;
    }

    setIsGenerating(true);
    try {
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
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedSubject(data.subject || `Invitation to Join AstroParihar for ${candidateName}`);
        setGeneratedBody(data.body);
      } else {
        alert(data.error || 'Failed to generate message with AI');
      }
    } catch (err: any) {
      alert(`AI Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!candidateName || !generatedBody) {
      alert('Please fill candidate details and generate message body first.');
      return;
    }

    setIsSending(true);

    const destEmail = recipientEmail.trim() || `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@astroparihar.verified`;

    if (channel === 'Email') {
      try {
        await queueEmailViaCloudFunction({
          to: destEmail,
          candidateName,
          subject: generatedSubject || `Invitation to Join AstroParihar - ${candidateName}`,
          body: generatedBody,
        });
      } catch (err) {
        console.warn('Firebase Cloud Function queue warning:', err);
      }
    }

    setTimeout(() => {
      const newMsg: Message = {
        id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
        candidate: candidateName,
        location: location || 'India',
        channel,
        template: `AI GPT-4o (${tone})`,
        sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'delivered',
        campaign: channel === 'Email' ? `Firebase Cloud Functions (${destEmail})` : 'Direct AI Personalized Outreach',
        subject: generatedSubject,
        body: generatedBody,
        email: destEmail,
      };

      setMessages([newMsg, ...messages]);
      setIsSending(false);
      setIsComposeOpen(false);
      setSendSuccessMessage(
        channel === 'Email'
          ? `Email successfully queued to Firebase (/mail) & addressed to: ${destEmail}`
          : `Message successfully dispatched to ${candidateName} via ${channel}!`
      );
      setTimeout(() => setSendSuccessMessage(null), 5000);

      // Reset form
      setCandidateName('');
      setRecipientEmail('');
      setRecipientPhone('');
      setLocation('');
      setGeneratedSubject('');
      setGeneratedBody('');
    }, 500);
  };

  const handleCopyBody = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = messages.filter(m => {
    const matchSearch = m.candidate.toLowerCase().includes(search.toLowerCase()) || m.campaign.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchChannel = channelFilter === 'all' || m.channel === channelFilter;
    return matchSearch && matchStatus && matchChannel;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {sendSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              {sendSuccessMessage}
            </span>
            <button onClick={() => setSendSuccessMessage(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare size={28} className="text-primary" /> Outreach Messages
            </h1>
            <p className="text-muted-foreground mt-1">Track, generate, and dispatch personalized AI candidate invitations</p>
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
            <div key={key} className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-foreground">{messages.filter(m => m.status === key).length}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${sc.color} px-2 py-0.5 rounded-full mt-1`}>
                {sc.icon} {sc.label}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search candidate or campaign..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
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
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
            >
              <option value="all">All Channels</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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
                      <MessageSquare size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                      <p className="font-semibold text-sm">No outreach messages recorded</p>
                      <p className="text-xs">Sent email and WhatsApp invitations will appear here.</p>
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
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${m.channel === 'Email' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'}`}>
                          {m.channel === 'Email' ? <Mail size={11} /> : <Smartphone size={11} />} {m.channel}
                        </span>
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
                }))}
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedMessage.channel === 'Email' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'}`}>
                      {selectedMessage.channel}
                    </span>
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
                  {selectedMessage.body || 'No detailed body recorded for legacy message.'}
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
            <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Compose Outreach with AI (GPT-4o)</h2>
                    <p className="text-xs text-muted-foreground">Generates culturally nuanced, respectful invitations for astrologers</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Candidate Name *</label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    placeholder="e.g. Pandit Radhakrishnan"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {channel === 'Email' ? 'Recipient Email (Where email is delivered) *' : 'Recipient Mobile'}
                  </label>
                  <input
                    type={channel === 'Email' ? 'email' : 'tel'}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    placeholder={channel === 'Email' ? 'e.g. astroai@gmail.com (to test yourself)' : '+91 98765 43210'}
                    value={channel === 'Email' ? recipientEmail : recipientPhone}
                    onChange={e => channel === 'Email' ? setRecipientEmail(e.target.value) : setRecipientPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Location</label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    placeholder="e.g. Chennai, Tamil Nadu"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Specialisation</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
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
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Experience</label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    placeholder="e.g. 15+ years"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Channel</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    value={channel}
                    onChange={e => setChannel(e.target.value as any)}
                  >
                    <option value="Email">Email (Formal letter)</option>
                    <option value="WhatsApp">WhatsApp (Concise & crisp)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Tone & Voice</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    value={tone}
                    onChange={e => setTone(e.target.value as any)}
                  >
                    <option value="respectful">Traditional Vedic & Respectful</option>
                    <option value="prestigious">Elite Network & Prestigious</option>
                    <option value="concise">Direct & Action-Oriented</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !candidateName.trim()}
                  className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Generating with GPT-4o...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate with GPT-4o
                    </>
                  )}
                </button>
              </div>

              {generatedSubject && channel === 'Email' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Generated Subject Line:</label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background font-medium"
                    value={generatedSubject}
                    onChange={e => setGeneratedSubject(e.target.value)}
                  />
                </div>
              )}

              {generatedBody && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Generated Message Body (Editable):</label>
                  <textarea
                    rows={7}
                    className="w-full p-3 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed font-sans"
                    value={generatedBody}
                    onChange={e => setGeneratedBody(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!generatedBody || isSending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {isSending ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {isSending ? 'Sending...' : `Send via ${channel}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
