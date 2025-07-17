'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiPlay, FiHeart, FiPause } from 'react-icons/fi';
import { useIsFavorite, useToggleFavorite } from '@/lib/hooks/useFavorites';
import { useAudioPlayer } from '@/lib/hooks/useAudioPlayer';

type TrackCardProps = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  onClick?: () => void;
  userId?: string; // Optional user ID for favorites functionality
  isPlaying?: boolean; // Whether this track is currently playing
};

const TrackCard = ({ id, title, artist, coverUrl, onClick, userId, isPlaying = false }: TrackCardProps) => {
  // Use favorites hooks if userId is provided
  const { isFavorite } = useIsFavorite(userId || '', id);
  const { toggleFavorite, loading } = useToggleFavorite(userId || '');

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    if (userId && !loading) {
      await toggleFavorite(id, isFavorite);
    }
  };

  return (
    <motion.div 
      className="card card-hover-effect"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image 
          src={coverUrl} 
          alt={title} 
          fill 
          className={`object-cover transition-transform duration-500 hover:scale-110 ${isPlaying ? 'border-2 border-accent' : ''}`}
        />
        {isPlaying && (
          <div className="absolute top-2 right-2 bg-accent text-white p-1 rounded-full shadow-lg">
            <div className="flex space-x-1 items-center">
              <span className="animate-pulse w-1 h-3 bg-white rounded-full"></span>
              <span className="animate-pulse delay-75 w-1 h-4 bg-white rounded-full"></span>
              <span className="animate-pulse delay-150 w-1 h-2 bg-white rounded-full"></span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button 
            className="p-3 sm:p-4 rounded-full bg-primary text-white shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('TrackCard play button clicked for track:', id, title, artist);
              if (onClick) {
                console.log('About to execute onClick callback');
                onClick();
                console.log('TrackCard onClick callback executed');
              } else {
                console.error('No onClick callback provided for track:', id, title);
              }
            }}
          >
            {isPlaying ? <FiPause className="text-base sm:text-xl" /> : <FiPlay className="text-base sm:text-xl" />}
          </motion.button>
        </div>
      </div>
      <div className="p-2 sm:p-3">
        <div className="flex justify-between items-start">
          <div className="max-w-[calc(100%-30px)]">
            <h3 className="font-medium text-text-primary truncate text-sm sm:text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-text-secondary truncate">{artist}</p>
          </div>
          {userId && (
            <button 
              className={`p-1 sm:p-2 text-text-muted ${isFavorite ? 'text-accent' : 'hover:text-accent'} transition-colors`}
              onClick={handleFavoriteClick}
              disabled={loading}
            >
              <FiHeart className="text-sm sm:text-base" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TrackCard;