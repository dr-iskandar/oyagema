'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiMusic, FiPlay, FiUser, FiClock } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAudioPlayer } from '@/lib/hooks/useAudioPlayer';

type User = {
  id: string;
  name: string;
  image: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Playlist = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  userId: string;
  userName: string;
  userImage: string | null;
  trackCount: number;
  createdAt: string;
  user: User;
  categories?: Category[];
};

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch playlists
        const playlistsRes = await fetch('/api/playlists');
        if (!playlistsRes.ok) throw new Error('Failed to fetch playlists');
        const playlistsData = await playlistsRes.json();
        
        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesRes.json();
        
        // Fetch playlist categories (get categories from tracks in each playlist)
        const playlistsWithCategories = await Promise.all(
          playlistsData.map(async (playlist: Playlist) => {
            try {
              const tracksRes = await fetch(`/api/playlists/${playlist.id}/tracks`);
              if (tracksRes.ok) {
                const tracksData = await tracksRes.json();
                const uniqueCategories = tracksData.reduce((acc: Category[], track: any) => {
                  if (track.category && !acc.find(cat => cat.id === track.category.id)) {
                    acc.push({
                      id: track.category.id,
                      name: track.category.title,
                      slug: track.category.slug
                    });
                  }
                  return acc;
                }, []);
                return { ...playlist, categories: uniqueCategories };
              }
              return { ...playlist, categories: [] };
            } catch {
              return { ...playlist, categories: [] };
            }
          })
        );
        
        setPlaylists(playlistsWithCategories);
        setFilteredPlaylists(playlistsWithCategories);
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
    let filtered = [...playlists];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(playlist => 
        playlist.categories && playlist.categories.some(cat => cat.id === selectedCategory)
      );
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(playlist => 
        playlist.title.toLowerCase().includes(query) || 
        (playlist.description && playlist.description.toLowerCase().includes(query)) ||
        playlist.user.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredPlaylists(filtered);
  }, [searchQuery, selectedCategory, playlists]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-lg">
          {error}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Playlists</h1>
            <p className="text-text-secondary mt-1">Discover music collections curated by our community</p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search playlists..."
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
            All Categories
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
        
        {/* Playlists Grid */}
        {filteredPlaylists.length === 0 ? (
          <div className="bg-background-light/10 rounded-xl p-8 text-center">
            <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary text-lg">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No playlists match your filters' 
                : 'No playlists available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPlaylists.map((playlist) => (
              <div key={playlist.id} className="group bg-background-light/10 rounded-xl overflow-hidden hover:bg-background-light/20 transition-colors duration-300 flex flex-col h-full relative">
                <Link href={`/playlists/${playlist.id}`}>
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={playlist.coverUrl || '/images/playlist-cover-1.svg'}
                      alt={playlist.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Show loading state
                          const target = e.currentTarget;
                          const originalContent = target.innerHTML;
                          target.innerHTML = '<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>';
                          target.disabled = true;
                          
                          // Fetch first track of playlist and play it
                          fetch(`/api/playlists/${playlist.id}`)
                            .then(res => {
                              if (!res.ok) {
                                throw new Error(`Failed to fetch playlist: ${res.status}`);
                              }
                              return res.json();
                            })
                            .then(data => {
                              if (!data.tracks || data.tracks.length === 0) {
                                throw new Error('This playlist has no tracks');
                              }
                              
                              const firstTrack = data.tracks[0];
                              playTrack({
                                id: firstTrack.id,
                                title: firstTrack.title,
                                artist: firstTrack.artist,
                                coverUrl: firstTrack.coverUrl,
                                audioUrl: firstTrack.audioUrl,
                                duration: firstTrack.duration.toString()
                              });
                            })
                            .catch(err => {
                              console.error('Error fetching playlist tracks:', err);
                              // Show error toast or notification here if you have a toast system
                              alert(`Could not play playlist: ${err.message}`);
                            })
                            .finally(() => {
                              // Restore button state
                              target.innerHTML = originalContent;
                              target.disabled = false;
                            });
                        }}
                        className="p-4 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-black/30"
                        aria-label="Play playlist"
                      >
                        <FiPlay size={24} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-text-primary truncate">{playlist.title}</h3>
                    
                    {playlist.description && (
                      <p className="text-text-secondary text-sm mt-1 line-clamp-2">{playlist.description}</p>
                    )}
                    
                    <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                      <div className="flex items-center">
                        <FiUser className="mr-1" />
                        <span>{playlist.user.name}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FiMusic className="mr-1" />
                        <span>{playlist.trackCount} tracks</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FiClock className="mr-1" />
                        <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        
        {/* Featured Playlists */}
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Featured Playlists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* This would be populated with featured playlists in a real app */}
            <div className="bg-background-light/10 rounded-xl p-8 text-center">
              <FiMusic className="mx-auto h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">Featured playlists will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}