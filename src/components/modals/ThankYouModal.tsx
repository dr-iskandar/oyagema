'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/lib/hooks/useAuth';

type ThankYouModalProps = {
  isOpen: boolean;
  onClose: () => void;
  donationAmount?: string;
};

const ThankYouModal = ({ isOpen, onClose, donationAmount }: ThankYouModalProps) => {
  const { user } = useAuth();
  
  // Pastikan modal hanya muncul sekali dan dapat ditutup dengan benar
  const handleClose = () => {
    // Panggil fungsi onClose yang diberikan dari parent component
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          >
            <div className="bg-background-light rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-accent to-primary p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 rounded-full p-2">
                      <FiHeart className="text-white text-xl" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold">Terima Kasih!</h2>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="bg-success/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FiCheck className="text-success text-2xl sm:text-3xl" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Donasi Berhasil!</h3>
                  <p className="text-text-secondary text-sm sm:text-base">
                    Terima kasih atas donasi Anda sebesar {donationAmount}. Dukungan Anda sangat berarti bagi kami.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-text-secondary">
                      Donasi Anda akan membantu kami mengembangkan platform musik spiritual ini. Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleClose}
                    className="w-full py-2 sm:py-3 px-4 rounded-lg bg-gradient-to-r from-accent to-primary text-white font-medium hover:from-accent-dark hover:to-primary-dark transition-all duration-300 text-sm sm:text-base"
                  >
                    Lanjutkan Mendengarkan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThankYouModal;