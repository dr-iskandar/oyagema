'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { FiCheck, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Loading component for Suspense fallback
function DonationSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-background-light rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden p-8 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Memproses Donasi...</h2>
        <p className="text-text-secondary mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  const searchParams = useSearchParams();
  const [donationAmount, setDonationAmount] = useState('');

  useEffect(() => {
    // Get donation details from URL parameters
    const amount = searchParams.get('amount');
    if (amount) {
      // Format the amount as currency
      const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(parseInt(amount));
      setDonationAmount(formattedAmount);
    }
    
    // This is the success page, so we should notify the opener window
    // We'll use window.opener to communicate with the opener window
    if (typeof window !== 'undefined' && window.opener) {
      // Signal to the opener window that payment is complete
      try {
        // Send message with donation amount to opener window
        window.opener.postMessage({ 
          type: 'PAYMENT_COMPLETE', 
          success: true,
          amount: donationAmount || amount
        }, '*');
      } catch (error) {
        console.error('Error communicating with opener window:', error);
      }
    }
  }, [searchParams, donationAmount]);

  const handleCloseTab = () => {
    // Close this tab
    if (typeof window !== 'undefined') {
      window.close();
      
      // If window.close() doesn't work (which can happen in some browsers),
      // we'll try to communicate with the opener window again
      if (window.opener) {
        window.opener.focus();
      }
    }
  };

  return (
    <MainLayout>
      <Suspense fallback={<DonationSuccessLoading />}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-background-light rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
          >
          {/* Header */}
          <div className="bg-gradient-to-r from-accent to-primary p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <FiHeart className="text-white text-xl" />
              </div>
              <h2 className="text-xl font-bold">Terima Kasih!</h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-success text-3xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Donasi Berhasil!</h3>
              <p className="text-text-secondary">
                Terima kasih atas donasi Anda sebesar {donationAmount}. Dukungan Anda sangat berarti bagi kami.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-text-secondary">
                  Donasi Anda akan membantu kami mengembangkan platform musik spiritual ini. Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.
                </p>
              </div>
              
              <button
                onClick={handleCloseTab}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-accent to-primary text-white font-medium hover:from-accent-dark hover:to-primary-dark transition-all duration-300"
              >
                Kembali Mendengarkan
              </button>
            </div>
          </div>
          </motion.div>
        </div>
      </Suspense>
    </MainLayout>
  );
}