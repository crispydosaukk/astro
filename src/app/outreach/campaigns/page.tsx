'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { GitBranch, Plus, Search, Play, Pause, Send, Users, CheckCircle2, X } from 'lucide-react';
import { 
  Campaign, 
  initialCampaigns, 
  subscribeToCampaigns, 
  saveCampaignToFirestore 
} from '@/lib/firebase/discoveryService';
import Link from 'next/link';

export default function OutreachCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSpecialisation, setNewSpecialisation] = useState('Vedic Jyotish');
  const [newTarget, setNewTarget] = useState(50);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCampaigns(
        (data) => {
          if (data && data.length > 0) setCampaigns(data);
        },
        (err) => console.warn('Outreach campaigns subscription fallback:', err)
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Setup error:', e);
    }
  }, []);

  const handleToggleStatus = async (c: Campaign) => {
    const nextStatus = c.status === 'running' ? 'paused' : 'running';
    const updated: Campaign = {
      ...c,
      status: nextStatus,
      jobStatus: nextStatus === 'running' ? 'Running' : 'Paused',
    };
    setCampaigns(prev => prev.map(item => item.id === c.id ? updated : item));
    await saveCampaignToFirestore(updated);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim() || !newLocation.trim()) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now().toString().slice(-4)}`,
      name: newCampaignName,
      location: newLocation,
      specialisation: newSpecialisation,
      target: Number(newTarget),
      discovered: 0,
      qualified: 0,
      rejected: 0,
      duplicates: 0,
      status: 'running',
      jobStatus: 'Running',
      minScore: 80,
      progress: 0,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastRun: 'Just now',
      sources: ['Google Places', 'Web Search'],
    };

    setCampaigns(prev => [newCamp, ...prev]);
    await saveCampaignToFirestore(newCamp);
    setIsModalOpen(false);
    setNewCampaignName('');
    setNewLocation('');
  };

  const filtered = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalSent = campaigns.reduce((a, c) => a + c.discovered, 0);
  const totalQualified = campaigns.reduce((a, c) => a + c.qualified, 0);
  const totalApplied = Math.round(totalQualified * 0.45);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <GitBranch size={28} className="text-primary" /> Outreach Campaigns
            </h1>
            <p className="text-muted-foreground mt-1">Manage, monitor, and dispatch candidate invitations across Indian regions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/outreach/messages" className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
              <Send size={14} /> AI Message Composer
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus size={14} /> New Campaign
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Campaigns', value: campaigns.length, icon: <GitBranch size={16} /> },
            { label: 'Invitations Dispatched', value: totalSent, icon: <Send size={16} /> },
            { label: 'Qualified Astrologers', value: totalQualified, icon: <Users size={16} /> },
            { label: 'Applications Converted', value: totalApplied, icon: <CheckCircle2 size={16} /> },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                {s.icon} {s.label}
              </div>
              <p className="text-2xl font-bold mt-1 text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search campaigns..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Campaign Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specialisation</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dispatched</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qualified</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.location}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                        {c.specialisation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">{c.discovered}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{c.qualified}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        c.status === 'running' ? 'bg-green-100 text-green-700' :
                        c.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-current'}`} />
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title={c.status === 'running' ? 'Pause Campaign' : 'Resume Campaign'}
                        >
                          {c.status === 'running' ? <Pause size={14} className="text-amber-600" /> : <Play size={14} className="text-green-600" />}
                        </button>
                        <Link
                          href="/outreach/messages"
                          className="px-2.5 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded font-semibold transition-colors"
                        >
                          Compose
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold text-foreground">Create Outreach Campaign</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Campaign Name *</label>
                  <input
                    required
                    value={newCampaignName}
                    onChange={e => setNewCampaignName(e.target.value)}
                    placeholder="e.g. Kolkata Jyotish Wave 2"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Target Location *</label>
                  <input
                    required
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. Kolkata, West Bengal"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Specialisation</label>
                  <select
                    value={newSpecialisation}
                    onChange={e => setNewSpecialisation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  >
                    <option value="Vedic Jyotish">Vedic Jyotish</option>
                    <option value="KP System">KP System</option>
                    <option value="Nadi Astrology">Nadi Astrology</option>
                    <option value="Vastu Shastra">Vastu Shastra</option>
                    <option value="Numerology">Numerology</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Target Invitations</label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={e => setNewTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-2 px-4">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4">
                    Save & Launch
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
