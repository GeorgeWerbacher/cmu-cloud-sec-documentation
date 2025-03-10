// Environment variables check script
// Run with: node scripts/check-env.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Helper to safely print sensitive values
function maskString(str) {
  if (!str) return 'NOT SET';
  return str.substring(0, 4) + '*'.repeat(Math.max(str.length - 8, 4)) + str.substring(str.length - 4);
}

console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('');

// Check Supabase variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', maskString(supabaseUrl));
console.log('SUPABASE_SERVICE_ROLE_KEY:', maskString(supabaseKey));
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', maskString(supabaseAnonKey));
console.log('');

// Check OpenAI variable
const openaiKey = process.env.OPENAI_API_KEY;
console.log('OPENAI_API_KEY:', maskString(openaiKey));
console.log('');

// Check Anthropic variable
const anthropicKey = process.env.ANTHROPIC_API_KEY;
console.log('ANTHROPIC_API_KEY:', maskString(anthropicKey));
console.log('');

// Check if essential variables are set
const essentialVars = [
  { name: 'SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL', value: supabaseUrl },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseKey },
  { name: 'OPENAI_API_KEY', value: openaiKey },
  { name: 'ANTHROPIC_API_KEY', value: anthropicKey }
];

let missingVars = essentialVars.filter(v => !v.value);

if (missingVars.length > 0) {
  console.log('❌ MISSING REQUIRED VARIABLES:');
  missingVars.forEach(v => {
    console.log(` - ${v.name}`);
  });
  console.log('');
  console.log('Please add these variables to your .env.local file.');
} else {
  console.log('✅ All essential environment variables are set.');
}

console.log('');

// Test Supabase connection
if (supabaseUrl && supabaseKey) {
  console.log('=== TESTING SUPABASE CONNECTION ===');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Function to test connection
    async function testConnection() {
      try {
        console.log('Connecting to Supabase...');
        const { data, error } = await supabase.from('documents_embeddings').select('id').limit(1);
        
        if (!error) {
          console.log('✅ Successfully connected to Supabase!');
          if (data && data.length > 0) {
            console.log('✅ Vector store table exists and contains data.');
          } else {
            console.log('ℹ️ Vector store table exists but appears to be empty.');
          }
        } else {
          if (error.code === 'PGRST116') {
            console.log('❌ Table "documents_embeddings" not found.');
            console.log('You need to run the SQL setup script in Supabase SQL Editor.');
            console.log('Use the contents of scripts/supabase-setup.sql to create the necessary tables and functions.');
          } else {
            console.log('❌ Error connecting to database:', error);
          }
        }
      } catch (err) {
        console.error('❌ Error testing Supabase connection:', err);
      }
    }
    
    testConnection();
  } catch (err) {
    console.error('❌ Error initializing Supabase client:', err);
  }
} 