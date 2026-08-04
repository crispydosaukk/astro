const fs = require('fs');
let text = fs.readFileSync('src/lib/cms.ts', 'utf8');
const rudraDetails = {
    enabled: true,
    tagline: 'Sacred Beads',
    titleLine1: 'The Purest',
    titleLine2Gold: 'Vedic Remedy',
    description: 'Rudraksha is the purest of all remedies in the Vedic tradition, born from the tears of Lord Shiva. Discover the right mukhi Rudraksha to harmonize your planetary energies and shield you from negativity.',
    quote: '“Born from the tears of Shiva, Rudraksha is the ultimate shield.”',
    sloka: {
      sanskrit: 'विना भस्म त्रिपुंड्रेण विना रुद्राक्षमालया ।\nपूजितोऽपि महादेवो न तस्य फलदायकः ॥',
      transliteration: 'Vinā bhasma tripuṇḍreṇa vinā rudrākṣa-mālayā\nPūjito\'pi mahādevo na tasya phaladāyakaḥ',
      meaning: '“Without the sacred ash and without wearing Rudraksha, even if one worships Mahadeva, it does not yield the complete fruit of devotion.”'
    },
    infoCards: [
      {
        title: 'Why Rudraksha is Unique',
        icon: '🌿',
        subtitle: 'Core Principle: Rudraksha creates an energy shield around the wearer.',
        subSections: [
          { title: 'No negative side effects', points: ['Unlike gemstones, Rudraksha can never harm the wearer', 'It pacifies malefic planets gently'] },
          { title: 'Scientific & Spiritual', points: ['Known to regulate blood pressure and stress', 'Enhances focus and meditation'] }
        ]
      },
      {
        title: 'How to Wear Rudraksha',
        icon: '📿',
        points: ['Must be energized with Prana Pratishtha', 'Best worn touching the skin (chest or throat)', 'Should be removed during impure activities', 'Maintained by regular cleaning and oiling']
      }
    ],
    summaryTitle: 'Final',
    summaryTitleGold: 'Thoughts',
    summaryPoints: [
      '✨ Rudraksha is a universal remedy',
      '🛡️ It acts as a protective energetic shield',
      '💎 Cannot cause harm, only provides support',
      '🙏 Deepens spiritual connection'
    ],
    summaryFooter: 'Consult our experts to find the right Mukhi for your specific needs.'
};

text = text.replace(/rudrakshas: \[.*?\],\n};/s, match => match.replace('};', '],\n  premiumDetails: ' + JSON.stringify(rudraDetails, null, 2) + '\n};'));
fs.writeFileSync('src/lib/cms.ts', text);
