'use client';

// @ts-ignore - Ignore TypeScript errors for React imports
import React from 'react';

// @ts-ignore - Ignore TypeScript errors for React hooks
const { useState, useEffect } = React as any;
import { ChatComponent } from './ChatComponent';

interface FloatingChatButtonProps {}

export function FloatingChatButton({}: FloatingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use effect to mark as mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Don't render anything until we're on the client
  if (!mounted) return null;

  return (
    <div className="floating-chat-container">
      {isOpen && (
        <div className="floating-chat-window">
          <div className="chat-header">
            <h3>Cloud Security Assistant</h3>
            <button onClick={toggleChat} className="close-button">
              ×
            </button>
          </div>
          <div className="chat-body">
            <ChatComponent isFloating={true} />
          </div>
        </div>
      )}
      
      <button 
        onClick={toggleChat} 
        className={`floating-chat-button ${isOpen ? 'open' : ''}`}
        aria-label="Toggle chat assistant"
      >
        {isOpen ? '×' : '?'}
      </button>

      <style jsx>{`
        .floating-chat-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .floating-chat-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          border: none;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        
        .floating-chat-button:hover {
          background: #1d4ed8;
          transform: scale(1.05);
        }
        
        .floating-chat-button.open {
          background: #1f2937;
        }
        
        .floating-chat-window {
          position: absolute;
          bottom: 70px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .chat-header {
          padding: 12px 16px;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .close-button {
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
        }
        
        .chat-body {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        @media (max-width: 600px) {
          .floating-chat-window {
            width: calc(100vw - 40px);
            height: 60vh;
            bottom: 70px;
            right: 0;
          }
        }
      `}</style>
    </div>
  );
}
