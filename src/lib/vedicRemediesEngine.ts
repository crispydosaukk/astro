/**
 * AstroParihar Unified Vedic Remedies Engine
 * 
 * Central truth for all Vedic Upayas (Homam, Mantra, Gemstone, Yantra, Rudraksha)
 * across AstroParihar. Ensures 100% parity between:
 * 1. Remedies Portal & Service Pages (/remedies/*)
 * 2. Generated PDF & On-Screen Astrological Reports (/my-reports)
 * 3. Acharya Parihar AI Chat (/api/ai-chat)
 * 4. Real-Time AI Voice Consultations (/api/ai-consultation/voice-session)
 */

export interface VedicHomamDefinition {
  id: string;
  name: string;
  sanskritName: string;
  teluguName: string;
  tamilName: string;
  hindiName: string;
  purpose: string;
  day: string;
  duration: string;
  deity: string;
  ahutiMantra: string;
  mantraTransliteration: string;
  japaCount: string;
  samidha: string;
  materials: string;
  procedure: string;
  benefits: string;
  governingPlanets: string;
  category: 'wealth' | 'career' | 'health' | 'protection' | 'dosha' | 'vitality' | 'marriage';
}

export interface VedicMantraDefinition {
  id: string;
  title: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  planet?: string;
  deity: string;
  japaCount: string;
  bestTime: string;
  mala: string;
  benefits: string;
  category: 'wealth' | 'career' | 'health' | 'protection' | 'dosha' | 'marriage';
}

// ---------------------------------------------------------------------------
// 1. CANONICAL 6 HOMAMS OF ASTROPARIHAR
// ---------------------------------------------------------------------------
export const ASTROPARIHAR_HOMAMS: Record<string, VedicHomamDefinition> = {
  navagraha: {
    id: 'navagraha',
    name: 'Navagraha Homam (नवग्रह होम)',
    sanskritName: 'श्री नवग्रह शान्ति महाहोमः',
    teluguName: 'నవగ్రహ హోమం',
    tamilName: 'நவக்கிரக ஹோமம்',
    hindiName: 'नवग्रह शांति होम',
    purpose: 'Balance all 9 planetary energies, relieve transit doshas, Sade Sati & Rahu-Ketu afflictions',
    day: 'Saturday or Sunday',
    duration: '3–4 hours',
    deity: 'Navagraha Devatas (Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu, Ketu)',
    ahutiMantra: 'ॐ ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च । गुरुश्च शुक्रः शनि राहु केतवः सर्वे ग्रहाः शान्तिकरा भवन्तु स्वाहा ॥',
    mantraTransliteration: 'Om Brahma Muraris Tripurantakari Bhanuh Shashi Bhumisuto Budhashcha | Gurushcha Shukrah Shani Rahu Ketavah Sarve Graha Shantikara Bhavantu Swaha ||',
    japaCount: '108 Ahutis for each of the 9 Grahas',
    samidha: 'Arka (Sun), Palash (Moon), Khadir (Mars), Apamarga (Mercury), Ashvattha (Jupiter), Audumbara (Venus), Shami (Saturn), Durva (Rahu), Kusha (Ketu)',
    materials: 'Pure Cow Ghee, Navadhanya (9 sacred grains), 9 coloured cloths, Havan Samagri (32 sacred herbs), Camphor, Dry Coconut (Purna Ahuti)',
    procedure: '1. Ganapathi Dhyanam & Sankalpa with Gotra & Nakshatra\n2. Navagraha Mandapa Sthapana & Planetary Avahana\n3. Sacred Agni Mathana & 108 Ahutis per Graha with consecrated samidha\n4. Maha Purna Ahuti offering with coconut & pure silk cloth\n5. Navagraha Shanti Ashirvadam, Raksha Tilak & Prasada distribution',
    benefits: 'Neutralizes hostile planetary transits, dissolves ancestral pitru doshas, cures persistent domestic disharmony, and establishes energetic equilibrium in the birth chart.',
    governingPlanets: 'All 9 Celestial Grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)',
    category: 'dosha',
  },

  ganapathi: {
    id: 'ganapathi',
    name: 'Ganapathi Homam (महागणपति होम)',
    sanskritName: 'श्री महागणपति महाहोमः',
    teluguName: 'మహా గణపతి హోమం',
    tamilName: 'மகா கணபதி ஹோமம்',
    hindiName: 'महागणपति होम',
    purpose: 'Remove all obstacles, ensure success in career/business, bless new beginnings & pacify Ketu hurdles',
    day: 'Wednesday, Shukla Chaturthi, or any auspicious sunrise',
    duration: '2–3 hours',
    deity: 'Lord Maha Ganapathi (Vighnaharta)',
    ahutiMantra: 'ॐ गं गणपतये नमः स्वाहा ॥ / ॐ श्रीमद् गणपतये नमः ॥',
    mantraTransliteration: 'Om Gam Ganapataye Namaha Swaha ||',
    japaCount: '108 Ahutis with Ashta Dravya and pure Cow Ghee',
    samidha: 'Durva grass bundles, Ashta Dravya (8 sacred sweets & herbs), Modaka, Mango wood',
    materials: 'Pure Cow Ghee, Modakam, Durva grass, Ashta Dravya, Red flowers, Dry Coconut, Sugarcane pieces, Honey',
    procedure: '1. Maha Sankalpa citing career growth, business foundation, or life venture\n2. Vigneshwara Avahana & Shodashopachara worship\n3. 108 Ahutis of Ghee, Modaka, and Ashta Dravya into the sacred Agni Kund\n4. Maha Purna Ahuti with dry coconut and silk vastra\n5. Application of sacred Raksha Bhasma on the forehead',
    benefits: 'Eliminates hidden and visible stumbling blocks in career, dissolves delays in job promotions, provides mental clarity, and shields ventures from malefic Ketu influences.',
    governingPlanets: 'Ketu & Mercury (Budha)',
    category: 'career',
  },

  lakshmi_kubera: {
    id: 'lakshmi_kubera',
    name: 'Lakshmi Kubera Homam (श्री लक्ष्मी कुबेर होम)',
    sanskritName: 'श्री लक्ष्मी कुबेर महाहोमः',
    teluguName: 'లక్ష్మీ కుబేర హోమం',
    tamilName: 'லக்ஷ்மி குபேர ஹோமம்',
    hindiName: 'लक्ष्मी कुबेर होम',
    purpose: 'Attract immense wealth, clear prolonged debts, eliminate financial stagnation & bless with business abundance',
    day: 'Friday, Shukla Paksha Poornima, or Dhanteras / Diwali',
    duration: '2–3 hours',
    deity: 'Goddess Mahalakshmi & Lord Kubera (Guardian of Heavenly Wealth)',
    ahutiMantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः स्वाहा ॥ & ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये धनधान्यसमृद्धिं मे देहि दापय स्वाहा ॥',
    mantraTransliteration: 'Om Shreem Hreem Kleem Mahalakshmaye Namah Swaha || & Om Yakshaya Kuberaya Vaishravanaya Dhanadhanyadhipataye Dhanadhanyasamriddhim Me Dehi Dapaya Swaha ||',
    japaCount: '108 Ahutis with Kamal Gatta (Lotus seeds) & Bilva leaves',
    samidha: 'Bilva wood, Lotus seeds, Pure Cow Ghee, Sandalwood chips',
    materials: 'Pure Cow Ghee, Red Lotus flowers, Bilva Patra, Kamal Gatta seeds, Honey, Cardamom, Clove, Red silk cloth, Consecrated Kubera coins',
    procedure: '1. Sri Suktam & Kanakadhara Stotram recitation with Dhanakarshana Sankalpa\n2. Mahalakshmi & Kubera Avahana upon consecrated Yantra\n3. 108 Kamal Gatta & Bilva leaf Ahutis into holy Agni\n4. Suvasini Puja & Maha Purna Ahuti\n5. Distribution of energized Lakshmi Kubera Prasada and Bhasma',
    benefits: 'Clears long-standing debts, unlocks frozen business capital, attracts unexpected revenue channels, and fosters lifelong financial stability and auspicious domestic grace.',
    governingPlanets: 'Venus (Shukra) & Jupiter (Guru)',
    category: 'wealth',
  },

  mrityunjaya: {
    id: 'mrityunjaya',
    name: 'Mrityunjaya Homam (महामृत्युंजय होम)',
    sanskritName: 'श्री महामृत्युञ्जय महारुद्र होमः',
    teluguName: 'మహామృత్యుంజయ హోమం',
    tamilName: 'மகா மிருத்யுஞ்சய ஹோமம்',
    hindiName: 'महामृत्युंजय होम',
    purpose: 'Health restoration, longevity, relief from severe illness, protection from accidents & Markesh Dasha alleviation',
    day: 'Monday, Trayodashi (Pradosham), or Masa Shivaratri',
    duration: '3–4 hours',
    deity: 'Lord Shiva (Tryambakeshwara / Mrityunjaya)',
    ahutiMantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् स्वाहा ॥',
    mantraTransliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam | Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat Swaha ||',
    japaCount: '108 or 1008 Ahutis with consecrated Amrita herbs',
    samidha: 'Palash samidha, Bilva wood, Durva grass, Giloy (Amrita) twigs, Sesame seeds',
    materials: 'Pure Cow Ghee, Black Sesame seeds, Raw Cow Milk, Honey, Bilva Patra, Giloy twigs, Sacred Vibhuti, White Lotus flowers',
    procedure: '1. Rudra Trishati recitation & Ayur Vardhana Maha Sankalpa\n2. Shiva Kalasha Avahana & Panchamrita Abhishekam\n3. 108 or 1008 Maha Mrityunjaya Ahutis with Giloy and pure Ghee\n4. Ayush Vardhana Purna Ahuti\n5. Anointing forehead with sacred Mrityunjaya Vibhuti & consuming consecrated Charanamrita',
    benefits: 'Infuses biological rejuvenation, neutralizes fatal Markesh afflictions, dispels acute fears of accidents or chronic ailments, and bestows robust longevity (Dirghayush).',
    governingPlanets: 'Saturn (Shani), Mars (Mangal), & Rahu',
    category: 'health',
  },

  sudarshana: {
    id: 'sudarshana',
    name: 'Sudarshana Homam (श्री सुदर्शन होम)',
    sanskritName: 'श्री महासुदर्शन नृसिंह रक्षा होमः',
    teluguName: 'సుదర్శన హోమం',
    tamilName: 'சுதர்சன ஹோமம்',
    hindiName: 'सुदर्शन होम',
    purpose: 'Supreme divine protection from negative energies, evil eye (Drishti), jealous enemies, occult fears & Rahu/Mars adversity',
    day: 'Sunday, Wednesday, or Shukla Ekadashi',
    duration: '3–4 hours',
    deity: 'Lord Maha Sudarshana & Lord Sri Lakshmi Narasimha',
    ahutiMantra: 'ॐ क्लीं कृष्णाय गोविन्दाय गोपीजनवल्लभाय पराय परमपुरुषाय परमात्मने परकर्म मन्त्र यन्त्र तन्त्र औषध अस्त्र शस्त्राणि संहर संहर मृत्युर्मोचय मोचय ॐ नमो भगवते महासुदर्शनाय दीप्त्रे ज्वालापरीताय सर्वदिक्-क्षोभणकराय हुं फट् स्वाहा ॥',
    mantraTransliteration: 'Om Kleem Krishnaya Govindaya Gopinjanavallabhaya Paraya Parama Purushaya Paramatmane... Om Namo Bhagavate Maha Sudarshanaya Hoom Phat Swaha ||',
    japaCount: '108 Ahutis with sacred mustard and cow ghee',
    samidha: 'Khadira wood, Sandalwood chips, Cow Ghee, Yellow Mustard seeds (Sarshapa), Camphor',
    materials: 'Pure Cow Ghee, Yellow Mustard seeds, Tulsi leaves, Black Pepper, Camphor, Red Silk Cloth, Sudarshana Yantra',
    procedure: '1. Sudarshana Yantra Mandapa Puja & Raksha Sankalpa\n2. Invocation of Lord Sudarshana and Lord Lakshmi Narasimha\n3. Chanting of Sudarshana Ashtakam & 108 Ahutis of Sarshapa and Ghee\n4. Purna Ahuti with sacred coconuts into consecrated Agni\n5. Applying Sudarshana Raksha Bhasma on forehead and chest for impenetrable energetic protection',
    benefits: 'Erects an impenetrable psychic cosmic shield, annihilates enemy plots, cuts off negative astral attachments, and cleanses the living space of dark environmental vibrations.',
    governingPlanets: 'Mars (Mangal), Rahu, & Ketu',
    category: 'protection',
  },

  ayush: {
    id: 'ayush',
    name: 'Ayush Homam (आयुष्य होम)',
    sanskritName: 'श्री आयुष्य महाहोमः',
    teluguName: 'ఆయుష్య హోమం',
    tamilName: 'ஆயுஷ் ஹோமம்',
    hindiName: 'आयुष्य होम',
    purpose: 'Blessing lifelong health, vitality, disease immunity, and long life for children or elders',
    day: 'Birthday, Janma Nakshatra day, or auspicious Monday/Thursday',
    duration: '2–3 hours',
    deity: 'Ayur Devata, Sage Markandeya, & the Chiranjeevis',
    ahutiMantra: 'ॐ आयुर्देहि धनं देहि विद्यां देहि महेश्वरि । समस्तमखिलां लक्ष्मीं देहि मे परमेश्वरि स्वाहा ॥',
    mantraTransliteration: 'Om Ayur Dehi Dhanam Dehi Vidyam Dehi Maheshwari | Samastamakhilam Lakshmim Dehi Me Parameshwari Swaha ||',
    japaCount: '108 Ahutis of sacred Charu cooked in milk and cow ghee',
    samidha: 'Audumbara wood, Cow Ghee, Rice Charu cooked in fresh milk, Sweet Payasam',
    materials: 'Pure Ghee, Milk Charu, Payasam, White flowers, Sandalwood paste, Turmeric, Holy Akshata',
    procedure: '1. Bodhayana Ayushya Sankalpa on Janma Nakshatra\n2. Avahana of the 8 Chiranjeevis (Markandeya, Hanuman, Vyasa, etc.)\n3. 108 Ahutis of Charu, Payasam, and pure Ghee\n4. Ayur Suktam chanting & Purna Ahuti\n5. Blessings with consecrated Akshata and holy water',
    benefits: 'Fortifies biological immunity, protects young infants and seniors from recurrent illnesses, and shields the physical body from planetary weakness.',
    governingPlanets: 'Sun (Surya) & Moon (Chandra)',
    category: 'vitality',
  },
};

// ---------------------------------------------------------------------------
// 2. CANONICAL MANTRAS OF ASTROPARIHAR
// ---------------------------------------------------------------------------
export const ASTROPARIHAR_MANTRAS: Record<string, VedicMantraDefinition> = {
  // Planetary Navagraha Beej Mantras
  sun: {
    id: 'sun',
    title: 'Surya Beej Mantra (सूर्य बीज मन्त्र)',
    sanskrit: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ॥',
    transliteration: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
    meaning: 'I bow to the radiant Lord Surya, the celestial soul of the universe, source of vitality and illumination.',
    planet: 'Sun (Surya)',
    deity: 'Surya Bhagavan',
    japaCount: '108 times daily',
    bestTime: 'Sunrise (Brahma Muhurta)',
    mala: 'Red Sandalwood (Rakta Chandan) or Rudraksha Mala',
    benefits: 'Amplifies willpower, leadership, government recognition, vitality, and eyesight resilience.',
    category: 'career',
  },
  moon: {
    id: 'moon',
    title: 'Chandra Beej Mantra (चन्द्र बीज मन्त्र)',
    sanskrit: 'ॐ श्रां श्रीं श्रौं सः चन्द्राय नमः ॥',
    transliteration: 'Om Shraam Shreem Shraum Sah Chandraya Namah',
    meaning: 'I surrender to Lord Chandra, ruler of mind, emotional calmness, and divine tranquility.',
    planet: 'Moon (Chandra)',
    deity: 'Chandra Deva',
    japaCount: '108 times daily',
    bestTime: 'Monday evening or night',
    mala: 'Sphatik (Crystal) or Pearl (Moti) Mala',
    benefits: 'Calms anxiety, stabilizes mental fluctuations, restores sound sleep, and strengthens intuition.',
    category: 'health',
  },
  mars: {
    id: 'mars',
    title: 'Mangal Beej Mantra (मङ्गल बीज मन्त्र)',
    sanskrit: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥',
    transliteration: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
    meaning: 'Salutations to the brave and fiery Lord Mars, bestower of courage, vitality, and land prosperity.',
    planet: 'Mars (Mangal)',
    deity: 'Mangala Deva / Lord Kartikeya',
    japaCount: '108 times daily',
    bestTime: 'Tuesday sunrise',
    mala: 'Red Coral (Moonga) or Rudraksha Mala',
    benefits: 'Overcomes blood disorders, Manglik dosha friction, indecisiveness, and property conflicts.',
    category: 'dosha',
  },
  mercury: {
    id: 'mercury',
    title: 'Budha Beej Mantra (बुध बीज मन्त्र)',
    sanskrit: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥',
    transliteration: 'Om Braam Breem Braum Sah Budhaya Namah',
    meaning: 'Salutations to Lord Budha, the celestial embodiment of intellect, speech, analysis, and commerce.',
    planet: 'Mercury (Budha)',
    deity: 'Budha Deva / Lord Vishnu',
    japaCount: '108 times daily',
    bestTime: 'Wednesday morning',
    mala: 'Tulsi or Green Jade Mala',
    benefits: 'Enhances business acumen, memory retention, public speaking, and intellectual success.',
    category: 'career',
  },
  jupiter: {
    id: 'jupiter',
    title: 'Guru Beej Mantra (बृहस्पति बीज मन्त्र)',
    sanskrit: 'ॐ ग्रां ग्रीं ग्रौं सः गुरुवे नमः ॥',
    transliteration: 'Om Graam Greem Graum Sah Guruve Namah',
    meaning: 'I offer reverence to Brihaspati, guru of the Gods, lord of wisdom, dharma, and righteous wealth.',
    planet: 'Jupiter (Guru)',
    deity: 'Lord Brihaspati / Lord Dakshinamurthy',
    japaCount: '108 times daily',
    bestTime: 'Thursday morning',
    mala: 'Haldi (Turmeric) or Five-Mukhi Rudraksha Mala',
    benefits: 'Expands spiritual wisdom, blessings of progeny, academic mastery, and grand financial growth.',
    category: 'wealth',
  },
  venus: {
    id: 'venus',
    title: 'Shukra Beej Mantra (शुक्र बीज मन्त्र)',
    sanskrit: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ॥',
    transliteration: 'Om Draam Dreem Draum Sah Shukraya Namah',
    meaning: 'Salutations to Lord Shukra, ruler of aesthetic elegance, luxury, romantic fulfillment, and creative genius.',
    planet: 'Venus (Shukra)',
    deity: 'Shukracharya / Goddess Mahalakshmi',
    japaCount: '108 times daily',
    bestTime: 'Friday morning',
    mala: 'Sphatik (Quartz Crystal) or White Sandalwood Mala',
    benefits: 'Attracts harmonious marital relations, luxurious comfort, financial liquidity, and artistic allure.',
    category: 'marriage',
  },
  saturn: {
    id: 'saturn',
    title: 'Shani Beej Mantra (शनि बीज मन्त्र)',
    sanskrit: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ॥',
    transliteration: 'Om Praam Preem Praum Sah Shanaischaraya Namah',
    meaning: 'Reverence to Lord Shanaischaraya, the grand karmic judge who grants discipline, patience, and lasting victory.',
    planet: 'Saturn (Shani)',
    deity: 'Lord Shani Dev',
    japaCount: '108 times daily',
    bestTime: 'Saturday evening after sunset',
    mala: 'Rudraksha or Blue Hakik Mala',
    benefits: 'Alleviates Sade Sati, Kantaka Shani, and Dhaiya struggles; builds patience, integrity, and career endurance.',
    category: 'dosha',
  },
  rahu: {
    id: 'rahu',
    title: 'Rahu Beej Mantra (राहु बीज मन्त्र)',
    sanskrit: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ॥',
    transliteration: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
    meaning: 'I bow to Rahu, the mystical cosmic shadow planet, harmonizing worldly ambitions and astral illusions.',
    planet: 'Rahu',
    deity: 'Rahu Graha / Goddess Durga',
    japaCount: '108 times daily',
    bestTime: 'Saturday night or post-sunset',
    mala: 'Rudraksha or Black Hakik Mala',
    benefits: 'Shields against sudden upheavals, confusion, addictions, phantom fears, and foreign relocation hurdles.',
    category: 'dosha',
  },
  ketu: {
    id: 'ketu',
    title: 'Ketu Beej Mantra (केतु बीज मन्त्र)',
    sanskrit: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः ॥',
    transliteration: 'Om Sraam Sreem Sraum Sah Ketave Namah',
    meaning: 'Reverence to Ketu, the spiritual liberator who bestows Moksha, occult insight, and karmic detachment.',
    planet: 'Ketu',
    deity: 'Ketu Graha / Lord Ganesha',
    japaCount: '108 times daily',
    bestTime: 'Tuesday early morning',
    mala: 'Rudraksha or Cat\'s Eye Stone Mala',
    benefits: 'Dissolves hidden emotional anguish, mysterious medical issues, and deep spiritual blockages.',
    category: 'dosha',
  },

  // Universal Upayas & Stotras
  mahalakshmi: {
    id: 'mahalakshmi',
    title: 'Maha Lakshmi Beej Mantra (महालक्ष्मी बीज मन्त्र)',
    sanskrit: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ॥',
    transliteration: 'Om Shreem Hreem Kleem Mahalakshmaye Namah',
    meaning: 'Salutations to the Supreme Goddess Mahalakshmi, the source of prosperity, cosmic beauty, and auspicious abundance.',
    deity: 'Goddess Mahalakshmi',
    japaCount: '108 times daily',
    bestTime: 'Friday morning or evening',
    mala: 'Kamal Gatta (Lotus seed) or Sphatik Mala',
    benefits: 'Dissolves debt, opens multiple wealth streams, stabilizes business cash flow, and creates domestic harmony.',
    category: 'wealth',
  },
  ganesha: {
    id: 'ganesha',
    title: 'Ganesha Moola Mantra (श्री गणेश मूल मन्त्र)',
    sanskrit: 'ॐ गं गणपतये नमः ॥',
    transliteration: 'Om Gam Ganapataye Namaha',
    meaning: 'I surrender to Lord Ganesha, the primordial remover of all obstacles and giver of auspicious beginnings.',
    deity: 'Lord Ganesha',
    japaCount: '108 times daily',
    bestTime: 'Daily morning at sunrise',
    mala: 'Rudraksha or Red Sandalwood Mala',
    benefits: 'Clears obstacles in career, removes stagnation in examinations or projects, and ensures success.',
    category: 'career',
  },
  mrityunjaya_mantra: {
    id: 'mrityunjaya_mantra',
    title: 'Maha Mrityunjaya Mantra (महामृत्युंजय मन्त्र)',
    sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam | Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    meaning: 'We worship the Three-Eyed Lord Shiva, who is fragrant and nourishes all beings. May He liberate us from death and affliction, just as a ripe cucumber effortlessly detaches from its vine.',
    deity: 'Lord Shiva',
    japaCount: '108 times daily',
    bestTime: 'Sunrise or Brahma Muhurta',
    mala: 'Rudraksha Mala (108 beads)',
    benefits: 'Supreme shield for health, cellular recovery, psychological resilience, and overcoming Markesh dosha.',
    category: 'health',
  },
  sudarshana_mantra: {
    id: 'sudarshana_mantra',
    title: 'Sudarshana Maha Mantra (श्री सुदर्शन महामन्त्र)',
    sanskrit: 'ॐ नमो भगवते महासुदर्शनाय दीप्त्रे ज्वालापरीताय सर्वदिक्-क्षोभणकराय हुं फट् नमः ॥',
    transliteration: 'Om Namo Bhagavate Maha Sudarshanaya Deeptre Jwalam-Pareetaya Sarvadik-Kshobhanakaraya Hoom Phat Namaha',
    meaning: 'Salutations to the glorious Lord Maha Sudarshana, blazing with cosmic fire, protecting every direction from evil.',
    deity: 'Lord Maha Sudarshana',
    japaCount: '108 times daily',
    bestTime: 'Sunset or early morning facing East',
    mala: 'Tulsi or Rudraksha Mala',
    benefits: 'Neutralizes evil eye (Drishti), destroys jealousy, cleanses negative auric currents, and brings fearless peace.',
    category: 'protection',
  },
  swayamvara_parvathi: {
    id: 'swayamvara_parvathi',
    title: 'Swayamvara Parvathi Mantra (स्वयंवर पार्वती मन्त्र)',
    sanskrit: 'ॐ ह्रीं योगिनि योगिनि योगेश्वरि योग भयङ्करि सकल स्थावर जङ्गस्य मुख हृदयं मम वशं आकर्षय आकर्षय नमः ॥',
    transliteration: 'Om Hreem Yogini Yogini Yogeshwari Yoga Bhayankari Sakala Sthavara Jangamasya Mukha Hridayam Mama Vasham Akarshaya Akarshaya Namaha',
    meaning: 'Sacred prayer to Goddess Parvathi to bless with marital harmony, overcome relationship delays, and unite ideal souls.',
    deity: 'Goddess Parvathi',
    japaCount: '108 times daily for 48 days',
    bestTime: 'Friday morning after bath',
    mala: 'Sphatik or Rudraksha Mala',
    benefits: 'Removes delays in marriage, reconciles relationship differences, and establishes mutual affection.',
    category: 'marriage',
  },
};

// ---------------------------------------------------------------------------
// 3. DETERMINISTIC VEDIC REMEDY RESOLVER
// ---------------------------------------------------------------------------
export interface RemedyResolutionInput {
  concern?: string;
  domain?: string;
  planet?: string;
  lagna?: string;
  moonRashi?: string;
  dasha?: string;
  name?: string;
}

export interface ResolvedVedicRemedy {
  primaryHomam: VedicHomamDefinition;
  secondaryHomam: VedicHomamDefinition;
  primaryMantra: VedicMantraDefinition;
  secondaryMantra: VedicMantraDefinition;
  gemstone: {
    name: string;
    caratWeight: string;
    metal: string;
    finger: string;
    auspiciousDay: string;
    mantra: string;
  };
  yantra: {
    name: string;
    deity: string;
    planet: string;
    material: string;
    placement: string;
    consecrationMantra: string;
    benefits: string;
  };
}

export function resolveVedicRemedies(input: RemedyResolutionInput = {}): ResolvedVedicRemedy {
  const text = `${input.concern || ''} ${input.domain || ''} ${input.planet || ''} ${input.dasha || ''}`.toLowerCase();

  // 1. Wealth, Debt, Business Stagnation, Money
  if (
    text.includes('wealth') ||
    text.includes('money') ||
    text.includes('finance') ||
    text.includes('debt') ||
    text.includes('loan') ||
    text.includes('cash') ||
    text.includes('income') ||
    text.includes('business') ||
    text.includes('ధన') ||
    text.includes('డబ్బు') ||
    text.includes('ఆర్థిక') ||
    text.includes('பணம்') ||
    text.includes('செல்வம்') ||
    text.includes('धन') ||
    text.includes('कर्ज')
  ) {
    return {
      primaryHomam: ASTROPARIHAR_HOMAMS.lakshmi_kubera,
      secondaryHomam: ASTROPARIHAR_HOMAMS.navagraha,
      primaryMantra: ASTROPARIHAR_MANTRAS.mahalakshmi,
      secondaryMantra: ASTROPARIHAR_MANTRAS.jupiter,
      gemstone: {
        name: 'Natural Yellow Sapphire (Pukhraj) or Certified Emerald (Panna)',
        caratWeight: '3.5 to 5.25 Carats (Ratti)',
        metal: '22k Gold or Panchadhatu',
        finger: 'Index finger (Tarjani) or Little finger (Kanishtha) of right hand',
        auspiciousDay: 'Thursday or Wednesday morning during Shukla Paksha',
        mantra: 'Om Brim Brihaspataye Namah (108 times)',
      },
      yantra: {
        name: 'श्री यन्त्र (Shree Yantra) & कुबेर यन्त्र (Kubera Yantra)',
        deity: 'Goddess Mahalakshmi & Lord Kubera',
        planet: 'Venus (Shukra) & Jupiter (Guru)',
        material: 'Heavy Consecrated Copper Plate (Tamra Patra) / Ashtadhatu',
        placement: 'North-East (Ishanya Kona) or North wall at eye level on sacred altar',
        consecrationMantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः ॥',
        benefits: 'Dissolves monetary blockages, clears chronic loans, and magnetizes steady wealth opportunities.',
      },
    };
  }

  // 2. Marriage, Love, Relationship Harmony, Venus Blessings
  if (
    text.includes('marriage') ||
    text.includes('love') ||
    text.includes('relationship') ||
    text.includes('partner') ||
    text.includes('spouse') ||
    text.includes('vivah') ||
    text.includes('వివాహ') ||
    text.includes('పెళ్లి') ||
    text.includes('ప్రేమ') ||
    text.includes('திருமணம்') ||
    text.includes('कादंबरी') ||
    text.includes('विवाह') ||
    text.includes('शादी')
  ) {
    return {
      primaryHomam: ASTROPARIHAR_HOMAMS.lakshmi_kubera,
      secondaryHomam: ASTROPARIHAR_HOMAMS.navagraha,
      primaryMantra: ASTROPARIHAR_MANTRAS.swayamvara_parvathi,
      secondaryMantra: ASTROPARIHAR_MANTRAS.venus,
      gemstone: {
        name: 'Natural Diamond, White Zircon, or Yellow Sapphire',
        caratWeight: '1.5 to 3.5 Carats',
        metal: 'Silver, Platinum, or 18k White Gold',
        finger: 'Ring finger or Index finger of right hand',
        auspiciousDay: 'Friday morning during Shukla Paksha',
        mantra: 'Om Draam Dreem Draum Sah Shukraya Namah (108 times)',
      },
      yantra: {
        name: 'Shukra Yantra (शुक्र यन्त्र) & Radha Krishna Yantra',
        deity: 'Lord Shukra & Radha-Krishna / Goddess Parvathi',
        planet: 'Venus (Shukra) & Jupiter (Guru)',
        material: 'Consecrated Silver / Copper Plate',
        placement: 'Master bedroom South-East corner or North-East altar',
        consecrationMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ॥',
        benefits: 'Harmonizes marital energy, removes relationship misunderstandings, and accelerates marriage proposals.',
      },
    };
  }

  // 3. Health, Chronic Illness, Longevity, Markesh, Accident Fear
  if (
    text.includes('health') ||
    text.includes('illness') ||
    text.includes('disease') ||
    text.includes('recovery') ||
    text.includes('life') ||
    text.includes('longevity') ||
    text.includes('hospital') ||
    text.includes('doctor') ||
    text.includes('ఆరోగ్య') ||
    text.includes('దీర్ఘాయుష్షు') ||
    text.includes('రోగ') ||
    text.includes('உடல்நலம்') ||
    text.includes('ஆரோக்கியம்') ||
    text.includes('स्वास्थ्य') ||
    text.includes('आयु') ||
    text.includes('रोग')
  ) {
    return {
      primaryHomam: ASTROPARIHAR_HOMAMS.mrityunjaya,
      secondaryHomam: ASTROPARIHAR_HOMAMS.ayush,
      primaryMantra: ASTROPARIHAR_MANTRAS.mrityunjaya_mantra,
      secondaryMantra: ASTROPARIHAR_MANTRAS.moon,
      gemstone: {
        name: 'Natural Red Coral (Moonga) or Natural Pearl (Moti)',
        caratWeight: '4.5 to 6.25 Carats',
        metal: 'Silver or Copper',
        finger: 'Ring finger (for Moonga) or Little finger (for Pearl) of right hand',
        auspiciousDay: 'Tuesday sunrise (for Moonga) or Monday evening (for Pearl)',
        mantra: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam (108 times)',
      },
      yantra: {
        name: 'Maha Mrityunjaya Yantra (महामृत्युंजय यन्त्र)',
        deity: 'Lord Shiva (Tryambakeshwara)',
        planet: 'Saturn, Rahu, & Mars',
        material: 'Consecrated Heavy Copper Plate',
        placement: 'North-East corner of pooja altar or beside bedhead',
        consecrationMantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥',
        benefits: 'Infuses biological rejuvenation, neutralizes fatal Markesh afflictions, dispels acute health fears, and bestows longevity.',
      },
    };
  }

  // 4. Protection, Evil Eye, Black Magic Fear, Jealousy, Enemy Problems, Rahu
  if (
    text.includes('protection') ||
    text.includes('evil') ||
    text.includes('eye') ||
    text.includes('drishti') ||
    text.includes('enemy') ||
    text.includes('fear') ||
    text.includes('negative') ||
    text.includes('black magic') ||
    text.includes('రక్షణ') ||
    text.includes('దిష్టి') ||
    text.includes('శత్రు') ||
    text.includes('భయం') ||
    text.includes('பகை') ||
    text.includes('கண் திருஷ்டி') ||
    text.includes('सुरक्षा') ||
    text.includes('नजर') ||
    text.includes('शत्रु') ||
    text.includes('भय')
  ) {
    return {
      primaryHomam: ASTROPARIHAR_HOMAMS.sudarshana,
      secondaryHomam: ASTROPARIHAR_HOMAMS.navagraha,
      primaryMantra: ASTROPARIHAR_MANTRAS.sudarshana_mantra,
      secondaryMantra: ASTROPARIHAR_MANTRAS.rahu,
      gemstone: {
        name: 'Natural Hessonite (Gomed) or Red Coral (Moonga)',
        caratWeight: '4.0 to 6.0 Carats',
        metal: 'Ashtadhatu or Silver',
        finger: 'Middle finger of right hand (for Gomed) or Ring finger (for Moonga)',
        auspiciousDay: 'Saturday night (for Gomed) or Tuesday sunrise (for Moonga)',
        mantra: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah (108 times)',
      },
      yantra: {
        name: 'Sudarshana Yantra (श्री सुदर्शन यन्त्र)',
        deity: 'Lord Maha Sudarshana & Lord Narasimha',
        planet: 'Mars & Rahu',
        material: 'Consecrated Copper / Brass Plate',
        placement: 'Above main entrance doorway or on North-East altar facing West',
        consecrationMantra: 'ॐ नमो भगवते महासुदर्शनाय दीप्त्रे ज्वालापरीताय हुं फट् ॥',
        benefits: 'Erects an impenetrable psychic cosmic shield, annihilates enemy plots, cuts off negative astral attachments, and cleanses the home.',
      },
    };
  }

  // 5. Obstacles, Career Hurdles, Job Search, New Beginnings, Ketu
  if (
    text.includes('career') ||
    text.includes('job') ||
    text.includes('obstacle') ||
    text.includes('delay') ||
    text.includes('promotion') ||
    text.includes('interview') ||
    text.includes('exam') ||
    text.includes('success') ||
    text.includes('work') ||
    text.includes('ఉద్యోగ') ||
    text.includes('అడ్డంకులు') ||
    text.includes('వేతన') ||
    text.includes('வேலை') ||
    text.includes('தடை') ||
    text.includes('नौकरी') ||
    text.includes('बाधा')
  ) {
    return {
      primaryHomam: ASTROPARIHAR_HOMAMS.ganapathi,
      secondaryHomam: ASTROPARIHAR_HOMAMS.navagraha,
      primaryMantra: ASTROPARIHAR_MANTRAS.ganesha,
      secondaryMantra: ASTROPARIHAR_MANTRAS.sun,
      gemstone: {
        name: 'Natural Ruby (Manikya) or Red Coral (Moonga)',
        caratWeight: '3.25 to 5.0 Carats (Ratti)',
        metal: 'Copper, 22k Gold, or Silver',
        finger: 'Ring Finger (Anamika) of right hand',
        auspiciousDay: 'Sunday or Tuesday sunrise during Shukla Paksha',
        mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah (108 times)',
      },
      yantra: {
        name: 'Surya Yantra (सूर्य यन्त्र) & Ganesha Yantra (श्री गणेश यन्त्र)',
        deity: 'Lord Surya Bhagavan & Lord Ganesha',
        planet: 'Sun (Surya) & Mercury/Ketu',
        material: 'Consecrated Copper / Brass Plate',
        placement: 'East Wall of living room or personal study/office facing West/North',
        consecrationMantra: 'ॐ गं गणपतये नमः ॥ & ॐ घृणि सूर्याय नमः ॥',
        benefits: 'Dissolves workplace friction, accelerates executive promotions, and imparts authority and clarity.',
      },
    };
  }

  // 6. Default: Planetary Doshas, Sade Sati, Navagraha Shanti, General Harmony
  return {
    primaryHomam: ASTROPARIHAR_HOMAMS.navagraha,
    secondaryHomam: ASTROPARIHAR_HOMAMS.ganapathi,
    primaryMantra: ASTROPARIHAR_MANTRAS.saturn,
    secondaryMantra: ASTROPARIHAR_MANTRAS.sun,
    gemstone: {
      name: 'Planetary Anukul Gemstone (Yellow Sapphire, Blue Sapphire with trial, or Ruby based on Lagna)',
      caratWeight: '3.5 to 5.25 Carats',
      metal: '22k Gold or Panchadhatu',
      finger: 'Index or Ring finger of right hand',
      auspiciousDay: 'Thursday or Saturday morning',
      mantra: 'Om Shreem Hreem Kleem Mahalakshmaye Namah (108 times)',
    },
    yantra: {
      name: 'Navagraha Yantra (नवग्रह यन्त्र)',
      deity: 'All Nine Celestial Grahas',
      planet: 'Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu',
      material: 'Consecrated Ashtadhatu / Copper Plate',
      placement: 'Pooja room altar facing East or North',
      consecrationMantra: 'ॐ ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च... ॥',
      benefits: 'Harmonizes transit clashes, balances afflicted Dasha cycles, and establishes complete cosmic peace in the horoscope.',
    },
  };
}

// ---------------------------------------------------------------------------
// 4. UNIFIED REMEDY PROMPT DIRECTIVES (FOR AI CHAT & AI VOICE)
// ---------------------------------------------------------------------------
export const ASTROPARIHAR_UNIFIED_REMEDY_DIRECTIVES = `
================================================================================
CRITICAL ASTROPARIHAR CANONICAL VEDIC REMEDY RULES (MANDATORY & ZERO-DEVIATION):
================================================================================
To maintain 100% harmony between our Remedies Portal (/remedies), generated reports (/my-reports), and your consultations, you MUST recommend ONLY from AstroParihar's official 6 Vedic Homams and sacred Mantras. NEVER recommend random external homams (such as Chandi Homam, Bagalamukhi Homam, Rudra Homam, or unlisted rituals).

1. WEALTH, DEBTS, FINANCES, BUSINESS CASH FLOW:
   - Prescribed Sacred Homam: **Lakshmi Kubera Homam (श्री लक्ष्मी कुबेर होम / లక్ష్మీ కుబేర హోమం / லக்ஷ்மி குபேர ஹோமம்)**
     * Timing: Friday or Poornima
     * Offering: Kamal Gatta (Lotus seeds), Bilva leaves, Cow Ghee
   - Prescribed Mantra: **"Om Shreem Hreem Kleem Mahalakshmaye Namah"** (108 times daily) or Kanakadhara Stotram / Sri Suktam
   - Sacred Yantra: Shree Yantra & Kubera Yantra
   - Gemstone: Yellow Sapphire (Pukhraj) or Emerald (Panna)

2. CAREER OBSTACLES, NEW BUSINESS, JOB SEARCH, DELAYS, KETU:
   - Prescribed Sacred Homam: **Ganapathi Homam (महागणपति होम / గణపతి హోమం / கணபதி ஹோமம்)**
     * Timing: Wednesday, Shukla Chaturthi, or auspicious sunrise
     * Offering: Modaka, Durva grass, Ashta Dravya, Cow Ghee
   - Prescribed Mantra: **"Om Gam Ganapataye Namaha"** (108 times daily) & Sankata Nashana Ganesha Stotram
   - Sacred Yantra: Ganesha Yantra / Surya Yantra
   - Gemstone: Ruby (Manikya) or Red Coral (Moonga)

3. HEALTH, LONGEVITY, CRITICAL RECOVERY, MARKESH / SATURN ILLNESS:
   - Prescribed Sacred Homam: **Mrityunjaya Homam (महामृत्युंजय होम / మహామృత్యుంజయ హోమం / மகா மிருத்யுஞ்சய ஹோமம்)**
     (or **Ayush Homam / ఆయుష్య హోమం / ஆயுஷ் ஹோமம்** for birthdays, child vitality, or elderly longevity)
     * Timing: Monday, Trayodashi (Pradosham), or Masa Shivaratri
     * Offering: Giloy herbs, Black Sesame, Cow Milk, Bilva Patra
   - Prescribed Mantra: **Maha Mrityunjaya Mantra** ("Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat" 108 times daily)
   - Sacred Yantra: Maha Mrityunjaya Yantra
   - Gemstone: Red Coral (Moonga) or Pearl (Moti)

4. EVIL EYE (DRISHTI), NEGATIVE ENERGY, ENEMIES, FEAR, RAHU / MARS:
   - Prescribed Sacred Homam: **Sudarshana Homam (श्री सुदर्शन होम / సుదర్శన హోమం / சுதர்சன ஹோமம்)**
     * Timing: Sunday, Wednesday, or Ekadashi
     * Offering: Yellow Mustard (Sarshapa), Tulsi, Camphor, Cow Ghee
   - Prescribed Mantra: **Sudarshana Maha Mantra** ("Om Namo Bhagavate Maha Sudarshanaya Hoom Phat") or Hanuman Chalisa
   - Sacred Yantra: Sudarshana Yantra
   - Gemstone: Hessonite (Gomed) or Red Coral (Moonga)

5. PLANETARY DOSHAS, SADE SATI, TRANSIT HARMONY, GENERAL PEACE:
   - Prescribed Sacred Homam: **Navagraha Homam (नवग्रह होम / నవగ్రహ హోమం / நவக்கிரக ஹோமம்)**
     * Timing: Saturday or Sunday
     * Offering: Navadhanya (9 sacred grains), 9 Graha Samidhas, Cow Ghee
   - Prescribed Mantra: Specific Navagraha Beej Mantra (e.g. Shani: "Om Praam Preem Praum Sah Shanaischaraya Namah", Rahu: "Om Bhraam Bhreem Bhraum Sah Rahave Namah") or Gayatri Mantra
   - Sacred Yantra: Navagraha Yantra
   - Gemstone: Anukul Gemstone (Yellow Sapphire / Blue Sapphire with trial)

6. MARRIAGE DELAYS, RELATIONSHIP HARMONY, LOVE:
   - Prescribed Sacred Homam: **Lakshmi Kubera Homam** or **Navagraha Homam** (for Shukra/Guru peace)
   - Prescribed Mantra: **Swayamvara Parvathi Mantra** ("Om Hreem Yogini Yogini Yogeshwari...") or Shukra Beej Mantra ("Om Draam Dreem Draum Sah Shukraya Namah" 108 times)
   - Sacred Yantra: Shukra Yantra & Radha Krishna Yantra

Always speak with clarity, reverence, and certainty using these exact names and mantras.
`;

// ---------------------------------------------------------------------------
// 5. 48-DAY (ONE MANDALAM) EXECUTABLE PARIHAR PROTOCOL GENERATOR
// ---------------------------------------------------------------------------
export interface RemedyProtocol48Day {
  title: string;
  totalDays: 48;
  mandalaPurpose: string;
  presidingDeity: string;
  recommendedHomam: string;
  homamAuspiciousDay: string;
  dailyMantra: string;
  dailyJapaCount: string;
  direction: 'East' | 'North';
  lampOffering: string;
  initiationDay1: {
    title: string;
    action: string;
    sankalpaText: string;
  };
  dailyDiscipline: {
    morningRitual: string;
    lifestyleGuidelines: string[];
  };
  midMandalaMilestoneDay24: {
    title: string;
    action: string;
    charityDaana: string;
  };
  culminationDay48: {
    title: string;
    action: string;
    completionRitual: string;
  };
  startDate: string;
  midDate: string;
  completionDate: string;
  astrologerCheckupCTA: string;
}

export function generate48DayRemedyProtocol(params: {
  domain?: string;
  planet?: string;
  concern?: string;
}): RemedyProtocol48Day {
  const remedies = resolveVedicRemedies({
    domain: params.domain,
    planet: params.planet,
    concern: params.concern,
  });

  const now = new Date();
  const day24 = new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000);
  const day48 = new Date(now.getTime() + 48 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Customized Daana by Domain / Planet
  let charityDaana = 'Feed green grass to cows (Gau Seva) or donate whole grains to temple kitchen.';
  const dLow = (params.domain || '').toLowerCase();
  const pLow = (params.planet || '').toLowerCase();

  if (dLow.includes('career') || pLow.includes('ketu') || pLow.includes('sun')) {
    charityDaana = 'Offer fresh bananas, jaggery sweets, or warm food to elderly sadhus/laborers at a temple.';
  } else if (dLow.includes('wealth') || dLow.includes('finance') || pLow.includes('venus') || pLow.includes('jupiter')) {
    charityDaana = 'Donate yellow lentils (Chana Dal), pure honey, or financial support to Vedic scholars or impoverished students.';
  } else if (dLow.includes('health') || pLow.includes('shani') || pLow.includes('saturn') || pLow.includes('rahu')) {
    charityDaana = 'Donate black sesame seeds, mustard oil, or sponsor medicine for needy hospital patients on Saturday.';
  } else if (dLow.includes('marriage') || pLow.includes('mars')) {
    charityDaana = 'Offer red flowers, sweet jaggery roti, or clothing to young married women or Devi temple.';
  }

  const lampOffering = pLow.includes('shani') || pLow.includes('saturn') || pLow.includes('rahu')
    ? 'Pure Sesame (Til) oil deepam facing East or North'
    : 'Pure Cow Ghee deepam facing East or North';

  return {
    title: `48-Day Sacred Mandala Parihar Protocol (${remedies.primaryHomam.name.split(' (')[0]})`,
    totalDays: 48,
    mandalaPurpose: remedies.primaryHomam.purpose,
    presidingDeity: remedies.primaryHomam.deity,
    recommendedHomam: remedies.primaryHomam.name,
    homamAuspiciousDay: remedies.primaryHomam.day,
    dailyMantra: remedies.primaryMantra.sanskrit || remedies.primaryMantra.transliteration,
    dailyJapaCount: '108 recitations daily with Rudraksha / Tulsi / Spatika Mala',
    direction: 'East',
    lampOffering,
    initiationDay1: {
      title: 'Day 1: Prathama Sankalpa & Sacred Beginning',
      action: `Awake before sunrise (Brahma Muhurtha). Take a holy bath, light the ${lampOffering}, sit facing East, and take a personal Sankalpa pledging 48 days of disciplined devotion.`,
      sankalpaText: `Mama janma-kundali dosha shamanaartham, ${remedies.primaryHomam.deity} preetyartham, 48-dina parihara sankalpam aham karishye.`,
    },
    dailyDiscipline: {
      morningRitual: `Chant "${remedies.primaryMantra.transliteration}" 108 times before the altar. Offer clean water and fresh flowers.`,
      lifestyleGuidelines: [
        'Maintain a sattvic vegetarian diet; abstain from alcohol and non-vegetarian food during the 48-day Mandala.',
        'Practice truthfulness, calm speech, and refrain from anger or heated arguments.',
        'Apply sacred kumkum / vibhuti from the altar upon your forehead every morning.',
      ],
    },
    midMandalaMilestoneDay24: {
      title: 'Day 24: Madhyama Shanti & Sacred Daana Milestone',
      action: 'Perform mid-mandala cleansing: deep clean your altar, offer sweet Prasad, and execute the prescribed charity.',
      charityDaana,
    },
    culminationDay48: {
      title: 'Day 48: Purnahuti, Homam / Coconut Offering & Completion',
      action: `Complete your final 108 mantra japa. Book or perform ${remedies.primaryHomam.name} at a consecrated temple or via AstroParihar, or offer a sacred peeled dry coconut with camphor at Lord Ganesha / Devi sanctum.`,
      completionRitual: 'Distribute sweets to 5 individuals or family members, seek elders blessings, and wear energized protective Raksha.',
    },
    startDate: formatDate(now),
    midDate: formatDate(day24),
    completionDate: formatDate(day48),
    astrologerCheckupCTA: 'Schedule a post-mandalam progress review with an AstroParihar Senior Astrologer on Day 48.',
  };
}

