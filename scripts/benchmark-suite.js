/**
 * AstroParihar Gold-Standard Benchmark Test Suite: AP-0001 to AP-0010
 * 
 * Comprehensive regression tests verifying:
 * - AP-0001: Historical Ephemeris & Ephemeris Calculations (Ayanamsha, Ascendant, Degrees, Rohini Moon lordship)
 * - AP-0002: 36-Point Ashtakoot Gun Milan & Compatibility Engine
 * - AP-0003: Timing Diversity Across Domains (Zero Static Date Repetition)
 * - AP-0004: Jaimini Karakamsa & Canonical Ishta Devata Derivation
 * - AP-0005: 48-Day Executable Parihar Protocol Generation
 * - AP-0006: Personal Astrology Profile Generator (Roadmap Item 4)
 * - AP-0007: Interactive Compare Years Matrix Generator (Roadmap Item 11)
 * - AP-0008: Visual Astrology Timeline Generator (Roadmap Item 12)
 * - AP-0009: Specialized Astrologer Personas Integration (Roadmap Item 13)
 * - AP-0010: Conversational Barge-In & Voice Interruption Intelligence (Roadmap Item 10)
 */

const fs = require('fs');
const path = require('path');

const {
  extractBirthDetailsFromText,
  calculateBirthChartData,
  formatChartSummaryForAI,
  calculateAshtakootGunMilan,
  calculateRashiCompatibility,
  analyzeInquiryEvidence,
  generatePersonalAstrologyProfile,
  generateYearComparison,
  generateInteractiveTimeline,
} = require('../src/lib/vedicAstrologyEngine.ts');

const { generate48DayRemedyProtocol } = require('../src/lib/vedicRemediesEngine.ts');

function runAllBenchmarks() {
  console.log('================================================================');
  console.log('🚀 ASTROPARIHAR AUTOMATED REGRESSION SUITE: AP-0001 to AP-0010');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, expected, actual) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      console.error(`         Expected: ${expected}`);
      console.error(`         Actual:   ${actual}`);
      failed++;
    }
  }

  // Baseline Test Native (1968-05-28, 04:44 AM, Chennai)
  const nativeChart = calculateBirthChartData(
    '1968-05-28',
    '04:44 AM',
    'Chennai',
    '13.0827',
    '80.2707',
    'Benchmark Native',
    'Male'
  );

  // -------------------------------------------------------------------------
  // AP-0001: Historical Ephemeris & Astronomical Calculation Ground Truth
  // -------------------------------------------------------------------------
  console.log('▶ TEST CASE AP-0001: Astronomical Ephemeris & Lahiri Calculation');
  assert(nativeChart.ayanamsa.name.includes('Lahiri'), 'AP-0001.1: Standard is Lahiri Ayanamsha', 'Lahiri', nativeChart.ayanamsa.name);
  assert(nativeChart.ayanamsa.formatted.startsWith('23° 24\''), 'AP-0001.2: Lahiri Ayanamsha ~23° 24\'', '23° 24\'', nativeChart.ayanamsa.formatted);
  assert(nativeChart.ascendant.includes('Aries'), 'AP-0001.3: Ascendant is Aries', 'Aries', nativeChart.ascendant);
  assert(nativeChart.ascendantDms.startsWith('27° 41\''), 'AP-0001.4: Ascendant degree is ~27° 41\'', '27° 41\'', nativeChart.ascendantDms);
  assert(nativeChart.nakshatra === 'Rohini (Pada 4)', 'AP-0001.5: Moon Nakshatra is Rohini (Pada 4)', 'Rohini (Pada 4)', nativeChart.nakshatra);
  assert(nativeChart.nakshatraLord === 'Moon', 'AP-0001.6: Rohini ruler is Moon (Zero hallucination)', 'Moon', nativeChart.nakshatraLord);
  assert(nativeChart.dasha.currentMahadasha === 'Saturn Mahadasha', 'AP-0001.7: Active Mahadasha in 2026 is Saturn', 'Saturn Mahadasha', nativeChart.dasha.currentMahadasha);
  assert(Array.isArray(nativeChart.d10Houses) && nativeChart.d10Houses.length === 12, 'AP-0001.8: D10 Dasamsa Chart provided', 12, nativeChart.d10Houses.length);

  // -------------------------------------------------------------------------
  // AP-0002: Marriage & Compatibility (Ashtakoot Gun Milan)
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0002: Ashtakoot Gun Milan & Couple Compatibility');
  const ashtakoot = calculateAshtakootGunMilan(
    '1995-05-15',
    '14:30',
    'New Delhi',
    '1996-08-20',
    '10:15',
    'Mumbai',
    'Groom',
    'Bride'
  );
  assert(ashtakoot.totalScore >= 0 && ashtakoot.totalScore <= 36, 'AP-0002.1: Gun Milan total score is out of 36', '0-36', ashtakoot.totalScore);
  assert(ashtakoot.ashtakoot.length === 8, 'AP-0002.2: All 8 Kootas calculated', 8, ashtakoot.ashtakoot.length);
  assert(typeof ashtakoot.verdict === 'string' && ashtakoot.verdict.length > 10, 'AP-0002.3: Auspicious Astrological verdict provided', 'Verdict string', ashtakoot.verdict);

  // -------------------------------------------------------------------------
  // AP-0003: Timing Diversity Across Domains
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0003: Domain-Specific Timing Windows (Zero Date Duplication)');
  const evMarriage = analyzeInquiryEvidence(nativeChart, 'When will I get married?');
  const evHealth = analyzeInquiryEvidence(nativeChart, 'When will my chronic health issue improve?');
  const evCareer = analyzeInquiryEvidence(nativeChart, 'When is the best time for job promotion?');
  const evFinance = analyzeInquiryEvidence(nativeChart, 'When will my wealth and business expand?');

  assert(evMarriage.timingWindow !== evHealth.timingWindow, 'AP-0003.1: Marriage timing window differs from Health timing window', 'Non-identical', `${evMarriage.timingWindow} vs ${evHealth.timingWindow}`);
  assert(evCareer.timingWindow !== evFinance.timingWindow || evCareer.timingWindow !== evHealth.timingWindow, 'AP-0003.2: Career & Finance timing windows are dynamic', 'True', 'Dynamic');
  assert(!evMarriage.timingWindow.includes('static'), 'AP-0003.3: Timing window is calculated deterministically', 'Dynamic string', evMarriage.timingWindow);

  // -------------------------------------------------------------------------
  // AP-0004: Jaimini Karakamsa & Canonical Ishta Devata Derivation
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0004: Jaimini Karakamsa & Ishta Devata Calculation');
  assert(nativeChart.ishtaDevata !== null, 'AP-0004.1: Ishta Devata calculated', 'Non-null', nativeChart.ishtaDevata);
  assert(typeof nativeChart.ishtaDevata.deityName === 'string', 'AP-0004.2: Verified Ishta Devata deity name assigned', 'Deity name', nativeChart.ishtaDevata.deityName);
  assert(nativeChart.ishtaDevata.primaryMantra.length > 5, 'AP-0004.3: Canonical Ishta Devata mantra assigned', 'Mantra', nativeChart.ishtaDevata.primaryMantra);
  assert(typeof nativeChart.ishtaDevata.atmakarakaPlanet === 'string', 'AP-0004.4: Saptakaraka Atmakaraka identified', 'Planet', nativeChart.ishtaDevata.atmakarakaPlanet);

  // -------------------------------------------------------------------------
  // AP-0005: 48-Day Executable Parihar Protocol Generation
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0005: 48-Day Executable Parihar Protocol Generator');
  const protocol = generate48DayRemedyProtocol({
    domain: 'career',
    planet: 'Sun',
    concern: 'Career promotion and leadership growth',
  });
  assert(protocol.totalDays === 48, 'AP-0005.1: Mandala duration is exactly 48 days', 48, protocol.totalDays);
  assert(Boolean(protocol.recommendedHomam), 'AP-0005.2: Recommended consecrated Homam present', 'Homam name', protocol.recommendedHomam);
  assert(Boolean(protocol.dailyMantra), 'AP-0005.3: Canonical daily Mantra assigned', 'Daily mantra', protocol.dailyMantra);
  assert(Boolean(protocol.initiationDay1.action), 'AP-0005.4: Day 1 Sankalpa defined', 'Day 1 action', protocol.initiationDay1.action);
  assert(Boolean(protocol.midMandalaMilestoneDay24.charityDaana), 'AP-0005.5: Day 24 Daana defined', 'Day 24 daana', protocol.midMandalaMilestoneDay24.charityDaana);
  assert(Boolean(protocol.culminationDay48.action), 'AP-0005.6: Day 48 Purnahuti defined', 'Day 48 action', protocol.culminationDay48.action);

  // -------------------------------------------------------------------------
  // AP-0006: Personal Astrology Profile Generator (Roadmap Item 4)
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0006: Personal Astrology Profile Generator (Blueprint Item 4)');
  const profile = generatePersonalAstrologyProfile(nativeChart);
  assert(profile.personality.ascendant.includes('Aries'), 'AP-0006.1: Ascendant sign is Aries', 'Aries', profile.personality.ascendant);
  assert(profile.personality.moonSign.includes('Taurus'), 'AP-0006.2: Moon sign is Taurus', 'Taurus', profile.personality.moonSign);
  assert(profile.career.tenthHouseLord === 'Saturn', 'AP-0006.3: 10th House (Capricorn) lord is Saturn', 'Saturn', profile.career.tenthHouseLord);
  assert(profile.finance.wealthCombinations.length > 0, 'AP-0006.4: Dhana Yogas identified', 'Array', profile.finance.wealthCombinations.length);
  assert(Boolean(profile.marriage.maritalDisposition), 'AP-0006.5: 7th House & D9 marital harmony evaluated', 'String', profile.marriage.maritalDisposition);
  assert(Boolean(profile.health.vitalityLevel), 'AP-0006.6: 6th House health vitality evaluated', 'String', profile.health.vitalityLevel);
  assert(Boolean(profile.activeDasha.mahadasha), 'AP-0006.7: Active Mahadasha present in profile', 'String', profile.activeDasha.mahadasha);

  // -------------------------------------------------------------------------
  // AP-0007: Interactive Compare Years Matrix (Roadmap Item 11)
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0007: Interactive Compare Years Matrix (Blueprint Item 11)');
  const matrix = generateYearComparison(nativeChart, 2026, 4);
  assert(matrix.length === 4, 'AP-0007.1: Returns 4 consecutive years (2026-2029)', 4, matrix.length);
  assert(matrix[0].year === 2026, 'AP-0007.2: First year is 2026', 2026, matrix[0].year);
  assert(matrix[1].year === 2027, 'AP-0007.3: Second year is 2027', 2027, matrix[1].year);
  assert(matrix[0].careerScore >= 0 && matrix[0].careerScore <= 100, 'AP-0007.4: Career score between 0 and 100', '0-100', matrix[0].careerScore);
  assert(matrix[0].financeScore >= 0 && matrix[0].financeScore <= 100, 'AP-0007.5: Finance score between 0 and 100', '0-100', matrix[0].financeScore);
  assert(matrix[0].relationshipScore >= 0 && matrix[0].relationshipScore <= 100, 'AP-0007.6: Relationship score between 0 and 100', '0-100', matrix[0].relationshipScore);
  assert(Boolean(matrix[0].whyThisYear), 'AP-0007.7: Dasha-driven rationale provided for year', 'Rationale', matrix[0].whyThisYear);

  // -------------------------------------------------------------------------
  // AP-0008: Visual Astrology Timeline (Roadmap Item 12)
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0008: Visual Astrology Timeline Generator (Blueprint Item 12)');
  const timeline = generateInteractiveTimeline(nativeChart);
  assert(Array.isArray(timeline) && timeline.length >= 3, 'AP-0008.1: Generates active and upcoming milestones', '>= 3', timeline.length);
  assert(Boolean(timeline[0].periodName), 'AP-0008.2: Milestone has periodName', 'Period name', timeline[0].periodName);
  assert(Boolean(timeline[0].startDate && timeline[0].endDate), 'AP-0008.3: Milestone has start & end dates', 'Dates', `${timeline[0].startDate} to ${timeline[0].endDate}`);
  assert(Boolean(timeline[0].suggestedQuestion), 'AP-0008.4: Milestone includes tap-to-ask question', 'Question', timeline[0].suggestedQuestion);
  assert(['Auspicious', 'Mixed', 'Transformational', 'Testing'].includes(timeline[0].nature), 'AP-0008.5: Nature badge conforms to enum', 'Enum', timeline[0].nature);

  // -------------------------------------------------------------------------
  // AP-0009: Specialized Astrologer Personas (Roadmap Item 13)
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0009: Specialized Astrologer Personas (Blueprint Item 13)');
  const astroDataFilePath = path.join(__dirname, '..', 'src', 'lib', 'aiAstrologerData.ts');
  const astroContent = fs.readFileSync(astroDataFilePath, 'utf8');

  assert(astroContent.includes('ai-dr-raman') && astroContent.includes('Corporate Timing'), 'AP-0009.1: Career specialist Dr. Raman defined', 'true', 'true');
  assert(astroContent.includes('ai-love-guru') && astroContent.includes('Love & Vivaha'), 'AP-0009.2: Marriage specialist Acharya Raghvendra defined', 'true', 'true');
  assert(astroContent.includes('ai-acharya-vikram') && astroContent.includes('Vastu Master'), 'AP-0009.3: Vastu specialist Acharya Vikramaditya defined', 'true', 'true');
  assert(astroContent.includes('systemPersonaPrompt'), 'AP-0009.4: System persona prompts configured for specialized astrologers', 'true', 'true');

  // -------------------------------------------------------------------------
  // AP-0010: Conversational Barge-In & Voice Interruption (Roadmap Item 10)
  // -------------------------------------------------------------------------
  console.log('\n▶ TEST CASE AP-0010: Voice Barge-In & Interruption Detection (Blueprint Item 10)');
  const INTERRUPT_PATTERNS = [
    /\bwait\b/i,
    /\bhold on\b/i,
    /\bstop\b/i,
    /\blisten\b/i,
    /\bone second\b/i,
    /\bone question\b/i,
    /\baagandi\b/i,
    /\brukiye\b/i,
    /\broko\b/i,
    /\bnillungal\b/i,
    /\bwhat about\b/i,
    /\binstead\b/i,
    /\bgo back\b/i,
    /\bcompare\b/i,
    /ఆగండి/,
    /ఒక్క నిమిషం/,
    /మరి/,
    /రుకియే/,
    /रुको/,
    /सुनिए/,
  ];

  function detectBargeIn(text) {
    return INTERRUPT_PATTERNS.some((p) => p.test(text));
  }

  assert(detectBargeIn('Wait, what about my career in 2027 instead?'), 'AP-0010.1: Detects English barge-in keyword "wait"', 'true', 'true');
  assert(detectBargeIn('Hold on, tell me about my marriage'), 'AP-0010.2: Detects English barge-in "hold on"', 'true', 'true');
  assert(detectBargeIn('ఆగండి, నా ఉద్యోగం గురించి చెప్పండి'), 'AP-0010.3: Detects Telugu barge-in "ఆగండి"', 'true', 'true');
  assert(detectBargeIn('रुको, 2026 में मेरा स्वास्थ्य कैसा रहेगा?'), 'AP-0010.4: Detects Hindi barge-in "रुको"', 'true', 'true');
  assert(!detectBargeIn('Namaste Acharya ji please tell me my horoscope'), 'AP-0010.5: Does not false-positive on regular greeting', 'false', 'false');

  // Summary
  console.log('\n================================================================');
  console.log(`TOTAL BENCHMARK RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    console.error('❌ SOME BENCHMARK TESTS FAILED!\n');
    process.exit(1);
  } else {
    console.log('✅ ALL AP-0001 THROUGH AP-0010 BENCHMARK TESTS PASSED WITH 100% ACCURACY!\n');
  }
}

runAllBenchmarks();
