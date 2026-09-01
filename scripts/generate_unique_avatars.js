const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'ai-astrologers');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Base SVG Templates tailored for different genders and spiritual styles
function createSadhuSVG(name, primaryColor, secondaryColor, accentColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${secondaryColor}" />
      <stop offset="70%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="#0A0512" />
    </radialGradient>
    <radialGradient id="aura-grad" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.6" />
      <stop offset="70%" stop-color="${accentColor}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg-grad)" rx="30"/>
  <circle cx="200" cy="180" r="140" fill="url(#aura-grad)" />
  <circle cx="200" cy="180" r="110" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="4,6" opacity="0.6"/>
  
  <g transform="translate(100, 70)">
    <path d="M 100 20 L 100 0 M 100 260 L 100 280 M 20 140 L 0 140 M 180 140 L 200 140 M 43 43 L 29 29 M 157 157 L 171 171" stroke="${accentColor}" stroke-width="2" opacity="0.4" />
    <path d="M 30 250 Q 100 190 170 250 Z" fill="${primaryColor}" opacity="0.9"/>
    <circle cx="100" cy="110" r="52" fill="#E5C39E"/>
    <circle cx="100" cy="62" r="28" fill="${secondaryColor}"/>
    <path d="M 96 90 L 104 90 L 100 120 Z" fill="${accentColor}"/>
    <circle cx="100" cy="100" r="3" fill="#D62828"/>
    <path d="M 45 220 C 70 160 130 160 155 220 L 175 260 L 25 260 Z" fill="${accentColor}" opacity="0.85"/>
    <path d="M 60 170 Q 100 230 140 170" fill="none" stroke="#5C2B11" stroke-width="6" stroke-dasharray="8,4"/>
  </g>
  
  <rect x="12" y="12" width="376" height="376" rx="22" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.4"/>
  <text x="200" y="360" font-family="'Cinzel', 'Georgia', serif" font-size="14" font-weight="bold" fill="${accentColor}" text-anchor="middle" letter-spacing="1">${name.toUpperCase()}</text>
</svg>`;
}

function createFemaleSeerSVG(name, primaryColor, secondaryColor, accentColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${secondaryColor}" />
      <stop offset="70%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="#0A0512" />
    </radialGradient>
    <radialGradient id="aura-grad" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg-grad)" rx="30"/>
  <circle cx="200" cy="180" r="130" fill="url(#aura-grad)" />
  
  <g transform="translate(100, 70)">
    <path d="M 20 260 Q 100 180 180 260 Z" fill="${accentColor}" opacity="0.9"/>
    <circle cx="100" cy="115" r="48" fill="#F3D5B5"/>
    <path d="M 52 115 C 52 65 148 65 148 115 C 148 85 52 85 52 115 Z" fill="#1C1018"/>
    <circle cx="100" cy="108" r="5" fill="#C1121F"/>
    <path d="M 40 210 Q 100 250 160 210 L 175 260 L 25 260 Z" fill="${secondaryColor}"/>
    <path d="M 50 170 Q 100 210 150 170" fill="none" stroke="${accentColor}" stroke-width="4"/>
  </g>
  
  <rect x="12" y="12" width="376" height="376" rx="22" fill="none" stroke="${accentColor}" stroke-width="2" opacity="0.4"/>
  <text x="200" y="360" font-family="'Cinzel', 'Georgia', serif" font-size="14" font-weight="bold" fill="${accentColor}" text-anchor="middle" letter-spacing="1">${name.toUpperCase()}</text>
</svg>`;
}

const astrologers = [
  { id: 'ai-swami-ji', name: 'Swami Shankarananda', type: 'sadhu', c1: '#2A1B3D', c2: '#6B2D5C', ca: '#F59E0B' },
  { id: 'ai-acharya-devavrat', name: 'Acharya Devavrat Shastri', type: 'sadhu', c1: '#1E293B', c2: '#475569', ca: '#EAB308' },
  { id: 'ai-pt-radhey-shastri', name: 'Pt. Radhey Shyam', type: 'sadhu', c1: '#31101E', c2: '#701A28', ca: '#F97316' },
  { id: 'ai-shastri-vidyadhar', name: 'Shastri Vidyadhar Bhatt', type: 'sadhu', c1: '#141E2B', c2: '#2D3748', ca: '#38BDF8' },
  { id: 'ai-swami-anand', name: 'Swami Anandamurti', type: 'sadhu', c1: '#3B1F0E', c2: '#7C2D12', ca: '#FB923C' },
  { id: 'ai-swami-rao', name: 'Swami Sadasiva Rao', type: 'sadhu', c1: '#1E1B4B', c2: '#3730A3', ca: '#A78BFA' },
  { id: 'ai-love-guru', name: 'Acharya Raghvendra', type: 'sadhu', c1: '#4C1D95', c2: '#7C3AED', ca: '#F472B6' },
  { id: 'ai-acharya-shreya', name: 'Acharya Shreya Devi', type: 'female', c1: '#581C87', c2: '#831843', ca: '#F472B6' },
  { id: 'ai-pt-madhav-sharma', name: 'Pandit Madhav Sharma', type: 'sadhu', c1: '#064E3B', c2: '#047857', ca: '#34D399' },
  { id: 'ai-guru-smita-patel', name: 'Guru Smita Patel', type: 'female', c1: '#831843', c2: '#9D174D', ca: '#F43F5E' },
  { id: 'ai-pt-anurag-mishra', name: 'Pt. Anurag Mishra', type: 'sadhu', c1: '#1E3A8A', c2: '#1D4ED8', ca: '#60A5FA' },
  { id: 'ai-meera-devi-love', name: 'Yogini Meera Devi', type: 'female', c1: '#4C1D95', c2: '#6D28D9', ca: '#C084FC' },
  { id: 'ai-arjun-pandit', name: 'Arjun Pandit', type: 'sadhu', c1: '#0F172A', c2: '#334155', ca: '#38BDF8' },
  { id: 'ai-dr-raman', name: 'Dr. K. N. Raman', type: 'sadhu', c1: '#1C1917', c2: '#44403C', ca: '#F59E0B' },
  { id: 'ai-acharya-somesh-career', name: 'Acharya Someshwar Nath', type: 'sadhu', c1: '#312E81', c2: '#4338CA', ca: '#818CF8' },
  { id: 'ai-pt-vijay-choudhury', name: 'Pt. Vijay Choudhury', type: 'sadhu', c1: '#065F46', c2: '#059669', ca: '#10B981' },
  { id: 'ai-guru-deepak-tech', name: 'Guru Deepak Verma', type: 'sadhu', c1: '#1E293B', c2: '#0284C7', ca: '#38BDF8' },
  { id: 'ai-acharya-manish-legal', name: 'Acharya Manish Trivedi', type: 'sadhu', c1: '#451A03', c2: '#78350F', ca: '#F59E0B' },
  { id: 'ai-acharya-dhananjay', name: 'Acharya Dhananjay Shastri', type: 'sadhu', c1: '#701A75', c2: '#86198F', ca: '#F0ABFC' },
  { id: 'ai-guru-anil-wealth', name: 'Guru Anil Shastri', type: 'sadhu', c1: '#064E3B', c2: '#047857', ca: '#FBBF24' },
  { id: 'ai-pt-kuberan-iyer', name: 'Pandit Kuberan Iyer', type: 'sadhu', c1: '#1E1B4B', c2: '#312E81', ca: '#F59E0B' },
  { id: 'ai-acharya-lakshmi-kant', name: 'Acharya Lakshmi Kant', type: 'sadhu', c1: '#78350F', c2: '#B45309', ca: '#FDE047' },
  { id: 'ai-pt-dinanath-shukla', name: 'Pt. Dinanath Shukla', type: 'sadhu', c1: '#1F2937', c2: '#374151', ca: '#E5E7EB' },
  { id: 'ai-guru-kamala-devi', name: 'Guru Kamala Devi', type: 'female', c1: '#701A75', c2: '#A21CAF', ca: '#F472B6' },
  { id: 'ai-acharya-vikram', name: 'Acharya Vikramaditya', type: 'sadhu', c1: '#14532D', c2: '#166534', ca: '#4ADE80' },
  { id: 'ai-vastu-meenakshi', name: 'Vastu Meenakshi', type: 'female', c1: '#065F46', c2: '#047857', ca: '#34D399' },
  { id: 'ai-pt-somnath-vastu', name: 'Pt. Somnath Dave', type: 'sadhu', c1: '#365314', c2: '#3F6212', ca: '#84CC16' },
  { id: 'ai-acharya-bhuvanesh', name: 'Acharya Bhuvanesh Joshi', type: 'sadhu', c1: '#164E63', c2: '#0891B2', ca: '#22D3EE' },
  { id: 'ai-mr-krishnam', name: 'Acharya Krishnamurti', type: 'sadhu', c1: '#1E1B4B', c2: '#4338CA', ca: '#A78BFA' },
  { id: 'ai-dr-anand-kp', name: 'Dr. Anand Ramanathan', type: 'sadhu', c1: '#0F172A', c2: '#1E293B', ca: '#38BDF8' },
  { id: 'ai-kp-acharya-murugan', name: 'KP Acharya Murugan', type: 'sadhu', c1: '#31101E', c2: '#831843', ca: '#F472B6' },
  { id: 'ai-kp-shastri-venkatesh', name: 'KP Shastri Venkatesh', type: 'sadhu', c1: '#1E3A8A', c2: '#2563EB', ca: '#93C5FD' },
  { id: 'ai-meera-devi-nadi', name: 'Astro Ananya Devi', type: 'female', c1: '#0F766E', c2: '#0D9488', ca: '#2DD4BF' },
  { id: 'ai-agastya-seer-senthil', name: 'Gurukkal Senthil Nathan', type: 'sadhu', c1: '#451A03', c2: '#9A3412', ca: '#FB923C' },
  { id: 'ai-nadi-master-thangavel', name: 'Nadi Master Thangavelu', type: 'sadhu', c1: '#3F6212', c2: '#4D7C0F', ca: '#A3E635' },
  { id: 'ai-meera-devi-nadi-2', name: 'Nadi Sharada Devi', type: 'female', c1: '#581C87', c2: '#7E22CE', ca: '#E9D5FF' },
  { id: 'ai-prashna-murthy', name: 'Acharya Prashna Murthy', type: 'sadhu', c1: '#1E1B4B', c2: '#3730A3', ca: '#C084FC' },
  { id: 'ai-pt-jagannath-prashna', name: 'Pandit Jagannath Mishra', type: 'sadhu', c1: '#31101E', c2: '#9F1239', ca: '#FB7185' },
  { id: 'ai-acharya-trikal', name: 'Acharya Trikal Sharma', type: 'sadhu', c1: '#0284C7', c2: '#0369A1', ca: '#7DD3FC' },
  { id: 'ai-prashna-vidya-devi', name: 'Vidya Devi Prashna', type: 'female', c1: '#831843', c2: '#BE185D', ca: '#F472B6' },
  { id: 'ai-pandit-raghav-lalkitab', name: 'Pandit Raghavendra Rao', type: 'sadhu', c1: '#7F1D1D', c2: '#991B1B', ca: '#FCA5A5' },
  { id: 'ai-acharya-girdhari-lal', name: 'Acharya Girdhari Lal', type: 'sadhu', c1: '#9A3412', c2: '#C2410C', ca: '#FFEDD5' },
  { id: 'ai-pt-makhan-lal', name: 'Pt. Makhan Lal Sharma', type: 'sadhu', c1: '#854D0E', c2: '#A16207', ca: '#FEF08A' },
  { id: 'ai-priya-numerology', name: 'Priya Sharma', type: 'female', c1: '#1E293B', c2: '#334155', ca: '#38BDF8' },
  { id: 'ai-anka-vidya-rishi', name: 'Rishi Anka Shastri', type: 'sadhu', c1: '#3B0764', c2: '#581C87', ca: '#D8B4FE' },
  { id: 'ai-numerologist-kabir', name: 'Kabir Varma', type: 'sadhu', c1: '#0F172A', c2: '#0284C7', ca: '#38BDF8' },
  { id: 'ai-tarot-sophia', name: 'Mystic Sophia', type: 'female', c1: '#31101E', c2: '#701A75', ca: '#F0ABFC' },
  { id: 'ai-oracle-maya', name: 'Oracle Maya Starlight', type: 'female', c1: '#1E1B4B', c2: '#4C1D95', ca: '#E9D5FF' },
  { id: 'ai-guru-anil-gems', name: 'Ratna Guru Anil Shastri', type: 'sadhu', c1: '#064E3B', c2: '#047857', ca: '#6EE7B7' },
  { id: 'ai-acharya-joshi-remedies', name: 'Acharya Joshi Dosh Nivaran', type: 'sadhu', c1: '#451A03', c2: '#78350F', ca: '#FDE047' },
];

let created = 0;
for (const a of astrologers) {
  const fileName = `${a.id}.svg`;
  const filePath = path.join(targetDir, fileName);
  const svgContent = a.type === 'female'
    ? createFemaleSeerSVG(a.name, a.c1, a.c2, a.ca)
    : createSadhuSVG(a.name, a.c1, a.c2, a.ca);
  fs.writeFileSync(filePath, svgContent);
  created++;
}

console.log(`Successfully generated ${created} unique dedicated SVG avatars in public/assets/images/ai-astrologers/`);
