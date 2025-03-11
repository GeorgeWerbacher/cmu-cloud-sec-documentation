import dynamic from 'next/dynamic';
import { AppProps } from 'next/app';
import '../styles/globals.css'; // Import global styles which includes chat styles

// Dynamically import the FloatingChatButton with SSR disabled
const FloatingChatButton = dynamic(
  () => import('../components/FloatingChatButton').then(mod => ({ default: mod.FloatingChatButton })),
  { ssr: false }
);

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <FloatingChatButton />
    </>
  );
} 