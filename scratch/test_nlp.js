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

const faqDataEn = loadFaq(faqDataPath);
const faqDataTa = loadFaq(faqDataTaPath);

// Tamil Stemmer
function stemTamil(word) {
  if (!word) return "";
  let stemmed = word.trim();
  
  // Suffixes
  const suffixes = [
    "களின்", "களுக்கு", "களோடு", "களால்", "களை", "கள்",
    "க்கு", "உடன்", "இருந்து", "வரை", "விட", "ஆல்", 
    "உடைய", "இடம்", "இல்", "இன்", "ஐ", "கு", "து", 
    "ஆனது", "ஆகிய", "பட்டு", "வது"
  ];
  
  for (const suffix of suffixes) {
    if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 1) {
      stemmed = stemmed.slice(0, -suffix.length);
      break;
    }
  }
  
  // Strip trailing ம் or ங் or ்
  if (stemmed.endsWith("ம்") || stemmed.endsWith("ங்") || stemmed.endsWith("்")) {
    stemmed = stemmed.slice(0, -1);
  }
  
  return stemmed;
}

// Synonym Clusters
const synonymClusters = [
  ["payment", "payout", "settle", "settlement", "pay", "paid", "பட்டுவாடா", "பணம்", "கொடுப்பனவு", "செட்டில்மென்ட்", "பரிவர்த்தனை"],
  ["collection", "delivery", "deliveries", "batches", "loads", "சேகரிப்பு", "விநியோகம்", "பதிவு", "விநியோகங்கள்"],
  ["farmer", "member", "farmers", "members", "profile", "account", "விவசாயி", "விவசாயிகள்"],
  ["crop", "produce", "crops", "yield", "tomato", "banana", "onion", "drumstick", "paddy", "milk", "பயிர்", "பயிர்கள்", "தக்காளி", "வாழை", "வெங்காயம்", "முருங்கை", "நெல்", "பால்"],
  ["download", "export", "excel", "csv", "save", "print", "pdf", "பதிவிறக்கம்", "பதிவிறக்குவது", "ஏற்றுமதி", "அச்சிட"],
  ["status", "statuses", "state", "நிலை", "வகைகள்"],
  ["details", "detail", "info", "information", "விவரங்கள்", "விவரம்"],
  ["statement", "statements", "history", "audits", "audit", "ledger", "balance", "outstanding", "earning", "earnings", "total", "அறிக்கை", "சுருக்கம்", "வரலாறு", "நிலுவை", "வருமானம்", "மொத்தம்"],
  ["report", "reports", "summary", "அறிக்கை", "சுருக்கம்"],
  ["today", "இன்று", "இன்றைய"],
  ["how", "epdi", "eppadi", "epidi", "eppidi", "எவ்வாறு", "எப்படி"],
  ["show", "view", "see", "find", "check", "search", "sollu", "sol", "sollunga", "solunga", "kaatu", "kaattu", "kaatunga", "காட்டு", "சொல்", "சரிபார்ப்பது"],
  ["do", "panrathu", "panradhu", "pannu", "pannunga", "panunga", "செய்து", "செய்வது", "செய்"],
  ["completed", "paid", "settled", "முடிந்தது", "செலுத்தப்பட்டது"],
  ["register", "registration", "add", "new", "enroll", "பதிவு", "பதிவுசெய்வது", "சேர்", "புதிய"],
  ["quantity", "volume", "amount", "total", "alavu", "அளவு", "அலகுகள்"]
];

// Helper to clean a word
function cleanWord(word) {
  return word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
}

// Expand keywords using synonym clusters
function getExpandedKeywords(query) {
  const words = query.split(/\s+/).map(cleanWord).filter(w => w.length > 1);
  const keywords = new Set();

  words.forEach(w => {
    keywords.add(w);
    const stemmedW = stemTamil(w);
    if (stemmedW !== w) {
      keywords.add(stemmedW);
    }
    // Find cluster
    synonymClusters.forEach(cluster => {
      if (cluster.includes(w) || cluster.includes(stemmedW)) {
        cluster.forEach(item => {
          keywords.add(item);
          const stemmedItem = stemTamil(item);
          if (stemmedItem) keywords.add(stemmedItem);
        });
      }
    });
  });

  return Array.from(keywords);
}

// Action words that can trigger penalties if missing in query
const actionWords = [
  { word: "register", syns: ["register", "registration", "add", "new", "enroll", "பதிவு", "பதிவுசெய்வது", "சேர்", "புதிய"] },
  { word: "edit", syns: ["edit", "change", "update", "correct", "modify", "திருத்துவது", "மாற்ற", "சரிசெய்வது"] },
  { word: "delete", syns: ["delete", "remove", "நீக்க", "நீக்கினால்"] },
  { word: "download", syns: ["download", "export", "excel", "csv", "print", "pdf", "பதிவிறக்கம்", "பதிவிறக்குவது", "ஏற்றுமதி", "அச்சிட"] },
  { word: "record", syns: ["record", "enter", "save", "பதிவுசெய்", "பதிவுசெய்ய"] }
];

function matchFaq(query, lang) {
  const activeFaq = lang === 'ta' ? faqDataTa : faqDataEn;
  const rawQueryNormalized = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  
  // 1. Direct exact match (highest priority)
  const exactMatch = activeFaq.find(q => q.question.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim() === rawQueryNormalized);
  if (exactMatch) {
    return { match: exactMatch, confidence: 100, isDistinct: true };
  }

  // 2. Expand search terms
  const searchKeywords = getExpandedKeywords(query);

  // Check if query contains any action word synonyms
  const queryActions = actionWords.filter(action => 
    action.syns.some(syn => rawQueryNormalized.includes(syn))
  ).map(a => a.word);

  // Score each question
  const scored = activeFaq.map(faq => {
    const qClean = faq.question.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    const aClean = faq.answer.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    
    // Split questions into words for checking exact word match
    const qWords = qClean.split(/\s+/).map(cleanWord).filter(w => w.length > 0);
    const qWordsStemmed = qWords.map(stemTamil);
    
    let score = 0;
    let matchCount = 0;

    searchKeywords.forEach(kw => {
      const stemmedKw = stemTamil(kw);
      // If keyword matches exactly as a word or stemmed word in the question, higher weight
      if (qWords.includes(kw) || (stemmedKw && qWordsStemmed.includes(stemmedKw))) {
        score += 6;
        matchCount++;
      } else if (qClean.includes(kw) || (stemmedKw && qClean.includes(stemmedKw))) {
        score += 2;
        matchCount++;
      }
      
      if (aClean.includes(kw) || (stemmedKw && aClean.includes(stemmedKw))) {
        score += 1;
      }
    });

    // Intersection bonus
    if (matchCount > 1) {
      score += matchCount * 4;
    }

    // Phrase match bonus
    if (qClean.includes(rawQueryNormalized)) {
      score += 20;
    }

    // Action word penalty
    actionWords.forEach(action => {
      // If the question has this action but the query does not ask for it, penalize
      const questionHasAction = action.syns.some(syn => qClean.includes(syn));
      if (questionHasAction && !queryActions.includes(action.word)) {
        score -= 10;
      }
    });

    return { faq, score };
  });

  // Sort descending
  scored.sort((a, b) => b.score - a.score);

  const topMatch = scored[0];
  if (topMatch && topMatch.score > 2) {
    const runnerUp = scored[1];
    const isDistinct = !runnerUp || (topMatch.score - runnerUp.score) >= 2;
    return {
      match: topMatch.faq,
      confidence: topMatch.score,
      isDistinct,
      alternatives: scored.slice(1, 4).filter(s => s.score > 2).map(s => s.faq)
    };
  }

  return { match: null, confidence: 0 };
}

// Test cases
const testCases = [
  // Task 1: Tanglish / code-mixed queries
  { q: "En payment status sollu", lang: "en", expectedId: 62 }, 
  { q: "En payment status sollu", lang: "ta", expectedId: 49 }, 
  { q: "Farmer details kaatu", lang: "en", expectedId: 12 }, 
  { q: "Farmer details kaatu", lang: "ta", expectedId: 12 }, 
  { q: "Produce collection epdi check panrathu", lang: "en", expectedId: 45 }, 
  { q: "Invoice download pannunga", lang: "en", expectedId: 81 }, 
  { q: "Payment completed ah", lang: "en", expectedId: 66 }, 
  { q: "என்னோட payment status", lang: "ta", expectedId: 49 }, 
  { q: "Crop quantity show pannunga", lang: "en", expectedId: 37 }, 

  // Task 2: Confused Intents
  { q: "payment status", lang: "en", expectedId: 62 }, 
  { q: "payment statements", lang: "en", expectedId: 3 }, 
  { q: "farmer details", lang: "en", expectedId: 12 }, 
  { q: "register farmer", lang: "en", expectedId: 1 }, 
];

testCases.forEach((tc, idx) => {
  console.log(`\nTest Case ${idx + 1}: Query="${tc.q}", Lang="${tc.lang}"`);
  const result = matchFaq(tc.q, tc.lang);
  if (result.match) {
    console.log(`  Result ID: ${result.match.id}`);
    console.log(`  Question: "${result.match.question}"`);
    console.log(`  Score: ${result.confidence}`);
    console.log(`  Is Distinct: ${result.isDistinct}`);
    if (result.match.id === tc.expectedId) {
      console.log(`  SUCCESS! Matches expected ID ${tc.expectedId}`);
    } else {
      console.log(`  MISMATCH! Expected ID ${tc.expectedId}, got ${result.match.id}`);
    }
  } else {
    console.log(`  FAILED! No match found.`);
  }
});
