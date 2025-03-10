import path from 'path';
import { getVectorStore } from '../utils/vectorStore';

/**
 * This script initializes the vector store with documentation
 * Run it with: npm run init-rag
 */
async function main() {
  console.log('Initializing vector store in Supabase via Vercel...');
  console.log(`Current directory: ${process.cwd()}`);
  
  try {
    // This will create the vector store if it doesn't exist
    const vectorStore = await getVectorStore();
    console.log('✅ Vector store initialized successfully');
    console.log('\n🚀 Your RAG system is ready to use!');
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
    console.log('\n3. If using through Vercel, make sure:');
    console.log('   - You have added all environment variables in your Vercel project settings');
    console.log('   - You have properly linked your Supabase and Vercel projects');
  }
}

main(); 