'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiHome, FiMusic, FiUsers, FiGrid, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAdminAuth } from '@/components/auth/AdminAuthGuard';

type AdminLayoutProps = {
  children: ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { logout, adminUser } = useAdminAuth();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Tracks', href: '/admin/tracks', icon: FiMusic },
    { name: 'Categories', href: '/admin/categories', icon: FiGrid },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    // Removed playlists admin link
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background-dark to-background">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-all duration-300"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
          duration: 0.3
        }}
        className={`h-screen bg-background-dark fixed left-0 top-0 z-30 flex flex-col py-6 overflow-hidden w-[250px] shadow-xl`}
      >
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-bold text-text-primary flex items-center mb-2">
            <span className="text-accent mr-2">🎵</span> Admin Panel
          </h1>
          {adminUser && (
            <p className="text-sm text-text-secondary">
              Welcome, {adminUser.name}
            </p>
          )}
          <div className="md:hidden flex justify-end">
            <button
              className="text-text-secondary hover:text-text-primary transition-colors"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-light/10 hover:text-text-primary'}`}
              >
                <item.icon className="mr-3" size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-auto">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-text-secondary hover:bg-background-light/10 hover:text-text-primary rounded-lg transition-all duration-200"
          >
            <FiLogOut className="mr-3" size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 md:ml-[250px] ml-0 pt-16 md:pt-20 px-6 pb-6`}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;