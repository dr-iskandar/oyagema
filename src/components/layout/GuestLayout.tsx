'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import GuestNavbar from './GuestNavbar';
import MusicPlayer from '../player/MusicPlayer';
import WelcomeModal from '../modals/WelcomeModal';
import { FiMenu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

type GuestLayoutProps = {
  children: ReactNode;
};

const GuestLayout = ({ children }: GuestLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if we're on client-side before using window
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Initial check
      checkIfMobile();
      
      // Add event listener for window resize
      window.addEventListener('resize', checkIfMobile);
      
      // Check if welcome modal should be shown (only once)
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
      }
      
      // Cleanup
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  const toggleMobileMenu = (e: React.MouseEvent) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    setIsMobileMenuOpen(prevState => !prevState);
  };

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background-dark to-background">
      {/* Mobile menu button - only visible when sidebar is closed */}
      {(!isMobileMenuOpen || !isMobile) && (
        <button 
          className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all duration-300"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <FiMenu size={24} />
        </button>
      )}
      
      {/* Guest Navbar */}
      <GuestNavbar />
      
      {/* Backdrop overlay for mobile - only visible when mobile menu is open */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 40, 
              duration: 0.2 
            }}
            className="fixed inset-0 bg-black z-20 backdrop-blur-sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setIsMobileMenuOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar - hidden on mobile by default, shown when menu is open */}
      <Sidebar isMobile={isMobile} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Main content - full width on mobile, with margin on desktop */}
      <div className={`flex-1 transition-all duration-300 ${!isMobile ? 'md:ml-[250px]' : ''} pb-24 ml-0`}>
        <div className="container mx-auto px-4 md:px-6 pt-16 md:pt-20 pb-6">
          {children}
        </div>
      </div>
      
      {/* Music Player - always render it but it will conditionally show content */}
      <MusicPlayer />
      
      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
      />
    </div>
  );
};

export default GuestLayout;