/**
 * Customer Birth Profile & Kundli Memory Helper
 * 
 * Automatically synchronizes and fetches customer Name, Date of Birth,
 * Time of Birth, and Place of Birth across:
 * - Authentication & Onboarding (AuthScreen)
 * - All 10 Remedies Service Forms (ServiceReportForm)
 * - Free Janam Kundli, Kundli Matching & Horoscope pages
 * - Talk to AI Astrologer & Consultation intake modals
 * - Acharya Parihar AI Chat & Voice Consultations
 */

export interface CustomerBirthProfile {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  gender: string;
  phone: string;
  lat?: string;
  lon?: string;
}

const STORAGE_KEY = 'astroparihar_active_kundli';

export function getActiveCustomerProfile(userData?: any): CustomerBirthProfile {
  let profile: CustomerBirthProfile = {
    name: userData?.name || '',
    dob: userData?.dob || '',
    tob: userData?.tob || '',
    pob: userData?.pob || '',
    gender: userData?.gender || 'Male',
    phone: userData?.phone || '',
    lat: userData?.lat || '',
    lon: userData?.lon || '',
  };

  if (typeof window !== 'undefined') {
    try {
      const cachedRaw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('draft_report');
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        profile.name = profile.name || cached.name || '';
        profile.dob = profile.dob || cached.dob || cached.dateOfBirth || '';
        profile.tob = profile.tob || cached.tob || cached.time || cached.timeOfBirth || '';
        profile.pob = profile.pob || cached.pob || cached.place || cached.birthPlace || '';
        profile.gender = profile.gender || cached.gender || 'Male';
        profile.phone = profile.phone || cached.phone || '';
        profile.lat = profile.lat || cached.lat || '';
        profile.lon = profile.lon || cached.lon || '';
      }
    } catch (e) {
      // ignore
    }
  }

  return profile;
}

export function saveActiveCustomerProfile(updates: Partial<CustomerBirthProfile>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getActiveCustomerProfile();
    const merged: CustomerBirthProfile = {
      ...existing,
      ...updates,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    // ignore
  }
}
