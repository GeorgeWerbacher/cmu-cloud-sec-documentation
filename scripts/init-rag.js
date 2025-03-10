// This is a JavaScript version of the init script that should work more reliably
// Run with: node scripts/init-rag.js

// Use require here for compatibility
require('ts-node').register({ transpileOnly: true });
require('./initVectorStore.ts'); 