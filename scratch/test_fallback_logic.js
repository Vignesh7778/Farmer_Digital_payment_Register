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

const faqData = loadFaq(faqDataPath);
const faqDataTa = loadFaq(faqDataTaPath);

// Extract getFollowUpOptions and matchQuestionAndAnswer logic from Assistant.jsx dynamically
const assistantFilePath = path.join(__dirname, '../frontend/src/pages/Assistant.jsx');
let assistantContent = fs.readFileSync(assistantFilePath, 'utf8');

// Extract matchQuestionAndAnswer body from file
const matchStart = assistantContent.indexOf('const matchQuestionAndAnswer =');
const matchEnd = assistantContent.indexOf('const handleSend =');
if (matchStart === -1 || matchEnd === -1) {
  console.error("Could not find matchQuestionAndAnswer or handleSend in Assistant.jsx");
  process.exit(1);
}

let matchBody = assistantContent.substring(matchStart, matchEnd);
// Replace the const matchQuestionAndAnswer line with module.exports so we can export it
matchBody = matchBody.replace('const matchQuestionAndAnswer = (rawQuery) => {', 'function matchQuestionAndAnswer(rawQuery) {');

// Inject all outer scope variables required by matchQuestionAndAnswer
const mockEnv = `
const isFarmer = false;
const user = { id: 'test-user-id', username: 'operator' };
const collections = [];
const farmers = [];
const produce = [];
const formatCurrency = (val) => "₹" + val;
const getFollowUpOptions = (excludeQuestion = "") => {
  return ["Option 1", "Option 2", "Option 3"];
};
let lang = "en";
const faqData = ${JSON.stringify(faqData)};
const faqDataTa = ${JSON.stringify(faqDataTa)};
`;

const fullModuleContent = mockEnv + "\n" + matchBody + '\nmodule.exports = { matchQuestionAndAnswer, setLang: (l) => { lang = l; } };';

const tempMatchPath = path.join(__dirname, 'temp_match.js');
fs.writeFileSync(tempMatchPath, fullModuleContent, 'utf8');

// Load the function
const { matchQuestionAndAnswer, setLang } = require(tempMatchPath);
fs.unlinkSync(tempMatchPath);

// Run test suite
console.log("--- STARTING FALLBACK INTEGRATION TESTS ---");

const testCases = [
  // 1. Predefined intent matching
  {
    q: "How do I register a new farmer?",
    lang: "en",
    expectFallback: false
  },
  {
    q: "புதிய விவசாயியை எவ்வாறு பதிவு செய்வது?",
    lang: "ta",
    expectFallback: false
  },
  // 2. Unknown queries
  {
    q: "What is the capital of Tamil Nadu?",
    lang: "en",
    expectFallback: true
  },
  {
    q: "தமிழ்நாட்டின் தலைநகரம் எது?",
    lang: "ta",
    expectFallback: true
  }
];

let success = true;

testCases.forEach((tc, idx) => {
  console.log(`\nTest Case ${idx + 1}: Query="${tc.q}", Lang="${tc.lang}"`);
  setLang(tc.lang);
  try {
    const result = matchQuestionAndAnswer(tc.q);
    const hasFallback = !!result.isFallback;
    console.log(`  Result Answer: "${result.answer.substring(0, 50)}..."`);
    console.log(`  Is Fallback: ${hasFallback}`);
    if (hasFallback === tc.expectFallback) {
      console.log(`  PASS: Fallback behavior matches expected (${tc.expectFallback})`);
    } else {
      console.log(`  FAIL: Expected fallback to be ${tc.expectFallback}, but got ${hasFallback}`);
      success = false;
    }
  } catch (err) {
    console.error("  ERROR during execution:", err);
    success = false;
  }
});

console.log("\n--- TEST EXECUTION COMPLETED ---");
if (success) {
  console.log("ALL LOGICAL TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.log("SOME LOGICAL TESTS FAILED.");
  process.exit(1);
}
