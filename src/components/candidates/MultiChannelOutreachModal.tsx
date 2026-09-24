'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, Send, Mail, Smartphone, MessageCircle, Zap, CheckCircle2, 
  AlertCircle, Users, Check, ExternalLink, RefreshCw, ChevronDown, ChevronUp, Sparkles, AlertTriangle
} from 'lucide-react';
import { Candidate, resolveCandidateContact } from '@/lib/firebase/candidateService';
import { dispatchParallelOutreach } from '@/lib/firebase/smsService';

export interface ChannelSelection {
  whatsapp: boolean;
  email: boolean;
  sms: boolean;
}

interface MultiChannelOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Candidate[];
  onComplete: (summary: {
    total: number;
    emailSent: number;
    smsSent: number;
    whatsappQueued: number;
    failed: number;
  }) => void;
}

export default function MultiChannelOutreachModal({
  isOpen,
  onClose,
  recipients,
  onComplete,
}: MultiChannelOutreachModalProps) {
  // Channel Selection: defaults to all 3 or user can toggle
  const [channels, setChannels] = useState<ChannelSelection>({
    whatsapp: true,
    email: true,
    sms: true,
  });

  const [showRecipientsList, setShowRecipientsList] = useState(false);
  const [activeTab, setActiveTab] = useState<'channels' | 'preview'>('channels');
  
  // Custom message overrides
  const [emailSubject, setEmailSubject] = useState(
    'Invitation to Join AstroParihar Astrologer Panel – {candidate_name}'
  );
  const [emailBody, setEmailBody] = useState(
    `Namaste {candidate_name} Ji,\n\nWe are delighted to invite you to join AstroParihar's premier network of verified astrologers. Having reviewed your esteemed practice in {location} specializing in {specialisation}, we would be honored to partner with you.\n\nPlease review your verification dossier and onboarding details at:\n{apply_link}\n\nWarm regards,\nRecruitment Committee, AstroParihar UK`
  );
  const [smsMessage, setSmsMessage] = useState(
    `Namaste {candidate_name} Ji, AstroParihar invites you to join our verified astrologer panel. Apply: {apply_link}`
  );
  const [whatsappMessage, setWhatsappMessage] = useState(
    `Namaste {candidate_name} Ji 🙏\n\nWe came across your esteemed astrology practice in {location} specializing in {specialisation}. We would be thrilled to invite you to join our network of verified astrologers on AstroParihar.\n\nTap the secure link below to complete your onboarding & profile verification:\n{apply_link}\n\nWarm regards,\nAstroParihar Team`
  );

  // Execution states
  const [isSending, setIsSending] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);

  // Computed Audience Breakdown
  const audienceStats = useMemo(() => {
    let withEmail = 0;
    let withPhone = 0;
    let noContact = 0;

    recipients.forEach(c => {
      const contact = resolveCandidateContact(c);
      const hasEmail = Boolean(c.email || contact.email);
      const hasPhone = Boolean(c.phone || contact.phone);

      if (hasEmail) withEmail++;
      if (hasPhone) withPhone++;
      if (!hasEmail && !hasPhone) noContact++;
    });

    return {
      total: recipients.length,
      withEmail,
      withPhone,
      noContact,
    };
  }, [recipients]);

  if (!isOpen || recipients.length === 0) return null;

  // Preset Handlers
  const handleSelectOnlyWhatsApp = () => {
    setChannels({ whatsapp: true, email: false, sms: false });
  };

  const handleSelectOnlyEmail = () => {
    setChannels({ whatsapp: false, email: true, sms: false });
  };

  const handleSelectOnlySMS = () => {
    setChannels({ whatsapp: false, email: false, sms: true });
  };

  const handleSelectAllChannels = () => {
    setChannels({ whatsapp: true, email: true, sms: true });
  };

  const hasAnyChannelSelected = channels.whatsapp || channels.email || channels.sms;

  // Preview computation for first recipient
  const sampleCandidate = recipients[0];
  const sampleName = sampleCandidate?.name || 'Pandit Sharma';
  const sampleLocation = sampleCandidate?.location || 'New Delhi, India';
  const sampleSpec = sampleCandidate?.specialisations?.[0] || 'Vedic Astrology';
  const sampleCamp = sampleCandidate?.campaignName || (sampleCandidate as any)?.campaign || '';
  const sampleSrc = sampleCandidate?.source || 'Discovery';
  const sampleLink = typeof window !== 'undefined'
    ? `${window.location.origin}/apply?id=${sampleCandidate?.id || 'demo'}&name=${encodeURIComponent(sampleName)}&source=${encodeURIComponent(sampleSrc)}${sampleCamp ? `&campaign=${encodeURIComponent(sampleCamp)}` : ''}`
    : `https://astroparihar.com/apply?id=${sampleCandidate?.id || 'demo'}&source=${encodeURIComponent(sampleSrc)}${sampleCamp ? `&campaign=${encodeURIComponent(sampleCamp)}` : ''}`;

  const renderSampleText = (template: string) => {
    return template
      .replace(/{candidate_name}/g, sampleName)
      .replace(/{location}/g, sampleLocation)
      .replace(/{specialisation}/g, sampleSpec)
      .replace(/{apply_link}/g, sampleLink);
  };

  // Direct WhatsApp Web click for single candidate
  const handleOpenDirectWhatsApp = (candidate: Candidate) => {
    const contact = resolveCandidateContact(candidate);
    const rawPhone = candidate.phone || contact.phone || '';
    const cleanPhone = rawPhone.replace(/[^\d]/g, '');
    if (!cleanPhone) {
      alert('No valid phone number for this candidate.');
      return;
    }
    const camp = candidate.campaignName || (candidate as any)?.campaign || '';
    const src = candidate.source || 'Discovery';
    const appUrl = `${window.location.origin}/apply?id=${candidate.id}&name=${encodeURIComponent(candidate.name)}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`;
    const text = whatsappMessage
      .replace(/{candidate_name}/g, candidate.name)
      .replace(/{location}/g, candidate.location || 'India')
      .replace(/{specialisation}/g, candidate.specialisations?.[0] || 'Vedic Astrology')
      .replace(/{apply_link}/g, appUrl);

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Dispatch Action
  const handleExecuteDispatch = async () => {
    if (!hasAnyChannelSelected) {
      alert('Please select at least one outreach channel (WhatsApp, Email, or SMS).');
      return;
    }

    setIsSending(true);
    setProgressIndex(0);
    setDispatchLogs([]);

    let emailSentCount = 0;
    let smsSentCount = 0;
    let whatsappQueuedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i++) {
      const candidate = recipients[i];
      setProgressIndex(i + 1);

      const contact = resolveCandidateContact(candidate);
      const cleanPhone = (candidate.phone || contact.phone || '').replace(/[^\d+]/g, '').replace(/^0+/, '');
      const cleanEmail = (candidate.email || contact.email || '').trim();

      const camp = candidate.campaignName || (candidate as any)?.campaign || '';
      const src = candidate.source || 'Discovery';
      const candidateAppUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/apply?id=${candidate.id}&name=${encodeURIComponent(candidate.name)}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`
        : `https://astroparihar.com/apply?id=${candidate.id}&source=${encodeURIComponent(src)}${camp ? `&campaign=${encodeURIComponent(camp)}` : ''}`;

      const personalizedSubject = emailSubject.replace(/{candidate_name}/g, candidate.name);
      const personalizedEmail = emailBody
        .replace(/{candidate_name}/g, candidate.name)
        .replace(/{location}/g, candidate.location || 'India')
        .replace(/{specialisation}/g, candidate.specialisations?.join(', ') || 'Vedic Astrology')
        .replace(/{apply_link}/g, candidateAppUrl);

      const personalizedSms = smsMessage
        .replace(/{candidate_name}/g, candidate.name)
        .replace(/{location}/g, candidate.location || 'India')
        .replace(/{specialisation}/g, candidate.specialisations?.[0] || 'Vedic Astrology')
        .replace(/{apply_link}/g, candidateAppUrl);

      const personalizedWa = whatsappMessage
        .replace(/{candidate_name}/g, candidate.name)
        .replace(/{location}/g, candidate.location || 'India')
        .replace(/{specialisation}/g, candidate.specialisations?.[0] || 'Vedic Astrology')
        .replace(/{apply_link}/g, candidateAppUrl);

      try {
        const res = await dispatchParallelOutreach({
          candidateId: candidate.id,
          candidateName: candidate.name,
          email: cleanEmail || undefined,
          emailSubject: personalizedSubject,
          emailBody: personalizedEmail,
          phone: cleanPhone || undefined,
          smsMessage: personalizedSms,
          whatsappMessage: personalizedWa,
          specialisation: candidate.specialisations?.[0] || 'Vedic Astrology',
          location: candidate.location || 'India',
          channels: {
            email: channels.email && Boolean(cleanEmail),
            sms: channels.sms && Boolean(cleanPhone),
            whatsapp: channels.whatsapp && Boolean(cleanPhone),
          },
        });

        if (channels.email && cleanEmail) {
          if (res.email.success) emailSentCount++;
          else failedCount++;
        }
        if (channels.sms && cleanPhone) {
          if (res.sms.success) smsSentCount++;
          else failedCount++;
        }
        if (channels.whatsapp && cleanPhone) {
          whatsappQueuedCount++;
        }

        // Determine updated outreach status label
        const appliedChannels: string[] = [];
        if (channels.whatsapp && cleanPhone) appliedChannels.push('WhatsApp');
        if (channels.email && cleanEmail && res.email.success) appliedChannels.push('Email');
        if (channels.sms && cleanPhone && res.sms.success) appliedChannels.push('SMS');

        const newStatus = appliedChannels.length > 0 ? `Sent (${appliedChannels.join(' + ')})` : 'Sent (Outreach)';
        
        // Update candidate in Firestore
        try {
          const { saveCandidateToFirestore } = await import('@/lib/firebase/candidateService');
          const historyEntry = {
            stage: 'Outreach Dispatched',
            timestamp: new Date().toISOString(),
            notes: `Outreach sent via ${appliedChannels.join(', ') || 'selected channels'}`,
            status: newStatus,
          };
          await saveCandidateToFirestore({
            ...candidate,
            outreachStatus: newStatus,
            lifecycleStatus: 'ready-for-outreach',
            history: candidate.history ? [...candidate.history, historyEntry] : [historyEntry],
          });
        } catch (saveErr) {
          console.warn('Could not update candidate status in Firestore:', saveErr);
        }

        setDispatchLogs(prev => [
          `✓ ${candidate.name}: ${appliedChannels.join(', ') || 'Skipped (no contact info)'}`,
          ...prev.slice(0, 10),
        ]);
      } catch (err: any) {
        failedCount++;
        setDispatchLogs(prev => [`✗ ${candidate.name}: Failed (${err.message})`, ...prev.slice(0, 10)]);
      }
    }

    setIsSending(false);
    onComplete({
      total: recipients.length,
      emailSent: emailSentCount,
      smsSent: smsSentCount,
      whatsappQueued: whatsappQueuedCount,
      failed: failedCount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto animate-slide-up">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Send size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                Multi-Channel Outreach Dispatch
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                  {recipients.length} {recipients.length === 1 ? 'Person' : 'People'}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Target via WhatsApp, Email, or SMS individually or concurrently
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Audience / Recipients Summary ("Whom to send / Number of people") */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground">
                Target Audience Breakdown ({audienceStats.total} total)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRecipientsList(!showRecipientsList)}
              className="text-2xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              {showRecipientsList ? 'Hide List' : 'View All Recipients'}
              {showRecipientsList ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-violet-600" />
                <span className="text-muted-foreground font-medium">Valid Email</span>
              </div>
              <span className="font-bold text-violet-700">{audienceStats.withEmail}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageCircle size={14} className="text-emerald-600" />
                <span className="text-muted-foreground font-medium">Mobile Phone</span>
              </div>
              <span className="font-bold text-emerald-700">{audienceStats.withPhone}</span>
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              audienceStats.noContact > 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-muted/40 border-border'
            }`}>
              <div className="flex items-center gap-1.5">
                <AlertCircle size={14} className={audienceStats.noContact > 0 ? 'text-amber-600' : 'text-muted-foreground'} />
                <span className="text-muted-foreground font-medium">No Contact</span>
              </div>
              <span className={`font-bold ${audienceStats.noContact > 0 ? 'text-amber-700' : 'text-muted-foreground'}`}>
                {audienceStats.noContact}
              </span>
            </div>
          </div>

          {/* Collapsible Recipients List */}
          {showRecipientsList && (
            <div className="mt-2 pt-2 border-t border-border/60 max-h-40 overflow-y-auto space-y-1.5 text-xs">
              {recipients.map((c, idx) => {
                const contact = resolveCandidateContact(c);
                const phone = c.phone || contact.phone;
                const email = c.email || contact.email;
                return (
                  <div key={c.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/70">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{c.name}</p>
                      <p className="text-3xs text-muted-foreground truncate">{c.location || 'India'} • {c.specialisations?.[0] || 'Vedic'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {email ? (
                        <span className="text-3xs bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded font-medium">Email</span>
                      ) : (
                        <span className="text-3xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No Email</span>
                      )}
                      {phone ? (
                        <span className="text-3xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Phone</span>
                      ) : (
                        <span className="text-3xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">No Phone</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Channel Presets ("only whats app , only email and only sms and multiple selection") */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground">
              Select Outreach Channels:
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectOnlyWhatsApp}
                className={`text-2xs px-2.5 py-1 rounded-md font-semibold border transition-all cursor-pointer ${
                  channels.whatsapp && !channels.email && !channels.sms
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-card text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                Only WhatsApp
              </button>
              <button
                type="button"
                onClick={handleSelectOnlyEmail}
                className={`text-2xs px-2.5 py-1 rounded-md font-semibold border transition-all cursor-pointer ${
                  !channels.whatsapp && channels.email && !channels.sms
                    ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                    : 'bg-card text-violet-700 border-violet-300 hover:bg-violet-50'
                }`}
              >
                Only Email
              </button>
              <button
                type="button"
                onClick={handleSelectOnlySMS}
                className={`text-2xs px-2.5 py-1 rounded-md font-semibold border transition-all cursor-pointer ${
                  !channels.whatsapp && !channels.email && channels.sms
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-card text-indigo-700 border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                Only SMS
              </button>
              <button
                type="button"
                onClick={handleSelectAllChannels}
                className={`text-2xs px-2.5 py-1 rounded-md font-semibold border transition-all cursor-pointer ${
                  channels.whatsapp && channels.email && channels.sms
                    ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
                    : 'bg-card text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                All 3 Channels
              </button>
            </div>
          </div>

          {/* Interactive Channel Cards with Multi-selection Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* WhatsApp Card */}
            <label className={`relative p-3.5 rounded-xl border transition-all cursor-pointer block select-none ${
              channels.whatsapp
                ? 'border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30'
                : 'border-border bg-card hover:border-emerald-400 hover:bg-muted/30 opacity-70'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                    <MessageCircle size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">WhatsApp</p>
                    <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      API Pending
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={e => setChannels(prev => ({ ...prev, whatsapp: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer mt-0.5"
                />
              </div>
              <p className="text-3xs text-muted-foreground leading-normal">
                Personalized WhatsApp invitation. Dispatches queue in logs; 1-click Web link ready.
              </p>
            </label>

            {/* Email Card */}
            <label className={`relative p-3.5 rounded-xl border transition-all cursor-pointer block select-none ${
              channels.email
                ? 'border-violet-500 bg-violet-500/10 shadow-xs ring-1 ring-violet-500/30'
                : 'border-border bg-card hover:border-violet-400 hover:bg-muted/30 opacity-70'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-600 text-white">
                    <Mail size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">Email</p>
                    <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      SMTP Active
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={e => setChannels(prev => ({ ...prev, email: e.target.checked }))}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 cursor-pointer mt-0.5"
                />
              </div>
              <p className="text-3xs text-muted-foreground leading-normal">
                Formatted HTML invitation with candidate dossier & onboarding verification link.
              </p>
            </label>

            {/* SMS Card */}
            <label className={`relative p-3.5 rounded-xl border transition-all cursor-pointer block select-none ${
              channels.sms
                ? 'border-indigo-500 bg-indigo-500/10 shadow-xs ring-1 ring-indigo-500/30'
                : 'border-border bg-card hover:border-indigo-400 hover:bg-muted/30 opacity-70'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Smartphone size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">SMS</p>
                    <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      MSG91 Active
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={e => setChannels(prev => ({ ...prev, sms: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer mt-0.5"
                />
              </div>
              <p className="text-3xs text-muted-foreground leading-normal">
                Direct SMS text with onboarding portal link sent to mobile phone.
              </p>
            </label>
          </div>
        </div>

        {/* WhatsApp Integration Notice */}
        {channels.whatsapp && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-2xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">WhatsApp API Integration Note:</p>
              <p>
                WhatsApp Business API gateway is ready for configuration and will be connected with your API key. In the meantime, dispatches will safely log to Firestore, update candidate status to <span className="font-bold">Sent (WhatsApp)</span>, and you can also launch direct WhatsApp Web chats anytime!
              </p>
              {recipients.length === 1 && (
                <button
                  type="button"
                  onClick={() => handleOpenDirectWhatsApp(recipients[0])}
                  className="mt-1 text-2xs font-bold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink size={11} /> Open WhatsApp Web chat now for {recipients[0].name}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabs for Message Preview & Variables */}
        <div className="border border-border rounded-xl p-3.5 space-y-3 bg-card">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" /> Personalized Message Content
            </span>
            <div className="flex items-center gap-1 text-2xs">
              <span className="text-muted-foreground">Supported tags:</span>
              <code className="bg-muted px-1.5 py-0.5 rounded text-3xs font-mono">`{'{candidate_name}'}`</code>
              <code className="bg-muted px-1.5 py-0.5 rounded text-3xs font-mono">`{'{apply_link}'}`</code>
            </div>
          </div>

          {channels.email && (
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-violet-700 flex items-center gap-1">
                <Mail size={12} /> Email Subject & Body
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Email Subject"
                className="input-field text-xs py-1.5 px-2.5 w-full font-medium"
              />
              <textarea
                rows={3}
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                className="input-field text-xs py-1.5 px-2.5 w-full font-mono text-3xs resize-y"
              />
            </div>
          )}

          {channels.whatsapp && (
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-emerald-700 flex items-center gap-1">
                <MessageCircle size={12} /> WhatsApp Message Template
              </label>
              <textarea
                rows={2}
                value={whatsappMessage}
                onChange={e => setWhatsappMessage(e.target.value)}
                className="input-field text-xs py-1.5 px-2.5 w-full font-mono text-3xs resize-y"
              />
            </div>
          )}

          {channels.sms && (
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-indigo-700 flex items-center gap-1">
                <Smartphone size={12} /> SMS Message Template
              </label>
              <input
                type="text"
                value={smsMessage}
                onChange={e => setSmsMessage(e.target.value)}
                className="input-field text-xs py-1.5 px-2.5 w-full font-mono text-3xs"
              />
            </div>
          )}
        </div>

        {/* Live Progress Bar during dispatch */}
        {isSending && (
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <RefreshCw size={13} className="animate-spin" />
                Dispatching outreach ({progressIndex} of {recipients.length})...
              </span>
              <span>{Math.round((progressIndex / recipients.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${(progressIndex / recipients.length) * 100}%` }}
              />
            </div>
            {dispatchLogs.length > 0 && (
              <div className="max-h-20 overflow-y-auto text-3xs font-mono text-muted-foreground space-y-0.5 pt-1">
                {dispatchLogs.map((log, i) => (
                  <p key={i}>{log}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="btn-secondary text-xs py-2 px-4 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteDispatch}
            disabled={isSending || !hasAnyChannelSelected}
            className="btn-primary text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer font-bold shadow-md bg-gradient-to-r from-emerald-600 via-primary to-violet-600 text-white hover:opacity-95 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Sending to {recipients.length} Candidates...
              </>
            ) : (
              <>
                <Send size={14} />
                Dispatch to {recipients.length} {recipients.length === 1 ? 'Candidate' : 'Candidates'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
