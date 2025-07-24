'use client';

import GuestLayout from '@/components/layout/GuestLayout';
import DailyRecommendation from '@/components/sections/DailyRecommendation';
import TrackGrid from '@/components/sections/TrackGrid';
import CategoryGrid from '@/components/sections/CategoryGrid';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTracks } from '@/lib/hooks/useTracks';
import { useDailyRecommendation } from '@/lib/hooks/useDailyRecommendation';
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



export default function Home() {
  // Get data from API using custom hooks
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { tracks, loading: tracksLoading, error: tracksError } = useTracks();
  const { recommendation: dailyRecommendation, loading: dailyLoading, error: dailyError } = useDailyRecommendation();

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
    if (!dailyRecommendation) return;
    
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
  if (categoriesLoading || tracksLoading || dailyLoading) {
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
        {/* SEO-optimized main heading */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Oyagema - Spiritual Music Streaming
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto">
            Discover healing music, meditation tracks, and spiritual songs for your mindfulness journey. 
            Stream instrumental music, inspirational content, and therapeutic sounds.
          </p>
        </header>

        {dailyError ? (
          <div className="relative w-full h-64 sm:h-72 md:h-80 rounded-xl md:rounded-2xl overflow-hidden bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load daily recommendation</p>
              <p className="text-text-secondary text-sm">{dailyError}</p>
            </div>
          </div>
        ) : dailyRecommendation ? (
          <section aria-labelledby="daily-recommendation">
            <h2 id="daily-recommendation" className="sr-only">Daily Recommendation</h2>
            <DailyRecommendation 
              track={dailyRecommendation}
              onPlay={handlePlayRecommendation}
            />
          </section>
        ) : (
          <div className="relative w-full h-64 sm:h-72 md:h-80 rounded-xl md:rounded-2xl overflow-hidden bg-background-light/10 flex items-center justify-center">
            <p className="text-text-secondary">No daily recommendation available</p>
          </div>
        )}
        
        <section aria-labelledby="recently-played">
          <h2 id="recently-played" className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 sm:mb-6">
            Recently Played
          </h2>
          <TrackGrid 
            title="Recently Played"
            tracks={recentTracks}
            onTrackClick={handleTrackClick}
          />
        </section>
        
        <section aria-labelledby="explore-categories">
          <h2 id="explore-categories" className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 sm:mb-6">
            Explore Categories
          </h2>
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
        </section>
        
        <section aria-labelledby="popular-tracks">
          <h2 id="popular-tracks" className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 sm:mb-6">
            Popular Tracks
          </h2>
          <TrackGrid 
            title="Popular Tracks"
            tracks={popularTracks}
            onTrackClick={handleTrackClick}
          />
        </section>
      </div>
    </GuestLayout>
  );
}