import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { queueEmailViaCloudFunction } from './emailService';

export interface QueuedSms {
  toPhone: string;
  candidateName?: string;
  candidateId?: string;
  channel: 'SMS';
  templateId?: string;
  message: string;
  variables?: Record<string, any>;
  status: 'queued' | 'sent' | 'failed';
  createdAt: any;
}

export interface ParallelOutreachPayload {
  candidateName: string;
  candidateId?: string;
  email?: string;
  emailSubject?: string;
  emailBody?: string;
  phone?: string;
  smsMessage?: string;
  smsTemplateId?: string;
  whatsappMessage?: string;
  specialisation?: string;
  location?: string;
  channels?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface ParallelOutreachResult {
  email: {
    attempted: boolean;
    success: boolean;
    target?: string;
    error?: string;
  };
  sms: {
    attempted: boolean;
    success: boolean;
    target?: string;
    error?: string;
  };
  whatsapp: {
    attempted: boolean;
    success: boolean;
    target?: string;
    error?: string;
    pendingApi?: boolean;
  };
}

/**
 * Dispatches an SMS via the MSG91 Next.js API route and records log in Firestore
 */
export async function queueSmsViaMsg91(data: {
  phone: string;
  candidateName?: string;
  candidateId?: string;
  message: string;
  templateId?: string;
  variables?: Record<string, any>;
}): Promise<{ id: string; success: boolean; error?: string; messageId?: string }> {
  try {
    let dispatchSuccess = false;
    let messageId = '';
    let errorMessage = '';

    // 1. Call the server-side API route for MSG91 SMS dispatch
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.phone,
          candidateName: data.candidateName,
          candidateId: data.candidateId,
          message: data.message,
          templateId: data.templateId,
          variables: data.variables,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        dispatchSuccess = true;
        messageId = resData.messageId || '';
      } else {
        errorMessage = resData.error || 'SMS dispatch failed';
      }
    } catch (apiErr: any) {
      console.warn('SMS dispatch route error:', apiErr);
      errorMessage = apiErr.message || 'Network error while calling SMS API';
    }

    // 2. Record to Firestore 'communications' collection
    let docId = `sms-${Date.now()}`;
    try {
      const docRef = await addDoc(collection(db, 'communications'), {
        channel: 'SMS',
        type: 'SMS Sent',
        toPhone: data.phone,
        candidate: data.candidateName || 'Astrologer Candidate',
        candidateId: data.candidateId || '',
        message: data.message,
        preview: data.message,
        templateId: data.templateId || 'Default MSG91 Template',
        status: dispatchSuccess ? 'sent' : errorMessage ? 'failed' : 'queued',
        direction: 'outbound',
        metadata: {
          source: 'AstroParihar AI Admin Portal',
          dispatchedAt: new Date().toISOString(),
          messageId: messageId || null,
          gateway: 'MSG91',
        },
        createdAt: serverTimestamp(),
      });
      docId = docRef.id;
    } catch (firestoreErr) {
      console.warn('Firestore SMS communication logging warning:', firestoreErr);
    }

    return {
      id: docId,
      success: dispatchSuccess || !errorMessage,
      messageId,
      error: errorMessage || undefined,
    };
  } catch (error: any) {
    console.error('SMS queue error:', error);
    return { id: `err-${Date.now()}`, success: false, error: error.message };
  }
}

/**
 * Dispatches outreach across both Email and SMS concurrently
 */
export async function dispatchParallelOutreach(
  payload: ParallelOutreachPayload
): Promise<ParallelOutreachResult> {
  const result: ParallelOutreachResult = {
    email: { attempted: false, success: false },
    sms: { attempted: false, success: false },
    whatsapp: { attempted: false, success: false },
  };

  const tasks: Promise<any>[] = [];
  const channels = payload.channels || {
    email: Boolean(payload.email && payload.emailBody),
    sms: Boolean(payload.phone && payload.smsMessage),
    whatsapp: Boolean(payload.phone && payload.whatsappMessage),
  };

  // 1. Email Task
  if (channels.email && payload.email && payload.emailBody) {
    result.email.attempted = true;
    result.email.target = payload.email;
    tasks.push(
      queueEmailViaCloudFunction({
        to: payload.email,
        candidateName: payload.candidateName,
        candidateId: payload.candidateId,
        subject: payload.emailSubject || `Invitation to Join AstroParihar - ${payload.candidateName}`,
        body: payload.emailBody,
      })
        .then(res => {
          result.email.success = res.success;
          if (!res.success) result.email.error = res.error;
        })
        .catch(err => {
          result.email.success = false;
          result.email.error = err.message;
        })
    );
  }

  // 2. SMS Task
  if (channels.sms && payload.phone && payload.smsMessage) {
    result.sms.attempted = true;
    result.sms.target = payload.phone;
    tasks.push(
      queueSmsViaMsg91({
        phone: payload.phone,
        candidateName: payload.candidateName,
        candidateId: payload.candidateId,
        message: payload.smsMessage,
        templateId: payload.smsTemplateId,
        variables: {
          candidate_name: payload.candidateName,
          specialisation: payload.specialisation || 'Vedic Astrology',
          location: payload.location || 'India',
        },
      })
        .then(res => {
          result.sms.success = res.success;
          if (!res.success) result.sms.error = res.error;
        })
        .catch(err => {
          result.sms.success = false;
          result.sms.error = err.message;
        })
    );
  }

  // 3. WhatsApp Task (Simulated / Queued until official WhatsApp API key is integrated)
  if (channels.whatsapp && payload.phone) {
    result.whatsapp.attempted = true;
    result.whatsapp.target = payload.phone;
    result.whatsapp.success = true;
    result.whatsapp.pendingApi = true;
    try {
      const logsRef = collection(db, 'communication_logs');
      tasks.push(
        addDoc(logsRef, {
          candidateId: payload.candidateId || '',
          candidateName: payload.candidateName,
          channel: 'WhatsApp',
          target: payload.phone,
          status: 'queued',
          note: 'Queued (WhatsApp API integration pending)',
          message: payload.whatsappMessage || payload.smsMessage || '',
          createdAt: serverTimestamp(),
        }).catch(err => console.warn('Could not write whatsapp log:', err))
      );
    } catch (e) {
      // ignore
    }
  }

  await Promise.allSettled(tasks);
  return result;
}
