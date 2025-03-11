'use client';

import { useChat } from 'ai/react';
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
// CSS is imported globally in _app.tsx

// TypeScript types
type FormEvent<T = Element> = any;

interface UnifiedChatProps {
  isFloating?: boolean;
  isFullScreen?: boolean;
}

// Typing Indicator Component
const TypingIndicator = () => (
  <div className="typing-indicator">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

/**
 * UnifiedChat component combines the functionality of the former Chat.jsx and ChatComponent.tsx
 * It handles both UI display and API integration in a single component
 */
export function UnifiedChat({ isFloating = false, isFullScreen = false }: UnifiedChatProps) {
  // Client-side rendering check
  const [mounted, setMounted] = useState(false);
  
  // Chat state
  const [errorInfo, setErrorInfo] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(isFullScreen);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  
  // Refs for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the useChat hook with enhanced configuration
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Add functionality for code blocks syntax highlighting
  useEffect(() => {
    // Function to set up syntax highlighting for code blocks
    const setupSyntaxHighlighting = () => {
      // Find all pre elements
      const codeBlocks = document.querySelectorAll('.markdown-content pre');
      
      codeBlocks.forEach((codeBlock) => {
        const codeElement = codeBlock.querySelector('code');
        if (!codeElement) return;
        
        // Try to detect language
        let language = 'code';
        const classNames = codeElement.className.split(' ');
        for (const className of classNames) {
          if (className.startsWith('language-')) {
            language = className.replace('language-', '');
            break;
          }
        }
        
        // Set the data-language attribute for display
        codeBlock.setAttribute('data-language', language);
        
        // Create a header div for the code block that will contain language info and copy button
        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';
        
        // Add language label to the header
        const languageLabel = document.createElement('span');
        languageLabel.className = 'code-language';
        languageLabel.textContent = language.toUpperCase();
        codeHeader.appendChild(languageLabel);
        
        // Add copy button to the header
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-button';
        copyButton.textContent = 'Copy';
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');
        codeHeader.appendChild(copyButton);
        
        // Add click event to copy button
        copyButton.addEventListener('click', () => {
          // Get the code content
          const code = codeElement.textContent || '';
          
          // Copy to clipboard
          navigator.clipboard.writeText(code).then(
            () => {
              // Success feedback
              copyButton.textContent = 'Copied!';
              copyButton.classList.add('copied');
              setTimeout(() => {
                copyButton.textContent = 'Copy';
                copyButton.classList.remove('copied');
              }, 2000);
            },
            () => {
              // Error feedback
              copyButton.textContent = 'Failed';
              copyButton.classList.add('error');
              setTimeout(() => {
                copyButton.textContent = 'Copy';
                copyButton.classList.remove('error');
              }, 2000);
            }
          );
        });
        
        // Insert the header at the beginning of the code block
        if (!codeBlock.querySelector('.code-header')) {
          codeBlock.insertBefore(codeHeader, codeBlock.firstChild);
        }
        
        // Basic syntax highlighting - replace with regex
        const content = codeElement.innerHTML;
        
        // Apply syntax highlighting based on language
        let highlightedContent = content;
        
        // Keywords - for most programming languages
        const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'new', 'this', 'super', 'extends', 'static', 'public', 'private', 'protected', 'true', 'false', 'null', 'undefined'];
        keywords.forEach(keyword => {
          // Replace only whole words, not parts of other words
          const regex = new RegExp(`\\b${keyword}\\b`, 'g');
          highlightedContent = highlightedContent.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        
        // Strings
        highlightedContent = highlightedContent.replace(
          /(["'`])(.*?)\1/g, 
          '<span class="string">$1$2$1</span>'
        );
        
        // Numbers
        highlightedContent = highlightedContent.replace(
          /\b(\d+(\.\d+)?)\b/g,
          '<span class="number">$1</span>'
        );
        
        // Comments - for different languages
        highlightedContent = highlightedContent.replace(
          /(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm,
          '<span class="comment">$1</span>'
        );
        
        // Functions
        highlightedContent = highlightedContent.replace(
          /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
          '<span class="function">$1</span>('
        );
        
        // Apply the highlighted code
        codeElement.innerHTML = highlightedContent;
      });
    };
    
    // Small delay to ensure the DOM is updated
    const timer = setTimeout(() => {
      setupSyntaxHighlighting();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [messages]); // Re-run whenever messages change

  // Use effect to mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample suggested questions
  const suggestedQuestions = [
    "What is the shared responsibility model?",
    "How does zero trust work in cloud?",
    "Tips for securing containers on AWS?",
    "GCP security best practices?",
    "What are common cloud security threats?",
    "How to implement least privilege in cloud?",
    "Best practices for securing S3 buckets"
  ];

  // Initial questions to show
  const initialQuestions = suggestedQuestions.slice(0, 3);
  // Additional questions to show when "Show more" is clicked
  const additionalQuestions = suggestedQuestions.slice(3);

  // Toggle show more questions
  const toggleShowMore = () => {
    setShowMoreQuestions(!showMoreQuestions);
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    const fakeEvent = {
      preventDefault: () => {},
      currentTarget: {
        elements: {
          message: { value: question }
        }
      }
    } as unknown as FormEvent<HTMLFormElement>;
    safeHandleSubmit(fakeEvent);
  };

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

  // Format messages for rendering
  const formattedMessages = messages.map(message => ({
    text: message.content,
    sender: message.role === 'user' ? 'user' : 'ai'
  }));

  return (
    <div className={`chat-container ${isFloating ? 'floating' : 'inline'} ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Messages Display */}
      <div 
        ref={chatContainerRef}
        className="messages-container"
      >
        {formattedMessages.length === 0 ? (
          <div className="empty-state">
            <div className="orb-container">
              <div className="orb-pulse"></div>
              <div className="orb"></div>
            </div>
            <h2 className="empty-state-title">Cloud Security Assistant</h2>
            <p className="empty-state-subtitle">What do you want to know about cloud security?</p>
            <div className="suggested-questions">
              {initialQuestions.map((question, index) => (
                <button 
                  key={index} 
                  className="suggested-question"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </button>
              ))}
              
              {showMoreQuestions && additionalQuestions.map((question, index) => (
                <button 
                  key={index} 
                  className="suggested-question"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </button>
              ))}
              
              {additionalQuestions.length > 0 && (
                <button className="show-more-button" onClick={toggleShowMore}>
                  {showMoreQuestions ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="chat-messages-wrapper">
            <div className="chat-messages">
              {formattedMessages.map((message, index) => (
                <div key={index} className={`message-wrapper ${message.sender}`}>
                  <div className="message">
                    <div className="message-avatar">
                      {message.sender === 'user' ? (
                        <div className="user-avatar">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="ai-avatar">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="message-content">
                      {message.sender === 'ai' ? (
                        <div className="markdown-content">
                          <ReactMarkdown>
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator shown when AI is generating a response */}
              {isLoading && (
                <div className="message-wrapper ai">
                  <div className="message">
                    <div className="message-avatar">
                      <div className="ai-avatar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <div className="message-content">
                      <TypingIndicator />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error message */}
              {errorInfo && (
                <div className="error-message">
                  <p>{errorInfo}</p>
                </div>
              )}
              
              {/* Invisible element for scrolling to bottom */}
              <div ref={messagesEndRef} style={{ height: "1px", clear: "both" }} />
            </div>
          </div>
        )}
      </div>
      
      {/* Input Form */}
      <div className="chat-input-container">
        <form onSubmit={safeHandleSubmit} className="chat-form">
          <div className="input-wrapper">
            <input
              className="chat-input"
              value={input}
              placeholder="Ask about cloud security..."
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="send-button"
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 