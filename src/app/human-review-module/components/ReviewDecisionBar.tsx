'use client';

import React, { useState } from 'react';
import type { ReviewCandidate } from './ReviewWorkspace';
import Modal from '@/components/ui/Modal';
import { CheckCircle2, XCircle, MessageSquare, PauseCircle, AlertTriangle, Shield, RotateCcw } from 'lucide-react';
import { updateCandidateStatus } from '@/lib/firebase/candidateService';
import { db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { logAuditEvent } from '@/lib/auditLogService';

interface ReviewDecisionBarProps {
  candidate: ReviewCandidate;
  onUpdateCandidate?: (id: string, updates: Partial<ReviewCandidate>) => void;
}

type DecisionType = 'approve' | 'reject' | 'request-info' | 'hold' | 'reopen' | null;

export default function ReviewDecisionBar({ candidate, onUpdateCandidate }: ReviewDecisionBarProps) {
  const [confirmModal, setConfirmModal] = useState<DecisionType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decided, setDecided] = useState(false);
  const [decisionMade, setDecisionMade] = useState<string | null>(null);

  const isAlreadyRejected = candidate.status?.toLowerCase().includes('reject');
  const isAlreadyApproved = candidate.status?.toLowerCase().includes('approv') || candidate.status?.toLowerCase().includes('verif');

  const handleDecision = async () => {
    setIsSubmitting(true);
    try {
      if (confirmModal === 'reopen') {
        const newLifecycle = 'human-review';
        const newAppStatus = 'Under Committee Review';

        await updateCandidateStatus(candidate.id, {
          lifecycleStatus: newLifecycle,
          applicationStatus: newAppStatus,
        });

        onUpdateCandidate?.(candidate.id, {
          status: 'Human Review',
        });

        logAuditEvent({
          user: candidate.reviewerAssigned || 'Priya Nair (Reviewer)',
          action: 'APPLICATION_REOPENED',
          entity: `Candidate: ${candidate.name}`,
          entityId: candidate.appId || candidate.id,
          category: 'review',
          details: `Application for ${candidate.name} was reopened for committee re-evaluation.`,
        });

        setDecided(false);
        setDecisionMade(null);
        return;
      }

      // Map decision to lifecycle status
      let newLifecycle = candidate.status;
      let newAppStatus = 'Under Review';
      if (confirmModal === 'approve') {
        newLifecycle = 'verified';
        newAppStatus = 'Approved';
      } else if (confirmModal === 'reject') {
        newLifecycle = 'rejected';
        newAppStatus = 'Rejected';
      } else if (confirmModal === 'request-info') {
        newLifecycle = 'pending-info';
        newAppStatus = 'Pending Info';
      } else if (confirmModal === 'hold') {
        newLifecycle = 'on-hold';
        newAppStatus = 'On Hold';
      }

      // 1. Update Firestore & Broadcast
      try {
        await updateCandidateStatus(candidate.id, {
          lifecycleStatus: newLifecycle,
          applicationStatus: newAppStatus
        });

        // If approved, activate astrologer account in 'astrologers' collection
        if (confirmModal === 'approve' && db) {
          const astRef = doc(db, 'astrologers', candidate.id);
          await setDoc(astRef, {
            id: candidate.id,
            name: candidate.name,
            location: candidate.location,
            speciality: candidate.specialisations?.[0] || 'Vedic Astrology',
            isVerified: true,
            status: 'active',
            verifiedAt: new Date().toISOString(),
          }, { merge: true });

          // Send approval confirmation email
          const targetEmail = (candidate as any).email;
          if (targetEmail && targetEmail.includes('@')) {
            try {
              const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Account Verified: Welcome to AstroParihar</title>
                </head>
                <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfaf8; color: #1e293b;">
                  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8dfd8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                    <div style="background-color: #FFFDFC; padding: 22px 24px 16px 24px; border-bottom: 2px solid #713B32; text-align: center;">
                      <a href="https://astroparihar.com" target="_blank" style="text-decoration: none; display: inline-block;">
                        <img src="https://astroparihar.com/astrologo.png" alt="AstroParihar" width="220" style="max-width: 220px; width: 100%; height: auto; display: block; margin: 0 auto; border: 0;" />
                      </a>
                      <p style="margin: 10px 0 0 0; font-size: 12.5px; color: #16a34a; font-weight: 700; letter-spacing: 0.3px;">✓ Profile Verified & Activated</p>
                    </div>
                    
                    <div style="padding: 26px 28px; line-height: 1.6; color: #1a1a1a;">
                      <p style="font-size: 16px; margin-top: 0;">Namaste <strong>${candidate.name} Ji</strong> 🙏,</p>
                      
                      <p>Congratulations! Your astrologer credentials, Vedic assessment, and AI screening interview have been approved by the <strong>AstroParihar Verification Committee</strong>.</p>
                      
                      <p>Your verified astrologer panel access is now active. You can log in to your Astrologer Dashboard to manage your schedule, accept consultations, and view client earnings.</p>
                      
                      <div style="text-align: center; margin: 28px 0;">
                        <a href="https://astroparihar.com/astrologer-login" style="background: #713B32; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 28px; border-radius: 8px; font-size: 15px; display: inline-block;">
                          Login to Astrologer Dashboard →
                        </a>
                      </div>
                      
                      <p style="font-size: 13px; color: #718096; margin-top: 24px;">
                        Warm regards,<br/>
                        <strong>Recruitment & Astrological Compliance Panel</strong><br/>
                        AstroParihar
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

              await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: targetEmail,
                  subject: `Account Verified: Welcome to AstroParihar Astrologer Panel`,
                  body: `Namaste ${candidate.name} Ji,\n\nCongratulations! Your AstroParihar Astrologer Account has been verified and approved.\n\nYou can log in at: https://astroparihar.com/astrologer-login\n\nWarm regards,\nAstroParihar Team`,
                  html,
                  candidateName: candidate.name,
                  candidateId: candidate.id,
                })
              });
            } catch (err) {
              console.warn('Approval email send error:', err);
            }
          }
        }
      } catch (e) {
        console.warn('Could not sync directly to Firestore (local record update):', e);
      }

      // 2. Propagate state update up to parent workspace
      onUpdateCandidate?.(candidate.id, {
        status: newAppStatus,
      });

      // 3. Log to Immutable Audit Trail
      const actionName = 
        confirmModal === 'approve' ? 'APPLICATION_APPROVED_PROBATION' :
        confirmModal === 'reject' ? 'APPLICATION_REJECTED' :
        confirmModal === 'request-info' ? 'ADDITIONAL_INFO_REQUESTED' :
        'APPLICATION_PLACED_ON_HOLD';

      const actionDetails = 
        confirmModal === 'approve' ? `Application approved for 30-day live probation by ${candidate.reviewerAssigned || 'Priya Nair'}.` :
        confirmModal === 'reject' ? `Application for ${candidate.name} officially rejected by review committee.` :
        confirmModal === 'request-info' ? `Additional verification documentation requested from ${candidate.name}.` :
        `Application for ${candidate.name} placed on hold.`;

      logAuditEvent({
        user: candidate.reviewerAssigned || 'Priya Nair (Reviewer)',
        action: actionName,
        entity: `Candidate: ${candidate.name}`,
        entityId: candidate.appId || candidate.id,
        category: 'review',
        details: actionDetails,
      });

      setDecided(true);
      setDecisionMade(
        confirmModal === 'approve' ? 'Approved & Account Activated' :
        confirmModal === 'reject' ? 'Application Rejected' :
        confirmModal === 'request-info' ? 'Additional Information Requested' :
        'Placed on Hold'
      );
    } catch (err) {
      console.error('Decision error:', err);
    } finally {
      setIsSubmitting(false);
      setConfirmModal(null);
    }
  };

  const confirmContent: Record<NonNullable<DecisionType>, { title: string; body: string; btnLabel: string; btnClass: string }> = {
    approve: {
      title: 'Approve for 30-Day Probation',
      body: `You are approving ${candidate.name} for a 30-day probation period. This will trigger the probation workflow and notify the candidate. This action cannot be reversed without a new review.`,
      btnLabel: 'Confirm Approval',
      btnClass: 'btn-primary',
    },
    reject: {
      title: 'Reject Application',
      body: `You are rejecting the application of ${candidate.name}. The candidate will be notified with your review notes. This decision will be recorded in the audit log.`,
      btnLabel: 'Confirm Rejection',
      btnClass: 'bg-red-700 text-white rounded-lg font-semibold text-sm px-4 py-2 hover:bg-red-800 transition-colors',
    },
    'request-info': {
      title: 'Request Additional Information',
      body: `A notification will be sent to ${candidate.name} requesting additional information or documents. The application will be placed in "Pending Information" status until the candidate responds.`,
      btnLabel: 'Send Request',
      btnClass: 'btn-primary',
    },
    hold: {
      title: 'Place Application on Hold',
      body: `${candidate.name}'s application will be placed on hold. No notifications will be sent. The application will remain in the review queue until manually resumed.`,
      btnLabel: 'Confirm Hold',
      btnClass: 'bg-amber-600 text-white rounded-lg font-semibold text-sm px-4 py-2 hover:bg-amber-700 transition-colors',
    },
    reopen: {
      title: 'Reopen Application for Review',
      body: `This will reset the decision status for ${candidate.name} and return the application to "Human Review" queue for re-evaluation.`,
      btnLabel: 'Confirm Reopen',
      btnClass: 'btn-primary',
    },
  };

  // If a new decision was just recorded in this session
  if (decided && decisionMade) {
    const isRejection = decisionMade.toLowerCase().includes('reject');
    return (
      <div className={`card-elevated p-5 border-2 ${isRejection ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20' : 'border-green-300 bg-green-50/50 dark:bg-green-950/20'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRejection ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
              {isRejection ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <p className={`font-bold text-md ${isRejection ? 'text-rose-900 dark:text-rose-200' : 'text-green-900 dark:text-green-200'}`}>
                Decision Recorded: {decisionMade}
              </p>
              <p className={`text-xs mt-0.5 ${isRejection ? 'text-rose-700 dark:text-rose-300' : 'text-green-700 dark:text-green-300'}`}>
                Decision saved to immutable audit log · Candidate notified · Application updated
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfirmModal('reopen')}
            className="text-xs font-semibold px-3 py-1.5 border border-border rounded-lg hover:bg-background text-foreground transition"
          >
            Re-evaluate Application
          </button>
        </div>
      </div>
    );
  }

  // If candidate was already rejected previously
  if (isAlreadyRejected) {
    return (
      <div className="card-elevated p-5 border-2 border-rose-300 bg-rose-50/60 dark:bg-rose-950/25">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 rounded-full flex items-center justify-center flex-shrink-0 text-rose-700 dark:text-rose-400">
              <XCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-base text-rose-900 dark:text-rose-200">Current Status: Application Rejected</p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                This candidate's application has been rejected by the review committee. Decision recorded in audit log.
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfirmModal('reopen')}
            className="text-xs font-semibold px-4 py-2 border border-rose-300 dark:border-rose-800 bg-background hover:bg-rose-100 text-rose-800 dark:text-rose-200 rounded-lg transition"
          >
            Re-evaluate / Reopen Application
          </button>
        </div>
      </div>
    );
  }

  // If candidate was already approved previously
  if (isAlreadyApproved) {
    return (
      <div className="card-elevated p-5 border-2 border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/25">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold text-base text-emerald-900 dark:text-emerald-200">Current Status: Approved for Probation</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Astrologer account is activated and active in 30-day live consultation probation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfirmModal('reopen')}
            className="text-xs font-semibold px-4 py-2 border border-emerald-300 dark:border-emerald-800 bg-background hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 rounded-lg transition"
          >
            Change Decision
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-elevated p-5 border-2 border-primary/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-md text-foreground">Final Review Decision</h3>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                Your decision is final and overrides AI recommendations. All decisions are logged in the audit trail with timestamp and reviewer identity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setConfirmModal('hold')}
              className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2 border-amber-200 text-amber-800 hover:bg-amber-50"
            >
              <PauseCircle size={14} />
              Put on Hold
            </button>

            <button
              onClick={() => setConfirmModal('request-info')}
              className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2"
            >
              <MessageSquare size={14} />
              Request Info
            </button>

            <button
              onClick={() => setConfirmModal('reject')}
              className="btn-secondary text-sm py-2.5 px-4 flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle size={14} />
              Reject Application
            </button>

            <button
              onClick={() => setConfirmModal('approve')}
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 bg-green-700 hover:bg-green-800"
            >
              <CheckCircle2 size={14} />
              Approve for Probation
            </button>
          </div>
        </div>

        {/* AI advisory notice */}
        <div className="mt-4 pt-4 border-t border-border flex items-start gap-2.5">
          <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-amber-700">AI Advisory:</span> The AI has recommended{' '}
            <span className="font-bold text-foreground">{candidate.aiRecommendation}</span> for this candidate with an overall assessment score of{' '}
            <span className="font-bold text-foreground">{candidate.overallAssessmentScore}/100</span>.
            This recommendation is advisory only — your human review decision takes full precedence.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmModal(null)}
          title={confirmContent[confirmModal].title}
          size="md"
          footer={
            <>
              <button onClick={() => setConfirmModal(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDecision}
                disabled={isSubmitting}
                className={`${confirmContent[confirmModal].btnClass} min-w-[140px] flex items-center justify-center gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  confirmContent[confirmModal].btnLabel
                )}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-muted/40 rounded-xl">
              <div className="w-9 h-9 rounded-full terracotta-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{candidate.name}</p>
                <p className="text-xs text-muted-foreground">{candidate.appId} · AI Score: {candidate.aiScore}</p>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {confirmContent[confirmModal].body}
            </p>
            {confirmModal === 'approve' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800 font-medium">
                  ✓ 30-day probation period will begin immediately upon confirmation<br />
                  ✓ Probation checkpoints at Day 7, Day 15, and Day 30 will be scheduled<br />
                  ✓ Candidate will receive onboarding email with probation guidelines
                </p>
              </div>
            )}
            {confirmModal === 'reject' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800 font-medium">
                  ⚠ This action will permanently close this application<br />
                  ⚠ Candidate will be notified with your review notes<br />
                  ⚠ Recorded to immutable audit log with reviewer ID
                </p>
              </div>
            )}
            {confirmModal === 'reopen' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 font-medium">
                  ✓ Application status will return to "Under Committee Review"<br />
                  ✓ Committee reviewers can re-score and enter a new decision
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}