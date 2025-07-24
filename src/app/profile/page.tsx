import { Metadata } from 'next';
import ProfilePageClient from './ProfilePageClient';

export const metadata: Metadata = {
  title: 'Profile Settings | Oyagema - Manage Your Spiritual Music Account',
  description: 'Manage your Oyagema account settings, personal information, and preferences for your spiritual music journey. Update your profile and customize your experience.',
  keywords: [
    'profile settings',
    'account management',
    'user profile',
    'spiritual music account',
    'personal settings',
    'music preferences',
    'account information',
    'user dashboard',
    'profile management',
    'spiritual journey settings'
  ],
  openGraph: {
    title: 'Profile Settings | Oyagema',
    description: 'Manage your account settings and personal information for your spiritual music journey.',
    type: 'website',
    url: 'https://oyagema.com/profile',
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
    title: 'Profile Settings | Oyagema',
    description: 'Manage your account settings and personal information for your spiritual music journey.',
    images: ['/images/og-image.svg']
  },
  alternates: {
    canonical: 'https://oyagema.com/profile'
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}