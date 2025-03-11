-- Script to set up all database tables for the CMU Cloud Security documentation site
-- Run this in the Supabase SQL Editor to set up the necessary tables and functions

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the embeddings table for storing document vectors
CREATE TABLE IF NOT EXISTS documents_embeddings (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for faster similarity searches
CREATE INDEX IF NOT EXISTS documents_embeddings_embedding_idx ON documents_embeddings USING ivfflat (embedding vector_l2_ops);

-- Function to match documents by similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents_embeddings.id,
    documents_embeddings.content,
    documents_embeddings.metadata,
    1 - (documents_embeddings.embedding <=> query_embedding) AS similarity
  FROM documents_embeddings
  WHERE 1 - (documents_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Response cache table for storing AI responses
CREATE TABLE IF NOT EXISTS response_cache (
  id BIGSERIAL PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  query TEXT NOT NULL,
  context_digest TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Add index for faster lookups
  CONSTRAINT response_cache_cache_key_key UNIQUE (cache_key)
);

-- Add index on query for analytics
CREATE INDEX IF NOT EXISTS idx_response_cache_query ON response_cache (query);

-- Comment on table
COMMENT ON TABLE response_cache IS 'Stores cached responses from Claude API to reduce costs';

-- API usage tracking table for monitoring Claude API costs
CREATE TABLE IF NOT EXISTS api_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  tokens_prompt INTEGER NOT NULL DEFAULT 0,
  tokens_completion INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  request_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Add unique constraint for user_id and date
  CONSTRAINT api_usage_user_date_key UNIQUE (user_id, date)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage (date);

-- Comment on table
COMMENT ON TABLE api_usage IS 'Tracks API usage for cost management and rate limiting';

-- Add function to get usage statistics
CREATE OR REPLACE FUNCTION get_usage_stats(
  start_date TEXT,
  end_date TEXT DEFAULT NULL
) 
RETURNS TABLE (
  date TEXT,
  total_requests BIGINT,
  total_tokens BIGINT,
  total_prompt_tokens BIGINT,
  total_completion_tokens BIGINT,
  unique_users BIGINT
)
LANGUAGE SQL
AS $$
  SELECT
    date,
    SUM(request_count) AS total_requests,
    SUM(tokens_total) AS total_tokens,
    SUM(tokens_prompt) AS total_prompt_tokens,
    SUM(tokens_completion) AS total_completion_tokens,
    COUNT(DISTINCT user_id) AS unique_users
  FROM api_usage
  WHERE date >= start_date
    AND (end_date IS NULL OR date <= end_date)
  GROUP BY date
  ORDER BY date
$$;

-- Add function to clean up old cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache() RETURNS void
LANGUAGE SQL
AS $$
  DELETE FROM response_cache 
  WHERE created_at < (CURRENT_TIMESTAMP - INTERVAL '7 days');
$$;

-- Create a cron job to cleanup old cache entries weekly (if pg_cron extension is available)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    PERFORM cron.schedule(
      'cleanup-cache-weekly',
      '0 0 * * 0', -- At midnight on Sunday
      'SELECT cleanup_expired_cache()'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- pg_cron extension might not be available, which is fine
    RAISE NOTICE 'pg_cron extension not available for scheduling cleanup';
END $$; 