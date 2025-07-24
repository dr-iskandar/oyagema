import { Metadata } from 'next';
import LibraryPageClient from './LibraryPageClient';

export const metadata: Metadata = {
  title: 'Your Library | Oyagema - Personal Spiritual Music Collection',
  description: 'Access your personal library of spiritual music, listening history, and saved tracks. Manage your spiritual music journey and discover your listening patterns.',
  keywords: [
    'music library',
    'spiritual music collection',
    'listening history',
    'personal music library',
    'saved spiritual tracks',
    'meditation music history',
    'healing music collection',
    'mindfulness music library',
    'prayer music collection',
    'devotional music library'
  ],
  openGraph: {
    title: 'Your Library | Oyagema',
    description: 'Access your personal collection of spiritual music and listening history.',
    type: 'website',
    url: 'https://oyagema.com/library',
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
    title: 'Your Library | Oyagema',
    description: 'Access your personal collection of spiritual music and listening history.',
    images: ['/images/og-image.svg']
  },
  alternates: {
    canonical: 'https://oyagema.com/library'
  }
};

export default function LibraryPage() {
  return <LibraryPageClient />;
}