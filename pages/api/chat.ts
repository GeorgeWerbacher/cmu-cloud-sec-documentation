import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { searchDocuments } from '../../utils/vectorStore';

export const runtime = 'edge';

export default async function handler(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the last user message for context retrieval
    const lastUserMessage = messages
      .filter((msg: any) => msg.role === 'user')
      .pop();

    // Retrieve relevant documents based on the user's query
    let contextText = '';
    let retrievalError = false;
    
    if (lastUserMessage) {
      try {
        console.log(`Searching for relevant documents for query: "${lastUserMessage.content}"`);
        const relevantDocs = await searchDocuments(lastUserMessage.content, 3);
        
        if (relevantDocs.length > 0) {
          console.log(`Found ${relevantDocs.length} relevant documents`);
          contextText = `Here are some relevant passages from our documentation that might help answer the question:\n\n`;
          
          relevantDocs.forEach((doc, i) => {
            contextText += `Passage ${i + 1} (from ${doc.metadata.title || 'Documentation'}):\n${doc.pageContent}\n\n`;
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

    // Stream the text response using the AI SDK's streamText function
    const result = streamText({
      model: anthropic('claude-3-haiku-20240307'),
      system: systemMessage,
      messages,
    });

    // Return the stream response
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during your request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
