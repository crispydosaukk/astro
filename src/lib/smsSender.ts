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
  const defaultTemplateId = process.env.MSG91_OUTREACH_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID || '6a72130b9c56d8f88f079d52';
  const effectiveTemplateId = templateId || defaultTemplateId;

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
    const defaultSmsMessage = message || `Namaste ${candidateName} Ji, AstroParihar invites you to join our verified astrologer panel. Apply: ${appUrl}`;

    // 1. Primary: Direct MSG91 SMS Template API (https://control.msg91.com/api/v5/sms/)
    const smsRes = await fetch('https://control.msg91.com/api/v5/sms/', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: effectiveTemplateId,
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

    // 2. Fallback: Standard MSG91 OTP endpoint
    const otpUrl = `https://control.msg91.com/api/v5/otp?template_id=${effectiveTemplateId}&mobile=${cleanPhone}&otp_length=4`;
    const otpRes = await fetch(otpUrl, {
      method: 'POST',
      headers: {
        authkey: authKey,
        'Content-Type': 'application/json',
      },
    });
    const otpData = await otpRes.json().catch(() => ({}));
    console.log('MSG91 OTP/SMS API Response:', otpData);

    if (otpData.type === 'success' && !otpData.hasError) {
      return {
        success: true,
        messageId: otpData.request_id || otpData.message || `sms-otp-${Date.now()}`,
        message: 'SMS dispatched successfully via MSG91.',
        deliveredTo: cleanPhone,
        dispatchedAt,
        rawResponse: otpData,
      };
    }

    // Return failure response if rejected
    return {
      success: false,
      error: rawText || otpData.message || 'Failed to dispatch SMS via MSG91.',
      deliveredTo: cleanPhone,
      dispatchedAt,
      rawResponse: { rawText, otpData },
    };
  } catch (err: any) {
    console.error('MSG91 SMS dispatch exception:', err);
    throw new Error(err.message || 'An error occurred during SMS transmission.');
  }
}
