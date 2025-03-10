import { createClient } from '@supabase/supabase-js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { loadDocuments } from './documentLoader';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

// Configure Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const tableName = 'documents_embeddings';

if (!supabaseUrl) {
  console.error('Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
}

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
}

const client = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Configure embeddings model
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * Initialize or get the vector store
 */
export async function getVectorStore() {
  if (!client) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }

  try {
    // Check if table exists by querying it
    const { data, error } = await client
      .from(tableName)
      .select('id')
      .limit(1);

    // Initialize vector store with existing table
    if (!error) {
      console.log('Vector store table exists, using existing table');
      return new SupabaseVectorStore(embeddings, {
        client,
        tableName,
        queryName: 'match_documents',
      });
    } else {
      // If error (likely table doesn't exist), create a new vector store
      console.log('Vector store table does not exist yet, creating a new one...');
      console.log('Creating table and vector extension...');
      
      // Enable pgvector extension
      try {
        // Enable vector extension
        await client.rpc('create_vector_extension');
        console.log('Vector extension enabled');
      } catch (e) {
        console.log('Vector extension may already be enabled:', e);
      }
      
      // Get documents
      const documents = await loadDocuments();
      
      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const chunks = await textSplitter.splitDocuments(documents);
      console.log(`Split ${documents.length} documents into ${chunks.length} chunks`);
      
      // Create vector store
      const vectorStore = await SupabaseVectorStore.fromDocuments(
        chunks,
        embeddings,
        {
          client,
          tableName,
          queryName: 'match_documents',
        }
      );
      
      return vectorStore;
    }
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
}

/**
 * Search the vector store for relevant documents
 */
export async function searchDocuments(query: string, limit = 5) {
  if (!client) {
    throw new Error('Supabase client is not initialized. Please check your environment variables.');
  }
  
  const vectorStore = await getVectorStore();
  
  // Search for relevant documents
  const results = await vectorStore.similaritySearch(query, limit);
  
  return results;
} 