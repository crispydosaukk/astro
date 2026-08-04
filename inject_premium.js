const fs = require('fs');
const file = 'src/app/admin-panel/components/AdminServicePagesEditor.tsx';
let content = fs.readFileSync(file, 'utf8');
const services = ['homa', 'yantra', 'ishta', 'muhurtham', 'vastu', 'charity', 'rudraksha'];
services.forEach(svc => {
  const target = 'set' + svc.charAt(0).toUpperCase() + svc.slice(1);
  const regex = new RegExp(`({renderFaqEditor\\(${svc}\\.faqs.*?\\)}|{renderBenefitsEditor\\(${svc}\\.benefitsTitle.*?\\)})\\n(\\s*)</>`, 'g');
  content = content.replace(regex, (match, p1, p2) => {
    return `${p1}\n${p2}{renderPremiumDetailsEditor(${svc}.premiumDetails, (v) => ${target}({ ...${svc}, premiumDetails: v }))}\n${p2}</>`;
  });
});
fs.writeFileSync(file, content);
