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
  title: {
    default: 'Oyagema - Spiritual Music Streaming Platform for Healing & Mindfulness',
    template: '%s | Oyagema - Spiritual Music Streaming'
  },
  description: 'Discover healing music, meditation tracks, and spiritual songs on Oyagema. Stream mindfulness music, instrumental healing sounds, and inspirational content for your spiritual journey.',
  keywords: [
    'spiritual music',
    'healing music',
    'meditation music',
    'mindfulness',
    'musik spiritual',
    'lagu rohani',
    'musik meditasi',
    'musik relaksasi',
    'instrumental music',
    'musik penyembuhan',
    'musik inspiratif',
    'musik terapi'
  ],
  authors: [{ name: 'Oyagema Team' }],
  creator: 'Oyagema',
  publisher: 'Oyagema',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://oyagema.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Oyagema - Spiritual Music Streaming Platform for Healing & Mindfulness',
    description: 'Discover healing music, meditation tracks, and spiritual songs on Oyagema. Stream mindfulness music, instrumental healing sounds, and inspirational content for your spiritual journey.',
    siteName: 'Oyagema',
    images: [
      {
        url: '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Oyagema - Spiritual Music Streaming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oyagema - Spiritual Music Streaming Platform',
    description: 'Discover healing music, meditation tracks, and spiritual songs for your mindfulness journey.',
    images: ['/images/og-image.svg'],
    creator: '@oyagema',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Oyagema",
    "description": "Spiritual music streaming platform for healing and mindfulness",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "https://oyagema.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_BASE_URL || "https://oyagema.com"}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Oyagema",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://oyagema.com"}/icons/icon.svg`
      }
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
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