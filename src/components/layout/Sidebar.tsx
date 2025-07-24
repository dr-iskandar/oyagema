'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiHeart, FiList, FiUser, FiPlus, FiSun, FiClock, FiX } from 'react-icons/fi';
import { IoMusicalNotes } from 'react-icons/io5';
import { MdOutlineAutoStories } from 'react-icons/md';
import DonationModal from '@/components/modals/DonationModal';
import { useAuth } from '@/lib/hooks/useAuth';

const navItems = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Search', href: '/search', icon: FiSearch },
  { name: 'Your Library', href: '/library', icon: FiList },
];

const userItems = [
  { name: 'Profile', href: '/profile', icon: FiUser },
  // Removed favorites link
  { name: 'History', href: '/history', icon: FiClock },
];

// Default icons for categories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('healing') || name.includes('mindfulness')) return FiSun;
  if (name.includes('motivasi') || name.includes('self-talk')) return FiUser;
  if (name.includes('narasi') || name.includes('spiritual')) return MdOutlineAutoStories;
  if (name.includes('musik') || name.includes('instrumental')) return IoMusicalNotes;
  if (name.includes('affirmation') || name.includes('loops')) return FiPlus;
  if (name.includes('cerita') || name.includes('penyadaran')) return MdOutlineAutoStories;
  return IoMusicalNotes; // Default icon
};

type Category = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverUrl: string;
};

// Removed playlists

type SidebarProps = {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
};

const Sidebar = ({ isMobile = false, isOpen = true, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Store previous pathname to detect actual navigation changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);
  
  // Close sidebar only when actually navigating to a different page on mobile
  useEffect(() => {
    // Skip the first render and only close when pathname actually changes
    if (prevPathname !== pathname && prevPathname !== null) {
      // Only close sidebar when navigating on mobile
      if (isMobile && onClose) {
        console.log('Pathname actually changed from', prevPathname, 'to', pathname, 'closing sidebar on mobile');
        onClose();
      }
    }
    
    // Update the previous pathname
    setPrevPathname(pathname);
  }, [pathname, isMobile, onClose, prevPathname]);
  
  // Handle click on sidebar item for mobile
  const handleItemClick = (e: React.MouseEvent) => {
    if (isMobile && onClose) {
      // Prevent event bubbling
      e.stopPropagation();
      onClose();
    }
  };

  console.log('Sidebar render:', { isMobile, isOpen });
  
  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* Overlay for mobile sidebar - removed to prevent conflicts */}
      {/* Sidebar for mobile and desktop */}
      {(isOpen || !isMobile) && (
        <motion.aside
          initial={{ x: isMobile ? -250 : 0 }}
          animate={{ x: isMobile ? (isOpen ? 0 : -250) : 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 40, 
            duration: 0.3 
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className={`h-screen bg-background-dark fixed left-0 top-0 z-30 flex flex-col py-6 overflow-hidden pointer-events-auto ${!isMobile ? (isExpanded ? 'w-[250px]' : 'w-[80px]') : 'w-[250px]'} ${isMobile ? 'shadow-xl' : ''}`}
        >
      <div className="px-4 mb-8 flex justify-between items-center">
        <motion.h1 
          animate={{ opacity: (isExpanded || isMobile) ? 1 : 0 }}
          className="text-2xl font-bold text-text-primary flex items-center"
        >
          <span className="text-accent mr-2 flex items-center">
            <img src="/icons/icon.svg" alt="Oyagema Logo" className="w-6 h-6" />
          </span> Oyagema
        </motion.h1>
        
        {/* Close button for mobile */}
        {isMobile && (
          <button 
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="p-2 rounded-full hover:bg-background-light/50 text-text-primary"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-2 mb-6">
          {navItems.map((item) => {
            // Hide 'Your Library' if user is not authenticated
            if (item.name === 'Your Library' && !isAuthenticated) {
              return null;
            }
            
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href} onClick={handleItemClick}>
                  <div
                    className={`flex items-center p-3 rounded-lg transition-colors ${isActive
                      ? 'bg-background-light text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-light/50'
                      }`}
                  >
                    <item.icon className="text-xl" />
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-3"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {isExpanded && isAuthenticated && (
          <>
            <div className="mb-4">
              <h3 className="text-text-muted text-xs uppercase font-bold tracking-wider px-4 mb-2">
                User
              </h3>
              <ul className="space-y-1">
                {userItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link href={item.href} onClick={handleItemClick}>
                        <div
                          className={`flex items-center p-2 rounded-lg transition-colors ${isActive
                            ? 'bg-background-light text-text-primary'
                            : 'text-text-secondary hover:text-text-primary hover:bg-background-light/50'
                            }`}
                        >
                          <item.icon className="text-lg" />
                          <span className="ml-3 text-sm">{item.name}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
        
        {isExpanded && (
          <>

            <div className="mb-4">
              <h3 className="text-text-muted text-xs uppercase font-bold tracking-wider px-4 mb-2">
                Kategori
              </h3>
              <ul className="space-y-1">
                {isLoadingCategories ? (
                  <li className="px-4 py-2">
                    <div className="animate-pulse flex items-center">
                      <div className="w-4 h-4 bg-background-light/30 rounded"></div>
                      <div className="ml-3 w-20 h-3 bg-background-light/30 rounded"></div>
                    </div>
                  </li>
                ) : (
                  categories.map((category) => {
                    const categoryHref = `/categories/${category.slug}`;
                    const isActive = pathname === categoryHref;
                    const IconComponent = getCategoryIcon(category.title);
                    return (
                      <li key={category.id}>
                        <Link href={categoryHref} onClick={handleItemClick}>
                          <div
                            className={`flex items-center p-2 rounded-lg transition-colors ${isActive
                              ? 'bg-background-light text-text-primary'
                              : 'text-text-secondary hover:text-text-primary hover:bg-background-light/50'
                              }`}
                          >
                            <IconComponent className="text-lg" />
                            <span className="ml-3 text-sm">{category.title}</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            {/* Playlists functionality removed */}
          </>
        )}
      </nav>

      {/* Donation Button for Desktop */}
      {!isMobile && isExpanded && (
        <div className="px-4 py-3">
          <button 
            onClick={() => setIsDonationModalOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-accent to-primary hover:from-accent-dark hover:to-primary-dark transition-all duration-300 shadow-lg"
          >
            <FiHeart className="text-white" size={16} />
            <span className="text-white text-sm font-medium">Support Oyagema</span>
          </button>
        </div>
      )}
      
      {/* Only show collapse button on desktop */}
      {!isMobile && (
        <div className="px-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 text-text-muted hover:text-text-primary transition-colors"
          >
            {isExpanded ? '« Collapse' : '»'}
          </button>
        </div>
      )}
      
      {/* Donation Button for Mobile */}
      {isMobile && (
        <div className="px-4 py-3">
          <button 
            onClick={() => setIsDonationModalOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-accent to-primary hover:from-accent-dark hover:to-primary-dark transition-all duration-300 shadow-lg"
          >
            <FiHeart className="text-white" size={18} />
            <span className="text-white font-medium">Support Oyagema</span>
          </button>
        </div>
      )}
      
      {/* Show user info on mobile */}
      {isMobile && (
        <div className="px-4 py-3 border-t border-background-light/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <FiUser className="text-white" />
            </div>
            <div>
              <p className="text-text-primary text-sm font-medium">User Account</p>
              <p className="text-text-muted text-xs">Settings</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
      )}
      
      {/* Donation Modal */}
      <DonationModal 
        isOpen={isDonationModalOpen} 
        onClose={() => setIsDonationModalOpen(false)} 
      />
    </div>
  );
};

export default Sidebar;