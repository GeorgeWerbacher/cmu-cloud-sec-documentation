'use client';

import { useChat } from 'ai/react';
// @ts-ignore - Ignore TypeScript errors for React imports
import React from 'react';

// @ts-ignore - Ignore TypeScript errors for React hooks
const { useState, useEffect, useRef } = React as any;

// @ts-ignore - Ignore TypeScript errors for React event types
type FormEvent<T = Element> = any;

interface ChatComponentProps {
  isFloating?: boolean;
}

export function ChatComponent({ isFloating = false }: ChatComponentProps) {
  // State to track if we're on the client side
  const [mounted, setMounted] = useState(false);
  // Track additional error info
  const [errorInfo, setErrorInfo] = useState('');
  // Track streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  // Reference to messages container for auto-scrolling
  const messagesEndRef = useRef(null);

  // Use the useChat hook with enhanced configuration
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onResponse: async (response) => {
      if (!response.ok) {
        setErrorInfo(`API returned status ${response.status}: ${response.statusText}`);
        return;
      }
      
      // Clear any previous errors
      setErrorInfo('');
      
      try {
        // Check if the response is JSON (non-streaming) or SSE (streaming)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Handle non-streaming response
          setIsStreaming(false);
          const data = await response.json();
          console.log('Received non-streaming response:', data);
        } else {
          // Handle streaming response
          setIsStreaming(true);
        }
      } catch (err) {
        console.error('Error processing response:', err);
        setIsStreaming(true); // Default to streaming mode
      }
      
      // Log the response for debugging
      console.log('Chat API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    },
    onFinish: (message) => {
      setIsStreaming(false);
      console.log('Chat finished with message:', message);
    },
    onError: (err) => {
      console.error('Chat error:', err);
      
      // Try to extract a more specific error message
      let errorMessage = 'Error connecting to AI API. Please check your API key or network connection.';
      
      try {
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        // If the error has a response property, try to parse it
        // Use type assertion for the error object
        const errorWithResponse = err as { response?: { body?: ReadableStream } };
        
        if (errorWithResponse.response && errorWithResponse.response.body) {
          // Try to read the response body
          const reader = errorWithResponse.response.body.getReader();
          reader.read().then(({ value, done }) => {
            if (!done && value) {
              const text = new TextDecoder().decode(value);
              try {
                const data = JSON.parse(text);
                if (data.error) {
                  errorMessage = data.error;
                  setErrorInfo(errorMessage);
                }
              } catch (e) {
                // If we can't parse JSON, use the text as is
                if (text) {
                  errorMessage = text;
                  setErrorInfo(errorMessage);
                }
              }
            }
          }).catch(e => {
            console.error('Error reading response body:', e);
          });
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      setErrorInfo(errorMessage);
      setIsStreaming(false);
    }
  });

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages update

  // Use effect to mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample quick questions for the UI
  const quickQuestions = [
    "What is the shared responsibility model?",
    "How does zero trust work in cloud?",
    "Tips for securing containers on AWS?",
    "GCP security best practices?"
  ];

  // Custom submit handler with error handling
  const safeHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    try {
      setErrorInfo('');
      setIsStreaming(false);
      handleSubmit(e);
    } catch (err) {
      console.error('Error in form submission:', err);
      setErrorInfo('Error submitting message. Please try again.');
      setIsStreaming(false);
    }
  };

  // Don't render anything until we're on the client
  if (!mounted) return null;

  return (
    <div className={`chat-container ${isFloating ? 'floating' : 'inline'}`}>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Cloud Security Assistant</h3>
            <p>Ask me anything about cloud security concepts, best practices, or specific cloud providers.</p>
            <div className="quick-questions">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => {
                    const fakeEvent = {
                      preventDefault: () => {},
                      currentTarget: {
                        elements: {
                          message: { value: question }
                        }
                      }
                    } as unknown as FormEvent<HTMLFormElement>;
                    safeHandleSubmit(fakeEvent);
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  {message.content}
                  {index === messages.length - 1 && message.role === 'assistant' && isStreaming && (
                    <span className="cursor"></span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && !isStreaming && (
              <div className="message ai-message">
                <div className="message-content">
                  <div className="thinking">Thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error display */}
      {errorInfo && (
        <div className="error-container">
          <p className="error-message">{errorInfo}</p>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={safeHandleSubmit} className="chat-input-form">
        <input
          type="text"
          name="message"
          placeholder="Ask about cloud security..."
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          className="chat-input"
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          max-width: 800px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .chat-container.floating {
          width: 100%;
          height: 100%;
          max-width: 100%;
          margin: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          scroll-behavior: smooth;
        }
        
        .chat-container.floating .chat-messages {
          max-height: calc(100% - 70px);
        }
        
        .welcome-message {
          text-align: center;
          padding: 16px;
        }
        
        .welcome-message h3 {
          margin-top: 0;
          color: #2563eb;
        }
        
        .quick-questions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 16px;
        }
        
        .quick-question-btn {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 8px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .quick-question-btn:hover {
          background: #e5e7eb;
        }
        
        .message-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        
        .user-message {
          align-self: flex-end;
          background: #2563eb;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .ai-message {
          align-self: flex-start;
          background: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 4px;
        }
        
        .thinking {
          display: inline-block;
          position: relative;
        }
        
        .cursor {
          display: inline-block;
          width: 8px;
          height: 16px;
          background: #2563eb;
          margin-left: 4px;
          animation: blink 1s infinite;
          vertical-align: middle;
        }
        
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .error-container {
          margin: 8px 0;
          padding: 8px 12px;
          background: #fee2e2;
          border-radius: 8px;
          border: 1px solid #ef4444;
        }
        
        .error-message {
          color: #b91c1c;
          margin: 0;
          font-size: 14px;
        }
        
        .chat-input-form {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }
        
        .chat-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .chat-input:focus {
          border-color: #2563eb;
        }
        
        .send-button {
          padding: 8px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .send-button:hover:not(:disabled) {
          background: #1d4ed8;
        }
        
        .send-button:disabled {
          background: #93c5fd;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
