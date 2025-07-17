'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiHeart, FiPlay, FiClock } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { useToggleFavorite } from '@/lib/hooks/useFavorites';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';
import { useAuth } from '@/lib/hooks/useAuth';

const FavoriteItem = ({ track, index, onPlay, onRemove }: { 
  track: any; 
  index: number; 
  onPlay: () => void;
  onRemove: () => void;
}) => {
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
          src={track?.coverUrl || '/images/track-cover-1.svg'} 
          alt={track?.title || 'Track'} 
          fill 
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-text-primary font-medium">{track?.title || 'Unknown Track'}</h4>
        <p className="text-sm text-text-secondary">{track?.artist || 'Unknown Artist'}</p>
      </div>
      <button 
        className="p-2 text-accent hover:text-red-500 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <FiHeart />
      </button>
      <div className="text-right text-text-muted text-sm w-16">
        {track?.duration || '3:00'}
      </div>
    </div>
  );
};

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, loading, error } = useFavorites(user?.id || '');
  const { playTrack } = useAudioPlayer();
  const { toggleFavorite, loading: toggleLoading } = useToggleFavorite(user?.id || '');

  const handlePlayTrack = (track: any) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl || '/audio/sample.mp3', // Fallback for mock data
      duration: track.duration || '3:00', // Fallback for mock data
    });
  };

  const handleRemoveFavorite = (trackId: string) => {
    toggleFavorite(trackId, true);
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
  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Oops! Something went wrong</h2>
          <p className="text-text-secondary mb-6">{error}</p>
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
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-text-primary">Your Favorites</h1>
            <div className="flex items-center space-x-2 text-text-secondary">
              <FiHeart className="text-accent" />
              <span>{favorites?.length || 0} tracks</span>
            </div>
          </div>

          {favorites && favorites.length > 0 ? (
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
                {favorites.map((favorite: any, index: number) => (
                  <FavoriteItem 
                    key={favorite.id} 
                    track={favorite.track} 
                    index={index} 
                    onPlay={() => handlePlayTrack(favorite.track)}
                    onRemove={() => handleRemoveFavorite(favorite.track?.id)}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-background-light/10 rounded-xl">
              <FiHeart className="mx-auto text-4xl text-text-muted mb-4" />
              <h3 className="text-xl text-text-primary mb-2">No favorites yet</h3>
              <p className="text-text-secondary">Start adding tracks to your favorites by clicking the heart icon.</p>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}