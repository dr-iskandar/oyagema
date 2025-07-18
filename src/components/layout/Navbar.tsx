'use client';

import { useState } from 'react';
import Link from 'next/link';

// Removed useRouter import
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLogOut, FiHeart } from 'react-icons/fi';
import { useAuth } from '@/lib/hooks/useAuth';
import DonationModal from '@/components/modals/DonationModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  // Removed router variable

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="fixed top-0 right-0 z-[60] p-4">
      <div className="flex items-center space-x-3">
        {/* Donation Button */}
        <button 
          onClick={() => setIsDonationModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent to-primary hover:from-accent-dark hover:to-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Support Oyagema"
        >
          <FiHeart className="text-white" size={16} />
          <span className="text-white text-sm font-medium hidden sm:inline">Donate</span>
        </button>
        
        {/* User Profile Button */}
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center space-x-2 px-3 py-2 rounded-full bg-background-light hover:bg-background-light/80 transition-colors"
          >
            <FiUser className="text-text-primary" size={18} />
            {user?.name && (
              <span className="text-text-primary text-sm hidden md:inline">{user.name}</span>
            )}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background-light ring-1 ring-black ring-opacity-5 overflow-hidden"
              >
              <div className="py-2">
                {user?.name && (
                  <div className="px-4 py-2 text-sm font-medium text-text-primary border-b border-background-dark/10">
                    {user.name}
                    {user?.email && (
                      <div className="text-xs text-text-secondary mt-1">{user.email}</div>
                    )}
                  </div>
                )}
                <Link 
                  href="/profile" 
                  className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-background-dark/10"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiUser className="mr-2" />
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background-dark/10"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
         </div>
       </div>
       
       {/* Donation Modal */}
       <DonationModal 
         isOpen={isDonationModalOpen} 
         onClose={() => setIsDonationModalOpen(false)} 
       />
     </nav>
   );
 };

export default Navbar;