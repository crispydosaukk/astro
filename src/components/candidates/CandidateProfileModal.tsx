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
  UserCheck
} from 'lucide-react';
import { Candidate, resolveCandidateContact } from '@/lib/firebase/candidateService';
import StatusBadge from '@/components/ui/StatusBadge';

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
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
      `Business: ${candidate.businessName}`,
      `Location: ${candidate.location}`,
      contact.phone ? `Phone: ${contact.phone}` : `Phone: Not listed on Google`,
      contact.email ? `Email: ${contact.email}` : `Email: Not listed on Google`,
      contact.website ? `Website: ${contact.website}` : null,
      `Address: ${contact.address}`,
      `Specialisations: ${candidate.specialisations?.join(', ')}`,
      `Experience: ${candidate.experience}`,
      `Rating: ★ ${candidate.rating || 4.8}/5.0`,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in" onClick={onClose}>
      <div 
        className="relative bg-card border border-border rounded-2xl max-w-2xl w-full m-auto my-auto shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
              </div>

              <p className="text-sm font-medium text-foreground/80 flex items-center gap-1.5 mt-0.5">
                <Building2 size={13} className="text-primary flex-shrink-0" />
                <span className="truncate">{candidate.businessName}</span>
              </p>

              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin size={12} className="text-muted-foreground flex-shrink-0" />
                <span>{candidate.location}</span>
                <span className="mx-1">•</span>
                <Clock size={12} className="text-muted-foreground flex-shrink-0" />
                <span>{candidate.experience}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
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
                        <Phone size={11} /> {candidate.source === 'Manual Entry' ? 'Phone / WhatsApp' : 'Phone Number (Google Maps)'}
                      </span>
                      <button
                        onClick={() => handleCopy(contact.phone!, 'phone')}
                        className="text-2xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
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
                      className="flex-1 py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <MessageCircle size={11} /> WhatsApp
                    </a>
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
                        className="text-2xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
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
                  <Award size={12} /> Public Rating & Reviews
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                    ★ {candidate.rating || 4.8}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">/ 5.0</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-2">
                {candidate.userRatingsTotal ? `${candidate.userRatingsTotal} Verified Reviews` : 'Verified Directory Listing'}
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

              {(contact.learningBackground || candidate.learningBackground || contact.idProofType || candidate.idProofType) && (
                <div className="mt-3 pt-2.5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(contact.learningBackground || candidate.learningBackground) && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                      <span className="text-2xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <Award size={11} /> Astrological Training / Guru
                      </span>
                      <p className="font-semibold text-foreground text-xs mt-1">
                        {contact.learningBackground || candidate.learningBackground}
                      </p>
                      {candidate.courseDetails && (
                        <p className="text-2xs text-muted-foreground mt-0.5">{candidate.courseDetails}</p>
                      )}
                    </div>
                  )}

                  {(contact.idProofType || candidate.idProofType) && (
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-lg p-2.5">
                      <span className="text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Verified ID Proof
                      </span>
                      <p className="font-semibold text-foreground text-xs mt-1">
                        {(contact.idProofType || candidate.idProofType)?.toUpperCase()} 
                        {candidate.idProofNumber ? ` • ${candidate.idProofNumber}` : ''}
                      </p>
                      {(contact.idProofDocument || candidate.idProofDocument) && (
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

          {/* SECTION 3: COMPLETE PROFILE HISTORY & AUDIT TIMELINE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock size={14} className="text-primary" /> Complete Profile History & Lifecycle Timeline
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
                    h.status === 'info' ? 'bg-primary' : 'bg-amber-500'
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
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={handleCopyAll}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
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
              className="btn-ghost text-xs py-2 px-4 rounded-lg"
            >
              Close
            </button>

            {onApproveOutreach && candidate.outreachStatus !== 'Approved' && candidate.outreachStatus !== 'Sent' && (
              <button
                onClick={() => {
                  onApproveOutreach(candidate.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 size={13} />
                Approve for Outreach
              </button>
            )}

            <Link
              href={`/outreach/messages?name=${encodeURIComponent(candidate.name)}&email=${encodeURIComponent(contact.email || '')}&phone=${encodeURIComponent(contact.phone || '')}&location=${encodeURIComponent(candidate.location)}&specialisation=${encodeURIComponent(candidate.specialisations?.[0] || 'Vedic Astrology')}`}
              onClick={onClose}
              className="btn-primary text-xs py-2 px-4 rounded-lg flex items-center gap-1.5"
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
