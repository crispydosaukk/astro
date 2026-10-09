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
  lalKitabDualParihar?: {
    practicalUpaay: string;
    forbiddenActionVarjya: string;
    rationale: string;
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
      lalKitabDualParihar: {
        practicalUpaay: 'Feed soaked green gram (Moong) to birds every Wednesday and keep a pure solid silver square piece in your wallet.',
        forbiddenActionVarjya: 'Never accept free religious articles, brass vessels, or unearned gifts from in-laws. Do not display arrogant pride regarding cash.',
        rationale: 'Lal Kitab 1952 canon: Solid silver square balances Moon & Mercury, clearing financial blockage and ancestral debt.',
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
    text.includes('matching') ||
    text.includes('match') ||
    text.includes('milan') ||
    text.includes('gun milan') ||
    text.includes('guna milan') ||
    text.includes('ashtakoot') ||
    text.includes('compatibility') ||
    text.includes('couple') ||
    text.includes('kundali match') ||
    text.includes('kundli match') ||
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
      lalKitabDualParihar: {
        practicalUpaay: 'Feed two white cows with fresh green grass or chapatis smeared with pure cow ghee on Friday mornings.',
        forbiddenActionVarjya: 'Never humiliate or disrespect your spouse in front of third parties. Do not keep wild cacti or thorny plants inside the house.',
        rationale: 'Lal Kitab 1952 canon: White cow seva harmonizes Venus (Shukra), bestowing deep matrimonial devotion.',
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
      lalKitabDualParihar: {
        practicalUpaay: 'Pour 8 drops of pure mustard oil into running river water on 8 consecutive Saturdays; feed black dogs with milk bread.',
        forbiddenActionVarjya: 'Never consume meat or liquor inside your residential dwelling, especially after sunset. Do not sleep in dark windowless rooms.',
        rationale: 'Lal Kitab 1952 canon: Roga Nivarana upaay drains deep toxic somatic karmas.',
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
      lalKitabDualParihar: {
        practicalUpaay: 'Keep a small solid silver ball (Be-Jod Chandi ki Goli) in your wallet and float dried coriander seeds (dhaniya) in running canal.',
        forbiddenActionVarjya: 'Never accept free gifts of black blankets, electrical gadgets, or secondhand leather items from strangers.',
        rationale: 'Lal Kitab 1952 canon: Silver ball absorbs chaotic Rahu-Ketu vibrations and dispels illusionary anxiety.',
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
      lalKitabDualParihar: {
        practicalUpaay: 'Feed crows and stray dogs with bread smeared in pure mustard oil on Saturday evenings; drink a sip of sugar water before interviews.',
        forbiddenActionVarjya: 'Never mistreat domestic helpers, drivers, or sanitation workers. Do not take government bribes or deceive collaborators.',
        rationale: 'Lal Kitab 1952 canon: Saturn in 10th house pacification dissolves career delays and workplace friction.',
      },
    };
  }

  // 5.5 Ishta Devata & Divine Guardian Sadhana
  if (
    text.includes('ishta') ||
    text.includes('ista') ||
    text.includes('devata') ||
    text.includes('deity') ||
    text.includes('kuladevata') ||
    text.includes('ఇష్ట') ||
    text.includes('దైవ') ||
    text.includes('దేవుడు') ||
    text.includes('தெய்வம்') ||
    text.includes('இஷ்ட') ||
    text.includes('इष्ट') ||
    text.includes('देवता')
  ) {
    return {
      primaryHomam: ASTROPARIHAR_HOMAMS.navagraha,
      secondaryHomam: ASTROPARIHAR_HOMAMS.lakshmi_kubera,
      primaryMantra: ASTROPARIHAR_MANTRAS.mahalakshmi,
      secondaryMantra: ASTROPARIHAR_MANTRAS.mrityunjaya_mantra,
      gemstone: {
        name: 'Sattvic Spiritual Ratna (Yellow Sapphire / Natural Pearl)',
        caratWeight: '3.5 to 5.25 Carats',
        metal: '22k Gold or Pure Silver',
        finger: 'Index or Little finger of right hand',
        auspiciousDay: 'Thursday or Monday morning during Shukla Paksha',
        mantra: 'Om Namo Bhagavate Vasudevaya (108 times)',
      },
      yantra: {
        name: 'श्री यन्त्र (Shree Yantra) & Navagraha Yantra',
        deity: 'Supreme Divine Guardian & Navagrahas',
        planet: 'Jupiter (Guru) & Sun (Surya)',
        material: 'Heavy Consecrated Copper / Brass Plate',
        placement: 'North-East (Ishanya Kona) altar facing East',
        consecrationMantra: 'ॐ श्रीं ह्रीं क्लीं महाలక్ష్మ్యై నమః ॥',
        benefits: 'Deepens soul communion with your Ishta Devata, establishes spiritual equanimity, and dissolves karmic bondages.',
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
    lalKitabDualParihar: {
      practicalUpaay: 'Apply pure saffron (Kesar) or turmeric tilak on forehead, throat, and navel daily; donate yellow lentils at temple on Thursdays.',
      forbiddenActionVarjya: 'Never consume alcohol or non-vegetarian food on Saturdays or Thursdays. Never break solemn promises made to elders.',
      rationale: 'Lal Kitab 1952 canon: Universal Jupiterian-Saturnian stabilization restores moral dignity and cosmic harmony.',
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

7. DUAL-PARIHAR & LAL KITAB UPAAY + VARJYA (FORBIDDEN ACTIONS) DIRECTIVE:
   Along with the Classical Vedic remedy (Homam/Mantra/Gemstone), provide an everyday low-cost Lal Kitab Upaay and a Varjya Alert (Action to avoid permanently based on chart placement).
   - Practical Upaay examples: Feeding cows/birds, keeping a solid silver square/ball in pocket, donating yellow/red lentils on assigned days.
   - Varjya Warning examples: "Never accept free black items/leather", "Never sell ancestral property", "Never consume alcohol on Saturdays".

8. CLASSICAL SHASTRA CITATIONS (SHOW YOUR WORK):
   When explaining an astrological principle or remedy, cite the classical shastra source with authority:
   - Parashara principles: "According to Brihat Parashara Hora Shastra (BPHS)..."
   - Jaimini Karaka & Ishta principles: "As stated in Jaimini Upadesha Sutras..."
   - Lal Kitab Upaays: "As prescribed in the authentic Lal Kitab (1952 edition)..."
   - Classical Muhurat & Transits: "As canonized in Phaladeepika and Brihat Samhita..."

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
  language?: string;
}): RemedyProtocol48Day {
  const lang = params.language || 'English';
  const isTelugu = lang === 'Telugu';
  const isHindi = lang === 'Hindi';
  const isTamil = lang === 'Tamil';

  const remedies = resolveVedicRemedies({
    domain: params.domain,
    planet: params.planet,
    concern: params.concern,
  });

  const now = new Date();
  const day24 = new Date(now.getTime() + 24 * 24 * 60 * 60 * 1000);
  const day48 = new Date(now.getTime() + 48 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toLocaleDateString(isTelugu ? 'te-IN' : isHindi ? 'hi-IN' : isTamil ? 'ta-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const dLow = (params.domain || '').toLowerCase();
  const pLow = (params.planet || '').toLowerCase();
  const isSaturnRahu = pLow.includes('shani') || pLow.includes('saturn') || pLow.includes('rahu');

  // Localized Homam Name
  const homamName = isTelugu
    ? remedies.primaryHomam.teluguName || remedies.primaryHomam.name
    : isHindi
    ? remedies.primaryHomam.hindiName || remedies.primaryHomam.name
    : isTamil
    ? remedies.primaryHomam.tamilName || remedies.primaryHomam.name
    : remedies.primaryHomam.name;

  // Localized Auspicious Day of the Week
  let auspiciousDay = remedies.primaryHomam.day;
  if (isTelugu) {
    if (remedies.primaryHomam.id === 'navagraha') auspiciousDay = 'శనివారం లేదా ఆదివారం';
    else if (remedies.primaryHomam.id === 'ganapathi') auspiciousDay = 'బుధవారం లేదా శుక్ల చతుర్థి';
    else if (remedies.primaryHomam.id === 'lakshmi_kubera') auspiciousDay = 'శుక్రవారం లేదా పూర్ణిమ';
    else if (remedies.primaryHomam.id === 'mrityunjaya') auspiciousDay = 'సోమవారం లేదా ప్రదోషం';
    else if (remedies.primaryHomam.id === 'sudarshana') auspiciousDay = 'ఆదివారం, బుధవారం లేదా ఏకాదశి';
  } else if (isHindi) {
    if (remedies.primaryHomam.id === 'navagraha') auspiciousDay = 'शनिवार या रविवार';
    else if (remedies.primaryHomam.id === 'ganapathi') auspiciousDay = 'बुधवार या शुक्ल चतुर्थी';
    else if (remedies.primaryHomam.id === 'lakshmi_kubera') auspiciousDay = 'शुक्रवार या पूर्णिमा';
    else if (remedies.primaryHomam.id === 'mrityunjaya') auspiciousDay = 'सोमवार या प्रदोष';
    else if (remedies.primaryHomam.id === 'sudarshana') auspiciousDay = 'रविवार, बुधवार या एकादशी';
  } else if (isTamil) {
    if (remedies.primaryHomam.id === 'navagraha') auspiciousDay = 'சனிக்கிழமை அல்லது ஞாயிற்றுக்கிழமை';
    else if (remedies.primaryHomam.id === 'ganapathi') auspiciousDay = 'புதன்கிழமை அல்லது சுக்ல சதுர்த்தி';
    else if (remedies.primaryHomam.id === 'lakshmi_kubera') auspiciousDay = 'வெள்ளிக்கிழமை அல்லது பௌர்ணமி';
    else if (remedies.primaryHomam.id === 'mrityunjaya') auspiciousDay = 'திங்கட்கிழமை அல்லது பிரதோஷம்';
    else if (remedies.primaryHomam.id === 'sudarshana') auspiciousDay = 'ஞாயிற்றுக்கிழமை, புதன்கிழமை அல்லது ஏகாதசி';
  }

  // Localized Lamp Offering
  let lampOffering = isSaturnRahu
    ? 'Pure Sesame (Til) oil deepam facing East or North'
    : 'Pure Cow Ghee deepam facing East or North';
  if (isTelugu) {
    lampOffering = isSaturnRahu
      ? 'స్వచ్ఛమైన నువ్వుల నూనె దీపం'
      : 'స్వచ్ఛమైన ఆవు నెయ్యి దీపం';
  } else if (isHindi) {
    lampOffering = isSaturnRahu
      ? 'शुद्ध तिल के तेल का दीपक'
      : 'शुद्ध गाय के घी का दीपक';
  } else if (isTamil) {
    lampOffering = isSaturnRahu
      ? 'தூய நல்லெண்ணெய் தீபம்'
      : 'தூய பசு நெய் தீபம்';
  }

  // Localized Charity Daana (Day 24)
  let charityDaana = 'Feed green grass to cows (Gau Seva) or donate whole grains to temple kitchen.';
  if (dLow.includes('career') || pLow.includes('ketu') || pLow.includes('sun')) {
    charityDaana = isTelugu
      ? 'తాజా అరటిపండ్లు, బెల్లం మిఠాయిలు లేదా ఆలయం వద్ద వృద్ధులకు/శ్రామికులకు అన్నదానం చేయండి.'
      : isHindi
      ? 'केले, गुड़ की मिठाई या मंदिर में वृद्धों/श्रमिकों को भोजन कराएं।'
      : isTamil
      ? 'வாழைப்பழங்கள், வெல்ல இனிப்பு அல்லது முதியவர்களுக்கு/தொழிலாளர்களுக்கு அன்னதானம் செய்யுங்கள்.'
      : 'Offer fresh bananas, jaggery sweets, or warm food to elderly sadhus/laborers at a temple.';
  } else if (dLow.includes('wealth') || dLow.includes('finance') || pLow.includes('venus') || pLow.includes('jupiter')) {
    charityDaana = isTelugu
      ? 'శనగపప్పు, స్వచ్ఛమైన తేనె లేదా నిరుపేద విద్యార్థులకు/వేద పండితులకు యథాశక్తి దానం చేయండి.'
      : isHindi
      ? 'चने की दाल, शुद्ध शहद या निर्धन छात्रों/वैदिक विद्वानों को आर्थिक सहायता दान करें।'
      : isTamil
      ? 'கடலைப்பருப்பு, தூய தேன் அல்லது ஏழை மாணவர்களுக்கு/வேத விற்பன்னர்களுக்கு தானம் செய்யுங்கள்.'
      : 'Donate yellow lentils (Chana Dal), pure honey, or financial support to Vedic scholars or impoverished students.';
  } else if (dLow.includes('health') || isSaturnRahu) {
    charityDaana = isTelugu
      ? 'నల్ల నువ్వులు, ఆవనూనె దానం చేయండి లేదా శనివారం నాడు పేద రోగులకు మందుల సహాయం చేయండి.'
      : isHindi
      ? 'काले तिल, सरसों का तेल दान करें या शनिवार को जरूरतमंद मरीजों की दवा में मदद करें।'
      : isTamil
      ? 'கருப்பு எள், நல்லெண்ணெய் தானம் செய்யுங்கள் அல்லது ஏழை நோயாளிகளுக்கு மருந்து உதவி செய்யுங்கள்.'
      : 'Donate black sesame seeds, mustard oil, or sponsor medicine for needy hospital patients on Saturday.';
  } else if (dLow.includes('marriage') || pLow.includes('mars')) {
    charityDaana = isTelugu
      ? 'ఎర్రని పువ్వులు, బెల్లం రొట్టెలు లేదా ముత్తైదువులకు/దేవి ఆలయానికి వస్త్రాలు సమర్పించండి.'
      : isHindi
      ? 'लाल फूल, गुड़ की रोटी या सुहागिन महिलाओं अथवा देवी मंदिर में वस्त्र अर्पित करें।'
      : isTamil
      ? 'சிவப்பு மலர்கள், வெல்ல ரொட்டி அல்லது சுமங்கலி பெண்களுக்கு/அம்மன் கோவிலுக்கு வஸ்திரம் தானம் செய்யுங்கள்.'
      : 'Offer red flowers, sweet jaggery roti, or clothing to young married women or Devi temple.';
  } else {
    charityDaana = isTelugu
      ? 'గోవులకు పచ్చిగడ్డి (గోసేవ) తినిపించండి లేదా ఆలయ అన్నదాన సత్రానికి ధాన్యాలను దానం చేయండి.'
      : isHindi
      ? 'गायों को हरा चारा (गौ सेवा) खिलाएं या मंदिर रसोई में साबुत अनाज दान करें।'
      : isTamil
      ? 'பசுக்களுக்கு பசுந்தீவனம் அளியுங்கள் (கோபூஜை) அல்லது கோவில் மடப்பள்ளிக்கு தானியம் வழங்குங்கள்.'
      : 'Feed green grass to cows (Gau Seva) or donate whole grains to temple kitchen.';
  }

  // Localized Titles & Actions
  const title = isTelugu
    ? `48 రోజుల పవిత్ర మండల పరిహార విధానం (${homamName.split(' (')[0]})`
    : isHindi
    ? `48 दिवसीय पवित्र मंडल परिहार विधान (${homamName.split(' (')[0]})`
    : isTamil
    ? `48 நாட்கள் புனித மண்டல பரிகார முறை (${homamName.split(' (')[0]})`
    : `48-Day Sacred Mandala Parihar Protocol (${remedies.primaryHomam.name.split(' (')[0]})`;

  const dailyJapaCount = isTelugu
    ? 'రుద్రాక్ష / తులసి / స్పటిక మాలతో నిత్యం 108 సార్లు జపం'
    : isHindi
    ? 'रुद्राक्ष / तुलसी / स्फटिक माला से प्रतिदिन 108 बार जप'
    : isTamil
    ? 'ருத்ராட்சம் / துளசி மாலையுடன் தினமும் 108 முறை ஜெபம்'
    : '108 recitations daily with Rudraksha / Tulsi / Spatika Mala';

  const day1Title = isTelugu
    ? '1వ రోజు: ప్రథమ సంకల్పం & పవిత్ర ప్రారంభం'
    : isHindi
    ? 'पहला दिन: प्रथम संकल्प एवं पवित्र शुभारंभ'
    : isTamil
    ? 'நாள் 1: முதல் சங்கல்பம் & புனித தொடக்கம்'
    : 'Day 1: Prathama Sankalpa & Sacred Beginning';

  const day1Action = isTelugu
    ? `సూర్యోదయానికి ముందే (బ్రహ్మ ముహూర్తంలో) మేల్కొనండి. శుచిగా స్నానం చేసి, తూర్పు లేదా ఉత్తర దిశగా ${lampOffering} వెలిగించి, తూర్పు ముఖంగా కూర్చుని 48 రోజుల క్రమశిక్షణతో కూడిన మండల దీక్షా సంకల్పం తీసుకోండి.`
    : isHindi
    ? `सूर्योदय से पूर्व (ब्रह्म मुहूर्त) में उठें। पवित्र स्नान कर पूर्व या उत्तर दिशा में ${lampOffering} प्रज्वलित करें, पूर्व दिशा में बैठकर 48 दिवसीय अनुशासित भक्ति का संकल्प लें।`
    : isTamil
    ? `சூரிய உதயத்திற்கு முன் (பிரம்ம முகூர்த்தம்) எழுந்து நீராடி, கிழக்கு அல்லது வடக்கு நோக்கி ${lampOffering} ஏற்றி, கிழக்கு நோக்கி அமர்ந்து 48 நாட்கள் மண்டல பக்தி சங்கல்பம் செய்யுங்கள்.`
    : `Awake before sunrise (Brahma Muhurtha). Take a holy bath, light the ${lampOffering}, sit facing East, and take a personal Sankalpa pledging 48 days of disciplined devotion.`;

  const day24Title = isTelugu
    ? '24వ రోజు: మధ్యమ శాంతి & పవిత్ర దాన సంకల్పం'
    : isHindi
    ? '24वां दिन: मध्यम शांति एवं पवित्र दान संकल्प'
    : isTamil
    ? 'நாள் 24: மத்திய சாந்தி & புனித தானம்'
    : 'Day 24: Madhyama Shanti & Sacred Daana Milestone';

  const day24Action = isTelugu
    ? 'మండల మధ్యంతర శుద్ధి: మీ పూజా స్థలాన్ని శుభ్రం చేయండి, తియ్యని ప్రసాదం నివేదించండి మరియు నిర్దేశించిన దానాన్ని నెరవేర్చండి.'
    : isHindi
    ? 'मध्य-मंडल शुद्धि: पूजा स्थल को स्वच्छ करें, मीठा प्रसाद अर्पित करें और निर्धारित दान संपन्न करें।'
    : isTamil
    ? 'மண்டல தூய்மை: பூஜை அறையை சுத்தம் செய்து, பிரசாதம் படைத்து, பரிந்துரைக்கப்பட்ட தானத்தை செய்யுங்கள்.'
    : 'Perform mid-mandala cleansing: deep clean your altar, offer sweet Prasad, and execute the prescribed charity.';

  const day48Title = isTelugu
    ? '48వ రోజు: పూర్ణాహుతి, హోమం / కొబ్బరికాయ సమర్పణ & పరిసమాప్తి'
    : isHindi
    ? '48वां दिन: पूर्णाहुति, होम / नारियल अर्पण एवं पूर्णता'
    : isTamil
    ? 'நாள் 48: பூர்ணாஹுதி, ஹோமம் / தேங்காய் சமர்ப்பணம் & நிறைவு'
    : 'Day 48: Purnahuti, Homam / Coconut Offering & Completion';

  const day48Action = isTelugu
    ? `చివరి 108 మంత్ర జపాన్ని పూర్తి చేయండి. ఆలయంలో లేదా ఆస్ట్రోపరిహార్ ద్వారా ${homamName} జరిపించండి, లేదా గణపతి/దేవి సన్నిధిలో కొబ్బరికాయ కొట్టి కర్పూర హారతి ఇవ్వండి.`
    : isHindi
    ? `अपना अंतिम 108 मंत्र जप पूर्ण करें। मंदिर में या एस्ट्रोपरीहार के माध्यम से ${homamName} कराएं, अथवा गणेश जी/देवी मंदिर में नारियल व कपूर अर्पित करें।`
    : isTamil
    ? `கடைசி 108 மந்திர ஜெபத்தை நிறைவு செய்யுங்கள். கோவிலில் அல்லது ஆஸ்ட்ரோபரிகார் மூலம் ${homamName} நடத்துங்கள், அல்லது பிள்ளையார்/அம்மன் சன்னதியில் தேங்காய் உடைத்து கற்பூர ஆரத்தி காட்டுங்கள்.`
    : `Complete your final 108 mantra japa. Book or perform ${remedies.primaryHomam.name} at a consecrated temple or via AstroParihar, or offer a sacred peeled dry coconut with camphor at Lord Ganesha / Devi sanctum.`;

  return {
    title,
    totalDays: 48,
    mandalaPurpose: remedies.primaryHomam.purpose,
    presidingDeity: remedies.primaryHomam.deity,
    recommendedHomam: homamName,
    homamAuspiciousDay: auspiciousDay,
    dailyMantra: remedies.primaryMantra.sanskrit || remedies.primaryMantra.transliteration,
    dailyJapaCount,
    direction: 'East',
    lampOffering,
    initiationDay1: {
      title: day1Title,
      action: day1Action,
      sankalpaText: `Mama janma-kundali dosha shamanaartham, ${remedies.primaryHomam.deity} preetyartham, 48-dina parihara sankalpam aham karishye.`,
    },
    dailyDiscipline: {
      morningRitual: `Chant "${remedies.primaryMantra.transliteration}" 108 times before the altar. Offer clean water and fresh flowers.`,
      lifestyleGuidelines: [
        isTelugu
          ? '48 రోజుల మండలంలో సాత్విక ఆహారం పాటించండి; మద్యపానం, మాంసాహారం విసర్జించండి.'
          : isHindi
          ? '48 दिनों के मंडल के दौरान सात्विक शाकाहारी भोजन करें; मदिरा एवं मांसाहार का पूर्ण त्याग करें।'
          : isTamil
          ? '48 நாட்கள் மண்டல காலத்தில் தூய சைவ உணவை கடைபிடிக்கவும்; மது, அசைவம் தவிர்க்கவும்.'
          : 'Maintain a sattvic vegetarian diet; abstain from alcohol and non-vegetarian food during the 48-day Mandala.',
        isTelugu
          ? 'శాంతమైన సంభాషణ పాటించండి, కోపతాపాలు మరియు వాదనలకు దూరంగా ఉండండి.'
          : isHindi
          ? 'शांत वाणी और सत्य का आचरण करें; क्रोध व वाद-विवाद से बचें।'
          : isTamil
          ? 'சாந்தமாக பேசுங்கள்; கோபம், வாக்குவாதங்களை தவிர்க்கவும்.'
          : 'Practice truthfulness, calm speech, and refrain from anger or heated arguments.',
        isTelugu
          ? 'రోజూ ఉదయం పూజ అనంతరం కుంకుమ లేదా విభూతిని నుదుట ధరించండి.'
          : isHindi
          ? 'प्रतिदिन सुबह पूजा के बाद मस्तक पर कुमकुम या भस्म का तिलक लगाएं।'
          : isTamil
          ? 'தினமும் காலையில் குங்குமம் அல்லது விபூதி திலகம் இட்டுக் கொள்ளவும்.'
          : 'Apply sacred kumkum / vibhuti from the altar upon your forehead every morning.',
      ],
    },
    midMandalaMilestoneDay24: {
      title: day24Title,
      action: day24Action,
      charityDaana,
    },
    culminationDay48: {
      title: day48Title,
      action: day48Action,
      completionRitual: isTelugu
        ? '5 మందికి లేదా కుటుంబ సభ్యులకు తీపి పదార్థాలను పంచిపెట్టండి, పెద్దల ఆశీర్వాదం తీసుకోండి, రక్షా ధారణ చేయండి.'
        : isHindi
        ? '5 लोगों या परिवारजनों में मिठाई बांटें, बड़ों का आशीर्वाद लें और रक्षा सूत्र धारण करें।'
        : isTamil
        ? '5 நபர்களுக்கு இனிப்பு வழங்கி, பெரியவர்களின் ஆசீர்வாதம் பெற்று, ரக்ஷை கட்டிக் கொள்ளவும்.'
        : 'Distribute sweets to 5 individuals or family members, seek elders blessings, and wear energized protective Raksha.',
    },
    startDate: formatDate(now),
    midDate: formatDate(day24),
    completionDate: formatDate(day48),
    astrologerCheckupCTA: isTelugu
      ? '48వ రోజున ఆస్ట్రోపరిహార్ సీనియర్ జ్యోతిష్యులతో పురోగతి సమీక్షను షెడ్యూల్ చేయండి.'
      : isHindi
      ? '48वें दिन एस्ट्रोपरीहार के वरिष्ठ ज्योतिषी से परामर्श कर प्रगति की समीक्षा करें।'
      : isTamil
      ? '48வது நாளில் ஆஸ்ட்ரோபரிகார் மூத்த ஜோதிடரிடம் ஆலோசனை பெற்று முன்னேற்றத்தை சரிபார்க்கவும்.'
      : 'Schedule a post-mandalam progress review with an AstroParihar Senior Astrologer on Day 48.',
  };
}

