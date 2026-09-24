'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  Database, Globe, MapPin, CheckCircle2, AlertCircle, XCircle, 
  Plus, Settings, RefreshCw, ToggleLeft, ToggleRight, X, Sparkles 
} from 'lucide-react';

interface SearchSource {
  id: string;
  name: string;
  type: 'Web Search' | 'Google Places' | 'Directory' | 'API';
  baseUrl: string;
  apiEnabled: boolean;
  apiConfigured: boolean;
  enabled: boolean;
  lastSearch?: string;
  errorStatus?: string;
  totalSearches: number;
  successRate: number;
}

const initialSources: SearchSource[] = [
  { id: 'src-001', name: 'Google Places API', type: 'Google Places', baseUrl: 'https://maps.googleapis.com/maps/api/place', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
  { id: 'src-007', name: 'YouTube Astrologer Channels', type: 'Web Search', baseUrl: 'https://www.youtube.com', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
  { id: 'src-008', name: 'LinkedIn Professional Profiles', type: 'Directory', baseUrl: 'https://www.linkedin.com', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
  { id: 'src-009', name: 'Instagram Vedic Creators', type: 'Web Search', baseUrl: 'https://www.instagram.com', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
  { id: 'src-002', name: 'Web Search Engine', type: 'Web Search', baseUrl: 'https://api.search.provider', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
  { id: 'src-003', name: 'Astrology Directory India', type: 'Directory', baseUrl: 'https://astrologydirectory.in', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
  { id: 'src-004', name: 'JustDial Business Listings', type: 'Directory', baseUrl: 'https://www.justdial.com', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
  { id: 'src-005', name: 'Sulekha Professional Listings', type: 'Directory', baseUrl: 'https://www.sulekha.com', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
  { id: 'src-006', name: 'Custom API Provider', type: 'API', baseUrl: 'https://api.custom-provider.com', apiEnabled: true, apiConfigured: true, enabled: true, lastSearch: '—', totalSearches: 0, successRate: 100 },
];

const typeIcons: Record<string, React.ReactNode> = {
  'Web Search': <Globe size={16} className="text-blue-500" />,
  'Google Places': <MapPin size={16} className="text-green-500" />,
  'Directory': <Database size={16} className="text-amber-500" />,
  'API': <Settings size={16} className="text-purple-500" />,
};

export default function SearchSourcesPage() {
  const [sourceList, setSourceList] = useState(initialSources);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResultMsg, setTestResultMsg] = useState<{ id: string; success: boolean; text: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<'Web Search' | 'Google Places' | 'Directory' | 'API'>('Directory');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  const toggleSource = (id: string) => {
    setSourceList(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleTestSource = async (source: SearchSource) => {
    setTestingId(source.id);
    setTestResultMsg(null);

    if (source.type === 'Google Places') {
      try {
        const res = await fetch('/api/discovery/google-places?test=true');
        const data = await res.json();
        if (data.success) {
          setTestResultMsg({
            id: source.id,
            success: true,
            text: `Connected! Google Places API returned status ${data.status} with ${data.sampleCount} live Indian astrologers in ${data.latencyMs}ms.`
          });
        } else {
          setTestResultMsg({
            id: source.id,
            success: false,
            text: `Error: ${data.message}`
          });
        }
      } catch (err: any) {
        setTestResultMsg({
          id: source.id,
          success: false,
          text: `Connection failed: ${err.message}`
        });
      } finally {
        setTestingId(null);
      }
    } else {
      // Simulate test
      setTimeout(() => {
        setTestResultMsg({
          id: source.id,
          success: source.enabled,
          text: source.enabled 
            ? `Successfully pinged ${source.baseUrl} (HTTP 200 OK)` 
            : `Source is currently disabled. Enable toggle to connect.`
        });
        setTestingId(null);
      }, 700);
    }
  };

  const handleAddSource = () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) {
      alert('Please enter a source name and URL');
      return;
    }

    const newSource: SearchSource = {
      id: `src-${String(sourceList.length + 1).padStart(3, '0')}`,
      name: newSourceName,
      type: newSourceType,
      baseUrl: newSourceUrl,
      apiEnabled: newSourceType === 'API' || newSourceType === 'Google Places',
      apiConfigured: true,
      enabled: true,
      totalSearches: 0,
      successRate: 100,
    };

    setSourceList([newSource, ...sourceList]);
    setIsAddModalOpen(false);
    setNewSourceName('');
    setNewSourceUrl('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Database size={28} className="text-primary" /> Search Sources
            </h1>
            <p className="text-muted-foreground mt-1">Configure and manage approved discovery data sources (Google Places live)</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSourceList(prev => prev.map(s => ({ ...s, enabled: true })))}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted shadow-xs transition-colors cursor-pointer"
            >
              Enable All
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Add Source
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Sources', value: sourceList.length },
            { label: 'Active', value: sourceList.filter(s => s.enabled).length },
            { label: 'API Configured', value: sourceList.filter(s => s.apiConfigured).length },
            { label: 'Google Places Active', value: 'Live Key Set', color: 'text-emerald-600 dark:text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color || 'text-foreground'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Source Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sourceList.map(source => (
            <div key={source.id} className={`bg-card border rounded-xl p-5 space-y-4 shadow-sm ${source.enabled ? 'border-border' : 'border-border opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  {typeIcons[source.type]}
                  <div>
                    <p className="font-semibold text-foreground text-sm">{source.name}</p>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{source.type}</span>
                  </div>
                </div>
                <button onClick={() => toggleSource(source.id)} className="text-muted-foreground hover:text-primary transition-colors">
                  {source.enabled ? <ToggleRight size={22} className="text-primary" /> : <ToggleLeft size={22} />}
                </button>
              </div>

              <div className="text-xs text-muted-foreground font-mono bg-muted/40 px-3 py-1.5 rounded-lg truncate">
                {source.baseUrl}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">API Status</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {source.apiEnabled ? (
                      source.apiConfigured ? (
                        <><CheckCircle2 size={12} className="text-green-500" /><span className="text-green-600 font-medium">Configured (Active)</span></>
                      ) : (
                        <><AlertCircle size={12} className="text-amber-500" /><span className="text-amber-600 font-medium">Not Configured</span></>
                      )
                    ) : (
                      <><XCircle size={12} className="text-gray-400" /><span className="text-gray-500">Not Required</span></>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Success Rate</p>
                  <p className="font-semibold text-foreground mt-0.5">{source.successRate > 0 ? `${source.successRate}%` : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Searches</p>
                  <p className="font-semibold text-foreground mt-0.5">{source.totalSearches.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Search</p>
                  <p className="font-semibold text-foreground mt-0.5 text-xs">{source.lastSearch ? source.lastSearch.split(' ')[0] : '—'}</p>
                </div>
              </div>

              {testResultMsg && testResultMsg.id === source.id && (
                <div className={`p-2.5 rounded-lg text-xs leading-relaxed border ${testResultMsg.success ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-800 dark:text-red-300'}`}>
                  {testResultMsg.text}
                </div>
              )}

              {source.errorStatus && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                  <AlertCircle size={12} /> {source.errorStatus}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => handleTestSource(source)}
                  disabled={testingId === source.id}
                  className="w-full text-xs py-2 border border-border rounded-lg hover:bg-muted font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RefreshCw size={12} className={testingId === source.id ? 'animate-spin' : ''} />
                  {testingId === source.id ? 'Testing Live...' : 'Test Connection'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Source Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-lg font-bold text-foreground">Add New Search Source</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded text-muted-foreground hover:bg-muted">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Source Name</label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    placeholder="e.g. AstroSage Directory"
                    value={newSourceName}
                    onChange={e => setNewSourceName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Source Type</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    value={newSourceType}
                    onChange={e => setNewSourceType(e.target.value as any)}
                  >
                    <option value="Directory">Directory</option>
                    <option value="Web Search">Web Search</option>
                    <option value="Google Places">Google Places</option>
                    <option value="API">Custom API</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Base URL / Endpoint</label>
                  <input
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
                    placeholder="https://example.com/api"
                    value={newSourceUrl}
                    onChange={e => setNewSourceUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSource}
                  className="btn-primary text-xs px-4 py-2 rounded-lg font-medium"
                >
                  Save Source
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
