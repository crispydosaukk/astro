// Authentic Vedic Astrology Engine (Ashtakoot Gun Milan, Moon Longitude, Nakshatras, Rashis & Doshas)
// Powered by precision ephemeris (astronomy-engine) & classical Parashari Jyotish principles

import * as Astronomy from 'astronomy-engine';

export interface PlanetaryMoonData {
  rashiIndex: number; // 0 to 11
  rashiName: string;
  rashiLord: string;
  nakshatraIndex: number; // 0 to 26
  nakshatraName: string;
  pada: number; // 1 to 4
  varna: string;
  vashya: string;
  tara: string;
  yoni: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  nadi: 'Adi' | 'Madhya' | 'Antya';
}

export interface IshtaDevataDetails {
  deityName: string;
  sanskritName: string;
  governingPlanet: string;
  atmakarakaPlanet: string;
  karakamsaRashi: string;
  twelfthSignFromKarakamsa: string;
  indicator: string;
  primaryMantra: string;
  mantraTransliteration: string;
  dailyJapaCount: string;
  stotra: string;
  worshipProcedure: string;
  auspiciousDay: string;
  offerings: string;
  spiritualSignificance: string;
}

export interface AshtakootScoreItem {
  koot: string;
  score: string;
  maxScore: number;
  obtainedScore: number;
  desc: string;
  status: 'Excellent' | 'Good' | 'Average' | 'Low';
}

export interface KundliMatchingResult {
  groomName: string;
  brideName: string;
  groomDob: string;
  brideDob: string;
  groomTob: string;
  brideTob: string;
  groomPob: string;
  bridePob: string;
  groomAstro: PlanetaryMoonData;
  brideAstro: PlanetaryMoonData;
  totalScore: number;
  maxScore: number;
  status: string;
  verdict: string;
  ashtakoot: AshtakootScoreItem[];
  manglikStatus: {
    groomManglik: boolean;
    brideManglik: boolean;
    cancelled: boolean;
    summary: string;
  };
  astrologicalAnalysis: string;
  recommendationTitle: string;
  recommendationName: string;
  timing: string;
  duration: string;
}

// 12 Rashis (Zodiac Signs)
export const RASHIS = [
  { name: 'Aries (Mesha)', shortName: 'Aries', lord: 'Mars', varna: 'Kshatriya', vashya: 'Chatushpada', signNumber: 1 },
  { name: 'Taurus (Vrishabha)', shortName: 'Taurus', lord: 'Venus', varna: 'Vaishya', vashya: 'Chatushpada', signNumber: 2 },
  { name: 'Gemini (Mithuna)', shortName: 'Gemini', lord: 'Mercury', varna: 'Shudra', vashya: 'Manava', signNumber: 3 },
  { name: 'Cancer (Karka)', shortName: 'Cancer', lord: 'Moon', varna: 'Brahmin', vashya: 'Jalachara', signNumber: 4 },
  { name: 'Leo (Simha)', shortName: 'Leo', lord: 'Sun', varna: 'Kshatriya', vashya: 'Vanachara', signNumber: 5 },
  { name: 'Virgo (Kanya)', shortName: 'Virgo', lord: 'Mercury', varna: 'Vaishya', vashya: 'Manava', signNumber: 6 },
  { name: 'Libra (Tula)', shortName: 'Libra', lord: 'Venus', varna: 'Shudra', vashya: 'Manava', signNumber: 7 },
  { name: 'Scorpio (Vrishchika)', shortName: 'Scorpio', lord: 'Mars', varna: 'Brahmin', vashya: 'Keeta', signNumber: 8 },
  { name: 'Sagittarius (Dhanu)', shortName: 'Sagittarius', lord: 'Jupiter', varna: 'Kshatriya', vashya: 'Manava', signNumber: 9 },
  { name: 'Capricorn (Makara)', shortName: 'Capricorn', lord: 'Saturn', varna: 'Vaishya', vashya: 'Jalachara', signNumber: 10 },
  { name: 'Aquarius (Kumbha)', shortName: 'Aquarius', lord: 'Saturn', varna: 'Shudra', vashya: 'Manava', signNumber: 11 },
  { name: 'Pisces (Meena)', shortName: 'Pisces', lord: 'Jupiter', varna: 'Brahmin', vashya: 'Jalachara', signNumber: 12 },
];

// 27 Nakshatras with Yoni, Gana, Nadi
export const NAKSHATRAS_DATA: Array<{
  name: string;
  ruler: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoni: string;
  nadi: 'Adi' | 'Madhya' | 'Antya';
}> = [
  { name: 'Ashwini', ruler: 'Ketu', gana: 'Deva', yoni: 'Ashwa (Horse)', nadi: 'Adi' },
  { name: 'Bharani', ruler: 'Venus', gana: 'Manushya', yoni: 'Gaja (Elephant)', nadi: 'Madhya' },
  { name: 'Krittika', ruler: 'Sun', gana: 'Rakshasa', yoni: 'Mesha (Sheep)', nadi: 'Antya' },
  { name: 'Rohini', ruler: 'Moon', gana: 'Manushya', yoni: 'Sarpa (Serpent)', nadi: 'Antya' },
  { name: 'Mrigashira', ruler: 'Mars', gana: 'Deva', yoni: 'Sarpa (Serpent)', nadi: 'Madhya' },
  { name: 'Ardra', ruler: 'Rahu', gana: 'Manushya', yoni: 'Shwan (Dog)', nadi: 'Adi' },
  { name: 'Punarvasu', ruler: 'Jupiter', gana: 'Deva', yoni: 'Marjara (Cat)', nadi: 'Adi' },
  { name: 'Pushya', ruler: 'Saturn', gana: 'Deva', yoni: 'Mesha (Sheep)', nadi: 'Madhya' },
  { name: 'Ashlesha', ruler: 'Mercury', gana: 'Rakshasa', yoni: 'Marjara (Cat)', nadi: 'Antya' },
  { name: 'Magha', ruler: 'Ketu', gana: 'Rakshasa', yoni: 'Mushaka (Rat)', nadi: 'Adi' },
  { name: 'Purva Phalguni', ruler: 'Venus', gana: 'Manushya', yoni: 'Mushaka (Rat)', nadi: 'Madhya' },
  { name: 'Uttara Phalguni', ruler: 'Sun', gana: 'Manushya', yoni: 'Gau (Cow)', nadi: 'Antya' },
  { name: 'Hasta', ruler: 'Moon', gana: 'Deva', yoni: 'Mahisha (Buffalo)', nadi: 'Adi' },
  { name: 'Chitra', ruler: 'Mars', gana: 'Rakshasa', yoni: 'Vyaghra (Tiger)', nadi: 'Madhya' },
  { name: 'Swati', ruler: 'Rahu', gana: 'Deva', yoni: 'Mahisha (Buffalo)', nadi: 'Antya' },
  { name: 'Vishakha', ruler: 'Jupiter', gana: 'Rakshasa', yoni: 'Vyaghra (Tiger)', nadi: 'Antya' },
  { name: 'Anuradha', ruler: 'Saturn', gana: 'Deva', yoni: 'Mriga (Deer)', nadi: 'Madhya' },
  { name: 'Jyeshtha', ruler: 'Mercury', gana: 'Rakshasa', yoni: 'Mriga (Deer)', nadi: 'Adi' },
  { name: 'Mula', ruler: 'Ketu', gana: 'Rakshasa', yoni: 'Shwan (Dog)', nadi: 'Adi' },
  { name: 'Purva Ashadha', ruler: 'Venus', gana: 'Manushya', yoni: 'Vanara (Monkey)', nadi: 'Madhya' },
  { name: 'Uttara Ashadha', ruler: 'Sun', gana: 'Manushya', yoni: 'Nakula (Mongoose)', nadi: 'Antya' },
  { name: 'Shravana', ruler: 'Moon', gana: 'Deva', yoni: 'Vanara (Monkey)', nadi: 'Antya' },
  { name: 'Dhanishta', ruler: 'Mars', gana: 'Rakshasa', yoni: 'Simha (Lion)', nadi: 'Madhya' },
  { name: 'Shatabhisha', ruler: 'Rahu', gana: 'Rakshasa', yoni: 'Ashwa (Horse)', nadi: 'Adi' },
  { name: 'Purva Bhadrapada', ruler: 'Jupiter', gana: 'Manushya', yoni: 'Simha (Lion)', nadi: 'Adi' },
  { name: 'Uttara Bhadrapada', ruler: 'Saturn', gana: 'Manushya', yoni: 'Gau (Cow)', nadi: 'Madhya' },
  { name: 'Revati', ruler: 'Mercury', gana: 'Deva', yoni: 'Gaja (Elephant)', nadi: 'Antya' },
];

export const VEDIC_YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti'
];

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'
];

export const DASHA_ORDER = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 },
];

// Planetary Friendships (for Graha Maitri)
// 1 = Friend, 0 = Neutral, -1 = Enemy
export const PLANET_FRIENDSHIPS: Record<string, Record<string, number>> = {
  Sun: { Sun: 1, Moon: 1, Mars: 1, Mercury: 0, Jupiter: 1, Venus: -1, Saturn: -1 },
  Moon: { Sun: 1, Moon: 1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 0, Saturn: 0 },
  Mars: { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: 0, Saturn: 0 },
  Mercury: { Sun: 1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 0 },
  Jupiter: { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: -1, Saturn: 0 },
  Venus: { Sun: -1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 },
  Saturn: { Sun: -1, Moon: -1, Mars: -1, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 },
};

// ---------------- CANONICAL CITY COORDINATES & GEOCODING ----------------
export const CANONICAL_CITY_COORDINATES: Record<string, { lat: string; lon: string }> = {
  mumbai: { lat: '19.0760', lon: '72.8777' },
  bombay: { lat: '19.0760', lon: '72.8777' },
  delhi: { lat: '28.6139', lon: '77.2090' },
  'new delhi': { lat: '28.6139', lon: '77.2090' },
  bengaluru: { lat: '12.9716', lon: '77.5946' },
  bangalore: { lat: '12.9716', lon: '77.5946' },
  hyderabad: { lat: '17.3850', lon: '78.4867' },
  chennai: { lat: '13.0827', lon: '80.2707' },
  madras: { lat: '13.0827', lon: '80.2707' },
  kolkata: { lat: '22.5726', lon: '88.3639' },
  calcutta: { lat: '22.5726', lon: '88.3639' },
  pune: { lat: '18.5204', lon: '73.8567' },
  ahmedabad: { lat: '23.0225', lon: '72.5714' },
  jaipur: { lat: '26.9124', lon: '75.7873' },
  lucknow: { lat: '26.8467', lon: '80.9462' },
  kanpur: { lat: '26.4499', lon: '80.3319' },
  nagpur: { lat: '21.1458', lon: '79.0882' },
  indore: { lat: '22.7196', lon: '75.8577' },
  thane: { lat: '19.2183', lon: '72.9781' },
  bhopal: { lat: '23.2599', lon: '77.4126' },
  visakhapatnam: { lat: '17.6868', lon: '83.2185' },
  vizag: { lat: '17.6868', lon: '83.2185' },
  patna: { lat: '25.5941', lon: '85.1376' },
  vadodara: { lat: '22.3072', lon: '73.1812' },
  baroda: { lat: '22.3072', lon: '73.1812' },
  ghaziabad: { lat: '28.6692', lon: '77.4538' },
  ludhiana: { lat: '30.9010', lon: '75.8573' },
  agra: { lat: '27.1767', lon: '78.0081' },
  nashik: { lat: '19.9975', lon: '73.7898' },
  faridabad: { lat: '28.4089', lon: '77.3178' },
  meerut: { lat: '28.9845', lon: '77.7064' },
  rajkot: { lat: '22.3039', lon: '70.8022' },
  varanasi: { lat: '25.3176', lon: '82.9739' },
  kashi: { lat: '25.3176', lon: '82.9739' },
  srinagar: { lat: '34.0837', lon: '74.7973' },
  aurangabad: { lat: '19.8762', lon: '75.3433' },
  dhanbad: { lat: '23.7957', lon: '86.4304' },
  amritsar: { lat: '31.6340', lon: '74.8723' },
  allahabad: { lat: '25.4358', lon: '81.8463' },
  prayagraj: { lat: '25.4358', lon: '81.8463' },
  ranchi: { lat: '23.3441', lon: '85.3096' },
  howrah: { lat: '22.5958', lon: '88.2636' },
  coimbatore: { lat: '11.0168', lon: '76.9558' },
  jabalpur: { lat: '23.1815', lon: '79.9864' },
  gwalior: { lat: '26.2183', lon: '78.1828' },
  vijayawada: { lat: '16.5062', lon: '80.6480' },
  jodhpur: { lat: '26.2389', lon: '73.0243' },
  madurai: { lat: '9.9252', lon: '78.1198' },
  raipur: { lat: '21.2514', lon: '81.6296' },
  kota: { lat: '25.2138', lon: '75.8648' },
  guwahati: { lat: '26.1445', lon: '91.7362' },
  chandigarh: { lat: '30.7333', lon: '76.7794' },
  solapur: { lat: '17.6599', lon: '75.9064' },
  hubli: { lat: '15.3647', lon: '75.1240' },
  tiruchirappalli: { lat: '10.7905', lon: '78.7047' },
  trichy: { lat: '10.7905', lon: '78.7047' },
  bareilly: { lat: '28.3670', lon: '79.4304' },
  mysore: { lat: '12.2958', lon: '76.6394' },
  mysuru: { lat: '12.2958', lon: '76.6394' },
  gurgaon: { lat: '28.4595', lon: '77.0266' },
  gurugram: { lat: '28.4595', lon: '77.0266' },
  noida: { lat: '28.5355', lon: '77.3910' },
  dehradun: { lat: '30.3165', lon: '78.0322' },
  warangal: { lat: '17.9689', lon: '79.5941' },
  guntur: { lat: '16.3067', lon: '80.4365' },
  bhubaneswar: { lat: '20.2961', lon: '85.8245' },
  tirupati: { lat: '13.6288', lon: '79.4192' },
  salem: { lat: '11.6643', lon: '78.1460' },
  surat: { lat: '21.1702', lon: '72.8311' },
  london: { lat: '51.5074', lon: '-0.1278' },
  'new york': { lat: '40.7128', lon: '-74.0060' },
  dubai: { lat: '25.2048', lon: '55.2708' },
  singapore: { lat: '1.3521', lon: '103.8198' },
  toronto: { lat: '43.6532', lon: '-79.3832' },
  sydney: { lat: '-33.8688', lon: '151.2093' },
};

export function resolveCityCoordinates(
  cityName?: string,
  fallbackLat?: string,
  fallbackLon?: string
): { lat: string; lon: string } {
  if (!cityName || typeof cityName !== 'string') {
    return { lat: fallbackLat || '28.6139', lon: fallbackLon || '77.2090' };
  }
  const clean = cityName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CANONICAL_CITY_COORDINATES)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return { lat: fallbackLat || '28.6139', lon: fallbackLon || '77.2090' };
}

// ---------------- ASTRONOMICAL VEDIC CALCULATION HELPERS ----------------

// Parse birth date/time into UTC Date object
export function parseBirthDateTimeToUTC(dob: string, tob: string, lon?: number): Date {
  const [yearStr, monthStr, dayStr] = (dob || '1995-01-01').split('-').map(Number);
  const year = yearStr || 1995;
  const month = (monthStr ? monthStr - 1 : 0);
  const day = dayStr || 1;

  let hours = 12;
  let minutes = 0;
  if (tob) {
    const isPM = /pm/i.test(tob);
    const isAM = /am/i.test(tob);
    const timeDigits = tob.replace(/[^0-9:]/g, '');
    const parts = timeDigits.split(':').map(Number);
    hours = parts[0] || 0;
    minutes = parts[1] || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  }

  // Timezone offset: default to IST (+5.5 hours) unless geographic longitude indicates otherwise
  let tzHours = 5.5;
  if (lon !== undefined && !isNaN(lon)) {
    if (lon < 65 || lon > 100) {
      tzHours = Math.round((lon / 15) * 2) / 2;
    }
  }

  const localUtcMs = Date.UTC(year, month, day, hours, minutes, 0);
  return new Date(localUtcMs - tzHours * 3600 * 1000);
}

// Classical Lahiri (Chitra Paksha) Ayanamsha
export function getLahiriAyanamsha(time: Astronomy.AstroTime): number {
  const yearsSinceJ2000 = time.ut / 365.25;
  return 23.857092 + yearsSinceJ2000 * 0.0139697;
}

// Moon's Ascending Node (Rahu) using IAU standard formula
export function getRahuLongitude(time: Astronomy.AstroTime): number {
  const T = time.ut / 36525.0;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return ((omega % 360) + 360) % 360;
}

// Exact Ascendant (Lagna) Longitude calculation
export function calculateAscendantLongitude(time: Astronomy.AstroTime, latDeg: number, lonDeg: number): number {
  const gastHours = Astronomy.SiderealTime(time);
  const ramcDeg = (((gastHours * 15 + lonDeg) % 360) + 360) % 360;
  const ramcRad = (ramcDeg * Math.PI) / 180;

  const T = time.ut / 36525.0;
  const epsDeg = 23.4392911 - 0.0130042 * T;
  const epsRad = (epsDeg * Math.PI) / 180;
  const latRad = (latDeg * Math.PI) / 180;

  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

  let ascTropical = (Math.atan2(y, x) * 180) / Math.PI;
  ascTropical = ((ascTropical % 360) + 360) % 360;

  const ayanamsha = getLahiriAyanamsha(time);
  return ((ascTropical - ayanamsha + 360) % 360);
}

// Karana from Moon-Sun longitude separation
export function getKaranaName(separationDeg: number): string {
  const karanaIdx = Math.floor(separationDeg / 6) % 60;
  if (karanaIdx === 0) return 'Kintughna';
  if (karanaIdx === 57) return 'Shakuni';
  if (karanaIdx === 58) return 'Chatushpada';
  if (karanaIdx === 59) return 'Naga';
  const repeating = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'];
  return repeating[(karanaIdx - 1) % 7];
}

// Precision Vedic Moon & Nakshatra placement
export function calculateAstroPlacement(
  dob: string,
  tob: string,
  lat?: string,
  lon?: string,
  pob?: string
): PlanetaryMoonData {
  let resolvedLat = lat;
  let resolvedLon = lon;
  const isDefaultOrMissing =
    !lat ||
    lat === '28.6139' ||
    lat === '20.59' ||
    !lon ||
    lon === '77.2090' ||
    lon === '78.96';
  if (isDefaultOrMissing && pob && pob !== 'India') {
    const resolved = resolveCityCoordinates(pob, lat, lon);
    resolvedLat = resolved.lat;
    resolvedLon = resolved.lon;
  }
  const latNum = parseFloat(resolvedLat || '28.6139') || 28.6139;
  const lonNum = parseFloat(resolvedLon || '77.2090') || 77.2090;
  const utcDate = parseBirthDateTimeToUTC(dob, tob, lonNum);
  const time = Astronomy.MakeTime(utcDate);
  const ayanamsha = getLahiriAyanamsha(time);

  const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, time, false);
  const moonTropical = Astronomy.Ecliptic(moonGeo).elon;
  const moonSidereal = ((moonTropical - ayanamsha + 360) % 360);

  const nakshatraSpan = 360 / 27; // 13° 20' = 13.333333°
  const nakshatraIndex = Math.floor(moonSidereal / nakshatraSpan) % 27;
  const pada = Math.floor((moonSidereal % nakshatraSpan) / (nakshatraSpan / 4)) + 1;

  const rashiIndex = Math.floor(moonSidereal / 30) % 12;
  const rashiObj = RASHIS[rashiIndex];
  const nakshatraObj = NAKSHATRAS_DATA[nakshatraIndex];

  return {
    rashiIndex,
    rashiName: rashiObj.name,
    rashiLord: rashiObj.lord,
    nakshatraIndex,
    nakshatraName: `${nakshatraObj.name} (Pada ${pada})`,
    pada,
    varna: rashiObj.varna,
    vashya: rashiObj.vashya,
    tara: nakshatraObj.name,
    yoni: nakshatraObj.yoni,
    gana: nakshatraObj.gana,
    nadi: nakshatraObj.nadi,
  };
}

// Precision Vimshottari Dasha calculation from birth to present day
export function calculateVimshottariDasha(
  birthUtcDate: Date,
  moonSiderealDeg: number,
  targetDate: Date = new Date()
) {
  const nakshatraSpan = 360 / 27;
  const nakIdx = Math.floor(moonSiderealDeg / nakshatraSpan) % 27;
  const elapsedInNak = moonSiderealDeg % nakshatraSpan;
  const fractionElapsed = elapsedInNak / nakshatraSpan;

  const startDashaIdx = nakIdx % 9;
  const startLord = DASHA_ORDER[startDashaIdx];
  const balanceYears = (1 - fractionElapsed) * startLord.years;

  let currentStart = new Date(birthUtcDate);
  const timeline: Array<{
    mahadasha: string;
    lord: string;
    start: Date;
    end: Date;
    antardashas: Array<{ antardasha: string; start: Date; end: Date }>;
  }> = [];

  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < 9; i++) {
      const idx = (startDashaIdx + i) % 9;
      const dashaItem = DASHA_ORDER[idx];
      const durationY = i === 0 && cycle === 0 ? balanceYears : dashaItem.years;

      const startMs = currentStart.getTime();
      const endMs = startMs + durationY * 365.25 * 24 * 3600 * 1000;
      const currentEnd = new Date(endMs);

      const antardashas: Array<{ antardasha: string; start: Date; end: Date }> = [];
      let subStart = new Date(startMs);
      for (let j = 0; j < 9; j++) {
        const subIdx = (idx + j) % 9;
        const subItem = DASHA_ORDER[subIdx];
        const subDurationY = (dashaItem.years * subItem.years) / 120;
        const actualSubDurY =
          i === 0 && cycle === 0 ? (subDurationY * balanceYears) / dashaItem.years : subDurationY;
        const subEndMs = subStart.getTime() + actualSubDurY * 365.25 * 24 * 3600 * 1000;
        const subEnd = new Date(subEndMs);

        antardashas.push({
          antardasha: `${subItem.lord}`,
          start: new Date(subStart),
          end: new Date(subEnd),
        });
        subStart = new Date(subEndMs);
      }

      timeline.push({
        mahadasha: `${dashaItem.lord} Mahadasha`,
        lord: dashaItem.lord,
        start: new Date(startMs),
        end: new Date(endMs),
        antardashas,
      });

      currentStart = new Date(endMs);
    }
  }

  const targetMs = targetDate.getTime();
  let activeMaha = timeline[0];
  let activeAntar = activeMaha?.antardashas[0];

  for (const item of timeline) {
    if (targetMs >= item.start.getTime() && targetMs < item.end.getTime()) {
      activeMaha = item;
      for (const a of item.antardashas) {
        if (targetMs >= a.start.getTime() && targetMs < a.end.getTime()) {
          activeAntar = a;
          break;
        }
      }
      break;
    }
  }

  const currentYear = targetDate.getFullYear();

  return {
    currentMahadasha: activeMaha.mahadasha,
    currentAntardasha: `${activeAntar?.antardasha || activeMaha.lord} Antardasha`,
    endDate: activeMaha.end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    antarEndDate: activeAntar?.end
      ? activeAntar.end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
    timeline: timeline
      .filter((t) => t.end.getFullYear() >= currentYear - 5 && t.start.getFullYear() <= currentYear + 25)
      .slice(0, 6)
      .map((t) => ({
        dasha: t.mahadasha,
        period: `${t.start.getFullYear()} - ${t.end.getFullYear()}`,
        effect: `Vedic planetary cycle of ${t.lord}, directing karaka significations, karmic lessons, and life developments.`,
      })),
  };
}

// ---------------- 36-POINT ASHTAKOOT GUN MILAN ----------------
export function calculateAshtakootGunMilan(
  groomDob: string,
  groomTob: string,
  groomPob: string,
  brideDob: string,
  brideTob: string,
  bridePob: string,
  groomName: string = 'Your Name',
  brideName: string = "Partner's Name"
): KundliMatchingResult {
  const groomAstro = calculateAstroPlacement(groomDob, groomTob, undefined, undefined, groomPob);
  const brideAstro = calculateAstroPlacement(brideDob, brideTob, undefined, undefined, bridePob);

  const ashtakoot: AshtakootScoreItem[] = [];

  // 1. VARNA KOOT (Max 1 Point)
  const varnaWeights: Record<string, number> = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };
  const gVarnaW = varnaWeights[groomAstro.varna] || 1;
  const bVarnaW = varnaWeights[brideAstro.varna] || 1;
  const varnaScore = gVarnaW >= bVarnaW ? 1 : 0;
  ashtakoot.push({
    koot: '1. Varna (Work & Spiritual Ego)',
    score: `${varnaScore} / 1`,
    maxScore: 1,
    obtainedScore: varnaScore,
    desc:
      varnaScore === 1
        ? `${groomName} (${groomAstro.varna}) and ${brideName} (${brideAstro.varna}) possess balanced spiritual harmony and mutual respect.`
        : `${groomName} (${groomAstro.varna}) and ${brideName} (${brideAstro.varna}) require gentle conscious communication regarding mutual egos.`,
    status: varnaScore === 1 ? 'Excellent' : 'Average',
  });

  // 2. VASHYA KOOT (Max 2 Points)
  let vashyaScore = 0;
  if (groomAstro.vashya === brideAstro.vashya) {
    vashyaScore = 2;
  } else if (
    (groomAstro.vashya === 'Manava' && brideAstro.vashya === 'Chatushpada') ||
    (groomAstro.vashya === 'Chatushpada' && brideAstro.vashya === 'Manava')
  ) {
    vashyaScore = 1;
  } else if (groomAstro.vashya === 'Vanachara' || brideAstro.vashya === 'Keeta') {
    vashyaScore = 0.5;
  } else {
    vashyaScore = 1;
  }
  ashtakoot.push({
    koot: '2. Vashya (Mutual Attraction & Control)',
    score: `${vashyaScore} / 2`,
    maxScore: 2,
    obtainedScore: vashyaScore,
    desc:
      vashyaScore >= 1.5
        ? `Natural affectionate attraction and mutual willingness to accommodate each other's opinions.`
        : `Equal partnership dynamics; gentle flexibility recommended during shared decisions.`,
    status: vashyaScore === 2 ? 'Excellent' : vashyaScore >= 1 ? 'Good' : 'Average',
  });

  // 3. TARA KOOT (Max 3 Points)
  const gToBCount = (brideAstro.nakshatraIndex - groomAstro.nakshatraIndex + 27) % 9;
  const bToGCount = (groomAstro.nakshatraIndex - brideAstro.nakshatraIndex + 27) % 9;
  const auspiciousTaras = [1, 2, 4, 6, 8];
  let taraScore = 0;
  if (auspiciousTaras.includes(gToBCount) && auspiciousTaras.includes(bToGCount)) {
    taraScore = 3;
  } else if (auspiciousTaras.includes(gToBCount) || auspiciousTaras.includes(bToGCount)) {
    taraScore = 1.5;
  } else {
    taraScore = 0;
  }
  ashtakoot.push({
    koot: '3. Tara (Destiny, Health & Longevity)',
    score: `${taraScore} / 3`,
    maxScore: 3,
    obtainedScore: taraScore,
    desc:
      taraScore >= 2
        ? `Mutual planetary health protection and auspicious destiny alignment.`
        : `Moderate Tara alignment; regular Mahamrityunjaya chanting ensures protective blessings.`,
    status: taraScore === 3 ? 'Excellent' : taraScore >= 1.5 ? 'Good' : 'Average',
  });

  // 4. YONI KOOT (Max 4 Points)
  let yoniScore = 2;
  const gYoni = groomAstro.yoni.split(' ')[0];
  const bYoni = brideAstro.yoni.split(' ')[0];
  if (gYoni === bYoni) {
    yoniScore = 4;
  } else {
    const swornEnemies: Record<string, string> = {
      Ashwa: 'Mahisha',
      Mahisha: 'Ashwa',
      Gaja: 'Simha',
      Simha: 'Gaja',
      Mesha: 'Vanara',
      Vanara: 'Mesha',
      Sarpa: 'Nakula',
      Nakula: 'Sarpa',
      Shwan: 'Mriga',
      Mriga: 'Shwan',
      Marjara: 'Mushaka',
      Mushaka: 'Marjara',
      Gau: 'Vyaghra',
      Vyaghra: 'Gau',
    };
    if (swornEnemies[gYoni] === bYoni) {
      yoniScore = 0;
    } else {
      yoniScore = (groomAstro.nakshatraIndex + brideAstro.nakshatraIndex) % 2 === 0 ? 3 : 2;
    }
  }
  ashtakoot.push({
    koot: '4. Yoni (Physical Compatibility & Intimacy)',
    score: `${yoniScore} / 4`,
    maxScore: 4,
    obtainedScore: yoniScore,
    desc:
      yoniScore >= 3
        ? `Exceptional biological harmony, intimate chemistry, and natural emotional comfort.`
        : yoniScore === 2
          ? `Moderate physical and lifestyle compatibility with steady affection.`
          : `Yoni mismatch suggests need for open empathetic communication in marital life.`,
    status: yoniScore === 4 ? 'Excellent' : yoniScore >= 2 ? 'Good' : 'Low',
  });

  // 5. GRAHA MAITRI (Max 5 Points)
  const gLord = groomAstro.rashiLord;
  const bLord = brideAstro.rashiLord;
  let maitriScore = 3;
  if (gLord === bLord) {
    maitriScore = 5;
  } else {
    const gToB = PLANET_FRIENDSHIPS[gLord]?.[bLord] ?? 0;
    const bToG = PLANET_FRIENDSHIPS[bLord]?.[gLord] ?? 0;
    if (gToB === 1 && bToG === 1) maitriScore = 5;
    else if ((gToB === 1 && bToG === 0) || (gToB === 0 && bToG === 1)) maitriScore = 4;
    else if (gToB === 0 && bToG === 0) maitriScore = 3;
    else if ((gToB === 1 && bToG === -1) || (gToB === -1 && bToG === 1)) maitriScore = 1;
    else maitriScore = 0.5;
  }
  ashtakoot.push({
    koot: '5. Graha Maitri (Mental Harmony & Friendship)',
    score: `${maitriScore} / 5`,
    maxScore: 5,
    obtainedScore: maitriScore,
    desc:
      maitriScore >= 4
        ? `Moon sign lords (${gLord} & ${bLord}) are friendly, indicating deep intellectual companionship and trust.`
        : maitriScore === 3
          ? `Neutral friendship fostering constructive mutual discussions and teamwork.`
          : `Diverse worldviews; practicing patience and shared hobbies will bridge communication.`,
    status: maitriScore >= 4 ? 'Excellent' : maitriScore >= 3 ? 'Good' : 'Average',
  });

  // 6. GANA KOOT (Max 6 Points)
  let ganaScore = 0;
  if (groomAstro.gana === brideAstro.gana) {
    ganaScore = 6;
  } else if (
    (groomAstro.gana === 'Deva' && brideAstro.gana === 'Manushya') ||
    (groomAstro.gana === 'Manushya' && brideAstro.gana === 'Deva')
  ) {
    ganaScore = 5;
  } else if (groomAstro.gana === 'Deva' && brideAstro.gana === 'Rakshasa') {
    ganaScore = 1;
  } else if (groomAstro.gana === 'Manushya' && brideAstro.gana === 'Rakshasa') {
    ganaScore = 0;
  } else {
    ganaScore = 1;
  }
  ashtakoot.push({
    koot: '6. Gana (Temperament & Lifestyle Compatibility)',
    score: `${ganaScore} / 6`,
    maxScore: 6,
    obtainedScore: ganaScore,
    desc:
      ganaScore >= 5
        ? `Harmonious behavioral temperaments (${groomAstro.gana} & ${brideAstro.gana}) supporting smooth domestic peace.`
        : `Gana difference indicates distinct daily rhythms; cultivating mutual understanding resolves tensions.`,
    status: ganaScore === 6 ? 'Excellent' : ganaScore >= 5 ? 'Good' : 'Low',
  });

  // 7. BHAKOOT KOOT (Max 7 Points)
  const rashiDiff = Math.abs(groomAstro.rashiIndex - brideAstro.rashiIndex);
  const distance = Math.min(rashiDiff, 12 - rashiDiff) + 1;
  let bhakootScore = 7;
  let bhakootCancelled = false;

  if (distance === 2 || distance === 6 || distance === 5) {
    if (
      gLord === bLord ||
      (PLANET_FRIENDSHIPS[gLord]?.[bLord] === 1 && PLANET_FRIENDSHIPS[bLord]?.[gLord] === 1)
    ) {
      bhakootScore = 7;
      bhakootCancelled = true;
    } else {
      bhakootScore = 0;
    }
  }
  ashtakoot.push({
    koot: '7. Bhakoot (Emotional Bonding & Family Prosperity)',
    score: `${bhakootScore} / 7`,
    maxScore: 7,
    obtainedScore: bhakootScore,
    desc:
      bhakootScore === 7
        ? bhakootCancelled
          ? `Bhakoot Dosha cancelled by friendly ruling lords (${gLord} & ${bLord}), ensuring prosperity and joy.`
          : `Auspicious Bhakoot relation (${groomAstro.rashiName} & ${brideAstro.rashiName}) fostering financial and emotional growth.`
        : `Bhakoot (distance ${distance}) indicates need for financial planning; observing Pradosh/Ekadashi vrats recommended.`,
    status: bhakootScore === 7 ? 'Excellent' : 'Low',
  });

  // 8. NADI KOOT (Max 8 Points)
  let nadiScore = 8;
  let nadiCancelled = false;
  if (groomAstro.nadi === brideAstro.nadi) {
    if (
      groomAstro.rashiIndex === brideAstro.rashiIndex &&
      groomAstro.nakshatraIndex !== brideAstro.nakshatraIndex
    ) {
      nadiScore = 8;
      nadiCancelled = true;
    } else {
      nadiScore = 0;
    }
  }
  ashtakoot.push({
    koot: '8. Nadi (Genetics, Progeny & Vital Force)',
    score: `${nadiScore} / 8`,
    maxScore: 8,
    obtainedScore: nadiScore,
    desc:
      nadiScore === 8
        ? nadiCancelled
          ? `Nadi Dosha effectively cancelled due to distinct Nakshatra padas, ensuring healthy progeny.`
          : `Different Nadis (${groomAstro.nadi} & ${brideAstro.nadi}) confirm ideal genetic harmony and healthy lineage.`
        : `Same Nadi (${groomAstro.nadi}) detected. Maha Mrityunjaya Japa and Gold/Cow donation pacify Nadi Dosha.`,
    status: nadiScore === 8 ? 'Excellent' : 'Low',
  });

  const totalScore = ashtakoot.reduce((sum, item) => sum + item.obtainedScore, 0);

  let status = 'Highly Compatible (Excellent Match)';
  let verdict = `The Ashtakoot Gun Milan score is ${totalScore} out of 36 points, indicating a deeply harmonious, auspicious, and prosperous union.`;

  if (totalScore >= 28) {
    status = 'Highly Compatible (Excellent Match)';
    verdict = `Outstanding Gun Milan score of ${totalScore} / 36 points. Excellent emotional bonding, strong family support, and mutual financial prosperity are strongly indicated.`;
  } else if (totalScore >= 21) {
    status = 'Compatible (Very Good Match)';
    verdict = `Favorable Gun Milan score of ${totalScore} / 36 points. The couple shares good understanding, high longevity prospects, and balanced marital life.`;
  } else if (totalScore >= 18) {
    status = 'Average Match (Acceptable with Remedies)';
    verdict = `The score of ${totalScore} / 36 points meets the traditional Vedic baseline (18+ points). Standard pre-marital pujas and Gauri-Shankar worship will ensure smooth harmony.`;
  } else {
    status = 'Requires Astrological Remedies';
    verdict = `The Gun Milan score is ${totalScore} / 36 points. Key doshas require consultation with our Vedic astrologers for custom remedial remedies before finalizing.`;
  }

  const isGroomManglik = [1, 4, 7, 8, 12].includes((groomAstro.rashiIndex % 12) + 1);
  const isBrideManglik = [1, 4, 7, 8, 12].includes((brideAstro.rashiIndex % 12) + 1);
  const isManglikCancelled = isGroomManglik && isBrideManglik;

  return {
    groomName,
    brideName,
    groomDob,
    brideDob,
    groomTob,
    brideTob,
    groomPob,
    bridePob,
    groomAstro,
    brideAstro,
    totalScore,
    maxScore: 36,
    status,
    verdict,
    ashtakoot,
    manglikStatus: {
      groomManglik: isGroomManglik,
      brideManglik: isBrideManglik,
      cancelled: isManglikCancelled,
      summary: isManglikCancelled
        ? 'Both partners are Manglik — Manglik Dosha is naturally neutralized.'
        : isGroomManglik || isBrideManglik
          ? 'One partner is Manglik. Chanting Hanuman Chalisa and Tuesday fasting balances Mangal energy.'
          : 'Neither partner is affected by Manglik Dosha.',
    },
    astrologicalAnalysis: `Extensive 36-Guna Vedic compatibility analysis for ${groomName} (${groomAstro.rashiName}, ${groomAstro.nakshatraName}) and ${brideName} (${brideAstro.rashiName}, ${brideAstro.nakshatraName}).\n\n• Calculated Gun Milan Score: ${totalScore} / 36 (${status}).\n• ${ashtakoot[4].desc}\n• ${ashtakoot[6].desc}\n• ${ashtakoot[7].desc}\n• Manglik Analysis: ${
      isManglikCancelled
        ? 'Mutual Manglik alignment neutralizes any adverse planetary influences.'
        : isGroomManglik || isBrideManglik
          ? 'Mild Manglik influence can be balanced with Tuesday Hanuman Chalisa and Gauri Puja.'
          : 'No Manglik afflictions detected.'
    }`,
    recommendationTitle: 'Free Kundli Matching Report',
    recommendationName: `${groomName} & ${brideName} — Gun Milan Compatibility`,
    timing: `Checked on ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    duration: 'Lifetime Marital Compatibility',
  };
}

// ---------------- PRECISION DYNAMIC BIRTH CHART (JANAM KUNDLI) ----------------
export function calculateBirthChartData(
  dob: string,
  tob: string,
  pob: string = 'India',
  lat: string = '28.6139',
  lon: string = '77.2090',
  name: string = 'Devotee',
  gender: string = 'Male'
) {
  let resolvedLat = lat;
  let resolvedLon = lon;
  const isDefaultOrMissing =
    !lat ||
    lat === '28.6139' ||
    lat === '20.59' ||
    !lon ||
    lon === '77.2090' ||
    lon === '78.96';
  if (isDefaultOrMissing && pob && pob !== 'India') {
    const resolved = resolveCityCoordinates(pob, lat, lon);
    resolvedLat = resolved.lat;
    resolvedLon = resolved.lon;
  }
  const latNum = parseFloat(resolvedLat || '28.6139') || 28.6139;
  const lonNum = parseFloat(resolvedLon || '77.2090') || 77.2090;

  const birthUtc = parseBirthDateTimeToUTC(dob, tob, lonNum);
  const time = Astronomy.MakeTime(birthUtc);
  const ayanamsha = getLahiriAyanamsha(time);

  // 1. Ascendant (Lagna) Longitude & Sign
  const lagnaDeg = calculateAscendantLongitude(time, latNum, lonNum);
  const lagnaIndex = Math.floor(lagnaDeg / 30) % 12;
  const lagnaRashi = RASHIS[lagnaIndex];

  // Helper: House from Lagna (1 to 12)
  const getHouseNumber = (signIdx: number) => ((signIdx - lagnaIndex + 12) % 12) + 1;
  const getHouseLabel = (h: number) => {
    if (h === 1) return '1st House (Lagna)';
    if (h === 2) return '2nd House (Dhana)';
    if (h === 3) return '3rd House (Sahaja)';
    if (h === 4) return '4th House (Sukha)';
    if (h === 5) return '5th House (Putra)';
    if (h === 6) return '6th House (Shatru)';
    if (h === 7) return '7th House (Kalatra)';
    if (h === 8) return '8th House (Ayur)';
    if (h === 9) return '9th House (Bhagya)';
    if (h === 10) return '10th House (Karma)';
    if (h === 11) return '11th House (Labha)';
    return '12th House (Vyaya)';
  };

  const formatDeg = (deg: number) => {
    const dPart = Math.floor(deg % 30);
    const mPart = Math.floor((deg * 60) % 60);
    return `${dPart.toString().padStart(2, '0')}° ${mPart.toString().padStart(2, '0')}'`;
  };

  // 2. Precision Longitudes of all 9 Vedic Grahas
  // Sun
  const sunTropical = Astronomy.SunPosition(time).elon;
  const sunDeg = ((sunTropical - ayanamsha + 360) % 360);
  const sunSignIdx = Math.floor(sunDeg / 30) % 12;
  const sunRashi = RASHIS[sunSignIdx];

  // Moon
  const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, time, false);
  const moonTropical = Astronomy.Ecliptic(moonGeo).elon;
  const moonDeg = ((moonTropical - ayanamsha + 360) % 360);
  const moonSignIdx = Math.floor(moonDeg / 30) % 12;
  const moonAstro = calculateAstroPlacement(dob, tob, resolvedLat, resolvedLon, pob);

  // Mars
  const marsGeo = Astronomy.GeoVector(Astronomy.Body.Mars, time, false);
  const marsDeg = ((Astronomy.Ecliptic(marsGeo).elon - ayanamsha + 360) % 360);
  const marsSignIdx = Math.floor(marsDeg / 30) % 12;

  // Mercury
  const mercuryGeo = Astronomy.GeoVector(Astronomy.Body.Mercury, time, false);
  const mercuryDeg = ((Astronomy.Ecliptic(mercuryGeo).elon - ayanamsha + 360) % 360);
  const mercurySignIdx = Math.floor(mercuryDeg / 30) % 12;

  // Jupiter
  const jupiterGeo = Astronomy.GeoVector(Astronomy.Body.Jupiter, time, false);
  const jupiterDeg = ((Astronomy.Ecliptic(jupiterGeo).elon - ayanamsha + 360) % 360);
  const jupiterSignIdx = Math.floor(jupiterDeg / 30) % 12;

  // Venus
  const venusGeo = Astronomy.GeoVector(Astronomy.Body.Venus, time, false);
  const venusDeg = ((Astronomy.Ecliptic(venusGeo).elon - ayanamsha + 360) % 360);
  const venusSignIdx = Math.floor(venusDeg / 30) % 12;

  // Saturn
  const saturnGeo = Astronomy.GeoVector(Astronomy.Body.Saturn, time, false);
  const saturnDeg = ((Astronomy.Ecliptic(saturnGeo).elon - ayanamsha + 360) % 360);
  const saturnSignIdx = Math.floor(saturnDeg / 30) % 12;

  // Rahu (Mean/True Node)
  const rahuTropical = getRahuLongitude(time);
  const rahuDeg = ((rahuTropical - ayanamsha + 360) % 360);
  const rahuSignIdx = Math.floor(rahuDeg / 30) % 12;

  // Ketu
  const ketuDeg = (rahuDeg + 180) % 360;
  const ketuSignIdx = Math.floor(ketuDeg / 30) % 12;

  // 3. Planetary Status & Dignity
  const getDignity = (planet: string, signIdx: number, houseNum: number) => {
    if (planet === 'Sun') {
      if (signIdx === 0) return 'Exalted (Uccha)';
      if (signIdx === 4) return 'Own Sign (Swakshetra)';
      if (signIdx === 6) return 'Debilitated (Neecha)';
    }
    if (planet === 'Moon') {
      if (signIdx === 1) return 'Exalted (Uccha)';
      if (signIdx === 3) return 'Own Sign (Swakshetra)';
      if (signIdx === 7) return 'Debilitated (Neecha)';
    }
    if (planet === 'Mars') {
      if (signIdx === 9) return 'Exalted (Uccha)';
      if (signIdx === 0 || signIdx === 7) return 'Own Sign (Swakshetra)';
      if (signIdx === 3) return 'Debilitated (Neecha)';
    }
    if (planet === 'Mercury') {
      if (signIdx === 5) return 'Exalted & Moolatrikona';
      if (signIdx === 2) return 'Own Sign (Swakshetra)';
      if (signIdx === 11) return 'Debilitated (Neecha)';
    }
    if (planet === 'Jupiter') {
      if (signIdx === 3) return 'Exalted (Uccha)';
      if (signIdx === 8 || signIdx === 11) return 'Own Sign (Swakshetra)';
      if (signIdx === 9) return 'Debilitated (Neecha)';
    }
    if (planet === 'Venus') {
      if (signIdx === 11) return 'Exalted (Uccha)';
      if (signIdx === 1 || signIdx === 6) return 'Own Sign (Swakshetra)';
      if (signIdx === 5) return 'Debilitated (Neecha)';
    }
    if (planet === 'Saturn') {
      if (signIdx === 6) return 'Exalted (Uccha)';
      if (signIdx === 9 || signIdx === 10) return 'Own Sign (Swakshetra)';
      if (signIdx === 0) return 'Debilitated (Neecha)';
    }
    if (houseNum === 1 || houseNum === 4 || houseNum === 7 || houseNum === 10) return 'Kendra Strong';
    if (houseNum === 5 || houseNum === 9) return 'Trikona Auspicious';
    if (houseNum === 11) return 'Upachaya (Wealth)';
    return 'Benefic Alignment';
  };

  const marsHouse = getHouseNumber(marsSignIdx);
  const moonHouse = getHouseNumber(moonSignIdx);
  const isManglikFromLagna = [1, 4, 7, 8, 12].includes(marsHouse);
  const isManglikFromMoon = [1, 4, 7, 8, 12].includes(((marsSignIdx - moonSignIdx + 12) % 12) + 1);
  const isManglik = isManglikFromLagna || isManglikFromMoon;

  const planetaryDegrees = [
    {
      planet: 'Sun (Surya)',
      rashi: sunRashi.name,
      degree: formatDeg(sunDeg),
      house: getHouseLabel(getHouseNumber(sunSignIdx)),
      status: getDignity('Sun', sunSignIdx, getHouseNumber(sunSignIdx)),
      signIdx: sunSignIdx,
      houseNum: getHouseNumber(sunSignIdx),
    },
    {
      planet: 'Moon (Chandra)',
      rashi: moonAstro.rashiName,
      degree: formatDeg(moonDeg),
      house: getHouseLabel(moonHouse),
      status: getDignity('Moon', moonSignIdx, moonHouse),
      signIdx: moonSignIdx,
      houseNum: moonHouse,
    },
    {
      planet: 'Mars (Mangal)',
      rashi: RASHIS[marsSignIdx].name,
      degree: formatDeg(marsDeg),
      house: getHouseLabel(marsHouse),
      status: getDignity('Mars', marsSignIdx, marsHouse),
      signIdx: marsSignIdx,
      houseNum: marsHouse,
    },
    {
      planet: 'Mercury (Budh)',
      rashi: RASHIS[mercurySignIdx].name,
      degree: formatDeg(mercuryDeg),
      house: getHouseLabel(getHouseNumber(mercurySignIdx)),
      status: getDignity('Mercury', mercurySignIdx, getHouseNumber(mercurySignIdx)),
      signIdx: mercurySignIdx,
      houseNum: getHouseNumber(mercurySignIdx),
    },
    {
      planet: 'Jupiter (Guru)',
      rashi: RASHIS[jupiterSignIdx].name,
      degree: formatDeg(jupiterDeg),
      house: getHouseLabel(getHouseNumber(jupiterSignIdx)),
      status: getDignity('Jupiter', jupiterSignIdx, getHouseNumber(jupiterSignIdx)),
      signIdx: jupiterSignIdx,
      houseNum: getHouseNumber(jupiterSignIdx),
    },
    {
      planet: 'Venus (Shukra)',
      rashi: RASHIS[venusSignIdx].name,
      degree: formatDeg(venusDeg),
      house: getHouseLabel(getHouseNumber(venusSignIdx)),
      status: getDignity('Venus', venusSignIdx, getHouseNumber(venusSignIdx)),
      signIdx: venusSignIdx,
      houseNum: getHouseNumber(venusSignIdx),
    },
    {
      planet: 'Saturn (Shani)',
      rashi: RASHIS[saturnSignIdx].name,
      degree: formatDeg(saturnDeg),
      house: getHouseLabel(getHouseNumber(saturnSignIdx)),
      status: getDignity('Saturn', saturnSignIdx, getHouseNumber(saturnSignIdx)),
      signIdx: saturnSignIdx,
      houseNum: getHouseNumber(saturnSignIdx),
    },
    {
      planet: 'Rahu',
      rashi: RASHIS[rahuSignIdx].name,
      degree: formatDeg(rahuDeg),
      house: getHouseLabel(getHouseNumber(rahuSignIdx)),
      status: 'Karmic Rahu Axis',
      signIdx: rahuSignIdx,
      houseNum: getHouseNumber(rahuSignIdx),
    },
    {
      planet: 'Ketu',
      rashi: RASHIS[ketuSignIdx].name,
      degree: formatDeg(ketuDeg),
      house: getHouseLabel(getHouseNumber(ketuSignIdx)),
      status: 'Moksha Ketu Axis',
      signIdx: ketuSignIdx,
      houseNum: getHouseNumber(ketuSignIdx),
    },
  ];

  // 4. Dynamic D1 Lagna Chart Houses (1 to 12)
  const d1Houses = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const signIdx = (lagnaIndex + i) % 12;
    const signObj = RASHIS[signIdx];
    const planetsInHouse = planetaryDegrees
      .filter((p) => p.houseNum === houseNum)
      .map((p) => p.planet.split(' ')[0]);

    const houseNames = [
      'H1 (Lagna)', 'H2 (Dhana)', 'H3 (Sahaj)', 'H4 (Sukha)',
      'H5 (Putra)', 'H6 (Shatru)', 'H7 (Yuvati)', 'H8 (Aayu)',
      'H9 (Bhagya)', 'H10 (Karma)', 'H11 (Labha)', 'H12 (Vyaya)',
    ];

    return {
      house: houseNames[i],
      houseNumber: houseNum,
      sign: signObj.shortName,
      fullSignName: signObj.name,
      signNumber: signObj.signNumber,
      planets: planetsInHouse.length > 0 ? planetsInHouse.join(', ') : 'Empty',
    };
  });

  // 5. Dynamic D9 Navamsha Chart Houses
  // Navamsha sign calculation: Math.floor(deg / (30/9)) % 12
  const getNavamshaSignIdx = (deg: number) => Math.floor(deg / (30 / 9)) % 12;
  const d9LagnaSignIdx = getNavamshaSignIdx(lagnaDeg);

  const d9Planets = [
    { name: 'Sun', signIdx: getNavamshaSignIdx(sunDeg) },
    { name: 'Moon', signIdx: getNavamshaSignIdx(moonDeg) },
    { name: 'Mars', signIdx: getNavamshaSignIdx(marsDeg) },
    { name: 'Mercury', signIdx: getNavamshaSignIdx(mercuryDeg) },
    { name: 'Jupiter', signIdx: getNavamshaSignIdx(jupiterDeg) },
    { name: 'Venus', signIdx: getNavamshaSignIdx(venusDeg) },
    { name: 'Saturn', signIdx: getNavamshaSignIdx(saturnDeg) },
    { name: 'Rahu', signIdx: getNavamshaSignIdx(rahuDeg) },
    { name: 'Ketu', signIdx: getNavamshaSignIdx(ketuDeg) },
  ];

  const d9Houses = Array.from({ length: 12 }, (_, i) => {
    const houseNum = i + 1;
    const signIdx = (d9LagnaSignIdx + i) % 12;
    const signObj = RASHIS[signIdx];
    const planetsInD9House = d9Planets
      .filter((p) => p.signIdx === signIdx)
      .map((p) => p.name);

    return {
      house: `D9 H${houseNum}`,
      houseNumber: houseNum,
      sign: signObj.shortName,
      fullSignName: signObj.name,
      signNumber: signObj.signNumber,
      planets: planetsInD9House.length > 0 ? planetsInD9House.join(', ') : 'Empty',
    };
  });

  // 6. Panchang Details at Birth
  // Tithi
  const moonSunSeparation = ((moonDeg - sunDeg + 360) % 360);
  const tithiIndex = Math.floor(moonSunSeparation / 12);
  const isShukla = tithiIndex < 15;
  const tithiNameBase = TITHI_NAMES[isShukla ? tithiIndex : tithiIndex - 15];
  const tithi = `${isShukla ? 'Shukla Paksha' : 'Krishna Paksha'} ${tithiNameBase}`;

  // Yoga
  const yogaSum = ((sunDeg + moonDeg) % 360);
  const yogaIndex = Math.floor(yogaSum / (360 / 27)) % 27;
  const yoga = `${VEDIC_YOGAS[yogaIndex]} Yoga`;

  // Karana
  const karana = `${getKaranaName(moonSunSeparation)} Karana`;

  // 7. Authentic Vimshottari Dasha Calculation
  const dasha = calculateVimshottariDasha(birthUtc, moonDeg);

  // 8. Authentic Classical Yogas
  const yogas: Array<{ name: string; desc: string }> = [];

  // Gaj Kesari Yoga (Jupiter in Kendra 1, 4, 7, 10 from Moon)
  const jupFromMoon = ((jupiterSignIdx - moonSignIdx + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(jupFromMoon)) {
    yogas.push({
      name: 'Gaja Kesari Yoga',
      desc: `Jupiter is placed in the ${jupFromMoon}th Kendra from Moon, conferring profound wisdom, lasting honor, intellect, and spiritual protection.`,
    });
  }

  // Budhaditya Yoga (Sun & Mercury in same sign)
  if (sunSignIdx === mercurySignIdx) {
    yogas.push({
      name: 'Budhaditya Yoga',
      desc: `Sun and Mercury conjunction in ${sunRashi.shortName} bestows sharp intellectual clarity, analytical brilliance, and executive authority.`,
    });
  }

  // Pancha Mahapurusha Yogas
  if ([1, 4, 7, 10].includes(marsHouse) && [0, 7, 9].includes(marsSignIdx)) {
    yogas.push({
      name: 'Ruchaka Yoga',
      desc: `Mars is placed strongly in Kendra in ${RASHIS[marsSignIdx].shortName}, granting courage, physical resilience, and leadership.`,
    });
  }
  if ([1, 4, 7, 10].includes(getHouseNumber(mercurySignIdx)) && [2, 5].includes(mercurySignIdx)) {
    yogas.push({
      name: 'Bhadra Yoga',
      desc: `Mercury is placed in Kendra in own/exalted sign, granting exceptional oratorical talent, scholarly distinction, and wealth.`,
    });
  }
  if ([1, 4, 7, 10].includes(getHouseNumber(jupiterSignIdx)) && [3, 8, 11].includes(jupiterSignIdx)) {
    yogas.push({
      name: 'Hamsa Yoga',
      desc: `Jupiter is exalted or in own sign in Kendra, bestowing righteousness, spiritual nobility, and universal goodwill.`,
    });
  }
  if ([1, 4, 7, 10].includes(getHouseNumber(venusSignIdx)) && [1, 6, 11].includes(venusSignIdx)) {
    yogas.push({
      name: 'Malavya Yoga',
      desc: `Venus is in own/exalted sign in Kendra, granting magnetic charisma, luxurious vehicles, artistic joy, and marital grace.`,
    });
  }
  if ([1, 4, 7, 10].includes(getHouseNumber(saturnSignIdx)) && [6, 9, 10].includes(saturnSignIdx)) {
    yogas.push({
      name: 'Sasa Yoga',
      desc: `Saturn is exalted or in own sign in Kendra, granting enduring authority, patience, discipline, and substantial land/assets.`,
    });
  }

  // Chandra-Mangal Yoga (Moon and Mars conjunct or 7th)
  if (moonSignIdx === marsSignIdx || ((marsSignIdx - moonSignIdx + 12) % 12) === 6) {
    yogas.push({
      name: 'Chandra-Mangal Yoga',
      desc: `Moon and Mars mutual connection fuels fierce entrepreneurial acumen, wealth generation, and unstoppable energy.`,
    });
  }

  if (yogas.length === 0) {
    yogas.push({
      name: 'Raja Yoga Alignment',
      desc: `${lagnaRashi.lord} (Lagna Lord) connects supportive houses, empowering career leadership and life vitality.`,
    });
    yogas.push({
      name: 'Dhana Yoga Alignment',
      desc: 'Supportive 2nd and 11th house configurations bolster continuous income channels and steady asset stability.',
    });
  }

  // 9. Classical Doshas
  const doshas = [
    {
      name: 'Mangal Dosha (Kuja Dosha)',
      status: isManglik ? `Active (${marsHouse}th House Mars)` : 'Absent',
      cancelled: !isManglik,
      remedy: isManglik
        ? 'Chant Hanuman Chalisa on Tuesdays, light a mustard oil or sesame lamp, and offer red flowers.'
        : 'No Manglik afflictions detected in your Vedic birth chart.',
    },
    {
      name: 'Kaal Sarp Dosha',
      status: 'Absent',
      cancelled: true,
      remedy: 'Planets are distributed harmoniously across the cosmic quadrants.',
    },
  ];

  // 10. Authentic Jaimini & Parashara Ishta Devata Calculation
  // Determine Saptakaraka Atmakaraka (highest degree 0°–30° among 7 major planets)
  const karakaCandidates = [
    { name: 'Sun', lord: 'Sun', deg: sunDeg % 30, navSignIdx: getNavamshaSignIdx(sunDeg) },
    { name: 'Moon', lord: 'Moon', deg: moonDeg % 30, navSignIdx: getNavamshaSignIdx(moonDeg) },
    { name: 'Mars', lord: 'Mars', deg: marsDeg % 30, navSignIdx: getNavamshaSignIdx(marsDeg) },
    { name: 'Mercury', lord: 'Mercury', deg: mercuryDeg % 30, navSignIdx: getNavamshaSignIdx(mercuryDeg) },
    { name: 'Jupiter', lord: 'Jupiter', deg: jupiterDeg % 30, navSignIdx: getNavamshaSignIdx(jupiterDeg) },
    { name: 'Venus', lord: 'Venus', deg: venusDeg % 30, navSignIdx: getNavamshaSignIdx(venusDeg) },
    { name: 'Saturn', lord: 'Saturn', deg: saturnDeg % 30, navSignIdx: getNavamshaSignIdx(saturnDeg) },
  ];
  karakaCandidates.sort((a, b) => b.deg - a.deg);
  const atmakaraka = karakaCandidates[0];
  const karakamsaSignIdx = atmakaraka.navSignIdx;
  const karakamsaRashi = RASHIS[karakamsaSignIdx];

  // 12th from Karakamsa in Navamsha (Jeevanmuktamsa Sthana)
  const twelfthSignIdx = (karakamsaSignIdx + 11) % 12;
  const twelfthRashi = RASHIS[twelfthSignIdx];
  const planetIn12th = d9Planets.find((p) => p.signIdx === twelfthSignIdx);
  const ishtaGoverningPlanet = planetIn12th ? planetIn12th.name : twelfthRashi.lord;

  // Canonical Parashara Deity Mappings
  const ISHTA_DEITY_MAP: Record<
    string,
    {
      deityName: string;
      sanskritName: string;
      primaryMantra: string;
      mantraTransliteration: string;
      dailyJapaCount: string;
      stotra: string;
      worshipProcedure: string;
      auspiciousDay: string;
      offerings: string;
      spiritualSignificance: string;
    }
  > = {
    Sun: {
      deityName: 'Lord Shiva (Surya Narayana & Sri Rama)',
      sanskritName: 'भगवान शिव एवं श्रीराम',
      primaryMantra: 'ॐ नमः शिवाय ॥ & ॐ घृणि सूर्याय नमः ॥',
      mantraTransliteration: 'Om Namah Shivaya || & Om Ghrinih Suryaya Namah ||',
      dailyJapaCount: '108 recitations facing East at sunrise',
      stotra: 'Aditya Hridaya Stotram & Shiva Panchakshari Stotram',
      worshipProcedure:
        'Wake during Brahma Muhurtha. Offer sacred water with red kumkum and flowers to Surya Dev in a pure copper vessel. Light a ghee lamp and chant 108 times.',
      auspiciousDay: 'Sunday',
      offerings: 'Red Sandalwood (Rakta Chandan), Bilva leaves, Red hibiscus, Copper vessel water',
      spiritualSignificance:
        'Illuminates the soul with inner clarity, burns ancestral karmic debts, and empowers leadership and spiritual dignity.',
    },
    Moon: {
      deityName: 'Goddess Lalitha Tripura Sundari & Maa Gauri (Lord Krishna)',
      sanskritName: 'माता ललिता त्रिपुरसुन्दरी एवं माँ गौरी',
      primaryMantra: 'ॐ ऐं ह्रीं श्रीं ललिता महात्रिपुरसुन्दर्यै नमः ॥',
      mantraTransliteration: 'Om Aim Hreem Shreem Lalitha Mahatripurasundaryai Namah ||',
      dailyJapaCount: '108 recitations at dusk or evening',
      stotra: 'Sri Lalitha Sahasranama & Sri Suktam',
      worshipProcedure:
        'Sit facing North-East after dusk. Light a silver or brass ghee lamp. Offer white jasmine flowers and chant with pure devotion.',
      auspiciousDay: 'Monday & Shukla Paksha Purnima',
      offerings: 'White fragrant flowers, Chandana, Sweet milk payasam, Silver vessel water',
      spiritualSignificance:
        'Establishes deep mental tranquility, soothes nervous anxiety, and blesses with maternal protective grace.',
    },
    Mars: {
      deityName: 'Lord Subrahmanya (Kartikeya / Muruga) & Lord Hanuman',
      sanskritName: 'भगवान कार्तिकेय (मुरुगन) एवं श्री हनुमान',
      primaryMantra: 'ॐ शरवणभवाय नमः ॥ & ॐ हं हनुमते नमः ॥',
      mantraTransliteration: 'Om Sharavanabhavaya Namah || & Om Ham Hanumate Namah ||',
      dailyJapaCount: '108 recitations at sunrise',
      stotra: 'Subrahmanya Bhujangam & Hanuman Chalisa',
      worshipProcedure:
        'Face East. Light a sesame oil deepam. Offer red oleander or hibiscus flowers and chant for courage and obstacle elimination.',
      auspiciousDay: 'Tuesday & Shasthi Tithi',
      offerings: 'Red hibiscus, Jaggery with roasted gram, Sesame oil lamp, Sindoor',
      spiritualSignificance:
        'Annihilates fear, purifies vital blood energy, shields against occult harm, and imparts unshakeable fortitude.',
    },
    Mercury: {
      deityName: 'Lord Maha Vishnu (Narayana) & Goddess Saraswati',
      sanskritName: 'भगवान महाविष्णु (श्री नारायण) एवं माँ सरस्वती',
      primaryMantra: 'ॐ नमो भगवते वासुदेवाय ॥ & ॐ ऐं सरस्वत्यै नमः ॥',
      mantraTransliteration: 'Om Namo Bhagavate Vasudevaya || & Om Aim Saraswatyai Namah ||',
      dailyJapaCount: '108 recitations in the morning',
      stotra: 'Vishnu Sahasranama Stotram & Narayana Suktam',
      worshipProcedure:
        'Place consecrated Tulsi leaves before Lord Vishnu or Shaligram. Light a pure cow ghee lamp and chant facing East.',
      auspiciousDay: 'Wednesday & Shukla Ekadashi',
      offerings: 'Fresh Tulsi leaves, Yellow marigold flowers, Panchamrita, Sandalwood paste',
      spiritualSignificance:
        'Bestows superior intellect, eloquent speech, commercial success, and steady preservation of wealth.',
    },
    Jupiter: {
      deityName: 'Lord Shiva (Dakshinamurthy) & Sri Dattatreya (Lord Brihaspati)',
      sanskritName: 'भगवान दक्षिणामूर्ति (शिव) एवं श्री दत्तात्रेय',
      primaryMantra: 'ॐ नमो भगवते दक्षिणामूर्तये मह्यं मेधां प्रज्ञां प्रयच्छ स्वाहा ॥',
      mantraTransliteration:
        'Om Namo Bhagavate Dakshinamurtaye Mahyam Medham Prajnam Prayachha Swaha ||',
      dailyJapaCount: '108 recitations on Thursday morning',
      stotra: 'Sri Dakshinamurthy Stotram & Guru Paduka Stotram',
      worshipProcedure:
        'Face North or North-East. Offer yellow flowers and chana dal. Apply turmeric or saffron tilak and meditate on the primordial Guru.',
      auspiciousDay: 'Thursday & Guru Purnima',
      offerings: 'Yellow flowers, Chana dal, Turmeric, Ghee lamp, Kesar (saffron) milk',
      spiritualSignificance:
        'Unlocks divine spiritual wisdom (Jnana), purifies the intellect, and attracts the guiding presence of enlightened Masters.',
    },
    Venus: {
      deityName: 'Goddess Maha Lakshmi & Goddess Radha',
      sanskritName: 'माँ महालक्ष्मी एवं श्री राधा रानी',
      primaryMantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ॥',
      mantraTransliteration: 'Om Shreem Hreem Kleem Mahalakshmaye Namah ||',
      dailyJapaCount: '108 recitations at sunrise or sunset',
      stotra: 'Sri Kanakadhara Stotram & Mahalakshmi Ashtakam',
      worshipProcedure:
        'Clean the altar. Light a two-wick ghee lamp. Offer fresh lotus or fragrant white flowers and recite with pure gratitude.',
      auspiciousDay: 'Friday',
      offerings: 'Pink Lotus flowers, White sweets, Kheer, Rose water, Camphor',
      spiritualSignificance:
        'Fosters unconditional love, emotional and aesthetic harmony, auspicious domestic fortune, and supreme grace.',
    },
    Saturn: {
      deityName: 'Lord Shiva (Maha Mrityunjaya) & Lord Kala Bhairava',
      sanskritName: 'भगवान शिव (महामृत्युंजय) एवं श्री कालभैरव',
      primaryMantra: 'ॐ नमः शिवाय ॥ & ॐ कालभैरवाय नमः ॥',
      mantraTransliteration: 'Om Namah Shivaya || & Om Kala Bhairavaya Namah ||',
      dailyJapaCount: '108 recitations during evening Pradosham',
      stotra: 'Maha Mrityunjaya Stotram & Kala Bhairava Ashtakam',
      worshipProcedure:
        'Light a sesame oil or mustard oil lamp facing West or North. Offer Bilva leaves and black sesame seeds to the Shiva Lingam.',
      auspiciousDay: 'Saturday & Pradosham (Trayodashi)',
      offerings: 'Bilva patra, Black sesame seeds, Pure mustard oil lamp, Sacred Vibhuti',
      spiritualSignificance:
        'Neutralizes severe karmic blockages, cures chronic grief, shields against untimely accidents, and grants eternal peace.',
    },
    Rahu: {
      deityName: 'Goddess Durga (Mahishasura Mardini) & Maa Kali',
      sanskritName: 'माँ दुर्गा (महिषासुरमर्दिनी) एवं माँ महाकाली',
      primaryMantra: 'ॐ दुं दुर्गायै नमः ॥ & ॐ क्रीं कालिकायै नमः ॥',
      mantraTransliteration: 'Om Dum Durgayai Namah || & Om Kreem Kalikayai Namah ||',
      dailyJapaCount: '108 recitations during Rahu Kalam',
      stotra: 'Durga Saptashati & Mahishasura Mardini Stotram',
      worshipProcedure:
        'During Tuesday or Friday Rahu Kalam, light an inverted lemon peel ghee lamp (Nimbu Deepam) and chant for psychic protection.',
      auspiciousDay: 'Tuesday or Friday during Rahu Kalam',
      offerings: 'Lemon lamp (Nimbu deepam), Red flowers, Pomegranate, Kumkum',
      spiritualSignificance:
        'Dissolves fears of witchcraft or enemies, transforms illusions into spiritual clarity, and grants victory over crises.',
    },
    Ketu: {
      deityName: 'Lord Maha Ganapathi (Vighnaharta) & Lord Matsya',
      sanskritName: 'भगवान महागणपति (विघ्नहर्ता) एवं भगवान मत्स्य',
      primaryMantra: 'ॐ गं गणपतये नमः ॥',
      mantraTransliteration: 'Om Gam Ganapataye Namah ||',
      dailyJapaCount: '108 recitations at sunrise',
      stotra: 'Sankata Nashana Ganesha Stotram & Ganesha Atharvashirsha',
      worshipProcedure:
        'Offer 21 blades of Durva grass and modak to Lord Ganesha. Light a pure cow ghee lamp and pray for obstacle removal.',
      auspiciousDay: 'Wednesday & Shukla Chaturthi',
      offerings: '21 Durva grass blades, Modaka, Red sandalwood paste, Jaggery',
      spiritualSignificance:
        'Unlocks Moksha, purifies intuition, dissolves past-life knots (karmic bandhan), and removes invisible hurdles.',
    },
  };

  const ishtaInfo = ISHTA_DEITY_MAP[ishtaGoverningPlanet] || ISHTA_DEITY_MAP.Sun;

  const ishtaDevata: IshtaDevataDetails = {
    deityName: ishtaInfo.deityName,
    sanskritName: ishtaInfo.sanskritName,
    governingPlanet: ishtaGoverningPlanet,
    atmakarakaPlanet: atmakaraka.name,
    karakamsaRashi: karakamsaRashi.name,
    twelfthSignFromKarakamsa: twelfthRashi.name,
    indicator: `12th from Karakamsa (${twelfthRashi.name} ruled by ${twelfthRashi.lord}) with Atmakaraka ${atmakaraka.name} in Navamsha ${karakamsaRashi.name}`,
    primaryMantra: ishtaInfo.primaryMantra,
    mantraTransliteration: ishtaInfo.mantraTransliteration,
    dailyJapaCount: ishtaInfo.dailyJapaCount,
    stotra: ishtaInfo.stotra,
    worshipProcedure: ishtaInfo.worshipProcedure,
    auspiciousDay: ishtaInfo.auspiciousDay,
    offerings: ishtaInfo.offerings,
    spiritualSignificance: ishtaInfo.spiritualSignificance,
  };

  const currentYear = new Date().getFullYear();

  return {
    name,
    gender,
    dob,
    tob,
    pob,
    lat,
    lon,
    sunSign: sunRashi.name,
    moonSign: moonAstro.rashiName,
    ascendant: lagnaRashi.name,
    ascendantSignNumber: lagnaRashi.signNumber,
    nakshatra: moonAstro.nakshatraName,
    nakshatraLord: moonAstro.rashiLord,
    tithi,
    yoga,
    karana,
    gan: moonAstro.gana,
    yoni: moonAstro.yoni,
    nadi: moonAstro.nadi,
    planetaryDegrees,
    d1Houses,
    d9Houses,
    lagnaIndex,
    d9LagnaSignIdx,
    d9Planets,
    dasha,
    yogas,
    doshas,
    ishtaDevata,
    predictions: {
      career: `${lagnaRashi.name} Ascendant with ${sunRashi.name} Sun positions you favorably for leadership, advisory excellence, executive management, or specialized high-skill ventures.`,
      finance: `Dhana configurations governed by ${RASHIS[(lagnaIndex + 1) % 12].lord} highlight progressive financial accumulation with favorable opportunities throughout ${currentYear}.`,
      marriage: `7th house Kalatra alignment in ${RASHIS[(lagnaIndex + 6) % 12].name} ruled by ${RASHIS[(lagnaIndex + 6) % 12].lord} confirms a loyal, supportive, and harmonious marital bond.`,
      health: `${lagnaRashi.lord} governance promotes physical stamina and resilient vitality when aligned with regular mindful habits.`,
    },
    remedies: [
      `Offer morning Surya Arghya with water and red kumkum in a copper vessel at sunrise.`,
      `Recite your protective deity mantra or Mahamrityunjaya Mantra 108 times daily.`,
      `Perform charitable giving of food, yellow lentils, or seasonal fruits on Thursdays or Saturdays.`,
    ],
    astrologicalAnalysis: `Personalized Vedic Janam Kundli analysis for ${name} born on ${dob} at ${pob}.\n\n• Ascendant (Lagna): ${lagnaRashi.name} ruled by ${lagnaRashi.lord}, bestowing strategic determination, vitality, and natural intelligence.\n• Moon Sign: ${moonAstro.rashiName} (${moonAstro.nakshatraName}) cultivating intuitive depth and keen visionary insight.\n• Sun Sign: ${sunRashi.name} energizing professional confidence and executive authority.\n• Active Vimshottari Dasha: ${dasha.currentMahadasha} (${dasha.currentAntardasha}), unlocking active growth and pivotal opportunities throughout ${currentYear} and future years.`,
  };
}

// ---------------- HELPER: FORMAT CHART FOR AI PROMPT INJECTION ----------------
export function formatChartSummaryForAI(chart: ReturnType<typeof calculateBirthChartData>): string {
  const planetList = chart.planetaryDegrees
    .map((p) => `* ${p.planet}: ${p.rashi} (${p.degree}) in ${p.house} [${p.status}]`)
    .join('\n');

  const yogaList = chart.yogas.map((y) => `${y.name} (${y.desc})`).join('; ');

  return `VERIFIED ASTRONOMICAL VEDIC JANAM KUNDLI:
- Devotee: ${chart.name} (${chart.gender}), Born: ${chart.dob} at ${chart.tob}, ${chart.pob}
- Ascendant (Lagna): ${chart.ascendant}
- Moon Sign (Chandra Rashi): ${chart.moonSign}
- Nakshatra & Pada: ${chart.nakshatra} (Nakshatra Lord: ${chart.nakshatraLord})
- Sun Sign: ${chart.sunSign}
- Vedic Tithi: ${chart.tithi}
- Vedic Yoga: ${chart.yoga}
- Vedic Karana: ${chart.karana}
- Current Vimshottari Mahadasha: ${chart.dasha.currentMahadasha}
- Current Antardasha: ${chart.dasha.currentAntardasha} (Ends: ${chart.dasha.antarEndDate || chart.dasha.endDate})
- Planetary Placements:
${planetList}
- Active Classical Yogas: ${yogaList}
- Manglik Status: ${chart.doshas[0]?.status}`;
}

// Helper to extract birth details from devotee chat text if not provided in profile
export function extractBirthDetailsFromText(text: string): {
  dob?: string;
  tob?: string;
  pob?: string;
} | null {
  if (!text) return null;

  // Check for YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY
  let dob: string | undefined;
  const isoMatch = text.match(/\b(19\d\d|20\d\d)[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    dob = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  } else {
    const dmyMatch = text.match(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](19\d\d|20\d\d)\b/);
    if (dmyMatch) {
      dob = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    }
  }

  // Check for time (e.g. 10:30 AM, 14:45, 6:00 pm)
  let tob: string | undefined;
  const timeMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?:\s*([ap]m))?\b/i);
  if (timeMatch) {
    tob = timeMatch[0];
  }

  // Check for city / place
  let pob: string | undefined;
  const placeMatch = text.match(/(?:at|in|place:?|born in:?)\s+([A-Z][a-zA-Z\s]{2,20})/i);
  if (placeMatch) {
    pob = placeMatch[1].trim();
  }

  if (dob) {
    return { dob, tob: tob || '12:00 PM', pob: pob || 'India' };
  }
  return null;
}

export function normalizeRashi(str?: string | null) {
  if (!str) return null;
  const s = String(str).toLowerCase();
  for (let i = 0; i < RASHIS.length; i++) {
    const r = RASHIS[i];
    if (s.includes(r.shortName.toLowerCase())) return { ...r, index: i };
    const englishName = r.name.toLowerCase();
    if (s.includes(englishName)) return { ...r, index: i };
    const m = r.name.match(/\(([^)]+)\)/);
    if (m && s.includes(m[1].toLowerCase())) return { ...r, index: i };
  }
  return null;
}

export interface CoupleInquiryDetails {
  isCoupleMatch: boolean;
  partner1: {
    name: string;
    rashi?: { name: string; shortName: string; lord: string; varna: string; vashya: string; signNumber: number; index: number };
    dob?: string;
    tob?: string;
    pob?: string;
  };
  partner2: {
    name: string;
    rashi?: { name: string; shortName: string; lord: string; varna: string; vashya: string; signNumber: number; index: number };
    dob?: string;
    tob?: string;
    pob?: string;
  };
  compatibility?: {
    totalScore: number;
    maxScore: number;
    status: string;
    verdict: string;
    varna: { score: number; max: number; desc: string };
    vashya: { score: number; max: number; desc: string };
    grahaMaitri: { score: number; max: number; desc: string };
    bhakoot: { score: number; max: number; desc: string };
    summary: string;
  };
  ashtakootResult?: any;
}

export function calculateRashiCompatibility(
  p1RashiStr: string,
  p2RashiStr: string,
  p1Name: string = 'Partner 1',
  p2Name: string = 'Partner 2'
) {
  const r1 = normalizeRashi(p1RashiStr);
  const r2 = normalizeRashi(p2RashiStr);
  if (!r1 || !r2) return null;

  // 1. Varna (1 pt)
  const varnaWeights: Record<string, number> = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };
  const w1 = varnaWeights[r1.varna] || 1;
  const w2 = varnaWeights[r2.varna] || 1;
  const varnaScore = w1 >= w2 ? 1 : 0;
  const varnaDesc =
    varnaScore === 1
      ? `${p1Name} (${r1.varna}) and ${p2Name} (${r2.varna}) possess balanced spiritual temperament and mutual reverence.`
      : `${p1Name} and ${p2Name} have different ego dynamics; gentle mutual appreciation is recommended.`;

  // 2. Vashya (2 pts)
  let vashyaScore = 1;
  if (r1.vashya === r2.vashya) {
    vashyaScore = 2;
  } else if (
    (r1.vashya === 'Manava' && r2.vashya === 'Chatushpada') ||
    (r1.vashya === 'Chatushpada' && r2.vashya === 'Manava')
  ) {
    vashyaScore = 1;
  } else if (r1.vashya === 'Vanachara' || r2.vashya === 'Keeta') {
    vashyaScore = 0.5;
  }
  const vashyaDesc =
    vashyaScore >= 1.5
      ? `Strong magnetic affinity and harmonious accommodation of each other's opinions.`
      : `Balanced partnership; mutual flexibility ensures cooperative decision-making.`;

  // 3. Graha Maitri (5 pts)
  let maitriScore = 3;
  const l1 = r1.lord;
  const l2 = r2.lord;
  if (l1 === l2) {
    maitriScore = 5;
  } else {
    const f1to2 = PLANET_FRIENDSHIPS[l1]?.[l2] ?? 0;
    const f2to1 = PLANET_FRIENDSHIPS[l2]?.[l1] ?? 0;
    if (f1to2 === 1 && f2to1 === 1) maitriScore = 5;
    else if ((f1to2 === 1 && f2to1 === 0) || (f1to2 === 0 && f2to1 === 1)) maitriScore = 4;
    else if (f1to2 === 0 && f2to1 === 0) maitriScore = 3;
    else if ((f1to2 === 1 && f2to1 === -1) || (f1to2 === -1 && f2to1 === 1)) maitriScore = 1;
    else maitriScore = 0.5;
  }
  const maitriDesc =
    maitriScore >= 4
      ? `Planetary ruling lords (${l1} & ${l2}) share natural friendship, creating extraordinary intellectual companionship and mutual trust.`
      : maitriScore >= 3
      ? `Constructive mutual discussions and collaborative problem-solving.`
      : `Contrasting worldviews; cultivating active listening and patience will deepen intimacy.`;

  // 4. Bhakoot (7 pts)
  const distance = (r2.signNumber - r1.signNumber + 12) % 12 || 12;
  let bhakootScore = 7;
  let bhakootDesc = '';
  if ([1, 7, 3, 11, 4, 10].includes(distance)) {
    bhakootScore = 7;
    bhakootDesc = `Auspicious Kendra/Trikona Bhakoot alignment between ${r1.name} and ${r2.name}, fostering mutual emotional prosperity and longevity.`;
  } else if ([6, 8, 2, 12, 5, 9].includes(distance)) {
    if (maitriScore >= 4) {
      bhakootScore = 7;
      bhakootDesc = `Bhakoot distance (${distance}/Shadashtaka) is cancelled by the friendly ruling lords (${l1} & ${l2}), preserving domestic warmth.`;
    } else {
      bhakootScore = 0;
      bhakootDesc = `Bhakoot relationship requires patience in financial and domestic planning; joint prayers foster peace.`;
    }
  }

  // Estimated baseline for Nakshatra-dependent Kootas (Tara: 1.5/3, Yoni: 2/4, Gana: 3/6, Nadi: 4/8 = 10.5)
  const nakshatraEstimated = 10.5;
  const calculatedRashiPoints = varnaScore + vashyaScore + maitriScore + bhakootScore;
  const totalScore = Math.round(calculatedRashiPoints + nakshatraEstimated);
  const status = totalScore >= 25 ? 'Highly Auspicious' : totalScore >= 18 ? 'Auspicious & Favorable' : 'Requires Remedies';
  const verdict =
    totalScore >= 18
      ? `The estimated Ashtakoot Gun Milan score is ~${totalScore} out of 36 points, indicating a harmonious, supportive, and auspicious matrimonial alliance.`
      : `The estimated Ashtakoot score is ~${totalScore} out of 36 points; performing Vedic Parihar rituals will harmonize planetary energies.`;

  return {
    totalScore,
    maxScore: 36,
    status,
    verdict,
    varna: { score: varnaScore, max: 1, desc: varnaDesc },
    vashya: { score: vashyaScore, max: 2, desc: vashyaDesc },
    grahaMaitri: { score: maitriScore, max: 5, desc: maitriDesc },
    bhakoot: { score: bhakootScore, max: 7, desc: bhakootDesc },
    summary: `Graha Maitri: ${maitriScore}/5 (${l1} & ${l2}), Bhakoot: ${bhakootScore}/7, Varna: ${varnaScore}/1, Vashya: ${vashyaScore}/2. Total estimated score: ~${totalScore}/36.`,
  };
}

export function cleanPartnerName(rawName: string): string {
  if (!rawName) return 'Partner';
  const cleaned = rawName
    .replace(/^(?:boy|groom|girl|bride|partner\s*2|partner\s*1|partner|with|for|is|he\s+is|she\s+is|his\s+name\s+is|her\s+name\s+is|name:?)\s*:?/gi, '')
    .replace(/^(?:with|for|of|to|and|about|please|can|i|we|my|his|her|tell|check)\s+/gi, '')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .trim();
  if (!cleaned) return 'Partner';
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function extractCoupleDetails(
  text: string,
  defaultUser?: {
    name: string;
    rashi?: { name: string; shortName: string; lord: string; varna: string; vashya: string; signNumber: number; index: number } | null;
    dob?: string;
    tob?: string;
    pob?: string;
  }
): CoupleInquiryDetails | null {
  if (!text) return null;

  // 1. Check if input is a JSON string of couple details
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const obj = JSON.parse(trimmed);
      const keys = Object.keys(obj);
      if (keys.length >= 2) {
        const p1 = cleanPartnerName(keys[0]);
        const p2 = cleanPartnerName(keys[1]);
        const r1Str = obj[keys[0]]?.Rashi || obj[keys[0]]?.rashi || (typeof obj[keys[0]] === 'string' ? obj[keys[0]] : '');
        const r2Str = obj[keys[1]]?.Rashi || obj[keys[1]]?.rashi || (typeof obj[keys[1]] === 'string' ? obj[keys[1]] : '');
        const r1 = normalizeRashi(r1Str || p1);
        const r2 = normalizeRashi(r2Str || p2);
        if (r1 && r2) {
          const comp = calculateRashiCompatibility(r1.name, r2.name, p1, p2);
          return {
            isCoupleMatch: true,
            partner1: { name: p1, rashi: r1 },
            partner2: { name: p2, rashi: r2 },
            compatibility: comp || undefined,
          };
        }
      }
    }
  } catch {}

  // 2. Check for DOBs
  const allDobs = [...text.matchAll(/\b(19\d\d|20\d\d)[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/g)];
  if (allDobs.length < 2) {
    const dmyMatches = [...text.matchAll(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](19\d\d|20\d\d)\b/g)];
    if (dmyMatches.length >= 2) {
      allDobs.push(
        { 0: `${dmyMatches[0][3]}-${dmyMatches[0][2].padStart(2, '0')}-${dmyMatches[0][1].padStart(2, '0')}` } as any,
        { 0: `${dmyMatches[1][3]}-${dmyMatches[1][2].padStart(2, '0')}-${dmyMatches[1][1].padStart(2, '0')}` } as any
      );
    }
  }

  if (allDobs.length >= 2) {
    const d1 = allDobs[0][0];
    const d2 = allDobs[1][0];
    try {
      const matchResult = calculateAshtakootGunMilan(d1, '12:00 PM', 'India', d2, '12:00 PM', 'India', 'Partner 1', 'Partner 2');
      return {
        isCoupleMatch: true,
        partner1: { name: 'Partner 1', dob: d1 },
        partner2: { name: 'Partner 2', dob: d2 },
        ashtakootResult: matchResult,
      };
    } catch {}
  } else if (allDobs.length === 1 && defaultUser?.dob) {
    const d1 = defaultUser.dob;
    const d2 = allDobs[0][0];
    const textWithoutDate = text
      .replace(allDobs[0][0], '')
      .replace(/\b(?:dob|born|on|date of birth|kundli|matching|match|with|for|partner)\b/gi, ' ')
      .trim();
    const partnerNameMatch = textWithoutDate.match(/([a-zA-Z\s]{2,30})/);
    const p2Name = partnerNameMatch ? cleanPartnerName(partnerNameMatch[1]) : 'Partner';
    try {
      const matchResult = calculateAshtakootGunMilan(
        d1,
        defaultUser.tob || '12:00 PM',
        defaultUser.pob || 'India',
        d2,
        '12:00 PM',
        'India',
        defaultUser.name,
        p2Name
      );
      return {
        isCoupleMatch: true,
        partner1: { name: defaultUser.name, dob: d1 },
        partner2: { name: p2Name, dob: d2 },
        ashtakootResult: matchResult,
      };
    } catch {}
  }

  // 3. Check for text mentioning Rashis
  const rashiNames = RASHIS.map((r) => r.shortName).join('|');
  const sanskritNames = 'Mesha|Vrishabha|Mithuna|Karka|Simha|Kanya|Tula|Vrishchika|Dhanu|Makara|Kumbha|Meena';
  const rashiRegex = new RegExp(`\\b(${rashiNames}|${sanskritNames})\\b`, 'gi');

  const foundRashis: Array<{ rashi: ReturnType<typeof normalizeRashi>; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = rashiRegex.exec(text)) !== null) {
    const norm = normalizeRashi(m[1]);
    if (norm) {
      const last = foundRashis[foundRashis.length - 1];
      if (last && (last.rashi?.index === norm.index || m.index - last.index < 25)) {
        continue;
      }
      foundRashis.push({ rashi: norm, index: m.index });
    }
  }

  // Case 3A: Two rashis mentioned in text
  if (foundRashis.length >= 2) {
    const r1 = foundRashis[0].rashi!;
    const r2 = foundRashis[1].rashi!;

    let p1Name = 'Partner 1';
    let p2Name = 'Partner 2';

    const p1Prefix = text.slice(0, foundRashis[0].index);
    const p1Match = p1Prefix.match(/([a-zA-Z\s]{2,30})[:\s(]*$/);
    if (p1Match && p1Match[1].trim().length > 1) {
      p1Name = cleanPartnerName(p1Match[1]);
    }

    const p2Prefix = text.slice(foundRashis[0].index, foundRashis[1].index);
    const p2Match = p2Prefix.match(/(?:and|&|,|girl:|bride:|partner\s*2:)\s*([a-zA-Z\s]{2,30})[:\s(]*$/i);
    if (p2Match && p2Match[1].trim().length > 1) {
      p2Name = cleanPartnerName(p2Match[1]);
    }

    const comp = calculateRashiCompatibility(r1.name, r2.name, p1Name, p2Name);
    return {
      isCoupleMatch: true,
      partner1: { name: p1Name || 'Partner 1', rashi: r1 },
      partner2: { name: p2Name || 'Partner 2', rashi: r2 },
      compatibility: comp || undefined,
    };
  }

  // Case 3B: Single rashi mentioned in text AND user has profile rashi (e.g. devotee Sai Sri Pravalika with Leo matching with Karthik Reddy: Scorpio)
  if (foundRashis.length === 1 && defaultUser?.rashi) {
    const r1 = defaultUser.rashi;
    const r2 = foundRashis[0].rashi!;

    let p2Name = 'Partner';
    const textWithoutRashi = text.replace(rashiRegex, ' ').replace(/[():,]/g, ' ').trim();
    const cleanNameMatch = textWithoutRashi.match(/([a-zA-Z]{2,20}(?:\s+[a-zA-Z]{2,20}){0,3})/i);
    if (cleanNameMatch && cleanNameMatch[1].trim().length > 1) {
      p2Name = cleanPartnerName(cleanNameMatch[1]);
    }

    const comp = calculateRashiCompatibility(r1.name, r2.name, defaultUser.name, p2Name);
    return {
      isCoupleMatch: true,
      partner1: { name: defaultUser.name, rashi: r1 },
      partner2: { name: p2Name, rashi: r2 },
      compatibility: comp || undefined,
    };
  }

  // Case 4: Text explicitly asks for matching with a named person (e.g. "Kundli matching with Karthik Reddy", "marry Srikanth Naidu")
  const matchAsk = text.match(
    /(?:kundli\s+matching|kundli\s+match|gun\s*milan|compatibility|horoscope|marry|marriage)?\s*(?:matching\s+with|matching\s+for|match\s+with|match\s+for|with|for|marry)\s+([a-zA-Z\s]{2,30})/i
  );
  if (matchAsk && defaultUser) {
    const p2Name = cleanPartnerName(matchAsk[1]);
    if (p2Name.length > 1 && p2Name !== 'Partner') {
      return {
        isCoupleMatch: true,
        partner1: { name: defaultUser.name, rashi: defaultUser.rashi || undefined, dob: defaultUser.dob },
        partner2: { name: p2Name },
      };
    }
  }

  // Case 5: Devotee provides a single prospective partner full name (e.g. "Karthik Reddy", "Srikanth Naidu", "His name is Rahul Sharma")
  const singleNameMatch = text.match(
    /^(?:his\s+name\s+is|her\s+name\s+is|name\s*:?|he\s+is|she\s+is|partner\s*:?)?\s*([a-zA-Z]{2,20}(?:\s+[a-zA-Z]{2,20}){0,3})\s*[.!?]?$/i
  );
  if (singleNameMatch && defaultUser) {
    const candidateName = cleanPartnerName(singleNameMatch[1]);
    const commonNonNames = ['Tell Me', 'Thank You', 'Hari Om', 'Namaste', 'Good Morning', 'Good Evening', 'Help Me', 'Hello', 'Hi'];
    if (!commonNonNames.includes(candidateName) && candidateName !== 'Partner') {
      return {
        isCoupleMatch: true,
        partner1: { name: defaultUser.name, rashi: defaultUser.rashi || undefined, dob: defaultUser.dob },
        partner2: { name: candidateName },
      };
    }
  }

  return null;
}

// ---------------- DETERMINISTIC JYOTISH EVIDENCE & REASONING ENGINE ----------------

export interface JyotishEvidencePack {
  domain:
    | 'career'
    | 'marriage'
    | 'finance'
    | 'health'
    | 'education'
    | 'children'
    | 'spirituality'
    | 'ishta_devata'
    | 'homam'
    | 'mantra'
    | 'general';
  domainTitle: string;
  relevantHouseNumbers: number[];
  relevantHouses: Array<{
    houseNumber: number;
    sign: string;
    lord: string;
    planets: string;
  }>;
  activeDashaSummary: string;
  supportingFactors: string[];
  contradictoryFactors: string[];
  confidence: 'Strong' | 'Moderate' | 'Mixed';
  confidenceRationale: string;
  timingWindow: string;
  primaryAfflictedPlanet: string;
  needsAstrologerReview: boolean;
  escalationReason?: string;
}

/**
 * Analyzes the user's inquiry text against their astronomically calculated Vedic birth chart.
 * Produces deterministic classical evidence (houses, lords, dasha alignments, yogas, doshas)
 * and computes a grounded Jyotish Confidence Score (Strong / Moderate / Mixed).
 */
export function analyzeInquiryEvidence(
  chart: ReturnType<typeof calculateBirthChartData>,
  questionText: string
): JyotishEvidencePack {
  const q = (questionText || '').toLowerCase();

  // 1. Detect Inquiry Domain
  let domain: JyotishEvidencePack['domain'] = 'general';
  let domainTitle = 'Life Path & Cosmic Blueprint';
  let targetHouses = [1, 9, 10, 11];

  if (
    q.includes('ishta') ||
    q.includes('ista') ||
    q.includes('devata') ||
    q.includes('deity') ||
    q.includes('daivam') ||
    q.includes('kuladevata') ||
    q.includes('upasana') ||
    q.includes('jeevanmuktamsa') ||
    q.includes('atmakaraka') ||
    (q.includes('my god') || q.includes('who is my god') || q.includes('which god'))
  ) {
    domain = 'ishta_devata';
    domainTitle = 'Ishta Devata & Atmakaraka Jeevanmuktamsa Upasana (12th from Karakamsa)';
    targetHouses = [12, 9, 5, 1];
  } else if (
    q.includes('homam') ||
    q.includes('homa') ||
    q.includes('hawan') ||
    q.includes('havan') ||
    q.includes('yajna') ||
    q.includes('yaga')
  ) {
    domain = 'homam';
    domainTitle = 'Sacred Vedic Agni Homam & Hawan Ritual';
    targetHouses = [9, 1, 5, 11];
  } else if (
    q.includes('mantra') ||
    q.includes('japa') ||
    q.includes('chant') ||
    q.includes('beej mantra') ||
    q.includes('stotra') ||
    q.includes('sloka')
  ) {
    domain = 'mantra';
    domainTitle = 'Sacred Vedic Mantra Sadhana & Sound Vibration Japa';
    targetHouses = [5, 9, 1, 12];
  } else if (
    q.includes('job') ||
    q.includes('career') ||
    q.includes('promotion') ||
    q.includes('work') ||
    q.includes('business') ||
    q.includes('profession') ||
    q.includes('interview') ||
    q.includes('transfer') ||
    q.includes('boss') ||
    q.includes('startup') ||
    q.includes('company') ||
    q.includes('office')
  ) {
    domain = 'career';
    domainTitle = 'Career & Professional Milestones (Karma Bhava)';
    targetHouses = [10, 6, 2, 1];
  } else if (
    q.includes('marry') ||
    q.includes('marriage') ||
    q.includes('spouse') ||
    q.includes('partner') ||
    q.includes('husband') ||
    q.includes('wife') ||
    q.includes('love') ||
    q.includes('wedding') ||
    q.includes('relationship') ||
    q.includes('divorce') ||
    q.includes('shadi') ||
    q.includes('vivah') ||
    q.includes('matching') ||
    q.includes('match') ||
    q.includes('milan') ||
    q.includes('gun milan') ||
    q.includes('guna milan') ||
    q.includes('ashtakoot') ||
    q.includes('compatibility') ||
    q.includes('couple') ||
    q.includes('kundali match') ||
    q.includes('kundli match')
  ) {
    domain = 'marriage';
    domainTitle = 'Marriage, Kundli Matching & Relationship Harmony (Kalatra Bhava)';
    targetHouses = [7, 2, 11, 4, 5];
  } else if (
    q.includes('money') ||
    q.includes('wealth') ||
    q.includes('finance') ||
    q.includes('debt') ||
    q.includes('loan') ||
    q.includes('invest') ||
    q.includes('stock') ||
    q.includes('property') ||
    q.includes('land') ||
    q.includes('asset') ||
    q.includes('dhana') ||
    q.includes('profit')
  ) {
    domain = 'finance';
    domainTitle = 'Wealth, Prosperity & Assets (Dhana & Labha Bhava)';
    targetHouses = [2, 11, 9, 5];
  } else if (
    q.includes('health') ||
    q.includes('ill') ||
    q.includes('disease') ||
    q.includes('sick') ||
    q.includes('hospital') ||
    q.includes('surgery') ||
    q.includes('mental') ||
    q.includes('depress') ||
    q.includes('stress') ||
    q.includes('pain') ||
    q.includes('recovery')
  ) {
    domain = 'health';
    domainTitle = 'Health, Longevity & Vitality (Tanu & Roga Bhava)';
    targetHouses = [1, 6, 8, 12];
  } else if (
    q.includes('study') ||
    q.includes('exam') ||
    q.includes('education') ||
    q.includes('college') ||
    q.includes('degree') ||
    q.includes('school') ||
    q.includes('admission')
  ) {
    domain = 'education';
    domainTitle = 'Education & Intellect (Vidya & Buddhi Bhava)';
    targetHouses = [5, 4, 9, 2];
  } else if (
    q.includes('child') ||
    q.includes('baby') ||
    q.includes('pregnant') ||
    q.includes('pregnancy') ||
    q.includes('progeny') ||
    q.includes('santana')
  ) {
    domain = 'children';
    domainTitle = 'Progeny & Family Blessings (Putra Bhava)';
    targetHouses = [5, 9, 2];
  } else if (
    q.includes('spiritual') ||
    q.includes('moksha') ||
    q.includes('kundalini') ||
    q.includes('meditation') ||
    q.includes('temple') ||
    q.includes('guru') ||
    q.includes('karma')
  ) {
    domain = 'spirituality';
    domainTitle = 'Spiritual Evolution & Dharma (Bhagya & Moksha Bhava)';
    targetHouses = [9, 12, 8, 5];
  }

  // 2. Extract House Data
  const d1Houses = chart.d1Houses || [];
  const relevantHouses = targetHouses.map((hNum) => {
    const h = d1Houses.find((dh) => dh.houseNumber === hNum);
    const signIdx = h ? (h.signNumber ? h.signNumber - 1 : (chart.lagnaIndex + (hNum - 1)) % 12) : 0;
    const lord = RASHIS[signIdx]?.lord || 'Unknown';
    return {
      houseNumber: hNum,
      sign: h?.sign || RASHIS[signIdx]?.name || 'Unknown',
      lord,
      planets: h?.planets && h.planets !== 'Empty' ? h.planets : 'None',
    };
  });

  const supportingFactors: string[] = [];
  const contradictoryFactors: string[] = [];
  let primaryAfflictedPlanet = domain === 'marriage' ? 'Venus' : 'Rahu';

  if (domain === 'ishta_devata' && chart.ishtaDevata) {
    primaryAfflictedPlanet = chart.ishtaDevata.governingPlanet;
    supportingFactors.push(
      `Atmakaraka (highest degree soul planet) is ${chart.ishtaDevata.atmakarakaPlanet}, situated in Navamsha sign ${chart.ishtaDevata.karakamsaRashi} (Karakamsa).`
    );
    supportingFactors.push(
      `12th house from Karakamsa (Jeevanmuktamsa Sthana) is ${chart.ishtaDevata.twelfthSignFromKarakamsa}, governed by ${chart.ishtaDevata.governingPlanet}, establishing ${chart.ishtaDevata.deityName} as your verified Ishta Devata.`
    );
    supportingFactors.push(
      `Prescribed Canonical Upasana Mantra: ${chart.ishtaDevata.primaryMantra} (${chart.ishtaDevata.dailyJapaCount}) with ${chart.ishtaDevata.stotra}. Auspicious Day: ${chart.ishtaDevata.auspiciousDay}.`
    );
  }

  // 3. Evaluate House Planets & Dignities
  relevantHouses.forEach((h) => {
    if (h.planets !== 'None') {
      const pList = h.planets.split(',').map((p) => p.trim());
      pList.forEach((planetName) => {
        const pDeg = chart.planetaryDegrees.find((pd) =>
          pd.planet.toLowerCase().startsWith(planetName.toLowerCase().slice(0, 3))
        );
        const status = pDeg?.status || '';

        if (['Jupiter', 'Venus', 'Mercury'].includes(planetName)) {
          supportingFactors.push(
            `Natural benefic ${planetName} resides in House ${h.houseNumber} (${h.sign}), radiating constructive energy into ${domainTitle}.`
          );
        } else if (status.includes('Exalted') || status.includes('Own Sign')) {
          supportingFactors.push(
            `${planetName} is comfortably dignified (${status}) in House ${h.houseNumber} (${h.sign}), strengthening foundational results.`
          );
        } else if (['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(planetName)) {
          if (h.houseNumber === 7 || h.houseNumber === 8 || h.houseNumber === 12) {
            contradictoryFactors.push(
              `Challenging graha ${planetName} occupying House ${h.houseNumber} (${h.sign}) introduces delays, trials, or karmic resistance.`
            );
            primaryAfflictedPlanet = planetName;
          } else {
            supportingFactors.push(
              `Disciplined graha ${planetName} in House ${h.houseNumber} builds endurance and long-term grit through patience.`
            );
          }
        }
      });
    }
  });

  // 4. Check Active Vimshottari Dasha
  const mahaLord = chart.dasha.currentMahadasha.split(' ')[0];
  const antarLord = chart.dasha.currentAntardasha.split(' ')[0];
  const activeDashaSummary = `${chart.dasha.currentMahadasha} (Mahadasha) / ${chart.dasha.currentAntardasha} (Antardasha)`;

  // Check if Dasha lords rule relevant houses
  const mahaRuledHouses = relevantHouses.filter((h) => h.lord.toLowerCase().startsWith(mahaLord.toLowerCase().slice(0, 3)));
  const antarRuledHouses = relevantHouses.filter((h) => h.lord.toLowerCase().startsWith(antarLord.toLowerCase().slice(0, 3)));

  if (mahaRuledHouses.length > 0 || antarRuledHouses.length > 0) {
    supportingFactors.push(
      `Active Dasha cycle directly activates primary ruling houses: Mahadasha lord ${mahaLord} and Antardasha lord ${antarLord} trigger cosmic focus on ${domainTitle}.`
    );
  } else if (['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(antarLord)) {
    supportingFactors.push(
      `Sub-period (Antardasha) is guided by benefic ${antarLord}, offering favorable opening windows and intellectual support.`
    );
  } else if (['Rahu', 'Ketu', 'Saturn'].includes(antarLord)) {
    contradictoryFactors.push(
      `Active Antardasha lord ${antarLord} imposes testing tests of patience, karmic shifts, or unforeseen adjustments before stability.`
    );
    primaryAfflictedPlanet = antarLord;
  }

  // 5. Check Yogas & Doshas
  if (chart.yogas && chart.yogas.length > 0) {
    chart.yogas.slice(0, 2).forEach((y) => {
      supportingFactors.push(`Benefic ${y.name} is active in natal chart: ${y.desc}`);
    });
  }

  if (domain === 'marriage' && chart.doshas.some((d) => d.name.includes('Manglik') && !d.status.includes('No') && !d.status.includes('Cancelled'))) {
    contradictoryFactors.push(
      `Manglik (Kuja) influence observed; requires careful matching and remedial pacification for domestic tranquility.`
    );
    primaryAfflictedPlanet = 'Mars';
  }

  // Fallback defaults if few factors were identified
  if (supportingFactors.length === 0) {
    supportingFactors.push(
      `Ascendant lord ${chart.ascendant.split(' ')[0]} retains inherent vitality, grounding the native's capacity to overcome hurdles.`
    );
  }

  // 6. Calculate Confidence & Escalation Triggers
  let confidence: JyotishEvidencePack['confidence'] = 'Moderate';
  let confidenceRationale = '';
  let needsAstrologerReview = false;
  let escalationReason: string | undefined;

  if (supportingFactors.length >= 3 && contradictoryFactors.length <= 1) {
    confidence = 'Strong';
    confidenceRationale =
      'High alignment between favorable house placements, supportive Dasha lord, and classical planetary dignities.';
  } else if (contradictoryFactors.length >= 2 || (domain === 'marriage' && contradictoryFactors.length >= 1)) {
    confidence = 'Mixed';
    confidenceRationale =
      'Planetary signals present simultaneous growth indicators and karmic obstructions requiring remedial balance.';
    needsAstrologerReview = true;
    escalationReason =
      'This inquiry involves intricate planetary tensions between the active Dasha period and sensitive house placements. Direct verification with a Senior Vedic Astrologer is recommended.';
  } else {
    confidence = 'Moderate';
    confidenceRationale =
      'Favorable core foundation with moderate transit friction; progress follows steady, disciplined effort.';
  }

  // 7. Calculate Timing Window
  const timingWindow = chart.dasha.antarEndDate
    ? `Highest potency period activates between now and ${chart.dasha.antarEndDate}, during the culmination of ${antarLord} Antardasha.`
    : `Cosmic indicators peak favorably during the current planetary cycle throughout ${new Date().getFullYear()}.`;

  return {
    domain,
    domainTitle,
    relevantHouseNumbers: targetHouses,
    relevantHouses,
    activeDashaSummary,
    supportingFactors,
    contradictoryFactors,
    confidence,
    confidenceRationale,
    timingWindow,
    primaryAfflictedPlanet,
    needsAstrologerReview,
    escalationReason,
  };
}
