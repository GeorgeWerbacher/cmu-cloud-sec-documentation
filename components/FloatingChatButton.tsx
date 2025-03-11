'use client';

// @ts-ignore - Ignore TypeScript errors for React imports
import React from 'react';

// @ts-ignore - Ignore TypeScript errors for React hooks
const { useState, useEffect } = React as any;
import { UnifiedChat } from './UnifiedChat';
// CSS is imported globally in _app.tsx

interface FloatingChatButtonProps {}

export function FloatingChatButton({}: FloatingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use effect to mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Reset full screen when closing
    if (isOpen) {
      setIsFullScreen(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Don't render anything until we're on the client
  if (!mounted) return null;

  return (
    <div className="floating-chat-container">
      {isOpen && (
        <div className={`floating-chat-panel ${isFullScreen ? 'fullscreen' : ''}`}>
          <div className="chat-header">
            <div className="header-content">
              <div className="header-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>AI Teaching Assistant</h3>
            </div>
            <div className="header-actions">
              <button onClick={toggleFullScreen} className="fullscreen-button" aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}>
                {isFullScreen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V6C8 6.53043 7.78929 7.03914 7.41421 7.41421C7.03914 7.78929 6.53043 8 6 8H3M21 8H18C17.4696 8 16.9609 7.78929 16.5858 7.41421C16.2107 7.03914 16 6.53043 16 6V3M16 21V18C16 17.4696 16.2107 16.9609 16.5858 16.5858C16.9609 16.2107 17.4696 16 18 16H21M3 16H6C6.53043 16 7.03914 16.2107 7.41421 16.5858C7.78929 16.9609 8 17.4696 8 18V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H21M21 3V9M21 3L14 10M9 21H3M3 21V15M3 21L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <button onClick={toggleChat} className="close-button" aria-label="Close chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="chat-body">
            <UnifiedChat isFloating={true} isFullScreen={isFullScreen} />
          </div>
        </div>
      )}
      
      <button 
        onClick={toggleChat} 
        className={`floating-chat-button ${isOpen ? 'open' : ''}`}
        aria-label="Toggle chat assistant"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
