'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail } from 'react-icons/fi';
import PublicRoute from '@/components/auth/PublicRoute';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LoginPageClient() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Check if user was redirected from registration
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('registered') === 'true') {
      setSuccess('Registration successful! Please log in with your new account.');
    }
  }, []);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Login using auth hook
      await login(formData.email, formData.password);
      // Router push is handled in the login function
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background-dark to-background px-4 py-10">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-background-light/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-background-light/50 z-10"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <FiUser className="text-white text-2xl" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-text-secondary">
              Sign in to continue your spiritual journey
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 text-green-500 border border-green-500/20 p-4 rounded-lg mb-6 text-center"
            >
              {success}
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 w-full px-4 py-3 bg-background-light/20 border border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10 w-full px-4 py-3 bg-background-light/20 border border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-secondary"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 px-4 rounded-lg font-medium hover:from-primary/90 hover:to-accent/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link 
                href="/register" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PublicRoute>
  );
}