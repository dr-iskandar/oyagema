'use client';

import { FiLoader } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';

export default function DonationSuccessLoading() {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-background-light rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden p-8 text-center">
          <FiLoader className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Memproses Donasi...</h2>
          <p className="text-text-secondary mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    </MainLayout>
  );
}