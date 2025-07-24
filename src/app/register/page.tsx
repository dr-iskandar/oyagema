import { Metadata } from 'next';
import RegisterPageClient from './RegisterPageClient';

export const metadata: Metadata = {
  title: 'Create Account - Oyagema Spiritual Music Platform',
  description: 'Join Oyagema to access thousands of spiritual music tracks, meditation sounds, and healing frequencies. Create your free account and start your mindfulness journey today.',
  keywords: [
    'register',
    'sign up',
    'create account',
    'spiritual music platform',
    'meditation app signup',
    'mindfulness registration',
    'healing music access',
    'free account',
    'spiritual journey',
    'music streaming signup',
    'oyagema register'
  ],
  openGraph: {
    title: 'Create Account - Oyagema Spiritual Music Platform',
    description: 'Join Oyagema to access thousands of spiritual music tracks and start your mindfulness journey.',
    type: 'website',
    url: 'https://oyagema.com/register',
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
    title: 'Create Account - Oyagema Spiritual Music Platform',
    description: 'Join Oyagema to access thousands of spiritual music tracks and start your mindfulness journey.',
    images: ['/images/og-image.svg']
  },
  alternates: {
    canonical: 'https://oyagema.com/register'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}