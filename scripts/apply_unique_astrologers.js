const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'aiAstrologerData.ts');
let content = fs.readFileSync(filePath, 'utf8');

const updates = {
  'ai-swami-ji': { name: 'Swami Shankarananda Giri', avatar: '/assets/images/ai-astrologers/swami-ji.png' },
  'ai-acharya-devavrat': { name: 'Acharya Devavrat Shastri', avatar: '/assets/images/ai-astrologers/acharya-devavrat.png' },
  'ai-pt-radhey-shastri': { name: 'Pandit Radhey Shyam Chaturvedi', avatar: '/assets/images/ai-astrologers/ai-pt-radhey-shastri.svg' },
  'ai-shastri-vidyadhar': { name: 'Shastri Vidyadhar Bhatt', avatar: '/assets/images/ai-astrologers/ai-shastri-vidyadhar.svg' },
  'ai-swami-anand': { name: 'Swami Anandamurti Saraswati', avatar: '/assets/images/ai-astrologers/ai-swami-anand.svg' },
  'ai-swami-rao': { name: 'Swami Sadasiva Rao', avatar: '/assets/images/ai-astrologers/mr-rao.png' },
  'ai-love-guru': { name: 'Acharya Raghvendra Shastri', avatar: '/assets/images/ai-astrologers/love-guru.png' },
  'ai-acharya-shreya': { name: 'Acharya Shreya Devi', avatar: '/assets/images/ai-astrologers/ai-acharya-shreya.svg' },
  'ai-pt-madhav-sharma': { name: 'Pandit Madhav Sharma', avatar: '/assets/images/ai-astrologers/ai-pt-madhav-sharma.svg' },
  'ai-guru-smita-patel': { name: 'Guru Smita Patel', avatar: '/assets/images/ai-astrologers/ai-guru-smita-patel.svg' },
  'ai-pt-anurag-mishra': { name: 'Pt. Anurag Mishra', avatar: '/assets/images/ai-astrologers/ai-pt-anurag-mishra.svg' },
  'ai-meera-devi-love': { name: 'Yogini Meera Devi', avatar: '/assets/images/ai-astrologers/meera-devi.png' },
  'ai-arjun-pandit': { name: 'Arjun Pandit', avatar: '/assets/images/ai-astrologers/arjun-pandit.png' },
  'ai-dr-raman': { name: 'Dr. K. N. Raman', avatar: '/assets/images/ai-astrologers/dr-raman.png' },
  'ai-acharya-somesh-career': { name: 'Acharya Someshwar Nath', avatar: '/assets/images/ai-astrologers/ai-acharya-somesh-career.svg' },
  'ai-pt-vijay-choudhury': { name: 'Pt. Vijay Choudhury', avatar: '/assets/images/ai-astrologers/ai-pt-vijay-choudhury.svg' },
  'ai-guru-deepak-tech': { name: 'Guru Deepak Verma', avatar: '/assets/images/ai-astrologers/ai-guru-deepak-tech.svg' },
  'ai-acharya-manish-legal': { name: 'Acharya Manish Trivedi', avatar: '/assets/images/ai-astrologers/ai-acharya-manish-legal.svg' },
  'ai-acharya-dhananjay': { name: 'Acharya Dhananjay Shastri', avatar: '/assets/images/ai-astrologers/ai-acharya-dhananjay.svg' },
  'ai-guru-anil-wealth': { name: 'Guru Anil Shastri', avatar: '/assets/images/ai-astrologers/guru-anil.png' },
  'ai-pt-kuberan-iyer': { name: 'Pandit Kuberan Iyer', avatar: '/assets/images/ai-astrologers/ai-pt-kuberan-iyer.svg' },
  'ai-acharya-lakshmi-kant': { name: 'Acharya Lakshmi Kant Agnihotri', avatar: '/assets/images/ai-astrologers/ai-acharya-lakshmi-kant.svg' },
  'ai-pt-dinanath-shukla': { name: 'Pt. Dinanath Shukla', avatar: '/assets/images/ai-astrologers/ai-pt-dinanath-shukla.svg' },
  'ai-guru-kamala-devi': { name: 'Guru Kamala Devi', avatar: '/assets/images/ai-astrologers/ai-guru-kamala-devi.svg' },
  'ai-acharya-vikram': { name: 'Acharya Vikramaditya Vastu', avatar: '/assets/images/ai-astrologers/acharya-vikram.png' },
  'ai-vastu-meenakshi': { name: 'Vastu Acharya Meenakshi Sundaram', avatar: '/assets/images/ai-astrologers/ai-vastu-meenakshi.svg' },
  'ai-pt-somnath-vastu': { name: 'Pt. Somnath Dave', avatar: '/assets/images/ai-astrologers/ai-pt-somnath-vastu.svg' },
  'ai-acharya-bhuvanesh': { name: 'Acharya Bhuvanesh Joshi', avatar: '/assets/images/ai-astrologers/ai-acharya-bhuvanesh.svg' },
  'ai-mr-krishnam': { name: 'Acharya Krishnamurti Das', avatar: '/assets/images/ai-astrologers/mr-krishnam.png' },
  'ai-dr-anand-kp': { name: 'Dr. Anand Ramanathan', avatar: '/assets/images/ai-astrologers/dr-anand-raman.png' },
  'ai-kp-acharya-murugan': { name: 'KP Acharya Murugan', avatar: '/assets/images/ai-astrologers/ai-kp-acharya-murugan.svg' },
  'ai-kp-shastri-venkatesh': { name: 'KP Shastri Venkatesh', avatar: '/assets/images/ai-astrologers/ai-kp-shastri-venkatesh.svg' },
  'ai-meera-devi-nadi': { name: 'Astro Ananya Devi', avatar: '/assets/images/ai-astrologers/astro-ananya.png' },
  'ai-agastya-seer-senthil': { name: 'Gurukkal Senthil Nathan', avatar: '/assets/images/ai-astrologers/ai-agastya-seer-senthil.svg' },
  'ai-nadi-master-thangavel': { name: 'Nadi Master Thangavelu', avatar: '/assets/images/ai-astrologers/ai-nadi-master-thangavel.svg' },
  'ai-meera-devi-nadi-2': { name: 'Nadi Seer Sharada Devi', avatar: '/assets/images/ai-astrologers/ai-meera-devi-nadi-2.svg' },
  'ai-prashna-murthy': { name: 'Acharya Prashna Murthy', avatar: '/assets/images/ai-astrologers/ai-prashna-murthy.svg' },
  'ai-pt-jagannath-prashna': { name: 'Pandit Jagannath Mishra', avatar: '/assets/images/ai-astrologers/ai-pt-jagannath-prashna.svg' },
  'ai-acharya-trikal': { name: 'Acharya Trikal Sharma', avatar: '/assets/images/ai-astrologers/ai-acharya-trikal.svg' },
  'ai-prashna-vidya-devi': { name: 'Vidya Devi Prashna', avatar: '/assets/images/ai-astrologers/ai-prashna-vidya-devi.svg' },
  'ai-pandit-raghav-lalkitab': { name: 'Pandit Raghavendra Rao', avatar: '/assets/images/ai-astrologers/pandit-raghav.png' },
  'ai-acharya-girdhari-lal': { name: 'Acharya Girdhari Lal', avatar: '/assets/images/ai-astrologers/ai-acharya-girdhari-lal.svg' },
  'ai-pt-makhan-lal': { name: 'Pt. Makhan Lal Sharma', avatar: '/assets/images/ai-astrologers/ai-pt-makhan-lal.svg' },
  'ai-priya-numerology': { name: 'Priya Sharma', avatar: '/assets/images/ai-astrologers/priya-sharma.png' },
  'ai-anka-vidya-rishi': { name: 'Rishi Anka Shastri', avatar: '/assets/images/ai-astrologers/ai-anka-vidya-rishi.svg' },
  'ai-numerologist-kabir': { name: 'Kabir Varma', avatar: '/assets/images/ai-astrologers/ai-numerologist-kabir.svg' },
  'ai-tarot-sophia': { name: 'Mystic Sophia', avatar: '/assets/images/ai-astrologers/love-oracle.png' },
  'ai-oracle-maya': { name: 'Oracle Maya Starlight', avatar: '/assets/images/ai-astrologers/mystic-sophia.png' },
  'ai-guru-anil-gems': { name: 'Ratna Guru Anil Shastri', avatar: '/assets/images/ai-astrologers/ai-guru-anil-gems.svg' },
  'ai-acharya-joshi-remedies': { name: 'Acharya Joshi Dosh Nivaran', avatar: '/assets/images/ai-astrologers/acharya-joshi.png' }
};

// Replace names and avatars per ID block in DEFAULT_AI_ASTROLOGERS
let updatedCount = 0;
for (const [id, info] of Object.entries(updates)) {
  const blockRegex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?name:\\s*')([^']+)'([\\s\\S]*?avatar:\\s*')([^']+)'`, 'g');
  if (blockRegex.test(content)) {
    content = content.replace(blockRegex, `$1${info.name}'$3${info.avatar}'`);
    updatedCount++;
  } else {
    console.warn(`Could not find block for ID: ${id}`);
  }
}

// 2. Remove .endsWith('.svg') check in normalizeAIAstrologerAvatar
content = content.replace(
  "if (!astro.avatar || astro.avatar.includes('unsplash.com') || astro.avatar.endsWith('.svg')) {",
  "if (!astro.avatar || astro.avatar.includes('unsplash.com')) {"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Updated ${updatedCount} astrologer records in aiAstrologerData.ts`);
