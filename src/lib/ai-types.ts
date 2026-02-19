/**
 * Shared AI types used across the application
 */

/**
 * AI response mode that affects model selection and behavior
 * - "fast": Uses a faster, lighter model (gpt-4o-mini) for quick responses
 * - "smarter": Uses a more capable model (gpt-4o) for complex reasoning
 */
export const AI_MODES = ["fast", "smarter"] as const;
export type AIMode = (typeof AI_MODES)[number];

export const AI_MODE_LABELS: Record<AIMode, string> = {
  fast: "Fast",
  smarter: "Smarter",
};

export const DEFAULT_AI_MODE: AIMode = "fast";

