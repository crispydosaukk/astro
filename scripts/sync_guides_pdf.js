const fs = require('fs');
const path = require('path');

const remediesDir = path.join(__dirname, '..', 'public', 'assets', 'images', 'remedies');
const pdfsDir = path.join(__dirname, '..', 'public', 'assets', 'pdfs');

if (!fs.existsSync(remediesDir)) {
  fs.mkdirSync(remediesDir, { recursive: true });
}

// Copy to match the old Firestore uploaded filenames
const rahuSurvivalSrc = path.join(pdfsDir, 'rahu_mahadasha_survival_guide.pdf');
const rahuStabSrc = path.join(pdfsDir, 'rahu_mahadasha_stabilisation_guide.pdf');
const saniStabSrc = path.join(pdfsDir, 'sani_mahadasha_stabilisation_guide.pdf');
const saniSurvivalSrc = path.join(pdfsDir, 'sani_mahadasha_survival_guide.pdf');

fs.copyFileSync(rahuSurvivalSrc, path.join(remediesDir, 'remedy_1787120599971.pdf'));
fs.copyFileSync(saniStabSrc, path.join(remediesDir, 'remedy_1787120609999.pdf'));
fs.copyFileSync(saniSurvivalSrc, path.join(remediesDir, 'remedy_1787120620426.pdf'));

console.log('Copied all fallback PDF files into remedies folder matching Firestore IDs!');
