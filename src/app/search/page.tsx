'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import TrackGrid from '@/components/sections/TrackGrid';
import CategoryGrid from '@/components/sections/CategoryGrid';
import { useCategories } from '@/lib/hooks/useCategories';
import { useTracks } from '@/lib/hooks/useTracks';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';

// Types that match component expectations
type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string;
  duration?: string;
};

// Use the same Category type as CategoryGrid expects
type CategoryGridCategory = {
  id: string;
  title: string;
  description?: string;
  coverUrl: string;
  href: string;
};

// API Category type
type APICategory = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  tracks?: Track[];
};

// Mock data for moods (this would typically come from an API)
const moods = [
  { id: 'mood1', name: 'Calm', color: 'bg-blue-500' },
  { id: 'mood2', name: 'Energetic', color: 'bg-yellow-500' },
  { id: 'mood3', name: 'Focused', color: 'bg-green-500' },
  { id: 'mood4', name: 'Relaxed', color: 'bg-purple-500' },
  { id: 'mood5', name: 'Motivated', color: 'bg-red-500' },
  { id: 'mood6', name: 'Sleepy', color: 'bg-indigo-500' },
];

export default function Search() {
  // Get data from API using custom hooks
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { tracks, loading: tracksLoading, error: tracksError } = useTracks();
  const { playTrack } = useAudioPlayer();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryGridCategory[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Initialize filtered data when API data is loaded
  useEffect(() => {
    if (tracks && categories) {
      setFilteredTracks(tracks);
      setFilteredCategories(categories.map((category: APICategory): CategoryGridCategory => ({
        id: category.id,
        title: category.title,
        description: category.description || undefined,
        coverUrl: category.coverUrl,
        href: `/category/${category.slug}`
      })));
    }
  }, [tracks, categories]);

  // Filter data based on search query
  useEffect(() => {
    if (!tracks || !categories) return;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredTracks(
        tracks.filter(
          (track) =>
            track.title.toLowerCase().includes(query) ||
            track.artist.toLowerCase().includes(query)
        )
      );
      setFilteredCategories(
        categories.filter(
          (category) =>
            category.title.toLowerCase().includes(query) ||
            (category.description && category.description.toLowerCase().includes(query))
        ).map((category: APICategory): CategoryGridCategory => ({
          id: category.id,
          title: category.title,
          description: category.description || undefined,
          coverUrl: category.coverUrl,
          href: `/category/${category.slug}`
        }))
      );
    } else {
      setFilteredTracks(tracks);
      setFilteredCategories(categories.map((category: APICategory): CategoryGridCategory => ({
        id: category.id,
        title: category.title,
        description: category.description || undefined,
        coverUrl: category.coverUrl,
        href: `/category/${category.slug}`
      })));
    }
  }, [searchQuery, tracks, categories]);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(selectedMood === moodId ? null : moodId);
    // In a real app, this would filter content based on mood
    // For now, we'll just keep this as a UI element
  };

  const handleTrackClick = (track: Track) => {
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
  if ((categoriesLoading || tracksLoading) && !filteredTracks.length && !filteredCategories.length) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
          <p className="text-text-secondary">Loading content...</p>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if ((categoriesError || tracksError) && !filteredTracks.length && !filteredCategories.length) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h2>
          <p className="text-text-secondary">We couldn&apos;t load the content. Please try again later.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Search</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-text-muted text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search for tracks, artists, or categories..."
              className="w-full pl-10 pr-4 py-3 bg-background-light text-text-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Browse by Mood</h2>
          <div className="flex flex-wrap gap-3">
            {moods.map((mood) => (
              <motion.button
                key={mood.id}
                className={`px-4 py-2 rounded-full ${mood.color} ${selectedMood === mood.id ? 'ring-2 ring-white' : 'opacity-80 hover:opacity-100'} transition-all`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelect(mood.id)}
              >
                {mood.name}
              </motion.button>
            ))}
          </div>
        </div>

        {searchQuery && (
          <div className="mb-4">
            <p className="text-text-secondary">
              {filteredTracks.length + filteredCategories.length > 0
                ? `Found ${filteredTracks.length + filteredCategories.length} results for "${searchQuery}"`
                : `No results found for "${searchQuery}"`}
            </p>
          </div>
        )}

        {filteredCategories.length > 0 && (
          <CategoryGrid title="Categories" categories={filteredCategories} />
        )}

        {filteredTracks.length > 0 && (
          <TrackGrid 
            title="Tracks" 
            tracks={filteredTracks} 
            onTrackClick={handleTrackClick}
          />
        )}

        {filteredTracks.length === 0 && filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-text-primary mb-2">No results found</h3>
            <p className="text-text-secondary">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}