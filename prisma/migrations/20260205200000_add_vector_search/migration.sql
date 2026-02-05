-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_trgm extension for trigram-based fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add embedding column to ingredients table
-- Using 1536 dimensions for OpenAI text-embedding-3-small
ALTER TABLE "ingredients" ADD COLUMN "embedding" vector(1536);

-- Create index for vector similarity search (using HNSW for better performance)
-- HNSW is faster for queries but slower for inserts than IVFFlat
CREATE INDEX "ingredients_embedding_idx" ON "ingredients" 
USING hnsw ("embedding" vector_cosine_ops);

-- Create trigram index on ingredient name for fuzzy text matching
CREATE INDEX "ingredients_name_trgm_idx" ON "ingredients" 
USING gin ("name" gin_trgm_ops);

-- Add index on user_id + name for efficient lookups
CREATE INDEX "ingredients_user_id_name_idx" ON "ingredients" ("user_id", "name");

