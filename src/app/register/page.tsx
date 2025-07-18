'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiArrowLeft } from 'react-icons/fi';
import PublicRoute from '@/components/auth/PublicRoute';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Register using auth hook
      await register(formData.name, formData.email, formData.password);
      
      // Redirect to login page after successful registration with query parameter
      router.push('/login?registered=true');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background-dark to-background px-4 py-10">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
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
              Create Account
            </h1>
            <p className="text-text-secondary">
              Join Oyagema for spiritual music streaming
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-100/20 border border-red-300/30 text-red-400 flex items-center"
            >
              <div className="bg-red-400/20 rounded-full p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <FiUser className="form-icon" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FiMail className="form-icon" />
                <span>Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FiLock className="form-icon" />
                <span>Password</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <FiLock className="form-icon" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center relative overflow-hidden group"
            >
              <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
              ) : (
                <span className="relative">Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-background-light"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-background-light/80 text-text-muted text-sm">OR</span>
              </div>
            </div>
            
            <Link
              href="/login"
              className="mt-4 inline-flex items-center text-text-secondary hover:text-primary transition-colors group"
            >
              <FiArrowLeft className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              Already have an account? <span className="ml-1 text-primary group-hover:underline">Sign in</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </PublicRoute>
  );
}