/**
 * AI Configuration Management
 * Centralized place for model constants and state helpers.
 */

export const DEFAULT_MODEL = 'google/gemini-2.5-flash';

/**
 * Returns the selected model from local storage, or environment variables,
 * and falls back to the default model if none are set.
 */
export function getSelectedModel() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('cropledger_selected_model');
    if (saved) return saved;
  }
  return import.meta.env.VITE_OPENROUTER_MODEL || DEFAULT_MODEL;
}

/**
 * Persists the selected model to local storage.
 */
export function setSelectedModel(modelId) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('cropledger_selected_model', modelId);
  }
}
