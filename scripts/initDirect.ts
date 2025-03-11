// Direct initialization script without TypeScript dependencies
// Run with: npx ts-node scripts/initDirect.ts

// Import required packages
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const tableName = 'documents_embeddings';

// Log configuration info
console.log(`Supabase URL: ${supabaseUrl ? supabaseUrl : 'NOT SET'}`);
console.log(`Supabase Key: ${supabaseKey ? '******' : 'NOT SET'}`);
console.log(`OpenAI Key: ${process.env.OPENAI_API_KEY ? '******' : 'NOT SET'}`);
console.log(`Table name: ${tableName}`);

/**
 * Validate required environment variables and create Supabase client
 * @returns {SupabaseClient} - Supabase client instance
 */
function initSupabaseClient(): SupabaseClient {
  // Validate required environment variables
  if (!supabaseUrl) {
    console.error('❌ Error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required!');
    console.log('Please make sure you have properly set up your .env.local file with the required variables.');
    process.exit(1);
  }

  if (!supabaseKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is required!');
    console.log('Please make sure you have properly set up your .env.local file with the required variables.');
    process.exit(1);
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Main function to initialize vector store
 */
async function main(): Promise<void> {
  console.log('Initializing vector store in Supabase via direct script...');
  console.log(`Current directory: ${process.cwd()}`);
  
  try {
    // Initialize clients
    const client = initSupabaseClient();
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    // Check if table exists
    const { data, error } = await client
      .from(tableName)
      .select('id')
      .limit(1);
      
    if (!error) {
      console.log('✅ Vector store table exists, system is ready to use!');
    } else {
      console.log('Vector store table does not exist yet, creating a new one...');
      console.log('Creating table and vector extension...');
      
      // Enable pgvector extension
      try {
        await client.rpc('create_vector_extension');
        console.log('Vector extension enabled');
      } catch (e) {
        console.log('Vector extension may already be enabled:', e);
      }
      
      console.log('✅ Vector store initialized');
      console.log('\n🚀 Run the SQL setup script in Supabase SQL Editor to finish configuration');
    }
  } catch (error) {
    console.error('❌ Error initializing vector store:', error);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure you have run the SQL script in Supabase:');
    console.log('   - Go to your Supabase project dashboard');
    console.log('   - Navigate to the "SQL Editor" section');
    console.log('   - Create a "New Query" and paste the contents of scripts/supabase-setup.sql');
    console.log('   - Run the query to set up the necessary tables and functions');
    console.log('\n2. Verify your environment variables:');
    console.log('   - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is set correctly');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY is set correctly (not the anon key)');
    console.log('   - OPENAI_API_KEY is set correctly');
  }
}

// Run the main function with error handling
main().catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1); 