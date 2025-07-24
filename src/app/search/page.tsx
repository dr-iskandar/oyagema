import { Metadata } from 'next';
import SearchPageClient from './SearchPageClient';

export const metadata: Metadata = {
  title: 'Search Spiritual Music | Oyagema - Find Healing & Meditation Tracks',
  description: 'Search and discover spiritual music, healing tracks, meditation sounds, and mindfulness content. Find the perfect music for your spiritual journey and inner peace.',
  keywords: [
    'search spiritual music',
    'healing music search',
    'meditation tracks',
    'spiritual songs',
    'mindfulness music',
    'relaxation sounds',
    'chakra music',
    'yoga music',
    'prayer music',
    'devotional songs'
  ],
  openGraph: {
    title: 'Search Spiritual Music | Oyagema',
    description: 'Discover healing music, meditation tracks, and spiritual content for your mindfulness journey.',
    type: 'website',
    url: 'https://oyagema.com/search',
    siteName: 'Oyagema',
    images: [
      {
        url: '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Oyagema - Spiritual Music Streaming Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Spiritual Music | Oyagema',
    description: 'Discover healing music, meditation tracks, and spiritual content for your mindfulness journey.',
    images: ['/images/og-image.svg']
  },
  alternates: {
    canonical: 'https://oyagema.com/search'
  }
};

export default function SearchPage() {
  return <SearchPageClient />;
}