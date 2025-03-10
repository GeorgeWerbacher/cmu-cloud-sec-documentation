-- Create function to enable vector extension (will be called from the code)
CREATE OR REPLACE FUNCTION create_vector_extension()
RETURNS VOID LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
END;
$$;

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for storing document embeddings
CREATE TABLE IF NOT EXISTS documents_embeddings (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding VECTOR(1536)
);

-- Create a function to search for similar documents
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT
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

-- Create an index to make vector operations faster
CREATE INDEX ON documents_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); 