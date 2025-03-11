// Direct initialization script without TypeScript dependencies
// Run with: npx ts-node scripts/initDirect.ts

// Import required packages
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import fs from 'fs';
import path from 'path';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

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
 * Loads and processes markdown files from the pages directory
 */
async function loadDocuments(): Promise<Document[]> {
  // Use absolute path resolution for better cross-environment compatibility
  const pagesDir = path.resolve(process.cwd(), 'pages');
  console.log(`Loading documents from: ${pagesDir}`);
  
  // Check if directory exists
  if (!fs.existsSync(pagesDir)) {
    console.error(`Directory not found: ${pagesDir}`);
    throw new Error(`Pages directory not found at ${pagesDir}`);
  }
  
  const documents: Document[] = [];

  // Function to recursively process directories
  async function processDirectory(directory: string) {
    console.log(`Processing directory: ${directory}`);
    
    try {
      const entries = fs.readdirSync(directory);
      
      for (const entry of entries) {
        // Skip API directory and files starting with underscore
        if (entry === 'api' || entry.startsWith('_')) {
          continue;
        }
        
        const fullPath = path.join(directory, entry);
        
        try {
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            await processDirectory(fullPath);
          } else if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
            console.log(`Processing file: ${fullPath}`);
            
            const content = fs.readFileSync(fullPath, 'utf-8');
            const relativePath = path.relative(pagesDir, fullPath);
            
            // Create a URL path from the file path (for reference)
            let urlPath = relativePath
              .replace(/\\/g, '/')
              .replace(/\.mdx?$/, '');
            
            // If it's index.mdx, the URL path is the directory
            if (entry === 'index.mdx' || entry === 'index.md') {
              urlPath = path.dirname(urlPath);
            }
            
            // Create a document with metadata
            documents.push(
              new Document({
                pageContent: content,
                metadata: {
                  source: fullPath,
                  url: `/${urlPath}`,
                  title: getTitle(content),
                },
              })
            );
          }
        } catch (err) {
          console.error(`Error processing ${fullPath}:`, err);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${directory}:`, err);
    }
  }
  
  await processDirectory(pagesDir);
  console.log(`Loaded ${documents.length} documents`);
  return documents;
}

/**
 * Extract a title from markdown content
 */
function getTitle(content: string): string {
  // Try to find a markdown title
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch) {
    return titleMatch[1];
  }
  
  // Try to find a YAML frontmatter title
  const frontmatterMatch = content.match(/^---\s*(?:\n|\r\n?)(?:.*(?:\n|\r\n?))*?title:\s*(.+?)(?:\n|\r\n?)(?:.*(?:\n|\r\n?))*?---/m);
  if (frontmatterMatch) {
    return frontmatterMatch[1].trim();
  }
  
  // If no title is found, return a default
  return 'Untitled Document';
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
      console.log('Vector store table exists, updating documents...');
      
      // Load and process documents
      const documents = await loadDocuments();
      
      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const chunks = await textSplitter.splitDocuments(documents);
      console.log(`Split ${documents.length} documents into ${chunks.length} chunks`);
      
      // Clear existing data
      console.log('Clearing existing data from the vector store...');
      await client.from(tableName).delete().neq('id', 0);
      
      // Create vector store with new documents
      console.log('Adding new documents to the vector store...');
      await SupabaseVectorStore.fromDocuments(
        chunks,
        embeddings,
        {
          client,
          tableName,
          queryName: 'match_documents',
        }
      );
      
      console.log('✅ Vector store updated successfully!');
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
      
      // Load and process documents
      const documents = await loadDocuments();
      
      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const chunks = await textSplitter.splitDocuments(documents);
      console.log(`Split ${documents.length} documents into ${chunks.length} chunks`);
      
      // Create vector store
      console.log('Creating vector store with documents...');
      await SupabaseVectorStore.fromDocuments(
        chunks,
        embeddings,
        {
          client,
          tableName,
          queryName: 'match_documents',
        }
      );
      
      console.log('✅ Vector store initialized successfully!');
    }
  } catch (error) {
    console.error('❌ Error initializing vector store:', error);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure you have run the SQL script in Supabase:');
    console.log('   - Go to your Supabase project dashboard');
    console.log('   - Navigate to the "SQL Editor" section');
    console.log('   - Create a "New Query" and paste the contents of scripts/setup-all-tables.sql');
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
}); 