'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { BadgeCheck, Search, Star, Calendar, MapPin, Eye, Download, ShieldCheck, X, Printer, Award } from 'lucide-react';
import { 
  Candidate, 
  initialCandidatesData, 
  subscribeToCandidates 
} from '@/lib/firebase/candidateService';
import Link from 'next/link';

export default function VerifiedAstrologersPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [certificateCandidate, setCertificateCandidate] = useState<{ candidate: Candidate; index: number } | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToCandidates(
        (allCandidates) => {
          const pool = allCandidates || [];
          // Filter for verified astrologers
          const verified = pool.filter(c => c.lifecycleStatus === 'verified' || c.applicationStatus === 'Approved');
          setCandidates(verified);
        },
        (err) => {
          console.warn('Verified candidates subscription fallback:', err);
          setCandidates([]);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Subscription error:', e);
    }
  }, []);

  const handleExportCsv = () => {
    const headers = ['Verification ID', 'Name', 'Location', 'Specialisations', 'Experience', 'AI Score', 'Status'];
    const rows = candidates.map((c, i) => [
      `AP-VER-2026-${String(i + 1).padStart(3, '0')}`,
      c.name,
      c.location,
      c.specialisations.join('; '),
      c.experience,
      c.aiScore,
      'Active & Verified'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astroparihar-verified-astrologers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    c.specialisations.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const avgScore = candidates.length > 0 ? Math.round(candidates.reduce((a, c) => a + c.aiScore, 0) / candidates.length) : 95;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BadgeCheck size={28} className="text-primary" /> Verified Astrologers
            </h1>
            <p className="text-muted-foreground mt-1">
              Fully verified, authenticated astrologers credentialed on AstroParihar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportCsv}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Download size={14} /> Export Verified CSV
            </button>
            <Link
              href="/verification"
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <ShieldCheck size={14} /> Certificate Center
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Total Verified Astrologers</p>
            <p className="text-3xl font-bold mt-1 text-foreground">{candidates.length}</p>
            <p className="text-xs text-emerald-600 mt-0.5 font-medium">Active platform credentials</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Average Evaluation Score</p>
            <p className="text-3xl font-bold mt-1 text-primary">{avgScore} / 100</p>
            <p className="text-xs text-muted-foreground mt-0.5">Top-tier Vedic standard</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Client Consultation Rating</p>
            <p className="text-3xl font-bold mt-1 text-amber-500">4.9 / 5.0</p>
            <p className="text-xs text-muted-foreground mt-0.5">Post-probation satisfaction</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search verified astrologers..."
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Verification ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Astrologer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specialisations</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Verification Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                      No verified astrologers yet. Candidates who complete probation will be credentialed here.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                      AP-VER-2026-{String(i + 1).padStart(3, '0')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.businessName || 'Elite Vedic Practitioner'} · {c.experience}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.specialisations.map((s, idx) => (
                          <span key={idx} className="text-2xs bg-muted px-2 py-0.5 rounded font-medium text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">
                      {c.aiScore}%
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <BadgeCheck size={12} className="text-emerald-600" /> Verified
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setCertificateCandidate({ candidate: c, index: i })}
                        className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-md inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye size={12} /> Certificate
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Digital Verification Certificate Modal with Official Logo */}
        {certificateCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-primary" /> Official Astrologer Credential
                </span>
                <button 
                  onClick={() => setCertificateCandidate(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Certificate Canvas */}
              <div className="border-4 border-double border-amber-600/35 rounded-2xl p-8 bg-gradient-to-br from-amber-50/45 via-background to-orange-50/25 text-center space-y-4 relative overflow-hidden shadow-inner">
                {/* Official AstroParihar Logo */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <img 
                    src="/assets/images/AstroParihar_Logo-1786957316255.webp" 
                    alt="AstroParihar" 
                    className="h-16 w-auto object-contain mx-auto drop-shadow-xs" 
                  />
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
                    <Award size={22} />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-bold text-foreground tracking-wide">AstroParihar Verified Astrologer</h3>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1 font-medium">National Quality & Authenticity Seal</p>
                </div>

                <div className="py-2">
                  <p className="text-xs text-muted-foreground">This is to officially certify that</p>
                  <p className="text-2xl font-bold text-foreground font-serif mt-1">{certificateCandidate.candidate.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Specialisation: <strong className="text-foreground">{certificateCandidate.candidate.specialisations?.join(', ') || 'Vedic Astrology'}</strong>
                    {certificateCandidate.candidate.location && ` · ${certificateCandidate.candidate.location}`}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Has satisfactorily cleared the multi-tier AstroParihar verification standard including classical theory assessment, blind Kundali case audit, and verified practitioner probation.
                </p>

                <div className="flex items-center justify-between border-t border-border/80 pt-4 mt-4 text-left">
                  <div>
                    <p className="text-2xs text-muted-foreground uppercase font-semibold">Verification ID</p>
                    <p className="font-mono text-sm font-bold text-primary">AP-VER-2026-{String(certificateCandidate.index + 1).padStart(3, '0')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xs text-muted-foreground uppercase font-semibold">Evaluation Score</p>
                    <p className="text-sm font-bold text-emerald-600">{certificateCandidate.candidate.aiScore || 90}% Distinction</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs text-muted-foreground uppercase font-semibold">Authorized Signatory</p>
                    <p className="text-xs font-serif font-bold text-foreground">AstroParihar Council</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg cursor-pointer"
                >
                  <Printer size={13} /> Print Certificate
                </button>
                <button
                  onClick={() => setCertificateCandidate(null)}
                  className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted cursor-pointer transition-colors"
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
