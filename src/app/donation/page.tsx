'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

export default function DonationPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page if someone tries to access /donation directly
    router.push('/');
  }, [router]);

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Redirecting...</p>
      </div>
    </MainLayout>
  );
}