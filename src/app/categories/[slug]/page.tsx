'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import { FiPlay, FiClock, FiMusic } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  categoryId: string;
};

type Category = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  coverUrl: string;
  tracks: Track[];
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { playTrack } = useAudioPlayer();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch category');
        const data = await res.json();
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  const formatDuration = (duration: string | null | undefined) => {
    if (!duration) return '0:00';
    
    // If duration is already in MM:SS format, return as is
    if (duration.includes(':')) {
      return duration;
    }
    
    // If duration is in seconds as string, convert to MM:SS
    const seconds = parseInt(duration, 10);
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
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
      duration: track.duration
    });
  };

  // Removed playlist functionality

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !category) {
    return (
      <MainLayout>
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg">
          {error || 'Category not found'}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Category Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 p-4 md:p-6">
            <div className="h-32 w-32 sm:h-40 sm:w-40 md:h-64 md:w-64 relative rounded-xl overflow-hidden shadow-xl flex-shrink-0">
              <Image
                src={category.coverUrl || '/images/category-cover-1.svg'}
                alt={category.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary">{category.title}</h1>
              {category.description && (
                <p className="text-text-secondary mt-2 max-w-2xl text-sm sm:text-base">{category.description}</p>
              )}
              <p className="text-text-secondary mt-2 text-sm sm:text-base">{category.tracks.length} tracks</p>
            </div>
          </div>
        </div>
        
        {/* Tracks List */}
        <div className="px-4 md:px-0">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">Tracks</h2>
          
          {category.tracks.length === 0 ? (
            <div className="bg-background-light/10 rounded-xl p-6 sm:p-8 text-center">
              <FiMusic className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-base sm:text-lg">No tracks available in this category</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-background-light/10 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-background-light/20">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        <FiClock className="inline" />
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-background-light/20">
                    {category.tracks.map((track, index) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDuration(track.duration)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handlePlayTrack(track)}
                              className="text-primary hover:text-primary-dark transition-colors p-2 rounded-full hover:bg-primary/10"
                              aria-label="Play track"
                            >
                              <FiPlay size={18} />
                            </button>
                            {/* Add to playlist button removed */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {category.tracks.map((track, index) => (
                  <div key={track.id} className="bg-background-light/10 rounded-xl p-4 hover:bg-background-light/15 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 text-text-secondary text-sm font-medium w-6">
                        {index + 1}
                      </div>
                      
                      <div className="h-12 w-12 flex-shrink-0 relative rounded-lg overflow-hidden">
                        <Image
                          src={track.coverUrl || '/images/track-cover-1.svg'}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-primary font-medium text-sm truncate">{track.title}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-text-secondary text-xs truncate">{track.artist}</p>
                          <span className="text-text-secondary text-xs ml-2">{formatDuration(track.duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => handlePlayTrack(track)}
                          className="text-primary hover:text-primary-dark transition-colors p-2 rounded-full hover:bg-primary/10"
                          aria-label="Play track"
                        >
                          <FiPlay size={16} />
                        </button>
                        {/* Add to playlist button removed */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Related Categories */}
        <div className="px-4 md:px-0">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* This would be populated with related categories in a real app */}
            <div className="bg-background-light/10 rounded-xl p-6 sm:p-8 text-center">
              <FiMusic className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-sm sm:text-base lg:text-lg">Related categories will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}