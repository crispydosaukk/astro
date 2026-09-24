import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

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
  ],
  'Vedic Astrology': [
    {
      id: 1,
      question: 'In Vedic Astrology, which house represents Dharma, higher wisdom, fortunes (Bhagya), and Guru?',
      options: ['5th House', '9th House', '10th House', '1st House'],
      correctIndex: 1,
      explanation: 'The 9th house is the prime Dharma and Bhagya Bhava representing divine fortunes.',
      topic: 'Houses & Bhavas'
    },
    {
      id: 2,
      question: 'Which planetary combination forms a classic "Gajakesari Yoga"?',
      options: ['Jupiter and Moon in Kendra from each other', 'Sun and Mercury conjunction', 'Saturn and Rahu conjunction', 'Mars in 7th house'],
      correctIndex: 0,
      explanation: 'Gajakesari Yoga is formed when Jupiter is in a Kendra (1, 4, 7, 10) from the Moon.',
      topic: 'Classical Yogas'
    }
  ],
  'Numerology': [
    {
      id: 1,
      question: 'In Chaldean Numerology, which compound number is considered the "Star of the Magi" associated with good fortune and divine protection?',
      options: ['Compound Number 23', 'Compound Number 16', 'Compound Number 28', 'Compound Number 13'],
      correctIndex: 0,
      explanation: 'Number 23 is traditionally known as the Royal Star of the Lion / Star of the Magi, signifying success.',
      topic: 'Chaldean Compound Numbers'
    },
    {
      id: 2,
      question: 'How is the "Life Path" (Destiny) Number calculated?',
      options: ['Sum of all digits of the full date of birth reduced to a single digit or master number', 'Only day of birth', 'Only birth month and year', 'First letter of the name'],
      correctIndex: 0,
      explanation: 'Life Path number is the total sum of DD + MM + YYYY reduced to single digit or master number (11, 22, 33).',
      topic: 'Destiny Numbers'
    }
  ],
  'Tarot': [
    {
      id: 1,
      question: 'In standard 78-card Tarot, which card in the Major Arcana symbolizes new beginnings, innocence, and infinite potential (numbered 0)?',
      options: ['The Fool', 'The Magician', 'The High Priestess', 'The World'],
      correctIndex: 0,
      explanation: 'The Fool card holds number 0 and represents the start of the spiritual pilgrimage through the Major Arcana.',
      topic: 'Major Arcana'
    },
    {
      id: 2,
      question: 'Which suit of the Minor Arcana corresponds to the element of Water, emotions, intuition, and relationships?',
      options: ['Cups', 'Wands', 'Swords', 'Pentacles'],
      correctIndex: 0,
      explanation: 'The Suit of Cups represents the Water element, feelings, subconscious wisdom, and relationships.',
      topic: 'Minor Arcana Elements'
    }
  ],
  'Palmistry': [
    {
      id: 1,
      question: 'In Cheiromancy (Palmistry), which mount is located directly beneath the index finger, representing ambition, authority, and leadership?',
      options: ['Mount of Jupiter (Guru Parvat)', 'Mount of Saturn', 'Mount of Apollo (Sun)', 'Mount of Venus'],
      correctIndex: 0,
      explanation: 'The Mount of Jupiter beneath the index finger governs leadership, respect, ambition, and religious wisdom.',
      topic: 'Mounts of the Hand'
    },
    {
      id: 2,
      question: 'A well-defined Simian line on the palm indicates which psychological configuration?',
      options: ['Fusion of the Head line and Heart line, channeling intellect and intense emotion into singular focus', 'Absence of Life line', 'Double Fate line', 'Multiple travel lines'],
      correctIndex: 0,
      explanation: 'The Simian crease occurs when Head and Heart lines merge into a single transverse line across the palm.',
      topic: 'Major Palm Lines'
    }
  ],
  'Lal Kitab': [
    {
      id: 1,
      question: 'In Lal Kitab principles, what is the significance of the "Khandaani Kundali" (Ancestral debt / Pitra Rina)?',
      options: ['Planetary afflictions caused by inherited ancestral karma requiring specific non-ritualistic charitable remedies', 'Standard gemstone prescription', 'Only gemstone therapy', 'Fasting on Mondays'],
      correctIndex: 0,
      explanation: 'Lal Kitab identifies 9 specific Pitra Rinas and prescribes specific collective family charity remedies.',
      topic: 'Lal Kitab Pitra Rina'
    }
  ],
  'Face Reading': [
    {
      id: 1,
      question: 'In classical Physiognomy (Samudrika Shastra / Face Reading), what does a broad, well-defined forehead (Shang Ting) primarily signify?',
      options: ['Early life fortunes, intellectual capacity, and mental discipline', 'Digestive vitality', 'Retirement phase', 'Hand dexterity'],
      correctIndex: 0,
      explanation: 'The upper third of the face (forehead) represents early youth development, mental faculties, and inherited fortune.',
      topic: 'Three Facial Zones'
    }
  ],
  'Reiki': [
    {
      id: 1,
      question: 'In traditional Usui Reiki, which primary sacred symbol is used for emotional/mental healing and purification (Sei He Ki)?',
      options: ['Sei He Ki', 'Cho Ku Rei', 'Hon Sha Ze Sho Nen', 'Dai Ko Myo'],
      correctIndex: 0,
      explanation: 'Sei He Ki is the mental/emotional symbol for harmony, releasing trauma, and clearing toxic attachments.',
      topic: 'Usui Reiki Symbols'
    }
  ],
  'Angel Reading': [
    {
      id: 1,
      question: 'In Angelic consultation and intuitive channeling, which Archangel is universally associated with divine healing, mental restoration, and protection of healers?',
      options: ['Archangel Raphael', 'Archangel Michael', 'Archangel Gabriel', 'Archangel Uriel'],
      correctIndex: 0,
      explanation: 'Archangel Raphael is the angel of spiritual, emotional, and physical healing and guidance.',
      topic: 'Angelic Hierarchies'
    }
  ],
  'Prashna': [
    {
      id: 1,
      question: 'In classical Prashna Shastra (e.g. Prashna Marga), what is the importance of the "Aroodha Lagna" compared to the Udaya Lagna?',
      options: ['Reflects the psychological root and hidden subconscious motive of the querent at the moment of asking', 'Has no importance', 'Only used for weather forecasts', 'Overrides natal D1'],
      correctIndex: 0,
      explanation: 'Aroodha indicates the deep undercurrent and divine intention behind the horary query.',
      topic: 'Prashna Marga'
    }
  ],
  'Psychic Reading': [
    {
      id: 1,
      question: 'Which intuitive ability corresponds to "Claircognizance" during an extrasensory reading?',
      options: ['Clear inner knowing / direct receipt of truth without prior logical deduction', 'Clear inner vision', 'Clear inner hearing', 'Clear physical feeling'],
      correctIndex: 0,
      explanation: 'Claircognizance is the psychic sense of instant inner knowing and spiritual insight.',
      topic: 'Intuitive Faculties'
    }
  ],
  'Pendulum Dowsing': [
    {
      id: 1,
      question: 'In radiesthesia / pendulum dowsing, what is the first step before consulting the pendulum on any client query?',
      options: ['Establishing baseline directional signals (Calibrating "Yes", "No", and "Clear/Neutral")', 'Asking about lotteries', 'Spinning the pendulum manually as fast as possible', 'Holding copper wires'],
      correctIndex: 0,
      explanation: 'Calibrating the neuromuscular response for clear Yes/No polarity is mandatory before any dowsing consultation.',
      topic: 'Radiesthesia Calibration'
    }
  ]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      specialisation = 'Vedic Jyotish',
      count = 15,
      isAiDynamic = true,
      difficulty = 'Advanced',
      language = 'en'
    } = body;

    const targetCount = Math.min(Math.max(Number(count) || 15, 1), 50);
    const langStr = String(language || 'en').toLowerCase();
    const isHindi = langStr === 'hi' || langStr === 'hindi';
    const isTelugu = langStr === 'te' || langStr === 'telugu';
    const isTamil = langStr === 'ta' || langStr === 'tamil';
    const isKannada = langStr === 'kn' || langStr === 'kannada';

    // 1. Fetch Assessment Configuration from Firestore
    let dbCustomQuestions: any[] = [];
    let dbUseCustom = true;
    let dbQuestionCount = 15;

    try {
      if (db) {
        const docRef = doc(db, 'settings', 'assessment_config');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const cfg = snap.data();
          if (cfg.useCustomQuestions !== undefined) dbUseCustom = Boolean(cfg.useCustomQuestions);
          if (Array.isArray(cfg.customQuestions) && cfg.customQuestions.length > 0) {
            dbCustomQuestions = cfg.customQuestions;
          }
          if (cfg.questionCount) dbQuestionCount = Number(cfg.questionCount);
        }
      }
    } catch (dbErr) {
      console.warn('Firestore load failed in generate-assignment-questions:', dbErr);
    }

    // Determine whether to use Custom Bank or AI Auto-generation
    // If request body explicitly supplies isAiDynamic, respect it; otherwise default to dbUseCustom
    const shouldUseAi = isAiDynamic !== undefined ? Boolean(isAiDynamic) : !dbUseCustom;

    // IF CUSTOM QUESTIONS MODE IS SELECTED
    if (!shouldUseAi) {
      const rawPool = dbCustomQuestions.length > 0 ? dbCustomQuestions : (FALLBACK_QUESTION_POOL[specialisation] || FALLBACK_QUESTION_POOL['Vedic Jyotish']);
      const activePool = rawPool.filter((q: any) => q.enabled !== false && q.isActive !== false);
      const sourcePool = activePool.length > 0 ? activePool : rawPool;
      const formatted = sourcePool.slice(0, targetCount).map((q: any, idx: number) => {
        let question = q.question;
        let options = q.options;
        let explanation = q.explanation;
        let topic = q.topic;

        if (isKannada) {
          if (q.questionKn) question = q.questionKn;
          if (Array.isArray(q.optionsKn) && q.optionsKn.length === q.options?.length) options = q.optionsKn;
          if (q.explanationKn) explanation = q.explanationKn;
          if (q.topicKn) topic = q.topicKn;
        } else if (isTelugu) {
          if (q.questionTe) question = q.questionTe;
          if (Array.isArray(q.optionsTe) && q.optionsTe.length === q.options?.length) options = q.optionsTe;
          if (q.explanationTe) explanation = q.explanationTe;
          if (q.topicTe) topic = q.topicTe;
        } else if (isTamil) {
          if (q.questionTa) question = q.questionTa;
          if (Array.isArray(q.optionsTa) && q.optionsTa.length === q.options?.length) options = q.optionsTa;
          if (q.explanationTa) explanation = q.explanationTa;
          if (q.topicTa) topic = q.topicTa;
        } else if (isHindi) {
          if (q.questionHi) question = q.questionHi;
          if (Array.isArray(q.optionsHi) && q.optionsHi.length === q.options?.length) options = q.optionsHi;
          if (q.explanationHi) explanation = q.explanationHi;
          if (q.topicHi) topic = q.topicHi;
        }

        return {
          id: idx + 1,
          question,
          options,
          correctIndex: q.correctIndex ?? 0,
          explanation: explanation || 'Classical Shastra verification.',
          topic: topic || specialisation
        };
      });

      return NextResponse.json({
        success: true,
        mode: 'custom_bank',
        count: formatted.length,
        questions: formatted,
        generatedAt: new Date().toISOString()
      });
    }

    // IF AI DYNAMIC MODE IS ON: Generate fresh questions via GPT-4o
    if (shouldUseAi) {
      try {
        const openai = getOpenAIClient();
        let langDirective = 'Language: English.';
        if (isHindi) {
          langDirective = 'CRITICAL REQUIREMENT: Generate all questions, options, and explanations in fluent, formal Hindi (हिन्दी) using traditional Vedic Jyotish terminology (e.g. भाव, लग्न, केंद्र, त्रिकोण, दशा, गोचर, उपाय, नवांश).';
        } else if (isTelugu) {
          langDirective = 'CRITICAL REQUIREMENT: Generate all questions, options, and explanations in fluent, authentic Telugu (తెలుగు) using traditional Vedic Jyotish terminology (e.g. భావం, లగ్నం, కేంద్రం, త్రికోణం, వింశోత్తరి దశ, గోచారం, నవాంశ, పరిహారాలు, రాశి).';
        } else if (isTamil) {
          langDirective = 'CRITICAL REQUIREMENT: Generate all questions, options, and explanations in fluent, authentic Tamil (தமிழ்) using traditional Vedic Jyotish terminology (e.g. பாவம், லக்னம், கேந்திரம், திரிகோணம், விம்சோத்தரி தசா, கோச்சாரம், நவாம்சம், பரிகாரங்கள், ராசி).';
        } else if (isKannada) {
          langDirective = 'CRITICAL REQUIREMENT: Generate all questions, options, and explanations in fluent, authentic Kannada (ಕನ್ನಡ) using traditional Vedic Jyotish terminology (e.g. ಭಾವ, ಲಗ್ನ, ಕೇಂದ್ರ, ತ್ರಿಕೋಣ, ವಿಂಶೋತ್ತರಿ ದಶಾ, ಗೋಚಾರ, ನವಾಂಶ, ಪರಿಹಾರಗಳು, ರಾಶಿ).';
        }

        const prompt = `Generate exactly ${targetCount} high-quality, rigorous multiple-choice questions for technical assessment of a professional astrologer specializing in "${specialisation}".
Difficulty level: ${difficulty}.
${langDirective}
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
