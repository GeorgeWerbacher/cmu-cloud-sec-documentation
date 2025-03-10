import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the FloatingChatButton with SSR disabled
const FloatingChatButton = dynamic(
  () => import('../components/FloatingChatButton').then(mod => ({ default: mod.FloatingChatButton })),
  { ssr: false }
);

export default function MyApp({ Component, pageProps }) {
  const [isAIAssistantPage, setIsAIAssistantPage] = useState(false);
  
  // Check if the current page is the AI assistant page
  useEffect(() => {
    setIsAIAssistantPage(window.location.pathname.includes('/ai-assistant'));
  }, []);
  
  return (
    <>
      <Component {...pageProps} />
      {!isAIAssistantPage && <FloatingChatButton />}
    </>
  );
}
