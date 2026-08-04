const fs = require('fs');
const file = 'src/app/admin-panel/components/AdminServicePagesEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

const injections = [
  { svc: 'homa', label: 'HOMAM', set: 'setHoma' },
  { svc: 'yantra', label: 'YANTRA', set: 'setYantra' },
  { svc: 'ishta', label: 'ISHTA DEVATA', set: 'setIshta' },
  { svc: 'muhurtham', label: 'MUHURTHAM', set: 'setMuhurtham' },
  { svc: 'vastu', label: 'VASTU', set: 'setVastu' },
  { svc: 'charity', label: 'CHARITY', set: 'setCharity' },
  { svc: 'rudraksha', label: 'RUDRAKSHA', set: 'setRudraksha' },
];

injections.forEach(({ svc, label, set }) => {
  // We want to insert right before the closing tag of the block for this service.
  // The block looks like: {selectedService === '...' && ( ...  </> )}
  // Let's find the specific block for the service, and insert right before the last `</>`.
  
  let regex;
  if (svc === 'rudraksha') {
     regex = /({\/\* RUDRAKSHA \*\/}.*?)(          <\/>\n        \)}\n\n      <\/form>)/s;
  } else {
     // Find the block up to the next service comment
     regex = new RegExp(`({\\/\\* ${label} \\*\\/}.*?)(          <\\/>\\n        \\)}\\n\\n        {\\/\\*)`, 's');
  }

  content = content.replace(regex, (match, p1, p2) => {
     return `${p1}            {renderPremiumDetailsEditor(${svc}.premiumDetails, (v) => ${set}({ ...${svc}, premiumDetails: v }))}\n${p2}`;
  });
});

fs.writeFileSync(file, content);
