'use client';

import { motion } from 'framer-motion';
import TrackCard from '../cards/TrackCard';
import { useAudioPlayer } from '@/lib/contexts/AudioPlayerContext';

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string;
  duration?: string;
};

type TrackGridProps = {
  title: string;
  tracks: Track[];
  onTrackClick?: (track: Track) => void;
  userId?: string; // Optional user ID for favorites functionality
};

const TrackGrid = ({ title, tracks, onTrackClick, userId }: TrackGridProps) => {
  // Get current playing track to highlight it
  const { currentTrack, isPlaying } = useAudioPlayer();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="mb-6 sm:mb-8 md:mb-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{title}</h2>
        <button className="text-accent hover:text-accent-light transition-colors text-xs sm:text-sm font-medium">
          See All
        </button>
      </div>

      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {tracks.map((track) => (
          <motion.div key={track.id} variants={item}>
            <TrackCard 
              id={track.id}
              title={track.title}
              artist={track.artist}
              coverUrl={track.coverUrl}
              onClick={() => {
                console.log('TrackGrid onClick triggered for track:', track.id, track.title);
                if (onTrackClick) {
                  console.log('About to call onTrackClick with track:', track);
                  onTrackClick(track);
                  console.log('onTrackClick called successfully');
                } else {
                  console.error('No onTrackClick callback provided');
                }
              }}
              userId={userId}
              isPlaying={isPlaying && currentTrack?.id === track.id}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TrackGrid;