import { useState, useEffect } from 'react';

type Track = {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    title: string;
    slug: string;
  };
};

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTracks() {
      try {
        setLoading(true);
        const response = await fetch('/api/tracks');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tracks');
        }
        
        const data = await response.json();
        setTracks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setError('Failed to load tracks. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, []);

  return { tracks, loading, error };
}

export function useTracksByCategory(categoryId: string) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTracksByCategory() {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/tracks?categoryId=${categoryId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tracks');
        }
        
        const data = await response.json();
        setTracks(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching tracks for category ${categoryId}:`, err);
        setError('Failed to load tracks. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchTracksByCategory();
  }, [categoryId]);

  return { tracks, loading, error };
}