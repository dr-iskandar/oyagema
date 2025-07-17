'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiPlay, FiClock, FiMusic, FiUser, FiHeart, FiShare2, FiPause } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';
import { useAuth } from '@/lib/hooks/useAuth';

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  addedAt: string;
};

type User = {
  id: string;
  name: string;
  image: string | null;
};

type Playlist = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  userId: string;
  user: User;
  tracks: Track[];
  createdAt: string;
};

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioPlayer();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(`/api/playlists/${id}`);
        if (!res.ok) throw new Error('Failed to fetch playlist');
        const data = await res.json();
        setPlaylist(data);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError('Failed to load playlist data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = (track: Track) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl,
      duration: track.duration.toString()
    });
  };

  const handlePlayAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      const firstTrack = playlist.tracks[0];
      playTrack({
        id: firstTrack.id,
        title: firstTrack.title,
        artist: firstTrack.artist,
        coverUrl: firstTrack.coverUrl,
        audioUrl: firstTrack.audioUrl,
        duration: firstTrack.duration.toString()
      });
    }
  };

  const handleLike = () => {
    // In a real app, this would add the playlist to favorites
    console.log('Liked playlist');
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    console.log('Sharing playlist');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !playlist) {
    return (
      <MainLayout>
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg">
          {error || 'Playlist not found'}
        </div>
      </MainLayout>
    );
  }

  const totalDuration = playlist.tracks.reduce((total, track) => total + track.duration, 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const formattedTotalDuration = hours > 0 
    ? `${hours} hr ${minutes} min` 
    : `${minutes} min`;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Playlist Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 p-6">
            <div className="h-48 w-48 md:h-64 md:w-64 relative rounded-xl overflow-hidden shadow-xl">
              <Image
                src={playlist.coverUrl || '/images/playlist-cover-1.svg'}
                alt={playlist.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-text-primary">{playlist.title}</h1>
              {playlist.description && (
                <p className="text-text-secondary mt-2 max-w-2xl">{playlist.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-text-secondary">
                <div className="flex items-center">
                  <FiUser className="mr-1" />
                  <span>{playlist.user.name}</span>
                </div>
                <span>•</span>
                <span>{playlist.tracks.length} tracks</span>
                <span>•</span>
                <span>{formattedTotalDuration}</span>
                <span>•</span>
                <span>Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <button 
                  onClick={handlePlayAll}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiPlay size={18} />
                  <span>Play All</span>
                </button>
                
                <button 
                  onClick={handleLike}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiHeart size={18} />
                  <span>Like</span>
                </button>
                
                <button 
                  onClick={handleShare}
                  className="btn-outline flex items-center gap-2"
                >
                  <FiShare2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tracks List */}
        <div>
          {playlist.tracks.length === 0 ? (
            <div className="bg-background-light/10 rounded-xl p-8 text-center">
              <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">No tracks in this playlist</p>
            </div>
          ) : (
            <div className="bg-background-light/10 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-background-light/20">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      <FiClock className="inline" />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-light/20">
                  {playlist.tracks.map((track, index) => (
                    <tr key={track.id} className="hover:bg-background-light/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3 relative rounded-md overflow-hidden">
                            <Image
                              src={track.coverUrl || '/images/track-cover-1.svg'}
                              alt={track.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-sm font-medium text-text-primary">{track.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{track.artist}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(track.addedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDuration(track.duration)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handlePlayTrack(track)}
                          className="text-primary hover:text-primary-dark transition-colors p-2 rounded-full hover:bg-primary/10"
                          aria-label={isPlaying && currentTrack?.id === track.id ? "Pause track" : "Play track"}
                        >
                          {isPlaying && currentTrack?.id === track.id ? <FiPause size={18} /> : <FiPlay size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* About the Creator */}
        <div className="bg-background-light/10 rounded-xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">About the Creator</h2>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 relative rounded-full overflow-hidden">
              <Image
                src={playlist.user.image || '/icons/icon.svg'}
                alt={playlist.user.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-text-primary">{playlist.user.name}</h3>
              <button 
                onClick={() => router.push(`/profile/${playlist.user.id}`)}
                className="text-primary hover:underline text-sm"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
        
        {/* Similar Playlists */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Similar Playlists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* This would be populated with similar playlists in a real app */}
            <div className="bg-background-light/10 rounded-xl p-8 text-center">
              <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">Similar playlists will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}