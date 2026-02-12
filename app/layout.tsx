"use client";

import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import { Toaster } from 'sonner';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

import { LanguageProvider } from '@/components/language-provider';
import { LanguageSelector } from '@/components/language-selector';
import { VideoModal } from '@/components/video-modal';
import { UserTypeSelector } from '@/components/user-type-selector';

function AppContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <LanguageProvider>
      <LanguageSelector />
      <VideoModal />
      <UserTypeSelector />
      {children}
    </LanguageProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <AppContent>
          <main>
            {children}
            <Toaster position="top-right" />
            <Script src="https://elevenlabs.io/convai-widget/index.js" strategy="lazyOnload" />
          </main>
        </AppContent>
      </body>
    </html>
  );
}
