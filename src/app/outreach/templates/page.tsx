'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { BookOpen, Plus, Edit2, Copy, Eye, Check, X } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  channel: 'Email' | 'WhatsApp';
  subject?: string;
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
];

export default function OutreachTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'Email' | 'WhatsApp'>('Email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('astroparihar_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setTemplates(parsed);
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
    setBody('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Template) => {
    setEditingTemplate(t);
    setName(t.name);
    setChannel(t.channel);
    setSubject(t.subject || '');
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
        preview: body,
      } : t);
      saveTemplates(updated);
    } else {
      const newTpl: Template = {
        id: `TPL-${String(templates.length + 1).padStart(3, '0')}`,
        name,
        channel,
        subject: channel === 'Email' ? subject : undefined,
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen size={28} className="text-primary" /> Outreach Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Customizable invitation message templates with dynamic variable tokens
            </p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> New Template
          </button>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="card-elevated p-5 flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    t.channel === 'Email' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {t.channel}
                  </span>
                  <span className="text-2xs text-muted-foreground font-mono">{t.id}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{t.name}</h3>
                {t.subject && (
                  <p className="text-xs text-muted-foreground mt-1 font-medium italic truncate">
                    Subject: {t.subject}
                  </p>
                )}
                <div className="mt-3 p-3 bg-muted/40 rounded-xl text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto border border-border">
                  {t.preview}
                </div>
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

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
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
                    <div className="flex gap-1">
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
                    rows={5}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Type invitation template with {{variable}} tokens..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background font-mono text-xs"
                  />
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
