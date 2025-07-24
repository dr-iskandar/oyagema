import { Metadata } from 'next';
import HistoryPageClient from './HistoryPageClient';

export const metadata: Metadata = {
  title: 'Listening History | Oyagema - Your Spiritual Music Journey',
  description: 'View your complete listening history on Oyagema. Track your spiritual music journey, revisit your favorite meditation tracks, and discover patterns in your musical preferences.',
  keywords: [
    'listening history',
    'music history',
    'recently played',
    'spiritual music journey',
    'meditation tracks history',
    'music tracking',
    'played songs',
    'music timeline',
    'spiritual journey tracking',
    'music preferences'
  ],
  openGraph: {
    title: 'Listening History | Oyagema',
    description: 'View your complete listening history and track your spiritual music journey.',
    type: 'website',
    url: 'https://oyagema.com/history',
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
    title: 'Listening History | Oyagema',
    description: 'View your complete listening history and track your spiritual music journey.',
    images: ['/images/og-image.svg']
  },
  alternates: {
    canonical: 'https://oyagema.com/history'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}