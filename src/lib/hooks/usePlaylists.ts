import { useState, useEffect } from 'react';

type Playlist = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string;
  userId: string;
  userName: string;
  userImage: string | null;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
};

type PlaylistWithTracks = Playlist & {
  tracks: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    audioUrl: string;
    duration: string;
    addedAt: string;
  }[];
};

export function usePlaylists(userId?: string) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        setLoading(true);
        const url = userId ? `/api/playlists?userId=${userId}` : '/api/playlists';
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }
        
        const data = await response.json();
        setPlaylists(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError('Failed to load playlists. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylists();
  }, [userId]);

  return { playlists, loading, error };
}

export function usePlaylist(id: string) {
  const [playlist, setPlaylist] = useState<PlaylistWithTracks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaylist() {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/playlists/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Playlist not found');
          }
          throw new Error('Failed to fetch playlist');
        }
        
        const data = await response.json();
        setPlaylist(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching playlist ${id}:`, err);
        setError('Failed to load playlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylist();
  }, [id]);

  return { playlist, loading, error };
}

export function useCreatePlaylist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createPlaylist = async (playlistData: {
    title: string;
    description?: string;
    coverUrl: string;
    userId: string;
    trackIds?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playlistData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }
      
      const data = await response.json();
      setSuccess(true);
      return data;
    } catch (err: any) {
      console.error('Error creating playlist:', err);
      setError(err.message || 'Failed to create playlist. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPlaylist, loading, error, success };
}

export function useUpdatePlaylist(id: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updatePlaylist = async (playlistData: {
    title?: string;
    description?: string;
    coverUrl?: string;
    trackIds?: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playlistData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update playlist');
      }
      
      const data = await response.json();
      setSuccess(true);
      return data;
    } catch (err: any) {
      console.error(`Error updating playlist ${id}:`, err);
      setError(err.message || 'Failed to update playlist. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updatePlaylist, loading, error, success };
}

export function useDeletePlaylist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deletePlaylist = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete playlist');
      }
      
      setSuccess(true);
      return true;
    } catch (err: any) {
      console.error(`Error deleting playlist ${id}:`, err);
      setError(err.message || 'Failed to delete playlist. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deletePlaylist, loading, error, success };
}