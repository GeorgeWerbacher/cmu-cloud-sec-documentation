// API endpoint for Perplexity AI integration
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Prepare the request to Perplexity API
    // Documentation: https://docs.perplexity.ai/reference/post_chat_completions
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-7b-instruct',  // Use the appropriate model for your needs
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for a Cloud Security course. Provide helpful, accurate, and educational responses to questions about cloud security concepts, best practices, and technologies. Focus on AWS, Azure, and GCP when appropriate. ${context ? `Context: ${context}` : ''}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Error from Perplexity API', 
        details: errorData 
      });
    }

    const data = await response.json();
    
    // Extract the assistant's response
    const answer = data.choices[0].message.content;

    // Return the response to the client
    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
