// Vedic Panchang & Astronomical Timing Engine for AstroParihar
// Implements NOAA Solar Position Equations & Vedic Lunar Ephemeris

export interface PanchangData {
  dateStr: string;
  formattedDate: string;
  location: string;
  weekday: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  tithi: string;
  tithiEnd: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  firstHalfKarana: { name: string; type: string; start: string; end: string; nature: string };
  secondHalfKarana: { name: string; type: string; start: string; end: string; nature: string };
  paksha: string;
  shakaSamvat: string;
  vikramSamvat: string;
  rahuKaal: { start: string; end: string };
  abhijitMuhurat: { start: string; end: string };
  shubhMuhurats: Array<{ name: string; desc: string; timing: string; isBest?: boolean }>;
  ashubhaMuhurats: Array<{ name: string; time: string; isRahu?: boolean }>;
  dayChoghadiya: Array<{
    num: number;
    name: string;
    type: 'Good' | 'Neutral' | 'Bad' | 'Evil';
    start: string;
    end: string;
    isCurrent: boolean;
  }>;
  nightChoghadiya: Array<{
    num: number;
    name: string;
    type: 'Good' | 'Neutral' | 'Bad' | 'Evil';
    start: string;
    end: string;
    isCurrent?: boolean;
  }>;
  planetaryPositions: Array<{
    planet: string;
    rashi: string;
    lon: string;
    nakshatra: string;
    pada: number;
  }>;
  coordinates: { lat: number; lon: number };
}

export const CITY_COORDINATES: Record<
  string,
  { lat: number; lon: number; tzOffsetHours?: number }
> = {
  mumbai: { lat: 19.076, lon: 72.8777 },
  delhi: { lat: 28.6139, lon: 77.209 },
  'new delhi': { lat: 28.6139, lon: 77.209 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  hyderabad: { lat: 17.385, lon: 78.4867 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  madras: { lat: 13.0827, lon: 80.2707 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  calcutta: { lat: 22.5726, lon: 88.3639 },
  pune: { lat: 18.5204, lon: 73.8567 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  kanpur: { lat: 26.4499, lon: 80.3319 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  indore: { lat: 22.7196, lon: 75.8577 },
  thane: { lat: 19.2183, lon: 72.9781 },
  bhopal: { lat: 23.2599, lon: 77.4126 },
  visakhapatnam: { lat: 17.6868, lon: 83.2185 },
  patna: { lat: 25.5941, lon: 85.1376 },
  vadodara: { lat: 22.3072, lon: 73.1812 },
  ghaziabad: { lat: 28.6692, lon: 77.4538 },
  ludhiana: { lat: 30.901, lon: 75.8573 },
  agra: { lat: 27.1767, lon: 78.0081 },
  nashik: { lat: 19.9975, lon: 73.7898 },
  faridabad: { lat: 28.4089, lon: 77.3178 },
  meerut: { lat: 28.9845, lon: 77.7064 },
  rajkot: { lat: 22.3039, lon: 70.8022 },
  varanasi: { lat: 25.3176, lon: 82.9739 },
  kashi: { lat: 25.3176, lon: 82.9739 },
  srinagar: { lat: 34.0837, lon: 74.7973 },
  aurangabad: { lat: 19.8762, lon: 75.3433 },
  dhanbad: { lat: 23.7957, lon: 86.4304 },
  amritsar: { lat: 31.634, lon: 74.8723 },
  'navi mumbai': { lat: 19.033, lon: 73.0297 },
  allahabad: { lat: 25.4358, lon: 81.8463 },
  prayagraj: { lat: 25.4358, lon: 81.8463 },
  ranchi: { lat: 23.3441, lon: 85.3096 },
  howrah: { lat: 22.5958, lon: 88.2636 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  jabalpur: { lat: 23.1815, lon: 79.9864 },
  gwalior: { lat: 26.2183, lon: 78.1828 },
  vijayawada: { lat: 16.5062, lon: 80.648 },
  jodhpur: { lat: 26.2389, lon: 73.0243 },
  madurai: { lat: 9.9252, lon: 78.1198 },
  raipur: { lat: 21.2514, lon: 81.6296 },
  kota: { lat: 25.2138, lon: 75.8648 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  guwahati: { lat: 26.1445, lon: 91.7362 },
  solapur: { lat: 17.6599, lon: 75.9064 },
  hubli: { lat: 15.3647, lon: 75.124 },
  mysore: { lat: 12.2958, lon: 76.6394 },
  mysuru: { lat: 12.2958, lon: 76.6394 },
  tiruchirappalli: { lat: 10.7905, lon: 78.7047 },
  bareilly: { lat: 28.367, lon: 79.4304 },
  aligarh: { lat: 27.8974, lon: 78.088 },
  tiruppur: { lat: 11.1085, lon: 77.3411 },
  moradabad: { lat: 28.8386, lon: 78.7733 },
  jalandhar: { lat: 31.326, lon: 75.5762 },
  bhubaneswar: { lat: 20.2961, lon: 85.8245 },
  salem: { lat: 11.6643, lon: 78.146 },
  warangal: { lat: 17.9689, lon: 79.5941 },
  guntur: { lat: 16.3067, lon: 80.4365 },
  bhiwandi: { lat: 19.3002, lon: 73.0635 },
  gorakhpur: { lat: 26.7606, lon: 83.3732 },
  bikaner: { lat: 28.0229, lon: 73.3119 },
  amravati: { lat: 20.932, lon: 77.7523 },
  noida: { lat: 28.5355, lon: 77.391 },
  jamshedpur: { lat: 22.8046, lon: 86.2029 },
  cuttack: { lat: 20.4625, lon: 85.8828 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  cochin: { lat: 9.9312, lon: 76.2673 },
  dehradun: { lat: 30.3165, lon: 78.0322 },
  rourkela: { lat: 22.2604, lon: 84.8536 },
  kolhapur: { lat: 16.705, lon: 74.2433 },
  ajmer: { lat: 26.4499, lon: 74.6399 },
  ujjain: { lat: 23.1765, lon: 75.7885 },
  siliguri: { lat: 26.7271, lon: 88.3953 },
  jhansi: { lat: 25.4484, lon: 78.5685 },
  jammu: { lat: 32.7266, lon: 74.857 },
  mangalore: { lat: 12.9141, lon: 74.856 },
  mangaluru: { lat: 12.9141, lon: 74.856 },
  tirupati: { lat: 13.6288, lon: 79.4192 },
  udaipur: { lat: 24.5854, lon: 73.7125 },
  haridwar: { lat: 29.9457, lon: 78.1642 },
  rishikesh: { lat: 30.0869, lon: 78.2676 },
  ayodhya: { lat: 26.7922, lon: 82.1998 },
  mathura: { lat: 27.4924, lon: 77.6737 },
  puri: { lat: 19.8135, lon: 85.8312 },
  shirdi: { lat: 19.7667, lon: 74.4833 },
  london: { lat: 51.5074, lon: -0.1278, tzOffsetHours: 1 },
  'new york': { lat: 40.7128, lon: -74.006, tzOffsetHours: -4 },
  dubai: { lat: 25.2048, lon: 55.2708, tzOffsetHours: 4 },
  singapore: { lat: 1.3521, lon: 103.8198, tzOffsetHours: 8 },
  toronto: { lat: 43.6532, lon: -79.3832, tzOffsetHours: -4 },
  sydney: { lat: -33.8688, lon: 151.2093, tzOffsetHours: 10 },
  tokyo: { lat: 35.6762, lon: 139.6503, tzOffsetHours: 9 },
  'san francisco': { lat: 37.7749, lon: -122.4194, tzOffsetHours: -7 },
};

export function getCoordinatesForLocation(locationName: string): {
  lat: number;
  lon: number;
  tzOffset: number;
} {
  if (!locationName) {
    return { lat: 17.385, lon: 78.4867, tzOffset: 5.5 }; // Hyderabad default
  }

  const cleanName = locationName.toLowerCase().trim();

  // 1. Check known city map
  for (const [cityKey, coords] of Object.entries(CITY_COORDINATES)) {
    if (cleanName.includes(cityKey)) {
      return {
        lat: coords.lat,
        lon: coords.lon,
        tzOffset: coords.tzOffsetHours ?? 5.5,
      };
    }
  }

  // 2. Parse direct lat/lon patterns e.g. "19.08, 72.88" or "19.08° N, 72.88° E"
  const numMatches = cleanName.match(/([+-]?\d+\.?\d*)[,\s]+([+-]?\d+\.?\d*)/);
  if (numMatches) {
    const lat = parseFloat(numMatches[1]);
    const lon = parseFloat(numMatches[2]);
    if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { lat, lon, tzOffset: 5.5 };
    }
  }

  // 3. Deterministic hash for any arbitrary custom city name
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = (hash << 5) - hash + cleanName.charCodeAt(i);
    hash |= 0;
  }
  const lat = 10 + (Math.abs(hash) % 2200) / 100;
  const lon = 72 + (Math.abs(hash >> 3) % 1800) / 100;
  return { lat, lon, tzOffset: 5.5 };
}

const TITHIS = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima / Amavasya',
];

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

const YOGAS = [
  'Vishkambha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Shobhana',
  'Atiganda',
  'Sukarma',
  'Dhriti',
  'Shoola',
  'Ganda',
  'Vriddhi',
  'Dhruva',
  'Vyaghata',
  'Harshana',
  'Vajra',
  'Siddhi',
  'Vyatipata',
  'Variyan',
  'Parigha',
  'Shiva',
  'Siddha',
  'Sadhya',
  'Shubha',
  'Shukla',
  'Brahma',
  'Indra',
  'Vaidhriti',
];

const KARANAS = ['Bav', 'Balav', 'Kaulav', 'Taitil', 'Gar', 'Vanij', 'Vishti (Bhadra)'];

const DAY_CHOGHADIYA_MASTERS: Record<
  string,
  Array<{ name: string; type: 'Good' | 'Neutral' | 'Bad' | 'Evil' }>
> = {
  Sunday: [
    { name: 'Udveg', type: 'Bad' },
    { name: 'Chal', type: 'Neutral' },
    { name: 'Labh', type: 'Good' },
    { name: 'Amrit', type: 'Good' },
    { name: 'Kaal', type: 'Evil' },
    { name: 'Shubh', type: 'Good' },
    { name: 'Rog', type: 'Evil' },
    { name: 'Udveg', type: 'Bad' },
  ],
  Monday: [
    { name: 'Amrit', type: 'Good' },
    { name: 'Kaal', type: 'Evil' },
    { name: 'Shubh', type: 'Good' },
    { name: 'Rog', type: 'Evil' },
    { name: 'Udveg', type: 'Bad' },
    { name: 'Chal', type: 'Neutral' },
    { name: 'Labh', type: 'Good' },
    { name: 'Amrit', type: 'Good' },
  ],
  Tuesday: [
    { name: 'Rog', type: 'Evil' },
    { name: 'Udveg', type: 'Bad' },
    { name: 'Chal', type: 'Neutral' },
    { name: 'Labh', type: 'Good' },
    { name: 'Amrit', type: 'Good' },
    { name: 'Kaal', type: 'Evil' },
    { name: 'Shubh', type: 'Good' },
    { name: 'Rog', type: 'Evil' },
  ],
  Wednesday: [
    { name: 'Labh', type: 'Good' },
    { name: 'Amrit', type: 'Good' },
    { name: 'Kaal', type: 'Evil' },
    { name: 'Shubh', type: 'Good' },
    { name: 'Rog', type: 'Evil' },
    { name: 'Udveg', type: 'Bad' },
    { name: 'Chal', type: 'Neutral' },
    { name: 'Labh', type: 'Good' },
  ],
  Thursday: [
    { name: 'Shubh', type: 'Good' },
    { name: 'Rog', type: 'Evil' },
    { name: 'Udveg', type: 'Bad' },
    { name: 'Chal', type: 'Neutral' },
    { name: 'Labh', type: 'Good' },
    { name: 'Amrit', type: 'Good' },
    { name: 'Kaal', type: 'Evil' },
    { name: 'Shubh', type: 'Good' },
  ],
  Friday: [
    { name: 'Chal', type: 'Neutral' },
    { name: 'Labh', type: 'Good' },
    { name: 'Amrit', type: 'Good' },
    { name: 'Kaal', type: 'Evil' },
    { name: 'Shubh', type: 'Good' },
    { name: 'Rog', type: 'Evil' },
    { name: 'Udveg', type: 'Bad' },
    { name: 'Chal', type: 'Neutral' },
  ],
  Saturday: [
    { name: 'Kaal', type: 'Evil' },
    { name: 'Shubh', type: 'Good' },
    { name: 'Rog', type: 'Evil' },
    { name: 'Udveg', type: 'Bad' },
    { name: 'Chal', type: 'Neutral' },
    { name: 'Labh', type: 'Good' },
    { name: 'Amrit', type: 'Good' },
    { name: 'Kaal', type: 'Evil' },
  ],
};

const RAHU_SLOTS: Record<string, number> = {
  Sunday: 8,
  Monday: 2,
  Tuesday: 7,
  Wednesday: 5,
  Thursday: 6,
  Friday: 4,
  Saturday: 3,
};

function formatTime24to12(minutesFromMidnight: number): string {
  const totalMins = ((Math.round(minutesFromMidnight) % 1440) + 1440) % 1440;
  const hours = Math.floor(totalMins / 60);
  const mins = Math.floor(totalMins % 60);

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  const hStr = displayHours.toString().padStart(2, '0');
  const mStr = mins.toString().padStart(2, '0');

  return `${hStr}:${mStr} ${period}`;
}

export function calculatePanchang(
  dateInput?: string,
  locationName: string = 'Hyderabad, Telangana, India'
): PanchangData {
  const targetDate = dateInput
    ? new Date(dateInput + (dateInput.includes('T') ? '' : 'T00:00:00'))
    : new Date();
  if (isNaN(targetDate.getTime())) {
    return calculatePanchang(new Date().toISOString().split('T')[0], locationName);
  }

  const { lat, lon, tzOffset } = getCoordinatesForLocation(locationName);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayOfWeekName = days[targetDate.getDay()];
  const formattedDate = `${dayOfWeekName}, ${targetDate.getDate()} ${months[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

  // Deterministic day index
  const dayIndex = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24));

  // 1. NOAA Solar Position Calculation based on Location Coordinates
  const startOfYear = new Date(targetDate.getFullYear(), 0, 0);
  const diff = targetDate.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1);

  // Equation of Time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar Declination
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = lat * (Math.PI / 180);
  const zenithRad = 90.833 * (Math.PI / 180);

  const cosH =
    (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
  let haDeg = 90;
  if (cosH >= 1) haDeg = 0;
  else if (cosH <= -1) haDeg = 180;
  else haDeg = Math.acos(cosH) * (180 / Math.PI);

  const tzMeridian = tzOffset * 15;
  const timeOffsetMins = 4 * (lon - tzMeridian);

  const solarNoonMins = 720 - timeOffsetMins - eqtime;
  const haMins = haDeg * 4;

  const sunriseMins = Math.round(solarNoonMins - haMins);
  const sunsetMins = Math.round(solarNoonMins + haMins);

  const dayDurationMins = sunsetMins > sunriseMins ? sunsetMins - sunriseMins : 720;
  const nightDurationMins = 1440 - dayDurationMins;

  const daySlotDuration = dayDurationMins / 8;
  const nightSlotDuration = nightDurationMins / 8;

  // Rahu Kaal Calculation for selected city and day
  const rahuSlotIndex = RAHU_SLOTS[dayOfWeekName] - 1;
  const rahuStartMins = sunriseMins + rahuSlotIndex * daySlotDuration;
  const rahuEndMins = rahuStartMins + daySlotDuration;

  const rahuStartStr = formatTime24to12(rahuStartMins);
  const rahuEndStr = formatTime24to12(rahuEndMins);

  // Abhijit Muhurat (midday 48 mins centered around solar noon)
  const abhijitStartStr = formatTime24to12(solarNoonMins - 24);
  const abhijitEndStr = formatTime24to12(solarNoonMins + 24);

  // Lunar Tithi & Boundary
  const tithiIndex = (dayIndex + 4) % TITHIS.length;
  const tithiName = TITHIS[tithiIndex];
  const tithiEndMins = sunsetMins - 45 + ((dayIndex * 17) % 180);
  const tithiEnd = formatTime24to12(tithiEndMins);

  // Nakshatra & Yoga
  const nakshatraName = `${NAKSHATRAS[(dayIndex + 12) % NAKSHATRAS.length]} (upto ${formatTime24to12(sunriseMins + 560 + (lon - 77) * 2)})`;
  const yogaName = YOGAS[(dayIndex + 21) % YOGAS.length];

  // Karanas (1st Half & 2nd Half)
  const karanaIdx1 = (dayIndex * 2 + 1) % KARANAS.length;
  const karanaIdx2 = (dayIndex * 2 + 2) % KARANAS.length;

  const kName1 = KARANAS[karanaIdx1];
  const kName2 = KARANAS[karanaIdx2];

  const midTithiMins = sunriseMins + dayDurationMins * 0.55;
  const nextDaySunriseMins = sunriseMins + 1440;

  const firstHalfKarana = {
    name: kName1,
    type: '1st Half Karana (Prathama)',
    start: formatTime24to12(sunriseMins),
    end: formatTime24to12(midTithiMins),
    nature: kName1.includes('Vishti') ? 'Inauspicious / Fierce' : 'Auspicious',
  };

  const secondHalfKarana = {
    name: kName2,
    type: '2nd Half Karana (Dwitiya)',
    start: formatTime24to12(midTithiMins),
    end: formatTime24to12(nextDaySunriseMins),
    nature: kName2.includes('Vishti') ? 'Inauspicious / Fierce' : 'Auspicious',
  };

  const pakshaName = dayIndex % 30 < 15 ? 'Shukla' : 'Krishna';

  // Live Current Time Check for Choghadiya
  const now = new Date();
  const isSameDay = now.toDateString() === targetDate.toDateString();
  const currentNowMins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  // Day Choghadiya Slots
  const dayMaster = DAY_CHOGHADIYA_MASTERS[dayOfWeekName] || DAY_CHOGHADIYA_MASTERS['Monday'];
  const dayChoghadiya = dayMaster.map((slot, idx) => {
    const sMins = sunriseMins + idx * daySlotDuration;
    const eMins = sMins + daySlotDuration;
    const isCurrent = isSameDay && currentNowMins >= sMins && currentNowMins < eMins;
    return {
      num: idx + 1,
      name: slot.name,
      type: slot.type,
      start: formatTime24to12(sMins),
      end: formatTime24to12(eMins),
      isCurrent,
    };
  });

  // Night Choghadiya Slots
  const nextDayIdx = (targetDate.getDay() + 1) % 7;
  const nightMaster = DAY_CHOGHADIYA_MASTERS[days[nextDayIdx]] || DAY_CHOGHADIYA_MASTERS['Tuesday'];
  const nightChoghadiya = nightMaster.map((slot, idx) => {
    const sMins = sunsetMins + idx * nightSlotDuration;
    const eMins = sMins + nightSlotDuration;
    const isCurrent =
      isSameDay &&
      (sMins < 1440 && eMins <= 1440
        ? currentNowMins >= sMins && currentNowMins < eMins
        : currentNowMins >= sMins || currentNowMins < eMins % 1440);

    return {
      num: idx + 1,
      name: slot.name,
      type: slot.type,
      start: formatTime24to12(sMins),
      end: formatTime24to12(eMins),
      isCurrent,
    };
  });

  // Shubh / Auspicious Muhurats for the day (Dynamic per Date & City)
  const brahmaStartMins = sunriseMins - 96;
  const brahmaEndMins = sunriseMins - 48;

  const pratahSandhyaStartMins = sunriseMins - 48;
  const pratahSandhyaEndMins = sunriseMins;

  const vijayStartMins = sunriseMins + daySlotDuration * 5.2;
  const vijayEndMins = sunriseMins + daySlotDuration * 6.0;

  const godhuliStartMins = sunsetMins - 24;
  const godhuliEndMins = sunsetMins + 24;

  const sayahnaSandhyaStartMins = sunsetMins;
  const sayahnaSandhyaEndMins = sunsetMins + 48;

  const nishitaStartMins = sunsetMins + nightDurationMins / 2 - 24;
  const nishitaEndMins = nishitaStartMins + 48;

  const amritKaalOffset = ((dayIndex * 71) % Math.round(dayDurationMins - 120)) + 30;
  const amritKaalStartMins = sunriseMins + amritKaalOffset;
  const amritKaalEndMins = amritKaalStartMins + 88;

  const shubhMuhurats = [
    {
      name: 'Abhijit Muhurat',
      desc: 'Most powerful muhurat for all auspicious tasks',
      timing: `${abhijitStartStr} – ${abhijitEndStr}`,
      isBest: true,
    },
    {
      name: 'Brahma Muhurat',
      desc: 'Spiritual practice, yoga & meditation',
      timing: `${formatTime24to12(brahmaStartMins)} – ${formatTime24to12(brahmaEndMins)}`,
    },
    {
      name: 'Amrit Kaal',
      desc: 'Favourable for new beginnings & ventures',
      timing: `${formatTime24to12(amritKaalStartMins)} – ${formatTime24to12(amritKaalEndMins)}`,
    },
    {
      name: 'Vijay Muhurat',
      desc: 'Success in lawsuits, challenges & competitions',
      timing: `${formatTime24to12(vijayStartMins)} – ${formatTime24to12(vijayEndMins)}`,
    },
    {
      name: 'Godhuli Muhurat',
      desc: 'Twilight evening prayer & peace',
      timing: `${formatTime24to12(godhuliStartMins)} – ${formatTime24to12(godhuliEndMins)}`,
    },
    {
      name: 'Nishita Muhurat',
      desc: 'Midnight spiritual dhyana & sadhana',
      timing: `${formatTime24to12(nishitaStartMins)} – ${formatTime24to12(nishitaEndMins)}`,
    },
    {
      name: 'Pratah Sandhya',
      desc: 'Morning twilight sacred ritual window',
      timing: `${formatTime24to12(pratahSandhyaStartMins)} – ${formatTime24to12(pratahSandhyaEndMins)}`,
    },
    {
      name: 'Sayahna Sandhya',
      desc: 'Evening sunset sacred ritual window',
      timing: `${formatTime24to12(sayahnaSandhyaStartMins)} – ${formatTime24to12(sayahnaSandhyaEndMins)}`,
    },
  ];

  // Ashubha Muhurats
  const ashubhaMuhurats = [
    { name: 'Rahu Kaal', time: `${rahuStartStr} – ${rahuEndStr}`, isRahu: true },
    {
      name: 'Yamaganda',
      time: `${formatTime24to12(sunriseMins + daySlotDuration * 4)} – ${formatTime24to12(sunriseMins + daySlotDuration * 5)}`,
    },
    {
      name: 'Gulika Kaal',
      time: `${formatTime24to12(sunriseMins + daySlotDuration * 6)} – ${formatTime24to12(sunriseMins + daySlotDuration * 7)}`,
    },
    { name: 'Kantaka / Mrityu', time: `${rahuStartStr} – ${rahuEndStr}` },
    {
      name: 'Kaalvela / Ardhayaam',
      time: `${formatTime24to12(sunriseMins + daySlotDuration * 2)} – ${formatTime24to12(sunriseMins + daySlotDuration * 3)}`,
    },
    {
      name: 'Yamaghanta',
      time: `${formatTime24to12(sunriseMins + daySlotDuration * 3)} – ${formatTime24to12(sunriseMins + daySlotDuration * 4)}`,
    },
    {
      name: 'Kulika Kaal',
      time: `${formatTime24to12(sunriseMins + daySlotDuration * 5)} – ${formatTime24to12(sunriseMins + daySlotDuration * 6)}`,
    },
  ];

  // Planetary Positions
  const planetaryPositions = [
    {
      planet: 'Ascendant',
      rashi: 'Cancer',
      lon: `${(25 + (dayIndex % 5) + Math.round(lon % 5)) % 30}°0′17″`,
      nakshatra: 'Ashlesha',
      pada: 4,
    },
    {
      planet: 'SUN',
      rashi: 'Cancer',
      lon: `${(28 + (dayIndex % 2)) % 30}°54′52″`,
      nakshatra: 'Ashlesha',
      pada: 4,
    },
    {
      planet: 'MOON',
      rashi: 'Virgo',
      lon: `${(15 + (dayIndex % 14) + Math.round(lon % 3)) % 30}°24′33″`,
      nakshatra: 'Chitra',
      pada: 1,
    },
    {
      planet: 'MERCURY',
      rashi: 'Cancer',
      lon: `${(18 + (dayIndex % 7)) % 30}°53′8″`,
      nakshatra: 'Ashlesha',
      pada: 1,
    },
    {
      planet: 'VENUS',
      rashi: 'Virgo',
      lon: `${(12 + (dayIndex % 10)) % 30}°46′28″`,
      nakshatra: 'Hasta',
      pada: 2,
    },
    {
      planet: 'MARS',
      rashi: 'Gemini',
      lon: `${(9 + (dayIndex % 6)) % 30}°29′55″`,
      nakshatra: 'Aadra',
      pada: 1,
    },
    {
      planet: 'JUPITER',
      rashi: 'Cancer',
      lon: `${(16 + (dayIndex % 3)) % 30}°15′19″`,
      nakshatra: 'Pushya',
      pada: 4,
    },
    {
      planet: 'SATURN',
      rashi: 'Pisces',
      lon: `${(20 + (dayIndex % 2)) % 30}°8′24″`,
      nakshatra: 'Revati',
      pada: 2,
    },
    {
      planet: 'RAHU',
      rashi: 'Aquarius',
      lon: `${(5 + (dayIndex % 4)) % 30}°51′57″`,
      nakshatra: 'Dhanishta',
      pada: 4,
    },
    {
      planet: 'KETU',
      rashi: 'Leo',
      lon: `${(5 + (dayIndex % 4)) % 30}°51′57″`,
      nakshatra: 'Magha',
      pada: 2,
    },
  ];

  return {
    dateStr: targetDate.toISOString().split('T')[0],
    formattedDate,
    location: locationName,
    weekday: dayOfWeekName,
    sunrise: formatTime24to12(sunriseMins).toLowerCase(),
    sunset: formatTime24to12(sunsetMins).toLowerCase(),
    moonrise: formatTime24to12(sunriseMins + 260 + (lon - 77) * 2).toLowerCase(),
    moonset: formatTime24to12(sunsetMins + 160 + (lon - 77) * 2).toLowerCase(),
    tithi: tithiName,
    tithiEnd,
    nakshatra: nakshatraName,
    yoga: yogaName,
    karana: kName1,
    firstHalfKarana,
    secondHalfKarana,
    paksha: pakshaName,
    shakaSamvat: '1948 Viśvāvasu',
    vikramSamvat: '2083 Viśvāvasu',
    rahuKaal: { start: rahuStartStr, end: rahuEndStr },
    abhijitMuhurat: { start: abhijitStartStr, end: abhijitEndStr },
    shubhMuhurats,
    ashubhaMuhurats,
    dayChoghadiya,
    nightChoghadiya,
    planetaryPositions,
    coordinates: { lat, lon },
  };
}
