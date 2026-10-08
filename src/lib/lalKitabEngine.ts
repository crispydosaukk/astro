/**
 * Lal Kitab Intelligence & Remedial Engine (1952 Edition Canon)
 * 
 * Provides deterministic Lal Kitab 108 Planet-House combinations (9 Grahas × 12 Bhavas),
 * practical low-cost everyday Upaays (action-based remedies), and Varjya (Forbidden Action) Alerts.
 * 
 * 100% deterministic — Zero external API required.
 */

export interface LalKitabPlacementUpaay {
  planet: string;
  house: number;
  significance: string;
  upaay: string;
  varjya: string; // What the native MUST AVOID permanently (Forbidden Action)
  karmicWarning?: string;
}

export interface LalKitabRemedyResult {
  primaryUpaays: {
    planet: string;
    house: number;
    title: string;
    upaay: string;
    procedure: string;
  }[];
  varjyaAlerts: {
    planet: string;
    house: number;
    actionToAvoid: string;
    consequence: string;
  }[];
  ancestralDebt?: {
    debtType: string;
    cause: string;
    remedy: string;
  };
}

// Canonical 108 Lal Kitab Planet-House Combinations Matrix
export const LAL_KITAB_MATRIX: Record<string, Record<number, { significance: string; upaay: string; varjya: string }>> = {
  Sun: {
    1: {
      significance: 'Surya in 1st House (King in Throne): Strong willpower, noble temperament, royal blessings.',
      upaay: 'Drink a sip of water mixed with sugar or gur (jaggery) before stepping out for any important endeavor.',
      varjya: 'Never accept free religious articles, brass vessels, or unearned gifts. Do not be deceitful with government authorities.',
    },
    2: {
      significance: 'Surya in 2nd House (Treasury): Governs family wealth, voice impact, financial accumulation.',
      upaay: 'Donate coconut, mustard oil, or whole badam (almonds) at religious sanctuaries when financial delays occur.',
      varjya: 'Never accept gifts made of gold, copper, or brass from maternal relatives or in-laws.',
    },
    3: {
      significance: 'Surya in 3rd House (Valour & Siblings): Bestows enterprise, courageous initiative, leadership.',
      upaay: 'Serve younger siblings and donate whole wheat grain or gur to temple staff or sadhus.',
      varjya: 'Avoid disputes or legal contest with younger siblings. Never break promises made to family.',
    },
    4: {
      significance: 'Surya in 4th House (Mother & Residence): Focuses on mother\'s health, vehicles, mental serenity.',
      upaay: 'Distribute sweet milk or rice pudding (kheer) to visually impaired persons or elders.',
      varjya: 'Never conduct business involving fish, eggs, meat, or alcohol from your dwelling premises.',
    },
    5: {
      significance: 'Surya in 5th House (Progeny & Intellect): Deep spiritual intuition, academic distinction.',
      upaay: 'Maintain pure character; offer water mixed with red sandalwood powder to rising Sun in copper kalash.',
      varjya: 'Never construct an oven, furnace, or tandoor inside your residential kitchen or living room.',
    },
    6: {
      significance: 'Surya in 6th House (Victory over Adversaries): Destroys enemies, grants immunity and triumph.',
      upaay: 'Keep Ganga Jal (sacred water) in a silver flask inside the house; feed jaggery to monkeys or cows.',
      varjya: 'Never accept free brass items or free gold jewelry. Avoid lending money on interest to close friends.',
    },
    7: {
      significance: 'Surya in 7th House (Partnerships & Public Life): Tests marital diplomacy, social prominence.',
      upaay: 'Bury a square piece of copper in unpaved natural earth or under a Neem tree.',
      varjya: 'Never enter into partnerships with in-laws or close maternal relatives.',
    },
    8: {
      significance: 'Surya in 8th House (Transformation & Longevity): Occult depth, sudden changes, hidden wisdom.',
      upaay: 'Never live in a South-facing house; offer sweet red rotis (wheat bread) to cows.',
      varjya: 'Never consume meat or liquor inside your residential dwelling, especially after sunset.',
    },
    9: {
      significance: 'Surya in 9th House (Bhagya & Dharma): Fortunate destiny, righteousness, father\'s blessings.',
      upaay: 'Wear pure brass or copper ring on ring finger; always touch father\'s and paternal elders\' feet.',
      varjya: 'Never speak ill of spiritual preceptors, gurus, or ancestral traditions.',
    },
    10: {
      significance: 'Surya in 10th House (Karma & Executive Authority): High career elevation, public dignity.',
      upaay: 'Always wear white headwear or keep white handkerchief; install pure copper swastika at workplace.',
      varjya: 'Never wear dark black or dark blue head coverings while conducting executive meetings.',
    },
    11: {
      significance: 'Surya in 11th House (Labha & Inflow of Wealth): Continuous gains, influential circles.',
      upaay: 'Donate radish or mustard oil on Saturdays; consume a pinch of jaggery after morning bath.',
      varjya: 'Never consume non-vegetarian food on Sundays, and do not eat stale food given by strangers.',
    },
    12: {
      significance: 'Surya in 12th House (Moksha & Foreign Realms): Spiritual detachment, expenditure, hospitalities.',
      upaay: 'Always have sweet food after meals; maintain an unobstructed courtyard in the center of the house.',
      varjya: 'Never accept free electrical appliances, quartz watches, or ivory items from acquaintances.',
    },
  },
  Moon: {
    1: {
      significance: 'Chandra in 1st House (Mental Radiance): Emotional sensitivity, creative intuition.',
      upaay: 'Always keep a solid silver square piece in your wallet or pocket; seek mother\'s morning blessings.',
      varjya: 'Never sell milk or water for commercial profit; avoid consuming curd or milk late at night.',
    },
    2: {
      significance: 'Chandra in 2nd House (Speech & Heritage): Sweet speech, wealth accumulation, maternal inheritance.',
      upaay: 'Offer raw milk or sugar to a Shiva temple on Mondays; keep rice grains wrapped in silver foil.',
      varjya: 'Never accept free silver ornaments or pearl gems from in-laws or strangers.',
    },
    3: {
      significance: 'Chandra in 3rd House (Courage & Communication): Imaginative mind, artistic endeavors.',
      upaay: 'Offer water to Peepal or Banyan tree roots; share sweets with daughters and young nieces.',
      varjya: 'Never speak untruth about financial commitments or break sacred trusts with close kin.',
    },
    4: {
      significance: 'Chandra in 4th House (Own Home & Matru Bhava): Supreme mental peace, luxury, mother\'s divine grace.',
      upaay: 'Keep an earthen or brass pot filled with clean water in North-East corner of home; replenish weekly.',
      varjya: 'Never disrespect your mother, mother-in-law, or elder maternal figures under any circumstance.',
    },
    5: {
      significance: 'Chandra in 5th House (Intuition & Progeny): Creative brilliance, spiritual devotion.',
      upaay: 'Donate milk and sugar to orphanages or underprivileged students on Shukla Paksha Mondays.',
      varjya: 'Never consume intoxicating substances during twilight or while studying sacred texts.',
    },
    6: {
      significance: 'Chandra in 6th House (Subconscious Healing): Overcomes emotional burdens, empathetic healer.',
      upaay: 'Provide free drinking water to thirsty travelers, public water coolers, or street birds.',
      varjya: 'Never dig a well, borewell, or underground water sump directly under the central Brahmasthan.',
    },
    7: {
      significance: 'Chandra in 7th House (Emotional Union): Compassionate spouse, cordial public relationships.',
      upaay: 'Conduct business transactions with honesty; offer white fragrant flowers at a Devi shrine on Fridays.',
      varjya: 'Never burn milk while boiling on stove; avoid boiling milk over until it spills onto fire.',
    },
    8: {
      significance: 'Chandra in 8th House (Mystic Intuition): Deep psychological depth, ancestral visions.',
      upaay: 'Bring clean water from a crematorium or river boundary and preserve it in a square silver vessel at home.',
      varjya: 'Never swim in turbulent deep water or step into abandoned wells without protective companion.',
    },
    9: {
      significance: 'Chandra in 9th House (Spiritual Pilgrimage): Devoted to dharma, philosophical wisdom.',
      upaay: 'Keep silver items in safe; undertake sacred river baths on Purnima (full moon) days.',
      varjya: 'Never ridicule religious rituals or discard unused sacred offerings into garbage bins.',
    },
    10: {
      significance: 'Chandra in 10th House (Career Empathy): Public goodwill, respected societal standing.',
      upaay: 'Store rain water in a clean glass container; offer white sweets to working elderly women.',
      varjya: 'Never install a water fountain or water fountain pump directly inside the master bedroom.',
    },
    11: {
      significance: 'Chandra in 11th House (Unending Desires): Fulfilment of aspirations, widespread friends.',
      upaay: 'Serve milk with honey to guests; donate white clothing or blankets to destitute mothers.',
      varjya: 'Never consume alcohol or non-vegetarian food on Mondays or full-moon evenings.',
    },
    12: {
      significance: 'Chandra in 12th House (Dream World & Transmutation): Deep sleep, spiritual consciousness.',
      upaay: 'Keep a clean brass vessel filled with water near bedside at night and pour it on a potted plant at dawn.',
      varjya: 'Never sleep on unwashed bedsheets or in complete pitch-dark damp basements.',
    },
  },
  Mars: {
    1: {
      significance: 'Mangal in 1st House (Warrior Spirit): High vitality, fearlessness, athletic prowess.',
      upaay: 'Always wear a pure silver chain around neck; feed sweet rotis (gur ki roti) to stray dogs.',
      varjya: 'Never accept free weapons, knives, swords, or sharp steel cutters from anyone.',
    },
    2: {
      significance: 'Mangal in 2nd House (Vigorous Speech): Strong financial appetite, commanding presence.',
      upaay: 'Donate pure honey or red lentils (masoor dal) to spiritual places on Tuesdays.',
      varjya: 'Never use foul, abusive, or abrasive language toward your spouse or siblings.',
    },
    3: {
      significance: 'Mangal in 3rd House (Unyielding Valour): Tremendous physical courage, protective nature.',
      upaay: 'Wear a pure solid silver ring with no joints (Be-Jod Chandi Chhalla) on left ring finger.',
      varjya: 'Never harbor jealousy toward your brothers or cousin brothers.',
    },
    4: {
      significance: 'Mangal in 4th House (Domestic Energy): Protective of home, intense emotional furnace.',
      upaay: 'Keep pure honey in an earthen pot and place it in the South or South-West corner of the house.',
      varjya: 'NEVER sell ancestral property, farmland, or maternal heritage homes. Never install steel gates on south.',
    },
    5: {
      significance: 'Mangal in 5th House (Fiery Intellect): Sharp strategic insight, competitive excellence.',
      upaay: 'Keep a copper tumbler filled with water by bedside, pour at dawn on a Neem or Marigold plant.',
      varjya: 'Never engage in risky financial speculation or gambling under anger or impulsive pride.',
    },
    6: {
      significance: 'Mangal in 6th House (Unconquerable Defender): Annihilates debts and opposition, robust health.',
      upaay: 'Feed soaked red lentils to birds or monkeys on Tuesdays; support underprivileged sports youth.',
      varjya: 'Never keep rusty iron knives, damaged scissors, or broken mechanical gears at home.',
    },
    7: {
      significance: 'Mangal in 7th House (Passionate Partnerships): Directness in marriage, dynamic companion.',
      upaay: 'Gift silver jewelry or solid silver coin to spouse; maintain sweet demeanor in domestic life.',
      varjya: 'Never insult or provoke spouse in front of third parties or relatives.',
    },
    8: {
      significance: 'Mangal in 8th House (Kundalini & Rebirth): Occult resilience, capacity to overcome crises.',
      upaay: 'Bury pure gur (jaggery) in an earthen pot in an uninhabited, barren natural area.',
      varjya: 'Never keep wild cacti, bonsai, or thorny weeping plants inside the home premises.',
    },
    9: {
      significance: 'Mangal in 9th House (Righteous Defender): Upholds truth, principled pathfinder.',
      upaay: 'Always respect brothers and elders; donate red clothes and jaggery to temple priests.',
      varjya: 'Never disrespect your father, elder brothers, or ancestral preceptors.',
    },
    10: {
      significance: 'Mangal in 10th House (Supreme Digbala): Zenith of career ambition, undisputed authority.',
      upaay: 'Feed sweet milk with saffron to daughters; conduct charity of copper coins.',
      varjya: 'Never show arrogant disrespect toward subordinates, security guards, or domestic helpers.',
    },
    11: {
      significance: 'Mangal in 11th House (Dynamic Prosperity): Multiple income channels, victorious endeavors.',
      upaay: 'Wear a pure copper bangle (Kada) on right wrist; feed sweet halwa to underprivileged children.',
      varjya: 'Never consume sour foods or alcohol when celebrating personal milestone victories.',
    },
    12: {
      significance: 'Mangal in 12th House (Sacred Fighter): Spiritual discipline, detachment, foreign connections.',
      upaay: 'Offer jaggery and roasted chickpeas (chana) to monkeys on Tuesdays; sleep on clean mattress.',
      varjya: 'Never accept free knives, steel implements, or electric heaters from strangers.',
    },
  },
  Mercury: {
    1: {
      significance: 'Budha in 1st House (Mercurial Intelligence): Quick wit, mercantile acumen, youthful charm.',
      upaay: 'Feed green grass or green fodder (palak/chari) to cows on Wednesdays.',
      varjya: 'Never keep non-functional clocks, dead batteries, or broken electronics in your residence.',
    },
    2: {
      significance: 'Budha in 2nd House (Silver Tongue): Persuasive speech, trading success, mathematical skill.',
      upaay: 'Clean your teeth with alum (Fitkari) every morning; donate green whole moong dal on Wednesdays.',
      varjya: 'Never accept free brass showpieces, damaged books, or torn dictionaries from relatives.',
    },
    3: {
      significance: 'Budha in 3rd House (Articulate Voice): Excellent writer, marketer, communicative vigor.',
      upaay: 'Feed birds with soaked whole green gram (Moong); obtain nose piercing with silver wire if afflicted.',
      varjya: 'Never mock or deceive sisters, paternal aunts (Bua), or young female cousins.',
    },
    4: {
      significance: 'Budha in 4th House (Reflective Mind): Scholarly home environment, real estate acumen.',
      upaay: 'Wear silver chain; float green glass marbles or copper coin in running canal or river.',
      varjya: 'Never maintain an indoor parrot in a cage; do not keep birds trapped in cages inside the house.',
    },
    5: {
      significance: 'Budha in 5th House (Analytical Genius): Sharp logic, tactical negotiation, academic honors.',
      upaay: 'Donate green clothing, copper coins, or school stationery to underprivileged girl students.',
      varjya: 'Never give misleading or false advice to youngsters seeking your intellectual counsel.',
    },
    6: {
      significance: 'Budha in 6th House (Detail-Oriented Practitioner): Analytical troubleshooter, forensic clarity.',
      upaay: 'Wear a pure silver ring with no joints; bury a small earthen pot filled with honey in barren soil.',
      varjya: 'Never keep useless paper clutter, expired bills, or cracked mirrors in work desks.',
    },
    7: {
      significance: 'Budha in 7th House (Diplomatic Partner): Intelligent spouse, commercial agreements.',
      upaay: 'Avoid multiple simultaneous partnerships; donate green items to trans persons (Kinnars) with respect.',
      varjya: 'Never mock, belittle, or refuse blessings from trans persons; always honor them respectfully.',
    },
    8: {
      significance: 'Budha in 8th House (Subtle Intellect): Research abilities, esoteric calculation.',
      upaay: 'Pierce the nose and wear a silver wire for 96 days (traditional Lal Kitab remedy for Budha-8).',
      varjya: 'Never change residential places too frequently or keep empty wide-mouthed clay pots facing sky.',
    },
    9: {
      significance: 'Budha in 9th House (Dharmic Intellect): Philosophical scholar, international learning.',
      upaay: 'Feed green grass or spinach to healthy white cows; respect maternal uncles and preceptors.',
      varjya: 'Never criticize ancestral traditions or mock spiritual elders in gatherings.',
    },
    10: {
      significance: 'Budha in 10th House (Executive Intellect): Commercial leadership, respected spokesperson.',
      upaay: 'Donate rice and milk to temple; drink water from silver tumbler to steady fluctuating thoughts.',
      varjya: 'Never consume non-vegetarian food or liquor in business premises or office workstations.',
    },
    11: {
      significance: 'Budha in 11th House (Lucrative Network): Profitable deals, intellectual fraternity.',
      upaay: 'Wear a copper coin pierced with a thread around neck; gift green bangles or clothes to sisters.',
      varjya: 'Never cheat business partners or short-change delivery vendors on account of quick profits.',
    },
    12: {
      significance: 'Budha in 12th House (Imaginative Mind): Global intellect, contemplative philosophy.',
      upaay: 'Wear a solid silver ring; float 12 yellow lemons or green coconuts in running river water.',
      varjya: 'Never speak negative self-fulfilling prophecies before sleeping at night.',
    },
  },
  Jupiter: {
    1: {
      significance: 'Guru in 1st House (Divine Grace & Wisdom): Dignified persona, righteous guide, societal honor.',
      upaay: 'Apply pure saffron (Kesar) or turmeric tilak on forehead, throat, and navel daily.',
      varjya: 'Never take false religious vows or wear imitation yellow jewelry resembling gold.',
    },
    2: {
      significance: 'Guru in 2nd House (Sacred Speech & Wealth): Eloquent counselor, sound inheritance, family harmony.',
      upaay: 'Donate yellow lentils (chana dal) and yellow flowers at religious shrines on Thursdays.',
      varjya: 'Never accept free gold ornaments or spiritual books from relatives with selfish expectations.',
    },
    3: {
      significance: 'Guru in 3rd House (Dharmic Initiative): Benevolent sibling, scholarly communicator.',
      upaay: 'Offer water to Peepal tree roots; donate yellow stationery or pens to poor students.',
      varjya: 'Never use knowledge to mislead subordinates or exploit innocent aspirants.',
    },
    4: {
      significance: 'Guru in 4th House (Sanctuary of Peace): Serene home, spiritual mother, divine security.',
      upaay: 'Always seek blessings of parents and spiritual elders; plant a sacred Tulsi in North-East.',
      varjya: 'Never build a private temple or mandir inside your residential bedroom.',
    },
    5: {
      significance: 'Guru in 5th House (Karmic Merit & Wisdom): Spiritual progeny, high learning, Vedic intuition.',
      upaay: 'Serve temple priests and sadhus; recite Guru mantra or Vishnu Sahasranama regularly.',
      varjya: 'Never abandon higher education halfway or disrespect academic mentors and teachers.',
    },
    6: {
      significance: 'Guru in 6th House (Compassionate Healer): Overcomes hurdles through righteous patience.',
      upaay: 'Offer gram dal wrapped in yellow cloth to elderly brahmins or spiritual preceptors.',
      varjya: 'Never take heavy high-interest loans for show-off luxury or religious ostentation.',
    },
    7: {
      significance: 'Guru in 7th House (Noble Companion): Wise, virtuous spouse, righteous alliances.',
      upaay: 'Keep gold or pure brass items in North-East altar; worship Lord Shiva and Vishnu jointly.',
      varjya: 'Never display anger or stinginess toward guests entering your house.',
    },
    8: {
      significance: 'Guru in 8th House (Occult Guardian): Protected lifespan, esoteric revelation.',
      upaay: 'Donate raw turmeric roots or yellow items to temple; visit holy shrines during Navratri.',
      varjya: 'Never engage in grave-robbing, black magic, or cemetery rituals for material gains.',
    },
    9: {
      significance: 'Guru in 9th House (Pillar of Dharma): Blessed fortune, pilgrimage, divine illumination.',
      upaay: 'Offer yellow sweets at temple on Thursdays; maintain high moral code and dharmic conduct.',
      varjya: 'Never criticize holy scriptures, temples, or saints in private or public conversations.',
    },
    10: {
      significance: 'Guru in 10th House (Respected Statesman): High public office, moral leadership.',
      upaay: 'Clean your teeth with alum; float yellow flowers in river water; respect state authorities.',
      varjya: 'NEVER accept free religious idols, marble deities, or yellow religious clothes from strangers.',
    },
    11: {
      significance: 'Guru in 11th House (Bounteous Harvest): Continuous auspicious gains, noble children.',
      upaay: 'Keep a pure gold wire or ornament on person; feed soaked gram dal to cows on Thursdays.',
      varjya: 'Never hoard wealth while close relatives suffer acute poverty in your vicinity.',
    },
    12: {
      significance: 'Guru in 12th House (Moksha Karaka): Detached saintliness, divine protection during solitude.',
      upaay: 'Water a Peepal tree without touching it on Sundays; keep aniseed (saunf) tied in yellow cloth under pillow.',
      varjya: 'Never entertain fraudulent ascetics or host charlatans under the guise of religious patronage.',
    },
  },
  Venus: {
    1: {
      significance: 'Shukra in 1st House (Aesthetic Magnetic Charm): Artistic flair, attractive aura, refined elegance.',
      upaay: 'Always wear neat, clean, and pleasantly scented clothes; apply pure sandalwood or rose attar.',
      varjya: 'Never wear torn, unwashed, or second-hand clothes gifted by strangers.',
    },
    2: {
      significance: 'Shukra in 2nd House (Bountiful Affluence): Rich voice, luxurious food, thriving prosperity.',
      upaay: 'Feed two white cows with fresh green grass or chapatis smeared with pure cow ghee.',
      varjya: 'Never commit adultery, infidelity, or break solemn marital fidelity pledges.',
    },
    3: {
      significance: 'Shukra in 3rd House (Creative Expression): Expressive writer, artistic hands, graceful movement.',
      upaay: 'Respect all women in your household; gift cosmetics or silver ornaments to your spouse.',
      varjya: 'Never mistreat or humiliate your spouse in family gatherings.',
    },
    4: {
      significance: 'Shukra in 4th House (Palatial Living): Luxurious dwellings, vehicular comforts, domestic joy.',
      upaay: 'Bury a square silver piece in running river water or keep it immersed in pure Ganga Jal at home.',
      varjya: 'Never use dark gloomy black paint or dim dingy lighting in the living room and kitchen.',
    },
    5: {
      significance: 'Shukra in 5th House (Romantic Brilliance): Devoted lover, artistic children, refined intellect.',
      upaay: 'Donate milk, rice, and white sweets to young girl children (Kanya Pujan) during Fridays.',
      varjya: 'Never indulge in loose sensual gossip or consume foul intoxicating drugs.',
    },
    6: {
      significance: 'Shukra in 6th House (Devotional Service): Dedicated worker, needs conscious self-worth care.',
      upaay: 'Feed cows with kneaded wheat flour balls containing sugar; donate white cotton clothes to temples.',
      varjya: 'Never keep thorny cactus plants or dead dried floral arrangements inside the house.',
    },
    7: {
      significance: 'Shukra in 7th House (Conjugal Bliss): Beautiful spouse, thriving trade, loving atmosphere.',
      upaay: 'Offer white fragrant flowers at Goddess Lakshmi shrine on Shukla Paksha Fridays.',
      varjya: 'Never enter into illicit relationships outside marriage; preserve absolute sacred trust.',
    },
    8: {
      significance: 'Shukra in 8th House (Sensual Metamorphosis): Deep romantic intensity, artistic inheritance.',
      upaay: 'Donate a healthy cow to a holy goshala or donate pure cow ghee to temple havan fires.',
      varjya: 'Never accept free cosmetics, perfumes, or luxury silk garments from acquaintances.',
    },
    9: {
      significance: 'Shukra in 9th House (Auspicious Fortune): Artistic travels, cultural diplomacy, divine beauty.',
      upaay: 'Bury a silver square in the soil under a Neem or Peepal tree; seek blessings of elderly women.',
      varjya: 'Never insult female preceptors, mothers, or divine feminine archetypes.',
    },
    10: {
      significance: 'Shukra in 10th House (Renowned Creator): Celebrated in arts, media, fashion, luxury trade.',
      upaay: 'Wash your feet with clean water before entering bed; donate cotton clothes to underprivileged.',
      varjya: 'Never engage in illicit alcohol distribution or unethical entertainment businesses.',
    },
    11: {
      significance: 'Shukra in 11th House (Unending Affluence): Lucrative luxury earnings, loyal friends.',
      upaay: 'Donate curd, camphor, and white sandalwood powder at a sacred temple on Fridays.',
      varjya: 'Never borrow money to purchase ostentatious luxury items beyond your honest means.',
    },
    12: {
      significance: 'Shukra in 12th House (Exalted Sensuality): Supreme worldly and spiritual fulfillment.',
      upaay: 'Donate a cow in charity; donate pure cow ghee to spiritual institutions; maintain cleanliness.',
      varjya: 'Never sleep in filthy unkept bedrooms or leave wet damp clothes inside living spaces.',
    },
  },
  Saturn: {
    1: {
      significance: 'Shani in 1st House (Solemn Architect): Serious demeanor, deep thinker, monumental endurance.',
      upaay: 'Never tell lies; serve leprosy patients or visually impaired persons; keep clean conduct.',
      varjya: 'NEVER consume alcohol, meat, or fish on Saturdays. Never gamble or cheat vulnerable laborers.',
    },
    2: {
      significance: 'Shani in 2nd House (Tested Heritage): Late financial stabilization, disciplined speech.',
      upaay: 'Feed milk or sweet bread to black dogs on Saturday evenings; respect elder family members.',
      varjya: 'Never consume stale non-vegetarian food or use harsh abusive words against family elders.',
    },
    3: {
      significance: 'Shani in 3rd House (Steely Determination): Iron resolve, athletic discipline, fearless.',
      upaay: 'Feed soaked mustard seeds or rotis to black dogs; donate iron cookware (tawa/chimta) to sadhus.',
      varjya: 'Never keep unserviced broken firearms, dull rusty tools, or iron junk in the house.',
    },
    4: {
      significance: 'Shani in 4th House (Tested Foundation): Deep inner detachment, delayed home acquisition.',
      upaay: 'Pour pure mustard oil at the roots of a Peepal tree on Saturdays; offer milk to snakes/temples.',
      varjya: 'Never purchase old second-hand iron gates or scrap metal to construct your residential house.',
    },
    5: {
      significance: 'Shani in 5th House (Rigorous Scholar): Philosophical gravity, late children, deep study.',
      upaay: 'Feed crows with salty snacks or chapati smeared with mustard oil; donate books to poor kids.',
      varjya: 'Never construct an underground pit or dark basement right beneath the children\'s study room.',
    },
    6: {
      significance: 'Shani in 6th House (Subjugator of Foes): Tremendous resistance to sickness, triumphs over odds.',
      upaay: 'Feed mustard oil rotis to stray dogs; donate footwear (leather-free shoes) to manual sweepers.',
      varjya: 'Never mistreat domestic helpers, janitors, sanitation workers, or manual laborers.',
    },
    7: {
      significance: 'Shani in 7th House (Exalted Digbala): Mature spouse, grounded loyalty, sustained trade.',
      upaay: 'Bury a flute filled with brown sugar (shakkar) in an uninhabited barren piece of land.',
      varjya: 'Never marry hastily against ethical guidelines; avoid disrespecting in-laws.',
    },
    8: {
      significance: 'Shani in 8th House (Unshakable Longevity): Endurance through transformations, long lifespan.',
      upaay: 'Pour 8 drops of pure mustard oil into running river water on 8 consecutive Saturdays.',
      varjya: 'Never consume intoxicating liquor or walk uninvited into funeral grounds after dark.',
    },
    9: {
      significance: 'Shani in 9th House (Dharmic Anchor): Serious pilgrimage, traditional scholar, respected sage.',
      upaay: 'Feed rice with black sesame seeds to crows; apply yellow tilak from temple; honor elders.',
      varjya: 'Never mock traditional dharmic rituals or insult ascetic monks who visit your town.',
    },
    10: {
      significance: 'Shani in 10th House (Supreme Karmadhipati): Unprecedented career rise through sweat and grit.',
      upaay: 'Offer water to Peepal tree daily except Sundays; serve elderly people in retirement homes.',
      varjya: 'Never take government bribes or exploit manual labor without fair daily compensation.',
    },
    11: {
      significance: 'Shani in 11th House (Unending Harvest): Wealthy networks, lifelong friends, steady dividends.',
      upaay: 'Pour milk or pure water on Banyan tree roots; keep mustard oil in an iron container at home.',
      varjya: 'Never deceive business partners or short-change daily wage earners on their hard-earned pay.',
    },
    12: {
      significance: 'Shani in 12th House (Yogic Detachment): Solitary contemplation, spiritual austerity.',
      upaay: 'Never tell lies; feed fish with wheat balls; donate dark blankets to destitute homeless in winter.',
      varjya: 'Never install a dark windowless bar or liquor cellar in the North-East sector of your house.',
    },
  },
  Rahu: {
    1: {
      significance: 'Rahu in 1st House (Electric Visionary): Unconventional genius, intense ambition, global impact.',
      upaay: 'Wear a pure solid silver ball around your neck or keep a solid silver pebble in your wallet.',
      varjya: 'NEVER accept free gifts of black blankets, electrical gadgets, or secondhand leather shoes from anyone.',
    },
    2: {
      significance: 'Rahu in 2nd House (Sudden Fortunes): Unpredictable cash inflow, innovative financial moves.',
      upaay: 'Keep a small solid silver ball wrapped in yellow cloth in your safe or cash drawer.',
      varjya: 'Never consume spicy stale food or speak sarcastic harsh words when negotiating contracts.',
    },
    3: {
      significance: 'Rahu in 3rd House (Audacious Enterprise): Media pioneer, fearlessly breaks conventions.',
      upaay: 'Wear a pure silver ring or bracelet; distribute sweet snacks to poor children.',
      varjya: 'Never display contempt toward your neighbors or cheat digital media collaborators.',
    },
    4: {
      significance: 'Rahu in 4th House (Restless Sanctuary): High digital mobility, unconventional domestic setting.',
      upaay: 'Float dried whole coriander seeds (dhaniya) or raw almonds in running river water.',
      varjya: 'Never build an uncovered roof drainage channel directly dropping dirty water over entrance door.',
    },
    5: {
      significance: 'Rahu in 5th House (Avant-Garde Mind): High-tech brilliance, speculative talent.',
      upaay: 'Keep an elephant idol made of pure silver inside the living room; recite Saraswati mantra.',
      varjya: 'Never indulge in high-leverage blind day trading or speculative gambling in crypto/casinos.',
    },
    6: {
      significance: 'Rahu in 6th House (Annihilator of Obstacles): Overcomes impossible odds, legal victor.',
      upaay: 'Feed dogs with wheat bread; carry a black-and-white thread on wrist during travel.',
      varjya: 'Never keep aggressive fighting dogs or torment street animals.',
    },
    7: {
      significance: 'Rahu in 7th House (Unconventional Partner): Cross-cultural marriage, foreign alliances.',
      upaay: 'Offer 6 dry coconuts into running river water; keep silver coin gifted by spouse.',
      varjya: 'Never enter into hasty secret marriages or cheat marital partner on international trips.',
    },
    8: {
      significance: 'Rahu in 8th House (Occult Investigator): Uncovering hidden secrets, psychic sensitivity.',
      upaay: 'Keep 8 silver coins or a silver square in an earthen pot filled with honey in dark corner.',
      varjya: 'Never experiment with occult summoning, necromancy, or hazardous chemicals without protection.',
    },
    9: {
      significance: 'Rahu in 9th House (Revolutionary Thinker): Global philosophy, foreign migrations.',
      upaay: 'Apply pure saffron (Kesar) tilak on forehead daily; always keep a pure silver coin with you.',
      varjya: 'Never disrespect your grandfather, spiritual preceptors, or traditional pilgrimage sites.',
    },
    10: {
      significance: 'Rahu in 10th House (Apex Disrupter): High political or corporate influence, media fame.',
      upaay: 'Always wear white headwear or keep white cloth; feed blind persons or sadhus on Saturdays.',
      varjya: 'Never work in shady illegal smuggling or fraudulent financial pyramid schemes.',
    },
    11: {
      significance: 'Rahu in 11th House (Unbounded Wealth Flow): Sudden windfall profits, elite connections.',
      upaay: 'Drink water in a pure silver tumbler; wear a silver ring with an unblemished Gomed (Hessonite).',
      varjya: 'Never engage in financial bribery or accept illicit wealth from fraudulent schemes.',
    },
    12: {
      significance: 'Rahu in 12th House (Global Astral Voyager): Deep lucid dreams, international settlements.',
      upaay: 'Take your daily meals inside the kitchen area; avoid dining in bed; place Saunf in red pouch.',
      varjya: 'Never take your meals while sitting on your bed or in messy uncleaned living spaces.',
    },
  },
  Ketu: {
    1: {
      significance: 'Ketu in 1st House (Monk\'s Mind): Detached spiritual focus, intuitive healer, mystical aura.',
      upaay: 'Feed black-and-white spotted stray dogs with bread; keep a two-colored wool blanket for donation.',
      varjya: 'Never speak ill of sadhus, spiritual hermits, or ascetics.',
    },
    2: {
      significance: 'Ketu in 2nd House (Esoteric Wisdom): Prophetic speech, detached from material wealth.',
      upaay: 'Apply saffron or turmeric tilak on forehead and navel; donate two-colored blanket to temple.',
      varjya: 'Never use sarcastic biting words that hurt the dignity of young children or seekers.',
    },
    3: {
      significance: 'Ketu in 3rd House (Steely Spiritual Courage): Fearless practitioner, protective guardian.',
      upaay: 'Wear a pure gold wire in your left ear or on person; donate saffron to holy shrines.',
      varjya: 'Never pick physical fights or intimidate vulnerable younger peers.',
    },
    4: {
      significance: 'Ketu in 4th House (Soul Wanderer): Seeks transcendental peace beyond worldly homes.',
      upaay: 'Offer yellow lemons or yellow flowers to Lord Ganesha; feed dogs with bread daily.',
      varjya: 'Never construct noisy industrial workshops or install heavy vibrating motors near home altar.',
    },
    5: {
      significance: 'Ketu in 5th House (Moksha Intellect): Deep past-life mantras, intuitive scholar.',
      upaay: 'Donate milk and sugar at temple; recite Ganesha Atharvashirsha for intellectual serenity.',
      varjya: 'Never abandon your spiritual sittings halfway or mock divine childhood deities.',
    },
    6: {
      significance: 'Ketu in 6th House (Exalted Victory): Unconditional divine shield against illnesses and enmity.',
      upaay: 'Wear a pure gold ring on left hand; feed stray dogs with milk bread every morning.',
      varjya: 'Never torment dogs or throw stones at stray animals on streets.',
    },
    7: {
      significance: 'Ketu in 7th House (Spiritual Partner): Relationship focused on karmic liberation.',
      upaay: 'Donate sweet rotis (gur ki roti) to stray dogs; maintain respectful sweet speech with spouse.',
      varjya: 'Never harbor lingering vindictive grudges or stonewall communication in marriage.',
    },
    8: {
      significance: 'Ketu in 8th House (Kundalini Awener): Mystic breakthroughs, ancestral guardian spirits.',
      upaay: 'Donate a black and white wool blanket to an elderly needy person or temple sadhu.',
      varjya: 'Never accept free black clothes, broken leather bags, or rusty locks from strangers.',
    },
    9: {
      significance: 'Ketu in 9th House (Dharmic Pilgrim): Direct connection to lineage gurus, profound insight.',
      upaay: 'Keep a pure gold chain or wire; touch elder family members\' feet; honor preceptors.',
      varjya: 'Never desecrate ancient religious ruins, temple ponds, or abandoned sacred groves.',
    },
    10: {
      significance: 'Ketu in 10th House (Renounced Ruler): Accomplishes high duties with detached excellence.',
      upaay: 'Feed dogs with fresh milk; keep a silver swastika at your workplace altar.',
      varjya: 'Never be ungrateful to mentors who gave you your first career breakthrough.',
    },
    11: {
      significance: 'Ketu in 11th House (Spiritual Abundance): Effortless resource flow, benevolent donors.',
      upaay: 'Wear a pure gold ring with an untreated Cat\'s Eye (Lehsuniya) only if consecrated.',
      varjya: 'Never hoard wealth while promising charitable contributions you refuse to disburse.',
    },
    12: {
      significance: 'Ketu in 12th House (Moksha Gateway): Supreme spiritual liberation, divine light.',
      upaay: 'Feed dogs and birds daily; maintain a quiet meditation sanctuary in the North-East.',
      varjya: 'Never indulge in slanderous gossip behind people\'s backs.',
    },
  },
};

/**
 * Resolves comprehensive Lal Kitab Upaays and Varjya (Forbidden Actions)
 * for a native based on their calculated birth chart.
 */
export function resolveLalKitabRemedies(chart: any, focusArea?: string): LalKitabRemedyResult {
  const primaryUpaays: LalKitabRemedyResult['primaryUpaays'] = [];
  const varjyaAlerts: LalKitabRemedyResult['varjyaAlerts'] = [];

  const placements = Array.isArray(chart?.planetaryDegrees)
    ? chart.planetaryDegrees
    : [];

  placements.forEach((p: any) => {
    const planetName = p.planet;
    const houseNum = Number(p.house) || 1;

    const planetMatrix = LAL_KITAB_MATRIX[planetName];
    if (planetMatrix && planetMatrix[houseNum]) {
      const entry = planetMatrix[houseNum];

      // Primary upaay for prominent or afflicted planets (Rahu, Ketu, Saturn, Mars, Sun)
      if (['Rahu', 'Ketu', 'Saturn', 'Mars', 'Sun'].includes(planetName) || primaryUpaays.length < 3) {
        primaryUpaays.push({
          planet: planetName,
          house: houseNum,
          title: `Lal Kitab ${planetName} in House ${houseNum} Upaay`,
          upaay: entry.upaay,
          procedure: entry.significance,
        });
      }

      // Varjya alert
      varjyaAlerts.push({
        planet: planetName,
        house: houseNum,
        actionToAvoid: entry.varjya,
        consequence: `Violating this activates negative karmic debt (Rina) associated with ${planetName} in House ${houseNum}.`,
      });
    }
  });

  // Fallback defaults if chart placements are missing
  if (primaryUpaays.length === 0) {
    primaryUpaays.push({
      planet: 'Saturn',
      house: 10,
      title: 'Lal Kitab Karma Alignment Upaay',
      upaay: 'Feed crows and stray dogs with bread smeared in pure mustard oil on Saturday evenings.',
      procedure: 'Harmonizes work efforts and prevents unexpected hurdles in profession.',
    });
    primaryUpaays.push({
      planet: 'Rahu',
      house: 1,
      title: 'Lal Kitab Mental Equilibrium Upaay',
      upaay: 'Keep a small solid silver ball (Be-Jod Goli) in your wallet or pocket at all times.',
      procedure: 'Absorbs chaotic mental frequencies and dispels illusionary anxiety.',
    });
  }

  if (varjyaAlerts.length === 0) {
    varjyaAlerts.push({
      planet: 'Saturn',
      house: 1,
      actionToAvoid: 'Never consume alcohol or non-vegetarian food on Saturdays.',
      consequence: 'Prevents severe delays in professional promotions and physical vitality.',
    });
    varjyaAlerts.push({
      planet: 'Rahu',
      house: 1,
      actionToAvoid: 'Never accept free gifts of black blankets, electrical appliances, or secondhand leather shoes.',
      consequence: 'Shields native against sudden illusionary financial losses and deceptive associations.',
    });
  }

  return {
    primaryUpaays: primaryUpaays.slice(0, 4),
    varjyaAlerts: varjyaAlerts.slice(0, 4),
    ancestralDebt: {
      debtType: 'Pitra Rina / Matru Rina Balance (Lal Kitab Canon)',
      cause: 'Planetary placement indicates ancestral commitments needing regular dharmic appeasement.',
      remedy: 'Conduct collective family Anna Dana (food donation) to underprivileged elders on Amavasya days.',
    },
  };
}
