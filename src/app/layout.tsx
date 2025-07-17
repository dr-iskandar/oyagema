import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { AudioPlayerProvider } from '@/lib/contexts/AudioPlayerContext';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#1A1A2E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Oyagema - Spiritual Music Streaming',
  description: 'A spiritual music streaming platform for healing and mindfulness',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Oyagema',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <AudioPlayerProvider>
            <main className="min-h-screen flex flex-col">
              {children}
            </main>
          </AudioPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}