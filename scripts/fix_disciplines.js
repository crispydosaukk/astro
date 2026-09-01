const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'aiAstrologerData.ts');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  { from: "primaryDiscipline: 'KP'", to: "primaryDiscipline: 'KP Astrology'" },
  { from: "primaryDiscipline: 'Nadi'", to: "primaryDiscipline: 'Nadi Astrology'" },
  { from: "primaryDiscipline: 'Prashna'", to: "primaryDiscipline: 'Prashna Kundli'" },
  { from: "primaryDiscipline: 'Tarot'", to: "primaryDiscipline: 'Tarot & Oracle'" },
];

for (const r of replacements) {
  content = content.replaceAll(r.from, r.to);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully standardized primaryDiscipline values in aiAstrologerData.ts!');
