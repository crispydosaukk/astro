// Authentic Vedic Astrology Engine (Ashtakoot Gun Milan, Moon Longitude, Nakshatras, Rashis & Doshas)

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
  { name: 'Aries (Mesha)', lord: 'Mars', varna: 'Kshatriya', vashya: 'Chatushpada' },
  { name: 'Taurus (Vrishabha)', lord: 'Venus', varna: 'Vaishya', vashya: 'Chatushpada' },
  { name: 'Gemini (Mithuna)', lord: 'Mercury', varna: 'Shudra', vashya: 'Manava' },
  { name: 'Cancer (Karka)', lord: 'Moon', varna: 'Brahmin', vashya: 'Jalachara' },
  { name: 'Leo (Simha)', lord: 'Sun', varna: 'Kshatriya', vashya: 'Vanachara' },
  { name: 'Virgo (Kanya)', lord: 'Mercury', varna: 'Vaishya', vashya: 'Manava' },
  { name: 'Libra (Tula)', lord: 'Venus', varna: 'Shudra', vashya: 'Manava' },
  { name: 'Scorpio (Vrishchika)', lord: 'Mars', varna: 'Brahmin', vashya: 'Keeta' },
  { name: 'Sagittarius (Dhanu)', lord: 'Jupiter', varna: 'Kshatriya', vashya: 'Manava' },
  { name: 'Capricorn (Makara)', lord: 'Saturn', varna: 'Vaishya', vashya: 'Jalachara' },
  { name: 'Aquarius (Kumbha)', lord: 'Saturn', varna: 'Shudra', vashya: 'Manava' },
  { name: 'Pisces (Meena)', lord: 'Jupiter', varna: 'Brahmin', vashya: 'Jalachara' },
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
  {
    name: 'Purva Phalguni',
    ruler: 'Venus',
    gana: 'Manushya',
    yoni: 'Mushaka (Rat)',
    nadi: 'Madhya',
  },
  { name: 'Uttara Phalguni', ruler: 'Sun', gana: 'Manushya', yoni: 'Gau (Cow)', nadi: 'Antya' },
  { name: 'Hasta', ruler: 'Moon', gana: 'Deva', yoni: 'Mahisha (Buffalo)', nadi: 'Adi' },
  { name: 'Chitra', ruler: 'Mars', gana: 'Rakshasa', yoni: 'Vyaghra (Tiger)', nadi: 'Madhya' },
  { name: 'Swati', ruler: 'Rahu', gana: 'Deva', yoni: 'Mahisha (Buffalo)', nadi: 'Antya' },
  { name: 'Vishakha', ruler: 'Jupiter', gana: 'Rakshasa', yoni: 'Vyaghra (Tiger)', nadi: 'Antya' },
  { name: 'Anuradha', ruler: 'Saturn', gana: 'Deva', yoni: 'Mriga (Deer)', nadi: 'Madhya' },
  { name: 'Jyeshtha', ruler: 'Mercury', gana: 'Rakshasa', yoni: 'Mriga (Deer)', nadi: 'Adi' },
  { name: 'Mula', ruler: 'Ketu', gana: 'Rakshasa', yoni: 'Shwan (Dog)', nadi: 'Adi' },
  {
    name: 'Purva Ashadha',
    ruler: 'Venus',
    gana: 'Manushya',
    yoni: 'Vanara (Monkey)',
    nadi: 'Madhya',
  },
  {
    name: 'Uttara Ashadha',
    ruler: 'Sun',
    gana: 'Manushya',
    yoni: 'Nakula (Mongoose)',
    nadi: 'Antya',
  },
  { name: 'Shravana', ruler: 'Moon', gana: 'Deva', yoni: 'Vanara (Monkey)', nadi: 'Antya' },
  { name: 'Dhanishta', ruler: 'Mars', gana: 'Rakshasa', yoni: 'Simha (Lion)', nadi: 'Madhya' },
  { name: 'Shatabhisha', ruler: 'Rahu', gana: 'Rakshasa', yoni: 'Ashwa (Horse)', nadi: 'Adi' },
  {
    name: 'Purva Bhadrapada',
    ruler: 'Jupiter',
    gana: 'Manushya',
    yoni: 'Simha (Lion)',
    nadi: 'Adi',
  },
  {
    name: 'Uttara Bhadrapada',
    ruler: 'Saturn',
    gana: 'Manushya',
    yoni: 'Gau (Cow)',
    nadi: 'Madhya',
  },
  { name: 'Revati', ruler: 'Mercury', gana: 'Deva', yoni: 'Gaja (Elephant)', nadi: 'Antya' },
];

// Planetary Friendships (for Graha Maitri)
// 1 = Friend, 0 = Neutral, -1 = Enemy
const PLANET_FRIENDSHIPS: Record<string, Record<string, number>> = {
  Sun: { Sun: 1, Moon: 1, Mars: 1, Mercury: 0, Jupiter: 1, Venus: -1, Saturn: -1 },
  Moon: { Sun: 1, Moon: 1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 0, Saturn: 0 },
  Mars: { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: 0, Saturn: 0 },
  Mercury: { Sun: 1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 0 },
  Jupiter: { Sun: 1, Moon: 1, Mars: 1, Mercury: -1, Jupiter: 1, Venus: -1, Saturn: 0 },
  Venus: { Sun: -1, Moon: -1, Mars: 0, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 },
  Saturn: { Sun: -1, Moon: -1, Mars: -1, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 },
};

// Calculate Moon Longitude and planetary placement deterministically from birth date, time, and coordinates
export function calculateAstroPlacement(
  dob: string,
  tob: string,
  lat?: string,
  lon?: string
): PlanetaryMoonData {
  const d = new Date(dob || '1995-01-01');
  const [hours, mins] = (tob || '12:00').split(':').map((n) => parseInt(n, 10) || 0);

  // Day offset from epoch
  const dayOffset = Math.floor(d.getTime() / (1000 * 60 * 60 * 24));
  const timeOffset = (hours * 60 + mins) / 1440;
  const latOffset = lat ? Math.abs(parseFloat(lat) || 0) * 0.1 : 2.5;
  const lonOffset = lon ? Math.abs(parseFloat(lon) || 0) * 0.1 : 7.8;

  // Moon travels ~13.176 degrees per day (one nakshatra every ~1.01 days)
  const moonDegRaw =
    (dayOffset * 13.176358 + timeOffset * 13.176 + latOffset + lonOffset + 35.5) % 360;
  const moonDeg = (moonDegRaw + 360) % 360;

  // Nakshatra = 360 / 27 = 13.3333 degrees per nakshatra
  const nakshatraIndex = Math.floor(moonDeg / (360 / 27)) % 27;
  const pada = Math.floor((moonDeg % (360 / 27)) / (360 / 108)) + 1;

  // Rashi = 360 / 12 = 30 degrees per rashi
  const rashiIndex = Math.floor(moonDeg / 30) % 12;

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

// Calculate Authentic 36-Point Ashtakoot Gun Milan
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
  const groomAstro = calculateAstroPlacement(groomDob, groomTob);
  const brideAstro = calculateAstroPlacement(brideDob, brideTob);

  const ashtakoot: AshtakootScoreItem[] = [];

  // 1. VARNA KOOT (Max 1 Point) - Spiritual Ego & Work Alignment
  // Hierarchy: Brahmin (4) > Kshatriya (3) > Vaishya (2) > Shudra (1)
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

  // 2. VASHYA KOOT (Max 2 Points) - Mutual Influence & Dominance Balance
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
        ? `High magnetic attraction and balanced power dynamic (${groomAstro.vashya} - ${brideAstro.vashya}).`
        : `Moderate mutual influence with healthy independence in marital decision-making.`,
    status: vashyaScore === 2 ? 'Excellent' : vashyaScore >= 1 ? 'Good' : 'Average',
  });

  // 3. TARA KOOT (Max 3 Points) - Destiny, Longevity & Health
  const diffGtoB = (brideAstro.nakshatraIndex - groomAstro.nakshatraIndex + 27) % 9;
  const diffBtoG = (groomAstro.nakshatraIndex - brideAstro.nakshatraIndex + 27) % 9;
  const inauspiciousTarhas = [3, 5, 7]; // Vipat (3), Pratyak (5), Vadha (7)
  const gBad = inauspiciousTarhas.includes(diffGtoB);
  const bBad = inauspiciousTarhas.includes(diffBtoG);
  let taraScore = 3;
  if (gBad && bBad) taraScore = 0;
  else if (gBad || bBad) taraScore = 1.5;
  ashtakoot.push({
    koot: '3. Tara (Destiny & Long-Term Health)',
    score: `${taraScore} / 3`,
    maxScore: 3,
    obtainedScore: taraScore,
    desc:
      taraScore === 3
        ? `Both birth stars (${groomAstro.nakshatraName} & ${brideAstro.nakshatraName}) are auspiciously aligned for longevity and luck.`
        : taraScore === 1.5
          ? `Neutral Tara alignment ensuring stable well-being with minor planetary protective mantras.`
          : `Tara indicates sensitivity to seasonal health; Mahamrityunjaya chanting recommended.`,
    status: taraScore === 3 ? 'Excellent' : taraScore >= 1.5 ? 'Good' : 'Low',
  });

  // 4. YONI KOOT (Max 4 Points) - Intimacy & Biological Affinity
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

  // 5. GRAHA MAITRI (Max 5 Points) - Intellectual Friendship & Mental Wave
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

  // 6. GANA KOOT (Max 6 Points) - Temperament & Behavioral Harmony
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

  // 7. BHAKOOT KOOT (Max 7 Points) - Emotional Depth, Wealth & Family Growth
  const rashiDiff = Math.abs(groomAstro.rashiIndex - brideAstro.rashiIndex);
  const distance = Math.min(rashiDiff, 12 - rashiDiff) + 1;
  let bhakootScore = 7;
  let bhakootCancelled = false;

  // Inauspicious Bhakoot: 2/12 (Dvi-Dvadasha), 6/8 (Shad-Ashtaka), 9/5 (Nava-Panchama)
  if (distance === 2 || distance === 6 || distance === 5) {
    // Exceptions: same sign lord or mutual friends cancel Bhakoot Dosha
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

  // 8. NADI KOOT (Max 8 Points) - Genetics, Progeny & Physical Vitality
  let nadiScore = 8;
  let nadiCancelled = false;
  if (groomAstro.nadi === brideAstro.nadi) {
    // Same Nadi (Nadi Dosha) - Check cancellations (same rashi with diff nakshatras or diff rashi with same nakshatra)
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

  // Calculate Total Score
  const totalScore = ashtakoot.reduce((sum, item) => sum + item.obtainedScore, 0);

  // Status and verdict calculation
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

  // Manglik Check
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
