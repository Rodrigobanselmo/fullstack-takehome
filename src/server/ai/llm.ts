import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { env } from "~/config/env";
import { type AIMode, DEFAULT_AI_MODE } from "~/lib/ai-types";

export type LLMProvider = "openai" | "gemini";

/** OpenAI model variants */
export type OpenAIModel =
  | "gpt-5-mini"    // Fast, cheaper version of GPT-5
  | "gpt-5.2"       // Best for coding and agentic tasks
  | "gpt-5.2-pro"   // Smartest and most precise
  | "gpt-4.1-mini"  // Legacy fast model
  | "o4-mini";      // Reasoning model

/** Gemini model variants */
export type GeminiModel = "gemini-2.5-flash" | "gemini-2.5-pro";

interface LLMConfig {
  /** AI mode that determines which model to use. "fast" = gpt-5-mini, "smarter" = gpt-5.2 */
  mode?: AIMode;
  /** Controls randomness in responses (0-1). Note: Some models (e.g., GPT-5, o4-mini) only support default temperature. Omit for default. */
  temperature?: number;
  /** Maximum tokens in the response output. Defaults based on mode: fast=2000, smarter=4000 */
  maxOutputTokens?: number;
  /** LLM provider to use. Default: "gemini" */
  provider?: LLMProvider;
}

const DEFAULT_PROVIDER: LLMProvider = "gemini";

/** Model configuration based on AI mode */
const MODE_CONFIG: Record<AIMode, { openaiModel: OpenAIModel; geminiModel: GeminiModel; maxOutputTokens: number }> = {
  fast: { openaiModel: "gpt-5-mini", geminiModel: "gemini-2.5-flash", maxOutputTokens: 2000 },
  smarter: { openaiModel: "gpt-5.2", geminiModel: "gemini-2.5-pro", maxOutputTokens: 4000 },
};

/**
 * Creates an LLM instance.
 *
 * @param config.mode - AI mode: "fast" (gpt-5-mini) or "smarter" (gpt-5.2). Default: "fast"
 * @param config.temperature - Controls randomness (0-1). Note: Some models (e.g., GPT-5, o4-mini) only support default temperature (1)
 * @param config.maxOutputTokens - Max tokens in response. Defaults based on mode: fast=2000, smarter=4000
 * @param config.provider - "openai" (default) or "gemini"
 */
export function createLLM(config: LLMConfig = {}): BaseChatModel {
  const {
    mode = DEFAULT_AI_MODE,
    temperature,
    maxOutputTokens,
    provider = DEFAULT_PROVIDER,
  } = config;

  const modeConfig = MODE_CONFIG[mode];
  const finalMaxOutputTokens = maxOutputTokens ?? modeConfig.maxOutputTokens;

  switch (provider) {
    case "openai":
      if (!env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured.");
      }
      const openaiConfig = {
        model: modeConfig.openaiModel,
        ...(temperature !== undefined && { temperature }),
        maxTokens: finalMaxOutputTokens,
      };
      console.log(
        `[LLM] Creating OpenAI instance - Mode: ${mode}, Model: ${openaiConfig.model}, MaxTokens: ${openaiConfig.maxTokens}${temperature !== undefined ? `, Temperature: ${temperature}` : ""}`,
      );
      return new ChatOpenAI({
        ...openaiConfig,
        apiKey: env.OPENAI_API_KEY,
      });

    case "gemini":
      if (!env.GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured.");
      }
      const geminiConfig = {
        model: modeConfig.geminiModel,
        ...(temperature !== undefined && { temperature }),
        maxOutputTokens: finalMaxOutputTokens,
      };
      console.log(
        `[LLM] Creating Gemini instance - Mode: ${mode}, Model: ${geminiConfig.model}, MaxTokens: ${geminiConfig.maxOutputTokens}${temperature !== undefined ? `, Temperature: ${temperature}` : ""}`,
      );
      return new ChatGoogleGenerativeAI({
        ...geminiConfig,
        apiKey: env.GOOGLE_API_KEY,
      });

    default:
      throw new Error(`Unknown LLM provider: ${provider as string}`);
  }
}
