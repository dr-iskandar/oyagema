'use client';

import { useState, useEffect, createContext, useContext, ReactNode, createElement } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      
      console.log('Auth check - isLoggedIn:', isLoggedIn, 'userId:', userId);
      
      if (isLoggedIn && userId) {
        console.log('Setting user with ID:', userId);
        setUser({
          id: userId,
          name: userName || undefined,
          email: userEmail || undefined
        });
      } else {
        console.log('No user found in localStorage');
        setUser(null);
      }
      
      setIsLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }
      
      const data = await response.json();
      const userData = data.user;
      
      console.log('Login successful, user data:', userData);
      
      // Set user data in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userName', userData.name || '');
      localStorage.setItem('userEmail', userData.email || '');
      
      // Update state
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email
      });
      
      console.log('User state updated:', {
        id: userData.id,
        name: userData.name,
        email: userData.email
      });
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUser(null);
    router.push('/login');
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }
      
      // Registration successful, but don't log in automatically
      // User should log in with their credentials
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register
  };

  return createElement(AuthContext.Provider, { value: contextValue }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}