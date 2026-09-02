const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const guidesData = [
  {
    id: 'rahu-stabilisation',
    filename: 'rahu_mahadasha_stabilisation_guide.pdf',
    title: 'RAHU MAHADASHA STABILISATION GUIDE',
    subtitle: 'Vedic Grounding Protocols, Beej Mantras & Shadow Planet Pacification',
    badge: 'Official Publication · AstroParihar Vedic Research Division',
    chapters: [
      {
        title: 'Chapter 1: Understanding Rahu (North Node) Dynamics',
        content: [
          'Rahu is the cosmic shadow planet (Chhaya Graha) representing ambition, obsession, illusion (Maya), and unconventional life breakthroughs.',
          'When Rahu operates in an ungrounded state, it manifests as sudden anxiety, racing thoughts, sleep disturbances (Vata aggravation), and erratic financial swings.',
          'Stabilisation is not about fearing Rahu, but directing its electrifying cosmic momentum towards spiritual awakening, high-tech success, and disciplined detachment.',
        ],
      },
      {
        title: 'Chapter 2: Daily Beej Mantra & Meditation Protocol',
        content: [
          '1. Primary Beej Mantra: "Om Bhram Bhreem Bhroum Sah Rahave Namah" (108 times at twilight/night).',
          '2. Shiva Pacification: Recite the Maha Mrityunjaya Mantra 11 times every morning to create an impenetrable energetic shield around your aura.',
          '3. Rahu Stotram: Recite the classical Navagraha Rahu Stotram on Saturdays or Wednesdays after sunset.',
          '4. Breathwork (Pranayama): Practice Nadi Shodhana (Alternate Nostril Breathing) for 15 minutes daily to calm the nervous system.',
        ],
      },
      {
        title: 'Chapter 3: Food, Lifestyle & Environmental Remedies',
        content: [
          '• Avoid non-vegetarian food, alcohol, and stale fermented meals, which trigger Rahu tamas energy.',
          '• Keep your electronic devices, bedroom, and digital workspaces clutter-free to pacify spatial Rahu vibrations.',
          '• Wear clean, well-ironed light blue, ivory, or white natural fabrics; avoid dark smoky brown tones.',
          '• Water plants, feed stray dogs (especially dark dogs on Saturdays), and offer barley grains in running water.',
        ],
      },
      {
        title: 'Chapter 4: Sacred Yantra & Gemstone Guidelines',
        content: [
          '• Energized Rahu Yantra: Place an authentic copper or silver Rahu Yantra in the South-West (Nairruti) direction of your altar.',
          '• Hessonite Garnet (Gomedh): Only wear Gomedh after verifying chart placement with our astrologers. If afflicted, use natural 8-Mukhi Rudraksha instead.',
          '• Daily Sankalpa: Dedicate all material endeavors to the Divine to neutralize selfish karmic knots.',
        ],
      },
    ],
  },
  {
    id: 'rahu-survival',
    filename: 'rahu_mahadasha_survival_guide.pdf',
    title: 'RAHU MAHADASHA SURVIVAL GUIDE',
    subtitle: 'The 18-Year Master Blueprint: Navigating Antardashas, Career Pivots & Karmic Karma',
    badge: 'Comprehensive Master Protocol · AstroParihar Academy',
    chapters: [
      {
        title: 'Chapter 1: Anatomy of the 18-Year Rahu Mahadasha',
        content: [
          'The 18-year Rahu cycle is the most transformative phase in human life, propelling individuals through massive social elevations, relocations, and psychological re-evaluations.',
          'Phase 1 (Years 1-6): Turbulence & Awakening (Rahu-Rahu, Rahu-Jupiter).',
          'Phase 2 (Years 7-12): Peak Expansion & Global Opportunities (Rahu-Saturn, Rahu-Mercury).',
          'Phase 3 (Years 13-18): Consolidation, Karmic Settling & Transition (Rahu-Ketu, Rahu-Venus, Rahu-Sun Chhidra Dasha).',
        ],
      },
      {
        title: 'Chapter 2: Critical Antardasha Survival Tactics',
        content: [
          '• Rahu-Jupiter: "Guru-Chandal Yoga" period. Guard against blind trust in unethical ventures; anchor in sacred wisdom.',
          '• Rahu-Saturn: Heavy karmic friction between shadow obsession and hard reality. Cultivate relentless discipline and patience.',
          '• Rahu-Mars: High adrenaline and potential conflicts. Avoid reckless speeding, arguments, and rash investments.',
          '• Rahu-Venus: Glamour, relationship tests, and luxury temptations. Maintain moral integrity and clear contracts.',
        ],
      },
      {
        title: 'Chapter 3: Protecting Marriage, Career & Wealth',
        content: [
          '1. Marriage Shield: Ensure transparent, gentle communication. Do not make impulsive separation decisions during Rahu eclipses.',
          '2. Wealth Preservation: Avoid speculative gambling, unverified crypto schemes, or overnight riches promises.',
          '3. Career Evolution: Rahu favors foreign travel, digital technology, aviation, research, and out-of-the-box entrepreneurship.',
        ],
      },
      {
        title: 'Chapter 4: Vedic Fire Rituals & Remedial Master Protocol',
        content: [
          '• Perform Rahu Shanti Homa once a year during Rahu transit ingress.',
          '• Chant the Durga Saptashati Argala Stotram and Devi Kavacham for supreme energetic immunity.',
          '• Offer coconut and blue flowers into moving river water on Amavasya (New Moon).',
          '• Consult with AstroParihar expert astrologers for customized planetary transit adjustments.',
        ],
      },
    ],
  },
  {
    id: 'sani-stabilisation',
    filename: 'sani_mahadasha_stabilisation_guide.pdf',
    title: 'SANI MAHADASHA STABILISATION GUIDE',
    subtitle: 'Pacifying Saturn, Sade Sati Survival & Channeling Karmic Discipline into Mastery',
    badge: 'Official Publication · AstroParihar Vedic Research Division',
    chapters: [
      {
        title: 'Chapter 1: Understanding Lord Shani (Saturn)',
        content: [
          'Saturn (Shani Dev) is the cosmic judge (Nyayadhikari), ruling delay, hard labor, endurance, humility, and long-term legacy.',
          'Saturn does not punish—he purifies ego, strips away false illusions, and rewards honest hard work with unshakable foundation.',
          'Stabilizing Saturn energy transforms frustration into meditative stillness, perseverance, and timeless spiritual authority.',
        ],
      },
      {
        title: 'Chapter 2: Daily Hanuman Chalisa & Shani Stotram Protocol',
        content: [
          '1. Hanuman Chalisa: Recite Hanuman Chalisa 3 to 7 times every morning and evening. Lord Hanuman grants unconditional immunity against Shani dosha.',
          '2. Shani Beej Mantra: "Om Sham Shanaischaraya Namah" (108 times on Saturdays using a Rudraksha mala).',
          '3. Dasharatha Shani Stotram: Recite the sacred prayer composed by King Dasharatha to mitigate intense Sade Sati suffering.',
          '4. Sunset Mustard Lamp: Light a pure mustard oil (Sarson Tel) diya under a Peepal tree or near Lord Shani on Saturday evenings.',
        ],
      },
      {
        title: 'Chapter 3: Karma Yoga, Seva & Behavioral Remedies',
        content: [
          '• Honor and support laborers, cleaners, elders, and domestic helpers with generous tips and respectful speech.',
          '• Feed black dogs, crows, and cows with mustard-oiled roti or black sesame seeds (Til) on Saturdays.',
          '• Practice strict punctuality, honesty, and financial debt repayment.',
          '• Avoid wearing torn clothes, borrowing iron tools on Saturdays, and consuming heavy intoxicating substances.',
        ],
      },
      {
        title: 'Chapter 4: Protective Talismans & Vrat Guidelines',
        content: [
          '• Iron Horseshoe Ring: Wear an authentic boat-nail or black horseshoe ring on the middle finger of the right hand on a Saturday evening.',
          '• 14-Mukhi / 7-Mukhi Rudraksha: Blessed by Mahadeva and Goddess Mahalakshmi to neutralize malefic Saturn afflictions.',
          '• Observe Shanivar Vrat (Saturday Fasting): Consume one satvik meal after sunset without salt or with Sendha Namak.',
        ],
      },
    ],
  },
  {
    id: 'sani-survival',
    filename: 'sani_mahadasha_survival_guide.pdf',
    title: 'SANI MAHADASHA SURVIVAL GUIDE',
    subtitle: 'The 19-Year Saturn Master Blueprint: Sade Sati 3 Phases, Career Peak & Spiritual Liberation',
    badge: 'Comprehensive Master Protocol · AstroParihar Academy',
    chapters: [
      {
        title: 'Chapter 1: The 19-Year Shani Mahadasha Architecture',
        content: [
          'The 19-year Saturn cycle is the grand restructuring of your destiny, forging unshakeable resilience and lifetime achievement.',
          'Phase 1: Stripping False Dependencies & Deepening Roots (Shani-Shani, Shani-Mercury).',
          'Phase 2: The Fire of Testing & True Mastery (Shani-Ketu, Shani-Venus, Shani-Sun).',
          'Phase 3: The Golden Harvest & Karmic Rewards (Shani-Moon, Shani-Mars, Shani-Rahu, Shani-Jupiter).',
        ],
      },
      {
        title: 'Chapter 2: Master Strategy for Sade Sati (7.5 Years)',
        content: [
          '• Rising Phase (12th House from Moon): Financial audits, mental detachment, and overcoming unnecessary expenditures.',
          '• Peak Phase (1st House on Moon Rashi): Physical health vitality tests, mental fortitude, and deep inner transformation.',
          '• Setting Phase (2nd House from Moon): Speech control, family asset stabilization, and stepping into earned prosperity.',
        ],
      },
      {
        title: 'Chapter 3: Health, Bone Structure & Vata Management',
        content: [
          '• Saturn rules the nervous system, bones, knees, teeth, and joints. Perform regular warm sesame oil self-massage (Abhyanga).',
          '• Maintain consistent sleep hours and stay hydrated with warm herbal teas.',
          '• Engage in grounding yoga asanas (Vrikshasana, Tadasana, Balasana) and daily silent meditation.',
        ],
      },
      {
        title: 'Chapter 4: Sacred Rituals, Temples & Shani Shanti Protocol',
        content: [
          '• Visit Thirunallar Shani Temple or Shani Shingnapur when possible for sacred Tailabhishekam.',
          '• Perform Shani Shanti Homa and offer blue flowers, black sesame, and iron items to needy persons.',
          '• Chant the Sundara Kanda from the Ramayana on Tuesdays and Saturdays for permanent energetic protection.',
          '• Consult with AstroParihar Vedic Astrologers for personalized chart transit synastry.',
        ],
      },
    ],
  },
];

async function generateAllPdfs() {
  const outputDir = path.join(__dirname, '..', 'public', 'assets', 'pdfs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const guide of guidesData) {
    const doc = await PDFDocument.create();
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

    // Page 1: Cover & Intro
    let page = doc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    // Background header bar
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(0.12, 0.06, 0.1),
    });

    // Gold accent bar
    page.drawRectangle({
      x: 0,
      y: height - 126,
      width: width,
      height: 6,
      color: rgb(0.79, 0.58, 0.17),
    });

    // Logo / Brand
    page.drawText('ASTROPARIHAR VEDIC ACADEMY', {
      x: 40,
      y: height - 45,
      size: 14,
      font: fontBold,
      color: rgb(0.96, 0.82, 0.46),
    });

    page.drawText('Authentic Vedic Astrology · Certified Remedial Research', {
      x: 40,
      y: height - 65,
      size: 9,
      font: fontRegular,
      color: rgb(0.85, 0.85, 0.85),
    });

    // Guide Title
    page.drawText(guide.title, {
      x: 40,
      y: height - 170,
      size: 20,
      font: fontBold,
      color: rgb(0.16, 0.14, 0.13),
    });

    // Subtitle
    page.drawText(guide.subtitle, {
      x: 40,
      y: height - 195,
      size: 11,
      font: fontOblique,
      color: rgb(0.44, 0.23, 0.2),
    });

    // Badge
    page.drawRectangle({
      x: 40,
      y: height - 235,
      width: width - 80,
      height: 26,
      color: rgb(0.93, 0.89, 0.84),
      borderColor: rgb(0.79, 0.58, 0.17),
      borderWidth: 1,
    });

    page.drawText(guide.badge, {
      x: 50,
      y: height - 226,
      size: 9,
      font: fontBold,
      color: rgb(0.44, 0.23, 0.2),
    });

    // Chapter 1 & 2 on Page 1
    let curY = height - 275;
    for (let c = 0; c < 2; c++) {
      const ch = guide.chapters[c];
      page.drawText(ch.title, {
        x: 40,
        y: curY,
        size: 13,
        font: fontBold,
        color: rgb(0.44, 0.23, 0.2),
      });
      curY -= 20;

      for (const p of ch.content) {
        const words = p.split(' ');
        let line = '';
        for (const w of words) {
          const testLine = line + (line ? ' ' : '') + w;
          if (fontRegular.widthOfTextAtSize(testLine, 10) > width - 90) {
            page.drawText(line, { x: 45, y: curY, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
            curY -= 14;
            line = w;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page.drawText(line, { x: 45, y: curY, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          curY -= 14;
        }
        curY -= 6;
      }
      curY -= 12;
    }

    // Footer Page 1
    page.drawText('Official Digital Publication · AstroParihar.com · Confidential Guidance Document · Page 1 of 2', {
      x: 40,
      y: 25,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Page 2: Chapters 3 & 4 + Seal
    const page2 = doc.addPage([595, 842]);
    const p2Height = page2.getHeight();

    // Top subtle bar
    page2.drawRectangle({
      x: 0,
      y: p2Height - 50,
      width: width,
      height: 50,
      color: rgb(0.97, 0.95, 0.92),
    });

    page2.drawText(`${guide.title} — Part 2 (Action Protocols)`, {
      x: 40,
      y: p2Height - 32,
      size: 10,
      font: fontBold,
      color: rgb(0.44, 0.23, 0.2),
    });

    curY = p2Height - 80;
    for (let c = 2; c < guide.chapters.length; c++) {
      const ch = guide.chapters[c];
      page2.drawText(ch.title, {
        x: 40,
        y: curY,
        size: 13,
        font: fontBold,
        color: rgb(0.44, 0.23, 0.2),
      });
      curY -= 20;

      for (const p of ch.content) {
        const words = p.split(' ');
        let line = '';
        for (const w of words) {
          const testLine = line + (line ? ' ' : '') + w;
          if (fontRegular.widthOfTextAtSize(testLine, 10) > width - 90) {
            page2.drawText(line, { x: 45, y: curY, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
            curY -= 14;
            line = w;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page2.drawText(line, { x: 45, y: curY, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          curY -= 14;
        }
        curY -= 6;
      }
      curY -= 12;
    }

    // AstroParihar Authentic Seal Box
    page2.drawRectangle({
      x: 40,
      y: 60,
      width: width - 80,
      height: 75,
      color: rgb(0.98, 0.97, 0.94),
      borderColor: rgb(0.79, 0.58, 0.17),
      borderWidth: 1,
    });

    page2.drawText('VERIFIED ASTROPARIHAR CERTIFICATE OF REMEDIAL AUTHENTICITY', {
      x: 55,
      y: 118,
      size: 9.5,
      font: fontBold,
      color: rgb(0.44, 0.23, 0.2),
    });

    page2.drawText('This Mahadasha survival blueprint is authorized based on Parasara Hora Shastra and authentic Vedic transits.', {
      x: 55,
      y: 102,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    page2.drawText('For 1-on-1 personalized voice consultation with our top Vedic scholars, visit https://astroparihar.com', {
      x: 55,
      y: 88,
      size: 8.5,
      font: fontBold,
      color: rgb(0.79, 0.58, 0.17),
    });

    page2.drawText('Official Digital Publication · AstroParihar.com · All Rights Reserved · Page 2 of 2', {
      x: 40,
      y: 25,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await doc.save();
    const filePath = path.join(outputDir, guide.filename);
    fs.writeFileSync(filePath, pdfBytes);
    console.log(`Generated: ${filePath} (${pdfBytes.length} bytes)`);
  }
}

generateAllPdfs()
  .then(() => console.log('All 4 Mahadasha PDF guides generated successfully!'))
  .catch(console.error);
