/**
 * OpenRouter AI Service
 * Encapsulates communication with the OpenRouter API, support model listings,
 * dynamic model routing, and automatic fallback behavior.
 */

const {  getSelectedModel, DEFAULT_MODEL  } = require('./temp_aiConfig');

/**
 * Fetches the list of all available models from OpenRouter.
 * Falls back to a curated subset in case the request fails or is blocked.
 */
async function fetchAvailableModels() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models");
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    if (result && Array.isArray(result.data)) {
      return result.data.map(model => ({
        id: model.id,
        name: model.name || model.id
      }));
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Failed to fetch models from OpenRouter endpoint, using fallback catalog:", error);
    // Curated catalog fallback of standard models
    return [
      { id: "google/gemini-2.5-flash", name: "Google: Gemini 2.5 Flash" },
      { id: "google/gemini-2.5-pro", name: "Google: Gemini 2.5 Pro" },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Meta: Llama 3.3 70B Instruct" },
      { id: "meta-llama/llama-3-8b-instruct:free", name: "Meta: Llama 3 8B Instruct (Free)" },
      { id: "deepseek/deepseek-chat", name: "DeepSeek: V3" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek: R1" },
      { id: "openai/gpt-4o", name: "OpenAI: GPT-4o" },
      { id: "mistralai/mistral-large", name: "Mistral: Mistral Large" },
      { id: "anthropic/claude-3.5-sonnet", name: "Anthropic: Claude 3.5 Sonnet" }
    ];
  }
}

/**
 * Calls OpenRouter to generate a chat completion for the query.
 * If the request fails, it automatically retries once using the DEFAULT_MODEL.
 */
async function getOpenRouterResponse(query, lang, modelOverride = null) {
  const apiKey = process.env.VITE_OPENROUTER_API_KEY;
  const selectedModel = modelOverride || getSelectedModel() || DEFAULT_MODEL;

  if (!apiKey) {
    console.warn("OpenRouter API key is missing. Please configure VITE_OPENROUTER_API_KEY in your env file.");
    throw new Error("OpenRouter API Key is missing");
  }

  const systemPrompt = `You are the CropLedger Desk Assistant, a helpful AI assistant for a Farmer Producer Group (FPG) produce collection and payment register platform.
Answer the user's question accurately, professionally, and concisely.
If they ask in Tamil, respond in Tamil. If they ask in English, respond in English. If they use mixed Tamil-English (Tanglish), respond in a clear, friendly mixed language or in the selected language (${lang === 'ta' ? 'Tamil' : 'English'}).`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin || "http://localhost:5173",
        "X-Title": "CropLedger Desk"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No text content returned in OpenRouter response structure.");
    }
    return content;
  } catch (error) {
    console.error(`Error calling OpenRouter API with model "${selectedModel}":`, error);
    
    // Automatically retry using the default model if the failed request used a custom model
    if (selectedModel !== DEFAULT_MODEL) {
      console.warn(`Attempting automatic fallback to default model: "${DEFAULT_MODEL}"`);
      return getOpenRouterResponse(query, lang, DEFAULT_MODEL);
    }
    
    throw error;
  }
}

module.exports = { fetchAvailableModels, getOpenRouterResponse };