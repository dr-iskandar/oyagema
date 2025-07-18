'use client';

import { FiAlertTriangle } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { useEffect } from 'react';

export default function DonationSuccessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Donation success page error:', error);
  }, [error]);

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-background-light rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden p-8 text-center">
          <FiAlertTriangle className="text-4xl text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Terjadi Kesalahan</h2>
          <p className="text-text-secondary mt-2 mb-4">
            Maaf, terjadi kesalahan saat memproses halaman donasi.
          </p>
          <button
            onClick={reset}
            className="py-2 px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-all duration-300"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </MainLayout>
  );
}