import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export interface GeneratedChartCase {
  id: string;
  title: string;
  clientQuery: string;
  lagna: string;
  moonSign: string;
  dasha: string;
  keyPlacements: string;
  expectedObservations?: string;
  recommendedRemedies?: string;
  isAiGenerated?: boolean;
}

const FALLBACK_CASES: GeneratedChartCase[] = [
  {
    id: 'case-fb-1',
    title: 'Case Profile #K-402 (Career & Business Crisis)',
    clientQuery: 'I have experienced sudden career delays and mental restlessness over the past 8 months despite hard work. Will my business venture launch successfully, and what spiritual remedies do you recommend?',
    lagna: 'Scorpio (Vrishchika) - Mars is Lagna lord with Digbala in 10th house',
    moonSign: 'Capricorn (Makara) - Shravana Nakshatra',
    dasha: 'Saturn Mahadasha with Rahu Antardasha',
    keyPlacements: 'Mars in 10th (Leo) with Digbala, Sun in 11th (Virgo), Saturn in 12th',
    expectedObservations: 'Recognize Scorpio Lagna, Mars Digbala in 10th house, Saturn-Rahu dasha sandhi causing friction and timing of revival.',
    recommendedRemedies: 'Sattvic Shani & Rahu pacification, Hanuman Chalisa, Shiva puja, sesame oil lighting, charity, ethical counseling.'
  },
  {
    id: 'case-fb-2',
    title: 'Case Profile #K-708 (Marriage Timing & Manglik Evaluation)',
    clientQuery: 'The client is 31 years old experiencing multiple broken marriage alliances and seeking clarification on whether Kuja Dosha (Manglik) is the primary factor, along with auspicious timing for matrimony.',
    lagna: 'Cancer (Karka) - Moon is Lagna lord in 9th house (Pisces)',
    moonSign: 'Pisces (Meena) - Uttarabhadrapada Nakshatra',
    dasha: 'Jupiter Mahadasha with Venus Antardasha',
    keyPlacements: 'Mars in 7th (Capricorn - exalted Neecha-bhanga), Saturn in 4th, Venus in 11th (Taurus)',
    expectedObservations: 'Exalted Mars in 7th cancels malefic severity due to Ruchaka Yoga/exaltation; Jupiter-Venus dasha activates 7th/9th/11th houses indicating marriage within 14 months.',
    recommendedRemedies: 'Gauri Shankar worship, Katyayani mantra, offering yellow sweets to cows on Thursdays, avoiding unnecessary panic regarding Manglik status.'
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      specialisation = 'Vedic Jyotish',
      language = 'en'
    } = body;

    const langStr = String(language || 'en').toLowerCase();
    const isHindi = langStr === 'hi' || langStr === 'hindi';
    const isTelugu = langStr === 'te' || langStr === 'telugu';
    const isTamil = langStr === 'ta' || langStr === 'tamil';

    try {
      const openai = getOpenAIClient();
      let langDirective = 'Language: English.';
      if (isHindi) {
        langDirective = 'CRITICAL REQUIREMENT: Output all fields (title, clientQuery, lagna, moonSign, dasha, keyPlacements, expectedObservations, recommendedRemedies) in formal Hindi (हिन्दी) using authentic Vedic terminology.';
      } else if (isTelugu) {
        langDirective = 'CRITICAL REQUIREMENT: Output all fields in authentic Telugu (తెలుగు) using standard Jyotish terminology (లగ్నం, రాశి, మహాదశ, పరిహారాలు).';
      } else if (isTamil) {
        langDirective = 'CRITICAL REQUIREMENT: Output all fields in authentic Tamil (தமிழ்) using standard Jyotish terminology (லக்னம், ராசி, மகா தசா, பரிகாரங்கள்).';
      }

      const prompt = `Generate a realistic, complex Blind Kundali Case Study scenario for testing a senior astrologer (${specialisation}).
${langDirective}

Include:
1. A unique case title with a case number (e.g. Case Profile #AI-...).
2. Client query with specific life problem (career delay, marital dispute, health, property, foreign travel).
3. Ascendant (Lagna) with sign and lagna lord.
4. Moon Sign (Janma Rashi) with nakshatra.
5. Current Vimshottari Mahadasha and Antardasha.
6. 2-3 key planetary placements that explain the client's current situation.
7. Expected observations that a skilled astrologer should uncover.
8. Recommended sattvic Vedic remedies.

Return JSON in this EXACT schema:
{
  "title": "Case Profile #AI-...",
  "clientQuery": "...",
  "lagna": "...",
  "moonSign": "...",
  "dasha": "...",
  "keyPlacements": "...",
  "expectedObservations": "...",
  "recommendedRemedies": "..."
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an authoritative Vedic Astrological Board Examiner creating challenging blind horoscope case studies. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      if (parsed.title && parsed.clientQuery && parsed.lagna) {
        return NextResponse.json({
          success: true,
          mode: 'ai_dynamic',
          chartCase: {
            id: `ai-case-${Date.now()}`,
            title: parsed.title,
            clientQuery: parsed.clientQuery,
            lagna: parsed.lagna,
            moonSign: parsed.moonSign || 'Scorpio (Vrishchika)',
            dasha: parsed.dasha || 'Saturn - Mercury',
            keyPlacements: parsed.keyPlacements || 'Mars in 10th house, Sun in 11th house',
            expectedObservations: parsed.expectedObservations || '',
            recommendedRemedies: parsed.recommendedRemedies || '',
            isAiGenerated: true
          }
        });
      }
    } catch (aiErr) {
      console.warn('AI chart case generation fallback triggered:', aiErr);
    }

    // Fallback
    const fallback = FALLBACK_CASES[Math.floor(Math.random() * FALLBACK_CASES.length)];
    return NextResponse.json({
      success: true,
      mode: 'fallback',
      chartCase: fallback
    });

  } catch (error: any) {
    console.error('Error generating chart case:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate chart case'
    }, { status: 500 });
  }
}
