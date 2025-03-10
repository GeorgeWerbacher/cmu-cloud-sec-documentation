const fs = require('fs');
const path = require('path');
const { createVectorStore, VercelVectorProvider } = require('@vercel/vector');

// Create vector store client
const vectorStore = createVectorStore({
  provider: new VercelVectorProvider(),
});

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'pages'); // Path to your documentation
const NAMESPACE = 'cloud-security-docs';
const CHUNK_SIZE = 1000; // Characters per chunk

// Function to read and process markdown files
async function processMarkdownFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      await processMarkdownFiles(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      // Process markdown files
      console.log(`Processing ${filePath}`);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Skip files that are too small or are just imports
      if (content.length < 100 || content.trim().startsWith('import')) {
        continue;
      }
      
      // Remove frontmatter
      const contentWithoutFrontmatter = content.replace(/---[\s\S]*?---/, '');
      
      // Simple chunking strategy (could be improved)
      const chunks = chunkContent(contentWithoutFrontmatter, CHUNK_SIZE);
      
      // Index each chunk
      for (let i = 0; i < chunks.length; i++) {
        await vectorStore.upsert({
          namespace: NAMESPACE,
          id: `${filePath.replace(/[\/\\]/g, '_')}_${i}`,
          content: chunks[i],
          metadata: {
            source: filePath,
            chunkIndex: i
          }
        });
      }
    }
  }
}

// Function to chunk content
function chunkContent(content, chunkSize) {
  const chunks = [];
  let currentChunk = '';
  
  // Split by paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, save current chunk and start a new one
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    
    currentChunk += paragraph + '\n\n';
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Main function
async function main() {
  console.log('Starting content indexing...');
  await processMarkdownFiles(CONTENT_DIR);
  console.log('Content indexing complete!');
}

main().catch(console.error); 