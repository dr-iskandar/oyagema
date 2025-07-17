import { useState, useEffect } from 'react';

type Favorite = {
  id: string;
  userId: string;
  trackId: string;
  createdAt: string;
  track: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    audioUrl: string;
    duration: string;
  };
};

export function useFavorites(userId: string) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/favorites?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }
        
        const data = await response.json();
        setFavorites(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [userId]);

  return { favorites, loading, error };
}

export function useIsFavorite(userId: string, trackId: string) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkIsFavorite() {
      if (!userId || !trackId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/favorites/${trackId}?userId=${userId}`);
        
        if (!response.ok && response.status !== 404) {
          throw new Error('Failed to check favorite status');
        }
        
        setIsFavorite(response.status === 200);
        setError(null);
      } catch (err) {
        console.error('Error checking favorite status:', err);
        setError('Failed to check favorite status. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    checkIsFavorite();
  }, [userId, trackId]);

  return { isFavorite, loading, error };
}

export function useToggleFavorite(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFavorite = async (trackId: string) => {
    if (!userId || !trackId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, trackId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add favorite');
      }
      
      return true;
    } catch (err: any) {
      console.error('Error adding favorite:', err);
      setError(err.message || 'Failed to add favorite. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (trackId: string) => {
    if (!userId || !trackId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/favorites/${trackId}?userId=${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove favorite');
      }
      
      return true;
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      setError(err.message || 'Failed to remove favorite. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (trackId: string, currentStatus: boolean) => {
    return currentStatus ? removeFavorite(trackId) : addFavorite(trackId);
  };

  return { addFavorite, removeFavorite, toggleFavorite, loading, error };
}