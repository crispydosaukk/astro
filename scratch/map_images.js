const fs = require('fs');

const relsXml = fs.readFileSync('scratch/docx_extracted/word/_rels/document.xml.rels', 'utf8');
const docXml = fs.readFileSync('scratch/docx_extracted/word/document.xml', 'utf8');

// Parse rels
const relMap = {};
const relMatches = relsXml.matchAll(/Id="(rId\d+)"[^>]*?Target="media\/([^"]+)"/g);
for (const m of relMatches) {
  relMap[m[1]] = m[2];
}

// Find paragraphs with images and text
const pMatches = docXml.matchAll(/<w:p[\s\S]*?<\/w:p>/g);
let pIndex = 0;
let lastHeader = 'Intro';

for (const p of pMatches) {
  const pStr = p[0];
  const texts = (pStr.match(/<w:t[\s\S]*?>([\s\S]*?)<\/w:t>/g) || []).map(t => t.replace(/<[^>]+>/g, ''));
  const textStr = texts.join(' ').trim();
  
  if (textStr.includes('EAST') || textStr.includes('SOUTH') || textStr.includes('WEST') || textStr.includes('NORTH') || textStr.includes('SUMMARY') || textStr.includes('VĀSTU')) {
    lastHeader = textStr;
  }
  
  const imgEmbeds = pStr.match(/r:embed="(rId\d+)"/g) || [];
  if (imgEmbeds.length > 0) {
    const imgs = imgEmbeds.map(e => {
      const id = e.replace('r:embed="', '').replace('"', '');
      return relMap[id];
    }).filter(Boolean);
    console.log(`[P ${pIndex} | Section: "${lastHeader}"] Text: "${textStr.slice(0, 40)}" -> Images:`, imgs);
  }
  pIndex++;
}
