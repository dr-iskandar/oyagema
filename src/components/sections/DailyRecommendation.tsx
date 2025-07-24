'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiPlay } from 'react-icons/fi';

type DailyRecommendationProps = {
  track: {
    id: string;
    title: string;
    artist: string;
    description: string;
    coverUrl: string;
  };
  onPlay?: () => void;
};

const DailyRecommendation = ({ track, onPlay }: DailyRecommendationProps) => {
  return (
    <motion.div 
      className="relative w-full h-64 sm:h-72 md:h-80 rounded-xl md:rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Image 
        src={track.coverUrl} 
        alt={track.title} 
        fill 
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent">
        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 w-full">
          <div className="flex items-end justify-between">
            <div className="max-w-2xl">
              <h4 className="text-white font-medium mb-1 sm:mb-2 text-sm sm:text-base bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full inline-block shadow-lg" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>Daily Recommendation</h4>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-1 sm:mb-2">{track.title}</h2>
              <p className="text-lg sm:text-xl text-text-secondary mb-2 sm:mb-4">{track.artist}</p>
              <p className="text-text-secondary mb-3 sm:mb-6 line-clamp-2 text-sm sm:text-base">{track.description}</p>
              <motion.button 
                className="btn-primary flex items-center space-x-2 text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('Play Now button clicked');
                  if (onPlay) {
                    onPlay();
                    console.log('onPlay callback executed');
                  }
                }}
              >
                <FiPlay />
                <span>Play Now</span>
              </motion.button>
            </div>
            <div className="hidden md:block">
              <motion.div 
                className="relative w-24 h-24 md:w-32 md:h-32 glow-effect"
                animate={{ 
                  rotate: 360,
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: 'linear' 
                }}
              >
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <Image 
                    src="/images/meditation-silhouette.svg" 
                    alt="Meditation silhouette" 
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyRecommendation;