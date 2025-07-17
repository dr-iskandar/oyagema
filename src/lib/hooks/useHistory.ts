import { useState, useEffect } from 'react';

type HistoryItem = {
  id: string;
  userId: string;
  trackId: string;
  playedAt: string;
  track: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    audioUrl: string;
    duration: string;
  };
};

export function useHistory(userId: string) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/history?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        
        const data = await response.json();
        setHistory(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [userId]);

  return { history, loading, error };
}

export function useAddToHistory(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToHistory = async (trackId: string) => {
    // Don't attempt to add to history if userId is empty or just whitespace
    if (!userId || userId.trim() === '' || !trackId) {
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, trackId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to history');
      }
      
      return true;
    } catch (err: any) {
      console.error('Error adding to history:', err);
      setError(err.message || 'Failed to add to history. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addToHistory, loading, error };
}