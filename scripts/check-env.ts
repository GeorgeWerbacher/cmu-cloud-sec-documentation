// Environment variable checker script
// Run with: npx ts-node scripts/check-env.ts

import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Helper function to mask string for display
function maskString(str: string | undefined): string {
  if (!str) return 'NOT SET';
  if (str.length < 8) return '******';
  return str.substring(0, 3) + '...' + str.substring(str.length - 3);
}

interface EnvCheckResult {
  status: 'success' | 'warning' | 'error';
  message: string;
}

/**
 * Check environment variables and connections
 */
async function checkEnvironment(): Promise<void> {
  console.log('🔍 Checking environment variables...\n');
  
  // Check Supabase environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  console.log('Supabase Configuration:');
  console.log(`SUPABASE_URL: ${supabaseUrl ? supabaseUrl : 'NOT SET'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${maskString(supabaseKey)}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${maskString(supabaseAnonKey)}`);
  
  // Check OpenAI variables
  const openaiKey = process.env.OPENAI_API_KEY;
  console.log('\nOpenAI Configuration:');
  console.log(`OPENAI_API_KEY: ${maskString(openaiKey)}`);
  
  // Check Anthropic variables
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  console.log('\nAnthropic Configuration:');
  console.log(`ANTHROPIC_API_KEY: ${maskString(anthropicKey)}`);
  
  // Run connection tests
  console.log('\n🧪 Running connection tests...\n');
  
  const testResults: Record<string, EnvCheckResult> = {};
  
  // Test Supabase connection
  if (!supabaseUrl || !supabaseKey) {
    testResults.supabase = {
      status: 'error',
      message: 'Supabase URL or key is missing'
    };
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('documents_embeddings').select('id').limit(1);
      
      if (error) {
        testResults.supabase = {
          status: 'error',
          message: `Supabase connection error: ${error.message}`
        };
      } else {
        testResults.supabase = {
          status: 'success',
          message: `Supabase connection successful! Found ${data?.length || 0} documents`
        };
      }
    } catch (err: any) {
      testResults.supabase = {
        status: 'error',
        message: `Supabase connection error: ${err.message}`
      };
    }
  }
  
  // Test OpenAI API
  if (!openaiKey) {
    testResults.openai = {
      status: 'error',
      message: 'OpenAI API key is missing'
    };
  } else {
    try {
      const embeddings = new OpenAIEmbeddings();
      const result = await embeddings.embedQuery('Test query');
      
      testResults.openai = {
        status: 'success',
        message: `OpenAI API connection successful! Got embedding of length ${result.length}`
      };
    } catch (err: any) {
      testResults.openai = {
        status: 'error',
        message: `OpenAI API error: ${err.message}`
      };
    }
  }
  
  // Display test results
  console.log('Test Results:');
  Object.entries(testResults).forEach(([name, result]) => {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${name}: ${result.message}`);
  });
  
  // Overall system status
  const hasErrors = Object.values(testResults).some(result => result.status === 'error');
  
  console.log('\n📊 System Status:');
  if (hasErrors) {
    console.log('❌ Some tests failed. Please fix the errors before continuing.');
    console.log('\nTroubleshooting Tips:');
    console.log('1. Check that your .env.local file contains all required variables');
    console.log('2. Verify that your Supabase URL and keys are correct');
    console.log('3. Ensure your OpenAI API key has sufficient credits and permissions');
    console.log('4. Try running the SQL setup script in the Supabase dashboard');
  } else {
    console.log('✅ All systems operational!');
    console.log('\nNext Steps:');
    console.log('1. Initialize the vector store: npm run init-rag');
    console.log('2. Run a test query: npm run test-rag');
    console.log('3. Start the development server: npm run dev');
  }
}

// Run the main function with error handling
checkEnvironment().catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
}); 