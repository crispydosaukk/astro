'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  MessageCircle,
  Building2,
  Award,
  FileText,
  UserCheck,
  Smartphone,
  Zap,
  BookOpen,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Bot,
  User,
  HelpCircle,
  XCircle,
  FileQuestion,
} from 'lucide-react';
import { Candidate, resolveCandidateContact } from '@/lib/firebase/candidateService';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  THEORY_QUESTIONS, 
  getQuestionText, 
  getOptionsList, 
  getExplanationText, 
  getTopicText 
} from '@/lib/theoryQuestions';

interface CandidateProfileModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onApproveOutreach?: (candidateId: string) => void;
}

export default function CandidateProfileModal({
  candidate,
  onClose,
  onApproveOutreach,
}: CandidateProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'assessment' | 'history'>('profile');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  if (!candidate) return null;

  const contact = resolveCandidateContact(candidate);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyAll = () => {
    const details = [
      `Astrologer Profile - AstroParihar`,
      `Name: ${candidate.name}`,
      `Business: ${candidate.businessName || candidate.name}`,
      `Location: ${candidate.location}`,
      contact.phone ? `Phone: ${contact.phone}` : `Phone: Not listed on Google`,
      contact.email ? `Email: ${contact.email}` : `Email: Not listed on Google`,
      contact.website ? `Website: ${contact.website}` : null,
      `Address: ${contact.address}`,
      `Specialisations: ${candidate.specialisations?.join(', ')}`,
      `Experience: ${candidate.experience}`,
      `Rating: ★ ${candidate.rating || 4.8}/5.0`,
      `AI Overall Score: ${contact.overallScore}/100`,
      `Theory Score: ${contact.theoryScore}/100`,
      `Kundali Case Score: ${contact.chartCaseScore}/100`,
      `AI Interview Score: ${contact.aiInterviewScore}/100`,
      `Interview Duration: ${contact.interviewDurationFormatted}`,
      `Lifecycle Stage: ${candidate.lifecycleStatus}`,
      `Source: ${candidate.source}`
    ].filter(Boolean).join('\n');
    handleCopy(details, 'all');
  };

  const cleanDigits = (contact.phone || '').replace(/[^0-9]/g, '');
  const whatsAppNumber = cleanDigits.startsWith('91') ? cleanDigits : `91${cleanDigits}`;
  const whatsAppLink = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
    `Namaste ${candidate.name}, greetings from AstroParihar. We would be honored to discuss credentialing with you.`
  )}`;

  const hasAssessmentData = Boolean(
    contact.chartCaseAnalysis || 
    contact.conversationHistory.length > 0 || 
    contact.theoryScore > 0 || 
    contact.chartCaseScore > 0 ||
    contact.aiInterviewScore > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in" onClick={onClose}>
      <div 
        className="relative bg-card border border-border rounded-2xl max-w-3xl w-full m-auto my-auto shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl terracotta-gradient flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">
              {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>

            <div className="min-w-0 flex-1 pr-6">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-foreground truncate">{candidate.name}</h3>
                <StatusBadge status={candidate.lifecycleStatus} size="sm" />
                {candidate.isDuplicate && (
                  <span className="text-2xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    Flagged Duplicate
                  </span>
                )}
                {contact.isDisqualified && (
                  <span className="text-2xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                    Disqualified (Malpractice)
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-foreground/80 flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-primary flex-shrink-0" />
                <span className="truncate">{candidate.businessName || candidate.name}</span>
              </p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-muted-foreground" />
                  <span>{candidate.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground" />
                  <span>{candidate.experience}</span>
                </span>
                {contact.interviewDurationFormatted !== 'Not recorded' && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                      <Clock size={12} />
                      <span>Interview: {contact.interviewDurationFormatted}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <FileText size={13} />
              Profile & Contact
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assessment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'assessment'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Brain size={13} />
              <span>Assessment & Real Answers</span>
              {contact.overallScore > 0 && (
                <span className={`text-2xs font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'assessment' 
                    ? 'bg-primary-foreground/20 text-white' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {contact.overallScore}/100
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Clock size={13} />
              Lifecycle Timeline
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* TAB 1: PROFILE & CONTACT DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              {/* SECTION 1: VERIFIED CONTACT DETAILS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Phone size={14} className="text-primary" /> Verified Contact Details
                  </h4>
                  <span className={`text-2xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                    contact.phone || contact.website || contact.email
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-amber-700 bg-amber-50 border border-amber-200'
                  }`}>
                    <CheckCircle2 size={11} /> {
                      candidate.source === 'Manual Entry' 
                        ? 'Manually Verified Profile' 
                        : (contact.phone ? 'Phone Verified on Google' : 'Consultation Center Verified')
                    }
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Phone Card */}
                  {contact.phone ? (
                    <div className="p-3.5 bg-muted/40 rounded-xl border border-border/80 flex flex-col justify-between space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Phone size={11} /> {candidate.source === 'Manual Entry' ? 'Phone / WhatsApp' : 'Phone Number'}
                          </span>
                          <button
                            onClick={() => handleCopy(contact.phone!, 'phone')}
                            className="text-2xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copy phone"
                          >
                            {copiedField === 'phone' ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                <Check size={10} /> Copied!
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Copy size={10} /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                        <p className="text-base font-bold text-foreground mt-1 tabular-nums">
                          {contact.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                        <a
                          href={`tel:${contact.rawPhone}`}
                          className="flex-1 py-1.5 px-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                        >
                          <Phone size={11} /> Call
                        </a>
                        <a
                          href={whatsAppLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                        >
                          <MessageCircle size={11} /> WhatsApp
                        </a>
                        <Link
                          href={`/outreach/messages?name=${encodeURIComponent(candidate.name)}&phone=${encodeURIComponent(contact.phone)}&channel=sms`}
                          onClick={onClose}
                          className="flex-1 py-1.5 px-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                        >
                          <Smartphone size={11} /> SMS
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col justify-center items-center py-4 text-center">
                      <Phone size={18} className="text-muted-foreground/40 mb-1" />
                      <p className="text-xs font-semibold text-muted-foreground">Phone not provided</p>
                      <p className="text-2xs text-muted-foreground/70 mt-0.5">Contact via verified consultation center address below.</p>
                    </div>
                  )}

                  {/* Email Card */}
                  {contact.email ? (
                    <div className="p-3.5 bg-muted/40 rounded-xl border border-border/80 flex flex-col justify-between space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Mail size={11} /> Email Address
                          </span>
                          <button
                            onClick={() => handleCopy(contact.email!, 'email')}
                            className="text-2xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copy email"
                          >
                            {copiedField === 'email' ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                <Check size={10} /> Copied!
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Copy size={10} /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-foreground mt-1 truncate" title={contact.email}>
                          {contact.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                        <a
                          href={`mailto:${contact.email}?subject=${encodeURIComponent(`Invitation to Join AstroParihar for ${candidate.name}`)}`}
                          className="flex-1 py-1.5 px-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                        >
                          <Mail size={11} /> Send Mail
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col justify-center items-center py-4 text-center">
                      <Mail size={18} className="text-muted-foreground/40 mb-1" />
                      <p className="text-xs font-semibold text-muted-foreground">Direct email not provided</p>
                      <p className="text-2xs text-muted-foreground/70 mt-0.5">Contact via direct phone call or postal correspondence.</p>
                    </div>
                  )}
                </div>

                {/* Address & Online Profile info */}
                <div className="mt-3 p-3 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">Consultation Kendra / Office: </span>
                      <span className="text-muted-foreground">{contact.address}</span>
                    </div>
                  </div>
                  {contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={13} className="text-primary flex-shrink-0" />
                      <div className="flex-1 flex items-center gap-2 truncate">
                        <span className="font-semibold text-foreground">Official Website: </span>
                        <a
                          href={contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate flex items-center gap-1 font-medium"
                        >
                          {contact.website}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: ASTROLOGER BACKGROUND & DIRECTORY REVIEWS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 flex flex-col justify-between">
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Award size={12} /> Directory Rating
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                        ★ {candidate.rating || 4.8}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">/ 5.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-2">
                    {candidate.userRatingsTotal ? `${candidate.userRatingsTotal} Verified Reviews` : 'Verified Astrologer Listing'}
                  </p>
                </div>

                <div className="md:col-span-2 p-3.5 bg-muted/30 rounded-xl border border-border space-y-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Award size={12} /> Astrological Specialisations & Practice
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {candidate.specialisations?.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold bg-accent/15 text-accent px-2.5 py-0.5 rounded-full border border-accent/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    {contact.profileSummary}
                  </p>

                  {(contact.learningBackground || contact.idProofType) && (
                    <div className="mt-3 pt-2.5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {contact.learningBackground && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                          <span className="text-2xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                            <Award size={11} /> Astrological Training / Guru
                          </span>
                          <p className="font-semibold text-foreground text-xs mt-1">
                            {contact.learningBackground}
                          </p>
                        </div>
                      )}

                      {contact.idProofType && (
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-lg p-2.5">
                          <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Verified ID Proof
                          </span>
                          <p className="font-semibold text-foreground text-xs mt-1">
                            {contact.idProofType?.toUpperCase()} 
                            {contact.idProofNumber ? ` • ${contact.idProofNumber}` : ''}
                          </p>
                          {contact.idProofDocument && (
                            <span className="inline-flex items-center gap-1 text-2xs text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">
                              ✓ Document Photo Attached
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATE'S ACTUAL ASSESSMENT & REAL ANSWERS */}
          {activeTab === 'assessment' && (
            <div className="space-y-6 animate-fade-in">
              {/* Scorecard Strip */}
              <div className="p-4 bg-muted/40 rounded-xl border border-border">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Brain size={14} className="text-primary" /> Candidate Assessment Scores & Time Taken
                  </h4>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Clock size={12} /> Interview Duration: {contact.interviewDurationFormatted}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <p className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">Theory Test</p>
                    <p className="text-xl font-bold text-foreground mt-0.5 tabular-nums">{contact.theoryScore} / 100</p>
                    <span className="text-2xs text-muted-foreground">35% Weight</span>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <p className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">Kundali Case</p>
                    <p className="text-xl font-bold text-primary mt-0.5 tabular-nums">{contact.chartCaseScore} / 100</p>
                    <span className="text-2xs text-muted-foreground">25% Weight</span>
                  </div>
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <p className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">AI Interview</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">{contact.aiInterviewScore} / 100</p>
                    <span className="text-2xs text-muted-foreground">40% Weight</span>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-2xs uppercase tracking-wider text-primary font-bold">Overall AI Score</p>
                    <p className="text-2xl font-extrabold text-primary mt-0.5 tabular-nums">{contact.overallScore} / 100</p>
                    <span className="text-2xs font-semibold text-foreground/80">
                      {contact.overallScore >= 75 ? 'Qualified' : 'Review Required'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. VEDIC THEORY ASSESSMENT - CANDIDATE'S ACTUAL ANSWERS */}
              {(() => {
                const qList = (contact.theoryQuestionsList && contact.theoryQuestionsList.length > 0)
                  ? contact.theoryQuestionsList
                  : THEORY_QUESTIONS;
                const userAns = contact.theoryAnswers || {};
                const candidateLang = (contact.assessmentLanguage || 'en') as 'en' | 'hi' | 'te' | 'ta';

                const attemptedIds = Object.keys(userAns).map(Number);
                const displayedQuestions = showAllQuestions 
                  ? qList 
                  : (attemptedIds.length > 0 ? qList.filter(q => attemptedIds.includes(q.id)) : qList.slice(0, 3));

                return (
                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-2xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                          <FileQuestion size={13} /> Vedic Theory Assessment • Candidate's Chosen Answers
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Detailed breakdown of classical questions, candidate's selected choice, and shastra explanations
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          Score: {contact.theoryScore}/100
                        </span>
                        {qList.length > 3 && (
                          <button
                            onClick={() => setShowAllQuestions(prev => !prev)}
                            className="text-2xs font-semibold px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
                          >
                            {showAllQuestions ? 'Show Attempted Only' : `View All ${qList.length} Questions`}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {displayedQuestions.map((q, idx) => {
                        const qText = q.questionTe || q.questionHi || q.questionTa 
                          ? getQuestionText(q, candidateLang)
                          : q.question;
                        const opts = (q.optionsTe || q.optionsHi || q.optionsTa)
                          ? getOptionsList(q, candidateLang)
                          : q.options;
                        const expl = (q.explanationTe || q.explanationHi || q.explanationTa)
                          ? getExplanationText(q, candidateLang)
                          : q.explanation;
                        const chosenIdx = userAns[q.id];
                        const hasAttempted = chosenIdx !== undefined && chosenIdx !== null;
                        const isCorrect = hasAttempted && chosenIdx === q.correctIndex;

                        return (
                          <div key={q.id || idx} className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-foreground">
                                Q{idx + 1}. {qText}
                              </span>
                              {hasAttempted ? (
                                isCorrect ? (
                                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-0.5 shrink-0">
                                    <CheckCircle2 size={11} /> Correct
                                  </span>
                                ) : (
                                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 flex items-center gap-0.5 shrink-0">
                                    <XCircle size={11} /> Incorrect
                                  </span>
                                )
                              ) : (
                                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                                  Unattempted
                                </span>
                              )}
                            </div>

                            {/* Options with candidate's selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                              {opts.map((opt: string, optIdx: number) => {
                                const isUserChoice = chosenIdx === optIdx;
                                const isRightChoice = optIdx === q.correctIndex;

                                let optStyle = 'border-border/60 bg-card text-foreground';
                                if (isUserChoice && isRightChoice) {
                                  optStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500';
                                } else if (isUserChoice && !isRightChoice) {
                                  optStyle = 'border-red-500 bg-red-50/70 dark:bg-red-950/40 text-red-950 dark:text-red-200 font-semibold ring-1 ring-red-500';
                                } else if (isRightChoice && hasAttempted) {
                                  optStyle = 'border-emerald-400/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-foreground font-medium';
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-1.5 ${optStyle}`}
                                  >
                                    <span className="truncate">
                                      {String.fromCharCode(65 + optIdx)}. {opt}
                                    </span>
                                    {isUserChoice && (
                                      <span className={`text-2xs px-1.5 py-0.2 rounded font-bold shrink-0 ${
                                        isRightChoice 
                                          ? 'bg-emerald-600 text-white' 
                                          : 'bg-red-600 text-white'
                                      }`}>
                                        {isRightChoice ? '✓ Selected' : '✗ Selected'}
                                      </span>
                                    )}
                                    {!isUserChoice && isRightChoice && hasAttempted && (
                                      <span className="text-2xs text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                                        ✓ Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Shastra Explanation */}
                            {expl && (
                              <div className="p-2 rounded-md bg-muted/40 border border-border/60 text-2xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                                <HelpCircle size={12} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-foreground">Classical Shastra Logic: </strong>
                                  {expl}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* 2. BLIND KUNDALI CASE STUDY - CANDIDATE'S ACTUAL ANSWERS */}
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                      <BookOpen size={13} /> Blind Kundali Case Study #K-402 (Scorpio Lagna, Saturn-Rahu Dasha)
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Client in career crisis: Business delay despite effort. What was the astrologer's reading?
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Case Score: {contact.chartCaseScore}/100
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h5 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                      <FileText size={12} /> Candidate's Astrological Reading & Career Diagnosis:
                    </h5>
                    {contact.chartCaseAnalysis ? (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/80 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                        {contact.chartCaseAnalysis}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic p-3 bg-muted/20 rounded-lg">
                        Candidate has not submitted a written Kundali interpretation yet.
                      </p>
                    )}
                  </div>

                  {contact.chartRemedy && (
                    <div>
                      <h5 className="text-2xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Sparkles size={12} /> Candidate's Prescribed Remedies:
                      </h5>
                      <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/60 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        {contact.chartRemedy}
                      </div>
                    </div>
                  )}

                  {contact.chartEvaluation && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1.5">
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <Bot size={13} className="text-primary" /> AI Examiner Evaluation on Chart Case:
                      </p>
                      <p className="text-muted-foreground leading-relaxed">{contact.chartEvaluation.summary}</p>
                      {contact.chartEvaluation.strengths?.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-1">
                          <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-400">Strengths:</span>
                          {contact.chartEvaluation.strengths.map((s: string, idx: number) => (
                            <span key={idx} className="text-2xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. AI INTERVIEW CONVERSATION TRANSCRIPT - CANDIDATE'S ACTUAL ANSWERS */}
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Brain size={13} /> Complete AI Screening Interview Transcript
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Authentic question-by-question dialogue and answers typed by candidate
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-muted-foreground">
                      ⏱️ {contact.interviewDurationFormatted}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Score: {contact.aiInterviewScore}/100
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3.5 max-h-96 overflow-y-auto">
                  {contact.conversationHistory && contact.conversationHistory.length > 0 ? (
                    contact.conversationHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                          msg.role === 'user' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                        </div>
                        <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-2xs font-bold ${msg.role === 'user' ? 'text-emerald-700 dark:text-emerald-400' : 'text-primary'}`}>
                              {msg.role === 'user' ? `${candidate.name} (Candidate Answer)` : 'AI Astrological Examiner'}
                            </span>
                          </div>
                          <div className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800 text-foreground'
                              : 'bg-muted/40 border border-border text-foreground'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-4">
                      Candidate has not completed the AI interview conversation yet.
                    </p>
                  )}
                </div>

                {/* AI Interview Evaluation Summary */}
                {contact.aiInterviewEvaluation && (
                  <div className="p-4 border-t border-border bg-muted/20 space-y-2">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles size={13} className="text-primary" />
                      Examiner Synthesis: {contact.aiInterviewEvaluation.recommendation || 'Evaluated'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {contact.aiInterviewEvaluation.summary}
                    </p>
                    {contact.aiInterviewEvaluation.strengths?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-2xs">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Noted Strengths:</span>
                        {contact.aiInterviewEvaluation.strengths.map((s: string, i: number) => (
                          <span key={i} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. PROCTORING & EXAM AUDIT */}
              <div className="p-3.5 bg-muted/20 rounded-xl border border-border flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className={contact.tabViolations > 0 ? 'text-amber-600' : 'text-emerald-600'} />
                  <div>
                    <p className="font-semibold text-foreground">Anti-Cheating Proctor Audit</p>
                    <p className="text-2xs text-muted-foreground">
                      Window tab switches: <strong className="tabular-nums">{contact.tabViolations}</strong> / 3 allowed
                    </p>
                  </div>
                </div>
                <div>
                  {contact.isDisqualified ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300">
                      Disqualified: {contact.disqualificationReason}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      Proctoring Verified Clean
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TIMELINE & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock size={14} className="text-primary" /> Complete Lifecycle Audit Timeline
                </h4>
                <span className="text-2xs text-muted-foreground">
                  Discovered: {candidate.discoveredDate || 'Recent'}
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {contact.history.map((h, i) => (
                  <div key={i} className="relative">
                    {/* Step bullet */}
                    <div className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-background flex items-center justify-center ${
                      h.status === 'success' ? 'bg-emerald-500' :
                      h.status === 'info' ? 'bg-primary' :
                      h.status === 'error' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    
                    <div className="bg-card border border-border rounded-lg p-3 shadow-2xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          {h.stage}
                        </span>
                        <span className="text-2xs text-muted-foreground font-mono">
                          {h.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {h.notes}
                      </p>
                      {h.actor && (
                        <p className="text-2xs font-semibold text-primary mt-1 flex items-center gap-1">
                          <UserCheck size={10} /> {h.actor}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={handleCopyAll}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            title="Copy full profile summary"
          >
            {copiedField === 'all' ? (
              <>
                <Check size={13} className="text-emerald-600" />
                Copied Full Profile!
              </>
            ) : (
              <>
                <FileText size={13} />
                Copy Profile Summary
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-ghost text-xs py-2 px-4 rounded-lg cursor-pointer"
            >
              Close
            </button>

            {onApproveOutreach && candidate.outreachStatus !== 'Approved' && candidate.outreachStatus !== 'Sent' && (
              <button
                onClick={() => {
                  onApproveOutreach(candidate.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 size={13} />
                Approve for Outreach
              </button>
            )}

            <Link
              href={`/human-review-module?id=${candidate.id}`}
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open full 360° candidate review with GPT-4o advisory"
            >
              <Sparkles size={13} />
              Review 360°
            </Link>

            <Link
              href={`/outreach/messages?name=${encodeURIComponent(candidate.name)}&email=${encodeURIComponent(contact.email || '')}&phone=${encodeURIComponent(contact.phone || '')}&location=${encodeURIComponent(candidate.location)}&specialisation=${encodeURIComponent(candidate.specialisations?.[0] || 'Vedic Astrology')}`}
              onClick={onClose}
              className="btn-primary text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={13} />
              Compose Outreach Invite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
