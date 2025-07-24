import { Metadata } from 'next';
import LoginPageClient from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Sign In - Oyagema Spiritual Music Platform',
  description: 'Sign in to your Oyagema account to access your spiritual music library, playlists, and personalized meditation content. Continue your mindfulness journey.',
  keywords: [
    'login',
    'sign in',
    'spiritual music account',
    'meditation app login',
    'mindfulness platform',
    'healing music access',
    'user account',
    'spiritual journey',
    'music streaming login',
    'oyagema login'
  ],
  openGraph: {
    title: 'Sign In - Oyagema Spiritual Music Platform',
    description: 'Sign in to access your spiritual music library and continue your mindfulness journey on Oyagema.',
    type: 'website',
    url: 'https://oyagema.com/login',
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
    title: 'Sign In - Oyagema Spiritual Music Platform',
    description: 'Sign in to access your spiritual music library and continue your mindfulness journey.',
    images: ['/images/og-image.svg']
  },
  alternates: {
    canonical: 'https://oyagema.com/login'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function LoginPage() {

  return <LoginPageClient />;
}