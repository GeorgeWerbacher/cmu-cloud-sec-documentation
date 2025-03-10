import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export const runtime = 'edge';

export default async function handler(req: Request) {
  try {
    const { messages } = await req.json();

    // Create a context for the assistant with cloud security focus
    const systemMessage = `You are an AI assistant for the CMU Cloud Security course. 
      Provide helpful, accurate, and concise information about cloud security concepts, 
      best practices, and technologies. If you're unsure about something, acknowledge 
      the limitations of your knowledge. Focus on AWS, Azure, GCP, and general cloud 
      security principles. Avoid giving incorrect information.`;

    // Stream the text response using the AI SDK's streamText function
    const result = streamText({
      model: anthropic('claude-3-7-sonnet-20250219'),
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
