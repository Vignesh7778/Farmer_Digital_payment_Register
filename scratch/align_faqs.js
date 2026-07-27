const fs = require('fs');
const path = require('path');

const faqDataPath = path.join(__dirname, '../frontend/src/constants/faqData.js');
const faqDataTaPath = path.join(__dirname, '../frontend/src/constants/faqDataTa.js');

function loadFaq(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/export const (\w+) =/g, 'module.exports.$1 =');
  const tempPath = path.join(__dirname, `temp_${path.basename(filePath)}`);
  fs.writeFileSync(tempPath, content, 'utf8');
  const loaded = require(tempPath);
  fs.unlinkSync(tempPath);
  return Object.values(loaded)[0];
}

const faqsEn = loadFaq(faqDataPath);
const faqsTa = loadFaq(faqDataTaPath);

let out = '';
for (let i = 0; i < 100; i++) {
  const en = faqsEn[i] || { id: i+1, question: 'N/A' };
  const ta = faqsTa[i] || { id: i+1, question: 'N/A' };
  out += `ID ${en.id}\n`;
  out += `  EN: ${en.question}\n`;
  out += `  TA: ${ta.question}\n\n`;
}

fs.writeFileSync(path.join(__dirname, 'faqs_aligned.txt'), out, 'utf8');
console.log('Saved alignment to scratch/faqs_aligned.txt');
