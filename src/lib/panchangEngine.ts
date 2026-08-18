// Vedic Panchang & Astronomical Timing Engine for AstroParihar

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
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: string;
  shakaSamvat: string;
  vikramSamvat: string;
  rahuKaal: { start: string; end: string };
  abhijitMuhurat: { start: string; end: string };
  ashubhaMuhurats: Array<{ name: string; time: string; isRahu?: boolean }>;
  dayChoghadiya: Array<{ num: number; name: string; type: 'Good' | 'Neutral' | 'Bad' | 'Evil'; start: string; end: string; isCurrent: boolean }>;
  nightChoghadiya: Array<{ num: number; name: string; type: 'Good' | 'Neutral' | 'Bad' | 'Evil'; start: string; end: string }>;
  planetaryPositions: Array<{ planet: string; rashi: string; lon: string; nakshatra: string; pada: number }>;
}

const TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
];

const KARANAS = ['Bav', 'Balav', 'Kaulav', 'Taitil', 'Gar', 'Vanij', 'Vishti (Bhadra)'];

const DAY_CHOGHADIYA_MASTERS: Record<string, Array<{ name: string; type: 'Good' | 'Neutral' | 'Bad' | 'Evil' }>> = {
  Sunday: [
    { name: 'Udveg', type: 'Bad' }, { name: 'Chal', type: 'Neutral' }, { name: 'Labh', type: 'Good' }, { name: 'Amrit', type: 'Good' },
    { name: 'Kaal', type: 'Evil' }, { name: 'Shubh', type: 'Good' }, { name: 'Rog', type: 'Evil' }, { name: 'Udveg', type: 'Bad' }
  ],
  Monday: [
    { name: 'Amrit', type: 'Good' }, { name: 'Kaal', type: 'Evil' }, { name: 'Shubh', type: 'Good' }, { name: 'Rog', type: 'Evil' },
    { name: 'Udveg', type: 'Bad' }, { name: 'Chal', type: 'Neutral' }, { name: 'Labh', type: 'Good' }, { name: 'Amrit', type: 'Good' }
  ],
  Tuesday: [
    { name: 'Rog', type: 'Evil' }, { name: 'Udveg', type: 'Bad' }, { name: 'Chal', type: 'Neutral' }, { name: 'Labh', type: 'Good' },
    { name: 'Amrit', type: 'Good' }, { name: 'Kaal', type: 'Evil' }, { name: 'Shubh', type: 'Good' }, { name: 'Rog', type: 'Evil' }
  ],
  Wednesday: [
    { name: 'Labh', type: 'Good' }, { name: 'Amrit', type: 'Good' }, { name: 'Kaal', type: 'Evil' }, { name: 'Shubh', type: 'Good' },
    { name: 'Rog', type: 'Evil' }, { name: 'Udveg', type: 'Bad' }, { name: 'Chal', type: 'Neutral' }, { name: 'Labh', type: 'Good' }
  ],
  Thursday: [
    { name: 'Shubh', type: 'Good' }, { name: 'Rog', type: 'Evil' }, { name: 'Udveg', type: 'Bad' }, { name: 'Chal', type: 'Neutral' },
    { name: 'Labh', type: 'Good' }, { name: 'Amrit', type: 'Good' }, { name: 'Kaal', type: 'Evil' }, { name: 'Shubh', type: 'Good' }
  ],
  Friday: [
    { name: 'Chal', type: 'Neutral' }, { name: 'Labh', type: 'Good' }, { name: 'Amrit', type: 'Good' }, { name: 'Kaal', type: 'Evil' },
    { name: 'Shubh', type: 'Good' }, { name: 'Rog', type: 'Evil' }, { name: 'Udveg', type: 'Bad' }, { name: 'Chal', type: 'Neutral' }
  ],
  Saturday: [
    { name: 'Kaal', type: 'Evil' }, { name: 'Shubh', type: 'Good' }, { name: 'Rog', type: 'Evil' }, { name: 'Udveg', type: 'Bad' },
    { name: 'Chal', type: 'Neutral' }, { name: 'Labh', type: 'Good' }, { name: 'Amrit', type: 'Good' }, { name: 'Kaal', type: 'Evil' }
  ]
};

const RAHU_SLOTS: Record<string, number> = {
  Sunday: 8,
  Monday: 2,
  Tuesday: 7,
  Wednesday: 5,
  Thursday: 6,
  Friday: 4,
  Saturday: 3
};

function formatTime24to12(minutesFromMidnight: number): string {
  const totalMins = (minutesFromMidnight + 1440) % 1440;
  const hours = Math.floor(totalMins / 60);
  const mins = Math.floor(totalMins % 60);
  const secs = Math.floor((totalMins * 60) % 60);

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  const hStr = displayHours.toString().padStart(2, '0');
  const mStr = mins.toString().padStart(2, '0');
  const sStr = secs.toString().padStart(2, '0');

  return `${hStr}:${mStr}:${sStr} ${period}`;
}

export function calculatePanchang(dateInput?: string, locationName: string = 'Hyderabad, Telangana, India'): PanchangData {
  const targetDate = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(targetDate.getTime())) {
    return calculatePanchang(new Date().toISOString().split('T')[0], locationName);
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayOfWeekName = days[targetDate.getDay()];
  const formattedDate = `${dayOfWeekName}, ${targetDate.getDate()} ${months[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

  // Deterministic calculation seed based on day offset from epoch
  const dayIndex = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24));

  // Base Sunrise around 05:50 - 06:10 AM depending on month
  const monthFactor = Math.sin((targetDate.getMonth() / 12) * Math.PI * 2);
  const sunriseMins = 350 + monthFactor * 15; // Mins from midnight (approx 05:50 AM)
  const sunsetMins = 1120 - monthFactor * 20; // Mins from midnight (approx 06:40 PM)

  const dayDurationMins = sunsetMins - sunriseMins;
  const nightDurationMins = 1440 - dayDurationMins;

  const daySlotDuration = dayDurationMins / 8;
  const nightSlotDuration = nightDurationMins / 8;

  // Rahu Kaal Calculation for selected day
  const rahuSlotIndex = RAHU_SLOTS[dayOfWeekName] - 1;
  const rahuStartMins = sunriseMins + rahuSlotIndex * daySlotDuration;
  const rahuEndMins = rahuStartMins + daySlotDuration;

  const rahuStartStr = formatTime24to12(rahuStartMins);
  const rahuEndStr = formatTime24to12(rahuEndMins);

  // Abhijit Muhurat (midday 48 mins centered around solar noon)
  const solarNoonMins = sunriseMins + dayDurationMins / 2;
  const abhijitStartStr = formatTime24to12(solarNoonMins - 24);
  const abhijitEndStr = formatTime24to12(solarNoonMins + 24);

  // Tithi, Nakshatra, Yoga, Karana
  const tithiName = TITHIS[(dayIndex + 4) % TITHIS.length];
  const nakshatraName = `${NAKSHATRAS[(dayIndex + 12) % NAKSHATRAS.length]} (upto ${formatTime24to12(sunriseMins + 560).split(' ')[0]})`;
  const yogaName = YOGAS[(dayIndex + 21) % YOGAS.length];
  const karanaName = KARANAS[(dayIndex + 1) % KARANAS.length];
  const pakshaName = (dayIndex % 30) < 15 ? 'Shukla' : 'Krishna';

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
  const nightMaster = DAY_CHOGHADIYA_MASTERS[days[(targetDate.getDay() + 1) % 7]];
  const nightChoghadiya = nightMaster.map((slot, idx) => {
    const sMins = sunsetMins + idx * nightSlotDuration;
    const eMins = sMins + nightSlotDuration;
    return {
      num: idx + 1,
      name: slot.name,
      type: slot.type,
      start: formatTime24to12(sMins),
      end: formatTime24to12(eMins),
    };
  });

  // Ashubha Muhurats
  const ashubhaMuhurats = [
    { name: 'Rahu Kaal', time: `${rahuStartStr} – ${rahuEndStr}`, isRahu: true },
    { name: 'Yamaganda', time: `${formatTime24to12(sunriseMins + daySlotDuration * 4)} – ${formatTime24to12(sunriseMins + daySlotDuration * 5)}` },
    { name: 'Gulika Kaal', time: `${formatTime24to12(sunriseMins + daySlotDuration * 6)} – ${formatTime24to12(sunriseMins + daySlotDuration * 7)}` },
    { name: 'Kantaka / Mrityu', time: `${rahuStartStr} – ${rahuEndStr}` },
    { name: 'Kaalvela / Ardhayaam', time: `${formatTime24to12(sunriseMins + daySlotDuration * 2)} – ${formatTime24to12(sunriseMins + daySlotDuration * 3)}` },
    { name: 'Yamaghanta', time: `${formatTime24to12(sunriseMins + daySlotDuration * 3)} – ${formatTime24to12(sunriseMins + daySlotDuration * 4)}` },
    { name: 'Kulika Kaal', time: `${formatTime24to12(sunriseMins + daySlotDuration * 5)} – ${formatTime24to12(sunriseMins + daySlotDuration * 6)}` },
  ];

  // Planetary Positions
  const planetaryPositions = [
    { planet: 'Ascendant', rashi: 'Cancer', lon: `${(25 + (dayIndex % 5)) % 30}°0′17″`, nakshatra: 'Ashlesha', pada: 4 },
    { planet: 'SUN', rashi: 'Cancer', lon: `${(28 + (dayIndex % 2)) % 30}°54′52″`, nakshatra: 'Ashlesha', pada: 4 },
    { planet: 'MOON', rashi: 'Virgo', lon: `${(15 + (dayIndex % 14)) % 30}°24′33″`, nakshatra: 'Chitra', pada: 1 },
    { planet: 'MERCURY', rashi: 'Cancer', lon: `${(18 + (dayIndex % 7)) % 30}°53′8″`, nakshatra: 'Ashlesha', pada: 1 },
    { planet: 'VENUS', rashi: 'Virgo', lon: `${(12 + (dayIndex % 10)) % 30}°46′28″`, nakshatra: 'Hasta', pada: 2 },
    { planet: 'MARS', rashi: 'Gemini', lon: `${(9 + (dayIndex % 6)) % 30}°29′55″`, nakshatra: 'Aadra', pada: 1 },
    { planet: 'JUPITER', rashi: 'Cancer', lon: `${(16 + (dayIndex % 3)) % 30}°15′19″`, nakshatra: 'Pushya', pada: 4 },
    { planet: 'SATURN', rashi: 'Pisces', lon: `${(20 + (dayIndex % 2)) % 30}°8′24″`, nakshatra: 'Revati', pada: 2 },
    { planet: 'RAHU', rashi: 'Aquarius', lon: `${(5 + (dayIndex % 4)) % 30}°51′57″`, nakshatra: 'Dhanishta', pada: 4 },
    { planet: 'KETU', rashi: 'Leo', lon: `${(5 + (dayIndex % 4)) % 30}°51′57″`, nakshatra: 'Magha', pada: 2 },
  ];

  return {
    dateStr: targetDate.toISOString().split('T')[0],
    formattedDate,
    location: locationName,
    weekday: dayOfWeekName,
    sunrise: formatTime24to12(sunriseMins).split(':')[0] + ':' + formatTime24to12(sunriseMins).split(':')[1] + ' am',
    sunset: formatTime24to12(sunsetMins).split(':')[0] + ':' + formatTime24to12(sunsetMins).split(':')[1] + ' pm',
    moonrise: formatTime24to12(sunriseMins + 260).split(':')[0] + ':' + formatTime24to12(sunriseMins + 260).split(':')[1] + ' am',
    moonset: formatTime24to12(sunsetMins + 160).split(':')[0] + ':' + formatTime24to12(sunsetMins + 160).split(':')[1] + ' pm',
    tithi: tithiName,
    nakshatra: nakshatraName,
    yoga: yogaName,
    karana: karanaName,
    paksha: pakshaName,
    shakaSamvat: '1948 Viśvāvasu',
    vikramSamvat: '1948 Viśvāvasu',
    rahuKaal: { start: rahuStartStr, end: rahuEndStr },
    abhijitMuhurat: { start: abhijitStartStr, end: abhijitEndStr },
    ashubhaMuhurats,
    dayChoghadiya,
    nightChoghadiya,
    planetaryPositions,
  };
}
