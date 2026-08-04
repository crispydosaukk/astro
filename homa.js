const fs = require('fs');
let text = fs.readFileSync('src/lib/cms.ts', 'utf8');
const homaDetails = {
    enabled: true,
    tagline: 'Homa & Pūjā as a Remedy',
    titleLine1: 'Sacred',
    titleLine2Gold: 'Active Transformation',
    quote: '“Where intention meets sacred action, transformation begins.”',
    description: 'Homa and Pūjā are among the most powerful traditional remedies, invoking divine energies to restore balance and reduce obstacles arising from karma. Through the purifying element of fire and focused intention, these practices help create harmony within and around you.',
    sloka: {
      sanskrit: 'होमपूजाजपैर्नित्यं देवताः प्रीतिमाप्नुयुः ।\nतेषां प्रसादात् नश्यन्ति बाधाः कर्मसमुद्भवाः ॥',
      transliteration: 'Homa-pūjā-japair nityaṁ devatāḥ prītim āpnuyuḥ\nTeṣāṁ prasādāt naśyanti bādhāḥ karma-samudbhavāḥ',
      meaning: '“Through regular homa, worship, and mantra, the deities become pleased; by their grace, obstacles arising from karma are reduced.”'
    },
    infoCards: [
      {
        title: 'Why Homa / Pūjā is Powerful',
        icon: '🕉️',
        subtitle: 'Core Principle: Homa and Pūjā purify and harmonize subtle energies that influence life.',
        subSections: [
          { title: '1 Direct connection with divine forces', points: ['Invokes specific planetary or deity energies', 'Aligns individual with higher order'] },
          { title: '2 Active karmic resolution', points: ['Offerings symbolize surrender of ego and negative karma', 'Fire (Agni) acts as the divine messenger and purifier'] },
          { title: '3 Environmental harmony', points: ['Vibrations of mantras cleanse the physical space', 'Creates a protective and auspicious aura'] }
        ]
      },
      {
        title: 'Comparing Remedies',
        icon: '⚖️',
        subSections: [
          { title: 'Gemstones', points: ['Passive support', 'Works externally', 'Slow, steady impact'] },
          { title: 'Mantras', points: ['Internal focus', 'Directly influences the mind', 'Requires daily consistency'] },
          { title: 'Homa / Pūjā', points: ['Active intervention', 'Transforms environment and energy', 'Often yields faster, noticeable shifts'] }
        ]
      },
      {
        title: 'When is Homa Most Effective?',
        icon: '⏳',
        points: ['During intense planetary afflictions (e.g., Sade Sati)', 'When facing sudden obstacles or inexplicable delays', 'For specific material or spiritual goals (e.g., health, career)', 'To express gratitude and maintain continuous blessings']
      },
      {
        title: 'The Role of Intention (Sankalpa)',
        icon: '🎯',
        description: 'The power of any ritual lies in the Sankalpa (resolve). A Homa performed with mechanical action yields little. When performed with deep faith, clear intention, and surrender, it becomes a powerful catalyst for change.'
      }
    ],
    summaryTitle: 'Final',
    summaryTitleGold: 'Thoughts',
    summaryPoints: [
      '🔥 Homa is the physical manifestation of prayer',
      '✨ It actively burns negative karmic influences',
      '🙏 Requires purity of intention and action',
      '💎 A profound way to seek divine grace'
    ],
    summaryFooter: 'Consult our experts to find the right Homa for your specific needs.'
};

text = text.replace(/homams: \[.*?\],\n};/s, match => match.replace('};', '],\n  premiumDetails: ' + JSON.stringify(homaDetails, null, 2) + '\n};'));
fs.writeFileSync('src/lib/cms.ts', text);
