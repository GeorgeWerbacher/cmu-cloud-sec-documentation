import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

// Import our optimization utilities
import { getCachedResponse, cacheResponse } from '../../utils/apiCache';
import { trackUsage, estimateTokenCount, checkRateLimit } from '../../utils/usageTracking';
import { optimizeContext, isFollowUpQuestion } from '../../utils/contextOptimizer';

// Remove the edge runtime directive for Next.js 13 compatibility
// export const runtime = 'edge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Chat API route called');
    const { messages } = req.body;
    console.log('User messages:', JSON.stringify(messages.slice(-1)));

    // Get the last user message for context retrieval
    const lastUserMessage = messages
      .filter((msg: any) => msg.role === 'user')
      .pop();

    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message provided' });
    }

    // Get user identifier (use session ID or user ID if available)
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    // Check rate limits before processing
    const rateLimitCheck = await checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: {
          limit: rateLimitCheck.limit,
          usage: rateLimitCheck.usage,
          reset: 'next day'
        }
      });
    }

    // Check if we already have a cached response for this query
    const cachedResponse = await getCachedResponse(lastUserMessage.content, '');
    if (cachedResponse) {
      console.log('Serving cached response');
      
      // Set up streaming response headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Send the cached response in the expected format
      res.write(`data: ${JSON.stringify({ content: cachedResponse, role: 'assistant' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // Determine if this is a follow-up question
    const isFollowUp = isFollowUpQuestion(lastUserMessage.content, messages);
    console.log(`Query type: ${isFollowUp ? 'Follow-up question' : 'New question'}`);

    // Retrieve relevant documents based on the user's query
    let contextText = '';
    let retrievalError = false;
    let relevantDocs: any[] = [];
    
    if (lastUserMessage) {
      try {
        console.log(`Searching for relevant documents for query: "${lastUserMessage.content}"`);
        
        // Configure Supabase client
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        
        console.log(`Supabase URL: ${supabaseUrl ? 'configured' : 'MISSING'}`);
        console.log(`Supabase Key: ${supabaseKey ? 'configured' : 'MISSING'}`);
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('Missing Supabase credentials');
          throw new Error('Supabase configuration missing');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client created');
        
        const embeddings = new OpenAIEmbeddings();
        console.log('OpenAI embeddings initialized');
        
        // Skip embedding and retrieval for certain follow-up questions to save costs
        if (isFollowUp && lastUserMessage.content.toLowerCase().includes('tell me more')) {
          console.log('Skipping retrieval for simple follow-up');
        } else {
          // Create embedding from query
          console.log('Creating embedding for query...');
          const queryEmbedding = await embeddings.embedQuery(lastUserMessage.content);
          console.log('Embedding created, vector dimension:', queryEmbedding.length);
          
          // Search for similar documents
          console.log('Searching for documents in Supabase...');
          const { data: docs, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: isFollowUp ? 0.75 : 0.5, // Higher threshold for follow-ups
            match_count: isFollowUp ? 2 : 4 // Fewer docs for follow-ups
          });
          
          if (error) {
            console.error('Supabase query error:', error);
            throw error;
          }
          
          console.log(`Supabase search complete. Found ${docs?.length || 0} documents`);
          relevantDocs = docs || [];
        }
        
        if (relevantDocs.length > 0) {
          // Use our context optimizer to prepare the context text
          contextText = optimizeContext(lastUserMessage.content, relevantDocs, {
            isFollowUpQuestion: isFollowUp
          });
          
          // Log each document for debugging
          relevantDocs.forEach((doc, i) => {
            const metadata = typeof doc.metadata === 'string' 
              ? JSON.parse(doc.metadata) 
              : doc.metadata || {};
            
            const source = metadata.source || 'Documentation';
            console.log(`Document ${i + 1} - Source: ${source}, Similarity: ${doc.similarity.toFixed(4)}`);
          });
        } else {
          console.log('No relevant documents found');
        }
      } catch (error) {
        console.error('Error retrieving context from vector store:', error);
        retrievalError = true;
        // Continue without context if there's an error
      }
    }

    // Create a context for the assistant with cloud security focus
    let systemMessage = `You are an AI assistant for the CMU Cloud Security course. 
      Provide helpful, accurate, and concise information about cloud security concepts, 
      best practices, and technologies. If you're unsure about something, acknowledge 
      the limitations of your knowledge. Focus on AWS, Azure, GCP, and general cloud 
      security principles. Avoid giving incorrect information.`;
      
    if (contextText) {
      systemMessage += `\n\n${contextText}\n\nWhen referencing the documentation, don't explicitly state that you're using content from the passages. 
      Instead, naturally incorporate the information into your response. If the passages don't contain 
      information relevant to the user's question, rely on your general knowledge to provide a response.`;
    }
    
    if (retrievalError) {
      systemMessage += `\n\nNote: There was an issue connecting to the document database, so you may not have access to the most up-to-date course materials. Please rely on your general knowledge about cloud security.`;
    }

    console.log('System message length:', systemMessage.length);
    console.log('Creating AI response...');

    // Estimate token usage for tracking
    const promptTokens = estimateTokenCount(systemMessage) + 
                         messages.reduce((sum, msg) => sum + estimateTokenCount(msg.content), 0);
    
    // Create a properly formatted messages array for AI SDK
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    console.log('Streaming response to client...');
    
    // Set response max tokens based on query complexity
    const maxTokens = isFollowUp ? 800 : 1200;
    
    // Use the AI SDK streamText function with Anthropic
    const result = streamText({
      model: anthropic('claude-3-haiku-20240307'),
      system: systemMessage,
      messages: formattedMessages,
      maxTokens: maxTokens,
    });
    
    // Convert to a properly formatted stream response
    const response = result.toDataStreamResponse();
    
    // Set appropriate headers on the NextApiResponse
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Pipe the stream to the response
    const { body } = response;
    if (!body) {
      throw new Error('Response body is null');
    }
    
    // Track the full response for caching
    let fullResponse = '';
    
    // Handle the stream
    const reader = body.getReader();
    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Write the chunk to the response
          res.write(value);
          
          // Try to extract the content from the chunk for caching
          try {
            const chunk = new TextDecoder().decode(value);
            const matches = chunk.match(/data: (\{.*?\})/g);
            if (matches) {
              for (const match of matches) {
                if (match.includes('"content":"') && !match.includes('"content":""')) {
                  const data = JSON.parse(match.replace('data: ', ''));
                  if (data.content) {
                    fullResponse += data.content;
                  }
                }
              }
            }
          } catch (error) {
            // Ignore parsing errors in streaming chunks
          }
        }
        
        // Cache the response if it's not empty
        if (fullResponse) {
          await cacheResponse(lastUserMessage.content, contextText, fullResponse);
          
          // Track API usage
          const completionTokens = estimateTokenCount(fullResponse);
          await trackUsage(userId, promptTokens, completionTokens);
          
          console.log('Response cached and usage tracked');
          console.log(`Estimated tokens - Prompt: ${promptTokens}, Completion: ${completionTokens}`);
        }
        
        res.end();
      } catch (error) {
        console.error('Error processing stream:', error);
        res.status(500).end();
      }
    };
    
    // Start processing
    processStream().catch(error => {
      console.error('Error processing stream:', error);
      res.status(500).end();
    });
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({ 
      error: 'An error occurred during your request.',
      details: error.message
    });
  }
}
