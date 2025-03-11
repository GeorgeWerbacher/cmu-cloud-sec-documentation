import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configure Supabase client
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const tableName = 'documents_embeddings';
  
  const results = {
    configCheck: {
      supabaseUrl: supabaseUrl ? '✅ Configured' : '❌ Missing',
      supabaseKey: supabaseKey ? '✅ Configured' : '❌ Missing',
      openAIKey: process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'
    },
    connectionTest: null,
    tableCheck: null,
    testQuery: null,
    error: null
  };
  
  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required configuration');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    results.connectionTest = '✅ Supabase client created';
    
    // Check if table exists
    const { data: tableData, error: tableError } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (tableError) {
      results.tableCheck = `❌ Table error: ${tableError.message}`;
      throw tableError;
    }
    
    // Count records in table
    const { data: countData, error: countError } = await supabase
      .from(tableName)
      .select('id', { count: 'exact' });
    
    if (countError) {
      results.tableCheck = `❌ Count error: ${countError.message}`;
      throw countError;
    }
    
    results.tableCheck = `✅ Table exists with ${countData.length} records`;
    
    // Run test query
    const testQuery = "What is cloud security?";
    const embeddings = new OpenAIEmbeddings();
    const queryEmbedding = await embeddings.embedQuery(testQuery);
    
    const { data: queryResults, error: queryError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 3
    });
    
    if (queryError) {
      results.testQuery = `❌ Query error: ${queryError.message}`;
      throw queryError;
    }
    
    results.testQuery = {
      status: '✅ Query successful',
      resultsCount: queryResults.length,
      topResults: queryResults.slice(0, 2).map(doc => {
        const metadata = typeof doc.metadata === 'string' 
          ? JSON.parse(doc.metadata) 
          : doc.metadata || {};
        
        return {
          source: metadata.source || 'Unknown',
          similarity: doc.similarity,
          contentPreview: doc.content.substring(0, 100) + '...'
        };
      })
    };
    
    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    results.error = error.message;
    
    res.status(500).json({
      success: false,
      results
    });
  }
} 