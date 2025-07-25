'use client';

import { useState, useEffect } from 'react';

type DailyRecommendation = {
  id: string;
  title: string;
  artist: string;
  description: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  category?: {
    id: string;
    title: string;
    slug: string;
  };
  date: string;
  isDaily: boolean;
};

const STORAGE_KEY = 'oyagema_daily_recommendation';
const DATE_KEY = 'oyagema_daily_date';

export const useDailyRecommendation = () => {
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getStoredRecommendation = (): DailyRecommendation | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const getStoredDate = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem(DATE_KEY);
  };

  const storeRecommendation = (data: DailyRecommendation) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(DATE_KEY, data.date);
    } catch (error) {
      console.error('Failed to store daily recommendation:', error);
    }
  };

  const fetchDailyRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/daily-recommendation');
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily recommendation');
      }

      const data: DailyRecommendation = await response.json();
      
      // Store the new recommendation
      storeRecommendation(data);
      setRecommendation(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching daily recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUpdateRecommendation = async () => {
    const today = getTodayString();
    const storedDate = getStoredDate();
    const storedRecommendation = getStoredRecommendation();

    // If we have a stored recommendation for today, use it
    if (storedDate === today && storedRecommendation) {
      setRecommendation(storedRecommendation);
      setLoading(false);
      return;
    }

    // Otherwise, fetch a new recommendation
    await fetchDailyRecommendation();
  };

  const refreshRecommendation = async () => {
    await fetchDailyRecommendation();
  };

  useEffect(() => {
    checkAndUpdateRecommendation();

    // Check daily recommendation when app comes back to focus
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAndUpdateRecommendation();
      }
    };

    const handleFocus = () => {
      checkAndUpdateRecommendation();
    };

    // Add event listeners for app focus/visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return {
    recommendation,
    loading,
    error,
    refreshRecommendation,
    isToday: recommendation?.date === getTodayString()
  };
};