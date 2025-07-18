'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiClock } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
// Removed favorites and playlists functionality
import { useHistory } from '@/lib/hooks/useHistory';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';
import { useAuth } from '@/lib/hooks/useAuth';

type TrackItemType = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  playedAt?: string;
};

// Removed PlaylistCard component

const TrackItem = ({ track, onPlay }: { track: TrackItemType; onPlay: () => void }) => {
  return (
    <div 
      className="flex items-center p-3 rounded-lg hover:bg-background-light/50 transition-colors group cursor-pointer"
      onClick={onPlay}
    >
      <div className="relative h-12 w-12 rounded-md overflow-hidden mr-4">
        <Image 
          src={track.coverUrl || '/images/track-cover-1.svg'} 
          alt={track.title} 
          fill 
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-text-primary font-medium">{track.title}</h4>
        <p className="text-sm text-text-secondary">{track.artist}</p>
      </div>
      <div className="text-right text-text-muted text-sm">
        <p>{track.duration || '3:00'}</p>
        {track.playedAt && <p className="text-xs">{track.playedAt}</p>}
      </div>
    </div>
  );
};

export default function Library() {
  const [activeTab, setActiveTab] = useState('history');
  const { user } = useAuth();
  
  // Get data from API using custom hooks
  // Removed favorites and playlists hooks
  const { history, loading: historyLoading, error: historyError } = useHistory(user?.id || '');
  const { playTrack } = useAudioPlayer();

  const handlePlayTrack = (track: TrackItemType) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl || '/audio/sample.mp3', // Fallback for mock data
      duration: track.duration || '3:00', // Fallback for mock data
    });
  };

  // Removed playlist play functionality

  // Show loading state for the active tab
  const isLoading = (activeTab === 'history' && historyLoading);

  // Show error state for the active tab
  const hasError = (activeTab === 'history' && historyError);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Your Library</h1>
        </div>

        <div className="mb-8">
          <div className="flex space-x-4 border-b border-background-light mb-6">
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'history' ? 'text-text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
              <p className="text-text-secondary">Loading content...</p>
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h2>
              <p className="text-text-secondary">We couldn&apos;t load the content. Please try again later.</p>
            </div>
          )}

          {/* Playlists and Favorites functionality removed */}

          {/* History tab */}
          {activeTab === 'history' && !isLoading && !hasError && (
            <div className="bg-background-light/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center text-white text-2xl">
                    <FiClock />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Recently Played</h2>
                    <p className="text-text-secondary text-sm">Your listening history</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                {history && history.length > 0 ? (
                  history.map((item) => (
                    <TrackItem 
                      key={`${item.track.id}-${item.playedAt}`} 
                      track={{
                        ...item.track,
                        playedAt: new Date(item.playedAt).toLocaleDateString()
                      }} 
                      onPlay={() => handlePlayTrack(item.track)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <p>Your listening history will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}