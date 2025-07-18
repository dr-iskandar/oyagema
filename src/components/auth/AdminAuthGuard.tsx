'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';

type AdminAuthGuardProps = {
  children: ReactNode;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Check if admin is logged in from localStorage
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        const adminId = localStorage.getItem('adminId');

        if (!isAdminLoggedIn || !adminId) {
          console.log('Admin not logged in, redirecting to admin login');
          router.push('/admin/login');
          return;
        }

        // Verify admin status with server
        const response = await fetch('/api/auth/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminId }),
        });

        if (!response.ok) {
          console.log('Admin verification failed, clearing session');
          // Clear admin session
          localStorage.removeItem('isAdminLoggedIn');
          localStorage.removeItem('adminId');
          localStorage.removeItem('adminName');
          localStorage.removeItem('adminEmail');
          router.push('/admin/login');
          return;
        }

        const data = await response.json();
        
        if (data.user.role !== 'ADMIN') {
          console.log('User is not an admin, redirecting');
          localStorage.removeItem('isAdminLoggedIn');
          localStorage.removeItem('adminId');
          localStorage.removeItem('adminName');
          localStorage.removeItem('adminEmail');
          router.push('/admin/login');
          return;
        }

        // Admin verification successful
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Admin auth check error:', error);
        // Clear admin session on error
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminEmail');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-background-dark to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default AdminAuthGuard;

// Hook to get admin user data
export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    const adminName = localStorage.getItem('adminName');
    const adminEmail = localStorage.getItem('adminEmail');
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

    if (isAdminLoggedIn && adminId) {
      setAdminUser({
        id: adminId,
        name: adminName || '',
        email: adminEmail || '',
        role: 'ADMIN',
      });
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    setAdminUser(null);
    window.location.href = '/admin/login';
  };

  return {
    adminUser,
    isLoading,
    isAuthenticated: !!adminUser,
    logout,
  };
};