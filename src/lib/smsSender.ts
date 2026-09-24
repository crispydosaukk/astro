export interface Msg91SmsPayload {
  phone: string;
  templateId?: string;
  message?: string;
  candidateName?: string;
  candidateId?: string;
  variables?: Record<string, string | number>;
}

export interface Msg91SmsResponse {
  success: boolean;
  messageId?: string;
  type?: string;
  message?: string;
  error?: string;
  deliveredTo?: string;
  dispatchedAt: string;
  rawResponse?: any;
}

/**
 * Normalizes an Indian or international mobile number to standard MSG91 format (e.g. 919876543210)
 */
export function normalizePhoneNumber(rawPhone: string): string {
  // Strip all non-digit characters
  let digits = rawPhone.replace(/\D/g, '');
  
  // If standard 10 digit Indian number without country code, prefix with 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = `91${digits.substring(1)}`;
  }
  
  return digits;
}

/**
 * Dispatches an SMS via MSG91 Flow API or Template Service
 */
export async function sendMsg91Sms({
  phone,
  templateId,
  message,
  candidateName = 'Astrologer Candidate',
  candidateId,
  variables = {},
}: Msg91SmsPayload): Promise<Msg91SmsResponse> {
  const authKey = process.env.MSG91_AUTH_KEY || '556810AQwSjcKL6a72bde6P1';
  const defaultTemplateId = process.env.MSG91_OUTREACH_TEMPLATE_ID || '6ab4e155fe7c2c662905ac73';
  const effectiveTemplateId = templateId || defaultTemplateId;
  const senderId = process.env.MSG91_SENDER_ID || 'astrop';

  if (!phone) {
    throw new Error('Recipient mobile number is required.');
  }

  const cleanPhone = normalizePhoneNumber(phone);
  const dispatchedAt = new Date().toISOString();

  if (!authKey) {
    throw new Error('MSG91 Auth Key is missing from environment.');
  }

  try {
    const appUrl = `https://astroparihar.com/apply?id=${candidateId || ''}`;
    const defaultSmsMessage = message || `Namaste ${candidateName} Ji, AstroParihar invites you to join our verified astrologer panel. Apply: ${appUrl} - AstroParihar`;

    // 1. Primary: MSG91 Flow API (Recommended for templates with variables ##name## and ##link##)
    const flowRes = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: effectiveTemplateId,
        sender: senderId,
        short_url: '0',
        recipients: [
          {
            mobiles: cleanPhone,
            name: candidateName,
            link: appUrl,
            ...variables,
          },
        ],
      }),
    });

    const flowData = await flowRes.json().catch(() => ({}));
    console.log('MSG91 Flow API Response:', flowData);

    if (flowRes.ok && (flowData.type === 'success' || flowData.message)) {
      return {
        success: true,
        messageId: flowData.message || `msg91-${Date.now()}`,
        message: 'SMS invitation dispatched successfully with verification link via MSG91 Flow.',
        deliveredTo: cleanPhone,
        dispatchedAt,
        rawResponse: flowData,
      };
    }

    // 2. Fallback: Direct MSG91 SMS API
    const smsRes = await fetch('https://control.msg91.com/api/v5/sms/', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: effectiveTemplateId,
        sender: senderId,
        message: defaultSmsMessage,
        mobiles: cleanPhone,
      }),
    });

    const rawText = await smsRes.text();
    console.log('MSG91 SMS API Response:', rawText);

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Standard MSG91 string ID response
    }

    const isSuccess = smsRes.ok && (
      (rawText.length >= 16 && !rawText.toLowerCase().includes('missing') && !rawText.toLowerCase().includes('error') && !rawText.toLowerCase().includes('fail')) ||
      parsedData.type === 'success'
    );

    if (isSuccess) {
      const messageId = parsedData.message || rawText.trim();
      return {
        success: true,
        messageId,
        message: 'SMS invitation dispatched successfully with verification link via MSG91.',
        deliveredTo: cleanPhone,
        dispatchedAt,
        rawResponse: rawText,
      };
    }

    // Return failure response if both methods fail
    return {
      success: false,
      error: flowData.message || rawText || parsedData.message || 'Failed to dispatch SMS via MSG91.',
      deliveredTo: cleanPhone,
      dispatchedAt,
      rawResponse: { flowData, rawText },
    };
  } catch (err: any) {
    console.error('MSG91 SMS dispatch exception:', err);
    throw new Error(err.message || 'An error occurred during SMS transmission.');
  }
}
