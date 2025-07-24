import { Metadata } from 'next';
import DonationSuccessPageClient from './DonationSuccessPageClient';

export const metadata: Metadata = {
  title: 'Donation Successful | Oyagema - Thank You for Your Support',
  description: 'Thank you for your generous donation to Oyagema. Your support helps us continue providing spiritual music and meditation content to our community.',
  keywords: [
    'donation success',
    'thank you',
    'spiritual music support',
    'donation confirmation',
    'payment successful',
    'community support',
    'spiritual platform donation',
    'meditation music funding',
    'charitable contribution',
    'spiritual journey support'
  ],
  openGraph: {
    title: 'Donation Successful | Oyagema',
    description: 'Thank you for your generous donation to support our spiritual music platform.',
    type: 'website',
    url: 'https://oyagema.com/donation/success',
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
    title: 'Donation Successful | Oyagema',
    description: 'Thank you for your generous donation to support our spiritual music platform.',
    images: ['/images/og-image.svg']
  },
  alternates: {
    canonical: 'https://oyagema.com/donation/success'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function DonationSuccessPage() {
  return <DonationSuccessPageClient />;
}