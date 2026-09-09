'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  Settings, 
  Save, 
  Globe, 
  Search, 
  Send, 
  CheckSquare, 
  Timer, 
  Bell, 
  Shield, 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server,
  Flame,
  Key,
  Bot,
  Sparkles,
  Cpu,
  Zap
} from 'lucide-react';
import { firebaseConfig } from '@/lib/firebase';
import { testFirestoreConnection, seedInitialCandidates } from '@/lib/firebase/candidateService';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [seedingDb, setSeedingDb] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  // OpenAI Diagnostic states
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const [openAIResult, setOpenAIResult] = useState<{ success: boolean; message: string; latencyMs?: number; modelsCount?: number } | null>(null);
  const [runningEval, setRunningEval] = useState(false);
  const [evalResult, setEvalResult] = useState<any | null>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await testFirestoreConnection();
      setConnectionResult(res);
    } catch (e: any) {
      setConnectionResult({ success: false, message: e?.message || 'Connection failed' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeedingDb(true);
    setSeedResult(null);
    try {
      const res = await seedInitialCandidates();
      setSeedResult(res);
    } catch (e: any) {
      setSeedResult({ success: false, message: e?.message || 'Seed failed' });
    } finally {
      setSeedingDb(false);
    }
  };

  const handleTestOpenAI = async () => {
    setTestingOpenAI(true);
    setOpenAIResult(null);
    try {
      const res = await fetch('/api/ai/test-connection');
      const data = await res.json();
      setOpenAIResult(data);
    } catch (err: any) {
      setOpenAIResult({ success: false, message: err?.message || 'Failed to connect to OpenAI' });
    } finally {
      setTestingOpenAI(false);
    }
  };

  const handleRunSampleEval = async () => {
    setRunningEval(true);
    setEvalResult(null);
    try {
      const res = await fetch('/api/ai/qualify-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Pandit Rajesh Shastri',
          specialization: 'Vedic Astrology, Prashna Kundali, Vastu',
          experienceYears: 12,
          languages: ['Hindi', 'Sanskrit', 'English'],
          consultationCount: 2500,
        }),
      });
      const data = await res.json();
      setEvalResult(data?.evaluation || null);
    } catch (err: any) {
      setOpenAIResult({ success: false, message: err?.message || 'Evaluation failed' });
    } finally {
      setRunningEval(false);
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: <Globe size={14} /> },
    { id: 'openai', label: 'AI & OpenAI', icon: <Bot size={14} /> },
    { id: 'firebase', label: 'Firebase & DB', icon: <Database size={14} /> },
    { id: 'discovery', label: 'Discovery', icon: <Search size={14} /> },
    { id: 'scoring', label: 'Scoring', icon: <CheckSquare size={14} /> },
    { id: 'outreach', label: 'Outreach', icon: <Send size={14} /> },
    { id: 'assessment', label: 'Assessment', icon: <CheckSquare size={14} /> },
    { id: 'probation', label: 'Probation', icon: <Timer size={14} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
    { id: 'security', label: 'Security', icon: <Shield size={14} /> },
  ];


  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings size={28} className="text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure platform settings, integrations and preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {sections?.map(s => (
                <button
                  key={s?.id}
                  onClick={() => setActiveSection(s?.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${activeSection === s?.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  {s?.icon} {s?.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-card border border-border rounded-xl p-6 space-y-6">
            {activeSection === 'general' && (
              <>
                <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Platform Name', value: 'AstroParihar', type: 'text' },
                    { label: 'Contact Email', value: 'astroai@gmail.com', type: 'email' },
                    { label: 'Default Country', value: 'India', type: 'text' },
                    { label: 'Default Timezone', value: 'Asia/Kolkata', type: 'text' },
                  ]?.map(field => (
                    <div key={field?.label}>
                      <label className="block text-sm font-medium text-foreground mb-1">{field?.label}</label>
                      <input
                        type={field?.type}
                        defaultValue={field?.value}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'openai' && (
              <>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Bot size={20} className="text-primary" /> AI & OpenAI Engine Configuration
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Integrated from your astroparihar platform. Powers AI candidate discovery, qualification scoring, and automated recruiter outreach.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Model: GPT-4o Connected
                  </span>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Cpu size={16} /> Primary Model
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deep astrological qualification, score generation, and nuanced candidate review.
                    </p>
                    <span className="inline-block mt-3 text-2xs font-mono bg-background px-2 py-0.5 rounded border border-border font-bold text-foreground">
                      gpt-4o
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Zap size={16} /> Fast Model
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      High-throughput applicant bio extraction, structured data parsing, and duplicate matching.
                    </p>
                    <span className="inline-block mt-3 text-2xs font-mono bg-background px-2 py-0.5 rounded border border-border font-bold text-foreground">
                      gpt-4o-mini
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Key size={16} /> Configured API Key
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active key loaded from astroparihar desktop workspace.
                    </p>
                    <span className="inline-block mt-3 text-2xs font-mono bg-background px-2 py-0.5 rounded border border-border text-foreground font-semibold">
                      sk-proj-VEAls...VdOVsA
                    </span>
                  </div>
                </div>

                {/* Diagnostics and Live Connection Test */}
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <Activity size={16} className="text-primary" /> Live OpenAI API Diagnostics
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ping the OpenAI endpoint to check authentication validity, model availability, and roundtrip latency.
                      </p>
                    </div>
                    <button
                      onClick={handleTestOpenAI}
                      disabled={testingOpenAI}
                      className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2 shadow-xs"
                    >
                      {testingOpenAI ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Zap size={13} />
                          Test OpenAI Connection
                        </>
                      )}
                    </button>
                  </div>

                  {openAIResult && (
                    <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 border animate-fade-in ${
                      openAIResult.success 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                        : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}>
                      {openAIResult.success ? (
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {openAIResult.success ? 'OpenAI Connection Verified' : 'Connection Error'}
                        </p>
                        <p className="mt-0.5 text-xs opacity-90">{openAIResult.message}</p>
                        {openAIResult.latencyMs && (
                          <p className="mt-1 text-2xs font-mono opacity-80">
                            Latency: {openAIResult.latencyMs}ms • Accessible Models: {openAIResult.modelsCount}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Candidate Qualification Sample */}
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" /> Test AI Candidate Evaluation (GPT-4o)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Run a real-time qualification test on a sample astrologer profile using GPT-4o.
                      </p>
                    </div>
                    <button
                      onClick={handleRunSampleEval}
                      disabled={runningEval}
                      className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 text-primary border-primary/40 hover:bg-primary/5"
                    >
                      {runningEval ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Evaluating with GPT-4o...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          Run Sample Evaluation
                        </>
                      )}
                    </button>
                  </div>

                  {evalResult && (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 text-xs animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-sm">
                          Sample Candidate: Pandit Rajesh Shastri (12 yrs exp)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-sm">
                            Score: {evalResult.qualificationScore}/100
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-2xs font-bold">
                            {evalResult.recommendation}
                          </span>
                        </div>
                      </div>
                      <p className="text-foreground leading-relaxed italic">
                        "{evalResult.summary}"
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                        <div>
                          <strong className="block text-emerald-700 font-semibold mb-1">Key Strengths:</strong>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {evalResult.strengths?.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="block text-primary font-semibold mb-1">Assessment Focus Areas:</strong>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {evalResult.suggestedFocusAreas?.map((q: string, idx: number) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === 'firebase' && (
              <>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Flame size={20} className="text-amber-500" /> Firebase & Database Configuration
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Manage connectivity, Firestore database sync, and Firebase Authentication for AstroParihar.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Project: {firebaseConfig.projectId}
                  </span>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Database size={16} /> Cloud Firestore
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      NoSQL document database for candidates, campaigns, and review audits.
                    </p>
                    <span className="inline-block mt-3 text-2xs font-mono bg-background px-2 py-0.5 rounded border border-border">
                      Collection: candidates
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Key size={16} /> Firebase Auth
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Email/Password and Identity management for Super Admin and Recruiter roles.
                    </p>
                    <span className="inline-block mt-3 text-2xs font-mono bg-background px-2 py-0.5 rounded border border-border">
                      Domain: {firebaseConfig.authDomain}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Activity size={16} /> Analytics & Storage
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Event analytics and cloud document storage for astrologer certificates.
                    </p>
                    <span className="inline-block mt-3 text-2xs font-mono bg-background px-2 py-0.5 rounded border border-border">
                      Bucket: {firebaseConfig.storageBucket}
                    </span>
                  </div>
                </div>

                {/* Live Diagnostics Section */}
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <Activity size={16} className="text-primary" /> Connectivity Diagnostics
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Test read and write latency against your live Cloud Firestore database.
                      </p>
                    </div>
                    <button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2"
                    >
                      {testingConnection ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Pinging Database...
                        </>
                      ) : (
                        <>
                          <Activity size={13} />
                          Test Firestore Connection
                        </>
                      )}
                    </button>
                  </div>

                  {connectionResult && (
                    <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 border ${
                      connectionResult.success 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      {connectionResult.success ? (
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {connectionResult.success ? 'Connection Successful' : 'Connection Notice'}
                        </p>
                        <p className="mt-0.5 text-xs opacity-90">{connectionResult.message}</p>
                        {!connectionResult.success && (
                          <p className="mt-1.5 text-2xs opacity-75">
                            Tip: In your Firebase Console under Firestore Database &gt; Rules, ensure read/write rules permit access for development or authenticated users.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Database Actions */}
                <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <Server size={16} className="text-primary" /> Database Population & Seeding
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Seed initial astrologer candidate records directly into your Firestore `candidates` collection.
                      </p>
                    </div>
                    <button
                      onClick={handleSeedDatabase}
                      disabled={seedingDb}
                      className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 text-primary border-primary/40 hover:bg-primary/5"
                    >
                      {seedingDb ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Seeding Database...
                        </>
                      ) : (
                        <>
                          <Database size={13} />
                          Seed Sample Candidates
                        </>
                      )}
                    </button>
                  </div>

                  {seedResult && (
                    <div className={`p-3.5 rounded-lg text-xs flex items-center gap-2 border ${
                      seedResult.success 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                        : 'bg-red-50 text-red-900 border-red-200'
                    }`}>
                      {seedResult.success ? (
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={15} className="text-red-600" />
                      )}
                      <span>{seedResult.message}</span>
                    </div>
                  )}
                </div>

                {/* Current Firebase Config Parameters */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Connected Firebase Credentials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <span className="text-muted-foreground block text-2xs uppercase tracking-wider">Project ID</span>
                      <span className="font-mono font-medium text-foreground mt-0.5 block">{firebaseConfig.projectId}</span>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <span className="text-muted-foreground block text-2xs uppercase tracking-wider">Auth Domain</span>
                      <span className="font-mono font-medium text-foreground mt-0.5 block">{firebaseConfig.authDomain}</span>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <span className="text-muted-foreground block text-2xs uppercase tracking-wider">Storage Bucket</span>
                      <span className="font-mono font-medium text-foreground mt-0.5 block">{firebaseConfig.storageBucket}</span>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <span className="text-muted-foreground block text-2xs uppercase tracking-wider">Measurement ID</span>
                      <span className="font-mono font-medium text-foreground mt-0.5 block">{firebaseConfig.measurementId}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'discovery' && (

              <>
                <h2 className="text-lg font-semibold text-foreground">Discovery Settings</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Default Search Limit per Campaign', value: '100', type: 'number' },
                    { label: 'Minimum AI Score Threshold', value: '80', type: 'number' },
                    { label: 'Max Candidates per Job', value: '500', type: 'number' },
                  ]?.map(field => (
                    <div key={field?.label}>
                      <label className="block text-sm font-medium text-foreground mb-1">{field?.label}</label>
                      <input
                        type={field?.type}
                        defaultValue={field?.value}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Enabled Search Sources</label>
                    <div className="space-y-2">
                      {['Web Search', 'Google Places', 'Astrology Directory India', 'Sulekha']?.map(source => (
                        <label key={source} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <input type="checkbox" defaultChecked className="rounded" /> {source}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'scoring' && (
              <>
                <h2 className="text-lg font-semibold text-foreground">Scoring Configuration</h2>
                <p className="text-sm text-muted-foreground">Configure AI qualification scoring weights. Total must equal 100%.</p>
                <div className="space-y-4">
                  {[
                    { label: 'Vedic Relevance', value: 25 },
                    { label: 'Professional Experience', value: 20 },
                    { label: 'Professional Identity', value: 15 },
                    { label: 'Website Credibility', value: 15 },
                    { label: 'Specialisation Fit', value: 15 },
                    { label: 'Contactability', value: 10 },
                  ]?.map(criterion => (
                    <div key={criterion?.label} className="flex items-center gap-4">
                      <label className="text-sm font-medium text-foreground w-48 flex-shrink-0">{criterion?.label}</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        defaultValue={criterion?.value}
                        className="flex-1"
                      />
                      <span className="text-sm font-bold text-foreground w-12 text-right">{criterion?.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'outreach' && (
              <>
                <h2 className="text-lg font-semibold text-foreground">Outreach Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Require Admin Approval Before Outreach</label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" defaultChecked className="rounded" /> Yes, require approval (recommended)
                    </label>
                  </div>
                  {[
                    { label: 'Follow-up Delay (days)', value: '7', type: 'number' },
                    { label: 'Max Follow-ups per Candidate', value: '2', type: 'number' },
                  ]?.map(field => (
                    <div key={field?.label}>
                      <label className="block text-sm font-medium text-foreground mb-1">{field?.label}</label>
                      <input
                        type={field?.type}
                        defaultValue={field?.value}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'assessment' && (
              <>
                <h2 className="text-lg font-semibold text-foreground">Assessment Settings</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Number of Questions', value: '25', type: 'number' },
                    { label: 'Number of Chart Cases', value: '5', type: 'number' },
                    { label: 'Minimum Pass Score (%)', value: '70', type: 'number' },
                    { label: 'Assessment Time Limit (minutes)', value: '120', type: 'number' },
                  ]?.map(field => (
                    <div key={field?.label}>
                      <label className="block text-sm font-medium text-foreground mb-1">{field?.label}</label>
                      <input
                        type={field?.type}
                        defaultValue={field?.value}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'probation' && (
              <>
                <h2 className="text-lg font-semibold text-foreground">Probation Settings</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Default Probation Period (days)', value: '30', type: 'number' },
                    { label: 'Extension Period (days)', value: '30', type: 'number' },
                  ]?.map(field => (
                    <div key={field?.label}>
                      <label className="block text-sm font-medium text-foreground mb-1">{field?.label}</label>
                      <input
                        type={field?.type}
                        defaultValue={field?.value}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Checkpoint Days</label>
                    <div className="flex gap-2">
                      {['7', '15', '30']?.map(day => (
                        <div key={day} className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-lg text-sm">
                          Day {day} <button className="text-muted-foreground hover:text-red-500 ml-1">×</button>
                        </div>
                      ))}
                      <button className="px-3 py-1.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {(activeSection === 'notifications' || activeSection === 'security') && (
              <div className="text-center py-12 text-muted-foreground">
                <Settings size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium capitalize">{activeSection} settings</p>
                <p className="text-sm mt-1">Configuration options coming soon</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
                <Save size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
