import fs from 'fs';
import path from 'path';
import { Document } from 'langchain/document';

/**
 * Loads and processes markdown files from the pages directory
 * to be used in the RAG system.
 */
export async function loadDocuments(): Promise<Document[]> {
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
 * This is a simple implementation - you may want to enhance it
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