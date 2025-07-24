'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiHeart, FiCreditCard, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '@/lib/hooks/useAuth';

type DonationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DonationModal = ({ isOpen, onClose }: DonationModalProps) => {
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const paymentWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  const predefinedAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setAmount(value.toString());
  };

  // Removed handleCustomAmount function

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDonate = async () => {
    const donationAmount = parseInt(amount);
    
    // Validation
    if (!donationAmount || donationAmount < 1) {
      alert('Minimum donation amount is Rp 1');
      return;
    }
    
    // Check if user is logged in or guest has provided email
    if (!user && (!guestEmail || !guestName)) {
      alert('Please provide your name and email to make a donation');
      return;
    }

    // Email validation for guest users
    if (!user && guestEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      // Create donation payment
      const response = await fetch('/api/donation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donor_name: user ? (user.name || 'Anonymous') : guestName,
          donor_email: user ? user.email : guestEmail,
          amount: donationAmount,
          message: message.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create donation payment');
      }

      // Removed setPaymentData call
      
      console.log('Received payment data:', data.data);
      
      // Try different possible payment URL fields
      const paymentUrl = data.data.payment_url || 
                        data.data.redirectUrl || 
                        data.data.redirect_url || 
                        data.data.url;
      
      console.log('Payment URL to open:', paymentUrl);
      
      // Redirect to payment gateway
      if (paymentUrl) {
        // Store current path to localStorage to return after payment
        if (typeof window !== 'undefined') {
          // Get the current path
    const currentPath = window.location.pathname;
    // Store the current path in localStorage
    localStorage.setItem('previousPath', currentPath);
        }
        
        // Open payment window and store reference
        paymentWindowRef.current = window.open(paymentUrl, '_blank');
        
        // We don't need to check if payment window is closed anymore
        // The thank you modal will be shown when we receive PAYMENT_COMPLETE message
        // from the success page
        if (paymentWindowRef.current) {
          // Just set up interval to clean up references if window closes without completing payment
          checkIntervalRef.current = setInterval(() => {
            if (paymentWindowRef.current && paymentWindowRef.current.closed) {
              // Payment window closed, clean up interval
              clearInterval(checkIntervalRef.current as NodeJS.Timeout);
              checkIntervalRef.current = null;
            }
          }, 1000); // Check every second
        }
        
        onClose();
      } else {
        console.error('No payment URL found in response:', data.data);
        throw new Error('No payment URL received from payment gateway');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount('');
      setSelectedAmount(null);
      setMessage('');
      setGuestEmail('');
      setGuestName('');
      onClose();
    }
  };
  

  
  // Listen for payment completion message and handle cleanup
  useEffect(() => {
    // Function to handle messages from payment window
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from our payment window
      if (event.data && event.data.type === 'PAYMENT_COMPLETE') {
        console.log('Received payment completion message:', event.data);
        // Clear any existing interval
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        
        // Close the donation modal when payment is complete
        onClose();
      }
    };
    
    // Add event listener for messages
    window.addEventListener('message', handleMessage);
    
    // Cleanup function
    return () => {
      // Remove event listener
      window.removeEventListener('message', handleMessage);
      
      // Clear interval if it exists
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <>
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
            <div className="bg-background-light rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-accent to-primary p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiHeart className="text-xl sm:text-2xl" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">Support Oyagema</h2>
                      <p className="text-white/80 text-xs sm:text-sm">Help us keep the music playing</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    <FiX className="text-lg sm:text-xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Donor Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-text-primary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Your Information:</h3>
                  {user ? (
                    <div className="bg-background rounded-lg p-3 sm:p-4">
                      <p className="text-text-primary font-medium text-sm sm:text-base">{user.name || 'Anonymous'}</p>
                      <p className="text-text-secondary text-xs sm:text-sm">{user.email}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Your name"
                          disabled={isProcessing}
                          className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border-2 border-background-dark/20 focus:border-primary focus:outline-none bg-background text-text-primary placeholder-text-muted disabled:opacity-50 text-sm sm:text-base"
                        />
                      </div>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="Your email address"
                          disabled={isProcessing}
                          className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border-2 border-background-dark/20 focus:border-primary focus:outline-none bg-background text-text-primary placeholder-text-muted disabled:opacity-50 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Optional message (e.g., what inspired you to donate)"
                      disabled={isProcessing}
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-background-dark/20 focus:border-primary focus:outline-none bg-background text-text-primary placeholder-text-muted disabled:opacity-50 resize-none text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Predefined amounts */}
                <div>
                  <h3 className="text-text-primary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Choose an amount:</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {predefinedAmounts.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAmountSelect(value)}
                        disabled={isProcessing}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base ${
                          selectedAmount === value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-background-dark/20 hover:border-primary/50 text-text-primary'
                        }`}
                      >
                        {formatCurrency(value)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <div>
                  <h3 className="text-text-primary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Or enter custom amount:</h3>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted font-medium text-sm sm:text-base">Rp</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="Enter custom amount"
                      disabled={isProcessing}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border-2 border-background-dark/20 focus:border-primary focus:outline-none bg-background text-text-primary placeholder-text-muted disabled:opacity-50 text-sm sm:text-base"
                      min="1"
                    />
                  </div>
                  {amount && parseInt(amount) >= 1 && (
                    <p className="text-xs sm:text-sm text-text-secondary mt-2">
                      Donation amount: {formatCurrency(parseInt(amount))}
                    </p>
                  )}
                </div>

                {/* Payment info */}
                <div className="bg-background rounded-lg p-3 sm:p-4">
                  <div className="flex items-center space-x-2 text-text-secondary text-xs sm:text-sm">
                    <FiCreditCard />
                    <span>Secure payment powered by PVS</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Your donation helps us maintain and improve Oyagema music platform
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border-2 border-background-dark/20 text-text-primary hover:bg-background-dark/10 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDonate}
                    disabled={!amount || parseInt(amount) < 1 || (!user && (!guestName || !guestEmail)) || isProcessing}
                    className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg bg-gradient-to-r from-accent to-primary text-white font-medium hover:from-accent-dark hover:to-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FiHeart />
                        <span>Donate Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
};

export default DonationModal;