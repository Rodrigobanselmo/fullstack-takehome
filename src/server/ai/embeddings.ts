import { OpenAIEmbeddings } from "@langchain/openai";
import { env } from "~/config/env";

// OpenAI text-embedding-3-small produces 1536-dimensional vectors
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

let embeddingsInstance: OpenAIEmbeddings | null = null;

/**
 * Get or create the embeddings instance (singleton)
 */
function getEmbeddings(): OpenAIEmbeddings {
  if (!embeddingsInstance) {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured for embeddings");
    }
    embeddingsInstance = new OpenAIEmbeddings({
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      apiKey: env.OPENAI_API_KEY,
    });
  }
  return embeddingsInstance;
}

/**
 * Generate embedding for a single text
 * @param text - The text to embed
 * @returns Array of numbers representing the embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const embeddings = getEmbeddings();
  return embeddings.embedQuery(text);
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }
  const embeddings = getEmbeddings();
  return embeddings.embedDocuments(texts);
}

/**
 * Format embedding array as PostgreSQL vector string
 * @param embedding - Array of numbers
 * @returns PostgreSQL vector format string like '[0.1,0.2,0.3]'
 */
export function formatEmbeddingForPostgres(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export { EMBEDDING_DIMENSIONS };
