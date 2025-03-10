import { searchDocuments, getVectorStore } from '../utils/vectorStore';

// Sample queries to test the RAG system
const testQueries = [
  'What is cloud security?',
  'What are the security concerns with AWS?',
  'How do I secure my cloud infrastructure?',
  'What are the best practices for GCP security?',
  'What lab exercises are available?',
];

/**
 * This script tests the RAG system with sample queries
 * Run it with: npm run test-rag
 */
async function main() {
  console.log('Initializing vector store connection to Supabase...');
  
  try {
    // Initialize vector store
    await getVectorStore();
    
    console.log('\nTesting RAG system with sample queries...\n');
    
    for (const query of testQueries) {
      console.log(`\n\n==== Query: ${query} ====`);
      
      try {
        const docs = await searchDocuments(query, 2);
        
        console.log(`Found ${docs.length} relevant documents:\n`);
        
        docs.forEach((doc, i) => {
          console.log(`Document ${i + 1}:`);
          console.log(`Title: ${doc.metadata.title || 'Untitled'}`);
          console.log(`URL: ${doc.metadata.url || 'Unknown'}`);
          console.log(`Content Snippet: ${doc.pageContent.substring(0, 200)}...\n`);
        });
      } catch (error) {
        console.error(`Error processing query "${query}":`, error);
      }
    }
  } catch (error) {
    console.error('Error connecting to vector store:', error);
    console.log('\nMake sure you have:');
    console.log('1. Set up a Supabase database');
    console.log('2. Run the SQL script in scripts/supabase-setup.sql');
    console.log('3. Added your Supabase URL and key to .env.local');
    console.log('4. Added your OpenAI API key to .env.local');
  }
}

main(); 