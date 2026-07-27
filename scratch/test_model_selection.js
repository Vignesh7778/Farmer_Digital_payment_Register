const fs = require('fs');
const path = require('path');

// Mock localStorage and import.meta.env
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); }
};
global.window = { localStorage: global.localStorage, location: { origin: 'http://localhost:5173' } };

// We need to resolve dependencies first
const aiConfigPath = path.join(__dirname, '../frontend/src/config/aiConfig.js');
let aiConfigContent = fs.readFileSync(aiConfigPath, 'utf8');
aiConfigContent = aiConfigContent.replace(/export const (\w+) =/g, 'const $1 =');
aiConfigContent = aiConfigContent.replace(/export function (\w+)/g, 'function $1');
aiConfigContent = aiConfigContent.replace(/import\.meta\.env/g, 'process.env');
aiConfigContent += `\nmodule.exports = { DEFAULT_MODEL, getSelectedModel, setSelectedModel };`;
fs.writeFileSync(path.join(__dirname, 'temp_aiConfig.cjs'), aiConfigContent, 'utf8');

const openRouterPath = path.join(__dirname, '../frontend/src/services/openRouter.js');
let openRouterContent = fs.readFileSync(openRouterPath, 'utf8');
openRouterContent = openRouterContent.replace(/import \{([^}]+)\} from '([^']+)';/g, (match, imports, source) => {
  return `const { ${imports} } = require('./temp_aiConfig.cjs');`;
});
openRouterContent = openRouterContent.replace(/export async function (\w+)/g, 'async function $1');
openRouterContent = openRouterContent.replace(/export function (\w+)/g, 'function $1');
openRouterContent = openRouterContent.replace(/import\.meta\.env/g, 'process.env');
openRouterContent += `\nmodule.exports = { fetchAvailableModels, getOpenRouterResponse };`;
fs.writeFileSync(path.join(__dirname, 'temp_openRouter.cjs'), openRouterContent, 'utf8');

// Load them
const aiConfig = require('./temp_aiConfig.cjs');
const openRouter = require('./temp_openRouter.cjs');

// Test 1: getSelectedModel default
console.log("--- TEST 1: Default Model Selection ---");
console.log("Initial selected model:", aiConfig.getSelectedModel());
if (aiConfig.getSelectedModel() === aiConfig.DEFAULT_MODEL) {
  console.log("PASS: Default model is " + aiConfig.DEFAULT_MODEL);
} else {
  console.log("FAIL: Expected " + aiConfig.DEFAULT_MODEL);
}

// Test 2: setSelectedModel
console.log("\n--- TEST 2: Custom Model Selection and localStorage Persistence ---");
const testModel = "anthropic/claude-3.5-sonnet";
aiConfig.setSelectedModel(testModel);
console.log("Saved test model in localStorage");
console.log("Retrieved selected model:", aiConfig.getSelectedModel());
if (aiConfig.getSelectedModel() === testModel) {
  console.log("PASS: Retrieved matches saved test model");
} else {
  console.log("FAIL: Expected " + testModel);
}

// Test 3: Fallback retry logic
console.log("\n--- TEST 3: Automatic Fallback on Model Failure ---");
let fetchCalls = [];
global.fetch = async (url, options) => {
  if (url.includes('models')) {
    return {
      ok: true,
      json: async () => ({ data: [{ id: "google/gemini-2.5-flash", name: "Gemini" }] })
    };
  }
  fetchCalls.push({ url, body: JSON.parse(options.body) });
  if (JSON.parse(options.body).model === testModel) {
    return { ok: false, status: 500, statusText: "Internal Server Error" };
  } else {
    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Mock fallback response" } }]
      })
    };
  }
};

// Set mock API key
process.env.VITE_OPENROUTER_API_KEY = "mock-api-key";

openRouter.getOpenRouterResponse("test query", "en")
  .then(resp => {
    console.log("Response returned:", resp);
    console.log("Fetch calls logged:", fetchCalls.length);
    console.log("First call model used:", fetchCalls[0].body.model);
    console.log("Second call model used:", fetchCalls[1].body.model);
    
    if (fetchCalls.length === 2 && fetchCalls[0].body.model === testModel && fetchCalls[1].body.model === aiConfig.DEFAULT_MODEL) {
      console.log("PASS: Successfully retried with default model on failure!");
    } else {
      console.log("FAIL: Fallback retry behavior did not match expectations.");
    }
    
    cleanup();
  })
  .catch(err => {
    console.error("FAIL: API call failed:", err);
    cleanup();
  });

function cleanup() {
  try {
    fs.unlinkSync(path.join(__dirname, 'temp_aiConfig.cjs'));
    fs.unlinkSync(path.join(__dirname, 'temp_openRouter.cjs'));
  } catch(e) {}
}
