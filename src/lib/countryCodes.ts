export interface CountryCode {
  code: string;
  country: string;
  flag: string;
  iso: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', country: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸', iso: 'US' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', iso: 'AU' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', iso: 'SG' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', iso: 'NP' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', iso: 'QA' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', iso: 'OM' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', iso: 'KW' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', iso: 'BH' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', iso: 'ZA' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', iso: 'NZ' },
  { code: '+230', country: 'Mauritius', flag: '🇲🇺', iso: 'MU' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', iso: 'DE' },
  { code: '+33', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', iso: 'TH' },
  { code: '+679', country: 'Fiji', flag: '🇫🇯', iso: 'FJ' },
  { code: '+1868', country: 'Trinidad and Tobago', flag: '🇹🇹', iso: 'TT' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾', iso: 'GY' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', iso: 'KE' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', iso: 'JP' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', iso: 'HK' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', iso: 'CH' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', iso: 'SE' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', iso: 'NO' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', iso: 'IE' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', iso: 'IT' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', iso: 'ES' },
];

export const DEFAULT_COUNTRY_CODE = '+91';

/**
 * Parses an incoming phone string into country code and local number
 */
export function parsePhoneNumber(rawPhone: string): { countryCode: string; number: string } {
  if (!rawPhone) return { countryCode: DEFAULT_COUNTRY_CODE, number: '' };
  
  const trimmed = rawPhone.trim();
  if (trimmed.startsWith('+')) {
    // Sort by code length descending to match +1868 before +1
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sorted) {
      if (trimmed.startsWith(c.code)) {
        return {
          countryCode: c.code,
          number: trimmed.slice(c.code.length).replace(/^[\s-]+/, '')
        };
      }
    }
  }
  return { countryCode: DEFAULT_COUNTRY_CODE, number: trimmed };
}
