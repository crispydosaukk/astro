import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export interface GeneratedQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
}

const FALLBACK_QUESTION_POOL: Record<string, GeneratedQuestion[]> = {
  'Vedic Jyotish': [
    {
      id: 1,
      question: 'In Vedic Jyotish, which house represents Dharma, higher wisdom, fortunes (Bhagya), and the Guru?',
      options: ['5th House (Trikona)', '9th House (Bhagya Sthana)', '10th House (Karma Sthana)', '1st House (Lagna)'],
      correctIndex: 1,
      explanation: 'The 9th house is the prime Dharma and Bhagya Bhava representing divine fortunes and spiritual guidance.',
      topic: 'Houses & Bhavas'
    },
    {
      id: 2,
      question: 'Which planetary combination forms a classic "Gajakesari Yoga"?',
      options: [
        'Sun and Mercury in the same house (Budhaditya)',
        'Jupiter and Moon in Kendra (1, 4, 7, 10) from each other',
        'Saturn and Rahu conjunction (Shrapit Yoga)',
        'Mars in the 7th house from Lagna'
      ],
      correctIndex: 1,
      explanation: 'Gajakesari Yoga is formed when Jupiter occupies a Kendra from the Moon or Lagna, conferring wisdom and respect.',
      topic: 'Classical Yogas'
    },
    {
      id: 3,
      question: 'How is the strength of a planet in the Navamsha (D9) chart interpreted relative to the Rashi (D1) chart?',
      options: [
        'D9 is only used for wealth calculations',
        'A debilitated planet in D1 gaining exaltation in D9 gains Neecha Bhanga and hidden inner strength (Vargottama/Pushkara)',
        'D9 completely overrides D1 in all circumstances',
        'D9 has no bearing on planetary strength'
      ],
      correctIndex: 1,
      explanation: 'Navamsha reveals the fruit (Phala) and underlying core potential of planetary placements in the natal chart.',
      topic: 'Divisional Charts'
    },
    {
      id: 4,
      question: 'What is the standard order of the Vimshottari Dasha system starting from Ketu?',
      options: [
        'Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury',
        'Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus',
        'Jupiter → Saturn → Mercury → Ketu → Venus → Sun → Moon → Mars → Rahu',
        'Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus → Sun → Moon'
      ],
      correctIndex: 0,
      explanation: 'The standard 120-year Vimshottari dasha cycle begins with Ketu (7 yrs) followed by Venus (20 yrs), Sun (6 yrs), Moon (10 yrs), etc.',
      topic: 'Dasha Systems'
    },
    {
      id: 5,
      question: 'When recommending astrological remedies for severe afflictions (e.g. Kaal Sarp or Sade Sati), what is the most ethical approach?',
      options: [
        'Guarantee 100% immediate results within 24 hours for expensive rituals',
        'Explain planetary energies calmly, recommend accessible japa/charity/mantras, and encourage constructive lifestyle action without fear-mongering',
        'Advise the client that their destiny is completely doomed without expensive gems',
        'Recommend avoiding all consultations in the future'
      ],
      correctIndex: 1,
      explanation: 'Ethical Vedic guidance empowers clients with sattvic remedies, positive karma, and realistic guidance without creating anxiety.',
      topic: 'Ethics & Upayas'
    },
    {
      id: 6,
      question: 'Which house is considered the "Maraka" (killer) house in Vedic Astrology alongside the 7th house?',
      options: ['2nd House', '6th House', '8th House', '12th House'],
      correctIndex: 0,
      explanation: 'The 2nd and 7th houses are classical Maraka houses as they are 12th from the longevity houses (3rd and 8th).',
      topic: 'Longevity & Marakas'
    },
    {
      id: 7,
      question: 'What constitutes a "Pancha Mahapurusha Yoga" formed by Mars (Kuja)?',
      options: ['Ruchaka Yoga', 'Bhadra Yoga', 'Hamsa Yoga', 'Malavya Yoga'],
      correctIndex: 0,
      explanation: 'Ruchaka Yoga is formed when Mars is exalted (Capricorn) or in own sign (Aries/Scorpio) in a Kendra.',
      topic: 'Mahapurusha Yogas'
    },
    {
      id: 8,
      question: 'In transit (Gochara), from which reference point are planetary transits primarily analyzed?',
      options: ['Natal Moon Sign (Chandra Lagna)', 'Natal Sun Sign (Surya Lagna)', 'Navamsha Lagna', 'Arudha Lagna'],
      correctIndex: 0,
      explanation: 'Gochara transits are primarily evaluated from the Janma Rashi (Natal Moon sign).',
      topic: 'Transits (Gochara)'
    },
    {
      id: 9,
      question: 'Which planet acts as the natural Karaka (significator) for Atma (Soul) and career authority?',
      options: ['Sun (Surya)', 'Jupiter (Guru)', 'Saturn (Shani)', 'Mars (Mangal)'],
      correctIndex: 0,
      explanation: 'Surya is the Naisargika Atmakaraka representing vitality, ego, royalty, and father.',
      topic: 'Planetary Karakas'
    },
    {
      id: 10,
      question: 'What is the effect of "Combustion" (Astangata) on a planet when it gets too close to the Sun?',
      options: [
        'The planet gains immense strength in Shadbala',
        'The planet loses outer physical manifestation power and signifies internal/karmic lessons',
        'The planet becomes exalted automatically',
        'The planet changes its friendship status'
      ],
      correctIndex: 1,
      explanation: 'Combustion weakens the external physical significations of the planet while burning karma internally.',
      topic: 'Planetary States (Avasthas)'
    }
  ],
  'KP System': [
    {
      id: 1,
      question: 'In KP Astrology, which lord is given supreme authority over event fruition?',
      options: ['Sub-Lord (Up-Nakshatra Swami)', 'Sign Lord (Rashi Swami)', 'Star Lord (Nakshatra Swami)', 'Lagna Lord'],
      correctIndex: 0,
      explanation: 'In Krishnamurti Paddhati (KP), the Sub-Lord decides the ultimate positive or negative outcome of any house query.',
      topic: 'KP Sub-Lord Theory'
    },
    {
      id: 2,
      question: 'Which house grouping signifies marriage in KP System?',
      options: ['2, 7, 11', '1, 6, 10', '4, 8, 12', '3, 5, 9'],
      correctIndex: 0,
      explanation: 'Houses 2 (Family addition), 7 (Spouse/Partnership), and 11 (Fulfilment of desires) indicate marriage in KP.',
      topic: 'KP House Grouping'
    },
    {
      id: 3,
      question: 'What is the significance of the 6, 8, 12 houses in KP System?',
      options: ['Adverse / Obstruction Houses (Dusthanas)', 'Houses of instant wealth', 'Dharma houses', 'Kendra houses'],
      correctIndex: 0,
      explanation: 'Houses 6, 8, and 12 signify litigation, obstacles, and financial loss or separation in KP.',
      topic: 'KP Dusthanas'
    },
    {
      id: 4,
      question: 'In KP Prashna, which number range is traditionally chosen by the querent?',
      options: ['1 to 249 (or 1 to 2193 in fine subdivisions)', '1 to 108', '1 to 12', '1 to 360'],
      correctIndex: 0,
      explanation: 'KP Horary uses numbers 1 to 249 corresponding to the sub-divisions of the zodiac.',
      topic: 'KP Horary'
    },
    {
      id: 5,
      question: 'Which system of house division (cusp calculation) does KP Astrology use?',
      options: ['Placidus System', 'Equal House System', 'Shripati System', 'Vehlow System'],
      correctIndex: 0,
      explanation: 'Prof. K.S. Krishnamurti adopted the Placidus (Semi-Arc) system of house division.',
      topic: 'KP House Cusps'
    }
  ],
  'Vastu Shastra': [
    {
      id: 1,
      question: 'In Vastu Purusha Mandala, which direction represents the Ishanya (Water element & supreme spirituality)?',
      options: ['North-East (NE)', 'South-West (SW)', 'South-East (SE)', 'North-West (NW)'],
      correctIndex: 0,
      explanation: 'Ishanya (North-East) is the divine corner ruled by Lord Shiva and Jupiter, ideal for meditation and prayer.',
      topic: 'Vastu Directions'
    },
    {
      id: 2,
      question: 'Which direction is ruled by Agni (Fire Element), making it ideal for the kitchen?',
      options: ['South-East (SE)', 'North-West (NW)', 'North-East (NE)', 'South-West (SW)'],
      correctIndex: 0,
      explanation: 'Agneya (South-East) is the zone of Fire, ruled by Venus/Agni, perfect for food preparation.',
      topic: 'Vastu Elements'
    },
    {
      id: 3,
      question: 'Where should the master bedroom and highest/heaviest construction ideally be located?',
      options: ['South-West (Nairutya)', 'North-East (Ishanya)', 'North (Kuber)', 'East (Indra)'],
      correctIndex: 0,
      explanation: 'Nairutya (South-West) represents the Earth element, stability, and leadership.',
      topic: 'Vastu Zoning'
    }
  ]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      specialisation = 'Vedic Jyotish',
      count = 5,
      isAiDynamic = true,
      difficulty = 'Advanced'
    } = body;

    const targetCount = Math.min(Math.max(Number(count) || 5, 3), 10);

    // If AI Dynamic Mode is ON, generate fresh questions via GPT-4o
    if (isAiDynamic) {
      try {
        const openai = getOpenAIClient();
        const prompt = `Generate exactly ${targetCount} high-quality, rigorous multiple-choice questions for technical assessment of a professional astrologer specializing in "${specialisation}".
Difficulty level: ${difficulty}.
Topics should cover: Core principles, chart calculations, yogas, dasha interpretation, remedies, and professional ethics.

Return JSON in this EXACT schema:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct according to classical texts.",
      "topic": "Topic Name"
    }
  ]
}`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an expert Vedic Astrology Board Examiner. Output valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        });

        const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          const formattedQuestions: GeneratedQuestion[] = parsed.questions.slice(0, targetCount).map((q: any, i: number) => ({
            id: i + 1,
            question: q.question,
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: q.explanation || 'Verified astrological principle.',
            topic: q.topic || specialisation,
          }));

          return NextResponse.json({
            success: true,
            mode: 'ai_dynamic',
            count: formattedQuestions.length,
            questions: formattedQuestions,
            generatedAt: new Date().toISOString()
          });
        }
      } catch (aiErr) {
        console.warn('AI question generation fallback triggered:', aiErr);
      }
    }

    // Fallback or Curated Mode
    const pool = FALLBACK_QUESTION_POOL[specialisation] || FALLBACK_QUESTION_POOL['Vedic Jyotish'];
    // Shuffle and pick targetCount
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = (shuffled.length >= targetCount ? shuffled : pool).slice(0, targetCount).map((q, idx) => ({
      ...q,
      id: idx + 1
    }));

    return NextResponse.json({
      success: true,
      mode: isAiDynamic ? 'ai_fallback_random' : 'curated_standard',
      count: selected.length,
      questions: selected,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error generating assignment questions:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate questions'
    }, { status: 500 });
  }
}
