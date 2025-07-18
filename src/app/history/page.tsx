'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiClock, FiPlay, FiCalendar } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { useHistory } from '@/lib/hooks/useHistory';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';
import { useAuth } from '@/lib/hooks/useAuth';

type HistoryItem = {
  id: string;
  userId: string;
  trackId: string;
  playedAt: string;
  track: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    audioUrl: string;
    duration: string;
  };
};

const HistoryItemComponent = ({ item, onPlay }: { 
  item: HistoryItem; 
  onPlay: () => void;
}) => {
  return (
    <div 
      className="flex items-center p-3 rounded-lg hover:bg-background-light/50 transition-colors group cursor-pointer"
      onClick={onPlay}
    >
      <div className="relative h-12 w-12 rounded-md overflow-hidden mr-4">
        <Image 
          src={item.track?.coverUrl || '/images/track-cover-1.svg'} 
          alt={item.track?.title || 'Track'} 
          fill 
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-text-primary font-medium">{item.track?.title || 'Unknown Track'}</h4>
        <p className="text-sm text-text-secondary">{item.track?.artist || 'Unknown Artist'}</p>
      </div>
      <div className="hidden group-hover:flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white">
        <FiPlay />
      </div>
      <div className="flex items-center text-text-secondary text-sm ml-4 group-hover:hidden">
        <FiCalendar className="mr-2" />
        <span>{new Date(item.playedAt).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center text-text-secondary text-sm ml-4 group-hover:hidden">
        <FiClock className="mr-2" />
        <span>{new Date(item.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default function HistoryPage() {
  const { user } = useAuth();
  const { history, loading, error } = useHistory(user?.id || '');
  const { playTrack } = useAudioPlayer();

  const handlePlayTrack = (track: HistoryItem['track']) => {
    if (!track || !track.id) {
      console.error('Invalid track data:', track);
      return;
    }
    
    playTrack({
      id: track.id,
      title: track.title || 'Unknown Track',
      artist: track.artist || 'Unknown Artist',
      coverUrl: track.coverUrl || '/images/track-cover-1.svg',
      audioUrl: track.audioUrl || '/audio/sample.mp3', // Fallback for mock data
      duration: track.duration || '3:00', // Fallback for mock data
    });
  };

  // Group history by date
  const groupedHistory = history?.reduce((groups: Record<string, HistoryItem[]>, item: HistoryItem) => {
    const date = new Date(item.playedAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>) || {};

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
            <h1 className="text-3xl font-bold text-text-primary">Recently Played</h1>
            <div className="flex items-center space-x-2 text-text-secondary">
              <FiClock />
              <span>{history?.length || 0} tracks</span>
            </div>
          </div>

          {history && history.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedHistory).map(([date, items]: [string, HistoryItem[]]) => (
                <motion.div 
                  key={date}
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-semibold text-text-primary">{date}</h3>
                  <div className="bg-background-light/10 rounded-xl p-4 space-y-2">
                    {items.map((item: HistoryItem) => (
                      <HistoryItemComponent 
                        key={item.id} 
                        item={item} 
                        onPlay={() => handlePlayTrack(item.track)}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-background-light/10 rounded-xl">
              <FiClock className="mx-auto text-4xl text-text-muted mb-4" />
              <h3 className="text-xl text-text-primary mb-2">No listening history yet</h3>
              <p className="text-text-secondary">Start playing tracks to see your listening history here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}