// SINGLE SOURCE OF TRUTH FOR AI MODEL CONFIGURATION
// Edit this file to change the model used across the entire application

export const AI_CONFIG = {
  MODEL_NAME: "gemini-2.0-flash-lite",
  MAX_OUTPUT_TOKENS: 150, // Much smaller for faster responses
  TEMPERATURE: 0.3, // Lower for faster, more focused responses
  TOP_P: 0.6, // Lower for faster generation
  TOP_K: 20, // Lower for faster generation
  TIMEOUT_MS: 5000, // 5 seconds timeout
} as const

// Display name for users (can be different from actual model)
export const MODEL_DISPLAY_NAME = "gemini-2.0-flash-lite"
