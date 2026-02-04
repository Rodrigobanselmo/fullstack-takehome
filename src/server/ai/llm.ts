import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { env } from "~/config/env";

export type LLMProvider = "openai" | "gemini";

interface LLMConfig {
  /** Controls randomness in responses (0-1). Default: 0.7 */
  temperature?: number;
  /** Maximum tokens in the response output. Default: 2000 (~8000 chars) */
  maxOutputTokens?: number;
  /** LLM provider to use. Default: "openai" */
  provider?: LLMProvider;
}

const DEFAULT_MAX_OUTPUT_TOKENS = 2000;
const DEFAULT_PROVIDER: LLMProvider = "openai";

/**
 * Creates an LLM instance.
 *
 * @param config.temperature - Controls randomness (0-1). Default: 0.7
 * @param config.maxOutputTokens - Max tokens in response. Default: 2000
 * @param config.provider - "openai" (default) or "gemini"
 */
export function createLLM(config: LLMConfig = {}): BaseChatModel {
  const {
    temperature = 0.7,
    maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
    provider = DEFAULT_PROVIDER,
  } = config;

  switch (provider) {
    case "openai":
      if (!env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured.");
      }
      return new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature,
        maxTokens: maxOutputTokens,
        apiKey: env.OPENAI_API_KEY,
      });

    case "gemini":
      if (!env.GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY is not configured.");
      }
      return new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash",
        temperature,
        maxOutputTokens,
        apiKey: env.GOOGLE_API_KEY,
      });

    default:
      throw new Error(`Unknown LLM provider: ${provider as string}`);
  }
}

