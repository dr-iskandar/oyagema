'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiPlay, FiHeart, FiClock } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { usePlaylist } from '@/lib/hooks/usePlaylists';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';
import { useToggleFavorite, useIsFavorite } from '@/lib/hooks/useFavorites';
import { useAuth } from '@/lib/hooks/useAuth';

const TrackItem = ({ track, index, onPlay, userId }: { track: any; index: number; onPlay: () => void; userId: string }) => {
  const { isFavorite, loading: favoriteLoading } = useIsFavorite(userId, track.id);
  const { toggleFavorite, loading: toggleLoading } = useToggleFavorite(userId);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track.id, isFavorite);
  };

  return (
    <div 
      className="flex items-center p-3 rounded-lg hover:bg-background-light/50 transition-colors group cursor-pointer"
      onClick={onPlay}
    >
      <div className="w-8 text-center text-text-muted group-hover:hidden">{index + 1}</div>
      <div className="w-8 text-center text-text-primary hidden group-hover:block">
        <FiPlay />
      </div>
      <div className="relative h-10 w-10 rounded-md overflow-hidden mx-4">
        <Image 
          src={track.coverUrl} 
          alt={track.title} 
          fill 
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-text-primary font-medium">{track.title}</h4>
        <p className="text-sm text-text-secondary">{track.artist}</p>
      </div>
      <button 
        className={`p-2 ${isFavorite ? 'text-accent' : 'text-text-muted hover:text-text-primary'} ${(favoriteLoading || toggleLoading) ? 'opacity-50' : ''}`}
        onClick={handleToggleFavorite}
        disabled={favoriteLoading || toggleLoading}
      >
        <FiHeart />
      </button>
      <div className="text-right text-text-muted text-sm w-16">
        {track.duration}
      </div>
    </div>
  );
};

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useAuth();
  const { playlist, loading, error } = usePlaylist(id);
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioPlayer();

  const handlePlayAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0]);
    }
  };

  const handleTrackPlay = (track: any) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl || '/audio/sample.mp3', // Fallback for mock data
      duration: track.duration || '3:00', // Fallback for mock data
    });
  };

  // Show loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error || !playlist) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Oops! Something went wrong</h2>
          <p className="text-text-secondary mb-6">
            {error || 'Playlist not found'}
          </p>
          <button 
            className="btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div 
          className="flex items-start space-x-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-64 w-64 rounded-xl overflow-hidden shadow-lg">
            <Image 
              src={playlist.coverUrl || '/images/category-cover-1.svg'} 
              alt={playlist.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="flex-1 pt-6">
            <p className="text-text-secondary uppercase text-sm font-medium mb-2">Playlist</p>
            <h1 className="text-5xl font-bold text-text-primary mb-4">{playlist.title}</h1>
            <p className="text-text-secondary mb-6">{playlist.description}</p>
            <div className="flex items-center text-text-secondary text-sm space-x-4">
              <p>{playlist.tracks?.length || 0} tracks</p>
              {playlist.createdAt && (
                <p>Created on {new Date(playlist.createdAt).toLocaleDateString()}</p>
              )}
            </div>
            <div className="mt-8 flex space-x-4">
              <motion.button 
                className="btn-primary flex items-center space-x-2 px-8"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayAll}
                disabled={!playlist.tracks || playlist.tracks.length === 0}
              >
                <FiPlay />
                <span>Play All</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {playlist.tracks && playlist.tracks.length > 0 ? (
          <motion.div 
            className="bg-background-light/10 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center text-text-muted text-sm border-b border-background-light pb-2 px-3">
              <div className="w-8">#</div>
              <div className="w-10"></div>
              <div className="flex-1 ml-4">TITLE</div>
              <div className="w-8"></div>
              <div className="w-16 text-right"><FiClock /></div>
            </div>

            <div className="mt-2 space-y-1">
              {playlist.tracks.map((track: any, index: number) => (
                <TrackItem 
                  key={track.id} 
                  track={track} 
                  index={index} 
                  userId={user?.id || ''}
                  onPlay={() => handleTrackPlay(track)}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-text-secondary">No tracks in this playlist yet.</h3>
          </div>
        )}
      </div>
    </MainLayout>
  );
}