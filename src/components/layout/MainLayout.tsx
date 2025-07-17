'use client';

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MusicPlayer from '../player/MusicPlayer';
import { FiMenu } from 'react-icons/fi';
import AuthGuard from '../auth/AuthGuard';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import ThankYouModal from '../modals/ThankYouModal';


type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

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
      
      // Cleanup
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  const toggleMobileMenu = (e: React.MouseEvent) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Toggle mobile menu:', !isMobileMenuOpen); // Debug log
    setIsMobileMenuOpen(prevState => {
      console.log('Setting mobile menu to:', !prevState);
      return !prevState;
    });
  };

  return (
    <AuthGuard>
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
      
      {/* Navbar with user profile */}
      <Navbar />
      
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
      
      {/* Debug info - hidden in production */}
      {process.env.NODE_ENV === 'development' && false && (
        <div className="fixed bottom-0 left-0 bg-black/80 text-white p-2 text-xs z-50">
          isMobile: {isMobile ? 'true' : 'false'}, 
          isMobileMenuOpen: {isMobileMenuOpen ? 'true' : 'false'}
        </div>
      )}
      
      {/* Sidebar - hidden on mobile by default, shown when menu is open */}
      <Sidebar isMobile={isMobile} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Main content - full width on mobile, with margin on desktop */}
      <div className={`flex-1 transition-all duration-300 ${!isMobile ? 'md:ml-[250px]' : ''} pb-24 ml-0`}>
        <div className="container mx-auto px-4 md:px-6 py-6">
          {children}
        </div>
      </div>
      
      {/* Music Player - always render it but it will conditionally show content */}
      <MusicPlayer />
      </div>
    </AuthGuard>
  );
};

export default MainLayout;