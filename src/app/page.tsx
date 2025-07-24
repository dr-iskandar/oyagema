'use client';

import GuestLayout from '@/components/layout/GuestLayout';
import DailyRecommendation from '@/components/sections/DailyRecommendation';
import TrackGrid from '@/components/sections/TrackGrid';
import CategoryGrid from '@/components/sections/CategoryGrid';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTracks } from '@/lib/hooks/useTracks';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';

// Track type that matches TrackGrid component expectations
type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string;
  duration?: string;
};

// Temporary mock data for daily recommendation until we have API endpoint for it
const dailyRecommendation = {
  id: 'rec1',
  title: 'Inner Peace Meditation',
  artist: 'Luna Rivers',
  description: 'Start your day with this calming meditation designed to center your mind and open your heart to the possibilities of the day ahead.',
  coverUrl: '/images/daily-recommendation.svg',
  audioUrl: '/audio/sample.mp3',
  duration: '3:05',
};

export default function Home() {
  // Get data from API using custom hooks
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { tracks, loading: tracksLoading, error: tracksError } = useTracks();

  // Use audio player hook
  const { 
    playTrack, 
    currentTrack, 
    isPlaying
  } = useAudioPlayer();

  // Filter tracks for different sections
  const recentTracks = tracks?.slice(0, 6) || [];
  const popularTracks = tracks?.slice(0, 5) || [];

  const handlePlayRecommendation = () => {
    console.log('handlePlayRecommendation called');
    const trackToPlay = {
      id: dailyRecommendation.id,
      title: dailyRecommendation.title,
      artist: dailyRecommendation.artist,
      coverUrl: dailyRecommendation.coverUrl,
      audioUrl: dailyRecommendation.audioUrl,
      duration: dailyRecommendation.duration,
    };
    console.log('About to call playTrack with daily recommendation:', trackToPlay);
    playTrack(trackToPlay);
    console.log('After playTrack call for daily recommendation');
  };

  const handleTrackClick = (track: Track) => {
    console.log('Track clicked:', track);
    const trackToPlay = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl || '/audio/sample.mp3', // Fallback for mock data
      duration: track.duration || '3:00', // Fallback for mock data
    };
    console.log('About to call playTrack with:', trackToPlay);
    playTrack(trackToPlay);
    console.log('After playTrack call, currentTrack:', currentTrack, 'isPlaying:', isPlaying);
  };

  // Show loading state
  if (categoriesLoading || tracksLoading) {
    return (
      <GuestLayout>
        <div className="flex items-center justify-center h-[calc(100vh-160px)]">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </GuestLayout>
    );
  }

  // Show error state
  if (categoriesError || tracksError) {
    return (
      <GuestLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 sm:mb-4">Oops! Something went wrong</h2>
          <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">
            {categoriesError || tracksError}
          </p>
          <button 
            className="btn-primary text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-6"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="space-y-6 sm:space-y-7 md:space-y-8 px-2 sm:px-4 md:px-6">
        <DailyRecommendation 
          track={dailyRecommendation}
          onPlay={handlePlayRecommendation}
        />
        
        <TrackGrid 
          title="Recently Played"
          tracks={recentTracks}
          onTrackClick={handleTrackClick}
        />
        
        <CategoryGrid 
          title="Explore Categories"
          categories={categories?.map(category => ({
            id: category.id,
            title: category.title,
            description: category.description || '',
            coverUrl: category.coverUrl,
            href: `/category/${category.slug}`,
          })) || []}
        />
        
        <TrackGrid 
          title="Popular Tracks"
          tracks={popularTracks}
          onTrackClick={handleTrackClick}
        />
      </div>
    </GuestLayout>
  );
}