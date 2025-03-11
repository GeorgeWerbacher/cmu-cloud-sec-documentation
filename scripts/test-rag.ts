// TypeScript utility for testing the RAG system
// Run with: npx ts-node scripts/test-rag.ts

import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const tableName = 'documents_embeddings';

// Log configuration
console.log(`Supabase URL: ${supabaseUrl ? supabaseUrl : 'NOT SET'}`);
console.log(`Supabase Key: ${supabaseKey ? '******' : 'NOT SET'}`);
console.log(`OpenAI Key: ${process.env.OPENAI_API_KEY ? '******' : 'NOT SET'}`);

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables!');
  console.log('Please check your .env.local file and ensure the following variables are set:');
  console.log('- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create clients
const supabase = createClient(supabaseUrl, supabaseKey);
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Sample queries to test the RAG system
const testQueries = [
  'What is cloud security?',
  'What are the security concerns with AWS?',
  'How do I secure my cloud infrastructure?',
  'What are the best practices for GCP security?',
  'What lab exercises are available?',
];

/**
 * Search for documents matching the query
 * @param query - The search query
 * @param limit - Maximum number of results to return
 */
async function searchDocuments(query: string, limit = 3): Promise<any[]> {
  // Create embedding for query
  console.log(`Creating embedding for query: "${query}"`);
  const queryEmbedding = await embeddings.embedQuery(query);
  
  // Search for similar documents
  console.log('Searching for similar documents...');
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: limit
  });
  
  if (error) {
    console.error('Error searching for documents:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Main function for testing the RAG system
 */
async function main(): Promise<void> {
  console.log('\n🔍 Testing RAG system with sample queries...\n');
  
  for (const query of testQueries) {
    console.log(`\n==== Query: "${query}" ====\n`);
    
    try {
      const results = await searchDocuments(query);
      console.log(`Found ${results.length} relevant documents:\n`);
      
      if (results.length === 0) {
        console.log('No relevant documents found.');
        continue;
      }
      
      results.forEach((doc, i) => {
        const metadata = typeof doc.metadata === 'string' 
          ? JSON.parse(doc.metadata) 
          : doc.metadata || {};
        
        console.log(`Document ${i + 1} (score: ${doc.similarity.toFixed(4)}):`);
        console.log(`Source: ${metadata.source || 'Unknown'}`);
        console.log(`Chunk: ${metadata.chunk !== undefined ? metadata.chunk + 1 : '?'}/${metadata.chunkTotal || '?'}`);
        console.log(`Content: ${doc.content.substring(0, 200)}...\n`);
      });
    } catch (error) {
      console.error(`❌ Error processing query "${query}":`, error);
    }
  }
  
  console.log('\n✅ RAG system test complete.');
}

// Run the main function with error handling
main().catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
}); 