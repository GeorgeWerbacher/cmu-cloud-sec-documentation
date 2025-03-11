import { estimateTokenCount } from './usageTracking';

/**
 * Interface representing a relevant document from the RAG system
 */
interface RelevantDocument {
  content: string;
  similarity: number;
  metadata: {
    source?: string;
    [key: string]: any;
  } | string;
}

/**
 * Default maximum context size in tokens
 * This helps control API costs while still providing enough context
 */
const DEFAULT_MAX_CONTEXT_TOKENS = 2000;

/**
 * Optimizes context size based on query and document relevance
 * @param query The user's query
 * @param relevantDocs Array of relevant documents from the RAG system
 * @param options Configuration options
 * @returns Optimized context text
 */
export function optimizeContext(
  query: string,
  relevantDocs: RelevantDocument[],
  options: {
    maxContextTokens?: number;
    minSimilarityThreshold?: number;
    isFollowUpQuestion?: boolean;
  } = {}
): string {
  if (!relevantDocs || relevantDocs.length === 0) {
    return '';
  }

  // Set defaults if options not provided
  const maxContextTokens = options.maxContextTokens || DEFAULT_MAX_CONTEXT_TOKENS;
  const minSimilarityThreshold = options.minSimilarityThreshold || 0.7;
  const isFollowUpQuestion = options.isFollowUpQuestion || false;
  
  // Sort documents by similarity score (highest first)
  const sortedDocs = [...relevantDocs].sort((a, b) => b.similarity - a.similarity);
  
  // For follow-up questions, we can be more aggressive in reducing context
  // since the model likely already has some understanding from previous exchanges
  const effectiveMaxTokens = isFollowUpQuestion 
    ? Math.floor(maxContextTokens * 0.7) // 30% reduction for follow-ups
    : maxContextTokens;
  
  // Check if we have a highly relevant document
  // If so, we can just use that one
  if (sortedDocs[0].similarity > 0.85) {
    const doc = sortedDocs[0];
    const source = typeof doc.metadata === 'string'
      ? 'Documentation'
      : doc.metadata.source || 'Documentation';
    
    return `Here's relevant information from our documentation:\n\n${doc.content}\n\n`;
  }
  
  // Build context starting with most relevant documents
  let contextText = 'Here are some relevant passages from our documentation that might help answer the question:\n\n';
  let currentTokenCount = estimateTokenCount(contextText);
  let includedDocs = 0;
  
  for (const doc of sortedDocs) {
    // Skip documents below the minimum similarity threshold
    if (doc.similarity < minSimilarityThreshold) {
      continue;
    }
    
    // Process metadata
    const metadata = typeof doc.metadata === 'string'
      ? JSON.parse(doc.metadata)
      : doc.metadata;
    
    const source = metadata.source || 'Documentation';
    
    // Estimate tokens for this document
    const docText = `Passage ${includedDocs + 1} (from ${source}):\n${doc.content}\n\n`;
    const docTokens = estimateTokenCount(docText);
    
    // Check if adding this document would exceed our token limit
    if (currentTokenCount + docTokens > effectiveMaxTokens) {
      // If we haven't included any documents yet, we need to include at least one
      // even if it exceeds our token budget
      if (includedDocs === 0) {
        contextText += docText;
        includedDocs++;
      }
      break;
    }
    
    // Add this document to the context
    contextText += docText;
    currentTokenCount += docTokens;
    includedDocs++;
    
    // Hard limit on number of documents for clarity
    if (includedDocs >= 3) {
      break;
    }
  }
  
  console.log(`Context optimization: ${includedDocs} documents, ~${currentTokenCount} tokens`);
  
  return contextText;
}

/**
 * Determines if a query is likely a follow-up question
 * @param currentQuery Current question
 * @param messageHistory Previous messages
 * @returns True if the query appears to be a follow-up question
 */
export function isFollowUpQuestion(
  currentQuery: string, 
  messageHistory: { role: string; content: string }[]
): boolean {
  if (messageHistory.length < 3) {
    return false; // Need at least one previous Q&A pair
  }
  
  // Common follow-up indicators
  const followUpPatterns = [
    "tell me more",
    "explain further",
    "can you elaborate",
    "why",
    "how",
    "what about",
    "and",
    "also",
    "elaborate",
    "examples",
    "more details",
    "but what if",
    "what else",
    "could you",
    "follow up",
    "continue",
    "go on",
    "tell me about",
    "specifically",
    "expand on",
    "furthermore"
  ];
  
  // Check if query is very short (likely a follow-up)
  if (currentQuery.split(' ').length < 5) {
    return true;
  }
  
  // Check for follow-up patterns
  const lowercaseQuery = currentQuery.toLowerCase();
  for (const pattern of followUpPatterns) {
    if (lowercaseQuery.includes(pattern)) {
      return true;
    }
  }
  
  // Check if query is similar to previous question
  // (This is a simple approach - could be enhanced with embeddings)
  try {
    const prevUserMessages = messageHistory
      .filter(m => m.role === 'user')
      .slice(-3, -1); // Look at the last 2 user messages before current
      
    for (const msg of prevUserMessages) {
      const overlap = findWordOverlap(lowercaseQuery, msg.content.toLowerCase());
      if (overlap > 0.4) { // 40% word overlap threshold
        return true;
      }
    }
  } catch (error) {
    console.error('Error analyzing message history:', error);
  }
  
  return false;
}

/**
 * Helper function to find word overlap between two strings
 * @param str1 First string
 * @param str2 Second string
 * @returns Percentage of overlap (0 to 1)
 */
function findWordOverlap(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 3));
  
  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }
  
  let overlap = 0;
  for (const word of words1) {
    if (words2.has(word)) {
      overlap++;
    }
  }
  
  return overlap / Math.min(words1.size, words2.size);
} 