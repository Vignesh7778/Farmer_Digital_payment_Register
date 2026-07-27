const fs = require('fs');
const path = require('path');

const faqDataPath = path.join(__dirname, '../frontend/src/constants/faqData.js');
const faqDataTaPath = path.join(__dirname, '../frontend/src/constants/faqDataTa.js');

function loadFaq(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Convert ES export to CommonJS
  content = content.replace(/export const (\w+) =/g, 'module.exports.$1 =');
  const tempPath = path.join(__dirname, `temp_${path.basename(filePath)}`);
  fs.writeFileSync(tempPath, content, 'utf8');
  const loaded = require(tempPath);
  fs.unlinkSync(tempPath);
  return Object.values(loaded)[0];
}

const faqsEn = loadFaq(faqDataPath);
const faqsTa = loadFaq(faqDataTaPath);

console.log(`English FAQs: ${faqsEn.length}, Tamil FAQs: ${faqsTa.length}`);

// Compare first 100
let matchedCount = 0;
let mismatched = [];
for (let i = 0; i < Math.min(faqsEn.length, faqsTa.length); i++) {
  const en = faqsEn[i];
  const ta = faqsTa[i];
  if (en.id !== ta.id) {
    console.log(`ID mismatch at index ${i}: EN ID ${en.id}, TA ID ${ta.id}`);
    break;
  }
  // Let's print the questions to see if they correspond
  console.log(`[ID ${en.id}]`);
  console.log(`  EN: ${en.question}`);
  console.log(`  TA: ${ta.question}`);
}
