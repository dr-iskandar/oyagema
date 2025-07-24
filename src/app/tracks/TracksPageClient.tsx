'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiSearch, FiMusic, FiPlay } from 'react-icons/fi';
import GuestLayout from '@/components/layout/GuestLayout';

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Track = {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  coverUrl: string | null;
  audioUrl: string;
  duration: number;
  categoryId: string;
  category: Category;
  createdAt: string;
};

export default function TracksPageClient() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tracks
        const tracksRes = await fetch('/api/tracks');
        if (!tracksRes.ok) throw new Error('Failed to fetch tracks');
        const tracksData = await tracksRes.json();
        setTracks(tracksData);
        setFilteredTracks(tracksData);
        
        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...tracks];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(track => track.categoryId === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track => 
        track.title.toLowerCase().includes(query) || 
        track.artist.toLowerCase().includes(query) ||
        (track.description && track.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredTracks(filtered);
  }, [searchQuery, selectedCategory, tracks]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = (trackId: string) => {
    // In a real app, this would play the track or add it to the player queue
    console.log(`Playing track ${trackId}`);
  };

  // Removed playlist and favorite functionality

  if (isLoading) {
    return (
      <GuestLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </GuestLayout>
    );
  }

  if (error) {
    return (
      <GuestLayout>
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg">
          {error}
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Tracks</h1>
            <p className="text-text-secondary mt-1">Discover our music collection</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search tracks..."
              className="pl-10 pr-4 py-2 w-full bg-background-light/20 border border-background-light/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm ${selectedCategory === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-background-light/20 text-text-secondary hover:bg-background-light/30'}`}
          >
            All
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm ${selectedCategory === category.id 
                ? 'bg-primary text-white' 
                : 'bg-background-light/20 text-text-secondary hover:bg-background-light/30'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Tracks List */}
        {filteredTracks.length === 0 ? (
          <div className="bg-background-light/10 rounded-xl p-8 text-center">
            <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary text-lg">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No tracks match your filters' 
                : 'No tracks available'}
            </p>
          </div>
        ) : (
          <div className="bg-background-light/10 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-background-light/20">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Artist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-light/20">
                {filteredTracks.map((track, index) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-background-light/30 text-text-secondary">
                        {track.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDuration(track.duration)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handlePlayTrack(track.id)}
                          className="text-primary hover:text-primary-dark transition-colors p-2 rounded-full hover:bg-primary/10"
                          aria-label="Play track"
                        >
                          <FiPlay size={18} />
                        </button>
                        
                        {/* Add to playlist and favorite buttons removed */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Featured Tracks */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Featured Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* This would be populated with featured tracks in a real app */}
            <div className="bg-background-light/10 rounded-xl p-8 text-center">
              <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">Featured tracks will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}