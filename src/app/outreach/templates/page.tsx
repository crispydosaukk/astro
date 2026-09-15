'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { BookOpen, Plus, Edit2, Copy, Check, X, Smartphone, Mail, MessageSquare } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  subject?: string;
  templateId?: string; // MSG91 / DLT Flow Template ID
  preview: string;
  variables: string[];
  usageCount: number;
  lastUsed?: string;
  status: 'active' | 'draft' | 'archived';
}

const defaultTemplates: Template[] = [
  {
    id: 'TPL-001',
    name: 'Standard Vedic Invitation',
    channel: 'Email',
    subject: 'Invitation to Join AstroParihar – Verified Astrologer Network',
    preview: 'Namaste {{candidate_name}},\n\nAstroParihar is expanding its network of verified, authentic astrologers. Having reviewed your esteemed practice in {{specialisation}} in {{location}}, we would be honored to invite you to our credentialed platform.\n\nWarm regards,\nAstroParihar Onboarding Committee',
    variables: ['candidate_name', 'specialisation', 'location'],
    usageCount: 0,
    lastUsed: '—',
    status: 'active',
  },
  {
    id: 'TPL-002',
    name: 'Specialist Outreach (KP & Nadi)',
    channel: 'Email',
    subject: 'Special Partnership for {{specialisation}} Practitioners',
    preview: 'Respected {{candidate_name}},\n\nYour deep expertise in {{specialisation}} matches our highest tier. We invite you to explore premier consultations with AstroParihar verified network.',
    variables: ['candidate_name', 'specialisation'],
    usageCount: 0,
    lastUsed: '—',
    status: 'active',
  },
  {
    id: 'TPL-003',
    name: 'WhatsApp Fast-Track Invite',
    channel: 'WhatsApp',
    preview: 'Namaste {{candidate_name}} 🙏 AstroParihar invites you to join India\'s trusted verified astrologer network. Review your onboarding details: https://astroparihar.com/join',
    variables: ['candidate_name'],
    usageCount: 0,
    lastUsed: '—',
    status: 'active',
  },
  {
    id: 'TPL-004',
    name: 'SMS Quick Invitation (MSG91 / DLT)',
    channel: 'SMS',
    templateId: '6aa8fed13fe8bde5ca0083e4',
    preview: 'Namaste {{name}} Ji, AstroParihar invites you to join our verified astrologer panel. Apply: {{link}}',
    variables: ['name', 'link'],
    usageCount: 0,
    lastUsed: '—',
    status: 'active',
  },
  {
    id: 'TPL-005',
    name: 'SMS Specialist Fast-Track',
    channel: 'SMS',
    templateId: '6aa8fed13fe8bde5ca0083e4',
    preview: 'Namaste {{name}} Ji, your astrology practice in {{location}} is shortlisted for AstroParihar. Apply: {{link}}',
    variables: ['name', 'link', 'location'],
    usageCount: 0,
    lastUsed: '—',
    status: 'active',
  },
];

export default function OutreachTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [channelFilter, setChannelFilter] = useState<'all' | 'Email' | 'WhatsApp' | 'SMS'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'Email' | 'WhatsApp' | 'SMS'>('Email');
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [body, setBody] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('astroparihar_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with default templates if SMS templates missing
          const hasSms = parsed.some((t: Template) => t.channel === 'SMS');
          if (!hasSms) {
            setTemplates([...parsed, defaultTemplates[3], defaultTemplates[4]]);
          } else {
            setTemplates(parsed);
          }
        }
      } catch (_e) {}
    }
  }, []);

  const saveTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('astroparihar_templates', JSON.stringify(newTemplates));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setName('');
    setChannel('Email');
    setSubject('');
    setTemplateId('6a72130b9c56d8f88f079d52');
    setBody('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Template) => {
    setEditingTemplate(t);
    setName(t.name);
    setChannel(t.channel);
    setSubject(t.subject || '');
    setTemplateId(t.templateId || '');
    setBody(t.preview);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;

    if (editingTemplate) {
      const updated = templates.map(t => t.id === editingTemplate.id ? {
        ...t,
        name,
        channel,
        subject: channel === 'Email' ? subject : undefined,
        templateId: channel === 'SMS' ? templateId : undefined,
        preview: body,
      } : t);
      saveTemplates(updated);
    } else {
      const newTpl: Template = {
        id: `TPL-${String(templates.length + 1).padStart(3, '0')}`,
        name,
        channel,
        subject: channel === 'Email' ? subject : undefined,
        templateId: channel === 'SMS' ? (templateId || '6a72130b9c56d8f88f079d52') : undefined,
        preview: body,
        variables: ['candidate_name', 'specialisation', 'location'],
        usageCount: 0,
        lastUsed: 'Just created',
        status: 'active',
      };
      saveTemplates([newTpl, ...templates]);
    }
    setIsModalOpen(false);
  };

  const insertVariable = (varName: string) => {
    setBody(prev => prev + ` {{${varName}}}`);
  };

  const filtered = channelFilter === 'all' 
    ? templates 
    : templates.filter(t => t.channel === channelFilter);

  const getChannelBadge = (ch: 'Email' | 'WhatsApp' | 'SMS') => {
    switch (ch) {
      case 'Email':
        return <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><Mail size={10} /> Email</span>;
      case 'WhatsApp':
        return <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><MessageSquare size={10} /> WhatsApp</span>;
      case 'SMS':
        return <span className="inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"><Smartphone size={10} /> SMS (MSG91)</span>;
    }
  };

  const charCount = body.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen size={28} className="text-primary" /> Outreach Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Customizable invitation message templates across Email, WhatsApp & SMS (MSG91)
            </p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> New Template
          </button>
        </div>

        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          {(['all', 'Email', 'SMS', 'WhatsApp'] as const).map(ch => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                channelFilter === ch
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {ch === 'all' ? 'All Channels' : ch === 'SMS' ? 'SMS (MSG91)' : ch}
              <span className="ml-1.5 opacity-70 text-2xs font-mono">
                ({ch === 'all' ? templates.length : templates.filter(t => t.channel === ch).length})
              </span>
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="card-elevated p-5 flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  {getChannelBadge(t.channel)}
                  <span className="text-2xs text-muted-foreground font-mono">{t.id}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                
                {t.subject && (
                  <p className="text-xs text-muted-foreground mt-1 font-medium italic truncate">
                    Subject: {t.subject}
                  </p>
                )}
                {t.templateId && (
                  <p className="text-2xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono font-medium">
                    MSG91 Flow ID: {t.templateId}
                  </p>
                )}

                <div className="mt-3 p-3 bg-muted/40 rounded-xl text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto border border-border">
                  {t.preview}
                </div>

                {t.channel === 'SMS' && (
                  <div className="mt-2 flex items-center justify-between text-2xs text-muted-foreground">
                    <span>{t.preview.length} chars</span>
                    <span>{Math.ceil(t.preview.length / 160) || 1} SMS segment</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Used {t.usageCount} times</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(t.id, t.preview)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy template text"
                  >
                    {copiedId === t.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit template"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold text-foreground">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Template Name *</label>
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Prestigious Vedic Network Invite"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Channel</label>
                    <select
                      value={channel}
                      onChange={e => setChannel(e.target.value as any)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background font-medium"
                    >
                      <option value="Email">Email</option>
                      <option value="SMS">SMS (MSG91 Gateway)</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </div>

                  {channel === 'SMS' && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">MSG91 / DLT Template ID</label>
                      <input
                        value={templateId}
                        onChange={e => setTemplateId(e.target.value)}
                        placeholder="e.g. 6a72130b9c56d8f88f079d52"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background font-mono text-xs"
                      />
                    </div>
                  )}
                </div>

                {channel === 'Email' && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Subject Line</label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. Invitation to Join AstroParihar Elite Panel"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-muted-foreground">Message Body *</label>
                    <div className="flex gap-1 flex-wrap">
                      {['candidate_name', 'specialisation', 'location'].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="text-2xs bg-primary/10 text-primary px-1.5 py-0.5 rounded hover:bg-primary/20 transition-colors"
                        >
                          + {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    required
                    rows={channel === 'SMS' ? 4 : 5}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Type invitation template with {{variable}} tokens..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background font-mono text-xs"
                  />
                  {channel === 'SMS' && (
                    <div className="flex justify-between items-center text-2xs text-muted-foreground mt-1">
                      <span>Standard SMS: 160 chars / credit</span>
                      <span className={`font-mono ${charCount > 160 ? 'text-amber-600 font-semibold' : ''}`}>
                        {charCount} chars · {smsSegments} segment{smsSegments > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-2 px-4">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4">
                    Save Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
