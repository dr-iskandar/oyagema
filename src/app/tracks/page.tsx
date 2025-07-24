import { Metadata } from 'next';
import TracksPageClient from './TracksPageClient';

export const metadata: Metadata = {
  title: 'All Tracks - Oyagema Music Platform',
  description: 'Discover and explore our complete collection of music tracks. Browse by category, search for your favorite songs, and enjoy high-quality audio streaming.',
  keywords: [
    'music tracks',
    'songs',
    'audio streaming',
    'music collection',
    'browse music',
    'music categories',
    'online music',
    'streaming platform',
    'music discovery',
    'playlist'
  ],
  openGraph: {
    title: 'All Tracks - Oyagema Music Platform',
    description: 'Discover and explore our complete collection of music tracks. Browse by category, search for your favorite songs, and enjoy high-quality audio streaming.',
    type: 'website',
    url: 'https://oyagema.com/tracks',
    siteName: 'Oyagema',
    images: [
      {
        url: '/images/og-tracks.jpg',
        width: 1200,
        height: 630,
        alt: 'Oyagema Music Tracks Collection'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Tracks - Oyagema Music Platform',
    description: 'Discover and explore our complete collection of music tracks. Browse by category, search for your favorite songs, and enjoy high-quality audio streaming.',
    images: ['/images/og-tracks.jpg']
  },
  alternates: {
    canonical: 'https://oyagema.com/tracks'
  }
};

export default function TracksPage() {
  return <TracksPageClient />;
}