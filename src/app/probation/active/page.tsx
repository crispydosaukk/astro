'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  Timer, Search, Eye, AlertCircle, CheckCircle2, Award, 
  CheckSquare, X, ChevronRight, Sparkles, ExternalLink, Mail, Key, Copy, Check, Send
} from 'lucide-react';
import Link from 'next/link';
import { subscribeToCandidates } from '@/lib/firebase/candidateService';
import { logAuditEvent } from '@/lib/auditLogService';

interface ProbationRecord {
  id: string;
  candidate: string;
  email?: string;
  phone?: string;
  specialisation: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  daysTotal: number;
  assignedReviewer: string;
  checkpointsCompleted: number;
  checkpointsTotal: number;
  currentScore: number;
  issues: number;
  status: 'active' | 'extended' | 'at_risk';
  checkpointLogs?: { day: number; date: string; notes: string; score: number }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300', icon: <CheckCircle2 size={11} /> },
  extended: { label: 'Extended', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', icon: <Timer size={11} /> },
  at_risk: { label: 'At Risk', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300', icon: <AlertCircle size={11} /> },
};

export default function ProbationActivePage() {
  const [probations, setProbations] = useState<ProbationRecord[]>([]);
  const [search, setSearch] = useState('');

  // Milestone modal
  const [activeRecord, setActiveRecord] = useState<ProbationRecord | null>(null);
  const [newLogNotes, setNewLogNotes] = useState('');
  const [newLogScore, setNewLogScore] = useState(90);
  const [notification, setNotification] = useState<string | null>(null);

  // Credentials & Email Modal
  const [credentialsRecord, setCredentialsRecord] = useState<ProbationRecord | null>(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (allCandidates) => {
          const pool = allCandidates || [];
          const candidatesOnProbation = pool.filter(c => 
            c.lifecycleStatus === 'probation' ||
            c.lifecycleStatus === 'verified' ||
            (c.applicationStatus && (c.applicationStatus.toLowerCase().includes('approv') || c.applicationStatus.toLowerCase().includes('probation')))
          );

          const mapped: ProbationRecord[] = candidatesOnProbation.map((c, i) => {
            const start = c.appliedAt ? new Date(c.appliedAt) : new Date();
            const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
            const now = new Date();
            const diffDays = Math.max(1, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            
            return {
              id: c.id,
              candidate: c.name,
              email: c.email || '',
              phone: c.phone || '',
              specialisation: Array.isArray(c.specialisations) ? c.specialisations.join(', ') : (c.specialisations || 'Vedic Jyotish'),
              startDate: start.toISOString().substring(0, 10),
              endDate: end.toISOString().substring(0, 10),
              daysRemaining: Math.min(30, diffDays),
              daysTotal: 30,
              assignedReviewer: (c as any).reviewerAssigned || (i % 2 === 0 ? 'Priya Nair' : 'Suresh Menon'),
              checkpointsCompleted: (c as any).checkpointsCompleted || 1,
              checkpointsTotal: 3,
              currentScore: c.aiScore || 90,
              issues: c.tabViolations || 0,
              status: 'active',
              checkpointLogs: (c as any).checkpointLogs || [
                { day: 7, date: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), notes: 'Day 7 initial consultation technique audit completed.', score: c.aiScore || 90 }
              ],
            };
          });

          setProbations(mapped);
        },
        (err) => {
          console.warn('Probation candidates subscription fallback:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Probation init error:', e);
    }
  }, []);

  const handleAddCheckpoint = () => {
    if (!activeRecord) return;
    const nextCheckpointNum = activeRecord.checkpointsCompleted + 1;
    const dayMilestone = nextCheckpointNum === 1 ? 7 : nextCheckpointNum === 2 ? 15 : 30;

    const newLog = {
      day: dayMilestone,
      date: new Date().toISOString().substring(0, 10),
      notes: newLogNotes || `Milestone Day ${dayMilestone} checkpoint verified and scored.`,
      score: Number(newLogScore),
    };

    const updated = {
      ...activeRecord,
      checkpointsCompleted: Math.min(activeRecord.checkpointsTotal, nextCheckpointNum),
      currentScore: Math.round((activeRecord.currentScore + Number(newLogScore)) / 2),
      checkpointLogs: [...(activeRecord.checkpointLogs || []), newLog],
    };

    setProbations(prev => prev.map(p => p.id === activeRecord.id ? updated : p));
    setActiveRecord(updated);
    setNewLogNotes('');
    setNotification(`Checkpoint Day ${dayMilestone} logged for ${activeRecord.candidate}!`);
    setTimeout(() => setNotification(null), 3500);

    logAuditEvent({
      user: 'Probation Auditor',
      action: 'PROBATION_CHECKPOINT_LOGGED',
      entity: `Astrologer: ${activeRecord.candidate}`,
      entityId: activeRecord.id,
      category: 'review',
      details: `Day ${dayMilestone} audit scored at ${newLogScore}%.`,
    });
  };

  const handleSendCredentialsEmail = async () => {
    if (!credentialsRecord) return;
    const recipient = targetEmail.trim() || credentialsRecord.email;
    if (!recipient || !recipient.includes('@')) {
      alert('Please enter a valid email address to deliver credentials.');
      return;
    }

    setIsSendingEmail(true);
    const loginLink = typeof window !== 'undefined' ? `${window.location.origin}/astrologer-login` : 'https://astroparihar.com/astrologer-login';
    const directDashboardLink = typeof window !== 'undefined' 
      ? `${window.location.origin}/astrologer-dashboard?astrologerId=${credentialsRecord.id}&name=${encodeURIComponent(credentialsRecord.candidate)}`
      : `https://astroparihar.com/astrologer-dashboard?astrologerId=${credentialsRecord.id}&name=${encodeURIComponent(credentialsRecord.candidate)}`;
    const tempPassword = `Astro@${credentialsRecord.id.replace(/[^0-9]/g, '').slice(-4) || '2026'}`;

    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to AstroParihar: Astrologer Dashboard Access</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfaf8; color: #1e293b;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8dfd8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="background-color: #FFFDFC; padding: 22px 24px 16px 24px; border-bottom: 2px solid #713B32; text-align: center;">
              <a href="https://astroparihar.com" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://astroparihar.com/astrologo.png" alt="AstroParihar" width="220" style="max-width: 220px; width: 100%; height: auto; display: block; margin: 0 auto; border: 0;" />
              </a>
              <p style="margin: 10px 0 0 0; font-size: 12.5px; color: #16a34a; font-weight: 700; letter-spacing: 0.3px;">✓ Verified Astrologer · 30-Day Probation Active</p>
            </div>

            <div style="padding: 26px 28px; line-height: 1.6; color: #1e293b;">
              <p style="font-size: 15px; margin-top: 0;">Namaste <strong>${credentialsRecord.candidate} Ji</strong> 🙏,</p>

              <p>Congratulations! Your profile has been verified and approved by the AstroParihar Verification Panel. You are now active in our 30-Day Supervised Astrologer Probation program.</p>

              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #713B32; font-size: 14px;">Your Astrologer Portal Login Credentials</h4>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Portal Login URL:</strong> <a href="${loginLink}" style="color: #713B32; font-weight: bold;">${loginLink}</a></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Registered Email / Username:</strong> ${recipient}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Password:</strong> The password you set while submitting your application form</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Astrologer ID:</strong> ${credentialsRecord.id}</p>
              </div>

              <div style="text-align: center; margin: 26px 0;">
                <a href="${loginLink}" style="background: #713B32; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 28px; border-radius: 8px; font-size: 14px; display: inline-block;">
                  Sign In to Astrologer Dashboard →
                </a>
              </div>

              <p style="font-size: 12.5px; color: #64748b; line-height: 1.6;">
                <strong>Next Steps:</strong><br/>
                1. Log into your Astrologer Dashboard with your registered email and chosen password.<br/>
                2. Toggle your status to <strong>Online</strong> to start accepting client trial consultations.<br/>
                3. Complete your initial consultations before the Day 15 milestone audit.
              </p>

              <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 24px;">
                Warm regards,<br/>
                <strong>Astrologer Onboarding Committee</strong> · AstroParihar
              </p>
            </div>

            <div style="background-color: #faf7f5; padding: 16px 24px; border-top: 1px solid #ede4dc; font-size: 11.5px; color: #786b63; line-height: 1.5; text-align: center;">
              <p style="margin: 0 0 4px 0;">
                Official Astrologer Verification & Onboarding Panel · <strong>AstroParihar</strong>
              </p>
              <p style="margin: 0; font-size: 11px; color: #9c8e85;">
                © 2026 AstroParihar · All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject: 'Welcome to AstroParihar: Your Verified Astrologer Dashboard Access',
          body: `Namaste ${credentialsRecord.candidate} Ji,\n\nYour astrologer profile has been verified and approved!\n\nPlease log in to your Astrologer Dashboard at ${loginLink} using your registered email (${recipient}) and the password you set while submitting your application form.\n\nWarm regards,\nAstroParihar Onboarding Committee`,
          html: emailHtml,
          candidateName: credentialsRecord.candidate,
          candidateId: credentialsRecord.id,
        })
      });

      const data = await res.json();
      if (data.success) {
        setNotification(`Credentials email successfully dispatched to ${recipient}!`);
        setTimeout(() => setNotification(null), 4000);
        setCredentialsRecord(null);

        logAuditEvent({
          user: 'System Dispatcher',
          action: 'ONBOARDING_CREDENTIALS_SENT',
          entity: `Astrologer: ${credentialsRecord.candidate}`,
          entityId: credentialsRecord.id,
          category: 'outreach',
          details: `Login credentials dispatched to ${recipient}.`,
        });
      } else {
        alert(data.error || 'Failed to dispatch email. Check server SMTP logs.');
      }
    } catch (err: any) {
      alert(`Error sending email: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filtered = probations.filter(p =>
    p.candidate.toLowerCase().includes(search.toLowerCase()) ||
    p.specialisation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {notification && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Timer size={28} className="text-primary" /> Active Probation Pool
            </h1>
            <p className="text-muted-foreground mt-1">
              Astrologers undergoing 30-day supervised trial practice with Day 7, Day 15, and Day 30 milestones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/verification"
              className="btn-secondary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border border-border"
            >
              <Award size={14} className="text-amber-500" /> Go to Final Verification Queue
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active in Probation', value: probations.filter(p => p.status === 'active').length, color: 'text-green-600' },
            { label: 'Extended Audits', value: probations.filter(p => p.status === 'extended').length, color: 'text-amber-600' },
            { label: 'At Risk', value: probations.filter(p => p.status === 'at_risk').length, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search probation records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground card-elevated">
              <Timer size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground text-sm">No astrologers currently on probation.</p>
              <p className="text-xs text-muted-foreground mt-1">Candidates approved from human review will enter the 30-day monitored probation stage here.</p>
            </div>
          ) : (
            filtered.map(p => {
              const sc = statusConfig[p.status];
              const progressPct = Math.round(((p.daysTotal - p.daysRemaining) / p.daysTotal) * 100);
              return (
                <div key={p.id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow transition-all">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-base">{p.candidate}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.specialisation} · Supervisor: {p.assignedReviewer}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href="/astrologer-login"
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink size={12} /> Astrologer Portal →
                      </Link>
                      <button 
                        onClick={() => {
                          setCredentialsRecord(p);
                          setTargetEmail(p.email || '');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Mail size={12} /> Credentials & Email
                      </button>
                      <button 
                        onClick={() => setActiveRecord(p)}
                        className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      >
                        <CheckSquare size={13} /> Checkpoints ({p.checkpointsCompleted}/{p.checkpointsTotal})
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-medium text-foreground">{p.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="font-medium text-foreground">{p.endDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Days Remaining</p>
                      <p className={`font-bold ${p.daysRemaining <= 7 ? 'text-amber-600' : 'text-foreground'}`}>{p.daysRemaining} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Milestones</p>
                      <p className="font-medium text-foreground">{p.checkpointsCompleted}/{p.checkpointsTotal} completed</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Probation Completion Progress</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${p.status === 'at_risk' ? 'bg-red-500' : p.status === 'extended' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {p.issues > 0 && (
                    <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle size={13} /> {p.issues} issue{p.issues > 1 ? 's' : ''} flagged during active consultations
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Milestone Detail & Audit Modal */}
        {activeRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{activeRecord.candidate}</h2>
                  <p className="text-xs text-muted-foreground">Probation Audit Tracker · Score: {activeRecord.currentScore}%</p>
                </div>
                <button 
                  onClick={() => setActiveRecord(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Milestones log */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed Milestones</h4>
                {activeRecord.checkpointLogs && activeRecord.checkpointLogs.length > 0 ? (
                  <div className="space-y-2">
                    {activeRecord.checkpointLogs.map((log, idx) => (
                      <div key={idx} className="p-3 bg-muted/40 rounded-xl border border-border text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-primary font-bold">Day {log.day} Audit Checkpoint</span>
                          <span className="font-mono text-emerald-600">{log.score}% score</span>
                        </div>
                        <p className="text-foreground">{log.notes}</p>
                        <p className="text-2xs text-muted-foreground">{log.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No milestones logged yet.</p>
                )}
              </div>

              {/* Log new milestone form */}
              {activeRecord.checkpointsCompleted < activeRecord.checkpointsTotal && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary" />
                    Log Day {activeRecord.checkpointsCompleted === 0 ? 7 : activeRecord.checkpointsCompleted === 1 ? 15 : 30} Checkpoint Audit
                  </h4>
                  <div>
                    <label className="text-2xs font-semibold text-muted-foreground block mb-1">Audit Score (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newLogScore}
                      onChange={e => setNewLogScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-2xs font-semibold text-muted-foreground block mb-1">Supervisor Observation Notes</label>
                    <textarea
                      rows={2}
                      value={newLogNotes}
                      onChange={e => setNewLogNotes(e.target.value)}
                      placeholder="e.g. Consultations demonstrate solid Shastric grounding and clear ethics..."
                      className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground"
                    />
                  </div>
                  <button
                    onClick={handleAddCheckpoint}
                    className="btn-primary text-xs px-4 py-2 rounded-lg font-semibold w-full"
                  >
                    Confirm & Record Checkpoint
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button onClick={() => setActiveRecord(null)} className="btn-secondary text-xs px-4 py-2 rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials & Onboarding Email Modal */}
        {credentialsRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Astrologer Portal Credentials</h2>
                  <p className="text-xs text-muted-foreground">{credentialsRecord.candidate} · ID: {credentialsRecord.id}</p>
                </div>
                <button 
                  onClick={() => setCredentialsRecord(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Login Info Card */}
              <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Portal Login URL:</span>
                  <span className="font-mono text-primary font-bold">/astrologer-login</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Registered Email / Username:</span>
                  <span className="font-semibold text-foreground">{credentialsRecord.email || 'Email provided on apply form'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Account Password:</span>
                  <span className="text-xs text-foreground font-medium italic">
                    Password entered during application submission
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-muted-foreground font-semibold">Astrologer Portal:</span>
                  <Link 
                    href="/astrologer-login"
                    target="_blank"
                    className="text-xs text-primary underline flex items-center gap-1 font-semibold"
                  >
                    Open Login Screen <ExternalLink size={11} />
                  </Link>
                </div>
              </div>

              {/* Email dispatch section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Mail size={14} className="text-primary" /> Dispatch Welcome & Credentials Email
                </h4>
                <div>
                  <label className="text-2xs font-semibold text-muted-foreground block mb-1">Recipient Astrologer Email</label>
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={e => setTargetEmail(e.target.value)}
                    placeholder="e.g. astrologer@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-2xs text-muted-foreground mt-1">
                    Delivers official welcome message with temporary password, probation milestones, and direct dashboard URL.
                  </p>
                </div>

                <button
                  onClick={handleSendCredentialsEmail}
                  disabled={isSendingEmail}
                  className="btn-primary w-full text-xs py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Email via SMTP...
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Send Onboarding & Credentials Email
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button 
                  onClick={() => setCredentialsRecord(null)}
                  className="btn-secondary text-xs px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
