'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiPlay } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import TrackGrid from '@/components/sections/TrackGrid';
import { useCategoryBySlug } from '@/lib/hooks/useCategories';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { user } = useAuth();
  const { category, loading, error } = useCategoryBySlug(slug);
  const { playTrack } = useAudioPlayer();

  const handleTrackClick = (track: any) => {
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
  if (error || !category) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Oops! Something went wrong</h2>
          <p className="text-text-secondary mb-6">
            {error || 'Category not found'}
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
        {/* Category Header */}
        <motion.div 
          className="relative w-full h-64 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image 
            src={category.coverUrl} 
            alt={category.title} 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent">
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-bold text-text-primary mb-2">{category.title}</h2>
                <p className="text-xl text-text-secondary mb-4">{category.description}</p>
                <p className="text-text-secondary mb-6">{category.tracks?.length || 0} tracks</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Category Tracks */}
        {category.tracks && category.tracks.length > 0 ? (
          <TrackGrid 
            title="Tracks"
            tracks={category.tracks}
            onTrackClick={handleTrackClick}
            userId={user?.id || ''}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl text-text-secondary">No tracks available in this category yet.</h3>
          </div>
        )}
      </div>
    </MainLayout>
  );
}