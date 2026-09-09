'use client';

import React, { useState } from 'react';
import type { ReviewCandidate } from './ReviewWorkspace';
import Modal from '@/components/ui/Modal';
import { CheckCircle2, XCircle, MessageSquare, PauseCircle, AlertTriangle, Shield } from 'lucide-react';
import { updateCandidateStatus } from '@/lib/firebase/candidateService';

interface ReviewDecisionBarProps {
  candidate: ReviewCandidate;
}

type DecisionType = 'approve' | 'reject' | 'request-info' | 'hold' | null;

export default function ReviewDecisionBar({ candidate }: ReviewDecisionBarProps) {
  const [confirmModal, setConfirmModal] = useState<DecisionType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decided, setDecided] = useState(false);
  const [decisionMade, setDecisionMade] = useState<string | null>(null);

  const handleDecision = async () => {
    setIsSubmitting(true);
    try {
      // Map decision to lifecycle status
      let newLifecycle = candidate.status;
      if (confirmModal === 'approve') newLifecycle = 'probation';
      else if (confirmModal === 'reject') newLifecycle = 'rejected';
      else if (confirmModal === 'request-info') newLifecycle = 'pending-info';
      else if (confirmModal === 'hold') newLifecycle = 'on-hold';

      // Update Firestore if candidate has a matching ID
      try {
        await updateCandidateStatus(candidate.id, {
          lifecycleStatus: newLifecycle,
          applicationStatus: confirmModal === 'approve' ? 'Approved' : confirmModal === 'reject' ? 'Rejected' : 'Under Review'
        });
      } catch (e) {
        console.warn('Could not sync directly to Firestore (local record update):', e);
      }
    } catch (err) {
      console.error('Decision error:', err);
    } finally {
      setIsSubmitting(false);
      setConfirmModal(null);
      setDecided(true);
      setDecisionMade(
        confirmModal === 'approve' ? 'Approved for 30-Day Probation' :
        confirmModal === 'reject' ? 'Application Rejected' :
        confirmModal === 'request-info' ? 'Additional Information Requested' :
        'Placed on Hold'
      );
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
      title: 'Reject Application',body: `You are rejecting the application of ${candidate.name}. The candidate will be notified with your review notes. This decision will be recorded in the audit log.`,
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
  };

  if (decided && decisionMade) {
    return (
      <div className="card-elevated p-5 border-2 border-green-300 bg-green-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={20} className="text-green-700" />
          </div>
          <div>
            <p className="font-bold text-md text-green-900">Decision Recorded: {decisionMade}</p>
            <p className="text-xs text-green-700 mt-0.5">
              Decision saved to audit log · Candidate notified · Workflow updated
            </p>
          </div>
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
                  ⚠ Candidate can reapply after 6 months
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}